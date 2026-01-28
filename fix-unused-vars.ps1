# Fix all unused variables by prefixing with underscore
# This script automatically fixes TypeScript TS6133 errors

$ErrorActionPreference = 'Continue'

Write-Host "🔧 Fixing unused variables..." -ForegroundColor Cyan

# Get all TypeScript errors
$typeCheckOutput = pnpm type-check 2>&1 | Out-String

# Parse unused variable errors (TS6133)
$unusedErrors = $typeCheckOutput | Select-String "error TS6133: '(\w+)' is declared but its value is never read\." -AllMatches

$fixedCount = 0
$fileChanges = @{}

foreach ($match in $unusedErrors) {
    $fullLine = $match.Line
    
    # Extract file path and variable name
    if ($fullLine -match "(.+\.tsx?):(\d+):(\d+) - error TS6133: '(\w+)' is declared") {
        $filePath = $Matches[1]
        $lineNumber = [int]$Matches[2]
        $varName = $Matches[4]
        
        # Skip if already prefixed with underscore
        if ($varName.StartsWith('_')) {
            continue
        }
        
        # Read file
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw
            $lines = Get-Content $filePath
            
            if ($lineNumber -le $lines.Count) {
                $line = $lines[$lineNumber - 1]
                
                # Pattern matching for different variable declarations
                $patterns = @(
                    # Function parameters: (varName: type)
                    "(\(|,\s*)($varName)(\s*:\s*[^,\)]+)",
                    # Destructuring: { varName }
                    "(\{\s*)($varName)(\s*[,\}])",
                    # Const/let/var: const varName =
                    "(const|let|var)(\s+)($varName)(\s*[=:])",
                    # Arrow function params: varName =>
                    "(\(|,\s*)($varName)(\s*[,\)])",
                    # Import: import { varName }
                    "import\s+\{[^}]*\b($varName)\b[^}]*\}"
                )
                
                $replaced = $false
                foreach ($pattern in $patterns) {
                    $newLine = $line -replace $pattern, "`$1_$varName`$3"
                    if ($newLine -ne $line) {
                        $lines[$lineNumber - 1] = $newLine
                        $replaced = $true
                        $fixedCount++
                        
                        if (-not $fileChanges.ContainsKey($filePath)) {
                            $fileChanges[$filePath] = 0
                        }
                        $fileChanges[$filePath]++
                        
                        Write-Host "  ✓ ${filePath}:${lineNumber} - ${varName} → _${varName}" -ForegroundColor Green
                        break
                    }
                }
                
                if ($replaced) {
                    # Write back to file
                    $lines | Set-Content $filePath -NoNewline
                }
            }
        }
    }
}

Write-Host ""
Write-Host "✅ Fixed $fixedCount unused variables in $($fileChanges.Count) files" -ForegroundColor Green

if ($fileChanges.Count -gt 0) {
    Write-Host ""
    Write-Host "📝 Modified files:" -ForegroundColor Yellow
    foreach ($file in $fileChanges.Keys | Sort-Object) {
        Write-Host "  $file ($($fileChanges[$file]) changes)" -ForegroundColor Gray
    }
}
