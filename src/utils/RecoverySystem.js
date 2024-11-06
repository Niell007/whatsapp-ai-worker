export class RecoverySystem {
  constructor(env) {
    this.env = env;
    this.recoveryAttempts = new Map();
    this.maxAttempts = 3;
    this.recoveryDelay = 5000; // 5 seconds
  }

  async handleFailure(sessionId, error) {
    const attempts = this.recoveryAttempts.get(sessionId) || 0;

    if (attempts >= this.maxAttempts) {
      await this.#handleUnrecoverable(sessionId, error);
      return false;
    }

    this.recoveryAttempts.set(sessionId, attempts + 1);
    return await this.#attemptRecovery(sessionId);
  }

  async #attemptRecovery(sessionId) {
    try {
      await this.#delay(this.recoveryDelay);
      const session = await this.env.WHATSAPP_MEDIA.get(`session:${sessionId}`);

      if (!session) {
        throw new Error('Session not found');
      }

      await this.env.WHATSAPP_SERVICE.reconnect(sessionId);
      this.recoveryAttempts.delete(sessionId);
      return true;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return false;
    }
  }

  async #handleUnrecoverable(sessionId, error) {
    try {
      // Log the unrecoverable error
      await this.env.DB.prepare(
        'INSERT INTO recovery_failures (session_id, error, timestamp) VALUES (?, ?, ?)'
      ).bind(
        sessionId,
        JSON.stringify(error),
        Date.now()
      ).run();

      // Clean up session
      await this.env.WHATSAPP_MEDIA.delete(`session:${sessionId}`);
      this.recoveryAttempts.delete(sessionId);

      // Notify monitoring system
      await this.env.MONITORING.trackMetric('recovery_failure', 1, {
        sessionId,
        error: error.message
      });
    } catch (cleanupError) {
      console.error('Cleanup after unrecoverable error failed:', cleanupError);
    }
  }

  async #delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRecoveryAttempts(sessionId) {
    return this.recoveryAttempts.get(sessionId) || 0;
  }

  resetRecoveryAttempts(sessionId) {
    this.recoveryAttempts.delete(sessionId);
  }
}
