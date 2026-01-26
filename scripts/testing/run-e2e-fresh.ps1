#!/usr/bin/env pwsh
# Fresh E2E Test Runner - Clears all caches and runs tests

Write-Host "`n🧹 CLEARING ALL CACHES..." -ForegroundColor Cyan

# 1. Clear Playwright test results & reports
Write-Host "  → Clearing Playwright test results..." -ForegroundColor Yellow
Remove-Item -Path "test-results" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "playwright-report" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".playwright" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Clear browser storage artifacts
Write-Host "  → Clearing browser storage..." -ForegroundColor Yellow
Remove-Item -Path "debug-*.png" -Force -ErrorAction SilentlyContinue

# 3. Clear Vite/build caches
Write-Host "  → Clearing Vite build cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Clear TypeScript incremental cache
Write-Host "  → Clearing TypeScript cache..." -ForegroundColor Yellow
Remove-Item -Path "*.tsbuildinfo" -Force -ErrorAction SilentlyContinue

Write-Host "`n✅ All caches cleared!`n" -ForegroundColor Green

# 5. Run tests with fresh environment
Write-Host "🎭 RUNNING E2E TESTS (HEADED MODE)..." -ForegroundColor Cyan
Write-Host "   Tests will run in visible browser for debugging`n" -ForegroundColor Gray

pnpm playwright test e2e-tests/flows/ai-human-multi-user-workflow.spec.ts --headed --workers=1

$exitCode = $LASTEXITCODE
Write-Host "`n" -NoNewline

if ($exitCode -eq 0) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "❌ TESTS FAILED - Check output above" -ForegroundColor Red
    Write-Host "📸 Check debug-*.png screenshots for visual debugging" -ForegroundColor Yellow
}

exit $exitCode
