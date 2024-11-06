export class ErrorHandler {
  constructor(env) {
    this.env = env;
    this.errorMap = new Map();
    this.#setupDefaultHandlers();
  }

  async handleError(error, context = {}) {
    const handler = this.#getErrorHandler(error);
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    };

    await this.#logError(errorInfo);
    return handler(error, context);
  }

  #setupDefaultHandlers() {
    this.errorMap.set('WebSocketError', this.#handleWebSocketError.bind(this));
    this.errorMap.set('DatabaseError', this.#handleDatabaseError.bind(this));
    this.errorMap.set('AIError', this.#handleAIError.bind(this));
    this.errorMap.set('default', this.#handleDefaultError.bind(this));
  }

  #getErrorHandler(error) {
    return this.errorMap.get(error.name) || this.errorMap.get('default');
  }

  async #logError(errorInfo) {
    try {
      await this.env.DB.prepare(
        'INSERT INTO errors (name, message, stack, context, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        errorInfo.name,
        errorInfo.message,
        errorInfo.stack,
        JSON.stringify(errorInfo.context),
        errorInfo.timestamp
      ).run();
    } catch (dbError) {
      console.error('Error logging failed:', dbError);
    }
  }

  #handleWebSocketError(error, context) {
    return {
      type: 'websocket_error',
      message: 'Connection error occurred',
      retry: true
    };
  }

  #handleDatabaseError(error, context) {
    return {
      type: 'database_error',
      message: 'Database operation failed',
      retry: false
    };
  }

  #handleAIError(error, context) {
    return {
      type: 'ai_error',
      message: 'AI service temporarily unavailable',
      retry: true
    };
  }

  #handleDefaultError(error, context) {
    return {
      type: 'unknown_error',
      message: 'An unexpected error occurred',
      retry: false
    };
  }
}
