# 🚀 Commission Payment System - Quick Start Guide

**Status:** ✅ Production Ready  
**Appwrite:** Fully Integrated  
**Pages:** Ready to Use

---

## 📋 Table of Contents
1. [For Developers](#for-developers)
2. [For Hotel/Villa Owners](#for-hotelvilla-owners)
3. [For Therapists/Massage Places](#for-therapistsmassage-places)
4. [API Reference](#api-reference)
5. [Common Issues](#common-issues)

---

## For Developers

### Setup Appwrite Collection

1. **Go to Appwrite Console** (https://syd.cloud.appwrite.io)
2. **Navigate to:** Database `68f76ee1000e64ca8d05`
3. **Create Collection:** `commission_records`
4. **Add Attributes** (19 total):

```typescript
// Required Attributes
hotelVillaId        : integer
bookingId           : integer
providerId          : integer
providerType        : string (size: 20)
providerName        : string (size: 255)
serviceAmount       : float
commissionRate      : float
commissionAmount    : float
status              : string (size: 50)
bookingDate         : datetime
createdAt           : datetime
updatedAt           : datetime

// Optional Attributes
paymentMethod       : string (size: 50)
paymentProofImage   : string (size: 500)
paymentProofUploadedAt : datetime
verifiedBy          : integer
verifiedAt          : datetime
rejectionReason     : string (size: 500)
paidDate            : datetime
```

5. **Create Indexes:**
```typescript
// Index 1: provider_pending_idx
['providerId', 'providerType', 'status']

// Index 2: hotel_verification_idx
['hotelVillaId', 'status']

// Index 3: date_analytics_idx
['hotelVillaId', 'createdAt']

// Index 4: booking_ref_idx
['bookingId']
```

6. **Set Permissions:**
```typescript
// Read: Any authenticated user
Permission.read(Role.users())

// Create: Any authenticated user
Permission.create(Role.users())

// Update: Any authenticated user (control via service logic)
Permission.update(Role.users())

// Delete: None (audit trail)
```

---

### Integrate into Booking Flow

```typescript
// In your booking completion handler
import commissionPaymentService from '@/services/commissionPaymentService';

async function completeHotelVillaBooking(booking: Booking) {
  // Mark booking as completed
  booking.status = 'completed';
  
  // Create commission record
  const commissionRecord = await commissionPaymentService.createCommissionRecord({
    hotelVillaId: booking.hotelVillaId,
    bookingId: booking.id,
    providerId: booking.therapistId,
    providerType: 'therapist', // or 'place'
    providerName: booking.therapistName,
    serviceAmount: booking.totalAmount,
    commissionRate: 7.0, // 7% commission
    commissionAmount: booking.totalAmount * 0.07,
    bookingDate: new Date().toISOString()
  });
  
  console.log('✅ Commission record created:', commissionRecord);
  // Provider is now BUSY until payment verified
}
```

---

### Add Commission Tabs to Dashboards

#### Hotel/Villa Dashboard

```typescript
import HotelVillaCommissionVerificationPage from '@/pages/HotelVillaCommissionVerificationPage';
import HotelVillaBankDetailsPage from '@/pages/HotelVillaBankDetailsPage';

// Add tabs
const tabs = [
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'commissions', label: 'Commissions', icon: DollarSign }, // NEW
  { id: 'bank-details', label: 'Payment Settings', icon: CreditCard }, // NEW
  { id: 'settings', label: 'Settings', icon: Settings }
];

// Render
{activeTab === 'commissions' && <HotelVillaCommissionVerificationPage />}
{activeTab === 'bank-details' && <HotelVillaBankDetailsPage />}
```

#### Provider Dashboard (Therapist/Place)

```typescript
import ProviderCommissionPaymentPage from '@/pages/ProviderCommissionPaymentPage';

// Add tab
const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'commission-payments', label: 'Commission Payments', icon: Receipt }, // NEW
  { id: 'profile', label: 'Profile', icon: User }
];

// Render
{activeTab === 'commission-payments' && (
  <ProviderCommissionPaymentPage 
    providerId={therapist.id}
    providerType="therapist"
  />
)}
```

---

### Check Provider Status Before Accepting Bookings

```typescript
import commissionPaymentService from '@/services/commissionPaymentService';

async function canProviderAcceptBooking(therapistId: number): Promise<boolean> {
  // Check if provider has pending commission payments
  const hasPending = await commissionPaymentService.hasProviderPendingPayments(
    therapistId,
    'therapist'
  );
  
  if (hasPending) {
    alert('You have pending commission payments. Please complete payments before accepting new bookings.');
    return false;
  }
  
  return true;
}
```

---

## For Hotel/Villa Owners

### 1. Set Up Bank Details

1. Go to **Payment Settings** tab
2. Select preferred payment method:
   - **Bank Transfer** (Bank Mandiri, BCA, BNI, Other)
   - **E-Wallet** (GoPay, OVO, Dana, LinkAja, ShopeePay)
   - **Cash** (In-person payment)
3. Fill in account details
4. Add custom payment instructions (optional)
5. Click **Save Settings**

**Example:**
```
Bank: Bank Mandiri
Account Number: 1234567890
Account Name: Hotel Bali Paradise
SWIFT Code: BMRIIDJA
Instructions: Please transfer to Mandiri account and send screenshot to WhatsApp +62 812 3456 7890
```

---

### 2. Verify Commission Payments

1. Go to **Commissions** tab
2. See **Pending Verification** tab with badge count
3. For each pending payment:
   - View provider name, service amount, commission amount
   - Click **View Screenshot** to see payment proof
   - Check payment details (method, date, etc.)
   - **Accept** if valid → Provider becomes Available ✅
   - **Reject** if invalid → Enter reason → Provider stays Busy ❌

**Tips:**
- Check screenshot clearly shows transfer details
- Verify amount matches commission amount
- Check transfer date is recent
- If unclear, reject with reason: "Screenshot is blurry, please reupload"

---

### 3. View Commission History

1. Go to **Commissions** tab → **History** tab
2. See all commissions:
   - ✅ **Verified:** Payment received and confirmed
   - ⏳ **Pending:** Provider hasn't uploaded proof yet
   - 🔍 **Awaiting Verification:** Waiting for your approval
   - ❌ **Rejected:** Rejected with reason
3. Filter by status or date range
4. View commission analytics:
   - Total commissions
   - Verified amount
   - Pending amount

---

## For Therapists/Massage Places

### 1. Complete Service at Hotel/Villa

After finishing massage service at hotel/villa:
- Your status automatically changes to **BUSY** 🔴
- You receive notification: "Please pay commission to [Hotel Name]"
- You **CANNOT accept new bookings** until payment verified

---

### 2. Upload Payment Proof

1. Go to **Commission Payments** tab
2. See your pending commissions with RED warning banner
3. Click on a pending commission
4. See hotel/villa bank details
5. Make payment via:
   - Bank transfer
   - E-wallet transfer
   - Cash (in-person)
6. Take **clear screenshot** showing:
   - Transfer amount
   - Recipient name
   - Transfer date
   - Transaction ID (if available)
7. Select payment method
8. Upload screenshot
9. Click **Submit Payment Proof**

**Screenshot Guidelines:**
✅ Clear and readable  
✅ Shows full transaction details  
✅ Amount matches commission amount  
✅ No cropping or editing  
❌ Blurry or unclear screenshots will be rejected

---

### 3. Wait for Verification

- Hotel/villa will review your screenshot
- You'll receive notification when:
  - ✅ **Accepted:** "Payment verified! You're now Available."
  - ❌ **Rejected:** "Payment proof rejected: [reason]. Please reupload."

**If Accepted:**
- Status changes to **AVAILABLE** 🟢
- You can accept new bookings

**If Rejected:**
- Status stays **BUSY** 🔴
- Read rejection reason
- Make sure next screenshot is clear
- Reupload payment proof

---

### 4. View Payment History

See all your commission payments:
- Amount paid
- Date paid
- Status (Verified/Pending/Rejected)
- Payment method used

---

## API Reference

### Create Commission Record
```typescript
await commissionPaymentService.createCommissionRecord({
  hotelVillaId: number,
  bookingId: number,
  providerId: number,
  providerType: 'therapist' | 'place',
  providerName: string,
  serviceAmount: number,
  commissionRate: number, // e.g., 7.0 for 7%
  commissionAmount: number,
  bookingDate: string // ISO datetime
});
```

### Upload Payment Proof
```typescript
await commissionPaymentService.uploadPaymentProof(
  commissionId: number,
  paymentProofImage: string, // URL or base64
  paymentMethod: CommissionPaymentMethod
);
```

### Verify Payment (Accept)
```typescript
await commissionPaymentService.verifyPayment(
  commissionId: number,
  hotelUserId: number,
  true // Accept
);
```

### Verify Payment (Reject)
```typescript
await commissionPaymentService.verifyPayment(
  commissionId: number,
  hotelUserId: number,
  false, // Reject
  'Screenshot is unclear, please reupload with better quality'
);
```

### Get Provider Pending Payments
```typescript
const pending = await commissionPaymentService.getProviderPendingPayments(
  therapistId: number,
  'therapist'
);
```

### Get Hotel Verification Queue
```typescript
const queue = await commissionPaymentService.getHotelVillaPaymentVerificationQueue(
  hotelId: number
);
```

### Get Commission Analytics
```typescript
const stats = await commissionPaymentService.getHotelVillaTotalCommissions(
  hotelId: number,
  '2025-01-01', // Start date (optional)
  '2025-01-31'  // End date (optional)
);

// Returns:
{
  total: 1500000,
  verified: 1000000,
  pending: 300000,
  awaitingVerification: 200000
}
```

### Check Provider Has Pending Payments
```typescript
const hasPending = await commissionPaymentService.hasProviderPendingPayments(
  therapistId: number,
  'therapist'
);

if (hasPending) {
  // Block new bookings
}
```

### Get Hotel Bank Details
```typescript
const bankDetails = await commissionPaymentService.getHotelVillaBankDetails(
  hotelId: number,
  'hotel'
);

// Returns:
{
  bankName: 'Bank Mandiri',
  bankAccountNumber: '1234567890',
  bankAccountName: 'Hotel Bali Paradise',
  mobilePaymentNumber: '081234567890',
  mobilePaymentType: 'gopay',
  preferredPaymentMethod: 'bank_transfer',
  paymentInstructions: 'Please send screenshot to WhatsApp...'
}
```

---

## Common Issues

### Issue: Provider stays BUSY after uploading proof

**Cause:** Hotel/villa hasn't verified payment yet  
**Solution:** Wait for hotel/villa to review. Usually takes a few hours.

---

### Issue: Payment proof rejected

**Cause:** Screenshot unclear or incomplete  
**Solution:** 
- Read rejection reason
- Take new clear screenshot showing:
  - Full transaction details
  - Amount matching commission
  - Recipient name
  - Date
- Reupload

---

### Issue: Commission record not created after booking

**Cause:** Booking completion not integrated with commission service  
**Solution:**
```typescript
// Add to booking completion handler
if (booking.status === 'completed' && booking.hotelVillaId) {
  await commissionPaymentService.createCommissionRecord({...});
}
```

---

### Issue: Provider can't see pending payments

**Cause:** Page not added to dashboard  
**Solution:** Add ProviderCommissionPaymentPage to provider dashboard tabs

---

### Issue: Hotel can't see verification queue

**Cause:** Page not added to dashboard  
**Solution:** Add HotelVillaCommissionVerificationPage to hotel dashboard tabs

---

### Issue: Bank details not showing

**Cause:** Hotel/villa hasn't set up payment details  
**Solution:** Go to Payment Settings → Fill bank/e-wallet details → Save

---

## 🎯 Success Metrics

**For Hotels/Villas:**
- ✅ All commissions tracked automatically
- ✅ Payment proof verification reduces disputes
- ✅ Automated status management reduces manual work
- ✅ Commission analytics for revenue tracking

**For Providers:**
- ✅ Clear payment instructions
- ✅ Screenshot-based proof system (no manual bank visits)
- ✅ Automatic status management (no need to call hotel)
- ✅ Payment history for accounting

**For Platform:**
- ✅ Transparent commission flow
- ✅ Reduced payment disputes
- ✅ Audit trail for all transactions
- ✅ Provider accountability system

---

## 📞 Support

**Technical Issues:**
- Check browser console for errors
- Verify Appwrite connection
- Check collection permissions

**Payment Disputes:**
- Review payment history
- Check rejection reasons
- Contact hotel/villa directly

**Feature Requests:**
- Submit via GitHub issues
- Suggest improvements

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
