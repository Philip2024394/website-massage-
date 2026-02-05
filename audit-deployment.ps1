# Deployment Audit Script for GitHub → Netlify Pipeline
Write-Host "================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT AUDIT REPORT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Git Status
Write-Host "[1] Git Status Check" -ForegroundColor Yellow
git status --short
$uncommitted = git status --short
if ($uncommitted) {
    Write-Host "⚠️  WARNING: Uncommitted changes detected" -ForegroundColor Red
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}
Write-Host ""

# 2. Check Recent Commits
Write-Host "[2] Recent Commits (Last 5)" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# 3. Check for TypeScript Errors
Write-Host "[3] TypeScript Type Check" -ForegroundColor Yellow
$typecheck = pnpm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript errors found:" -ForegroundColor Red
    $typecheck | Select-Object -First 50
}
Write-Host ""

# 4. Check Package.json
Write-Host "[4] Package.json Build Scripts" -ForegroundColor Yellow
$pkg = Get-Content package.json | ConvertFrom-Json
Write-Host "build script: $($pkg.scripts.build)"
Write-Host "build:netlify script: $($pkg.scripts.'build:netlify')"
Write-Host ""

# 5. Check Netlify Configuration
Write-Host "[5] Netlify Configuration" -ForegroundColor Yellow
if (Test-Path netlify.toml) {
    Write-Host "✅ netlify.toml exists" -ForegroundColor Green
    Write-Host "Build command from netlify.toml:"
    Select-String -Path netlify.toml -Pattern "command =" | ForEach-Object { $_.Line }
} else {
    Write-Host "❌ netlify.toml not found" -ForegroundColor Red
}
Write-Host ""

# 6. Check for Corrupted Files
Write-Host "[6] Checking for Backup/Corrupted Files" -ForegroundColor Yellow
$backups = Get-ChildItem -Recurse -Include "*.backup.*","*.bak" -ErrorAction SilentlyContinue
if ($backups) {
    Write-Host "⚠️  WARNING: Backup files found:" -ForegroundColor Red
    $backups | ForEach-Object { Write-Host "  - $($_.FullName)" }
} else {
    Write-Host "✅ No backup files found" -ForegroundColor Green
}
Write-Host ""

# 7. Check Node Modules
Write-Host "[7] Node Modules Check" -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
    $nodeSize = (Get-ChildItem node_modules -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Size: $([math]::Round($nodeSize, 2)) MB"
} else {
    Write-Host "⚠️  node_modules not found - run pnpm install" -ForegroundColor Yellow
}
Write-Host ""

# 8. Check Dist Folder
Write-Host "[8] Build Output (dist) Check" -ForegroundColor Yellow
if (Test-Path dist) {
    $distFiles = Get-ChildItem dist -Recurse -File
    Write-Host "✅ dist folder exists ($($distFiles.Count) files)" -ForegroundColor Green
} else {
    Write-Host "⚠️  dist folder not found - needs build" -ForegroundColor Yellow
}
Write-Host ""

# 9. Remote Repository Check
Write-Host "[9] GitHub Remote Check" -ForegroundColor Yellow
$remote = git remote get-url origin
Write-Host "Remote URL: $remote"
Write-Host ""

# 10. Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "AUDIT COMPLETE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review any errors above"
Write-Host "2. Fix issues if found"
Write-Host "3. Run: git add -A && git commit -m 'Fix deployment issues' && git push"
Write-Host "4. Check Netlify dashboard at: https://app.netlify.com/"
Write-Host ""
