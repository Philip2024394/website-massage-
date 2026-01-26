# Fix JSX Fragment issues in therapist dashboard files

$filesToFix = @(
    "apps\therapist-dashboard\src\pages\MyBookings.tsx",
    "apps\therapist-dashboard\src\pages\TherapistBookings.tsx"
)

foreach ($file in $filesToFix) {
    Write-Host "Fixing $file..."
    
    # Read file
    $content = Get-Content $file -Raw
    
    # Remove duplicate import
    $content = $content -replace "import \{ FloatingChatWindow \} from '../../../../chat';\r?\nimport \{ Calendar[^\r\n]+\r?\nimport \{ FloatingChatWindow \} from '../../../../chat';", "import { FloatingChatWindow } from '../../../../chat';`nimport { Calendar"
    
    # Fix the main return statement
    # Pattern: return ( followed by div, ending with FloatingChatWindow before );
    $content = $content -replace '(  return \()\r?\n(    <div className="min-h-screen)', '$1`n    <>`n$2'
    $content = $content -replace '(    <FloatingChatWindow userId=\{[^\}]+\} userName=\{[^\}]+\} userRole="[^"]+)" />\r?\n\r?\n(  \);)', '$1 />`n    </>`n$2'
    
    # Write back
    Set-Content $file -Value $content -Encoding UTF8
    Write-Host "Fixed $file"
}

Write-Host "`nAll files fixed! Running build test..."
pnpm run build
