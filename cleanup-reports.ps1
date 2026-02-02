# Cleanup script for large report files
# Run this periodically to prevent VS Code from slowing down

Write-Host "🧹 Cleaning up large report files..." -ForegroundColor Cyan

# Find and remove large report files
$reportFiles = @(
    "eslint-report.json",
    "file-size-report.json"
)

$cleaned = 0
foreach ($pattern in $reportFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file.FullName -notlike "*node_modules*") {
            $sizeMB = [math]::Round($file.Length/1MB, 2)
            Write-Host "  Removing: $($file.FullName) ($sizeMB MB)" -ForegroundColor Yellow
            Remove-Item $file.FullName -Force
            $cleaned++
        }
    }
}

if ($cleaned -eq 0) {
    Write-Host "✅ No large report files found. All clean!" -ForegroundColor Green
} else {
    Write-Host "✅ Cleaned up $cleaned file(s)" -ForegroundColor Green
}

# Show current workspace size (excluding node_modules)
Write-Host "`n📊 Workspace Statistics:" -ForegroundColor Cyan
$totalSize = (Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" } | 
    Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize/1MB, 2)
Write-Host "  Total size (excluding node_modules): $totalSizeMB MB" -ForegroundColor White
