# Price Slider Booking Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    THERAPIST PRICE SLIDER BOOKING FLOW                          │
│                          (COMPLETE AUDIT ✅)                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

USER INTERACTION                   COMPONENTS                    DATABASE & EVENTS
═══════════════════════════════════════════════════════════════════════════════════

1. 👤 User browses therapist
      │
      ├─ Sees "Price List" button
      │
      ▼
   🖱️ Clicks "Price List"
      │
      ├──────────────────────► TherapistCard.tsx ──────► Price List Modal Opens
      │                        (line 1694+)              (Bottom Sheet Slider)
      │
      ▼
2. 📋 User views service menu
      │
      ├─ Traditional Massage: 60min 90min 120min
      ├─ Sports Massage: 60min 90min 120min
      ├─ Reflexology: 60min 90min 120min
      │
      ▼
   🖱️ Selects duration (e.g., 90min)
      │
      ├──────────────────────► handleSelectService() ──► State Updated:
      │                        (line 126)                 selectedDuration = '90'
      │                                                   selectedServiceIndex = 0
      │
      ▼
3. ✅ Duration highlighted (orange)
      │
      ▼
   🖱️ Clicks "Book Now" button
      │
      ├──────────────────────► Price Slider Button ────► Logs:
      │                        (line 1837)                🎯 PRICE SLIDER: User clicked "Book Now"
      │                                                   🚀 Calling handleBookingClick
      │
      ▼
4. 🎯 handleBookingClick triggered
      │
      ├──────────────────────► handleBookingClick() ───► Logs:
      │                        (line 703)                 🎯 handleBookingClick triggered
      │                                                   ✅ Opening BookingPopup
      │                                                   
      │                                                   State Updated:
      │                                                   priceSliderBookingSource = 'price-slider'
      │                                                   showBookingPopup = true
      │
      ▼
5. 📝 BookingPopup opens
      │
      ├──────────────────────► BookingPopup.tsx ───────► Props Received:
      │                        (line 44)                  initialDuration = 90
      │                                                   bookingSource = 'price-slider'
      │                                                   
      │                                                   Logs:
      │                                                   🚀 Starting booking creation
      │                                                   📍 Booking source: price-slider
      │                                                      Pre-selected duration: 90min
      │
      │                        Duration PRE-SELECTED ──► 90min button = ORANGE ✅
      │
      ▼
6. 📝 User fills details
      │
      ├─ Name: "John Doe"
      ├─ WhatsApp: +62 812 3456 7890
      ├─ Location: Hotel/Villa, Room 305
      │
      ▼
   🖱️ Clicks "Confirm Booking"
      │
      ├──────────────────────► handleCreateBooking() ──► booking.service.ts
      │                        (line 116)                 │
      │                                                   ├─ createBooking()
      │                                                   │
      │                                                   ▼
      │                                                   Appwrite Database
      │                                                   ┌──────────────────────┐
      │                                                   │  bookings collection │
      │                                                   │  ────────────────────│
      │                                                   │  $id: "abc123"       │
      │                                                   │  providerId: 42      │
      │                                                   │  providerName: "..."  │
      │                                                   │  duration: 90        │
      │                                                   │  totalCost: 450000   │
      │                                                   │  status: "pending"   │
      │                                                   └──────────────────────┘
      │                                                   
      │                                                   Logs:
      │                                                   ✅ STEP 2: Booking created
      │                                                      bookingId: abc123
      │
      ▼
7. 💬 Chat room created
      │
      ├──────────────────────► createChatRoom() ───────► chatService.ts
      │                        (line 307)                 │
      │                                                   ├─ createChatRoom(bookingId)
      │                                                   │
      │                                                   ▼
      │                                                   Appwrite Database
      │                                                   ┌────────────────────────┐
      │                                                   │ chat_rooms collection  │
      │                                                   │ ────────────────────── │
      │                                                   │ $id: "chat456"         │
      │                                                   │ bookingId: "abc123" ✅ │
      │                                                   │ therapistId: 42        │
      │                                                   │ customerId: "..."      │
      │                                                   │ status: "active"       │
      │                                                   └────────────────────────┘
      │                                                   
      │                                                   Logs:
      │                                                   ✅ STEP 3: Chat room created
      │                                                      Linked to bookingId: abc123
      │
      ▼
8. 📨 System message sent
      │
      ├──────────────────────► sendSystemMessage() ────► chatService.ts
      │                        (BookingPopup)             │
      │                                                   ├─ sendSystemMessage()
      │                                                   │
      │                                                   ▼
      │                                                   Appwrite Database
      │                                                   ┌─────────────────────────┐
      │                                                   │ chat_messages collection│
      │                                                   │ ──────────────────────  │
      │                                                   │ $id: "msg789"           │
      │                                                   │ chatRoomId: "chat456"   │
      │                                                   │ message: "Booking       │
      │                                                   │   confirmed! Duration:  │
      │                                                   │   90 minutes"           │
      │                                                   │ senderType: "system"    │
      │                                                   └─────────────────────────┘
      │
      ▼
9. 💰 Commission tracked
      │
      ├──────────────────────► commissionTracking ─────► commissionTrackingService.ts
      │                        Service.create()          │
      │                        (booking.service:205)     ├─ createCommissionRecord()
      │                                                   │
      │                                                   ▼
      │                                                   Appwrite Database
      │                                                   ┌──────────────────────────┐
      │                                                   │commission_records        │
      │                                                   │collection                │
      │                                                   │──────────────────────────│
      │                                                   │$id: "comm999"            │
      │                                                   │bookingId: "abc123" ✅    │
      │                                                   │therapistId: 42           │
      │                                                   │amount: 135000 (30%)      │
      │                                                   │deadline: +3 hours        │
      │                                                   │status: "pending"         │
      │                                                   └──────────────────────────┘
      │                                                   
      │                                                   Logs:
      │                                                   💰 Commission tracking
      │                                                      initiated (30%)
      │
      ▼
10. 📡 openChat event dispatched
       │
       ├──────────────────────► window.dispatchEvent() ─► CustomEvent('openChat')
       │                        (line 378)                 │
       │                                                   ├─ detail: {
       │                                                   │    bookingId: "abc123"
       │                                                   │    therapistId: 42
       │                                                   │    therapistName: "..."
       │                                                   │    duration: 90
       │                                                   │    price: 450000
       │                                                   │    ...8 more fields
       │                                                   │  }
       │                                                   │
       │                                                   ▼
       │                                                   App.tsx (Event Listener)
       │                                                   (line 840)
       │                                                   │
       │                                                   ├─ Receives event payload
       │                                                   │
       │                                                   ▼
       │                                                   State Updated:
       │                                                   chatInfo = {
       │                                                     bookingId: "abc123" ✅
       │                                                     therapistId: 42
       │                                                     therapistName: "..."
       │                                                     ...
       │                                                   }
       │                                                   showChat = true
       │
       ▼
11. 💬 ChatWindow opens
       │
       ├──────────────────────► ChatWindow.tsx ─────────► Props Received:
       │                        (line 50)                  bookingId = "abc123" ✅
       │                                                   therapistId = 42
       │                                                   therapistName = "..."
       │                                                   
       │                                                   UI Displays:
       │                                                   ┌────────────────────────┐
       │                                                   │ 💬 Chat with Therapist │
       │                                                   │ ──────────────────────│
       │                                                   │ 🎯 Booking: abc123     │
       │                                                   │ ⏱️  Duration: 90min    │
       │                                                   │ ──────────────────────│
       │                                                   │ 🤖 System Message:     │
       │                                                   │    Booking confirmed!  │
       │                                                   │    Duration: 90 min    │
       │                                                   │ ──────────────────────│
       │                                                   │ [Type message here...] │
       │                                                   └────────────────────────┘
       │
       ▼
12. 👨‍💼 Admin visibility
       │
       └──────────────────────► AdminChatMonitor.tsx ───► Appwrite Query:
                                (line 178)                 db.listDocuments(chat_rooms)
                                                           │
                                                           ├─ Fetches all chats
                                                           │
                                                           ▼
                                                           UI Displays:
                                                           ┌────────────────────────────┐
                                                           │ 👨‍💼 Admin Chat Monitor    │
                                                           │ ──────────────────────────│
                                                           │ Chat ID: chat456           │
                                                           │ Booking: abc123 ✅         │
                                                           │ Therapist: #42             │
                                                           │ Customer: John Doe         │
                                                           │ Source: price-slider 🎯    │
                                                           │ Status: Active             │
                                                           │ [View] [Force Close] [Flag]│
                                                           └────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════════
                              COMPLETE DATA FLOW ✅
═══════════════════════════════════════════════════════════════════════════════════

RESULT:
✅ Price slider uses IDENTICAL flow as main BookingPopup
✅ Full traceability: Price Slider → Booking → Chat → Commission → Admin
✅ bookingId propagates through entire chain
✅ No direct booking creation (single source of truth maintained)
✅ Comprehensive logging at every step

═══════════════════════════════════════════════════════════════════════════════════

```

## Key Integration Points

| Step | Component | Action | Database Collection | Result |
|------|-----------|--------|---------------------|--------|
| 1 | TherapistCard | Open price slider | - | Modal opens |
| 2 | TherapistCard | Select duration | - | State updated |
| 3 | TherapistCard | Click "Book Now" | - | Opens BookingPopup |
| 4 | BookingPopup | Receive props | - | Pre-select duration |
| 5 | BookingPopup | User fills details | - | Form ready |
| 6 | booking.service.ts | Create booking | `bookings` | bookingId = abc123 |
| 7 | chatService.ts | Create chat room | `chat_rooms` | chatId = chat456 ✅ bookingId |
| 8 | chatService.ts | Send system msg | `chat_messages` | System message sent |
| 9 | commissionTracking | Track commission | `commission_records` | 30% tracked ✅ bookingId |
| 10 | BookingPopup | Dispatch event | - | openChat event ✅ bookingId |
| 11 | App.tsx | Listen event | - | Opens ChatWindow |
| 12 | ChatWindow | Receive bookingId | - | Display booking context |
| 13 | AdminChatMonitor | Query chats | `chat_rooms` | Admin sees all ✅ bookingId |

## Comparison Chart

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     QUICK BOOK  vs  PRICE SLIDER                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  QUICK BOOK BUTTON                    PRICE SLIDER                        │
│  ══════════════════                   ════════════                        │
│                                                                            │
│  👤 User clicks                        👤 User clicks                     │
│     "Book Now"                            "Price List"                    │
│      │                                     │                              │
│      ├─ No service shown                  ├─ Shows all services          │
│      │                                     ├─ Shows all durations         │
│      ▼                                     ├─ User selects duration       │
│  📝 BookingPopup Opens                     │                              │
│      │                                     ▼                              │
│      ├─ User selects duration          📝 BookingPopup Opens              │
│      │  (60/90/120)                        │                              │
│      ▼                                     ├─ Duration PRE-SELECTED ✅    │
│  ✅ SAME FLOW                              │                              │
│      │                                     ▼                              │
│      ├─ BookingPopup                   ✅ SAME FLOW                       │
│      ├─ booking.service.ts                 │                              │
│      ├─ chatService.ts                     ├─ BookingPopup                │
│      ├─ commissionTracking                 ├─ booking.service.ts          │
│      ├─ openChat event                     ├─ chatService.ts              │
│      ├─ ChatWindow                         ├─ commissionTracking          │
│      └─ AdminChatMonitor                   ├─ openChat event              │
│                                            ├─ ChatWindow                   │
│  bookingSource: 'quick-book'               └─ AdminChatMonitor            │
│                                                                            │
│                                        bookingSource: 'price-slider' 🎯   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Audit Result

✅ **VERIFIED**: Price slider uses **100% IDENTICAL** booking flow as main BookingPopup  
✅ **ENHANCED**: Duration pre-selection improves UX (no duplicate selection)  
✅ **TRACKED**: bookingSource field enables analytics differentiation  
✅ **LOGGED**: Comprehensive traceability from slider → admin dashboard

**Status**: 🚀 PRODUCTION READY
