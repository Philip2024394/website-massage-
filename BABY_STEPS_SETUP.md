# 👶 BABY STEPS: Setting Up Production Booking System

Follow these **exact steps** to get your booking system working. Don't skip any!

---

## 🎯 **STEP 1: Get Your Appwrite API Key**

### **1.1 Open Appwrite Console**
1. Go to https://cloud.appwrite.io/console
2. Log in to your account
3. Select your project: `68f23b11000d25eb3664`

### **1.2 Create API Key**
1. Click **"Settings"** in left sidebar
2. Click **"API Keys"** tab  
3. Click **"Create API Key"** button
4. **Name**: `Production Booking System`
5. **Scopes**: Check ALL boxes (or at minimum: `databases.read`, `databases.write`, `functions.read`, `functions.write`)
6. Click **"Create"**
7. **COPY THE KEY** - you'll never see it again!

### **1.3 Save API Key Temporarily**
Open PowerShell in your project folder and run:
```powershell
# Replace YOUR_ACTUAL_API_KEY with the key you just copied
$env:APPWRITE_API_KEY = "YOUR_ACTUAL_API_KEY_HERE"
```

**⚠️ IMPORTANT**: Replace `YOUR_ACTUAL_API_KEY_HERE` with your real key!

---

## 🗄️ **STEP 2: Create Database Collections**

### **2.1 Run the Setup Script**
In your PowerShell terminal, run:
```powershell
npm run setup:booking
```

**What this does**: Creates 3 new collections in your database:
- `bookings` - Stores booking information
- `therapist_matches` - Stores search results  
- `chat_sessions` - Tracks active chats

### **2.2 Verify Collections Were Created**
1. Go back to Appwrite Console
2. Click **"Databases"** in sidebar
3. Click your database: `main`  
4. You should see 3 new collections:
   - ✅ `bookings`
   - ✅ `therapist_matches`  
   - ✅ `chat_sessions`

**If you don't see them**: The API key might be wrong. Go back to Step 1.

---

## ⚙️ **STEP 3: Create Functions (Method A - Easy Way)**

### **3.1 Create First Function: createBooking**
1. In Appwrite Console, click **"Functions"** in sidebar
2. Click **"Create Function"** button
3. Fill out the form:
   - **Function ID**: `createBooking` (exact spelling!)
   - **Name**: `Create Booking`
   - **Runtime**: Select `Node.js 18.0`
   - **Execute Access**: Click **"Add Role"** → Select **"Any"** → Click **"Add"**
4. Click **"Create"**

### **3.2 Upload createBooking Code**
1. Click on your new `createBooking` function
2. Click **"Deployment"** tab
3. Click **"Create deployment"** 
4. **Manual**: Upload these files from your computer:
   - Browse to: `C:\Users\Victus\website-massage-\functions\createBooking\`
   - Select **ALL files** in that folder
5. **Entrypoint**: Type `src/main.js`
6. Click **"Create"**
7. Wait for "Ready" status (green dot)

### **3.3 Add Environment Variables to createBooking**
1. Still in your `createBooking` function
2. Click **"Settings"** tab
3. Scroll to **"Environment variables"**
4. Add these **one by one**:

**Variable 1:**
- **Key**: `APPWRITE_ENDPOINT`
- **Value**: `https://syd.cloud.appwrite.io/v1`

**Variable 2:**  
- **Key**: `APPWRITE_PROJECT_ID`
- **Value**: `68f23b11000d25eb3664`

**Variable 3:**
- **Key**: `APPWRITE_DATABASE_ID`  
- **Value**: `68f76ee1000e64ca8d05`

**Variable 4:**
- **Key**: `APPWRITE_API_KEY`
- **Value**: `YOUR_ACTUAL_API_KEY_HERE` (the one from Step 1)

5. Click **"Update"** after adding each variable

### **3.4 Test createBooking Function**
1. Click **"Execute"** tab
2. **Method**: POST
3. **Body**: Paste this test data:
```json
{
  "userId": "test123",
  "serviceDuration": "60",
  "price": 300000,
  "location": "Jakarta",
  "customerName": "Test User",
  "customerWhatsApp": "+6281234567890"
}
```
4. Click **"Execute"**
5. You should see: `{"success": true, "booking": {...}}`

**If you see an error**: Check your environment variables are correct.

---

## 🔄 **STEP 4: Create Remaining Functions**

You need to create **3 more functions**. Each follows the same steps as Step 3, just with different names and folders.

---

### **🔍 FUNCTION 1: searchTherapists**

**4.1.1 Create the Function**
1. Go to Appwrite Console: https://cloud.appwrite.io/console
2. Click **"Functions"** in left sidebar
3. Click **"Create Function"** button
4. Fill out exactly:
   - **Function ID**: `searchTherapists` (copy this exactly!)
   - **Name**: `Search Therapists`
   - **Runtime**: Select `Node.js 18.0`
   - **Execute Access**: Click **"Add Role"** → Select **"Any"** → Click **"Add"**
5. Click **"Create"**

**4.1.2 Upload the Code**
1. Click on your new `searchTherapists` function
2. Click **"Deployment"** tab
3. Click **"Create deployment"**
4. **Manual Upload**: Browse to `C:\Users\Victus\website-massage-\functions\searchTherapists\`
5. Select **ALL files** in that folder (now includes index.js, package.json, src folder)
6. **Entrypoint**: Type exactly `index.js` (CHANGED - now easier!)
7. Click **"Create"**
8. Wait for green "Ready" status

**4.1.3 Add Environment Variables**
1. Click **"Settings"** tab
2. Scroll to **"Environment variables"**
3. Add these 4 variables **one by one**:

**Variable 1:**
- Key: `APPWRITE_ENDPOINT`
- Value: `https://syd.cloud.appwrite.io/v1`
- Click **"Add"**

**Variable 2:**
- Key: `APPWRITE_PROJECT_ID`  
- Value: `68f23b11000d25eb3664`
- Click **"Add"**

**Variable 3:**
- Key: `APPWRITE_DATABASE_ID`
- Value: `68f76ee1000e64ca8d05`
- Click **"Add"**

**Variable 4:**
- Key: `APPWRITE_API_KEY`
- Value: `standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d`
- Click **"Add"**

4. Click **"Update"** to save all variables

---

### **✅ FUNCTION 2: acceptTherapist**

**4.2.1 Create the Function** 
1. Still in Appwrite Console → Functions
2. Click **"Create Function"** button again
3. Fill out exactly:
   - **Function ID**: `acceptTherapist` (copy this exactly!)
   - **Name**: `Accept Therapist`
   - **Runtime**: Select `Node.js 18.0`
   - **Execute Access**: Click **"Add Role"** → Select **"Any"** → Click **"Add"**
4. Click **"Create"**

**4.2.2 Upload the Code**
1. Click on your new `acceptTherapist` function
2. Click **"Deployment"** tab
3. Click **"Create deployment"**
4. **Manual Upload**: Browse to `C:\Users\Victus\website-massage-\functions\acceptTherapist\`
5. Select **ALL files** in that folder
6. **Entrypoint**: Type exactly `index.js`
7. Click **"Create"**
8. Wait for green "Ready" status

**4.2.3 Add Environment Variables**
1. Click **"Settings"** tab
2. Add the **same 4 variables** as above:
   - `APPWRITE_ENDPOINT` = `https://syd.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID` = `68f23b11000d25eb3664`
   - `APPWRITE_DATABASE_ID` = `68f76ee1000e64ca8d05`
   - `APPWRITE_API_KEY` = `standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d`
3. Click **"Update"**

---

### **❌ FUNCTION 3: cancelBooking**

**4.3.1 Create the Function**
1. Still in Appwrite Console → Functions
2. Click **"Create Function"** button again
3. Fill out exactly:
   - **Function ID**: `cancelBooking` (copy this exactly!)
   - **Name**: `Cancel Booking`  
   - **Runtime**: Select `Node.js 18.0`
   - **Execute Access**: Click **"Add Role"** → Select **"Any"** → Click **"Add"**
4. Click **"Create"**

**4.3.2 Upload the Code**
1. Click on your new `cancelBooking` function
2. Click **"Deployment"** tab
3. Click **"Create deployment"**
4. **Manual Upload**: Browse to `C:\Users\Victus\website-massage-\functions\cancelBooking\`
5. Select **ALL files** in that folder
6. **Entrypoint**: Type exactly `index.js`
7. Click **"Create"**
8. Wait for green "Ready" status

**4.3.3 Add Environment Variables**
1. Click **"Settings"** tab
2. Add the **same 4 variables** as above:
   - `APPWRITE_ENDPOINT` = `https://syd.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID` = `68f23b11000d25eb3664`  
   - `APPWRITE_DATABASE_ID` = `68f76ee1000e64ca8d05`
   - `APPWRITE_API_KEY` = `standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d`
3. Click **"Update"**

---

### **✅ Check Your Work**
After creating all 3 functions, you should see **4 functions total** in your Appwrite Console:
1. ✅ `createBooking` (already exists)
2. ✅ `searchTherapists` (just created)
3. ✅ `acceptTherapist` (just created) 
4. ✅ `cancelBooking` (just created)

**All should have green "Ready" status!**

---

## 🎮 **STEP 5: Activate Production ChatWindow**

### **5.1 Backup Current ChatWindow**
In PowerShell:
```powershell
# Backup your current version
Copy-Item "components/ChatWindow.tsx" "components/ChatWindow.backup.tsx"

# Activate production version  
Copy-Item "components/ChatWindow.production.tsx" "components/ChatWindow.tsx" -Force
```

### **5.2 Test Your Website**
```powershell
npm run dev
```

1. Open http://localhost:3000
2. Click **"Book Now"** on any therapist
3. You should see the new booking flow:
   - Registration form
   - Service confirmation
   - Search timer with countdown
   - System messages

---

## 🧪 **STEP 6: Final Testing**

### **6.1 Test Complete Booking Flow**
1. **Start booking**: Click "Book Now"
2. **Fill registration**: Enter name and WhatsApp  
3. **Confirm service**: Click "Confirm & Search"
4. **Watch countdown**: Should show 60-second timer
5. **Cancel test**: Click "Cancel" - should reset cleanly

### **6.2 Check Function Logs**
If something doesn't work:
1. Go to Appwrite Console → Functions
2. Click problematic function
3. Click **"Logs"** tab
4. Look for red error messages

---

## ✅ **STEP 7: You're Done!**

If you see:
- ✅ Registration form appears  
- ✅ Service confirmation shows
- ✅ Countdown timer works
- ✅ Cancel button resets properly
- ✅ No console errors

**🎉 YOUR PRODUCTION BOOKING SYSTEM IS LIVE!**

---

## 🆘 **TROUBLESHOOTING**

### **Problem: "Failed to create booking"**
- Check Function environment variables  
- Verify API key has correct permissions
- Check Function logs in Appwrite Console

### **Problem: "Collection not found"**  
- Re-run: `npm run setup:booking`
- Check database ID is correct: `68f76ee1000e64ca8d05`

### **Problem: Timer doesn't work**
- Check browser console for JavaScript errors
- Verify ChatWindow.production.tsx is active

### **Problem: Functions won't deploy**
- Check Node.js version is 18.0 in Function settings
- Verify entrypoint is exactly: `src/main.js`  
- Make sure you uploaded ALL files from function folder

---

**🚀 Need help? Check the function logs in Appwrite Console first!**