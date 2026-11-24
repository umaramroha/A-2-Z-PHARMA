import test from "node:test";
import assert from "node:assert/strict";
import { parseProductListingParams } from "./productListing.mjs";

test("uses safe defaults and bounds the page size", () => {
  assert.deepEqual(parseProductListingParams(new URLSearchParams()), {
    category: null, q: null, page: 1, pageSize: 24,
    minPrice: null, maxPrice: null, sort: "default",
  });
  assert.equal(parseProductListingParams(new URLSearchParams("pageSize=49")), null);
});

test("parses category, search, price filters, pagination and sorting", () => {
  assert.deepEqual(parseProductListingParams(new URLSearchParams(
    "category=male-problems&q=herbal&page=2&pageSize=12&minPrice=300&maxPrice=500&sort=price-asc"
  )), {
    category: "male-problems", q: "herbal", page: 2, pageSize: 12,
    minPrice: 300, maxPrice: 500, sort: "price-asc",
  });
});

test("rejects malformed, excessive and contradictory query values", () => {
  for (const query of [
    "page=0", "page=-1", "page=1.5", "pageSize=999", "sort=unknown",
    "minPrice=-1", "maxPrice=Infinity", "minPrice=501&maxPrice=500",
    `q=${"x".repeat(101)}`, "minPrice=10000001",
  ]) assert.equal(parseProductListingParams(new URLSearchParams(query)), null, query);
});

test("allows a zero minimum price", () => {
  assert.equal(parseProductListingParams(new URLSearchParams("minPrice=0")).minPrice, 0);
});
