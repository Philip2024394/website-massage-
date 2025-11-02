# 🔧 Therapist Authentication Error - Fix Guide

## ❌ Problem Identified

**Therapist sign-up and sign-in are failing** because the code is using **placeholder collection IDs** instead of actual Appwrite collection IDs.

### Current Code (in `lib/appwrite.ts`):
```typescript
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',  // ❌ This is a placeholder!
    PLACES: 'places_collection_id',
    USERS: 'users_collection_id',
    // ... etc
}
```

**These are NOT real Appwrite collection IDs!** Real collection IDs look like: `68f76ee1000e64ca8d05`

---

## ✅ Solution: Update Collection IDs

You have **2 options**:

### **Option 1: Use Existing Collections (If Already Created)**

1. Open Appwrite Console: https://cloud.appwrite.io/console
2. Navigate to your project: `68f23b11000d25eb3664`
3. Go to **Databases** → Database `68f76ee1000e64ca8d05`
4. Click on each collection and **copy its ID**
5. Update `lib/appwrite.ts` with the real IDs

Example:
```typescript
export const COLLECTIONS = {
    THERAPISTS: '68f9a1b2c3d4e5f6',  // ✅ Real ID copied from Appwrite
    PLACES: '68f9a1b2c3d4e5f7',
    USERS: '68f9a1b2c3d4e5f8',
    // ... etc
}
```

---

### **Option 2: Create New Collections (If Not Created Yet)**

Follow the instructions in `COLLECTION_IDS_REQUIRED.md`:

1. Create each collection in Appwrite Console
2. Add required attributes for each collection
3. Copy the generated collection IDs
4. Update `lib/appwrite.ts` with the real IDs

---

## 🔍 How to Verify

After updating the collection IDs:

1. Try creating a therapist account
2. Check the browser console for errors
3. If you see "Collection not found" or similar, the ID is still wrong
4. If registration succeeds, the fix worked!

---

## 🚨 Additional Issues Found

### 1. **Password Input Security Issue**
In `TherapistLoginPage.tsx` (line 145):
```typescript
<input type="text" ... />  // ❌ Shows password in plain text!
```

**Should be:**
```typescript
<input type="password" ... />  // ✅ Hides password
```

### 2. **Better Error Logging Needed**
Add console logging in `lib/auth.ts` to debug:
```typescript
export const therapistAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('Creating Appwrite account...');
            const user = await account.create(ID.unique(), email, password);
            console.log('Account created:', user.$id);
            
            console.log('Creating therapist document...');
            const therapist = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                therapistId,
                { /* ... */ }
            );
            console.log('Therapist document created:', therapist.$id);
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            console.error('Sign up error:', error);  // ✅ Log the actual error
            return { success: false, error: error.message };
        }
    }
}
```

---

## 📝 Next Steps

1. **FIRST**: Check Appwrite Console for existing collections
2. **THEN**: Copy real collection IDs or create missing collections
3. **UPDATE**: `lib/appwrite.ts` with real IDs
4. **FIX**: Password input type in `TherapistLoginPage.tsx`
5. **TEST**: Try creating a therapist account again

---

## 💡 Quick Check

Run this in your browser console on the login page:
```javascript
console.log('Collections config:', COLLECTIONS);
```

If you see `'therapists_collection_id'`, you need to update it!

---

## 🆘 Need More Help?

If you're still getting errors after updating collection IDs:
1. Check the browser console for the exact error
2. Verify collection permissions in Appwrite Console
3. Make sure all required attributes exist in the collection
4. Check that session management isn't conflicting
