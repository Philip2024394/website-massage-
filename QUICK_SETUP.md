# 🔑 Update Collection IDs - Quick Guide

## ✅ You Already Have These Collections in Appwrite:
- hotels
- users  
- therapists
- places
- agents

(villas and admins - we'll create simple structures for these)

---

## 🚀 Run This One Command:

```bash
node scripts/update-collection-ids.js YOUR_APPWRITE_API_KEY
```

**Replace `YOUR_APPWRITE_API_KEY` with your API key from the analytics setup.**

---

## 📋 What This Script Does:

1. ✅ Connects to your Appwrite database
2. ✅ Finds all existing collection IDs
3. ✅ **Automatically updates** `lib/appwrite.config.ts`
4. ✅ **Automatically updates** `lib/appwrite.ts`
5. ✅ Maps real IDs to your code

---

## 🎯 After Running:

Your config files will have REAL collection IDs instead of placeholders:

**Before:**
```typescript
therapists: 'THERAPISTS_COLLECTION_ID'  // ❌ Placeholder
```

**After:**
```typescript
therapists: '675abc123def456'  // ✅ Real Appwrite ID
```

---

## 🧪 Then Test:

1. Go to **Therapist Login** → Sign Up → Should work! ✅
2. Go to **Hotel Login** → Sign In → Should work! ✅
3. Refresh page → Should stay logged in! ✅

---

## 📝 Output Example:

```
🔍 Connecting to Appwrite...

📋 Fetching collections from database: 68f76ee1000e64ca8d05

✅ Found 12 collections:

1. hotels (ID: 675...)
2. users (ID: 676...)
3. therapists (ID: 677...)
4. places (ID: 678...)
5. agents (ID: 679...)

🎯 Mapped Collections:
   hotels: 675...
   users: 676...
   therapists: 677...
   places: 678...
   agents: 679...

📝 Updating lib/appwrite.config.ts...
✅ Updated lib/appwrite.config.ts

📝 Updating lib/appwrite.ts...
✅ Updated lib/appwrite.ts

✅ COLLECTION IDS UPDATED SUCCESSFULLY!
```

---

## ⚠️ If You Get Errors:

**"Invalid API key"**
- Check your API key has `databases.read` permission

**"Collections not found"**
- Verify collection names in Appwrite Console match exactly

---

## 🎁 Bonus: For Villas & Admins

Since you don't have these yet, the script will skip them (they're optional). They can be added later if needed.

---

**Just run the command with your API key and everything will be set up automatically!** 🎉
