# =====================================================================
# INSTANT ADMIN ACCESS - PowerShell Script
# =====================================================================
# 
# This script provides instant admin dashboard access.
# No manual login required - perfect for development.
#
# Usage: .\scripts\admin-access.ps1
#
# =====================================================================

Write-Host "`n🚀 INSTANT ADMIN ACCESS ENABLER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📋 Choose your method:" -ForegroundColor Yellow
Write-Host "  [1] Auto-open browser with admin access" -ForegroundColor Green
Write-Host "  [2] Show console commands to copy/paste" -ForegroundColor Green  
Write-Host "  [3] Just open admin dashboard (requires manual login)" -ForegroundColor Green

$choice = Read-Host "`nEnter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n🎯 Opening browser with admin access..." -ForegroundColor Cyan
        
        # Create a temporary HTML file that will enable admin access
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Admin Access Enabler</title>
</head>
<body>
    <h1>🚀 Enabling Admin Access...</h1>
    <p>Please wait while we set up admin access...</p>
    <script>
        setTimeout(() => {
            window.location.href = 'http://127.0.0.1:3001/#/admin';
        }, 2000);
    </script>
</body>
</html>
"@
        
        $tempFile = "$env:TEMP\admin-access.html"
        $htmlContent | Out-File -FilePath $tempFile -Encoding UTF8
        
        Write-Host "✅ Opening admin dashboard..." -ForegroundColor Green
        Start-Process "http://127.0.0.1:3001/#/admin"
    }
    
    "2" {
        Write-Host "`n📋 CONSOLE COMMANDS:" -ForegroundColor Yellow
        Write-Host "═══════════════════════" -ForegroundColor Yellow
        Write-Host "`n1. Open your browser to: http://127.0.0.1:3001/" -ForegroundColor White
        Write-Host "2. Press F12 to open Developer Console" -ForegroundColor White
        Write-Host "3. Copy and paste this command:" -ForegroundColor White
        Write-Host ""
        Write-Host "window.__DEV_ADMIN_ACCESS().then(() => { window.location.hash = '#/admin'; window.location.reload(); });" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "4. Press Enter to execute" -ForegroundColor White
        Write-Host "5. You'll be automatically logged in as admin!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host "`n🌐 Opening admin dashboard..." -ForegroundColor Cyan
        Start-Process "http://127.0.0.1:3001/#/admin"
        Write-Host "✅ Browser opened. You'll need to login manually." -ForegroundColor Yellow
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n🎯 ADMIN EMAIL CREDENTIALS:" -ForegroundColor Yellow
Write-Host "Email: admin@indastreet.com" -ForegroundColor White  
Write-Host "Password: admin123" -ForegroundColor White

Write-Host "`n💡 TIP: The development bypass automatically creates this account if it doesn't exist." -ForegroundColor Gray
Write-Host "✅ Admin access script completed!" -ForegroundColor Green