import { spawn } from 'child_process';
import { platform } from 'os';
import validateSetup from '../utils/validate.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const isWindows = platform() === 'win32';
const LOG_DIR = 'logs';

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function deploy() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = join(LOG_DIR, `deploy-${timestamp}.log`);

  try {
    // Create logs directory if it doesn't exist
    mkdirSync(LOG_DIR, { recursive: true });

    // Log deployment start
    const logEntry = `Deployment started at ${new Date().toISOString()}\n`;
    writeFileSync(logFile, logEntry);

    // Validate setup
    console.log('🔍 Validating project setup...');
    await validateSetup();

    // Install dependencies
    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install']);

    // Setup database
    console.log('🗄️ Setting up database...');
    await runCommand('npm', ['run', 'setup:db']);

    // Setup KV namespace
    console.log('🔑 Setting up KV namespace...');
    await runCommand('npm', ['run', 'setup:kv']);

    // Build project
    console.log('🏗️ Building project...');
    await runCommand('npm', ['run', 'build']);

    // Deploy to Cloudflare
    console.log('🚀 Deploying to Cloudflare...');
    await runCommand('npm', ['run', 'deploy']);

    // Log success
    const successLog = `Deployment completed successfully at ${new Date().toISOString()}\n`;
    writeFileSync(logFile, successLog, { flag: 'a' });

    console.log(`
✅ Deployment complete!
📱 Your WhatsApp AI Worker is now live
🌐 Visit: https://whatsapp-ai-worker.pages.dev
📝 Logs saved to: ${logFile}
    `);

  } catch (error) {
    // Log error
    const errorLog = `
Deployment failed at ${new Date().toISOString()}
Error: ${error.message}
Stack: ${error.stack}
    `;
    writeFileSync(logFile, errorLog, { flag: 'a' });

    console.error(`
❌ Deployment failed!
💡 Check the logs for details: ${logFile}
    `);
    process.exit(1);
  }
}

// Run deployment if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  deploy().catch(console.error);
}

export default deploy;
