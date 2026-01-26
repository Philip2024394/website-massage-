# 🚀 APPWRITE FUNCTIONS BATCH DEPLOYMENT SCRIPT
# Deploy all required Appwrite functions to fix booking redirect issue

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 APPWRITE FUNCTIONS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Function list (sendChatMessage is CRITICAL - deploy first!)
$functions = @(
    @{id="sendChatMessage"; priority="CRITICAL"},
    @{id="createBooking"; priority="HIGH"},
    @{id="searchTherapists"; priority="HIGH"},
    @{id="acceptTherapist"; priority="MEDIUM"},
    @{id="cancelBooking"; priority="MEDIUM"},
    @{id="submitReview"; priority="MEDIUM"},
    @{id="confirmPaymentReceived"; priority="LOW"},
    @{id="sendReviewDiscount"; priority="LOW"},
    @{id="validateDiscount"; priority="LOW"}
)

$deployedCount = 0
$failedCount = 0
$failedFunctions = @()

foreach ($func in $functions) {
    $funcId = $func.id
    $priority = $func.priority
    
    Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "📦 Function: $funcId" -ForegroundColor White
    Write-Host "⚡ Priority: $priority" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if function directory exists
    $funcPath = "functions/$funcId"
    if (-not (Test-Path $funcPath)) {
        Write-Host "❌ Directory not found: $funcPath" -ForegroundColor Red
        $failedCount++
        $failedFunctions += $funcId
        continue
    }
    
    # Navigate to function directory
    Push-Location $funcPath
    
    try {
        # Install dependencies
        Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
        npm install 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Warning: npm install had issues, but continuing..." -ForegroundColor Yellow
        }
        
        # Deploy to Appwrite
        Write-Host "☁️  Deploying to Appwrite..." -ForegroundColor Cyan
        
        # Check if appwrite CLI is installed
        $appwriteCheck = Get-Command appwrite -ErrorAction SilentlyContinue
        if (-not $appwriteCheck) {
            Write-Host "❌ Appwrite CLI not found!" -ForegroundColor Red
            Write-Host "   Install it with: npm install -g appwrite-cli" -ForegroundColor Yellow
            Write-Host "   Then login with: appwrite login" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
        
        # Deploy function
        $output = appwrite deploy function --function-id $funcId 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $funcId deployed successfully!" -ForegroundColor Green
            $deployedCount++
            
            if ($priority -eq "CRITICAL") {
                Write-Host "🎉 CRITICAL function deployed - booking flow should work now!" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ $funcId deployment FAILED!" -ForegroundColor Red
            Write-Host "   Output: $output" -ForegroundColor Red
            $failedCount++
            $failedFunctions += $funcId
            
            if ($priority -eq "CRITICAL") {
                Write-Host "🚨 CRITICAL FUNCTION FAILED - Booking flow will NOT work!" -ForegroundColor Red
                Pop-Location
                break
            }
        }
        
    } catch {
        Write-Host "❌ Error deploying $funcId : $_" -ForegroundColor Red
        $failedCount++
        $failedFunctions += $funcId
        
        if ($priority -eq "CRITICAL") {
            Pop-Location
            break
        }
    }
    
    # Return to root
    Pop-Location
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Successfully deployed: $deployedCount functions" -ForegroundColor Green
Write-Host "❌ Failed: $failedCount functions" -ForegroundColor Red

if ($failedCount -gt 0) {
    Write-Host ""
    Write-Host "Failed functions:" -ForegroundColor Yellow
    foreach ($failed in $failedFunctions) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

Write-Host ""

if ($deployedCount -gt 0 -and ($failedFunctions -notcontains "sendChatMessage")) {
    Write-Host "🎉 sendChatMessage deployed successfully!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test booking flow on dev server (http://localhost:3005)" -ForegroundColor White
    Write-Host "  2. Verify no page redirects after clicking 'Order Now'" -ForegroundColor White
    Write-Host "  3. Check Appwrite Console for function executions" -ForegroundColor White
} elseif ($failedFunctions -contains "sendChatMessage") {
    Write-Host "🚨 CRITICAL: sendChatMessage deployment FAILED!" -ForegroundColor Red
    Write-Host "📋 Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions" -ForegroundColor White
    Write-Host "  2. Click 'Create Function'" -ForegroundColor White
    Write-Host "  3. Function ID: sendChatMessage" -ForegroundColor White
    Write-Host "  4. Runtime: Node.js 18" -ForegroundColor White
    Write-Host "  5. Entry: src/main.js" -ForegroundColor White
    Write-Host "  6. Upload: functions/sendChatMessage/ folder" -ForegroundColor White
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
