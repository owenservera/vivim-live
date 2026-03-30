import { getCachedBatch, setCachedBatch } from "./cache";
import { harvestTextNodesWithPriority, type PriorityJob } from "./priority";
import { detectLanguageMultiSignal, isRTL, setLanguagePreference } from "./detector";
import { trackTranslateStart, trackTranslateComplete, trackTranslateError } from "./telemetry";
import { TranslationQueueManager, getGlobalQueue, DEFAULT_SCHEDULER_CONFIG } from "./queue-manager";
import { JobStatus, type QueueEvent } from "./queue-design";

const DEBOUNCE_MS = 300;
let queueManager: TranslationQueueManager;
let _currentLang = "en";
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

const log = {
  info: (msg: string, data?: unknown) => console.log(`%c[vivim:translate] ${msg}`, "color: #06b6d4; font-weight: bold;", data ?? ""),
  success: (msg: string, data?: unknown) => console.log(`%c[vivim:translate] ${msg}`, "color: #22c55e; font-weight: bold;", data ?? ""),
  warn: (msg: string, data?: unknown) => console.warn(`%c[vivim:translate] ${msg}`, "color: #eab308; font-weight: bold;", data ?? ""),
  error: (msg: string, data?: unknown) => console.error(`%c[vivim:translate] ${msg}`, "color: #ef4444; font-weight: bold;", data ?? ""),
  group: (label: string) => console.group(`%c[vivim:translate] ${label}`, "color: #a855f7; font-weight: bold;"),
  groupEnd: () => console.groupEnd(),
};

function applyRTL(lang: string): void {
  document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

function addTranslatingClass(element: HTMLElement | null | undefined): void {
  element?.classList.add("vivim-translating");
}

function removeTranslatingClass(element: HTMLElement | null | undefined): void {
  element?.classList.remove("vivim-translating");
}

function initQueue(): void {
  if (queueManager) return;
  
  queueManager = getGlobalQueue();
  
  queueManager.on("job:started", (event: QueueEvent) => {
    const job = event.data as { element?: HTMLElement };
    if (job?.element) {
      addTranslatingClass(job.element);
    }
    log.info(`Job started`, { jobId: event.jobId });
  });
  
  queueManager.on("job:completed", (event: QueueEvent) => {
    const job = event.data as { element?: HTMLElement; translatedText?: string };
    if (job?.element) {
      removeTranslatingClass(job.element);
    }
    log.success(`Job completed`, { jobId: event.jobId });
  });
  
  queueManager.on("job:failed", (event: QueueEvent) => {
    const job = event.data as { element?: HTMLElement; error?: string };
    if (job?.element) {
      removeTranslatingClass(job.element);
    }
    log.error(`Job failed`, { jobId: event.jobId, error: job?.error });
  });
  
  queueManager.on("batch:completed", () => {
    const stats = queueManager.getStats();
    log.success(`Batch completed`, { pending: stats.pending, processing: stats.processing });
  });
  
  log.info(`Queue manager initialized`);
}

function convertToQueueJobs(
  jobs: PriorityJob[],
  targetLang: string,
  sourceLang: string = "en",
  context?: string
): void {
  initQueue();
  
  for (const job of jobs) {
    queueManager.addJob({
      text: job.original,
      node: job.node,
      element: job.node.parentElement ?? undefined,
      sourceLang,
      targetLang,
      context,
    });
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
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
    return;
  }

  log.group(`Translate Page → ${targetLang.toUpperCase()}`);
  log.info("Starting translation", { context: context ?? "default", root: root.tagName });

  applyRTL(targetLang);
  setLanguagePreference(targetLang);
  trackTranslateStart(targetLang, 0);

  const jobs = harvestTextNodesWithPriority(root);
  log.info("Text nodes harvested", { count: jobs.length });

  if (jobs.length === 0) {
    log.warn("No translatable text found");
    log.groupEnd();
    return;
  }

  const stats = queueManager?.getStats() ?? { pending: 0, processing: 0 };
  log.info("Queue status", { 
    pending: stats.pending, 
    processing: stats.processing 
  });

  convertToQueueJobs(jobs, targetLang, "en", context);

  const finalStats = queueManager.getStats();
  log.success(`Page translation queued`, { 
    totalJobs: jobs.length, 
    queued: finalStats.pending,
    duration: `${performance.now() - startTime}ms`
  });
  log.groupEnd();
}

export async function translatePageLegacy(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  const BATCH_SIZE = 50;
  const MAX_PARALLEL_BATCHES = 3;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  
  const startTime = performance.now();

  if (targetLang === "en") {
    log.info("Skipping translation (English)");
    revertPage(root);
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
    return;
  }

  log.group(`Translate Page (Legacy) → ${targetLang.toUpperCase()}`);
  log.info("Starting translation", { context: context ?? "default", root: root.tagName });

  applyRTL(targetLang);
  setLanguagePreference(targetLang);
  trackTranslateStart(targetLang, 0);

  const jobs = harvestTextNodesWithPriority(root);
  log.info("Text nodes harvested", { count: jobs.length });

  if (jobs.length === 0) {
    log.warn("No translatable text found");
    log.groupEnd();
    return;
  }

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

  log.info("Smart strategy computed", { 
    aboveFold: aboveFold.length, 
    belowFold: belowFold.length 
  });

  async function processBatch(
    batchJobs: PriorityJob[],
    lang: string,
    ctx?: string
  ): Promise<void> {
    const originals = batchJobs.map((j) => j.original);
    
    const cached = getCachedBatch(lang, originals);
    const missingIdx = cached.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
    const cachedCount = cached.length - missingIdx.length;

    if (cachedCount > 0) {
      log.info(`Cache hits`, { count: cachedCount, missing: missingIdx.length });
    }

    if (missingIdx.length > 0) {
      const missingStrings = missingIdx.map((i) => originals[i]);
      try {
        batchJobs.forEach(j => addTranslatingClass(j.node.parentElement));
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strings: missingStrings, targetLang: lang, context: ctx }),
        });
        
        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }
        
        const data = await res.json();
        const fresh = data.translations as string[];
        
        missingIdx.forEach((idx, pos) => {
          cached[idx] = fresh[pos] ?? originals[idx];
        });
        setCachedBatch(lang, missingStrings, fresh);
      } catch (err) {
        log.error("API failed, using originals", { error: err });
        missingIdx.forEach((i) => {
          cached[i] = originals[i];
        });
      } finally {
        batchJobs.forEach(j => removeTranslatingClass(j.node.parentElement));
      }
    }

    let patchedCount = 0;
    batchJobs.forEach((job, i) => {
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

    log.success(`Batch complete`, { patched: patchedCount, total: batchJobs.length });
  }

  async function processBatchesParallel(
    batchJobs: PriorityJob[],
    lang: string,
    ctx?: string
  ): Promise<void> {
    const batches: PriorityJob[][] = [];
    for (let i = 0; i < batchJobs.length; i += BATCH_SIZE) {
      batches.push(batchJobs.slice(i, i + BATCH_SIZE));
    }

    log.info(`Processing ${batches.length} batches in parallel`);

    for (let i = 0; i < batches.length; i += MAX_PARALLEL_BATCHES) {
      const parallelBatches = batches.slice(i, i + MAX_PARALLEL_BATCHES);
      await Promise.all(parallelBatches.map(batch => processBatch(batch, lang, ctx)));
    }
  }

  async function processBatchesSequential(
    batchJobs: PriorityJob[],
    lang: string,
    ctx?: string
  ): Promise<void> {
    const batchCount = Math.ceil(batchJobs.length / BATCH_SIZE);
    log.info(`Processing ${batchCount} batches sequentially`);

    for (let i = 0; i < batchJobs.length; i += BATCH_SIZE) {
      const batch = batchJobs.slice(i, i + BATCH_SIZE);
      await processBatch(batch, lang, ctx);
    }
  }

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

export function startObserver(getLang: () => string): void {
  initQueue();
  
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
  }

  const observer = new MutationObserver((mutations) => {
    const lang = getLang();
    if (lang === _currentLang || lang === "en") return;

    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
    }

    _debounceTimer = setTimeout(() => {
      _currentLang = lang;
      log.info(`Mutation detected, re-translating`, { lang, mutationsCount: mutations.length });

      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translatePage(lang, node as HTMLElement, undefined);
          }
        });
      });
    }, DEBOUNCE_MS);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  log.success("MutationObserver started with queue system");
}

export function startObserverLegacy(getLang: () => string): void {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
  }

  const observer = new MutationObserver((mutations) => {
    const lang = getLang();
    if (lang === _currentLang || lang === "en") return;

    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
    }

    _debounceTimer = setTimeout(() => {
      _currentLang = lang;
      log.info(`Mutation detected, re-translating`, { lang, mutationsCount: mutations.length });

      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translatePageLegacy(lang, node as HTMLElement, undefined);
          }
        });
      });
    }, DEBOUNCE_MS);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  log.success("MutationObserver started (legacy mode)");
}

export async function prefetchTranslations(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  if (targetLang === "en") return;
  
  initQueue();
  
  log.info(`Pre-fetching translations for ${targetLang}`);
  
  const jobs = harvestTextNodesWithPriority(root);
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  
  const aboveFold = jobs.filter(j => j.boundingBox && j.boundingBox.top < viewportHeight);
  
  const originals = aboveFold.map(j => j.original);
  const cached = getCachedBatch(targetLang, originals);
  const missingIdx = cached.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  
  if (missingIdx.length === 0) {
    log.info(`Pre-fetch: all above-fold already cached`);
    return;
  }
  
  const missingStrings = missingIdx.map((i) => originals[i]);
  
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strings: missingStrings, targetLang, context }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setCachedBatch(targetLang, missingStrings, data.translations);
      log.success(`Pre-fetch complete`, { cached: missingStrings.length });
    }
  } catch {
    log.warn(`Pre-fetch failed or aborted`);
  }
}

export function clearPrefetch(): void {
  queueManager?.clear();
}

export function getQueueStats() {
  if (!queueManager) {
    initQueue();
  }
  return queueManager.getStats();
}

export function cancelAllTranslations(): void {
  queueManager?.clear();
  log.info("All translations cancelled");
}

export async function initAutoDetect(): Promise<void> {
  if (typeof window === "undefined") return;
  
  initQueue();
  
  try {
    const detected = await detectLanguageMultiSignal();
    if (detected && detected !== "en") {
      log.info("Auto-detected language", { lang: detected });
      translatePage(detected);
    }
  } catch (err) {
    log.warn("Auto-detect failed", { error: err });
  }
}

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  
  navigator.serviceWorker.register("/translation-sw.js")
    .then((registration) => {
      log.success("Service Worker registered", { scope: registration.scope });
    })
    .catch((err) => {
      log.warn("Service Worker registration failed", { error: err });
    });
}

export function useLegacyMode(enabled: boolean): void {
  if (enabled) {
    log.warn("Using legacy translation mode (without queue)");
  }
}
