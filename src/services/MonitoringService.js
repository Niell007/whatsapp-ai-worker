export class MonitoringService {
  constructor(env) {
    this.env = env;
    this.metrics = new Map();
  }

  async trackMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    const metric = {
      name,
      value,
      tags,
      timestamp
    };

    // Store in memory
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Store in KV for persistence
    await this.env.WHATSAPP_MEDIA.put(
      `metric:${name}:${timestamp}`,
      JSON.stringify(metric)
    );
  }

  async getMetrics(name, timeRange = 3600000) { // Default 1 hour
    const now = Date.now();
    const metrics = this.metrics.get(name) || [];

    return metrics.filter(m => now - m.timestamp < timeRange);
  }

  async checkHealth() {
    const status = {
      ai: await this.#checkAIService(),
      database: await this.#checkDatabase(),
      whatsapp: await this.#checkWhatsAppService()
    };

    await this.trackMetric('system.health', 1, status);
    return status;
  }

  async #checkAIService() {
    try {
      await this.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [{ role: 'user', content: 'test' }]
      });
      return 'healthy';
    } catch {
      return 'unhealthy';
    }
  }

  async #checkDatabase() {
    try {
      await this.env.DB.prepare('SELECT 1').run();
      return 'healthy';
    } catch {
      return 'unhealthy';
    }
  }

  async #checkWhatsAppService() {
    try {
      const activeSessions = await this.env.WHATSAPP_SERVICE.getActiveClients();
      return activeSessions.length > 0 ? 'healthy' : 'inactive';
    } catch {
      return 'unhealthy';
    }
  }
}
