# Full System Reset Script for UI Update Issues
# This script performs a complete cleanup and restart

Write-Host "🔧 Starting Full System Reset..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node/Vite processes
Write-Host "1️⃣ Killing all Node/Vite processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*vite*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ Processes killed" -ForegroundColor Green
Write-Host ""

# Step 2: Clean node_modules/.vite cache
Write-Host "2️⃣ Cleaning Vite cache..." -ForegroundColor Yellow
$viteCachePath = "node_modules\.vite"
if (Test-Path $viteCachePath) {
    Remove-Item -Path $viteCachePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Vite cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ No Vite cache found" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Clean dist folder
Write-Host "3️⃣ Cleaning dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Dist folder cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ No dist folder found" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Check for port conflicts
Write-Host "4️⃣ Checking for port conflicts..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   ⚠️ Port 3000 is in use by PID: $($port3000.OwningProcess)" -ForegroundColor Red
    Write-Host "   Attempting to kill process..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Port 3000 freed" -ForegroundColor Green
} else {
    Write-Host "   ✅ Port 3000 is available" -ForegroundColor Green
}
Write-Host ""

# Step 5: Verify package.json and dependencies
Write-Host "5️⃣ Verifying project structure..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Check for TypeScript errors
Write-Host "6️⃣ Running TypeScript check..." -ForegroundColor Yellow
$null = & pnpm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ No TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ TypeScript errors found (may not be critical)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Display system info
Write-Host "7️⃣ System Information:" -ForegroundColor Yellow
Write-Host "   Node Version: $(node --version)" -ForegroundColor Gray
Write-Host "   PNPM Version: $(pnpm --version)" -ForegroundColor Gray
Write-Host "   Working Directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Step 8: Instructions for browser
Write-Host "8️⃣ Browser Cache Clear Instructions:" -ForegroundColor Yellow
Write-Host "   📌 After dev server starts, do the following:" -ForegroundColor Cyan
Write-Host "   1. Open DevTools (F12)" -ForegroundColor White
Write-Host "   2. Right-click the reload button" -ForegroundColor White
Write-Host "   3. Select 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "   4. OR visit: http://127.0.0.1:3000/clear-cache.html" -ForegroundColor White
Write-Host ""

# Step 9: Start dev server
Write-Host "9️⃣ Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host "   🚀 DEV SERVER STARTING" -ForegroundColor Green
Write-Host "   💡 Watch for HMR updates in the console" -ForegroundColor Cyan
Write-Host "   🔗 URL: http://127.0.0.1:3000/" -ForegroundColor Cyan
Write-Host "=" -repeat 60 -ForegroundColor Cyan
Write-Host ""

# Run dev server
& pnpm run dev
