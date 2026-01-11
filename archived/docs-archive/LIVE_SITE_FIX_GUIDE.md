# 🚨 CRITICAL: Live Site Fix Guide

## Issues Found
The live site console shows these critical errors:

### 1. CORS Policy Errors
```
Access to fetch at 'https://cloud.appwrite.io/v1/databases/your-database-id/collections/therapists_collection_id/documents' 
from origin 'https://www.indastreetmassage.com' has been blocked by CORS policy
```

### 2. Wrong Database/Collection IDs
- Using placeholder `your-database-id` instead of `68f76ee1000e64ca8d05`
- Using placeholder collection IDs like `therapists_collection_id` instead of real IDs

### 3. Wrong Endpoint
- Calling `cloud.appwrite.io` instead of `syd.cloud.appwrite.io`

## ✅ Fixes Applied

### 1. Updated Configuration 
- ✅ Fixed endpoint fallback to `syd.cloud.appwrite.io`
- ✅ Fixed database ID fallback to `68f76ee1000e64ca8d05` 
- ✅ Added real collection IDs as fallbacks
- ✅ Added environment variables for all collection IDs

### 2. Environment Variables Added
All critical IDs now have environment variables:
```env
VITE_THERAPISTS_COLLECTION_ID=676703b40009b9dd33de
VITE_PLACES_COLLECTION_ID=6767038a003b7bdff200
VITE_TRANSLATIONS_COLLECTION_ID=6767020d001f6bafeea2
# ... and more
```

## 🔧 Required Deployment Actions

### 1. Appwrite Console Configuration
**CRITICAL: Add domain to Appwrite project**

1. Go to [Appwrite Console](https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664)
2. Navigate to **Settings** → **Platforms** 
3. Add **Web Platform** with:
   - **Name**: IndaStreet Production
   - **Hostname**: `www.indastreetmassage.com`
   - **Protocol**: HTTPS

### 2. Vercel/Netlify Environment Variables
**CRITICAL: Set environment variables in deployment platform**

Add these environment variables to your deployment platform:

```env
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05
VITE_APPWRITE_BUCKET_ID=68f76bdd002387590584

VITE_THERAPISTS_COLLECTION_ID=676703b40009b9dd33de
VITE_PLACES_COLLECTION_ID=6767038a003b7bdff200
VITE_FACIAL_PLACES_COLLECTION_ID=67670371000c0bef1447
VITE_USERS_COLLECTION_ID=67670355000b2bc99d43
VITE_TRANSLATIONS_COLLECTION_ID=6767020d001f6bafeea2
VITE_HOTELS_COLLECTION_ID=676701f9001e6dc8b278
VITE_CUSTOM_LINKS_COLLECTION_ID=67670249000b8becb947
```

### 3. Redeploy Application
After setting environment variables, trigger a new deployment.

## 🧪 Testing
Use these test pages to verify fixes:
- `appwrite-collections-test.html` - Tests Appwrite connection
- `url-debug-test.html` - Shows URL construction

## 📊 Expected Results
After fixes:
- ✅ No more CORS errors  
- ✅ Real collection IDs in URLs
- ✅ Correct `syd.cloud.appwrite.io` endpoint
- ✅ Therapist and massage cards load successfully
- ✅ Orange theme displays on Lowongan Pijat page

## 🚀 Priority Actions
1. **Immediate**: Add `www.indastreetmassage.com` to Appwrite platforms
2. **Critical**: Set all environment variables in deployment platform  
3. **Deploy**: Trigger new build with environment variables
4. **Verify**: Check live site for data loading