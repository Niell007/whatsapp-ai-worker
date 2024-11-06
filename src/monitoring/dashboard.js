import { MonitoringService } from '../services/MonitoringService.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export class DeploymentDashboard {
  constructor(env) {
    this.env = env;
    this.monitoring = new MonitoringService(env);
  }

  async generateReport() {
    const health = await this.monitoring.checkHealth();
    const metrics = await this.getMetrics();
    const logs = await this.getRecentLogs();

    return {
      timestamp: new Date().toISOString(),
      status: this.#getOverallStatus(health),
      health,
      metrics,
      logs,
      recommendations: this.generateRecommendations(health, metrics)
    };
  }

  #getOverallStatus(health) {
    const statuses = Object.values(health);
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
    return 'degraded';
  }

  async getMetrics() {
    return {
      activeConnections: await this.monitoring.getMetrics('connections.active'),
      messageProcessed: await this.monitoring.getMetrics('messages.processed'),
      aiRequests: await this.monitoring.getMetrics('ai.requests'),
      errors: await this.monitoring.getMetrics('errors.count')
    };
  }

  async getRecentLogs() {
    try {
      const logDir = join(process.cwd(), 'logs');
      const files = readFileSync(logDir)
        .filter(f => f.endsWith('.log'))
        .sort()
        .reverse()
        .slice(0, 5);

      return files.map(file => {
        const content = readFileSync(join(logDir, file), 'utf8');
        return {
          file,
          content: content.split('\n').slice(-20).join('\n') // Last 20 lines
        };
      });
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  generateRecommendations(health, metrics) {
    const recommendations = [];

    if (health.database === 'unhealthy') {
      recommendations.push('Database health check failed. Verify D1 database configuration.');
    }

    if (health.whatsapp === 'inactive') {
      recommendations.push('No active WhatsApp connections. Check client initialization.');
    }

    if (metrics.errors.length > 0) {
      recommendations.push('Recent errors detected. Review error logs for details.');
    }

    return recommendations;
  }
}

export default DeploymentDashboard;
