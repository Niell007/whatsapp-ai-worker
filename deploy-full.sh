#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting WhatsApp AI Worker full deployment...${NC}"

# Check for wrangler login
echo -e "${GREEN}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &>/dev/null; then
    echo -e "${BLUE}Please login to Cloudflare:${NC}"
    wrangler login
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Create D1 database if not exists
echo -e "${GREEN}Setting up D1 database...${NC}"
wrangler d1 create ai-chat-db || true
wrangler d1 execute ai-chat-db --file=./db/schema.sql

# Create KV namespace if not exists
echo -e "${GREEN}Setting up KV namespace...${NC}"
wrangler kv:namespace create WHATSAPP_MEDIA || true

# Build the project
echo -e "${GREEN}Building project...${NC}"
npm run build

# Deploy to Cloudflare Pages
echo -e "${GREEN}Deploying to Cloudflare Pages...${NC}"
npm run deploy

echo -e "${BLUE}Deployment complete! Your application should be available at:${NC}"
echo -e "${GREEN}https://whatsapp-ai-worker.pages.dev${NC}"
echo -e "${BLUE}Scan the QR code from that page with WhatsApp to start using the AI features${NC}"
