import { z } from 'npm:zod@3.23.8';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^\d{2}:\d{2}$/);
const ref = z.string().min(1).max(40);
const s = (n: number) => z.string().trim().min(1).max(n);
const disc = z.enum(['ski', 'snowboard']);
const participant = z.object({ ref, birth_date: date, discipline: disc, skill_level: s(100) }).strict();

export const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('options'), from: date.optional(), to: date.optional() }).strict(),
  z.object({
    action: z.literal('reserve'),
    reservation: z.object({
      idempotency_key: z.string().trim().min(8).max(200),
      source: z.literal('website'),
      participants: z.array(participant).min(1).max(100),
      selections: z.array(z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('group'), participant_ref: ref, period_key: s(100), product_id: s(100), dates: z.array(date).min(1).max(10), blocks: z.array(z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/)).min(1).max(2) }).strict(),
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


/** Pass Core JSON through; on 5xx mask the message but keep the machine-readable code/retryable. */
export function forward(status: number, json: unknown, safeMessage: string): { status: number; body: unknown } {
  if (status < 500 && json !== null) return { status, body: json };
  const o = (json && typeof json === 'object') ? json as Record<string, unknown> : {};
  return {
    status: 502,
    body: {
      success: false, message: safeMessage,
      ...(typeof o.code === 'string' ? { code: o.code } : {}),
      ...(typeof o.retryable === 'boolean' ? { retryable: o.retryable } : {}),
    },
  };
}
