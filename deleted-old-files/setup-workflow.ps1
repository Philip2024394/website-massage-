# One-time setup script for Git workflow
Write-Host "🚀 Setting up Git Feature Branch Workflow..." -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this from the project root directory" -ForegroundColor Red
    exit 1
}

# Load helpers
. .\git-helpers.ps1

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Every time you open PowerShell, run:" -ForegroundColor Yellow
Write-Host "   . .\git-helpers.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. To start working on a dashboard:" -ForegroundColor Yellow
Write-Host "   work-on therapist" -ForegroundColor White
Write-Host "   work-on promoter" -ForegroundColor White
Write-Host "   work-on place" -ForegroundColor White
Write-Host "   work-on admin" -ForegroundColor White
Write-Host ""
Write-Host "3. When done with changes:" -ForegroundColor Yellow
Write-Host "   merge-work" -ForegroundColor White
Write-Host ""
Write-Host "4. To see all commands:" -ForegroundColor Yellow
Write-Host "   git-help" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide available in: WORKFLOW-GUIDE.md" -ForegroundColor Gray
Write-Host ""

# Create a morning backup right now
Write-Host "Creating initial backup..." -ForegroundColor Cyan
savepoint "setup: initial feature branch workflow"

Write-Host ""
Write-Host "🎉 Ready to work safely on dashboards!" -ForegroundColor Green
