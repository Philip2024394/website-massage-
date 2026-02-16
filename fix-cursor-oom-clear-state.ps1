# Fix Cursor OOM: backup and clear bloated state.vscdb (must close Cursor first)
$cursorStorage = "$env:APPDATA\Cursor\User\globalStorage"
$stateDb = Join-Path $cursorStorage "state.vscdb"
$stateJournal = Join-Path $cursorStorage "state.vscdb-journal"
$backupDir = "$env:APPDATA\Cursor\User\globalStorage\state.vscdb.backup"

if (-not (Test-Path $stateDb)) {
    Write-Host "state.vscdb not found at: $stateDb" -ForegroundColor Yellow
    exit 0
}

$size = (Get-Item $stateDb).Length / 1MB
Write-Host "Current state.vscdb size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan

if ($size -lt 50) {
    Write-Host "File is under 50 MB. Clear anyway? (y/n)"
    $r = Read-Host
    if ($r -ne 'y') { exit 0 }
}

# Backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$backupDir-$timestamp"
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
Copy-Item $stateDb (Join-Path $backupPath "state.vscdb") -Force
if (Test-Path $stateJournal) { Copy-Item $stateJournal (Join-Path $backupPath "state.vscdb-journal") -Force }
Write-Host "Backed up to: $backupPath" -ForegroundColor Green

# Remove so Cursor creates a fresh one
Remove-Item $stateDb -Force
if (Test-Path $stateJournal) { Remove-Item $stateJournal -Force }
Write-Host "state.vscdb cleared. Restart Cursor. (Chat history in this workspace may be reset.)" -ForegroundColor Green
