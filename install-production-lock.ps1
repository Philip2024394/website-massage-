# 🔒 Production Lock Setup Script
# Installs git hooks and validates configuration

Write-Host "🔧 Setting up Production Lock system..." -ForegroundColor Cyan
Write-Host ""

# 1. Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository root" -ForegroundColor Red
    exit 1
}

# 2. Check if hooks directory exists
$hooksDir = ".git\hooks"
if (-not (Test-Path $hooksDir)) {
    Write-Host "❌ Error: Git hooks directory not found" -ForegroundColor Red
    exit 1
}

# 3. Install pre-commit hook
$hookSource = "pre-commit"
$hookDest = "$hooksDir\pre-commit"

if (Test-Path $hookDest) {
    Write-Host "⚠️  Pre-commit hook already exists" -ForegroundColor Yellow
    $response = Read-Host "Overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Skipping hook installation" -ForegroundColor Gray
    } else {
        Copy-Item $hookSource $hookDest -Force
        Write-Host "✅ Pre-commit hook updated" -ForegroundColor Green
    }
} else {
    # Copy the hook file from root to .git/hooks/
    $hookContent = @'
#!/bin/sh
# Git pre-commit hook to check production-locked files
# This runs automatically before each commit

# Check if PowerShell is available
if command -v pwsh >/dev/null 2>&1; then
    pwsh -NoProfile -File validate-production-lock.ps1
elif command -v powershell >/dev/null 2>&1; then
    powershell -NoProfile -File validate-production-lock.ps1
else
    echo "⚠️  Warning: PowerShell not found. Skipping production lock check."
    echo "   Install PowerShell or run: pwsh validate-production-lock.ps1"
    exit 0
fi

exit $?
'@
    Set-Content -Path $hookDest -Value $hookContent
    Write-Host "✅ Pre-commit hook installed" -ForegroundColor Green
}

# 4. Verify required files exist
Write-Host ""
Write-Host "🔍 Verifying lock system files..." -ForegroundColor Cyan

$requiredFiles = @(
    "PRODUCTION_LOCK_LANDING_LOADING.md",
    "PRODUCTION_LOCK_QUICK_REF.md",
    "validate-production-lock.ps1",
    "CODEOWNERS"
)

$allExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "⚠️  Some required files are missing" -ForegroundColor Yellow
    exit 1
}

# 5. Test the validation script
Write-Host ""
Write-Host "🧪 Testing validation script..." -ForegroundColor Cyan
try {
    & ".\validate-production-lock.ps1"
    Write-Host "✅ Validation script works" -ForegroundColor Green
} catch {
    Write-Host "❌ Validation script failed: $_" -ForegroundColor Red
    exit 1
}

# 6. Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Production Lock system installed successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's protected:" -ForegroundColor Cyan
Write-Host "  • Landing pages (MainLandingPage, LandingPage, HomePage)" -ForegroundColor White
Write-Host "  • Loading page (LoadingGate)" -ForegroundColor White
Write-Host "  • App bootstrap (App.tsx, AppRouter.tsx)" -ForegroundColor White
Write-Host "  • Location services (GPS collection)" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  How it works:" -ForegroundColor Cyan
Write-Host "  • Pre-commit hook checks for locked file changes" -ForegroundColor White
Write-Host "  • Warning displayed if locked files modified" -ForegroundColor White
Write-Host "  • Owner approval required before merging" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • Full docs: PRODUCTION_LOCK_LANDING_LOADING.md" -ForegroundColor White
Write-Host "  • Quick ref:  PRODUCTION_LOCK_QUICK_REF.md" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Manual check:" -ForegroundColor Cyan
Write-Host "  pwsh validate-production-lock.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Users can still:" -ForegroundColor Cyan
Write-Host "  ✅ Use all app features normally" -ForegroundColor Green
Write-Host "  ✅ Select city on landing page" -ForegroundColor Green
Write-Host "  ✅ Use GPS auto-detect" -ForegroundColor Green
Write-Host "  ✅ Change location anytime" -ForegroundColor Green
Write-Host ""
Write-Host "  🔒 Only CODE changes to locked files are restricted" -ForegroundColor Yellow
Write-Host ""
