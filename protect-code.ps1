# Code Protection Script for Fixed Components
# Usage: .\protect-code.ps1 -Action lock|unlock -Component all|therapist|drawer

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("lock", "unlock")]
    [string]$Action,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("all", "therapist", "drawer", "admin", "shared")]
    [string]$Component
)

# Define critical files that have been fixed
$ProtectedFiles = @{
    "therapist" = @(
        "pages\TherapistDashboardPage.tsx",
        "pages\TherapistStatusPage.tsx"
    )
    "drawer" = @(
        "components\AppDrawer.tsx"
    )
    "admin" = @(
        "pages\AdminDashboardPage.tsx"
    )
    "shared" = @(
        "components\shared\DashboardComponents.tsx"
    )
}

function Set-FileProtection {
    param([string]$FilePath, [bool]$ReadOnly)
    
    if (Test-Path $FilePath) {
        try {
            Set-ItemProperty -Path $FilePath -Name IsReadOnly -Value $ReadOnly
            $statusText = if ($ReadOnly) { "LOCKED" } else { "UNLOCKED" }
            $color = if ($ReadOnly) { "Red" } else { "Green" }
            Write-Host "✅ ${statusText}: $FilePath" -ForegroundColor $color
        } catch {
            Write-Host "❌ Failed to $Action ${FilePath}: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  File not found: $FilePath" -ForegroundColor Yellow
    }
}

function Set-ComponentProtection {
    param([string]$ComponentName)
    
    $isLocking = ($Action -eq "lock")
    Write-Host "`n🔒 $(if ($isLocking) { "LOCKING" } else { "UNLOCKING" }) $ComponentName components..." -ForegroundColor Cyan
    
    foreach ($file in $ProtectedFiles[$ComponentName]) {
        Set-FileProtection -FilePath $file -ReadOnly $isLocking
    }
}

# Main execution
Write-Host "🛡️  Code Protection System" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

if ($Component -eq "all") {
    foreach ($comp in $ProtectedFiles.Keys) {
        Set-ComponentProtection -ComponentName $comp
    }
} else {
    Set-ComponentProtection -ComponentName $Component
}

Write-Host "`n✨ Operation completed!" -ForegroundColor Green

# Create backup of current protection status
$statusFile = "protection-status.json"
$status = @{}
foreach ($comp in $ProtectedFiles.Keys) {
    $status[$comp] = @{}
    foreach ($file in $ProtectedFiles[$comp]) {
        if (Test-Path $file) {
            $status[$comp][$file] = (Get-ItemProperty -Path $file -Name IsReadOnly).IsReadOnly
        }
    }
}
$status | ConvertTo-Json -Depth 3 | Out-File $statusFile
Write-Host "📊 Protection status saved to: $statusFile" -ForegroundColor Blue