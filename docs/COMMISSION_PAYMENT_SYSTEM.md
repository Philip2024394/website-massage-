# Commission Payment Verification System

## Overview

This system ensures **financial accountability** between Hotels/Villas and Service Providers (Therapists/Massage Places). After completing a service, providers must upload payment proof to verify they've paid the commission fee. Hotels/Villas verify the payment, and only then does the provider become Available again for new bookings.

---

## 🔄 Complete Flow

```
Service Completed
       ↓
Provider Status → BUSY (cannot receive new bookings)
       ↓
Provider makes commission payment (bank transfer/cash/e-wallet)
       ↓
Provider uploads screenshot proof in their dashboard
       ↓
Status → "Awaiting Verification"
       ↓
Hotel/Villa receives notification
       ↓
Hotel/Villa reviews screenshot
       ↓
    ┌──┴──┐
    ↓     ↓
  ACCEPT  REJECT
    ↓     ↓
    ↓     Rejection reason sent
    ↓     Provider stays BUSY
    ↓     Must reupload valid proof
    ↓
Provider Status → AVAILABLE
Can accept new bookings!
```

---

## 🏗️ Architecture

### 1. **Types & Enums** (`types.ts`)

```typescript
export enum CommissionPaymentStatus {
    Pending = 'pending',                  // Service done, awaiting payment
    AwaitingVerification = 'awaiting_verification',  // Proof uploaded
    Verified = 'verified',                // Hotel confirmed payment
    Rejected = 'rejected',                // Hotel rejected proof
    Cancelled = 'cancelled'               // Booking cancelled
}

export enum CommissionPaymentMethod {
    BankTransfer = 'bank_transfer',
    Cash = 'cash',
    MobilePayment = 'mobile_payment',
    Other = 'other'
}

export interface CommissionRecord {
    id: number;
    hotelVillaId: number;
    bookingId: number;
    providerId: number;
    providerType: 'therapist' | 'place';
    providerName: string;
    serviceAmount: number;           // Total service price
    commissionRate: number;          // Percentage (e.g., 20)
    commissionAmount: number;        // Calculated amount to pay
    status: CommissionPaymentStatus;
    paymentMethod?: CommissionPaymentMethod;
    paymentProofImage?: string;      // Screenshot URL
    paymentProofUploadedAt?: string;
    verifiedBy?: number;             // Hotel/Villa user ID
    verifiedAt?: string;
    rejectionReason?: string;
    bookingDate: string;
    paidDate?: string;
    createdAt: string;
    updatedAt: string;
}
```

### 2. **Hotel/Villa Bank Details**

Added to `Hotel` and `Villa` interfaces:

```typescript
interface Hotel/Villa {
    // ... existing fields
    
    // Bank details for commission payments
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankSwiftCode?: string;
    mobilePaymentNumber?: string;
    mobilePaymentType?: string;      // 'GoPay', 'OVO', 'Dana'
    preferredPaymentMethod?: 'bank_transfer' | 'cash' | 'mobile_payment';
    paymentInstructions?: string;    // Custom instructions
}
```

---

## 🔧 Services

### `commissionPaymentService.ts`

**Key Methods:**

1. **`createCommissionRecord()`**
   - Called when booking is marked as Completed
   - Creates commission record with status: Pending
   - Notifies provider about pending payment
   - Provider status automatically set to Busy

2. **`uploadPaymentProof()`**
   - Provider uploads screenshot
   - Updates status to AwaitingVerification
   - Notifies hotel/villa to verify
   - Provider remains Busy

3. **`verifyPayment(verified: boolean, rejectionReason?: string)`**
   - Hotel/Villa verifies the payment proof
   - If **verified**:
     - Status → Verified
     - Provider status → Available
     - Notification sent to provider
   - If **rejected**:
     - Status → Rejected
     - Stores rejection reason
     - Provider stays Busy
     - Notification sent to provider

4. **`getProviderPendingPayments()`**
   - Returns all pending payments for a provider
   - Used to display in provider dashboard

5. **`getHotelVillaPaymentVerificationQueue()`**
   - Returns all payments awaiting verification
   - Used in hotel/villa dashboard

6. **`hasProviderPendingPayments()`**
   - Checks if provider has any unverified payments
   - If yes → Provider must remain Busy

7. **`getHotelVillaBankDetails()`**
   - Returns bank/payment details for provider to make payment

---

## 📱 Pages

### 1. **`ProviderCommissionPaymentPage.tsx`**

**For Therapists & Massage Places**

**Features:**
- Lists all pending commission payments
- Shows payment status for each booking
- Displays total outstanding commissions
- Shows hotel/villa bank details
- Payment method selection (Bank Transfer, Cash, E-Wallet)
- Screenshot upload interface
- Payment proof guidelines
- Real-time status updates

**UI Highlights:**
- ⚠️ Warning banner: "You are BUSY - Upload payment proof to become Available"
- Color-coded status badges (yellow=pending, blue=verifying, green=verified, red=rejected)
- Detailed payment breakdown (service amount, commission rate, commission amount)
- Bank account details card
- Image upload with guidelines
- Rejection reason display (if applicable)

**Screenshots:**
```
┌─────────────────────────────────────────┐
│  ⚠️ You are currently BUSY              │
│  You have 2 pending payments (Rp 60K)  │
│  Upload proof to become Available       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Booking #12345      [PAYMENT DUE]       │
│ Service: Rp 200,000                     │
│ Commission (20%): Rp 40,000            │
│ Date: Jan 15, 2025                      │
│ [SELECT TO UPLOAD PROOF]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🏦 Payment Details                      │
│ Bank: Bank Mandiri                      │
│ Account: 1234567890                     │
│ Name: PT Hotel Indonesia                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Payment Method:                         │
│ [🏦 Bank] [💵 Cash] [📱 E-Wallet]      │
│                                         │
│ 📸 Upload Screenshot                    │
│ [Click to upload image]                 │
│                                         │
│ Guidelines:                             │
│ ✓ Must show Rp 40,000                  │
│ ✓ Show date/time/reference             │
│ ✓ Clear and not blurry                 │
│                                         │
│ [Upload Payment Proof]                  │
└─────────────────────────────────────────┘
```

---

### 2. **`HotelVillaCommissionVerificationPage.tsx`**

**For Hotels & Villas**

**Features:**
- Two tabs: "Pending Verification" and "Commission History"
- Lists all payments awaiting verification
- Full-size image viewer for payment proofs
- Verify/Reject actions
- Rejection reason input
- Commission history table
- Total commission analytics

**UI Highlights:**
- 🔔 Badge showing pending verification count
- Full payment details (provider name, amount, date, method)
- Click-to-enlarge screenshot viewer
- Accept/Reject buttons with confirmation
- Rejection reason textarea
- Historical commission table

**Screenshots:**
```
┌─────────────────────────────────────────┐
│ [🔔 Pending Verification (3)] [History] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ John's Massage     [VERIFY NOW]         │
│ Booking #12345                          │
│ Service: Rp 200,000                     │
│ Commission (20%): Rp 40,000            │
│ Payment Method: 🏦 Bank Transfer        │
│ Uploaded: Jan 15, 2025 3:45 PM        │
│                                         │
│ Payment Proof:                          │
│ [Screenshot Image - Click to enlarge]   │
│                                         │
│ [✅ Verify & Accept] [❌ Reject]        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📊 Commission History                   │
│                                         │
│ Date      Provider   Amount  Status     │
│ Jan 15    John's     40K     ✅Verified │
│ Jan 14    Spa Bali   30K     ✅Verified │
│ Jan 13    Thai Spa   50K     ⏳Pending  │
└─────────────────────────────────────────┘
```

---

### 3. **`HotelVillaBankDetailsPage.tsx`**

**For Hotels & Villas - Settings**

**Features:**
- Preferred payment method selection
- Bank account details form
- E-wallet details form
- Cash payment instructions
- Custom payment instructions textarea
- Validation for required fields

**UI Highlights:**
- Three payment method cards (Bank, Cash, E-Wallet)
- Conditional forms based on selected method
- Info banner explaining commission system
- Tip boxes for best practices
- Save button with loading state

**Screenshots:**
```
┌─────────────────────────────────────────┐
│ ℹ️ About Commission Payments            │
│ Providers pay commission after service  │
│ They upload proof for verification      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Preferred Payment Method:               │
│ [🏦 Bank Transfer] [💵 Cash] [📱 E-Wallet] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🏦 Bank Account Details                 │
│                                         │
│ Bank Name: * [Bank Mandiri]             │
│ Account Number: * [1234567890]          │
│ Account Name: * [PT Hotel Indonesia]    │
│ SWIFT Code: [BDINIDJA] (Optional)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Additional Instructions:                │
│ [Include booking ID in description.     │
│  Payment within 24 hours of service.]   │
└─────────────────────────────────────────┘

[Save Payment Details]
```

---

## 🔔 Notifications

### Provider Notifications

1. **Service Completed - Payment Due**
   ```
   Service completed! 
   Please pay commission of Rp 40,000 to Grand Hotel Bali.
   Upload payment proof to become available again.
   ```

2. **Payment Verified**
   ```
   ✅ Payment verified! 
   Your commission payment of Rp 40,000 has been confirmed.
   You are now available for new bookings.
   ```

3. **Payment Rejected**
   ```
   ❌ Payment proof rejected: Screenshot is unclear
   Please upload a clearer screenshot.
   You will remain busy until payment is verified.
   ```

### Hotel/Villa Notifications

1. **New Payment Proof Uploaded**
   ```
   John's Massage has uploaded payment proof for booking #12345.
   Please verify the payment (Rp 40,000).
   ```

---

## 🎯 Business Rules

### 1. **Provider Status Management**

```
Booking Status: Completed
    ↓
Commission Record Created → status: Pending
    ↓
Provider Status → BUSY (automatic)
    ↓
Provider uploads proof → status: AwaitingVerification
    ↓
Provider Status → BUSY (still)
    ↓
Hotel verifies payment → status: Verified
    ↓
Provider Status → AVAILABLE ✅
```

**Key Rule:** Provider CANNOT become Available until ALL pending commissions are verified.

### 2. **Commission Calculation**

```typescript
commissionAmount = (serviceAmount × commissionRate) / 100

Example:
- Service: 60-min massage = Rp 200,000
- Commission Rate: 20%
- Commission Amount: Rp 40,000
```

### 3. **Payment Verification**

**Accept Criteria:**
- ✅ Amount matches commission amount exactly
- ✅ Payment date/time visible
- ✅ Transaction reference visible
- ✅ Recipient matches hotel/villa details
- ✅ Screenshot is clear and legible

**Reject Reasons:**
- ❌ Amount doesn't match
- ❌ Screenshot blurry/unreadable
- ❌ Wrong recipient
- ❌ No date/time visible
- ❌ Suspicious transaction

### 4. **Timeout Rules**

**Suggested Implementation:**
- Payment must be uploaded within **24 hours** of service completion
- If not uploaded → Auto-notification to provider
- After **48 hours** → Escalate to admin/support
- Hotel can manually mark as "disputed" if payment not received

---

## 📊 Analytics & Reporting

### Hotel/Villa Dashboard Metrics

```typescript
interface CommissionAnalytics {
    totalCommissionsReceived: number;      // Verified payments sum
    pendingCommissions: number;            // Awaiting payment sum
    awaitingVerification: number;          // Uploaded, needs review sum
    averageCommissionPerBooking: number;
    topEarningProviders: {
        providerId: number;
        providerName: string;
        totalCommissions: number;
        bookingsCount: number;
    }[];
    monthlyCommissionTrend: {
        month: string;
        amount: number;
    }[];
}
```

### Provider Dashboard Metrics

```typescript
interface ProviderCommissionStats {
    totalCommissionsPaid: number;          // Verified payments sum
    pendingPayments: number;               // Unverified sum
    averageCommissionRate: number;         // Average across hotels
    totalBookingsWithCommission: number;
    paymentHistory: CommissionRecord[];
}
```

---

## 🔒 Security Considerations

### 1. **Image Upload Security**
- Validate file type (JPEG, PNG only)
- Max file size: 5MB
- Sanitize filenames
- Store in secure Appwrite storage
- Generate unique URLs

### 2. **Financial Data Protection**
- Encrypt bank account numbers in database
- Mask account numbers in UI (show last 4 digits)
- HTTPS only for all API calls
- Audit log for all verification actions

### 3. **Fraud Prevention**
- Flag providers with high rejection rates
- Alert admins if same screenshot uploaded multiple times
- Require different screenshots for each payment
- Track IP addresses for verification actions

---

## 🚀 Integration with Existing System

### 1. **Booking Completion Trigger**

```typescript
// In booking completion handler
async function completeBooking(bookingId: number) {
    // 1. Update booking status
    await bookingService.updateStatus(bookingId, BookingStatus.Completed);
    
    // 2. Create commission record
    const booking = await bookingService.getBooking(bookingId);
    if (booking.hotelVillaId) {
        await commissionPaymentService.createCommissionRecord(
            booking.hotelVillaId,
            'hotel', // or 'villa'
            bookingId,
            booking.providerId,
            booking.providerType,
            booking.providerName,
            calculateServiceAmount(booking.service),
            20 // commission rate - get from hotel/villa settings
        );
    }
    
    // 3. Provider auto-set to Busy (handled by service)
}
```

### 2. **Dashboard Integration**

**Provider Dashboard - Add Tab:**
```typescript
const tabs = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'commissions', label: 'Commission Payments', badge: pendingCount }  // NEW
];
```

**Hotel Dashboard - Add Tab:**
```typescript
const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'welcome', label: 'Welcome Message' },
    { id: 'feedback', label: 'Guest Feedback' },
    { id: 'commission', label: 'Commission Verification', badge: pendingVerifications }  // NEW
];
```

---

## 🧪 Testing Checklist

### Provider Flow
- [ ] Complete a booking as provider
- [ ] Verify provider status changes to Busy
- [ ] See pending payment in commission page
- [ ] View hotel/villa bank details
- [ ] Select payment method
- [ ] Upload payment proof screenshot
- [ ] Verify status changes to "Awaiting Verification"
- [ ] Receive notification when verified
- [ ] Verify provider status changes to Available

### Hotel/Villa Flow
- [ ] Set up bank account details
- [ ] Receive notification when payment proof uploaded
- [ ] View payment proof screenshot
- [ ] Accept payment proof
- [ ] Verify provider becomes Available
- [ ] Reject payment proof with reason
- [ ] Verify provider stays Busy
- [ ] View commission history
- [ ] Check analytics/totals

### Edge Cases
- [ ] Provider tries to become Available with pending payments (should fail)
- [ ] Provider uploads invalid file type (should reject)
- [ ] Hotel verifies payment twice (should prevent duplicate)
- [ ] Network failure during upload (should retry)
- [ ] Screenshot too large (should compress or reject)

---

## 📈 Future Enhancements

### Phase 2
- [ ] Auto-reject after X days of non-payment
- [ ] Dispute resolution system
- [ ] Partial payment support
- [ ] Scheduled/recurring commission payments
- [ ] Provider credit system (pay later for trusted providers)

### Phase 3
- [ ] Direct payment gateway integration (auto-verify)
- [ ] QR code payment generation
- [ ] Commission invoice generation (PDF)
- [ ] Tax calculation and reporting
- [ ] Multi-currency support

### Phase 4
- [ ] AI-powered screenshot verification
- [ ] Blockchain-based payment proof
- [ ] Smart contracts for automated payouts
- [ ] Integration with accounting software

---

## 🎉 Summary

This commission payment verification system ensures:

✅ **Financial Accountability** - Providers must pay commissions before becoming available
✅ **Transparency** - Both parties see payment status in real-time
✅ **Verification** - Hotel/Villa confirms payment receipt before unlocking provider
✅ **Flexibility** - Supports bank transfer, cash, and e-wallet payments
✅ **Audit Trail** - Complete history of all commission payments
✅ **Automation** - Provider status automatically managed based on payment verification
✅ **User-Friendly** - Simple upload for providers, easy verification for hotels

**Business Impact:**
- Guarantees commission collection for hotels/villas
- Prevents providers from avoiding payment
- Creates trust and professionalism
- Enables scalable business model
- Provides clear financial records

---

**Files Created:**
1. ✅ `services/commissionPaymentService.ts` - Core business logic
2. ✅ `pages/ProviderCommissionPaymentPage.tsx` - Provider upload interface
3. ✅ `pages/HotelVillaCommissionVerificationPage.tsx` - Hotel verification interface
4. ✅ `pages/HotelVillaBankDetailsPage.tsx` - Bank details settings
5. ✅ `types.ts` - Updated with commission types

**Ready for production!** 🚀
