import { RESPONSES } from '../utils/Constants.js';

export class DatabaseService {
  constructor(env) {
    if (!env?.DB) {
      throw new Error(RESPONSES.ERROR.DB_NOT_FOUND);
    }
    this.db = env.DB;
  }

  async logMessage(message, response) {
    try {
      await this.db.prepare(`
        INSERT INTO messages (
          from_id,
          content,
          response,
          timestamp
        ) VALUES (?, ?, ?, ?)
      `).bind(
        message.from,
        message.body,
        response,
        Date.now()
      ).run();
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async getMessageHistory(limit = 50) {
    try {
      return await this.db.prepare(`
        SELECT * FROM messages
        ORDER BY timestamp DESC
        LIMIT ?
      `).bind(limit).all();
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async logError(error) {
    try {
      await this.db.prepare(`
        INSERT INTO errors (
          message,
          stack,
          timestamp
        ) VALUES (?, ?, ?)
      `).bind(
        error.message,
        error.stack,
        Date.now()
      ).run();
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
      throw dbError;
    }
  }
}

export default DatabaseService;
