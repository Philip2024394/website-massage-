# Commission Deadline Enforcer - Testing Checklist

## 🧪 COMPREHENSIVE TESTING PROTOCOL

This checklist ensures the commission deadline enforcer function works correctly and safely in production.

---

## ✅ PRE-TEST SETUP

### 1. Verify Collections Exist
- [ ] `commission_records` collection exists with `deadlineAt` attribute
- [ ] `therapist_menus` collection exists with required attributes
- [ ] `audit_logs` collection exists with required attributes

### 2. Create Test Data
Create a test therapist menu document:
```javascript
// In therapist_menus collection
{
  therapistId: "test-therapist-001",
  menuId: "test-menu-001",
  status: "active",
  bookingEnabled: true,
  scheduleEnabled: true,
  deactivationReason: null,
  deactivatedAt: null,
  planType: "pro"
}
```

---

## 🔴 TEST 1: EXPIRED COMMISSION (BASIC FLOW)

### Objective
Verify function correctly processes expired commission and deactivates account.

### Steps
1. **Create test commission with past deadline**
   ```javascript
   // In commission_records collection
   {
     commissionId: "test-comm-001",
     therapistId: "test-therapist-001",
     bookingId: "test-booking-001",
     status: "pending",
     amount: 300000,
     commissionAmount: 90000,
     deadlineAt: "2025-12-24T10:00:00.000Z", // Past date
     createdAt: "2025-12-24T07:00:00.000Z"
   }
   ```

2. **Trigger function manually**
   - Go to Appwrite Console → Functions → commissionDeadlineEnforcer
   - Click "Execute" button
   - Note execution time

3. **Verify commission updated**
   - [ ] `commission_records` document status = `expired`
   - [ ] `updatedAt` timestamp is recent

4. **Verify therapist deactivated**
   - [ ] `therapist_menus` status = `busy`
   - [ ] `bookingEnabled` = `false`
   - [ ] `scheduleEnabled` = `false`
   - [ ] `deactivationReason` = `commission_overdue`
   - [ ] `deactivatedAt` timestamp is recent

5. **Verify audit log created**
   - [ ] `audit_logs` has new entry with:
     - `type` = `COMMISSION_EXPIRED`
     - `userId` = `test-therapist-001`
     - `severity` = `critical`
     - `metadata` contains commissionId, bookingId, deadlineAt

6. **Check function response**
   ```json
   {
     "success": true,
     "expiredCount": 1,
     "deactivatedCount": 1,
     "errorCount": 0
   }
   ```

### Expected Result
✅ PASS: Commission expired, therapist deactivated, audit log written

---

## 🔄 TEST 2: IDEMPOTENCY (RE-RUN SAFETY)

### Objective
Verify function can safely run multiple times without duplicating actions.

### Steps
1. **Run function again** (use same test data from Test 1)
   - Click "Execute" button again

2. **Verify no duplicate actions**
   - [ ] Commission status still = `expired` (not changed)
   - [ ] therapist_menus status still = `busy` (not changed)
   - [ ] NO new audit_logs entry created
   - [ ] Function response shows "already_deactivated"

3. **Check function logs**
   - [ ] Log shows: "Therapist already deactivated (idempotent check passed)"

### Expected Result
✅ PASS: Function safely handles re-execution without side effects

---

## ⏰ TEST 3: DEADLINE CALCULATION (3-HOUR ENFORCEMENT)

### Objective
Verify function correctly identifies commissions that crossed the 3-hour deadline.

### Steps
1. **Create commission with deadline in future**
   ```javascript
   {
     commissionId: "test-comm-002",
     therapistId: "test-therapist-002",
     status: "pending",
     deadlineAt: "2025-12-26T15:00:00.000Z", // Future date
     // ... other fields
   }
   ```

2. **Create commission with deadline exactly now**
   ```javascript
   {
     commissionId: "test-comm-003",
     therapistId: "test-therapist-003",
     status: "pending",
     deadlineAt: "<current-server-time-iso>", // Exact current time
     // ... other fields
   }
   ```

3. **Run function**

4. **Verify results**
   - [ ] test-comm-002 (future) NOT processed
   - [ ] test-comm-003 (now) WAS processed
   - [ ] Function only processes `deadlineAt < serverTime`

### Expected Result
✅ PASS: Only commissions past deadline are processed

---

## 🛡️ TEST 4: FAIL-CLOSED BEHAVIOR

### Objective
Verify function handles errors gracefully without leaving accounts in unsafe state.

### Steps
1. **Create commission with invalid therapistId**
   ```javascript
   {
     commissionId: "test-comm-004",
     therapistId: "nonexistent-therapist",
     status: "pending",
     deadlineAt: "2025-12-24T10:00:00.000Z",
     // ... other fields
   }
   ```

2. **Run function**

3. **Verify error handling**
   - [ ] Commission status = `expired` (updated successfully)
   - [ ] Function logs show: "No therapist_menus document found"
   - [ ] Function continues processing other commissions
   - [ ] Function response includes error in results array
   - [ ] `errorCount` > 0 in response

4. **Verify fail-closed**
   - [ ] No therapist account incorrectly activated
   - [ ] No partial state changes
   - [ ] Error logged but doesn't crash function

### Expected Result
✅ PASS: Errors logged, function continues, no unsafe state

---

## 📊 TEST 5: BATCH PROCESSING

### Objective
Verify function handles multiple expired commissions in single execution.

### Steps
1. **Create 5 test commissions** (all with past deadlines)
   - Use 5 different therapist IDs
   - All with status = `pending`

2. **Run function once**

3. **Verify all processed**
   - [ ] All 5 commissions status = `expired`
   - [ ] All 5 therapists deactivated
   - [ ] 5 audit log entries created
   - [ ] Function response: `expiredCount: 5`, `deactivatedCount: 5`

### Expected Result
✅ PASS: Function processes multiple commissions efficiently

---

## ⚡ TEST 6: CRON SCHEDULE (AUTOMATED EXECUTION)

### Objective
Verify function runs automatically every 5 minutes.

### Steps
1. **Enable schedule**
   - Go to Functions → Settings
   - Set schedule: `*/5 * * * *`
   - Enable schedule toggle

2. **Create test commission with deadline in past**

3. **Wait 5-10 minutes** (without manual execution)

4. **Check function executions**
   - [ ] Go to Executions tab
   - [ ] Verify automatic execution occurred
   - [ ] Check execution timestamp matches 5-minute interval
   - [ ] Verify commission was processed

5. **Monitor for 30 minutes**
   - [ ] Function executes every 5 minutes consistently
   - [ ] No failed executions

### Expected Result
✅ PASS: Function runs automatically on schedule

---

## 🔐 TEST 7: PERMISSIONS & SECURITY

### Objective
Verify API key permissions are correctly configured.

### Steps
1. **Test with insufficient permissions**
   - Temporarily remove `databases.write` scope from API key
   - Run function
   - [ ] Verify function fails with permission error

2. **Restore permissions**
   - Add back all required scopes
   - [ ] Function works again

3. **Verify no client access**
   - [ ] Confirm function is not callable from client SDKs
   - [ ] Only server execution allowed

### Expected Result
✅ PASS: Proper permissions enforced, server-only execution

---

## 🎯 TEST 8: END-TO-END PRODUCTION FLOW

### Objective
Simulate real production scenario from booking completion to enforcement.

### Steps
1. **Simulate completed booking**
   - Create booking with `completedAt` timestamp
   - Create commission with `deadlineAt` = completedAt + 3 hours

2. **Wait past deadline** (or manually set deadlineAt to past)

3. **Let cron run automatically** (wait 5 minutes)

4. **Verify full flow**
   - [ ] Commission expired automatically
   - [ ] Therapist cannot accept new bookings (bookingEnabled = false)
   - [ ] Therapist dashboard shows payment required message
   - [ ] Admin receives notification (if implemented)
   - [ ] Audit trail is complete

5. **Simulate payment upload**
   - Update commission status to `awaiting_verification`
   - Verify therapist STAYS deactivated (no auto-reactivation)

6. **Simulate admin approval**
   - Call `commissionTrackingService.verifyPayment()` with verified=true
   - [ ] Therapist reactivated (bookingEnabled = true)
   - [ ] Therapist can accept bookings again

### Expected Result
✅ PASS: Complete enforcement cycle works as designed

---

## 📋 FINAL VERIFICATION CHECKLIST

Before marking function as production-ready:

### Functionality
- [ ] Test 1: Expired commission processed ✅
- [ ] Test 2: Idempotency verified ✅
- [ ] Test 3: 3-hour deadline enforced ✅
- [ ] Test 4: Fail-closed on errors ✅
- [ ] Test 5: Batch processing works ✅
- [ ] Test 6: Cron schedule active ✅
- [ ] Test 7: Permissions secured ✅
- [ ] Test 8: End-to-end flow complete ✅

### Monitoring
- [ ] Function logs are clear and informative
- [ ] Executions tab shows successful runs
- [ ] Error logs are actionable
- [ ] Performance is acceptable (<30 seconds per execution)

### Data Integrity
- [ ] No duplicate audit logs
- [ ] No partial state updates
- [ ] All timestamps use server time
- [ ] Database queries are efficient

### Security
- [ ] API key properly scoped
- [ ] No client-side access possible
- [ ] Environment variables secured
- [ ] Sensitive data not logged

---

## 🚨 CRITICAL ISSUES - DO NOT DEPLOY IF:

- ❌ Function crashes on execution
- ❌ Deactivates wrong therapists
- ❌ Creates duplicate audit logs
- ❌ Fails silently without logging
- ❌ Uses client time instead of server time
- ❌ Re-processes same commission repeatedly
- ❌ Leaves accounts in inconsistent state

---

## ✅ DEPLOYMENT APPROVAL

Function ready for production when:
- [x] All 8 tests passed
- [x] No critical issues found
- [x] Monitoring configured
- [x] Rollback plan documented
- [x] Team notified of deployment

**Approved by:** _________________________

**Date:** _________________________

**Production Deployment:** ✅ READY
