#!/usr/bin/env pwsh
# Complete E2E Test Runner - Handles ALL prerequisites

Write-Host "`n" -NoNewline
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "  🎭 COMPLETE E2E TEST RUNNER - AI HUMAN WORKFLOW" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""

# STEP 1: Clear all caches
Write-Host "📋 STEP 1: Clearing all caches..." -ForegroundColor Yellow
Remove-Item -Path "test-results" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "playwright-report" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "debug-*.png" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Caches cleared" -ForegroundColor Green

# STEP 2: Verify dev server
Write-Host "`n📋 STEP 2: Checking dev server..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ Dev server is running" -ForegroundColor Green
    $serverRunning = $true
} catch {
    Write-Host "  ❌ Dev server not running" -ForegroundColor Red
    Write-Host "  💡 Starting dev server..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev" -WindowStyle Minimized
    Write-Host "  ⏳ Waiting 15 seconds for server startup..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Verify again
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ Dev server started successfully" -ForegroundColor Green
        $serverRunning = $true
    } catch {
        Write-Host "  ❌ Failed to start dev server" -ForegroundColor Red
        Write-Host "  💡 Run manually: pnpm dev" -ForegroundColor Yellow
        exit 1
    }
}

# STEP 3: Verify test therapist exists
Write-Host "`n📋 STEP 3: Verifying test therapist in Appwrite..." -ForegroundColor Yellow
try {
    npx ts-node e2e-tests/setup/create-test-therapist.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Test therapist verified" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Therapist verification had warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not verify therapist: $_" -ForegroundColor Yellow
    Write-Host "  ℹ️  Tests may still work if therapist exists in Appwrite" -ForegroundColor Gray
}

# STEP 4: Run E2E tests
Write-Host "`n📋 STEP 4: Running E2E tests..." -ForegroundColor Yellow
Write-Host "  → Headed mode (visible browser for debugging)" -ForegroundColor Gray
Write-Host ""
pnpm playwright test e2e-tests/flows/ai-human-multi-user-workflow.spec.ts --headed --workers=1

$exitCode = $LASTEXITCODE

# STEP 5: Display results
Write-Host "`n" -NoNewline
Write-Host "="*80 -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "  ✅ ALL TESTS PASSED - GO FOR DEPLOYMENT" -ForegroundColor Green
    Write-Host "="*80 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Test Status: PASS" -ForegroundColor Green
    Write-Host "📊 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review test output above" -ForegroundColor Gray
    Write-Host "  2. Check playwright-report/ for details" -ForegroundColor Gray
    Write-Host "  3. Proceed with deployment" -ForegroundColor Gray
} else {
    Write-Host "  ❌ TESTS FAILED - NO-GO" -ForegroundColor Red
    Write-Host "="*80 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔍 Debugging Info:" -ForegroundColor Yellow
    Write-Host "  → Check debug-*.png screenshots" -ForegroundColor Gray
    Write-Host "  → Review error output above" -ForegroundColor Gray
    Write-Host "  → Run: pnpm playwright show-report" -ForegroundColor Gray
}
Write-Host ""

exit $exitCode
