import QRCode from 'qrcode';
import { AIHandler } from './aiHandler.js';
import { SessionManager } from '../services/SessionManager.js';
import { MessageQueue } from '../services/MessageQueue.js';

export class WhatsAppWebHandler {
  constructor(env) {
    this.env = env;
    this.ai = new AIHandler(env);
    this.sessions = new SessionManager(env);
    this.messageQueue = new MessageQueue(env);
  }

  async handleWebSocket(ws) {
    const sessionId = await this.sessions.createSession('web-client');

    try {
      const client = await this.env.WHATSAPP_SERVICE.createClient(sessionId);

      // Handle QR code generation
      client.on('qr', async (qrData) => {
        try {
          const qrImage = await QRCode.toDataURL(qrData);
          ws.send(JSON.stringify({
            type: 'qr',
            data: qrImage
          }));
        } catch (error) {
          console.error('QR generation error:', error);
        }
      });

      // Handle successful connection
      client.on('ready', async () => {
        await this.sessions.updateSessionStatus(sessionId, 'connected');
        ws.send(JSON.stringify({
          type: 'status',
          status: 'connected'
        }));
      });

      // Handle incoming messages
      client.on('message', async (message) => {
        try {
          // Queue message for processing
          await this.messageQueue.addMessage(sessionId, {
            type: message.type,
            from: message.from,
            body: message.body,
            hasMedia: message.hasMedia
          });
        } catch (error) {
          console.error('Message handling error:', error);
        }
      });

      // Handle media messages
      client.on('media_message', async (message) => {
        if (message.hasMedia) {
          const media = await message.downloadMedia();
          await this.handleMedia(sessionId, message.from, media);
        }
      });

      // Handle disconnection
      ws.addEventListener('close', async () => {
        await this.handleDisconnection(sessionId);
      });

    } catch (error) {
      console.error('WhatsApp Web initialization error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize WhatsApp Web'
      }));
    }
  }

  async handleMedia(sessionId, from, media) {
    try {
      let response;
      switch (media.mimetype.split('/')[0]) {
        case 'image':
          const analysis = await this.ai.analyzeImage(media.data);
          response = await this.ai.generateTextResponse(`Analyzing image: ${analysis.description}`);
          break;
        case 'audio':
          const transcription = await this.ai.transcribeAudio(media.data);
          response = await this.ai.generateTextResponse(`Processing voice message: ${transcription}`);
          break;
        default:
          response = "I received your media file but I'm not sure how to process it.";
      }

      await this.env.WHATSAPP_SERVICE.sendMessage(sessionId, from, response);
    } catch (error) {
      console.error('Media handling error:', error);
    }
  }

  async handleDisconnection(sessionId) {
    try {
      await this.sessions.updateSessionStatus(sessionId, 'disconnected');
      await this.env.WHATSAPP_SERVICE.disconnectClient(sessionId);
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }
}

export default WhatsAppWebHandler;
