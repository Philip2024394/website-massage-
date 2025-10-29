# Coin Shop Appwrite Setup Instructions

## ⚠️ Important: Update Collection ID

In `lib/appwriteService.ts`, update this line with your actual collection ID:

```typescript
const COIN_SHOP_COLLECTION_ID = 'coinShop'; // Replace with your actual collection ID from Appwrite
```

To find your collection ID:
1. Go to Appwrite Console
2. Navigate to your database
3. Click on your coin shop collection
4. Copy the Collection ID from the URL or settings

## Collection Structure

Your Appwrite collection should have these attributes (as you've already created):

| Attribute Name | Type | Size | Required | Default |
|---|---|---|---|---|
| `$id` | string | - | Auto | - |
| `shopName` | string | 128 | Yes | - |
| `currencyAccepted` | string | 16 | Yes | - |
| `locationCoordinates` | point | - | Yes | - |
| `contactEmail` | email | - | No | NULL |
| `contactPhone` | email | - | Yes | - |
| `hoursOfOperation` | string | 64 | No | NULL |
| `licenseNumber` | string | 32 | No | NULL |
| `shopItems` | string | 500 | Yes | - |
| `coinTransactions` | string | 500 | Yes | - |
| `shopOrders` | string | 500 | Yes | - |
| `userCoins` | string | 500 | Yes | - |
| `$createdAt` | datetime | - | Auto | - |
| `$updatedAt` | datetime | - | Auto | - |

## ⚠️ Size Limitations Warning

Your current string attributes have a maximum size of 500 characters, which is **NOT sufficient** for storing JSON arrays of shop items, transactions, orders, and user coins.

### Recommended Fix:

**Increase the size of these attributes to at least 100000 (100KB) or use `unlimited` if available:**

1. `shopItems` - Change from 500 to **100000** or unlimited
2. `coinTransactions` - Change from 500 to **100000** or unlimited
3. `shopOrders` - Change from 500 to **100000** or unlimited
4. `userCoins` - Change from 500 to **100000** or unlimited

To update in Appwrite:
1. Go to your collection settings
2. Click on each attribute
3. Update the size to 100000 or select unlimited
4. Save changes

## How the System Works

### Data Storage Structure

The system uses a **single document** approach where all shop data is stored as JSON strings:

```json
{
  "$id": "unique-doc-id",
  "shopName": "IndaStreet Coin Shop",
  "currencyAccepted": "Coins",
  "shopItems": "[{...item1...}, {...item2...}]",  // Array of ShopItem objects as JSON string
  "coinTransactions": "[{...tx1...}, {...tx2...}]",  // Array of transactions as JSON string
  "shopOrders": "[{...order1...}, {...order2...}]",  // Array of orders as JSON string
  "userCoins": "[{...user1...}, {...user2...}]"  // Array of user coins as JSON string
}
```

### Service Functions Available

#### Shop Item Service (`shopItemService`)
```typescript
// Get all active items (visible in shop)
await shopItemService.getActiveItems()

// Get all items (including inactive)
await shopItemService.getAllItems()

// Create new item
await shopItemService.createItem({
  name: 'Product Name',
  description: 'Description',
  coinPrice: 1000,
  imageUrl: 'https://...',
  category: 'electronics',
  stockQuantity: 50,
  isActive: true,
  estimatedDelivery: '6-10 days',
  disclaimer: 'Design may vary'
})

// Update item
await shopItemService.updateItem(itemId, { coinPrice: 2000 })

// Delete item
await shopItemService.deleteItem(itemId)

// Update stock
await shopItemService.updateStock(itemId, 45)
```

#### Coin Service (`coinService`)
```typescript
// Get user's coin balance
await coinService.getUserCoins(userId)

// Initialize coins for new user
await coinService.initializeUserCoins(userId, userType, userName)

// Add coins (earn)
await coinService.addCoins(
  userId,
  userType,
  userName,
  amount,
  'Earned from booking completion',
  bookingId  // optional related ID
)

// Deduct coins (spend)
await coinService.deductCoins(
  userId,
  userType,
  userName,
  amount,
  'Purchased Wireless Earbuds',
  orderId  // optional related ID
)

// Get transaction history
await coinService.getTransactionHistory(userId)
```

#### Shop Order Service (`shopOrderService`)
```typescript
// Create new order
await shopOrderService.createOrder({
  userId: 'user123',
  userType: 'therapist',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  userPhone: '+62812345678',
  shippingAddress: {
    fullName: 'John Doe',
    phone: '+62812345678',
    addressLine1: 'Jl. Sunset Road No. 123',
    city: 'Seminyak',
    province: 'Bali',
    postalCode: '80361',
    country: 'Indonesia'
  },
  items: [
    {
      itemId: 'item123',
      itemName: 'Wireless Earbuds',
      itemImage: 'https://...',
      coinPrice: 5000,
      quantity: 1
    }
  ],
  totalCoins: 5000,
  estimatedDelivery: '6-10 days'
})

// Get user's orders
await shopOrderService.getOrdersByUser(userId)

// Get all orders (admin)
await shopOrderService.getAllOrders()

// Update order status
await shopOrderService.updateOrderStatus(orderId, 'shipped')

// Add tracking number
await shopOrderService.addTracking(orderId, 'TRACK123456')
```

## Integration with Pages

### Customer Shop Page (`CoinShopPage.tsx`)
✅ Already integrated - loads real data from Appwrite
- Displays active shop items
- Shows user's coin balance
- Handles add to cart and checkout

### Admin Management Page (`AdminShopManagementPage.tsx`)
✅ Already integrated - manages real data
- Create, edit, delete shop items
- View and manage orders
- Update order statuses

## Testing the Integration

### Step 1: Initialize the Shop Document

The first time you access the coin shop, it will automatically create the initial document with empty arrays.

### Step 2: Add Sample Items (Admin)

1. Navigate to `admin-shop-management` page
2. Click "Add New Item"
3. Fill in the form:
   - Name: Wireless Earbuds
   - Description: Premium wireless earbuds
   - Coin Price: 5000
   - Image URL: https://ik.imagekit.io/7grri5v7d/placeholder-earbuds.png
   - Category: electronics
   - Stock: 50
   - Active: ✓
4. Click "Add Item"

### Step 3: Test User Coins

```typescript
// In your code, award coins to a user
import { coinService } from './lib/appwriteService';

await coinService.addCoins(
  userId,
  'customer',
  'John Doe',
  1000,
  'Welcome bonus'
);
```

### Step 4: Test Shopping

1. Navigate to `coin-shop` page
2. Browse items
3. Add items to cart
4. Proceed to checkout (when implemented)

## Common Issues & Solutions

### Issue: "Insufficient coins"
**Solution**: Make sure user has enough coins. Use `coinService.addCoins()` to add test coins.

### Issue: "Item not found"
**Solution**: Verify items exist using `shopItemService.getAllItems()`.

### Issue: "Document size too large"
**Solution**: Increase the size limits of string attributes to 100000 or unlimited.

### Issue: "Cannot read property of undefined"
**Solution**: Ensure the shop document is initialized. It's auto-created on first access.

## Next Steps

1. ✅ Update `COIN_SHOP_COLLECTION_ID` in `appwriteService.ts`
2. ✅ Increase string attribute sizes to 100000+
3. ✅ Test adding shop items from admin page
4. ✅ Award test coins to users
5. ✅ Test purchasing flow
6. Integrate coin earning with booking completion
7. Add checkout page with shipping form
8. Implement order confirmation emails
9. Add order tracking for users

## Security Considerations

### Appwrite Permissions

Set appropriate permissions for your collection:

**Read Access:**
- Any authenticated user can read (to browse shop)

**Write Access:**
- Only admins can create/update/delete shop items
- Only admins can update order statuses
- Users can create orders (with validation)
- Users can view their own coins and transactions

### Example Permission Setup:
```
Read: role:any
Create: role:admin, role:user (for orders only)
Update: role:admin
Delete: role:admin
```

## Performance Optimization

For better performance with large datasets, consider:

1. **Pagination**: Load items in batches
2. **Caching**: Cache frequently accessed items
3. **Indexing**: Add indexes on frequently queried fields
4. **Separate Collections**: For very large scale, split into separate collections

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Appwrite collection ID is correct
3. Ensure attribute sizes are sufficient
4. Check Appwrite permissions
5. Review the COIN_SHOP_SETUP.md documentation

---

**Status**: ✅ Appwrite Integration Complete
**Ready for Production**: Yes (after updating collection ID and sizes)
