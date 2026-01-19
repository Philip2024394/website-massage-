# ═══════════════════════════════════════════════════════════════════
# PERSISTENT SERVER LAUNCHER
# Starts the development server in a completely isolated process
# ═══════════════════════════════════════════════════════════════════

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      PERSISTENT SERVER - ISOLATED PROCESS LAUNCHER              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get workspace directory
$workspaceDir = "c:\Users\Victus\website-massage-"

# Verify workspace exists
if (-not (Test-Path $workspaceDir)) {
    Write-Host "❌ ERROR: Workspace directory not found: $workspaceDir" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Workspace: $workspaceDir" -ForegroundColor White

# Step 1: Kill all existing Node processes
Write-Host "`n🔄 Step 1: Cleaning up existing Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "   ✅ Cleanup complete" -ForegroundColor Green

# Step 2: Check if ports are available
Write-Host "`n🔍 Step 2: Checking port availability..." -ForegroundColor Yellow
$portsToCheck = @(3000, 3001, 3002)
foreach ($port in $portsToCheck) {
    $portUsed = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portUsed) {
        Write-Host "   ⚠️  Port $port is in use, attempting to free..." -ForegroundColor Yellow
        $processId = $portUsed.OwningProcess
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "   ✅ Port $port is available" -ForegroundColor Green
    }
}

# Step 3: Create the server startup script
Write-Host "`n📝 Step 3: Creating isolated server script..." -ForegroundColor Yellow
$serverScript = @"
# Isolated Server Process
Set-Location '$workspaceDir'
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PERSISTENT SERVER RUNNING" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Main App: http://127.0.0.1:3000/" -ForegroundColor Yellow
Write-Host "🔧 Admin Dashboard: http://127.0.0.1:3000/#/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: This window will stay open. Close it to stop the server." -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Start the server
pnpm dev

# If server exits, show error
Write-Host "`n❌ SERVER STOPPED" -ForegroundColor Red
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

$tempScriptPath = Join-Path $env:TEMP "isolated-server-$(Get-Date -Format 'yyyyMMddHHmmss').ps1"
$serverScript | Out-File -FilePath $tempScriptPath -Encoding UTF8
Write-Host "   ✅ Script created: $tempScriptPath" -ForegroundColor Green

# Step 4: Launch the server in a new window
Write-Host "`n🚀 Step 4: Launching server in isolated window..." -ForegroundColor Yellow
$processArgs = @{
    FilePath = "powershell.exe"
    ArgumentList = @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$tempScriptPath`""
    )
    WindowStyle = "Normal"
}

try {
    $process = Start-Process @processArgs -PassThru
    Write-Host "   ✅ Server process started (PID: $($process.Id))" -ForegroundColor Green
    
    # Wait for server to be ready
    Write-Host "`n⏳ Waiting for server to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $serverReady = $false
    
    while ($attempt -lt $maxAttempts -and -not $serverReady) {
        Start-Sleep -Seconds 1
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                Write-Host "   ✅ Server is ready!" -ForegroundColor Green
            }
        } catch {
            $attempt++
            Write-Host "   ⏳ Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if ($serverReady) {
        Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                ✅ SERVER IS RUNNING SUCCESSFULLY! ✅             ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host "`n🌐 ACCESS YOUR APPLICATION:" -ForegroundColor Cyan
        Write-Host "   • Main App: http://127.0.0.1:3000/" -ForegroundColor Yellow
        Write-Host "   • Admin Dashboard: http://127.0.0.1:3000/#/admin" -ForegroundColor Yellow
        Write-Host "`n💡 The server is running in a separate window (PID: $($process.Id))" -ForegroundColor White
        Write-Host "   To stop it, close that window or use: Stop-Process -Id $($process.Id)`n" -ForegroundColor White
        
        # Save process info
        $processInfo = @{
            PID = $process.Id
            StartTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        $processInfo | ConvertTo-Json | Out-File -FilePath "$workspaceDir\.server-pid" -Encoding UTF8
        
    } else {
        Write-Host "`n❌ Server failed to start within 30 seconds" -ForegroundColor Red
        Write-Host "   Check the server window for error messages" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Failed to start server: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
