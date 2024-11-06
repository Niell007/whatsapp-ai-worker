#!/bin/bash

echo "Running pre-deployment checks..."

# Run tests
npm run test

# Check security
npm run security-audit

# Validate configurations
npm run validate-config

# If all checks pass, deploy
if [ $? -eq 0 ]; then
  echo "All checks passed. Deploying..."
  npm run deploy:prod
else
  echo "Checks failed. Deployment aborted."
  exit 1
fi
