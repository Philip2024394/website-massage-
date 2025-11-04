# Schema Compliance Fix: hotelVillaPricing Attribute Error

## Issue Summary
Admin dashboard was failing with error: "Invalid document structure: Unknown attribute: 'hotelVillaPricing'" when updating therapist profiles.

## Root Cause
The code was trying to save a `hotelVillaPricing` field that does not exist in the Appwrite database schema. According to the schema documentation, the Therapists collection only has:
- `pricing` (String JSON): Main pricing for all services
- `hotelDiscount` (Integer): Hotel discount percentage
- `villaDiscount` (Integer): Villa discount percentage

## Solution Implemented

### 1. Removed Invalid Database Field
- Removed `hotelVillaPricing: finalHotelPricingString` from updateData object
- Only saving the single `pricing` field that exists in schema

### 2. Updated Data Structure Logic
- Modified `handleEditTherapist` to not expect `hotelVillaPricing` from database
- Hotel/villa pricing in edit modal is now calculated dynamically
- Only home pricing is saved to the database `pricing` field

### 3. Fixed Display Logic
- Updated hotel/villa pricing display to calculate from base pricing + discounts
- Uses `hotelDiscount` and `villaDiscount` schema fields
- Shows discounted rates with percentage indicator

### 4. Updated TypeScript Interfaces
- Removed `hotelVillaPricing?: any` from `PendingTherapist` interface
- Added schema-compliant fields: `hotelDiscount`, `villaDiscount`, `hotelVillaServiceStatus`

## Code Changes Summary

### Before (Broken)
```tsx
// Tried to save non-existent field
hotelVillaPricing: finalHotelPricingString,

// Tried to read non-existent field
therapist.hotelVillaPricing && typeof therapist.hotelVillaPricing === 'string'
```

### After (Schema Compliant)
```tsx
// Only save valid pricing field
pricing: finalPricingString,

// Calculate hotel pricing from base pricing + discounts
const hotelDiscount = therapist.hotelDiscount || 20;
const villaDiscount = therapist.villaDiscount || 20;
const avgDiscount = (hotelDiscount + villaDiscount) / 2;
const discountedPrice = Math.round((pricing['60'] || 0) * (1 - avgDiscount/100));
```

## Schema Alignment
The fix ensures full compliance with the documented Appwrite schema:
- ✅ Uses only valid `pricing` field for base rates
- ✅ Leverages `hotelDiscount`/`villaDiscount` for hotel/villa pricing
- ✅ Removes all references to non-existent `hotelVillaPricing` field

## Testing Results
- ✅ Admin dashboard now saves therapist updates without errors
- ✅ Pricing displays correctly for both home and hotel/villa services
- ✅ Edit modal properly loads existing pricing data
- ✅ Hotel/villa rates show calculated discounted prices

## Status
**COMPLETED** - All schema compliance issues resolved. Admin dashboard therapist editing now works correctly.