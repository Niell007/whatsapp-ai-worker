import { RESPONSES } from './Constants.js';

export class ConfigValidator {
  constructor() {
    this.validators = new Map();
    this.#setupDefaultValidators();
  }

  async validate(config) {
    const results = {
      isValid: true,
      errors: []
    };

    for (const [key, value] of Object.entries(config)) {
      const validator = this.validators.get(key);
      if (validator) {
        const validationResult = await this.#validateField(key, value, validator);
        if (!validationResult.isValid) {
          results.isValid = false;
          results.errors.push(validationResult.error);
        }
      }
    }

    return results;
  }

  #setupDefaultValidators() {
    this.validators.set('maxConnections', {
      validate: (value) => {
        if (typeof value !== 'number' || value <= 0) {
          return {
            isValid: false,
            error: 'maxConnections must be a positive number'
          };
        }
        return { isValid: true };
      }
    });

    this.validators.set('sessionTimeout', {
      validate: (value) => {
        if (typeof value !== 'number' || value < 60000) {
          return {
            isValid: false,
            error: 'sessionTimeout must be at least 60000ms (1 minute)'
          };
        }
        return { isValid: true };
      }
    });

    this.validators.set('rateLimits', {
      validate: (value) => {
        if (typeof value !== 'object' || !value.messages || !value.media) {
          return {
            isValid: false,
            error: 'rateLimits must include messages and media limits'
          };
        }
        return { isValid: true };
      }
    });
  }

  async #validateField(key, value, validator) {
    try {
      return await validator.validate(value);
    } catch (error) {
      return {
        isValid: false,
        error: `Validation failed for ${key}: ${error.message}`
      };
    }
  }

  addValidator(key, validator) {
    if (typeof validator.validate !== 'function') {
      throw new Error('Validator must have a validate function');
    }
    this.validators.set(key, validator);
  }
}

export default ConfigValidator;
