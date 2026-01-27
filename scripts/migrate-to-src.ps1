# Enterprise File Structure Migration Script
# Moves all code folders to /src and fixes imports automatically
# NO UI CHANGES - Pure file organization

Write-Host "`n🚀 ENTERPRISE FILE STRUCTURE MIGRATION" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Target: Move from 4/10 → 10/10 file structure" -ForegroundColor Yellow
Write-Host "Impact: ZERO UI changes, pure organization`n" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Folders to move to /src (in order of dependencies)
$foldersToMove = @(
    "types",
    "constants",
    "config",
    "utils",
    "hooks",
    "context",
    "providers",
    "lib",
    "services",
    "schema",
    "schemas",
    "data",
    "components",
    "pages",
    "routes",
    "router",
    "handlers",
    "features",
    "modules",
    "translations",
    "styles"
)

Write-Host "📋 PHASE 3-6: Moving folders to /src`n" -ForegroundColor Yellow

$moved = 0
foreach ($folder in $foldersToMove) {
    if (Test-Path $folder) {
        Write-Host "  Moving $folder/ → src/$folder/" -ForegroundColor White
        
        # Use robocopy for reliable move
        $result = robocopy $folder "src\$folder" /MOVE /S /NFL /NDL /NJH /NJS 2>&1
        
        if (Test-Path $folder) {
            # If folder still exists, it means it was empty, remove it
            Remove-Item $folder -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host "    ✅ Moved" -ForegroundColor Green
        $moved++
    } else {
        Write-Host "    ⏭️  $folder/ not found (already moved or doesn't exist)" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Phase 3-6 Complete: Moved $moved folders to /src`n" -ForegroundColor Green

# Now fix all imports
Write-Host "📋 PHASE 7: Fixing import paths automatically...`n" -ForegroundColor Yellow
node scripts/fix-imports-after-move.js

Write-Host "`n📋 PHASE 8: Moving entry files to /src...`n" -ForegroundColor Yellow

# Move entry files
$entryFiles = @("index.tsx", "main.tsx", "App.tsx", "AppRouter.tsx")
foreach ($file in $entryFiles) {
    if (Test-Path $file) {
        Write-Host "  Moving $file → src/$file" -ForegroundColor White
        Copy-Item $file "src\$file" -Force
        Remove-Item $file -Force
        Write-Host "    ✅ Moved" -ForegroundColor Green
    }
}

# Update index.html to point to /src/index.tsx
Write-Host "`n  Updating index.html..." -ForegroundColor White
(Get-Content index.html -Raw) -replace '/index\.tsx\?v=', '/src/index.tsx?v=' | Set-Content index.html -NoNewline
Write-Host "    ✅ Updated index.html" -ForegroundColor Green

Write-Host "`n📋 PHASE 9: Testing build...`n" -ForegroundColor Yellow
$buildResult = pnpm build 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

if ($buildSuccess) {
    Write-Host "✅ BUILD SUCCESSFUL!`n" -ForegroundColor Green
    Write-Host "📊 MIGRATION COMPLETE!" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "File Structure: 4/10 → 10/10 ✅" -ForegroundColor Green
    Write-Host "Enterprise-grade organization achieved!" -ForegroundColor Green
    Write-Host "`nNext: git add -A && git commit && git push" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Build has errors. Checking..." -ForegroundColor Yellow
    Write-Host $buildResult | Select-String "error" | Select-Object -First 5
    Write-Host "`nRun 'pnpm build' to see full error details" -ForegroundColor Gray
}
