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
  correlation_id: z.string().trim().max(100).optional(),
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

/** Normalisierte Diagnosecodes — nie mit Personendaten. */
type ConfirmCode =
  | 'CONFIRM_OK'
  | 'CONFIRM_VALIDATION_FAILED'
  | 'CONFIRM_RESERVATION_EXPIRED'
  | 'CONFIRM_AUTH_FAILED'
  | 'CONFIRM_UPSTREAM_UNAVAILABLE'
  | 'CONFIRM_CUSTOMER_FINALIZATION_FAILED'
  | 'CONFIRM_INVOICE_FAILED'
  | 'CONFIRM_RESPONSE_INVALID'
  | 'CONFIRM_PAYMENT_FAILED';

const classify = (status: number, r: any): ConfirmCode => {
  if (status === 410) return 'CONFIRM_RESERVATION_EXPIRED';
  if (status === 401 || status === 403) return 'CONFIRM_AUTH_FAILED';
  if (status === 400 || status === 422) return 'CONFIRM_VALIDATION_FAILED';
  if (status >= 500 || status === 0) return 'CONFIRM_UPSTREAM_UNAVAILABLE';
  const text = JSON.stringify(r ?? '');
  if (/expired|abgelaufen/i.test(text)) return 'CONFIRM_RESERVATION_EXPIRED';
  if (/invoice|rechnung/i.test(text)) return 'CONFIRM_INVOICE_FAILED';
  return 'CONFIRM_CUSTOMER_FINALIZATION_FAILED';
};

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
    return json({ error: 'Invalid JSON', code: 'CONFIRM_VALIDATION_FAILED' }, 400);
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json({
      error: 'Validation failed',
      code: 'CONFIRM_VALIDATION_FAILED',
      details: parsed.error.flatten().fieldErrors,
    }, 400);
  }
  const p = parsed.data;
  const correlationId = p.correlation_id ?? crypto.randomUUID();
  const startedAt = new Date().toISOString();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  /** Diagnosefelder fortschreiben — ohne Personendaten. */
  const trackAttempt = async (code: ConfirmCode, httpStatus: number, extra: Record<string, unknown> = {}) => {
    const { data: row } = await supabase
      .from('submitted_bookings')
      .select('confirm_attempt_count')
      .eq('yeti_ticket_id', p.ticket_id)
      .maybeSingle();

    await supabase
      .from('submitted_bookings')
      .update({
        confirm_attempt_count: (row?.confirm_attempt_count ?? 0) + 1,
        last_confirm_attempt_at: new Date().toISOString(),
        last_confirm_code: code,
        last_confirm_http_status: httpStatus,
        ...extra,
      })
      .eq('yeti_ticket_id', p.ticket_id);
  };

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

  let r = result.json ?? {};
  let success = result.status >= 200 && result.status < 300 && r.success !== false;

  // Grenzprotokoll: nur Kennungen, Zeiten, Statuscodes und Mengen.
  console.log('confirm-boundary', JSON.stringify({
    correlation_id: correlationId,
    ticket_id: p.ticket_id,
    request_started_at: startedAt,
    request_finished_at: new Date().toISOString(),
    http_status: result.status,
    customer_present: true,
    participant_count_sent: p.participants.length,
    payment_method: p.payment_method,
    already_confirmed: Boolean(r.already_confirmed),
    invoice_created: Boolean(r.invoice_number),
  }));

  // Fehlgeschlagene Zahlung: Reservierung bleibt bestehen, kein Abschluss.
  if (p.payment_failed) {
    await trackAttempt('CONFIRM_PAYMENT_FAILED', result.status, {
      payment_status: 'payment_failed',
      payment_method: p.payment_method,
    });

    return json({
      success: false,
      code: 'CONFIRM_PAYMENT_FAILED',
      payment_failed: true,
      expired: result.status === 410,
      correlation_id: correlationId,
      message: 'Die Zahlung wurde nicht abgeschlossen. Deine Reservierung bleibt noch gültig – bitte versuche es erneut.',
    });
  }

  // „Bereits bestätigt" ohne belastbare Daten: echten Stand nachladen und prüfen.
  const looksIncomplete = success && !r.invoice_number && !r.customer_id && !r.payment_reference;
  if (success && (r.already_confirmed || looksIncomplete)) {
    const statusResult = await callYeti('get-booking-status', {
      method: 'GET',
      query: { ticket_id: p.ticket_id },
    });
    const s = statusResult.json ?? {};
    if (statusResult.status >= 200 && statusResult.status < 300) {
      r = {
        ...s,
        ...r,
        customer_id: r.customer_id ?? s.customer_id ?? null,
        customer_number: r.customer_number ?? s.customer_number ?? null,
        invoice_number: r.invoice_number ?? s.invoice_number ?? null,
        due_date: r.due_date ?? s.invoice_due_date ?? s.due_date ?? null,
        status: r.status ?? s.status ?? null,
        payment_status: r.payment_status ?? s.payment_status ?? null,
        ticket_number: r.ticket_number ?? s.ticket_number ?? null,
      };
    }

    const isFinal = ['confirmed', 'invoice_pending', 'paid'].includes(String(r.status ?? ''));
    const hasCustomer = Boolean(r.customer_id || r.customer_number);
    const hasPaymentRecord = Boolean(r.invoice_number || r.payment_reference || r.payment_status === 'paid');

    if (isFinal && (!hasCustomer || !hasPaymentRecord)) {
      await trackAttempt('CONFIRM_RESPONSE_INVALID', 409);
      console.error('confirm-inconsistent', JSON.stringify({
        correlation_id: correlationId,
        ticket_id: p.ticket_id,
        status: r.status ?? null,
        customer_present: hasCustomer,
        invoice_created: Boolean(r.invoice_number),
      }));
      return json({
        success: false,
        code: 'CONFIRMED_DATA_INCOMPLETE',
        correlation_id: correlationId,
        message: 'Die Buchung konnte nicht vollständig abgeschlossen werden. Bitte kontaktiere uns kurz – wir prüfen das sofort.',
      }, 200);
    }

    success = isFinal || success;
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
      yeti_customer_id: r.customer_id ?? null,
      customer_email: success ? p.customer.email : null,
      total_price: typeof r.total_price === 'number' ? r.total_price : (r.total_amount ?? r.price?.total ?? null),
      yeti_response: r,
      error_message: success ? null : `YETI ${result.status}`,
    })
    .eq('yeti_ticket_id', p.ticket_id);

  if (!success) {
    const code = classify(result.status, r);
    await trackAttempt(code, result.status);
    // Keine Personendaten ins Log — nur IDs und Statuscodes.
    console.error('confirm-booking failed', JSON.stringify({
      correlation_id: correlationId,
      ticket_id: p.ticket_id,
      status: result.status,
      code,
    }));
    const expired = code === 'CONFIRM_RESERVATION_EXPIRED';
    return json(
      {
        success: false,
        code,
        expired,
        correlation_id: correlationId,
        message: expired
          ? 'Die Reservierung ist abgelaufen. Bitte wähle den Termin erneut.'
          : SAFE_ERROR,
      },
      200,
    );
  }

  await trackAttempt('CONFIRM_OK', result.status, { confirmed_at: new Date().toISOString() });

  return json({
    success: true,
    code: 'CONFIRM_OK',
    correlation_id: correlationId,
    already_confirmed: Boolean(r.already_confirmed),
    status: r.status ?? null,
    payment_status: r.payment_status ?? null,
    ticket_number: r.ticket_number ?? null,
    invoice_number: r.invoice_number ?? null,
    invoice_due_date: r.invoice_due_date ?? r.due_date ?? null,
    customer_number: r.customer_number ?? null,
    customer_id: r.customer_id ?? null,
    price: r.price ?? (typeof (r.total_amount ?? r.total_price) === 'number'
      ? { total: r.total_amount ?? r.total_price, currency: r.currency ?? 'CHF' }
      : null),
  });
});
