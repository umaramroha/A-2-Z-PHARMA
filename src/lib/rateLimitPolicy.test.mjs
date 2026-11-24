import test from "node:test";
import assert from "node:assert/strict";
import { getRateLimitDecision } from "./rateLimitPolicy.mjs";

test("allows attempts below the threshold and reports remaining attempts", () => {
  assert.deepEqual(getRateLimitDecision(1, 5, 20_000, 10_000), {
    allowed: true,
    remaining: 4,
    resetIn: 10_000,
  });
  assert.deepEqual(getRateLimitDecision(5, 5, 20_000, 10_000), {
    allowed: true,
    remaining: 0,
    resetIn: 10_000,
  });
});

test("blocks the first attempt beyond the threshold without negative remaining", () => {
  assert.deepEqual(getRateLimitDecision(6, 5, 20_000, 10_000), {
    allowed: false,
    remaining: 0,
    resetIn: 10_000,
  });
});

test("never reports a negative reset delay after the window expires", () => {
  assert.deepEqual(getRateLimitDecision(1, 5, 9_000, 10_000), {
    allowed: true,
    remaining: 4,
    resetIn: 0,
  });
});

test("rejects invalid thresholds, counts, and timestamps", () => {
  for (const maxAttempts of [0, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => getRateLimitDecision(1, maxAttempts, 20_000, 10_000), RangeError);
  }
  for (const count of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => getRateLimitDecision(count, 5, 20_000, 10_000), RangeError);
  }
  assert.throws(() => getRateLimitDecision(1, 5, Number.NaN, 10_000), RangeError);
  assert.throws(() => getRateLimitDecision(1, 5, 20_000, Number.POSITIVE_INFINITY), RangeError);
});
