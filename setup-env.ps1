# Setup script to create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Get-Content ".env.example" | Set-Content ".env"
    Write-Host "✓ .env file created successfully!" -ForegroundColor Green
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
