import { prisma } from "@/lib/prisma";
import { getRateLimitDecision } from "@/lib/rateLimitPolicy.mjs";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_ATTEMPTS = 5;

type RateLimitRecord = {
  count: number;
  resetAt: Date;
};

export async function checkRateLimit(
  key: string,
  maxAttempts = DEFAULT_MAX_ATTEMPTS
): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts >= Number.MAX_SAFE_INTEGER) {
    throw new Error("maxAttempts must be a positive safe integer");
  }

  const now = new Date();
  const newResetAt = new Date(now.getTime() + WINDOW_MS);

  try {
    // A single atomic upsert prevents parallel requests from bypassing the limit.
    const records = await prisma.$queryRaw<RateLimitRecord[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${newResetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."resetAt" <= ${now} THEN 1
          ELSE LEAST("RateLimit"."count" + 1, ${maxAttempts + 1})
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" <= ${now} THEN ${newResetAt}
          ELSE "RateLimit"."resetAt"
        END
      RETURNING "count", "resetAt"
    `;

    const record = records[0];
    if (!record) throw new Error("Rate limit query returned no record");

    return getRateLimitDecision(
      record.count,
      maxAttempts,
      new Date(record.resetAt).getTime(),
      now.getTime(),
    );
  } catch (err) {
    console.error("Rate limit error:", err);
    // Fail closed for security-sensitive operations when rate limiting is unavailable.
    return { allowed: false, remaining: 0, resetIn: WINDOW_MS };
  }
}

export async function resetRateLimit(key: string) {
  try {
    await prisma.$executeRaw`
      DELETE FROM "RateLimit" WHERE "key" = ${key}
    `;
  } catch (err) {
    console.error("Reset rate limit error:", err);
  }
}
