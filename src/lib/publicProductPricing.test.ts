import test from "node:test";
import assert from "node:assert/strict";
import { isOnlineBookable, computeProductTotal, type PricedProduct } from "./publicProductPricing.ts";

const privateProduct: PricedProduct = {
  type: "private", pricing_type: "fixed", online_bookable: true, price_tiers: [],
  private_rates: [
    { duration_minutes: 60, persons: 1, price: 75 },
    { duration_minutes: 60, persons: 2, price: 95 },
    { duration_minutes: 120, persons: 1, price: 170 },
    { duration_minutes: 120, persons: 2, price: 210 },
  ],
};
const groupProduct: PricedProduct = {
  type: "group", pricing_type: "tiered", online_bookable: true, private_rates: [],
  price_tiers: [
    { day_count: 1, cumulative_price: 70 },
    { day_count: 5, cumulative_price: 320 },
  ],
};

test("inactive online gate does not become bookable from a display price", () => {
  assert.equal(isOnlineBookable({ ...privateProduct, online_bookable: false }), false);
  assert.equal(computeProductTotal({ ...privateProduct, online_bookable: false },
    { days: 1, hoursPerDay: 1, participants: 1 }), 0);
});
test("private duration and participant count use exact source matrix", () => {
  assert.equal(computeProductTotal(privateProduct, { days: 1, hoursPerDay: 1, participants: 2 }), 95);
  assert.equal(computeProductTotal(privateProduct, { days: 1, hoursPerDay: 2, participants: 1 }), 170);
  assert.equal(computeProductTotal(privateProduct, { days: 1, hoursPerDay: 2, participants: 3 }), 0);
});
test("group cumulative tiers use exact day count only", () => {
  assert.equal(computeProductTotal(groupProduct, { days: 1, hoursPerDay: 2, participants: 2 }), 140);
  assert.equal(computeProductTotal(groupProduct, { days: 5, hoursPerDay: 4, participants: 1 }), 320);
  assert.equal(computeProductTotal(groupProduct, { days: 2, hoursPerDay: 2, participants: 1 }), 0);
  assert.equal(computeProductTotal(groupProduct, { days: 6, hoursPerDay: 2, participants: 1 }), 0);
});
