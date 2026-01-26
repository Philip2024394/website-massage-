# Ultra-Safe VS Code Launch Script - Maximum Stability Mode
# This script launches VS Code with the most conservative settings to prevent crashes

Write-Host "Starting VS Code in Ultra-Safe Mode..." -ForegroundColor Yellow

# Kill any existing VS Code processes to ensure clean start
Write-Host "Cleaning up existing VS Code processes..." -ForegroundColor Cyan
Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Set conservative memory limits
$env:NODE_OPTIONS = "--max-old-space-size=2048 --max-semi-space-size=512 --optimize-for-size"
$env:ELECTRON_NO_ASAR = "1"
$env:VSCODE_MAX_MEMORY = "2048"
$env:ELECTRON_DISABLE_GPU = "1"
$env:ELECTRON_NO_SANDBOX = "1"

# Additional stability environment variables
$env:VSCODE_DISABLE_CRASH_REPORTER = "1"
$env:VSCODE_SKIP_GETTING_STARTED = "1"
$env:VSCODE_DISABLE_WORKSPACE_TRUST = "1"

Write-Host "Launching VS Code with ultra-safe configuration..." -ForegroundColor Green

# Launch with maximum stability flags
& code . `
  --max-memory=2048 `
  --disable-gpu `
  --disable-gpu-sandbox `
  --no-sandbox `
  --disable-dev-shm-usage `
  --disable-background-timer-throttling `
  --disable-renderer-backgrounding `
  --disable-backgrounding-occluded-windows `
  --disable-features=VizDisplayCompositor `
  --disable-ipc-flooding-protection `
  --no-proxy-server `
  --disable-extensions `
  --disable-workspace-trust `
  --user-data-dir="$env:APPDATA\Code\User" `
  --verbose

Write-Host "VS Code launched in Ultra-Safe Mode" -ForegroundColor Green
Write-Host "If crashes continue, try running 'code --safe-mode'" -ForegroundColor Yellow