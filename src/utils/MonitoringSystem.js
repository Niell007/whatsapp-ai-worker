export class MonitoringSystem {
  constructor(env) {
    this.env = env;
    this.metrics = new Map();
    this.alertThresholds = new Map();
    this.alertHandlers = new Map();
  }

  async trackMetric(name, value, tags = {}) {
    const metric = {
      value,
      tags,
      timestamp: Date.now()
    };

    await this.#storeMetric(name, metric);
    await this.#checkThresholds(name, value);
  }

  async #storeMetric(name, metric) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Persist to KV
    await this.env.WHATSAPP_MEDIA.put(
      `metric:${name}:${metric.timestamp}`,
      JSON.stringify(metric)
    );
  }

  async #checkThresholds(name, value) {
    const threshold = this.alertThresholds.get(name);
    if (!threshold) return;

    if (value > threshold.max || value < threshold.min) {
      await this.#triggerAlert(name, value, threshold);
    }
  }

  async #triggerAlert(name, value, threshold) {
    const handler = this.alertHandlers.get(name);
    if (handler) {
      await handler({
        metric: name,
        value,
        threshold,
        timestamp: Date.now()
      });
    }
  }

  setAlertThreshold(name, min, max) {
    this.alertThresholds.set(name, { min, max });
  }

  setAlertHandler(name, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Alert handler must be a function');
    }
    this.alertHandlers.set(name, handler);
  }

  async getMetrics(name, timeRange = 3600000) {
    const metrics = this.metrics.get(name) || [];
    const now = Date.now();
    return metrics.filter(m => now - m.timestamp < timeRange);
  }
}
