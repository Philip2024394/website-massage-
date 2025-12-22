# Discount Codes Collection Setup

## Collection Details
**Collection Name:** `discount_codes`
**Collection ID:** `discount_codes`

## Attributes

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| code | String | 50 | ✅ Yes | - |
| memberId | String | 255 | ✅ Yes | - |
| memberName | String | 255 | ✅ Yes | - |
| memberType | String | 50 | ✅ Yes | - |
| customerId | String | 255 | ✅ Yes | - |
| customerName | String | 255 | ✅ Yes | - |
| percentage | Integer | - | ✅ Yes | - |
| bannerUrl | String | 500 | ✅ Yes | - |
| message | String | 1000 | ❌ No | - |
| expiresAt | String | 255 | ✅ Yes | - |
| used | Boolean | - | ✅ Yes | false |
| usedAt | String | 255 | ❌ No | - |
| createdAt | String | 255 | ❌ No | - |

## Indexes

1. **code_idx** → `code` (ASC) - For quick code lookup
2. **customerId_idx** → `customerId` (ASC) - For customer discount list
3. **memberId_idx** → `memberId` (ASC) - For member statistics
4. **used_idx** → `used` (ASC) - For filtering active/used codes
5. **expiresAt_idx** → `expiresAt` (ASC) - For cleanup and validation

## Permissions
- All operations: `role:all`

## Banner Image URLs

Upload your 4 discount banners to ImageKit at:
- `https://ik.imagekit.io/7grri5v7d/discount-5-percent.png`
- `https://ik.imagekit.io/7grri5v7d/discount-10-percent.png`
- `https://ik.imagekit.io/7grri5v7d/discount-15-percent.png`
- `https://ik.imagekit.io/7grri5v7d/discount-20-percent.png`

Update these URLs in `components/DiscountBannerSelector.tsx` if different.

## Features Implemented

✅ **Discount Banner Selector Modal** - Beautiful UI to select 5%, 10%, 15%, 20% discounts
✅ **Review Chat Bubbles** - Reviews appear as special yellow bubbles with star ratings
✅ **Send Thank You Discount Button** - One-click to send discount after review
✅ **Gift Button in Chat Footer** - Quick access to send discounts anytime
✅ **Discount Code Generation** - Unique codes with format: `TH10-ABC1-XYZ123`
✅ **30-Day Expiry** - Automatic expiration tracking
✅ **Usage Tracking** - Track sent/used/expired discounts
✅ **Member Statistics** - Redemption rate analytics

## How It Works

### 1. Customer Leaves Review
When a customer leaves a review, the system automatically creates a message in the member's chat with:
- Yellow review bubble with star rating
- Review text
- "Send Thank You Discount" button

### 2. Member Sends Discount
1. Member clicks "Send Thank You Discount" or Gift button
2. Modal opens with 4 discount options (5%, 10%, 15%, 20%)
3. Member selects percentage and confirms
4. System generates unique discount code
5. Discount banner + code sent to customer in chat
6. Code saved in database for validation at checkout

### 3. Customer Uses Discount
1. Customer sees discount banner in chat
2. Code displayed in message
3. At checkout, customer enters code
4. System validates: correct customer, not used, not expired
5. Discount applied to booking
6. Code marked as "used" in database

## Testing Checklist

- [ ] Create `discount_codes` collection in Appwrite
- [ ] Upload 4 discount banner images to ImageKit
- [ ] Update banner URLs in DiscountBannerSelector.tsx
- [ ] Test opening discount selector modal
- [ ] Test selecting each percentage (5%, 10%, 15%, 20%)
- [ ] Test sending discount (check chat and database)
- [ ] Test review bubble appearance (simulate review message)
- [ ] Test clicking "Send Thank You Discount" from review bubble
- [ ] Test Gift button in chat footer
- [ ] Verify discount code generation format
- [ ] Test discount code validation at checkout
- [ ] Test expiry (change expiresAt to past date)
- [ ] Test usage tracking (mark code as used)
- [ ] View member statistics

## Next Steps

1. **Integrate with Review System** - When customer submits review, automatically create review chat bubble
2. **Checkout Integration** - Add discount code input field in booking checkout
3. **Member Dashboard** - Show discount statistics (sent, redeemed, redemption rate)
4. **Customer Discount View** - Show active discounts in customer account

## Code Locations

- **Discount Selector Component:** `components/DiscountBannerSelector.tsx`
- **Discount Service:** `lib/appwrite/services/discountCodes.service.ts`
- **Therapist Chat (Updated):** `apps/therapist-dashboard/src/pages/TherapistChat.tsx`

## Support

For issues or questions, check:
1. Browser console for errors
2. Appwrite database logs
3. Network tab for API calls
4. Message interface fields match database schema
