# 🔧 Loyalty System Integration Guide

## Quick Start: Integrate Coin Rewards into Booking Flow

This guide shows you how to award loyalty coins when a booking is completed.

---

## 📍 Integration Points

### **1. Award Coins After Booking Completion**

Find where bookings are marked as "Completed" in your app (likely in `BookingPage.tsx` or booking status update handlers).

#### **Add Import:**
```typescript
import { awardCoins } from '../lib/loyaltyService';
```

#### **Award Coins Code:**
```typescript
// After booking status changes to "Completed"
const handleBookingComplete = async (booking: Booking) => {
  try {
    // Award loyalty coins
    const event = await awardCoins(
      booking.userId,           // Customer's Appwrite user ID
      booking.providerId,       // Therapist or place ID
      booking.providerType,     // 'therapist' or 'place'
      booking.providerName,     // Provider's name
      booking.id                // Booking ID
    );

    // Show celebration popup
    setLoyaltyEvent(event); // This triggers the falling coins animation!

    console.log('🪙 Coins awarded:', event);
  } catch (error) {
    console.error('Error awarding coins:', error);
  }
};
```

---

### **2. Show Discount Badge During Booking**

In `BookingPage.tsx`, before the user confirms a booking:

#### **Add Import:**
```typescript
import { calculateDiscount } from '../lib/loyaltyService';
```

#### **Check for Available Discount:**
```typescript
const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

useEffect(() => {
  const checkLoyalty = async () => {
    if (loggedInCustomer && provider) {
      const { discount, tier } = await calculateDiscount(
        loggedInCustomer.$id,
        provider.id,
        providerType
      );
      
      setLoyaltyDiscount(discount);
      
      if (discount > 0) {
        console.log(`🎉 Customer has ${discount}% loyalty discount!`);
      }
    }
  };
  
  checkLoyalty();
}, [loggedInCustomer, provider]);
```

#### **Display Discount Badge:**
```tsx
{loyaltyDiscount > 0 && (
  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-white/80">Loyalty Discount</p>
        <p className="text-2xl font-bold">{loyaltyDiscount}% OFF</p>
      </div>
      <div className="text-3xl">🎉</div>
    </div>
    <p className="text-xs text-white/90 mt-1">
      Your loyalty discount is automatically applied
    </p>
  </div>
)}
```

#### **Apply Discount to Price:**
```typescript
const originalPrice = selectedDuration * provider.price;
const discountAmount = originalPrice * (loyaltyDiscount / 100);
const finalPrice = originalPrice - discountAmount;
```

#### **Show Price Breakdown:**
```tsx
<div className="bg-gray-50 rounded-lg p-4">
  <div className="flex justify-between mb-2">
    <span className="text-gray-600">Base Price</span>
    <span className="text-gray-900 font-semibold">฿{originalPrice}</span>
  </div>
  
  {loyaltyDiscount > 0 && (
    <div className="flex justify-between mb-2 text-green-600">
      <span>Loyalty Discount ({loyaltyDiscount}%)</span>
      <span>-฿{discountAmount}</span>
    </div>
  )}
  
  <div className="flex justify-between border-t pt-2 mt-2">
    <span className="text-lg font-bold">Total</span>
    <span className="text-lg font-bold text-orange-600">฿{finalPrice}</span>
  </div>
</div>
```

---

## 🎯 Complete Example: BookingPage Integration

Here's a complete example of how to integrate both features:

```typescript
import React, { useState, useEffect } from 'react';
import { awardCoins, calculateDiscount } from '../lib/loyaltyService';

const BookingPage = ({ loggedInCustomer, provider, providerType, setLoyaltyEvent }) => {
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(60);

  // Check for loyalty discount when page loads
  useEffect(() => {
    const checkLoyalty = async () => {
      if (loggedInCustomer && provider) {
        const { discount } = await calculateDiscount(
          loggedInCustomer.$id,
          provider.id,
          providerType
        );
        setLoyaltyDiscount(discount);
      }
    };
    checkLoyalty();
  }, [loggedInCustomer, provider]);

  // Calculate prices
  const originalPrice = selectedDuration * provider.price;
  const discountAmount = originalPrice * (loyaltyDiscount / 100);
  const finalPrice = originalPrice - discountAmount;

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    try {
      // Create booking (your existing code)
      const booking = await createBooking({
        userId: loggedInCustomer.$id,
        providerId: provider.id,
        providerType,
        providerName: provider.name,
        service: selectedDuration,
        price: finalPrice,
        discount: loyaltyDiscount,
        // ... other booking fields
      });

      console.log('✅ Booking created:', booking);

      // Award loyalty coins after successful booking
      const event = await awardCoins(
        booking.userId,
        booking.providerId,
        booking.providerType,
        booking.providerName,
        booking.id
      );

      // Show celebration popup with falling coins!
      setLoyaltyEvent(event);

      // Navigate to success page
      // ...
    } catch (error) {
      console.error('❌ Booking error:', error);
    }
  };

  return (
    <div className="p-4">
      {/* Loyalty Discount Badge */}
      {loyaltyDiscount > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80">🎉 Loyalty Discount Active</p>
              <p className="text-3xl font-bold">{loyaltyDiscount}% OFF</p>
            </div>
            <div className="text-5xl">🪙</div>
          </div>
          <p className="text-sm text-white/90 mt-2">
            You've earned this discount through loyalty!
          </p>
        </div>
      )}

      {/* Service Selection */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
        <h3 className="font-bold mb-3">Select Duration</h3>
        <div className="flex gap-2">
          {[60, 90, 120].map(duration => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`flex-1 py-3 rounded-lg font-semibold ${
                selectedDuration === duration
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {duration} min
            </button>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Base Price</span>
          <span className="text-gray-900 font-semibold">฿{originalPrice}</span>
        </div>
        
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span className="flex items-center gap-1">
              <span>🪙</span>
              Loyalty Discount ({loyaltyDiscount}%)
            </span>
            <span className="font-semibold">-฿{discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between border-t-2 pt-3 mt-3">
          <span className="text-xl font-bold">Total</span>
          <span className="text-xl font-bold text-orange-600">
            ฿{finalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmBooking}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Confirm Booking
      </button>

      {/* Earn Coins Notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <span className="text-xl">ℹ️</span>
          <p>
            You'll earn <strong>5 coins</strong> with {provider.name} after this booking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
```

---

## 🎨 Where to Pass `setLoyaltyEvent`

In your `App.tsx`, pass the state setter as a prop:

```typescript
// In App.tsx
const [loyaltyEvent, setLoyaltyEvent] = useState(null);

// When rendering BookingPage
<BookingPage
  loggedInCustomer={loggedInCustomer}
  provider={selectedProvider}
  providerType={providerType}
  setLoyaltyEvent={setLoyaltyEvent} // Pass this!
/>
```

---

## 📊 Testing the Integration

### **Test Scenario 1: First Booking**
1. Customer books their 1st massage
2. After completion, they earn 5 coins
3. 🎉 Celebration popup appears with falling coins
4. Shows "2 more visits to 5% discount"

### **Test Scenario 2: Third Booking (Tier Unlock)**
1. Customer books their 3rd massage
2. After completion, they earn 5 coins (total: 15 coins, 3 visits)
3. 🎊 **Special celebration** - "Bronze Tier Unlocked!"
4. "5% Discount Unlocked!"
5. Next booking automatically gets 5% off

### **Test Scenario 3: Booking with Discount**
1. Customer with Bronze tier books massage
2. Discount badge shows "5% OFF"
3. Price breakdown shows original vs. discounted price
4. Final price reflects 5% discount

---

## 🐛 Troubleshooting

### **Popup Not Showing?**
- Check that `setLoyaltyEvent` is passed as prop
- Verify `<CoinEarnedCelebration>` is rendered in App.tsx
- Console check: `event` should have `coinsEarned`, `totalCoins`, etc.

### **Discount Not Applying?**
- Ensure `loggedInCustomer.$id` is correct
- Check wallet exists with `getUserWallets(userId)`
- Verify tier calculation: 3+ visits = 5% discount

### **TypeScript Errors?**
- Make sure imports are from `'../lib/loyaltyService'`
- Check that `LoyaltyEarnedEvent` type is imported if needed
- Run `npm run build` to check for errors

---

## ✅ Checklist

Before going live:
- [ ] Coins awarded after booking completion
- [ ] Celebration popup displays with animation
- [ ] Discount badge shows on booking page
- [ ] Discount applied to final price
- [ ] Wallet tab displays all provider coins
- [ ] Transaction history tracked correctly
- [ ] Welcome popup shows for new users
- [ ] Streak bonuses working
- [ ] Progress bars updating correctly

---

**That's it!** Your loyalty coin system is ready to boost customer retention! 🚀🪙
