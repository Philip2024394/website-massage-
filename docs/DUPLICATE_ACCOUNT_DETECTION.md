# Duplicate Account Detection - Fraud Prevention System

## Overview

This system automatically detects and prevents duplicate accounts based on critical identification fields:
- **Bank Account Details** (bank name + account number)
- **WhatsApp Number**
- **KTP Number**

## How It Works

### Detection Process

1. **Trigger**: When a therapist or place updates their profile with critical fields
2. **Check**: System scans database for existing accounts with same details
3. **Action**: If duplicate found, the **newest account** is:
   - Automatically **deactivated** (`isActive = false`)
   - Set to **offline status**
   - Flagged for admin review
4. **Notification**: Admin receives detailed alert about both accounts

### Critical Fields Monitored

```typescript
✅ Bank Account Details
   - Bank Name + Account Number combination
   - Both must match to trigger detection

✅ WhatsApp Number
   - Normalized (removes spaces, dashes, parentheses)
   - Exact match required

✅ KTP Number  
   - Indonesian National ID
   - Exact match required
```

## Automatic Actions

### When Duplicate Detected

**Newer Account** (automatically deactivated):
```json
{
  "isActive": false,
  "status": "offline",
  "deactivationReason": "Account deactivated automatically due to duplicate bank account details (matches account ABC123)",
  "deactivatedAt": "2026-01-28T10:30:00Z",
  "flaggedForReview": true,
  "duplicateAccountId": "ABC123"
}
```

**Original Account** (flagged for review):
```json
{
  "flaggedForReview": true,
  "hasDuplicateAccount": true,
  "duplicateAccountId": "XYZ789"
}
```

## Admin Notification

Admin receives detailed notification:

```
🚨 DUPLICATE ACCOUNT DETECTED

⚠️ Duplicate Field: Bank Account Details

📋 NEWER ACCOUNT (Deactivated):
- Name: John Doe
- Type: therapist
- ID: XYZ789
- Created: 28/01/2026, 10:30 AM

📋 ORIGINAL ACCOUNT (Flagged for Review):
- Name: Jane Smith  
- Type: therapist
- ID: ABC123
- Created: 15/01/2026, 09:00 AM

🔍 DUPLICATE DETAILS:
- Bank: BCA
- Account: 1234567890

⚡ ACTION TAKEN:
- Newer account automatically deactivated
- Both accounts flagged for manual review
- Please investigate and take appropriate action
```

## Implementation Details

### Files Created

**Duplicate Detection Service**:
- `src/services/duplicateAccountDetection.service.ts`
- Core fraud prevention logic
- Handles detection, deactivation, notifications

### Files Modified

**Therapist Service**:
- `src/lib/appwrite/services/therapist.service.ts`
- Added duplicate check on profile update
- Triggers when bank/WhatsApp/KTP updated

**Place Service**:
- `src/lib/appwrite/services/places.service.ts`
- Added duplicate check on profile update
- Same logic as therapist service

## Database Schema

### New Fields Added

Both `therapists` and `places` collections:

```typescript
{
  // Deactivation tracking
  isActive?: boolean,              // Account active status
  deactivationReason?: string,     // Why account was deactivated
  deactivatedAt?: string,          // When deactivated (ISO 8601)
  
  // Duplicate tracking
  flaggedForReview?: boolean,      // Needs admin review
  hasDuplicateAccount?: boolean,   // Has a duplicate account
  duplicateAccountId?: string,     // ID of duplicate account
  
  // Identity fields (existing, used for matching)
  bankName?: string,
  accountNumber?: string,
  whatsappNumber?: string,
  ktpNumber?: string
}
```

### Admin Notifications Collection

```typescript
{
  type: 'duplicate_account_detected',
  severity: 'high',
  title: string,
  message: string,
  accountId: string,              // Deactivated account ID
  accountType: 'therapist' | 'place',
  duplicateAccountId: string,      // Original account ID
  duplicateField: 'bank' | 'whatsapp' | 'ktp',
  createdAt: string,
  isRead: boolean
}
```

## Testing

### Test Scenarios

**Scenario 1: Duplicate Bank Account**
```javascript
// Account 1 (created first)
const therapist1 = {
  name: 'John Doe',
  bankName: 'BCA',
  accountNumber: '1234567890',
  createdAt: '2026-01-15T09:00:00Z'
};

// Account 2 (created later)
const therapist2 = {
  name: 'Jane Smith',
  bankName: 'BCA',
  accountNumber: '1234567890',  // Same as Account 1
  createdAt: '2026-01-28T10:30:00Z'
};

// Result: therapist2 automatically deactivated
```

**Scenario 2: Duplicate WhatsApp**
```javascript
// Account 1
const place1 = {
  name: 'Spa Bali',
  whatsappNumber: '+62 812-3456-7890',
  createdAt: '2026-01-10T08:00:00Z'
};

// Account 2
const place2 = {
  name: 'Wellness Center',
  whatsappNumber: '6281234567890',  // Same (normalized)
  createdAt: '2026-01-28T11:00:00Z'
};

// Result: place2 automatically deactivated
```

**Scenario 3: Duplicate KTP**
```javascript
// Account 1
const therapist1 = {
  name: 'Ahmad',
  ktpNumber: '3201123456789012',
  createdAt: '2026-01-05T07:00:00Z'
};

// Account 2
const therapist2 = {
  name: 'Budi',
  ktpNumber: '3201123456789012',  // Same KTP
  createdAt: '2026-01-28T12:00:00Z'
};

// Result: therapist2 automatically deactivated
```

## Edge Cases Handled

### 1. Partial Matches
- Bank name alone: ❌ Not enough
- Account number alone: ❌ Not enough  
- **Both required**: ✅ Triggers detection

### 2. WhatsApp Normalization
```javascript
// All these match:
'+62 812-3456-7890'
'6281234567890'
'(62) 812 345 6789'
// Normalized to: '6281234567890'
```

### 3. Timing
- Comparison based on `$createdAt` timestamp
- **Older account**: Preserved, flagged for review
- **Newer account**: Deactivated automatically

### 4. Self-Updates
- Account updating its own fields: ✅ Excluded from check
- Uses `Query.notEqual('$id', currentAccountId)`

## Admin Dashboard Actions

### Review Flagged Accounts

1. **Navigate**: Admin Dashboard → Therapists/Places
2. **Filter**: Show flagged accounts (`flaggedForReview = true`)
3. **Review**: Check both accounts details
4. **Decide**:
   - ✅ **Legitimate**: Remove flags, reactivate newer account
   - ❌ **Fraud**: Permanently ban both accounts
   - ⚠️ **Mistake**: Merge accounts, refund fees

### Manual Actions

```javascript
// Reactivate account (if legitimate)
await databases.updateDocument(
  databaseId,
  collectionId,
  accountId,
  {
    isActive: true,
    status: 'available',
    flaggedForReview: false,
    deactivationReason: null,
    hasDuplicateAccount: false
  }
);

// Permanent ban (if fraud confirmed)
await databases.updateDocument(
  databaseId,
  collectionId,
  accountId,
  {
    isActive: false,
    status: 'banned',
    bannedReason: 'Confirmed duplicate account fraud',
    bannedAt: new Date().toISOString()
  }
);
```

## Security Benefits

✅ **Fraud Prevention**
- Stops users creating multiple accounts
- Prevents abuse of promotions/discounts
- Maintains platform integrity

✅ **Identity Verification**
- Ensures one person = one account
- Links bank accounts to real identity
- Validates contact information

✅ **Admin Control**
- Automatic detection and action
- Manual review for complex cases
- Clear audit trail

## Performance

- **Non-blocking**: Duplicate check doesn't slow down updates
- **Efficient queries**: Indexed fields for fast lookups
- **Batch processing**: Handles multiple accounts efficiently
- **Error handling**: Graceful fallback if detection fails

## Monitoring

### Check Detection Logs

```javascript
// Search for duplicate detection events
console.log('🔍 [DUPLICATE CHECK] Checking account...');
console.warn('⚠️ [DUPLICATE BANK] Found duplicate...');
console.log('🚫 [DEACTIVATE] Deactivating account...');
console.log('📧 [ADMIN NOTIFY] Sending alert...');
```

### Database Queries

```javascript
// Count flagged accounts
const flaggedTherapists = await databases.listDocuments(
  databaseId,
  therapistsCollectionId,
  [Query.equal('flaggedForReview', true)]
);

console.log('Flagged therapists:', flaggedTherapists.total);

// Find duplicate pairs
const duplicatePairs = await databases.listDocuments(
  databaseId,
  therapistsCollectionId,
  [Query.notEqual('duplicateAccountId', null)]
);

console.log('Duplicate pairs:', duplicatePairs.total);
```

## Troubleshooting

### Detection Not Working

**Check:**
1. Fields properly named in database
2. Service imported correctly
3. Update function calling detection
4. Console logs showing detection attempts

### False Positives

**Causes:**
- Family members sharing bank account
- Business partners using same KTP
- Previous account legitimately closed

**Solution:**
- Admin manual review required
- Verify identity documents
- Contact users for clarification

### Performance Issues

**If detection is slow:**
- Add database indexes on checked fields
- Reduce batch size
- Cache recent checks

## Future Enhancements

🔮 **Planned Features**:
- IP address tracking
- Device fingerprinting
- Email domain analysis
- Address verification
- Photo similarity detection (KTP photos)

---

**Status**: ✅ Deployed and Active
**Last Updated**: January 28, 2026
**Monitored By**: Admin Dashboard
