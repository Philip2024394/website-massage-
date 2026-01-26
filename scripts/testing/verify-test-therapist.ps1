#!/usr/bin/env pwsh
# Verify and Create Test Therapist in Appwrite

Write-Host "`n🔍 VERIFYING TEST THERAPIST IN APPWRITE..." -ForegroundColor Cyan

# Run the creation script
Write-Host "  → Running therapist creation script..." -ForegroundColor Yellow
node scripts/create-therapist-profile.js

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "`n✅ Test therapist verified/created successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to create test therapist" -ForegroundColor Red
    Write-Host "💡 Manually create therapist in Appwrite console:" -ForegroundColor Yellow
    Write-Host "   Database: 68f76ee1000e64ca8d05" -ForegroundColor Gray
    Write-Host "   Collection: therapists" -ForegroundColor Gray
    Write-Host "   Document ID: 6971ccc9000f3c39f49c" -ForegroundColor Gray
}

exit $exitCode
