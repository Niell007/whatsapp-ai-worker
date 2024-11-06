import { AI_CONFIG, SYSTEM_PROMPTS, AI_FUNCTIONS } from '../config/aiConfig.js';
import { RESPONSES } from '../utils/Constants.js';

export class AIHandler {
  constructor(env) {
    if (!env?.AI) {
      throw new Error(RESPONSES.ERROR.BINDING_NOT_FOUND);
    }
    this.env = env;
  }

  async generateTextResponse(message, systemPrompt = SYSTEM_PROMPTS.DEFAULT) {
    try {
      const response = await this.env.AI.run(AI_CONFIG.TEXT.model, {
        messages: [{
          role: 'system',
          content: systemPrompt
        }, {
          role: 'user',
          content: message
        }],
        ...AI_CONFIG.TEXT.options
      });

      if (!response?.response) {
        throw new Error(RESPONSES.ERROR.INVALID_RESPONSE);
      }

      return response.response;
    } catch (error) {
      console.error('Text generation error:', error);
      throw error;
    }
  }

  async analyzeImage(imageData) {
    try {
      const response = await this.env.AI.run(AI_CONFIG.IMAGE.analysis, {
        image: [...new Uint8Array(imageData)],
        function_call: AI_FUNCTIONS.IMAGE_ANALYSIS
      });

      if (!response) {
        throw new Error(RESPONSES.ERROR.INVALID_RESPONSE);
      }

      return response;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.env.AI.run(AI_CONFIG.IMAGE.generation, {
        prompt: prompt
      });

      return response;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioData) {
    try {
      const response = await this.env.AI.run(AI_CONFIG.VOICE.transcription, {
        audio: [...new Uint8Array(audioData)],
        ...AI_CONFIG.VOICE.options
      });

      if (!response) {
        throw new Error(RESPONSES.ERROR.INVALID_RESPONSE);
      }

      return response;
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text) {
    try {
      const response = await this.env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
        text: text
      });

      return response;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }

  async translateText(text, sourceLang = 'en', targetLang = 'fr') {
    try {
      const response = await this.env.AI.run('@cf/meta/m2m100-1.2b', {
        text: text,
        source_lang: sourceLang,
        target_lang: targetLang
      });

      return response;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts) {
    try {
      const response = await this.env.AI.run(AI_CONFIG.EMBEDDINGS.model, {
        text: Array.isArray(texts) ? texts : [texts],
        ...AI_CONFIG.EMBEDDINGS.options
      });

      return response;
    } catch (error) {
      console.error('Embeddings generation error:', error);
      throw error;
    }
  }
}

export default AIHandler;
