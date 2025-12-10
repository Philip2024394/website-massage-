# 💰 Updated Commission Structure - Therapist Dashboard

## 📊 **Two-Tier Payment System**

### **FREE TIER** (Rp 0/month)
- **Commission**: **25% to Indastreet**, **75% to Therapist**
- **Example Earnings**:
  - Booking: Rp 100,000 → You earn: **Rp 75,000**
  - Booking: Rp 150,000 → You earn: **Rp 112,500**
  - Booking: Rp 200,000 → You earn: **Rp 150,000**

### **PREMIUM TIER** (Rp 200,000/month or Rp 2,000,000/year)
- **Commission**: **0% - YOU KEEP 100%! 🎉**
- **Example Earnings**:
  - Booking: Rp 100,000 → You earn: **Rp 100,000** (save Rp 25k per booking!)
  - Booking: Rp 150,000 → You earn: **Rp 150,000** (save Rp 37.5k per booking!)
  - Booking: Rp 200,000 → You earn: **Rp 200,000** (save Rp 50k per booking!)

### **ROI Calculation**
Premium membership pays for itself after approximately **1-2 bookings**:
- If average booking = Rp 150,000:
  - Free tier earnings: Rp 112,500 per booking
  - Premium earnings: Rp 150,000 per booking
  - **Savings per booking: Rp 37,500**
  - Premium cost: Rp 200,000/month
  - **Break-even: ~5.3 bookings** (Rp 200k ÷ Rp 37.5k)
  - After break-even, you save Rp 37,500 on every additional booking!

---

## ✅ **Premium Benefits** (Rp 200k/month)

1. **🎉 0% Commission** - Keep 100% of all earnings (biggest benefit!)
2. **✅ Verified Badge** - Displayed on top-left of your profile main image
3. **📊 Best Times Analytics** - Peak hours chart & busy days heatmap
4. **💬 24/7 Customer Support Chat** - 2-hour response time guarantee
5. **🎫 Discount Badges** - Set 5%, 10%, 15%, or 20% discounts
6. **🔝 Priority Search Placement** - Appear at top of search results
7. **📈 Advanced Analytics** - Demographics, forecasting, patterns
8. **🗓️ Visual Calendar** - Booking calendar with dates/times auto-detected
9. **🔔 3-Hour Advance Reminders** - Automatic notifications before bookings
10. **💬 Profile Optimization Support** - Help with photos, descriptions

---

## 📍 **Verified Badge Implementation**

### **Badge Location**:
- Displayed on **top-left corner** of the therapist's **main profile image**
- Image URL: `https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473`
- Size variations:
  - Homepage cards: 10x10 pixels
  - Profile page: 7x7 pixels
  - Dashboard header: 6x6 pixels

### **Requirements**:
- ✅ Must have premium membership (Rp 200k/month active)
- ✅ `membershipTier === 'premium'`
- ✅ `verifiedBadge === true` (set by admin after verification)

### **Verification Process**:
1. Therapist upgrades to Premium (Rp 200k/month)
2. Admin reviews therapist profile and credentials
3. Admin sets `verifiedBadge: true` in Appwrite therapists collection
4. Badge automatically appears on all profile displays
5. If membership expires or is cancelled, badge is removed

---

## 💳 **Payment Processing**

### **Weekly Payment Schedule**:
- Payments processed every **Monday**
- All **completed bookings** from previous week are paid out
- Payment method: Bank transfer to registered account

### **Commission Calculation**:
```javascript
// Free Tier
const commission = bookingAmount * 0.25; // 25%
const therapistEarning = bookingAmount * 0.75; // 75%

// Premium Tier
const commission = 0; // 0%
const therapistEarning = bookingAmount; // 100%
```

### **Database Structure**:
```javascript
// payments collection
{
  $id: string,
  therapistId: string,
  bookingId: string,
  customerName: string,
  amount: number, // Total booking amount
  adminCommission: number, // 25% for free, 0% for premium
  netEarning: number, // 75% for free, 100% for premium
  status: 'pending' | 'processing' | 'paid',
  date: string,
  paymentMethod: 'bank_transfer' | 'cash',
  paidAt: string | null
}
```

---

## 🎨 **UI Updates Made**

### **TherapistEarnings.tsx**:
1. ✅ Dynamic commission rate calculation based on tier
2. ✅ Updated payment schedule banner:
   - Free tier: "25% to Indastreet, 75% to you. Upgrade to Premium for 0% commission!"
   - Premium tier: "Premium members: 0% commission - you keep 100% of earnings! 🎉"
3. ✅ Updated stats card label: "Due to Admin (25%)" or "Admin Commission (0%)"
4. ✅ Updated mock data with 25%/0% commission calculations

### **MembershipPage.tsx**:
1. ✅ Added green banner on premium card: "0% COMMISSION - Keep 100% of your earnings!"
2. ✅ Updated comparison table with:
   - Row: Commission Rate → Free: 25% (red), Premium: 0% 🎉 (green)
   - Row: Your Earnings per Rp 100k → Free: Rp 75k, Premium: Rp 100k
3. ✅ Added FAQ explaining commission structure
4. ✅ Highlights savings: "Save 25% on every booking compared to free tier"

### **TherapistLegal.tsx**:
1. ✅ Updated Terms of Service Section 3.3 (Pricing):
   - Free tier: 25% to Indastreet, 75% to therapist
   - Premium tier: 0% commission, keep 100%
2. ✅ Updated Section 4.1 (Commission Structure) with tier breakdown
3. ✅ Updated Section 5.2 (Premium Benefits) to include 0% commission and verified badge

### **THERAPIST_DASHBOARD_COMPLETE_FINAL.md**:
1. ✅ Updated Free tier: Shows ⚠️ 25% commission warning
2. ✅ Updated Premium tier: Shows 🎉 0% COMMISSION headline
3. ✅ Added verified badge location details (top-left of main image)

---

## 🔧 **Backend Integration Required**

### **Appwrite Collections**:

1. **therapists** (extend existing):
```javascript
{
  membershipTier: 'free' | 'premium',
  verifiedBadge: boolean, // true only if premium + admin verified
  premiumExpiresAt: string, // ISO date
  premiumStartedAt: string // ISO date
}
```

2. **payments** (new):
```javascript
{
  therapistId: string,
  bookingId: string,
  amount: number,
  adminCommission: number, // 0 or 0.25 * amount
  netEarning: number, // amount - adminCommission
  status: 'pending' | 'processing' | 'paid',
  createdAt: string,
  paidAt: string | null
}
```

### **Payment Calculation Service**:
```javascript
async function calculatePayment(booking, therapist) {
  const isPremium = therapist.membershipTier === 'premium' && 
                    new Date(therapist.premiumExpiresAt) > new Date();
  
  const commissionRate = isPremium ? 0 : 0.25;
  const adminCommission = booking.amount * commissionRate;
  const netEarning = booking.amount - adminCommission;
  
  return {
    amount: booking.amount,
    adminCommission,
    netEarning,
    isPremium
  };
}
```

### **Verified Badge Logic**:
```javascript
// Frontend check (TherapistCard, ProfilePage, Dashboard)
const showVerifiedBadge = 
  therapist.membershipTier === 'premium' && 
  therapist.verifiedBadge === true;

// Admin verification flow
async function verifyTherapist(therapistId) {
  // Check if premium membership is active
  const therapist = await getTherapist(therapistId);
  
  if (therapist.membershipTier !== 'premium') {
    throw new Error('Must have premium membership to be verified');
  }
  
  if (new Date(therapist.premiumExpiresAt) < new Date()) {
    throw new Error('Premium membership has expired');
  }
  
  // Set verified badge
  await updateTherapist(therapistId, { verifiedBadge: true });
  
  // Send notification
  await sendNotification(therapistId, {
    type: 'system',
    title: 'Profile Verified! ✅',
    message: 'Congratulations! Your profile has been verified. The verified badge is now displayed on your profile.'
  });
}
```

### **Membership Expiry Handling**:
```javascript
// Cron job runs daily
async function checkExpiredMemberships() {
  const expired = await database.listDocuments('therapists', [
    Query.equal('membershipTier', 'premium'),
    Query.lessThan('premiumExpiresAt', new Date().toISOString())
  ]);
  
  for (const therapist of expired.documents) {
    // Downgrade to free tier
    await database.updateDocument('therapists', therapist.$id, {
      membershipTier: 'free',
      verifiedBadge: false // Remove verified badge
    });
    
    // Send notification
    await sendNotification(therapist.$id, {
      type: 'system',
      title: 'Premium Membership Expired',
      message: 'Your premium membership has expired. You now have a 25% commission on bookings. Renew to restore 0% commission and verified badge.'
    });
  }
}
```

---

## 📧 **Customer Communication**

### **Email to Existing Therapists**:
```
Subject: 🎉 New Commission Structure - Premium Members Get 0% Commission!

Hi [Therapist Name],

We're excited to announce an improved commission structure for Indastreet therapists!

NEW COMMISSION STRUCTURE:
• Free Tier: 25% commission (you keep 75%)
• Premium Tier (Rp 200k/month): 0% commission - keep 100% of earnings!

PREMIUM BENEFITS:
✅ 0% commission - save 25% on every booking
✅ Verified badge on your profile
✅ Best times analytics
✅ 24/7 customer support chat
✅ Visual booking calendar with reminders
...and more!

EXAMPLE SAVINGS:
If you typically earn Rp 150,000 per booking:
• Free tier: You keep Rp 112,500 (25% commission)
• Premium: You keep Rp 150,000 (0% commission)
• Savings: Rp 37,500 per booking!

Premium membership pays for itself after just 5-6 bookings per month.

Upgrade today: [link to dashboard]

Questions? Contact: indastreet.id@gmail.com

Best regards,
Indastreet Team
```

---

## 🎯 **Marketing Strategy**

### **Key Selling Points**:
1. **ROI Message**: "Pays for itself after 1-2 bookings"
2. **Savings Calculator**: Show exact savings per booking
3. **Verified Badge**: "Increase bookings with trust badge"
4. **No Long-term Commitment**: "Cancel anytime, monthly or annual"
5. **Limited Time**: "First 100 premium members get 50% off first month" (optional promo)

### **Conversion Tactics**:
1. Show commission savings prominently in earnings page
2. Add upgrade banners after every completed booking
3. Email therapists when they've "lost" enough to commission to justify upgrade
4. Testimonials from premium members
5. A/B test pricing and messaging

---

**Last Updated**: December 11, 2024
**Status**: ✅ Commission structure updated across all pages
**Next**: Backend payment calculation service + admin verification flow
