# Updated Coin Pricing Strategy Guide

Based on your new coin earning rates, here's the recommended pricing structure for your shop items:

## 🎯 **New Coin Earning Rates**

- **Per booking completion**: 25 coins
- **Referral bonus**: 50 coins (to referrer)  
- **Loyalty tier bonus**: 10-15 coins (additional)
- **Daily check-in**: 5 coins (with streak multipliers)
- **Welcome bonus for referred users**: 25 coins

## 💰 **Revised Coin-to-Value Ratio**

With lower earning rates, we need to adjust the coin-to-dollar ratio:

**Recommended Ratio: 50-75 coins = $1 USD**

### Why this ratio works:
- Customer earns ~25-40 coins per booking (including loyalty bonus)
- Takes 10-15 bookings to earn meaningful rewards ($5-10 value)
- Encourages regular engagement and loyalty
- Sustainable for business economics

## 🛍️ **Recommended Product Pricing Tiers**

### **Tier 1: Small Rewards (100-300 coins)**
*Value: $1.50-$4.00*
- Travel-size products
- Small accessories
- Digital downloads
- Discount vouchers

**Examples:**
```
Travel Lip Balm: 125 coins (~$2 value)
Small Candle: 200 coins (~$3 value)  
5% Discount Voucher: 150 coins (~$2 value)
```

### **Tier 2: Medium Rewards (300-750 coins)**
*Value: $4.00-$10.00*
- Wellness products
- Small electronics
- Beauty items
- Service add-ons

**Examples:**
```
Aromatherapy Oil Set: 450 coins (~$6 value)
Wireless Earbuds: 600 coins (~$8 value)
Premium Face Mask Kit: 525 coins (~$7 value)
```

### **Tier 3: Large Rewards (750-1500 coins)**
*Value: $10.00-$20.00*
- Premium electronics
- Gift cards
- Spa packages
- High-value products

**Examples:**
```
$15 Spa Gift Card: 1125 coins (~$15 value)
Bluetooth Speaker: 1350 coins (~$18 value)
Premium Massage Oil Collection: 900 coins (~$12 value)
```

### **Tier 4: Premium Rewards (1500+ coins)**
*Value: $20.00+*
- Exclusive experiences
- High-value electronics
- Large gift cards
- VIP services

**Examples:**
```
$25 Gift Card: 1875 coins (~$25 value)
Premium Wellness Package: 2250 coins (~$30 value)
Smart Fitness Watch: 3000 coins (~$40 value)
```

## 📊 **Customer Earning Timeline**

### **Casual Customer (1 booking/month + daily check-ins)**
- Monthly earnings: ~175 coins
- Can redeem Tier 1 items monthly
- Tier 2 items every 2-3 months

### **Regular Customer (2 bookings/month + daily check-ins)**
- Monthly earnings: ~200 coins  
- Can redeem Tier 2 items monthly
- Tier 3 items every 3-4 months

### **Loyal Customer (4+ bookings/month + referrals)**
- Monthly earnings: ~350+ coins
- Can redeem Tier 3 items monthly
- Tier 4 items every 4-5 months

## 🎯 **Recommended Starting Catalog**

```typescript
const starterProducts = [
  // Tier 1 - Quick Rewards
  { name: "Travel Massage Oil", coinPrice: 150 },      // ~$2
  { name: "Relaxation Candle", coinPrice: 225 },       // ~$3
  { name: "5% Service Discount", coinPrice: 150 },     // ~$2
  
  // Tier 2 - Regular Rewards  
  { name: "Aromatherapy Kit", coinPrice: 450 },        // ~$6
  { name: "Wireless Earbuds", coinPrice: 600 },        // ~$8
  { name: "Premium Face Mask", coinPrice: 375 },       // ~$5
  
  // Tier 3 - Premium Rewards
  { name: "$10 Gift Card", coinPrice: 750 },           // ~$10
  { name: "Bluetooth Speaker", coinPrice: 1200 },      // ~$16
  { name: "Spa Package Upgrade", coinPrice: 900 },     // ~$12
  
  // Tier 4 - Exclusive Rewards
  { name: "$25 Gift Card", coinPrice: 1875 },          // ~$25
  { name: "VIP Massage Experience", coinPrice: 2250 }, // ~$30
  { name: "Premium Electronics", coinPrice: 3000 }     // ~$40
];
```

## 🔧 **Implementation Tips**

1. **Start Conservative**: Begin with slightly higher coin prices and adjust down based on redemption rates

2. **Monitor Engagement**: Track which items are popular vs. ignored and adjust pricing accordingly

3. **Seasonal Adjustments**: Offer special pricing during slow periods to drive bookings

4. **Bundle Opportunities**: Create coin + cash hybrid options for higher-value items

5. **Limited Time Offers**: Occasionally offer popular items at discount coin prices

## 📈 **Success Metrics to Track**

- **Redemption Rate**: Aim for 60-80% of earned coins being redeemed
- **Engagement**: Increase in booking frequency after shop launch
- **Tier Distribution**: Balanced redemptions across all tiers
- **Customer Feedback**: Survey satisfaction with coin values

This pricing structure ensures customers feel rewarded while maintaining business sustainability with your new lower coin earning rates.