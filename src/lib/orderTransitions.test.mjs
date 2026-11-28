import test from "node:test";
import assert from "node:assert/strict";
import {
  VALID_PAYMENT_STATUSES,
  VALID_STATUSES,
  canTransitionPayment,
  canTransitionStatus,
  canSetPaymentStatusForOrder,
  canMoveOrderWithPayment,
} from "./orderTransitions.mjs";

test("order transitions preserve the existing forward-rank progression and cancellation rules", () => {
  // The existing predicate permits moving to any later non-cancelled rank,
  // including skipping intermediate stages. Cancellation is limited to the
  // first three statuses.
  const allowed = [
    ["PENDING", "CONFIRMED"],
    ["PENDING", "PROCESSING"],
    ["PENDING", "SHIPPED"],
    ["PENDING", "DELIVERED"],
    ["PENDING", "CANCELLED"],
    ["CONFIRMED", "PROCESSING"],
    ["CONFIRMED", "SHIPPED"],
    ["CONFIRMED", "DELIVERED"],
    ["CONFIRMED", "CANCELLED"],
    ["PROCESSING", "SHIPPED"],
    ["PROCESSING", "DELIVERED"],
    ["PROCESSING", "CANCELLED"],
    ["SHIPPED", "DELIVERED"],
  ];

  for (const current of VALID_STATUSES) {
    for (const next of VALID_STATUSES) {
      assert.equal(
        canTransitionStatus(current, next),
        allowed.some(([from, to]) => from === current && to === next),
        `unexpected order transition: ${current} -> ${next}`,
      );
    }
  }
});

test("payment transitions preserve the existing pending, failed, paid, and refunded path", () => {
  const allowed = [
    ["PENDING", "PAID"],
    ["PENDING", "FAILED"],
    ["FAILED", "PENDING"],
    ["PAID", "REFUNDED"],
  ];

  for (const current of VALID_PAYMENT_STATUSES) {
    for (const next of VALID_PAYMENT_STATUSES) {
      assert.equal(
        canTransitionPayment(current, next),
        allowed.some(([from, to]) => from === current && to === next),
        `unexpected payment transition: ${current} -> ${next}`,
      );
    }
  }
});

test("payment status must remain consistent with cancellation and payment method", () => {
  assert.equal(canSetPaymentStatusForOrder("CANCELLED", "upi", "PAID"), false);
  assert.equal(canSetPaymentStatusForOrder("PENDING", "cod", "FAILED"), false);
  assert.equal(canSetPaymentStatusForOrder("PENDING", "upi", "FAILED"), true);
  assert.equal(canSetPaymentStatusForOrder("PENDING", "cod", "PAID"), false);
  assert.equal(canSetPaymentStatusForOrder("PROCESSING", "cod", "PAID"), false);
  assert.equal(canSetPaymentStatusForOrder("DELIVERED", "cod", "PAID"), true);
  assert.equal(canSetPaymentStatusForOrder("PENDING", "upi", "REFUNDED"), false);
  assert.equal(canSetPaymentStatusForOrder("PROCESSING", "upi", "REFUNDED"), false);
  assert.equal(canSetPaymentStatusForOrder("CANCELLED", "upi", "REFUNDED"), true);
  assert.equal(canSetPaymentStatusForOrder("DELIVERED", "upi", "REFUNDED"), true);
  assert.equal(canSetPaymentStatusForOrder("DELIVERED", "cod", "REFUNDED"), true);
});


test("manual UPI must be paid before shipping or delivery; COD remains payable on delivery", () => {
  assert.equal(canMoveOrderWithPayment("SHIPPED", "upi", "PENDING"), false);
  assert.equal(canMoveOrderWithPayment("DELIVERED", "upi", "PENDING"), false);
  assert.equal(canMoveOrderWithPayment("SHIPPED", "upi", "FAILED"), false);
  assert.equal(canMoveOrderWithPayment("SHIPPED", "upi", "PAID"), true);
  assert.equal(canMoveOrderWithPayment("DELIVERED", "cod", "PENDING"), true);
  assert.equal(canMoveOrderWithPayment("PROCESSING", "upi", "PENDING"), true);
});
