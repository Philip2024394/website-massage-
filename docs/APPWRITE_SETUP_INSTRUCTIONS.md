# 🗄️ Appwrite Analytics Collection Setup

## Quick Setup - 2 Methods Available

### ✅ Method 1: Automated Script (Recommended - 2 minutes)

**Step 1: Get Your Appwrite API Key**
1. Go to: https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664/settings
2. Click on "API Keys" tab
3. Click "Create API Key"
4. Name: `Analytics Setup`
5. Scopes: Check all `databases.*` permissions
6. Click "Create"
7. Copy the API key

**Step 2: Run Setup Script**
```powershell
# Set your API key (paste your actual key)
$env:APPWRITE_API_KEY="your-api-key-here"

# Install Appwrite SDK if needed
npm install node-appwrite

# Run the setup script
node scripts/setup-analytics-collection.js
```

**Expected Output:**
```
🚀 Starting Appwrite Analytics Collection Setup
✅ Collection created successfully: analytics_events
📝 Creating attributes...
  ✅ Attribute eventType created
  ✅ Attribute timestamp created
  ... (13 more attributes)
🔍 Creating indexes...
  ✅ Index event_type_idx created
  ... (4 more indexes)
✅ Analytics collection setup completed successfully!
```

---

### 🖱️ Method 2: Manual Setup via Appwrite Console (10-15 minutes)

**Step 1: Access Appwrite Console**
- URL: https://syd.cloud.appwrite.io/console
- Project ID: `68f23b11000d25eb3664`
- Database ID: `68f76ee1000e64ca8d05`

**Step 2: Create Collection**
1. Navigate to "Databases" → Select database `68f76ee1000e64ca8d05`
2. Click "Create Collection"
3. Collection ID: `analytics_events`
4. Collection Name: `Analytics Events`
5. Click "Create"

**Step 3: Add 15 Attributes**

| # | Attribute Name | Type | Size | Required | Description |
|---|----------------|------|------|----------|-------------|
| 1 | eventType | String | 100 | ✅ Yes | Event type identifier |
| 2 | timestamp | Datetime | - | ✅ Yes | When event occurred |
| 3 | userId | String | 100 | ⬜ No | User ID |
| 4 | therapistId | String | 100 | ⬜ No | Therapist ID |
| 5 | placeId | String | 100 | ⬜ No | Place ID |
| 6 | hotelId | String | 100 | ⬜ No | Hotel ID |
| 7 | villaId | String | 100 | ⬜ No | Villa ID |
| 8 | bookingId | Integer | - | ⬜ No | Booking number |
| 9 | amount | Float | - | ⬜ No | Transaction amount |
| 10 | currency | String | 10 | ⬜ No | Currency code |
| 11 | metadata | String | 5000 | ⬜ No | Extra JSON data |
| 12 | sessionId | String | 200 | ⬜ No | Session ID |
| 13 | deviceType | String | 20 | ⬜ No | Device type |
| 14 | userAgent | String | 500 | ⬜ No | Browser info |
| 15 | location | String | 200 | ⬜ No | Geographic location |

**Step 4: Create 5 Indexes**

| Index Name | Type | Attributes | Order |
|------------|------|------------|-------|
| event_type_idx | Key | eventType, timestamp | ASC, DESC |
| therapist_events_idx | Key | therapistId, eventType, timestamp | ASC, ASC, DESC |
| place_events_idx | Key | placeId, eventType, timestamp | ASC, ASC, DESC |
| hotel_events_idx | Key | hotelId, eventType, timestamp | ASC, ASC, DESC |
| date_range_idx | Key | timestamp | DESC |

**Step 5: Set Permissions**
1. Click "Settings" tab in the collection
2. Set permissions:
   - **Create**: Role: `users` (Any authenticated user)
   - **Read**: Role: `users` (Any authenticated user)
   - **Delete**: Role: `admin` (Admin only)

---

## 🎯 Verification

After setup, verify everything is working:

```typescript
// Test in browser console or React component
import { analyticsService } from './services/analyticsService';

// Track a test event
await analyticsService.trackEvent({
    eventType: 'test_event',
    metadata: { test: true }
});

// Check platform analytics
const analytics = await analyticsService.getPlatformAnalytics();
console.log('Platform Analytics:', analytics);
```

---

## 📊 Collection Details

**Connection Info:**
- **Endpoint**: https://syd.cloud.appwrite.io/v1
- **Project**: 68f23b11000d25eb3664
- **Database**: 68f76ee1000e64ca8d05
- **Collection**: analytics_events

**Already configured in code:**
- ✅ `lib/appwrite.ts` - Collection ID added
- ✅ `services/analyticsService.ts` - Service ready
- ✅ `pages/PlatformAnalyticsPage.tsx` - Dashboard ready

---

## 🚀 Next Steps After Setup

Once the collection is created:

1. **Start Tracking Events** - Analytics service is ready to use
2. **View Dashboard** - Go to Admin → Platform Analytics
3. **Integrate Tracking** - Add event tracking throughout your app:
   - Profile views on `PlaceDetailPage`
   - WhatsApp clicks on contact buttons
   - QR scans on hotel/villa menus
   - Booking completions
   - Revenue tracking

---

## 🆘 Troubleshooting

**Issue: "Collection not found"**
- Verify collection ID is exactly `analytics_events`
- Check you're in the correct database

**Issue: "Permission denied"**
- Ensure API key has `databases.*` scopes
- Check permissions are set correctly

**Issue: "Attribute already exists"**
- Script will skip existing attributes
- Safe to re-run the script

**Need Help?**
- Documentation: https://appwrite.io/docs
- Check `docs/ANALYTICS_SYSTEM_COMPLETE.md` for full details

---

**Status:** Ready to track 20+ event types across your entire IndaStreet platform! 🎉
