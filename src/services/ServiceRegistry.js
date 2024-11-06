import { AIHandler } from '../handlers/aiHandler.js';
import { ChatHandler } from '../handlers/chatHandler.js';
import { MediaHandler } from '../handlers/mediaHandler.js';
import { VoiceHandler } from '../handlers/voiceHandler.js';
import { ImageHandler } from '../handlers/imageHandler.js';
import { WhatsAppService } from './WhatsAppService.js';
import { DatabaseService } from './DatabaseService.js';
import { FallbackHandler } from '../handlers/fallbackHandler.js';

export class ServiceRegistry {
  constructor(env) {
    if (!env) {
      throw new Error('Environment not provided to ServiceRegistry');
    }
    this.env = env;
    this.services = new Map();
  }

  get(ServiceClass) {
    if (!this.services.has(ServiceClass)) {
      this.services.set(ServiceClass, new ServiceClass(this.env));
    }
    return this.services.get(ServiceClass);
  }

  getAIHandler() {
    return this.get(AIHandler);
  }

  getChatHandler() {
    return this.get(ChatHandler);
  }

  getMediaHandler() {
    return this.get(MediaHandler);
  }

  getVoiceHandler() {
    return this.get(VoiceHandler);
  }

  getImageHandler() {
    return this.get(ImageHandler);
  }

  getWhatsAppService() {
    return this.get(WhatsAppService);
  }

  getDatabaseService() {
    return this.get(DatabaseService);
  }

  getFallbackHandler() {
    return this.get(FallbackHandler);
  }
}

export default ServiceRegistry;
