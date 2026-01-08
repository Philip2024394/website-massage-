# 🚀 QUICK GUIDE: Add 3 Functions to Appwrite

**Go to:** https://cloud.appwrite.io/console → Functions

---

## ⚡ STEP 1: Create 3 Functions (2 minutes each)

### **Function 1: searchTherapists**
1. Click **"Create Function"**
2. **Function ID**: `searchTherapists`
3. **Name**: `Search Therapists`
4. **Runtime**: `Node.js 18.0`
5. **Execute Access**: Add Role → "Any" → Add
6. Click **"Create"**

### **Function 2: acceptTherapist**  
1. Click **"Create Function"**
2. **Function ID**: `acceptTherapist`
3. **Name**: `Accept Therapist`
4. **Runtime**: `Node.js 18.0`
5. **Execute Access**: Add Role → "Any" → Add
6. Click **"Create"**

### **Function 3: cancelBooking**
1. Click **"Create Function"**
2. **Function ID**: `cancelBooking`
3. **Name**: `Cancel Booking`
4. **Runtime**: `Node.js 18.0`
5. **Execute Access**: Add Role → "Any" → Add
6. Click **"Create"**

---

## 📁 STEP 2: Upload Code (1 minute each)

**For EACH function:**

1. **Click on function name**
2. **Deployment tab**
3. **"Create deployment"**
4. **Upload tar.gz files:**
   - `searchTherapists` → Upload `searchTherapists.tar.gz`
   - `acceptTherapist` → Upload `acceptTherapist.tar.gz`  
   - `cancelBooking` → Upload `cancelBooking.tar.gz`
5. **Files location**: `C:\Users\Victus\website-massage-\functions\` (tar.gz files are ready!)
6. **Entrypoint**: `index.js`
7. **Click "Create"**

---

## 🔑 STEP 3: Add Environment Variables (Copy/Paste same 4 for each)

**For EACH function:**

1. **Settings tab**
2. **Environment variables**
3. **Add these 4 (one by one):**

```
Key: APPWRITE_ENDPOINT
Value: https://syd.cloud.appwrite.io/v1

Key: APPWRITE_PROJECT_ID
Value: 68f23b11000d25eb3664

Key: APPWRITE_DATABASE_ID
Value: 68f76ee1000e64ca8d05

Key: APPWRITE_API_KEY
Value: standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d
```

4. **Click "Update"**

---

## ✅ DONE!

You should see **4 functions total** with green "Ready" status:
- ✅ createBooking
- ✅ searchTherapists  
- ✅ acceptTherapist
- ✅ cancelBooking

**Total time: ~15 minutes**

🎉 **Your booking system will be 100% functional!**