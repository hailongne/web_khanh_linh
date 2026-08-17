type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const tracker = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tracker.entries()) {
      if (now > entry.resetTime) {
        tracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
  * Helper to extract client IP address from Next.js request headers
  */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
  * In-memory rate limiter check.
  * @param key Unique key e.g. `login:192.168.1.1`
  * @param limit Max allowed requests within windowMs
  * @param windowMs Time window in milliseconds (default 60000ms = 1 min)
  * @returns `{ success: boolean, remaining: number, resetInSeconds: number }`
  */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const entry = tracker.get(key);

  if (!entry || now > entry.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
  };
}
