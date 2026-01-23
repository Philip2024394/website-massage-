#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup E2E test accounts in Appwrite

.DESCRIPTION
    Creates 3 test accounts required for E2E testing:
    - user@test.com (customer)
    - therapist@test.com (service provider)
    - admin@test.com (platform admin)

.EXAMPLE
    .\setup-e2e-accounts.ps1
#>

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎭 E2E TEST ACCOUNTS SETUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Run the setup script
node scripts/setup-e2e-test-accounts.js

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Test accounts created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Account Credentials:" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "CUSTOMER ACCOUNT:" -ForegroundColor White
    Write-Host "  Email:    user@test.com" -ForegroundColor Gray
    Write-Host "  Password: Test123456!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "THERAPIST ACCOUNT:" -ForegroundColor White
    Write-Host "  Email:    therapist@test.com" -ForegroundColor Gray
    Write-Host "  Password: Test123456!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "ADMIN ACCOUNT:" -ForegroundColor White
    Write-Host "  Email:    admin@test.com" -ForegroundColor Gray
    Write-Host "  Password: Test123456!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify accounts in Appwrite Console" -ForegroundColor Gray
    Write-Host "  2. Run E2E tests:" -ForegroundColor Gray
    Write-Host "     .\run-e2e-tests.ps1" -ForegroundColor Cyan
    Write-Host "     OR" -ForegroundColor Gray
    Write-Host "     pnpm run test:e2e" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to create test accounts" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check Appwrite endpoint is accessible" -ForegroundColor Gray
    Write-Host "  2. Verify project ID is correct" -ForegroundColor Gray
    Write-Host "  3. Check database and collection IDs" -ForegroundColor Gray
    Write-Host "  4. See error details above" -ForegroundColor Gray
    Write-Host ""
}

exit $exitCode
