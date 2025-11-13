# Start All Development Servers
# Script để chạy Backend, Admin và Client đồng thời

Write-Host "🚀 Starting all development servers..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path ".\server")) {
    Write-Host "❌ Error: Please run this script from the root project directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Project directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Function to check if dependencies are installed
function Test-Dependencies {
    param($Path)
    return Test-Path "$Path\node_modules"
}

# Check and install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

$projects = @{
    "server" = "Backend Server"
    "admin" = "Admin Dashboard"
    "client" = "Client Website"
}

foreach ($project in $projects.Keys) {
    $projectPath = ".\$project"
    if (Test-Path $projectPath) {
        $hasDeps = Test-Dependencies $projectPath
        if (-not $hasDeps) {
            Write-Host "   📥 Installing dependencies for $($projects[$project])..." -ForegroundColor Yellow
            Push-Location $projectPath
            npm install
            Pop-Location
            Write-Host "   ✅ $($projects[$project]) dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "   ✅ $($projects[$project]) dependencies already installed" -ForegroundColor Green
        }
    }
}

Write-Host ""

# Function to check if port is available
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return -not $connection
}

# Check ports
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow

$portsToCheck = @{
    5000 = "Backend Server"
    3001 = "Admin Dashboard"
    3000 = "Client Website"
}

$allPortsFree = $true
foreach ($port in $portsToCheck.Keys) {
    $portFree = Test-Port $port
    if (-not $portFree) {
        Write-Host "   ⚠️  Port $port ($($portsToCheck[$port])) is already in use" -ForegroundColor Red
        $allPortsFree = $false
    } else {
        Write-Host "   ✅ Port $port ($($portsToCheck[$port])) is available" -ForegroundColor Green
    }
}

Write-Host ""

if (-not $allPortsFree) {
    Write-Host "❌ Some ports are already in use. Please close the applications using these ports." -ForegroundColor Red
    Write-Host ""
    Write-Host "To find and kill processes:" -ForegroundColor Yellow
    Write-Host "   netstat -ano | findstr :5000" -ForegroundColor Gray
    Write-Host "   taskkill /PID <PID> /F" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Start Backend Server (Port 5000)
Write-Host "🔧 Starting Backend Server on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🔧 Backend Server (Port 5000)' -ForegroundColor Blue; cd server; npm run dev"
)

Start-Sleep -Seconds 5

# Start Admin Dashboard (Port 3001)
Write-Host "⚙️  Starting Admin Dashboard on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '⚙️  Admin Dashboard (Port 3001)' -ForegroundColor Magenta; cd admin; npm run dev"
)

Start-Sleep -Seconds 5

# Start Client Website (Port 3000)
Write-Host "🌐 Starting Client Website on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🌐 Client Website (Port 3000)' -ForegroundColor Green; cd client; npm run dev"
)

Write-Host ""
Write-Host "✅ All servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Yellow
Write-Host "   Backend API:       http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "   API Docs:          http://localhost:5000/docs" -ForegroundColor Cyan
Write-Host "   Admin Dashboard:   http://localhost:3001" -ForegroundColor Magenta
Write-Host "   Client Website:    http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: Wait 10-20 seconds for all servers to fully start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")