# Hotel/Villa Special Pricing Feature

## Overview
This feature allows therapists and massage places to set different pricing for hotel/villa live menu displays compared to regular customer pricing. **Hotel/villa prices can be set lower than regular prices or up to 20% higher, but cannot exceed the 20% increase limit.**

## Pricing Rules

### Maximum Increase: 20%
- Hotel/villa prices **cannot** be more than 20% higher than regular prices
- Hotel/villa prices **can** be lower than regular prices (any amount)
- Hotel/villa prices **can** be the same as regular prices (checkbox option)

### Examples
```
Regular Price: Rp 250,000 (60 min)
✅ Allowed: Rp 300,000 (20% increase)
✅ Allowed: Rp 200,000 (lower)
✅ Allowed: Rp 250,000 (same)
❌ Not Allowed: Rp 350,000 (40% increase)
```

### Automatic Capping
If a user tries to enter a price higher than 20% increase, the system automatically caps it at the maximum allowed value.

## Changes Made

### 1. Type Definitions (`types.ts`)

Added optional `hotelVillaPricing` field to both `Therapist` and `Place` interfaces:

```typescript
export interface Therapist {
    // ... existing fields
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
}

export interface Place {
    // ... existing fields
    hotelVillaPricing?: PricingString; // Special pricing for hotel/villa live menu (JSON string for Appwrite)
}
```

**Note**: The field is optional (`?`), which ensures backward compatibility. If not set, the regular `pricing` will be used as fallback.

### 2. Therapist Dashboard (`TherapistDashboardPage.tsx`)

#### State Management
- Added `hotelVillaPricing` state for storing hotel/villa prices
- Added `useSamePricing` checkbox state for convenience

#### Data Loading
- Loads `hotelVillaPricing` from database if exists
- Falls back to regular pricing if not set
- Sets `useSamePricing` to `true` if hotel/villa pricing doesn't exist

#### Data Saving
- Saves `hotelVillaPricing` only when `useSamePricing` is `false`
- If checkbox is checked, sends `undefined` to database (uses regular pricing)

#### Price Handlers
- `handlePriceChange`: Updates regular pricing, also updates hotel/villa pricing if `useSamePricing` is checked
- `handleHotelVillaPriceChange`: Updates hotel/villa pricing with 20% max increase validation
- `handleUseSamePricingChange`: Toggles checkbox and copies regular pricing when checked

**Validation Logic:**
```typescript
const regularPrice = pricing[duration];
const maxAllowedPrice = regularPrice * 1.2; // 20% increase max

if (numValue > maxAllowedPrice && regularPrice > 0) {
    numValue = Math.floor(maxAllowedPrice); // Auto-cap at 20%
}
```

#### UI Changes
Added new pricing section after regular pricing with:

**1. Section Header with Pricing Rules**
```tsx
<h3>Hotel/Villa Live Menu Pricing</h3>
<p>Set special prices for hotel/villa guests (max 20% increase, or lower)</p>
```

**2. Price Input Fields with Max Price Display**
- Shows "Max: Rp XXX" below each input when checkbox is unchecked
- Example: If regular price is Rp 250,000, shows "Max: 300k"
- Max price updates dynamically based on regular pricing

**3. Visual Layout:**

```
┌─────────────────────────────────────────┐
│ Regular Pricing                         │
│ [60min] [90min] [120min]                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Hotel/Villa Live Menu Pricing           │
│ Set special prices for hotel/villa     │
│ guests (max 20% increase, or lower)     │
│                      [✓] Same as regular│
│ [60min] [90min] [120min]                │
│ Max: 300k  Max: 420k  Max: 540k         │
└─────────────────────────────────────────┘
```

- Inputs are disabled (grayed out) when "Same as regular" is checked
- Max price indicators show below each input when unchecked
- Inputs use same currency formatting as regular pricing (Rp icon, 'k' suffix support)
- **Auto-capping**: If user enters price > 20% increase, it's automatically capped

### 3. Place Dashboard (`PlaceDashboardPage.tsx`)

Applied identical changes as TherapistDashboardPage:
- State management for `hotelVillaPricing` and `useSamePricing`
- Data loading/saving logic
- Price change handlers
- UI section for hotel/villa pricing

### 4. Features

#### Smart Defaults
- New profiles: Both pricing sections default to same values with checkbox checked
- Existing profiles without hotel/villa pricing: Automatically use regular pricing as default

#### Pricing Validation (NEW)
- **20% Maximum Increase Rule**: Hotel/villa prices cannot exceed 120% of regular price
- **Automatic Capping**: Values above limit are automatically reduced to max allowed
- **Visual Feedback**: Shows max allowed price below each input field
- **No Lower Limit**: Prices can be set lower than regular pricing (any amount)

#### User Experience
- **Checkbox enabled**: Hotel/villa inputs are disabled and match regular pricing
- **Checkbox disabled**: Hotel/villa inputs are editable with 20% max increase validation
- **Price updates**: When checkbox is on, changing regular prices updates both sections
- **Max price display**: Shows dynamically calculated maximum allowed price (e.g., "Max: 300k")

#### Data Persistence
- Saves to Appwrite as `hotelVillaPricing` field (JSON string)
- Only saved when different from regular pricing (optimizes storage)
- Optional field ensures backward compatibility

## Usage

### For Therapists/Places

1. **To use same pricing everywhere:**
   - Check "Same as regular" checkbox
   - Set regular prices only

2. **To set different hotel/villa prices:**
   - Uncheck "Same as regular" checkbox
   - Set regular prices (60/90/120 min)
   - Set hotel/villa prices (60/90/120 min)
     - **Note**: Maximum 20% increase from regular price
     - Can be lower than regular price
     - Max allowed price shown below each input
   - Click "Save Profile"

### For Developers

#### Reading Pricing
```typescript
// Get pricing for display (with fallback)
const displayPrice = therapist.hotelVillaPricing 
    ? parsePricing(therapist.hotelVillaPricing)
    : parsePricing(therapist.pricing);

// Or for specific duration
const price60min = therapist.hotelVillaPricing?.[60] || therapist.pricing[60];
```

#### Saving Pricing
```typescript
onSave({
    // ... other fields
    pricing: stringifyPricing(regularPricing),
    hotelVillaPricing: useSamePricing ? undefined : stringifyPricing(hotelVillaPricing),
});
```

## Next Steps

### Recommended Updates

1. **Update Hotel/Villa Menu Display Pages**
   - Modify `HotelDashboardPage.tsx` to use `hotelVillaPricing` when available
   - Modify `VillaDashboardPage.tsx` similarly
   - Add fallback: `provider.hotelVillaPricing || provider.pricing`

2. **Update Appwrite Schema** (if needed)
   - Add `hotelVillaPricing` attribute to `therapists` collection (optional, string)
   - Add `hotelVillaPricing` attribute to `places` collection (optional, string)

3. **Add Price Comparison Indicator** (optional enhancement)
   - Show price difference percentage in UI
   - Highlight if hotel/villa price is lower/higher than regular

4. **Add Warning Messages** (optional)
   - Show warning when approaching 20% limit
   - Notify user when price is auto-capped

## Pricing Validation Details

### Implementation

**Therapist Dashboard:**
```typescript
const handleHotelVillaPriceChange = (duration: keyof Pricing, value: string) => {
    let numValue = parseInt(cleanValue, 10);
    
    // Validate: Cannot exceed 20% increase
    const regularPrice = pricing[duration];
    const maxAllowedPrice = regularPrice * 1.2;
    
    if (numValue > maxAllowedPrice && regularPrice > 0) {
        numValue = Math.floor(maxAllowedPrice); // Auto-cap
    }
    
    setHotelVillaPricing(prev => ({ ...prev, [duration]: numValue }));
};
```

### Business Rules

1. **Maximum Increase: 20%**
   - If regular price = Rp 250,000
   - Max hotel/villa price = Rp 300,000 (250k × 1.2)

2. **No Minimum Limit**
   - Hotel/villa price can be Rp 0 or any value below regular price
   - Useful for promotional pricing

3. **Auto-Capping Behavior**
   - User enters: Rp 400,000 (60% increase)
   - System sets: Rp 300,000 (20% increase)
   - No error message shown, just silent correction

4. **Dynamic Max Price Display**
   - Updates when regular pricing changes
   - Only shown when checkbox is unchecked
   - Format: "Max: 300k" (uses formatPriceDisplay helper)

## Testing Checklist

- [ ] Therapist can set different hotel/villa pricing
- [ ] Massage place can set different hotel/villa pricing
- [ ] "Same as regular" checkbox works correctly
- [ ] Changing regular prices updates hotel/villa when checkbox is on
- [ ] Hotel/villa inputs are disabled when checkbox is on
- [ ] **Hotel/villa price cannot exceed 20% of regular price**
- [ ] **Hotel/villa price can be lower than regular price**
- [ ] **Max price displays correctly below each input**
- [ ] **Auto-capping works when entering too high a price**
- [ ] **Max price updates dynamically when regular price changes**
- [ ] Data saves correctly to Appwrite
- [ ] Data loads correctly from Appwrite
- [ ] Existing profiles without hotel/villa pricing work (fallback)
- [ ] Price formatting works (Rp icon, 'k' suffix)
- [ ] No TypeScript errors
- [ ] No console errors

## Database Schema

### Therapists Collection
```
hotelVillaPricing?: string  // JSON string: '{"60":250000,"90":350000,"120":450000}'
```

### Places Collection
```
hotelVillaPricing?: string  // JSON string: '{"60":250000,"90":350000,"120":450000}'
```

**Note**: Field is optional. If not present, use regular `pricing` field as fallback.
