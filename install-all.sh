#!/bin/bash
# Install All Dependencies Script for Linux/Mac
# Cài đặt tất cả dependencies cho Admin, Client và Server

echo "📦 Installing all dependencies..."
echo ""

start_time=$(date +%s)

# Function to install dependencies in a directory
install_dependencies() {
    local path=$1
    local name=$2
    
    if [ -d "$path" ]; then
        echo "📂 Installing $name dependencies..."
        cd "$path" || exit 1
        
        if [ -f "package.json" ]; then
            npm install
            echo "✅ $name dependencies installed successfully!"
        else
            echo "⚠️  No package.json found in $name"
        fi
        
        cd - > /dev/null || exit 1
        echo ""
    else
        echo "⚠️  $name directory not found at $path"
        echo ""
    fi
}

# Check if we're in the right directory
if [ ! -d "./server" ] || [ ! -d "./client" ]; then
    echo "❌ Error: Please run this script from the root project directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected structure: ./server, ./client, ./admin"
    exit 1
fi

echo "🏠 Project directory: $(pwd)"
echo ""

# Install dependencies for each app
install_dependencies "./server" "Server (NestJS Backend)"
install_dependencies "./client" "Client (Next.js Frontend)"
install_dependencies "./admin" "Admin (Next.js Dashboard)"

# Calculate total time
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ All dependencies installed successfully!"
echo "⏱️  Total time: $duration seconds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next steps:"
echo "   1. Run './start-dev.sh' to start all servers"
echo "   2. Or cd into each directory and run 'npm run dev'"
echo ""
