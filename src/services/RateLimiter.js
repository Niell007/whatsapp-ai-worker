export class RateLimiter {
  constructor(env) {
    this.env = env;
    this.limits = {
      messages: 60,  // messages per minute
      media: 30,     // media uploads per minute
      ai: 100        // AI requests per minute
    };
  }

  async checkLimit(sessionId, type) {
    const key = `ratelimit:${sessionId}:${type}`;
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    try {
      const current = await this.#getCurrentCount(key);
      if (current >= this.limits[type]) {
        throw new Error('Rate limit exceeded');
      }

      await this.#incrementCount(key);
      return true;
    } catch (error) {
      if (error.message === 'Rate limit exceeded') {
        throw error;
      }
      // If KV error, allow the request but log
      console.error('Rate limit check failed:', error);
      return true;
    }
  }

  async #getCurrentCount(key) {
    const current = await this.env.WHATSAPP_MEDIA.get(key);
    return current ? parseInt(current) : 0;
  }

  async #incrementCount(key) {
    const count = await this.#getCurrentCount(key);
    await this.env.WHATSAPP_MEDIA.put(key, count + 1, {
      expirationTtl: 60 // 1 minute
    });
  }
}
