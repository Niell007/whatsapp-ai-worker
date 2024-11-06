export class DeploymentValidator {
  constructor(env) {
    this.env = env;
    this.requiredBindings = [
      'AI',
      'DB',
      'WHATSAPP_MEDIA',
      'WHATSAPP_SERVICE'
    ];
  }

  async validate() {
    const results = {
      bindings: await this.#checkBindings(),
      database: await this.#checkDatabase(),
      kvStore: await this.#checkKVStore(),
      ai: await this.#checkAIService()
    };

    return {
      isValid: Object.values(results).every(r => r.status === 'ok'),
      details: results
    };
  }

  async #checkBindings() {
    const missing = this.requiredBindings.filter(binding => !this.env[binding]);

    return {
      status: missing.length === 0 ? 'ok' : 'error',
      message: missing.length === 0 ? 'All bindings present' : `Missing bindings: ${missing.join(', ')}`
    };
  }

  async #checkDatabase() {
    try {
      await this.env.DB.prepare('SELECT 1').run();
      return {
        status: 'ok',
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Database check failed: ${error.message}`
      };
    }
  }

  async #checkKVStore() {
    try {
      const testKey = `test-${Date.now()}`;
      await this.env.WHATSAPP_MEDIA.put(testKey, 'test');
      await this.env.WHATSAPP_MEDIA.delete(testKey);
      return {
        status: 'ok',
        message: 'KV store operations successful'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `KV store check failed: ${error.message}`
      };
    }
  }

  async #checkAIService() {
    try {
      await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [{ role: 'user', content: 'test' }]
      });
      return {
        status: 'ok',
        message: 'AI service responding'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `AI service check failed: ${error.message}`
      };
    }
  }
}
