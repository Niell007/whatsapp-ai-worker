import QRCode from 'qrcode';
import { WhatsAppService } from '../services/WhatsAppService.js';

export class WebSocketHandler {
  constructor(env) {
    this.env = env;
    this.whatsapp = new WhatsAppService(env);
  }

  async handle(c) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();

    // Set up WhatsApp event listeners
    this.whatsapp.on('qr', async (qr) => {
      try {
        const qrImage = await QRCode.toDataURL(qr);
        server.send(JSON.stringify({
          type: 'qr',
          data: qrImage
        }));
      } catch (error) {
        console.error('QR generation error:', error);
      }
    });

    this.whatsapp.on('ready', () => {
      server.send(JSON.stringify({
        type: 'status',
        status: 'connected'
      }));
    });

    this.whatsapp.on('disconnected', () => {
      server.send(JSON.stringify({
        type: 'status',
        status: 'disconnected'
      }));
    });

    // Initialize WhatsApp client
    await this.whatsapp.initialize();

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}

export default WebSocketHandler;
