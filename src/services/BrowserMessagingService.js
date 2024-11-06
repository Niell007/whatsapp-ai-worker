export class BrowserMessagingService {
  constructor(env) {
    this.env = env;
    this.connections = new Map();
  }

  async handleConnection(ws, sessionId) {
    this.connections.set(sessionId, ws);

    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(sessionId, data);
      } catch (error) {
        console.error('Message handling error:', error);
      }
    });

    ws.addEventListener('close', () => {
      this.connections.delete(sessionId);
    });
  }

  async handleMessage(sessionId, data) {
    const ws = this.connections.get(sessionId);
    if (!ws) return;

    switch (data.type) {
      case 'text':
        await this.handleTextMessage(sessionId, data);
        break;
      case 'media':
        await this.handleMediaMessage(sessionId, data);
        break;
      case 'voice':
        await this.handleVoiceMessage(sessionId, data);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  async handleTextMessage(sessionId, data) {
    const response = await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [{
        role: 'user',
        content: data.content
      }]
    });

    this.sendResponse(sessionId, {
      type: 'text',
      content: response.response
    });
  }

  async handleMediaMessage(sessionId, data) {
    const mediaId = await this.storeMedia(data.content);
    const analysis = await this.env.AI.run('@cf/microsoft/resnet-50', {
      image: data.content
    });

    this.sendResponse(sessionId, {
      type: 'media_response',
      mediaId,
      analysis
    });
  }

  async handleVoiceMessage(sessionId, data) {
    const transcription = await this.env.AI.run('@cf/openai/whisper', {
      audio: data.content
    });

    const response = await this.handleTextMessage(sessionId, {
      content: transcription
    });

    this.sendResponse(sessionId, {
      type: 'voice_response',
      transcription,
      response
    });
  }

  async storeMedia(content) {
    const mediaId = crypto.randomUUID();
    await this.env.WHATSAPP_MEDIA.put(mediaId, content);
    return mediaId;
  }

  sendResponse(sessionId, response) {
    const ws = this.connections.get(sessionId);
    if (ws) {
      ws.send(JSON.stringify(response));
    }
  }

  broadcast(message) {
    for (const ws of this.connections.values()) {
      ws.send(JSON.stringify(message));
    }
  }
}
