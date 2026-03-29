import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not configured, caching disabled');
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis disconnected');
    });
  }

  return redisClient;
}

export async function get(key: string): Promise<unknown | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error({ error, key }, 'Redis GET failed');
    return null;
  }
}

export async function set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (error) {
    logger.error({ error, key }, 'Redis SET failed');
    return false;
  }
}

export async function del(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error({ error, key }, 'Redis DEL failed');
    return false;
  }
}

export async function invalidatePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    await client.del(...keys);
    return keys.length;
  } catch (error) {
    logger.error({ error, pattern }, 'Redis pattern delete failed');
    return 0;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
