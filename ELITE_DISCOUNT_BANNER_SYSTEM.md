# 🎁 Elite Discount Banner System - Implementation Complete

## ✅ System Overview

Complete elite-level discount banner workflow for therapists to send promotional offers to customers.

---

## 🎯 Confirmed Workflow

### **Step 1: Initial State**
- Display 4 discount banners (5%, 10%, 15%, 20%)
- Show customer names from last 30 days (completed bookings only)
- All customers are non-clickable initially

### **Step 2: Banner Selection**
- Therapist clicks a discount banner
- Selected banner gets orange glow ring + "✓ Selected" badge
- Customer names start pulsing/flashing (ready to click)
- Subtitle changes: "Select a discount banner to begin" → "Click customer name to send"

### **Step 3: Customer Selection**
- Therapist clicks customer name
- Confirmation dialog appears with:
  - Banner preview image
  - Confirmation message: "Send X% discount to [Name]?"
  - Expiry notice: "Valid for 7 days from today"
  - Cancel / Confirm buttons

### **Step 4: Sending Process**
- On confirm, dialog closes
- Customer name shows spinner + "Sending..."
- Backend API sends:
  - Banner image to customer's chat window
  - Push notification with MP3 sound (auto-play)
  - Discount record with 7-day expiry

### **Step 5: Post-Send Animation**
- "Sending..." → "✓ Discount Sent" (green badge)
- Customer name turns green
- After 2 seconds: fade-out animation (opacity → 0)
- After fade completes: customer disappears from list
- Banner selection resets (therapist can select new banner)

---

## 📋 Business Rules

| Rule | Implementation |
|------|----------------|
| **Customer Filter** | Only customers with completed bookings from last 30 days |
| **One Send Per Customer** | Each customer can only receive ONE discount (name disappears after send) |
| **Banner Selection** | Therapist can change banner selection before choosing customer |
| **Confirmation Required** | Always show confirmation dialog before sending |
| **MP3 Notification** | Auto-play via push notification when banner arrives |
| **Expiry Period** | 7 days from send date |

---

## 🎨 UI/UX Features

### **Banner Section**
- 2 banners per row (mobile-optimized)
- Clickable with hover effects
- Selected state: Orange ring + glow shadow + scale 1.05
- Dynamic subtitle based on selection state

### **Customer List**
- Minimalistic name-only design (no avatars/details)
- States:
  - **Default**: Gray, non-clickable
  - **Selectable**: Orange border, pulsing animation
  - **Sending**: Spinner + orange text
  - **Sent**: Green badge "✓ Discount Sent"
  - **Fading**: Opacity transition 1 → 0 (2s)

### **Confirmation Dialog**
- Modal overlay with banner preview
- Gradient orange header
- Confirmation message with customer name + percentage
- Expiry notice in orange
- Cancel (gray) / Confirm (orange gradient) buttons

---

## 🔧 Technical Implementation

### **State Management**
```typescript
const [selectedBanner, setSelectedBanner] = useState<{percentage: number, imageUrl: string} | null>(null);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [sendingToCustomer, setSendingToCustomer] = useState<string | null>(null);
const [sentCustomers, setSentCustomers] = useState<Set<string>>(new Set());
const [fadingOutCustomers, setFadingOutCustomers] = useState<Set<string>>(new Set());
```

### **Backend API Integration**
```typescript
const sendDiscountBanner = async (customerId, customerName, percentage, imageUrl) => {
  // POST /api/discount/send-banner
  // Payload: {
  //   therapistId, therapistName, customerId, customerName,
  //   bannerPercentage, bannerImageUrl, message,
  //   expiryDate (7 days), notificationSound: 'discount_received.mp3'
  // }
}
```

### **CSS Animations**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### **30-Day Filter**
```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// Query with filters:
Query.equal('status', 'completed')
Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString())
```

---

## 📱 Backend Requirements

### **Discount Code Generation** ✅ IMPLEMENTED
- Uses `generateTherapistDiscount()` from `therapistDiscountService.ts`
- Format: `[INITIALS][%]-[RANDOM]` (e.g., `SM10-A3K9X`)
- Unique per therapist-customer pair
- Single-use only
- 7-day expiry from creation
- Therapist-specific (only works with issuing therapist)

### **API Endpoint: POST /api/chat/send-discount-banner**

**Request Body:**
```json
{
  "therapistId": "string",
  "therapistName": "string",
  "customerId": "string",
  "customerName": "string",
  "bannerPercentage": 5 | 10 | 15 | 20,
  "bannerImageUrl": "https://...",
  "discountCode": "SM10-A3K9X",
  "expiresAt": "ISO date string",
  "message": "Thank you for your past massage booking...",
  "notificationSound": "discount_received.mp3"
}
```

**Backend Actions:**
1. Send banner image to customer's chat window
2. Send message with **discount code displayed prominently**
3. Create chat message record with discount metadata
4. Trigger push notification:
   - Title: "New Discount from [Therapist Name]!"
   - Body: "You received a X% discount! Code: [CODE]"
   - Sound: MP3 file (auto-play)
   - Data: { type: 'discount', chatId, discountCode, imageUrl }

**Response:**
```json
{
  "success": true,
  "messageId": "string",
  "notificationSent": true
}
```

### **Discount Code Redemption**
- Customer enters code during booking
- System validates:
  1. Code exists and matches therapist
  2. Not expired (< 7 days old)
  3. Not already used
  4. Belongs to correct customer
- If valid: Apply discount to therapist's price only
- Mark code as used with `bookingId`

### **Discount Calculation**
```
Original Price: 200,000 IDR
Discount: 10% (20,000 IDR)
Customer Pays: 180,000 IDR
Admin Commission (30%): 54,000 IDR
Therapist Receives (70%): 126,000 IDR
```
**Important**: Therapist absorbs the discount, NOT admin

---

## 🎵 MP3 Notification System

### **Implementation Options:**
1. **Push Notification with Audio** (Recommended)
   - Include MP3 URL in push notification payload
   - Mobile OS auto-plays notification sound
   - Works even when app is backgrounded

2. **Silent Push + In-App Audio**
   - Silent push wakes app
   - When customer opens chat, play MP3
   - More control but requires app to be opened

### **Audio File:**
- Filename: `discount_received.mp3`
- Duration: 2-3 seconds
- Tone: Cheerful, attention-grabbing
- Format: MP3, 128kbps
- Location: `/public/sounds/discount_received.mp3`

---

## ✅ Completed Features

- [x] State management (banner selection, sending, sent tracking)
- [x] Banner selection with glow effect
- [x] Customer pulse animation when banner selected
- [x] Confirmation dialog with banner preview
- [x] Send flow with loading state
- [x] "Discount Sent" badge display
- [x] Fade-out animation (2s transition)
- [x] Customer removal from list after fade
- [x] 30-day customer filter
- [x] Completed bookings only filter
- [x] Backend API integration function (ready for endpoint)
- [x] Translations (English + Indonesian)
- [x] Mobile-optimized UI
- [x] Error handling
- [x] CSS animations added

---

## 🚀 Next Steps (Backend)

1. **Create API Endpoint**
   - POST `/api/discount/send-banner`
   - Implement all backend actions listed above

2. **Database Schema**
   - Ensure `discount_codes` collection has:
     - `code`, `percentage`, `expiresAt`, `isUsed`
     - `userId`, `providerId`, `providerType`, `providerName`
     - `sentAt`, `usedAt`, `bookingId`

3. **Push Notification Service**
   - Integrate MP3 audio playback
   - Configure notification channels
   - Test on iOS + Android

4. **Chat Integration**
   - Send banner image + message to chat window
   - Store message in chat history
   - Display banner as rich media message

5. **Expiry Validation**
   - Add booking flow check: Is discount expired?
   - Display remaining days: "Valid for X days"
   - Auto-mark as expired in database

---

## 🎨 UI Preview

```
┌─────────────────────────────────┐
│  🎁 Kirim Diskon               │
│  Pilih banner diskon untuk...  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Discount Banners               │
│ Pilih banner diskon untuk mulai│
├─────────────┬───────────────────┤
│  [5% IMG]   │   [10% IMG]      │ ← Clickable
│  ✓ Selected │                  │
├─────────────┼───────────────────┤
│  [15% IMG]  │   [20% IMG]      │
└─────────────┴───────────────────┘

┌─────────────────────────────────┐
│ Customers              3 total  │
├─────────────────────────────────┤
│ 🟠 Ahmad Rizki          ⚡ Pulse│
├─────────────────────────────────┤
│ 🟠 Siti Nurhaliza       ⚡ Pulse│
├─────────────────────────────────┤
│ 🟠 Budi Santoso         ⚡ Pulse│
└─────────────────────────────────┘

       (After click)
┌─────────────────────────────────┐
│  [5% Banner Preview]            │
│                                 │
│  Konfirmasi Kirim               │
│  Kirim diskon 5% ke Ahmad?      │
│  Berlaku 7 hari dari hari ini   │
│                                 │
│  [ Batal ]  [ Konfirmasi ]     │
└─────────────────────────────────┘

       (After confirm)
┌─────────────────────────────────┐
│ 🔄 Ahmad Rizki    Mengirim...   │ ← Loading
├─────────────────────────────────┤
│ 🟠 Siti Nurhaliza       ⚡ Pulse│
└─────────────────────────────────┘

       (After sent)
┌─────────────────────────────────┐
│ ✅ Ahmad Rizki  Diskon Terkirim │ ← Green
├─────────────────────────────────┤
│ 🟠 Siti Nurhaliza       ⚡ Pulse│
└─────────────────────────────────┘

       (After 2s fade-out)
┌─────────────────────────────────┐
│ 🟠 Siti Nurhaliza       ⚡ Pulse│ ← Ahmad disappeared
├─────────────────────────────────┤
│ 🟠 Budi Santoso         ⚡ Pulse│
└─────────────────────────────────┘
```

---

## 📊 Success Metrics

Track these metrics in analytics:
- Banner selection rate (which % gets selected most)
- Send completion rate (confirmations vs cancellations)
- Discount redemption rate (how many customers use it)
- Time to redemption (days from send to booking)
- Customer engagement (chat opens after receiving banner)

---

## 🔐 Security Considerations

1. **Rate Limiting**: Max 10 discounts per therapist per day
2. **Validation**: Ensure customer belongs to therapist's booking history
3. **Duplicate Prevention**: Block sending to same customer twice
4. **Expiry Enforcement**: Server-side validation on booking
5. **Audit Trail**: Log all discount sends with timestamps

---

**Status**: ✅ **IMPLEMENTATION COMPLETE** - Ready for backend integration
**Version**: 1.0.0
**Date**: January 28, 2026
**Environment**: Development (port 3007)
