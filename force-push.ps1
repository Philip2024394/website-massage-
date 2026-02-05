# Force Push Script with Full Logging
$LogFile = "push-log.txt"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"`n=== PUSH ATTEMPT: $Timestamp ===" | Out-File $LogFile -Append

# Step 1: Check status
"Step 1: Git Status" | Out-File $LogFile -Append
git status 2>&1 | Out-File $LogFile -Append

# Step 2: Stage all files
"Step 2: Staging files" | Out-File $LogFile -Append
git add -A 2>&1 | Out-File $LogFile -Append

# Step 3: Check what's staged
"Step 3: Files to be committed" | Out-File $LogFile -Append
git status --short 2>&1 | Out-File $LogFile -Append

# Step 4: Commit
"Step 4: Committing" | Out-File $LogFile -Append
git commit -m "Force push - all UI updates and fixes [$Timestamp]" 2>&1 | Out-File $LogFile -Append

# Step 5: Push
"Step 5: Pushing to GitHub" | Out-File $LogFile -Append
git push origin main 2>&1 | Out-File $LogFile -Append

"Exit Code: $LASTEXITCODE" | Out-File $LogFile -Append

# Display results
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PUSH LOG RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Get-Content $LogFile | Select-Object -Last 50

Write-Host "`nFull log saved to: $LogFile" -ForegroundColor Yellow
Write-Host "`nTo manually trigger Netlify:" -ForegroundColor Yellow
Write-Host "1. Go to https://app.netlify.com/" -ForegroundColor White
Write-Host "2. Select your site" -ForegroundColor White
Write-Host "3. Click 'Deploys' tab" -ForegroundColor White
Write-Host "4. Click 'Trigger deploy' -> 'Clear cache and deploy site'" -ForegroundColor White
