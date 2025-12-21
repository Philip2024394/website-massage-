# Build Hook - Auto-protect after npm build/dev
# This script monitors npm commands and auto-locks files after builds

param(
    [string]$Command = ""
)

function Invoke-AutoProtectAfterBuild {
    Write-Host "🚀 Build completed - Starting auto-protection..." -ForegroundColor Cyan
    
    # Run the auto-protect system
    & ".\auto-protect.ps1" "lock-all"
    
    Write-Host "✅ All files have been auto-locked after build!" -ForegroundColor Green
    Write-Host "💡 To edit files, use: .\auto-protect.ps1 unlock [filename]" -ForegroundColor Yellow
}

# Hook into npm commands
switch ($Command.ToLower()) {
    "build" {
        Write-Host "📦 Running npm build with auto-protection..." -ForegroundColor Cyan
        & npm run build
        if ($LASTEXITCODE -eq 0) {
            Invoke-AutoProtectAfterBuild
        }
    }
    
    "dev" {
        Write-Host "🔧 Running npm dev..." -ForegroundColor Cyan
        Write-Host "💡 Files will auto-lock when you save them (if watcher is active)" -ForegroundColor Yellow
        & npm run dev
    }
    
    default {
        Write-Host "Build Hook Commands:" -ForegroundColor Cyan
        Write-Host "  .\build-hook.ps1 build  - Run npm build + auto-lock all files" -ForegroundColor White
        Write-Host "  .\build-hook.ps1 dev    - Run npm dev (use with file watchers)" -ForegroundColor White
        Write-Host ""
        Write-Host "Recommended workflow:" -ForegroundColor Yellow
        Write-Host "  1. .\auto-protect.ps1 enable        - Enable protection system" -ForegroundColor White
        Write-Host "  2. .\auto-protect.ps1 start-watcher - Start auto-lock on save" -ForegroundColor White
        Write-Host "  3. .\build-hook.ps1 dev             - Start development server" -ForegroundColor White
        Write-Host "  4. .\auto-protect.ps1 unlock [file] - Unlock file to edit" -ForegroundColor White
        Write-Host "  5. Edit and save - file auto-locks!" -ForegroundColor White
    }
}