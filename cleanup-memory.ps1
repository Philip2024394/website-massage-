# Memory Cleanup Script for VS Code OOM Prevention
# Run this script when VS Code becomes slow or memory-heavy

Write-Host "🧹 Starting Memory Cleanup..." -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js processes terminated" -ForegroundColor Green
} else {
    Write-Host "ℹ No Node.js processes found" -ForegroundColor Gray
}

# Kill ESBuild processes
Write-Host "Stopping ESBuild processes..." -ForegroundColor Yellow
taskkill /F /IM esbuild.exe /T 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ESBuild processes terminated" -ForegroundColor Green
} else {
    Write-Host "ℹ No ESBuild processes found" -ForegroundColor Gray
}

# Kill Vite processes (if running separately)
Write-Host "Checking for Vite processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match 'vite' } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✓ Vite processes checked" -ForegroundColor Green

# Show memory stats
Write-Host "`n📊 Current Memory Usage:" -ForegroundColor Cyan
$mem = Get-CimInstance Win32_OperatingSystem
$usedMemory = [math]::Round(($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / 1MB, 2)
$totalMemory = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
$percentUsed = [math]::Round(($usedMemory / $totalMemory) * 100, 1)
Write-Host "Used: ${usedMemory}GB / ${totalMemory}GB (${percentUsed}%)" -ForegroundColor White

Write-Host "`n✨ Cleanup complete! Safe to restart dev server." -ForegroundColor Green
Write-Host "Run 'pnpm run dev' to start development server" -ForegroundColor Cyan
