// Simple in-memory rate limiter
// For production with multiple servers, use Redis or Vercel KV

type Attempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, Attempt>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetIn: WINDOW_MS,
    };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetAt - now,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    resetIn: record.resetAt - now,
  };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (value.resetAt < now) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
