/**
 * Pure rate-limit decision logic, kept separate from database I/O so the
 * threshold and reset boundary can be tested without a live database.
 */
export function getRateLimitDecision(count, maxAttempts, resetAtMs, nowMs) {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts >= Number.MAX_SAFE_INTEGER) {
    throw new RangeError("maxAttempts must be a positive safe integer below MAX_SAFE_INTEGER");
  }
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("count must be a positive safe integer");
  }
  if (!Number.isFinite(resetAtMs) || !Number.isFinite(nowMs)) {
    throw new RangeError("resetAtMs and nowMs must be finite timestamps");
  }

  return {
    allowed: count <= maxAttempts,
    remaining: Math.max(0, maxAttempts - count),
    resetIn: Math.max(0, resetAtMs - nowMs),
  };
}
