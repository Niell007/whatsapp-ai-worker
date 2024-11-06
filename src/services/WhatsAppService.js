import { BrowserWhatsAppClient } from './BrowserWhatsAppClient.js';
import { RESPONSES } from '../utils/Constants.js';

export class WhatsAppService {
  constructor(env) {
    this.env = env;
    this.clients = new Map();
    this.sessions = new Map();
  }

  async createClient(sessionId, restoreSession = null) {
    try {
      const client = new BrowserWhatsAppClient(this.env);
      await this.#setupClientHandlers(client, sessionId);

      this.clients.set(sessionId, client);
      this.sessions.set(sessionId, {
        status: 'initializing',
        lastActive: Date.now()
      });

      return client;
    } catch (error) {
      console.error('Client creation error:', error);
      throw new Error(RESPONSES.ERROR.CLIENT_CREATION_FAILED);
    }
  }

  async #setupClientHandlers(client, sessionId) {
    client.on('qr', async (qrCode, attempt) => {
      await this.#handleQRCode(sessionId, qrCode, attempt);
    });

    client.on('ready', async () => {
      await this.#handleSessionStatus(sessionId, 'connected');
    });

    client.on('disconnected', async () => {
      await this.#handleSessionStatus(sessionId, 'disconnected');
    });
  }

  async #handleQRCode(sessionId, qrCode, attempt) {
    const session = this.sessions.get(sessionId);
    if (session?.ws) {
      session.ws.send(JSON.stringify({
        type: 'qr',
        data: qrCode,
        attempt
      }));
    }
  }

  async #handleSessionStatus(sessionId, status) {
    const session = this.sessions.get(sessionId);
    if (session?.ws) {
      session.ws.send(JSON.stringify({
        type: 'status',
        status,
        timestamp: Date.now()
      }));
    }
  }

  async attachWebSocket(sessionId, ws) {
    const session = this.sessions.get(sessionId) || {};
    session.ws = ws;
    this.sessions.set(sessionId, session);

    ws.addEventListener('close', () => {
      const session = this.sessions.get(sessionId);
      if (session) {
        delete session.ws;
        this.sessions.set(sessionId, session);
      }
    });
  }

  async disconnectClient(sessionId) {
    const client = this.clients.get(sessionId);
    if (client) {
      await client.close();
      this.clients.delete(sessionId);
      this.sessions.delete(sessionId);
      await this.env.WHATSAPP_MEDIA.delete(`session:${sessionId}`);
    }
  }

  async sendMessage(sessionId, to, message) {
    const client = this.clients.get(sessionId);
    if (!client) {
      throw new Error(RESPONSES.ERROR.CLIENT_NOT_FOUND);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      this.sessions.set(sessionId, session);
    }

    return client.sendText(to, message);
  }

  async getActiveClients() {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      status: session.status,
      lastActive: session.lastActive
    }));
  }

  async #cleanupInactiveSessions(maxInactiveTime = 3600000) {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActive > maxInactiveTime) {
        await this.disconnectClient(sessionId);
      }
    }
  }
}

export default WhatsAppService;
