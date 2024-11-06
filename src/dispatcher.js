import { Hono } from 'hono';
import { ServiceRegistry } from './services/ServiceRegistry.js';
// @ts-ignore

export class MessageDispatcher {
  constructor(env) {
    this.env = env;
    this.services = new ServiceRegistry(env);
    this.app = new Hono();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.post('/api/message', this.handleMessage.bind(this));
    this.app.post('/api/media', this.handleMedia.bind(this));
    this.app.get('/api/history', this.getHistory.bind(this));
  }

  async handleMessage(c) {
    try {
      const { message } = await c.req.json();
      const chatHandler = this.services.getChatHandler();
      const dbService = this.services.getDatabaseService();

      const response = await chatHandler.handleMessage(message);
      await dbService.logMessage(message, response);

      return c.json({ response });
    } catch (error) {
      console.error('Error handling message:', error);
      const fallbackHandler = this.services.getFallbackHandler();
      return fallbackHandler.handleError(error);
    }
  }

  async handleMedia(c) {
    try {
      const formData = await c.req.formData();
      const file = formData.get('file');
      const mediaId = crypto.randomUUID();

      // Store media in KV
      await this.env.WHATSAPP_MEDIA.put(mediaId, await file.arrayBuffer(), {
        metadata: {
          type: file.type,
          name: file.name
        }
      });

      return c.json({ mediaId });

    } catch (error) {
      console.error('Error handling media:', error);
      const fallbackHandler = this.services.getFallbackHandler();
      return fallbackHandler.handleError(error);
    }
  }

  async getHistory(c) {
    try {
      const dbService = this.services.getDatabaseService();
      const messages = await dbService.getMessageHistory();
      return c.json(messages);
    } catch (error) {
      console.error('Error getting history:', error);
      const fallbackHandler = this.services.getFallbackHandler();
      return fallbackHandler.handleError(error);
    }
  }
}


export const createDispatcher = (env) => new MessageDispatcher(env);
