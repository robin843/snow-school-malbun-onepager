import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti, SAFE_ERROR } from '../_shared/yeti.ts';

const todayISO = () => new Date().toISOString().slice(0, 10);
const requiredString = (max: number) => z.string().trim().min(1).max(max);
const isValidISODate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate);

const minutesBetween = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
};

const CustomerSchema = z.object({
  salutation: z.string().trim().max(30).optional(),
  first_name: requiredString(100),
  last_name: requiredString(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(50),
  street: requiredString(200),
  zip: requiredString(20),
  city: requiredString(100),
  country: z.string().trim().min(2).max(3),
}).strict();

const ParticipantSchema = z.object({
  first_name: requiredString(100),
  last_name: requiredString(100),
  birth_date: isoDate,
  discipline: z.enum(['ski', 'snowboard']),
  skill_level: z.string().trim().max(100).optional(),
}).strict();

const DateSlotSchema = z.object({
  date: isoDate,
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
}).strict();

const BookingSchema = z.object({
  product_id: z.string().trim().min(1).max(100),
  product_type: z.enum(['private', 'group']),
  sport: z.enum(['ski', 'snowboard']),
  dates: z.array(DateSlotSchema).min(1).max(30),
  participant_count: z.number().int().min(1).max(20),
  duration_minutes: z.number().int().min(30).max(480).optional(),
  notes: z.string().max(2000).optional(),
  payment_method: z.enum(['online', 'invoice']).optional(),
}).strict();

const ConsentSchema = z.object({
  agb_accepted: z.literal(true),
  agb_version: z.string().max(50),
  privacy_accepted: z.literal(true),
  privacy_version: z.string().max(50),
}).strict();

const PayloadSchema = z.object({
  submission_id: z.string().uuid().optional(),
  customer: CustomerSchema,
  participants: z.array(ParticipantSchema).min(1).max(20),
  booking: BookingSchema,
  consent: ConsentSchema,
}).strict().superRefine((payload, ctx) => {
  const { booking } = payload;
  if (booking.participant_count !== payload.participants.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['booking', 'participant_count'],
      message: 'participant_count must match participants length',
    });
  }
  for (const [i, slot] of booking.dates.entries()) {
    if (slot.date < todayISO()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['booking', 'dates', i, 'date'], message: 'Date must not be in the past' });
    }
    if (slot.end_time <= slot.start_time) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['booking', 'dates', i, 'end_time'], message: 'End time must be after start time' });
    }
    const dow = new Date(`${slot.date}T00:00:00Z`).getUTCDay(); // 0 = Sun, 6 = Sat
    if (booking.product_type === 'group') {
      const isSaturdayCourse = /samstag/i.test(booking.product_id ?? '');
      if (isSaturdayCourse && dow !== 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['booking', 'dates', i, 'date'], message: 'Samstagskurse sind nur an Samstagen buchbar' });
      }
      if (!isSaturdayCourse && (dow === 0 || dow === 6)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['booking', 'dates', i, 'date'], message: 'Gruppenkurse finden von Montag bis Freitag statt' });
      }
    }
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

  const parsed = PayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);
  }

  const data = parsed.data;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || undefined;
  const userAgent = req.headers.get('user-agent') ?? undefined;
  const acceptedAt = new Date().toISOString();
  const idempotencyKey = data.submission_id ?? crypto.randomUUID();

  const items = data.booking.dates.map((slot) => ({
    product_id: data.booking.product_id,
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    duration_minutes: minutesBetween(slot.start_time, slot.end_time),
    participant_count: data.booking.participant_count,
    sport: data.booking.sport,
  }));

  // Never trust prices from the browser — Yeti calculates them from product_id.
  // YETI's reservation endpoint expects the reservable product and dates as
  // top-level `product_id` + `items`; the nested `booking` object is retained as
  // contextual metadata for intake/admin views.
  const yetiPayload = {
    source: 'website',
    product_id: data.booking.product_id,
    items,
    customer: data.customer,
    participants: data.participants,
    payment_method: data.booking.payment_method,
    reservation_ttl_minutes: 15,
    booking: {
      product_id: data.booking.product_id,
      product_type: data.booking.product_type,
      sport: data.booking.sport,
      dates: data.booking.dates,
      participant_count: data.booking.participant_count,
      duration_minutes: data.booking.duration_minutes,
      notes: data.booking.notes,
      payment_method: data.booking.payment_method,
    },
    consent: {
      agb_accepted: true,
      agb_version: data.consent.agb_version,
      privacy_accepted: true,
      privacy_version: data.consent.privacy_version,
      accepted_at: acceptedAt,
      ip_address: ip ?? 'unknown',
      user_agent: userAgent ?? 'unknown',
    },
    metadata: {
      channel: 'website',
      submitted_at: acceptedAt,
      referrer: req.headers.get('referer') ?? null,
      user_agent: userAgent ?? null,
    },
  };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: backup, error: backupError } = await supabase
    .from('submitted_bookings')
    .insert({
      idempotency_key: idempotencyKey,
      payload: {
        source: 'website',
        submitted_at: acceptedAt,
        referrer: req.headers.get('referer') ?? null,
        user_agent: userAgent ?? null,
        ip_address: ip ?? null,
        yeti_payload: yetiPayload,
      },
      status: 'pending',
      booking_status: 'provisional',
      payment_status: 'unpaid',
      product_id: data.booking.product_id ?? null,
      customer_email: data.customer.email,
    })
    .select('id')
    .single();

  if (backupError) {
    console.error('Backup insert failed:', backupError);
    return json({ success: false, message: SAFE_ERROR }, 200);
  }

  const result = await callYeti('create-reservation', {
    method: 'POST',
    body: yetiPayload,
    idempotencyKey,
  });

  const r = result.json ?? {};
  const success =
    result.status >= 200 && result.status < 300 &&
    (r.success === true || Boolean(r.ticket_id || r.reservation_token || r.ticket_number));

  await supabase
    .from('submitted_bookings')
    .update({
      status: success ? 'reserved' : 'failed',
      booking_status: success ? (r.status ?? 'provisional') : 'failed',
      yeti_ticket_id: r.ticket_id ?? null,
      yeti_ticket_number: r.ticket_number ?? null,
      yeti_customer_id: r.customer_id ?? null,
      yeti_reservation_token: r.reservation_token ?? null,
      reservation_expires_at: r.reservation_expires_at ?? null,
      instructor_id: r.instructor?.id ?? r.instructor_id ?? null,
      customer_number: r.customer_number ?? null,
      total_price: typeof r.total_price === 'number' ? r.total_price : (r.price?.total ?? null),
      yeti_response: r,
      error_message: success ? null : `YETI ${result.status}: ${JSON.stringify(r ?? result.raw)}`,
    })
    .eq('id', backup.id);

  if (!success) {
    console.error('create-reservation failed', { backup_id: backup.id, status: result.status, response: r ?? result.raw });
    const conflict = result.status === 409 || /conflict|not available|belegt|vergeben/i.test(JSON.stringify(r ?? ''));
    return json(
      {
        success: false,
        conflict,
        message: conflict
          ? 'Dieser Termin wurde inzwischen vergeben. Bitte wähle einen anderen Zeitpunkt.'
          : SAFE_ERROR,
      },
      200,
    );
  }

  return json({
    success: true,
    ticket_id: r.ticket_id ?? null,
    ticket_number: r.ticket_number ?? null,
    reservation_token: r.reservation_token ?? null,
    reservation_expires_at: r.reservation_expires_at ?? null,
    status: r.status ?? 'provisional',
    instructor: r.instructor ?? (r.instructor_name ? { name: r.instructor_name } : null),
    customer_number: r.customer_number ?? null,
    price: r.price ?? (typeof r.total_price === 'number' ? { total: r.total_price, currency: r.currency ?? 'CHF' } : null),
  });
});
