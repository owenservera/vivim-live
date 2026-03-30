import { get, set, invalidatePattern } from "@/lib/redis";

const CACHE_PREFIX = "tx:v2";
const DEFAULT_TTL_DAYS = 7;

function cacheKey(sourceLang: string, targetLang: string, text: string, context?: string): string {
  const textHash = hashString(text);
  const contextHash = context ? hashString(context).slice(0, 8) : "default";
  return `${CACHE_PREFIX}:${sourceLang}:${targetLang}:${contextHash}:${textHash}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, "0");
}

export async function getServerCached(
  sourceLang: string,
  targetLang: string,
  text: string,
  context?: string
): Promise<string | null> {
  const key = cacheKey(sourceLang, targetLang, text, context);
  try {
    const cached = await get(key);
    return cached && typeof cached === "string" ? cached : null;
  } catch {
    return null;
  }
}

export async function getServerCachedBatch(
  sourceLang: string,
  targetLang: string,
  texts: string[],
  context?: string
): Promise<(string | null)[]> {
  return Promise.all(texts.map(t => getServerCached(sourceLang, targetLang, t, context)));
}

export async function setServerCached(
  sourceLang: string,
  targetLang: string,
  text: string,
  translated: string,
  context?: string,
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<boolean> {
  const key = cacheKey(sourceLang, targetLang, text, context);
  return set(key, translated, ttlDays * 24 * 3600);
}

export async function setServerCachedBatch(
  sourceLang: string,
  targetLang: string,
  texts: string[],
  translations: string[],
  context?: string,
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<number> {
  let count = 0;
  for (let i = 0; i < texts.length; i++) {
    if (await setServerCached(sourceLang, targetLang, texts[i], translations[i], context, ttlDays)) {
      count++;
    }
  }
  return count;
}

export async function invalidateLanguagePair(sourceLang: string, targetLang: string): Promise<number> {
  return invalidatePattern(`${CACHE_PREFIX}:${sourceLang}:${targetLang}:*`);
}

export async function invalidateAllTranslations(): Promise<number> {
  return invalidatePattern(`${CACHE_PREFIX}:*`);
}

export async function invalidateContext(context: string): Promise<number> {
  return invalidatePattern(`${CACHE_PREFIX}:*:${hashString(context).slice(0, 8)}:*`);
}
