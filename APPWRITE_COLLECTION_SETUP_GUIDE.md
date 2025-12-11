# Payment Confirmations Collection - Quick Setup Guide

## 🚀 Quick Setup (Copy-Paste Ready)

### Step 1: Create Collection

1. Open Appwrite Console → Your Database
2. Click "Add Collection"
3. **Collection ID**: `payment_confirmations`
4. **Name**: Payment Confirmations

### Step 2: Add Attributes (Copy-Paste Values)

#### String Attributes (18 total):

1. **confirmationId**
   - Type: String
   - Size: 36
   - Required: ✅ Yes
   - Default: (empty)

2. **userId**
   - Type: String
   - Size: 255
   - Required: ✅ Yes

3. **userEmail**
   - Type: String
   - Size: 255
   - Required: ✅ Yes

4. **userName**
   - Type: String
   - Size: 255
   - Required: ✅ Yes

5. **memberType**
   - Type: String
   - Size: 50
   - Required: ✅ Yes
   - (Values: therapist, place, agent, hotel, lead_buyer)

6. **paymentType**
   - Type: String
   - Size: 50
   - Required: ✅ Yes
   - (Values: membership, lead_fee, commission, package_upgrade)

7. **packageName**
   - Type: String
   - Size: 255
   - Required: ❌ No

8. **packageDuration**
   - Type: String
   - Size: 50
   - Required: ❌ No

9. **bankName**
   - Type: String
   - Size: 255
   - Required: ✅ Yes

10. **accountNumber**
    - Type: String
    - Size: 100
    - Required: ✅ Yes

11. **accountName**
    - Type: String
    - Size: 255
    - Required: ✅ Yes

12. **proofOfPaymentUrl**
    - Type: String
    - Size: 2000
    - Required: ✅ Yes

13. **proofOfPaymentFileId**
    - Type: String
    - Size: 255
    - Required: ❌ No

14. **status**
    - Type: String
    - Size: 50
    - Required: ✅ Yes
    - Default: `pending`
    - (Values: pending, approved, declined)

15. **reviewedBy**
    - Type: String
    - Size: 255
    - Required: ❌ No

16. **declineReason**
    - Type: String
    - Size: 1000
    - Required: ❌ No

17. **notes**
    - Type: String
    - Size: 2000
    - Required: ❌ No

18. **metadata**
    - Type: String
    - Size: 5000
    - Required: ❌ No

#### Float Attribute (1 total):

19. **amount**
    - Type: Float
    - Required: ✅ Yes

#### Boolean Attribute (1 total):

20. **notificationSent**
    - Type: Boolean
    - Required: ✅ Yes
    - Default: `false`

#### DateTime Attributes (3 total):

21. **submittedAt**
    - Type: DateTime
    - Required: ✅ Yes

22. **reviewedAt**
    - Type: DateTime
    - Required: ❌ No

23. **expiresAt**
    - Type: DateTime
    - Required: ✅ Yes

### Step 3: Create Indexes

1. **Index 1**: `userId_status_idx`
   - Type: Key
   - Attributes: 
     - userId (Ascending)
     - status (Ascending)

2. **Index 2**: `status_submitted_idx`
   - Type: Key
   - Attributes:
     - status (Ascending)
     - submittedAt (Descending)

3. **Index 3**: `expires_at_idx`
   - Type: Key
   - Attributes:
     - expiresAt (Ascending)
     - status (Ascending)

### Step 4: Set Permissions

**Document Security → Permissions:**

1. **Create**:
   - Role: `users` (Any authenticated user)
   - Permissions: ✅ Create

2. **Read**:
   - Role: `users` (Own documents only)
   - Permissions: ✅ Read
   - Role: `team:admin` or Admin role
   - Permissions: ✅ Read

3. **Update**:
   - Role: `team:admin` or Admin role
   - Permissions: ✅ Update

4. **Delete**:
   - Role: `team:admin` or Admin role
   - Permissions: ✅ Delete

---

## ✅ Verification Checklist

After creating the collection:

- [ ] Collection ID is exactly `payment_confirmations`
- [ ] All 23 attributes created
- [ ] Required attributes marked correctly
- [ ] Default values set (status=pending, notificationSent=false)
- [ ] String sizes match (especially proofOfPaymentUrl=2000)
- [ ] Float attribute for amount (not integer)
- [ ] All 3 indexes created
- [ ] Permissions set for Create, Read, Update, Delete
- [ ] Users can create documents
- [ ] Only admins can update/delete

---

## 🧪 Test the Collection

### Test Document (Use Appwrite Console):

```json
{
  "confirmationId": "test-123",
  "userId": "test-user-id",
  "userEmail": "test@example.com",
  "userName": "Test User",
  "memberType": "therapist",
  "paymentType": "membership",
  "packageName": "Standard",
  "packageDuration": "1_month",
  "amount": 150000,
  "bankName": "Bank Mandiri",
  "accountNumber": "1370-0123-4567-890",
  "accountName": "PT IndaStreet Massage Platform",
  "proofOfPaymentUrl": "https://example.com/proof.jpg",
  "proofOfPaymentFileId": "file-123",
  "status": "pending",
  "submittedAt": "2025-01-15T10:00:00.000Z",
  "expiresAt": "2025-01-22T10:00:00.000Z",
  "notificationSent": false
}
```

### Test Queries:

1. **Get all pending payments**:
   ```
   Query.equal('status', 'pending')
   Query.orderDesc('submittedAt')
   ```

2. **Get user's payments**:
   ```
   Query.equal('userId', 'your-user-id')
   Query.orderDesc('submittedAt')
   ```

3. **Get expired payments**:
   ```
   Query.equal('status', 'pending')
   Query.lessThan('expiresAt', '2025-01-15T00:00:00.000Z')
   ```

---

## 🔑 Environment Variables (If Needed)

Add to `.env` if you want collection ID configurable:

```env
VITE_APPWRITE_PAYMENT_CONFIRMATIONS_COLLECTION_ID=payment_confirmations
```

Then in `appwrite.config.ts`:

```typescript
export const APPWRITE_CONFIG = {
  // ... existing config
  paymentConfirmationsCollectionId: import.meta.env.VITE_APPWRITE_PAYMENT_CONFIRMATIONS_COLLECTION_ID || 'payment_confirmations',
};
```

---

## ⚠️ Common Issues

### Issue 1: "Collection not found"
**Solution**: Check collection ID is exactly `payment_confirmations` (no typo)

### Issue 2: "Missing required attribute"
**Solution**: Verify all 23 attributes created, especially required ones

### Issue 3: "Permission denied"
**Solution**: 
- Check user is authenticated
- Verify permissions set correctly
- For admin actions, ensure admin role assigned

### Issue 4: "Invalid query"
**Solution**: Ensure indexes created (especially for query filtering)

---

## 📞 Need Help?

1. Check Appwrite Console → Logs for errors
2. Verify browser console for detailed error messages
3. Test with Appwrite SDK directly before using app
4. Ensure Appwrite SDK version matches (check package.json)

---

## 🎉 You're Done!

Once the collection is created and tested, your payment confirmation system is ready to use!

**Next Step**: Run the therapist or admin dashboard and test the complete workflow.
