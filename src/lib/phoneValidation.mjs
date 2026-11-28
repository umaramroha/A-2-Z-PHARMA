/**
 * Normalize common Indian mobile-number formats without treating a valid
 * 10-digit number beginning with "91" as a country-code-prefixed number.
 */
export function normalizeIndianMobile(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || !/^[+0-9()\s-]+$/.test(trimmed)) return "";

  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;
}

/** @param {unknown} value */
export function isValidIndianMobile(value) {
  return typeof value === "string" && /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
}
