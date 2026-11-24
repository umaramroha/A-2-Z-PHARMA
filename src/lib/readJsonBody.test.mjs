import test from "node:test";
import assert from "node:assert/strict";
import { readJsonBody } from "./readJsonBody.ts";

const invalid = { ok: false, status: 400, error: "Invalid request body" };
const tooLarge = { ok: false, status: 413, error: "Request body too large" };

function streamRequest(chunks, headers = {}) {
  return new Request("https://example.test/api", {
    method: "POST",
    headers,
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    duplex: "half",
  });
}

test("parses valid JSON and preserves structured data", async () => {
  const result = await readJsonBody(
    new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "A-2-Z", quantity: 2 }),
    }),
    1024,
  );
  assert.deepEqual(result, { ok: true, data: { name: "A-2-Z", quantity: 2 } });
});

test("accepts a body exactly at the byte limit", async () => {
  const body = JSON.stringify({ ok: true });
  assert.deepEqual(
    await readJsonBody(
      new Request("https://example.test/api", { method: "POST", body }),
      new TextEncoder().encode(body).byteLength,
    ),
    { ok: true, data: { ok: true } },
  );
});

test("rejects a declared Content-Length above the limit before reading", async () => {
  const result = await readJsonBody(
    new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-length": "100" },
      body: "x".repeat(100),
    }),
    10,
  );
  assert.deepEqual(result, tooLarge);
});

test("rejects invalid and unsafe Content-Length values", async () => {
  for (const contentLength of ["-1", "1.5", "1e3", "9007199254740992"]) {
    const result = await readJsonBody(
      new Request("https://example.test/api", {
        method: "POST",
        headers: { "content-length": contentLength },
        body: "{}",
      }),
      10,
    );
    assert.deepEqual(result, invalid, contentLength);
  }
});

test("counts streamed bytes when Content-Length is absent", async () => {
  const result = await readJsonBody(
    streamRequest([
      new TextEncoder().encode('{"value":'),
      new TextEncoder().encode('"a very long value"}'),
    ]),
    10,
  );
  assert.deepEqual(result, tooLarge);
});

test("rejects empty and malformed JSON bodies", async () => {
  const empty = await readJsonBody(
    new Request("https://example.test/api", { method: "POST", body: "" }),
    10,
  );
  const malformed = await readJsonBody(
    new Request("https://example.test/api", { method: "POST", body: "{" }),
    10,
  );
  assert.deepEqual(empty, invalid);
  assert.deepEqual(malformed, invalid);
});

test("rejects invalid UTF-8 instead of silently replacing bytes", async () => {
  const result = await readJsonBody(
    streamRequest([new Uint8Array([0xc3, 0x28])]),
    10,
  );
  assert.deepEqual(result, invalid);
});

test("rejects a stream that errors while being read", async () => {
  const result = await readJsonBody(
    new Request("https://example.test/api", {
      method: "POST",
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("{"));
          controller.error(new Error("stream failed"));
        },
      }),
      duplex: "half",
    }),
    10,
  );
  assert.deepEqual(result, invalid);
});

test("rejects invalid application byte limits", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    body: "{}",
  });
  for (const maxBytes of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(readJsonBody(request.clone(), maxBytes), RangeError);
  }
});
