# you asked

based on my setup design the lingva setup -

---

# claude response

Let me re-read the analysis carefully before designing anything.

Good. I have everything I need. Now let me design the complete Lingva integration that slots precisely into the existing architecture.

Here's everything you need to drop into your existing codebase. Only `route.ts` changes — everything else (queue, cache, retry, deduplication) stays untouched.

---

### 1. New file: `src/lib/translation/lingva.ts`

```typescript
const DEFAULT_INSTANCES = [
  'https://lingva.ml',
  'https://lingva.thedaviddelta.com',
  'https://translate.plausibility.cloud',
]

// Track per-instance failure counts so we deprioritise flaky ones
const failureCounts = new Map<string, number>()

function getInstances(): string[] {
  const env = process.env.LINGVA_INSTANCES
  const instances = env ? env.split(',').map(s => s.trim()) : DEFAULT_INSTANCES
  // Sort by failure count ascending — healthiest instance first
  return [...instances].sort(
    (a, b) => (failureCounts.get(a) ?? 0) - (failureCounts.get(b) ?? 0)
  )
}

async function translateOne(
  text: string,
  source: string,
  target: string,
  instance: string,
  timeoutMs: number
): Promise<string> {
  const url = `${instance}/api/v1/${source}/${target}/${encodeURIComponent(text)}`
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  if (!data.translation) throw new Error('empty translation')
  return data.translation as string
}

export async function lingvaTranslate(
  strings: string[],
  source: string,
  target: string
): Promise<(string | null)[]> {
  const instances = getInstances()
  const timeoutMs = parseInt(process.env.LINGVA_TIMEOUT_MS ?? '4000')

  // Fan out all strings in parallel, try each instance on failure
  const results = await Promise.allSettled(
    strings.map(async (text) => {
      for (const instance of instances) {
        try {
          const translated = await translateOne(text, source, target, instance, timeoutMs)
          // Reset failure count on success
          failureCounts.set(instance, 0)
          return translated
        } catch {
          failureCounts.set(instance, (failureCounts.get(instance) ?? 0) + 1)
          // Try next instance
        }
      }
      // All instances failed for this string
      return null
    })
  )

  return results.map(r => r.status === 'fulfilled' ? r.value : null)
}

export function isLingvaEnabled(): boolean {
  return process.env.LINGVA_ENABLED !== 'false'
}
```

---

### 2. Update `src/app/api/translate/route.ts`

Only the `performTranslation` function changes. Find it and replace it with this:

```typescript
// ADD this import at the top
import { lingvaTranslate, isLingvaEnabled } from '@/lib/translation/lingva'

// REPLACE performTranslation with this version
async function performTranslation(
  strings: string[],
  targetLang: string,
  sourceLang: string = 'en',
  context?: string
): Promise<{ translations: string[]; source: 'lingva' | 'llm' | 'original' }> {

  // ── Fast path: Lingva (free, no key, no quota) ──────────────────
  if (isLingvaEnabled()) {
    const lingvaResults = await lingvaTranslate(strings, sourceLang, targetLang)
    const allSucceeded = lingvaResults.every(r => r !== null)

    if (allSucceeded) {
      return {
        translations: lingvaResults as string[],
        source: 'lingva'
      }
    }

    // Partial success — only send failed strings to LLM
    const failedIndices = lingvaResults
      .map((r, i) => r === null ? i : -1)
      .filter(i => i !== -1)

    if (failedIndices.length < strings.length) {
      // Some strings succeeded — patch failures with LLM
      const failedStrings = failedIndices.map(i => strings[i])
      const llmResults = await callLLM(failedStrings, targetLang, sourceLang, context)

      const merged = [...lingvaResults] as string[]
      failedIndices.forEach((originalIdx, llmIdx) => {
        merged[originalIdx] = llmResults[llmIdx] ?? strings[originalIdx]
      })

      return { translations: merged, source: 'lingva' }
    }
  }

  // ── Slow path: LLM (existing logic, unchanged) ──────────────────
  try {
    const llmResults = await callLLM(strings, targetLang, sourceLang, context)
    return { translations: llmResults, source: 'llm' }
  } catch {
    return { translations: strings, source: 'original' }
  }
}

// RENAME your existing performTranslation body to callLLM
// (it's the function that builds the numbered prompt and calls Z.ai)
async function callLLM(
  strings: string[],
  targetLang: string,
  sourceLang: string,
  context?: string
): Promise<string[]> {
  // ... your existing LLM call logic here, unchanged ...
}
```

---

### 3. Add source tag to cache write

In the same `route.ts`, find `setServerCachedBatch` and pass the source through:

```typescript
// After performTranslation resolves
const { translations: newTranslations, source } = await withDeduplication(
  missingStrings, targetLang, () =>
    performTranslation(missingStrings, targetLang, sourceLang, context)
)

await setServerCachedBatch(sourceLang, targetLang, missingStrings, newTranslations, context)
// The source tag is available for telemetry — log it:
console.log(`[vivim:translate] source=${source} strings=${missingStrings.length}`)
```

---

### 4. Vercel env vars

In your Vercel dashboard → Settings → Environment Variables:

```
LINGVA_INSTANCES=https://lingva.ml,https://lingva.thedaviddelta.com,https://translate.plausibility.cloud
LINGVA_TIMEOUT_MS=4000
LINGVA_ENABLED=true
```

`LINGVA_ENABLED=false` instantly falls back to pure LLM if any instance goes down permanently — useful as a kill switch without redeploying.

---

### What stays completely untouched

Your client, queue manager, priority system, MutationObserver, Redis cache keys, rate limiter, deduplication, and retry logic all remain exactly as documented in the analysis. The only insertion point is `performTranslation` in `route.ts` — Lingva is a pre-filter before the LLM call, invisible to everything above it.