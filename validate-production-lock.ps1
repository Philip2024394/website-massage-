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

# Define therapist locked files (require admin unlock)
$therapistLockedFiles = @(
    "src/pages/auth/TherapistLoginPage.tsx",
    "src/pages/therapist/TherapistDashboardPage.tsx",
    "src/components/therapist/TherapistLayout.tsx",
    "src/components/TherapistDashboardGuard.tsx",
    "src/pages/therapist/TherapistBookingsPage.tsx",
    "src/pages/therapist/CommissionPayment.tsx",
    "src/pages/therapist/MyBookings.tsx"
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

# Check for therapist locked file modifications (require admin unlock)
$therapistViolatedFiles = @()
$adminUnlockExists = Test-Path "ADMIN_UNLOCK_THERAPIST.flag"

foreach ($file in $allChangedFiles) {
    if ($therapistLockedFiles -contains $file) {
        $therapistViolatedFiles += $file
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
    Write-Host "To bypass 
    
} elseif ($therapistViolatedFiles.Count -gt 0 -and -not $adminUnlockExists) {
    Write-Host ""
    Write-Host "🚫 THERAPIST SYSTEM IS LOCKED" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "The following therapist files have been modified:" -ForegroundColor Yellow
    foreach ($file in $therapistViolatedFiles) {
        Write-Host "  🔒 $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "These files require ADMIN UNLOCK to modify." -ForegroundColor Yellow
    Write-Host "Therapist dashboard and login are revenue-critical systems." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  REQUIRED ACTIONS:" -ForegroundColor Cyan
    Write-Host "  1. Review PRODUCTION_LOCK_THERAPIST.md" -ForegroundColor White
    Write-Host "  2. Open GitHub Issue requesting admin unlock" -ForegroundColor White
    Write-Host "  3. Tag @Philip2024394" -ForegroundColor White
    Write-Host "  4. Wait for ADMIN_UNLOCK_THERAPIST.flag to be created" -ForegroundColor White
    Write-Host "  5. Retry commit after flag is present" -ForegroundColor White
    Write-Host ""
    Write-Host "Emergency bypass (critical production issues only):" -ForegroundColor Gray
    Write-Host "  See PRODUCTION_LOCK_THERAPIST.md emergency section" -ForegroundColor Gray
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "🚫 COMMIT BLOCKED - Admin unlock required" -ForegroundColor Red
    Write-Host ""
    
    exit 1  # Block commit
    
} elseif ($therapistViolatedFiles.Count -gt 0 -and $adminUnlockExists) {
    Write-Host ""
    Write-Host "✅ Admin unlock detected - Therapist changes allowed" -ForegroundColor Green
    Write-Host ""
    Write-Host "Modified therapist files:" -ForegroundColor Cyan
    foreach ($file in $therapistViolatedFiles) {
        Write-Host "  📝 $file" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "⚠️  REMINDER: Remove ADMIN_UNLOCK_THERAPIST.flag after changes complete!" -ForegroundColor Yellow
    Write-Host ""
    exit 0this check (ONLY with owner approval):" -ForegroundColor Gray
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
