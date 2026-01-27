# 🔒 LOCAL-FIRST ARCHITECTURE DOCUMENTATION

## Overview

This document describes the **local-first architecture** for the chat window and booking system. All user interactions write to localStorage first, and backend sync happens separately via a sync service.

---

## Architecture Principles

### 1. **Zero Runtime Errors from Backend**
- Chat window never calls Appwrite directly during user interaction
- All data writes go to localStorage first
- Backend sync happens asynchronously

### 2. **Local-First Data Flow**
```
User Action → localStorage (instant) → UI Update (instant) → Backend Sync (async)
```

### 3. **Backend Sync Triggers**
- ✅ Booking confirmation (user clicks "Confirm Booking")
- ✅ Auto-save every 30-60 seconds
- ✅ Window/tab close event
- ✅ Manual sync trigger

### 4. **Upsert Behavior**
- Sync service checks if data exists in Appwrite before creating
- Prevents duplicate bookings and messages
- Uses `localId` field to track localStorage → Appwrite mapping

### 5. **Commission Calculation**
- 🎨 **Frontend**: Displays preview calculation (30%)
- 🔒 **Backend**: Performs authoritative calculation during sync
- ⚠️ **CRITICAL**: Only backend commission values are used for payment

---

## System Components

### 📦 Core Services

#### 1. `localStorageManager.ts`
```typescript
// Type-safe localStorage operations
localStorageManager.set('key', data)
localStorageManager.get('key')
localStorageManager.remove('key')
```

#### 2. `chatLocalStorage.ts`
```typescript
// Chat message management
chatLocalStorage.addMessage(message)
chatLocalStorage.getMessages()
chatLocalStorage.getUnsyncedMessages()
chatLocalStorage.markMessageSynced(id)
```

#### 3. `bookingLocalStorage.ts`
```typescript
// Booking draft management
bookingLocalStorage.upsertDraft(draft)
bookingLocalStorage.getActiveDraft()
bookingLocalStorage.validateDraft(draft)
bookingLocalStorage.confirmDraft(id)
```

#### 4. `backendSyncService.ts`
```typescript
// Backend synchronization
backendSyncService.syncAll()
backendSyncService.startAutoSync(45) // seconds
backendSyncService.setupSyncOnClose()
```

### 🎣 React Hooks

#### `useAutoSave.ts`
```typescript
// Automatic data syncing
const { triggerSync, getSyncStatus } = useAutoSave({
  enabled: true,
  interval: 45,
  syncOnUnmount: true,
  syncOnWindowClose: true
});
```

### 🔧 Helper Functions

#### `localFirstHelpers.ts`
```typescript
// Reusable chat & booking functions
addChatMessage(params)
updateBookingDraft(updates)
confirmBooking()
isBookingReadyToConfirm()
```

---

## Flow Diagrams

### 🔄 Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SENDS MESSAGE                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. addChatMessage()                                         │
│     └─> chatLocalStorage.addMessage()                       │
│         └─> Save to localStorage (INSTANT)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. UI Update                                                │
│     └─> loadMessages() from localStorage                    │
│         └─> Display message immediately (NO BACKEND CALL)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Background Sync (Auto-save)                              │
│     └─> backendSyncService.syncAll() [45s interval]         │
│         ├─> Get unsynced messages                           │
│         ├─> Check if exists in Appwrite (upsert)            │
│         ├─> Create in Appwrite if not exists                │
│         └─> Mark as synced in localStorage                  │
└─────────────────────────────────────────────────────────────┘
```

### 📦 Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│             USER SELECTS DURATION (60/90/120 min)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. updateBookingDraft({ duration: 60 })                    │
│     └─> bookingLocalStorage.upsertDraft()                   │
│         ├─> Save to localStorage                            │
│         ├─> Validate immediately                            │
│         └─> Return validation status                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. UI Update                                                │
│     └─> setBookingDraft(draft)                              │
│         └─> Update button states (NO BACKEND CALL)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. USER ENTERS NAME & PHONE                                 │
│     └─> updateBookingDraft({ customerName, customerPhone }) │
│         └─> Save to localStorage & validate                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. USER CLICKS "CONFIRM BOOKING"                            │
│     └─> confirmBooking()                                     │
│         ├─> Validate booking draft                          │
│         ├─> Move to confirmed bookings in localStorage      │
│         └─> **TRIGGER BACKEND SYNC** ← ONLY BACKEND CALL    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend Sync (ONE-TIME on confirmation)                  │
│     └─> backendSyncService.syncBookings()                   │
│         ├─> Validate booking data                           │
│         ├─> Check if exists (upsert - prevent duplicate)    │
│         ├─> Calculate 30% commission (AUTHORITATIVE)        │
│         ├─> Create booking in Appwrite                      │
│         └─> Mark as synced                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Success Feedback                                         │
│     └─> Display booking ID to user                          │
│         └─> Clear booking draft from localStorage           │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Auto-Save Flow

```
┌─────────────────────────────────────────────────────────────┐
│               EVERY 45 SECONDS (Auto-save timer)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  useAutoSave Hook Triggers                                   │
│  └─> backendSyncService.syncAll()                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Sync Messages                                               │
│  ├─> Get unsynced messages from chatLocalStorage            │
│  ├─> For each message:                                      │
│  │   ├─> Check if exists in Appwrite (upsert)              │
│  │   ├─> Create if not exists                              │
│  │   └─> Mark as synced                                    │
│  └─> Continue on error (queue for retry)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Sync Bookings                                               │
│  ├─> Get unsynced bookings from bookingLocalStorage         │
│  ├─> For each booking:                                      │
│  │   ├─> Validate data                                     │
│  │   ├─> Check if exists in Appwrite (upsert)              │
│  │   ├─> Calculate 30% commission (backend)                │
│  │   ├─> Create if not exists                              │
│  │   └─> Mark as synced                                    │
│  └─> Queue failed items for retry                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Update Sync Status                                          │
│  └─> Update lastSyncTimestamp                               │
│      └─> Update UI indicators (synced/unsynced count)       │
└─────────────────────────────────────────────────────────────┘
```

### 👋 Window Close Flow

```
┌─────────────────────────────────────────────────────────────┐
│             USER CLOSES TAB/WINDOW (beforeunload)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Check for Unsynced Data                                     │
│  ├─> chatLocalStorage.getUnsyncedMessages()                 │
│  └─> bookingLocalStorage.getUnsyncedBookings()              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────┴────────┐
                   │                 │
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Has Unsynced    │  │  All Synced      │
        │  Data            │  │                  │
        └──────────────────┘  └──────────────────┘
                   │                 │
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Show Warning    │  │  Allow Close     │
        │  Dialog          │  │                  │
        └──────────────────┘  └──────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  User Chooses:           │
        │  ├─> Stay & Save         │
        │  │   └─> Trigger sync    │
        │  └─> Leave Anyway        │
        │      └─> Data lost       │
        └──────────────────────────┘
```

---

## Data Structures

### ChatMessage
```typescript
{
  id: string                    // Local ID (generated by frontend)
  chatRoomId: string           // Chat room identifier
  senderId: string             // User/therapist ID
  senderType: 'user' | 'therapist' | 'system'
  senderName: string
  message: string
  messageType: 'text' | 'system' | ...
  timestamp: number            // Local timestamp
  createdAt: string            // ISO string
  isRead: boolean
  synced: boolean              // Sync status flag
  metadata?: { ... }
}
```

### BookingDraft
```typescript
{
  id: string                    // Local draft ID
  chatRoomId: string
  therapistId: string
  therapistName: string
  customerId: string
  customerName: string
  customerPhone: string
  
  duration: number              // 60, 90, 120
  serviceType: string
  locationZone: string
  bookingType: 'immediate' | 'scheduled'
  
  totalPrice: number            // Full price
  adminCommission?: number      // Calculated by backend (30%)
  providerPayout?: number       // Calculated by backend (70%)
  
  status: 'draft' | 'confirmed' | 'cancelled'
  synced: boolean               // Sync status flag
  
  isValid: boolean              // Validation status
  validationErrors: string[]    // Validation error messages
  
  createdAt: string
  updatedAt: string
  confirmedAt?: string
}
```

---

## Usage Examples

### 1. Initialize Chat Window

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

### 2. Send Message

```typescript
import { addChatMessage } from './utils/localFirstHelpers';

// User sends message (no backend call)
await addChatMessage({
  chatRoomId: 'chat_user456_therapist123',
  senderId: 'user_456',
  senderType: 'user',
  senderName: 'John Doe',
  message: 'Hello, I would like to book a massage'
});

// Message is saved to localStorage instantly
// UI updates immediately
// Sync happens in background via auto-save
```

### 3. Update Booking Draft

```typescript
import { updateBookingDraft } from './utils/localFirstHelpers';

// User selects duration (no backend call)
updateBookingDraft({
  duration: 60,
  totalPrice: 450000,
  serviceType: '60 minute massage'
});

// Draft is saved to localStorage instantly
// Validation runs immediately
// Button states update based on validation
// NO backend call until confirmation
```

### 4. Confirm Booking

```typescript
import { confirmBooking } from './utils/localFirstHelpers';

// User clicks "Confirm Booking" (ONLY backend call)
const result = await confirmBooking();

if (result.success) {
  console.log('Booking created:', result.bookingId);
  // Backend calculated 30% commission
  // Booking saved to Appwrite
} else {
  console.error('Failed:', result.error);
}
```

### 5. Manual Sync Trigger

```typescript
import { backendSyncService } from './services/localStorage/backendSyncService';

// Manually trigger sync
const result = await backendSyncService.syncAll({ force: true });

console.log('Synced:', result.syncedCount);
console.log('Failed:', result.failedCount);
console.log('Errors:', result.errors);
```

---

## Commission Calculation

### ⚠️ CRITICAL: Two-Phase Calculation

#### Phase 1: Frontend (Preview)
```typescript
// UI display only - NOT authoritative
const preview = calculateCommissionPreview(450000);
// {
//   totalPrice: 450000,
//   adminCommission: 135000,    // 30% - PREVIEW ONLY
//   providerPayout: 315000,     // 70% - PREVIEW ONLY
//   commissionRate: 0.3
// }
```

#### Phase 2: Backend (Authoritative)
```typescript
// During sync in backendSyncService.ts
const adminCommission = Math.round(booking.totalPrice * 0.3);
const providerPayout = booking.totalPrice - adminCommission;

// Saved to Appwrite booking document
await databases.createDocument(
  APPWRITE_CONFIG.databaseId,
  APPWRITE_CONFIG.collections.bookings,
  ID.unique(),
  {
    price: booking.totalPrice,
    adminCommission,  // ← AUTHORITATIVE VALUE
    providerPayout,   // ← AUTHORITATIVE VALUE
    // ... other fields
  }
);
```

**RULE**: Only backend commission values are used for:
- Payment processing
- Commission reports
- Therapist payouts
- Admin revenue calculation

---

## Error Handling

### Sync Failures

```typescript
// Automatic retry via sync queue
backendSyncService.getSyncQueue(); // Get failed items

// Errors are logged and queued
result.errors.forEach(error => {
  console.error(`${error.type} ${error.id}: ${error.error}`);
  // Item is added to sync queue for next retry
});

// Next auto-save will retry failed items
```

### Validation Errors

```typescript
// Booking validation
const validation = validateBooking(draft);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  // Display errors to user
  // Disable confirm button
  // Show missing fields
}
```

### Network Errors

```typescript
// Offline detection
if (!navigator.onLine) {
  console.log('Offline - data saved locally');
  // Continue working with localStorage
  // Sync will happen when back online
}
```

---

## Testing

### 1. Test Message Flow
```typescript
// 1. Send message
await addChatMessage({ /* params */ });

// 2. Verify in localStorage
const messages = getChatMessages(chatRoomId);
expect(messages.length).toBe(1);
expect(messages[0].synced).toBe(false);

// 3. Trigger sync
await backendSyncService.syncAll();

// 4. Verify sync status
expect(messages[0].synced).toBe(true);
```

### 2. Test Booking Flow
```typescript
// 1. Create draft
updateBookingDraft({ duration: 60 });

// 2. Verify validation
const draft = getBookingDraft();
expect(draft.isValid).toBe(false); // Missing customer info

// 3. Complete draft
updateBookingDraft({ 
  customerName: 'John',
  customerPhone: '+6281234567890'
});

// 4. Verify validation
expect(draft.isValid).toBe(true);

// 5. Confirm
const result = await confirmBooking();
expect(result.success).toBe(true);
```

### 3. Test Auto-Save
```typescript
// 1. Enable auto-save with short interval
useAutoSave({ enabled: true, interval: 5 }); // 5 seconds

// 2. Add unsynced data
await addChatMessage({ /* params */ });

// 3. Wait for auto-save
await new Promise(resolve => setTimeout(resolve, 6000));

// 4. Verify sync
const status = backendSyncService.getSyncStatus();
expect(status.unsyncedMessages).toBe(0);
```

---

## Benefits

### ✅ Zero Runtime Errors
- No Appwrite errors during user interaction
- Backend errors only appear during sync (async)
- User never blocked by backend issues

### ✅ Instant UI Updates
- localStorage operations are synchronous
- No loading spinners for basic interactions
- Responsive user experience

### ✅ Data Integrity
- Backend performs authoritative commission calculation
- Upsert behavior prevents duplicates
- Validation before sync

### ✅ Offline Support
- Work offline, sync when back online
- Data preserved in localStorage
- No data loss from network issues

### ✅ Auto-Save
- Periodic sync (45 seconds)
- Sync on window close
- Manual sync trigger available

---

## Maintenance

### Adding New Fields

```typescript
// 1. Add to BookingDraft interface
export interface BookingDraft {
  // ... existing fields
  newField?: string;  // ← Add here
}

// 2. Update validation if required
validateDraft(draft) {
  // ... existing validation
  if (required && !draft.newField) {
    errors.push('New field is required');
  }
}

// 3. Update sync service if needed
async syncBookings() {
  // ... existing sync
  await databases.createDocument(/* ... */, {
    // ... existing fields
    newField: booking.newField  // ← Add here
  });
}
```

### Changing Sync Interval

```typescript
// In useAutoSave call
useAutoSave({
  enabled: true,
  interval: 60  // ← Change from 45 to 60 seconds
});

// Or programmatically
backendSyncService.startAutoSync(60);
```

---

## Migration Path

### From Current Implementation

```typescript
// Old way (direct backend calls)
const result = await databases.createDocument(/* ... */);

// New way (localStorage first)
updateBookingDraft({ /* data */ });
// ... user interaction ...
await confirmBooking(); // Only backend call
```

### Testing Both Approaches

```typescript
// Feature flag for gradual rollout
const USE_LOCAL_FIRST = true;

if (USE_LOCAL_FIRST) {
  updateBookingDraft(data);
} else {
  await databases.createDocument(data);
}
```

---

## Contact

For questions or issues:
- Email: indastreet.id@gmail.com
- Documentation: This file
- Source code: `src/services/localStorage/`

---

## Version History

- **v1.0** (2026-01-28): Initial local-first implementation
  - localStorage manager
  - Chat localStorage service
  - Booking localStorage service
  - Backend sync service
  - Auto-save hook
  - Example implementations
  - Comprehensive documentation
