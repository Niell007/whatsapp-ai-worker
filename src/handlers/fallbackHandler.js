import { RESPONSES } from '../utils/Constants.js';

export class FallbackHandler {
  constructor(env) {
    this.env = env;
  }

  async handleError(error) {
    try {
      // Log error to D1
      await this.env.DB.prepare(
        'INSERT INTO errors (message, stack, timestamp) VALUES (?, ?, ?)'
      ).bind(error.message, error.stack, Date.now()).run();

      // Return appropriate error response
      const errorResponse = {
        error: RESPONSES.ERROR.GENERAL_ERROR,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        type: error.name
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
      return new Response(JSON.stringify({
        error: RESPONSES.ERROR.GENERAL_ERROR
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}

export default FallbackHandler;
