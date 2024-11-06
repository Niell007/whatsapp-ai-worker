# PowerShell deployment script
Write-Host "Starting WhatsApp AI Worker deployment..." -ForegroundColor Blue

# Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is required but not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check for wrangler
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "Installing wrangler globally..." -ForegroundColor Yellow
    npm install -g wrangler
}

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Green
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
if (Test-Path .wrangler) { Remove-Item -Recurse -Force .wrangler }

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Create D1 database
Write-Host "Setting up database..." -ForegroundColor Green
try {
    wrangler d1 create ai-chat-db
} catch {
    Write-Host "Database already exists, continuing..." -ForegroundColor Yellow
}
wrangler d1 execute ai-chat-db --file=./db/schema.sql

# Create KV namespace
Write-Host "Setting up KV namespace..." -ForegroundColor Green
try {
    wrangler kv:namespace create WHATSAPP_MEDIA
} catch {
    Write-Host "KV namespace already exists, continuing..." -ForegroundColor Yellow
}

# Build project
Write-Host "Building project..." -ForegroundColor Green
npm run build

# Deploy
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Green
npm run deploy

Write-Host "`nDeployment complete! Your application should be available at:" -ForegroundColor Blue
Write-Host "https://whatsapp-ai-worker.pages.dev" -ForegroundColor Green
Write-Host "Scan the QR code from that page with WhatsApp to start using the AI features" -ForegroundColor Blue
