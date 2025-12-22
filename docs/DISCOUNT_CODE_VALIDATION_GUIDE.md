# 🎟️ Discount Code Validation - Member Restriction

## Overview

Discount codes are **member-specific** and can **ONLY** be used with the therapist/massage place/facial place that created them. This prevents customers from using a discount code from one member with a different member.

## Validation Rules

### ✅ Valid Usage
- Customer uses discount code with the **same member** who sent it
- Customer uses discount code with the **same member type** (therapist/massage place/facial place)
- Discount code is **not expired**
- Discount code has **not been used** yet
- Customer ID matches (if specified)

### ❌ Invalid Usage
- ⛔ Customer tries to use therapist discount code with a massage place
- ⛔ Customer tries to use discount from "Therapist A" with "Therapist B"
- ⛔ Customer tries to use facial place discount with massage place
- ⛔ Discount code is expired
- ⛔ Discount code already used

## Implementation

### Updated Function Signature

```typescript
// Validate WITHOUT redeeming (for preview/UI)
validateDiscountCode(
  code: string,
  customerId: string,
  bookingMemberId: string,  // ⭐ Member customer is booking with
  bookingMemberType: 'therapist' | 'massage-place' | 'facial-place'
)

// Redeem discount (final checkout)
useDiscountCode(
  code: string,
  customerId: string,
  bookingMemberId?: string,  // ⭐ Member customer is booking with
  bookingMemberType?: 'therapist' | 'massage-place' | 'facial-place'
)
```

### Validation Logic

```typescript
// ⭐ Check 1: Member ID must match
if (discount.memberId !== bookingMemberId) {
  return { 
    valid: false, 
    error: `This discount is only valid with ${discount.memberName}` 
  };
}

// ⭐ Check 2: Member type must match
if (discount.memberType !== bookingMemberType) {
  return { 
    valid: false, 
    error: `This discount is only valid for ${memberType} services` 
  };
}
```

## Usage Examples

### Example 1: Booking Checkout Page

```typescript
import { validateDiscountCode, useDiscountCode } from '@/lib/appwrite/services/discountCodes.service';

// When user enters discount code
const handleApplyDiscount = async () => {
  const validation = await validateDiscountCode(
    discountCodeInput,
    currentUser.$id,
    therapist.$id,           // ⭐ Therapist being booked
    'therapist'              // ⭐ Member type
  );
  
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }
  
  // Show discount in UI
  setAppliedDiscount(validation.discount);
  const discountAmount = (bookingTotal * validation.discount.percentage) / 100;
  setFinalTotal(bookingTotal - discountAmount);
};

// When completing booking
const handleCompleteBooking = async () => {
  if (appliedDiscount) {
    const result = await useDiscountCode(
      appliedDiscount.code,
      currentUser.$id,
      therapist.$id,         // ⭐ Therapist being booked
      'therapist'
    );
    
    if (!result.valid) {
      showToast(result.error, 'error');
      return;
    }
  }
  
  // Process booking...
};
```

### Example 2: Massage Place Booking

```typescript
// Massage place booking
const validation = await validateDiscountCode(
  'MP10-ABC1-XYZ123',
  customerId,
  massagePlace.$id,        // ⭐ Massage place being booked
  'massage-place'          // ⭐ Must match discount.memberType
);

// ✅ Works if discount was created by THIS massage place
// ❌ Fails if discount was created by different member
```

### Example 3: Cross-Member Prevention

```typescript
// Scenario: Customer has discount from "Spa Therapist A"
// Customer tries to book with "Spa Therapist B"

const discount = {
  code: 'TH15-AAAA-ABC123',
  memberId: 'therapist-a-id',
  memberName: 'Spa Therapist A',
  memberType: 'therapist',
  percentage: 15
};

// Customer books with Therapist B
const result = await validateDiscountCode(
  'TH15-AAAA-ABC123',
  customerId,
  'therapist-b-id',        // ⭐ Different therapist
  'therapist'
);

// ❌ Result:
// {
//   valid: false,
//   error: "This discount is only valid with Spa Therapist A. Cannot be used with other members."
// }
```

### Example 4: Cross-Type Prevention

```typescript
// Scenario: Customer has discount from therapist
// Customer tries to use it at massage place

const discount = {
  code: 'TH20-BBBB-XYZ456',
  memberId: 'therapist-c-id',
  memberName: 'Mobile Therapist C',
  memberType: 'therapist',
  percentage: 20
};

// Customer books at massage place
const result = await validateDiscountCode(
  'TH20-BBBB-XYZ456',
  customerId,
  'massage-place-id',
  'massage-place'          // ⭐ Different member type
);

// ❌ Result:
// {
//   valid: false,
//   error: "This discount is only valid for therapist services."
// }
```

## UI Integration

### Discount Input Field

```tsx
<div className="discount-section">
  <label>Have a discount code?</label>
  <input
    type="text"
    placeholder="Enter code (e.g., TH10-ABC1-XYZ123)"
    value={discountCode}
    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
  />
  <button onClick={handleApplyDiscount}>Apply</button>
  
  {discountError && (
    <p className="text-red-500 text-sm mt-1">
      ❌ {discountError}
    </p>
  )}
  
  {appliedDiscount && (
    <div className="discount-applied bg-green-50 p-3 rounded mt-2">
      ✅ {appliedDiscount.percentage}% discount from {appliedDiscount.memberName}
      <button onClick={removeDiscount} className="text-red-500 ml-2">Remove</button>
    </div>
  )}
</div>
```

### Price Breakdown

```tsx
{appliedDiscount && (
  <div className="price-breakdown">
    <div className="flex justify-between">
      <span>Subtotal:</span>
      <span>Rp {subtotal.toLocaleString()}</span>
    </div>
    <div className="flex justify-between text-green-600">
      <span>Discount ({appliedDiscount.percentage}%):</span>
      <span>-Rp {discountAmount.toLocaleString()}</span>
    </div>
    <div className="flex justify-between font-bold text-lg border-t pt-2">
      <span>Total:</span>
      <span>Rp {finalTotal.toLocaleString()}</span>
    </div>
  </div>
)}
```

## Error Messages

| Error | Meaning |
|-------|---------|
| `Invalid discount code` | Code doesn't exist in database |
| `This discount code is no longer active` | Discount deactivated |
| `This discount is only valid with [Member Name]` | ⭐ Code used with wrong member |
| `This discount is only valid for [type] services` | ⭐ Code used with wrong member type |
| `This discount code is not for your account` | Code assigned to different customer |
| `This discount code has already been used` | Code already redeemed |
| `This discount code has expired` | Code past expiration date |

## Database Structure

Each discount code stores:

```typescript
{
  code: 'TH15-ABC1-XYZ123',
  memberId: 'therapist-123',         // ⭐ Creator's ID
  memberName: 'Spa Therapist A',     // ⭐ Creator's name
  memberType: 'therapist',           // ⭐ Creator's type
  customerId: 'customer-456',        // Recipient (optional)
  percentage: 15,
  used: false,
  isActive: true,
  startDate: '2025-12-22T00:00:00Z',
  endDate: '2026-01-22T00:00:00Z'
}
```

## Benefits

✅ **Prevents abuse** - Customers can't share discount codes between members  
✅ **Member loyalty** - Discounts drive customers back to same member  
✅ **Fair competition** - Members compete on their own merit  
✅ **Revenue protection** - Prevents unauthorized discount usage  
✅ **Customer trust** - Clear expectations about discount validity  

## Testing

```typescript
// Test 1: Same member (should pass)
await validateDiscountCode('TH10-ABC', userId, 'therapist-A', 'therapist');
// ✅ Valid

// Test 2: Different member (should fail)
await validateDiscountCode('TH10-ABC', userId, 'therapist-B', 'therapist');
// ❌ Error: "only valid with Therapist A"

// Test 3: Wrong type (should fail)
await validateDiscountCode('TH10-ABC', userId, 'place-123', 'massage-place');
// ❌ Error: "only valid for therapist services"
```

## Summary

🔒 **Discount codes are locked to the member who created them**  
🎯 **Cannot be used with other members**  
✅ **Validates both member ID and member type**  
🛡️ **Prevents cross-member discount abuse**  
💪 **Increases customer loyalty to specific members**
