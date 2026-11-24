import { createHash } from "node:crypto";

/**
 * Build a deterministic, pseudonymized per-email bucket key.
 * Email addresses are normalized before hashing so case/spacing variants
 * cannot create separate authentication buckets.
 */
export function createEmailRateLimitKey(namespace, email) {
  if (typeof namespace !== "string" || !namespace.trim()) {
    throw new Error("A rate-limit namespace is required");
  }
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("A valid email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const digest = createHash("sha256").update(normalizedEmail).digest("hex");
  return `${namespace.trim()}-email:${digest}`;
}

/**
 * Build a privacy-preserving IP bucket key. Unknown IPs are deliberately
 * skipped so unrelated visitors are not grouped into one shared bucket.
 */
export function createIpRateLimitKey(namespace, ip) {
  if (typeof namespace !== "string" || !namespace.trim()) {
    throw new Error("A rate-limit namespace is required");
  }

  if (typeof ip !== "string") return null;

  const normalizedIp = ip.trim();
  if (!normalizedIp || normalizedIp === "unknown") return null;

  const digest = createHash("sha256").update(normalizedIp).digest("hex");
  return `${namespace.trim()}-ip:${digest}`;
}
