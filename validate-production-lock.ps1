# 🔒 Production Lock Validator
# Checks if any locked files are being modified

Write-Host "🔍 Checking for modifications to production-locked files..." -ForegroundColor Cyan

# Define locked files (matching CODEOWNERS)
$lockedFiles = @(
    "PRODUCTION_LOCK_LANDING_LOADING.md",
    "src/pages/MainLandingPage.tsx",
    "src/pages/LandingPage.tsx",
    "src/pages/LoadingGate.tsx",
    "src/pages/HomePage.tsx",
    "src/App.tsx",
    "src/AppRouter.tsx",
    "src/context/LoadingContext.tsx",
    "src/services/customerGPSCollectionService.ts",
    "src/services/simpleGPSBookingIntegration.ts"
)

# Get modified files from git
$modifiedFiles = git diff --name-only HEAD
$stagedFiles = git diff --cached --name-only

$allChangedFiles = @($modifiedFiles) + @($stagedFiles) | Select-Object -Unique

# Check for locked file modifications
$violatedFiles = @()
foreach ($file in $allChangedFiles) {
    if ($lockedFiles -contains $file) {
        $violatedFiles += $file
    }
}

if ($violatedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: PRODUCTION-LOCKED FILES MODIFIED!" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "The following locked files have been modified:" -ForegroundColor Yellow
    foreach ($file in $violatedFiles) {
        Write-Host "  🔒 $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "These files are under PRODUCTION LOCK to prevent app outages." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  REQUIRED ACTIONS:" -ForegroundColor Cyan
    Write-Host "  1. Review PRODUCTION_LOCK_LANDING_LOADING.md" -ForegroundColor White
    Write-Host "  2. Get explicit approval from @Philip2024394" -ForegroundColor White
    Write-Host "  3. Follow change control process" -ForegroundColor White
    Write-Host "  4. Verify all functionality still works" -ForegroundColor White
    Write-Host ""
    Write-Host "To bypass this check (ONLY with owner approval):" -ForegroundColor Gray
    Write-Host "  git commit --no-verify" -ForegroundColor Gray
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    
    # 🔒 BLOCKING MODE: Prevent commit of locked files
    Write-Host ""
    Write-Host "🚫 COMMIT BLOCKED - Production lock violation" -ForegroundColor Red
    Write-Host ""
    
    exit 1  # Block commit
    
} else {
    Write-Host "✅ No production-locked files modified. Safe to commit." -ForegroundColor Green
    exit 0
}
