export const AI_CONFIG = {
  // Text models
  TEXT: {
    model: "@cf/meta/llama-2-7b-chat-int8",
    options: {
      temperature: 0.7,
      maxTokens: 1000,
      stream: false
    }
  },

  // Image models
  IMAGE: {
    analysis: "@cf/microsoft/resnet-50",
    generation: "@cf/stabilityai/stable-diffusion-xl-base-1.0"
  },

  // Voice models
  VOICE: {
    transcription: "@cf/openai/whisper",
    options: {
      language: "en",
      response_format: "text"
    }
  },

  // Embeddings model
  EMBEDDINGS: {
    model: "@cf/baai/bge-small-en-v1.5",
    options: {
      dimensions: 384
    }
  }
};

// System prompts for different use cases
export const SYSTEM_PROMPTS = {
  DEFAULT: "You are a helpful WhatsApp assistant powered by Cloudflare AI.",
  IMAGE_ANALYSIS: "Analyze this image and provide a detailed description.",
  VOICE_CHAT: "You are transcribing and responding to voice messages."
};

// Function calling configurations
export const AI_FUNCTIONS = {
  IMAGE_ANALYSIS: {
    name: "analyzeImage",
    description: "Analyzes an image and returns a description",
    parameters: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Detailed description of the image"
        },
        objects: {
          type: "array",
          items: { type: "string" },
          description: "List of objects detected in the image"
        }
      }
    }
  }
};

export default {
  AI_CONFIG,
  SYSTEM_PROMPTS,
  AI_FUNCTIONS
};
