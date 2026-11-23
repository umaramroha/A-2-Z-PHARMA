/**
 * Resolve the caller IP using the hosting platform's trusted header.
 * Vercel provides x-vercel-forwarded-for and overwrites the ordinary
 * x-forwarded-for header to prevent client-supplied IP spoofing.
 *
 * Outside Vercel, x-real-ip is used only when the hosting proxy is configured
 * to set it. Unknown callers share a conservative fallback bucket.
 */
export function getClientIp(headers, isVercel = process.env.VERCEL === "1") {
  const vercelIp = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelIp && !vercelIp.includes(",")) return vercelIp;

  if (isVercel) return "unknown";

  const realIp = headers.get("x-real-ip")?.trim();
  return realIp && !realIp.includes(",") ? realIp : "unknown";
}
