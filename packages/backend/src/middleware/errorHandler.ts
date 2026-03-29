import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { config, isDevelopment, isProduction } from '../config/index.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors: unknown[];

  constructor(message: string, errors: unknown[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    errors?: unknown[];
    stack?: string;
  };
}

function formatError(error: AppError & { errors?: unknown[] }): ErrorResponse {
  if (error.isOperational) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.errors && { errors: error.errors }),
      },
    };
  }

  if (isProduction) {
    logger.error({ error: error.message, stack: error.stack }, 'Unexpected error');
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }

  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
    },
  };
}

export function errorHandler(
  error: AppError & { errors?: unknown[] },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const log = req.id ? logger.child({ requestId: req.id }) : logger;

  const errorContext = {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || null,
    requestId: req.id,
    statusCode: error.statusCode || 500,
    timestamp: new Date().toISOString(),
  };

  log.error(
    {
      ...errorContext,
      error: error.message,
      code: error.code,
      stack: isDevelopment ? error.stack : undefined,
    },
    'Error handled by global handler'
  );

  const statusCode = error.statusCode || 500;
  const response = formatError(error);

  res.status(statusCode).json(response);
}
