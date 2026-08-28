import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti } from '../_shared/yeti.ts';

const BodySchema = z.object({
  ticket_id: z.string().trim().min(1).max(100).optional(),
  reservation_token: z.string().trim().min(1).max(200).optional(),
}).strict().refine((v) => Boolean(v.ticket_id || v.reservation_token), {
  message: 'ticket_id oder reservation_token erforderlich',
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);
  }
  const { ticket_id, reservation_token } = parsed.data;

  // YETI hat (noch) keinen Freigabe-Endpunkt. Wir versuchen es trotzdem und
  // behandeln 404 als "nicht verfügbar" – der Hold läuft dann regulär ab.
  let releasedInYeti = false;
  for (const fn of ['cancel-reservation', 'release-reservation']) {
    const result = await callYeti(fn, {
      method: 'POST',
      body: { ticket_id, reservation_token, reason: 'customer_abandoned' },
    });
    if (result.status >= 200 && result.status < 300) {
      releasedInYeti = true;
      break;
    }
    if (result.status !== 404 && result.status !== 405) {
      console.error(`${fn} failed`, result.status, result.json ?? result.raw);
    }
  }

  // Abgelaufene Holds in YETI aufräumen (bester verfügbarer Ersatz).
  await callYeti('expire-reservations', { method: 'POST', body: {} });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  let query = supabase
    .from('submitted_bookings')
    .update({ booking_status: 'cancelled' })
    .eq('booking_status', 'provisional');
  query = reservation_token
    ? query.eq('yeti_reservation_token', reservation_token)
    : query.eq('yeti_ticket_id', ticket_id!);

  const { error } = await query;
  if (error) console.error('release backup update failed', error);

  return json({ success: true, released_in_yeti: releasedInYeti });
});
