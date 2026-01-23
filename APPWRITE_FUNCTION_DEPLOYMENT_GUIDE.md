# 🚀 APPWRITE FUNCTION DEPLOYMENT GUIDE

**Issue**: Missing Appwrite function `sendChatMessage` causing booking redirect bug  
**Priority**: CRITICAL (SEV-0 Production Blocker)

---

## 📋 PREREQUISITES

1. **Appwrite CLI installed**
   ```bash
   npm install -g appwrite-cli
   ```

2. **Appwrite login credentials**
   - Endpoint: `https://syd.cloud.appwrite.io/v1`
   - Project ID: `68f23b11000d25eb3664`
   - API Key: (Admin API key with function creation permissions)

3. **Login to Appwrite**
   ```bash
   appwrite login
   ```

---

## 🔴 CRITICAL: Deploy sendChatMessage (FIRST!)

This function is **blocking all bookings**. Deploy it first:

### Step 1: Navigate to function directory
```bash
cd functions/sendChatMessage
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Deploy to Appwrite
```bash
appwrite deploy function --function-id sendChatMessage
```

**OR** use the Appwrite Console UI:

1. Go to: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions
2. Click **"Create Function"**
3. Fill in:
   - **Function ID**: `sendChatMessage`
   - **Name**: Send Chat Message (Server-Enforced)
   - **Runtime**: Node.js 18
   - **Entry point**: `src/main.js`
   - **Execute permissions**: `any` ⚠️ **CRITICAL: Must be "any" for guest access**
   - **Timeout**: 15 seconds
4. Upload the entire `functions/sendChatMessage/` folder
5. Click **"Deploy"**

---

## 📦 FUNCTION CONFIGURATIONS

All functions are defined in [config/appwrite.json](config/appwrite.json). Here's the deployment list:

### 1. sendChatMessage ⚠️ CRITICAL
```json
{
  "functionId": "sendChatMessage",
  "name": "Send Chat Message (Server-Enforced)",
  "runtime": "node-18.0",
  "path": "functions/sendChatMessage",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["any"]
}
```

**Purpose**: 
- Validates chat messages for contact info violations
- Prevents WhatsApp/phone number sharing
- Creates message records in database
- **Required for booking form submission**
- **✅ NOW SUPPORTS GUEST ACCESS** (no login required)

**Environment Variables**: None required

---

### 2. createBooking
```json
{
  "functionId": "createBooking",
  "name": "Create Booking",
  "runtime": "node-18.0",
  "path": "functions/createBooking",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 30,
  "execute": ["any"]
}
```

**Deploy**:
```bash
cd functions/createBooking
npm install
appwrite deploy function --function-id createBooking
```

---

### 3. searchTherapists
```json
{
  "functionId": "searchTherapists",
  "name": "Search Therapists",
  "runtime": "node-18.0",
  "path": "functions/searchTherapists",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 30,
  "execute": ["any"]
}
```

**Deploy**:
```bash
cd functions/searchTherapists
npm install
appwrite deploy function --function-id searchTherapists
```

---

### 4. acceptTherapist
```json
{
  "functionId": "acceptTherapist",
  "name": "Accept Therapist",
  "runtime": "node-18.0",
  "path": "functions/acceptTherapist",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["any"]
}
```

**Deploy**:
```bash
cd functions/acceptTherapist
npm install
appwrite deploy function --function-id acceptTherapist
```

---

### 5. cancelBooking
```json
{
  "functionId": "cancelBooking",
  "name": "Cancel Booking",
  "runtime": "node-18.0",
  "path": "functions/cancelBooking",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["any"]
}
```

**Deploy**:
```bash
cd functions/cancelBooking
npm install
appwrite deploy function --function-id cancelBooking
```

---

### 6. submitReview
```json
{
  "functionId": "submitReview",
  "name": "Submit Review (Server-Enforced)",
  "runtime": "node-18.0",
  "path": "functions/submitReview",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["users"]
}
```

**Deploy**:
```bash
cd functions/submitReview
npm install
appwrite deploy function --function-id submitReview
```

---

### 7. confirmPaymentReceived
```json
{
  "functionId": "confirmPaymentReceived",
  "name": "Confirm Payment Received (Auto Review Request)",
  "runtime": "node-18.0",
  "path": "functions/confirmPaymentReceived",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["users"]
}
```

**Deploy**:
```bash
cd functions/confirmPaymentReceived
npm install
appwrite deploy function --function-id confirmPaymentReceived
```

---

### 8. sendReviewDiscount
```json
{
  "functionId": "sendReviewDiscount",
  "name": "Send Review Discount (Reward System)",
  "runtime": "node-18.0",
  "path": "functions/sendReviewDiscount",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["users"]
}
```

**Deploy**:
```bash
cd functions/sendReviewDiscount
npm install
appwrite deploy function --function-id sendReviewDiscount
```

---

### 9. validateDiscount
```json
{
  "functionId": "validateDiscount",
  "name": "Validate Discount Code",
  "runtime": "node-18.0",
  "path": "functions/validateDiscount",
  "entrypoint": "src/main.js",
  "enabled": true,
  "timeout": 15,
  "execute": ["guests"]
}
```

**Deploy**:
```bash
cd functions/validateDiscount
npm install
appwrite deploy function --function-id validateDiscount
```

---

## 🚀 BATCH DEPLOYMENT SCRIPT

Deploy all functions at once:

```powershell
# Save as deploy-all-functions.ps1

$functions = @(
    "sendChatMessage",     # CRITICAL - Deploy first!
    "createBooking",
    "searchTherapists", 
    "acceptTherapist",
    "cancelBooking",
    "submitReview",
    "confirmPaymentReceived",
    "sendReviewDiscount",
    "validateDiscount"
)

foreach ($func in $functions) {
    Write-Host "🚀 Deploying $func..." -ForegroundColor Cyan
    
    # Navigate to function directory
    Set-Location "functions/$func"
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    # Deploy to Appwrite
    Write-Host "☁️ Deploying to Appwrite..." -ForegroundColor Yellow
    appwrite deploy function --function-id $func
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $func deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ $func deployment FAILED!" -ForegroundColor Red
        break
    }
    
    # Return to root
    Set-Location ../..
    
    Write-Host ""
}

Write-Host "✅ All functions deployed!" -ForegroundColor Green
```

**Run it**:
```powershell
.\deploy-all-functions.ps1
```

---

## 🔧 MANUAL DEPLOYMENT (Appwrite Console)

If CLI doesn't work, use the web console:

1. **Go to Functions**: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions

2. **For each function**:
   - Click **"Create Function"**
   - Enter Function ID (e.g., `sendChatMessage`)
   - Enter Name
   - Select Runtime: **Node.js 18**
   - Set Entry Point: `src/main.js`
   - Set Timeout: 15 seconds (30 for createBooking/searchTherapists)
   - Set Execute permissions (see config above)
   - Upload function folder
   - Click **Deploy**

---

## ✅ VERIFICATION

After deploying `sendChatMessage`, test the booking flow:

1. Open dev server: http://localhost:3005
2. Navigate to a therapist profile
3. Click **"Book Now"**
4. Fill in booking form
5. Click **"Order Now"**
6. ✅ **Expected**: Page stays in chat, booking created
7. ❌ **Before fix**: Page redirects to landing page

### Check Function Logs

In Appwrite Console:
1. Go to: Functions → sendChatMessage → Executions
2. Verify successful executions show up
3. Check for any errors

---

## 🔍 TROUBLESHOOTING

### Error: "Function with the requested ID could not be found"
- **Cause**: Function not deployed to Appwrite
- **Fix**: Deploy using steps above

### Error: "Missing dependencies"
- **Cause**: `npm install` not run before deploy
- **Fix**: Run `npm install` in function directory

### Error: "Invalid API key"
- **Cause**: Not logged in or wrong permissions
- **Fix**: Run `appwrite login` with admin credentials

### Error: "Timeout"
- **Cause**: Function taking too long
- **Fix**: Increase timeout in function settings

---

## 📞 SUPPORT

If deployment fails:
1. Check Appwrite Console logs
2. Verify project ID: `68f23b11000d25eb3664`
3. Verify endpoint: `https://syd.cloud.appwrite.io/v1`
4. Ensure API key has function creation permissions
5. Check function code for syntax errors

---

**Next Steps After Deployment**:
1. ✅ Deploy `sendChatMessage` (CRITICAL)
2. ✅ Test booking flow on dev server
3. ✅ Verify no page redirects
4. ✅ Deploy remaining 8 functions
5. ✅ Test all functionality
6. ✅ Deploy to staging
7. ✅ Deploy to production

---

**Status**: ⏳ AWAITING DEPLOYMENT  
**Priority**: 🔴 CRITICAL SEV-0  
**Blocking**: Production release
