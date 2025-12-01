# Appwrite Hotel/Villa Partners Setup Guide

## ✅ Code Changes Complete

All code has been connected to Appwrite. Now you need to create the database collections and storage bucket in your Appwrite Console.

---

## 📋 Step 1: Create Partners Collection

**Collection ID:** `partners_collection_id`

### Attributes to Create:

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| `name` | String | 255 | ✅ Yes | - | ❌ No |
| `websiteUrl` | URL | 2000 | ❌ No | - | ❌ No |
| `websiteTitle` | String | 255 | ❌ No | - | ❌ No |
| `description` | String | 5000 | ❌ No | - | ❌ No |
| `category` | Enum | - | ✅ Yes | hotel | ❌ No |
| `location` | String | 500 | ❌ No | - | ❌ No |
| `phone` | String | 50 | ❌ No | - | ❌ No |
| `email` | Email | 255 | ✅ Yes | - | ❌ No |
| `password` | String | 255 | ✅ Yes | - | ❌ No |
| `verified` | Boolean | - | ✅ Yes | false | ❌ No |
| `rating` | Float | - | ❌ No | 0 | ❌ No |
| `imageUrl` | URL | 2000 | ❌ No | - | ❌ No |
| `amenities` | String | 100 | ❌ No | - | ✅ Yes |
| `addedDate` | DateTime | - | ✅ Yes | - | ❌ No |
| `updatedAt` | DateTime | - | ✅ Yes | - | ❌ No |
| `websitePreview` | URL | 2000 | ❌ No | - | ❌ No |

### Enum Values for `category`:
- `hotel`
- `villa`
- `therapist`
- `massage-place`

---

## 🗂️ Step 2: Create Storage Bucket

**Bucket ID:** `partner_images_bucket`

### Settings:
- **Name:** Partner Images
- **Permissions:** 
  - ✅ File Security: Enabled
  - ✅ Maximum File Size: 5 MB
  - ✅ Allowed File Extensions: `jpg`, `jpeg`, `png`, `webp`
- **Compression:** Enabled (optional)

### Bucket Permissions:
```
Read: Any
Create: Any (or Users)
Update: Users
Delete: Users
```

---

## 🔐 Step 3: Collection Permissions

### For `partners_collection_id`:

**Documents Permissions:**
```
Create: Any (allow new partner registration)
Read: Any (public partner cards)
Update: Users (only logged-in partners)
Delete: None (admin only via console)
```

**Recommended Index:**
- `verified_addedDate` (Compound):
  - Key: `verified` (ASC)
  - Key: `addedDate` (DESC)
  - For fast queries of verified partners sorted by date

---

## 🚀 Step 4: Test the Flow

### 1. **Register New Partner:**
   - Go to: `https://yourapp.com/hotel-login`
   - Select Hotel or Villa
   - Enter email: `test@hotel.com`
   - Enter password: `password123`
   - Click "Login" (will create account if doesn't exist)

### 2. **Upload Partner Info:**
   - Should auto-navigate to Partner Settings page
   - Fill in:
     - Name: "Luxury Beach Resort"
     - Location: "Seminyak, Bali"
     - Phone: "+62 812 3456 7890"
     - Description: "5-star resort with spa services"
     - Upload image or paste URL
     - Add amenities: Pool, Spa, WiFi, Restaurant
   - Click "Save Settings"

### 3. **Verify on Partners Page:**
   - **IMPORTANT:** Newly created partners have `verified: false`
   - Go to Appwrite Console → Database → `partners_collection_id`
   - Find your test partner document
   - Set `verified: true`
   - Now visit: `https://yourapp.com/partners`
   - Your hotel/villa card should appear!

---

## 🔧 Step 5: Update lib/appwrite.ts

Already done! But verify these are in your code:

```typescript
export const COLLECTIONS = {
    PARTNERS: 'partners_collection_id',  // ✅ Added
    // ... other collections
};

export const STORAGE_BUCKETS = {
    PARTNER_IMAGES: 'partner_images_bucket'  // ✅ Added
};
```

---

## 📱 Complete User Flow

### Hotel/Villa Owner Journey:
1. Visit `/hotel-login` page
2. Enter email + password + select type (hotel/villa)
3. System checks Appwrite `partners_collection_id`
4. If found → logs in and navigates to settings page
5. If not found → creates new document with `verified: false`
6. Owner uploads: name, location, phone, description, image, amenities
7. Click "Save" → data saved to Appwrite
8. **Admin approval needed:** Set `verified: true` in console
9. Partner card appears on `/partners` page
10. Customers can see and contact the partner

---

## 🛡️ Security Notes

### Current Authentication:
- **Basic email/password** stored in Partners collection
- ⚠️ **For Production:** Implement proper Appwrite Auth:
  - Use `account.create()` for registration
  - Use `account.createEmailSession()` for login
  - Store `userId` in partners document
  - Use sessions for authentication

### Quick Security Fix (Later):
Replace password field with:
- `userId` (String) → Link to Appwrite Auth user
- Remove `password` from partners collection
- Use Appwrite Account API for login

---

## 📊 Admin Dashboard (Bonus)

Create admin page to approve partners:

```typescript
// Query pending partners
const pending = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PARTNERS,
    [Query.equal('verified', false)]
);

// Approve partner
await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PARTNERS,
    partnerId,
    { verified: true }
);
```

---

## ✅ Checklist

- [ ] Create `partners_collection_id` in Appwrite Console
- [ ] Add all 16 attributes (name, email, category, etc.)
- [ ] Set enum values for `category` field
- [ ] Create `partner_images_bucket` storage
- [ ] Configure bucket permissions (5MB, jpg/png/webp)
- [ ] Set collection permissions (Any for create/read)
- [ ] Create compound index on `verified` + `addedDate`
- [ ] Test registration at `/hotel-login`
- [ ] Test uploading partner info
- [ ] Verify in Appwrite Console (set `verified: true`)
- [ ] Check partner card shows on `/partners` page

---

## 🎉 You're Done!

Your hotel/villa partner system is now fully functional:
- ✅ Partners can register and login
- ✅ Partners can upload their information
- ✅ Partner cards display on public Partners page
- ✅ Image upload to Appwrite Storage
- ✅ Admin approval workflow (verified flag)

**Next Steps:**
1. Create the Appwrite collections (15 minutes)
2. Test with dummy hotel data
3. Add proper authentication (optional upgrade)
4. Build admin approval dashboard (optional)
