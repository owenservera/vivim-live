export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 100,
  maxDelay: 5000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ENETUNREACH"],
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * delay;
  return Math.min(delay + jitter, config.maxDelay);
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: Error;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTime: Date.now() - startTime,
      };
    } catch (err) {
      lastError = err as Error;

      if (attempt === cfg.maxRetries) {
        break;
      }

      const errorMessage = lastError.message;
      const isRetryable = cfg.retryableErrors.some(e => errorMessage.includes(e));

      if (!isRetryable) {
        break;
      }

      const delay = calculateDelay(attempt, cfg);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: cfg.maxRetries + 1,
    totalTime: Date.now() - startTime,
  };
}

export async function fetchWithRetryURL(
  url: string,
  options: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<Response>> {
  return fetchWithRetry(async () => {
    const res = await fetch(url, options);

    if (res.ok) {
      return res;
    }

    const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
    if (cfg.retryableStatuses.includes(res.status)) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res;
  }, config);
}
