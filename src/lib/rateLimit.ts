import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

type RateLimitRecord = {
  count: number;
  resetAt: Date;
};

export async function checkRateLimit(key: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  const now = new Date();
  const newResetAt = new Date(now.getTime() + WINDOW_MS);

  try {
    // A single atomic upsert prevents parallel requests from bypassing the limit.
    const records = await prisma.$queryRaw<RateLimitRecord[]>\`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (\${key}, 1, \${newResetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."resetAt" <= \${now} THEN 1
          ELSE LEAST("RateLimit"."count" + 1, \${MAX_ATTEMPTS + 1})
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" <= \${now} THEN \${newResetAt}
          ELSE "RateLimit"."resetAt"
        END
      RETURNING "count", "resetAt"
    \`;

    const record = records[0];
    if (!record) throw new Error("Rate limit query returned no record");

    const resetAt = new Date(record.resetAt);
    const resetIn = Math.max(0, resetAt.getTime() - now.getTime());
    const allowed = record.count <= MAX_ATTEMPTS;

    return {
      allowed,
      remaining: Math.max(0, MAX_ATTEMPTS - record.count),
      resetIn,
    };
  } catch (err) {
    console.error("Rate limit error:", err);
    // Fail closed for authentication and registration when rate limiting is unavailable.
    return { allowed: false, remaining: 0, resetIn: WINDOW_MS };
  }
}

export async function resetRateLimit(key: string) {
  try {
    await prisma.$executeRaw\`
      DELETE FROM "RateLimit" WHERE "key" = \${key}
    \`;
  } catch (err) {
    console.error("Reset rate limit error:", err);
  }
}
