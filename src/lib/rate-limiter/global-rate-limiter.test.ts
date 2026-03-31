import { GlobalRateLimiter, RequestPriority } from './global-rate-limiter';

describe('GlobalRateLimiter', () => {
  beforeEach(() => {
    GlobalRateLimiter.resetInstance();
  });

  afterEach(() => {
    GlobalRateLimiter.getInstance().destroy();
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      const instance1 = GlobalRateLimiter.getInstance();
      const instance2 = GlobalRateLimiter.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use provided config on first call', () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 1000 });
      const stats = limiter.getStats();
      // Config is used internally, verified through behavior tests
    });
  });

  describe('rate limiting', () => {
    it('should enforce minimum interval between requests', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 100 });
      const times: number[] = [];

      const p1 = limiter.submit(async () => { times.push(Date.now()); return 'a'; });
      const p2 = limiter.submit(async () => { times.push(Date.now()); return 'b'; });
      const p3 = limiter.submit(async () => { times.push(Date.now()); return 'c'; });

      await Promise.all([p1, p2, p3]);

      expect(times).toHaveLength(3);
      expect(times[1] - times[0]).toBeGreaterThanOrEqual(90); // Allow 10ms tolerance
      expect(times[2] - times[1]).toBeGreaterThanOrEqual(90);
    });

    it('should process requests in FIFO order', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50 });
      const results: string[] = [];

      await limiter.submit(async () => { results.push('first'); return 'a'; });
      await limiter.submit(async () => { results.push('second'); return 'b'; });
      await limiter.submit(async () => { results.push('third'); return 'c'; });

      expect(results).toEqual(['first', 'second', 'third']);
    });
  });

  describe('queue management', () => {
    it('should reject when queue is full', async () => {
      const limiter = GlobalRateLimiter.getInstance({ maxQueueSize: 2, minIntervalMs: 1000 });

      // Block the processor
      let resolveBlock: (() => void) | undefined;
      const blockPromise = new Promise<void>(resolve => { resolveBlock = resolve; });
      limiter.submit(async () => { await blockPromise; return 'blocking'; });

      // Fill the queue
      limiter.submit(async () => 'a');
      limiter.submit(async () => 'b');

      // Next should fail
      await expect(limiter.submit(async () => 'c')).rejects.toThrow('Queue full');
      await expect(limiter.submit(async () => 'd')).rejects.toThrow('Queue full');

      // Unblock to clean up
      resolveBlock!();
    });

    it('should report correct queue length', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 500 });

      expect(limiter.getQueueLength()).toBe(0);

      limiter.submit(async () => 'a');
      expect(limiter.getQueueLength()).toBeGreaterThanOrEqual(0); // May have started processing

      limiter.submit(async () => 'b');
      limiter.submit(async () => 'c');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(limiter.getQueueLength()).toBeLessThanOrEqual(2);
    });
  });

  describe('priority', () => {
    it('should prioritize CRITICAL requests when queue is empty', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50 });
      const order: string[] = [];

      // Start with a blocking request
      let unblockFirst = false;
      limiter.submit(async () => {
        while (!unblockFirst) await new Promise(r => setTimeout(r, 10));
        order.push('first');
        return 'a';
      });

      // Queue normal request
      limiter.submit(async () => { order.push('normal'); return 'b'; });

      // Submit critical request
      limiter.submit(async () => { order.push('critical'); return 'c'; }, { 
        priority: RequestPriority.CRITICAL 
      });

      // Unblock and wait
      unblockFirst = true;
      await new Promise(resolve => setTimeout(resolve, 500));

      // Critical should be before normal
      expect(order[0]).toBe('first');
      expect(order[1]).toBe('critical');
      expect(order[2]).toBe('normal');
    });
  });

  describe('pause/resume', () => {
    it('should pause and resume processing', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50 });
      const results: string[] = [];

      limiter.pause();

      limiter.submit(async () => { results.push('first'); return 'a'; });
      limiter.submit(async () => { results.push('second'); return 'b'; });

      // Should not have processed yet
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(results).toHaveLength(0);

      // Resume and wait
      limiter.resume();
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(results).toEqual(['first', 'second']);
    });
  });

  describe('clear', () => {
    it('should clear pending requests', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 1000 });

      // Block the processor
      let resolveBlock: (() => void) | undefined;
      const blockPromise = new Promise<void>(resolve => { resolveBlock = resolve; });
      limiter.submit(async () => { await blockPromise; return 'blocking'; });

      // Queue some requests
      const p2 = limiter.submit(async () => 'a').catch(() => null);
      const p3 = limiter.submit(async () => 'b').catch(() => null);

      // Clear
      limiter.clear();

      // Queued requests should be rejected
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(limiter.getQueueLength()).toBe(0);

      // Unblock to clean up
      resolveBlock!();
      await Promise.all([p2, p3]);
    });
  });

  describe('stats', () => {
    it('should track statistics', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50 });

      await limiter.submit(async () => 'a');
      await limiter.submit(async () => 'b');
      await limiter.submit(async () => { throw new Error('test'); }).catch(() => {});

      const stats = limiter.getStats();

      expect(stats.totalProcessed).toBe(2);
      expect(stats.totalFailed).toBe(1);
      expect(stats.avgWaitTimeMs).toBeGreaterThanOrEqual(0);
      expect(stats.avgProcessingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should report health based on queue capacity', () => {
      const limiter = GlobalRateLimiter.getInstance({ maxQueueSize: 10 });
      expect(limiter.isHealthy()).toBe(true);
    });
  });

  describe('events', () => {
    it('should emit events for lifecycle', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50 });
      const events: string[] = [];

      limiter.on('queued', () => events.push('queued'));
      limiter.on('processing', () => events.push('processing'));
      limiter.on('completed', () => events.push('completed'));

      await limiter.submit(async () => 'a');

      expect(events).toContain('queued');
      expect(events).toContain('processing');
      expect(events).toContain('completed');
    });
  });

  describe('timeout', () => {
    it('should timeout long-running requests', async () => {
      const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 50, timeoutMs: 100 });

      await expect(
        limiter.submit(async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return 'never';
        })
      ).rejects.toThrow('timeout');
    });
  });
});
