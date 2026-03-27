const CACHE_PREFIX = "vivim_tx_";
const CACHE_VERSION = "v1";

function cacheKey(lang: string, text: string): string {
  const hash = btoa(encodeURIComponent(text)).slice(0, 32);
  return `${CACHE_PREFIX}${CACHE_VERSION}_${lang}_${hash}`;
}

export function getCached(lang: string, text: string): string | null {
  try {
    return sessionStorage.getItem(cacheKey(lang, text));
  } catch {
    return null;
  }
}

export function setCached(lang: string, text: string, translated: string): void {
  try {
    sessionStorage.setItem(cacheKey(lang, text), translated);
  } catch {
    // Storage full — no-op
  }
}

export function getCachedBatch(lang: string, texts: string[]): (string | null)[] {
  return texts.map((t) => getCached(lang, t));
}

export function setCachedBatch(lang: string, texts: string[], translated: string[]): void {
  texts.forEach((t, i) => {
    if (translated[i]) {
      setCached(lang, t, translated[i]);
    }
  });
}
