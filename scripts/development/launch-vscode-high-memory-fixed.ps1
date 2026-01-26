# PowerShell script to launch VS Code with increased memory allocation
# Fixed version that properly handles VS Code memory limits

Write-Host "Starting VS Code with increased memory allocation..." -ForegroundColor Green

# Kill any existing VS Code processes to ensure clean restart
Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Set environment variables for VS Code and its processes
$env:VSCODE_MAX_MEMORY = "12288"
$env:NODE_OPTIONS = "--max-old-space-size=12288"

# Launch VS Code with optimized flags
& code . --disable-gpu-sandbox --no-sandbox --verbose --memory-pressure-off

Write-Host "VS Code launched with high memory configuration (12GB)" -ForegroundColor Cyan
Write-Host "If still experiencing OOM issues, close unused browser tabs and extensions" -ForegroundColor Yellow