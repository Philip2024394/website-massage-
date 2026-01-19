# ========================================
# QUICK START - Development Server
# One command to rule them all
# ========================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          INDASTREET MASSAGE PLATFORM - QUICK START             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ℹ️  Note: Not running as administrator (that's fine)" -ForegroundColor Gray
    Write-Host ""
}

# Menu
Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1) Start server (with safeguards)" -ForegroundColor White
Write-Host "  2) Start server + health monitor (2 windows)" -ForegroundColor White
Write-Host "  3) Check server status" -ForegroundColor White
Write-Host "  4) Stop all servers" -ForegroundColor White
Write-Host "  5) Quick restart" -ForegroundColor White
Write-Host "  6) Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting server with safeguards..." -ForegroundColor Cyan
        Write-Host ""
        & "$PSScriptRoot\start-server.ps1"
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Starting server and health monitor..." -ForegroundColor Cyan
        Write-Host ""
        
        # Start server in new window
        Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-server.ps1"
        Start-Sleep -Seconds 3
        
        # Start monitor in new window
        Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\monitor-server.ps1"
        
        Write-Host "✅ Server and monitor started in separate windows" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Main App: http://127.0.0.1:3000/" -ForegroundColor Cyan
        Write-Host "🔧 Admin Dashboard: http://127.0.0.1:3000/#/admin" -ForegroundColor Cyan
        Write-Host ""
        
        Start-Sleep -Seconds 2
    }
    "3" {
        Write-Host ""
        Write-Host "🔍 Checking server status..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check port 3000
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Server is RUNNING on port 3000" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Server is NOT responding on port 3000" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
        
        Write-Host ""
        
        # Check for processes
        $nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
        if ($nodeProcesses) {
            Write-Host "📋 Node.js processes found:" -ForegroundColor Cyan
            $nodeProcesses | ForEach-Object {
                Write-Host "   PID: $($_.Id) - $($_.ProcessName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  No Node.js processes running" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    "4" {
        Write-Host ""
        Write-Host "🛑 Stopping all servers..." -ForegroundColor Yellow
        Write-Host ""
        
        # Kill all node processes
        Get-Process | Where-Object {$_.ProcessName -like "*node*"} | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Stopped process: $($_.Id)" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "✅ All servers stopped" -ForegroundColor Green
        Write-Host ""
        Start-Sleep -Seconds 2
    }
    "5" {
        Write-Host ""
        Write-Host "🔄 Quick restart..." -ForegroundColor Cyan
        Write-Host ""
        
        # Stop all
        Write-Host "Stopping existing servers..." -ForegroundColor Yellow
        Get-Process | Where-Object {$_.ProcessName -like "*node*"} | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
        
        # Start new
        Write-Host "Starting fresh server..." -ForegroundColor Green
        Write-Host ""
        & "$PSScriptRoot\start-server.ps1"
    }
    "6" {
        Write-Host ""
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        Write-Host ""
        exit
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        Write-Host ""
    }
}
