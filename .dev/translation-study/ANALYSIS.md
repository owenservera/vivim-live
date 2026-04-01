# 🌐 Vivim Translation Service — Complete Technical Analysis

> Comprehensive study of the LLM-powered runtime translation system
> Version: 2-days-ago snapshot
> Model: Z.ai glm-4.7-flash

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Complete Loading Sequence](#complete-loading-sequence)
4. [Client-Side Components](#client-side-components)
5. [Server-Side Components](#server-side-components)
6. [Data Structures & Types](#data-structures--types)
7. [Configuration & Environment](#configuration--environment)
8. [Edge Cases & Handling](#edge-cases--handling)
9. [Performance & Optimization](#performance--optimization)
10. [File Inventory](#file-inventory)

---

## Executive Summary

The Vivim translation service is a **runtime, client-side translation system** that uses LLM (Z.ai glm-4.7-flash) to translate web page content in the browser. Unlike traditional i18n approaches that require pre-translated content, this system:

- **Harvests** text nodes directly from the DOM
- **Prioritizes** content based on viewport position and element hierarchy
- **Batches** translation requests (up to 30 strings per API call)
- **Caches** translations at two levels (sessionStorage + Redis)
- **Handles** dynamic/SPA content via MutationObserver
- **Detects** language automatically via multi-signal detection

**Key Stats:**
- Supported languages: 10 (en, es, zh, fr, de, pt, ja, ar, ru, ko)
- Max batch size: 30 strings
- Default workers: 3 parallel
- Cache TTL: 7 days (server)
- Rate limit: 20 req/min per IP

---

## System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (CLIENT)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    LANGUAGE DETECTION LAYER                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │   │
│  │  │Explicit  │ │   URL    │ │   Geo    │ │ Browser  │ │ History │  │   │
│  │  │(100%)    │ │ (95%)    │ │ (70%)    │ │  (50%)   │ │  (30%)  │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘  │   │
│  │       └───────────┴────────────┴────────────┴────────────┘        │   │
│  │                               │                                    │   │
│  │                               ▼                                    │   │
│  │                    Multi-Signal Resolver                          │   │
│  └───────────────────────────────┬────────────────────────────────────┘   │
│                                  │                                         │
│                                  ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                      DOM HARVESTER                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  MutationObserver (SPA-safe, watches childList + subtree)  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                    │   │
│  │                               ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  TreeWalker → Text Node Filter → Priority Calculator       │   │   │
│  │  │  - Skip: script, style, noscript, code, pre                │   │   │
│  │  │  - Skip: [data-notranslate], [contenteditable]             │   │   │
│  │  │  - Skip: input, textarea                                   │   │   │
│  │  │  - Skip: already translated (data-tx-done)               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────┬────────────────────────────────────┘   │
│                                  │                                         │
│                                  ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    PRIORITY CALCULATOR                            │   │
│  │                                                                     │   │
│  │  Priority = Base (element type) - ViewportBoost + AgeBoost       │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ ELEMENT TYPE PRIORITIES (lower = higher priority)          │   │   │
│  │  │  1  - Navigation (nav, .navbar, [role='navigation'])        │   │   │
│  │  │  2  - Header/Hero                                           │   │   │
│  │  │  3  - h1 (above-fold)                                       │   │   │
│  │  │  4  - h2 (above-fold)                                       │   │   │
│  │  │  5  - Button/CTA (above-fold)                               │   │   │
│  │  │  6  - Link (above-fold)                                     │   │   │
│  │  │  11 - Paragraph (above-fold)                               │   │   │
│  │  │  12 - Section heading                                       │   │   │
│  │  │  21 - Below-fold paragraph                                  │   │   │
│  │  │  25 - Footer content                                        │   │   │
│  │  │  31 - Accordion/lazy-loaded                                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ViewportBoost: +5 for above-fold content                         │   │
│  │  AgeBoost: prevents starvation (older jobs get priority)         │   │
│  └───────────────────────────────┬────────────────────────────────────┘   │
│                                  │                                         │
│                                  ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    QUEUE MANAGER (Priority Queue)                │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              MIN-HEAP PRIORITY QUEUE                        │   │   │
│  │  │  - O(log n) insert                                          │   │   │
│  │  │  - O(log n) extract-min                                     │   │   │
│  │  │  - O(1) peek                                                │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                    │   │
│  │                               ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              WORKER POOL (3 workers)                       │   │   │
│  │  │  Worker 1 → CRITICAL jobs (priority 0-10)                  │   │   │
│  │  │  Worker 2 → HIGH jobs (priority 11-20)                     │   │   │
│  │  │  Worker 3 → NORMAL/LOW jobs (priority 21+)                  │   │   │
│  │  │  Batch delay: 50ms (gathers more jobs)                    │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────┬────────────────────────────────────┘   │
│                                  │                                         │
│            ┌─────────────────────┼─────────────────────┐               │
│            │                     │                     │                   │
│            ▼                     ▼                     ▼                   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐        │
│  │   CLIENT CACHE  │   │  API TRANSLATE  │   │   TELEMETRY     │        │
│  │ (sessionStorage)│   │  (/api/translate)│   │   (batched)     │        │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘        │
│           │                     │                     │                   │
└───────────┼─────────────────────┼─────────────────────┼──────────────────┘
            │                     │                     │
            │          ┌──────────┴──────────┐          │
            │          ▼                     ▼          │
            │   ┌──────────────┐    ┌──────────────┐   │
            │   │    RATE      │    │   SERVER     │   │
            │   │   LIMITER    │    │    CACHE     │   │
            │   │   (Redis)    │    │   (Redis)    │   │
            │   └──────────────┘    └──────┬───────┘   │
            │                               │           │
            │                               ▼           │
            │                   ┌─────────────────────┐ │
            │                   │   DEDUPLICATION     │ │
            │                   │   (Redis lock)      │ │
            │                   └──────────┬──────────┘ │
            │                              │            │
            │                              ▼            │
            │                   ┌─────────────────────┐ │
            │                   │   RETRY (exponential│ │
            │                   │   backoff)          │ │
            │                   └──────────┬──────────┘ │
            │                              │            │
            │                              ▼            │
            │                   ┌─────────────────────┐ │
            │                   │   LLM (Z.ai glm-4)  │ │
            │                   │   /chat/completions │ │
            │                   └─────────────────────┘ │
            │                                                │
            └───────────────────────────────────────────────┘
                            SERVER (Next.js API)
```

---

## Complete Loading Sequence

### Phase 1: Initialization (Page Load)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1.1 LANGUAGE DETECTION                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ initAutoDetect() → detectLanguageMultiSignal()                              │
│                                                                             │
│ Step 1: Get Detection Signals (in parallel)                                 │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ Signal Source      │ Method                      │ Confidence      │     │
│ ├───────────────────┼──────────────────────────────┼─────────────────┤     │
│ │ Explicit          │ localStorage.getItem("vivim_lang") │ 100%        │     │
│ │ URL Path          │ window.location.pathname.match()│ 95%          │     │
│ │ Geolocation       │ ip-api.com (cached 24h)        │ 70%           │     │
│ │ Browser           │ navigator.language (split "-") │ 50%           │     │
│ │ History           │ localStorage vivim_lang_history│ 30%           │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│ Step 2: Resolve to Single Language                                          │
│ - Signals sorted by confidence (descending)                                 │
│ - Top signal wins                                                           │
│ - Stored in history (last 5 languages)                                      │
│                                                                             │
│ Step 3: Auto-Translate if not English                                       │
│ - If detected !== "en" → translatePage(detected)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1.2 MUTATION OBSERVER SETUP                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ startObserver(getLang) → new MutationObserver()                            │
│                                                                             │
│ Configuration:                                                               │
│ - observe: document.body                                                    │
│ - options: { childList: true, subtree: true }                              │
│ - debounce: 300ms (to batch rapid DOM changes)                             │
│                                                                             │
│ Flow:                                                                        │
│ 1. Mutation detected                                                        │
│ 2. Check: lang !== _currentLang && lang !== "en"                           │
│ 3. Debounce 300ms                                                           │
│ 4. translatePage(lang, newNode)                                            │
│                                                                             │
│ Purpose: Handle SPA navigation, lazy-loaded content, modals, etc.          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Translation Execution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2.1 DOM TEXT NODE HARVESTING                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ harvestTextNodesWithPriority(root) → PriorityJob[]                         │
│                                                                             │
│ TreeWalker Configuration:                                                   │
│ - whatToShow: NodeFilter.SHOW_TEXT                                          │
│ - filter: acceptNode() callback                                             │
│                                                                             │
│ Skip Conditions (FILTER_REJECT):                                            │
│ ✗ No parent element                                                         │
│ ✗ Matches skipSelectors:                                                   │
│   - script, style, noscript, code, pre                                     │
│   - [data-notranslate], [contenteditable]                                  │
│   - input, textarea                                                        │
│ ✗ Text too short (< 2 chars)                                               │
│ ✗ Already translated (parent.dataset.txDone === "1")                      │
│                                                                             │
│ For each accepted node:                                                     │
│ 1. Get parent element                                                       │
│ 2. Calculate priority from element type                                    │
│ 3. Get boundingClientRect() for viewport position                         │
│ 4. Create PriorityJob { node, original, priority, boundingBox }          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2.2 PRIORITY CALCULATION                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ computePriority(element, viewportPosition, textLength) → number          │
│                                                                             │
│ Algorithm:                                                                   │
│                                                                             │
│   basePriority = 20 (default)                                              │
│                                                                             │
│   // Element-based priority                                                │
│   for selector in PRIORITY_SELECTORS_V2:                                   │
│     if element.matches(selector) or element.closest(selector):           │
│       basePriority = selector.priority                                     │
│       break                                                                 │
│                                                                             │
│   // Viewport boost (above-fold gets higher priority = lower number)       │
│   if viewportPosition !== undefined:                                      │
│     viewportHeight = window.innerHeight                                    │
│     if viewportPosition < viewportHeight:                                │
│       basePriority = max(1, basePriority - viewportBoost)               │
│                                                                             │
│   // Age boost (prevents starvation)                                        │
│   ageBoost = floor(now / 10000) * ageWeight                               │
│   basePriority = max(1, basePriority - ageBoost)                          │
│                                                                             │
│   return clamp(basePriority, 1, 100)                                       │
│                                                                             │
│ Priority to JobPriority mapping:                                            │
│ - 0-10   → JobPriority.CRITICAL                                            │
│ - 11-20  → JobPriority.HIGH                                                │
│ - 21-30  → JobPriority.NORMAL                                              │
│ - 31+    → JobPriority.LOW                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2.3 QUEUE ENQUEUEING                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ convertToQueueJobs(jobs, targetLang, sourceLang, context)                   │
│                                                                             │
│ For each PriorityJob:                                                       │
│ 1. Create TranslationJob:                                                   │
│    - id: random + timestamp                                                │
│    - textHash: hash of text                                               │
│    - node, element                                                         │
│    - priority: computed value                                              │
│    - jobPriority: enum from priority                                      │
│    - isAboveFold: viewportPosition < window.innerHeight                   │
│    - status: JobStatus.PENDING                                             │
│    - attempts: 0, maxAttempts: 3                                          │
│    - createdAt: Date.now()                                                │
│                                                                             │
│ 2. queueManager.addJob(job)                                                │
│ 3. If queue not running → queueManager.start()                             │
│                                                                             │
│ Queue start triggers:                                                       │
│ - Emits "job:added" event                                                  │
│ - Starts processLoop (setInterval 50ms)                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Queue Processing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3.1 SCHEDULER LOOP                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ scheduleLoop() (runs every 50ms via setInterval)                           │
│                                                                             │
│ Step 1: Find idle workers                                                   │
│ workers.filter(w => w.status === "idle")                                    │
│                                                                             │
│ Step 2: Categorize pending jobs by priority                                │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ Priority Buckets:                                                    │     │
│ │ - CRITICAL: jobs with jobPriority === JobPriority.CRITICAL         │     │
│ │ - HIGH: jobs with jobPriority === JobPriority.HIGH                 │     │
│ │ - NORMAL: jobs with jobPriority === JobPriority.NORMAL             │     │
│ │ - LOW: jobs with jobPriority === JobPriority.LOW                   │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│ Step 3: Assign jobs to workers (round-robin within priority)              │
│ - Extract job from queue (extractMin)                                      │
│ - Assign to idle worker                                                    │
│ - Update worker status: idle → busy                                       │
│ - Update job status: PENDING → PROCESSING                                 │
│ - Update job startedAt                                                     │
│                                                                             │
│ Step 4: Execute job (processJob)                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3.2 JOB EXECUTION                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ processJob(job)                                                              │
│                                                                             │
│ Step 1: API Request                                                          │
│ POST /api/translate                                                         │
│ {                                                                           │
│   strings: [job.text],                                                      │
│   targetLang: job.targetLang,                                              │
│   sourceLang: job.sourceLang,                                              │
│   context: job.context                                                      │
│ }                                                                           │
│                                                                             │
│ Step 2: Handle Response                                                      │
│ - If !response.ok → throw Error                                            │
│ - Parse JSON: data.translations[0]                                         │
│ - If translation exists → job.translatedText = translation               │
│                                                                             │
│ Step 3: DOM Patch (if successful)                                          │
│ - job.node.textContent = job.translatedText                               │
│ - job.node.parentElement.dataset.txDone = "1"                             │
│ - job.node.parentElement.dataset.txOriginal = job.text                   │
│                                                                             │
│ Step 4: Update job state                                                    │
│ - job.status = COMPLETED                                                   │
│ - job.completedAt = Date.now()                                            │
│ - worker.completedJobs++                                                   │
│ - worker.status = idle                                                     │
│                                                                             │
│ Step 5: Error Handling                                                      │
│ - job.attempts++                                                           │
│ - If attempts < maxAttempts → re-queue (status = PENDING)                 │
│ - If attempts >= maxAttempts → job.status = FAILED                       │
│ - worker.failedJobs++                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Server Processing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4.1 API ROUTE (POST /api/translate)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Step 1: Request Validation                                                  │
│ - Check ZAI_API_KEY exists (503 if missing)                                │
│ - Parse body: { strings, targetLang, sourceLang, context }               │
│ - Validate: strings.length > 0 && targetLang exists                       │
│ - Validate: strings.length <= 30 (MAX_STRINGS_PER_REQUEST)               │
│                                                                             │
│ Step 2: Rate Limiting (Distributed via Redis)                             │
│ checkDistributedRateLimit(ip, { limit: 20, window: 60 })                 │
│ - If !allowed → 429 with Retry-After header                               │
│                                                                             │
│ Step 3: Server Cache Check                                                  │
│ getServerCachedBatch(sourceLang, targetLang, strings, context)            │
│ - Redis key: tx:v2:{source}:{target}:{contextHash}:{textHash}            │
│ - Returns: (string | null)[]                                               │
│ - Identify missing indices                                                  │
│                                                                             │
│ Step 4: Translation (if missing strings)                                  │
│                                                                             │
│ withDeduplication(missingStrings, targetLang, performTranslation)         │
│                                                                             │
│ 4.4.1 Deduplication:                                                       │
│ - Generate batch key from strings + targetLang                           │
│ - Try acquire Redis lock: SET lockKey "1" NX EX 30                       │
│ - If lock acquired → translate                                           │
│ - If not → poll (100ms x 10) until lock released                         │
│ - If timeout → translate anyway (fallback)                               │
│                                                                             │
│ 4.4.2 performTranslation():                                                │
│ - Number strings: "1. {text}\n2. {text}..."                              │
│ - Build system prompt with rules                                          │
│ - Build user prompt with numbered strings                                 │
│ - Submit to global rate limiter (2-second interval)                     │
│ - Call fetchWithRetry (exponential backoff)                              │
│ - Parse JSON response, extract translations array                        │
│ - Fallback: return originals if parse fails                              │
│                                                                             │
│ Step 5: Cache Results                                                       │
│ setServerCachedBatch(sourceLang, targetLang, strings, translations, context)│
│ - TTL: 7 days                                                              │
│                                                                             │
│ Step 6: Response                                                            │
│ NextResponse.json({                                                         │
│   translations: finalTranslations,                                         │
│   meta: { requestId, duration, serverCacheHits }                          │
│ })                                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Client-Side Components

### 1. client.ts — Main Translation Engine

**Location:** `src/lib/translation/client.ts` (478 lines)

**Responsibilities:**
- Orchestrates the entire translation flow
- Manages queue initialization
- Handles DOM patching
- Exposes public API: `translatePage()`, `revertPage()`, `startObserver()`, etc.

**Key Functions:**

```typescript
// Main entry point
translatePage(targetLang, root?, context?) → Promise<void>

// Legacy mode (direct batching, no queue)
translatePageLegacy(targetLang, root?, context?) → Promise<void>

// Revert to original text
revertPage(root?) → void

// Start MutationObserver for SPA content
startObserver(getLang) → void

// Prefetch above-fold translations
prefetchTranslations(targetLang, root?, context?) → Promise<void>

// Auto-detect language and translate
initAutoDetect() → Promise<void>

// Service worker registration
registerServiceWorker() → void
```

**Logging:** Uses styled console logging with grouping
- `[vivim:translate] INFO` — cyan
- `[vivim:translate] SUCCESS` — green
- `[vivim:translate] WARN` — yellow
- `[vivim:translate] ERROR` — red
- `[vivim:translate]` with group — purple

### 2. cache.ts — Client-Side Cache

**Location:** `src/lib/translation/cache.ts` (35 lines)

**Mechanism:**
- Storage: `sessionStorage` (session-scoped)
- Key format: `vivim_tx_v1_{lang}_{hash}`
- Hash: `btoa(encodeURIComponent(text)).slice(0, 32)`

**Functions:**
```typescript
getCached(lang, text) → string | null
setCached(lang, text, translated) → void
getCachedBatch(lang, texts) → (string | null)[]
setCachedBatch(lang, texts, translated) → void
```

**Fallback:** Silently fails if storage is full (try/catch)

### 3. detector.ts — Language Detection

**Location:** `src/lib/translation/detector.ts` (94 lines)

**Detection Flow:**
```
detectLanguageMultiSignal() → string

1. Get all signals (parallel):
   - Explicit (localStorage vivim_lang)
   - URL (/es/, /fr/, etc.)
   - Geolocation (ip-api.com)
   - Browser (navigator.language)
   - History (last 5 languages)

2. Sort by confidence (descending)

3. Return top signal

4. Add to history
```

**RTL Detection:**
```typescript
isRTL(lang) → boolean
// Returns true for: ar, he, fa, ur
```

### 4. priority.ts — Content Prioritization

**Location:** `src/lib/translation/priority.ts` (99 lines)

**Functions:**
```typescript
// Harvest text nodes with priority
harvestTextNodesWithPriority(root) → PriorityJob[]

// Sort by priority + viewport
sortByPriority(jobs) → PriorityJob[]

// Prioritize above-fold
prioritizeAboveFold(jobs) → PriorityJob[]
```

**Priority Selectors:**
| Priority | Selector | Category |
|----------|----------|----------|
| 1 | nav, [role='navigation'], .navbar | navigation |
| 2 | header, .hero | header |
| 3 | h1, h2, h3 | heading |
| 4 | p, li, td, th, span, a, button, label | body |
| 5 | footer | footer |
| 10 | default | - |

### 5. queue-manager.ts — Priority Queue System

**Location:** `src/lib/translation/queue-manager.ts` (477 lines)

**Class: PriorityQueue**
- Min-heap implementation
- O(log n) insert/extract
- O(1) peek
- Methods: insert, extractMin, peek, size, isEmpty, find, toArray

**Class: TranslationQueueManager**
- Manages job lifecycle
- Worker pool (configurable, default 3)
- Event system (job:added, job:started, job:completed, job:failed, batch:completed, worker:started)

**Default Config:**
```typescript
{
  maxConcurrent: 3,
  maxConcurrentPerPriority: 2,
  batchDelayMs: 50,
  maxWaitTimeMs: 30000,
  jobTimeoutMs: 10000,
  retryDelayMs: 1000,
  maxQueueSize: 1000,
  maxRetries: 3,
  viewportBoost: 5,
  interactionBoost: 3,
  ageWeight: 0.1,
  enableCoalescing: true,
  enableBatching: true,
  enablePrefetch: true
}
```

### 6. geolocation.ts — IP-Based Location

**Location:** `src/lib/translation/geolocation.ts` (116 lines)

**API:** `https://ip-api.com/json` (free, 45 requests/min)

**Cached:** sessionStorage, 24-hour TTL

**Country → Language Mapping:**
```typescript
{
  CN: "zh", ES: "es", FR: "fr", DE: "de", PT: "pt", BR: "pt",
  JP: "ja", KR: "ko", RU: "ru", AR: "ar", SA: "ar", AE: "ar",
  // ... 40+ mappings
}
```

### 7. telemetry.ts — Analytics

**Location:** `src/lib/translation/telemetry.ts` (126 lines)

**Event Types:**
- translate_start
- translate_complete
- translate_error
- cache_hit
- cache_miss
- language_change
- rate_limit_exceeded

**Batching:**
- Batch size: 10 events
- Flush interval: 5 seconds
- Endpoint: POST /api/telemetry
- Auto-flush on: beforeunload

---

## Server-Side Components

### 1. route.ts — API Endpoint

**Location:** `src/app/api/translate/route.ts` (237 lines)

**Endpoints:**
- `POST /api/translate` — Translate strings
- `GET /api/translate` — Service status

**POST Request:**
```typescript
interface Request {
  strings: string[];        // Max 30
  targetLang: string;     // "es", "zh", etc.
  sourceLang?: string;    // Default "en"
  context?: string;       // Page context
}
```

**POST Response:**
```typescript
interface Response {
  translations: string[];
  meta: {
    requestId: string;
    duration: number;
    serverCacheHits: number;
  };
}
```

**GET Response:**
```typescript
{
  status: "ok",
  service: "vivim-translation",
  model: "glm-4.7-flash",
  features: {
    batchTranslation: true,
    caching: "multi-tier (client + server Redis)",
    rateLimit: "distributed (Redis)",
    retry: "exponential backoff",
    deduplication: true
  },
  supportedLanguages: ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"]
}
```

### 2. server-cache.ts — Redis Cache

**Location:** `src/lib/translation/server-cache.ts` (84 lines)

**Key Format:**
```
tx:v2:{source}:{target}:{contextHash}:{textHash}
```

**Functions:**
```typescript
getServerCached(sourceLang, targetLang, text, context?) → string | null
getServerCachedBatch(...) → (string | null)[]
setServerCached(..., ttlDays?) → boolean
setServerCachedBatch(...) → number
invalidateLanguagePair(source, target) → number
invalidateAllTranslations() → number
invalidateContext(context) → number
```

**TTL:** Default 7 days

### 3. rate-limit.ts — Distributed Rate Limiting

**Location:** `src/lib/translation/rate-limit.ts` (95 lines)

**Implementation:** Redis-based, sliding window

**Default:** 20 requests / 60 seconds / IP

**Functions:**
```typescript
checkDistributedRateLimit(identifier, config) → { allowed, remaining, resetAt }
getRateLimitStatus(identifier, config) → { count, limit, resetAt }
resetRateLimit(identifier, config) → void
```

### 4. deduplication.ts — Request Deduplication

**Location:** `src/lib/translation/deduplication.ts` (65 lines)

**Mechanism:** Redis distributed lock

**Flow:**
1. Generate batch key from strings + targetLang
2. Try SET lockKey "1" NX EX 30 (30-second lock)
3. If acquired → translate, then DEL lockKey
4. If not → poll every 100ms for up to 1 second
5. If still locked → translate anyway (fallback)

**Prevents:** Multiple identical translation requests hitting LLM simultaneously

### 5. retry.ts — Exponential Backoff

**Location:** `src/lib/translation/retry.ts` (100 lines)

**Config:**
```typescript
{
  maxRetries: 5,
  baseDelay: 2000,        // 2 seconds
  maxDelay: 30000,        // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: ["RATE_LIMIT", "429", "500", "502", "503", "504", "ECONNRESET", "ETIMEDOUT"]
}
```

**Jitter:** Random ±30% to prevent thundering herd

---

## Data Structures & Types

### TranslationJob (queue-design.ts)

```typescript
interface TranslationJob {
  // Identity
  id: string;
  parentId?: string;
  
  // Content
  text: string;
  textHash: string;
  node?: Text;
  element?: HTMLElement;
  
  // Priority
  priority: number;        // 1-100 (lower = higher priority)
  jobPriority: JobPriority; // CRITICAL, HIGH, NORMAL, LOW
  
  // Metadata
  sourceLang: string;
  targetLang: string;
  context?: string;
  
  // State
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  
  // Result
  translatedText?: string;
  error?: string;
  
  // Visibility
  isAboveFold: boolean;
  viewportPosition?: number;
}
```

### JobStatus (queue-design.ts)

```typescript
enum JobStatus {
  PENDING = "pending",
  WAITING_DEPENDENCY = "waiting",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired"
}
```

### JobPriority (queue-design.ts)

```typescript
enum JobPriority {
  CRITICAL = 0,  // Priority 0-10
  HIGH = 1,     // Priority 11-20
  NORMAL = 2,   // Priority 21-30
  LOW = 3       // Priority 31+
}
```

### PriorityJob (priority.ts)

```typescript
interface PriorityJob {
  node: Text;
  original: string;
  priority: number;
  boundingBox: DOMRect | null;
}
```

### QueueStats (queue-design.ts)

```typescript
interface QueueStats {
  // Status counts
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  
  // Priority counts
  critical: number;
  high: number;
  normal: number;
  low: number;
  
  // Viewport
  aboveFoldPending: number;
  belowFoldPending: number;
  
  // Performance
  avgWaitTime: number;
  avgProcessTime: number;
  throughput: number;
  
  // Resources
  memoryUsage: number;
  activeWorkers: number;
}
```

---

## Configuration & Environment

### Required Variables

```bash
# .env.local
ZAI_API_KEY=your_z_ai_api_key
```

### Optional Variables

```bash
# API Configuration
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_TRANSLATE_MODEL=glm-4.7-flash
TRANSLATE_TEMPERATURE=0.1

# Limits
TRANSLATE_MAX_BATCH=30
TRANSLATE_RATE_LIMIT=20
TRANSLATE_RATE_WINDOW=60
```

### Default Values (route.ts)

```typescript
ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4"
MODEL = process.env.ZAI_TRANSLATE_MODEL ?? "glm-4.7-flash"
TEMPERATURE = parseFloat(process.env.TRANSLATE_TEMPERATURE ?? "0.1")
MAX_STRINGS_PER_REQUEST = 30
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60
```

---

## Edge Cases & Handling

### 1. edge-cases.ts — Text Processing

**Placeholder Extraction:**
- Pattern: `{{name}}`, `%s`, `%d`, `{0}`, `{1}`, HTML tags
- Replaced with: `__VIVIM_PLACEHOLDER_N__`
- Restored after translation

**Long Text Chunking:**
- Max chunk: 2000 characters
- Split by sentence boundary (`.!?`)
- Recombines after translation

**Script Detection:**
```typescript
detectScript(text) → "latin" | "cjk" | "arabic" | "cyrillic" | "mixed" | "unknown"
```

**Validation:**
```typescript
validateTranslation(original, translated, targetLang) → ValidationResult
// Checks: empty, length ratio, character contamination
```

### 2. Error Handling Summary

| Scenario | Client Action | Server Action |
|----------|---------------|---------------|
| API error | Use original text | Retry with exponential backoff (5 attempts) |
| Rate limit exceeded | Queue job, retry later | Return 429 with Retry-After |
| Cache full | Silently fail | Silently fail |
| Translation parse fail | Use original | Return originals |
| Network timeout | Use original | Retry (5 attempts) |
| Redis unavailable | Bypass cache | Allow request (fail-open) |

### 3. Fallback Chain

```
Original Text → Server Cache → Client Cache → API Translation → Original
```

---

## Performance & Optimization

### Performance Targets

| Metric | Target |
|--------|--------|
| First paint → translated | < 800ms |
| Cache hit ratio (return users) | > 85% |
| API calls per page load | ≤ 3 |
| Bundle size | ~4 KB |
| Queue processing interval | 50ms |

### Optimization Strategies

1. **Batching:** Up to 30 strings per API call
2. **Parallel Workers:** 3 concurrent translations
3. **Priority Queue:** Above-fold content first
4. **Two-Tier Cache:** Client (sessionStorage) + Server (Redis)
5. **Deduplication:** Prevents duplicate LLM calls
6. **Prefetching:** Pre-translate above-fold content
7. **Service Worker:** Offline capability (future)

---

## File Inventory

### Client-Side (src/lib/translation/)

| File | Lines | Purpose |
|------|-------|---------|
| `client.ts` | 478 | Main translation engine |
| `cache.ts` | 35 | sessionStorage cache |
| `detector.ts` | 94 | Language detection |
| `priority.ts` | 99 | Content prioritization |
| `queue-manager.ts` | 477 | Priority queue system |
| `queue-design.ts` | 385 | Queue types and config |
| `geolocation.ts` | 116 | IP-based location |
| `telemetry.ts` | 126 | Analytics |
| `edge-cases.ts` | 126 | Text processing |
| `rate-limit.ts` | 95 | (duplicated on server) |
| `server-cache.ts` | 84 | (Redis cache) |
| `deduplication.ts` | 65 | (Request dedup) |
| `retry.ts` | 100 | (Retry logic) |

### Server-Side (src/app/api/)

| File | Lines | Purpose |
|------|-------|---------|
| `translate/route.ts` | 237 | API endpoint |

### Documentation

| File | Purpose |
|------|---------|
| `.dev/vivim_translation.md` | Original design doc |
| `.dev/translation-study/ANALYSIS.md` | This file |

---

## Related Files (Outside translation/)

### Rate Limiter (Global)

**Location:** `src/lib/rate-limiter.ts`

Used by translation API to enforce 2-second interval across ALL AI requests (not just translation)

### Redis Client

**Location:** `src/lib/redis.ts`

Provides Redis connection for server cache, rate limiting, deduplication

### Service Worker

**Location:** `public/translation-sw.js`

Future: offline translation support

---

## Conclusion

The Vivim translation service is a sophisticated, production-grade system that combines:

- **LLM-powered** translation (Z.ai glm-4.7-flash)
- **Smart prioritization** (viewport + element hierarchy)
- **Efficient batching** (up to 30 strings/call, 3 parallel workers)
- **Multi-tier caching** (sessionStorage + Redis)
- **Distributed resilience** (rate limiting, deduplication, retry)
- **SPA compatibility** (MutationObserver)
- **Multi-signal detection** (explicit, URL, geo, browser, history)

The architecture is well-designed for real-world use with proper error handling, fallbacks, and performance optimizations.