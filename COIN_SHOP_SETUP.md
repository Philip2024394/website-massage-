# Coin Shop System - Complete Setup Guide

## Overview
The IndaStreet Coin Shop system allows users (customers, therapists, massage places, hotels, villas, and agents) to redeem accumulated coins for free gifts with free postage. Admin can manage shop items and orders.

## Features Implemented

### 1. **Shop Items Management** (`AdminShopManagementPage`)
- ✅ Add, edit, delete shop items
- ✅ Set coin prices for each item
- ✅ Manage stock quantities
- ✅ Categorize items (Electronics, Fashion, Wellness, Home, Gift Cards, Other)
- ✅ Upload product images
- ✅ Set delivery estimates (default: 6-10 days)
- ✅ Add disclaimers (design may vary)
- ✅ Enable/disable items visibility
- ✅ Free postage on all items

### 2. **Order Management** (`AdminShopManagementPage`)
- ✅ View all customer orders
- ✅ Track order status (Pending → Processing → Shipped → Delivered)
- ✅ View shipping addresses
- ✅ See items ordered and coin totals
- ✅ Cancel orders if needed
- ✅ Delivery tracking (6-10 days estimate)

### 3. **Customer Shop Interface** (`CoinShopPage`)
- ✅ Browse all available items
- ✅ Filter by category
- ✅ View coin balance
- ✅ Add items to cart
- ✅ Quantity selection
- ✅ Shopping cart with checkout
- ✅ Balance verification (ensure sufficient coins)
- ✅ Stock availability checks
- ✅ Clear disclaimers about delivery and design variations

## Data Types Added to `types.ts`

### `ShopItem`
```typescript
{
  id: number
  $id: string  // Appwrite ID
  name: string
  description: string
  coinPrice: number
  imageUrl: string
  category: 'electronics' | 'fashion' | 'wellness' | 'home' | 'gift_cards' | 'other'
  stockQuantity: number
  isActive: boolean
  estimatedDelivery: string
  disclaimer: string
  createdAt?: string
  updatedAt?: string
}
```

### `CoinTransaction`
```typescript
{
  id: number
  $id: string
  userId: string
  userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent'
  userName: string
  transactionType: 'earn' | 'spend' | 'bonus' | 'refund'
  amount: number  // Positive for earn, negative for spend
  description: string
  relatedId?: string  // Booking ID, order ID, etc.
  balanceBefore: number
  balanceAfter: number
  createdAt?: string
}
```

### `ShopOrder`
```typescript
{
  id: number
  $id: string
  orderNumber: string  // e.g., ORD-2025-001
  userId: string
  userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent'
  userName: string
  userEmail?: string
  userPhone?: string
  shippingAddress: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  items: Array<{
    itemId: string
    itemName: string
    itemImage: string
    coinPrice: number
    quantity: number
  }>
  totalCoins: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}
```

### `UserCoins`
```typescript
{
  userId: string
  userType: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent'
  userName: string
  totalCoins: number
  lifetimeEarned: number
  lifetimeSpent: number
  updatedAt?: string
}
```

## Navigation Setup

### Pages Added to App.tsx:
1. **`coin-shop`** - Customer-facing shop (all users)
2. **`admin-shop-management`** - Admin dashboard for managing items and orders

### How to Navigate:
```typescript
// From any page
onNavigate?.('coin-shop')  // Go to shop
onNavigate?.('admin-shop-management')  // Go to admin management
```

## Coin Earning System (To Be Integrated)

Users can earn coins through:
1. **Booking Completion** - Earn coins for completed massage bookings
2. **Reviews** - Bonus coins for leaving reviews
3. **Referrals** - Coins for referring new users
4. **Membership** - Monthly coin bonuses for members
5. **Welcome Bonus** - First-time user bonus
6. **Promotions** - Special event bonuses

## Important Business Rules

### ✅ Free Postage
- All items ship free of charge
- No shipping fees deducted from coins

### ✅ Delivery Timeline
- Standard: 6-10 days
- Can be customized per item by admin

### ✅ Stock Management
- Admin sets stock quantities
- Out of stock items automatically disabled
- Low stock warnings (< 10 items)

### ✅ Design Disclaimer
- "Design may vary slightly from displayed image"
- Limited stock availability
- Items subject to availability

### ✅ No Refunds
- All coin redemptions are final
- Coins cannot be refunded once order is placed

## Appwrite Database Collections Needed

### 1. **shopItems** Collection
```json
{
  "name": "String",
  "description": "String",
  "coinPrice": "Integer",
  "imageUrl": "String",
  "category": "String",
  "stockQuantity": "Integer",
  "isActive": "Boolean",
  "estimatedDelivery": "String",
  "disclaimer": "String",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### 2. **coinTransactions** Collection
```json
{
  "userId": "String",
  "userType": "String",
  "userName": "String",
  "transactionType": "String",
  "amount": "Integer",
  "description": "String",
  "relatedId": "String",
  "balanceBefore": "Integer",
  "balanceAfter": "Integer",
  "createdAt": "DateTime"
}
```

### 3. **shopOrders** Collection
```json
{
  "orderNumber": "String",
  "userId": "String",
  "userType": "String",
  "userName": "String",
  "userEmail": "String",
  "userPhone": "String",
  "shippingAddress": "JSON",
  "items": "JSON Array",
  "totalCoins": "Integer",
  "status": "String",
  "trackingNumber": "String",
  "shippedAt": "DateTime",
  "deliveredAt": "DateTime",
  "estimatedDelivery": "String",
  "notes": "String",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### 4. **userCoins** Collection
```json
{
  "userId": "String (unique)",
  "userType": "String",
  "userName": "String",
  "totalCoins": "Integer",
  "lifetimeEarned": "Integer",
  "lifetimeSpent": "Integer",
  "updatedAt": "DateTime"
}
```

## Next Steps - Appwrite Integration

### 1. Create Appwrite Service Functions
Add to `lib/appwriteService.ts`:

```typescript
// Shop Item Service
export const shopItemService = {
  async getActiveItems(): Promise<ShopItem[]> { },
  async getAllItems(): Promise<ShopItem[]> { },
  async createItem(item: Partial<ShopItem>): Promise<ShopItem> { },
  async updateItem(id: string, updates: Partial<ShopItem>): Promise<ShopItem> { },
  async deleteItem(id: string): Promise<void> { },
  async updateStock(id: string, quantity: number): Promise<void> { }
};

// Coin Service
export const coinService = {
  async getUserCoins(userId: string): Promise<UserCoins> { },
  async addCoins(userId: string, amount: number, description: string, relatedId?: string): Promise<CoinTransaction> { },
  async deductCoins(userId: string, amount: number, description: string, relatedId?: string): Promise<CoinTransaction> { },
  async getTransactionHistory(userId: string): Promise<CoinTransaction[]> { }
};

// Shop Order Service
export const shopOrderService = {
  async createOrder(order: Partial<ShopOrder>): Promise<ShopOrder> { },
  async getOrdersByUser(userId: string): Promise<ShopOrder[]> { },
  async getAllOrders(): Promise<ShopOrder[]> { },
  async updateOrderStatus(orderId: string, status: ShopOrder['status']): Promise<ShopOrder> { },
  async addTracking(orderId: string, trackingNumber: string): Promise<ShopOrder> { }
};
```

### 2. Add Shop Access to User Dashboards

#### Admin Dashboard
```typescript
// Add button to navigate to shop management
<button onClick={() => onNavigate?.('admin-shop-management')}>
  🛍️ Manage Shop
</button>
```

#### Therapist/Place/Customer Dashboards
```typescript
// Add coin balance display and shop button
<div className="coin-balance">
  🪙 {userCoins.toLocaleString()} Coins
  <button onClick={() => onNavigate?.('coin-shop')}>
    Shop Now
  </button>
</div>
```

### 3. Integrate Coin Earning
Connect existing booking/review systems to award coins automatically.

## User Experience Flow

### For Customers/Therapists/Places:
1. **Earn Coins** - Complete bookings, write reviews, refer friends
2. **Check Balance** - View coins in dashboard
3. **Browse Shop** - Navigate to coin shop
4. **Filter Items** - Choose category
5. **Add to Cart** - Select quantities
6. **Checkout** - Verify balance, enter shipping address
7. **Track Order** - Receive order number, track status

### For Admin:
1. **Add Items** - Upload products with prices and images
2. **Manage Stock** - Update quantities
3. **Process Orders** - View new orders
4. **Update Status** - Mark as processing/shipped/delivered
5. **Add Tracking** - Provide tracking numbers

## Mock Data Currently Used

The pages are functional with mock data. Replace with Appwrite calls:

### Shop Items (4 sample items)
- Wireless Earbuds (5000 coins)
- Massage Oil Set (2000 coins)
- IndaStreet T-Shirt (1500 coins)
- Spa Gift Card (8000 coins)

### User Balance (12,500 coins)
- Lifetime earned: 25,000
- Lifetime spent: 12,500

## Files Created

1. ✅ `types.ts` - Updated with new interfaces
2. ✅ `pages/CoinShopPage.tsx` - Customer shop interface
3. ✅ `pages/AdminShopManagementPage.tsx` - Admin management
4. ✅ `App.tsx` - Updated with routing

## Ready for Testing

You can now test the coin shop system:
1. Navigate to `/coin-shop` to see customer interface
2. Navigate to `/admin-shop-management` to see admin controls
3. All UI interactions work with mock data
4. Replace mock data with Appwrite integration for production

---

**Status**: ✅ UI Complete | ⏳ Appwrite Integration Pending
**Next Priority**: Create Appwrite collections and service functions
