# Manual Payment System Setup Guide

## 🎯 Overview
This manual payment system allows users to upgrade their accounts by transferring money to your bank account and uploading proof of payment. You then verify and approve/reject payments from an admin dashboard.

## 📋 Setup Steps

### 1. Create Appwrite Collection

**Collection Name:** `paymentVerifications`

**Attributes:**

| Attribute Name | Type | Size | Required | Array | Default |
|---|---|---|---|---|---|
| userId | String | 255 | Yes | No | - |
| fullName | String | 255 | Yes | No | - |
| email | Email | 255 | Yes | No | - |
| phoneNumber | String | 20 | Yes | No | - |
| amount | Integer | - | Yes | No | 50000 |
| paymentMethod | String | 50 | Yes | No | - |
| bankAccount | String | 255 | Yes | No | - |
| transferDate | String | 50 | Yes | No | - |
| referenceNumber | String | 255 | No | No | - |
| paymentCode | String | 50 | Yes | No | - |
| proofImageUrl | URL | 2000 | Yes | No | - |
| proofImageId | String | 255 | Yes | No | - |
| notes | String | 1000 | No | No | - |
| status | String | 20 | Yes | No | pending |
| submittedAt | DateTime | - | Yes | No | - |
| verifiedAt | DateTime | - | No | No | - |
| verifiedBy | String | 255 | No | No | - |
| rejectionReason | String | 1000 | No | No | - |

**Indexes:**
- `status_idx`: Key = status, Type = key, ASC
- `userId_idx`: Key = userId, Type = key, ASC
- `submittedAt_idx`: Key = submittedAt, Type = key, DESC

**Permissions:**
- **Create:** Users (any authenticated user can create)
- **Read:** Admins only (or users can read their own)
- **Update:** Admins only
- **Delete:** Admins only

---

### 2. Create Storage Bucket

**Bucket Name:** `payment-proofs`

**Settings:**
- File size limit: 5MB
- Allowed file extensions: jpg, jpeg, png, webp
- Compression: Enabled
- Encryption: Enabled

**Permissions:**
- **Create:** Users (any authenticated user)
- **Read:** Admins + File owner
- **Update:** Admins only
- **Delete:** Admins only

---

### 3. Update Bank Account Details

Edit `UpgradePaymentPage.tsx` and update your actual bank accounts:

```typescript
const bankAccounts = {
    bca: {
        name: 'BCA (Bank Central Asia)',
        accountNumber: 'YOUR_BCA_ACCOUNT_NUMBER',
        accountName: 'YOUR_ACCOUNT_NAME',
    },
    mandiri: {
        name: 'Bank Mandiri',
        accountNumber: 'YOUR_MANDIRI_ACCOUNT_NUMBER',
        accountName: 'YOUR_ACCOUNT_NAME',
    },
    bni: {
        name: 'BNI (Bank Negara Indonesia)',
        accountNumber: 'YOUR_BNI_ACCOUNT_NUMBER',
        accountName: 'YOUR_ACCOUNT_NAME',
    },
    bri: {
        name: 'BRI (Bank Rakyat Indonesia)',
        accountNumber: 'YOUR_BRI_ACCOUNT_NUMBER',
        accountName: 'YOUR_ACCOUNT_NAME',
    },
};
```

---

### 4. Update Pricing

In `UpgradePaymentPage.tsx`, change the price if needed:

```typescript
amount: '50000', // Change to your desired price
```

Also update the display text and amount in the component.

---

### 5. Add to Your App Routing

Add the pages to your app routing (in `App.tsx` or your routing file):

```typescript
import UpgradePaymentPage from './pages/UpgradePaymentPage';
import PaymentVerificationAdminPage from './pages/PaymentVerificationAdminPage';

// Add routes:
<Route path="/upgrade" element={<UpgradePaymentPage onBack={handleBack} />} />
<Route path="/admin/payments" element={<PaymentVerificationAdminPage />} />
```

---

### 6. Update the "Upgrade To Unlock Details" Button

In `MassageJobsPage.tsx`, update the button to navigate to upgrade page:

```typescript
<button
    onClick={() => {
        // Navigate to upgrade page
        window.location.href = '/upgrade';
        // Or use your router: navigate('/upgrade');
    }}
    className="relative w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-md"
>
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm9 13H6v-8h12v8z"/>
        <circle cx="12" cy="16" r="1.5"/>
    </svg>
    <span>Upgrade To Unlock Details</span>
</button>
```

---

## 🔄 User Flow

### For Users:
1. Click "Upgrade To Unlock Details" button
2. See bank account details (BCA, Mandiri, BNI, BRI)
3. Transfer Rp 50,000 to your bank account
4. Upload screenshot of transfer
5. Fill in contact details
6. Submit for verification
7. Wait for admin approval (up to 24 hours)
8. Get notification when approved
9. Access unlocked features

### For Admin (You):
1. Go to `/admin/payments`
2. See all pending payments
3. Click "View" on a payment
4. Review screenshot and details
5. Click "Approve" or "Reject"
6. User gets premium access automatically

---

## 🛡️ Anti-Fraud Features

1. **Unique Payment Codes**: Each user gets unique code to include in transfer
2. **Image Metadata**: Check upload timestamps
3. **Amount Verification**: Verify exact amount transferred
4. **Duplicate Detection**: Track payment codes to prevent reuse
5. **Manual Review**: You verify every payment personally

---

## 📱 Notifications (Future Enhancement)

You can add:
- Email notifications when payment submitted
- WhatsApp notifications to admin
- Email/WhatsApp to user when approved/rejected
- SMS notifications

---

## 💡 Best Practices

1. **Check payments daily** to provide quick service
2. **Verify bank statement** matches screenshot
3. **Look for photoshopped images** (zoom in, check fonts, shadows)
4. **Contact user** via WhatsApp if unclear
5. **Keep records** of all transactions for accounting
6. **Respond within 24 hours** maximum

---

## 🚀 Next Steps

After setup:
1. Test the entire flow yourself
2. Ask a friend to test with small amount
3. Check admin dashboard works properly
4. Verify user gets premium access after approval
5. Launch! 🎉

---

## 📊 Future Automation Options

When you have 50+ users/day, consider:
1. Add Stripe for instant payments
2. Keep manual as "cheaper option"
3. Offer both: Manual (Rp 45k) vs Instant (Rp 50k)
4. Best of both worlds!

---

## ❓ Troubleshooting

**Images not uploading?**
- Check storage bucket exists
- Check bucket permissions
- Check file size < 5MB

**Can't approve payments?**
- Check collection permissions
- Check you're logged in as admin
- Check network connection

**User not getting premium access?**
- Uncomment the user update code in `handleApprove`
- Create users collection with `isPremium` field
- Update user document on approval

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check Appwrite logs
3. Verify all permissions set correctly
4. Test with small amounts first

Good luck! 🎉
