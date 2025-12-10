# Lead Cost Dynamic Pricing Implementation

## ✅ Overview

The lead generation system now calculates lead costs as **25% of the actual booking price**, not a fixed Rp 50,000. This ensures fair pricing that scales with:
- **Member custom pricing** (e.g., therapist sets 60min = 300K instead of default 250K)
- **Active discounts** (e.g., 20% off promotion reduces both booking price AND lead cost)

---

## 💰 Pricing Examples

### Default Pricing (No discount, no custom pricing)
| Duration | Booking Price | Lead Cost (25%) |
|----------|---------------|-----------------|
| 60 min   | 250,000 IDR   | **62,500 IDR**  |
| 90 min   | 350,000 IDR   | **87,500 IDR**  |
| 120 min  | 450,000 IDR   | **112,500 IDR** |

### Custom Pricing Example (Therapist sets higher rates)
| Duration | Booking Price | Lead Cost (25%) |
|----------|---------------|-----------------|
| 60 min   | 300,000 IDR   | **75,000 IDR**  |
| 90 min   | 400,000 IDR   | **100,000 IDR** |
| 120 min  | 500,000 IDR   | **125,000 IDR** |

### Discount Pricing Example (20% off promotion active)
| Duration | Original Price | Discounted Price | Lead Cost (25% of discounted) |
|----------|----------------|------------------|-------------------------------|
| 60 min   | 250,000 IDR    | 200,000 IDR      | **50,000 IDR**                |
| 90 min   | 350,000 IDR    | 280,000 IDR      | **70,000 IDR**                |
| 120 min  | 450,000 IDR    | 360,000 IDR      | **90,000 IDR**                |

---

## 🔧 Implementation Details

### 1. Lead Generation Service (`lib/appwriteService.ts`)

```typescript
export const leadGenerationService = {
    LEAD_COST_PERCENTAGE: 0.25, // 25% of booking price
    
    /**
     * Calculate lead cost as 25% of booking price
     */
    calculateLeadCost(bookingPrice: number): number {
        return Math.round(bookingPrice * this.LEAD_COST_PERCENTAGE);
    },
    
    /**
     * Create a new lead with dynamic pricing
     */
    async createLead(data: {
        // ... other fields
        bookingPrice: number; // REQUIRED: Full booking price (e.g., 250000, not 250)
        duration: number;
    }): Promise<any> {
        // Calculate 25% of booking price
        const leadCost = this.calculateLeadCost(data.bookingPrice);
        
        const leadData = {
            ...data,
            leadCost, // Store calculated lead cost
            // ...
        };
        
        // Create lead with calculated cost
        await databases.createDocument(...);
    }
}
```

### 2. Booking Popup Price Calculation (`components/BookingPopup.tsx`)

The booking popup **already handles custom pricing and discounts correctly**:

```typescript
// Lines 75-103: bookingOptions array
const bookingOptions: BookingOption[] = [
  { 
    duration: 60, 
    price: pricing && pricing["60"] 
      ? (discountActive && discountPercentage > 0 
          ? Math.round(Number(pricing["60"]) * (1 - discountPercentage / 100))
          : Number(pricing["60"]))
      : 250000 // Default if no custom pricing
  },
  // ... 90 and 120 min options
];
```

**Key Points:**
- `pricing` prop contains member's custom prices (e.g., `{ "60": 300000, "90": 400000, "120": 500000 }`)
- If `discountActive` is true, applies discount percentage to custom/default price
- Result stored in `selectedOption.price` as **full IDR amount** (e.g., 250000, NOT 250)

### 3. Integration with Lead System

When creating a booking for a **lead-based member**, pass the full price:

```typescript
// Example integration (to be added where lead-based flow is triggered)
const isLeadBased = await leadGenerationService.isLeadBasedMember(
    therapistId,
    providerType as 'therapist' | 'massage_place' | 'facial_place'
);

if (isLeadBased) {
    // Create lead with full booking price (NOT divided by 1000)
    await leadGenerationService.createLead({
        memberId: therapistId,
        memberType: providerType as 'therapist' | 'massage_place' | 'facial_place',
        memberName: therapistName,
        memberWhatsApp: therapistWhatsApp, // Get from provider data
        customerName: customerName.trim(),
        customerWhatsApp: `${countryCode}${customerWhatsApp.trim()}`.replace(/\s/g, ''),
        serviceType: 'massage',
        duration: selectedOption.duration,
        bookingPrice: selectedOption.price, // ✅ FULL price (e.g., 250000)
        requestedDateTime: now.toISOString(),
        // ... location details
    });
} else {
    // Regular subscription-based member: create booking normally
    await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
            // ... booking data
            price: Math.round(selectedOption.price / 1000), // Store as "K" format
        }
    );
}
```

---

## 📊 WhatsApp Message Format

When a lead is sent to a member, they see:

```
🎯 NEW BOOKING LEAD - INDASTREET

💆 MASSAGE SERVICE REQUEST

👤 Customer: John Doe
📱 WhatsApp: +62812345678
📍 Location: Hotel Seminyak - Room 302
⏰ Requested: 2025-12-10 at 14:00
⏱️ Duration: 90 minutes
💵 Booking Price: Rp 350,000 ← Full booking price shown

💰 LEAD COST: Rp 87,500 (25% of booking) ← Calculated 25%
   (Billed ONLY if you accept)

✅ ACCEPT LEAD (Rp 87,500 will be charged):
   https://indastreet.id/lead/accept/abc123?token=xyz789

❌ DECLINE LEAD (No charge):
   https://indastreet.id/lead/decline/abc123?token=xyz789
```

---

## ✅ Verification Checklist

To ensure the 25% lead cost works correctly with custom pricing and discounts:

- [x] **leadGenerationService.calculateLeadCost()** method created
- [x] **createLead()** accepts `bookingPrice` parameter
- [x] Lead cost calculated as `Math.round(bookingPrice * 0.25)`
- [x] **sendLeadWhatsApp()** displays both booking price and calculated lead cost
- [x] **updateBillingSummary()** sums actual `leadCost` from each lead
- [x] **LeadAcceptPage** shows dynamic `lead.leadCost` instead of fixed constant
- [x] **BookingPopup** calculates final price including custom pricing + discounts
- [ ] **Integration point**: Pass `selectedOption.price` (full amount) as `bookingPrice` when creating leads

---

## 🚨 Critical: Booking vs Lead Price Format

**Important distinction:**

| Context | Field | Format | Example | Usage |
|---------|-------|--------|---------|-------|
| **Booking** | `price` | Divided by 1000 ("K" format) | 250 | Display in UI as "250K" |
| **Lead** | `bookingPrice` | Full IDR amount | 250000 | Calculate 25% = 62,500 |
| **Lead** | `leadCost` | Full IDR amount | 62500 | Charge member this amount |

**When calling `createLead()`, always pass the FULL price:**
```typescript
// ✅ CORRECT
bookingPrice: selectedOption.price  // e.g., 250000

// ❌ WRONG
bookingPrice: selectedOption.price / 1000  // e.g., 250
```

---

## 📝 Documentation Updated

The following documentation files have been updated to reflect 25% dynamic pricing:

1. ✅ `lib/appwriteService.ts` - leadGenerationService implementation
2. ✅ `pages/LeadAcceptPage.tsx` - Display dynamic lead cost
3. ✅ `MEMBERSHIP_AGREEMENT_SYSTEM.md` - Updated pricing descriptions
4. ✅ `LEAD_GENERATION_SYSTEM_COMPLETE.md` - Updated system overview
5. ✅ `AUTOMATED_PAYMENT_REMINDERS_STRIPE.md` - Updated warnings

---

## 🎯 Testing Scenarios

To verify the system works correctly:

1. **Default Pricing + No Discount**
   - Book 60min service
   - Expected booking price: 250,000 IDR
   - Expected lead cost: 62,500 IDR (25%)

2. **Custom Pricing (Higher)**
   - Member sets 60min = 300,000 IDR
   - Customer books 60min
   - Expected lead cost: 75,000 IDR (25%)

3. **Discount Active (20% off)**
   - Default 60min = 250,000 IDR
   - 20% discount applied = 200,000 IDR
   - Expected lead cost: 50,000 IDR (25% of discounted)

4. **Custom Pricing + Discount**
   - Member sets 90min = 400,000 IDR
   - 15% discount applied = 340,000 IDR
   - Expected lead cost: 85,000 IDR (25% of final)

---

## 🔄 Migration Notes

**Existing Leads:**
- Old leads created before this change will have `leadCost: 50000` (fixed)
- New leads will have dynamically calculated `leadCost` based on 25%
- Billing summary correctly handles both by summing actual `leadCost` from each lead

**No database migration needed** - the system gracefully handles both old and new lead formats.
