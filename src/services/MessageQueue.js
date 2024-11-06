export class MessageQueue {
  constructor(env) {
    this.env = env;
    this.queue = new Map();
    this.processing = false;
  }

  async addMessage(sessionId, message) {
    if (!this.queue.has(sessionId)) {
      this.queue.set(sessionId, []);
    }
    this.queue.get(sessionId).push(message);

    if (!this.processing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    this.processing = true;

    try {
      for (const [sessionId, messages] of this.queue) {
        while (messages.length > 0) {
          const message = messages.shift();
          await this.processMessage(sessionId, message);
        }
        this.queue.delete(sessionId);
      }
    } finally {
      this.processing = false;
    }
  }

  async processMessage(sessionId, message) {
    const client = await this.env.WHATSAPP_SERVICE.getClient(sessionId);
    if (!client) return;

    try {
      const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [{
          role: 'user',
          content: message.body
        }]
      });

      await client.sendMessage(message.from, response.response);
    } catch (error) {
      console.error('Message processing error:', error);
    }
  }
}
