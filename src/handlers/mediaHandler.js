import { AIHandler } from './aiHandler.js';
import { WebCacheFactory } from '../utils/WebCacheFactory.js';
import { RESPONSES } from '../utils/Constants.js';

export class MediaHandler {
  constructor(env) {
    if (!env?.WHATSAPP_MEDIA || !env?.AI) {
      throw new Error(RESPONSES.ERROR.BINDING_NOT_FOUND);
    }
    this.env = env;
    this.aiHandler = new AIHandler(env);
    this.cache = new WebCacheFactory(env);
  }

  async handleImage(message) {
    try {
      const media = await message.downloadMedia();
      const mediaId = crypto.randomUUID();

      // Store in KV with metadata
      await this.env.WHATSAPP_MEDIA.put(mediaId, media.data, {
        metadata: {
          type: 'image',
          mimetype: media.mimetype,
          timestamp: Date.now()
        }
      });

      // Analyze image with AI
      const analysis = await this.aiHandler.analyzeImage(media.data);

      // Generate response based on analysis
      const response = await this.aiHandler.generateTextResponse(
        `Describe this image: ${analysis.description}`
      );

      // Log to D1
      await this.env.DB.prepare(
        'INSERT INTO messages (type, media_id, content, response, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).bind('image', mediaId, analysis.description, response, Date.now()).run();

      return new Response(JSON.stringify({
        mediaId,
        analysis,
        response
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error handling image:', error);
      throw error;
    }
  }

  async handleDocument(message) {
    try {
      const media = await message.downloadMedia();
      const mediaId = crypto.randomUUID();

      // Store in KV
      await this.env.WHATSAPP_MEDIA.put(mediaId, media.data, {
        metadata: {
          type: 'document',
          mimetype: media.mimetype,
          filename: media.filename,
          timestamp: Date.now()
        }
      });

      // Log to D1
      await this.env.DB.prepare(
        'INSERT INTO messages (type, media_id, timestamp) VALUES (?, ?, ?)'
      ).bind('document', mediaId, Date.now()).run();

      return new Response(JSON.stringify({
        mediaId,
        message: 'Document stored successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error handling document:', error);
      throw error;
    }
  }
}

export default MediaHandler;
