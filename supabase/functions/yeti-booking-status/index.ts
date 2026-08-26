import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti } from '../_shared/yeti.ts';

const BodySchema = z.object({
  ticket_id: z.string().trim().min(1).max(100),
}).strict();

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

  const result = await callYeti('get-booking-status', {
    method: 'GET',
    query: { ticket_id: parsed.data.ticket_id },
  });

  if (result.status < 200 || result.status >= 300) {
    console.error('get-booking-status failed', result.status, result.json ?? result.raw);
    return json({ error: 'status_unavailable' }, 200);
  }

  const r = result.json ?? {};
  return json({
    status: r.status ?? null,
    payment_status: r.payment_status ?? null,
    reservation_expires_at: r.reservation_expires_at ?? null,
    ticket_number: r.ticket_number ?? null,
    invoice_number: r.invoice_number ?? null,
    customer_number: r.customer_number ?? null,
  });
});
