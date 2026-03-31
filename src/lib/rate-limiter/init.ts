import { GlobalRateLimiter, type GlobalRateLimiterConfig } from './global-rate-limiter';

/**
 * Initialize the global rate limiter with environment-based configuration
 * Call this once at application startup
 */
export function initializeGlobalRateLimiter(overrides?: Partial<GlobalRateLimiterConfig>) {
  const config: GlobalRateLimiterConfig = {
    minIntervalMs: parseInt(process.env.GLOBAL_RATE_LIMIT_INTERVAL_MS || '2000'),
    maxQueueSize: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_QUEUE || '1000'),
    timeoutMs: parseInt(process.env.GLOBAL_RATE_LIMIT_TIMEOUT_MS || '60000'),
    enablePriority: process.env.GLOBAL_RATE_LIMIT_ENABLE_PRIORITY === 'true',
    ...overrides
  };

  const limiter = GlobalRateLimiter.getInstance(config);

  // Set up event logging
  limiter.on('queued', ({ id, position }) => {
    console.log(`[RateLimiter] Request ${id.slice(0, 8)} queued at position ${position}`);
  });

  limiter.on('processing', ({ id, waitTimeMs, queueLength }) => {
    console.log(`[RateLimiter] Request ${id.slice(0, 8)} processing (waited ${waitTimeMs}ms, ${queueLength} remaining)`);
  });

  limiter.on('completed', ({ id, waitTimeMs, processingTimeMs }) => {
    console.log(`[RateLimiter] Request ${id.slice(0, 8)} completed (wait: ${waitTimeMs}ms, process: ${processingTimeMs}ms)`);
  });

  limiter.on('failed', ({ id, error }) => {
    console.error(`[RateLimiter] Request ${id.slice(0, 8)} failed:`, (error as Error).message);
  });

  limiter.on('timeout', ({ id }) => {
    console.error(`[RateLimiter] Request ${id.slice(0, 8)} timed out`);
  });

  // Graceful shutdown handlers
  const shutdown = () => {
    console.log('[RateLimiter] Draining queue on shutdown...');
    limiter.pause();
    
    const stats = limiter.getStats();
    console.log(`[RateLimiter] Final stats: ${stats.queueLength} pending, ${stats.totalProcessed} processed, ${stats.totalFailed} failed`);
    
    setTimeout(() => {
      limiter.destroy();
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  console.log(`[RateLimiter] Initialized with ${config.minIntervalMs}ms interval, max ${config.maxQueueSize} queue size`);
  
  return limiter;
}
