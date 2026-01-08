#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Always-On Preview Script - Ensures your app preview never shows offline text

.DESCRIPTION
    This script ensures your massage booking platform preview is always visible
    and automatically restarts the development server if it stops.
    
    Features:
    - Monitors development server status
    - Auto-restarts server if it stops
    - Opens Simple Browser preview automatically
    - Prevents "offline" messages
    - Logs all activities for debugging

.EXAMPLE
    .\always-preview.ps1
    Starts monitoring and keeps preview always active
#>

# Configuration
$ProjectPath = "C:\Users\Victus\website-massage-"
$ServerUrl = "http://127.0.0.1:3000"
$CheckInterval = 15  # seconds

# Colors for better visibility
$ColorSuccess = "Green"
$ColorWarning = "Yellow" 
$ColorError = "Red"
$ColorInfo = "Cyan"

Write-Host ""
Write-Host "🚀 ALWAYS-ON PREVIEW MONITOR" -ForegroundColor $ColorInfo
Write-Host "=================================" -ForegroundColor $ColorInfo
Write-Host "📱 Preview URL: $ServerUrl" -ForegroundColor $ColorSuccess
Write-Host "📁 Project: $ProjectPath" -ForegroundColor $ColorInfo
Write-Host "⏱️  Check interval: $CheckInterval seconds" -ForegroundColor $ColorInfo
Write-Host "⚠️  Press Ctrl+C to stop" -ForegroundColor $ColorWarning
Write-Host ""

# Change to project directory
Set-Location $ProjectPath

# Function to check if server is running
function Test-ServerStatus {
    try {
        $response = Invoke-WebRequest -Uri $ServerUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to start the development server
function Start-DevServer {
    Write-Host "🔄 Starting development server..." -ForegroundColor $ColorWarning
    
    # Kill any existing processes on port 3000
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess | 
                 Get-Process -Id { $_ } -ErrorAction SilentlyContinue
    
    if ($processes) {
        Write-Host "🔧 Stopping existing processes on port 3000..." -ForegroundColor $ColorWarning
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    
    # Start new server process
    $serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $ProjectPath -PassThru -WindowStyle Hidden
    
    # Wait for server to start
    $timeout = 30
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        
        if (Test-ServerStatus) {
            Write-Host "✅ Development server started successfully!" -ForegroundColor $ColorSuccess
            return $true
        }
        
        Write-Host "⏳ Waiting for server to start... ($elapsed/$timeout seconds)" -ForegroundColor $ColorWarning
    }
    
    Write-Host "❌ Server failed to start within $timeout seconds" -ForegroundColor $ColorError
    return $false
}

# Function to open Simple Browser
function Open-Preview {
    Write-Host "🌐 Opening Simple Browser preview..." -ForegroundColor $ColorInfo
    
    # Try to open VS Code Simple Browser (if available)
    try {
        code --command "simpleBrowser.show" --args "$ServerUrl" 2>$null
        Write-Host "✅ Simple Browser opened" -ForegroundColor $ColorSuccess
    }
    catch {
        Write-Host "📱 Simple Browser not available, opening system browser..." -ForegroundColor $ColorWarning
        Start-Process $ServerUrl
    }
}

# Initial server check and start
Write-Host "🔍 Checking initial server status..." -ForegroundColor $ColorInfo

if (-not (Test-ServerStatus)) {
    Write-Host "⚠️  Server is not running, starting it now..." -ForegroundColor $ColorWarning
    if (Start-DevServer) {
        Start-Sleep -Seconds 3
        Open-Preview
    } else {
        Write-Host "❌ Failed to start server. Please check for errors." -ForegroundColor $ColorError
        exit 1
    }
} else {
    Write-Host "✅ Server is already running!" -ForegroundColor $ColorSuccess
    Open-Preview
}

# Main monitoring loop
$consecutiveFailures = 0
$maxFailures = 3

Write-Host ""
Write-Host "👀 Monitoring server status..." -ForegroundColor $ColorInfo
Write-Host "   (Checking every $CheckInterval seconds)" -ForegroundColor $ColorInfo
Write-Host ""

while ($true) {
    Start-Sleep -Seconds $CheckInterval
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    if (Test-ServerStatus) {
        if ($consecutiveFailures -gt 0) {
            Write-Host "[$timestamp] ✅ Server recovered - Preview active" -ForegroundColor $ColorSuccess
            $consecutiveFailures = 0
        } else {
            Write-Host "[$timestamp] ✅ Server healthy - Preview active" -ForegroundColor $ColorSuccess
        }
    } else {
        $consecutiveFailures++
        Write-Host "[$timestamp] ❌ Server offline (attempt $consecutiveFailures/$maxFailures)" -ForegroundColor $ColorError
        
        if ($consecutiveFailures -ge $maxFailures) {
            Write-Host "[$timestamp] 🔄 Server down for $($consecutiveFailures * $CheckInterval) seconds, restarting..." -ForegroundColor $ColorWarning
            
            if (Start-DevServer) {
                $consecutiveFailures = 0
                Write-Host "[$timestamp] ✅ Server restarted - Preview should be active again" -ForegroundColor $ColorSuccess
            } else {
                Write-Host "[$timestamp] ❌ Failed to restart server" -ForegroundColor $ColorError
            }
        }
    }
}