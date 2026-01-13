# PowerShell script to launch VS Code in safe mode
# Use this when experiencing frequent crashes

Write-Host "Starting VS Code in Safe Mode..." -ForegroundColor Yellow

# Set conservative memory settings
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:ELECTRON_NO_ASAR = "1"

# Launch VS Code in safe mode with minimal extensions
& code . --disable-extensions --disable-gpu --no-sandbox --safe-mode --verbose

Write-Host "VS Code launched in Safe Mode" -ForegroundColor Green
Write-Host "Note: Extensions are disabled for stability" -ForegroundColor Yellow