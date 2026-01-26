#!/usr/bin/env powershell
# VS Code Performance Optimization Script
# Run this script to clean up resources and prevent crashes

Write-Host "🔧 VS Code Interface Crash Fix - Starting cleanup..." -ForegroundColor Green

# 1. Stop all Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*" -or $_.ProcessName -like "*esbuild*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# 3. Remove build artifacts
Write-Host "Removing build artifacts..." -ForegroundColor Yellow
$pathsToClean = @(
    "dist",
    ".vite", 
    "node_modules/.cache",
    ".cache",
    "*.log"
)

foreach ($path in $pathsToClean) {
    Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Clear temporary files
Write-Host "Clearing temporary files..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\vite*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\npm*" -Recurse -Force -ErrorAction SilentlyContinue

# 5. Memory optimization
Write-Host "Setting Node.js memory limits..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=4096 --max-semi-space-size=256"

# 6. Check disk space
$disk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DeviceID -eq "C:"}
$freeSpace = [math]::Round($disk.FreeSpace/1GB,2)
Write-Host "Available disk space: ${freeSpace}GB" -ForegroundColor Cyan

if ($freeSpace -lt 10) {
    Write-Host "⚠️  Warning: Low disk space detected. Consider cleaning more files." -ForegroundColor Red
}

Write-Host "✅ Cleanup complete! VS Code should be more stable now." -ForegroundColor Green
Write-Host "💡 Recommended: Close unnecessary terminal tabs in VS Code" -ForegroundColor Cyan