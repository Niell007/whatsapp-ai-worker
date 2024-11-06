import { ServiceManager } from './services/ServiceManager.js';
import { ConfigManager } from './config/ConfigManager.js';
import { ErrorBoundary } from './utils/ErrorBoundary.js';

export async function initializeApplication(env) {
  try {
    // Initialize configuration
    const configManager = new ConfigManager(env);
    await configManager.initialize();

    // Initialize services
    const serviceManager = new ServiceManager(env);
    await serviceManager.initialize();

    // Run validation
    const { DeploymentValidator } = await import('./utils/DeploymentValidator.js');
    const validator = new DeploymentValidator(env);
    const validationResult = await validator.validateDeployment();

    if (!validationResult.success) {
      throw new Error('Deployment validation failed: ' + JSON.stringify(validationResult.results));
    }

    return {
      configManager,
      serviceManager
    };
  } catch (error) {
    await ErrorBoundary.handleError(error, { context: 'startup' });
    throw error;
  }
}
