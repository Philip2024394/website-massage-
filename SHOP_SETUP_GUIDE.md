# Shop Items Collection Setup Guide

## Issue: "Error saving item. Please try again."

This error occurs when the Appwrite collection for shop items doesn't exist or isn't properly configured.

---

## 🔍 Debugging Steps

### 1. Check Browser Console
Open your browser's developer console (F12) and look for detailed error messages when you try to save a shop item. The enhanced logging will show:

```
Creating shop item with data: {name: "...", description: "...", ...}
Using database ID: 68f23b11000d25eb3664
Using collection ID: shopitems
Error details: {message: "...", code: 404, type: "...", response: "..."}
```

### 2. Common Error Codes

- **404 (Not Found)**: Collection `shopitems` doesn't exist
- **401 (Unauthorized)**: Permission issues or not logged in
- **400 (Bad Request)**: Invalid data format or missing required fields
- **500 (Server Error)**: Appwrite server issue

---

## 🛠️ Solution: Create Shop Items Collection in Appwrite

### Step 1: Access Appwrite Console
1. Go to your Appwrite console: `https://syd.cloud.appwrite.io`
2. Log in with your admin credentials
3. Navigate to your database: `68f23b11000d25eb3664`

### Step 2: Create Collection
1. Click **"Create Collection"**
2. **Collection ID**: `shopitems` (must match exactly!)
3. **Collection Name**: `Shop Items` (can be anything)
4. Click **"Create"**

### Step 3: Add Attributes (Fields)

Add these attributes to the `shopitems` collection:

#### Required String Attributes
| Attribute Key | Type | Size | Required | Default |
|--------------|------|------|----------|---------|
| `name` | String | 255 | ✅ Yes | - |
| `description` | String | 1000 | ✅ Yes | - |
| `imageUrl` | String | 500 | ❌ No | - |
| `category` | String | 50 | ❌ No | `other` |
| `estimatedDelivery` | String | 100 | ❌ No | `6-10 days` |
| `disclaimer` | String | 500 | ❌ No | `Design may vary slightly from displayed image` |

#### Required Number Attributes
| Attribute Key | Type | Min | Max | Required | Default |
|--------------|------|-----|-----|----------|---------|
| `coinPrice` | Integer | 0 | 999999 | ✅ Yes | - |
| `stockQuantity` | Integer | 0 | 999999 | ❌ No | 0 |

#### Required Boolean Attributes
| Attribute Key | Type | Required | Default |
|--------------|------|----------|---------|
| `isActive` | Boolean | ❌ No | `true` |

### Step 4: Configure Permissions

**Important:** Set proper permissions for the collection.

#### For Admin-Only Access:
1. Go to **Settings** tab in the collection
2. Under **Permissions**, add:
   - **Read Access**: `role:all` (anyone can view items)
   - **Create Access**: `role:admin` or your admin user ID
   - **Update Access**: `role:admin` or your admin user ID
   - **Delete Access**: `role:admin` or your admin user ID

#### For Public Read + Admin Write:
1. **Read Access**: Leave empty or add `role:all` (public read)
2. **Create Access**: Add your admin user ID or session ID
3. **Update Access**: Add your admin user ID or session ID
4. **Delete Access**: Add your admin user ID or session ID

---

## 🔧 Quick Fix: Using Appwrite CLI (Advanced)

If you have Appwrite CLI installed, you can create the collection automatically:

```bash
# Create collection
appwrite databases createCollection \
  --databaseId 68f23b11000d25eb3664 \
  --collectionId shopitems \
  --name "Shop Items" \
  --permissions "read(\"role:all\")" "create(\"role:admin\")" "update(\"role:admin\")" "delete(\"role:admin\")"

# Add attributes
appwrite databases createStringAttribute \
  --databaseId 68f23b11000d25eb3664 \
  --collectionId shopitems \
  --key name \
  --size 255 \
  --required true

appwrite databases createStringAttribute \
  --databaseId 68f23b11000d25eb3664 \
  --collectionId shopitems \
  --key description \
  --size 1000 \
  --required true

appwrite databases createIntegerAttribute \
  --databaseId 68f23b11000d25eb3664 \
  --collectionId shopitems \
  --key coinPrice \
  --required true \
  --min 0 \
  --max 999999

# ... (add remaining attributes)
```

---

## ✅ Verification Steps

### Test 1: Check Collection Exists
1. Go to Appwrite Console
2. Navigate to Database `68f23b11000d25eb3664`
3. Look for collection with ID `shopitems`
4. Verify all 9 attributes are created

### Test 2: Test Creating Item Manually
1. In Appwrite Console, go to `shopitems` collection
2. Click **"Add Document"**
3. Fill in the fields:
   ```json
   {
     "name": "Test Item",
     "description": "Test description",
     "coinPrice": 100,
     "imageUrl": "https://example.com/image.jpg",
     "category": "other",
     "stockQuantity": 10,
     "isActive": true,
     "estimatedDelivery": "6-10 days",
     "disclaimer": "Design may vary slightly from displayed image"
   }
   ```
4. Click **"Create"**
5. If successful, the collection is set up correctly!

### Test 3: Test from Admin Dashboard
1. Log in to admin dashboard
2. Go to **Shop** tab
3. Click **"Add Item"**
4. Fill in all fields:
   - Name: `Test Product`
   - Description: `Test description`
   - Coin Price: `100`
   - Category: Select any
   - Stock Quantity: `10`
   - Image URL: `https://via.placeholder.com/300`
5. Click **"Save Item"**
6. Check browser console for detailed logs
7. If successful, you'll see: `Shop item created successfully: {...}`

---

## 🐛 Troubleshooting

### Error: "Collection with ID shopitems not found"
**Solution:** Create the collection with exact ID `shopitems` (all lowercase, no spaces)

### Error: "Missing required attribute: name"
**Solution:** Make sure `name`, `description`, and `coinPrice` are marked as **Required** in collection settings

### Error: "Invalid permissions"
**Solution:** 
1. Add your admin user ID to Create/Update/Delete permissions
2. Or use `role:admin` if you have admin role configured

### Error: "Document ID already exists"
**Solution:** This shouldn't happen as we use `ID.unique()`, but if it does:
1. Check if there are duplicate IDs in the collection
2. Delete any test documents
3. Try again

### Still Getting Errors?
1. Open browser console (F12)
2. Try saving an item
3. Copy the full error message from console
4. Check the error code and message
5. Common fixes:
   - **401**: Log out and log back in as admin
   - **404**: Collection doesn't exist - create it
   - **400**: Check all required fields are filled
   - **500**: Check Appwrite server status

---

## 📋 Complete Collection Schema

```typescript
interface ShopItem {
  $id: string;                    // Auto-generated by Appwrite
  name: string;                   // REQUIRED
  description: string;            // REQUIRED
  coinPrice: number;              // REQUIRED
  imageUrl?: string;              // Optional
  category?: string;              // Optional (default: 'other')
  stockQuantity?: number;         // Optional (default: 0)
  isActive?: boolean;             // Optional (default: true)
  estimatedDelivery?: string;     // Optional (default: '6-10 days')
  disclaimer?: string;            // Optional (default: 'Design may vary...')
  $createdAt: string;             // Auto-generated
  $updatedAt: string;             // Auto-generated
}
```

---

## 🎯 What Changed in the Code

### Enhanced Error Handling
1. **Validation**: Now checks if required fields are filled before saving
2. **Detailed Logging**: Console logs show exactly what's being sent to Appwrite
3. **Better Error Messages**: Shows specific error codes and helpful messages
4. **Success Confirmation**: Shows success alert when item is saved

### Console Logs You'll See

#### When Creating:
```
Saving shop item: {name: "...", description: "...", coinPrice: 100, ...}
Creating new item
Creating shop item with data: {...}
Using database ID: 68f23b11000d25eb3664
Using collection ID: shopitems
Shop item created successfully: {...}
```

#### When Updating:
```
Saving shop item: {...}
Updating item: 67abc123...
Updating shop item: 67abc123... with data: {...}
Shop item updated successfully: {...}
```

#### On Error:
```
Error creating item: AppwriteException {...}
Error details: {
  message: "Collection with the requested ID could not be found.",
  code: 404,
  type: "collection_not_found",
  response: {...}
}
```

---

## ✨ Summary

**The fix includes:**
1. ✅ Input validation (checks required fields)
2. ✅ Detailed console logging (see exactly what's happening)
3. ✅ Better error messages (tells you what went wrong)
4. ✅ Success confirmation (know when it works)

**Next step:** Create the `shopitems` collection in Appwrite following the guide above!

Once the collection is created with the correct attributes and permissions, saving shop items will work perfectly. The enhanced logging will help you debug any remaining issues.
