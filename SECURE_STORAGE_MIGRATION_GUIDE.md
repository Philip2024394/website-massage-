# Secure Storage Migration Guide

## Overview
This guide walks you through migrating from the current profile storage to the new secure storage system that implements all 8 security rules.

---

## 1. **Appwrite Collection Setup**

### A. Add New Fields to Existing Collections

Add these fields to your `therapists` collection:

```
isActive: boolean (default: true)
deletedAt: string (optional)
createdAt: string (required)
updatedAt: string (required)
version: integer (default: 1)
userId: string (required, indexed)
```

### B. Create New Collections

#### **therapist_profiles_private**
```
Fields:
- userId: string (required, indexed)
- email: string
- whatsappNumber: string
- contactNumber: string
- bankDetails: string (JSON)
- createdAt: string
- updatedAt: string

Permissions:
- Read: user:{userId}, label:admin
- Update: user:{userId}
- Delete: label:admin
```

#### **profile_backups**
```
Fields:
- profileId: string (required, indexed)
- profileType: string (therapist | member | place)
- snapshot: string (JSON serialized)
- backedUpAt: string (required, indexed)
- version: integer

Permissions:
- Read: label:admin
- Create: any (automated)
- Update: none
- Delete: label:admin
```

---

## 2. **Migration Script - Add Timestamps to Existing Profiles**

Run this script to add timestamps to existing profiles without breaking them:

```javascript
// migrate-add-timestamps.mjs
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('YOUR_PROJECT_ID')
    .setKey('YOUR_API_KEY');

const databases = new Databases(client);

async function migrateTherapistProfiles() {
    const databaseId = 'YOUR_DATABASE_ID';
    const collectionId = 'therapists';
    
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    
    while (hasMore) {
        const profiles = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.limit(limit), Query.offset(offset)]
        );
        
        console.log(`Processing batch: ${offset} to ${offset + profiles.documents.length}`);
        
        for (const profile of profiles.documents) {
            try {
                const now = new Date().toISOString();
                
                // Add missing fields without overwriting existing data
                await databases.updateDocument(
                    databaseId,
                    collectionId,
                    profile.$id,
                    {
                        isActive: profile.isActive ?? true,
                        createdAt: profile.createdAt || profile.$createdAt || now,
                        updatedAt: profile.updatedAt || profile.$updatedAt || now,
                        version: profile.version || 1,
                    }
                );
                
                console.log(`✅ Migrated profile: ${profile.$id}`);
            } catch (error) {
                console.error(`❌ Failed to migrate ${profile.$id}:`, error.message);
            }
        }
        
        offset += limit;
        hasMore = profiles.documents.length === limit;
    }
    
    console.log('✅ Migration complete!');
}

migrateTherapistProfiles().catch(console.error);
```

---

## 3. **Update Your Code**

### Before (UNSAFE):
```typescript
// ❌ Old way - overwrites entire document
await therapistService.update(profileId, {
    name: 'New Name'
});
```

### After (SECURE):
```typescript
// ✅ New way - partial update with safety checks
import { secureProfileService } from '@/lib/appwrite/services/secure-profile.service';

const result = await secureProfileService.updateTherapistProfile(
    profileId,
    userId,
    { name: 'New Name' },
    lastKnownUpdatedAt // optional: for race condition prevention
);

if (!result.success) {
    if (result.conflictDetected) {
        console.error('Profile was modified by another user!');
        // Refresh and show conflict resolution UI
    } else {
        console.error('Update failed:', result.error);
    }
} else {
    console.log('Profile updated:', result.profile);
}
```

---

## 4. **Example Use Cases**

### Create New Therapist Profile
```typescript
const profile = await secureProfileService.createTherapistProfile(
    userId,
    {
        // Public data
        name: 'Wiwid',
        location: 'Yogyakarta',
        specialization: 'Traditional Massage',
        yearsOfExperience: 5,
        isLicensed: true,
        status: 'available',
    },
    {
        // Private data
        email: 'wiwid@example.com',
        whatsappNumber: '+6281234567890',
    }
);
```

### Update Public Profile
```typescript
const result = await secureProfileService.updateTherapistProfile(
    profileId,
    userId,
    {
        status: 'busy',
        description: 'Updated bio...',
    }
);
```

### Update Private Data
```typescript
const result = await secureProfileService.updateTherapistPrivateData(
    profileId,
    userId,
    {
        whatsappNumber: '+6289876543210',
    }
);
```

### Soft Delete Profile
```typescript
const result = await secureProfileService.softDeleteProfile(
    profileId,
    userId,
    userRole
);
```

### Restore Deleted Profile (Admin Only)
```typescript
const result = await secureProfileService.restoreProfile(
    profileId,
    adminUserId,
    'admin'
);
```

### View Profile History
```typescript
const history = await secureProfileService.getProfileHistory(profileId);

history.forEach(backup => {
    console.log(`Version ${backup.version} from ${backup.backedUpAt}`);
    console.log(backup.snapshot);
});
```

### Restore from Backup (Admin Only)
```typescript
const result = await secureProfileService.restoreFromBackup(
    profileId,
    3, // version number
    adminUserId,
    'admin'
);
```

### Get Only Active Profiles
```typescript
const activeProfiles = await secureProfileService.getActiveProfiles([
    Query.equal('location', 'Yogyakarta'),
]);
```

---

## 5. **Replace Existing Calls**

Find and replace these patterns:

### Pattern 1: therapistService.update()
```bash
# Find all update calls
grep -r "therapistService.update" src/
```

Replace with:
```typescript
secureProfileService.updateTherapistProfile(profileId, userId, updates)
```

### Pattern 2: Direct database.updateDocument()
```bash
# Find direct updates
grep -r "database.updateDocument" src/
```

Replace with secure service methods.

---

## 6. **Testing Checklist**

- [ ] Create new profile with public/private separation
- [ ] Update profile partially (verify old fields preserved)
- [ ] Try updating with stale updatedAt (should detect conflict)
- [ ] Soft delete profile (verify isActive=false, deletedAt set)
- [ ] Restore deleted profile
- [ ] View profile history
- [ ] Restore from old backup version
- [ ] Try unauthorized update (should fail)
- [ ] Try updating soft-deleted profile (should fail)
- [ ] Get only active profiles (should exclude deleted)

---

## 7. **Production Deployment**

### Step 1: Backup Everything
```bash
# Export all profiles before migration
node export-profiles.mjs > profiles-backup.json
```

### Step 2: Run Migration Script
```bash
node migrate-add-timestamps.mjs
```

### Step 3: Deploy New Code
```bash
pnpm build
# Deploy to production
```

### Step 4: Monitor
- Watch for "Unauthorized" errors (permission issues)
- Watch for "conflict detected" errors (race conditions)
- Check backup collection is being populated

---

## 8. **Benefits of Secure Storage**

✅ **No More Data Loss**: Soft deletes and backups prevent accidental deletion
✅ **Race Condition Protection**: Optimistic locking prevents conflicting updates
✅ **Audit Trail**: Profile history shows all changes over time
✅ **Privacy**: Sensitive data separated from public data
✅ **Access Control**: Users can only edit their own profiles
✅ **Scalability**: Proper timestamps and versioning for future features
✅ **Compliance**: Meet security standards for production apps
✅ **Recovery**: Admins can restore profiles from any backup version

---

## Questions?

If you encounter issues:
1. Check Appwrite logs for permission errors
2. Verify collection schemas match the guide
3. Ensure userId field exists and is indexed
4. Check that timestamps are ISO strings, not Date objects

