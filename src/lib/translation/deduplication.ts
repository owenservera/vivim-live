import { getRedisClient } from "@/lib/redis";

const DEDUP_PREFIX = "tx:dedup";
const DEDUP_LOCK_TTL = 30;
const POLL_INTERVAL_MS = 100;
const MAX_POLLS = 10;

function generateBatchKey(strings: string[], targetLang: string): string {
  const content = strings.join("|");
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash = hash & hash;
  }
  return `${DEDUP_PREFIX}:${targetLang}:${Math.abs(hash).toString(36)}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface DedupeResult<T> {
  wasTranslated: boolean;
  result: T;
}

export async function withDeduplication<T>(
  strings: string[],
  targetLang: string,
  translateFn: () => Promise<T>
): Promise<DedupeResult<T>> {
  const redis = getRedisClient();
  const batchKey = generateBatchKey(strings, targetLang);

  if (!redis) {
    const result = await translateFn();
    return { wasTranslated: true, result };
  }

  try {
    const lockKey = `${batchKey}:lock`;
    const lockAcquired = await redis.set(lockKey, "1", "NX", "EX", DEDUP_LOCK_TTL);

    if (lockAcquired) {
      const result = await translateFn();
      await redis.del(lockKey);
      return { wasTranslated: true, result };
    }

    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS);
      const isStillLocked = await redis.get(lockKey);
      if (!isStillLocked) {
        break;
      }
    }

    const result = await translateFn();
    return { wasTranslated: false, result };
  } catch (error) {
    const lockKey = `${batchKey}:lock`;
    await redis.del(lockKey).catch(() => {});
    throw error;
  }
}
