import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callYeti } from '../_shared/yeti.ts';

interface PublicInstructor {
  display_name: string;
  role_label: string;
  teaser: string;
  portrait_url: string;
}

let cache: { at: number; body: string } | null = null;
const TTL_MS = 5 * 60_000;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const sanitize = (raw: unknown): PublicInstructor[] => {
  if (!Array.isArray(raw)) return [];
  const out: PublicInstructor[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const display_name = str(r.display_name);
    const role_label = str(r.role_label);
    const teaser = str(r.teaser);
    const portrait_url = str(r.portrait_url);
    if (!display_name || !role_label || !teaser || !portrait_url) continue;
    if (!/^https?:\/\//i.test(portrait_url)) continue;
    out.push({ display_name, role_label, teaser, portrait_url });
  }
  return out;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra },
    });

  if (req.method !== 'GET') {
    return json({ team: [], error: 'method_not_allowed' }, 405);
  }

  if (cache && Date.now() - cache.at < TTL_MS) {
    return new Response(cache.body, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'hit' },
    });
  }

  try {
    const result = await callYeti('get-public-instructors', { method: 'GET' });
    if (result.status < 200 || result.status >= 300) {
      console.error('get-public-instructors upstream status', result.status);
      return json({ team: [], error: 'team_unavailable' }, 200);
    }

    const payload = result.json;
    const rawTeam = Array.isArray(payload)
      ? payload
      : payload?.team ?? payload?.instructors ?? payload?.data ?? null;

    const team = sanitize(rawTeam);
    if (!Array.isArray(rawTeam)) {
      console.error('get-public-instructors malformed payload shape');
      return json({ team: [], error: 'team_unavailable' }, 200);
    }

    const body = JSON.stringify({ team });
    cache = { at: Date.now(), body };
    return json({ team });
  } catch (_err) {
    console.error('get-public-instructors request failed');
    return json({ team: [], error: 'team_unavailable' }, 200);
  }
});
