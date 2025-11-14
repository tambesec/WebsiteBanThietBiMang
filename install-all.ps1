# Install All Dependencies Script
# Cài đặt tất cả dependencies cho Admin, Client và Server

Write-Host "📦 Installing all dependencies..." -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# Function to install dependencies in a directory
function Install-Dependencies {
    param(
        [string]$Path,
        [string]$Name
    )
    
    if (Test-Path $Path) {
        Write-Host "📂 Installing $Name dependencies..." -ForegroundColor Cyan
        Push-Location $Path
        
        try {
            if (Test-Path "package.json") {
                npm install
                Write-Host "✅ $Name dependencies installed successfully!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  No package.json found in $Name" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Error installing $Name dependencies: $_" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        
        Pop-Location
        Write-Host ""
    } else {
        Write-Host "⚠️  $Name directory not found at $Path" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Check if we're in the right directory
if (-Not (Test-Path ".\server") -or -Not (Test-Path ".\client")) {
    Write-Host "❌ Error: Please run this script from the root project directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected structure: ./server, ./client, ./admin" -ForegroundColor Yellow
    exit 1
}

Write-Host "🏠 Project directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Install dependencies for each app
Install-Dependencies ".\server" "Server (NestJS Backend)"
Install-Dependencies ".\client" "Client (Next.js Frontend)"
Install-Dependencies ".\admin" "Admin (Next.js Dashboard)"

# Calculate total time
$endTime = Get-Date
$duration = $endTime - $startTime
$totalSeconds = [math]::Round($duration.TotalSeconds, 2)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ All dependencies installed successfully!" -ForegroundColor Green
Write-Host "⏱️  Total time: $totalSeconds seconds" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run '.\start-dev.ps1' to start all servers" -ForegroundColor White
Write-Host "   2. Or cd into each directory and run 'npm run dev'" -ForegroundColor White
Write-Host ""
