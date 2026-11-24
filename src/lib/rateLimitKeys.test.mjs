import test from "node:test";
import assert from "node:assert/strict";
import { createEmailRateLimitKey, createIpRateLimitKey } from "./rateLimitKeys.mjs";

test("IP rate-limit keys are stable and do not expose the raw IP", () => {
  const ip = "203.0.113.42";
  const key = createIpRateLimitKey("login", ip);

  assert.equal(key, createIpRateLimitKey("login", ip));
  assert.ok(key.startsWith("login-ip:"));
  assert.equal(key.includes(ip), false);
  assert.match(key, /^login-ip:[a-f0-9]{64}$/);
});

test("customer and admin IP buckets use separate namespaces", () => {
  const ip = "203.0.113.42";

  assert.notEqual(
    createIpRateLimitKey("login", ip),
    createIpRateLimitKey("admin-login", ip),
  );
});

test("unknown or missing IPs do not create a shared bucket", () => {
  assert.equal(createIpRateLimitKey("login", "unknown"), null);
  assert.equal(createIpRateLimitKey("login", "  unknown  "), null);
  assert.equal(createIpRateLimitKey("login", ""), null);
  assert.equal(createIpRateLimitKey("login", null), null);
});

test("an empty namespace is rejected", () => {
  assert.throws(() => createIpRateLimitKey("", "203.0.113.42"));
});

test("email rate-limit keys are stable and do not expose the raw email", () => {
  const email = "Customer.Example@example.com";
  const key = createEmailRateLimitKey("login", email);

  assert.equal(key, createEmailRateLimitKey("login", email));
  assert.equal(key, createEmailRateLimitKey("login", " customer.example@EXAMPLE.com "));
  assert.ok(key.startsWith("login-email:"));
  assert.equal(key.includes(email), false);
  assert.match(key, /^login-email:[a-f0-9]{64}$/);
});

test("customer and admin email buckets use separate namespaces", () => {
  const email = "admin@example.com";

  assert.notEqual(
    createEmailRateLimitKey("login", email),
    createEmailRateLimitKey("admin-login", email),
  );
});

test("invalid email inputs and empty namespaces are rejected", () => {
  for (const email of ["", "  ", null, undefined, 42]) {
    assert.throws(() => createEmailRateLimitKey("login", email));
  }
  assert.throws(() => createEmailRateLimitKey("", "user@example.com"));
});
