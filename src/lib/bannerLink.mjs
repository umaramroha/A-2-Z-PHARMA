export function isSafeBannerLink(value) {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string" || value.length === 0) return false;

  if (value.startsWith("/")) {
    if (value.startsWith("//") || value.includes("\\")) return false;
    try {
      return new URL(value, "https://a2z.invalid").origin === "https://a2z.invalid";
    } catch {
      return false;
    }
  }

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}
