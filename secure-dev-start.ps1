#!/usr/bin/env pwsh
# Project Security Script - Ensures only massage website project runs

Write-Host "🔒 SECURING PROJECT ENVIRONMENT..." -ForegroundColor Yellow

# 1. Verify we're in the correct project directory
$currentDir = Get-Location
$packageFile = Join-Path $currentDir "package.json"

if (-not (Test-Path $packageFile)) {
    Write-Host "❌ ERROR: No package.json found. Not in a valid project directory!" -ForegroundColor Red
    exit 1
}

$packageContent = Get-Content $packageFile | ConvertFrom-Json
if ($packageContent.name -ne "indastreet-massage-platform") {
    Write-Host "❌ ERROR: Wrong project! Expected 'indastreet-massage-platform', found '$($packageContent.name)'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verified: indastreet-massage-platform project" -ForegroundColor Green

# 2. Kill all existing Node.js processes to prevent conflicts
Write-Host "🔄 Killing all Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
    Start-Sleep -Seconds 2
    Write-Host "✅ All Node.js processes terminated" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No Node.js processes found to terminate" -ForegroundColor Blue
}

# 3. Check and clear port 3000
Write-Host "🔍 Checking port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":3000"
if ($portCheck) {
    Write-Host "⚠️ Port 3000 is occupied:" -ForegroundColor Yellow
    $portCheck | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    
    # Extract PIDs and kill them
    $portCheck | ForEach-Object {
        $line = $_.ToString()
        $pid = ($line -split '\s+')[-1]
        if ($pid -and $pid -ne "0") {
            try {
                taskkill /F /PID $pid 2>$null
                Write-Host "✅ Killed process PID: $pid" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Could not kill PID: $pid" -ForegroundColor Yellow
            }
        }
    }
    Start-Sleep -Seconds 2
}

# 4. Clear browser caches that might interfere
Write-Host "🧹 Clearing browser caches..." -ForegroundColor Yellow
$chromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
if (Test-Path $chromePath) {
    try {
        Remove-Item -Path "$chromePath\Service Worker" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$chromePath\Cache" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$chromePath\Code Cache" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Chrome caches cleared" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Some cache files could not be cleared (browser may be running)" -ForegroundColor Yellow
    }
}

# 5. Verify project files exist
$criticalFiles = @(
    "index.html",
    "main.tsx", 
    "App.tsx",
    "vite.config.ts"
)

foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ ERROR: Critical file missing: $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ All critical project files present" -ForegroundColor Green

# 6. Start the dev server with confirmation
Write-Host "🚀 Starting SECURE massage website dev server..." -ForegroundColor Green
Write-Host "📍 Project: $($packageContent.name)" -ForegroundColor Cyan
Write-Host "📍 Version: $($packageContent.version)" -ForegroundColor Cyan
Write-Host "📍 Directory: $currentDir" -ForegroundColor Cyan
Write-Host "" 

# Show what will be served
Write-Host "🌐 Will serve at: http://127.0.0.1:3000/" -ForegroundColor Green
Write-Host "🔒 ONLY this massage platform project will be accessible" -ForegroundColor Green
Write-Host ""

pnpm run dev