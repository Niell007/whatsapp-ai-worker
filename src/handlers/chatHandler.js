import { AIHandler } from './aiHandler.js';
import { MediaHandler } from './mediaHandler.js';
import { VoiceHandler } from './voiceHandler.js';
import { ImageHandler } from './imageHandler.js';
import { FallbackHandler } from './fallbackHandler.js';
import { RESPONSES } from '../utils/Constants.js';

export class ChatHandler {
  constructor(env) {
    if (!env?.AI) {
      throw new Error(RESPONSES.ERROR.BINDING_NOT_FOUND);
    }
    this.env = env;
    this.aiHandler = new AIHandler(env);
    this.mediaHandler = new MediaHandler(env);
    this.voiceHandler = new VoiceHandler(env);
    this.imageHandler = new ImageHandler(env);
    this.fallbackHandler = new FallbackHandler(env);
  }

  async handleMessage(request) {
    try {
      const data = await request.json();
      const message = data.message;

      if (!message) {
        throw new Error('No message provided');
      }

      // Handle different message types
      if (message.hasMedia) {
        return await this.handleMediaMessage(message);
      }

      // Handle regular text messages
      const response = await this.aiHandler.generateTextResponse(message.body);

      return new Response(JSON.stringify({ response }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error in handleMessage:', error);
      return this.fallbackHandler.handleError(error);
    }
  }

  async handleMediaMessage(message) {
    const mediaType = message.type;
    switch (mediaType) {
      case 'image':
        return await this.imageHandler.handleImage(message);
      case 'audio':
      case 'voice':
        return await this.voiceHandler.handleVoice(message);
      case 'document':
        return await this.mediaHandler.handleDocument(message);
      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }
  }

  async handleImageGeneration(prompt) {
    try {
      const image = await this.aiHandler.generateImage(prompt);
      return new Response(JSON.stringify({ image }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }
}

export default ChatHandler;
