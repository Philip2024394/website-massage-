# Quick Start - Bank Management System

## 🚀 2-Step Setup (Your Appwrite is Already Configured!)

### ✅ Step 1: Collection Already Set Up!

Your `bankAccounts` collection is already configured in Appwrite with all 14 attributes:
- ✅ accountNumber, accountType, balance, currency
- ✅ isJointAccount, primaryHolderId, secondaryHolderId  
- ✅ bankName, accountName, isActive
- ✅ createdAt, $createdAt, $updatedAt

**No need to create anything - it's ready to go!**

### Step 2: Update Config (1 minute)

**Find your Database ID:**
- Appwrite Console → Databases → Copy the ID

**Update these 2 files:**

1. `pages/AdminBankSettingsPage.tsx` line 23:
```typescript
const DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
```

2. `pages/JobUnlockPaymentPage.tsx` lines 21-23:
```typescript
const DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
const adminWhatsApp = 'YOUR_WHATSAPP_NUMBER'; // e.g., 6281234567890
```

### Step 3: Add Banks (2 minutes)

1. Navigate to: `http://localhost:3004/#adminBankSettings`
2. Click "Add New Bank Account"
3. Fill in the form:
   - **Bank Name**: e.g., "Bank Central Asia (BCA)"
   - **Account Number**: Your 16-digit account number
   - **Account Name**: e.g., "INDA STREET LTD"
   - **Account Type**: Choose "savings", "checking", or "business"
   - **Currency**: "IDR" (default)
   - **Balance**: 0 (default)
   - **Is Joint Account**: Unchecked (default)
   - **Primary Holder ID**: "admin" (default)
   - **Secondary Holder ID**: Leave empty (optional)
   - **Active**: ✅ Checked
4. Click "Add Bank Account"
5. Done! ✅

---

## 🔗 Quick Links

- **Admin Bank Settings**: `http://localhost:3004/#adminBankSettings`
- **Payment Page**: `http://localhost:3004/#jobUnlockPayment`
- **Job Listings**: `http://localhost:3004/#massageJobs`

---

## ✅ What You Can Do Now

### As Admin:
✅ Add unlimited bank accounts  
✅ Edit account details anytime  
✅ Activate/deactivate banks on the fly  
✅ Delete old/unused banks  
✅ No code changes needed to update banks  

### What Users See:
✅ Always current bank information  
✅ Multiple bank options if you add them  
✅ Clean, professional payment interface  
✅ Copy-to-clipboard for easy transfers  

---

## 📖 Need More Help?

- **Detailed Setup**: See `BANK_SETTINGS_SETUP.md`
- **Full Documentation**: See `BANK_MANAGEMENT_SUMMARY.md`
- **Troubleshooting**: Check console logs and Appwrite permissions

---

## 🎯 Test Checklist

- [x] `bankAccounts` collection already exists in Appwrite ✅
- [x] All 14 attributes already configured ✅
- [ ] Updated DATABASE_ID in AdminBankSettingsPage.tsx
- [ ] Updated DATABASE_ID in JobUnlockPaymentPage.tsx
- [ ] Updated admin WhatsApp number
- [ ] Visited `/#adminBankSettings` and added first bank
- [ ] Tested payment page shows the bank
- [ ] Tested with multiple banks (selection works)
- [ ] Tested inactive banks don't show on payment page

---

**Total Setup Time: ~3 minutes** ⏱️ (Collection already done!)

Let's go! 🚀
