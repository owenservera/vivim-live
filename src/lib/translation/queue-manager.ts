import {
  CONTENT_HIERARCHY,
  PRIORITY_SELECTORS_V2,
  JobStatus,
  JobPriority,
  DEFAULT_SCHEDULER_CONFIG,
  type TranslationJob,
  type TranslationBatch,
  type SchedulerConfig,
  type QueueStats,
  type QueueEvent,
  type Worker,
} from "./queue-design";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PriorityQueue {
  private heap: TranslationJob[] = [];

  private compare(a: TranslationJob, b: TranslationJob): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }
    return a.id.localeCompare(b.id);
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }
      if (rightChild < length && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }
      if (smallest === index) {
        break;
      }
      this.swap(index, smallest);
      index = smallest;
    }
  }

  insert(job: TranslationJob): void {
    this.heap.push(job);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): TranslationJob | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  peek(): TranslationJob | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  find(predicate: (job: TranslationJob) => boolean): TranslationJob | undefined {
    return this.heap.find(predicate);
  }

  toArray(): TranslationJob[] {
    return [...this.heap];
  }
}

export class TranslationQueueManager {
  private queue: PriorityQueue;
  private jobs: Map<string, TranslationJob>;
  private batches: Map<string, TranslationBatch>;
  private workers: Worker[];
  private config: SchedulerConfig;
  private eventListeners: Map<string, Set<(event: QueueEvent) => void>>;
  private isRunning: boolean = false;
  private processLoopId?: ReturnType<typeof setInterval>;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.queue = new PriorityQueue();
    this.jobs = new Map();
    this.batches = new Map();
    this.workers = [];
    this.config = { ...DEFAULT_SCHEDULER_CONFIG, ...config };
    this.eventListeners = new Map();
    this.initWorkers();
  }

  private initWorkers(): void {
    for (let i = 0; i < this.config.maxConcurrent; i++) {
      this.workers.push({
        id: `worker-${i}`,
        status: "idle",
        completedJobs: 0,
        failedJobs: 0,
      });
    }
  }

  private computePriority(
    element: HTMLElement | undefined,
    viewportPosition: number | undefined,
    textLength: number
  ): number {
    let basePriority = 20;

    if (element) {
      for (const { selector, priority } of PRIORITY_SELECTORS_V2) {
        if (element.matches(selector) || (element.closest(selector) && selector !== element.tagName.toLowerCase())) {
          basePriority = priority;
          break;
        }
      }
    }

    if (viewportPosition !== undefined) {
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      const isAbove = viewportPosition < viewportHeight;

      if (isAbove) {
        basePriority = Math.max(1, basePriority - this.config.viewportBoost);
      }
    }

    const ageBoost = Math.floor((Date.now() - 0) / 10000) * this.config.ageWeight;
    basePriority = Math.max(1, basePriority - ageBoost);

    return Math.max(1, Math.min(100, basePriority));
  }

  private emit(type: QueueEvent["type"], data?: unknown): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event: QueueEvent = {
        type,
        timestamp: Date.now(),
        data,
      };
      listeners.forEach((callback) => callback(event));
    }
  }

  on(eventType: string, callback: (event: QueueEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (event: QueueEvent) => void): void {
    this.eventListeners.get(eventType)?.delete(callback);
  }

  addJob(params: {
    text: string;
    node?: Text;
    element?: HTMLElement;
    sourceLang: string;
    targetLang: string;
    context?: string;
    maxAttempts?: number;
  }): TranslationJob {
    const viewportPosition = params.element?.getBoundingClientRect()?.top;
    const priority = this.computePriority(params.element, viewportPosition, params.text.length);
    const jobPriority = priority <= 10 ? JobPriority.CRITICAL 
      : priority <= 20 ? JobPriority.HIGH 
      : priority <= 30 ? JobPriority.NORMAL 
      : JobPriority.LOW;

    const job: TranslationJob = {
      id: generateId(),
      text: params.text,
      textHash: hashString(params.text),
      node: params.node,
      element: params.element,
      priority,
      jobPriority,
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
      context: params.context,
      status: JobStatus.PENDING,
      attempts: 0,
      maxAttempts: params.maxAttempts ?? this.config.maxRetries,
      createdAt: Date.now(),
      isAboveFold: viewportPosition !== undefined 
        ? viewportPosition < (typeof window !== "undefined" ? window.innerHeight : 800)
        : false,
      viewportPosition,
    };

    this.jobs.set(job.id, job);
    this.queue.insert(job);
    this.emit("job:added", job);

    if (!this.isRunning) {
      this.start();
    }

    return job;
  }

  addBatch(jobs: TranslationJob[]): TranslationBatch {
    const batch: TranslationBatch = {
      id: generateId(),
      jobs,
      sourceLang: jobs[0]?.sourceLang ?? "en",
      targetLang: jobs[0]?.targetLang ?? "en",
      context: jobs[0]?.context,
      priority: Math.min(...jobs.map((j) => j.priority)),
      jobPriority: jobs[0]?.jobPriority ?? JobPriority.NORMAL,
      createdAt: Date.now(),
      status: JobStatus.PENDING,
      completedCount: 0,
      failedCount: 0,
      maxConcurrent: this.config.maxConcurrent,
      currentConcurrent: 0,
    };

    jobs.forEach((job) => {
      job.parentId = batch.id;
      this.jobs.set(job.id, job);
      this.queue.insert(job);
    });

    this.batches.set(batch.id, batch);
    this.emit("batch:created", batch);

    return batch;
  }

  private async processJob(job: TranslationJob): Promise<void> {
    const worker = this.workers.find((w) => w.status === "idle");
    if (!worker) return;

    worker.status = "busy";
    worker.currentJob = job;
    worker.startedAt = Date.now();

    job.status = JobStatus.PROCESSING;
    job.startedAt = Date.now();
    job.attempts++;

    this.emit("job:started", { job, workerId: worker.id });

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strings: [job.text],
          targetLang: job.targetLang,
          sourceLang: job.sourceLang,
          context: job.context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      job.translatedText = data.translations?.[0] ?? job.text;
      job.status = JobStatus.COMPLETED;
      job.completedAt = Date.now();

      worker.completedJobs++;

      if (job.node && job.translatedText !== job.text) {
        job.node.textContent = job.translatedText;
        if (job.node.parentElement) {
          job.node.parentElement.dataset.txDone = "1";
          job.node.parentElement.dataset.txOriginal = job.text;
        }
      }

      this.emit("job:completed", job);
    } catch (error) {
      job.error = error instanceof Error ? error.message : String(error);
      job.status = job.attempts >= job.maxAttempts ? JobStatus.FAILED : JobStatus.PENDING;
      worker.failedJobs++;

      if (job.status === JobStatus.PENDING) {
        this.queue.insert(job);
      }

      this.emit("job:failed", job);
    } finally {
      worker.status = "idle";
      worker.currentJob = undefined;
      worker.startedAt = undefined;
    }
  }

  private async scheduleLoop(): Promise<void> {
    const idleWorkers = this.workers.filter((w) => w.status === "idle");
    const priorityBuckets = {
      [JobPriority.CRITICAL]: [] as TranslationJob[],
      [JobPriority.HIGH]: [] as TranslationJob[],
      [JobPriority.NORMAL]: [] as TranslationJob[],
      [JobPriority.LOW]: [] as TranslationJob[],
    };

    while (!this.queue.isEmpty() && idleWorkers.length > 0) {
      const job = this.queue.peek();
      if (!job) break;

      if (job.status !== JobStatus.PENDING) {
        this.queue.extractMin();
        continue;
      }

      const bucket = priorityBuckets[job.jobPriority];
      if (bucket.length === 0) {
        bucket.push(this.queue.extractMin()!);
      }

      if (bucket.length > 0 && idleWorkers.length > 0) {
        const nextJob = bucket.shift()!;
        const worker = idleWorkers.shift()!;
        this.processJob(nextJob);
      }
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.processLoopId = setInterval(() => {
      this.scheduleLoop();
    }, this.config.batchDelayMs);

    this.emit("worker:started", { workerCount: this.workers.length });
  }

  stop(): void {
    this.isRunning = false;
    if (this.processLoopId) {
      clearInterval(this.processLoopId);
      this.processLoopId = undefined;
    }
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === JobStatus.PROCESSING) {
      return false;
    }

    job.status = JobStatus.CANCELLED;
    this.emit("job:cancelled", job);
    return true;
  }

  cancelBatch(batchId: string): number {
    const batch = this.batches.get(batchId);
    if (!batch) return 0;

    let cancelled = 0;
    batch.jobs.forEach((job) => {
      if (this.cancelJob(job.id)) {
        cancelled++;
      }
    });

    batch.status = JobStatus.CANCELLED;
    return cancelled;
  }

  getJob(jobId: string): TranslationJob | undefined {
    return this.jobs.get(jobId);
  }

  getStats(): QueueStats {
    const jobsArray = Array.from(this.jobs.values());

    const pending = jobsArray.filter((j) => j.status === JobStatus.PENDING).length;
    const processing = jobsArray.filter((j) => j.status === JobStatus.PROCESSING).length;
    const completed = jobsArray.filter((j) => j.status === JobStatus.COMPLETED).length;
    const failed = jobsArray.filter((j) => j.status === JobStatus.FAILED).length;
    const cancelled = jobsArray.filter((j) => j.status === JobStatus.CANCELLED).length;

    const critical = jobsArray.filter((j) => j.jobPriority === JobPriority.CRITICAL && j.status === JobStatus.PENDING).length;
    const high = jobsArray.filter((j) => j.jobPriority === JobPriority.HIGH && j.status === JobStatus.PENDING).length;
    const normal = jobsArray.filter((j) => j.jobPriority === JobPriority.NORMAL && j.status === JobStatus.PENDING).length;
    const low = jobsArray.filter((j) => j.jobPriority === JobPriority.LOW && j.status === JobStatus.PENDING).length;

    const aboveFoldPending = jobsArray.filter((j) => j.isAboveFold && j.status === JobStatus.PENDING).length;
    const belowFoldPending = jobsArray.filter((j) => !j.isAboveFold && j.status === JobStatus.PENDING).length;

    return {
      pending,
      processing,
      completed,
      failed,
      cancelled,
      critical,
      high,
      normal,
      low,
      aboveFoldPending,
      belowFoldPending,
      avgWaitTime: 0,
      avgProcessTime: 0,
      throughput: 0,
      memoryUsage: 0,
      activeWorkers: this.workers.filter((w) => w.status === "busy").length,
    };
  }

  clear(): void {
    this.stop();
    this.queue = new PriorityQueue();
    this.jobs.clear();
    this.batches.clear();
  }
}

let globalQueue: TranslationQueueManager | null = null;

export function getGlobalQueue(): TranslationQueueManager {
  if (!globalQueue) {
    globalQueue = new TranslationQueueManager();
  }
  return globalQueue;
}
