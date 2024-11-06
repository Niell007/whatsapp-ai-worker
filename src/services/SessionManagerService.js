export class SessionManagerService {
  constructor(env) {
    this.env = env;
    this.activeSessions = new Map();
    this.sessionTimeouts = new Map();
    this.maxInactiveTime = 3600000; // 1 hour
  }

  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      status: 'initializing',
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    // Store in memory
    this.activeSessions.set(sessionId, session);

    // Store in KV
    await this.env.WHATSAPP_MEDIA.put(`session:${sessionId}`, JSON.stringify(session));

    // Set cleanup timeout
    this.#setSessionTimeout(sessionId);

    return sessionId;
  }

  async getSession(sessionId) {
    // Try memory first
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId);
    }

    // Try KV
    const storedSession = await this.env.WHATSAPP_MEDIA.get(`session:${sessionId}`);
    if (storedSession) {
      const session = JSON.parse(storedSession);
      this.activeSessions.set(sessionId, session);
      return session;
    }

    return null;
  }

  async updateSession(sessionId, updates) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      lastActive: Date.now()
    };

    // Update memory
    this.activeSessions.set(sessionId, updatedSession);

    // Update KV
    await this.env.WHATSAPP_MEDIA.put(
      `session:${sessionId}`,
      JSON.stringify(updatedSession)
    );

    // Reset timeout
    this.#setSessionTimeout(sessionId);

    return updatedSession;
  }

  async #setSessionTimeout(sessionId) {
    if (this.sessionTimeouts.has(sessionId)) {
      clearTimeout(this.sessionTimeouts.get(sessionId));
    }

    const timeout = setTimeout(
      () => this.#cleanupSession(sessionId),
      this.maxInactiveTime
    );

    this.sessionTimeouts.set(sessionId, timeout);
  }

  async #cleanupSession(sessionId) {
    await this.env.WHATSAPP_MEDIA.delete(`session:${sessionId}`);
    this.activeSessions.delete(sessionId);
    this.sessionTimeouts.delete(sessionId);
  }
}
