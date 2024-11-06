export class SecurityService {
  constructor(env) {
    this.env = env;
    this.maxAttempts = 3;
    this.lockoutDuration = 300000; // 5 minutes
  }

  async validateRequest(request, sessionId) {
    const ip = request.headers.get('cf-connecting-ip');
    const attempts = await this.#getAttempts(ip);

    if (await this.#isLocked(ip)) {
      throw new Error('Too many attempts. Please try again later.');
    }

    if (!this.#validateHeaders(request)) {
      await this.#incrementAttempts(ip);
      throw new Error('Invalid request headers');
    }

    return true;
  }

  #validateHeaders(request) {
    const requiredHeaders = ['cf-connecting-ip', 'user-agent'];
    return requiredHeaders.every(header => request.headers.has(header));
  }

  async #getAttempts(ip) {
    return parseInt(await this.env.WHATSAPP_MEDIA.get(`attempts:${ip}`)) || 0;
  }

  async #incrementAttempts(ip) {
    const attempts = await this.#getAttempts(ip);
    await this.env.WHATSAPP_MEDIA.put(`attempts:${ip}`, attempts + 1, {
      expirationTtl: 3600 // 1 hour
    });
  }

  async #isLocked(ip) {
    const attempts = await this.#getAttempts(ip);
    return attempts >= this.maxAttempts;
  }
}
