import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { privateTariffView, validTimeWindows } from "./privateTimeTariffs.ts";
import { productCardData } from "./productCardData.ts";
import type { YetiProduct } from "../hooks/useYetiProducts";

// Realistic Core v1 projection (fixture only; client code contains no prices).
const w = (start: string, end: string, duration_minutes: number, amount_chf: number, extra_person_chf: number | null,
  classification: "standard" | "office_exception" = "standard", window_kind: "exact" | "within" = "exact") =>
  ({ start, end, duration_minutes, amount_chf, extra_person_chf, classification, window_kind });
export const coreTariffs = {
  version: 1, purpose: "display_information_only", currency: "CHF", base_persons: 1,
  windows: [
    w("14:00", "16:00", 120, 190, 40), w("09:00", "10:00", 60, 75, 20), w("12:00", "13:00", 60, 75, 20),
    w("13:00", "14:00", 60, 75, 20), w("09:00", "11:00", 120, 160, 40), w("10:00", "12:00", 120, 190, 40),
    w("11:00", "13:00", 120, 160, 40), w("12:00", "14:00", 120, 150, 40), w("13:00", "15:00", 120, 160, 40),
    w("10:00", "12:00", 60, 85, 20, "office_exception", "within"), w("14:00", "16:00", 60, 85, 20, "office_exception", "within"),
  ],
};
export const coreRules = { version: 1, extra_person_basis: "per_window",
  discount: { percent: 10, threshold: 4, unit: "lessons", scope: "per_day" }, affects_operational_pricing: false };

const base = {
  id: "p", name: "Privat", title: "Privat", subtitle: "", type: "private", discipline: "ski", audience: null, icon_key: null,
  badge: null, requirement: null, meta: [], notes: [], pricing_type: "hourly", price: 0, price_tiers: [], duration_minutes: null,
  min_age: null, max_age: null, currency: "CHF", sort_order: 0, online_bookable: false,
  private_rates: [{ duration_minutes: 60, persons: 1, price: 75 }, { duration_minutes: 120, persons: 1, price: 170 },
    { duration_minutes: 120, persons: 2, price: 210 }, { duration_minutes: 180, persons: 1, price: 265 }],
} as YetiProduct;
const full = { ...base, public_private_time_tariffs: coreTariffs, public_private_tariff_rules: coreRules } as unknown as YetiProduct;

test("no generic 2h CHF 170 or flat 60-min rows, with or without time tariffs", () => {
  for (const p of [base, full]) {
    const data = productCardData(p);
    assert.equal(data.tariffs.some((r) => ["75", "170", "210"].includes(r.chf)), false);
    assert.deepEqual(data.tariffs.map((r) => [r.label, r.chf, r.group]), [["3 Stunden · 1 Person", "265", "Weitere Dauertarife"]]);
    assert.equal(data.bookable, false);
  }
  assert.equal(privateTariffView(base), null);
  assert.match(readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8"), /Preise nach Zeitfenster auf Anfrage/);
});
test("summary from Core array: ab CHF 75 and CHF 150–190", () => {
  assert.deepEqual(privateTariffView(full)!.summary, [
    { label: "Einzellektion 55 Min.", value: "ab CHF 75" }, { label: "Doppellektion 115 Min.", value: "CHF 150–190" },
  ]);
});
test("sorted standard bands; office exception as one-hour envelope, never a 2h row", () => {
  const v = privateTariffView(full)!;
  assert.deepEqual(v.groups.map((g) => [g.label, g.rows.map((r) => `${r.label} ${r.chf}`)]), [
    ["Einzellektionen (55 Min. Unterricht)", ["09:00–10:00 Uhr 75", "12:00–13:00 Uhr 75", "13:00–14:00 Uhr 75"]],
    ["Doppellektionen (115 Min. Unterricht)", ["09:00–11:00 Uhr 160", "10:00–12:00 Uhr 190", "11:00–13:00 Uhr 160",
      "12:00–14:00 Uhr 150", "13:00–15:00 Uhr 160", "14:00–16:00 Uhr 190"]],
    ["Ausnahme nach Absprache mit dem Skischulbüro", ["Innerhalb 10:00–12:00 / 14:00–16:00 Uhr, 55 Min. Unterricht 85"]],
  ]);
});
test("extra person per duration once, discount only when validated lessons rule", () => {
  assert.deepEqual(privateTariffView(full)!.footnotes, ["Zusatzperson 55 Min. CHF 20, 115 Min. CHF 40; ab 4 Lektionen am Tag 10 % Rabatt"]);
  for (const bad of [{ ...coreRules, discount: { ...coreRules.discount, unit: "minutes" } }, { ...coreRules, affects_operational_pricing: true },
    { ...coreRules, version: 2 }, null]) {
    assert.deepEqual(privateTariffView({ ...full, public_private_tariff_rules: bad } as never)!.footnotes, ["Zusatzperson 55 Min. CHF 20, 115 Min. CHF 40"]);
  }
});
test("invalid or absent envelope falls back to 'auf Anfrage' (null)", () => {
  for (const bad of [undefined, null, "x", { ...coreTariffs, version: 2 }, { ...coreTariffs, purpose: "pricing" },
    { ...coreTariffs, currency: "EUR" }, { ...coreTariffs, base_persons: 2 }, { ...coreTariffs, windows: [] },
    { ...coreTariffs, windows: [...coreTariffs.windows, w("10:00", "11:00", 120, 190, 40)] },
    { ...coreTariffs, windows: [w("10:00", "12:00", 60, 85, 20, "office_exception", "exact")] },
    { ...coreTariffs, windows: [w("09:00", "10:00", 60, 0, 20)] }]) {
    assert.equal(privateTariffView({ public_private_time_tariffs: bad }), null);
    assert.deepEqual(validTimeWindows(bad), []);
  }
});
test("two private cards (ski + snowboard) each project their own Core data", () => {
  const snow = { ...full, id: "s", discipline: "snowboard" } as YetiProduct;
  assert.deepEqual(privateTariffView(snow), privateTariffView(full));
  assert.equal(privateTariffView({ ...snow, public_private_time_tariffs: undefined }), null);
});
test("no season labels and no hardcoded prices in source", () => {
  const src = readFileSync(new URL("./privateTimeTariffs.ts", import.meta.url), "utf8").replace(/\/\*\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(src, /saison/i);
  assert.doesNotMatch(src, /CHF \d|\b(75|85|150|160|170|190)\b/);
  assert.doesNotMatch(JSON.stringify(privateTariffView(full)), /saison/i);
});
