import { getRedisClient } from "@/lib/redis";

const DEFAULT_RATE_LIMIT = 20;
const DEFAULT_WINDOW_SECONDS = 60;

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
  keyPrefix: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: DEFAULT_RATE_LIMIT,
  windowSeconds: DEFAULT_WINDOW_SECONDS,
  keyPrefix: "tx:ratelimit",
};

export async function checkDistributedRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const redis = getRedisClient();

  if (!redis) {
    return {
      allowed: true,
      remaining: cfg.limit,
      resetAt: Date.now() + cfg.windowSeconds * 1000,
    };
  }

  const key = `${cfg.keyPrefix}:${identifier}`;
  const now = Date.now();

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, cfg.windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const resetAt = now + (ttl > 0 ? ttl * 1000 : cfg.windowSeconds * 1000);
    const remaining = Math.max(0, cfg.limit - current);

    return {
      allowed: current <= cfg.limit,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error("[rate-limit] Redis error, allowing request:", error);
    return {
      allowed: true,
      remaining: cfg.limit,
      resetAt: now + cfg.windowSeconds * 1000,
    };
  }
}

export async function getRateLimitStatus(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ count: number; limit: number; resetAt: number }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const redis = getRedisClient();

  if (!redis) {
    return { count: 0, limit: cfg.limit, resetAt: 0 };
  }

  const key = `${cfg.keyPrefix}:${identifier}`;
  const current = await redis.get(key);
  const ttl = await redis.ttl(key);

  return {
    count: current ? parseInt(current, 10) : 0,
    limit: cfg.limit,
    resetAt: ttl > 0 ? Date.now() + ttl * 1000 : 0,
  };
}

export async function resetRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const redis = getRedisClient();

  if (redis) {
    const key = `${cfg.keyPrefix}:${identifier}`;
    await redis.del(key);
  }
}
