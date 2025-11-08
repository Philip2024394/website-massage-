# 🚨 EMERGENCY FIX: Collection ID Error

## **The Problem**
You're getting: `"Invalid document structure: Missing required attribute 'FIX_COLLECTION_ID'"`

**Root Cause:** Your code is using placeholder collection IDs like `'therapists_collection_id'` instead of real Appwrite collection IDs.

## **IMMEDIATE FIX (2 Minutes)**

### **Step 1: Get Real Collection ID**

1. Open: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

2. Look for a collection that contains therapist data. It might be named:
   - `therapists`
   - `providers`
   - `users`
   - Or something similar

3. **Click on the collection** that has attributes like:
   - `therapistId`
   - `email`
   - `specialization` 
   - `name`
   - `location`
   - `pricing`

4. **Copy the Collection ID** from the top of the page (looks like: `68f9a1b2c3d4e5f6`)

### **Step 2: Update Both Config Files**

#### **File 1: `lib/appwrite.config.ts`**
Find this line:
```typescript
therapists: 'therapists_collection_id',
```

Replace with your real ID:
```typescript
therapists: 'YOUR_REAL_ID_HERE',
```

#### **File 2: `lib/appwrite.ts`**  
Find this line:
```typescript
THERAPISTS: 'therapists_collection_id',
```

Replace with your real ID:
```typescript
THERAPISTS: 'YOUR_REAL_ID_HERE',
```

### **Step 3: Test the Fix**
1. Save both files
2. Refresh your browser
3. Try saving the therapist profile again

## **Example**
If your real collection ID is `671234567890abcd`, then update both files:

**lib/appwrite.config.ts:**
```typescript
therapists: '671234567890abcd',
```

**lib/appwrite.ts:**
```typescript
THERAPISTS: '671234567890abcd',
```

## **Success Indicator**
After the fix, you should be able to save therapist profiles without any "Missing required attribute" errors.

---

**This is the most common Appwrite setup issue - placeholder IDs instead of real ones!**