#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run E2E tests and generate report

.DESCRIPTION
    Executes Playwright E2E tests for booking + chat + notification flow
    Generates JSON report with pass/fail status and screenshots

.EXAMPLE
    .\run-e2e-tests.ps1
#>

Write-Host "🎭 Starting E2E Test Suite..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Playwright is installed
Write-Host "🔍 Checking Playwright installation..." -ForegroundColor Yellow
$playwrightInstalled = Test-Path "node_modules/@playwright/test"

if (-not $playwrightInstalled) {
    Write-Host "❌ Playwright not found. Installing..." -ForegroundColor Red
    pnpm add -D @playwright/test
    
    Write-Host "📦 Installing Chromium browser..." -ForegroundColor Yellow
    pnpm exec playwright install chromium
}

Write-Host "✅ Playwright ready" -ForegroundColor Green
Write-Host ""

# Check if dev server is running
Write-Host "🔍 Checking dev server..." -ForegroundColor Yellow
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
} catch {
    # Server not running
}

if (-not $response) {
    Write-Host "⚠️  Dev server not running. Starting..." -ForegroundColor Yellow
    Write-Host "   Run 'pnpm run dev' in a separate terminal" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Press ENTER when server is ready..." -ForegroundColor Cyan
    Read-Host
}

Write-Host "✅ Dev server ready" -ForegroundColor Green
Write-Host ""

# Run E2E tests
Write-Host "🚀 Running E2E tests..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

pnpm exec playwright test

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check report for details." -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 View HTML report:" -ForegroundColor Yellow
Write-Host "   pnpm run test:e2e:report" -ForegroundColor White
Write-Host ""
Write-Host "📄 JSON report:" -ForegroundColor Yellow
Write-Host "   test-results/e2e-test-report.json" -ForegroundColor White
Write-Host ""

exit $exitCode
