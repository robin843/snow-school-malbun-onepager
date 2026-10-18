import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { privateTariffView, validTimeTariffs } from "./privateTimeTariffs.ts";
import { productCardData } from "./productCardData.ts";
import type { YetiProduct } from "../hooks/useYetiProducts";

// Synthetic Core-shaped fixture (values supplied by the test, never by the client code).
const t = (duration_minutes: number, start_time: string, end_time: string, amount_chf: number, is_office_exception = false) =>
  ({ duration_minutes, start_time, end_time, amount_chf, is_office_exception });
const tariffs = [
  t(120, "14:00", "16:00", 190), t(60, "13:00", "14:00", 75), t(120, "09:00", "11:00", 160), t(60, "09:00", "10:00", 75),
  t(120, "12:00", "14:00", 150), t(60, "10:00", "11:00", 85, true), t(120, "10:00", "12:00", 190), t(60, "12:00", "13:00", 75),
  t(120, "11:00", "13:00", 160), t(120, "13:00", "15:00", 160),
];
const base = {
  id: "p", name: "Privat", title: "Privat", subtitle: "", type: "private", discipline: "ski", audience: null, icon_key: null,
  badge: null, requirement: null, meta: [], notes: [], pricing_type: "hourly", price: 0, price_tiers: [], duration_minutes: null,
  min_age: null, max_age: null, currency: "CHF", sort_order: 0, online_bookable: false,
  private_rates: [{ duration_minutes: 60, persons: 1, price: 75 }, { duration_minutes: 120, persons: 1, price: 170 },
    { duration_minutes: 120, persons: 2, price: 210 }, { duration_minutes: 180, persons: 1, price: 265 }],
} as YetiProduct;

test("no generic 2h CHF 170 or 60-min flat rows when time tariffs are missing", () => {
  const data = productCardData(base);
  assert.equal(data.tariffs.some((r) => r.chf === "170" || r.chf === "210" || r.chf === "75"), false);
  assert.deepEqual(data.tariffs.map((r) => [r.label, r.chf, r.group]), [["3 Stunden · 1 Person", "265", "Weitere Dauertarife"]]);
  assert.equal(privateTariffView(base), null);
  const card = readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8");
  assert.match(card, /Preise nach Zeitfenster auf Anfrage/);
});
test("summary derives only from API time tariffs: ab lowest 60, min–max regular 120", () => {
  const v = privateTariffView({ public_private_time_tariffs: tariffs })!;
  assert.deepEqual(v.summary, [
    { label: "Einzellektion 60 Min.", value: "ab CHF 75" }, { label: "Doppellektion 120 Min.", value: "CHF 150–190" },
  ]);
  const other = privateTariffView({ public_private_time_tariffs: [t(120, "10:00", "12:00", 999)] })!;
  assert.deepEqual(other.summary, [{ label: "Doppellektion 120 Min.", value: "CHF 999" }]);
});
test("bands are grouped and sorted by start time; office exception separate", () => {
  const v = privateTariffView({ public_private_time_tariffs: tariffs })!;
  assert.deepEqual(v.groups.map((g) => [g.label.split(" ")[0], g.rows.map((r) => `${r.time} ${r.chf}`)]), [
    ["Einzellektionen", ["09:00–10:00 75", "12:00–13:00 75", "13:00–14:00 75"]],
    ["Doppellektionen", ["09:00–11:00 160", "10:00–12:00 190", "11:00–13:00 160", "12:00–14:00 150", "13:00–15:00 160", "14:00–16:00 190"]],
    ["Einzelstunde", ["10:00–11:00 85"]],
  ]);
});
test("malformed rows are dropped, never guessed", () => {
  assert.deepEqual(validTimeTariffs([t(120, "10:00", "11:00", 190), t(60, "25:00", "26:00", 75), t(60, "09:00", "10:00", 0),
    { ...t(60, "09:00", "10:00", 75), is_office_exception: "no" }, null]), []);
  assert.equal(privateTariffView({ public_private_time_tariffs: "x" }), null);
});
test("price conditions shown only when supplied by API", () => {
  assert.deepEqual(privateTariffView({ public_private_time_tariffs: tariffs })!.footnotes, []);
  const v = privateTariffView({ public_private_time_tariffs: tariffs, public_private_price_conditions: {
    additional_person: [{ duration_minutes: 120, amount_chf: 40 }, { duration_minutes: 60, amount_chf: 20 }],
    daily_discount: { min_lessons: 4, percent: 10 } } })!;
  assert.deepEqual(v.footnotes, ["Zusatzperson 60 Min. CHF 20, 120 Min. CHF 40; ab 4 Lektionen am Tag 10 % Rabatt"]);
});
test("no season labels and no hardcoded prices in source", () => {
  const src = readFileSync(new URL("./privateTimeTariffs.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /saison|hochsaison|nebensaison/i);
  assert.doesNotMatch(src.replace(/\/\*\*[\s\S]*?\*\//g, ""), /CHF \d/);
  assert.doesNotMatch(JSON.stringify(privateTariffView({ public_private_time_tariffs: tariffs })), /saison/i);
  assert.equal(productCardData({ ...base, public_private_time_tariffs: tariffs }).bookable, false);
});
