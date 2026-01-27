# Commission Deadline Enforcer - Deployment Guide

## 🎯 OBJECTIVE
Deploy Appwrite Function to automatically deactivate therapist accounts when commission payment deadlines expire (3 hours after booking completion).

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Required Appwrite Collections
- [x] `commission_records` - with `deadlineAt` attribute (DateTime)
- [x] `therapist_menus` - with status, bookingEnabled, scheduleEnabled, deactivationReason, deactivatedAt
- [x] `audit_logs` - with type, userId, reason, metadata, timestamp, severity

### ✅ Required Collection IDs
You'll need the actual collection IDs from your Appwrite Console:
1. Open Appwrite Console → Databases → Your Database
2. Copy collection IDs for:
   - `commission_records`
   - `therapist_menus`
   - `audit_logs`

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Deploy via Appwrite CLI (Recommended)

#### Step 1: Install Appwrite CLI
```bash
npm install -g appwrite-cli
```

#### Step 2: Login to Appwrite
```bash
appwrite login
```
- Enter your Appwrite endpoint: `https://syd.cloud.appwrite.io/v1`
- Enter your email and password

#### Step 3: Initialize Function
```bash
cd functions/commissionDeadlineEnforcer
appwrite init function
```
- Function ID: `commissionDeadlineEnforcer`
- Function name: `Commission Deadline Enforcer`
- Runtime: `node-18.0`
- Entrypoint: `index.js`

#### Step 4: Deploy Function
```bash
appwrite deploy function
```

#### Step 5: Configure Environment Variables
```bash
appwrite functions updateVariables --functionId commissionDeadlineEnforcer
```

Add these variables:
```
APPWRITE_API_KEY=<your-server-api-key>
DATABASE_ID=68f76ee1000e64ca8d05
COMMISSION_RECORDS_COLLECTION_ID=<your-commission-records-id>
THERAPIST_MENUS_COLLECTION_ID=<your-therapist-menus-id>
AUDIT_LOGS_COLLECTION_ID=<your-audit-logs-id>
```

#### Step 6: Set Schedule (Cron)
In Appwrite Console:
1. Go to Functions → `commissionDeadlineEnforcer`
2. Click "Settings" tab
3. Set "Schedule" to: `*/5 * * * *` (every 5 minutes)
4. Enable the schedule toggle

---

### Option 2: Deploy via Appwrite Console (Manual)

#### Step 1: Create Function
1. Open Appwrite Console
2. Go to **Functions** → Click **Create Function**
3. Settings:
   - **Name**: Commission Deadline Enforcer
   - **Function ID**: `commissionDeadlineEnforcer`
   - **Runtime**: Node.js 18
   - **Entrypoint**: `index.js`
   - **Execute Access**: Server (Function)

#### Step 2: Upload Code
1. Create a ZIP file containing:
   - `index.js`
   - `package.json`
2. Go to function → **Deployments** tab
3. Click **Create Deployment**
4. Upload ZIP file
5. Wait for build to complete

#### Step 3: Generate API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `Commission Enforcer Server Key`
4. Scopes required:
   - `databases.read`
   - `databases.write`
5. Copy the generated key (you won't see it again!)

#### Step 4: Set Environment Variables
1. Go to function → **Settings** tab
2. Scroll to **Environment Variables**
3. Add these variables:

| Variable Name | Value | Notes |
|--------------|--------|-------|
| `APPWRITE_API_KEY` | `<your-server-api-key>` | From Step 3 |
| `DATABASE_ID` | `68f76ee1000e64ca8d05` | Your production database ID |
| `COMMISSION_RECORDS_COLLECTION_ID` | `<get-from-console>` | Copy from Collections |
| `THERAPIST_MENUS_COLLECTION_ID` | `<get-from-console>` | Copy from Collections |
| `AUDIT_LOGS_COLLECTION_ID` | `<get-from-console>` | Copy from Collections |

**How to get Collection IDs:**
1. Go to Databases → Your Database → Collections
2. Click on a collection name
3. Copy the ID from the URL or collection header

#### Step 5: Configure Schedule
1. In function → **Settings** tab
2. Find **Schedule** section
3. Enter: `*/5 * * * *`
4. Enable the schedule toggle
5. Click **Update**

#### Step 6: Activate Function
1. Ensure function has at least one active deployment
2. Ensure schedule is enabled
3. Function will run automatically every 5 minutes

---

## 🔒 PERMISSIONS CONFIGURATION

### Required Permissions for API Key

The API key needs these permissions on each collection:

#### commission_records
- ✅ Read documents
- ✅ Update documents

#### therapist_menus
- ✅ Read documents
- ✅ Update documents

#### audit_logs
- ✅ Create documents

### Set Permissions in Console
1. Go to **Settings** → **API Keys**
2. Edit your server API key
3. Add scopes:
   - `databases.read`
   - `databases.write`

---

## 🧪 TESTING

### Test 1: Manual Execution
1. Go to Functions → `commissionDeadlineEnforcer`
2. Click **Execute** button
3. Check response:
```json
{
  "success": true,
  "serverTime": "2025-12-25T10:30:00.000Z",
  "expiredCount": 0,
  "deactivatedCount": 0,
  "errorCount": 0
}
```

### Test 2: Create Expired Commission (Simulation)
1. Create a test commission record with `deadlineAt` in the past:
```javascript
{
  therapistId: "test-therapist-123",
  bookingId: "test-booking-456",
  status: "pending",
  deadlineAt: "2025-12-24T10:00:00.000Z", // Past date
  amount: 100000,
  commissionAmount: 30000
}
```

2. Wait 5 minutes for cron to run (or execute manually)

3. Verify results:
   - ✅ Commission status = `expired`
   - ✅ therapist_menus: status = `busy`, bookingEnabled = `false`
   - ✅ audit_logs entry created with type = `COMMISSION_EXPIRED`

### Test 3: Verify Idempotency
1. Run function again (should not re-process same commission)
2. Check logs show "already_deactivated" for previously processed commissions

---

## 📊 MONITORING

### Check Function Logs
1. Go to Functions → `commissionDeadlineEnforcer`
2. Click **Executions** tab
3. View recent executions and their logs

### Key Log Messages to Monitor
- ✅ `Found X expired commissions` - Normal operation
- ✅ `Therapist account deactivated` - Successful enforcement
- ⚠️ `No therapist_menus document found` - Data integrity issue
- ❌ `CRITICAL ERROR` - Function failure (investigate immediately)

### Set Up Alerts (Optional)
Create alerts for:
- Function execution failures
- High error counts in function response
- Critical severity audit logs

---

## 🔧 TROUBLESHOOTING

### Issue: Function not running automatically
**Solution:**
1. Check schedule is enabled in Settings
2. Verify cron syntax: `*/5 * * * *`
3. Check function has active deployment

### Issue: "Missing environment variable" error
**Solution:**
1. Go to function Settings → Environment Variables
2. Verify all required variables are set
3. Redeploy function after adding variables

### Issue: "Collection not found" error
**Solution:**
1. Verify collection IDs are correct
2. Copy IDs directly from Appwrite Console
3. Ensure database ID is correct

### Issue: "Insufficient permissions" error
**Solution:**
1. Check API key has required scopes
2. Ensure API key is active
3. Generate new API key if needed

### Issue: Function times out
**Solution:**
1. Reduce `Query.limit()` in code (default: 100)
2. Check for slow database queries
3. Optimize query indexes in Appwrite

---

## 🔄 ROLLBACK PLAN

If function causes issues:

1. **Immediate Stop:**
   - Go to Functions → Settings
   - Disable the schedule toggle

2. **Investigate:**
   - Check Executions tab for errors
   - Review audit_logs collection for unexpected entries

3. **Fix and Redeploy:**
   - Fix code issues
   - Redeploy with updated code
   - Test manually before re-enabling schedule

4. **Manual Reactivation:**
   - If therapists incorrectly deactivated, manually update `therapist_menus`:
   ```javascript
   {
     status: "active",
     bookingEnabled: true,
     scheduleEnabled: true,
     deactivationReason: null,
     deactivatedAt: null
   }
   ```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run through this checklist after deployment:

- [ ] Function appears in Functions list
- [ ] Function has active deployment
- [ ] All environment variables set correctly
- [ ] Schedule configured: `*/5 * * * *`
- [ ] Schedule toggle is enabled
- [ ] API key has required permissions
- [ ] Manual execution returns success
- [ ] Test commission processed correctly
- [ ] audit_logs entry created
- [ ] therapist_menus updated correctly
- [ ] Idempotency test passed
- [ ] Monitoring/alerts configured

---

## 📞 SUPPORT

If issues persist:
1. Check Appwrite Discord/Community
2. Review Appwrite Functions documentation
3. Check function execution logs in Console

---

## 🎯 SUCCESS CRITERIA

Function is working correctly when:
1. ✅ Runs automatically every 5 minutes
2. ✅ Finds and processes expired commissions
3. ✅ Deactivates therapist accounts correctly
4. ✅ Writes audit logs for all actions
5. ✅ Returns success response with counts
6. ✅ Handles errors gracefully (fail-closed)
7. ✅ Is idempotent (safe to re-run)

**Function Status: PRODUCTION-READY** ✅
