import { getCachedBatch, setCachedBatch } from "./cache";
import { harvestTextNodesWithPriority, type PriorityJob } from "./priority";

const BATCH_SIZE = 50;
const MAX_PARALLEL_BATCHES = 3;

const log = {
  info: (msg: string, data?: unknown) => console.log(`%c[vivim:translate] ${msg}`, "color: #06b6d4; font-weight: bold;", data ?? ""),
  success: (msg: string, data?: unknown) => console.log(`%c[vivim:translate] ${msg}`, "color: #22c55e; font-weight: bold;", data ?? ""),
  warn: (msg: string, data?: unknown) => console.warn(`%c[vivim:translate] ${msg}`, "color: #eab308; font-weight: bold;", data ?? ""),
  error: (msg: string, data?: unknown) => console.error(`%c[vivim:translate] ${msg}`, "color: #ef4444; font-weight: bold;", data ?? ""),
  group: (label: string) => console.group(`%c[vivim:translate] ${label}`, "color: #a855f7; font-weight: bold;"),
  groupEnd: () => console.groupEnd(),
};

interface TranslationStrategy {
  aboveFold: PriorityJob[];
  belowFold: PriorityJob[];
}

function computeSmartStrategy(jobs: PriorityJob[]): TranslationStrategy {
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  
  const aboveFold: PriorityJob[] = [];
  const belowFold: PriorityJob[] = [];
  
  for (const job of jobs) {
    if (job.boundingBox && job.boundingBox.top < viewportHeight) {
      aboveFold.push(job);
    } else {
      belowFold.push(job);
    }
  }
  
  aboveFold.sort((a, b) => a.priority - b.priority || 
    (a.boundingBox?.top ?? 0) - (b.boundingBox?.top ?? 0));
  belowFold.sort((a, b) => a.priority - b.priority || 
    (a.boundingBox?.top ?? 0) - (b.boundingBox?.top ?? 0));
  
  return { aboveFold, belowFold };
}

async function fetchTranslations(
  strings: string[],
  targetLang: string,
  context?: string
): Promise<string[]> {
  const startTime = performance.now();
  log.info(`Fetching translations`, { count: strings.length, targetLang, context });

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strings, targetLang, context }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    const isAuthError = res.status === 401 || res.status === 403;
    const isRateLimit = res.status === 429;
    const isServerError = res.status >= 500;
    
    log.error(`API error: ${res.status}`, { 
      status: res.status, 
      error: errorText,
      type: isAuthError ? "AUTH" : isRateLimit ? "RATE_LIMIT" : isServerError ? "SERVER" : "UNKNOWN"
    });
    
    throw new Error(`Translate API ${res.status}: ${isAuthError ? "Authentication failed" : isRateLimit ? "Rate limit exceeded" : isServerError ? "Service temporarily unavailable" : errorText}`);
  }

  const data = await res.json();
  const duration = performance.now() - startTime;

  log.success(`Translation fetched`, {
    stringsCount: strings.length,
    duration: `${duration.toFixed(0)}ms`,
    meta: data.meta,
  });

  return data.translations as string[];
}

async function processBatch(
  jobs: PriorityJob[],
  targetLang: string,
  context?: string
): Promise<void> {
  const originals = jobs.map((j) => j.original);
  log.info(`Processing batch`, { count: originals.length, targetLang });

  const cached = getCachedBatch(targetLang, originals);
  const missingIdx = cached.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  const cachedCount = cached.length - missingIdx.length;

  if (cachedCount > 0) {
    log.info(`Cache hits`, { count: cachedCount, missing: missingIdx.length });
  }

  let batchError: Error | null = null;

  if (missingIdx.length > 0) {
    const missingStrings = missingIdx.map((i) => originals[i]);
    log.group("API Request");
    try {
      const fresh = await fetchTranslations(missingStrings, targetLang, context);
      missingIdx.forEach((idx, pos) => {
        cached[idx] = fresh[pos] ?? originals[idx];
      });
      setCachedBatch(targetLang, missingStrings, fresh);
      log.success(`API translation complete`, { translated: fresh.length });
    } catch (err) {
      batchError = err instanceof Error ? err : new Error(String(err));
      log.error("API failed", { error: batchError.message });
      // Don't use originals - let the user know translation failed
      missingIdx.forEach((i) => {
        cached[i] = originals[i]; // Keep original, but error is logged
      });
    }
    log.groupEnd();
  }

  let patchedCount = 0;
  jobs.forEach((job, i) => {
    const translated = cached[i];
    if (translated && translated !== job.original) {
      job.node.textContent = translated;
      if (job.node.parentElement) {
        job.node.parentElement.dataset.txDone = "1";
        job.node.parentElement.dataset.txOriginal = job.original;
      }
      patchedCount++;
    }
  });

  if (batchError) {
    log.warn(`Batch completed with errors`, { 
      patched: patchedCount, 
      total: jobs.length,
      error: batchError.message 
    });
  } else {
    log.success(`Batch complete`, { patched: patchedCount, total: jobs.length });
  }
  
  return batchError ? Promise.reject(batchError) : Promise.resolve();
}

async function processBatchesParallel(
  jobs: PriorityJob[],
  targetLang: string,
  context?: string
): Promise<void> {
  const batches: PriorityJob[][] = [];
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    batches.push(jobs.slice(i, i + BATCH_SIZE));
  }

  log.info(`Processing ${batches.length} batches in parallel groups`, { 
    batchSize: BATCH_SIZE, 
    maxParallel: MAX_PARALLEL_BATCHES 
  });

  for (let i = 0; i < batches.length; i += MAX_PARALLEL_BATCHES) {
    const parallelBatches = batches.slice(i, i + MAX_PARALLEL_BATCHES);
    await Promise.all(parallelBatches.map(batch => processBatch(batch, targetLang, context)));
  }
}

async function processBatchesSequential(
  jobs: PriorityJob[],
  targetLang: string,
  context?: string
): Promise<void> {
  const batchCount = Math.ceil(jobs.length / BATCH_SIZE);
  log.info(`Processing ${batchCount} batches sequentially`, { batchSize: BATCH_SIZE });

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = jobs.slice(i, i + BATCH_SIZE);
    log.info(`Batch ${batchNum}/${batchCount}`, { size: batch.length });
    await processBatch(batch, targetLang, context);
  }
}

// Circuit breaker state to prevent API spam during failures
let circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  state: "CLOSED" as "CLOSED" | "OPEN" | "HALF_OPEN",
  threshold: 3,
  resetTimeout: 60000, // 1 minute
};

function shouldAllowRequest(): boolean {
  const now = Date.now();
  
  if (circuitBreaker.state === "CLOSED") {
    return true;
  }
  
  if (circuitBreaker.state === "OPEN") {
    if (now - circuitBreaker.lastFailure > circuitBreaker.resetTimeout) {
      circuitBreaker.state = "HALF_OPEN";
      return true;
    }
    return false;
  }
  
  // HALF_OPEN - allow one request to test
  return true;
}

function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.state = "CLOSED";
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  
  if (circuitBreaker.failures >= circuitBreaker.threshold) {
    circuitBreaker.state = "OPEN";
    log.error("Circuit breaker OPENED", { 
      failures: circuitBreaker.failures,
      resetIn: `${Math.ceil(circuitBreaker.resetTimeout / 1000)}s`
    });
  }
}

function resetCircuitBreaker(): void {
  circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    state: "CLOSED",
    threshold: 3,
    resetTimeout: 60000,
  };
}

export async function translatePage(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = performance.now();

  if (targetLang === "en") {
    log.info("Skipping translation (English)");
    revertPage(root);
    return { success: true };
  }

  // Check circuit breaker before starting
  if (!shouldAllowRequest()) {
    log.error("Translation blocked by circuit breaker", { 
      state: circuitBreaker.state,
      failures: circuitBreaker.failures
    });
    return { 
      success: false, 
      error: "Translation service temporarily unavailable. Please try again in a minute." 
    };
  }

  log.group(`Translate Page → ${targetLang.toUpperCase()}`);
  log.info("Starting translation", { context: context ?? "default", root: root.tagName });

  const jobs = harvestTextNodesWithPriority(root);
  log.info("Text nodes harvested", { count: jobs.length });

  if (jobs.length === 0) {
    log.warn("No translatable text found");
    log.groupEnd();
    return { success: true };
  }

  const { aboveFold, belowFold } = computeSmartStrategy(jobs);
  log.info("Smart strategy computed", {
    aboveFold: aboveFold.length,
    belowFold: belowFold.length
  });

  let hasErrors = false;
  let errorMessage: string | undefined;

  if (aboveFold.length > 0) {
    log.info("Processing above-fold (parallel)");
    try {
      await processBatchesParallel(aboveFold, targetLang, context);
    } catch (err) {
      hasErrors = true;
      errorMessage = err instanceof Error ? err.message : "Translation failed";
    }
  }

  if (belowFold.length > 0 && !hasErrors) {
    log.info("Processing below-fold (sequential)");
    try {
      await processBatchesSequential(belowFold, targetLang, context);
    } catch (err) {
      hasErrors = true;
      errorMessage = err instanceof Error ? err.message : "Translation failed";
    }
  }

  const duration = performance.now() - startTime;
  
  if (hasErrors) {
    recordFailure();
    log.warn(`Page translation completed with errors`, {
      totalTranslated: jobs.length,
      duration: `${duration.toFixed(0)}ms`,
      error: errorMessage
    });
    log.groupEnd();
    return { success: false, error: errorMessage };
  } else {
    recordSuccess();
    log.success(`Page translation complete`, {
      totalTranslated: jobs.length,
      duration: `${duration.toFixed(0)}ms`
    });
    log.groupEnd();
    return { success: true };
  }
}

export function revertPage(root: HTMLElement = document.body): void {
  log.info("Reverting translations", { root: root.tagName });

  const reverted = root.querySelectorAll("[data-tx-done]");
  reverted.forEach((el) => {
    const orig = (el as HTMLElement).dataset.txOriginal;
    if (orig) el.textContent = orig;
    delete (el as HTMLElement).dataset.txDone;
    delete (el as HTMLElement).dataset.txOriginal;
  });

  log.success(`Reverted ${reverted.length} elements`);
}

// Prefetch state
let _prefetchAbort: AbortController | null = null;

export async function prefetchTranslations(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  if (targetLang === "en") return;

  // Check circuit breaker
  if (!shouldAllowRequest()) {
    log.warn(`Pre-fetch blocked by circuit breaker`);
    return;
  }

  _prefetchAbort?.abort();
  _prefetchAbort = new AbortController();

  log.info(`Pre-fetching translations for ${targetLang}`);

  const jobs = harvestTextNodesWithPriority(root);
  const { aboveFold } = computeSmartStrategy(jobs);

  const originals = aboveFold.map(j => j.original);
  const cached = getCachedBatch(targetLang, originals);
  const missingIdx = cached.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);

  if (missingIdx.length === 0) {
    log.info(`Pre-fetch: all above-fold already cached`);
    return;
  }

  const missingStrings = missingIdx.map((i) => originals[i]);

  try {
    const fresh = await fetchTranslations(missingStrings, targetLang, context);
    setCachedBatch(targetLang, missingStrings, fresh);
    log.success(`Pre-fetch complete`, { cached: fresh.length });
  } catch (err) {
    log.warn(`Pre-fetch failed`, { error: err instanceof Error ? err.message : String(err) });
  }
}

export function clearPrefetch(): void {
  _prefetchAbort?.abort();
  _prefetchAbort = null;
}

/**
 * Reset the circuit breaker (useful for debugging or manual recovery)
 */
export function resetTranslationService(): void {
  resetCircuitBreaker();
  log.success("Translation service reset");
}
