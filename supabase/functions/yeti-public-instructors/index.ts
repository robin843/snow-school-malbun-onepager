import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { callYeti } from '../_shared/yeti.ts';

interface PublicInstructor {
  display_name: string;
  role_label?: string;
  teaser?: string;
  portrait_url?: string;
}

let cache: { at: number; body: string } | null = null;
const TTL_MS = 5 * 60_000;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const pick = (r: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const v = str(r[k]);
    if (v) return v;
  }
  return '';
};

const YETI_ORIGIN = 'https://pgrlrsrjwyixndmrzhct.supabase.co';

const absoluteUrl = (url: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${YETI_ORIGIN}${url}`;
  return '';
};

const sanitize = (raw: unknown): PublicInstructor[] => {
  if (!Array.isArray(raw)) return [];
  const out: PublicInstructor[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const first = pick(r, ['first_name', 'firstname', 'vorname']);
    const last = pick(r, ['last_name', 'lastname', 'nachname']);
    const display_name =
      pick(r, ['display_name', 'name', 'full_name']) || [first, last].filter(Boolean).join(' ');
    if (!display_name) continue;

    const role_label = pick(r, ['role_label', 'role', 'title', 'function', 'funktion']);
    const teaser = pick(r, ['teaser', 'bio', 'description', 'about', 'text']);
    const portrait_url = absoluteUrl(
      pick(r, ['portrait_url', 'photo_url', 'image_url', 'avatar_url', 'picture_url', 'photo']),
    );

    out.push({
      display_name,
      ...(role_label ? { role_label } : {}),
      ...(teaser ? { teaser } : {}),
      ...(portrait_url ? { portrait_url } : {}),
    });
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

  const refresh = new URL(req.url).searchParams.get('refresh') === '1';

  if (!refresh && cache && Date.now() - cache.at < TTL_MS) {
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

    console.log(
      'get-public-instructors upstream',
      JSON.stringify({
        status: result.status,
        payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : null,
        rawCount: Array.isArray(rawTeam) ? rawTeam.length : null,
        firstItemKeys:
          Array.isArray(rawTeam) && rawTeam[0] && typeof rawTeam[0] === 'object'
            ? Object.keys(rawTeam[0])
            : null,
      }),
    );

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
