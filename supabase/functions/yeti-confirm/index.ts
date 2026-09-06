import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti, SAFE_ERROR } from '../_shared/yeti.ts';

const CustomerSchema = z.object({
  salutation: z.string().trim().max(30).optional(),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(50),
  street: z.string().trim().min(1).max(200),
  zip: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(2).max(3),
}).strict();

const ParticipantSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  discipline: z.enum(['ski', 'snowboard']),
  skill_level: z.string().trim().max(100).optional(),
}).strict();

const BodySchema = z.object({
  ticket_id: z.string().trim().min(1).max(100),
  reservation_token: z.string().trim().min(1).max(200),
  payment_method: z.enum(['online', 'invoice']),
  payment_reference: z.string().trim().min(1).max(200).optional(),
  payment_failed: z.boolean().optional(),
  customer: CustomerSchema,
  participants: z.array(ParticipantSchema).min(1).max(20),
  notes: z.string().max(2000).optional(),
}).strict().superRefine((body, ctx) => {
  // Onlinezahlung gilt nur mit echter Referenz eines Zahlungsanbieters als bezahlt.
  if (body.payment_method === 'online' && !body.payment_failed && !body.payment_reference) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['payment_reference'],
      message: 'payment_reference is required for online payments',
    });
  }
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
  const p = parsed.data;

  const result = await callYeti('confirm-booking', {
    method: 'POST',
    body: {
      ticket_id: p.ticket_id,
      reservation_token: p.reservation_token,
      payment_method: p.payment_method,
      ...(p.payment_reference ? { payment_reference: p.payment_reference } : {}),
      ...(p.payment_failed ? { payment_failed: true } : {}),
      customer: p.customer,
      participants: p.participants,
      ...(p.notes ? { notes: p.notes } : {}),
    },
  });

  const r = result.json ?? {};
  const success = result.status >= 200 && result.status < 300 && r.success !== false;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Fehlgeschlagene Zahlung: Reservierung bleibt bestehen, kein Abschluss.
  if (p.payment_failed) {
    await supabase
      .from('submitted_bookings')
      .update({ payment_status: 'payment_failed', payment_method: p.payment_method })
      .eq('yeti_ticket_id', p.ticket_id);

    return json({
      success: false,
      payment_failed: true,
      expired: result.status === 410,
      message: 'Die Zahlung wurde nicht abgeschlossen. Deine Reservierung bleibt noch gültig – bitte versuche es erneut.',
    });
  }

  const fallbackStatus = p.payment_method === 'invoice' ? 'invoice_pending' : 'paid';

  await supabase
    .from('submitted_bookings')
    .update({
      status: success ? 'success' : 'failed',
      booking_status: success ? (r.status ?? 'confirmed') : 'failed',
      payment_status: success ? (r.payment_status ?? fallbackStatus) : 'unpaid',
      payment_method: p.payment_method,
      invoice_number: r.invoice_number ?? null,
      invoice_due_date: r.invoice_due_date ?? r.due_date ?? null,
      customer_number: r.customer_number ?? null,
      customer_email: p.customer.email,
      total_price: typeof r.total_price === 'number' ? r.total_price : (r.price?.total ?? null),
      yeti_response: r,
      error_message: success ? null : `YETI ${result.status}`,
    })
    .eq('yeti_ticket_id', p.ticket_id);

  if (!success) {
    // Keine Personendaten ins Log — nur IDs und Statuscodes.
    console.error('confirm-booking failed', { ticket_id: p.ticket_id, status: result.status, code: r?.code ?? r?.error ?? null });
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
