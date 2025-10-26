# ⚠️ CRITICAL: Collection IDs Need to Be Updated

## 🔴 Current Problem

Your `appwrite.config.ts` has **placeholder collection IDs** that will cause errors when signing up or logging in.

## ✅ Solution

You need to **create collections in Appwrite** and **update the collection IDs** in the code.

---

## 📋 Step-by-Step Instructions

### **Step 1: Create Collections in Appwrite Console**

1. Go to: https://cloud.appwrite.io/console
2. Select your project: `68f23b11000d25eb3664`
3. Go to **Databases** → Select database `68f76ee1000e64ca8d05`
4. Click **"Create Collection"** for each of these:

#### **Collections to Create:**

| Collection Name | Purpose | ID to Save |
|----------------|---------|------------|
| `therapists` | Therapist accounts | Copy the generated ID |
| `places` | Massage place accounts | Copy the generated ID |
| `agents` | Agent accounts | Copy the generated ID |
| `hotels` | Hotel accounts | Copy the generated ID |
| `villas` | Villa accounts | Copy the generated ID |
| `admins` | Admin accounts | Copy the generated ID |
| `users` | Guest/customer accounts | Copy the generated ID |

---

### **Step 2: Configure Collection Attributes**

For each collection, add these attributes (minimum required):

#### **For `therapists` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
profilePicture - String (2000 chars)
specialization - String (512 chars)
isLive         - Boolean (default: false)
status         - String (128 chars)
pricing        - String (2000 chars)
coordinates    - String (512 chars)
analytics      - String (2000 chars)
whatsappNumber - String (128 chars)
```

#### **For `places` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
profilePicture - String (2000 chars)
address        - String (1024 chars)
isLive         - Boolean (default: false)
pricing        - String (2000 chars)
coordinates    - String (512 chars)
analytics      - String (2000 chars)
```

#### **For `agents` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
phoneNumber    - String (128 chars)
status         - String (128 chars)
termsAccepted  - Boolean (default: false)
```

#### **For `hotels` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
address        - String (1024 chars)
contactNumber  - String (128 chars)
```

#### **For `villas` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
address        - String (1024 chars)
contactNumber  - String (128 chars)
```

#### **For `admins` collection:**
```
email          - String (512 chars, required)
userId         - String (512 chars, required)
createdAt      - String (128 chars)
```

#### **For `users` collection:**
```
email          - String (512 chars, required)
name           - String (512 chars)
phoneNumber    - String (128 chars)
```

---

### **Step 3: Set Collection Permissions**

For each collection, set permissions:
1. Click on collection → **Settings** → **Permissions**
2. Add permissions:
   - **Create**: Any
   - **Read**: Any (or Users)
   - **Update**: Users
   - **Delete**: Users

---

### **Step 4: Update `lib/appwrite.config.ts`**

After creating collections and getting their IDs, update the file:

```typescript
// Replace these placeholders with your REAL collection IDs from Appwrite

collections: {
    therapists: 'YOUR_THERAPISTS_COLLECTION_ID',     // ← Paste real ID here
    places: 'YOUR_PLACES_COLLECTION_ID',             // ← Paste real ID here
    agents: 'YOUR_AGENTS_COLLECTION_ID',             // ← Paste real ID here
    hotels: 'YOUR_HOTELS_COLLECTION_ID',             // ← Paste real ID here
    villas: 'YOUR_VILLAS_COLLECTION_ID',             // ← Paste real ID here (or keep 'villas' if same)
    admins: 'YOUR_ADMINS_COLLECTION_ID',             // ← Paste real ID here (or keep 'admins' if same)
    users: 'YOUR_USERS_COLLECTION_ID',               // ← Paste real ID here
    bookings: 'YOUR_BOOKINGS_COLLECTION_ID',         // ← Optional for now
    reviews: 'YOUR_REVIEWS_COLLECTION_ID',           // ← Optional for now
    notifications: 'YOUR_NOTIFICATIONS_COLLECTION_ID', // ← Optional for now
    massageTypes: 'YOUR_MASSAGE_TYPES_COLLECTION_ID',  // ← Optional for now
    membershipPricing: 'YOUR_MEMBERSHIP_PRICING_ID',   // ← Optional for now
    
    // These are already correct:
    imageAssets: 'image_assets',
    loginBackgrounds: 'login_backgrounds',
    customLinks: 'custom_links_collection_id',
    translations: 'translations_collection_id',
}
```

---

### **Step 5: Update `lib/appwrite.ts`**

Also update the COLLECTIONS object in `lib/appwrite.ts` with the same IDs.

---

## 🧪 Testing After Update

### **Test 1: Therapist Signup**
1. Go to Therapist Login page
2. Switch to "Sign Up"
3. Enter email and password
4. Should see: "Account created! Please sign in."

### **Test 2: Therapist Login**
1. Enter same email and password
2. Should navigate to Therapist Dashboard
3. Refresh page → Should stay logged in

### **Test 3: Session Persistence**
1. Close browser tab
2. Reopen website
3. Should auto-login to dashboard

---

## ❌ Expected Errors If Not Fixed

### **Error 1: Collection Not Found**
```
Collection with ID 'THERAPISTS_COLLECTION_ID' could not be found
```
**Fix:** Create collection and update ID

### **Error 2: Database Error**
```
AppwriteException: Document not found
```
**Fix:** Ensure collection exists with correct ID

### **Error 3: Permission Denied**
```
AppwriteException: Missing scope (documents.write)
```
**Fix:** Set collection permissions to "Any" for create

---

## 🎯 Quick Start Option

If you want to test quickly, I can provide you with a script to create all collections automatically via Appwrite API. Just provide your Appwrite API key.

---

## 📞 Need Help?

If you encounter any issues:
1. Check Appwrite Console → Databases → Collections
2. Verify collection IDs match in config files
3. Check collection permissions are set correctly
4. Look at browser console for specific error messages

---

## ✅ After Fixing

Once you update the collection IDs:
- ✅ Sign up will work
- ✅ Login will work
- ✅ Sessions will persist
- ✅ Auto-login will work
- ✅ All user types can authenticate

---

*Last Updated: October 26, 2025*
*Priority: 🔴 CRITICAL - Must be fixed for authentication to work*
