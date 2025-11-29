#!/bin/bash

# Quick Prisma Setup Script

echo "🔧 Setting up Prisma..."
echo ""

# Step 1: Reinstall Prisma packages with compatible version
echo "📦 Installing Prisma v5 (stable)..."
npm uninstall @prisma/client prisma
npm install @prisma/client@5.22.0 prisma@5.22.0

if [ $? -ne 0 ]; then
  echo "❌ Failed to install Prisma packages"
  exit 1
fi

echo "✅ Prisma packages installed"
echo ""

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Prisma Client generated successfully!"
  echo ""
  echo "Now you can run:"
  echo "  npm run start:dev"
else
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi
