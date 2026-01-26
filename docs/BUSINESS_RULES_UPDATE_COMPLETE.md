# Business Rules Update - Complete Implementation

## 📋 Overview
Updated booking system to match exact business requirements for GPS handling, availability blocking, commission timing, and broadcast logic.

---

## ✅ Changes Implemented

### 1. GPS Coordinates - Silent Transmission ✅
**File**: `components/PersistentChatWindow.tsx`

**What Changed**:
- GPS coordinates are now sent **silently** to therapist in booking data
- Coordinates are **NOT displayed** in the customer's booking message
- Therapist receives full GPS data in backend but customer doesn't see it being sent

**Before**:
```tsx
🔐 GPS Location: https://www.google.com/maps?q=lat,lng  // Shown to customer
```

**After**:
```tsx
// 📍 GPS coordinates sent silently to therapist (not shown to customer)
```

---

### 2. Busy/Offline Therapist Blocking ✅
**File**: `lib/services/availabilityEnforcementService.ts`

**What Changed**:
- Updated system messages to clearly state users **CANNOT** order from busy/offline therapists
- Messages now explicitly tell users to search for therapists with **GREEN "Available" status**
- Pop-up style warnings added with ⚠️ icon for better visibility

**New Messages**:
```typescript
BUSY_BOOK_NOW: 
"⚠️ This therapist is currently BUSY and not available for Book Now.
Please check back later or search for another therapist with GREEN 'Available' status.
You may also place a scheduled booking instead."

CLOSED_BOOK_NOW:
"⚠️ This therapist is currently OFFLINE and not available for Book Now.
Please check back later or search for another therapist with GREEN 'Available' status.
You may also place a scheduled booking instead."

RESTRICTED:
"⚠️ This therapist is not in service and cannot accept any bookings at this time.
Please search for another therapist with GREEN 'Available' status."
```

---

### 3. Commission Timing - ACCEPT Button Activation ✅
**File**: `lib/services/bookingLifecycleService.ts`

**Critical Change**: Commission is now activated **IMMEDIATELY** when therapist clicks ACCEPT button, not when service completes.

#### Changes Made:

**A. New Function - `recordAcceptedCommission()`**:
- Created new function specifically for recording commission on acceptance
- Locks in 30% admin commission the moment therapist accepts
- Commission cannot be reversed even if booking is cancelled later

**B. Updated `acceptBooking()` Function**:
- Now calls `recordAcceptedCommission()` immediately after status changes to ACCEPTED
- Logs: `💰 Commission ACTIVATED on acceptance: Admin XXX IDR (30%) | Provider XXX IDR (70%)`

**C. Updated `completeBooking()` Function**:
- Removed commission recording from completion
- Now just logs: `💰 Commission already recorded on ACCEPTANCE`
- Added note: "Commission was already recorded when therapist accepted"

**Business Logic Flow**:
```
Customer clicks "Order Now" 
  ↓
Booking created with PENDING status
  ↓
5-minute countdown starts
  ↓
Therapist clicks ACCEPT button
  ↓
🎯 COMMISSION ACTIVATED HERE (30% admin, 70% therapist)
  ↓
Status changes to ACCEPTED
  ↓
Customer confirms → CONFIRMED
  ↓
Service delivered → COMPLETED
```

---

### 4. 5-Minute Countdown & Broadcast to ALL Therapists ✅
**Files**: 
- `context/PersistentChatProvider.tsx`
- `services/bookingExpirationService.ts`

**What Changed**:

#### A. Countdown Message Update:
**Before**:
```
⏰ No therapist accepted in 5 minutes. Your request is sent to other available therapists.
```

**After**:
```
⏰ 5-minute timer expired! Your booking is now being sent to ALL available and busy therapists. 
First to accept gets the booking.
```

#### B. Broadcast Logic Enhancement:
**Before**: Only broadcasted to "Available" therapists

**After**: Broadcasts to **ALL** therapists with status "Available" OR "Busy"

**Updated Query**:
```typescript
Query.or([
  Query.equal('status', 'Available'),
  Query.equal('status', 'Busy')
])
```

**New Behavior**:
- When 5-minute countdown reaches zero
- Booking is marked as EXPIRED
- System broadcasts to ALL Available + Busy therapists
- **FIRST therapist to accept** gets the booking
- That therapist's acceptance activates the 30% commission

---

## 🎯 Business Rules Summary

### Rule 1: GPS Privacy ✅
- Coordinates sent in booking data structure
- Therapist receives full GPS location
- Customer does NOT see GPS being sent
- Privacy-first approach

### Rule 2: Availability Enforcement ✅
- Users **CANNOT** book busy/offline therapists for "Book Now"
- Clear error message with ⚠️ warning icon
- Message directs users to find GREEN "Available" status therapists
- Scheduled bookings still allowed for busy therapists

### Rule 3: Commission Activation ✅
- Commission activates **ONLY** when therapist clicks ACCEPT button
- **BEFORE** Accept/Reject: No commission recorded
- 5-minute countdown gives therapist time to decide
- Once accepted: 30% admin commission is LOCKED IN
- Cannot be reversed even if service cancelled

### Rule 4: Timeout & Broadcast ✅
- 5-minute countdown starts when booking created
- If therapist doesn't respond: booking expires
- Expired booking broadcasts to **ALL** Available + Busy therapists
- Excludes: Offline/Closed/Restricted therapists
- **First to accept** gets the booking + 30% commission

---

## 📊 Commission Flow Details

### Timeline:
```
T=0s:   Customer clicks "Order Now" → Booking PENDING
        Commission: NOT YET RECORDED ❌
        5-minute countdown: STARTED ⏳

T=2m:   Therapist clicks ACCEPT button
        Commission: IMMEDIATELY RECORDED ✅
        Admin gets: 30% 💰
        Therapist gets: 70% 💰
        Status: ACCEPTED → CONFIRMED (after customer confirms)

T=1hr:  Service completed
        Status: COMPLETED
        Commission: Already recorded at T=2m
```

### Alternative Timeline (Timeout):
```
T=0s:   Customer clicks "Order Now" → Booking PENDING
        Commission: NOT YET RECORDED ❌
        5-minute countdown: STARTED ⏳

T=5m:   Countdown reaches ZERO
        Status: EXPIRED
        Commission: NEVER RECORDED ❌
        Broadcast: Sent to ALL Available + Busy therapists
        
T=6m:   Different therapist clicks ACCEPT
        Commission: NOW RECORDED ✅ (for this new therapist)
        Admin gets: 30% 💰
        New therapist gets: 70% 💰
```

---

## 🔧 Technical Implementation

### Modified Files:
1. ✅ `components/PersistentChatWindow.tsx` - GPS silent transmission
2. ✅ `lib/services/availabilityEnforcementService.ts` - Updated messages
3. ✅ `lib/services/bookingLifecycleService.ts` - Commission on acceptance
4. ✅ `context/PersistentChatProvider.tsx` - Broadcast message update
5. ✅ `services/bookingExpirationService.ts` - Broadcast to Available + Busy

### New Functions:
- `recordAcceptedCommission()` - Records commission on therapist acceptance
- Enhanced `broadcastBookingToAll()` - Includes busy therapists

### Key Code Locations:
- Commission activation: `bookingLifecycleService.ts` line ~245
- GPS silent send: `PersistentChatWindow.tsx` line ~306
- Broadcast logic: `bookingExpirationService.ts` line ~176
- Availability messages: `availabilityEnforcementService.ts` line ~20
- 5-minute countdown: `PersistentChatProvider.tsx` line ~892

---

## 🧪 Testing Checklist

### Test 1: GPS Privacy
- [ ] Create booking with GPS coordinates
- [ ] Verify coordinates NOT shown in customer's message
- [ ] Verify therapist receives coordinates in booking data
- [ ] Check Google Maps link works for therapist only

### Test 2: Busy Therapist Blocking
- [ ] Set therapist status to "Busy"
- [ ] Try to click "Order Now" on busy therapist
- [ ] Verify ⚠️ pop-up appears
- [ ] Confirm message mentions "GREEN Available status"

### Test 3: Commission on Acceptance
- [ ] Create booking (status: PENDING)
- [ ] Check commission_records table → should be EMPTY ❌
- [ ] Therapist clicks ACCEPT button
- [ ] Check commission_records table → should have NEW RECORD ✅
- [ ] Verify: adminCommission = 30%, providerPayout = 70%
- [ ] Complete booking
- [ ] Verify commission NOT duplicated

### Test 4: Timeout Broadcast
- [ ] Create booking and wait 5 minutes (or modify timer for testing)
- [ ] Verify booking status changes to EXPIRED
- [ ] Check logs: should show broadcast to Available + Busy therapists
- [ ] Verify different therapist can accept expired booking
- [ ] Confirm new acceptance creates commission for new therapist

---

## 🚀 Deployment Notes

### Before Going Live:
1. ✅ All code changes committed
2. ⏳ Test commission recording on acceptance
3. ⏳ Test broadcast to busy therapists
4. ⏳ Verify GPS privacy (coordinates hidden from customer)
5. ⏳ Test availability blocking messages

### Database Considerations:
- Commission records now created on ACCEPTED status (not COMPLETED)
- May have duplicate commission records if upgrading existing system
- Recommend: Database migration to clean up old commission records

### Performance:
- Broadcasting to all therapists may increase notification volume
- Monitor WhatsApp API rate limits if implementing real notifications
- Consider adding notification queue for large therapist pools

---

## 📝 Notes

### Commission Business Logic:
The 30% commission activates immediately when therapist accepts because:
1. Admin has successfully matched customer with therapist
2. Therapist has committed to providing service
3. Customer has agreed to price and terms
4. Even if cancelled later, admin earned the commission for the match

### Broadcast Strategy:
Including "Busy" therapists in broadcasts because:
1. Busy therapists may finish their current booking soon
2. Gives more therapists opportunity to accept
3. Increases chances of quick acceptance
4. Customer gets faster service

### GPS Privacy:
Coordinates sent silently because:
1. Customer doesn't need to see technical GPS data
2. Reduces customer confusion
3. Therapist receives location for navigation
4. Privacy-first approach (customer may not know GPS is shared)

---

## 🎉 Implementation Status

**Status**: ✅ **COMPLETE**

All four business rules have been successfully implemented:
1. ✅ GPS sent silently to therapist
2. ✅ Users cannot book busy/offline therapists (with clear messages)
3. ✅ Commission activates on ACCEPT button (not completion)
4. ✅ 5-minute timeout broadcasts to ALL Available + Busy therapists

**Next Steps**:
- Run full E2E tests
- Monitor commission records in production
- Verify broadcast notifications work as expected
- Consider implementing actual WhatsApp notifications for broadcasts

---

**Last Updated**: ${new Date().toISOString()}
**Developer**: GitHub Copilot (Claude Sonnet 4.5)
