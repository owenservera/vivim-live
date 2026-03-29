import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { randomUUID } from 'crypto';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request', public details?: unknown[]) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(503, 'SERVICE_UNAVAILABLE', message);
    this.name = 'ServiceUnavailableError';
  }
}

const friendlyMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Hmm, something doesn\'t look quite right with that request. Could you try again?',
  NOT_FOUND: 'We couldn\'t find what you\'re looking for. It might have been moved or deleted.',
  UNAUTHORIZED: 'It looks like you need to sign in first.',
  FORBIDDEN: 'You don\'t have permission to access this.',
  RATE_LIMIT_EXCEEDED: 'Whoa there! You\'re going a bit too fast. Take a breath and try again in a moment.',
  CONFLICT: 'This conflicts with something else. Please try a different approach.',
  GONE: 'This is no longer available.',
  INTERNAL_ERROR: 'Ehemm... either it\'s you or it\'s me, but my internals need some realignment. God bless!',
  SERVICE_UNAVAILABLE: 'We\'re taking a quick breather. Please try again in a few moments.',
  BAD_GATEWAY: 'Having trouble connecting to our services. Please try again shortly.',
  GATEWAY_TIMEOUT: 'This is taking longer than expected. Please try again.',
  AI_SERVICE_ERROR: 'Our AI is having a moment. Please give it a second and try again.',
  CONTEXT_ASSEMBLY_ERROR: 'Having trouble gathering context. Let\'s try that again.',
  TOKEN_LIMIT_ERROR: 'This conversation is getting quite long! Consider starting a new chat.',
  MODEL_ERROR: 'The AI model is having trouble. We\'re working on it.',
  DATABASE_ERROR: 'Having trouble saving your message. Please try again.',
  CONNECTION_ERROR: 'Lost connection. Please check your internet and try again.',
};

export function getFriendlyMessage(errorCode: string): string {
  return friendlyMessages[errorCode] || friendlyMessages.INTERNAL_ERROR;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const error = err as AppError & { errors?: unknown[] };
  const statusCode = error.statusCode || error.status || 500;
  const errorCode = error.code || getErrorCode(statusCode);
  const userMessage = getFriendlyMessage(errorCode);
  
  if (statusCode >= 500) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: (req as any).virtualUser?.id || req.headers['x-user-fingerprint'],
        body: req.body,
      },
      'Server error occurred'
    );
  } else if (statusCode >= 400) {
    logger.warn(
      {
        error: error.message,
        path: req.path,
        method: req.method,
        statusCode,
      },
      'Client error occurred'
    );
  }
  
  const response: Record<string, unknown> = {
    success: false,
    error: userMessage,
    code: errorCode,
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      message: error.message,
      validationErrors: error.details,
    };
  }
  
  if (process.env.DEBUG === 'true') {
    const errorId = randomUUID();
    response.details = {
      errorId,
      message: error.message
    };
  }
  
  if (statusCode === 429 && (error as any).retryAfter) {
    res.setHeader('Retry-After', (error as any).retryAfter);
  }
  
  res.status(statusCode).json(response);
}

function getErrorCode(statusCode: number): string {
  const codeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    410: 'GONE',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  };
  
  return codeMap[statusCode] || 'INTERNAL_ERROR';
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function isOperationalError(error: unknown): boolean {
  return error instanceof AppError && error.isOperational;
}

export function createErrorFromResponse(status: number, body: Record<string, unknown>): AppError {
  const message = (body?.error as string) || (body?.message as string) || 'Request failed';
  const code = (body?.code as string) || getErrorCode(status);
  
  return new AppError(status, code, message);
}
