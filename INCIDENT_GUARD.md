# 🔒 INCIDENT GUARD - Booking → Chat → Notification Pipeline

**Status:** 🔴 **CRITICAL - REVENUE PROTECTION SYSTEM**  
**Last Updated:** January 22, 2026  
**Incident Reference:** SEV-1 Booking Pipeline Failure (Jan 22, 2026)

---

## 📊 EXECUTIVE SUMMARY

> **"Our booking system is revenue-safe: bookings, chat, notifications, and realtime updates are enforced atomically with automated failure detection."**

---

## 🎯 PURPOSE OF THIS DOCUMENT

This document ensures we **NEVER REPEAT** the critical failure that caused:
- ❌ Therapists losing revenue (bookings not received)
- ❌ Customers receiving no service
- ❌ Platform reliability compromised

**This is institutional memory. Read this before touching booking-related code.**

---

## 📖 WHAT BROKE

### The Failure Chain

```
User Creates Booking
    ↓
✅ Booking saved to DB
    ↓
❌ NO chat room created (delegated to component that never ran)
    ↓
❌ Notification failed silently (wrong collection name, error swallowed)
    ↓
❌ Realtime subscription never matched (field name mismatch: therapistId vs providerId)
    ↓
🔴 RESULT: Therapist never knew booking existed = REVENUE LOSS
```

### Root Causes

1. **Chat Room Not Created**
   - Code assumed "ChatWindow component" would create it
   - Component only runs when therapist clicks "Open Chat"
   - If therapist never knew about booking, chat never existed

2. **Silent Notification Failure**
   - Hard-coded collection name `'notifications'`
   - Error caught and swallowed in try/catch
   - Booking succeeded but therapist never notified

3. **Realtime Subscription Field Mismatch**
   - Code checked `booking.therapistId`
   - Appwrite schema uses `providerId`
   - No bookings ever matched despite being correct therapist

4. **Schema Drift**
   - Bookings created with `therapistId` field
   - Schema expected `providerId` field
   - Queries and subscriptions broke silently

---

## 🛡️ PROTECTIONS NOW IN PLACE

### 1️⃣ Revenue-Safety Regression Tests ✅

**File:** [lib/tests/booking-revenue-safety.test.ts](lib/tests/booking-revenue-safety.test.ts)

**What It Does:**
- Tests MUST pass before any booking code can be deployed
- Verifies booking + chat room + notification are ATOMIC
- Fails loudly if any component is missing

**How To Run:**
```bash
npm test booking-revenue-safety.test.ts
```

**CI/CD Integration:**
```yaml
# Add to .github/workflows/ci.yml
- name: Revenue Safety Tests
  run: npm test booking-revenue-safety.test.ts
  # Block deployment if tests fail
```

---

### 2️⃣ Schema Drift Lock ✅

**File:** [lib/validation/bookingSchemaValidator.ts](lib/validation/bookingSchemaValidator.ts)

**What It Does:**
- Validates all booking data against Appwrite schema BEFORE saving
- Prevents field name mismatches (therapistId vs providerId)
- Throws error if schema doesn't match exactly

**Example:**
```typescript
// Validation happens automatically in bookingService.createBooking()
const validatedData = validateBookingSchema(mappedData);
// ✅ If validation fails, booking creation fails (no silent errors)
```

**How It Prevents Failures:**
- No more `therapistId` vs `providerId` confusion
- Realtime subscriptions can't break due to field mismatch
- Queries always use correct field names

---

### 3️⃣ Hard Fail Rule (No Silent Success) ✅

**Changes Made:**
- `notifyTherapist()` now throws if notification creation fails
- Chat room creation failure logged as CRITICAL
- All errors visible in console with detailed context

**Before (BROKEN):**
```typescript
catch (error) {
    console.error('Error:', error);
    // ❌ Error swallowed, booking still succeeds
}
```

**After (FIXED):**
```typescript
catch (error) {
    console.error('🔴 CRITICAL ERROR:', error);
    throw new Error(`Failed to notify therapist: ${error}`);
    // ✅ Error thrown, failure is visible
}
```

---

### 4️⃣ Realtime Subscription Watchdog ✅

**File:** [lib/monitoring/realtimeWatchdog.ts](lib/monitoring/realtimeWatchdog.ts)

**What It Does:**
- Monitors realtime subscriptions for therapists
- Alerts if NO events received within 5 minutes
- Logs as SEV-1 if subscription appears dead

**Usage:**
```typescript
// In therapist dashboard
import { createTherapistWatchdog } from '../../lib/monitoring/realtimeWatchdog';

const watchdog = createTherapistWatchdog(
    therapist.$id,
    (booking) => {
        // Handle new booking
    }
);

// Watchdog will alert if subscriptions stop working
```

**What It Detects:**
- Realtime service down
- Subscription not firing
- Network issues blocking events

---

### 5️⃣ Business-Critical Health Check ✅

**File:** [lib/monitoring/healthCheck.ts](lib/monitoring/healthCheck.ts)

**What It Does:**
- Runs every 5 minutes automatically
- Creates test booking
- Verifies chat + notification created
- Cleans up test data
- Logs SEV-1 if any step fails

**Usage:**
```typescript
// Start monitoring (in admin dashboard or server)
import { startHealthCheckMonitoring } from '../../lib/monitoring/healthCheck';

const healthCheck = startHealthCheckMonitoring(5); // 5 minutes

// Health check runs automatically
// Alerts if pipeline breaks
```

**What It Prevents:**
- Silent failures going unnoticed for hours
- Therapists complaining before we know there's a problem
- Revenue loss from extended outages

---

### 6️⃣ Therapist Income Protection ✅

**File:** [apps/therapist-dashboard/src/pages/TherapistBookings.tsx](apps/therapist-dashboard/src/pages/TherapistBookings.tsx)

**What It Does:**
- **ALWAYS shows bookings** even if chat/notification fails
- Non-blocking communication setup check
- Visual warning if communication incomplete
- Therapists never miss paid work

**How It Works:**
```typescript
// Bookings always load first (critical path)
const bookings = await bookingService.getProviderBookings(therapistId);
setBookings(bookings); // ✅ Displayed immediately

// Communication check happens in background (non-blocking)
checkBookingCommunicationSetup(bookingId).catch(err => {
    // ✅ Warning shown but booking still visible
    showCommunicationWarning(bookingId);
});
```

**What It Prevents:**
- Therapists losing revenue because chat system is broken
- Complete service outage from partial failure
- Bad user experience masking underlying issues

---

## 🚨 WHEN TO REFERENCE THIS DOCUMENT

**MANDATORY - Read this before:**

1. Modifying `lib/bookingService.ts`
2. Changing booking creation flow
3. Updating notification system
4. Modifying realtime subscriptions
5. Changing Appwrite schema
6. Touching chat room creation

**Quick Check:**
- ✅ Did you run revenue-safety tests?
- ✅ Did you validate schema changes?
- ✅ Did you test realtime subscriptions?
- ✅ Did you verify therapist dashboard shows bookings?

---

## 📊 MONITORING & ALERTS

### Key Metrics

| Metric | Expected | Alert If |
|--------|----------|----------|
| Chat Room Creation Rate | 100% | < 95% |
| Notification Delivery Rate | 100% | < 98% |
| Realtime Subscription Match Rate | 100% | < 95% |
| Health Check Pass Rate | 100% | < 100% |

### Console Log Patterns

**Healthy System:**
```
✅ Booking created: BK1234567890
✅ Schema validation passed for booking: BK1234567890
✅ Chat room created: chat_xyz123
✅ Therapist notification created: notif_abc456
✅ Push notification sent to therapist
🔔 New booking received for provider: therapist_789
```

**Broken System:**
```
❌ CRITICAL: Chat room creation failed: [error]
❌ CRITICAL ERROR notifying therapist: [error]
🔴 SCHEMA VALIDATION FAILED: Field 'providerId' - Expected string (required), received undefined
🔴 REVENUE-SAFETY VIOLATION: Booking created but NO chat room
```

---

## 🧪 HOW TO TEST CHANGES

### Before Deploying ANY Booking Changes:

1. **Run Revenue-Safety Tests**
   ```bash
   npm test booking-revenue-safety.test.ts
   ```
   **All tests MUST pass**

2. **Test End-to-End Flow**
   ```bash
   # Open browser console
   # Copy and paste: test-booking-pipeline.js
   await testBookingPipeline()
   ```
   **All checks MUST pass**

3. **Verify Schema Validation**
   ```typescript
   // Create test booking
   const booking = await bookingService.createBooking({ ... });
   
   // Check console for:
   // ✅ Schema validation passed for booking: [bookingId]
   ```

4. **Test Realtime Subscription**
   ```typescript
   // In therapist dashboard console
   const unsubscribe = bookingService.subscribeToProviderBookings(
       therapist.$id,
       (booking) => console.log('🔔 RECEIVED:', booking)
   );
   
   // Create booking in different tab
   // Verify console shows: 🔔 RECEIVED: [booking]
   ```

5. **Verify Therapist Dashboard**
   - Create booking
   - Open therapist dashboard
   - Verify booking appears immediately
   - Verify no errors in console

---

## 🔧 IF SOMETHING BREAKS

### Diagnostic Questions

**Q1: Is booking created in database?**
```typescript
// Check Appwrite console → bookings collection
// Or query: databases.getDocument(...)
```

**Q2: Is chat room created?**
```typescript
// Check Appwrite console → chat_rooms collection
// Filter by bookingId
```

**Q3: Is notification created?**
```typescript
// Check Appwrite console → notifications collection
// Filter by userId (therapistId)
```

**Q4: Is realtime subscription firing?**
```typescript
// Check browser console for:
// 📡 Booking event received: [...]
// 🔍 Checking booking provider: { match: true/false }
```

### Emergency Rollback

If booking pipeline breaks:

```bash
# 1. Check health check status
const health = healthCheck.getLastResult();
console.log(health);

# 2. Check watchdog status
const stats = watchdog.getStats();
console.log(stats);

# 3. Rollback to last working commit
git revert <commit-hash>

# 4. Redeploy
npm run build && npm run deploy
```

---

## 🎓 LESSONS LEARNED

### What We Learned

1. **Never Delegate Critical Operations**
   - Chat room creation must happen in booking creation
   - Don't assume "component will handle it"

2. **Never Swallow Errors Silently**
   - All errors must throw or log loudly
   - Silent failures = revenue loss

3. **Schema Matters**
   - Field name mismatches break everything
   - Validate schema before saving

4. **Realtime Subscriptions Are Critical**
   - Must be tested regularly
   - Must alert if not working

5. **Income Protection First**
   - Show bookings even if communication broken
   - Never block revenue flow

### Principles to Follow

✅ **Atomic Operations** - All or nothing  
✅ **Loud Failures** - Never fail silently  
✅ **Schema Validation** - Always validate before save  
✅ **Continuous Monitoring** - Test automatically  
✅ **Income Protection** - Revenue flow first  

---

## 📞 ESCALATION

If booking pipeline failure detected:

1. **Check Health Check Dashboard**
   - View last result
   - Identify failed component

2. **Check Console Logs**
   - Look for CRITICAL errors
   - Check schema validation failures

3. **Alert Engineering Team**
   - Reference this document
   - Provide health check results
   - Include console logs

4. **Immediate Mitigation**
   - Manually notify therapists of bookings
   - Direct customers to alternative booking methods
   - Monitor revenue impact

---

## ✅ FINAL CHECKLIST

Before closing any booking-related PR:

- [ ] Revenue-safety tests pass
- [ ] Schema validation added
- [ ] Error handling is loud (not silent)
- [ ] Realtime subscription tested
- [ ] Therapist dashboard shows bookings
- [ ] Health check runs successfully
- [ ] This document referenced in PR

---

## 🧠 ANSWER TO CRITICAL QUESTION

**"If a therapist does NOT receive a booking notification, what exact system component failed — and how would we know within 60 seconds?"**

### Answer:

**Component Failures (in order of likelihood):**

1. **Realtime Subscription Failure**
   - **Detection:** Watchdog alerts after 5 minutes (not 60 seconds)
   - **Symptom:** No events in console: `📡 Booking event received`
   - **Fix:** Refresh page, check Appwrite realtime service

2. **Notification Creation Failure**
   - **Detection:** Console log shows: `❌ CRITICAL ERROR notifying therapist`
   - **Symptom:** Booking exists, no notification document
   - **Fix:** Check APPWRITE_CONFIG.collections.notifications

3. **Chat Room Creation Failure**
   - **Detection:** Console log shows: `❌ CRITICAL: Chat room creation failed`
   - **Symptom:** Booking exists, no chat room document
   - **Fix:** Check chat service availability

4. **Schema Validation Failure**
   - **Detection:** Console log shows: `🔴 SCHEMA VALIDATION FAILED`
   - **Symptom:** Booking not created at all
   - **Fix:** Check booking data matches schema

### How We Know Within 60 Seconds:

**Currently:**
- ✅ Console logs show errors immediately
- ✅ Health check detects within 5 minutes
- ❌ **NOT within 60 seconds** (gap identified)

**Improvement Needed:**
```typescript
// Add to booking creation
const NOTIFICATION_TIMEOUT = 60000; // 60 seconds

const notificationPromise = notifyTherapist(booking);
const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Notification timeout')), NOTIFICATION_TIMEOUT)
);

await Promise.race([notificationPromise, timeoutPromise]);
// ✅ Now we know within 60 seconds if notification failed
```

---

**Last Review:** January 22, 2026  
**Next Review:** Before any booking-related deployment  
**Owner:** Engineering Team  
**Severity:** 🔴 CRITICAL - REVENUE PROTECTION
