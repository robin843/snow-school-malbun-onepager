// Server proxy for YETI `course-booking` (issue #36). NOT DEPLOYED until the core API is live.
// Contract v1 (bc-2627-website-v1): schema in ./schema.ts, tested by schema_test.ts.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { Action, forward } from './schema.ts';
import { callYeti, SAFE_ERROR } from '../_shared/yeti.ts';

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
  const out = forward(r.status, r.json, SAFE_ERROR);
  return json(out.body, out.status);
});
