# 📍 Bulk Update: Set Jogja Coordinates for Therapists

This script automatically updates all therapists without valid location data to use Yogyakarta (Jogja) city center coordinates.

## 🎯 What This Does

- Finds all therapists in your Appwrite database
- Checks which ones have missing or invalid coordinates
- Updates them with Jogja coordinates: `lat: -7.7956, lng: 110.3695`
- Also sets: `city: 'Yogyakarta'`, `countryCode: 'ID'`, `location: 'Yogyakarta, Indonesia'`
- Skips therapists that already have valid coordinates

## ⚙️ Setup (One-Time)

### Step 1: Get Your API Key

1. Go to **Appwrite Console**: https://cloud.appwrite.io/console
2. Select your project: **IndaStreet Massage Platform**
3. Click **Settings** (⚙️) in left sidebar
4. Click **API Keys** tab
5. Click **Create API Key**
6. Configure the key:
   - **Name**: `Bulk Update Scripts`
   - **Scopes**: Check these boxes:
     - ✅ `databases.read`
     - ✅ `databases.write`
   - **Expiration**: Never (or set to 1 year)
7. Click **Create**
8. **Copy the API key** (it will only be shown once!)

### Step 2: Add API Key to .env File

1. Open `.env` file in your project root
2. Find the line: `APPWRITE_API_KEY=`
3. Paste your API key after the `=`:
   ```
   APPWRITE_API_KEY=your_api_key_here
   ```
4. Save the file

## 🚀 Running the Script

```powershell
node update-jogja-coordinates.cjs
```

## 📊 Expected Output

```
🚀 Starting bulk coordinate update for Jogja therapists...

📋 Configuration loaded:
   Endpoint: https://syd.cloud.appwrite.io/v1
   Project ID: 68f23b11000d25eb3664
   Database ID: 68f76ee1000e64ca8d05
   API Key: ✅ Set

🔍 Finding therapists collection...

📚 Available collections:
   1. therapists (ID: 68f76f1a000290d9d234)
   2. places (ID: ...)

✅ Found therapists collection: "therapists" (68f76f1a000290d9d234)

🔍 Fetching all therapists...

📊 Found 8 total therapists

⏭️  Skipping "John Doe" - already has valid coordinates
🔄 Updating "Jane Smith"...
   ✅ Updated: coordinates set to {"lat":-7.7956,"lng":110.3695}
🔄 Updating "Mike Johnson"...
   ✅ Updated: coordinates set to {"lat":-7.7956,"lng":110.3695}
...

============================================================
📊 BULK UPDATE SUMMARY:
============================================================
   ✅ Updated: 7 therapists
   ⏭️  Skipped: 1 therapists (already had valid coordinates)
   ❌ Errors: 0 therapists
   📍 Coordinates set: Yogyakarta center (-7.7956, 110.3695)
============================================================

✅ Done! Therapists should now appear in Jogja location searches.
💡 Tip: Therapists can update to their exact location using "Use My Current Location" in their dashboard.
```

## 🔧 Troubleshooting

### Error: "APPWRITE_API_KEY not found"
- Make sure you added the API key to `.env` file
- Ensure there are no spaces around the `=` sign
- Restart your terminal after editing .env

### Error: "Project with the requested ID could not be found"
- Double-check your API key has correct permissions
- Verify the API key is from the correct Appwrite project
- Check that `.env` file has correct `VITE_APPWRITE_PROJECT_ID`

### Error: "Could not find therapists collection"
- The script auto-detects the therapists collection
- If it fails, you can manually specify the collection ID in the script

### Script runs but no updates
- Check if therapists already have valid coordinates
- Look for "Skipped" messages in the output
- Verify therapists exist in database

## 📝 What Happens After

1. **Refresh your app** - therapists should now appear in Jogja location searches
2. **50km radius filter** will now work correctly
3. **Distance sorting** will show nearest therapists first
4. **Therapists can update** their exact location anytime using dashboard

## 🎓 Future Updates

Tell therapists to:
1. Login to their dashboard
2. Click **"Use My Current Location"** button
3. Allow browser location access
4. Save profile

This will update their coordinates to their exact GPS location, making them appear more accurately in customer searches.

## ⚠️ Important Notes

- ✅ Safe to run multiple times (skips already updated therapists)
- ✅ Does not overwrite existing valid coordinates
- ✅ Only updates therapists with missing/invalid (0,0) coordinates
- ✅ Sets all therapists to same city center initially
- 📍 Therapists should update to exact location via dashboard later

---

**Script Location**: `update-jogja-coordinates.cjs`
**Last Updated**: November 21, 2025
