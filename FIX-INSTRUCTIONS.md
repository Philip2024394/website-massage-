# 🔧 IMMEDIATE FIX INSTRUCTIONS

## The Problem
Your therapist collection ID in `lib/appwrite.config.ts` is set to `'therapists_collection_id'` which is a **placeholder**, not your real Appwrite collection ID.

## Step-by-Step Fix

### Step 1: Find Your Real Collection ID

**Option A - Browser Console (EASIEST)**
1. Open http://localhost:3000 in your browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Copy this entire script and paste it:

```javascript
(async () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/appwrite@15.0.0';
    document.head.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
    
    const { Client, Databases } = Appwrite;
    const client = new Client()
        .setEndpoint('https://syd.cloud.appwrite.io/v1')
        .setProject('68f23b11000d25eb3664');
    const databases = new Databases(client);
    
    const response = await databases.listCollections('68f76ee1000e64ca8d05');
    console.log('📋 Collections:');
    console.table(response.collections.map(c => ({ Name: c.name, ID: c.$id })));
    
    const therapistCol = response.collections.find(c => 
        c.name.toLowerCase().includes('therapist') || c.$id.toLowerCase().includes('therapist')
    );
    
    if (therapistCol) {
        console.log(`\n✅ THERAPIST COLLECTION ID: ${therapistCol.$id}`);
        console.log('\nCopy this ID and use it in Step 2 below!');
    }
})();
```

5. Look for the output showing "THERAPIST COLLECTION ID"
6. Copy that ID (it will look like: `6912abc...`)

**Option B - Appwrite Console**
1. Go to: https://syd.cloud.appwrite.io/console
2. Login to your account
3. Click on your project
4. Go to "Databases" in left sidebar
5. Click on database: `68f76ee1000e64ca8d05`
6. Find the "Therapists" collection
7. Click on it
8. The URL will show the collection ID, or look at the top of the page
9. Copy the collection ID

### Step 2: Update Your Code

Open this file:
```
lib/appwrite.config.ts
```

Find line 15 (around line 15):
```typescript
therapists: 'therapists_collection_id', // Correct collection ID - WORKING
```

Replace with:
```typescript
therapists: 'YOUR_ACTUAL_COLLECTION_ID_HERE', // ← Paste the ID you copied
```

For example:
```typescript
therapists: '6912d611003551067831',
```

### Step 3: Restart Servers

**Kill all Node processes:**
```powershell
taskkill /F /IM node.exe /T
```

**Start Therapist Dashboard:**
```powershell
cd apps/therapist-dashboard
pnpm run dev
```

**Start Main App (in another terminal):**
```powershell
npm run dev
```

### Step 4: Test the Fix

1. **Go to therapist dashboard**: http://localhost:3003
2. **Log in** with your therapist credentials
3. **Fill required fields**:
   - Name
   - WhatsApp (+62...)
   - City
4. **Click "🚀 Publish Profile & Go Live"**
5. **You should see**: "✅ Profile saved and LIVE!" toast notification
6. **Go to main site**: http://localhost:3000
7. **Your therapist card should appear!**

## Verification

Run this in browser console (F12) on main site:
```javascript
fetch('https://syd.cloud.appwrite.io/v1/databases/68f76ee1000e64ca8d05/collections/YOUR_COLLECTION_ID/documents', {
    headers: {
        'X-Appwrite-Project': '68f23b11000d25eb3664'
    }
}).then(r => r.json()).then(data => {
    const live = data.documents.filter(d => d.isLive);
    console.log(`Total: ${data.total}, Live: ${live.length}`);
    console.table(live.map(d => ({ Name: d.name, City: d.city, isLive: d.isLive })));
});
```

Replace `YOUR_COLLECTION_ID` with the ID you found.

## Quick Reference

**Files to Check:**
- `lib/appwrite.config.ts` (line 15) - Main config
- `lib/appwrite.ts` (line 18) - Secondary config
- `apps/therapist-dashboard/src/pages/TherapistDashboard.tsx` - Save function

**Servers:**
- Therapist Dashboard: http://localhost:3003
- Main App: http://localhost:3000

**Appwrite:**
- Console: https://syd.cloud.appwrite.io/console
- Project ID: `68f23b11000d25eb3664`
- Database ID: `68f76ee1000e64ca8d05`

## Still Not Working?

If after following these steps it still doesn't work, check browser console for errors:

1. Press F12
2. Go to Console tab
3. Click publish button
4. Look for red error messages
5. Share the error with me

Common errors:
- "Collection not found" → Wrong collection ID
- "Document not found" → Therapist record doesn't exist
- "Permission denied" → Check Appwrite permissions
- "Failed to fetch" → Network/CORS issue
