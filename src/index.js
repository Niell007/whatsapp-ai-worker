import { ServiceManager } from './services/ServiceManager.js';
import { ErrorHandler } from './utils/ErrorHandler.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Initialize service manager
      const serviceManager = new ServiceManager(env);
      await serviceManager.initialize();

      // Handle request based on path
      const url = new URL(request.url);

      // WebSocket upgrade request
      if (request.headers.get('Upgrade') === 'websocket') {
        return await handleWebSocket(request, env, ctx);
      }

      // API routes
      switch (url.pathname) {
        case '/api/health':
          return await handleHealthCheck(env);
        case '/api/message':
          return await handleMessage(request, env);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      const errorHandler = new ErrorHandler(env);
      const errorResponse = await errorHandler.handleError(error);
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleWebSocket(request, env, ctx) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  const wsManager = await env.SERVICE_MANAGER.getService('websocket');
  await wsManager.handleConnection(server, request);

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}

async function handleHealthCheck(env) {
  const monitoring = await env.SERVICE_MANAGER.getService('monitoring');
  const status = await monitoring.checkHealth();

  return new Response(JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleMessage(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const messageProcessor = await env.SERVICE_MANAGER.getService('messaging');
  const data = await request.json();

  const response = await messageProcessor.processMessage(data);
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}
