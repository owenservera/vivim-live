/**
 * Debug Routes - Development/Debug API endpoints
 * 
 * Provides API endpoints for debugging context assembly,
 * memory operations, and performance analysis.
 * 
 * @warning NEVER enable these routes in production
 */

import { Router, Request, Response } from 'express';
import { ContextInspector } from './context-inspector';
import { MemoryDebugger } from './memory-debugger';
import { BudgetVisualizer } from './budget-visualizer';
import { RequestTracer } from './request-tracer';
import { DynamicContextAssembler } from '../context/context-assembler';
import { getPrismaClient } from '../lib/database';
import { createEmbeddingService, createLLMService, createTokenEstimator } from '../context/utils/zai-service';
import { BundleCompiler } from '../context/bundle-compiler';
import { logger } from '../lib/logger';

const router = Router();
const prisma = getPrismaClient();

// Middleware to prevent production use
router.use((req: Request, res: Response, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Debug endpoints are disabled in production',
    });
  }
  next();
});

/**
 * GET /debug/health
 * Health check for debug endpoints
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /debug/context/inspect
 * Inspect context assembly for a user message
 * 
 * Query params:
 * - userId: User ID
 * - message: User message to analyze
 * - conversationId: (optional) Conversation ID
 * - verbose: (optional) Include full system prompt
 */
router.get('/context/inspect', async (req: Request, res: Response) => {
  try {
    const { userId, message, conversationId, verbose } = req.query;

    if (!userId || !message) {
      return res.status(400).json({
        error: 'Missing required parameters: userId, message',
      });
    }

    // Initialize context assembler
    const embeddingService = createEmbeddingService();
    const llmService = createLLMService();
    const tokenEstimator = createTokenEstimator();
    const bundleCompiler = new BundleCompiler({
      prisma,
      embeddingService,
      llmService,
    });

    const assembler = new DynamicContextAssembler({
      prisma,
      embeddingService,
      tokenEstimator,
      bundleCompiler,
    });

    // Inspect context assembly
    const result = await ContextInspector.inspect(assembler, userId as string, message as string, {
      conversationId: conversationId as string,
      verbose: verbose === 'true',
    });

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Context inspection failed');
    res.status(500).json({
      error: 'Context inspection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /debug/context/visualize
 * Generate ASCII visualization of context assembly
 */
router.get('/context/visualize', async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.query;

    if (!userId || !message) {
      return res.status(400).json({
        error: 'Missing required parameters: userId, message',
      });
    }

    const embeddingService = createEmbeddingService();
    const llmService = createLLMService();
    const tokenEstimator = createTokenEstimator();
    const bundleCompiler = new BundleCompiler({
      prisma,
      embeddingService,
      llmService,
    });

    const assembler = new DynamicContextAssembler({
      prisma,
      embeddingService,
      tokenEstimator,
      bundleCompiler,
    });

    const result = await ContextInspector.inspect(assembler, userId as string, message as string);
    const visualization = ContextInspector.visualize(result);

    res.type('text/plain').send(visualization);
  } catch (error) {
    logger.error({ error }, 'Context visualization failed');
    res.status(500).json({
      error: 'Context visualization failed',
    });
  }
});

/**
 * GET /debug/memory/trace
 * Trace memory retrieval for a query
 */
router.get('/memory/trace', async (req: Request, res: Response) => {
  try {
    const { userId, query, limit, includeEmbeddings } = req.query;

    if (!userId || !query) {
      return res.status(400).json({
        error: 'Missing required parameters: userId, query',
      });
    }

    const traces = await MemoryDebugger.traceMemoryRetrieval(userId as string, query as string, {
      limit: limit ? parseInt(limit as string) : 20,
      includeEmbeddings: includeEmbeddings === 'true',
    });

    res.json(traces);
  } catch (error) {
    logger.error({ error }, 'Memory tracing failed');
    res.status(500).json({
      error: 'Memory tracing failed',
    });
  }
});

/**
 * GET /debug/memory/conflicts
 * Analyze memory conflicts for a user
 */
router.get('/memory/conflicts', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter: userId',
      });
    }

    const analysis = await MemoryDebugger.analyzeConflicts(userId as string);
    res.json(analysis);
  } catch (error) {
    logger.error({ error }, 'Conflict analysis failed');
    res.status(500).json({
      error: 'Conflict analysis failed',
    });
  }
});

/**
 * GET /debug/memory/graph
 * Generate SVG visualization of memory graph
 */
router.get('/memory/graph', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter: userId',
      });
    }

    const svg = await MemoryDebugger.visualizeMemoryGraph(userId as string);
    res.type('image/svg+xml').send(svg);
  } catch (error) {
    logger.error({ error }, 'Memory graph visualization failed');
    res.status(500).json({
      error: 'Memory graph visualization failed',
    });
  }
});

/**
 * GET /debug/budget/visualize
 * Visualize token budget
 */
router.get('/budget/visualize', async (req: Request, res: Response) => {
  try {
    const { assemblyId } = req.query;

    if (!assemblyId) {
      return res.status(400).json({
        error: 'Missing required parameter: assemblyId',
      });
    }

    const history = ContextInspector.getHistory();
    const inspection = history.find(h => h.assemblyId === assemblyId);

    if (!inspection) {
      return res.status(404).json({
        error: 'Assembly not found',
      });
    }

    const viz = BudgetVisualizer.visualize(inspection.budget);
    res.json(viz);
  } catch (error) {
    logger.error({ error }, 'Budget visualization failed');
    res.status(500).json({
      error: 'Budget visualization failed',
    });
  }
});

/**
 * GET /debug/budget/html
 * Generate HTML visualization of budget
 */
router.get('/budget/html', async (req: Request, res: Response) => {
  try {
    const { assemblyId } = req.query;

    if (!assemblyId) {
      return res.status(400).json({
        error: 'Missing required parameter: assemblyId',
      });
    }

    const history = ContextInspector.getHistory();
    const inspection = history.find(h => h.assemblyId === assemblyId);

    if (!inspection) {
      return res.status(404).json({
        error: 'Assembly not found',
      });
    }

    const viz = BudgetVisualizer.visualize(inspection.budget);
    const html = BudgetVisualizer.toHTML(viz);
    res.type('text/html').send(html);
  } catch (error) {
    logger.error({ error }, 'HTML generation failed');
    res.status(500).json({
      error: 'HTML generation failed',
    });
  }
});

/**
 * GET /debug/trace/timeline
 * Generate timeline visualization for a trace
 */
router.get('/trace/timeline', async (req: Request, res: Response) => {
  try {
    const { traceId } = req.query;

    if (!traceId) {
      return res.status(400).json({
        error: 'Missing required parameter: traceId',
      });
    }

    const trace = RequestTracer.getTrace(traceId);
    const summary = RequestTracer.getSummary(traceId);

    if (!trace && !summary) {
      return res.status(404).json({
        error: 'Trace not found',
      });
    }

    const timeline = summary?.timeline || (trace ? RequestTracer.generateTimeline(trace) : 'No timeline available');
    res.type('text/plain').send(timeline);
  } catch (error) {
    logger.error({ error }, 'Timeline generation failed');
    res.status(500).json({
      error: 'Timeline generation failed',
    });
  }
});

/**
 * GET /debug/trace/performance
 * Get performance report
 */
router.get('/trace/performance', (req: Request, res: Response) => {
  const report = RequestTracer.getPerformanceReport();
  res.type('text/plain').send(report);
});

/**
 * GET /debug/trace/export
 * Export trace as JSON
 */
router.get('/trace/export', async (req: Request, res: Response) => {
  try {
    const { traceId } = req.query;

    if (!traceId) {
      return res.status(400).json({
        error: 'Missing required parameter: traceId',
      });
    }

    const exported = RequestTracer.exportTrace(traceId);

    if (!exported) {
      return res.status(404).json({
        error: 'Trace not found',
      });
    }

    res.type('application/json').send(exported);
  } catch (error) {
    logger.error({ error }, 'Trace export failed');
    res.status(500).json({
      error: 'Trace export failed',
    });
  }
});

/**
 * GET /debug/history
 * Get context inspection history
 */
router.get('/history', (req: Request, res: Response) => {
  const history = ContextInspector.getHistory();
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  res.json(history.slice(-limit));
});

/**
 * POST /debug/history/clear
 * Clear context inspection history
 */
router.post('/history/clear', (req: Request, res: Response) => {
  ContextInspector.clearHistory();
  RequestTracer.clearAll();
  res.json({ status: 'ok', message: 'History cleared' });
});

/**
 * GET /debug/stats
 * Get debug system statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  const history = ContextInspector.getHistory();
  const activeTraces = RequestTracer.getActiveTraces();

  res.json({
    contextInspections: history.length,
    activeTraces,
    completedTraces: RequestTracer.getSummary ? 'available' : 'none',
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

export { router as debugRoutes };
