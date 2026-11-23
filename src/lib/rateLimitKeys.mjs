import { createHash } from "node:crypto";

/**
 * Build a privacy-preserving IP bucket key. Unknown IPs are deliberately
 * skipped so unrelated visitors are not grouped into one shared bucket.
 */
export function createIpRateLimitKey(namespace, ip) {
  if (typeof namespace !== "string" || !namespace.trim()) {
    throw new Error("A rate-limit namespace is required");
  }

  if (typeof ip !== "string" || !ip.trim() || ip === "unknown") {
    return null;
  }

  const digest = createHash("sha256").update(ip.trim()).digest("hex");
  return `${namespace.trim()}-ip:${digest}`;
}
