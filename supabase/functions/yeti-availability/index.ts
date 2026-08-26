import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { callYeti } from '../_shared/yeti.ts';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const BodySchema = z.object({
  product_id: z.string().max(100).optional(),
  product_type: z.enum(['private', 'group']).optional(),
  sport: z.enum(['ski', 'snowboard']).optional(),
  from: isoDate,
  to: isoDate,
  duration_minutes: z.number().int().min(30).max(480).optional(),
  participant_count: z.number().int().min(1).max(20).optional(),
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
  if (p.to < p.from) return json({ error: 'Validation failed', details: { to: ['to must be >= from'] } }, 400);

  const query: Record<string, string> = { from: p.from, to: p.to };
  if (p.product_id) query.product_id = p.product_id;
  if (p.product_type) query.product_type = p.product_type;
  if (p.sport) query.sport = p.sport;
  if (p.duration_minutes) query.duration_minutes = String(p.duration_minutes);
  if (p.participant_count) query.participant_count = String(p.participant_count);

  // Try GET with query params first; fall back to POST with a JSON body.
  let result = await callYeti('get-availability', { method: 'GET', query });
  if (result.status === 404 || result.status === 405 || result.status === 400) {
    const postResult = await callYeti('get-availability', { method: 'POST', body: p });
    if (postResult.status >= 200 && postResult.status < 300) result = postResult;
  }

  if (result.status < 200 || result.status >= 300) {
    console.error('get-availability failed', result.status, result.json ?? result.raw);
    return json({ days: [], error: 'availability_unavailable' }, 200);
  }

  const payload = result.json ?? {};
  const days = Array.isArray(payload) ? payload : payload.days ?? payload.availability ?? payload.data ?? [];
  return json({ days, meta: Array.isArray(payload) ? undefined : payload.meta ?? undefined });
});
