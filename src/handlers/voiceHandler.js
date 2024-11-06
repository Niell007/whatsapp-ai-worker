import { AIHandler } from './aiHandler.js';
import { RESPONSES } from '../utils/Constants.js';
import { WebCacheFactory } from '../utils/WebCacheFactory.js';

export class VoiceHandler {
  constructor(env) {
    if (!env?.AI || !env?.WHATSAPP_MEDIA) {
      throw new Error(RESPONSES.ERROR.BINDING_NOT_FOUND);
    }
    this.env = env;
    this.aiHandler = new AIHandler(env);
    this.cache = new WebCacheFactory(env);
  }

  async handleVoice(message) {
    try {
      const media = await message.downloadMedia();
      const mediaId = crypto.randomUUID();

      // Store in KV with metadata
      await this.env.WHATSAPP_MEDIA.put(mediaId, media.data, {
        metadata: {
          type: 'voice',
          mimetype: media.mimetype,
          timestamp: Date.now()
        }
      });

      // Transcribe audio
      const transcription = await this.aiHandler.transcribeAudio(media.data);

      // Generate AI response to transcription
      const response = await this.aiHandler.generateTextResponse(transcription);

      // Log to D1
      await this.env.DB.prepare(
        'INSERT INTO messages (type, media_id, transcription, response, timestamp) VALUES (?, ?, ?, ?, ?)'
      ).bind('voice', mediaId, transcription, response, Date.now()).run();

      return new Response(JSON.stringify({
        mediaId,
        transcription,
        response
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error handling voice:', error);
      throw error;
    }
  }
}

export default VoiceHandler;
