import test from "node:test";
import assert from "node:assert/strict";
import { getClientIp } from "./clientIp.mjs";

test("prefers Vercel's canonical client IP over ordinary forwarded headers", () => {
  const headers = new Headers({
    "x-vercel-forwarded-for": "203.0.113.10",
    "x-forwarded-for": "198.51.100.99",
    "x-real-ip": "198.51.100.99",
  });

  assert.equal(getClientIp(headers, true), "203.0.113.10");
});

test("does not trust fallback headers on Vercel when its canonical header is absent", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.99",
    "x-real-ip": "198.51.100.99",
  });

  assert.equal(getClientIp(headers, true), "unknown");
});

test("uses the configured real-IP header outside Vercel", () => {
  const headers = new Headers({
    "x-real-ip": "203.0.113.20",
    "x-forwarded-for": "198.51.100.99",
  });

  assert.equal(getClientIp(headers, false), "203.0.113.20");
});

test("fails closed for missing or ambiguous IP headers", () => {
  assert.equal(getClientIp(new Headers(), true), "unknown");
  assert.equal(
    getClientIp(new Headers({ "x-vercel-forwarded-for": "203.0.113.1, 198.51.100.2" }), true),
    "unknown",
  );
});
