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
    log.error(`API error: ${res.status}`, { status: res.status, error: errorText });
    throw new Error(`Translate API ${res.status}`);
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
      log.error("API failed, using originals", { error: err });
      missingIdx.forEach((i) => {
        cached[i] = originals[i];
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

  log.success(`Batch complete`, { patched: patchedCount, total: jobs.length });
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

export async function translatePage(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  const startTime = performance.now();

  if (targetLang === "en") {
    log.info("Skipping translation (English)");
    revertPage(root);
    return;
  }

  log.group(`Translate Page → ${targetLang.toUpperCase()}`);
  log.info("Starting translation", { context: context ?? "default", root: root.tagName });

  const jobs = harvestTextNodesWithPriority(root);
  log.info("Text nodes harvested", { count: jobs.length });

  if (jobs.length === 0) {
    log.warn("No translatable text found");
    log.groupEnd();
    return;
  }

  const { aboveFold, belowFold } = computeSmartStrategy(jobs);
  log.info("Smart strategy computed", { 
    aboveFold: aboveFold.length, 
    belowFold: belowFold.length 
  });

  if (aboveFold.length > 0) {
    log.info("Processing above-fold (parallel)");
    await processBatchesParallel(aboveFold, targetLang, context);
  }

  if (belowFold.length > 0) {
    log.info("Processing below-fold (sequential)");
    await processBatchesSequential(belowFold, targetLang, context);
  }

  const duration = performance.now() - startTime;
  log.success(`Page translation complete`, { 
    totalTranslated: jobs.length, 
    duration: `${duration.toFixed(0)}ms` 
  });
  log.groupEnd();
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

let _observer: MutationObserver | null = null;
let _currentLang = "en";

export function startObserver(getLang: () => string): void {
  _observer?.disconnect();

  _observer = new MutationObserver((mutations) => {
    const lang = getLang();
    if (lang === _currentLang || lang === "en") return;

    _currentLang = lang;
    log.info(`Mutation detected, re-translating`, { lang, mutationsCount: mutations.length });

    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          translatePage(lang, node as HTMLElement, undefined);
        }
      });
    });
  });

  _observer.observe(document.body, { childList: true, subtree: true });
  log.success("MutationObserver started");
}

let _prefetchAbort: AbortController | null = null;

export async function prefetchTranslations(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  if (targetLang === "en") return;
  
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
  } catch {
    log.warn(`Pre-fetch failed or aborted`);
  }
}

export function clearPrefetch(): void {
  _prefetchAbort?.abort();
  _prefetchAbort = null;
}
