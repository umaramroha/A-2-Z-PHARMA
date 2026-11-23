export type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 413; error: string };

/**
 * Read and parse a JSON request body while enforcing an application-level
 * byte limit, including requests sent without a Content-Length header.
 */
export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<JsonBodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError("maxBytes must be a positive safe integer");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return { ok: false, status: 400, error: "Invalid request body" };
    }

    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength)) {
      return { ok: false, status: 400, error: "Invalid request body" };
    }
    if (declaredLength > maxBytes) {
      return { ok: false, status: 413, error: "Request body too large" };
    }
  }

  if (!request.body) {
    return { ok: false, status: 400, error: "Invalid request body" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // The request is already being rejected; cancellation is best effort.
        }
        return { ok: false, status: 413, error: "Request body too large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Invalid request body" };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // A cancelled or errored stream may already have released its lock.
    }
  }

  if (totalBytes === 0) {
    return { ok: false, status: 400, error: "Invalid request body" };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Invalid request body" };
  }
}
