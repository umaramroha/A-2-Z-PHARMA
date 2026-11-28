import test from "node:test";
import assert from "node:assert/strict";
import { isWithinBcryptByteLimit } from "./passwordPolicy.mjs";

test("accepts passwords up to 72 UTF-8 bytes", () => {
  assert.equal(isWithinBcryptByteLimit("a".repeat(72)), true);
  assert.equal(isWithinBcryptByteLimit("😀".repeat(18)), true);
});

test("rejects passwords exceeding 72 UTF-8 bytes", () => {
  assert.equal(isWithinBcryptByteLimit("a".repeat(73)), false);
  assert.equal(isWithinBcryptByteLimit("😀".repeat(19)), false);
  assert.equal(isWithinBcryptByteLimit(null), false);
});
