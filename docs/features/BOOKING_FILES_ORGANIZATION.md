# 📋 BOOKING FLOW FILES - CLEAN ORGANIZATION

## ✅ ACTIVE BOOKING FLOWS (3 Main Flows)

### 1. 🔥 **Direct "Book Now" Chat** (PRIMARY)
**File**: [PersistentChatWindow.tsx](components/PersistentChatWindow.tsx)
- **Trigger**: Orange "Book Now" button on therapist card
- **Flow**: Immediate chat window opens → User books within chat
- **Source**: `'direct'` or `'bookingButton'`
- **Status**: ✅ ACTIVE - Main booking flow

### 2. 📅 **Scheduled Booking**
**File**: [ScheduleBookingPopup.tsx](components/ScheduleBookingPopup.tsx)  
- **Trigger**: "Schedule" button next to Book Now
- **Flow**: Date/time picker → Deposit payment → Chat opens
- **Source**: `'scheduled'`
- **Status**: ✅ ACTIVE - Future booking flow

### 3. 📋 **Menu Slider "Book Now"**
**File**: [BookingPopup.tsx](components/BookingPopup.tsx)
- **Trigger**: Price List → Select service → "Book Now"
- **Flow**: Pre-selected duration → Form → Chat opens  
- **Source**: `'price-slider'`
- **Status**: ✅ ACTIVE - Service-specific flow

## ⚠️ LEGACY/UNUSED FILES

### 📁 **Deprecated Components**
- **[BookingFormPopup.tsx](components/BookingFormPopup.tsx)** - ❌ Not imported/used
- **[BookingPage.tsx](pages/BookingPage.tsx)** - ⚠️ Route exists but not in main flows

### 🗂️ **Supporting Components** (Keep)
- [BookingStatusTracker.tsx](components/BookingStatusTracker.tsx) - Booking monitoring
- [BookingResponsePopup.tsx](components/BookingResponsePopup.tsx) - Therapist responses
- [BookingNotificationBanner.tsx](components/BookingNotificationBanner.tsx) - Notifications
- [ScheduledBookingDepositModal.tsx](components/ScheduledBookingDepositModal.tsx) - Deposit handling

## 🎯 CLEAR BOOKING ARCHITECTURE

```
User Intent → Entry Point → Component → Result

Book Now (Immediate) → Orange Button → PersistentChatWindow → Chat Opens
Schedule Booking → Schedule Button → ScheduleBookingPopup → Date Picker → Chat
Menu Selection → Price List → BookingPopup → Pre-filled Form → Chat
```

## ✅ ORGANIZATION STATUS
- **Main booking flows**: Clearly documented
- **Legacy files**: Marked as deprecated/unused  
- **File purposes**: Clearly defined
- **No confusion**: Each file has specific role