# PowerShell deployment script
Write-Host "Starting WhatsApp AI Worker full deployment..." -ForegroundColor Blue

# Check for wrangler login
Write-Host "Checking Cloudflare authentication..." -ForegroundColor Green
try {
    wrangler whoami | Out-Null
} catch {
    Write-Host "Please login to Cloudflare:" -ForegroundColor Blue
    wrangler login
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Create D1 database if not exists
Write-Host "Setting up D1 database..." -ForegroundColor Green
try {
    wrangler d1 create ai-chat-db
} catch {
    Write-Host "Database already exists, continuing..." -ForegroundColor Yellow
}
wrangler d1 execute ai-chat-db --file=./db/schema.sql

# Create KV namespace if not exists
Write-Host "Setting up KV namespace..." -ForegroundColor Green
try {
    wrangler kv:namespace create WHATSAPP_MEDIA
} catch {
    Write-Host "KV namespace already exists, continuing..." -ForegroundColor Yellow
}

# Build the project
Write-Host "Building project..." -ForegroundColor Green
npm run build

# Deploy to Cloudflare Pages
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Green
npm run deploy

Write-Host "`nDeployment complete! Your application should be available at:" -ForegroundColor Blue
Write-Host "https://whatsapp-ai-worker.pages.dev" -ForegroundColor Green
Write-Host "Scan the QR code from that page with WhatsApp to start using the AI features" -ForegroundColor Blue
