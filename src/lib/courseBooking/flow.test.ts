import test from "node:test";
import assert from "node:assert/strict";
import type { CourseBookingAction, CourseOption, CompleteRequest, ReserveRequest } from "./contract.ts";
import { createCourseBookingClient, CourseBookingError, type Transport } from "./client.ts";
import { FamilyBookingFlow, memoryStore } from "./flow.ts";
import {
  eligibleOptions, isValidISODate, parseComplete, parseOptions, parseReserve, previewPrice, requiresBlock, validateChoice,
  buildReserveRequest, type FamilyGroupChoice, type FamilyParticipant,
} from "./logic.ts";

// Real contract fixtures: standard blocks 10–12 and 14–16, blocks as string[].
const AM = "10:00-12:00";
const PM = "14:00-16:00";
const JAN = ["2027-01-04", "2027-01-05", "2027-01-06", "2027-01-07", "2027-01-08"];
const FEB = ["2027-02-08", "2027-02-09", "2027-02-10", "2027-02-11", "2027-02-12"];
const bd = (ds: string[], blocks: string[]) => Object.fromEntries(blocks.map((b) => [b, [...ds]]));
const tiers = [1, 2, 3, 4, 5].map((n) => ({ day_count: n, price: 60 * n, source_tariff_id: `t${n}` }));
const base = (o: Partial<CourseOption>): CourseOption => ({
  period_key: "p", course_id: "c", course_name: "Gruppenkurs Ski Kinder", course_type: "group", discipline: "ski", skill_level_id: "blue",
  age_min: 4, age_max: 12, dates: JAN, cancelled_dates: [], block_dates: bd(JAN, [AM, PM]), block_mode: "choose_one",
  product_id: "prod-2h", product_name: "2h", duration_minutes: 120, blocks: [AM, PM], tiers, bookable: true, ...o,
});
const OPTIONS: CourseOption[] = [
  base({ period_key: "jan-2h", product_id: "prod-2h" }),
  base({ period_key: "feb-2h", product_id: "prod-2h", dates: FEB, block_dates: bd(FEB, [AM, PM]) }),
  base({ period_key: "jan-4h", product_id: "prod-4h", duration_minutes: 240, block_mode: "all" }),
  base({ period_key: "jan-4h-broken", product_id: "prod-4hb", duration_minutes: 240, block_mode: "all", block_dates: { [AM]: JAN, [PM]: JAN.slice(0, 4) } }),
  base({ period_key: "red-2h", product_id: "prod-red", skill_level_id: "red" }),
  base({ period_key: "adult", product_id: "prod-adult", age_min: 16, age_max: null, skill_level_id: null, cancelled_dates: ["2027-01-06"] }),
  base({ period_key: "board", product_id: "prod-board", discipline: "snowboard", skill_level_id: null, age_min: 8 }),
  base({ period_key: "carving", product_id: "prod-carv", course_name: "Carving Ladies", age_min: 16, age_max: null, skill_level_id: null }),
  base({ period_key: "inactive", product_id: "prod-x", bookable: false }),
  base({ period_key: "unlinked", product_id: null }),
];

type Resp = { status: number; json: unknown };
type Handler = (b: CourseBookingAction, n: number) => Resp | Promise<Resp>;
const okReserve = (n: number): Resp => ({ status: 200, json: { success: true, status: "held", ticket_id: `T${n}`, ticket_number: `T-2027-${n}`, reservation_token: `tok${n}`, reservation_expires_at: "2027-01-01T00:15:00Z", total_amount: 1234, currency: "CHF", quote: {} } });
const okComplete: Resp = { status: 200, json: { success: true, status: "confirmed", invoice_number: "R-2027-1", total_amount: 1234, currency: "CHF", delivery: { booking_confirmation: "sent", invoice: "sent" } } };

function mock(overrides: Partial<Record<CourseBookingAction["action"], Handler>> = {}) {
  const calls: CourseBookingAction[] = [];
  const counts: Record<string, number> = {};
  const t: Transport = async (b) => {
    calls.push(structuredClone(b));
    counts[b.action] = (counts[b.action] ?? 0) + 1;
    const o = overrides[b.action]; if (o) return o(b, counts[b.action]);
    if (b.action === "options") return { status: 200, json: { success: true, status: "ok", contract_version: "bc-2627-website-v1", options: OPTIONS, informational: [] } };
    if (b.action === "reserve") return okReserve(counts.reserve);
    if (b.action === "complete") return okComplete;
    return { status: 200, json: { success: true, status: "released", already_released: false } };
  };
  const of = <A extends CourseBookingAction["action"]>(a: A) => calls.filter((c): c is Extract<CourseBookingAction, { action: A }> => c.action === a);
  return { calls, of, client: createCourseBookingClient(t) };
}
let k = 0; const gen = () => `00000000-0000-4000-8000-${String(++k).padStart(12, "0")}`;
const kid = (i: number, level = "blue"): FamilyParticipant => ({ ref: `p${i}`, first_name: `Kind${i}`, last_name: "Muster", birth_date: "2019-03-01", discipline: "ski", skill_level: level });
const CUSTOMER: CompleteRequest["customer"] = { email: "a@b.ch", first_name: "A", last_name: "B", phone: "+41790000000", street: "S 1", zip: "9497", city: "Malbun", country: "LI" };
const ch = (ref: string, period_key: string, product_id: string, dates: string[], block?: string): FamilyGroupChoice => ({ participant_ref: ref, period_key, product_id, dates, ...(block ? { block } : {}) });
const opt = (k: string) => OPTIONS.find((o) => o.period_key === k)!;

test("block must be the exact contract id ('10:00-12:00'), start time alone is rejected", () => {
  assert.equal(validateChoice(opt("jan-2h"), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 2), AM), kid(1)), null);
  assert.equal(validateChoice(opt("jan-2h"), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 2), PM), kid(1)), null);
  assert.notEqual(validateChoice(opt("jan-2h"), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 2), "10:00"), kid(1)), null);
  assert.notEqual(validateChoice(opt("jan-2h"), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 2), "13:30-15:30"), kid(1)), null);
  const req = buildReserveRequest([kid(1)], [ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM)], "k", OPTIONS);
  assert.deepEqual(req.reservation.selections[0], { kind: "group", participant_ref: "p1", period_key: "jan-2h", product_id: "prod-2h", dates: ["2027-01-04"], blocks: [AM] });
});

test("full 4h: no block, both real blocks required on every selected day", () => {
  assert.equal(requiresBlock(opt("jan-4h")), false);
  assert.equal(validateChoice(opt("jan-4h"), ch("p1", "jan-4h", "prod-4h", JAN), kid(1)), null);
  assert.notEqual(validateChoice(opt("jan-4h"), ch("p1", "jan-4h", "prod-4h", JAN, AM), kid(1)), null);
  assert.equal(validateChoice(opt("jan-4h-broken"), ch("p1", "jan-4h-broken", "prod-4hb", JAN.slice(0, 4)), kid(1)), null);
  assert.match(validateChoice(opt("jan-4h-broken"), ch("p1", "jan-4h-broken", "prod-4hb", JAN), kid(1)) ?? "", /beide Zeitblöcke/);
});

test("only real sellable options; inactive/unlinked/Carving excluded; no extrapolation", async () => {
  const opts = await mock().client.options("2026-12-01", "2027-04-30");
  assert.deepEqual(eligibleOptions(opts, kid(1)).map((o) => o.period_key), ["jan-2h", "feb-2h", "jan-4h", "jan-4h-broken"]);
  assert.deepEqual(eligibleOptions(opts, { ...kid(9), birth_date: "1980-01-01", skill_level: "red" }).map((o) => o.period_key), ["adult"]);
  assert.equal(previewPrice(opts[0], 6), null);
});

test("strict parsing: dates, nested option fields, reserve/complete envelopes", () => {
  assert.equal(isValidISODate("2027-02-31"), false);
  assert.equal(isValidISODate("2027-02-28"), true);
  const bad = [
    { ...base({ period_key: "b1" }), blocks: 2 },
    base({ period_key: "b2", dates: ["2027-02-31"] }),
    base({ period_key: "b3", tiers: [{ day_count: 1, price: 0, source_tariff_id: "x" }] }),
    base({ period_key: "b4", blocks: ["12:00-10:00"], block_dates: {} }),
    base({ period_key: "b5", blocks: ["10:00"] }),
  ];
  assert.deepEqual(parseOptions({ success: true, status: "ok", contract_version: "bc-2627-website-v1", options: [...bad, base({ period_key: "good" })] }).map((o) => o.period_key), ["good"]);
  assert.throws(() => parseOptions({ status: "error", options: [] }));
  const r = (okReserve(1).json as Record<string, unknown>);
  assert.ok(parseReserve(r));
  for (const patch of [{ total_amount: 0 }, { total_amount: Infinity }, { currency: "chf" }, { reservation_expires_at: "soon" }, { status: "" }, { status: "error" }, { reservation_token: "" }]) {
    assert.throws(() => parseReserve({ ...r, ...patch }), JSON.stringify(patch));
  }
  const c = okComplete.json as Record<string, unknown>;
  assert.ok(parseComplete(c));
  for (const patch of [{ success: "true" }, { status: "failed" }, { invoice_number: "" }, { total_amount: -1 }]) assert.throws(() => parseComplete({ ...c, ...patch }));
});

test("age is checked on each selected date", async () => {
  const { client, of } = mock();
  const opts = await client.options("a", "b");
  const turns13 = { ...kid(1), birth_date: "2014-02-01" }; // 12 in January, 13 in February
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  await flow.reserve(opts, [turns13], [ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM)]);
  await flow.abandon();
  await assert.rejects(flow.reserve(opts, [turns13], [ch("p1", "feb-2h", "prod-2h", FEB.slice(0, 1), AM)]), /invalid_selection/);
  assert.equal(of("reserve").length, 1);
});

test("validation before reserve: names, duplicates, overlaps, unknown refs, silent drop, Carving, cancelled date", async () => {
  const { client, of } = mock();
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const adult = { ...kid(2), birth_date: "1980-01-01" };
  const cases: [FamilyParticipant[], FamilyGroupChoice[]][] = [
    [[{ ...kid(1), last_name: " " }], [ch("p1", "jan-4h", "prod-4h", JAN)]],
    [[{ ...kid(1), birth_date: "2019-02-31" }], [ch("p1", "jan-4h", "prod-4h", JAN)]],
    [[kid(1), kid(1)], [ch("p1", "jan-4h", "prod-4h", JAN)]],
    [[kid(1)], [ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM)]],
    [[kid(1)], [ch("p1", "jan-4h", "prod-4h", JAN.slice(0, 1)), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), PM)]],
    [[kid(1)], [ch("p1", "jan-2h", "prod-2h", ["2027-01-04", "2027-01-04"], AM)]],
    [[kid(1)], [ch("ghost", "jan-4h", "prod-4h", JAN)]],
    [[kid(1), kid(2)], [ch("p1", "jan-4h", "prod-4h", JAN)]], // p2 has no course and not excluded
    [[kid(1)], [ch("p1", "jan-2h", "prod-2h", JAN)]], // missing block
    [[adult], [ch("p2", "carving", "prod-carv", JAN.slice(0, 1), AM)]],
    [[adult], [ch("p2", "adult", "prod-adult", ["2027-01-06"], AM)]],
  ];
  for (const [ps, cs] of cases) await assert.rejects(flow.reserve(opts, ps, cs), /invalid_selection/);
  assert.equal(of("reserve").length, 0);
  // Same child, AM and PM of different 2h courses on the same day: allowed (no overlap).
  await flow.reserve(opts, [kid(1)], [ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM), ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), PM)]);
  assert.throws(() => buildReserveRequest([kid(1), kid(2)], [ch("p1", "jan-4h", "prod-4h", JAN)], "k", OPTIONS), /participant_without_selection/);
});

test("explicitly excluded participant is left out of reserve AND complete consistently", async () => {
  const { client, of } = mock();
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const ps = [kid(1), { ...kid(2), excluded: true }];
  await flow.reserve(opts, ps, [ch("p1", "jan-4h", "prod-4h", JAN)]);
  await flow.complete(CUSTOMER, ps);
  assert.deepEqual(of("reserve")[0].reservation.participants.map((p) => p.ref), ["p1"]);
  assert.deepEqual(of("complete")[0].participants.map((p) => p.ref), ["p1"]);
});

test("25 people over two non-overlapping periods (50 selections): one reserve, one total, invoice exactly once", async () => {
  const { client, of } = mock();
  const opts = await client.options("2026-12-01", "2027-04-30");
  const people = Array.from({ length: 25 }, (_, i) => kid(i));
  const choices = people.flatMap((p, i) => [
    ch(p.ref, "jan-2h", "prod-2h", JAN.slice(0, 2), i % 2 ? PM : AM),
    ch(p.ref, "feb-2h", "prod-2h", FEB.slice(0, 3), i % 2 ? AM : PM),
  ]);
  assert.equal(choices.length, 50);
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  assert.deepEqual(flow.validate(opts, people, choices), []);
  const r = await flow.reserve(opts, people, choices);
  assert.equal(r.total_amount, 1234);
  const inv1 = await flow.complete(CUSTOMER, people);
  const inv2 = await flow.complete(CUSTOMER, people);
  assert.deepEqual(inv1, inv2);
  assert.equal(of("reserve").length, 1);
  assert.equal(of("complete").length, 1);
  const res: ReserveRequest = of("reserve")[0];
  assert.equal(res.reservation.selections.length, 50);
  assert.equal(res.reservation.participants.length, 25);
  assert.ok(!JSON.stringify(res).match(/price|total|amount/)); // no client amount
  assert.equal(of("complete")[0].participants.length, 25);
});

test("no group capacity gate: sold-out flags ignored, 30 kids reservable", async () => {
  const { client } = mock();
  const opts = (await client.options("a", "b")).map((o) => ({ ...o, free_instructors: 0, sold_out: true }));
  const people = Array.from({ length: 30 }, (_, i) => kid(i));
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  await flow.reserve(opts, people, people.map((p) => ch(p.ref, "jan-4h", "prod-4h", JAN)));
  assert.ok(flow.reservation);
});

test("back then unchanged continue: old hold cancelled, NEW key, new hold", async () => {
  const { client, of } = mock();
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const c = [ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM)];
  await flow.reserve(opts, [kid(1)], c);
  await flow.abandon(); // user goes back
  assert.equal(flow.reservation, null);
  await flow.reserve(opts, [kid(1)], c); // unchanged
  const keys = of("reserve").map((x) => x.reservation.idempotency_key);
  assert.equal(keys.length, 2);
  assert.notEqual(keys[0], keys[1]);
  assert.deepEqual(of("cancel").map((x) => x.reservation_token), ["tok1"]);
  assert.equal(flow.reservation?.reservation_token, "tok2");
});

test("changed payload: cancels old hold and uses a new key; identical payload reuses hold", async () => {
  const { client, of } = mock();
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const c = ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM);
  await flow.reserve(opts, [kid(1)], [c]);
  await flow.reserve(opts, [kid(1)], [c]);
  assert.equal(of("reserve").length, 1);
  await flow.reserve(opts, [kid(1)], [{ ...c, dates: JAN.slice(0, 2) }]);
  const keys = of("reserve").map((x) => x.reservation.idempotency_key);
  assert.notEqual(keys[0], keys[1]);
  assert.equal(of("cancel").length, 1);
});

test("cancellation failure is not treated as cancelled", async () => {
  const { client, of } = mock({ cancel: () => ({ status: 500, json: null }) });
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const c = ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM);
  await flow.reserve(opts, [kid(1)], [c]);
  const key = flow.idempotencyKey;
  await assert.rejects(flow.abandon(), (e: unknown) => e instanceof CourseBookingError && e.message === "cancel_failed");
  assert.equal(flow.reservation?.reservation_token, "tok1");
  assert.equal(flow.idempotencyKey, key);
  await assert.rejects(flow.reserve(opts, [kid(1)], [{ ...c, dates: JAN.slice(0, 2) }]), /cancel_failed/);
  assert.equal(of("reserve").length, 1); // no second booking while first hold is alive
  const net = mock({ cancel: () => { throw new Error("timeout"); } });
  const f2 = new FamilyBookingFlow(net.client, { genKey: gen });
  await f2.reserve(opts, [kid(1)], [c]);
  await assert.rejects(f2.abandon());
  assert.ok(f2.reservation);
});

test("reserve network timeout keeps recovery identity: identical retry same key, changed payload blocked", async () => {
  const { client, of } = mock({ reserve: (_b, n) => { if (n === 1) throw new Error("timeout"); return okReserve(n); } });
  const opts = await client.options("a", "b");
  const store = memoryStore();
  const flow = new FamilyBookingFlow(client, { genKey: gen, store });
  const c = ch("p1", "jan-2h", "prod-2h", JAN.slice(0, 1), AM);
  await assert.rejects(flow.reserve(opts, [kid(1)], [c]));
  assert.equal(flow.reservation, null);
  assert.equal(flow.reservePending, true);
  await assert.rejects(flow.reserve(opts, [kid(1)], [{ ...c, block: PM }]), /reserve_pending_retry/);
  const reloaded = new FamilyBookingFlow(client, { genKey: gen, store }); // reload
  await reloaded.reserve(opts, [kid(1)], [c]);
  const keys = of("reserve").map((x) => x.reservation.idempotency_key);
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  // definitive 4xx (e.g. private unavailable) does not block editing
  const rej = mock({ reserve: (_b, n) => n === 1 ? { status: 409, json: { status: "error", code: "private_unavailable" } } : okReserve(n) });
  const f2 = new FamilyBookingFlow(rej.client, { genKey: gen });
  await assert.rejects(f2.reserve(opts, [kid(1)], [c]), (e: unknown) => e instanceof CourseBookingError && e.status === 409);
  await assert.rejects(f2.complete(CUSTOMER, [kid(1)]), /no_reservation/);
  await f2.reserve(opts, [kid(1)], [{ ...c, block: PM }]);
  assert.equal(rej.of("complete").length, 0);
});

test("lost completion response + retry and reload: same ticket/token, invoice once, no re-reserve/cancel", async () => {
  const { client, of } = mock({ complete: (_b, n) => { if (n === 1) throw new Error("connection reset"); return okComplete; } });
  const opts = await client.options("a", "b");
  const store = memoryStore();
  const flow = new FamilyBookingFlow(client, { genKey: gen, store });
  const c = [ch("p1", "jan-4h", "prod-4h", JAN)];
  await flow.reserve(opts, [kid(1)], c);
  await assert.rejects(flow.complete(CUSTOMER, [kid(1)]));
  assert.equal(flow.invoice, null);
  assert.equal(flow.completionPending, true);
  await assert.rejects(flow.abandon(), /completion_pending/);
  await assert.rejects(flow.reserve(opts, [kid(1)], c), /completion_pending/);
  const reloaded = new FamilyBookingFlow(client, { genKey: gen, store });
  assert.equal(reloaded.completionPending, true);
  const inv = await reloaded.complete(CUSTOMER, [kid(1)]);
  assert.equal(inv.invoice_number, "R-2027-1");
  const sent = of("complete");
  assert.equal(sent.length, 2);
  assert.deepEqual(sent.map((x) => [x.ticket_id, x.reservation_token]), [["T1", "tok1"], ["T1", "tok1"]]);
  assert.equal(of("reserve").length, 1);
  assert.equal(of("cancel").length, 0);
  await reloaded.complete(CUSTOMER, [kid(1)]);
  assert.equal(of("complete").length, 2);
  await reloaded.abandon();
  assert.equal(of("cancel").length, 0);
});

test("options errors fail closed", async () => {
  await assert.rejects(mock({ options: () => ({ status: 503, json: null }) }).client.options("a", "b"));
  await assert.rejects(mock({ options: () => { throw new Error("net"); } }).client.options("a", "b"));
});
