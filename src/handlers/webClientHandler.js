import QRCode from 'qrcode';
import { WhatsAppService } from '../services/WhatsAppService.js';
import { AIHandler } from './aiHandler.js';

export class WebClientHandler {
  constructor(env) {
    this.env = env;
    this.whatsapp = new WhatsAppService(env);
    this.ai = new AIHandler(env);
    this.sessions = new Map();
  }

  async handleConnection(ws) {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      ws,
      status: 'initializing'
    });

    try {
      // Initialize WhatsApp client
      const client = await this.whatsapp.createClient(sessionId);

      client.on('qr', async (qr) => {
        const qrImage = await QRCode.toDataURL(qr);
        ws.send(JSON.stringify({
          type: 'qr',
          data: qrImage
        }));
      });

      client.on('ready', () => {
        this.sessions.get(sessionId).status = 'connected';
        ws.send(JSON.stringify({
          type: 'status',
          status: 'connected'
        }));
      });

      client.on('message', async (msg) => {
        try {
          // Process message with AI
          const response = await this.ai.generateTextResponse(msg.body);
          await client.sendMessage(msg.from, response);
        } catch (error) {
          console.error('Message handling error:', error);
        }
      });

      // Handle disconnection
      ws.addEventListener('close', () => {
        this.handleDisconnection(sessionId);
      });

    } catch (error) {
      console.error('WebClient initialization error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize WhatsApp client'
      }));
    }
  }

  async handleDisconnection(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.whatsapp.disconnectClient(sessionId);
      this.sessions.delete(sessionId);
    }
  }
}

export default WebClientHandler;
