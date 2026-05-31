import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const YETI_URL = 'https://pgrlrsrjwyixndmrzhct.supabase.co/functions/v1/intake-booking';

const CustomerSchema = z.object({
  salutation: z.string().optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(5).max(50),
  street: z.string().min(1).max(200),
  zip: z.string().min(1).max(20),
  city: z.string().min(1).max(100),
  country: z.string().min(2).max(3),
});

const ParticipantSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  discipline: z.enum(['ski', 'snowboard']),
  skill_level: z.string().optional(),
});

const DateSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

const BookingSchema = z.object({
  product_type: z.enum(['private', 'group']),
  sport: z.enum(['ski', 'snowboard']),
  dates: z.array(DateSlotSchema).min(1).max(30),
  participant_count: z.number().int().min(1).max(20),
  notes: z.string().max(2000).optional(),
  payment_method: z.enum(['twint', 'kreditkarte', 'ueberweisung', 'postfinance']).optional(),
});

const ConsentSchema = z.object({
  agb_accepted: z.literal(true),
  agb_version: z.string(),
  privacy_accepted: z.literal(true),
  privacy_version: z.string(),
});

const PayloadSchema = z.object({
  customer: CustomerSchema,
  participants: z.array(ParticipantSchema).min(1).max(20),
  booking: BookingSchema,
  consent: ConsentSchema,
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

  const yetiPayload = {
    source: 'website' as const,
    metadata: {
      channel: 'website',
      origin: 'skischule-malbun.li',
      submitted_at: new Date().toISOString(),
      referrer: req.headers.get('referer') ?? null,
      user_agent: userAgent ?? null,
      ip_address: ip ?? null,
    },
    customer: data.customer,
    participants: data.participants,
    booking: data.booking,
    consent: {
      agb_accepted: true,
      agb_version: data.consent.agb_version,
      privacy_accepted: true,
      privacy_version: data.consent.privacy_version,
      accepted_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    },
  };

  const idempotencyKey = crypto.randomUUID();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 1. Backup
  const { data: backup, error: backupError } = await supabase
    .from('submitted_bookings')
    .insert({
      idempotency_key: idempotencyKey,
      payload: yetiPayload,
      status: 'pending',
      customer_email: data.customer.email,
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

  // 2. Forward to YETI
  let yetiStatus = 0;
  let yetiJson: any = null;
  let errorMessage: string | null = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    yetiStatus = 0;
    yetiJson = null;
    errorMessage = null;
    try {
      const yetiRes = await fetch(YETI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-Idempotency-Key': `${idempotencyKey}-${attempts}`,
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

    // Retry only on YETI's ticket_number duplicate-key race condition
    const isDuplicateTicketNumber =
      yetiStatus === 500 &&
      typeof yetiJson?.message === 'string' &&
      yetiJson.message.includes('tickets_ticket_number_key');

    if (!isDuplicateTicketNumber) break;

    console.warn(`YETI duplicate ticket_number, retry ${attempts}/${MAX_ATTEMPTS}`);
    // small backoff with jitter so YETI's sequence advances
    await new Promise((r) => setTimeout(r, 150 + Math.floor(Math.random() * 250)));
  }

  const success = yetiStatus === 201 && yetiJson?.success;

  await supabase
    .from('submitted_bookings')
    .update({
      status: success ? 'success' : 'failed',
      yeti_ticket_id: yetiJson?.ticket_id ?? null,
      yeti_ticket_number: yetiJson?.ticket_number ?? null,
      yeti_customer_id: yetiJson?.customer_id ?? null,
      yeti_response: yetiJson,
      error_message: errorMessage,
      retry_count: attempts - 1,
    })
    .eq('id', backup.id);

  if (!success) {
    console.error('YETI submission failed:', errorMessage);
    return new Response(
      JSON.stringify({
        error: 'Booking submission failed',
        details: yetiJson?.details ?? errorMessage,
        backup_id: backup.id,
      }),
      { status: yetiStatus >= 400 && yetiStatus < 500 ? yetiStatus : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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