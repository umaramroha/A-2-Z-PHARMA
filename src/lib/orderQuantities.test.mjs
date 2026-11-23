import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateOrderItems,
  hasExcessOrderQuantity,
} from "./orderQuantities.mjs";

test("aggregates duplicate product IDs into one quantity", () => {
  assert.deepEqual(
    aggregateOrderItems([
      { id: "product-a", quantity: 2 },
      { id: "product-a", quantity: 3 },
      { id: "product-b", quantity: 1 },
    ]),
    [["product-a", 5], ["product-b", 1]],
  );
});

test("preserves first-seen product order and does not mutate input", () => {
  const items = [
    { id: "product-b", quantity: 4 },
    { id: "product-a", quantity: 2 },
    { id: "product-b", quantity: 1 },
  ];
  const original = structuredClone(items);

  assert.deepEqual(aggregateOrderItems(items), [
    ["product-b", 5],
    ["product-a", 2],
  ]);
  assert.deepEqual(items, original);
});

test("keeps exactly 100 units within the existing per-product limit", () => {
  const quantities = aggregateOrderItems([
    { id: "product-a", quantity: 60 },
    { id: "product-a", quantity: 40 },
  ]);

  assert.equal(hasExcessOrderQuantity(quantities), false);
});

test("rejects aggregated quantities above 100", () => {
  const quantities = aggregateOrderItems([
    { id: "product-a", quantity: 100 },
    { id: "product-a", quantity: 1 },
  ]);

  assert.equal(hasExcessOrderQuantity(quantities), true);
});

test("checks each product independently", () => {
  const quantities = aggregateOrderItems([
    { id: "product-a", quantity: 60 },
    { id: "product-b", quantity: 60 },
  ]);

  assert.equal(hasExcessOrderQuantity(quantities), false);
});
