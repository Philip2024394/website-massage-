# 🔄 LOCAL-FIRST ARCHITECTURE - VISUAL FLOW DIAGRAMS

## 1. Complete System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     USER INTERFACE                          ┃
┃  (Chat Window + Booking Form + Buttons)                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                            │
                            │ User Actions
                            │ (type, click, select)
                            │
                            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              LOCAL-FIRST HELPER FUNCTIONS                   ┃
┃  ┌─────────────────────┐  ┌─────────────────────┐         ┃
┃  │  addChatMessage()   │  │  updateBookingDraft()│         ┃
┃  │  getChatMessages()  │  │  confirmBooking()    │         ┃
┃  │  initializeSession()│  │  validateBooking()   │         ┃
┃  └─────────────────────┘  └─────────────────────┘         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                            │
                            │ < 10ms
                            │ (INSTANT)
                            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   LOCALSTORAGE LAYER                        ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │  chatLocalStorage                                  │   ┃
┃  │  - messages: ChatMessage[]                         │   ┃
┃  │  - session: ChatSession                            │   ┃
┃  │  - synced status: boolean                          │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │  bookingLocalStorage                               │   ┃
┃  │  - drafts: BookingDraft[]                          │   ┃
┃  │  - activeDraft: BookingDraft                       │   ┃
┃  │  - confirmedBookings: BookingDraft[]               │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                            │
                            │ Immediate UI Update
                            │
                            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 UI RE-RENDERS (INSTANT)                     ┃
┃  - Display new message                                      ┃
┃  - Update button states                                     ┃
┃  - Show validation errors                                   ┃
┃  - Enable/disable confirm button                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                            │
                            │ Background (Async)
                            │
                            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              BACKGROUND SYNC SERVICE                        ┃
┃                                                              ┃
┃  Triggers:                                                   ┃
┃  ├─ ⏰ Auto-save (every 45 seconds)                         ┃
┃  ├─ ✅ On booking confirmation                              ┃
┃  ├─ 👋 On window/tab close                                  ┃
┃  └─ 🔧 Manual trigger                                       ┃
┃                                                              ┃
┃  Process:                                                    ┃
┃  ├─ Get unsynced messages                                   ┃
┃  ├─ Get unsynced bookings                                   ┃
┃  ├─ Check if exists (upsert)                                ┃
┃  ├─ Sync to Appwrite                                        ┃
┃  └─ Mark as synced                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                            │
                            │ Network Call
                            │ (ASYNC)
                            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   APPWRITE BACKEND                          ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │  Collections:                                      │   ┃
┃  │  - chat_messages                                   │   ┃
┃  │  - bookings                                        │   ┃
┃  │  - commissions                                     │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┃  ┌────────────────────────────────────────────────────┐   ┃
┃  │  Operations:                                       │   ┃
┃  │  ✅ Upsert check (prevent duplicates)             │   ┃
┃  │  💰 Calculate 30% commission (AUTHORITATIVE)      │   ┃
┃  │  📊 Store booking with commission                 │   ┃
┃  │  🔐 Data integrity validation                     │   ┃
┃  └────────────────────────────────────────────────────┘   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 2. Message Flow Diagram

```
USER TYPES MESSAGE
        │
        │ (1) User presses Enter
        ▼
┌───────────────────────┐
│  sendMessage()        │
│  Handler triggered    │
└───────┬───────────────┘
        │
        │ (2) Call helper
        ▼
┌───────────────────────┐
│  addChatMessage()     │
│  ├─ chatRoomId        │
│  ├─ senderId          │
│  ├─ message text      │
│  └─ timestamp         │
└───────┬───────────────┘
        │
        │ (3) Write to localStorage
        │     Time: < 10ms
        ▼
┌───────────────────────┐
│ chatLocalStorage      │
│  .addMessage()        │
│  ├─ Generate ID       │
│  ├─ Set synced=false  │
│  ├─ Save to array     │
│  └─ Update session    │
└───────┬───────────────┘
        │
        │ (4) Return message object
        ▼
┌───────────────────────┐
│  loadMessages()       │
│  from localStorage    │
│  Time: < 10ms         │
└───────┬───────────────┘
        │
        │ (5) Update UI
        ▼
┌───────────────────────┐
│  UI RE-RENDERS        │
│  ✅ Message visible   │
│  ✅ Scroll to bottom  │
│  ✅ Clear input       │
│  ⏱️  NO LOADING        │
└───────┬───────────────┘
        │
        │ (6) Background (45s later)
        ▼
┌───────────────────────┐
│  useAutoSave Hook     │
│  triggers sync        │
└───────┬───────────────┘
        │
        │ (7) Async sync
        ▼
┌───────────────────────┐
│  backendSyncService   │
│  .syncMessages()      │
│  ├─ Get unsynced      │
│  ├─ Check if exists   │
│  ├─ Create in Appwrite│
│  └─ Mark synced       │
└───────┬───────────────┘
        │
        │ (8) Network call
        ▼
┌───────────────────────┐
│  APPWRITE             │
│  chat_messages        │
│  Document created     │
└───────────────────────┘
```

**Total Time for User**: **< 10ms** (steps 1-5)  
**Backend Sync**: **Async** (doesn't block user)

---

## 3. Booking Flow Diagram

```
USER SELECTS DURATION (60 min)
        │
        ▼
┌─────────────────────────────┐
│  handleDurationSelect(60)   │
└────────┬────────────────────┘
         │
         │ (1) Call helper
         ▼
┌─────────────────────────────┐
│  updateBookingDraft({       │
│    duration: 60,            │
│    totalPrice: 450000,      │
│    serviceType: "60 min"    │
│  })                         │
└────────┬────────────────────┘
         │
         │ (2) Upsert to localStorage
         │     Time: < 10ms
         ▼
┌─────────────────────────────┐
│  bookingLocalStorage        │
│  .upsertDraft()             │
│  ├─ Merge with existing     │
│  ├─ Validate immediately    │
│  ├─ Update timestamps       │
│  └─ Return draft            │
└────────┬────────────────────┘
         │
         │ (3) Validation runs
         ▼
┌─────────────────────────────┐
│  validateDraft()            │
│  ├─ Check customer name     │
│  ├─ Check phone number      │
│  ├─ Check duration          │
│  └─ Return { isValid, ... } │
└────────┬────────────────────┘
         │
         │ (4) Update UI
         ▼
┌─────────────────────────────┐
│  UI RE-RENDERS              │
│  ✅ Duration button active  │
│  ⚠️  Confirm button disabled│
│  ℹ️  Show "Missing: name"  │
│  ⏱️  NO BACKEND CALL        │
└────────┬────────────────────┘
         │
         │ USER ENTERS NAME & PHONE
         ▼
┌─────────────────────────────┐
│  updateBookingDraft({       │
│    customerName: "John",    │
│    customerPhone: "+628..." │
│  })                         │
└────────┬────────────────────┘
         │
         │ (5) Save + validate again
         │     Time: < 10ms
         ▼
┌─────────────────────────────┐
│  bookingLocalStorage        │
│  .upsertDraft()             │
│  ├─ Validation passes ✅    │
│  ├─ isValid = true          │
│  └─ validationErrors = []   │
└────────┬────────────────────┘
         │
         │ (6) Update UI
         ▼
┌─────────────────────────────┐
│  UI RE-RENDERS              │
│  ✅ Confirm button ENABLED  │
│  💚 Green, ready to click   │
│  ⏱️  NO BACKEND CALL        │
└────────┬────────────────────┘
         │
         │ USER CLICKS "CONFIRM BOOKING"
         ▼
┌─────────────────────────────┐
│  handleConfirmBooking()     │
└────────┬────────────────────┘
         │
         │ (7) Call helper
         ▼
┌─────────────────────────────┐
│  confirmBooking()           │
│  ├─ Get active draft        │
│  ├─ Validate one more time  │
│  └─ Move to confirmed       │
└────────┬────────────────────┘
         │
         │ (8) TRIGGER BACKEND SYNC
         │     ⚠️ ONLY BACKEND CALL
         ▼
┌─────────────────────────────┐
│  backendSyncService         │
│  .syncBookings()            │
│  ├─ Get unsynced bookings   │
│  ├─ Check if exists (upsert)│
│  ├─ Calculate 30% commission│
│  ├─ Create in Appwrite      │
│  └─ Mark synced             │
└────────┬────────────────────┘
         │
         │ (9) Network call
         ▼
┌─────────────────────────────┐
│  APPWRITE BACKEND           │
│  bookings collection        │
│  ┌─────────────────────┐   │
│  │ Document Created:   │   │
│  │ - bookingId         │   │
│  │ - totalPrice: 450000│   │
│  │ - adminCommission:  │   │
│  │   135000 (30%) ✅   │   │
│  │ - providerPayout:   │   │
│  │   315000 (70%) ✅   │   │
│  └─────────────────────┘   │
└────────┬────────────────────┘
         │
         │ (10) Return success
         ▼
┌─────────────────────────────┐
│  UI UPDATE                  │
│  ✅ Show success message    │
│  ✅ Display booking ID      │
│  ✅ Clear booking draft     │
└─────────────────────────────┘
```

**Time to Confirmation**: **< 10ms** per interaction  
**Backend Call**: **ONLY** on final confirmation  
**Commission**: **BACKEND CALCULATED** (authoritative)

---

## 4. Auto-Save Flow Diagram

```
┌─────────────────────────────────────────┐
│  TIMER EVERY 45 SECONDS                 │
│  (useAutoSave hook)                     │
└────────────┬────────────────────────────┘
             │
             │ Tick... tick... tick...
             ▼
┌─────────────────────────────────────────┐
│  performSync() triggered                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  backendSyncService.syncAll()           │
└────────────┬────────────────────────────┘
             │
             ├─────────────────┐
             │                 │
             ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  syncMessages()  │  │  syncBookings()  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │ (1) Get unsynced    │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ chatLocalStorage │  │bookingLocalStorage│
│ .getUnsynced()   │  │ .getUnsynced()   │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │ (2) For each item   │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Check if exists  │  │ Validate data    │
│ in Appwrite      │  │ Check required   │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │ (3) Upsert          │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Create if new    │  │ Calculate 30%    │
│ Skip if exists   │  │ Create booking   │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │ (4) Mark synced     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ .markSynced(id)  │  │ .markSynced(id)  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Update lastSyncTimestamp               │
│  Update UI sync indicators              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  WAIT 45 SECONDS...                     │
│  Repeat cycle                           │
└─────────────────────────────────────────┘
```

**Frequency**: Every 45 seconds  
**User Impact**: Zero (runs in background)  
**Failures**: Queued for retry in next cycle

---

## 5. Window Close Flow Diagram

```
USER CLICKS CLOSE TAB/WINDOW
        │
        ▼
┌─────────────────────────────────┐
│  beforeunload event triggered   │
└────────┬────────────────────────┘
         │
         │ (1) Check unsynced data
         ▼
┌─────────────────────────────────┐
│  getSyncStatus()                │
│  ├─ unsyncedMessages: 3         │
│  ├─ unsyncedBookings: 1         │
│  └─ needsSync: true             │
└────────┬────────────────────────┘
         │
         │ (2) Decision point
         ▼
    ┌────┴────┐
    │ Has     │
    │Unsynced?│
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│ YES │   │ NO  │
└──┬──┘   └──┬──┘
   │         │
   │         │ (3a) Allow close
   │         ▼
   │    ┌─────────────┐
   │    │ Close tab   │
   │    └─────────────┘
   │
   │ (3b) Show warning
   ▼
┌────────────────────────────────┐
│  BROWSER WARNING DIALOG        │
│  ⚠️  "You have unsaved changes"│
│  "Are you sure you want        │
│   to leave?"                   │
│                                │
│  [Leave] [Stay]                │
└────────┬───────────────────────┘
         │
    ┌────┴────┐
    │ User    │
    │ Choice  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌─────┐
│ STAY │  │LEAVE│
└───┬──┘  └──┬──┘
    │        │
    │        │ (4a) Data lost
    │        ▼
    │   ┌─────────────┐
    │   │ Close tab   │
    │   └─────────────┘
    │
    │ (4b) Trigger sync
    ▼
┌────────────────────────────────┐
│  backendSyncService            │
│  .syncAll({ force: true })     │
│  ├─ Sync messages              │
│  ├─ Sync bookings              │
│  └─ Wait for completion        │
└────────┬───────────────────────┘
         │
         │ (5) After sync completes
         ▼
┌────────────────────────────────┐
│  ✅ Data saved                 │
│  ✅ Tab can close safely       │
└────────────────────────────────┘
```

**Protection**: Warns on unsynced data  
**User Choice**: Stay to save, or leave (data lost)  
**Best Effort**: Tries to sync on leave

---

## 6. Commission Calculation Flow

```
┌─────────────────────────────────────────┐
│  FRONTEND (Preview Only)                │
└────────────┬────────────────────────────┘
             │
             │ User selects duration
             ▼
┌─────────────────────────────────────────┐
│  calculateCommissionPreview()           │
│  ├─ totalPrice: 450000                  │
│  ├─ adminCommission: 135000 (30%)      │
│  ├─ providerPayout: 315000 (70%)       │
│  └─ ⚠️ FOR DISPLAY ONLY                 │
└────────────┬────────────────────────────┘
             │
             │ Show in UI
             ▼
┌─────────────────────────────────────────┐
│  UI PREVIEW                             │
│  "You'll pay: Rp 450,000"               │
│  "Therapist gets: Rp 315,000"           │
│  "Platform fee: Rp 135,000"             │
│  ⚠️ NOT USED FOR ACTUAL PAYMENT         │
└─────────────────────────────────────────┘
             │
             │ User confirms booking
             ▼
┌─────────────────────────────────────────┐
│  confirmBooking() → Sync to Backend     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  BACKEND (Authoritative)                │
│  backendSyncService.syncBookings()      │
└────────────┬────────────────────────────┘
             │
             │ ⚠️ CRITICAL CALCULATION
             ▼
┌─────────────────────────────────────────┐
│  const adminCommission =                │
│    Math.round(totalPrice * 0.3);        │
│  // = 135000                            │
│                                         │
│  const providerPayout =                 │
│    totalPrice - adminCommission;        │
│  // = 315000                            │
└────────────┬────────────────────────────┘
             │
             │ Save to Appwrite
             ▼
┌─────────────────────────────────────────┐
│  APPWRITE BOOKING DOCUMENT              │
│  {                                      │
│    bookingId: "booking_123",            │
│    totalPrice: 450000,                  │
│    adminCommission: 135000, ✅          │
│    providerPayout: 315000,  ✅          │
│    // ... other fields                 │
│  }                                      │
│  ⚠️ THESE VALUES ARE USED FOR:          │
│  - Payment processing                   │
│  - Commission reports                   │
│  - Therapist payouts                    │
│  - Admin revenue                        │
└─────────────────────────────────────────┘
```

**Frontend**: Preview only (UI display)  
**Backend**: Authoritative (actual payments)  
**Rule**: Never use frontend calculation for payments

---

## 7. Error Handling Flow

```
SYNC OPERATION STARTS
        │
        ▼
┌────────────────────────┐
│  Try to sync item      │
└────────┬───────────────┘
         │
    ┌────┴────┐
    │ Success?│
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐
│ YES  │  │ NO   │
└───┬──┘  └───┬──┘
    │         │
    │         │ (1) Catch error
    │         ▼
    │    ┌──────────────────┐
    │    │ Log error        │
    │    │ console.error()  │
    │    └────┬─────────────┘
    │         │
    │         │ (2) Add to sync queue
    │         ▼
    │    ┌──────────────────┐
    │    │ syncQueue.push({│
    │    │   type: 'message'│
    │    │   id: 'msg_123' │
    │    │ })               │
    │    └────┬─────────────┘
    │         │
    │         │ (3) Continue with next
    │         │     (Don't block)
    │         ▼
    │    ┌──────────────────┐
    │    │ Continue loop    │
    │    └────┬─────────────┘
    │         │
    │ (4) Mark synced
    ▼         │
┌──────────────────┐
│ markSynced(id)   │
└────┬─────────────┘
     │
     └─────┬───────┘
           │
           │ (5) Next sync cycle
           ▼
┌──────────────────────┐
│ Retry failed items   │
│ from queue           │
└──────────────────────┘
```

**Failures**: Don't block user  
**Queue**: Retry in next sync  
**Logging**: Full error context

---

## 8. Data Structure Relationships

```
┌───────────────────────────────────────────┐
│         ChatSession                       │
│  ┌─────────────────────────────────┐     │
│  │ id: string                      │     │
│  │ chatRoomId: string              │     │
│  │ therapistId: string             │     │
│  │ customerId: string              │     │
│  │ isActive: boolean               │     │
│  │ startedAt: string               │     │
│  │ lastActivityAt: string          │     │
│  └─────────────────────────────────┘     │
└───────────────┬───────────────────────────┘
                │
                │ has many
                ▼
┌───────────────────────────────────────────┐
│         ChatMessage[]                     │
│  ┌─────────────────────────────────┐     │
│  │ id: string                      │     │
│  │ chatRoomId: string ────┐       │     │
│  │ senderId: string        │       │     │
│  │ message: string         │       │     │
│  │ timestamp: number       │       │     │
│  │ synced: boolean ✓      │       │     │
│  └─────────────────────────┼───────┘     │
└────────────────────────────┼─────────────┘
                             │
                             │ reference
                             │
┌────────────────────────────┼─────────────┐
│         BookingDraft       │             │
│  ┌─────────────────────────┼───────┐     │
│  │ id: string              │       │     │
│  │ chatRoomId: string ─────┘       │     │
│  │ therapistId: string             │     │
│  │ customerId: string              │     │
│  │ duration: number                │     │
│  │ totalPrice: number              │     │
│  │ status: 'draft' | 'confirmed'   │     │
│  │ synced: boolean ✓               │     │
│  │ isValid: boolean ✓              │     │
│  │ validationErrors: string[] ✓    │     │
│  └─────────────────────────────────┘     │
└────────────────┬──────────────────────────┘
                 │
                 │ on confirmation
                 ▼
┌───────────────────────────────────────────┐
│    Appwrite Booking Document              │
│  ┌─────────────────────────────────┐     │
│  │ $id: string (Appwrite ID)       │     │
│  │ localId: string (localStorage)  │     │
│  │ bookingId: string               │     │
│  │ totalPrice: number              │     │
│  │ adminCommission: number ✅      │     │
│  │ providerPayout: number ✅       │     │
│  │ status: 'pending'               │     │
│  └─────────────────────────────────┘     │
└───────────────────────────────────────────┘
```

**Relationship**: ChatSession → Messages → BookingDraft → Appwrite  
**Sync Flag**: Tracks localStorage → Appwrite status  
**LocalId**: Links localStorage item to Appwrite document

---

**These flow diagrams show the complete architecture of the local-first system!**
