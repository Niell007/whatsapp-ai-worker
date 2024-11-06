import { RESPONSES } from '../utils/Constants.js';

export class BindingsMiddleware {
  static verifyBindings(env) {
    const requiredBindings = {
      AI: 'Workers AI binding',
      BROWSER: 'Browser Rendering API binding',
      DB: 'D1 database binding',
      WHATSAPP_MEDIA: 'KV namespace binding'
    };

    const missingBindings = Object.entries(requiredBindings)
      .filter(([key]) => !env?.[key])
      .map(([_, name]) => name);

    if (missingBindings.length > 0) {
      throw new Error(
        `Missing required bindings: ${missingBindings.join(', ')}`
      );
    }
  }

  static async handle(request, env, ctx, next) {
    try {
      this.verifyBindings(env);
      return await next();
    } catch (error) {
      console.error('Bindings verification failed:', error);
      return new Response(JSON.stringify({
        error: RESPONSES.ERROR.BINDING_NOT_FOUND,
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
}

export default BindingsMiddleware;
