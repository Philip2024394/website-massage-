#!/usr/bin/env pwsh
# AI Human E2E Testing System - Setup Verification Script
# Run this before executing E2E tests to ensure all dependencies are ready

Write-Host "🚀 AI Human E2E Testing System - Setup Verification" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host ""

$errors = @()
$warnings = @()

# ============================================
# 1. Check Node.js Installation
# ============================================
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    $errors += "❌ Node.js not found. Install from https://nodejs.org/"
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
}

# ============================================
# 2. Check pnpm Installation
# ============================================
Write-Host "📦 Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "   ✅ pnpm: $pnpmVersion" -ForegroundColor Green
} catch {
    $warnings += "⚠️ pnpm not found. Install: npm install -g pnpm"
    Write-Host "   ⚠️ pnpm not found (will use npm)" -ForegroundColor Yellow
}

# ============================================
# 3. Install Dependencies
# ============================================
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

if (Test-Path "pnpm-lock.yaml") {
    Write-Host "   Using pnpm..." -ForegroundColor Cyan
    pnpm install --frozen-lockfile
} elseif (Test-Path "package-lock.json") {
    Write-Host "   Using npm..." -ForegroundColor Cyan
    npm ci
} else {
    Write-Host "   Using npm..." -ForegroundColor Cyan
    npm install
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    $errors += "❌ Failed to install dependencies"
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
}

# ============================================
# 4. Check Playwright Installation
# ============================================
Write-Host ""
Write-Host "🎭 Checking Playwright installation..." -ForegroundColor Yellow

if (Test-Path "node_modules/@playwright") {
    Write-Host "   ✅ Playwright package installed" -ForegroundColor Green
    
    # Check package.json for version
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $playwrightVersion = $packageJson.devDependencies.'@playwright/test'
    Write-Host "   📌 Version: $playwrightVersion" -ForegroundColor Cyan
} else {
    $errors += "❌ Playwright not installed. Run: pnpm add -D @playwright/test"
    Write-Host "   ❌ Playwright not installed" -ForegroundColor Red
}

# ============================================
# 5. Install Playwright Browsers
# ============================================
Write-Host ""
Write-Host "🌐 Installing Playwright browsers..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray

if (Test-Path "node_modules/@playwright") {
    npx playwright install chromium
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Chromium browser installed" -ForegroundColor Green
    } else {
        $errors += "❌ Failed to install Playwright browsers"
        Write-Host "   ❌ Failed to install browsers" -ForegroundColor Red
    }
    
    # Install system dependencies (Linux/CI)
    Write-Host "   Installing system dependencies..." -ForegroundColor Gray
    npx playwright install-deps chromium 2>&1 | Out-Null
} else {
    Write-Host "   ⏭️ Skipped (Playwright not installed)" -ForegroundColor Yellow
}

# ============================================
# 6. Check Appwrite Configuration
# ============================================
Write-Host ""
Write-Host "🔧 Checking Appwrite configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    $requiredVars = @(
        "VITE_APPWRITE_ENDPOINT",
        "VITE_APPWRITE_PROJECT_ID",
        "VITE_APPWRITE_DATABASE_ID"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "   ✅ Appwrite environment variables configured" -ForegroundColor Green
    } else {
        $warnings += "⚠️ Missing Appwrite variables: $($missingVars -join ', ')"
        Write-Host "   ⚠️ Missing variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    }
} else {
    $warnings += "⚠️ .env file not found"
    Write-Host "   ⚠️ .env file not found" -ForegroundColor Yellow
}

# ============================================
# 7. Check E2E Test Configuration
# ============================================
Write-Host ""
Write-Host "🧪 Checking E2E test configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    $e2eVars = @(
        "BASE_URL",
        "THERAPIST_URL",
        "ADMIN_URL"
    )
    
    $missingE2E = @()
    foreach ($var in $e2eVars) {
        if ($envContent -notmatch $var) {
            $missingE2E += $var
        }
    }
    
    if ($missingE2E.Count -eq 0) {
        Write-Host "   ✅ E2E test URLs configured" -ForegroundColor Green
    } else {
        $warnings += "⚠️ Missing E2E variables: $($missingE2E -join ', ')"
        Write-Host "   ⚠️ Missing variables: $($missingE2E -join ', ')" -ForegroundColor Yellow
        Write-Host "   💡 Add to .env:" -ForegroundColor Cyan
        Write-Host "      BASE_URL=http://localhost:3000" -ForegroundColor Gray
        Write-Host "      THERAPIST_URL=http://localhost:3005" -ForegroundColor Gray
        Write-Host "      ADMIN_URL=http://localhost:3007" -ForegroundColor Gray
    }
}

# ============================================
# 8. Check Audio Files
# ============================================
Write-Host ""
Write-Host "🔊 Checking notification audio files..." -ForegroundColor Yellow

$audioFiles = @(
    "public/sounds/booking-notification.mp3",
    "public/sounds/new-booking.mp3",
    "src/assets/sounds/booking-notification.mp3",
    "sounds/booking-notification.mp3"
)

$audioFound = $false
foreach ($audioPath in $audioFiles) {
    if (Test-Path $audioPath) {
        Write-Host "   ✅ Audio file found: $audioPath" -ForegroundColor Green
        $audioFound = $true
        break
    }
}

if (-not $audioFound) {
    $warnings += "⚠️ Audio notification file not found"
    Write-Host "   ⚠️ Audio notification file not found" -ForegroundColor Yellow
    Write-Host "   💡 Create audio file at:" -ForegroundColor Cyan
    Write-Host "      public/sounds/booking-notification.mp3" -ForegroundColor Gray
    Write-Host "   💡 Or use a silent fallback in your code" -ForegroundColor Cyan
}

# ============================================
# 9. Check Backend Server
# ============================================
Write-Host ""
Write-Host "🌐 Checking backend server..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend server running at http://localhost:3000" -ForegroundColor Green
} catch {
    $warnings += "⚠️ Backend server not running at http://localhost:3000"
    Write-Host "   ⚠️ Backend server not running" -ForegroundColor Yellow
    Write-Host "   💡 Start server: pnpm dev" -ForegroundColor Cyan
}

# ============================================
# 10. Check Test Files
# ============================================
Write-Host ""
Write-Host "📝 Checking E2E test files..." -ForegroundColor Yellow

$testFiles = @(
    "e2e-tests/flows/ai-human-multi-user-workflow.spec.ts",
    "e2e-tests/flows/booking-flow.spec.ts",
    "e2e-tests/verification/RevenueGuard.ts",
    "e2e-tests/services/notificationValidator.ts"
)

$missingTests = @()
foreach ($testFile in $testFiles) {
    if (Test-Path $testFile) {
        Write-Host "   ✅ $testFile" -ForegroundColor Green
    } else {
        $missingTests += $testFile
        Write-Host "   ❌ $testFile (missing)" -ForegroundColor Red
    }
}

if ($missingTests.Count -gt 0) {
    $errors += "❌ Missing test files: $($missingTests.Count)"
}

# ============================================
# 11. Check Playwright Config
# ============================================
Write-Host ""
Write-Host "⚙️ Checking Playwright configuration..." -ForegroundColor Yellow

if (Test-Path "playwright.config.ts") {
    Write-Host "   ✅ playwright.config.ts found" -ForegroundColor Green
} else {
    $warnings += "⚠️ playwright.config.ts not found"
    Write-Host "   ⚠️ playwright.config.ts not found" -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host "📊 Setup Verification Summary" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED - Ready to run E2E tests!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start backend: pnpm dev" -ForegroundColor Gray
    Write-Host "   2. Run tests: pnpm test:e2e" -ForegroundColor Gray
    Write-Host "   3. View report: pnpm test:e2e:report" -ForegroundColor Gray
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ ERRORS FOUND ($($errors.Count)):" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   $err" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️ WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "❌ Setup INCOMPLETE - Fix errors before running tests" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "⚠️ Setup COMPLETE with warnings - Tests may have limited functionality" -ForegroundColor Yellow
        exit 0
    }
}
