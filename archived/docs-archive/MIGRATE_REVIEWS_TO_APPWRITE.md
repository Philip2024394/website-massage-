# Migrate Reviews from LocalStorage to Appwrite

## Step 1: Create Reviews Collection in Appwrite Console

1. Go to: **https://syd.cloud.appwrite.io/console**
2. Select Project: **68f23b11000d25eb3664**
3. Navigate to: **Databases** → **68f76ee1000e64ca8d05**
4. Click: **"Create Collection"**
5. Name: **"Reviews"**
6. Collection ID: Let Appwrite auto-generate or use: **`reviews_collection`**

## Step 2: Add Attributes to Reviews Collection

Add these attributes in Appwrite Console:

| Attribute | Type | Size | Required | Default | Array |
|-----------|------|------|----------|---------|-------|
| providerId | String | 255 | ✅ Yes | - | No |
| providerType | String | 50 | ✅ Yes | - | No |
| providerName | String | 255 | ✅ Yes | - | No |
| rating | Integer | - | ✅ Yes | - | No |
| comment | String | 2000 | ❌ No | - | No |
| reviewerName | String | 255 | ✅ Yes | - | No |
| whatsapp | String | 50 | ❌ No | - | No |
| avatar | String | 500 | ❌ No | - | No |
| status | String | 50 | ✅ Yes | "approved" | No |
| location | String | 255 | ❌ No | - | No |
| createdAt | String | 50 | ✅ Yes | - | No |
| userId | String | 255 | ❌ No | - | No |
| isVerified | Boolean | - | ❌ No | false | No |

## Step 3: Set Collection Permissions

### Read Permissions:
- ✅ **Any** (public read - anyone can see reviews)

### Write Permissions:
- ✅ **Users** (logged-in users can create reviews)
- ✅ **Guests** (allow anonymous reviews)

### Update/Delete Permissions:
- ✅ **Admins only** (or specific admin role)

## Step 4: Update Config File

After creating the collection, get its ID and update:

**File:** `lib/appwrite/config.ts`

```typescript
reviews: import.meta.env.VITE_REVIEWS_COLLECTION_ID || 'YOUR_COLLECTION_ID_HERE',
```

Replace `'YOUR_COLLECTION_ID_HERE'` with the actual collection ID from Appwrite.

## Step 5: Migrate Existing localStorage Reviews to Appwrite (Optional)

If you want to keep existing reviews, create a migration script:

**File:** `migrate-reviews-to-appwrite.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Migrate Reviews to Appwrite</title>
    <script src="https://cdn.jsdelivr.net/npm/appwrite@13/dist/browser/appwrite.min.js"></script>
</head>
<body>
    <h1>Migrate Reviews to Appwrite</h1>
    <button onclick="migrateReviews()">Start Migration</button>
    <div id="status"></div>
    
    <script>
        const client = new Appwrite.Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');
        
        const databases = new Appwrite.Databases(client);
        
        async function migrateReviews() {
            const status = document.getElementById('status');
            
            // Get reviews from localStorage
            const reviewsJson = localStorage.getItem('massage_app_reviews');
            if (!reviewsJson) {
                status.innerHTML = '❌ No reviews found in localStorage';
                return;
            }
            
            const reviews = JSON.parse(reviewsJson);
            status.innerHTML = `Found ${reviews.length} reviews. Migrating...<br>`;
            
            let migrated = 0;
            for (const review of reviews) {
                try {
                    await databases.createDocument(
                        '68f76ee1000e64ca8d05',
                        'YOUR_REVIEWS_COLLECTION_ID', // Update this!
                        Appwrite.ID.unique(),
                        {
                            providerId: review.providerId,
                            providerType: review.providerType || 'therapist',
                            providerName: review.providerName || 'Unknown',
                            rating: review.rating,
                            comment: review.comment || '',
                            reviewerName: review.userName,
                            whatsapp: '',
                            avatar: review.avatar || '',
                            status: 'approved',
                            location: review.location || 'Yogyakarta, Indonesia',
                            createdAt: review.createdAt || new Date().toISOString(),
                            userId: review.userId || '',
                            isVerified: review.isVerified || false
                        }
                    );
                    migrated++;
                    status.innerHTML += `✅ Migrated review ${migrated}/${reviews.length}<br>`;
                } catch (error) {
                    status.innerHTML += `❌ Error: ${error.message}<br>`;
                }
            }
            
            status.innerHTML += `<br>🎉 Migration complete! ${migrated}/${reviews.length} reviews migrated.`;
        }
    </script>
</body>
</html>
```

## Step 6: Update Review Components to Use Appwrite

Your app already has the Appwrite review service at `lib/appwrite/services/review.service.ts`. 

We need to switch from the localStorage-based `reviewService` to the Appwrite `reviewService`.

### Components that need updating:
1. `components/RotatingReviews.tsx` - Switch to Appwrite API
2. `pages/ReviewsPage.tsx` - Already using Appwrite! ✅
3. `hooks/useAutoReviews.ts` - Update to use Appwrite instead of localStorage
4. `lib/autoReviewService.ts` - Update to save to Appwrite

## Step 7: Test the Migration

1. Create the collection in Appwrite
2. Update the config file with collection ID
3. Run migration script (if keeping old reviews)
4. Refresh your app
5. Check if reviews display from Appwrite
6. Try adding a new review
7. Verify it appears for all users

## Benefits After Migration:

✅ Reviews persist across browsers
✅ Reviews visible to all users immediately
✅ Admin can moderate reviews in Appwrite Console
✅ No localStorage size limitations
✅ Better performance (indexed database)
✅ Real-time synchronization
✅ Backup and export capabilities

---

**Next Steps:**
1. Create the reviews collection in Appwrite Console
2. Let me know the collection ID
3. I'll update the code to use Appwrite instead of localStorage
