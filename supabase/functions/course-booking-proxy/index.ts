// Server proxy for YETI `course-booking` (issue #36). NOT DEPLOYED until the core API is live.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti, SAFE_ERROR } from '../_shared/yeti.ts';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^\d{2}:\d{2}$/);
const ref = z.string().min(1).max(40);
const s = (n: number) => z.string().trim().min(1).max(n);
const disc = z.enum(['ski', 'snowboard']);
const participant = z.object({ ref, birth_date: date, discipline: disc, skill_level: s(100) }).strict();

const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('options'), from: date, to: date }).strict(),
  z.object({
    action: z.literal('reserve'),
    reservation: z.object({
      idempotency_key: z.string().uuid(),
      source: z.literal('website'),
      participants: z.array(participant).min(1).max(100),
      selections: z.array(z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('group'), participant_ref: ref, period_key: s(100), product_id: s(100), dates: z.array(date).min(1).max(10), block: time.optional() }).strict(),
        z.object({ kind: z.literal('private'), participant_refs: z.array(ref).min(1).max(10), product_id: s(100), items: z.array(z.object({ date, time_start: time, time_end: time }).strict()).min(1).max(30) }).strict(),
      ])).min(1).max(200),
    }).strict(),
  }).strict(),
  z.object({
    action: z.literal('complete'), ticket_id: s(100), reservation_token: s(200), payment_method: z.literal('invoice'),
    customer: z.object({ email: z.string().trim().email().max(255), first_name: s(100), last_name: s(100), phone: z.string().trim().min(5).max(50), street: s(200), zip: s(20), city: s(100), country: z.string().trim().min(2).max(3) }).strict(),
    participants: z.array(participant.extend({ first_name: s(100), last_name: s(100) })).min(1).max(100),
  }).strict(),
  z.object({ action: z.literal('cancel'), ticket_id: s(100), reservation_token: s(200) }).strict(),
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const parsed = Action.safeParse(raw);
  if (!parsed.success) return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);
  const body = parsed.data;
  const idem = body.action === 'reserve' ? body.reservation.idempotency_key : undefined;
  const r = await callYeti('course-booking', { method: 'POST', body, idempotencyKey: idem });
  if (r.status >= 500 || r.json === null) return json({ success: false, message: SAFE_ERROR }, 502);
  return json(r.json, r.status);
});
