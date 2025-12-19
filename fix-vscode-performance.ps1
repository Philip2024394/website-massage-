# 🚨 VS Code Performance Rescue Script
# Run this to fix your crashing VS Code

Write-Host "🔧 Starting VS Code Performance Optimization..." -ForegroundColor Cyan

# 1. Clean build artifacts
Write-Host "`n📦 Cleaning build artifacts..." -ForegroundColor Yellow
$foldersToClean = @('.vite', 'dist', 'build', '.cache', 'coverage', '.turbo', 'out')
foreach ($folder in $foldersToClean) {
    if (Test-Path $folder) {
        Write-Host "  Removing $folder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

# 2. Clean nested .vite folders in apps
Write-Host "`n📦 Cleaning nested build folders..." -ForegroundColor Yellow
Get-ChildItem -Path "apps" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $viteFolder = Join-Path $_.FullName ".vite"
    $nodeModulesVite = Join-Path $_.FullName "node_modules\.vite"
    if (Test-Path $viteFolder) {
        Write-Host "  Removing $viteFolder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $viteFolder -ErrorAction SilentlyContinue
    }
    if (Test-Path $nodeModulesVite) {
        Write-Host "  Removing $nodeModulesVite..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $nodeModulesVite -ErrorAction SilentlyContinue
    }
}

# 3. Move documentation files
Write-Host "`n📚 Organizing documentation files..." -ForegroundColor Yellow
if (-not (Test-Path "docs")) {
    New-Item -ItemType Directory -Force -Path "docs" | Out-Null
}

$mdFiles = Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" -and $_.Name -ne "CHANGELOG.md" }
$movedCount = 0
foreach ($file in $mdFiles) {
    Write-Host "  Moving $($file.Name)..." -ForegroundColor Gray
    Move-Item -Path $file.FullName -Destination "docs\" -Force -ErrorAction SilentlyContinue
    $movedCount++
}
Write-Host "  ✅ Moved $movedCount documentation files to docs/" -ForegroundColor Green

# 4. Count files before optimization
Write-Host "`n📊 Project Statistics:" -ForegroundColor Yellow
$totalFiles = (Get-ChildItem -Path "." -Recurse -File -ErrorAction SilentlyContinue).Count
$tsFiles = (Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx" -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }).Count
Write-Host "  Total files: $totalFiles" -ForegroundColor Gray
Write-Host "  TS/TSX files (excluding node_modules): $tsFiles" -ForegroundColor Gray

# 5. Find large files that need splitting
Write-Host "`n🔍 Finding large files (> 250 lines)..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Path "src","apps","pages" -Recurse -Include "*.tsx","*.ts" -Exclude "*.d.ts" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" } | 
    ForEach-Object { 
        [PSCustomObject]@{
            File = $_.Name
            Lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
            Path = $_.FullName
        } 
    } | 
    Where-Object { $_.Lines -gt 250 } | 
    Sort-Object Lines -Descending | 
    Select-Object -First 10

if ($largeFiles) {
    Write-Host "  ⚠️  Top 10 files that need refactoring:" -ForegroundColor Red
    $largeFiles | ForEach-Object {
        Write-Host "    - $($_.File): $($_.Lines) lines" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ No files over 250 lines found!" -ForegroundColor Green
}

# 6. Summary
Write-Host "`n✅ Optimization Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Close ALL terminals in VS Code (View → Terminal → Kill All Terminals)" -ForegroundColor White
Write-Host "  2. Restart VS Code completely" -ForegroundColor White
Write-Host "  3. Review URGENT_REFACTORING_PLAN.md for file splitting guidance" -ForegroundColor White
Write-Host "  4. Check FILE_STANDARDS.md for best practices" -ForegroundColor White
Write-Host "`n⚠️  CRITICAL: Split files over 1000 lines immediately!" -ForegroundColor Red
Write-Host "    - appwriteService.ts: 6,089 lines → Split into 20+ modules" -ForegroundColor Yellow
Write-Host "    - FacialDashboard.tsx: 2,447 lines → Split into 6 components" -ForegroundColor Yellow
Write-Host "    - PlaceDashboard.tsx: 2,182 lines → Split into 6 components" -ForegroundColor Yellow

Write-Host "`n🎉 VS Code should run much faster now!" -ForegroundColor Green
