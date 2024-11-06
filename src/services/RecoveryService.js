export class RecoveryService {
  constructor(env) {
    this.env = env;
    this.recoveryAttempts = new Map();
  }

  async handleDisconnection(sessionId) {
    const attempts = this.recoveryAttempts.get(sessionId) || 0;

    if (attempts < 3) {
      await this.#attemptReconnection(sessionId, attempts);
    } else {
      await this.#handleFailedRecovery(sessionId);
    }
  }

  async #attemptReconnection(sessionId, attempts) {
    try {
      const session = await this.env.WHATSAPP_MEDIA.get(`session:${sessionId}`);
      if (session) {
        await this.env.WHATSAPP_SERVICE.createClient(sessionId, session);
        this.recoveryAttempts.delete(sessionId);
      }
    } catch (error) {
      this.recoveryAttempts.set(sessionId, attempts + 1);
      throw error;
    }
  }

  async #handleFailedRecovery(sessionId) {
    // Clean up failed session
    await this.env.WHATSAPP_MEDIA.delete(`session:${sessionId}`);
    this.recoveryAttempts.delete(sessionId);

    // Log failure
    await this.env.DB.prepare(
      'INSERT INTO recovery_failures (session_id, timestamp) VALUES (?, ?)'
    ).bind(sessionId, Date.now()).run();
  }

  async monitorSessions() {
    const sessions = await this.env.WHATSAPP_SERVICE.getActiveClients();
    for (const session of sessions) {
      if (session.status === 'disconnected') {
        await this.handleDisconnection(session.id);
      }
    }
  }
}
