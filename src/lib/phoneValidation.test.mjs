import test from "node:test";
import assert from "node:assert/strict";
import { isValidIndianMobile, normalizeIndianMobile } from "./phoneValidation.mjs";

test("accepts valid 10-digit Indian mobile numbers", () => {
  assert.equal(isValidIndianMobile("9876543210"), true);
  assert.equal(isValidIndianMobile("9123456789"), true);
});

test("accepts common +91 and formatted mobile-number inputs", () => {
  assert.equal(isValidIndianMobile("+91 98765 43210"), true);
  assert.equal(isValidIndianMobile("91-98765-43210"), true);
  assert.equal(isValidIndianMobile("+91 (98765) 43210"), true);
});

test("rejects invalid lengths, prefixes, and non-phone characters", () => {
  for (const value of [
    "987654321",
    "09876543210",
    "1234567890",
    "98765432100",
    "++++++++++",
    "call 9876543210",
    "",
  ]) {
    assert.equal(isValidIndianMobile(value), false, "unexpectedly accepted " + value);
  }
});

test("normalization preserves a 10-digit number that starts with 91", () => {
  assert.equal(normalizeIndianMobile("9123456789"), "9123456789");
  assert.equal(normalizeIndianMobile("+91 98765 43210"), "9876543210");
});
