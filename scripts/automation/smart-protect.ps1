# Smart Auto-Lock Protection System with Natural Language Commands
# Usage: .\smart-protect.ps1 "unlock therapist dashboard"
# Usage: .\smart-protect.ps1 "unlock admin page" 
# Usage: .\smart-protect.ps1 "start auto lock"

param(
    [Parameter(Position=0)]
    [string]$Command
)

# File mapping with natural language aliases
$global:FileMap = @{
    # Therapist files
    "therapist dashboard" = "pages\TherapistDashboardPage.tsx"
    "therapist page" = "pages\TherapistDashboardPage.tsx"
    "dashboard page" = "pages\TherapistDashboardPage.tsx"
    "therapist status" = "pages\TherapistStatusPage.tsx"
    "status page" = "pages\TherapistStatusPage.tsx"
    
    # Admin files  
    "admin dashboard" = "pages\AdminDashboardPage.tsx"
    "admin page" = "pages\AdminDashboardPage.tsx"
    
    # Navigation files
    "drawer" = "components\AppDrawer.tsx"
    "app drawer" = "components\AppDrawer.tsx"
    "navigation" = "components\AppDrawer.tsx"
    
    # Shared components
    "shared components" = "components\shared\DashboardComponents.tsx"
    "dashboard components" = "components\shared\DashboardComponents.tsx"
    "shared" = "components\shared\DashboardComponents.tsx"
}

$global:FileWatchers = @()
$global:AutoLockActive = $false

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Find-FileByText {
    param([string]$SearchText)
    
    $searchLower = $SearchText.ToLower()
    
    # Direct match first
    if ($global:FileMap.ContainsKey($searchLower)) {
        return $global:FileMap[$searchLower]
    }
    
    # Partial match
    foreach ($key in $global:FileMap.Keys) {
        if ($key -like "*$searchLower*" -or $searchLower -like "*$key*") {
            return $global:FileMap[$key]
        }
    }
    
    # Fuzzy match on file names
    foreach ($file in $global:FileMap.Values) {
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file)
        if ($fileName -like "*$searchLower*" -or $searchLower -like "*$fileName*") {
            return $file
        }
    }
    
    return $null
}

function Start-AutoLockSystem {
    if ($global:AutoLockActive) {
        Write-ColorText "⚠️  Auto-lock system is already running!" "Yellow"
        return
    }
    
    Write-ColorText "🚀 Starting Smart Auto-Lock Protection System..." "Cyan"
    
    $allFiles = $global:FileMap.Values | Select-Object -Unique
    
    foreach ($file in $allFiles) {
        if (Test-Path $file) {
            # Ensure file starts locked
            Set-ItemProperty -Path $file -Name IsReadOnly -Value $true
            
            # Create file system watcher
            $watcher = New-Object System.IO.FileSystemWatcher
            $watcher.Path = Split-Path $file -Parent
            $watcher.Filter = Split-Path $file -Leaf
            $watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite
            $watcher.EnableRaisingEvents = $true
            
            # Register event handler for file changes
            $action = {
                $path = $Event.SourceEventArgs.FullPath
                $name = $Event.SourceEventArgs.Name
                
                # Wait for file operations to complete
                Start-Sleep -Seconds 1
                
                # Check if file is currently unlocked
                try {
                    $isReadOnly = (Get-ItemProperty -Path $path -Name IsReadOnly -ErrorAction SilentlyContinue).IsReadOnly
                    if (-not $isReadOnly) {
                        # Auto-lock after save
                        Set-ItemProperty -Path $path -Name IsReadOnly -Value $true
                        Write-Host "🔒 AUTO-LOCKED after save: $name" -ForegroundColor Red
                        Write-Host "💾 Changes saved and protected!" -ForegroundColor Green
                    }
                } catch {
                    # Ignore errors during auto-lock
                }
            }
            
            $job = Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
            $global:FileWatchers += @{
                Watcher = $watcher
                Job = $job
                File = $file
            }
            
            Write-ColorText "👁️  Watching: $file" "Green"
        }
    }
    
    $global:AutoLockActive = $true
    Write-ColorText "`n✅ Smart Auto-Lock System ACTIVE!" "Green"
    Write-ColorText "📋 Usage Examples:" "Cyan"
    Write-ColorText "   .\smart-protect.ps1 `"unlock therapist dashboard`"" "White"
    Write-ColorText "   .\smart-protect.ps1 `"unlock admin page`"" "White"
    Write-ColorText "   .\smart-protect.ps1 `"unlock drawer`"" "White"
    Write-ColorText "   .\smart-protect.ps1 `"stop`"" "White"
}

function Stop-AutoLockSystem {
    Write-ColorText "🛑 Stopping Auto-Lock System..." "Yellow"
    
    foreach ($item in $global:FileWatchers) {
        $item.Watcher.EnableRaisingEvents = $false
        $item.Watcher.Dispose()
        Unregister-Event -SourceIdentifier $item.Job.Name -ErrorAction SilentlyContinue
        Remove-Job -Job $item.Job -ErrorAction SilentlyContinue
    }
    
    $global:FileWatchers = @()
    $global:AutoLockActive = $false
    Write-ColorText "✅ Auto-Lock System STOPPED" "Green"
}

function Unlock-FileByText {
    param([string]$SearchText)
    
    $file = Find-FileByText -SearchText $SearchText
    
    if ($file -and (Test-Path $file)) {
        Set-ItemProperty -Path $file -Name IsReadOnly -Value $false
        Write-ColorText "🔓 UNLOCKED for editing: $file" "Green"
        Write-ColorText "💡 File will AUTO-LOCK when you save!" "Cyan"
        Write-ColorText "📝 You can now edit this file in VS Code" "Yellow"
        
        # Show file content preview
        $fileName = Split-Path $file -Leaf
        Write-ColorText "`n📄 File: $fileName is ready for editing" "Magenta"
    } else {
        Write-ColorText "❌ Could not find file matching: '$SearchText'" "Red"
        Write-ColorText "💡 Available options:" "Yellow"
        foreach ($key in ($global:FileMap.Keys | Sort-Object)) {
            Write-ColorText "   - $key" "White"
        }
    }
}

function Show-Status {
    Write-ColorText "📊 Smart Auto-Lock Protection Status" "Magenta"
    Write-ColorText "====================================" "Magenta"
    
    if ($global:AutoLockActive) {
        Write-ColorText "✅ System is ACTIVE and watching files" "Green"
    } else {
        Write-ColorText "❌ System is NOT RUNNING" "Red"
    }
    
    Write-ColorText "`n📁 Protected Files:" "Cyan"
    $allFiles = $global:FileMap.Values | Select-Object -Unique
    foreach ($file in $allFiles) {
        if (Test-Path $file) {
            $isReadOnly = (Get-ItemProperty -Path $file -Name IsReadOnly).IsReadOnly
            $status = if ($isReadOnly) { "🔒 LOCKED" } else { "🔓 UNLOCKED" }
            $color = if ($isReadOnly) { "Red" } else { "Yellow" }
            Write-ColorText "   $status $file" $color
        }
    }
    
    Write-ColorText "`n🗣️  Natural Language Commands:" "Cyan"
    Write-ColorText "   `"unlock therapist dashboard`" - Unlocks TherapistDashboardPage.tsx" "White"
    Write-ColorText "   `"unlock admin page`" - Unlocks AdminDashboardPage.tsx" "White"
    Write-ColorText "   `"unlock drawer`" - Unlocks AppDrawer.tsx" "White"
}

# Parse natural language commands
if (-not $Command) {
    Write-ColorText "🛡️  Smart Auto-Lock Protection System" "Magenta"
    Write-ColorText "Usage: .\smart-protect.ps1 `"<command>`"" "White"
    Write-ColorText ""
    Write-ColorText "Examples:" "Cyan"
    Write-ColorText "  .\smart-protect.ps1 `"start auto lock`"" "White"
    Write-ColorText "  .\smart-protect.ps1 `"unlock therapist dashboard`"" "White"
    Write-ColorText "  .\smart-protect.ps1 `"unlock admin page`"" "White"
    Write-ColorText "  .\smart-protect.ps1 `"status`"" "White"
    Write-ColorText "  .\smart-protect.ps1 `"stop`"" "White"
    exit
}

$commandLower = $Command.ToLower().Trim()

# Handle commands
switch -Regex ($commandLower) {
    "^(start|start auto lock|auto lock|begin).*" { 
        Start-AutoLockSystem 
    }
    "^(stop|end|quit|exit).*" { 
        Stop-AutoLockSystem 
    }
    "^(status|show|check|info).*" { 
        Show-Status 
    }
    "^unlock\s+(.+)" { 
        $target = $matches[1]
        Unlock-FileByText -SearchText $target
    }
    default {
        # Try to interpret as unlock command
        if ($commandLower -match "(unlock|open|edit)") {
            $target = $commandLower -replace "(unlock|open|edit)\s*", ""
            if ($target) {
                Unlock-FileByText -SearchText $target
            }
        } else {
            Write-ColorText "❓ Unknown command: '$Command'" "Red"
            Write-ColorText "💡 Try: `"unlock therapist dashboard`" or `"start auto lock`"" "Yellow"
        }
    }
}