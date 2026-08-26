import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callYeti } from '../_shared/yeti.ts';

let cache: { at: number; body: string } | null = null;
const TTL_MS = 60_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (cache && Date.now() - cache.at < TTL_MS) {
    return new Response(cache.body, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'hit' },
    });
  }

  const result = await callYeti('get-products', { method: 'GET' });
  if (result.status < 200 || result.status >= 300) {
    console.error('get-products failed', result.status, result.json ?? result.raw);
    return json({ products: [], error: 'products_unavailable' }, 200);
  }

  const products = Array.isArray(result.json)
    ? result.json
    : result.json?.products ?? result.json?.data ?? [];

  const body = JSON.stringify({ products });
  cache = { at: Date.now(), body };
  return json({ products });
});
