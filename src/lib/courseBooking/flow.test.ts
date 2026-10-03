import test from "node:test";
import assert from "node:assert/strict";
import type { CourseBookingAction, CourseOption } from "./contract.ts";
import { createCourseBookingClient, type Transport } from "./client.ts";
import { FamilyBookingFlow } from "./flow.ts";
import { eligibleOptions, parseOptions, previewPrice, requiresBlock, type FamilyGroupChoice, type FamilyParticipant } from "./logic.ts";

const dates = ["2027-01-04", "2027-01-05", "2027-01-06", "2027-01-07", "2027-01-08"];
const inst = (ds: string[], blocks: [string, string][]) =>
  ds.flatMap((d) => blocks.map(([a, b], i) => ({ instance_id: `${d}-${i}`, date: d, time_start: a, time_end: b })));
const tiers = [1, 2, 3, 4, 5].map((n) => ({ day_count: n, price: 60 * n, source_tariff_id: `t${n}` }));
const base = (o: Partial<CourseOption>): CourseOption => ({
  period_key: "p", course_id: "c", course_name: "Kurs", course_type: "group", discipline: "ski", skill_level_id: "blue",
  age_min: 4, age_max: 12, teaching_dates: dates, cancelled_dates: [], instances: inst(dates, [["10:00", "12:00"], ["13:30", "15:30"]]),
  product_id: "prod-2h", product_name: "2h", duration_minutes: 120, blocks: 2, tiers, bookable: true, ...o,
});
const OPTIONS: CourseOption[] = [
  base({ period_key: "kids-2h", product_id: "prod-2h" }),
  base({ period_key: "kids-4h", product_id: "prod-4h", duration_minutes: 240, blocks: 1 }),
  base({ period_key: "red-2h", product_id: "prod-red", skill_level_id: "red" }),
  base({ period_key: "adult", product_id: "prod-adult", age_min: 16, age_max: null, skill_level_id: null, cancelled_dates: ["2027-01-06"] }),
  base({ period_key: "board", product_id: "prod-board", discipline: "snowboard", skill_level_id: null, age_min: 8 }),
  base({ period_key: "carving", product_id: "prod-carv", course_name: "Carving Ladies", age_min: 16, age_max: null, skill_level_id: null }),
  base({ period_key: "inactive", product_id: "prod-x", bookable: false }),
  base({ period_key: "unlinked", product_id: null }),
];

function mock(overrides: Partial<Record<CourseBookingAction["action"], (b: any, n: number) => { status: number; json: unknown }>> = {}) {
  const calls: CourseBookingAction[] = [];
  const counts: Record<string, number> = {};
  const t: Transport = async (b) => {
    calls.push(structuredClone(b));
    counts[b.action] = (counts[b.action] ?? 0) + 1;
    const o = overrides[b.action]; if (o) return o(b, counts[b.action]);
    if (b.action === "options") return { status: 200, json: { status: "success", options: OPTIONS, informational: [] } };
    if (b.action === "reserve") return { status: 200, json: { status: "provisional", ticket_id: `T${counts.reserve}`, ticket_number: "T-1", reservation_token: `tok${counts.reserve}`, reservation_expires_at: "2027-01-01T00:15:00Z", total_amount: 1234, currency: "CHF", quote: {} } };
    if (b.action === "complete") return { status: 200, json: { success: true, status: "confirmed", invoice_number: "R-2027-1", total_amount: 1234, delivery: {} } };
    return { status: 200, json: { success: true } };
  };
  return { calls, client: createCourseBookingClient(t) };
}
let k = 0; const gen = () => `00000000-0000-4000-8000-${String(++k).padStart(12, "0")}`;

const kid = (i: number, level = "blue"): FamilyParticipant => ({ ref: `p${i}`, first_name: `Kind${i}`, last_name: "Muster", birth_date: "2019-03-01", discipline: "ski", skill_level: level });
const CUSTOMER = { email: "a@b.ch", first_name: "A", last_name: "B", phone: "+41790000000", street: "S 1", zip: "9497", city: "Malbun", country: "LI" };

test("only real sellable options; inactive/unlinked/Carving excluded; age/level/discipline filtered", async () => {
  const { client } = mock();
  const opts = await client.options("2026-12-01", "2027-04-30");
  assert.deepEqual(eligibleOptions(opts, kid(1)).map((o) => o.period_key), ["kids-2h", "kids-4h"]);
  const adult: FamilyParticipant = { ...kid(9), birth_date: "1980-01-01", skill_level: "red" };
  assert.deepEqual(eligibleOptions(opts, adult).map((o) => o.period_key), ["adult"]);
  assert.equal(requiresBlock(opts[0]), true);
  assert.equal(requiresBlock(opts[1]), false); // 4h includes both blocks
  assert.equal(previewPrice(opts[0], 6), null); // no extrapolation
});

test("options errors fail closed", async () => {
  await assert.rejects(mock({ options: () => ({ status: 503, json: null }) }).client.options("a", "b"));
  assert.throws(() => parseOptions({ status: "error" }));
});

test(">20 participants, >40 selections, mixed courses: one reserve, one total, invoice exactly once", async () => {
  const { client, calls } = mock();
  const opts = await client.options("2026-12-01", "2027-04-30");
  const people = Array.from({ length: 25 }, (_, i) => kid(i, i % 2 ? "red" : "blue"));
  const choices: FamilyGroupChoice[] = people.flatMap((p, i) => [
    { participant_ref: p.ref, period_key: i % 2 ? "red-2h" : "kids-2h", product_id: i % 2 ? "prod-red" : "prod-2h", dates: dates.slice(0, 2), block: "10:00" },
    { participant_ref: p.ref, period_key: i % 2 ? "red-2h" : "kids-2h", product_id: i % 2 ? "prod-red" : "prod-2h", dates: dates.slice(2, 5), block: "13:30" },
  ]);
  assert.ok(choices.length > 40);
  const flow = new FamilyBookingFlow(client, gen);
  const r = await flow.reserve(opts, people, choices);
  assert.equal(r.total_amount, 1234);
  const inv1 = await flow.complete(CUSTOMER, people);
  const inv2 = await flow.complete(CUSTOMER, people);
  assert.equal(inv1, inv2);
  assert.equal(calls.filter((c) => c.action === "reserve").length, 1);
  assert.equal(calls.filter((c) => c.action === "complete").length, 1);
  const res = calls.find((c) => c.action === "reserve") as any;
  assert.equal(res.reservation.selections.length, 50);
  assert.ok(!("total_amount" in res.reservation) && !JSON.stringify(res).includes("price")); // no client amount
});

test("no group capacity gate: overflow group course still reservable", async () => {
  const { client } = mock();
  const opts = (await client.options("a", "b")).map((o) => ({ ...o, free_instructors: 0, sold_out: true } as CourseOption));
  const people = Array.from({ length: 30 }, (_, i) => kid(i));
  const flow = new FamilyBookingFlow(client, gen);
  await flow.reserve(opts, people, people.map((p) => ({ participant_ref: p.ref, period_key: "kids-4h", product_id: "prod-4h", dates })));
  assert.ok(flow.reservation);
});

test("idempotency: identical retry reuses key, changed payload new key + cancel old hold", async () => {
  const { client, calls } = mock({ reserve: (_b, n) => n === 1 ? { status: 502, json: null } : { status: 200, json: { status: "provisional", ticket_id: `T${n}`, ticket_number: "x", reservation_token: `tok${n}`, reservation_expires_at: "z", total_amount: 100, currency: "CHF" } } });
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, gen);
  const p = [kid(1)];
  const c: FamilyGroupChoice[] = [{ participant_ref: "p1", period_key: "kids-2h", product_id: "prod-2h", dates: dates.slice(0, 1), block: "10:00" }];
  await assert.rejects(flow.reserve(opts, p, c));
  assert.equal(flow.reservation, null); // never pretend success
  await flow.reserve(opts, p, c);
  const keys = calls.filter((x) => x.action === "reserve").map((x: any) => x.reservation.idempotency_key);
  assert.equal(keys[0], keys[1]);
  await flow.reserve(opts, p, c); // same payload, no new call
  assert.equal(calls.filter((x) => x.action === "reserve").length, 2);
  // back/edit: change dates
  await flow.reserve(opts, p, [{ ...c[0], dates: dates.slice(0, 2) }]);
  const after = calls.filter((x) => x.action === "reserve").map((x: any) => x.reservation.idempotency_key);
  assert.notEqual(after[2], after[1]);
  const cancel = calls.find((x) => x.action === "cancel") as any;
  assert.equal(cancel.reservation_token, "tok2");
});

test("validation before reserve: missing DOB/level, wrong block, missing tier, Carving", async () => {
  const { client, calls } = mock();
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, gen);
  await assert.rejects(flow.reserve(opts, [{ ...kid(1), birth_date: "" }], [{ participant_ref: "p1", period_key: "kids-4h", product_id: "prod-4h", dates }]));
  await assert.rejects(flow.reserve(opts, [kid(1)], [{ participant_ref: "p1", period_key: "kids-2h", product_id: "prod-2h", dates }])); // no block
  await assert.rejects(flow.reserve(opts, [kid(1)], [{ participant_ref: "p1", period_key: "kids-2h", product_id: "prod-2h", dates, block: "11:00" }]));
  const adult = { ...kid(2), birth_date: "1980-01-01" };
  await assert.rejects(flow.reserve(opts, [adult], [{ participant_ref: "p2", period_key: "carving", product_id: "prod-carv", dates: dates.slice(0, 1), block: "10:00" }]));
  await assert.rejects(flow.reserve(opts, [adult], [{ participant_ref: "p2", period_key: "adult", product_id: "prod-adult", dates: ["2027-01-06"], block: "10:00" }])); // cancelled date
  assert.equal(calls.filter((c) => c.action === "reserve").length, 0);
});

test("private unavailable / API error: no invoice, error surfaced", async () => {
  const { client, calls } = mock({ reserve: () => ({ status: 409, json: { status: "error", code: "private_unavailable" } }) });
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, gen);
  await assert.rejects(flow.reserve(opts, [kid(1)], [{ participant_ref: "p1", period_key: "kids-4h", product_id: "prod-4h", dates }]), (e: any) => e.status === 409);
  await assert.rejects(flow.complete(CUSTOMER, [kid(1)]), /no_reservation/);
  assert.equal(calls.filter((c) => c.action === "complete").length, 0);
});

test("complete error leaves no invoice; abandon cancels hold; no cancel after invoice", async () => {
  const { client, calls } = mock({ complete: (_b, n) => n === 1 ? { status: 500, json: null } : { status: 200, json: { success: true, status: "confirmed", invoice_number: "R1", total_amount: 1234 } } });
  const opts = await client.options("a", "b");
  const flow = new FamilyBookingFlow(client, gen);
  const c: FamilyGroupChoice[] = [{ participant_ref: "p1", period_key: "kids-4h", product_id: "prod-4h", dates }];
  await flow.reserve(opts, [kid(1)], c);
  await assert.rejects(flow.complete(CUSTOMER, [kid(1)]));
  assert.equal(flow.invoice, null);
  await flow.complete(CUSTOMER, [kid(1)]);
  await flow.abandon();
  assert.equal(calls.filter((x) => x.action === "cancel").length, 0);
});
