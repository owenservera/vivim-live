import { globalRateLimiter } from '@/lib/rate-limiter/global-rate-limiter';

/**
 * GET /api/rate-limiter-health
 * Returns current rate limiter statistics and health status
 */
export async function GET() {
  const stats = globalRateLimiter.getStats();
  const isHealthy = globalRateLimiter.isHealthy();
  const queueLength = globalRateLimiter.getQueueLength();

  return Response.json({
    healthy: isHealthy,
    status: isHealthy ? 'ok' : queueLength > 100 ? 'warning' : 'degraded',
    stats: {
      ...stats,
      nextRequestIn: stats.nextRequestAt 
        ? Math.max(0, stats.nextRequestAt - Date.now()) 
        : 0
    },
    config: {
      minIntervalMs: 2000,
      maxQueueSize: 1000
    }
  });
}
