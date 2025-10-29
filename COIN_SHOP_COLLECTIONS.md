# Coin Shop - Appwrite Collections Setup

## ✅ Created Collections

### 1. shopItems
**Collection ID:** `shopitems` (update in code later)

**Attributes:**
- `name` - String (255) - required
- `description` - String (1000) - required
- `coinPrice` - Integer
- `imageUrl` - String (500) - required
- `category` - String (50) - required
- `stockQuantity` - Integer
- `isActive` - Boolean
- `estimatedDelivery` - String (100) - required
- `disclaimer` - String (500) - required

---

## 📋 Collections to Create Later (When Needed)

### 2. coinTransactions
**Purpose:** Track all coin earning/spending transactions

**Attributes:**
- `userId` - String (100) - required
- `userType` - String (50) - required
- `userName` - String (255) - required
- `transactionType` - String (50) - required (earn/spend/bonus/refund)
- `amount` - Integer - required
- `description` - String (500) - required
- `relatedId` - String (100)
- `balanceBefore` - Integer - required
- `balanceAfter` - Integer - required

**Indexes to add:**
- `userId` (ascending) - for fast user lookups
- `$createdAt` (descending) - for sorting

---

### 3. shopOrders
**Purpose:** Store customer orders from the coin shop

**Attributes:**
- `orderNumber` - String (50) - required
- `userId` - String (100) - required
- `userType` - String (50) - required
- `userName` - String (255) - required
- `userEmail` - String (255)
- `userPhone` - String (50)
- `shippingAddress` - String (2000) - required (stores JSON)
- `items` - String (5000) - required (stores JSON array)
- `totalCoins` - Integer - required
- `status` - String (50) - required (pending/processing/shipped/delivered/cancelled)
- `trackingNumber` - String (100)
- `estimatedDelivery` - String (100) - required
- `notes` - String (1000)
- `shippedAt` - String (100)
- `deliveredAt` - String (100)

**Indexes to add:**
- `userId` (ascending) - for user order history
- `status` (ascending) - for admin filtering
- `$createdAt` (descending) - for sorting

---

### 4. userCoins
**Purpose:** Track each user's coin balance

**Attributes:**
- `userId` - String (100) - required
- `userType` - String (50) - required
- `userName` - String (255) - required
- `totalCoins` - Integer - required
- `lifetimeEarned` - Integer - required
- `lifetimeSpent` - Integer - required

**Indexes to add:**
- `userId` (ascending) - unique index for fast lookups

---

## 🔑 Update Collection IDs in Code

Once you create the other collections, update these in `lib/appwriteService.ts`:

```typescript
const SHOP_ITEMS_COLLECTION_ID = 'YOUR_SHOPITEMS_ID';
const COIN_TRANSACTIONS_COLLECTION_ID = 'YOUR_TRANSACTIONS_ID';
const SHOP_ORDERS_COLLECTION_ID = 'YOUR_ORDERS_ID';
const USER_COINS_COLLECTION_ID = 'YOUR_USERCOINS_ID';
```

## 🎯 What Works Now

With just `shopItems` collection:
- ✅ Admin can add/edit/delete shop items
- ✅ Users can view shop items by category
- ✅ Browse and filter products

## 🔮 What Needs Other Collections

- ⏳ User coin balance (needs `userCoins`)
- ⏳ Checkout/purchase (needs `userCoins`, `coinTransactions`, `shopOrders`)
- ⏳ Order history (needs `shopOrders`)
- ⏳ Transaction history (needs `coinTransactions`)

## 📝 Notes

- Each collection is separate (no JSON storage limits!)
- Much better performance than single document
- Easier to query and filter
- Can add indexes for faster searches
