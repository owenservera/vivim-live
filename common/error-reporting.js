/**
 * Centralized Error Reporting Module
 * Stub implementation for development
 */

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

  async report(error) {
    console.error('[ErrorReporter]', error);
    return { id: 'stub-' + Date.now() };
  }

  async reportContractViolation(details) {
    console.warn('[ContractViolation]', details);
  }
}

export { ErrorReporter };
export default { ErrorReporter, ErrorCategory };