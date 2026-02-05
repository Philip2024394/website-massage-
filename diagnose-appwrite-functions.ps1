# Appwrite Functions Diagnostic Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "APPWRITE FUNCTIONS DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$functionsPath = "src\functions"
$functions = Get-ChildItem $functionsPath -Directory

foreach ($func in $functions) {
    Write-Host "Checking: $($func.Name)" -ForegroundColor Yellow
    
    # Check for package.json
    $packageJsonPath = Join-Path $func.FullName "package.json"
    if (Test-Path $packageJsonPath) {
        Write-Host "  ✅ package.json exists" -ForegroundColor Green
        
        # Check package.json content
        $pkg = Get-Content $packageJsonPath | ConvertFrom-Json
        if ($pkg.dependencies) {
            Write-Host "  Dependencies:" -ForegroundColor Gray
            $pkg.dependencies.PSObject.Properties | ForEach-Object {
                Write-Host "    - $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
        }
        
        # Check for node-appwrite
        if ($pkg.dependencies.'node-appwrite') {
            Write-Host "  ✅ node-appwrite: $($pkg.dependencies.'node-appwrite')" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  WARNING: node-appwrite not found" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ package.json MISSING" -ForegroundColor Red
    }
    
    # Check for appwrite.json
    $appwriteJsonPath = Join-Path $func.FullName "appwrite.json"
    if (Test-Path $appwriteJsonPath) {
        Write-Host "  ✅ appwrite.json exists" -ForegroundColor Green
        
        $appwriteConfig = Get-Content $appwriteJsonPath | ConvertFrom-Json
        Write-Host "  Runtime: $($appwriteConfig.runtime)" -ForegroundColor Gray
        Write-Host "  Entrypoint: $($appwriteConfig.entrypoint)" -ForegroundColor Gray
        Write-Host "  Commands: $($appwriteConfig.commands)" -ForegroundColor Gray
        
        # Check if entrypoint file exists
        $entrypointPath = Join-Path $func.FullName $appwriteConfig.entrypoint
        if (Test-Path $entrypointPath) {
            Write-Host "  ✅ Entrypoint file exists: $($appwriteConfig.entrypoint)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Entrypoint file MISSING: $($appwriteConfig.entrypoint)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ appwrite.json MISSING" -ForegroundColor Red
    }
    
    # Check for src folder
    $srcPath = Join-Path $func.FullName "src"
    if (Test-Path $srcPath) {
        Write-Host "  ✅ src/ folder exists" -ForegroundColor Green
        $srcFiles = Get-ChildItem $srcPath -File
        if ($srcFiles.Count -gt 0) {
            Write-Host "  Files in src/:" -ForegroundColor Gray
            $srcFiles | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
        }
    } else {
        Write-Host "  ⚠️  No src/ folder" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "COMMON APPWRITE FUNCTION ISSUES:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. Missing package.json in function root"
Write-Host "2. Missing node-appwrite dependency"
Write-Host "3. Wrong entrypoint path in appwrite.json"
Write-Host "4. Outdated node-appwrite version"
Write-Host "5. Missing pnpm-lock.yaml (functions should use npm)"
Write-Host ""
Write-Host "RECOMMENDED FIXES:" -ForegroundColor Yellow
Write-Host "- Ensure each function has package.json at root"
Write-Host "- Use 'npm install' not 'pnpm install' in commands"
Write-Host "- Update node-appwrite to latest version (^13.0.0)"
Write-Host "- Verify entrypoint file exists at specified path"
Write-Host ""
Write-Host "To view specific deployment error:" -ForegroundColor Yellow
Write-Host "1. Go to https://cloud.appwrite.io/console"
Write-Host "2. Select your project"
Write-Host "3. Go to Functions"
Write-Host "4. Click on the failing function"
Write-Host "5. Check 'Deployments' tab for error details"
