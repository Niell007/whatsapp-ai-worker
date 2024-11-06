import { spawn } from 'child_process';
import { platform } from 'os';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import validateSetup from '../utils/validate.js';

const isWindows = platform() === 'win32';
const LOG_DIR = 'logs';

async function runCommand(command, args, ignoreError = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows
    });

    proc.on('close', (code) => {
      if (code === 0 || ignoreError) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function deploy() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  mkdirSync(LOG_DIR, { recursive: true });
  const logFile = join(LOG_DIR, `deploy-${timestamp}.log`);

  try {
    // Log start
    console.log('🚀 Starting WhatsApp AI Worker deployment...');
    writeFileSync(logFile, `Deployment started at ${new Date().toISOString()}\n`);

    // Validate environment
    console.log('🔍 Validating setup...');
    await validateSetup();

    // Login check
    console.log('🔑 Checking Cloudflare authentication...');
    try {
      await runCommand('wrangler', ['whoami']);
    } catch {
      console.log('⚠️ Please login to Cloudflare:');
      await runCommand('wrangler', ['login']);
    }

    // Install dependencies
    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install']);

    // Create database (ignore error if exists)
    console.log('🗄️ Setting up database...');
    await runCommand('wrangler', ['d1', 'create', 'ai-chat-db'], true);
    await runCommand('wrangler', ['d1', 'execute', 'ai-chat-db', '--file=./db/schema.sql']);

    // Create KV namespace (ignore error if exists)
    console.log('🔑 Setting up KV namespace...');
    await runCommand('wrangler', ['kv:namespace', 'create', 'WHATSAPP_MEDIA'], true);

    // Clean before build
    console.log('🧹 Cleaning build artifacts...');
    await runCommand('npm', ['run', 'clean']);

    // Build project
    console.log('🏗️ Building project...');
    await runCommand('npm', ['run', 'build']);

    // Deploy
    console.log('🚀 Deploying to Cloudflare Pages...');
    await runCommand('npm', ['run', 'deploy']);

    // Log success
    const successLog = `Deployment completed successfully at ${new Date().toISOString()}\n`;
    writeFileSync(logFile, successLog, { flag: 'a' });

    console.log(`
✅ Deployment complete!
🌐 Your WhatsApp AI Worker is now live at: https://whatsapp-ai-worker.pages.dev
📝 Deployment logs saved to: ${logFile}

To use the application:
1. Visit the URL above
2. Scan the QR code with WhatsApp
3. Start chatting with the AI!

Available features:
- Text chat with AI
- Image analysis and generation
- Voice message transcription
- Document analysis
- Language translation
- Multi-device support
- Session persistence
    `);

  } catch (error) {
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
