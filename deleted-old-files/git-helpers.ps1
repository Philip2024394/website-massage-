# Git Workflow Helper Functions
# Source this file in your PowerShell profile or run: . .\git-helpers.ps1

function savepoint {
    param(
        [string]$message = "savepoint: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    )
    Write-Host "📸 Creating save point..." -ForegroundColor Cyan
    git add .
    git commit -m $message
    git push origin main
    Write-Host "✅ Save point created and backed up to GitHub" -ForegroundColor Green
}

function work-on {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet('therapist', 'place', 'promoter', 'admin', 'customer')]
        [string]$dashboard
    )
    
    $branchName = "work/$dashboard-dashboard-$(Get-Date -Format 'MMdd')"
    
    Write-Host "🔄 Switching to work on $dashboard dashboard..." -ForegroundColor Cyan
    
    # Save current work first
    git add .
    $status = git status --porcelain
    if ($status) {
        git commit -m "wip: saving before switch to $dashboard work"
    }
    
    # Create or switch to feature branch
    git checkout -b $branchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout $branchName
    }
    
    Write-Host "✅ Ready to work on $dashboard dashboard" -ForegroundColor Green
    Write-Host "📝 Branch: $branchName" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "When done, run: merge-work" -ForegroundColor Gray
}

function merge-work {
    Write-Host "🔄 Merging your work back to main..." -ForegroundColor Cyan
    
    $currentBranch = git branch --show-current
    
    if ($currentBranch -eq "main") {
        Write-Host "❌ Already on main branch. Nothing to merge." -ForegroundColor Red
        return
    }
    
    # Commit any pending changes
    git add .
    $status = git status --porcelain
    if ($status) {
        Write-Host "📝 Committing current changes..."
        $commitMsg = Read-Host "Commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "feat: $currentBranch updates"
        }
        git commit -m $commitMsg
    }
    
    # Switch to main and merge
    git checkout main
    Write-Host "🔀 Merging $currentBranch into main..."
    git merge $currentBranch --no-ff -m "merge: $currentBranch"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Merged successfully!" -ForegroundColor Green
        git push origin main
        
        # Ask to delete feature branch
        $delete = Read-Host "Delete feature branch $currentBranch? (y/n)"
        if ($delete -eq 'y') {
            git branch -d $currentBranch
            Write-Host "🗑️  Deleted $currentBranch" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Merge conflict! Resolve conflicts and run 'git commit'" -ForegroundColor Red
    }
}

function undo {
    Write-Host "⏮️  Undoing recent changes..." -ForegroundColor Yellow
    Write-Host "What would you like to undo?" -ForegroundColor Cyan
    Write-Host "1. Uncommitted changes (restore working files)"
    Write-Host "2. Last commit (keep changes, undo commit)"
    Write-Host "3. Last commit (discard changes completely)"
    
    $choice = Read-Host "Enter choice (1-3)"
    
    switch ($choice) {
        "1" {
            git restore .
            Write-Host "✅ Restored all files to last commit" -ForegroundColor Green
        }
        "2" {
            git reset --soft HEAD~1
            Write-Host "✅ Undid last commit (changes still in working directory)" -ForegroundColor Green
        }
        "3" {
            Write-Host "⚠️  This will permanently delete changes!" -ForegroundColor Red
            $confirm = Read-Host "Type 'yes' to confirm"
            if ($confirm -eq 'yes') {
                git reset --hard HEAD~1
                Write-Host "✅ Undid last commit and discarded changes" -ForegroundColor Green
            } else {
                Write-Host "❌ Cancelled" -ForegroundColor Gray
            }
        }
        default {
            Write-Host "❌ Invalid choice" -ForegroundColor Red
        }
    }
}

function restore-dashboard {
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet('therapist', 'place', 'promoter', 'admin', 'customer', 'partners')]
        [string]$dashboard
    )
    
    $fileMap = @{
        'therapist' = 'pages/TherapistDashboardPage.tsx'
        'place' = 'pages/PlaceDashboardPage.tsx'
        'promoter' = 'pages/PromoterLiveMenuPage.tsx'
        'admin' = 'pages/AdminDashboardPage.tsx'
        'customer' = 'pages/CustomerDashboardPage.tsx'
        'partners' = 'pages/PartnersDashboardPage.tsx'
    }
    
    $file = $fileMap[$dashboard]
    
    Write-Host "🛟 Restoring $dashboard dashboard from production-stable..." -ForegroundColor Cyan
    git checkout production-stable -- $file
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Restored $file" -ForegroundColor Green
        Write-Host "📝 Review changes with: git diff $file" -ForegroundColor Gray
        Write-Host "To commit: git add $file && git commit -m 'restore: $dashboard dashboard'"
    } else {
        Write-Host "❌ Failed to restore. Check if file exists in production-stable" -ForegroundColor Red
    }
}

function see-changes {
    Write-Host "📊 Recent Changes:" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Modified files:" -ForegroundColor Yellow
    git status --short
    
    Write-Host ""
    Write-Host "Recent commits:" -ForegroundColor Yellow
    git log --oneline -5
    
    Write-Host ""
    Write-Host "Current branch:" -ForegroundColor Yellow
    git branch --show-current
}

function quick-backup {
    Write-Host "💾 Creating quick backup..." -ForegroundColor Cyan
    $branchName = "backup/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    git branch $branchName
    git push origin $branchName
    Write-Host "✅ Backup created: $branchName" -ForegroundColor Green
}

function list-work {
    Write-Host "📋 Your work branches:" -ForegroundColor Cyan
    git branch | Select-String "work/"
    Write-Host ""
    Write-Host "To switch: git checkout <branch-name>" -ForegroundColor Gray
}

function update-stable {
    Write-Host "🔄 Updating production-stable with current main..." -ForegroundColor Cyan
    $currentBranch = git branch --show-current
    
    git checkout production-stable
    git merge main --no-ff -m "update: sync stable with main $(Get-Date -Format 'yyyy-MM-dd')"
    git push origin production-stable
    
    git checkout $currentBranch
    Write-Host "✅ production-stable updated" -ForegroundColor Green
}

# Display available commands
function git-help {
    Write-Host ""
    Write-Host "🚀 Git Workflow Helper Commands" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📸 savepoint" -ForegroundColor Yellow -NoNewline
    Write-Host "              - Quick save current state"
    Write-Host ""
    Write-Host "🔨 work-on <dashboard>" -ForegroundColor Yellow -NoNewline
    Write-Host "   - Start working on dashboard"
    Write-Host "   Options: therapist, place, promoter, admin, customer"
    Write-Host "   Example: work-on therapist"
    Write-Host ""
    Write-Host "🔀 merge-work" -ForegroundColor Yellow -NoNewline
    Write-Host "             - Merge your work back to main"
    Write-Host ""
    Write-Host "⏮️  undo" -ForegroundColor Yellow -NoNewline
    Write-Host "                  - Undo recent changes (interactive)"
    Write-Host ""
    Write-Host "🛟 restore-dashboard <name>" -ForegroundColor Yellow -NoNewline
    Write-Host " - Restore dashboard from backup"
    Write-Host "   Example: restore-dashboard therapist"
    Write-Host ""
    Write-Host "📊 see-changes" -ForegroundColor Yellow -NoNewline
    Write-Host "           - Show what changed"
    Write-Host ""
    Write-Host "💾 quick-backup" -ForegroundColor Yellow -NoNewline
    Write-Host "          - Create timestamped backup branch"
    Write-Host ""
    Write-Host "📋 list-work" -ForegroundColor Yellow -NoNewline
    Write-Host "             - List all work branches"
    Write-Host ""
    Write-Host "🔄 update-stable" -ForegroundColor Yellow -NoNewline
    Write-Host "          - Update production-stable from main"
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "✅ Git helpers loaded! Run 'git-help' to see all commands" -ForegroundColor Green
