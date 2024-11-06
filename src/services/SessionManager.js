import { DatabaseService } from './DatabaseService.js';

export class SessionManager {
  constructor(env) {
    this.env = env;
    this.db = new DatabaseService(env);
    this.activeSessions = new Map();
  }

  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const timestamp = Date.now();

    await this.db.execute(
      'INSERT INTO sessions (session_id, user_id, status, created_at) VALUES (?, ?, ?, ?)',
      [sessionId, userId, 'initializing', timestamp]
    );

    this.activeSessions.set(sessionId, {
      userId,
      status: 'initializing',
      timestamp
    });

    return sessionId;
  }

  async updateSessionStatus(sessionId, status) {
    await this.db.execute(
      'UPDATE sessions SET status = ? WHERE session_id = ?',
      [status, sessionId]
    );

    if (this.activeSessions.has(sessionId)) {
      this.activeSessions.get(sessionId).status = status;
    }
  }

  async getSession(sessionId) {
    return this.activeSessions.get(sessionId) ||
           await this.db.queryOne('SELECT * FROM sessions WHERE session_id = ?', [sessionId]);
  }
}
