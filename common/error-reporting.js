/**
 * Centralized Error Reporting Module
 *
 * Integrates with Sentry for production error tracking.
 * Falls back to console logging when Sentry is not configured.
 *
 * Usage:
 *   import { ErrorReporter, ErrorCategory } from './error-reporting.js';
 *
 *   const reporter = ErrorReporter.getInstance();
 *   await reporter.reportDatabaseError(error, { query: 'SELECT * FROM users' });
 */

import { getSentry } from '../packages/backend/src/lib/sentry.js';
import { logger } from '../packages/backend/src/lib/logger.js';

export const ErrorCategory = {
  DATABASE: 'database',
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  SERVICE: 'service',
  EXTERNAL: 'external',
  UNKNOWN: 'unknown',
};

class ErrorReporter {
  static instance = null;

  static getInstance() {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  /**
   * Report an error to Sentry and log it
   * @param {Error|Object} error - Error object or error details
   * @param {Object} context - Additional context (tags, extra, severity)
   * @returns {Promise<{id: string}>} Report ID
   */
  async report(error, context = {}) {
    const sentry = getSentry();
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Log via Pino logger
    const severity = context.severity || 'error';
    logger[severity]?.(
      { error: errorObj.message, stack: errorObj.stack, ...context },
      `[ErrorReporter] ${context.category || ErrorCategory.UNKNOWN}`
    );

    // Report to Sentry if available
    if (sentry) {
      const scope = sentry.getCurrentScope();

      // Add tags from context
      if (context.category) {
        scope.setTag('category', context.category);
      }
      if (context.severity) {
        scope.setTag('severity', context.severity);
      }
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      // Add extra context
      if (context.extra) {
        scope.setContext('extra', context.extra);
      }

      const eventId = sentry.captureException(errorObj);
      return { id: eventId };
    }

    // Fallback: Sentry not configured
    return { id: 'noop-' + Date.now() };
  }

  /**
   * Report a database error
   */
  async reportDatabaseError(error, context = {}) {
    return this.report(error, { ...context, category: ErrorCategory.DATABASE });
  }

  /**
   * Report a network error
   */
  async reportNetworkError(error, context = {}) {
    return this.report(error, { ...context, category: ErrorCategory.NETWORK });
  }

  /**
   * Report a validation error
   */
  async reportValidationError(error, context = {}) {
    return this.report(error, { ...context, category: ErrorCategory.VALIDATION, severity: 'warn' });
  }

  /**
   * Report a contract violation (developer error)
   */
  async reportContractViolation(details) {
    logger.error(
      { details, category: ErrorCategory.SERVICE },
      '[ContractViolation] Internal contract broken'
    );

    const sentry = getSentry();
    if (sentry) {
      sentry.getCurrentScope().setTag('category', 'contract-violation');
      sentry.captureException(new Error('Contract Violation: ' + JSON.stringify(details)));
    }
  }

  /**
   * Report a performance issue
   */
  async reportPerformanceIssue(metrics) {
    logger.warn(
      { metrics, category: 'performance' },
      '[PerformanceIssue] Threshold exceeded'
    );

    const sentry = getSentry();
    if (sentry) {
      sentry.getCurrentScope().setTag('category', 'performance');
      sentry.getCurrentScope().setContext('metrics', metrics);
      sentry.captureMessage('Performance threshold exceeded', 'warning');
    }
  }
}

export { ErrorReporter };
export default { ErrorReporter, ErrorCategory };
