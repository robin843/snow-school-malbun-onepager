import test from "node:test";
import assert from "node:assert/strict";
import { VISIBLE_TARIFFS, tariffToggleVisible, visibleTariffCount } from "./tariffDisplay.ts";

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

test("card uses the shared rule instead of a local two-row default", () => {
  const card = new URL("../components/Kursuebersicht.tsx", import.meta.url);
  const source = require("node:fs").readFileSync(card, "utf8") as string;
  assert.doesNotMatch(source, /VISIBLE_TARIFFS\s*=\s*2/);
  assert.match(source, /tariffDisplay/);
});
