import test from "node:test";
import assert from "node:assert/strict";
import { VALID_PAYMENT_STATUSES, VALID_STATUSES, canTransitionPayment, canTransitionStatus } from "./orderTransitions.mjs";

test("order transitions preserve the existing forward path and permitted cancellation", () => {
  const allowed = [["PENDING","CONFIRMED"],["PENDING","CANCELLED"],["CONFIRMED","PROCESSING"],["CONFIRMED","CANCELLED"],["PROCESSING","SHIPPED"],["PROCESSING","CANCELLED"],["SHIPPED","DELIVERED"]];
  for (const current of VALID_STATUSES) for (const next of VALID_STATUSES) {
    assert.equal(canTransitionStatus(current,next),allowed.some(([from,to])=>from===current&&to===next),`unexpected order transition: ${current} -> ${next}`);
  }
});

test("payment transitions preserve the existing pending, failed, paid, and refunded path", () => {
  const allowed = [["PENDING","PAID"],["PENDING","FAILED"],["FAILED","PENDING"],["PAID","REFUNDED"]];
  for (const current of VALID_PAYMENT_STATUSES) for (const next of VALID_PAYMENT_STATUSES) {
    assert.equal(canTransitionPayment(current,next),allowed.some(([from,to])=>from===current&&to===next),`unexpected payment transition: ${current} -> ${next}`);
  }
});
