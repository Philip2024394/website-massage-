# Auto-Protect System - Automatically lock all pages after updates
# Usage: .\auto-protect.ps1 [action]
# Actions: enable, disable, status, lock-all, unlock-all, unlock [filename]

param(
    [string]$Action = "status",
    [string]$FileName = ""
)

# Configuration
$ConfigFile = "auto-protect-config.json"
$LogFile = "auto-protect.log"

# Default configuration
$DefaultConfig = @{
    enabled = $true
    autoLockAfterSave = $true
    protectedDirectories = @("pages", "components")
    excludePatterns = @("*test*", "*spec*", "*demo*")
    requireConfirmation = $true
    watcherEnabled = $false
} | ConvertTo-Json -Depth 3

# Global variables for file watchers
$global:FileWatchers = @()

# Logging function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# Load configuration
function Load-Config {
    if (!(Test-Path $ConfigFile)) {
        $DefaultConfig | Out-File -FilePath $ConfigFile -Encoding UTF8
        Write-Log "Created default configuration file: $ConfigFile"
    }
    return Get-Content $ConfigFile | ConvertFrom-Json
}

# Save configuration
function Save-Config {
    param($Config)
    $Config | ConvertTo-Json -Depth 3 | Out-File -FilePath $ConfigFile -Encoding UTF8
}

# Get all TypeScript files in protected directories
function Get-ProtectedFiles {
    param($Config)
    
    $allFiles = @()
    foreach ($dir in $Config.protectedDirectories) {
        if (Test-Path $dir) {
            $files = Get-ChildItem -Path "$dir\*.tsx" -Recurse | Where-Object {
                $file = $_
                $shouldExclude = $false
                foreach ($pattern in $Config.excludePatterns) {
                    if ($file.Name -like $pattern) {
                        $shouldExclude = $true
                        break
                    }
                }
                return !$shouldExclude
            }
            $allFiles += $files
        }
    }
    return $allFiles
}

# Lock all files
function Lock-AllFiles {
    param($Config)
    
    $files = Get-ProtectedFiles -Config $Config
    $lockedCount = 0
    
    Write-Log "Starting auto-lock process for all protected files..."
    
    foreach ($file in $files) {
        try {
            if (!(Get-ItemProperty $file.FullName).IsReadOnly) {
                Set-ItemProperty -Path $file.FullName -Name IsReadOnly -Value $true
                $lockedCount++
                Write-Log "🔒 LOCKED: $($file.Name)"
            }
        }
        catch {
            Write-Log "❌ ERROR locking $($file.Name): $($_.Exception.Message)"
        }
    }
    
    Write-Log "✅ AUTO-LOCK COMPLETE: $lockedCount files locked out of $($files.Count) total files"
    return $lockedCount
}

# Unlock all files (with confirmation)
function Unlock-AllFiles {
    param($Config, [bool]$Force = $false)
    
    if ($Config.requireConfirmation -and !$Force) {
        Write-Host "⚠️  WARNING: This will unlock ALL protected files!" -ForegroundColor Yellow
        Write-Host "Protected directories: $($Config.protectedDirectories -join ', ')" -ForegroundColor Yellow
        
        $confirmation = Read-Host "Type 'UNLOCK-ALL' to confirm unlocking all files"
        if ($confirmation -ne "UNLOCK-ALL") {
            Write-Log "❌ Unlock operation cancelled by user"
            return 0
        }
    }
    
    $files = Get-ProtectedFiles -Config $Config
    $unlockedCount = 0
    
    Write-Log "Starting unlock process for all protected files..."
    
    foreach ($file in $files) {
        try {
            if ((Get-ItemProperty $file.FullName).IsReadOnly) {
                Set-ItemProperty -Path $file.FullName -Name IsReadOnly -Value $false
                $unlockedCount++
                Write-Log "🔓 UNLOCKED: $($file.Name)"
            }
        }
        catch {
            Write-Log "❌ ERROR unlocking $($file.Name): $($_.Exception.Message)"
        }
    }
    
    Write-Log "✅ UNLOCK COMPLETE: $unlockedCount files unlocked out of $($files.Count) total files"
    return $unlockedCount
}

# Unlock specific file
function Unlock-SpecificFile {
    param($Config, $FileName)
    
    $files = Get-ProtectedFiles -Config $Config
    $matchedFiles = $files | Where-Object { $_.Name -like "*$FileName*" -or $_.BaseName -like "*$FileName*" }
    
    if ($matchedFiles.Count -eq 0) {
        Write-Host "❌ No files found matching: $FileName" -ForegroundColor Red
        Write-Host "Available files:" -ForegroundColor Yellow
        $files | ForEach-Object { Write-Host "   • $($_.Name)" -ForegroundColor White }
        return
    }
    
    if ($matchedFiles.Count -gt 1) {
        Write-Host "⚠️  Multiple files found matching '$FileName':" -ForegroundColor Yellow
        $matchedFiles | ForEach-Object { Write-Host "   • $($_.Name)" -ForegroundColor White }
        $selection = Read-Host "Enter the exact filename to unlock"
        $matchedFiles = $matchedFiles | Where-Object { $_.Name -eq $selection }
        if (!$matchedFiles) {
            Write-Host "❌ Invalid selection" -ForegroundColor Red
            return
        }
    }
    
    foreach ($file in $matchedFiles) {
        try {
            Set-ItemProperty -Path $file.FullName -Name IsReadOnly -Value $false
            Write-Host "🔓 UNLOCKED for editing: $($file.Name)" -ForegroundColor Green
            Write-Log "🔓 MANUAL UNLOCK: $($file.Name)"
            
            if ($Config.autoLockAfterSave) {
                Write-Host "💡 Note: File will AUTO-LOCK when you save it (if watcher is running)!" -ForegroundColor Cyan
            }
        }
        catch {
            Write-Host "❌ ERROR unlocking $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Start file watchers for auto-locking after save
function Start-FileWatchers {
    param($Config)
    
    if ($global:FileWatchers.Count -gt 0) {
        Write-Host "⚠️  File watchers are already running!" -ForegroundColor Yellow
        return
    }
    
    $files = Get-ProtectedFiles -Config $Config
    Write-Host "🚀 Starting file watchers for auto-lock protection..." -ForegroundColor Cyan
    
    foreach ($file in $files) {
        try {
            $watcher = New-Object System.IO.FileSystemWatcher
            $watcher.Path = $file.DirectoryName
            $watcher.Filter = $file.Name
            $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
            $watcher.EnableRaisingEvents = $true
            
            # Register event handler for file changes
            $action = {
                $path = $Event.SourceEventArgs.FullPath
                $name = $Event.SourceEventArgs.Name
                
                # Wait a moment for file operations to complete
                Start-Sleep -Seconds 1
                
                # Auto-lock the file after change
                try {
                    if (Test-Path $path) {
                        Set-ItemProperty -Path $path -Name IsReadOnly -Value $true
                        Write-Host "🔒 AUTO-LOCKED after save: $name" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "❌ Failed to auto-lock: $name - $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
            
            $job = Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
            $global:FileWatchers += @{
                Watcher = $watcher
                Job = $job
                File = $file.FullName
            }
            
            Write-Host "👁️  Watching: $($file.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to create watcher for $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    $config.watcherEnabled = $true
    Save-Config -Config $config
    Write-Log "✅ File watchers started for $($global:FileWatchers.Count) files"
}

# Stop file watchers
function Stop-FileWatchers {
    param($Config)
    
    Write-Host "🛑 Stopping file watchers..." -ForegroundColor Yellow
    
    foreach ($item in $global:FileWatchers) {
        try {
            $item.Watcher.EnableRaisingEvents = $false
            $item.Watcher.Dispose()
            Unregister-Event -SourceIdentifier $item.Job.Name -ErrorAction SilentlyContinue
            Remove-Job -Job $item.Job -ErrorAction SilentlyContinue
        }
        catch {
            # Silently handle cleanup errors
        }
    }
    
    $global:FileWatchers = @()
    $config.watcherEnabled = $false
    Save-Config -Config $config
    Write-Log "✅ File watchers stopped"
}

# Show comprehensive status
function Show-Status {
    param($Config)
    
    $files = Get-ProtectedFiles -Config $Config
    $lockedFiles = $files | Where-Object { (Get-ItemProperty $_.FullName).IsReadOnly }
    $unlockedFiles = $files | Where-Object { !(Get-ItemProperty $_.FullName).IsReadOnly }
    
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "    AUTO-PROTECT SYSTEM STATUS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🔧 Configuration:" -ForegroundColor Green
    Write-Host "   • System Enabled: $($Config.enabled)" -ForegroundColor White
    Write-Host "   • Auto-lock after save: $($Config.autoLockAfterSave)" -ForegroundColor White
    Write-Host "   • File watchers running: $($Config.watcherEnabled)" -ForegroundColor White
    Write-Host "   • Require confirmation: $($Config.requireConfirmation)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📂 Protected Directories:" -ForegroundColor Green
    foreach ($dir in $Config.protectedDirectories) {
        $status = if (Test-Path $dir) { "✅" } else { "❌" }
        Write-Host "   $status $dir" -ForegroundColor White
    }
    Write-Host ""
    
    Write-Host "📊 File Status Summary:" -ForegroundColor Green
    Write-Host "   • Total files: $($files.Count)" -ForegroundColor White
    Write-Host "   • 🔒 Locked files: $($lockedFiles.Count)" -ForegroundColor Red
    Write-Host "   • 🔓 Unlocked files: $($unlockedFiles.Count)" -ForegroundColor Yellow
    Write-Host "   • 👁️  Active watchers: $($global:FileWatchers.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($lockedFiles.Count -gt 0) {
        Write-Host "🔒 LOCKED FILES:" -ForegroundColor Red
        foreach ($file in $lockedFiles) {
            Write-Host "   • $($file.Name)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($unlockedFiles.Count -gt 0) {
        Write-Host "🔓 UNLOCKED FILES:" -ForegroundColor Yellow
        foreach ($file in $unlockedFiles) {
            Write-Host "   • $($file.Name)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "💡 Quick Commands:" -ForegroundColor Cyan
    Write-Host "   .\auto-protect.ps1 lock-all          - Lock all files" -ForegroundColor White
    Write-Host "   .\auto-protect.ps1 unlock [filename] - Unlock specific file" -ForegroundColor White
    Write-Host "   .\auto-protect.ps1 start-watcher     - Start auto-lock watchers" -ForegroundColor White
    Write-Host "   .\auto-protect.ps1 stop-watcher      - Stop auto-lock watchers" -ForegroundColor White
}

# Main execution
$config = Load-Config

# Handle unlock with filename
if ($Action -eq "unlock" -and $FileName -ne "") {
    Unlock-SpecificFile -Config $config -FileName $FileName
    exit
}

switch ($Action.ToLower()) {
    "enable" {
        $config.enabled = $true
        Save-Config -Config $config
        Write-Log "✅ Auto-protect system ENABLED"
        Lock-AllFiles -Config $config
        Write-Host "Use '.\auto-protect.ps1 start-watcher' to enable auto-lock after save" -ForegroundColor Cyan
    }
    
    "disable" {
        Stop-FileWatchers -Config $config
        $config.enabled = $false
        Save-Config -Config $config
        Write-Log "❌ Auto-protect system DISABLED"
        Write-Host "Note: Existing locked files remain locked. Use 'unlock-all' to unlock them." -ForegroundColor Yellow
    }
    
    "lock-all" {
        if ($config.enabled) {
            Lock-AllFiles -Config $config
        }
        else {
            Write-Host "❌ Auto-protect system is disabled. Use 'enable' first." -ForegroundColor Red
        }
    }
    
    "unlock-all" {
        Unlock-AllFiles -Config $config
    }
    
    "force-unlock-all" {
        Unlock-AllFiles -Config $config -Force $true
    }
    
    "start-watcher" {
        if ($config.enabled) {
            Start-FileWatchers -Config $config
            Write-Host "✅ Auto-lock watchers started. Files will lock automatically after saving." -ForegroundColor Green
        }
        else {
            Write-Host "❌ Auto-protect system is disabled. Use 'enable' first." -ForegroundColor Red
        }
    }
    
    "stop-watcher" {
        Stop-FileWatchers -Config $config
    }
    
    "status" {
        Show-Status -Config $config
    }
    
    default {
        Write-Host "Auto-Protect System Commands:" -ForegroundColor Cyan
        Write-Host "  .\auto-protect.ps1 enable              - Enable auto-protection and lock all files" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 disable             - Disable auto-protection" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 lock-all            - Lock all protected files" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 unlock-all          - Unlock all files (with confirmation)" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 unlock [filename]   - Unlock specific file for editing" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 start-watcher       - Start auto-lock file watchers" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 stop-watcher        - Stop auto-lock file watchers" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 status              - Show protection status" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\auto-protect.ps1 unlock HomePage     - Unlock HomePage.tsx for editing" -ForegroundColor White
        Write-Host "  .\auto-protect.ps1 unlock TherapistStatus - Unlock TherapistStatusPage.tsx" -ForegroundColor White
    }
}