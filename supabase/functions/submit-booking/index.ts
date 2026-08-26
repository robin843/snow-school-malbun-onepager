import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const YETI_URL = 'https://pgrlrsrjwyixndmrzhct.supabase.co/functions/v1/intake-booking';
const SAFE_BOOKING_ERROR = 'Die Buchung konnte gerade nicht übertragen werden. Bitte versuche es in 1–2 Minuten erneut.';

const todayISO = () => new Date().toISOString().slice(0, 10);
const requiredString = (max: number) => z.string().trim().min(1).max(max);
const isValidISODate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
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
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate),
  discipline: z.enum(['ski', 'snowboard']),
  skill_level: z.string().trim().max(100).optional(),
}).strict();

const DateSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidISODate),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
}).strict().refine((slot) => slot.date >= todayISO(), {
  message: 'Date must not be in the past',
  path: ['date'],
}).refine((slot) => slot.end_time > slot.start_time, {
  message: 'End time must be after start time',
  path: ['end_time'],
});

const BookingSchema = z.object({
  product_type: z.enum(['private', 'group']),
  sport: z.enum(['ski', 'snowboard']),
  dates: z.array(DateSlotSchema).min(1).max(30),
  participant_count: z.number().int().min(1).max(20),
  notes: z.string().max(2000).optional(),
  payment_method: z.enum(['twint', 'kreditkarte', 'ueberweisung', 'postfinance']).optional(),
  product_id: z.string().uuid().optional(),
  product_name: z.string().max(200).optional(),
  // Nur informativ vom Browser — der verbindliche Preis wird serverseitig aus YETI berechnet.
  expected_total: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
}).strict();


const ConsentSchema = z.object({
  agb_accepted: z.literal(true),
  agb_version: z.string(),
  privacy_accepted: z.literal(true),
  privacy_version: z.string(),
}).strict();

const PayloadSchema = z.object({
  submission_id: z.string().uuid().optional(),
  source: z.literal('website').optional().default('website'),
  customer: CustomerSchema,
  participants: z.array(ParticipantSchema).min(1).max(20),
  booking: BookingSchema,
  consent: ConsentSchema,
}).strict().superRefine((payload, ctx) => {
  if (payload.booking.participant_count !== payload.participants.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['booking', 'participant_count'],
      message: 'participant_count must match participants length',
    });
  }
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('YETI_INTAKE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'YETI_INTAKE_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const data = parsed.data;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    undefined;
  const userAgent = req.headers.get('user-agent') ?? undefined;
  const acceptedAt = new Date().toISOString();

  // Verbindlichen Preis serverseitig aus YETI berechnen (Browser-Angaben werden ignoriert).
  let serverTotal: number | null = null;
  let serverCurrency = 'CHF';
  if (data.booking.product_id) {
    const productsRes = await callYeti('get-products');
    const product = Array.isArray(productsRes.json?.products)
      ? productsRes.json.products.find((p: any) => p.id === data.booking.product_id)
      : undefined;
    if (product) {
      serverCurrency = product.currency ?? 'CHF';
      const days = data.booking.dates.length;
      const participants = data.booking.participant_count;
      if (product.pricing_type === 'hourly') {
        const minutes = data.booking.dates.reduce((sum: number, d: any) => {
          const [sh, sm] = d.start_time.split(':').map(Number);
          const [eh, em] = d.end_time.split(':').map(Number);
          return sum + (eh * 60 + em - (sh * 60 + sm));
        }, 0);
        serverTotal = Math.round(product.price * (minutes / 60) * 100) / 100;
      } else if (product.pricing_type === 'tiered') {
        const tiers = [...(product.price_tiers ?? [])].sort(
          (a: any, b: any) => a.day_count - b.day_count,
        );
        const match = tiers.filter((t: any) => t.day_count <= days).pop() ?? tiers[0];
        if (match) {
          const extra = Math.max(0, days - match.day_count);
          const lastStep =
            tiers.length > 1
              ? tiers[tiers.length - 1].cumulative_price - tiers[tiers.length - 2].cumulative_price
              : match.cumulative_price;
          serverTotal = (match.cumulative_price + extra * lastStep) * participants;
        }
      } else {
        serverTotal = product.price * participants;
      }
    } else {
      console.warn('Product not found in YETI:', data.booking.product_id);
    }
  }

  const { expected_total: _clientTotal, currency: _clientCurrency, ...bookingForYeti } = data.booking;

  const yetiPayload = {
    source: data.source,
    customer: data.customer,
    participants: data.participants,
    booking: {
      ...bookingForYeti,
      ...(serverTotal !== null ? { total_price: serverTotal, currency: serverCurrency } : {}),
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
  };

  const idempotencyKey = data.submission_id ?? crypto.randomUUID();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 1. Backup
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
      customer_email: data.customer.email,
      product_id: data.booking.product_id ?? null,
      total_price: serverTotal,
      currency: serverCurrency,
      payment_method: data.booking.payment_method ?? null,
    })

    .select('id')
    .single();

  if (backupError) {
    console.error('Backup insert failed:', backupError);
    return new Response(JSON.stringify({ error: 'Backup failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Forward to YETI — YETI generates the ticket number (T-2026-XXXXX) itself.
  let yetiStatus = 0;
  let yetiJson: any = null;
  let errorMessage: string | null = null;

  try {
    const yetiRes = await fetch(YETI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(yetiPayload),
    });
    yetiStatus = yetiRes.status;
    yetiJson = await yetiRes.json().catch(() => null);
    if (!yetiRes.ok) {
      errorMessage = `YETI ${yetiStatus}: ${JSON.stringify(yetiJson)}`;
    }
  } catch (e) {
    errorMessage = `Network error: ${(e as Error).message}`;
  }

  const success = yetiStatus >= 200 && yetiStatus < 300 && (
    yetiJson?.success === true || Boolean(yetiJson?.ticket_id || yetiJson?.ticket_number)
  );

  await supabase
    .from('submitted_bookings')
    .update({
      status: success ? 'success' : 'failed',
      yeti_ticket_id: yetiJson?.ticket_id ?? null,
      yeti_ticket_number: yetiJson?.ticket_number ?? null,
      yeti_customer_id: yetiJson?.customer_id ?? null,
      yeti_response: yetiJson,
      error_message: errorMessage,
      retry_count: 0,
    })
    .eq('id', backup.id);

  if (!success) {
    console.error('YETI submission failed:', { backup_id: backup.id, status: yetiStatus, error: errorMessage, response: yetiJson });
    return new Response(
      JSON.stringify({
        success: false,
        fallback: true,
        error: 'Booking submission failed',
        message: SAFE_BOOKING_ERROR,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      ticket_id: yetiJson.ticket_id,
      ticket_number: yetiJson.ticket_number,
      customer_id: yetiJson.customer_id,
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});