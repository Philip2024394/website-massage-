# Create deployment tarball for Appwrite function
$functionName = "sendSystemChatMessage"
$functionPath = "src\functions\$functionName"

Write-Host "Creating deployment for $functionName..." -ForegroundColor Cyan

# Navigate to function directory
Set-Location $functionPath

# Create tarball with only necessary files
tar -czf "$functionName-manual-deploy.tar.gz" package.json index.js

# Move tarball to root for easy access
Move-Item "$functionName-manual-deploy.tar.gz" ..\..\.. -Force

Set-Location ..\..\..

Write-Host "✅ Deployment tarball created: $functionName-manual-deploy.tar.gz" -ForegroundColor Green
Write-Host ""
Write-Host "Upload this file in Appwrite Console:" -ForegroundColor Yellow
Write-Host "1. Go to Functions → $functionName" -ForegroundColor Gray
Write-Host "2. Click 'Create Deployment'" -ForegroundColor Gray
Write-Host "3. Upload the .tar.gz file" -ForegroundColor Gray
Write-Host "4. Set entrypoint: index.js" -ForegroundColor Gray
Write-Host "5. Click 'Deploy'" -ForegroundColor Gray
