# Appwrite Database Setup for Coin Rewards System

## Overview
This guide will help you create the necessary Appwrite collections and attributes for the coin rewards and referral system.

---

## 1. Create Collections

### Collection 1: `coins`
**Purpose:** Store all coin transactions (earn, spend, expire)

**Settings:**
- Collection ID: `coins` (or update in appwrite.config.ts)
- Permissions: 
  - Users can read their own documents
  - Appwrite Functions can create/update/delete
  - Admin can read/update/delete all

**Attributes:**

| Name | Type | Size | Required | Default | Array |
|------|------|------|----------|---------|-------|
| userId | string | 255 | ✅ Yes | - | ❌ No |
| amount | integer | - | ✅ Yes | - | ❌ No |
| type | string | 50 | ✅ Yes | - | ❌ No |
| reason | string | 500 | ✅ Yes | - | ❌ No |
| earnedAt | datetime | - | ✅ Yes | - | ❌ No |
| expiryAt | datetime | - | ❌ No | - | ❌ No |
| status | string | 50 | ✅ Yes | active | ❌ No |
| metadata | string | 5000 | ❌ No | - | ❌ No |
| referralCode | string | 255 | ❌ No | - | ❌ No |
| referredUserId | string | 255 | ❌ No | - | ❌ No |

**Indexes:**

| Key | Type | Attributes | Orders |
|-----|------|------------|--------|
| userId_idx | key | userId | ASC |
| earnedAt_idx | key | earnedAt | DESC |
| status_idx | key | status | ASC |
| expiryAt_idx | key | expiryAt | ASC |
| type_idx | key | type | ASC |
| userId_status_idx | key | userId, status | ASC, ASC |
| userId_type_idx | key | userId, type | ASC, ASC |

**Enumeration Values for `type`:**
- `earn`
- `spend`
- `expire`

**Enumeration Values for `status`:**
- `active`
- `spent`
- `expired`

---

### Collection 2: `referrals`
**Purpose:** Track referral relationships and rewards

**Settings:**
- Collection ID: `referrals` (or update in appwrite.config.ts)
- Permissions:
  - Users can read their own referral documents
  - Appwrite Functions can create/update
  - Admin can read all

**Attributes:**

| Name | Type | Size | Required | Default | Array |
|------|------|------|----------|---------|-------|
| referrerId | string | 255 | ✅ Yes | - | ❌ No |
| referredUserId | string | 255 | ❌ No | - | ❌ No |
| referralCode | string | 255 | ✅ Yes | - | ❌ No |
| status | string | 50 | ✅ Yes | pending | ❌ No |
| coinsAwarded | integer | - | ✅ Yes | 0 | ❌ No |
| createdAt | datetime | - | ✅ Yes | - | ❌ No |
| firstBookingAt | datetime | - | ❌ No | - | ❌ No |
| metadata | string | 5000 | ❌ No | - | ❌ No |

**Indexes:**

| Key | Type | Attributes | Orders |
|-----|------|------------|--------|
| referrerId_idx | key | referrerId | ASC |
| referralCode_idx | unique | referralCode | ASC |
| referredUserId_idx | key | referredUserId | ASC |
| status_idx | key | status | ASC |
| createdAt_idx | key | createdAt | DESC |

**Enumeration Values for `status`:**
- `pending` (referral code exists but no one signed up)
- `completed` (someone signed up with code)
- `rewarded` (referrer received coins for completed booking)

---

## 2. Update Appwrite Config

After creating the collections, update your `lib/appwrite.config.ts`:

```typescript
collections: {
    // ... existing collections
    coins: 'coins',  // Use actual collection ID if different
    referrals: 'referrals',  // Use actual collection ID if different
}
```

---

## 3. Set Up Permissions

### For `coins` collection:

**Document-level permissions:**
```javascript
// When creating a coin transaction
const permissions = [
    Permission.read(Role.user(userId)),  // User can read their own transactions
    Permission.update(Role.any()),  // Appwrite functions can update
    Permission.delete(Role.team('admins'))  // Only admins can delete
];
```

### For `referrals` collection:

**Document-level permissions:**
```javascript
// When creating a referral record
const permissions = [
    Permission.read(Role.user(referrerId)),  // Referrer can read
    Permission.read(Role.user(referredUserId)),  // Referred user can read
    Permission.update(Role.any()),  // Appwrite functions can update
];
```

---

## 4. Create Appwrite Functions (Optional but Recommended)

### Function 1: Daily Coin Expiration
**Purpose:** Run daily to expire old coins

**Schedule:** `0 0 * * *` (Every day at midnight)

**Code:**
```javascript
import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        const now = new Date();
        
        // Get all active coins that have expired
        const expiredCoins = await databases.listDocuments(
            process.env.DATABASE_ID,
            'coins',
            [
                Query.equal('status', 'active'),
                Query.equal('type', 'earn'),
                Query.lessThanEqual('expiryAt', now.toISOString())
            ]
        );

        let expiredCount = 0;

        for (const coin of expiredCoins.documents) {
            // Mark as expired
            await databases.updateDocument(
                process.env.DATABASE_ID,
                'coins',
                coin.$id,
                { status: 'expired' }
            );

            // Create expiration record
            await databases.createDocument(
                process.env.DATABASE_ID,
                'coins',
                'unique()',
                {
                    userId: coin.userId,
                    amount: -coin.amount,
                    type: 'expire',
                    reason: 'Coins expired (12 months inactivity)',
                    earnedAt: now.toISOString(),
                    status: 'expired'
                }
            );

            expiredCount++;
        }

        log(`Expired ${expiredCount} coin transactions`);
        return res.json({ success: true, expiredCount });

    } catch (err) {
        error('Error expiring coins: ' + err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
```

### Function 2: Send Expiration Warnings
**Purpose:** Send email/push notifications for expiring coins

**Schedule:** `0 9 * * *` (Every day at 9 AM)

**Code:**
```javascript
import { Client, Databases, Query, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const users = new Users(client);

    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Get coins expiring in next 30 days
        const expiringCoins = await databases.listDocuments(
            process.env.DATABASE_ID,
            'coins',
            [
                Query.equal('status', 'active'),
                Query.equal('type', 'earn'),
                Query.lessThanEqual('expiryAt', thirtyDaysFromNow.toISOString()),
                Query.greaterThan('expiryAt', now.toISOString())
            ]
        );

        // Group by user
        const userCoins = {};
        expiringCoins.documents.forEach(coin => {
            if (!userCoins[coin.userId]) {
                userCoins[coin.userId] = { amount: 0, earliestExpiry: coin.expiryAt };
            }
            userCoins[coin.userId].amount += coin.amount;
            if (coin.expiryAt < userCoins[coin.userId].earliestExpiry) {
                userCoins[coin.userId].earliestExpiry = coin.expiryAt;
            }
        });

        let notificationsSent = 0;

        // Send notifications
        for (const [userId, data] of Object.entries(userCoins)) {
            const user = await users.get(userId);
            const daysUntilExpiry = Math.ceil(
                (new Date(data.earliestExpiry) - now) / (1000 * 60 * 60 * 24)
            );

            // Send email (integrate with your email service)
            // sendEmail(user.email, {
            //     subject: `⚠️ ${data.amount} coins expiring in ${daysUntilExpiry} days!`,
            //     body: `Your coins are expiring soon. Use them before they're gone!`
            // });

            // Send push notification (integrate with your push service)
            // sendPush(userId, {
            //     title: 'Coins Expiring Soon!',
            //     body: `${data.amount} coins expire in ${daysUntilExpiry} days`
            // });

            log(`Notified user ${userId} about ${data.amount} expiring coins`);
            notificationsSent++;
        }

        return res.json({ success: true, notificationsSent });

    } catch (err) {
        error('Error sending expiration warnings: ' + err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
```

---

## 5. Testing the Setup

### Test 1: Award Coins
```typescript
import { coinService } from './lib/coinService';

// Award daily sign-in
const transaction = await coinService.awardDailySignIn('user123', 1);
console.log('Awarded:', transaction);
```

### Test 2: Create Referral
```typescript
// Initialize referral code for user
const referralCode = await coinService.initializeReferralCode('user123');
console.log('Referral code:', referralCode);

// New user signs up with code
const referral = await coinService.createReferral(referralCode, 'newUser456');
console.log('Referral created:', referral);
```

### Test 3: Spend Coins
```typescript
// Redeem coins
const success = await coinService.spendCoins('user123', 50, 'Redeemed 10% discount');
console.log('Redemption success:', success);
```

### Test 4: Check Balance
```typescript
const balance = await coinService.getCoinBalance('user123');
console.log('Balance:', balance);
// { total: 200, active: 200, expired: 0, spent: 50, expiringSoon: 25 }
```

---

## 6. Integration Checklist

- [ ] Create `coins` collection in Appwrite
- [ ] Create `referrals` collection in Appwrite
- [ ] Set up indexes for both collections
- [ ] Configure collection-level permissions
- [ ] Update `appwrite.config.ts` with collection IDs
- [ ] Test coin awarding functionality
- [ ] Test referral creation
- [ ] Test coin spending (FIFO)
- [ ] Set up daily expiration Appwrite Function
- [ ] Set up expiration warning Appwrite Function
- [ ] Integrate email notifications
- [ ] Integrate push notifications
- [ ] Add coin balance to app header/navigation
- [ ] Hook up daily sign-in tracking
- [ ] Hook up booking completion tracking
- [ ] Hook up referral sign-up flow
- [ ] Test full user journey
- [ ] Monitor error logs
- [ ] Set up analytics tracking

---

## 7. Monitoring & Maintenance

### Key Metrics to Track:
- Total coins awarded per day
- Total coins redeemed per day
- Total coins expired per day
- Referral conversion rate
- Average coins per user
- Most popular redemption items

### Database Queries for Reports:

**Total coins awarded today:**
```typescript
const today = new Date().toISOString().split('T')[0];
const awarded = await databases.listDocuments(
    databaseId,
    'coins',
    [
        Query.equal('type', 'earn'),
        Query.greaterThanEqual('earnedAt', today)
    ]
);
```

**Top referrers this month:**
```typescript
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const referrals = await databases.listDocuments(
    databaseId,
    'referrals',
    [
        Query.equal('status', 'rewarded'),
        Query.greaterThanEqual('createdAt', firstDayOfMonth.toISOString())
    ]
);
```

---

## 8. Troubleshooting

**Issue:** "Property 'coins' does not exist on type"
- **Solution:** Update `appwrite.config.ts` to include `coins` and `referrals` collections

**Issue:** Coins not being awarded
- **Solution:** Check Appwrite console for permission errors. Ensure user has write permissions.

**Issue:** FIFO not working correctly
- **Solution:** Verify `earnedAt` index is created and sorted ASC in queries

**Issue:** Referral code not recognized
- **Solution:** Verify `referralCode` has unique index in referrals collection

---

## Next Steps

1. **Create the collections** in Appwrite Dashboard
2. **Run test transactions** to verify setup
3. **Integrate coin hooks** into your existing workflows
4. **Set up Appwrite Functions** for automation
5. **Monitor usage** and adjust coin values as needed

Your coin rewards system is now ready for production! 🎉
