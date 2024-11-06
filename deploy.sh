#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting WhatsApp AI Worker deployment...${NC}"

# Clean previous build
echo -e "${GREEN}Cleaning previous build...${NC}"
rm -rf dist .wrangler

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Create D1 database
echo -e "${GREEN}Setting up database...${NC}"
wrangler d1 create ai-chat-db --yes || true
wrangler d1 execute ai-chat-db --file=./db/schema.sql

# Create KV namespace
echo -e "${GREEN}Setting up KV namespace...${NC}"
wrangler kv:namespace create WHATSAPP_MEDIA --yes || true

# Build project
echo -e "${GREEN}Building project...${NC}"
npm run build

# Deploy
echo -e "${GREEN}Deploying to Cloudflare Pages...${NC}"
npm run deploy

echo -e "${BLUE}Deployment complete! Visit: https://whatsapp-ai-worker.pages.dev${NC}"
