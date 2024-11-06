import { ConfigValidator } from './ConfigValidator.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function validateSetup() {
  console.log('🔍 Validating project setup...');

  // Check required files
  const requiredFiles = [
    'wrangler.toml',
    'package.json',
    'public/index.html',
    'src/worker.js'
  ];

  for (const file of requiredFiles) {
    try {
      readFileSync(join(process.cwd(), file));
      console.log(`✅ Found ${file}`);
    } catch {
      console.error(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
  }

  // Check wrangler.toml configuration
  try {
    const wranglerConfig = readFileSync(join(process.cwd(), 'wrangler.toml'), 'utf8');
    const requiredBindings = ['AI', 'WHATSAPP_MEDIA', 'DB'];

    for (const binding of requiredBindings) {
      if (!wranglerConfig.includes(binding)) {
        console.error(`❌ Missing required binding in wrangler.toml: ${binding}`);
        process.exit(1);
      }
    }
    console.log('✅ Wrangler configuration validated');
  } catch (error) {
    console.error('❌ Error validating wrangler.toml:', error);
    process.exit(1);
  }

  // Check npm dependencies
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );
    const requiredDeps = [
      '@cloudflare/ai',
      '@wppconnect-team/wppconnect',
      'hono',
      'qrcode'
    ];

    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep]) {
        console.error(`❌ Missing required dependency: ${dep}`);
        process.exit(1);
      }
    }
    console.log('✅ Dependencies validated');
  } catch (error) {
    console.error('❌ Error validating package.json:', error);
    process.exit(1);
  }

  console.log('✅ All validations passed!');
  return true;
}

// Run validation if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  validateSetup().catch(console.error);
}

export default validateSetup;
