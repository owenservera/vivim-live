const CACHE_NAME = "vivim-translations-v1";
const API_CACHE_NAME = "vivim-translation-api-v1";

const TRANSLATION_API = "/api/translate";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("vivim-"))
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PREFETCH_TRANSLATIONS") {
    const { strings, targetLang, context } = event.data;
    prefetchTranslations(strings, targetLang, context);
  }

  if (event.data && event.data.type === "CLEAR_TRANSLATION_CACHE") {
    clearTranslationCache();
  }
});

async function prefetchTranslations(strings, targetLang, context) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(TRANSLATION_API, self.location.origin);
    
    for (let i = 0; i < strings.length; i += 10) {
      const batch = strings.slice(i, i + 10);
      const body = JSON.stringify({
        strings: batch,
        targetLang,
        context,
      });

      const request = new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const response = await fetch(request);
      if (response.ok) {
        const data = await response.json();
        if (data.translations) {
          for (let j = 0; j < batch.length; j++) {
            const cacheKey = `tx:${targetLang}:${hashString(batch[j])}`;
            const cacheData = JSON.stringify({
              original: batch[j],
              translated: data.translations[j],
            });
            await cache.put(cacheKey, new Response(cacheData));
          }
        }
      }
    }
  } catch (error) {
    console.log("[translation-sw] Prefetch failed:", error);
  }
}

async function clearTranslationCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith("vivim-translation"))
      .map((name) => caches.delete(name))
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes(TRANSLATION_API) && event.request.method === "POST") {
    event.respondWith(handleTranslationRequest(event.request));
    return;
  }
});

async function handleTranslationRequest(request) {
  const url = new URL(request.url);
  
  try {
    const response = await fetch(request.clone());
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-translations") {
    event.waitUntil(syncPendingTranslations());
  }
});

async function syncPendingTranslations() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  for (const request of requests) {
    if (request.url.includes(TRANSLATION_API)) {
      try {
        await fetch(request);
      } catch {}
    }
  }
}
