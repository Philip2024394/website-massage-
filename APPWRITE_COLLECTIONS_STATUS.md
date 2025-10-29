# ✅ Appwrite Collections Status

## Collections Created Successfully

### 1. ✅ Collection: `coins`

**Collection ID:** `coins`

| Attribute | Type | Size/Constraints | Required | Default |
|-----------|------|------------------|----------|---------|
| $id | String | - | System | Auto |
| userId | String | 255 | ✅ Required | - |
| amount | Integer | - | ✅ Required | - |
| type | String | 50 | ✅ Required | - |
| reason | String | 500 | ✅ Required | - |
| earnedAt | DateTime | - | ✅ Required | - |
| expiryAt | DateTime | - | ⚪ NULL | - |
| status | String | 51 | ⚪ NULL | - |
| metadata | String | 5000 | ⚪ NULL | - |
| $createdAt | DateTime | - | System | Auto |
| $updatedAt | DateTime | - | System | Auto |

**Status:** ✅ Created and Ready

---

### 2. ✅ Collection: `referrals`

**Collection ID:** `referrals`

| Attribute | Type | Size/Constraints | Required | Default |
|-----------|------|------------------|----------|---------|
| $id | String | - | System | Auto |
| referrerId | String | 255 | ✅ Required | - |
| referredUserId | String | 255 | ⚪ NULL | - |
| referralCode | String | 255 | ⚪ NULL | - |
| status | String | 50 | ✅ Required | - |
| coinsAwarded | Integer | Min: 0 | ✅ Required | - |
| createdAt | DateTime | - | ✅ Required | - |
| firstBookingAt | DateTime | - | ⚪ NULL | - |
| $createdAt | DateTime | - | System | Auto |
| $updatedAt | DateTime | - | System | Auto |

**Status:** ✅ Created and Ready

---

## 🎯 Next Steps

### 1. Run Tests

You can now test your integration! Navigate to the test page:

```
http://localhost:5173/#coin-test
```

Or run tests from browser console (F12):

```javascript
// Quick test (3 tests)
coinTests.quick('myUserId');

// Full test suite (9 tests)
coinTests.runAll();

// Individual tests
coinTests.test1(); // Award daily sign-in
coinTests.test2(); // Get balance
coinTests.test3(); // Initialize referral code
coinTests.test4(); // Create referral
coinTests.test5(); // Award booking completion
coinTests.test6(); // Process referral reward
coinTests.test7(); // Spend coins (FIFO)
coinTests.test8(); // Get transaction history
coinTests.test9(); // Get referral stats
```

### 2. What the Tests Verify

✅ **Coin Awards** - Daily sign-in, booking completion rewards  
✅ **Balance Calculation** - Total, active, expired, spent coins  
✅ **Referral System** - Code generation, signup bonuses (50 coins), referrer rewards (100 coins)  
✅ **FIFO Spending** - Oldest coins used first  
✅ **Transaction History** - All earn/spend/expire events  
✅ **Expiration** - 12-month coin expiry policy  

### 3. Expected Test Results

**Quick Test (3 tests):**
```
Test 1: Award daily sign-in → 10 coins awarded ✅
Test 2: Get coin balance → Balance retrieved ✅
Test 3: Initialize referral code → Code generated (INDA******) ✅

✅ Quick test completed successfully!
```

**Full Test Suite (9 tests):**
```
Test 1: Award Daily Sign-In ✅
Test 2: Get Coin Balance ✅
Test 3: Initialize Referral Code ✅
Test 4: Create Referral ✅
Test 5: Award Booking Completion ✅
Test 6: Process Referral Reward ✅
Test 7: Spend Coins (FIFO) ✅
Test 8: Get Transaction History ✅
Test 9: Get Referral Stats ✅

Summary: 9/9 tests passed 🎉
```

### 4. Troubleshooting

If any tests fail:

1. **Check Appwrite Permissions:**
   - Go to Appwrite Console → Database → Collections
   - Click on `coins` collection → Settings → Permissions
   - Ensure "Any" role has: Create, Read, Update permissions
   - Repeat for `referrals` collection

2. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Look for detailed error messages
   - Common issues:
     - Permission denied → Add "Any" role permissions
     - Invalid document structure → Verify attribute names match exactly
     - Network error → Check Appwrite endpoint in `lib/appwrite.config.ts`

3. **Check Collection Attributes:**
   - Verify attribute names are **exactly** as shown above
   - Case-sensitive! `userId` ≠ `UserId`
   - Check data types match (String, Integer, DateTime)

### 5. Integration into Your App

Once tests pass, integrate the coin system:

**A. Track Daily Sign-In** (in `App.tsx` or user login):
```typescript
import { trackDailySignIn } from './lib/coinHooks';

// When user logs in or opens app
useEffect(() => {
  if (userId) {
    trackDailySignIn(userId, userStreak);
  }
}, [userId]);
```

**B. Track Booking Completion** (in booking confirmation):
```typescript
import { trackBookingCompletion } from './lib/coinHooks';

// When booking is marked complete
const handleBookingComplete = async (bookingId) => {
  await markBookingComplete(bookingId);
  await trackBookingCompletion(userId, bookingId, totalUserBookings);
};
```

**C. Track Referral Sign-Up** (in registration flow):
```typescript
import { processSignUpReferral } from './lib/coinHooks';

// During user registration
const handleSignUp = async (userData, referralCode?) => {
  const newUser = await createUser(userData);
  
  if (referralCode) {
    await processSignUpReferral(newUser.id, referralCode);
  }
  
  return newUser;
};
```

**D. Show Coin Balance** (in header/navigation):
```typescript
import { getUserCoinBalance } from './lib/coinHooks';

const [coinBalance, setCoinBalance] = useState(0);

useEffect(() => {
  const loadBalance = async () => {
    const balance = await getUserCoinBalance(userId);
    setCoinBalance(balance.active);
  };
  loadBalance();
}, [userId]);

// Display: {coinBalance} 🪙
```

---

## 📊 System Capabilities

Your coin rewards system now supports:

✅ **Earning Coins:**
- 10 coins - Daily sign-in (day 1-6)
- 15 coins - Daily sign-in (day 7-13)
- 50 coins - Daily sign-in (day 14+)
- 100 coins - First booking completion
- 50-500 coins - Regular booking completion
- 50 coins - Welcome bonus (new user with referral code)
- 100 coins - Referrer reward (when referred user completes first booking)

✅ **Spending Coins:**
- FIFO (First-In-First-Out) - oldest coins used first
- Prevents expiration waste
- Track all redemptions

✅ **Expiration:**
- 12-month expiry from earn date
- Auto-expire old coins
- Warning system (coins expiring in 7/30 days)

✅ **Referral System:**
- Unique codes (format: INDA******)
- 50 coins welcome bonus for new users
- 100 coins for referrer (on first booking)
- Track referral performance

✅ **Analytics:**
- Total coins earned
- Active coin balance
- Expired coins
- Spent coins
- Coins expiring soon
- Referral statistics

---

## 🚀 You're Ready to Launch!

Both Appwrite collections are created and configured. Run the tests to verify everything works, then integrate the hooks into your app!

**Test Page:** Navigate to `/#coin-test` in your app  
**Documentation:** See `COIN_REWARDS_SYSTEM.md` for full details  
**Quick Start:** See `QUICK_START.md` for integration examples

Happy coding! 🎉
