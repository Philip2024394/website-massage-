# ========================================
# VS Code Emergency Cleanup Script
# Run this BEFORE restarting VS Code
# ========================================

Write-Host "🚨 VS Code Emergency Cleanup - Starting..." -ForegroundColor Yellow
Write-Host ""

$projectRoot = "C:\Users\Victus\website-massage-"

# Navigate to project
Set-Location $projectRoot

Write-Host "📁 Project: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# 1. Clean build artifacts
Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Green
$foldersToDelete = @(
    ".vite",
    ".cache", 
    "dist",
    "build",
    "coverage",
    ".turbo",
    "out",
    ".next",
    "node_modules/.vite"
)

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Write-Host "  ✓ Removing $folder" -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

# 2. Clean TypeScript build info
Write-Host ""
Write-Host "🔧 Cleaning TypeScript cache..." -ForegroundColor Green
$tsBuildInfo = ".cache\.tsbuildinfo"
if (Test-Path $tsBuildInfo) {
    Write-Host "  ✓ Removing $tsBuildInfo" -ForegroundColor Gray
    Remove-Item -Force $tsBuildInfo -ErrorAction SilentlyContinue
}

# 3. Clean log files
Write-Host ""
Write-Host "📝 Cleaning log files..." -ForegroundColor Green
Get-ChildItem -Filter "*.log" -Recurse | Where-Object { $_.FullName -notlike "*\node_modules\*" } | ForEach-Object {
    Write-Host "  ✓ Removing $($_.Name)" -ForegroundColor Gray
    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
}

# 4. Count problematic HTML files
Write-Host ""
Write-Host "📊 Analyzing problematic files..." -ForegroundColor Green
$htmlTestFiles = Get-ChildItem -Filter "*test*.html" | Where-Object { $_.Name -ne "index.html" }
$htmlDebugFiles = Get-ChildItem -Filter "*debug*.html"
$htmlCheckFiles = Get-ChildItem -Filter "check-*.html"

$totalProblematicFiles = $htmlTestFiles.Count + $htmlDebugFiles.Count + $htmlCheckFiles.Count

Write-Host "  ⚠️  Found $totalProblematicFiles test/debug HTML files" -ForegroundColor Yellow
Write-Host "     (These are now excluded from VS Code file watchers)" -ForegroundColor Gray

# 5. Check for large files
Write-Host ""
Write-Host "🔍 Checking for oversized TypeScript files..." -ForegroundColor Green
$largeFiles = @(
    "lib\appwriteService.ts",
    "apps\facial-dashboard\src\pages\FacialDashboard.tsx",
    "apps\place-dashboard\src\pages\PlaceDashboard.tsx"
)

foreach ($file in $largeFiles) {
    if (Test-Path $file) {
        $lines = (Get-Content $file).Count
        if ($lines -gt 1000) {
            Write-Host "  ⚠️  $file → $lines lines (CRITICAL - needs refactoring)" -ForegroundColor Red
        } else {
            Write-Host "  ✓ $file → $lines lines (OK)" -ForegroundColor Green
        }
    }
}

# 6. Verify settings applied
Write-Host ""
Write-Host "🔧 Verifying VS Code settings..." -ForegroundColor Green
$settingsPath = ".vscode\settings.json"
if (Test-Path $settingsPath) {
    Write-Host "  ✓ .vscode/settings.json exists" -ForegroundColor Green
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    if ($settings."typescript.tsserver.maxTsServerMemory" -eq 8192) {
        Write-Host "  ✓ TypeScript memory limit: 8GB (Optimal)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  TypeScript memory not set correctly!" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ .vscode/settings.json missing!" -ForegroundColor Red
}

# 7. Final recommendations
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Close ALL VS Code windows" -ForegroundColor White
Write-Host "2. Wait 30 seconds" -ForegroundColor White
Write-Host "3. Reopen VS Code" -ForegroundColor White
Write-Host "4. Wait 1-2 minutes for indexing" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: VSCODE_CRASH_RESOLUTION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""

# Calculate space saved
$savedSpace = 0
foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        $savedSpace += (Get-ChildItem $folder -Recurse -File | Measure-Object -Property Length -Sum).Sum
    }
}
$savedSpaceMB = [math]::Round($savedSpace / 1MB, 2)
Write-Host "💾 Disk space recovered: $savedSpaceMB MB" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
