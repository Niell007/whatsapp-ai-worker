#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting WhatsApp AI Worker deployment...${NC}"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is required but not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Run validation
echo -e "${GREEN}Validating setup...${NC}"
npm run validate

# Create D1 database
echo -e "${GREEN}Setting up database...${NC}"
wrangler d1 create ai-chat-db --yes || true
wrangler d1 execute ai-chat-db --file=./db/schema.sql

# Create KV namespace
echo -e "${GREEN}Setting up KV namespace...${NC}"
wrangler kv:namespace create WHATSAPP_MEDIA --yes || true

# Build the project
echo -e "${GREEN}Building project...${NC}"
npm run build

# Start local development server
echo -e "${GREEN}Starting local development server...${NC}"
echo -e "${BLUE}Visit http://localhost:8787 to test locally${NC}"
npm run dev
