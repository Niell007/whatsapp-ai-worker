export class ServiceManager {
  constructor(env) {
    this.env = env;
    this.services = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize core services
    await this.initializeServices([
      'security',
      'session',
      'messaging',
      'monitoring',
      'websocket',
      'ai'
    ]);

    // Start monitoring
    await this.startMonitoring();

    this.initialized = true;
  }

  async initializeServices(serviceNames) {
    for (const name of serviceNames) {
      const service = await this.createService(name);
      this.services.set(name, service);
    }
  }

  async createService(name) {
    switch (name) {
      case 'security':
        const { SecurityService } = await import('./SecurityService.js');
        return new SecurityService(this.env);
      case 'session':
        const { SessionManagerService } = await import('./SessionManagerService.js');
        return new SessionManagerService(this.env);
      case 'messaging':
        const { MessageProcessorService } = await import('./MessageProcessorService.js');
        return new MessageProcessorService(this.env);
      case 'monitoring':
        const { MonitoringService } = await import('./MonitoringService.js');
        return new MonitoringService(this.env);
      case 'websocket':
        const { WebSocketManagerService } = await import('./WebSocketManagerService.js');
        return new WebSocketManagerService(this.env);
      case 'ai':
        const { AIHandler } = await import('../handlers/aiHandler.js');
        return new AIHandler(this.env);
      default:
        throw new Error(`Unknown service: ${name}`);
    }
  }

  async startMonitoring() {
    const monitoring = this.services.get('monitoring');
    if (monitoring) {
      setInterval(() => {
        monitoring.checkHealth();
      }, 30000); // Every 30 seconds
    }
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service;
  }

  async cleanup() {
    for (const [name, service] of this.services.entries()) {
      if (typeof service.cleanup === 'function') {
        await service.cleanup();
      }
    }
  }
}
