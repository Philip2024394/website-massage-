# 🔒 BOOKING-IN-CHAT LOCK-IN - QUICK REFERENCE

## ⚡ CRITICAL RULES (DO NOT VIOLATE)

```
┌─────────────────────────────────────────────────────────┐
│  1. BookingWelcomeBanner = SINGLE SOURCE OF TRUTH       │
│  2. Chat CANNOT render without booking object           │
│  3. Booking fields MUST pass schema validation          │
│  4. Countdown timer MUST persist                        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CORRECT PATTERNS

### Opening Chat
```typescript
const booking = {
  id: 'booking-123',
  status: 'pending',
  serviceType: 'Traditional Massage',
  duration: 60,
  customerName: 'John Doe',
  totalPrice: 150000,
  bookingType: 'book_now'
};

openChat(therapist, booking);  // ✅
```

### Rendering Booking Info
```tsx
{chatState.currentBooking && (
  <BookingWelcomeBanner
    currentBooking={chatState.currentBooking}
    bookingCountdown={chatState.bookingCountdown}
  />
)}  // ✅
```

---

## ❌ FORBIDDEN PATTERNS

### Opening Chat Without Booking
```typescript
openChat(therapist);  // ❌ WILL THROW
```

### Inline Booking Rendering
```tsx
{chatState.currentBooking && (
  <div>Booking for {chatState.currentBooking.customerName}</div>
)}  // ❌ FORBIDDEN
```

### Resetting Timer
```typescript
setBookingCountdown(300);  // ❌ DON'T RESET
```

---

## 📋 REQUIRED BOOKING FIELDS

```typescript
{
  id: string,             // ✅ Required
  status: BookingStatus,  // ✅ Required
  serviceType: string,    // ✅ Required
  duration: number,       // ✅ Required
  customerName: string,   // ✅ Required
  totalPrice: number,     // ✅ Required
  bookingType: string     // ✅ Required
}
```

---

## 🚨 ERROR EXAMPLES

### Missing Required Field
```
🚨 BOOKING VALIDATION FAILED 🚨

Validation Errors:
customerName: 🚨 CRITICAL: Customer name is required

→ Fix: Add customerName to booking object
```

### Chat Without Booking
```
🚨 CRITICAL VIOLATION: PersistentChatWindow opened without booking data!

RULE VIOLATION: Chat CANNOT render without valid booking object

→ Fix: Provide booking object when opening chat
```

### Invalid Status
```
🚨 BOOKING VALIDATION FAILED 🚨

Validation Errors:
status: 🚨 CRITICAL: Invalid booking status

→ Fix: Use valid status ('pending', 'therapist_accepted', etc.)
```

---

## 🔍 DEBUGGING CHECKLIST

- [ ] Booking object provided?
- [ ] All required fields present?
- [ ] Data types correct? (number vs string)
- [ ] Status is valid enum value?
- [ ] Countdown timer initialized?
- [ ] Console shows validation errors?

---

## 📞 QUICK FIXES

### "Chat won't open"
```typescript
// Check booking object
console.log('Booking:', booking);

// Validate manually
import { BookingChatLockIn } from '../lib/validation/bookingChatLockIn';
BookingChatLockIn.validateBookingData(booking);
```

### "Timer not showing"
```typescript
// Add responseDeadline
const booking = {
  ...otherFields,
  responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
};
```

### "Validation failing"
```typescript
// Check all required fields
const requiredFields = [
  'id', 'status', 'serviceType', 
  'duration', 'customerName', 
  'totalPrice', 'bookingType'
];

requiredFields.forEach(field => {
  if (!booking[field]) console.error(`Missing: ${field}`);
});
```

---

## 🎯 KEY FILES

```
lib/validation/bookingChatLockIn.ts        - Validation system
components/PersistentChatWindow.tsx        - Integration point
modules/chat/BookingWelcomeBanner.tsx      - Display component
BOOKING_CHAT_LOCK_IN.md                    - Full documentation
```

---

## 💡 REMEMBER

```
╔════════════════════════════════════════╗
║  IF IN DOUBT, CHECK THE VALIDATION!   ║
║                                        ║
║  1. Import BookingChatLockIn           ║
║  2. Run validateBookingData()          ║
║  3. Fix reported errors                ║
║  4. Retry                              ║
╚════════════════════════════════════════╝
```

---

*Keep this card visible while working on booking-related code!*