import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti, SAFE_ERROR } from '../_shared/yeti.ts';

const BodySchema = z.object({
  ticket_id: z.string().trim().min(1).max(100),
  reservation_token: z.string().trim().min(1).max(200),
  payment_method: z.enum(['online', 'invoice']),
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
  const p = parsed.data;

  const result = await callYeti('confirm-booking', {
    method: 'POST',
    body: {
      ticket_id: p.ticket_id,
      reservation_token: p.reservation_token,
      payment_method: p.payment_method,
      // Online payment is not charged yet — Yeti keeps it as payment_pending.
      payment_status: p.payment_method === 'invoice' ? 'invoice_pending' : 'payment_pending',
      source: 'website',
    },
  });

  const r = result.json ?? {};
  const success = result.status >= 200 && result.status < 300 && r.success !== false;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  await supabase
    .from('submitted_bookings')
    .update({
      status: success ? 'success' : 'failed',
      booking_status: success ? (r.status ?? (p.payment_method === 'invoice' ? 'invoice_pending' : 'payment_pending')) : 'failed',
      payment_status: success ? (r.payment_status ?? (p.payment_method === 'invoice' ? 'invoice_pending' : 'payment_pending')) : 'unpaid',
      payment_method: p.payment_method,
      invoice_number: r.invoice_number ?? null,
      invoice_due_date: r.invoice_due_date ?? r.due_date ?? null,
      customer_number: r.customer_number ?? null,
      total_price: typeof r.total_price === 'number' ? r.total_price : (r.price?.total ?? null),
      yeti_response: r,
      error_message: success ? null : `YETI ${result.status}: ${JSON.stringify(r ?? result.raw)}`,
    })
    .eq('yeti_ticket_id', p.ticket_id);

  if (!success) {
    console.error('confirm-booking failed', { status: result.status, response: r ?? result.raw });
    const expired = result.status === 410 || /expired|abgelaufen/i.test(JSON.stringify(r ?? ''));
    return json(
      {
        success: false,
        expired,
        message: expired
          ? 'Die Reservierung ist abgelaufen. Bitte wähle den Termin erneut.'
          : SAFE_ERROR,
      },
      200,
    );
  }

  return json({
    success: true,
    status: r.status ?? null,
    payment_status: r.payment_status ?? null,
    ticket_number: r.ticket_number ?? null,
    invoice_number: r.invoice_number ?? null,
    invoice_due_date: r.invoice_due_date ?? r.due_date ?? null,
    customer_number: r.customer_number ?? null,
    price: r.price ?? (typeof r.total_price === 'number' ? { total: r.total_price, currency: r.currency ?? 'CHF' } : null),
  });
});
