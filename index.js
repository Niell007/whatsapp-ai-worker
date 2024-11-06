import { Router } from '@cloudflare/workers-router';
import { createDispatcher } from './src/dispatcher.js';
import { WhatsAppService } from './src/services/WhatsAppService.js';

// Create router instance
const router = new Router();

// Route definitions
router.get('/', async (request, env, ctx) => {
  return env.ASSETS.fetch(request);
});

router.get('/qr', async (request, env, ctx) => {
  const whatsapp = new WhatsAppService(env);
  const qrCode = await whatsapp.getQRCode();

  return new Response(qrCode, {
    headers: { 'Content-Type': 'text/html' }
  });
});

router.post('/api/chat', async (request, env, ctx) => {
  const dispatcher = createDispatcher(env);
  return dispatcher.handleMessage(request);
});

// WebSocket upgrade handler
router.get('/ws', async (request, env, ctx) => {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  server.accept();
  const whatsapp = new WhatsAppService(env);

  await whatsapp.handleWebSocket(server);

  return new Response(null, {
    status: 101,
    webSocket: client
  });
});

// Export for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle routing
      return router.handle(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
