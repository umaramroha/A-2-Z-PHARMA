import test from "node:test";
import assert from "node:assert/strict";
import { isSafeBannerLink } from "./bannerLink.mjs";

test("allows same-site relative paths, queries, and fragments", () => {
  for (const value of ["/products", "/products?category=general", "/#offers"]) {
    assert.equal(isSafeBannerLink(value), true, value);
  }
});

test("allows valid absolute HTTP and HTTPS links", () => {
  assert.equal(isSafeBannerLink("https://example.com/offers"), true);
  assert.equal(isSafeBannerLink("http://example.com/offers"), true);
});

test("rejects protocol-relative and backslash-based external redirects", () => {
  for (const value of ["//evil.example", "/\\evil.example", "/\\/evil.example"]) {
    assert.equal(isSafeBannerLink(value), false, value);
  }
});

test("rejects unsafe schemes and malformed absolute URLs", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,hello", "https://", "ftp://example.com"]) {
    assert.equal(isSafeBannerLink(value), false, value);
  }
});

test("accepts omitted optional links only", () => {
  assert.equal(isSafeBannerLink(undefined), true);
  assert.equal(isSafeBannerLink(null), true);
  assert.equal(isSafeBannerLink(""), false);
});
