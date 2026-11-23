import test from "node:test";
import assert from "node:assert/strict";
import { calculateDeliveryFee, deliveryConfig } from "./deliveryRules.mjs";

test("delivery pricing keeps the configured fee below the free-delivery threshold", () => {
  for (const subtotal of [0, 1, 499, "499.00", "499.99", "499.999"]) {
    assert.equal(
      calculateDeliveryFee(subtotal),
      50,
      `expected delivery fee below threshold for subtotal ${subtotal}`,
    );
  }
});

test("delivery becomes free at and above the configured threshold", () => {
  for (const subtotal of [500, "500.00", "500.01", 750, "1000000.99"]) {
    assert.equal(
      calculateDeliveryFee(subtotal),
      0,
      `expected free delivery at/above threshold for subtotal ${subtotal}`,
    );
  }
});

test("delivery pricing rejects invalid or negative subtotals", () => {
  for (const subtotal of [-1, "-0.01", "₹500", "500,00", "NaN", ""]) {
    assert.throws(() => calculateDeliveryFee(subtotal), TypeError);
  }
});

test("shared delivery configuration retains the existing business values", () => {
  assert.deepEqual(deliveryConfig, { fee: 50, freeAbove: 500 });
});
