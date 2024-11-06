export class ConfigManager {
  constructor(env) {
    this.env = env;
    this.config = null;
  }

  async initialize() {
    // Try to load from KV
    const storedConfig = await this.env.WHATSAPP_MEDIA.get('app_config');

    this.config = {
      app: {
        name: 'WhatsApp AI Worker',
        version: '1.0.0',
        environment: this.env.ENVIRONMENT || 'production'
      },
      security: {
        maxAttempts: 3,
        lockoutDuration: 300000,
        sessionTimeout: 3600000
      },
      ai: {
        maxTokens: 1000,
        temperature: 0.7,
        models: {
          chat: '@cf/meta/llama-2-7b-chat-int8',
          vision: '@cf/microsoft/resnet-50',
          voice: '@cf/openai/whisper'
        }
      },
      websocket: {
        heartbeatInterval: 30000,
        reconnectAttempts: 3
      },
      monitoring: {
        healthCheckInterval: 30000,
        metricsRetention: 86400000 // 24 hours
      },
      ...JSON.parse(storedConfig || '{}')
    };

    // Save merged config
    await this.saveConfig();
  }

  async saveConfig() {
    await this.env.WHATSAPP_MEDIA.put(
      'app_config',
      JSON.stringify(this.config)
    );
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  async update(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.config);
    target[lastKey] = value;
    await this.saveConfig();
  }
}
