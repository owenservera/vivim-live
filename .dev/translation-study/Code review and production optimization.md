# you asked

design the deterministic servie that is free

---

# claude response

Here's my read of what's needed: a deterministic, free translation layer that sits between the client and the LLM, acting as the primary engine. The best free option is **LibreTranslate** (self-hosted, MIT license) combined with client-side **Lingva** or the browser's native `navigator.languages`. Let me design this properly.

Here's the full design.

---

## The deterministic service

The core idea: **LibreTranslate** runs as a sidecar container. It's MIT-licensed, entirely self-hosted, and uses Argos Translate models under the hood — offline, no API keys, no rate limits, no cost. It becomes the primary engine. The LLM drops to a true last resort for unsupported language pairs only.

---

### Architecture decisions

**LibreTranslate as the engine, not a fallback.** For the 10 supported languages (en, es, zh, fr, de, pt, ja, ar, ru, ko), every pair has an Argos model. P95 latency on modest hardware is 80–150ms for a 30-string batch — faster than any LLM call. The LLM only fires when someone requests, say, Swahili or Welsh.

**Source tagging on every cached entry.** The Redis key stores which engine produced the translation: `deterministic`, `llm`, or `original`. This is how you build the quality matrix from the critique — you can query "what % of our `zh` cache was served by LibreTranslate vs the LLM" and act on it.

**Quality gate before caching.** After LibreTranslate responds, run the same validation the current system applies to LLM output: length-ratio check, charset contamination, placeholder roundtrip. If it fails, the translation escalates to LLM. If LLM also fails, original text is returned and tagged accordingly — never silently dropped.

---

### Implementation: the new `route.ts` flow

```typescript
// Priority order
async function translate(strings, targetLang, sourceLang, context) {

  // 1. Redis cache (TTL extended to 30 days — deterministic output is stable)
  const cached = await getServerCachedBatch(sourceLang, targetLang, strings)
  if (allHit(cached)) return cached

  const missing = getMissing(cached, strings)

  // 2. LibreTranslate — fast, free, deterministic
  let results = await libreTranslate(missing, sourceLang, targetLang)
  let source = 'deterministic'

  // 3. Quality gate
  const failed = results.filter(r => !passesQualityGate(r))
  if (failed.length > 0) {
    // 4. LLM only for failures
    const llmResults = await llmTranslate(failed, targetLang, context)
    results = merge(results, llmResults)
    source = 'mixed'
  }

  // 5. Cache with source tag
  await setServerCachedBatch(sourceLang, targetLang, strings, results, { source, ttlDays: 30 })

  return results
}
```

### `libreTranslate()` implementation

```typescript
const LIBRE_URL = process.env.LIBRETRANSLATE_URL ?? 'http://localhost:5000'

async function libreTranslate(
  strings: string[],
  source: string,
  target: string
): Promise<string[]> {
  
  // LibreTranslate only does one string per call natively,
  // so we fan out in parallel (it handles concurrency well)
  const results = await Promise.allSettled(
    strings.map(text =>
      fetchWithRetry(`${LIBRE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source, target, format: 'text' }),
        signal: AbortSignal.timeout(3000) // 3s hard timeout
      }).then(r => r.json()).then(r => r.translatedText as string)
    )
  )

  // Any rejected promise falls back to null → escalates to LLM
  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : null
  )
}
```

**Why fan-out instead of one batch call?** LibreTranslate's `/translate` endpoint is per-string, but it handles concurrent requests efficiently. Fanning 30 strings in parallel on a local socket takes ~100ms total. A future version could use the `/batch` endpoint once it stabilises.

---

### Deployment: one Docker command

```bash
# Minimal — loads all default language models (~2 GB RAM)
docker run -d \
  --name libretranslate \
  -p 5000:5000 \
  -e LT_LOAD_ONLY="en,es,zh,fr,de,pt,ja,ar,ru,ko" \
  libretranslate/libretranslate

# Add to docker-compose.yml alongside your Next.js app
# Zero external traffic after startup model download
```

With `LT_LOAD_ONLY` set, only models for the 10 supported languages load — RAM drops to ~800 MB. The service is ready in ~15 seconds after container start.

---

### What changes in the existing system

The cache TTL jumps from 7 days to 30 days — deterministic output doesn't drift, so you can safely cache longer. The rate limiter for the translation endpoint no longer needs to gate on LLM quota, so it can be loosened significantly (the LibreTranslate path is cheap). The `meta.source` field in the API response now carries `"deterministic" | "llm" | "original"`, which the existing telemetry system can start tracking immediately to build the quality matrix.

The LLM prompt, retry logic, and deduplication logic remain intact — they just fire far less often.