import test from "node:test";
import assert from "node:assert/strict";
import type { CourseBookingAction, CourseOption, CompleteRequest, PrivateSelection, GroupSelection } from "./contract.ts";
import { createCourseBookingClient, CourseBookingError, type Transport } from "./client.ts";
import { FamilyBookingFlow, memoryStore } from "./flow.ts";
import { type FamilyChoice, type FamilyParticipant } from "./logic.ts";
import {
  availabilityKey, parseAvailability, parsePrivateCatalog, rateFor, slotAvailable, timeOptions, durationsFor,
  type AvailabilityDay, type FamilyPrivateChoice, type PrivateContext,
} from "./private.ts";

// Synthetic fixtures shaped like yeti-products / yeti-availability responses.
const AM = "10:00-12:00";
const JAN = ["2027-01-04", "2027-01-05"];
const groupOpt: CourseOption = {
  period_key: "jan-2h", course_id: "c", course_name: "Gruppenkurs Ski Kinder", course_type: "group", discipline: "ski", skill_level_id: "blue",
  age_min: 4, age_max: 12, dates: JAN, cancelled_dates: [],
  block_dates: { [AM]: JAN, "14:00-16:00": JAN }, block_mode: "choose_one",
  product_id: "prod-2h", product_name: "2h", duration_minutes: 120, blocks: [AM, "14:00-16:00"],
  tiers: [1, 2].map((n) => ({ day_count: n, price: 60 * n, source_tariff_id: `t${n}` })), bookable: true,
};
const CATALOG = {
  products: [
    { id: "priv-ski", name: "Privatunterricht Ski", type: "private", discipline: "ski", online_bookable: true, min_age: 3, max_age: null, currency: "CHF",
      private_rates: [{ duration_minutes: 60, persons: 1, price: 75 }, { duration_minutes: 120, persons: 1, price: 170 }, { duration_minutes: 120, persons: 2, price: 210 }] },
    { id: "priv-inactive", name: "Privat alt", type: "private", discipline: "ski", online_bookable: false, private_rates: [{ duration_minutes: 60, persons: 1, price: 1 }] },
    { id: "priv-carv", name: "Carving Privat", type: "private", discipline: "ski", online_bookable: true, private_rates: [{ duration_minutes: 60, persons: 1, price: 1 }] },
    { id: "priv-dupe", name: "Doppelt", type: "private", discipline: "ski", online_bookable: true, private_rates: [{ duration_minutes: 60, persons: 1, price: 1 }, { duration_minutes: 60, persons: 1, price: 2 }] },
    { id: "priv-norates", name: "Ohne Tarif", type: "private", discipline: "ski", online_bookable: true, private_rates: [] },
    { id: "grp", name: "Gruppe", type: "group", discipline: "ski", online_bookable: true, private_rates: [] },
  ],
};
const PRODUCTS = parsePrivateCatalog(CATALOG);
const day = (date: string, slots: [string, string, number][]): AvailabilityDay => ({ date, slots: slots.map(([start, end, free_instructors]) => ({ start, end, free_instructors })) });
const ctxWith = (avail: Record<string, AvailabilityDay[]>): PrivateContext => ({ products: PRODUCTS, availability: avail });
const CTX = ctxWith({
  [availabilityKey("priv-ski", 2, 120)]: [day("2027-01-04", [["09:00", "16:00", 1]]), day("2027-01-05", [["09:00", "12:00", 0], ["13:00", "16:00", 2]])],
  [availabilityKey("priv-ski", 1, 60)]: [day("2027-01-04", [["09:00", "16:00", 3]])],
});

type Resp = { status: number; json: unknown };
const okReserve = (n: number): Resp => ({ status: 200, json: { success: true, status: "held", ticket_id: `T${n}`, ticket_number: `T-${n}`, reservation_token: `tok${n}`, reservation_expires_at: "2027-01-01T00:15:00Z", total_amount: 590, currency: "CHF" } });
function mock(over: Partial<Record<CourseBookingAction["action"], (b: CourseBookingAction, n: number) => Resp>> = {}) {
  const calls: CourseBookingAction[] = []; const n: Record<string, number> = {};
  const t: Transport = async (b) => {
    calls.push(structuredClone(b)); n[b.action] = (n[b.action] ?? 0) + 1;
    const o = over[b.action]; if (o) return o(b, n[b.action]);
    if (b.action === "reserve") return okReserve(n.reserve);
    if (b.action === "complete") return { status: 200, json: { success: true, status: "confirmed", invoice_number: "R-1", total_amount: 590 } };
    return { status: 200, json: { success: true, status: "released", already_released: false } };
  };
  const of = <A extends CourseBookingAction["action"]>(a: A) => calls.filter((c): c is Extract<CourseBookingAction, { action: A }> => c.action === a);
  return { of, client: createCourseBookingClient(t) };
}
let k = 0; const gen = () => `00000000-0000-4000-8000-${String(++k).padStart(12, "0")}`;
const kid = (i: number, extra: Partial<FamilyParticipant> = {}): FamilyParticipant => ({ ref: `p${i}`, first_name: `Kind${i}`, last_name: "Muster", birth_date: "2019-03-01", discipline: "ski", skill_level: "blue", ...extra });
const CUSTOMER: CompleteRequest["customer"] = { email: "a@b.ch", first_name: "A", last_name: "B", phone: "+41790000000", street: "S 1", zip: "9497", city: "Malbun", country: "LI" };
const priv = (refs: string[], items: [string, string, string][], product_id = "priv-ski"): FamilyPrivateChoice =>
  ({ kind: "private", participant_refs: refs, product_id, items: items.map(([date, time_start, time_end]) => ({ date, time_start, time_end })) });
const grp = (ref: string, dates: string[], block = AM): FamilyChoice => ({ participant_ref: ref, period_key: "jan-2h", product_id: "prod-2h", dates, block });

test("catalog: only active, linked, non-Carving private products with an unambiguous tariff", () => {
  assert.deepEqual(PRODUCTS.map((p) => p.id), ["priv-ski"]);
  assert.throws(() => parsePrivateCatalog({ error: "x" }));
  const p = PRODUCTS[0];
  assert.deepEqual(durationsFor(p, 1), [60, 120]);
  assert.deepEqual(durationsFor(p, 2), [120]);
  assert.deepEqual(durationsFor(p, 3), []); // no source tariff for 3 persons → not offered
  assert.equal(rateFor(p, 60, 2), null);
  assert.deepEqual(timeOptions(p, 2, 120), ["10:00", "12:00", "14:00"]);
});

test("availability: strict parse, error fails closed, slot must cover time with a free instructor", () => {
  assert.throws(() => parseAvailability({ days: [], error: "availability_unavailable" }));
  assert.throws(() => parseAvailability({ days: [{ date: "2027-02-31", slots: [] }] }));
  assert.throws(() => parseAvailability({ days: [{ date: "2027-01-04", slots: [{ start: "9", end: "10", free_instructors: 1 }] }] }));
  const days = parseAvailability({ days: [{ date: "2027-01-04", slots: [{ start: "09:00", end: "12:00", free_instructors: 1 }] }] });
  assert.equal(slotAvailable(days, { date: "2027-01-04", time_start: "10:00", time_end: "12:00" }), true);
  assert.equal(slotAvailable(days, { date: "2027-01-04", time_start: "10:00", time_end: "13:00" }), false);
  assert.equal(slotAvailable(days, { date: "2027-01-05", time_start: "10:00", time_end: "12:00" }), false);
  assert.equal(slotAvailable(undefined, { date: "2027-01-04", time_start: "10:00", time_end: "12:00" }), false);
});

test("mixed family: two kids share one private session + non-overlapping group courses → exact payload, no client price, one invoice", async () => {
  const { client, of } = mock();
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const people = [kid(1), kid(2), kid(3)];
  const choices: FamilyChoice[] = [
    grp("p1", JAN, AM),
    grp("p3", JAN, AM),
    priv(["p1", "p2"], [["2027-01-04", "14:00", "16:00"]]), // p1 afternoon after morning group
    priv(["p2"], [["2027-01-04", "09:00", "10:00"]]),
  ];
  assert.deepEqual(flow.validate([groupOpt], people, choices, CTX), []);
  const r = await flow.reserve([groupOpt], people, choices, CTX);
  assert.equal(r.total_amount, 590);
  const sel = of("reserve")[0].reservation.selections;
  assert.deepEqual(sel.filter((s): s is PrivateSelection => s.kind === "private"), [
    { kind: "private", participant_refs: ["p1", "p2"], product_id: "priv-ski", items: [{ date: "2027-01-04", time_start: "14:00", time_end: "16:00" }] },
    { kind: "private", participant_refs: ["p2"], product_id: "priv-ski", items: [{ date: "2027-01-04", time_start: "09:00", time_end: "10:00" }] },
  ]);
  assert.equal(sel.filter((s): s is GroupSelection => s.kind === "group").length, 2);
  assert.deepEqual(of("reserve")[0].reservation.participants.map((p) => p.ref), ["p1", "p2", "p3"]);
  assert.ok(!JSON.stringify(of("reserve")[0]).match(/price|total|amount|rate/)); // server prices, no multiplication client-side
  await flow.complete(CUSTOMER, people);
  await flow.complete(CUSTOMER, people);
  assert.equal(of("complete").length, 1);
  assert.equal(of("complete")[0].participants.length, 3);
  assert.equal(flow.invoice?.total_amount, 590);
});

test("shared participant overlaps between private and group (or two privates) are rejected", async () => {
  const { client, of } = mock();
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const people = [kid(1), kid(2)];
  const cases: FamilyChoice[][] = [
    [grp("p1", JAN, AM), priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])],
    [priv(["p1", "p2"], [["2027-01-04", "14:00", "16:00"]]), priv(["p2"], [["2027-01-04", "14:00", "15:00"]]) as FamilyChoice, grp("p1", JAN)],
  ];
  for (const cs of cases) await assert.rejects(flow.reserve([groupOpt], people, cs, CTX), /invalid_selection/);
  assert.equal(of("reserve").length, 0);
});

test("private gates: unavailable slot, no free instructor, missing availability, tariff persons, discipline, age, excluded, unknown refs, grid", async () => {
  const { client, of } = mock();
  const flow = new FamilyBookingFlow(client, { genKey: gen });
  const two = [kid(1), kid(2)];
  const bad: [FamilyParticipant[], FamilyChoice[], PrivateContext | undefined][] = [
    [two, [priv(["p1", "p2"], [["2027-01-05", "10:00", "12:00"]])], CTX], // free_instructors 0
    [two, [priv(["p1", "p2"], [["2027-01-06", "10:00", "12:00"]])], CTX], // day not in availability
    [two, [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])], ctxWith({})], // availability not loaded/failed
    [two, [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])], undefined], // no private source at all
    [two, [priv(["p1", "p2"], [["2027-01-04", "09:00", "10:00"]])], CTX], // no 60-min/2-person tariff
    [[kid(1), kid(2), kid(3)], [priv(["p1", "p2", "p3"], [["2027-01-04", "10:00", "12:00"]])], CTX], // no 3-person tariff
    [[kid(1), kid(2, { discipline: "snowboard" })], [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])], CTX],
    [[kid(1), kid(2, { birth_date: "2025-01-01" })], [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])], CTX], // age 2 < min 3
    [[kid(1), kid(2, { excluded: true })], [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])], CTX],
    [two, [priv(["p1", "ghost"], [["2027-01-04", "10:00", "12:00"]])], CTX],
    [two, [priv(["p1", "p1"], [["2027-01-04", "10:00", "12:00"]])], CTX],
    [two, [priv(["p1", "p2"], [["2027-01-04", "10:30", "12:30"]])], CTX], // not on website grid
    [two, [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]], "priv-inactive")], CTX],
    [two, [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"], ["2027-01-04", "10:00", "12:00"]])], CTX],
    [[kid(1), kid(2)], [priv(["p1"], [["2027-01-04", "09:00", "10:00"]])], CTX], // p2 silently without selection
  ];
  for (const [ps, cs, ctx] of bad) await assert.rejects(flow.reserve([groupOpt], ps, cs, ctx), /invalid_selection/, JSON.stringify(cs));
  assert.equal(of("reserve").length, 0);
});

test("private is never capacity-free: many participants each need their own slot coverage", () => {
  const people = Array.from({ length: 22 }, (_, i) => kid(i));
  const flow = new FamilyBookingFlow(mock().client, { genKey: gen });
  const choices: FamilyChoice[] = people.map((p) => priv([p.ref], [["2027-01-05", "09:00", "10:00"]])); // 0 free instructors that morning
  assert.ok(flow.validate([groupOpt], people, choices, ctxWith({ [availabilityKey("priv-ski", 1, 60)]: [day("2027-01-05", [["09:00", "12:00", 0]])] })).length >= 22);
});

test("409 race on private slot: no reservation/invoice, edit allowed, new key; draft retry identical key after timeout + reload", async () => {
  const race = mock({ reserve: (_b, n) => (n === 1 ? { status: 409, json: { status: "error", code: "private_unavailable" } } : okReserve(n)) });
  const flow = new FamilyBookingFlow(race.client, { genKey: gen });
  const people = [kid(1), kid(2)];
  const first: FamilyChoice[] = [priv(["p1", "p2"], [["2027-01-04", "10:00", "12:00"]])];
  await assert.rejects(flow.reserve([groupOpt], people, first, CTX), (e: unknown) => e instanceof CourseBookingError && e.status === 409);
  assert.equal(flow.reservation, null);
  assert.equal(flow.reservePending, false);
  await assert.rejects(flow.complete(CUSTOMER, people), /no_reservation/);
  await flow.reserve([groupOpt], people, [priv(["p1", "p2"], [["2027-01-04", "14:00", "16:00"]])], CTX);
  const keys = race.of("reserve").map((c) => c.reservation.idempotency_key);
  assert.notEqual(keys[0], keys[1]);
  assert.equal(race.of("complete").length, 0);

  const store = memoryStore();
  const net = mock({ reserve: (_b, n) => { if (n === 1) throw new Error("timeout"); return okReserve(n); } });
  const f1 = new FamilyBookingFlow(net.client, { genKey: gen, store });
  await assert.rejects(f1.reserve([groupOpt], people, first, CTX));
  await assert.rejects(f1.reserve([groupOpt], people, [priv(["p1", "p2"], [["2027-01-04", "14:00", "16:00"]])], CTX), /reserve_pending_retry/);
  const f2 = new FamilyBookingFlow(net.client, { genKey: gen, store });
  await f2.reserve([groupOpt], people, first, CTX);
  const nk = net.of("reserve").map((c) => c.reservation.idempotency_key);
  assert.equal(nk[0], nk[1]);
});

test("back/edit mixed booking: cancels hold, fresh key; lost complete response retried after reload with same ticket/token", async () => {
  const store = memoryStore();
  const m = mock({ complete: (_b, n) => { if (n === 1) throw new Error("reset"); return { status: 200, json: { success: true, status: "confirmed", invoice_number: "R-9", total_amount: 590 } }; } });
  const people = [kid(1), kid(2)];
  const choices: FamilyChoice[] = [grp("p1", JAN, AM), priv(["p1", "p2"], [["2027-01-04", "14:00", "16:00"]])];
  const flow = new FamilyBookingFlow(m.client, { genKey: gen, store });
  await flow.reserve([groupOpt], people, choices, CTX);
  await flow.abandon();
  await flow.reserve([groupOpt], people, choices, CTX);
  const keys = m.of("reserve").map((c) => c.reservation.idempotency_key);
  assert.notEqual(keys[0], keys[1]);
  assert.deepEqual(m.of("cancel").map((c) => c.reservation_token), ["tok1"]);
  await assert.rejects(flow.complete(CUSTOMER, people));
  const reloaded = new FamilyBookingFlow(m.client, { genKey: gen, store });
  const inv = await reloaded.complete(CUSTOMER, people);
  assert.equal(inv.invoice_number, "R-9");
  assert.deepEqual(m.of("complete").map((c) => c.reservation_token), ["tok2", "tok2"]);
  assert.equal(m.of("reserve").length, 2);
});
