import { EventEmitter } from 'node:events';
import { v4 as uuidv4 } from 'uuid';

export enum RequestPriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3
}

export interface GlobalRateLimiterConfig {
  minIntervalMs: number;
  maxQueueSize: number;
  timeoutMs: number;
  enablePriority: boolean;
}

const DEFAULT_CONFIG: GlobalRateLimiterConfig = {
  minIntervalMs: 2000,
  maxQueueSize: 1000,
  timeoutMs: 60000,
  enablePriority: false
};

interface QueuedRequest<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: RequestPriority;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface QueueStats {
  queueLength: number;
  processingCount: number;
  totalProcessed: number;
  totalFailed: number;
  avgWaitTimeMs: number;
  avgProcessingTimeMs: number;
  lastRequestAt?: number;
  nextRequestAt?: number;
}

export class GlobalRateLimiter extends EventEmitter {
  private queue: QueuedRequest<unknown>[] = [];
  private processingCount = 0;
  private lastRequestAt = 0;
  private isProcessing = false;
  private isPaused = false;
  private totalProcessed = 0;
  private totalFailed = 0;
  private totalWaitTime = 0;
  private totalProcessingTime = 0;
  private config: GlobalRateLimiterConfig;

  private static instance: GlobalRateLimiter;

  private constructor(config: Partial<GlobalRateLimiterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<GlobalRateLimiterConfig>): GlobalRateLimiter {
    if (!GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance = new GlobalRateLimiter(config);
    }
    return GlobalRateLimiter.instance;
  }

  static resetInstance(): void {
    if (GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance.destroy();
      GlobalRateLimiter.instance = new GlobalRateLimiter();
    }
  }

  async submit<T>(
    fn: () => Promise<T>,
    options: { priority?: RequestPriority; timeoutMs?: number } = {}
  ): Promise<T> {
    const { priority = RequestPriority.NORMAL, timeoutMs = this.config.timeoutMs } = options;

    if (this.queue.length >= this.config.maxQueueSize) {
      const error = new Error(`Queue full (max: ${this.config.maxQueueSize})`);
      (error as any).code = 'QUEUE_FULL';
      throw error;
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: uuidv4(),
        fn,
        resolve,
        reject,
        priority,
        submittedAt: Date.now()
      };

      if (priority === RequestPriority.CRITICAL && !this.isProcessing) {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      this.emit('queued', { id: request.id, position: this.queue.length });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isPaused || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestAt;
    const delayNeeded = Math.max(0, this.config.minIntervalMs - timeSinceLastRequest);

    if (delayNeeded > 0) {
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    const request = this.queue.shift();
    if (!request) {
      this.isProcessing = false;
      return;
    }

    request.startedAt = Date.now();
    this.processingCount++;
    this.lastRequestAt = Date.now();

    this.emit('processing', {
      id: request.id,
      waitTimeMs: request.startedAt - request.submittedAt,
      queueLength: this.queue.length
    });

    const timeout = setTimeout(() => {
      const error = new Error(`Request timeout after ${timeoutMs}ms`);
      (error as any).code = 'TIMEOUT';
      request.reject(error);
      this.totalFailed++;
      this.processingCount--;
      this.emit('timeout', { id: request.id });
      this.processQueue();
    }, timeoutMs);

    try {
      const result = await request.fn();
      clearTimeout(timeout);
      
      request.completedAt = Date.now();
      const waitTime = request.startedAt - request.submittedAt;
      const processingTime = request.completedAt - request.startedAt;
      
      this.totalWaitTime += waitTime;
      this.totalProcessingTime += processingTime;
      this.totalProcessed++;

      request.resolve(result);
      
      this.emit('completed', {
        id: request.id,
        waitTimeMs: waitTime,
        processingTimeMs: processingTime
      });

      this.processingCount--;
      this.processQueue();
    } catch (error) {
      clearTimeout(timeout);
      this.totalFailed++;
      this.processingCount--;
      
      request.reject(error);
      
      this.emit('failed', { id: request.id, error });
      this.processQueue();
    }
  }

  getStats(): QueueStats {
    const processed = this.totalProcessed || 1;
    return {
      queueLength: this.queue.length,
      processingCount: this.processingCount,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      avgWaitTimeMs: Math.round(this.totalWaitTime / processed),
      avgProcessingTimeMs: Math.round(this.totalProcessingTime / processed),
      lastRequestAt: this.lastRequestAt || undefined,
      nextRequestAt: this.queue.length > 0 
        ? this.lastRequestAt + this.config.minIntervalMs 
        : undefined
    };
  }

  clear(cancelInFlight = false): void {
    const cancelledCount = this.queue.length;
    this.queue.forEach(request => {
      const error = new Error('Queue cleared');
      (error as any).code = 'CANCELLED';
      request.reject(error);
    });
    this.queue = [];
    
    if (cancelInFlight) {
      this.processingCount = 0;
    }
    
    this.emit('cleared', { cancelledCount });
  }

  pause(): void {
    this.isPaused = true;
    this.emit('paused', { queueLength: this.queue.length });
  }

  resume(): void {
    this.isPaused = false;
    this.emit('resumed', { queueLength: this.queue.length });
    this.processQueue();
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isHealthy(): boolean {
    return this.queue.length < this.config.maxQueueSize * 0.9;
  }

  destroy(): void {
    this.clear(true);
    this.removeAllListeners();
  }

  updateConfig(config: Partial<GlobalRateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }
}

export const globalRateLimiter = GlobalRateLimiter.getInstance();
