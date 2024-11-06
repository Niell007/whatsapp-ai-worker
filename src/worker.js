import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initializeApplication } from './startup.js';

const app = new Hono();
let serviceManager = null;
let configManager = null;

// Initialize application
app.use('*', async (c, next) => {
  if (!serviceManager) {
    const initialized = await initializeApplication(c.env);
    serviceManager = initialized.serviceManager;
    configManager = initialized.configManager;
  }
  await next();
});

// Add middleware
app.use('*', cors());
app.use('*', logger());

// WebSocket handler
app.get('/ws', async (c) => {
  if (c.req.header('Upgrade') !== 'websocket') {
    return c.text('Expected WebSocket', 400);
  }

  const websocketService = serviceManager.getService('websocket');
  return websocketService.handleConnection(c);
});

// Health check
app.get('/health', async (c) => {
  const monitoring = serviceManager.getService('monitoring');
  return c.json(await monitoring.checkHealth());
});

// Static files
app.get('/*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
