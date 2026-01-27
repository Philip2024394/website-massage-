# 🔒 Local-First Architecture - Quick Reference

## 📦 What Was Built

A complete **local-first architecture** for chat and booking systems with zero runtime errors from backend calls.

### Core Components

```
src/
├── services/
│   ├── localStorage/
│   │   ├── localStorageManager.ts      # Type-safe localStorage operations
│   │   ├── chatLocalStorage.ts         # Chat message management
│   │   ├── bookingLocalStorage.ts      # Booking draft management
│   │   └── backendSyncService.ts       # Appwrite sync service
│   └── localFirst.ts                   # Export index
├── hooks/
│   └── useAutoSave.ts                  # Auto-save hook (45s interval)
├── utils/
│   └── localFirstHelpers.ts            # Reusable helper functions
└── components/
    └── examples/
        └── LocalFirstChatWindow.tsx    # Example implementation
```

---

## 🚀 Quick Start

### 1. Import Services

```typescript
import { 
  useAutoSave,
  addChatMessage,
  updateBookingDraft,
  confirmBooking,
  backendSyncService 
} from '@/services/localFirst';
```

### 2. Enable Auto-Save

```typescript
function ChatWindow() {
  // Auto-save every 45 seconds + sync on close
  useAutoSave({
    enabled: true,
    interval: 45,
    syncOnUnmount: true,
    syncOnWindowClose: true
  });
  
  // ... rest of component
}
```

### 3. Add Messages (No Backend Call)

```typescript
// User sends message
await addChatMessage({
  chatRoomId: 'chat_123',
  senderId: 'user_456',
  senderType: 'user',
  senderName: 'John',
  message: 'Hello!'
});

// ✅ Saved to localStorage instantly
// ✅ UI updates immediately
// ✅ Syncs in background automatically
```

### 4. Update Booking (No Backend Call)

```typescript
// User selects duration
updateBookingDraft({
  duration: 60,
  totalPrice: 450000,
  customerName: 'John Doe',
  customerPhone: '+6281234567890'
});

// ✅ Saved to localStorage instantly
// ✅ Validated automatically
// ✅ Button states update
// ⚠️ NO BACKEND CALL YET
```

### 5. Confirm Booking (ONLY Backend Call)

```typescript
// User clicks "Confirm Booking"
const result = await confirmBooking();

if (result.success) {
  console.log('✅ Booking created:', result.bookingId);
  // Backend calculated 30% commission
} else {
  console.error('❌ Failed:', result.error);
}

// ✅ This is the ONLY backend call
// ✅ Commission calculated by backend (authoritative)
```

---

## 🔄 Data Flow

```
┌──────────────────────────────────────────────────┐
│  1. User Action (type message, select duration)  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  2. Write to localStorage (INSTANT)              │
│     - chatLocalStorage.addMessage()              │
│     - bookingLocalStorage.upsertDraft()          │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  3. Update UI (INSTANT)                          │
│     - Display message immediately                │
│     - Update button states                       │
│     - Show validation errors                     │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  4. Background Sync (ASYNC)                      │
│     ├─ Auto-save (every 45 seconds)              │
│     ├─ On booking confirmation                   │
│     └─ On window close                           │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│  5. Appwrite Backend                             │
│     ├─ Upsert check (prevent duplicates)         │
│     ├─ Commission calculation (30% - authoritative) │
│     └─ Data persistence                          │
└──────────────────────────────────────────────────┘
```

---

## 💡 Key Features

### ✅ Zero Runtime Errors
- **No Appwrite calls during user interaction**
- Backend errors only appear during async sync
- User never blocked by backend issues

### ✅ Instant UI Updates
- localStorage operations are synchronous
- No loading spinners for messages/drafts
- Buttons reflect real-time validation state

### ✅ Auto-Save
- Periodic sync every **30-60 seconds** (configurable)
- Sync on **window/tab close**
- Sync on **component unmount**

### ✅ Upsert Behavior
- Checks if data exists in Appwrite before creating
- Prevents duplicate bookings/messages
- Uses `localId` to track localStorage → Appwrite mapping

### ✅ Commission Integrity
```typescript
// Frontend: Preview only
const preview = calculateCommissionPreview(450000);
// { adminCommission: 135000, providerPayout: 315000 }

// Backend: Authoritative (during sync)
const adminCommission = Math.round(totalPrice * 0.3); // 135000
const providerPayout = totalPrice - adminCommission;  // 315000
// ⚠️ ONLY backend values used for payments
```

---

## 📝 Example Implementation

See full example: `src/components/examples/LocalFirstChatWindow.tsx`

```typescript
import { LocalFirstChatWindow } from './components/examples/LocalFirstChatWindow';

function App() {
  return (
    <LocalFirstChatWindow
      therapistId="therapist_123"
      therapistName="Sriyani"
      customerId="user_456"
      customerName="John Doe"
      onClose={() => console.log('Chat closed')}
    />
  );
}
```

---

## 🛠️ Helper Functions

### Message Operations

```typescript
// Add message (localStorage only)
await addChatMessage({
  chatRoomId: string,
  senderId: string,
  senderType: 'user' | 'therapist' | 'system',
  senderName: string,
  message: string
});

// Get messages
const messages = getChatMessages(chatRoomId);

// Add system notification
await addSystemNotification({
  chatRoomId: string,
  message: string
});
```

### Booking Operations

```typescript
// Update draft (localStorage only)
const draft = updateBookingDraft({
  duration?: number,
  customerName?: string,
  customerPhone?: string,
  totalPrice?: number
});

// Get active draft
const draft = getBookingDraft();

// Update single field
updateBookingField('customerName', 'John Doe');

// Validate
const { isValid, errors } = validateBooking();

// Get missing fields
const missing = getMissingFields(); // ['customerPhone', ...]

// Confirm (triggers backend sync)
const result = await confirmBooking();
```

### Session Management

```typescript
// Initialize session
initializeChatSession({
  chatRoomId: string,
  therapistId: string,
  therapistName: string,
  customerId: string,
  customerName: string
});

// End session (triggers final sync)
await endChatSession();
```

### UI Helpers

```typescript
// Check if ready to confirm
const ready = isBookingReadyToConfirm(); // boolean

// Get button state
const { enabled, label, missingFields } = getBookingButtonState();
// enabled: true/false
// label: "Confirm Booking" or "Missing: phone, name"

// Get sync status
const { isSyncing, unsyncedCount, lastSync, needsSync } = getSyncStatusUI();
```

---

## 🔧 Configuration

### Change Auto-Save Interval

```typescript
useAutoSave({
  enabled: true,
  interval: 60  // Change to 60 seconds
});
```

### Manual Sync Trigger

```typescript
// Force sync now
const result = await backendSyncService.syncAll({ force: true });

console.log('Synced:', result.syncedCount);
console.log('Failed:', result.failedCount);
console.log('Errors:', result.errors);
```

### Get Sync Statistics

```typescript
const status = backendSyncService.getSyncStatus();
// {
//   isSyncing: boolean,
//   unsyncedMessages: number,
//   unsyncedBookings: number,
//   queueLength: number,
//   lastSync: string | null,
//   needsSync: boolean
// }
```

---

## 📊 Flow Diagrams

### Message Flow

```
User Types Message
      ↓
localStorage.addMessage() [instant]
      ↓
UI Update [instant]
      ↓
Auto-save (45s later) [async]
      ↓
Appwrite Sync [async]
      ↓
Mark as Synced
```

### Booking Flow

```
User Selects Duration
      ↓
localStorage.upsertDraft() [instant]
      ↓
Validate [instant]
      ↓
UI Button Update [instant]
      ↓
User Enters Info
      ↓
localStorage.upsertDraft() [instant]
      ↓
User Clicks "Confirm"
      ↓
confirmBooking() [triggers sync]
      ↓
Appwrite Backend
  ├─ Upsert Check
  ├─ 30% Commission (authoritative)
  └─ Save Booking
      ↓
Success/Failure Feedback
```

---

## ⚠️ Critical Rules

### 1. NO Direct Backend Calls in Chat Window
```typescript
// ❌ WRONG - Direct backend call
await databases.createDocument(/* ... */);

// ✅ CORRECT - localStorage first
await addChatMessage(/* ... */);
// Sync happens automatically
```

### 2. Commission Calculation ONLY on Backend
```typescript
// ❌ WRONG - Using frontend calculation for payment
const commission = totalPrice * 0.3;
processPayment(commission);

// ✅ CORRECT - Backend calculates during sync
await confirmBooking();
// Backend stores authoritative commission
```

### 3. Validate Before Confirming
```typescript
// ✅ CORRECT - Always validate
const { isValid, errors } = validateBooking();
if (isValid) {
  await confirmBooking();
} else {
  console.error('Validation errors:', errors);
}
```

---

## 🧪 Testing

### Test Message Flow
```typescript
// 1. Add message
await addChatMessage({ /* ... */ });

// 2. Check localStorage
const messages = getChatMessages(chatRoomId);
expect(messages.length).toBe(1);

// 3. Trigger sync
await backendSyncService.syncAll();

// 4. Verify synced
const syncStatus = backendSyncService.getSyncStatus();
expect(syncStatus.unsyncedMessages).toBe(0);
```

### Test Booking Flow
```typescript
// 1. Create draft
updateBookingDraft({ duration: 60 });

// 2. Verify validation fails (missing info)
const draft1 = getBookingDraft();
expect(draft1.isValid).toBe(false);

// 3. Complete draft
updateBookingDraft({ 
  customerName: 'John',
  customerPhone: '+6281234567890'
});

// 4. Verify validation passes
const draft2 = getBookingDraft();
expect(draft2.isValid).toBe(true);

// 5. Confirm
const result = await confirmBooking();
expect(result.success).toBe(true);
```

---

## 📖 Full Documentation

See comprehensive documentation: `docs/LOCAL_FIRST_ARCHITECTURE.md`

Includes:
- Architecture principles
- Complete flow diagrams
- Data structures
- Error handling
- Migration guide
- Maintenance guide

---

## 🎯 Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Runtime Errors** | Frequent Appwrite errors | Zero errors during interaction |
| **UI Responsiveness** | Loading spinners everywhere | Instant feedback |
| **Offline Support** | None | Full offline support |
| **Data Loss** | Possible on network issues | Zero data loss |
| **Auto-Save** | Manual save only | Auto-save every 45s |
| **Commission** | Frontend calculation | Backend authoritative |
| **Duplicates** | Possible | Prevented via upsert |
| **User Experience** | Laggy | Smooth and responsive |

---

## 📞 Support

- **Documentation**: `docs/LOCAL_FIRST_ARCHITECTURE.md`
- **Example**: `src/components/examples/LocalFirstChatWindow.tsx`
- **Services**: `src/services/localStorage/`
- **Helpers**: `src/utils/localFirstHelpers.ts`

---

## ✅ Checklist for Integration

- [ ] Import services from `@/services/localFirst`
- [ ] Add `useAutoSave` hook to chat window component
- [ ] Replace direct Appwrite calls with `addChatMessage()`
- [ ] Replace booking creation with `updateBookingDraft()`
- [ ] Use `confirmBooking()` for final booking submission
- [ ] Display sync status in UI
- [ ] Test offline functionality
- [ ] Verify commission calculation on backend
- [ ] Test auto-save behavior
- [ ] Test window close behavior

---

**Version**: 1.0  
**Date**: 2026-01-28  
**Author**: Expert Full-Stack Developer
