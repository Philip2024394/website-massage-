# 🪙 IndaStreet Coin Rewards System

## Complete Implementation Guide

---

## 📋 System Overview

The IndaStreet Coin Rewards System is a comprehensive gamification platform designed to increase user engagement, retention, and loyalty through a multi-tiered rewards program.

### Core Features
1. **Daily Sign-In Rewards** (10-750 coins)
2. **Booking Completion Rewards** (100-500 coins)
3. **Referral Program** (100 coins per referral + 50 welcome bonus)
4. **Coin Shop** (Redeem coins for discounts and free services)
5. **Coin Expiration System** (12-month validity)
6. **Transaction History** (Full transparency)

---

## 🎁 Referral Rewards System

### How It Works

**For Referrer (Existing User):**
- Share unique referral code: `INDA[USERID]`
- Earn **100 coins** when friend completes first booking
- No limit on total referrals (monthly limit: 50)
- Referral coins expire after 12 months

**For Referred User (New User):**
- Use referral code during sign-up
- Receive **50 coins** welcome bonus immediately
- Bonus added to account upon registration
- Can start redeeming coins right away

### Referral Code Format
```
INDA[USERID]
Example: INDA123456
```

### Referral Link Format
```
https://indastreet.com/ref/INDA123456
```

### Share Methods
1. **Direct Code Share** - Copy referral code
2. **Link Share** - Share referral link
3. **WhatsApp** - Direct integration
4. **Native Share** - iOS/Android share sheet

---

## ⏰ Coin Expiration Policy

### Expiration Rules

**12-Month Validity Period:**
- All earned coins expire 12 months from earning date
- Expiration tracked per transaction (FIFO method)
- Oldest coins used first when redeeming

### FIFO (First In, First Out) System

**Example:**
```
User has 300 coins:
- 100 coins earned Jan 2025 (expires Jan 2026)
- 150 coins earned Mar 2025 (expires Mar 2026)
- 50 coins earned Oct 2025 (expires Oct 2026)

When user redeems 175 coins:
1. Deduct 100 from Jan 2025 batch (all used)
2. Deduct 75 from Mar 2025 batch (75 remaining)
3. Oct 2025 batch untouched (50 remaining)

New balance: 125 coins (75 + 50)
```

### Notification System

**30 Days Before Expiration:**
- Email notification
- Push notification
- In-app warning banner

**7 Days Before Expiration:**
- Urgent email reminder
- Daily push notifications
- Prominent in-app alerts

**Expiration Day:**
- Final notification
- Coins removed from balance
- Transaction recorded as "expired"

---

## 💰 Coin Earning Opportunities

### Daily Sign-In Rewards

| Milestone | User Reward | Therapist Reward | Place Reward |
|-----------|-------------|------------------|--------------|
| Day 1     | 10 coins    | 10 coins         | 10 coins     |
| Day 7     | 15 coins    | 25 coins         | 20 coins     |
| Day 30    | 50 coins    | 100 coins        | 75 coins     |

### Booking Completion Rewards

| Booking Type     | User Reward | Therapist Reward | Place Reward |
|------------------|-------------|------------------|--------------|
| First Booking    | 100 coins   | 200 coins        | 150 coins    |
| Booking Complete | 50 coins    | 100 coins        | 75 coins     |
| 5th Booking      | 200 coins   | 500 coins        | 300 coins    |
| 10th Booking     | 500 coins   | 750 coins        | 500 coins    |

### Referral Rewards

| Action                          | Coins Earned |
|---------------------------------|--------------|
| Friend signs up (referrer)      | 0 (pending)  |
| Friend completes 1st booking    | 100 coins    |
| Welcome bonus (new user)        | 50 coins     |

### Special Achievements

| Achievement      | Coins Earned |
|------------------|--------------|
| 30-Day Streak    | 500 coins    |
| VIP Status       | 750 coins    |
| Profile Complete | 25 coins     |
| First Review     | 50 coins     |

---

## 🛒 Coin Redemption Options

### Discount Coupons

| Item                  | Cost      | Value     | Savings |
|-----------------------|-----------|-----------|---------|
| 10% Off Next Booking  | 50 coins  | ~$2-5     | 4-10x   |
| 15% Off Next Booking  | 100 coins | ~$3-8     | 3-8x    |
| 20% Off Next Booking  | 200 coins | ~$5-12    | 2.5-6x  |
| 25% Off Next Booking  | 350 coins | ~$7-18    | 2-5x    |

### Free Services

| Item                     | Cost       | Value     | Savings |
|--------------------------|------------|-----------|---------|
| Free 30-Min Massage      | 500 coins  | $15-25    | 3-5x    |
| Free 60-Min Massage      | 1000 coins | $30-50    | 3-5x    |
| Free 90-Min Massage      | 1500 coins | $45-75    | 3-5x    |
| VIP Priority Booking     | 250 coins  | $10-15    | 4-6x    |

### Platform Benefits

| Item                     | Cost       | Duration   |
|--------------------------|------------|------------|
| Ad-Free Experience       | 100 coins  | 30 days    |
| Premium Profile Badge    | 150 coins  | Permanent  |
| Featured Listing         | 300 coins  | 7 days     |
| Priority Support         | 200 coins  | 30 days    |

---

## 📊 Transaction History

### Transaction Types

1. **EARN** (Green)
   - Daily sign-ins
   - Booking completions
   - Referrals
   - Achievements

2. **SPEND** (Blue)
   - Coupon redemptions
   - Service purchases
   - Premium features

3. **EXPIRE** (Red)
   - Automatic expiration after 12 months
   - Inactivity-based expiration

### Transaction Record Example

```json
{
  "id": "txn_123456",
  "type": "earn",
  "amount": 100,
  "reason": "Referral reward - Friend John signed up",
  "date": "2025-10-25T10:30:00Z",
  "expiryDate": "2026-10-25T10:30:00Z",
  "status": "completed"
}
```

---

## 🚀 Implementation Status

### ✅ Completed Features

1. **ReferralPage.tsx**
   - Unique referral code generation
   - Copy code/link functionality
   - WhatsApp integration
   - Referral stats dashboard
   - Terms & conditions

2. **CoinHistoryPage.tsx**
   - Full transaction history
   - Filter by type (earn/spend/expire)
   - Expiration warnings
   - FIFO visualization
   - Coin balance overview

3. **HomePage Integration**
   - "Invite Friends" button (100 coins per referral)
   - "Coin History" button (view transactions)
   - "Coin Shop" button (redeem rewards)

4. **App.tsx Routes**
   - `/referral` - Referral program page
   - `/coin-history` - Transaction history page
   - `/coin-shop` - Redemption marketplace

### ⏳ Pending Backend Integration

1. **Database Schema Updates**
```typescript
// Coins Collection
{
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'expire';
  reason: string;
  earnedAt: Date;
  expiryAt: Date;
  status: 'active' | 'expired' | 'spent';
  referralCode?: string;
  referredUserId?: string;
}

// Referrals Collection
{
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'completed';
  coinsAwarded: number;
  createdAt: Date;
  firstBookingAt?: Date;
}
```

2. **Appwrite Functions Needed**
   - `trackDailySignIn()` - Award daily coins
   - `trackBookingCompletion()` - Award booking coins
   - `processReferral()` - Handle referral sign-ups
   - `awardReferralCoins()` - Award 100 coins on first booking
   - `checkCoinExpiration()` - Daily cron job to expire old coins
   - `sendExpirationWarnings()` - Email/push notifications
   - `getCoinBalance()` - Calculate current balance (FIFO)
   - `redeemCoins()` - Process redemptions

3. **Notification System**
   - Email templates (expiration warnings)
   - Push notification setup (30-day/7-day alerts)
   - In-app banner warnings

4. **Analytics Tracking**
   - Referral conversion rates
   - Average coin redemption time
   - Most popular redemption items
   - Coin expiration rates
   - User engagement metrics

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)

**User Engagement:**
- Daily active users (DAU) increase: Target +40%
- Weekly active users (WAU) increase: Target +50%
- Monthly active users (MAU) increase: Target +35%

**Retention:**
- 7-day retention: Target 60% (from 30%)
- 30-day retention: Target 40% (from 15%)
- 90-day retention: Target 25% (from 8%)

**Referrals:**
- Referral rate: Target 15% of users
- Referral conversion: Target 30%
- Average referrals per user: Target 2.5

**Monetization:**
- Booking frequency: Target +50%
- Average order value: Target +20%
- Platform revenue: Target +300-500% ROI

---

## 🔒 Fraud Prevention

### Anti-Abuse Measures

1. **Referral Limits**
   - Max 50 referrals per month
   - Same IP detection (max 3 referrals)
   - Email/phone verification required

2. **Coin Earning Limits**
   - Daily sign-in: Once per day
   - Booking rewards: Verified completions only
   - Manual review for suspicious activity

3. **Redemption Security**
   - Min account age: 7 days for first redemption
   - Min booking history: 1 completed booking
   - Rate limiting: Max 5 redemptions per day

4. **Account Suspension**
   - Fraudulent referrals → Account suspension
   - Coin farming → Coins revoked
   - Multiple accounts → All accounts banned

---

## 🎯 Marketing Strategy

### Launch Campaign

**Week 1: Soft Launch**
- Enable referral system for existing users
- Send email announcement
- In-app banner notification

**Week 2: Public Launch**
- Social media campaign
- Influencer partnerships
- Limited-time 2x referral bonus

**Week 3: Optimization**
- A/B test referral messaging
- Analyze conversion rates
- Adjust coin values if needed

### Ongoing Promotion

**Monthly Campaigns:**
- Referral contests (top 10 referrers win bonus coins)
- Seasonal events (2x coins during holidays)
- Partnership integrations (earn coins from partners)

**User Education:**
- Tutorial videos (how to earn/redeem coins)
- Email series (tips for maximizing coins)
- In-app tooltips and guides

---

## 💡 Future Enhancements

### Phase 2 Features

1. **Coin Gifting**
   - Send coins to friends
   - Birthday coin gifts
   - Thank-you coin tips

2. **Leaderboards**
   - Top coin earners
   - Monthly competitions
   - Exclusive rewards for top 10

3. **Premium Coins**
   - Purchase coins with real money
   - Special premium-only items
   - Bonus coins bundles

4. **Coin Challenges**
   - "Book 3 massages this week = 200 bonus coins"
   - "Refer 5 friends = 1000 bonus coins"
   - Streaks and milestones

5. **Partner Integration**
   - Earn coins at partner businesses
   - Redeem coins across ecosystem
   - Super app integration

---

## 📞 Support & FAQs

### Common Questions

**Q: Do my coins expire?**
A: Yes, coins expire 12 months after earning them. We'll notify you 30 days before expiration.

**Q: Which coins expire first?**
A: Oldest coins are used first (FIFO method) when you redeem rewards.

**Q: Can I transfer coins to another account?**
A: No, coins are non-transferable and cannot be exchanged for cash.

**Q: How do I check my coin expiration dates?**
A: Visit "Coin History" page to see all transactions and expiration dates.

**Q: What happens if my referral doesn't complete a booking?**
A: You only earn 100 coins when your referral completes their first booking.

**Q: Is there a limit to referrals?**
A: Yes, 50 referrals per month to prevent abuse.

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] Backend database schema created
- [ ] Appwrite functions deployed
- [ ] Email templates designed
- [ ] Push notification setup
- [ ] Analytics tracking configured
- [ ] Fraud detection rules implemented
- [ ] Admin dashboard for monitoring
- [ ] User testing completed
- [ ] Legal review (terms & conditions)
- [ ] Privacy policy updated

### Launch Day
- [ ] Enable referral system
- [ ] Send announcement email
- [ ] Post on social media
- [ ] Update app store description
- [ ] Monitor for bugs/issues
- [ ] Track initial metrics
- [ ] Prepare support team

### Post-Launch (Week 1)
- [ ] Analyze user feedback
- [ ] Fix critical bugs
- [ ] Optimize performance
- [ ] Adjust coin values if needed
- [ ] Prepare weekly report
- [ ] Plan phase 2 features

---

## 📝 Version History

**v1.0.0** (Current)
- Referral program page
- Coin history with expiration tracking
- FIFO coin usage system
- 12-month expiration policy
- Homepage integration

**v1.1.0** (Planned)
- Backend integration
- Real-time coin tracking
- Push notifications
- Email automation

**v2.0.0** (Future)
- Leaderboards
- Coin challenges
- Premium coins
- Partner integration

---

**Last Updated:** October 30, 2025  
**Status:** Ready for Backend Integration  
**Priority:** High - Core gamification feature
