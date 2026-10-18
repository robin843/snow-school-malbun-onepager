import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  VISIBLE_TARIFFS,
  privateFurtherTariffCount,
  tariffToggleVisible,
  visibleTariffCount,
} from "./tariffDisplay.ts";

const dayTiers = (n: number) =>
  Array.from({ length: n }, (_, i) => (i === 0 ? "1 Tag · 1 Person" : `${i + 1} Tage · 1 Person`));

test("three tariff rows are visible by default", () => {
  assert.equal(VISIBLE_TARIFFS, 3);
});

test("one to three tariffs show fully without any expand control", () => {
  for (const total of [1, 2, 3]) {
    assert.equal(tariffToggleVisible(total), false, `${total} tariffs`);
    assert.equal(visibleTariffCount(total, false), total, `${total} collapsed`);
    assert.equal(visibleTariffCount(total, true), total, `${total} expanded`);
  }
});

test("Windel-Wedel three day tiers are complete with no toggle", () => {
  const tiers = dayTiers(3);
  assert.equal(tariffToggleVisible(tiers.length), false);
  assert.deepEqual(tiers.slice(0, visibleTariffCount(tiers.length, false)), tiers);
});

test("four tariffs show the first three collapsed and all four expanded", () => {
  const tiers = dayTiers(4);
  assert.equal(tariffToggleVisible(tiers.length), true);
  assert.deepEqual(tiers.slice(0, visibleTariffCount(4, false)), dayTiers(3));
  assert.deepEqual(tiers.slice(0, visibleTariffCount(4, true)), tiers);
});

test("collapsing again returns to the first three rows", () => {
  assert.equal(visibleTariffCount(5, true), 5);
  assert.equal(visibleTariffCount(5, false), 3);
});

test("private cards keep the long Dauertarife list fully collapsed until expanded", () => {
  for (const total of [1, 3, 12]) {
    assert.equal(privateFurtherTariffCount(total, false), 0, `${total} collapsed`);
    assert.equal(privateFurtherTariffCount(total, true), total, `${total} expanded`);
  }
});

test("private card renders the 60/120-minute summary before the Dauertarife toggle", () => {
  const source = readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8");
  const summaryAt = source.indexOf('data-testid="private-time-summary"');
  const toggleAt = source.indexOf("Weitere Dauertarife anzeigen");
  assert.ok(summaryAt >= 0 && toggleAt >= 0);
  assert.ok(summaryAt < toggleAt, "summary must appear before the Dauertarife toggle");
});

test("card uses the shared rule instead of a local two-row default", () => {
  const source = readFileSync(new URL("../components/Kursuebersicht.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /VISIBLE_TARIFFS\s*=\s*2/);
  assert.match(source, /tariffDisplay/);
});
