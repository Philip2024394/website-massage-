# Proposed Booking Chat Flow – Mapping to Codebase

## Flow Overview

| Step | Trigger | Proposed Message / Action | Existing Component | Status |
|------|---------|---------------------------|--------------------|--------|
| 1 | 5 min no therapist response | "Unfortunately, the therapist is busy... We will locate an alternative replacement now. Please hold while we process your booking." | `PersistentChatProvider.handleTimerExpiration` | ✅ Implemented |
| 2 | +8 sec after step 1 | "Therapists are checking your booking request now..." | `handleTimerExpiration` setTimeout | ✅ Implemented |
| 3 | Therapist accepts | "Your booking has been accepted by [Name]. Area: [Types]. Location: [Area]. You have 1 minute to cancel." | `PersistentChatProvider.acceptBooking` | ✅ Implemented |
| 4a | User cancels within 1 min | "Your booking has been cancelled. We will look for another therapist." | `PersistentChatProvider.cancelBooking` | ✅ Implemented |
| 4b | No cancel within 1 min | "Your therapist is on the way!" | `PersistentChatProvider.setOnTheWay` | ✅ Implemented |

---

## Component Mapping

### 1. Timer & Expiration (5 min therapist response)

- **File**: `src/hooks/useBookingTimer.ts`
- **Phase**: `THERAPIST_RESPONSE` (5 min for book_now)
- **Expiration handler**: `src/context/PersistentChatProvider.tsx` → `handleTimerExpiration`
- **Current behavior**: On expiry → `addSystemNotification` with "therapist is busy... We will locate an alternative replacement now..."
- **Change**: Add 8-second delayed follow-up message

### 2. 8-Second Follow-Up Message

- **Location**: Inside `handleTimerExpiration` (THERAPIST_RESPONSE branch)
- **Action**: `setTimeout(8000, () => addSystemNotification("Therapists are checking your booking request now..."))`
- **Optional**: Repeat every ~15–20 sec until accepted (with guard to avoid spam)

### 3. Therapist Accept Flow

- **File**: `src/context/PersistentChatProvider.tsx` → `acceptBooking`
- **Timer**: `startTimer('CUSTOMER_CONFIRMATION', bookingId)` – 60 seconds
- **Current message**: "Therapist {name} accepted your booking. You have 1 minute to confirm or the booking is canceled."
- **Proposed message**: Include massage types, location area, and 1-minute cancel notice
- **Data**: `chatState.currentBooking.serviceType`, `locationZone`, `chatState.therapist.name`

### 4. Cancel Booking (within 1 min)

- **File**: `src/context/PersistentChatProvider.tsx` → `cancelBooking`
- **Current message**: "Booking canceled. Please select a new therapist from the homepage."
- **Proposed message**: "Your booking has been cancelled. We will look for another therapist."
- **Optional loop-back**: Trigger alternative therapist search; keep user in same chat flow (stub exists in `lib/bookingService.ts`)

### 5. Therapist On the Way

- **File**: `src/context/PersistentChatProvider.tsx` → `setOnTheWay`
- **Current message**: "🚗 {therapistName} is on the way!"
- **Status**: Matches proposal ✅

---

## Status Mapping

| Proposed | Existing (lifecycleStatus) | Existing (status) |
|----------|---------------------------|-------------------|
| pending | PENDING | pending |
| accepted | ACCEPTED | therapist_accepted |
| cancelled | DECLINED | - |
| therapist_on_way | CONFIRMED + therapistOnTheWayAt | on_the_way |

---

## Alternative Therapist Search

- **Stub**: `src/lib/bookingService.ts` → `searchAlternativeTherapists`, `checkAndSearchAlternative`
- **Hotel/Villa**: `src/services/hotelVillaBookingService.ts` → `findAlternativeProviders`
- **Note**: Full alternative search backend is not implemented; current flow shows user-facing message only.

---

## Files to Modify

1. `src/context/PersistentChatProvider.tsx` – expiration handler, accept message, cancel message, 8-sec follow-up
2. `src/components/PersistentChatWindow.tsx` – any UI changes for cancel redirect (optional)
3. `src/modules/chat/BookingWelcomeBanner.tsx` – status text for `waiting_others` (optional)
