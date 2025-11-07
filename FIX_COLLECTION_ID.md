# 🚨 URGENT FIX: Update Collection IDs

## Current Issue
The therapist status update is failing because `lib/appwrite.config.ts` has placeholder collection IDs.

## Quick Fix Steps

### 1. Go to Appwrite Console
Open: https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05

### 2. Find Collections
Look for collections with these likely names:
- `therapists` 
- `providers`
- `users` (if therapists are stored as user type)
- Any collection with therapist-related attributes

### 3. Update lib/appwrite.config.ts

Replace this line:
```typescript
therapists: 'therapists_collection_id',
```

With the real collection ID:
```typescript
therapists: '68f76ee1234567890123', // ← Your actual collection ID
```

### 4. Test the Fix
1. Save the file
2. Go to: http://localhost:3000
3. Navigate to therapist status page
4. Try changing status - should now work!

## Alternative: Auto-Detection
If you can't find the collection ID, we can create a script to auto-detect it by testing common patterns.

## Expected Result
After updating the collection ID, the therapist status buttons should work and show:
✅ "Status updated successfully" instead of ❌ "Failed to update status"