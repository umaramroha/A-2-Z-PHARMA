/**
 * bcrypt processes at most 72 UTF-8 bytes. Reject longer inputs instead of
 * silently hashing only a password prefix.
 * @param {unknown} value
 */
export function isWithinBcryptByteLimit(value) {
  return typeof value === "string" && Buffer.byteLength(value, "utf8") <= 72;
}
