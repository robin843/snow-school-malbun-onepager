import { assert, assertEquals } from 'jsr:@std/assert@1';
import { Action, forward } from './schema.ts';

const fx = JSON.parse(await Deno.readTextFile(new URL('../../../src/lib/courseBooking/fixtures/contract-v1.json', import.meta.url)));

Deno.test('proxy accepts contract v1 reserve with blocks[] and options without range', () => {
  assert(Action.safeParse(fx.reserve.request).success);
  assert(Action.safeParse(fx.options.request).success);
  assert(Action.safeParse(fx.cancel.request).success);
  const legacy = structuredClone(fx.reserve.request);
  legacy.reservation.selections[0].block = '10:00-12:00'; delete legacy.reservation.selections[0].blocks;
  assert(!Action.safeParse(legacy).success, 'singular block rejected');
});

Deno.test('proxy retains code/retryable', () => {
  const rel = { success: false, code: 'reservation_released', retryable: false };
  assertEquals(forward(409, rel, 'x'), { status: 409, body: rel });
  assertEquals(forward(503, { code: 'busy', retryable: true, message: 'internal secret' }, 'safe'), { status: 502, body: { success: false, message: 'safe', code: 'busy', retryable: true } });
});
