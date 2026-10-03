import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { CourseBookingAction } from "./contract.ts";
import { createCourseBookingClient, type Transport } from "./client.ts";
import { FamilyBookingFlow, memoryStore } from "./flow.ts";
import {
  buildReserveRequest, deliveryNotice, parseComplete, parseOptions, parseReserve, validateChoice,
  type FamilyGroupChoice, type FamilyParticipant,
} from "./logic.ts";

// Verbatim Core 58fd69b synthetic-run fixtures (regression source of truth).
const FX = JSON.parse(readFileSync(new URL("./fixtures/contract-v1.json", import.meta.url), "utf8"));
const OPTS = parseOptions(FX.options.response);
const WEEK = "weekday:2027-01-04:BK", K4 = "00000000-0000-4000-8000-000000000164";
const SAT = "saturday_series:2027-01-09:BK", SA2 = "00000000-0000-4000-8000-000000000178";
const AM = "10:00-12:00", PM = "14:00-16:00";
const kid = (ref: string): FamilyParticipant => ({ ref, first_name: `P-${ref}`, last_name: "Familie", birth_date: "2018-05-01", discipline: "ski", skill_level: "ski_blauer_koenig" });
const ch = (ref: string, period_key: string, product_id: string, dates: string[], block?: string): FamilyGroupChoice =>
  ({ participant_ref: ref, period_key, product_id, dates, ...(block ? { block } : {}) });
const CUSTOMER = { email: "familie@example.invalid", first_name: "Test", last_name: "Familie", phone: "+41790000000", street: "Weg", zip: "9490", city: "Vaduz", country: "LI" };

type R = { status: number; json: unknown };
function mock(h: Partial<Record<CourseBookingAction["action"], (b: CourseBookingAction, n: number) => R>> = {}) {
  const calls: CourseBookingAction[] = []; const n: Record<string, number> = {};
  const t: Transport = async (b) => {
    calls.push(structuredClone(b)); n[b.action] = (n[b.action] ?? 0) + 1;
    const f = h[b.action]; if (f) return f(b, n[b.action]);
    return { status: FX[b.action].http_status, json: FX[b.action].response };
  };
  return { calls, of: (a: string) => calls.filter((c) => c.action === a) as never[], client: createCourseBookingClient(t) };
}
let k = 0; const gen = () => `00000000-0000-4000-8000-${String(++k).padStart(12, "0")}`;

test("options fixture parses non-empty with dates/block_dates/block_mode; envelope strict", () => {
  assert.equal(OPTS.length, 2);
  assert.deepEqual(OPTS.map((o) => o.block_mode), ["all", "choose_one"]);
  assert.deepEqual(OPTS[1].block_dates[AM], ["2027-01-09", "2027-01-16", "2027-01-23", "2027-02-06"]);
  for (const bad of [{ ...FX.options.response, status: "success" }, { ...FX.options.response, contract_version: "v0" }, { ...FX.options.response, success: false }]) {
    assert.throws(() => parseOptions(bad));
  }
});

test("payload blocks match backend fixture exactly (4h sends both blocks)", () => {
  const ps = ["a", "b", "c"].map(kid);
  const req = buildReserveRequest(ps, ps.map((p) => ch(p.ref, WEEK, K4, ["2027-01-05", "2027-01-04"])), "api-key-1-1791062241573", OPTS);
  const fxSel = FX.reserve.request.reservation.selections.slice(0, 3);
  assert.deepEqual(req.reservation.selections, fxSel);
  assert.deepEqual(req.reservation.participants, FX.reserve.request.reservation.participants.slice(0, 3));
  const sat = buildReserveRequest([kid("a")], [ch("a", SAT, SA2, ["2027-01-09"], AM)], "k", OPTS);
  assert.deepEqual(sat.reservation.selections[0], { kind: "group", participant_ref: "a", period_key: SAT, product_id: SA2, dates: ["2027-01-09"], blocks: [AM] });
});

test("full 4h and choose_one validated against per-block dates", () => {
  const wk = OPTS[0], sat = OPTS[1];
  assert.equal(validateChoice(wk, ch("a", WEEK, K4, ["2027-01-04"]), kid("a")), null);
  assert.notEqual(validateChoice(wk, ch("a", WEEK, K4, ["2027-01-04"], AM), kid("a")), null, "4h must not pick a single block");
  const broken = { ...wk, block_dates: { [AM]: wk.dates, [PM]: wk.dates.slice(0, 2) } };
  assert.notEqual(validateChoice(broken, ch("a", WEEK, K4, ["2027-01-06"]), kid("a")), null);
  assert.equal(validateChoice(sat, ch("a", SAT, SA2, sat.dates, AM), kid("a")), null);
  assert.notEqual(validateChoice(sat, ch("a", SAT, SA2, ["2027-01-09"]), kid("a")), null, "2h needs exactly one block");
  assert.notEqual(validateChoice(sat, ch("a", SAT, SA2, ["2027-01-09"], PM), kid("a")), null);
  assert.notEqual(validateChoice(sat, ch("a", SAT, SA2, ["2027-01-30"], AM), kid("a")), null, "cancelled date");
});

test("reserve/complete fixtures parse; wrong status rejected", () => {
  assert.equal(parseReserve(FX.reserve.response).total_amount, 720);
  assert.throws(() => parseReserve({ ...FX.reserve.response, status: "provisional" }));
  const c = parseComplete(FX.complete.response);
  assert.deepEqual([c.invoice_number, c.due_date, c.delivery.invoice], ["R-2026-00001", "2026-10-17", "sent"]);
  assert.throws(() => parseComplete({ ...FX.complete.response, status: "invoice_pending" }));
});

test("cancel fixture resets identity; repeated already_released also OK; malformed cancel is not cancelled", async () => {
  const m = mock({ cancel: (_b, n) => ({ status: 200, json: n === 1 ? FX.cancel.response : { foo: 1 } }) });
  const flow = new FamilyBookingFlow(m.client, { store: memoryStore(), genKey: gen });
  const ps = [kid("a")]; const cs = [ch("a", WEEK, K4, ["2027-01-04"])];
  await flow.reserve(OPTS, ps, cs); const k1 = flow.idempotencyKey;
  await flow.abandon(); assert.equal(flow.reservation, null);
  await flow.reserve(OPTS, ps, cs); assert.notEqual(flow.idempotencyKey, k1);
  await assert.rejects(flow.abandon(), /cancel_failed/); assert.ok(flow.reservation);
  const m2 = mock({ cancel: () => ({ status: 200, json: { ...FX.cancel.response, already_released: true } }) });
  const f2 = new FamilyBookingFlow(m2.client, { store: memoryStore(), genKey: gen });
  await f2.reserve(OPTS, ps, cs); await f2.abandon(); assert.equal(f2.reservation, null);
});

test("409 reservation_released: retains code/retryable, next retry uses a NEW key (reserve and complete)", async () => {
  const rel = { status: 409, json: { success: false, code: "reservation_released", retryable: false } };
  const m = mock({ reserve: (_b, n) => (n === 1 ? rel : { status: 200, json: FX.reserve.response }) });
  const flow = new FamilyBookingFlow(m.client, { store: memoryStore(), genKey: gen });
  const ps = [kid("a")]; const cs = [ch("a", WEEK, K4, ["2027-01-04"])];
  await assert.rejects(flow.reserve(OPTS, ps, cs), (e: { code?: string; retryable?: boolean; unknownOutcome?: boolean }) =>
    e.code === "reservation_released" && e.retryable === false && e.unknownOutcome === false);
  await flow.reserve(OPTS, ps, cs);
  const keys = m.of("reserve").map((c: { reservation: { idempotency_key: string } }) => c.reservation.idempotency_key);
  assert.equal(keys.length, 2); assert.notEqual(keys[0], keys[1]);

  const m2 = mock({ complete: () => rel });
  const f2 = new FamilyBookingFlow(m2.client, { store: memoryStore(), genKey: gen });
  await f2.reserve(OPTS, ps, cs); const old = f2.idempotencyKey;
  await assert.rejects(f2.complete(CUSTOMER, ps), (e: { released?: boolean }) => e.released === true);
  assert.equal(f2.reservation, null); assert.equal(f2.completionPending, false);
  await f2.reserve(OPTS, ps, cs); assert.notEqual(f2.idempotencyKey, old);
});

test("delivery wording is honest: failed/pending never claims e-mail sent", () => {
  const sent = deliveryNotice(parseComplete(FX.complete.response).delivery);
  assert.equal(sent.ok, true);
  const failed = deliveryNotice(parseComplete({ ...FX.complete.response, delivery: { booking_confirmation: "sent", invoice: "failed" } }).delivery);
  assert.equal(failed.ok, false); assert.match(failed.text, /fehlgeschlagen/); assert.doesNotMatch(failed.text, /wurden per E-Mail verschickt/);
  const pending = deliveryNotice(parseComplete({ ...FX.complete.response, delivery: undefined }).delivery);
  assert.equal(pending.ok, false); assert.match(pending.text, /ausstehend/);
});
