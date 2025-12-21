#!/usr/bin/env pwsh
# Commit the console error fixes

Set-Location "c:\Users\Victus\website-massage-"

Write-Host "📋 Checking git status..." -ForegroundColor Cyan
git status

Write-Host "`n➕ Adding changed files..." -ForegroundColor Cyan  
git add lib/appwrite.config.ts lib/systemHealthService.ts

Write-Host "`n💾 Committing changes..." -ForegroundColor Cyan
git commit -m "fix: correct Appwrite translations collection ID and disable non-existent system health checks

- Changed translations collection from 'translations collection' (invalid with space) to actual ID '68fcc065001120901028'
- Disabled system_health_checks feature as collection doesn't exist in Appwrite
- Fixes 400 Bad Request error on translations fetch
- Fixes 404 Not Found error on health check submissions"

Write-Host "`n✅ Commit complete!" -ForegroundColor Green
git log --oneline -1
