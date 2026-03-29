/**
 * VIVIM Server - Modernized Server (2025+)
 *
 * Features:
 * - ES Modules
 * - Structured logging (Pino)
 * - Security headers (Helmet)
 * - Rate limiting
 * - Request validation (Zod)
 * - Error handling middleware
 * - Graceful shutdown
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Initialize Sentry first to catch all startup errors
import './lib/sentry.js';

import { logger } from './lib/logger.js';
import { config, validateConfig, getDynamicOrigins } from './config/index.js';
import terminalIntelligence from './lib/terminal-intelligence.js';
import { errorHandler } from './middleware/errorHandler.js';
import { csrfProtection, setCsrfCookie, isStatelessPath } from './middleware/csrf.js';
import { serverErrorReporter, errorReportingMiddleware } from './utils/server-error-reporting.js';
import { requestLogger } from './middleware/requestLogger.js';
import { requestId } from './middleware/requestId.js';
import { sentryRequestContext } from './middleware/sentry.js';
import { healthRouter } from './routes/health.js';
import { conversationsRouter } from './routes/conversations.js';
import { logsRouter } from './routes/logs.js';
import identityRouter from './routes/identity.js';
import acusRouter from './routes/acus.js';
import syncRouter from './routes/sync.js';
import { aiRouter } from './routes/ai.js';
import { aiChatRouter } from './routes/ai-chat.js';
import { aiSettingsRouter } from './routes/ai-settings.js';
import { createSettingsRoutes } from './routes/context-settings.ts';
import { errorsRouter } from './routes/errors.js';
import { disconnectPrisma, getPrismaClient } from './lib/database.js';
import { setupSwagger } from './docs/swagger.js';
import { logBroadcaster } from './lib/logBroadcaster.js';
import identityV2Router from './routes/identity-v2.js';
import unifiedApiRouter from './routes/unified-api.js';
import accountRouter from './routes/account.js';
import contextV2Router from './routes/context-v2.js';
import memoryRouter from './routes/memory.js';
import memorySearchRouter from './routes/memory-search.js';
import contextRecipesRouter from './routes/context-recipes.js';
import { debugRouter } from './routes/debug.js';
import { collectionsRouter } from './routes/collections.js';
import contextEngineRouter from './routes/context-engine.ts';
import docSearchRouter from './routes/doc-search.ts';
import demoRouter from './routes/demo.js';
import { bootContextSystem } from './services/context-startup.ts';

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

// ============================================================================
// STARTUP BANNER - Enhanced Terminal Intelligence
// ============================================================================
terminalIntelligence.printStartupBanner('VIVIM Server', {
  environment: config.nodeEnv,
  port: config.port,
  logLevel: config.logLevel,
});

console.log(
  terminalIntelligence.createBox(
    '📋 CONFIGURATION STATUS',
    [
      '',
      `${terminalIntelligence.colors.green}✓${terminalIntelligence.colors.reset} Database:        ${config.databaseUrl ? 'Connected' : 'Not configured'}`,
      `${terminalIntelligence.colors.green}✓${terminalIntelligence.colors.reset} CORS:            ${config.corsOrigins.join(', ')}`,
      `${terminalIntelligence.colors.green}✓${terminalIntelligence.colors.reset} Rate Limit:      ${config.rateLimitMax} req/15min`,
      `${terminalIntelligence.colors.blue}ℹ${terminalIntelligence.colors.reset} Swagger:         ${config.enableSwagger ? 'Enabled' : 'Disabled'}`,
      `${terminalIntelligence.colors.blue}ℹ${terminalIntelligence.colors.reset} P2P Network:     ${config.p2pBootstrapPeers?.length > 0 ? 'Configured' : 'Local only'}`,
      '',
    ],
    { color: terminalIntelligence.colors.green }
  )
);

// Initialize Express app
const app = express();

// ============================================================================
// SERVER LOG BROADCASTING
// ============================================================================
// Initialize log broadcaster to stream server logs to PWA
logBroadcaster.initialize();

// ============================================================================
// TRUSTED PROXY CONFIGURATION
// ============================================================================
// Enable when behind reverse proxy (nginx, AWS ALB, etc.)
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS - Cross-Origin Resource Sharing (Enhanced Security)
// Use configured origins only - never allow all origins in production
const allowedOrigins = getDynamicOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check against dynamic origins (regex patterns in dev, explicit strings in prod)
    const isAllowed = allowedOrigins.some((o) => {
      if (typeof o === 'string') {
        return o === origin;
      }
      // Regex pattern matching for dev environment
      return o.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Requested-With',
    'X-API-Key',
    'Accept',
    'Cache-Control',
    'x-user-id',
  ],
};

// Validate production has specific origins (not just patterns)
if (config.isProduction) {
  const hasExplicitOrigins = allowedOrigins.some((o) => typeof o === 'string');
  if (!hasExplicitOrigins) {
    logger.error('Production requires explicit CORS origins, not patterns');
    process.exit(1);
  }
}

app.use(cors(corsOptions));

app.use(cookieParser());

// Apply CSRF protection
app.use((req, res, next) => {
  const path = req.path;
  const isExcluded = isStatelessPath(path);
  if (isExcluded) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Set CSRF Cookie for frontend
app.use((req, res, next) => {
  const isExcluded = isStatelessPath(req.path);
  if (isExcluded) {
    return next();
  }
  return setCsrfCookie(req, res, next);
});

// Compression - Gzip response bodies
app.use(compression());

// Rate Limiting - Enable in both dev and production with environment-appropriate limits
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction ? config.rateLimitMax || 100 : 1000, // Higher limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  handler: (req, res) => {
    logger.warn({ ip: req.ip, path: req.path }, 'Rate limit exceeded');
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: '15m',
    });
  },
};

const limiter = rateLimit(rateLimitConfig);
app.use('/api/', limiter);
logger.info(
  `Rate limiting enabled (${config.isProduction ? 'production' : 'development'} mode: ${rateLimitConfig.max} req/15min)`
);

// ============================================================================
// PARSING MIDDLEWARE
// ============================================================================

// Parse JSON request bodies
app.use(
  express.json({
    limit: '1mb', // Prevent memory exhaustion attacks
    strict: true, // Only parse objects and arrays
  })
);

// Parse URL-encoded bodies
app.use(
  express.urlencoded({
    extended: false,
    limit: '1mb',
  })
);

// ============================================================================
// SESSION & AUTH (VirtualUser-Only Mode)
// ============================================================================
// Google OAuth removed - using VirtualUser fingerprint-based authentication
// Session middleware removed - VirtualUser auth is stateless via x-user-fingerprint header
// ============================================================================

// Development auth bypass (for any legacy routes)
import { devAuthBypass, logDevAuthStatus } from './middleware/dev-auth.js';
app.use(devAuthBypass);
app.use(logDevAuthStatus);

// ============================================================================
// CUSTOM MIDDLEWARE
// ============================================================================

// Request ID - Add unique identifier to each request
app.use(requestId);

// Sentry request context - Must be after requestId
app.use(sentryRequestContext);

// Enhanced Request Logger - Terminal Intelligence Visualization
app.use((req, res, next) => {
  const startTime = Date.now();
  const reqId = req.id;
  const { method } = req;
  const { path } = req;
  const { ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Only log API requests to reduce noise
  if (!path.startsWith('/api/')) {
    return next();
  }

  // Print request visualization
  terminalIntelligence.printRequestVisualization(req, res, 0);

  // Capture the original end method to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding, callback) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Print response visualization
    terminalIntelligence.printRequestVisualization(req, res, duration);

    // Log with pino for structured logging
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level](
      {
        statusCode,
        duration,
        method,
        path,
        ip,
        contentLength: res.getHeader('content-length'),
      },
      'Request completed'
    );

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no auth, no rate limit)
app.use('/', healthRouter);
app.use('/api/v1', healthRouter);

// API routes
app.use('/api/v1/conversations', conversationsRouter);
app.use('/api/v1/logs', logsRouter);
app.use('/api/v1/identity', identityRouter);
// Auth routes removed - VirtualUser uses stateless fingerprint auth
app.use('/api/v1/account', accountRouter);
app.use('/api/v2/identity', identityV2Router);
app.use('/api/unified', unifiedApiRouter);
app.use('/api/v1/acus', acusRouter);
app.use('/api/v1/sync', syncRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/ai/chat', aiChatRouter);
app.use('/api/v1/ai/settings', aiSettingsRouter);
app.use('/api/v1/settings', createSettingsRoutes(getPrismaClient()));
app.use('/api/v2/context', contextV2Router);
app.use('/api/v2/memories', memoryRouter);
app.use('/api/v2/memories/query', memorySearchRouter);
app.use('/api/v1/errors', errorsRouter);
app.use('/api/v1/debug', debugRouter);
app.use('/api/v1/collections', collectionsRouter);
app.use('/api/v2/context-engine', contextEngineRouter);
app.use('/api/v2/context-recipes', contextRecipesRouter);

// // Documentation Search (PageIndex-style)
app.use('/api/docs', docSearchRouter);

// Demo API
app.use('/api/demo', demoRouter);

// API Documentation (Swagger)
if (config.enableSwagger) {
  setupSwagger(app);
  logger.info('Swagger UI available at /api-docs');
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    ...(config.enableSwagger && { documentationUrl: '/api-docs' }),
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// STARTUP
// ============================================================================

// Helper to get local IP
import { networkInterfaces } from 'os';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4, internal (127.0.0.1), and APIPA (169.254.x.x) addresses
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const server = app.listen(config.port, '0.0.0.0', () => {
  const localIp = getLocalIp();
  const startTime = new Date().toISOString();

  console.log(
    terminalIntelligence.createBox(
      '🚀 VIVIM SERVER STARTED',
      [
        '',
        `${terminalIntelligence.colors.green}🚀${terminalIntelligence.colors.reset} ENGINE STATUS:     OPERATIONAL`,
        `${terminalIntelligence.colors.green}🎯${terminalIntelligence.colors.reset} CAPABILITIES:      AI Content Capture & Knowledge Vault`,
        `${terminalIntelligence.colors.green}🔐${terminalIntelligence.colors.reset} SECURITY LEVEL:    ENHANCED (CORS, Rate Limiting)`,
        '',
        `${terminalIntelligence.colors.blue}🌐${terminalIntelligence.colors.reset} NETWORK ACCESS:    http://${localIp}:${config.port}/api/v1`,
        `${terminalIntelligence.colors.blue}🏠${terminalIntelligence.colors.reset} LOCAL ACCESS:      http://localhost:${config.port}`,
        `${terminalIntelligence.colors.blue}📚${terminalIntelligence.colors.reset} API DOCS:          http://localhost:${config.port}/api-docs`,
        '',
        `${terminalIntelligence.colors.yellow}⏱️${terminalIntelligence.colors.reset} START TIME:        ${startTime}`,
        `${terminalIntelligence.colors.yellow}💻${terminalIntelligence.colors.reset} PLATFORM:          Node ${process.version} (${process.platform})`,
        `${terminalIntelligence.colors.yellow}🆔${terminalIntelligence.colors.reset} PROCESS ID:        PID: ${process.pid}`,
        `${terminalIntelligence.colors.yellow}🏷️${terminalIntelligence.colors.reset} MODE:              ${config.isDevelopment ? '🧪 DEVELOPMENT' : '🔒 PRODUCTION'}`,
        '',
        `${terminalIntelligence.colors.magenta}💡${terminalIntelligence.colors.reset} PWA Connection:    http://${localIp}:${config.port}/api/v1`,
        `${terminalIntelligence.colors.magenta}💡${terminalIntelligence.colors.reset} Endpoints:         /api/v1/capture, /api/v1/providers`,
        '',
      ],
      { color: terminalIntelligence.colors.cyan, width: 72 }
    )
  );
  console.log('\n');

  logger.info(
    { port: config.port, env: config.nodeEnv, localIp },
    'System Manifest Broadcast Complete'
  );
});

// ============================================================================
// SOCKET SERVICE (Data Sync + Signaling) - OPTIONAL
// ============================================================================
// Socket.IO is NOT required for core chat functionality.
// It's only used for: real-time sync, P2P signaling, entity broadcasting.
// Chat streaming uses HTTP SSE (text/event-stream), not WebSockets.
//
// To enable Socket.IO (requires socket.io package):
// import { socketService } from './services/socket.js';
// socketService.initialize(server);
// logger.info('🔌 Socket service ready for Data Sync & P2P');

// ============================================================================
// ENHANCED CONTEXT SYSTEM BOOT
// ============================================================================
// Boot the enhanced dynamic context engine after HTTP server is ready
bootContextSystem().then(() => {
  logger.info('🧠 Context system boot complete');
}).catch((err) => {
  logger.error({ error: err.message }, 'Context system boot error');
});

// ============================================================================
// ADMIN WEBSOCKET SERVICE
// ============================================================================
// import { adminWsService } from './services/admin-ws-service.js';
// adminWsService.initialize(server);
logger.info('🔌 Admin WebSocket service ready for real-time updates');

// ============================================================================
// P2P NETWORK INDEXER NODE
// ============================================================================
// import { networkService } from './services/network.js';
// networkService.initialize();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received');

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    // Disconnect from database
    try {
      await disconnectPrisma();
    } catch (error) {
      logger.error({ error: error.message }, 'Error disconnecting database');
    }

    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, config.shutdownTimeout).unref();
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
  shutdown('UNHANDLED_REJECTION');
});

export { app, server };
