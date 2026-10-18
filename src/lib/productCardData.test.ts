import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { YetiProduct } from "../hooks/useYetiProducts";
import { productCardData, legacyCourseMode } from "./productCardData.ts";
import { isOnlineBookable } from "./publicProductPricing.ts";

const product: YetiProduct = {
  id: "core-stable-product", name: "Windel Samstagskurs Mittwoch BC", title: "Core Windel 2h",
  subtitle: "Core subtitle", type: "group", discipline: "ski", audience: "kids", icon_key: "users",
  badge: null, requirement: null, meta: [], notes: [], pricing_type: "tiered", price: 999,
  price_tiers: [{ day_count: 1, cumulative_price: 81 }, { day_count: 5, cumulative_price: 347 }],
  private_rates: [], duration_minutes: 120, min_age: 2, max_age: 4, currency: "CHF",
  sort_order: 0, online_bookable: false, availability_policy: "group_season",
};

test("card data preserves stable Core identity and title including duration", () => {
  const data = productCardData(product);
  assert.equal(data.id, "core-stable-product");
  assert.equal(data.title, "Core Windel 2h");
  assert.equal(data.subtitle, "Core subtitle");
  assert.equal(productCardData({ ...product, title: "" }).title, product.name);
});
test("Windel five-day cumulative tier remains exact without fallback or extrapolation", () => {
  const data = productCardData(product);
  assert.deepEqual(data.tariffs.map((t) => [t.label, t.chf]), [["1 Tag · 1 Person", "81"], ["5 Tage · 1 Person", "347"]]);
  assert.deepEqual(productCardData({ ...product, price_tiers: [] }).tariffs, []);
});
test("only positive finite exact source tiers are shown", () => {
  const data = productCardData({ ...product, price_tiers: [
    ...product.price_tiers, { day_count: 2, cumulative_price: 0 }, { day_count: 3, cumulative_price: -4 },
    { day_count: 4, cumulative_price: NaN }, { day_count: 1.5, cumulative_price: 123 },
  ] });
  assert.deepEqual(data.tariffs.map((t) => t.chf), ["81", "347"]);
});
test("metadata uses validated source values, never weekday or clock times from names", () => {
  const data = productCardData(product);
  assert.deepEqual(data.meta, [{ icon: "users", label: "Kinder · 2–4 Jahre" }, { icon: "clock", label: "120 Minuten" }]);
  const supplied = productCardData({ ...product, meta: [{ icon: "calendar", label: "Core calendar" }, { icon: "clock", label: "Core time" }] });
  assert.deepEqual(supplied.meta.slice(0, 2), [{ icon: "calendar", label: "Core calendar" }, { icon: "clock", label: "Core time" }]);
  assert.deepEqual(productCardData({ ...product, audience: null, min_age: null, max_age: null, duration_minutes: null, meta: [{ icon: "calendar", label: "" }] }).meta, []);
});
test("private rates remain exact totals for all supplied duration/person combinations", () => {
  const data = productCardData({ ...product, type: "private", private_rates: [
    { duration_minutes: 90, persons: 1, price: 117 }, { duration_minutes: 180, persons: 2, price: 301 },
    { duration_minutes: 60, persons: 1, price: -1 },
  ] });
  assert.deepEqual(data.tariffs.map((t) => [t.label, t.chf, t.group]), [
    ["1.5 Stunden · 1 Person", "117", "Weitere Dauertarife"], ["3 Stunden · 2 Personen", "301", "Weitere Dauertarife"],
  ]);
});
test("informational policy cannot activate a nonbookable product", () => {
  for (const policy of ["group_season", "private_check"] as const) {
    const p = { ...product, availability_policy: policy };
    assert.equal(productCardData(p).bookable, false);
    assert.equal(isOnlineBookable(p), false);
  }
});
test("legacy wizard cannot authorize group schedules from any product name", () => {
  assert.equal(legacyCourseMode("group", product), null);
  assert.equal(legacyCourseMode("private", { type: "private" }), "private");
  assert.equal(legacyCourseMode("private", product), null);
});
const offering: NonNullable<YetiProduct["public_offering"]> = {
  schedule_kind: "weekly", weekdays: [3], dates: ["2026-12-23"],
  time_blocks: [{ start: "14:00", end: "16:00" }],
};
test("public offering preserves custom schedule text and actual time", () => {
  const data = productCardData({ ...product, public_offering: { ...offering, display_schedule_text: "Immer mittwochs" } });
  assert.deepEqual(data.meta.slice(0, 2), [
    { icon: "calendar", label: "Immer mittwochs" }, { icon: "clock", label: "14:00–16:00 Uhr" },
  ]);
});
test("weekly Wednesday fallback never displays concrete dates", () => {
  const data = productCardData({ ...product, public_offering: { ...offering, display_schedule_text: "  " } });
  assert.equal(data.meta.find((m) => m.icon === "calendar")?.label, "Immer mittwochs");
  assert.equal(productCardData({ ...product, public_offering: { ...offering, weekdays: [0, 8] } }).meta.some((m) => m.icon === "calendar"), false);
});
test("defined dates use only valid supplied exact dates in source order", () => {
  const data = productCardData({ ...product, public_offering: { schedule_kind: "dates", dates: ["2026-12-26", "2027-01-02"] } });
  assert.equal(data.meta.find((m) => m.icon === "calendar")?.label, "26.12.2026 / 02.01.2027");
  assert.equal(productCardData({ ...product, public_offering: { schedule_kind: "dates", dates: ["2026-02-30"] } }).meta.some((m) => m.icon === "calendar"), false);
});
test("two blocks remain one clock row without multiplying exact day tiers", () => {
  const data = productCardData({ ...product, public_offering: { ...offering, time_blocks: [
    { start: "10:00", end: "12:00" }, { start: "14:00", end: "16:00" },
  ] }, meta: [{ icon: "clock", label: "120 Minuten" }, { icon: "clock", label: "Dauer" }] });
  assert.deepEqual(data.meta.filter((m) => m.icon === "clock"), [{ icon: "clock", label: "10:00–12:00 / 14:00–16:00 Uhr" }]);
  assert.deepEqual(data.tariffs, productCardData(product).tariffs);
});
test("absent offering preserves previous cards exactly", () => {
  assert.deepEqual(productCardData({ ...product, public_offering: null }), productCardData(product));
  assert.deepEqual(productCardData({ ...product, public_offering: { schedule_kind: "weekly" } }), productCardData(product));
});
test("free text stays literal text, not interpreted HTML", () => {
  const label = '<img src=x onerror="alert(1)">Immer mittwochs';
  const data = productCardData({ ...product, public_offering: { ...offering, display_schedule_text: label } });
  assert.equal(data.meta.find((m) => m.icon === "calendar")?.label, label);
});
test("invalid time blocks cannot invent or partially display a time", () => {
  for (const blocks of [[{ start: "25:00", end: "26:00" }], [{ start: "16:00", end: "14:00" }],
    [{ start: "10:00", end: "12:00" }, { start: "bad", end: "16:00" }]]) {
    const data = productCardData({ ...product, public_offering: { ...offering, time_blocks: blocks } });
    assert.deepEqual(data.meta.filter((m) => m.icon === "clock"), [{ icon: "clock", label: "120 Minuten" }]);
  }
});
test("public display schedule never enables booking or legacy group authorization", () => {
  const p = { ...product, public_offering: offering };
  assert.equal(productCardData(p).bookable, false);
  assert.equal(isOnlineBookable(p), false);
  assert.equal(legacyCourseMode("group", p), null);
});
test("removed UUID table and name schedule rules cannot regress in production sources", () => {
  const cards = readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8");
  const booking = readFileSync(new URL("../pages/Buchung.tsx", import.meta.url), "utf8");
  for (const id of ["6edc13ea-63a2-5d4c-b22e-54f43370e800", "e25c5f7c-939a-54d5-b355-102ad585dd54", "8fe2a11e-362d-4f05-8964-87d6b214fc3e", "53d2f0d3-9509-4e59-a78d-67d80beecb74", "3646f155-8a66-53e3-b512-749f3a42c1ae", "0e8e8669-d8f4-5b19-8e6d-36ff588fdee1", "ab4e4941-02fe-58b7-9ec8-d9b773a1d870", "f8a69024-478a-5c9d-bfaa-5e9cb8170c0b"]) assert.equal(cards.includes(id), false);
  assert.equal(cards.includes("courseInformation"), false);
  assert.equal(cards.includes("WINDEL_MAX_DAYS"), false);
  assert.equal(booking.includes("courseModeFor"), false);
  assert.equal(/\.test\((?:p|product)\.(?:name|title)\)/.test(cards + booking), false);
});const sat = (s: string[]) => s;
const series1 = { sequence: 1, label: "Kurs 1", start_date: "2027-01-09", end_date: "2027-02-06", max_selected_days: 3,
  dates: sat(["2027-01-09", "2027-01-16", "2027-01-23", "2027-01-30", "2027-02-06"]) };
const series2 = { sequence: 2, label: "Kurs 2", start_date: "2027-02-20", end_date: "2027-03-20", max_selected_days: 3,
  dates: sat(["2027-02-20", "2027-02-27", "2027-03-06", "2027-03-13", "2027-03-20"]) };
const satOffering = { schedule_kind: "weekly", weekdays: [6], display_schedule_text: "Immer samstags", time_blocks: [{ start: "10:00", end: "12:00" }] };
const cal = (p: YetiProduct) => productCardData(p).meta.filter((m) => m.icon === "calendar");
test("two series replace generic weekday text and distinguish offered vs selectable days", () => {
  const p = { ...product, public_offering: { ...satOffering, series: [series1, series2] } };
  assert.deepEqual(cal(p), [{ icon: "calendar", label: "Kurs 1: 09.01.–06.02.2027 · Kurs 2: 20.02.–20.03.2027 · je 5 Termine, 1–3 wählbar" }]);
  assert.deepEqual(productCardData(p).meta.filter((m) => m.icon === "clock"), [{ icon: "clock", label: "10:00–12:00 Uhr" }]);
  assert.deepEqual(productCardData(p).tariffs, productCardData(product).tariffs);
  assert.equal(productCardData(p).bookable, false);
});
test("one series renders its range; no series keeps weekly text", () => {
  assert.equal(cal({ ...product, public_offering: { ...satOffering, series: [series1] } })[0].label, "Kurs 1: 09.01.–06.02.2027 · je 5 Termine, 1–3 wählbar");
  assert.equal(cal({ ...product, public_offering: { ...satOffering, series: [] } })[0].label, "Immer samstags");
});
test("malformed or unordered series fall back safely without inventing dates", () => {
  for (const bad of [[series2, series1], [{ ...series1, end_date: "2027-02-30" }], [{ ...series1, dates: ["2026-12-01"] }],
    [{ ...series1, sequence: 1.5 }], [null], [series1, { ...series2, start_date: "2027-02-01" }]]) {
    assert.equal(cal({ ...product, public_offering: { ...satOffering, series: bad as never } })[0].label, "Immer samstags");
  }
});
