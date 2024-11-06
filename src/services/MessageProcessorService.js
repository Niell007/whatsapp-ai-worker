export class MessageProcessorService {
  constructor(env) {
    this.env = env;
    this.messageQueue = new Map();
    this.processingQueue = false;
  }

  async processMessage(message, sessionId) {
    // Add to queue
    if (!this.messageQueue.has(sessionId)) {
      this.messageQueue.set(sessionId, []);
    }
    this.messageQueue.get(sessionId).push(message);

    // Start processing if not already running
    if (!this.processingQueue) {
      await this.#processQueuedMessages();
    }
  }

  async #processQueuedMessages() {
    this.processingQueue = true;

    try {
      for (const [sessionId, messages] of this.messageQueue.entries()) {
        while (messages.length > 0) {
          const message = messages.shift();
          await this.#handleMessage(message, sessionId);
        }
        this.messageQueue.delete(sessionId);
      }
    } finally {
      this.processingQueue = false;
    }
  }

  async #handleMessage(message, sessionId) {
    try {
      let response;

      switch (message.type) {
        case 'text':
          response = await this.#handleTextMessage(message);
          break;
        case 'image':
          response = await this.#handleImageMessage(message);
          break;
        case 'voice':
          response = await this.#handleVoiceMessage(message);
          break;
        default:
          response = "I don't understand this type of message yet.";
      }

      await this.#sendResponse(response, sessionId, message.from);
      await this.#logMessage(message, response, sessionId);

    } catch (error) {
      console.error('Message processing error:', error);
      throw error;
    }
  }

  async #handleTextMessage(message) {
    return await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [{ role: 'user', content: message.body }]
    });
  }

  async #handleImageMessage(message) {
    const analysis = await this.env.AI.run('@cf/microsoft/resnet-50', {
      image: message.data
    });
    return `I see: ${analysis.description}`;
  }

  async #handleVoiceMessage(message) {
    const transcription = await this.env.AI.run('@cf/openai/whisper', {
      audio: message.data
    });
    return await this.#handleTextMessage({ body: transcription });
  }

  async #sendResponse(response, sessionId, to) {
    await this.env.WHATSAPP_SERVICE.sendMessage(sessionId, to, response);
  }

  async #logMessage(message, response, sessionId) {
    await this.env.DB.prepare(
      'INSERT INTO messages (session_id, type, content, response, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      sessionId,
      message.type,
      message.body || '',
      response,
      Date.now()
    ).run();
  }
}
