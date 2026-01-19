# ========================================
# SERVER HEALTH MONITOR
# Checks server health and alerts if down
# ========================================

param(
    [int]$Port = 3000,
    [int]$CheckIntervalSeconds = 10
)

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              SERVER HEALTH MONITOR STARTED                      ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "Monitoring: http://127.0.0.1:$Port/" -ForegroundColor Cyan
Write-Host "Check interval: $CheckIntervalSeconds seconds" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring`n" -ForegroundColor Gray

$consecutiveFailures = 0
$maxConsecutiveFailures = 3
$lastSuccessTime = Get-Date

function Test-ServerHealth {
    param([int]$Port)
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        return @{
            IsHealthy = $true
            StatusCode = $response.StatusCode
            Message = "Server responding"
        }
    } catch {
        return @{
            IsHealthy = $false
            StatusCode = $null
            Message = $_.Exception.Message
        }
    }
}

function Get-ProcessOnPort {
    param([int]$Port)
    $processes = netstat -ano | Select-String ":$Port " | Select-String "LISTENING"
    if ($processes) {
        $processId = ($processes[0] -split '\s+')[-1]
        if ($processId -match '^\d+$') {
            try {
                $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
                return $proc
            } catch {
                return $null
            }
        }
    }
    return $null
}

$checkCount = 0
while ($true) {
    $checkCount++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] Check #$checkCount - " -NoNewline -ForegroundColor Gray
    
    $health = Test-ServerHealth -Port $Port
    
    if ($health.IsHealthy) {
        Write-Host "✅ HEALTHY" -ForegroundColor Green -NoNewline
        Write-Host " (HTTP $($health.StatusCode))" -ForegroundColor Gray
        $consecutiveFailures = 0
        $lastSuccessTime = Get-Date
    } else {
        $consecutiveFailures++
        Write-Host "❌ DOWN" -ForegroundColor Red -NoNewline
        Write-Host " (Failure $consecutiveFailures/$maxConsecutiveFailures)" -ForegroundColor Yellow
        
        # Check if process exists on port
        $proc = Get-ProcessOnPort -Port $Port
        if ($proc) {
            Write-Host "  ℹ️  Process exists: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Cyan
        } else {
            Write-Host "  ⚠️  No process listening on port $Port" -ForegroundColor Yellow
        }
        
        if ($consecutiveFailures -ge $maxConsecutiveFailures) {
            $downDuration = (Get-Date) - $lastSuccessTime
            Write-Host ""
            Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
            Write-Host "║                  ⚠️  CRITICAL ALERT ⚠️                          ║" -ForegroundColor Red
            Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
            Write-Host ""
            Write-Host "Server has been down for $($downDuration.TotalSeconds) seconds!" -ForegroundColor Red
            Write-Host "Consecutive failures: $consecutiveFailures" -ForegroundColor Red
            Write-Host ""
            Write-Host "🔧 RECOMMENDED ACTIONS:" -ForegroundColor Yellow
            Write-Host "  1. Check the server terminal for errors" -ForegroundColor White
            Write-Host "  2. Restart the server: .\start-server.ps1" -ForegroundColor White
            Write-Host "  3. Check for port conflicts: netstat -ano | findstr :$Port" -ForegroundColor White
            Write-Host ""
            
            # Play alert sound
            [Console]::Beep(1000, 500)
            [Console]::Beep(800, 500)
            [Console]::Beep(1000, 500)
        }
    }
    
    # Show uptime stats every 10 checks
    if ($checkCount % 10 -eq 0) {
        $uptime = (Get-Date) - $script:StartTime
        Write-Host ""
        Write-Host "📊 Monitor Stats:" -ForegroundColor Cyan
        Write-Host "  Total Checks: $checkCount" -ForegroundColor Gray
        Write-Host "  Monitor Uptime: $([int]$uptime.TotalMinutes) minutes" -ForegroundColor Gray
        Write-Host "  Last Success: $(($lastSuccessTime).ToString('HH:mm:ss'))" -ForegroundColor Gray
        Write-Host ""
    }
    
    Start-Sleep -Seconds $CheckIntervalSeconds
}
