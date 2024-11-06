export class ErrorBoundary {
  constructor() {
    this.errors = new Map();
    this.maxErrors = 10;
    this.errorTimeout = 3600000; // 1 hour
  }

  async handleError(error, context) {
    const errorId = crypto.randomUUID();
    const errorInfo = {
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };

    await this.#storeError(errorId, errorInfo);
    await this.#cleanupOldErrors();

    return {
      errorId,
      handled: true,
      recoverable: this.#isRecoverable(error)
    };
  }

  async #storeError(errorId, errorInfo) {
    this.errors.set(errorId, errorInfo);

    // If we exceed maxErrors, remove oldest
    if (this.errors.size > this.maxErrors) {
      const oldest = Array.from(this.errors.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.errors.delete(oldest[0]);
      }
    }
  }

  async #cleanupOldErrors() {
    const now = Date.now();
    for (const [id, error] of this.errors.entries()) {
      if (now - error.timestamp > this.errorTimeout) {
        this.errors.delete(id);
      }
    }
  }

  #isRecoverable(error) {
    const unrecoverableErrors = [
      'AuthenticationError',
      'ConfigurationError',
      'DatabaseConnectionError'
    ];
    return !unrecoverableErrors.includes(error.name);
  }

  getErrors() {
    return Array.from(this.errors.entries()).map(([id, error]) => ({
      id,
      ...error
    }));
  }
}
