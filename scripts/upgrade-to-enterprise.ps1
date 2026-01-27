# ================================================================================
# 🏢 ENTERPRISE UPGRADE AUTOMATION SCRIPT
# ================================================================================
# Systematically upgrades entire codebase to enterprise standards
# - Replaces console.* → logger.*
# - Replaces fetch() → httpClient.*
# - Replaces localStorage → storage.*

Write-Host "`n🏢 ENTERPRISE UPGRADE AUTOMATION" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$totalFiles = 0
$filesModified = 0
$errors = @()

# ================================================================================
# PHASE 1: REPLACE CONSOLE.* CALLS WITH LOGGER
# ================================================================================

Write-Host "📋 Phase 1: Upgrading console.* to logger..." -ForegroundColor Yellow

# TypeScript/TSX files only (exclude node_modules, dist, build)
$tsFiles = Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx" -Exclude "*.spec.ts","*.test.ts" | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|build|\.vite|\.next" }

Write-Host "   Found $($tsFiles.Count) TypeScript files to process`n" -ForegroundColor Gray

foreach ($file in $tsFiles) {
    $totalFiles++
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $modified = $false
        
        # Check if file already imports logger
        $hasLoggerImport = $content -match "import.*logger.*from.*enterpriseLogger"
        
        # Check if file has console calls
        $hasConsoleCalls = $content -match "console\.(log|error|warn|info|debug)"
        
        if ($hasConsoleCalls -and -not $hasLoggerImport) {
            # Add logger import at the top (after existing imports)
            if ($content -match "(?sm)(import.*?;[\r\n]+)+") {
                $lastImportMatch = [regex]::Matches($content, "import.*?;[\r\n]+") | Select-Object -Last 1
                if ($lastImportMatch) {
                    $insertPosition = $lastImportMatch.Index + $lastImportMatch.Length
                    $importStatement = "import { logger } from '@/services/enterpriseLogger';`n"
                    
                    # Calculate correct relative path
                    $depth = ($relativePath.Split('\') | Where-Object { $_ -ne "" }).Count - 1
                    $relativePath = if ($depth -eq 0) { "./" } else { "../" * $depth }
                    $importStatement = "import { logger } from '${relativePath}src/services/enterpriseLogger';`n"
                    
                    $content = $content.Insert($insertPosition, $importStatement)
                    $modified = $true
                }
            }
        }
        
        if ($hasConsoleCalls) {
            # Replace console.error with logger.error
            $beforeCount = ([regex]::Matches($content, "console\.error")).Count
            $content = $content -replace 'console\.error\((.*?)\)', 'logger.error($1)'
            $afterCount = ([regex]::Matches($content, "console\.error")).Count
            if ($beforeCount -ne $afterCount) { $modified = $true }
            
            # Replace console.warn with logger.warn
            $beforeCount = ([regex]::Matches($content, "console\.warn")).Count
            $content = $content -replace 'console\.warn\((.*?)\)', 'logger.warn($1)'
            $afterCount = ([regex]::Matches($content, "console\.warn")).Count
            if ($beforeCount -ne $afterCount) { $modified = $true }
            
            # Replace console.log with logger.info (info is more appropriate for general logs)
            $beforeCount = ([regex]::Matches($content, "console\.log")).Count
            $content = $content -replace 'console\.log\((.*?)\)', 'logger.info($1)'
            $afterCount = ([regex]::Matches($content, "console\.log")).Count
            if ($beforeCount -ne $afterCount) { $modified = $true }
            
            # Replace console.info with logger.info
            $beforeCount = ([regex]::Matches($content, "console\.info")).Count
            $content = $content -replace 'console\.info\((.*?)\)', 'logger.info($1)'
            $afterCount = ([regex]::Matches($content, "console\.info")).Count
            if ($beforeCount -ne $afterCount) { $modified = $true }
            
            # Replace console.debug with logger.debug
            $beforeCount = ([regex]::Matches($content, "console\.debug")).Count
            $content = $content -replace 'console\.debug\((.*?)\)', 'logger.debug($1)'
            $afterCount = ([regex]::Matches($content, "console\.debug")).Count
            if ($beforeCount -ne $afterCount) { $modified = $true }
        }
        
        if ($modified -and $content -ne $originalContent) {
            $content | Set-Content $file.FullName -NoNewline
            $filesModified++
            Write-Host "   ✓ $relativePath" -ForegroundColor Green
        }
        
    } catch {
        $errors += "Error processing $($file.Name): $_"
        Write-Host "   ✗ $relativePath : $_" -ForegroundColor Red
    }
}

Write-Host "`n   📊 Modified $filesModified files" -ForegroundColor Cyan

# ================================================================================
# PHASE 2: REPLACE FETCH() CALLS WITH HTTPCLIENT
# ================================================================================

Write-Host "`n📋 Phase 2: Upgrading fetch() to httpClient..." -ForegroundColor Yellow

$fetchFilesModified = 0

foreach ($file in $tsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $modified = $false
        
        # Check if file has fetch calls
        $hasFetchCalls = $content -match "fetch\s*\("
        
        if ($hasFetchCalls) {
            # Check if httpClient import exists
            $hasHttpClientImport = $content -match "import.*httpClient.*from.*enterpriseHttpClient"
            
            if (-not $hasHttpClientImport) {
                # Add httpClient import
                if ($content -match "(?sm)(import.*?;[\r\n]+)+") {
                    $lastImportMatch = [regex]::Matches($content, "import.*?;[\r\n]+") | Select-Object -Last 1
                    if ($lastImportMatch) {
                        $insertPosition = $lastImportMatch.Index + $lastImportMatch.Length
                        $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
                        $depth = ($relativePath.Split('\') | Where-Object { $_ -ne "" }).Count - 1
                        $relativePathStr = if ($depth -eq 0) { "./" } else { "../" * $depth }
                        $importStatement = "import { httpClient } from '${relativePathStr}src/services/enterpriseHttpClient';`n"
                        
                        $content = $content.Insert($insertPosition, $importStatement)
                        $modified = $true
                    }
                }
            }
            
            # Replace simple fetch GET calls
            # Pattern: fetch('/api/...')
            $content = $content -replace "await\s+fetch\s*\(\s*[`'`"](.+?)[`'`"]\s*\)", 'await httpClient.get(''$1'')'
            $content = $content -replace "fetch\s*\(\s*[`'`"](.+?)[`'`"]\s*\)", 'httpClient.get(''$1'')'
            
            if ($content -ne $originalContent) {
                $modified = $true
            }
        }
        
        if ($modified) {
            $content | Set-Content $file.FullName -NoNewline
            $fetchFilesModified++
            $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
            Write-Host "   ✓ $relativePath" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "   ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n   📊 Modified $fetchFilesModified files" -ForegroundColor Cyan

# ================================================================================
# PHASE 3: REPLACE LOCALSTORAGE/SESSIONSTORAGE WITH STORAGE
# ================================================================================

Write-Host "`n📋 Phase 3: Upgrading localStorage/sessionStorage to storage..." -ForegroundColor Yellow

$storageFilesModified = 0

foreach ($file in $tsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $modified = $false
        
        # Check if file has storage calls
        $hasStorageCalls = $content -match "(localStorage|sessionStorage)\."
        
        if ($hasStorageCalls) {
            # Check if storage import exists
            $hasStorageImport = $content -match "import.*storage.*from.*enterpriseStorage"
            
            if (-not $hasStorageImport) {
                # Add storage import
                if ($content -match "(?sm)(import.*?;[\r\n]+)+") {
                    $lastImportMatch = [regex]::Matches($content, "import.*?;[\r\n]+") | Select-Object -Last 1
                    if ($lastImportMatch) {
                        $insertPosition = $lastImportMatch.Index + $lastImportMatch.Length
                        $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
                        $depth = ($relativePath.Split('\') | Where-Object { $_ -ne "" }).Count - 1
                        $relativePathStr = if ($depth -eq 0) { "./" } else { "../" * $depth }
                        $importStatement = "import { storage } from '${relativePathStr}src/services/enterpriseStorage';`n"
                        
                        $content = $content.Insert($insertPosition, $importStatement)
                        $modified = $true
                    }
                }
            }
            
            # Replace localStorage.setItem(key, value)
            $content = $content -replace "(localStorage|sessionStorage)\.setItem\s*\(\s*([^,]+)\s*,\s*(.+?)\s*\)", 'storage.set($2, $3)'
            
            # Replace localStorage.getItem(key)
            $content = $content -replace "(localStorage|sessionStorage)\.getItem\s*\(\s*(.+?)\s*\)", 'storage.get($2)'
            
            # Replace localStorage.removeItem(key)
            $content = $content -replace "(localStorage|sessionStorage)\.removeItem\s*\(\s*(.+?)\s*\)", 'storage.remove($2)'
            
            # Replace localStorage.clear()
            $content = $content -replace "(localStorage|sessionStorage)\.clear\s*\(\s*\)", 'storage.clear()'
            
            if ($content -ne $originalContent) {
                $modified = $true
            }
        }
        
        if ($modified) {
            $content | Set-Content $file.FullName -NoNewline
            $storageFilesModified++
            $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
            Write-Host "   ✓ $relativePath" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "   ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n   📊 Modified $storageFilesModified files" -ForegroundColor Cyan

# ================================================================================
# SUMMARY
# ================================================================================

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🏢 ENTERPRISE UPGRADE COMPLETE" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total files scanned: $totalFiles" -ForegroundColor Gray
Write-Host "   Console → Logger: $filesModified files" -ForegroundColor Green
Write-Host "   Fetch → HttpClient: $fetchFilesModified files" -ForegroundColor Green
Write-Host "   Storage → Storage: $storageFilesModified files" -ForegroundColor Green
Write-Host "   Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })

if ($errors.Count -gt 0) {
    Write-Host "`n⚠️ ERRORS:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
}

Write-Host "`n✅ NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Run 'pnpm build' to verify TypeScript compilation" -ForegroundColor Gray
Write-Host "   2. Run tests to ensure functionality preserved" -ForegroundColor Gray
Write-Host "   3. Review git diff for any issues" -ForegroundColor Gray
Write-Host "   4. Commit with message: 'ENTERPRISE: Mass upgrade to enterprise services'" -ForegroundColor Gray
Write-Host ""
