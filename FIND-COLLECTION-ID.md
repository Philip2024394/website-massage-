# Quick Collection ID Finder

## Open Browser Console and Run This:

Go to **http://localhost:3003** (therapist dashboard) OR **http://localhost:3000** (main app)

Press **F12** → **Console** tab

Paste this code:

```javascript
// Method 1: Check current config
console.log('Current therapist collection ID:', 
    window.location.href.includes('3003') 
        ? 'Check apps/therapist-dashboard config' 
        : 'Check lib/appwrite.config.ts'
);

// Method 2: Try to list collections (requires loading Appwrite)
(async () => {
    try {
        // Load Appwrite if not already loaded
        if (typeof Appwrite === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/appwrite@15.0.0';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }
        
        const { Client, Databases } = Appwrite;
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');
        
        const databases = new Databases(client);
        const collections = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log('\n📋 ALL COLLECTIONS:');
        collections.collections.forEach(c => {
            console.log(`${c.name.padEnd(35)} → ${c.$id}`);
        });
        
        const therapist = collections.collections.find(c => 
            c.name.toLowerCase().includes('therapist')
        );
        
        if (therapist) {
            console.log('\n✅ THERAPIST COLLECTION FOUND!');
            console.log(`Name: ${therapist.name}`);
            console.log(`ID: ${therapist.$id}`);
            console.log('\n👉 USE THIS ID IN YOUR CONFIG!');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
```

## OR: Check Appwrite Console Directly

1. Go to: https://syd.cloud.appwrite.io/console/
2. Login
3. Select your project
4. Click "Databases" in left sidebar  
5. Click on database: `68f76ee1000e64ca8d05`
6. You'll see a list of collections
7. Click on the therapists collection
8. The collection ID will be in the URL or at the top of the page

Example URL:
```
https://syd.cloud.appwrite.io/console/databases/database/68f76ee1000e64ca8d05/collection/COLLECTION_ID_HERE
                                                                                         ^^^^^^^^^^^^^^^^^^^^
                                                                                         This is what you need!
```

## What to Do With the ID

Once you have the real collection ID:

1. Open `lib/appwrite.config.ts`
2. Go to line 15
3. Change from:
   ```typescript
   therapists: 'therapists_collection_id',
   ```
   To:
   ```typescript
   therapists: 'YOUR_REAL_COLLECTION_ID',
   ```

4. Save the file
5. Restart both servers:
   ```
   taskkill /F /IM node.exe
   cd apps/therapist-dashboard && pnpm run dev
   npm run dev
   ```

That's it! The publish button will work after this fix.
