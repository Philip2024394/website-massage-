# Marketplace Appwrite Collection Setup

## Required Collections

### 1. marketplace_products

**Attributes:**
- `name` - String (required) - Product name
- `description` - String - Product description
- `image` - String - Main product image URL
- `images` - String[] (array) - Gallery of up to 5 images
- `whatYouWillReceive` - String - Detailed description
- `videoUrl` - String - YouTube video URL (optional)
- `price` - Float or Integer (required) - Product price
- `currency` - String - Currency code (e.g., "USD", "IDR")
- `stockLevel` - Integer - Available stock quantity
- `sellerId` - String (required) - Reference to marketplace_sellers $id
- `countryCode` - String - ISO country code (e.g., "ID", "US")
- `lat` - String - Latitude as string (not number/double)
- `lng` - String - Longitude as string (not number/double)
- `isActive` - Boolean - Product visibility status

**Permissions:**
- Create: Users (role:users)
- Read: Any (role:any) 
- Update: Users (role:users)
- Delete: Users (role:users)

**Important Notes:**
- ⚠️ `lat` and `lng` MUST be String type, NOT Float/Double (Appwrite doesn't support double)
- The code converts numbers to strings when saving
- The code parses strings back to numbers when calculating distances

### 2. marketplace_sellers

**Attributes:**
- `sellerId` - String (required) - User ID of the seller
- `storeName` - String (required) - Store name
- `storeDescription` - String - Store description
- `totalSales` - Integer - Total number of sales
- `joinDate` - String (datetime) - When seller joined
- `isVerified` - Boolean - Verification status
- `categories` - String - Product categories (JSON)
- `tradingName` - String (required) - Business trading name
- `whatsapp` - String - WhatsApp contact number
- `profileImage` - String - Seller profile image URL
- `countryCode` - String - Seller's country
- `lat` - String - Seller location latitude (string)
- `lng` - String - Seller location longitude (string)
- `salesMode` - String - "local" or "global"
- `shippingRates` - String - JSON object of country codes to shipping fees
- `acceptedPayments` - String - JSON array of payment methods
- `websiteUrl` - String - Seller's website
- `ownerUserId` - String - Appwrite user ID
- `ownerEmail` - String - Seller email
- `planTier` - String - "local" or "global"
- `subscriptionStatus` - String - "trial" or "active"
- `trialEndsAt` - String (datetime) - Trial expiration

**Permissions:**
- Create: Users (role:users)
- Read: Any (role:any)
- Update: Users (role:users)
- Delete: Users (role:users)

### 3. admin_notifications

**Attributes:**
- `type` - String - Notification type
- `message` - String - Notification message
- `metadata` - String - Additional data (JSON)
- `isRead` - Boolean - Read status
- `createdAt` - String (datetime) - Creation timestamp

**Permissions:**
- Create: Users (role:users)
- Read: Any (role:any)
- Update: Any (role:any)

## Common Setup Issues

### Error: "viewer coords is not defined"
**Cause:** User's location (lat/lng) not properly set when entering marketplace
**Solution:** Ensure location is detected on landing page before navigation

### Error: "Collection not found" (404)
**Cause:** Collection ID mismatch or collection doesn't exist
**Solution:** 
1. Check collection IDs in `lib/appwrite.config.ts`
2. Verify collections exist in Appwrite Console

### Error: "Unauthorized" (401)
**Cause:** Missing permissions on collection
**Solution:** Add Users role permissions (Create/Read/Update/Delete) to both collections

### Products not showing distance
**Cause:** lat/lng stored as wrong type or empty
**Solution:**
1. Confirm lat/lng are String type in Appwrite
2. Check products have valid lat/lng values
3. Ensure userLocation has valid coordinates

## Testing Checklist

- [ ] Create marketplace_products collection with all attributes
- [ ] Create marketplace_sellers collection with all attributes  
- [ ] Create admin_notifications collection
- [ ] Set correct permissions (Users can Create/Read/Update/Delete)
- [ ] Verify lat/lng are String type (not Float/Double)
- [ ] Test product creation from seller dashboard
- [ ] Verify products appear in marketplace
- [ ] Check distance calculation works (if lat/lng valid)
- [ ] Test with both local and global sales modes
