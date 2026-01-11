# Keep Development Server Alive Script
# This script ensures your preview always displays and never shows offline text

Write-Host "🚀 Starting Keep-Server-Alive Monitor..." -ForegroundColor Green
Write-Host "📱 Preview URL: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "⚠️  Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

$projectPath = "C:\Users\Victus\website-massage-"
$serverUrl = "http://127.0.0.1:3000"

while ($true) {
    try {
        # Check if server is responding
        $response = Invoke-WebRequest -Uri $serverUrl -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Server is running - Preview active" -ForegroundColor Green
        
        # Check every 30 seconds
        Start-Sleep -Seconds 30
    }
    catch {
        Write-Host "❌ Server offline - Restarting..." -ForegroundColor Red
        
        # Kill any existing Node processes
        Get-Process -Name "*node*" -ErrorAction SilentlyContinue | Stop-Process -Force
        
        # Wait a moment
        Start-Sleep -Seconds 3
        
        # Navigate to project and start server
        Set-Location $projectPath
        Write-Host "🔄 Starting development server..." -ForegroundColor Yellow
        
        # Start the server in background
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $projectPath -WindowStyle Hidden
        
        # Wait for server to start
        Start-Sleep -Seconds 10
        
        Write-Host "✅ Server restarted - Preview should be active again" -ForegroundColor Green
    }
}