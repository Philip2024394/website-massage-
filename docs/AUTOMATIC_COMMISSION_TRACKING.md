# Automatic Commission Tracking Implementation

## Overview
Automatic commission record creation has been integrated into the booking flow. When a **Pro member** (30% commission) completes a booking, the system automatically creates a commission payment record with a **4-hour payment deadline**.

## How It Works

### 1. Membership Tiers
- **Pro Plan** (`membershipTier: 'free'`):
  - Rp 0 per month
  - **30% commission** per booking
   - **4-hour payment deadline** after booking
  - Commission tracking **ENABLED**

- **Plus Plan** (`membershipTier: 'plus'`):
  - Rp 250,000 per month
  - **0% commission**
  - No payment deadlines
  - Commission tracking **DISABLED**

### 2. Book Now Flow (ChatWindow.tsx)
When a customer clicks "Book Now" and activates chat:

1. ✅ Chat is created successfully
2. ✅ System checks therapist's `membershipTier`
3. ✅ If `membershipTier === 'free'` (Pro):
   - Creates commission record with 30% rate
   - Sets 4-hour payment deadline
   - Records booking details
   - Account will auto-deactivate if payment not submitted within 3 hours
4. ℹ️ If `membershipTier === 'plus'` (Plus):
   - No commission record created
   - No payment tracking

**Code Location:** [components/ChatWindow.tsx](components/ChatWindow.tsx#L713-L762)

### 3. Schedule Booking Flow (ScheduleBookingPopup.tsx)
When a customer schedules a booking:

1. ✅ Booking is saved to database
2. ✅ System checks therapist's `membershipTier`
3. ✅ If `membershipTier === 'free'` (Pro):
   - Creates commission record with 30% rate
   - Sets 4-hour payment deadline (from booking creation time)
   - Records scheduled date/time for reference
   - Account will auto-deactivate if payment not submitted within 3 hours
4. ℹ️ If `membershipTier === 'plus'` (Plus):
   - No commission record created
   - No payment tracking

**Code Location:** [components/ScheduleBookingPopup.tsx](components/ScheduleBookingPopup.tsx#L389-L436)

## Commission Record Data Structure

Each commission record contains:

```typescript
{
  therapistId: string;           // Provider ID
  therapistName: string;         // Provider name
  bookingId: string;            // Unique booking reference
  bookingDate: string;          // When booking was created
  scheduledDate?: string;       // When service is scheduled (for Schedule bookings)
  serviceAmount: number;        // Total booking amount
  commissionRate: 30;           // Always 30% for Pro members
  commissionAmount: number;     // Calculated as serviceAmount * 0.30
   paymentDeadline: string;      // bookingDate + 4 hours
  status: 'pending';            // Initial status
  createdAt: string;            // Record creation timestamp
  updatedAt: string;            // Last update timestamp
}
```

## Payment Enforcement

### 4-Hour Deadline System
- Commission record is created **immediately** after booking
- Deadline is set to **4 hours** from booking creation time
- System monitors deadline automatically
- If member doesn't upload payment proof within 4 hours:
  - Account status changes to **'busy'**
  - `bookingEnabled` and `scheduleEnabled` set to **false**
  - Member cannot receive new bookings until payment is submitted

### Member Actions
1. **View Pending Payments:**
   - Member sees commission due in their dashboard
   - Countdown timer shows time remaining
   - Amount due clearly displayed

2. **Upload Payment Proof:**
   - Member uploads proof via mobile-friendly interface
   - Account **auto-reactivates** immediately after upload
   - Status changes to `'awaiting_verification'`

3. **Admin Verification:**
   - Admin reviews payment proof
   - Approves or rejects with reason
   - If approved: Status = `'verified'`
   - If rejected: Status = `'rejected'`, member must re-upload

## Important Notes

### Pro Members Only
- Automatic commission creation **ONLY** applies to `membershipTier === 'free'` (Pro plan)
- Plus members (`membershipTier === 'plus'`) are **completely exempt**

### Error Handling
- If commission creation fails, booking still proceeds normally
- Error is logged but doesn't block customer experience
- Commission can be created manually by admin if needed

### Both Booking Types
- **Book Now (immediate):** Commission created when chat activates
- **Schedule:** Commission created when booking is saved

### Database Collections
- **Commission Records:** Stored in `commission_payments` collection
- **Therapist Data:** Fetched from `therapists` or `facial_places` collections

## Related Files

### Core Implementation
- [components/ChatWindow.tsx](components/ChatWindow.tsx) - Book Now flow with commission creation
- [components/ScheduleBookingPopup.tsx](components/ScheduleBookingPopup.tsx) - Schedule flow with commission creation
- [lib/services/commissionTrackingService.ts](lib/services/commissionTrackingService.ts) - Commission management service

### UI Components
- [apps/therapist-dashboard/src/components/CommissionPaymentManager.tsx](apps/therapist-dashboard/src/components/CommissionPaymentManager.tsx) - Member payment interface
- [apps/admin-dashboard/src/components/AdminPaymentVerification.tsx](apps/admin-dashboard/src/components/AdminPaymentVerification.tsx) - Admin verification dashboard

### Documentation
- [CHAT_BOOKING_FLOW_VERIFICATION.md](CHAT_BOOKING_FLOW_VERIFICATION.md) - Complete booking flow documentation
- [apps/therapist-dashboard/src/pages/MembershipPage.tsx](apps/therapist-dashboard/src/pages/MembershipPage.tsx) - Membership tier definitions

## Testing Checklist

- [ ] Pro member completes Book Now booking → Commission record created
- [ ] Plus member completes Book Now booking → No commission record
- [ ] Pro member schedules booking → Commission record with scheduled date
- [ ] Plus member schedules booking → No commission record
- [ ] Commission record has correct 30% calculation
- [ ] Payment deadline is exactly 4 hours from booking creation
- [ ] Account auto-deactivates after 4 hours without payment
- [ ] Account auto-reactivates immediately after proof upload
- [ ] Admin can verify/reject payments
- [ ] Failed commission creation doesn't block booking

## Summary

✅ **Automatic commission tracking is now fully integrated**
- Pro members (30% commission) are automatically tracked
- Plus members (0% commission) are exempt
- 4-hour payment deadline enforced with auto-deactivation
- Immediate reactivation after proof upload
- Admin verification workflow complete
- Both "Book Now" and "Schedule" booking flows covered

The system ensures fair payment enforcement for Pro members while maintaining a seamless booking experience for customers.
