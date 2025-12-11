# Bank Transfer Payment System - Complete Setup Guide

## 🎯 Overview

This is a complete bank transfer payment system where:
1. **Admin** adds bank account details in the dashboard
2. **Members** (therapists/places) select a membership package
3. **System** shows bank account and payment deadline (24 hours)
4. **Member** transfers money and uploads screenshot
5. **System** sends WhatsApp notification to admin
6. **Admin** reviews payment proof and approves/rejects
7. **System** activates membership automatically upon approval

---

## 📋 Step 1: Create Appwrite Collections

### A. **bank_details** Collection

**Collection ID:** `bank_details`

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| bankName | String | 255 | ✅ | - | Bank name (e.g., "Bank BCA") |
| accountName | String | 255 | ✅ | - | Account holder name |
| accountNumber | String | 50 | ✅ | - | Account number |
| branchName | String | 255 | ❌ | - | Branch name (optional) |
| swiftCode | String | 50 | ❌ | - | SWIFT/BIC code (optional) |
| isActive | Boolean | - | ✅ | true | Show to users or not |

**Permissions:**
- Read: `any`
- Create: `role:admin`
- Update: `role:admin`
- Delete: `role:admin`

**Indexes:**
- `isActive_idx` on `isActive` (ASC)

---

### B. **payment_transactions** Collection

**Collection ID:** `payment_transactions`

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| userId | String | 255 | ✅ | - | Therapist or Place ID |
| userEmail | String | 255 | ✅ | - | User's email |
| userName | String | 255 | ✅ | - | User's full name |
| userType | String (Enum) | 20 | ✅ | - | "therapist" or "place" |
| packageType | String | 50 | ✅ | - | Package ID (1m, 3m, 6m, 1y) |
| packageDuration | String | 50 | ✅ | - | "1 Month", "3 Months", etc. |
| amount | Integer | - | ✅ | - | Payment amount in IDR |
| paymentProofUrl | String | 500 | ✅ | - | URL to uploaded screenshot |
| status | String (Enum) | 20 | ✅ | pending | "pending", "approved", "rejected" |
| submittedAt | DateTime | - | ✅ | - | When payment was submitted |
| reviewedAt | DateTime | - | ❌ | - | When admin reviewed |
| reviewedBy | String | 255 | ❌ | - | Admin who reviewed |
| notes | String | 1000 | ❌ | - | Admin notes or rejection reason |
| expiresAt | DateTime | - | ✅ | - | When membership expires |

**Permissions:**
- Read: `any`
- Create: `any`
- Update: `role:admin`
- Delete: `role:admin`

**Indexes:**
- `status_idx` on `status` (ASC)
- `userId_idx` on `userId` (ASC)
- `userType_idx` on `userType` (ASC)
- `submittedAt_idx` on `submittedAt` (DESC)

---

## 🔧 Step 2: Configure Appwrite Storage

Make sure your storage bucket allows:
- File uploads from authenticated and guest users
- Image file types (jpeg, jpg, png)
- Max file size: 5MB
- Public read access for viewing payment proofs

**Bucket Permissions:**
- Read: `any`
- Create: `any`
- Update: `any`
- Delete: `role:admin`

---

## 🎨 Step 3: Admin Setup

### Add Bank Account

1. Login to Admin Dashboard
2. Click **"Bank Details"** tab
3. Click **"Add Bank Account"** button
4. Fill in:
   - Bank Name (e.g., "Bank BCA")
   - Account Name (e.g., "PT IndaStreet Indonesia")
   - Account Number (e.g., "1234567890")
   - Branch Name (optional)
   - SWIFT Code (optional)
   - Check "Active" to show to users
5. Click **"Add Bank Account"**

**Example:**
```
Bank Name: Bank BCA
Account Name: PT IndaStreet Indonesia
Account Number: 7890123456
Branch: Jakarta Pusat
Active: ✓ Yes
```

---

## 💳 Step 4: User Payment Flow

### For Therapists/Places

1. **Select Package:**
   - Navigate to Membership page
   - Choose from 4 packages:
     - 1 Month - IDR 100,000
     - 3 Months - IDR 250,000 (Save 17%)
     - 6 Months - IDR 450,000 (Save 25%) ⭐ POPULAR
     - 1 Year - IDR 800,000 (Save 33%)
   - Click "Select Package"

2. **View Payment Instructions:**
   - See selected package summary
   - View payment deadline (24 hours countdown)
   - Select bank account (if multiple available)
   - Copy account number
   - Note total amount to transfer

3. **Make Bank Transfer:**
   - Go to your mobile banking app
   - Transfer exact amount to shown account number
   - Take screenshot of successful transaction

4. **Upload Payment Proof:**
   - Click "Upload Payment Proof"
   - Select screenshot from your phone
   - Review preview
   - Click "Submit Payment"

5. **Confirmation:**
   - WhatsApp notification sent to admin automatically
   - See success message
   - Wait for admin approval (usually within 24 hours)

---

## 👨‍💼 Step 5: Admin Review Process

### Review Payments

1. Login to Admin Dashboard
2. Click **"Payments"** tab
3. See pending payments notification badge
4. Click **"Pending"** filter to see unreviewed payments

### Approve Payment

1. Click **"View Payment Proof"** button
2. Review payment screenshot carefully:
   - Check amount matches
   - Check bank account matches
   - Check transaction is successful
   - Verify screenshot is not fake
3. Add optional notes (e.g., "Verified - BCA transfer")
4. Click **"✅ Approve & Activate Membership"**
5. System automatically:
   - Updates transaction status to "approved"
   - Activates therapist/place membership
   - Sets new expiry date based on package duration
   - Updates account status to "active"

### Reject Payment

1. Click **"View Payment Proof"** button
2. Click **"❌ Reject Payment"** button
3. Enter rejection reason (will be shown to user)
4. Confirm rejection
5. System updates transaction status to "rejected"

---

## 📱 WhatsApp Integration

### Auto-Notification to Admin

When a member submits payment, a WhatsApp message is automatically sent to your number (`+6281392000050`) with:

```
🔔 New Payment Submission

👤 Name: John Doe
📧 Email: john@example.com
📦 Package: 3 Months
💰 Amount: IDR 250,000
🏦 Bank: Bank BCA
⏰ Submitted: Oct 27, 2025, 3:45 PM

Please review and approve in Admin Dashboard.
```

This opens WhatsApp Web/App automatically with pre-filled message.

---

## 🔄 System Workflow

```
1. Admin adds bank account → Bank saved in database
                                    ↓
2. User selects package → Shows bank details + 24hr deadline
                                    ↓
3. User transfers money → Makes bank transfer via mobile banking
                                    ↓
4. User uploads screenshot → Screenshot uploaded to Appwrite Storage
                                    ↓
5. System creates transaction record → Status: pending
                                    ↓
6. System sends WhatsApp to admin → Opens WhatsApp with notification
                                    ↓
7. Admin reviews payment proof → Checks screenshot in dashboard
                                    ↓
8. Admin approves → System activates membership automatically
                                    ↓
9. User account activated → Status: active, Expiry date set
```

---

## 📊 Package Details

| Package | Duration | Price | Savings | Features |
|---------|----------|-------|---------|----------|
| Basic | 1 Month | IDR 100,000 | - | Basic visibility, Profile listing, Direct bookings |
| Standard | 3 Months | IDR 250,000 | Save 17% | Enhanced visibility, Priority support |
| Premium | 6 Months | IDR 450,000 | Save 25% | Featured badge, Priority placement ⭐ |
| Pro | 1 Year | IDR 800,000 | Save 33% | Verified badge, Top placement, Dedicated support |

---

## 🔒 Security Features

1. **24-Hour Payment Deadline** - Prevents old screenshots from being reused
2. **Payment Proof Verification** - Admin must manually approve each payment
3. **Unique Transaction IDs** - Each payment gets unique identifier
4. **Status Tracking** - Pending → Approved/Rejected workflow
5. **WhatsApp Notifications** - Instant alerts to admin
6. **Audit Trail** - All reviews logged with admin name and timestamp

---

## 🛠️ Integration with Existing System

### Update Therapist/Place Pages

Add "Purchase Membership" button that opens `MembershipPaymentPage`:

```typescript
// In TherapistDashboardPage.tsx or PlaceDashboardPage.tsx

const [showPaymentPage, setShowPaymentPage] = useState(false);

// Button
<button onClick={() => setShowPaymentPage(true)}>
    Upgrade Membership
</button>

// Render
{showPaymentPage && (
    <MembershipPaymentPage
        userId={therapist.$id}
        userEmail={therapist.email}
        userName={therapist.name}
        userType="therapist"
        onBack={() => setShowPaymentPage(false)}
        onPaymentSubmitted={() => {
            setShowPaymentPage(false);
            alert('Payment submitted! You will be notified once approved.');
        }}
    />
)}
```

---

## 📝 Admin Dashboard Updates

Added 2 new tabs to Admin Dashboard:

### 1. Bank Details Tab
- Manage bank accounts for payments
- Add/Edit/Delete bank accounts
- Toggle active/inactive status
- Show account details to members

### 2. Payments Tab
- View all payment transactions
- Filter by status (All, Pending, Approved, Rejected)
- Review payment proofs (screenshots)
- Approve or reject payments
- See pending payment count
- Automatic membership activation

---

## ✅ Testing Checklist

### Admin Setup
- [ ] Create `bank_details` collection in Appwrite
- [ ] Create `payment_transactions` collection in Appwrite
- [ ] Add bank account via Admin Dashboard
- [ ] Verify bank account shows as "Active"

### User Payment Flow
- [ ] Open Membership Payment page
- [ ] Select a package
- [ ] See bank account details displayed
- [ ] See 24-hour deadline countdown
- [ ] Copy account number works
- [ ] Upload screenshot preview works
- [ ] Submit payment creates transaction
- [ ] WhatsApp opens with notification

### Admin Review
- [ ] See pending payment in dashboard
- [ ] Click "View Payment Proof"
- [ ] See payment screenshot
- [ ] Approve payment
- [ ] Verify membership activated
- [ ] Check expiry date is correct
- [ ] Reject payment with reason
- [ ] Verify rejection saved

---

## 🎯 Success Metrics

Track these metrics in your analytics:

1. **Payment Success Rate** - % of payments approved vs rejected
2. **Average Review Time** - Time from submission to admin approval
3. **Popular Packages** - Which packages sell most
4. **Payment Abandonment** - Users who select package but don't upload proof
5. **Revenue by Package** - Total revenue per package type

---

## 🚀 Next Steps

1. **Email Notifications** - Send email confirmations in addition to WhatsApp
2. **SMS Alerts** - Add SMS notifications for payment status
3. **Automated Reminders** - Remind users about expiring memberships
4. **Payment Analytics** - Add charts and graphs for revenue tracking
5. **Bulk Approval** - Allow admin to approve multiple payments at once
6. **Export Reports** - Download payment records as CSV/Excel

---

## 📞 Support

If members have questions:
- WhatsApp: +6281392000050
- Email: indastreet.id@gmail.com

For technical issues, check:
1. Appwrite collections exist
2. Storage bucket permissions are correct
3. Bank account is marked as "Active"
4. WhatsApp number is correct in code

---

**System Status:** ✅ Ready for Production
**Last Updated:** October 27, 2025
**Version:** 1.0.0
