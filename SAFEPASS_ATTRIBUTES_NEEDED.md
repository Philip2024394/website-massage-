# SafePass Collection - Required Attributes

## You created the collection ✅ - Now add these attributes:

### Go to Appwrite Console:
1. Open: https://syd.cloud.appwrite.io/console
2. Project: `68f23b11000d25eb3664`
3. Database: `68f76ee1000e64ca8d05`
4. Collection: **safepass**
5. Click **"Attributes"** tab

---

## Add These 12 Attributes (in order):

### 1. entityType (Required)
- **Type:** Enum
- **Key:** `entityType`
- **Required:** ✅ Yes
- **Enum values:** `therapist`, `place`

### 2. entityId (Required)
- **Type:** String
- **Key:** `entityId`
- **Size:** 200
- **Required:** ✅ Yes

### 3. entityName (Required)
- **Type:** String
- **Key:** `entityName`
- **Size:** 255
- **Required:** ✅ Yes

### 4. hotelVillaSafePassStatus (Required)
- **Type:** Enum
- **Key:** `hotelVillaSafePassStatus`
- **Required:** ✅ Yes
- **Enum values:** `pending`, `approved`, `active`, `rejected`

### 5. hasSafePassVerification (Required)
- **Type:** Boolean
- **Key:** `hasSafePassVerification`
- **Required:** ✅ Yes
- **Default:** false

### 6. safePassIssuedAt (Required)
- **Type:** DateTime
- **Key:** `safePassIssuedAt`
- **Required:** ✅ Yes

### 7. safePassExpiry (Required)
- **Type:** DateTime
- **Key:** `safePassExpiry`
- **Required:** ✅ Yes

### 8. safePassSubmittedAt (Required)
- **Type:** DateTime
- **Key:** `safePassSubmittedAt`
- **Required:** ✅ Yes

### 9. hotelVillaLetters (Optional)
- **Type:** String
- **Key:** `hotelVillaLetters`
- **Size:** 200
- **Required:** ❌ No

### 10. safePassApprovedAt (Optional)
- **Type:** DateTime
- **Key:** `safePassApprovedAt`
- **Required:** ❌ No

### 11. safePassApprovedBy (Optional)
- **Type:** String
- **Key:** `safePassApprovedBy`
- **Size:** 200
- **Required:** ❌ No

### 12. safePassRejectionReason (Optional)
- **Type:** String
- **Key:** `safePassRejectionReason`
- **Size:** 400
- **Required:** ❌ No

### 13. safePassCardUrl (Optional)
- **Type:** String
- **Key:** `safePassCardUrl`
- **Size:** 250
- **Required:** ❌ No

### 14. safePassPaymentId (Optional)
- **Type:** String
- **Key:** `safePassPaymentId`
- **Size:** 250
- **Required:** ❌ No

---

## After Adding All Attributes:

1. Wait 1-2 minutes for Appwrite to build indexes
2. Run: `node activate-safepass.cjs`
3. Check: `node verify-safepass-setup.cjs`

---

## Quick Visual Checklist:

```
□ entityType (Enum: therapist, place)
□ entityId (String 200)
□ entityName (String 255)
□ hotelVillaSafePassStatus (Enum: pending, approved, active, rejected)
□ hasSafePassVerification (Boolean, default: false)
□ safePassIssuedAt (DateTime)
□ safePassExpiry (DateTime)
□ safePassSubmittedAt (DateTime)
□ hotelVillaLetters (String 200, optional)
□ safePassApprovedAt (DateTime, optional)
□ safePassApprovedBy (String 200, optional)
□ safePassRejectionReason (String 400, optional)
□ safePassCardUrl (String 250, optional)
□ safePassPaymentId (String 250, optional)
```

---

## Why This Approach Is Better:

✅ **Separation of concerns** - SafePass data lives in its own collection
✅ **No need to modify therapists collection** - Keeps it clean
✅ **Easier to query** - All SafePass data in one place
✅ **Scalable** - Can add places, other entities easily
✅ **History tracking** - Can  see all SafePass applications over time

This is the cleaner architectural approach you suggested! 🎉
