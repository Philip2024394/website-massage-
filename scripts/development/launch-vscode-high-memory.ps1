# PowerShell script to launch VS Code with increased memory allocation
# Run this script to start VS Code with optimized memory settings

Write-Host "Starting VS Code with increased memory allocation..." -ForegroundColor Green

# Set Node.js environment variables for higher memory limits
$env:NODE_OPTIONS = "--max-old-space-size=8192 --max-semi-space-size=1024"
$env:ELECTRON_NO_ASAR = "1"
$env:VSCODE_MAX_MEMORY = "8192"
$env:ELECTRON_ENABLE_LOGGING = "1"

# Launch VS Code with current directory and stability options
& code . --max-memory=8192 --disable-gpu-sandbox --no-sandbox --disable-extensions --disable-workspace-trust --verbose

Write-Host "VS Code launched with high memory configuration" -ForegroundColor Cyan