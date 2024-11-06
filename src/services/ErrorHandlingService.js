export class ErrorHandlingService {
  constructor(env) {
    this.env = env;
  }

  async handleError(error, context) {
    // Log error to D1
    await this.logError(error, context);

    // Handle specific error types
    switch (error.name) {
      case 'WebSocketError':
        return this.handleWebSocketError(error);
      case 'AIModelError':
        return this.handleAIError(error);
      case 'SessionError':
        return this.handleSessionError(error);
      default:
        return this.handleGenericError(error);
    }
  }

  async logError(error, context) {
    try {
      await this.env.DB.prepare(
        'INSERT INTO errors (type, message, stack, context, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        error.name,
        error.message,
        error.stack,
        JSON.stringify(context),
        Date.now()
      ).run();
    } catch (dbError) {
      console.error('Error logging failed:', dbError);
    }
  }

  handleWebSocketError(error) {
    return {
      type: 'websocket_error',
      message: 'Connection error, attempting to reconnect...',
      retry: true,
      delay: 5000
    };
  }

  handleAIError(error) {
    return {
      type: 'ai_error',
      message: 'AI service temporarily unavailable',
      retry: true,
      delay: 1000
    };
  }

  handleSessionError(error) {
    return {
      type: 'session_error',
      message: 'Session expired, please reconnect',
      retry: false
    };
  }

  handleGenericError(error) {
    return {
      type: 'generic_error',
      message: 'An unexpected error occurred',
      retry: true,
      delay: 3000
    };
  }

  async cleanup() {
    // Clean old error logs
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    await this.env.DB.prepare(
      'DELETE FROM errors WHERE timestamp < ?'
    ).bind(thirtyDaysAgo).run();
  }
}
