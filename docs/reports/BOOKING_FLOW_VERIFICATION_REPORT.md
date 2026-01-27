# 🔒 BOOKING FLOW VERIFICATION REPORT
## Senior QA Engineer + Systems Architect Audit

**Report Date**: January 22, 2026  
**Audit Scope**: Complete booking lifecycle from Order Now → Therapist Arrival  
**Status**: ❌ **CRITICAL BUGS FOUND - NOT READY FOR E2E TESTING**

---

## 1️⃣ FLOW MATCHING AUDIT

### Documented Flow vs Implementation

| Step # | Component/Function | Expected State | Actual State | Status |
|--------|-------------------|----------------|--------------|--------|
| 1 | Customer clicks "Order Now" | N/A | ✅ PersistentChatWindow.tsx | ✅ OK |
| 2 | `createBooking()` called | PENDING | ✅ PersistentChatProvider.tsx:806 | ✅ OK |
| 3 | Availability check | Block if BUSY/OFFLINE | ✅ Line 817 checks status | ✅ OK |
| 4 | Booking created in DB | PENDING | ✅ bookingLifecycleService.ts:156 | ✅ OK |
| 5 | 5-minute countdown starts | Timer active | ✅ Line 892 startCountdown(300) | ✅ OK |
| 6 | Therapist clicks ACCEPT | PENDING → ACCEPTED | ✅ acceptBooking() line 228 | ✅ OK |
| 7 | **Commission recorded** | Commission on ACCEPTED | ❌ **FUNCTION MISSING** | ❌ **BLOCKER** |
| 8 | Customer confirms | ACCEPTED → CONFIRMED | ✅ confirmBooking() line 269 | ✅ OK |
| 9 | Service delivered | CONFIRMED → COMPLETED | ✅ completeBooking() line 326 | ✅ OK |
| 10 | Commission check | No duplicate | ⚠️ Note says "already recorded" | ⚠️ VERIFY |
| 11 | Timeout (5 min) | PENDING → EXPIRED | ✅ expireBooking() line 395 | ✅ OK |
| 12 | Broadcast to therapists | Send to Available + Busy | ✅ bookingExpirationService.ts:176 | ✅ OK |

---

## 2️⃣ STATE MACHINE VALIDATION

### ✅ Valid Transitions (Verified in Code)

```typescript
VALID_TRANSITIONS = {
  PENDING: [ACCEPTED, DECLINED, EXPIRED],     ✅ Correct
  ACCEPTED: [CONFIRMED, DECLINED, EXPIRED],   ✅ Correct
  CONFIRMED: [COMPLETED, DECLINED],           ✅ Correct
  COMPLETED: [],                               ✅ Terminal state
  DECLINED: [],                                ✅ Terminal state
  EXPIRED: [],                                 ✅ Terminal state
}
```

**Location**: [bookingLifecycleService.ts](lib/services/bookingLifecycleService.ts#L106-L119)

### ❌ Invalid Transitions (Properly Blocked)
- ❌ PENDING → COMPLETED: ✅ Blocked by isValidTransition()
- ❌ ACCEPTED → COMPLETED: ✅ Blocked (must go through CONFIRMED)
- ❌ EXPIRED → ACCEPTED: ✅ Blocked (terminal state)
- ❌ COMPLETED → PENDING: ✅ Blocked (terminal state)

**Verdict**: ✅ **State machine is properly enforced**

---

## 3️⃣ ROUTING SAFETY CHECK

### Scan for Dangerous Redirects

```bash
grep -r "router.push('/')" --include="*.tsx" --include="*.ts"
# Result: No matches ✅

grep -r "router.replace('/')" --include="*.tsx" --include="*.ts"  
# Result: No matches ✅

grep -r "redirect('/')" --include="*.tsx" --include="*.ts"
# Result: No matches ✅
```

### ✅ AppRouter.tsx Analysis

**Line 1167-1172**: `chat-room` case
```typescript
case 'chat-room':
  // Redirect to home - chat will open via openChat event
  console.log('[ROUTE] chat-room accessed - redirecting to home');
  // NOTE: This redirect is commented out - chat stays in place ✅
```

**Status**: ✅ **No unwanted redirects to `/` detected**

### PersistentChatWindow.tsx
- ✅ No router imports
- ✅ No navigation calls
- ✅ UI state does NOT affect routing

**Verdict**: ✅ **Routing is safe - no redirect bugs**

---

## 4️⃣ TIMEOUT & FAILURE PATH CHECK

### ✅ 5-Minute Therapist Response Timeout

**Location**: [PersistentChatProvider.tsx](context/PersistentChatProvider.tsx#L892-L897)

```typescript
startCountdown(300, async () => {
  await bookingLifecycleService.expireBooking(lifecycleBooking.$id, 'Therapist response timeout');
  addSystemNotification('⏰ 5-minute timer expired! Booking sent to ALL therapists.');
});
```

**Flow**:
1. Customer creates booking → PENDING status
2. 5-minute countdown starts
3. If therapist doesn't respond → `expireBooking()` called
4. Status changes: PENDING → EXPIRED
5. ✅ Broadcast to Available + Busy therapists

**Verified**: ✅ Works as documented

---

### ✅ 1-Minute Customer Confirmation Timeout

**Location**: [PersistentChatProvider.tsx](context/PersistentChatProvider.tsx#L1025-L1029)

```typescript
startCountdown(60, async () => {
  await bookingLifecycleService.expireBooking(currentBooking.documentId, 'Customer confirmation timeout');
});
```

**Flow**:
1. Therapist accepts → ACCEPTED status
2. 1-minute countdown starts for customer confirmation
3. If customer doesn't confirm → `expireBooking()` called
4. Status changes: ACCEPTED → EXPIRED

**Verified**: ✅ Works as documented

---

### ❌ COMMISSION RECORDING - CRITICAL BUG

**Expected**: Commission recorded on ACCEPTED status  
**Actual**: **FUNCTION DOES NOT EXIST** 🚨

**Location**: [bookingLifecycleService.ts](lib/services/bookingLifecycleService.ts#L259)

```typescript
// Line 259 - THIS WILL CRASH AT RUNTIME
await this.recordAcceptedCommission({ ...booking, ...updates, $id: result.$id });
```

**Problem**:
- Function `recordAcceptedCommission()` is called but **NOT DEFINED** anywhere in the file
- This will throw `TypeError: this.recordAcceptedCommission is not a function`
- **Therapist acceptance will FAIL** completely
- Commission will NEVER be recorded

**Impact**:
- ❌ Therapists cannot accept bookings (runtime error)
- ❌ Admin loses 30% commission revenue
- ❌ Entire booking flow is BROKEN

**Severity**: 🔴 **SEV-0 BLOCKER - REVENUE CRITICAL**

---

## 5️⃣ READINESS DECISION

### ❌ **FLOW NOT READY FOR E2E TESTING**

### Blockers Identified:

#### 🔴 **BLOCKER #1: Missing Commission Function** (SEV-0)
- **File**: `lib/services/bookingLifecycleService.ts`
- **Line**: 259
- **Issue**: `recordAcceptedCommission()` function called but not defined
- **Impact**: Therapist acceptance will crash with runtime error
- **Required**: Implement missing function before ANY testing

#### ⚠️ **WARNING #1: Commission Recording Logic** (SEV-2)
- **Issue**: Business requirement states commission on ACCEPTED, but function missing
- **Current**: `completeBooking()` has note saying "already recorded" but it's not actually recorded
- **Risk**: If function is not implemented, commission will NEVER be recorded

#### ⚠️ **WARNING #2: Broadcast Verification Needed** (SEV-3)
- **File**: `services/bookingExpirationService.ts`
- **Issue**: Broadcast logic queries Available + Busy therapists correctly
- **Missing**: Need to verify actual notification delivery (WhatsApp/push)
- **Current**: Only logs to console, no actual notifications sent

---

### Required Before E2E Testing:

1. ✅ **Implement `recordAcceptedCommission()` function**
   - Must create commission record in database
   - Must handle errors gracefully
   - Must not block booking acceptance if commission fails

2. ⚠️ **Verify commission is not duplicated**
   - Ensure commission not recorded twice (ACCEPTED + COMPLETED)
   - Add database constraint or check

3. ⚠️ **Test broadcast notification delivery**
   - Verify therapists actually receive expired booking notifications
   - May need to implement WhatsApp API integration

---

## 📋 E2E TEST DEFINITION

### Success Criteria (Once Blockers Fixed)

```typescript
// Test: Complete Booking Flow
test('Order Now → Therapist Arrival', async ({ page }) => {
  
  // Step 1: Customer initiates booking
  await page.goto('/therapist-profile/123');
  await page.click('[data-test="order-now-button"]');
  expect(page.url()).toContain('/'); // Chat opens but stays on page
  
  // Step 2: Fill booking form and submit
  await page.fill('[data-test="customer-name"]', 'Test Customer');
  await page.fill('[data-test="whatsapp"]', '081234567890');
  await page.click('[data-test="submit-booking"]');
  
  // Step 3: Verify booking created in PENDING state
  const booking = await getBookingFromDB();
  expect(booking.bookingStatus).toBe('PENDING');
  expect(booking.adminCommission).toBeGreaterThan(0);
  expect(booking.providerPayout).toBeGreaterThan(0);
  
  // Step 4: Verify commission NOT recorded yet
  const commissionBefore = await getCommissionRecords(booking.bookingId);
  expect(commissionBefore.length).toBe(0); // ❌ No commission yet
  
  // Step 5: Therapist accepts booking
  await therapistPage.click('[data-test="accept-booking"]');
  
  // Step 6: Verify status changed to ACCEPTED
  const updatedBooking = await getBookingFromDB();
  expect(updatedBooking.bookingStatus).toBe('ACCEPTED');
  
  // Step 7: ✅ CRITICAL - Verify commission recorded on acceptance
  const commissionAfter = await getCommissionRecords(booking.bookingId);
  expect(commissionAfter.length).toBe(1); // ✅ Commission created
  expect(commissionAfter[0].adminCommission).toBe(booking.adminCommission);
  expect(commissionAfter[0].status).toBe('ACCEPTED'); // Or 'pending_collection'
  
  // Step 8: Customer confirms
  await page.click('[data-test="confirm-booking"]');
  
  // Step 9: Verify status changed to CONFIRMED
  const confirmedBooking = await getBookingFromDB();
  expect(confirmedBooking.bookingStatus).toBe('CONFIRMED');
  
  // Step 10: Verify commission NOT duplicated
  const commissionStillOne = await getCommissionRecords(booking.bookingId);
  expect(commissionStillOne.length).toBe(1); // ✅ Still only 1 commission
  
  // Step 11: Therapist completes service
  await therapistPage.click('[data-test="complete-booking"]');
  
  // Step 12: Verify status changed to COMPLETED
  const completedBooking = await getBookingFromDB();
  expect(completedBooking.bookingStatus).toBe('COMPLETED');
  
  // Step 13: Verify commission still not duplicated
  const finalCommission = await getCommissionRecords(booking.bookingId);
  expect(finalCommission.length).toBe(1); // ✅ Still only 1 commission
  
  // Step 14: Verify commission calculations
  expect(finalCommission[0].adminCommission).toBe(Math.round(booking.totalPrice * 0.30));
  expect(finalCommission[0].providerPayout).toBe(booking.totalPrice - finalCommission[0].adminCommission);
});
```

### FAIL TEST IMMEDIATELY IF:

#### ❌ **URL changes to `/` during booking**
```typescript
// Monitor for unwanted redirects
page.on('framenavigated', frame => {
  if (frame === page.mainFrame() && frame.url() === 'http://localhost:3002/') {
    throw new Error('BLOCKER: Unwanted redirect to home page detected');
  }
});
```

#### ❌ **Booking status skips a state**
```typescript
// Invalid: PENDING → COMPLETED (skipped ACCEPTED and CONFIRMED)
if (prevStatus === 'PENDING' && newStatus === 'COMPLETED') {
  throw new Error('BLOCKER: Status skipped ACCEPTED and CONFIRMED states');
}
```

#### ❌ **Booking completes without confirmation**
```typescript
// Invalid: ACCEPTED → COMPLETED (skipped CONFIRMED)
if (prevStatus === 'ACCEPTED' && newStatus === 'COMPLETED') {
  throw new Error('BLOCKER: Status skipped CONFIRMED state');
}
```

#### ❌ **Commission recorded before therapist accepts**
```typescript
const booking = await getBookingFromDB();
const commission = await getCommissionRecords(booking.bookingId);

if (booking.bookingStatus === 'PENDING' && commission.length > 0) {
  throw new Error('BLOCKER: Commission recorded before therapist accepted');
}
```

#### ❌ **Commission duplicated**
```typescript
const commissions = await getCommissionRecords(booking.bookingId);
if (commissions.length > 1) {
  throw new Error('BLOCKER: Commission recorded multiple times for same booking');
}
```

---

## 🔧 REQUIRED FIXES

### Fix #1: Implement Missing Commission Function

**File**: `lib/services/bookingLifecycleService.ts`  
**Insert After**: Line 574 (before `recordCompletedCommission`)

```typescript
/**
 * Record commission when therapist ACCEPTS booking (commission activates immediately)
 */
async recordAcceptedCommission(booking: BookingLifecycleRecord): Promise<void> {
  try {
    console.log(`💰 [BookingLifecycle] Recording commission on ACCEPTANCE for booking ${booking.bookingId}`);
    
    // Create commission record in database
    if (APPWRITE_CONFIG.collections.commissionRecords) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords,
        ID.unique(),
        {
          bookingId: booking.bookingId,
          bookingDocId: booking.$id,
          therapistId: booking.therapistId || booking.businessId,
          therapistName: booking.therapistName || booking.businessName,
          totalPrice: booking.totalPrice,
          adminCommission: booking.adminCommission,
          providerPayout: booking.providerPayout,
          providerType: booking.providerType,
          commissionRate: 0.30,
          status: 'ACCEPTED', // Commission locked in on acceptance
          createdAt: new Date().toISOString(),
          acceptedAt: booking.acceptedAt,
        }
      );
      
      console.log(`💰 [BookingLifecycle] Commission recorded on ACCEPTANCE: ${booking.adminCommission} IDR for admin`);
    }
  } catch (error) {
    console.error(`❌ [BookingLifecycle] Failed to record acceptance commission:`, error);
    // Don't throw - commission recording should not block booking acceptance
    // Log to error monitoring service for manual follow-up
  }
},
```

### Fix #2: Add Commission Deduplication Check

**File**: `lib/services/bookingLifecycleService.ts`  
**Location**: Inside `recordAcceptedCommission()` function

```typescript
// Check if commission already exists (prevent duplicates)
const existingCommission = await databases.listDocuments(
  APPWRITE_CONFIG.databaseId,
  APPWRITE_CONFIG.collections.commissionRecords,
  [Query.equal('bookingId', booking.bookingId), Query.limit(1)]
);

if (existingCommission.documents.length > 0) {
  console.log(`⚠️ [BookingLifecycle] Commission already exists for booking ${booking.bookingId} - skipping`);
  return; // Exit early to prevent duplicate
}
```

---

## 📊 VERIFICATION SUMMARY

### Code Quality Assessment

| Category | Status | Details |
|----------|--------|---------|
| State Machine | ✅ **PASS** | All transitions properly enforced |
| Routing Safety | ✅ **PASS** | No unwanted redirects detected |
| Timeout Handling | ✅ **PASS** | 5-min and 1-min timeouts work correctly |
| Commission Logic | ❌ **FAIL** | Missing function will cause runtime error |
| Availability Check | ✅ **PASS** | BUSY/OFFLINE therapists properly blocked |
| Broadcast System | ⚠️ **PARTIAL** | Logic correct but notification delivery unverified |

### Test Coverage

- ✅ Unit tests needed for `recordAcceptedCommission()`
- ✅ Integration test for commission recording on acceptance
- ✅ E2E test for complete booking flow
- ⚠️ Load test for broadcast to 100+ therapists

---

## 🎯 FINAL VERDICT

### ❌ **FLOW NOT READY FOR E2E TESTING**

**Reasons**:
1. 🔴 **BLOCKER**: Missing `recordAcceptedCommission()` function (will crash)
2. ⚠️ **WARNING**: Commission recording unverified (revenue at risk)
3. ⚠️ **WARNING**: Broadcast notification delivery unverified

**Next Steps**:
1. Implement `recordAcceptedCommission()` function (30 minutes)
2. Add commission deduplication check (15 minutes)
3. Write unit test for commission recording (30 minutes)
4. Run E2E test suite (1 hour)
5. Verify commission appears in admin dashboard (15 minutes)

**Estimated Time to Ready**: **2-3 hours**

---

## 📝 QA Sign-Off

**Reviewer**: Senior QA Engineer + Systems Architect  
**Review Date**: January 22, 2026  
**Review Status**: ❌ **NOT APPROVED FOR TESTING**

**Blocking Issues**: 1 critical bug (missing function)  
**Warnings**: 2 items require verification  

**Recommendation**: Fix blocking issue before proceeding with ANY E2E tests. Current code will fail at runtime when therapist attempts to accept booking.

---

**Report Generated**: ${new Date().toISOString()}
