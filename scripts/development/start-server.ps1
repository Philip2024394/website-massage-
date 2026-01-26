# ========================================
# SAFE SERVER STARTUP SCRIPT
# Ensures server runs and stays running
# ========================================

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         STARTING DEVELOPMENT SERVER WITH SAFEGUARDS             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Function to check if server is responding
function Test-ServerHealth {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to kill processes on specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow
    $processes = netstat -ano | Select-String ":$Port " | Select-String "LISTENING"
    if ($processes) {
        foreach ($proc in $processes) {
            $processId = ($proc -split '\s+')[-1]
            if ($processId -match '^\d+$') {
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✅ Killed process $processId on port $Port" -ForegroundColor Green
                } catch {
                    Write-Host "  ⚠️ Could not kill process $processId" -ForegroundColor Yellow
                }
            }
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  ✅ Port $Port is available" -ForegroundColor Green
    }
}

# Function to kill all node processes
function Stop-AllNodeProcesses {
    Write-Host "🔍 Stopping all Node.js processes..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Stopped Node process: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Could not stop process: $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
}

# Step 1: Clean up existing processes
Write-Host "`n📋 STEP 1: Cleaning up existing processes" -ForegroundColor Cyan
Write-Host "=" * 64
Stop-AllNodeProcesses
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 3001
Stop-ProcessOnPort 3002

# Step 2: Verify workspace directory
Write-Host "`n📋 STEP 2: Verifying workspace" -ForegroundColor Cyan
Write-Host "=" * 64
$workspacePath = "c:\Users\Victus\website-massage-"
if (Test-Path $workspacePath) {
    Set-Location $workspacePath
    Write-Host "  ✅ Workspace verified: $workspacePath" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: Workspace not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Check package.json exists
Write-Host "`n📋 STEP 3: Checking package.json" -ForegroundColor Cyan
Write-Host "=" * 64
if (Test-Path "package.json") {
    Write-Host "  ✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: package.json not found!" -ForegroundColor Red
    exit 1
}

# Step 4: Start the server
Write-Host "`n📋 STEP 4: Starting development server" -ForegroundColor Cyan
Write-Host "=" * 64
Write-Host "  🚀 Executing: pnpm dev" -ForegroundColor Yellow
Write-Host ""

# Create a flag file to indicate server should be running
$flagFile = Join-Path $workspacePath ".server-running"
"Started: $(Get-Date)" | Out-File -FilePath $flagFile

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  SERVER STARTING...                             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Expected URL: http://127.0.0.1:3000/" -ForegroundColor Cyan
Write-Host "🔧 Admin Dashboard: http://127.0.0.1:3000/#/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: DO NOT close this terminal window!" -ForegroundColor Yellow
Write-Host "    The server will stop if you close this window." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Server health will be monitored automatically..." -ForegroundColor Gray
Write-Host ""

# Start the server (this will block until server stops)
try {
    # Set error action to stop on errors
    $ErrorActionPreference = "Stop"
    
    # Start server and capture output
    & pnpm dev 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Host $line
        
        # Detect when server is ready
        if ($line -match "Local:.*http://127\.0\.0\.1:(\d+)") {
            $port = $Matches[1]
            Write-Host ""
            Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║              ✅ SERVER READY AND LISTENING!                     ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Main App: http://127.0.0.1:$port/" -ForegroundColor Cyan
            Write-Host "🔧 Admin Dashboard: http://127.0.0.1:$port/#/admin" -ForegroundColor Cyan
            Write-Host ""
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Server stopped unexpectedly!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    Remove-Item -Path $flagFile -ErrorAction SilentlyContinue
    exit 1
} finally {
    # Cleanup flag file when server stops
    if (Test-Path $flagFile) {
        Remove-Item -Path $flagFile -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "⚠️  Server has stopped." -ForegroundColor Yellow
Write-Host "Run this script again to restart: .\start-server.ps1" -ForegroundColor Cyan
Write-Host ""
