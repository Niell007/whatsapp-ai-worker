import { AIHandler } from './aiHandler.js';
import { MODELS } from '../utils/Constants.js';


export class ImageHandler {
  constructor(env) {
    this.env = env;
    this.aiHandler = new AIHandler(env);
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

      // Analyze image with ResNet model
      const analysis = await this.env.AI.run(MODELS.IMAGE_ANALYSIS, {
        image: media.data
      });

      // Generate AI response based on analysis
      const response = await this.aiHandler.generateResponse(
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
}

export default ImageHandler;
