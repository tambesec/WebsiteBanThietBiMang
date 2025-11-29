#!/bin/bash

# NetworkStore - Setup Script
# Run this script to set up the project from scratch

set -e  # Exit on error

echo "🚀 Starting NetworkStore setup..."
echo ""

# Step 1: Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Step 1/4: Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
  echo ""
else
  echo "✅ Step 1/4: Dependencies already installed"
  echo ""
fi

# Step 2: Generate Prisma Client
echo "🔧 Step 2/4: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 3: Check database connection
echo "🗄️  Step 3/4: Checking database connection..."
npx prisma db push --accept-data-loss
echo "✅ Database schema synchronized"
echo ""

# Step 4: Start development server
echo "🎉 Step 4/4: Starting development server..."
echo ""
echo "================================================"
echo "   NetworkStore API is ready!"
echo "================================================"
echo ""
echo "📍 API Base URL: http://localhost:3000/api/v1"
echo "🔐 Auth Endpoints: http://localhost:3000/api/v1/auth"
echo ""
echo "Available endpoints:"
echo "  - POST /api/v1/auth/register"
echo "  - POST /api/v1/auth/login"
echo "  - POST /api/v1/auth/refresh"
echo "  - GET  /api/v1/auth/profile"
echo "  - POST /api/v1/auth/logout"
echo "  - POST /api/v1/auth/change-password"
echo ""
echo "📚 See AUTH_DOCUMENTATION.md for detailed API docs"
echo ""
echo "Starting server..."
npm run start:dev
