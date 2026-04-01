import { get, set, invalidatePattern } from "@/lib/redis";

const CACHE_PREFIX = "tx:v2";
const DEFAULT_TTL_DAYS = 7;
const DETERMINISTIC_TTL_DAYS = 30; // Longer TTL for deterministic output

export type TranslationSource = "deterministic" | "llm" | "original";

interface CachedTranslation {
  text: string;
  source: TranslationSource;
}

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
): Promise<{ text: string | null; source: TranslationSource | null }> {
  const key = cacheKey(sourceLang, targetLang, text, context);
  try {
    const cached = await get(key);
    if (!cached || typeof cached !== "string") {
      return { text: null, source: null };
    }
    const parsed = JSON.parse(cached) as CachedTranslation;
    return { text: parsed.text, source: parsed.source };
  } catch {
    return { text: null, source: null };
  }
}

export async function getServerCachedBatch(
  sourceLang: string,
  targetLang: string,
  texts: string[],
  context?: string
): Promise<Array<{ text: string | null; source: TranslationSource | null }>> {
  return Promise.all(texts.map(t => getServerCached(sourceLang, targetLang, t, context)));
}

export async function setServerCached(
  sourceLang: string,
  targetLang: string,
  text: string,
  translated: string,
  context?: string,
  source: TranslationSource = "llm",
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<boolean> {
  const key = cacheKey(sourceLang, targetLang, text, context);
  const ttl = source === "deterministic" ? DETERMINISTIC_TTL_DAYS : ttlDays;
  const value: CachedTranslation = { text: translated, source };
  return set(key, JSON.stringify(value), ttl * 24 * 3600);
}

export async function setServerCachedBatch(
  sourceLang: string,
  targetLang: string,
  texts: string[],
  translations: string[],
  context?: string,
  source: TranslationSource = "llm",
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<number> {
  let count = 0;
  for (let i = 0; i < texts.length; i++) {
    if (await setServerCached(sourceLang, targetLang, texts[i], translations[i], context, source, ttlDays)) {
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
