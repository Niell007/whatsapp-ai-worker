export const SYSTEM_PROMPT = "You are a helpful AI assistant that responds through WhatsApp.";

export const MAX_TOKENS = 1000;

export const MODELS = {
  TEXT: "@cf/meta/llama-2-7b-chat-int8",
  VOICE_RECOGNITION: "@cf/openai/whisper",
  IMAGE_ANALYSIS: "@cf/microsoft/resnet-50",
  IMAGE_GENERATION: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  EMBEDDINGS: "@cf/baai/bge-small-en-v1.5"
};

export const AI_PARAMS = {
  temperature: 0.7,
  top_p: 0.9,
  stream: false,
  max_tokens: MAX_TOKENS
};

export const RESPONSES = {
  ERROR: {
    BINDING_NOT_FOUND: 'Required binding not found in environment',
    INVALID_RESPONSE: 'Invalid AI response format',
    CLIENT_CREATION_FAILED: 'Failed to create WhatsApp client',
    CLIENT_NOT_FOUND: 'WhatsApp client not found for session',
    MEDIA_ERROR: 'Error processing media file',
    GENERAL_ERROR: 'An error occurred while processing your request'
  },
  STATUS: {
    INITIALIZING: 'initializing',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
  }
};

export default {
  SYSTEM_PROMPT,
  MAX_TOKENS,
  MODELS,
  AI_PARAMS,
  RESPONSES
};
