export const YETI_BASE = 'https://pgrlrsrjwyixndmrzhct.supabase.co/functions/v1';

export const SAFE_ERROR =
  'Das hat gerade nicht funktioniert. Bitte versuche es in 1–2 Minuten erneut.';

export interface YetiResult {
  status: number;
  json: any;
  raw?: string;
}

export function apiKey(): string | null {
  return Deno.env.get('YETI_INTAKE_API_KEY') ?? null;
}

export async function callYeti(
  fn: string,
  init: { method?: 'GET' | 'POST'; body?: unknown; query?: Record<string, string>; idempotencyKey?: string } = {},
): Promise<YetiResult> {
  const key = apiKey();
  if (!key) return { status: 500, json: { error: 'YETI_INTAKE_API_KEY not configured' } };

  const url = new URL(`${YETI_BASE}/${fn}`);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': key,
    'X-API-Key': key,
  };
  if (init.idempotencyKey) headers['X-Idempotency-Key'] = init.idempotencyKey;

  const res = await fetch(url.toString(), {
    method: init.method ?? 'GET',
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const raw = await res.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, raw: json === null ? raw.slice(0, 800) : undefined };
}
