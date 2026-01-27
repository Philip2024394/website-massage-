# Daily Status Reset & Price Sorting - Quick Start

## What Was Implemented

✅ **Daily Status Reset System**
- Automatically resets ALL therapist statuses at 6 AM Indonesia time
- 80% → offline, 20% → busy
- Forces daily manual reactivation
- Prevents inactive accounts showing as available

✅ **Price Sorting on Homepage**
- Available therapists shown FIRST
- Within each status group, sort by LOWEST price first
- Helps customers find best deals from active therapists

---

## Quick Deploy

### 1. Deploy Reset Function to Appwrite

```bash
cd appwrite-functions/daily-therapist-reset
npm install
```

Then in **Appwrite Console**:

1. Navigate to **Functions** → **Create Function**
2. Configure:
   - Name: `Daily Therapist Reset`
   - Runtime: `Node.js 18+`
   - Schedule: `0 6 * * *`
   - Timezone: `Asia/Jakarta`

3. Set **Environment Variables**:
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=68f23b11000d25eb3664
   APPWRITE_API_KEY=<your-api-key-here>
   DATABASE_ID=<your-database-id>
   THERAPISTS_COLLECTION_ID=<therapist-collection-id>
   ```

4. Upload function code from `appwrite-functions/daily-therapist-reset/`

5. **Test**: Click "Execute Now" and verify logs

### 2. Price Sorting (Already Done)

The homepage already has the price sorting implemented! No additional steps needed.

**Location**: `src/pages/HomePage.tsx` lines 1898-1924

---

## How It Works

### Daily Reset (6 AM Indonesia Time)

**Before 6 AM:**
```
100 therapists:
- 40 available ✅
- 20 busy 🟡  
- 40 offline ⚫
```

**After 6 AM (automatic reset):**
```
100 therapists:
- 0 available ✅ (all reset)
- 20 busy 🟡 (20% random)
- 80 offline ⚫ (80% random)
```

**After therapists reactivate (7-9 AM):**
```
100 therapists:
- 30 available ✅ (manually reactivated)
- 10 busy 🟡 (some stayed busy, some reactivated as busy)
- 60 offline ⚫ (inactive therapists who didn't reactivate)
```

### Homepage Display Order

Therapists sorted by:

1. **Status**: Available → Busy → Offline
2. **Distance**: Nearest first (if user location available)
3. **Price**: Lowest first ⭐ NEW
4. **Random**: For identical items

**Example:**
```
✅ Sarah - 2.5km - Rp 180,000  (available, cheapest)
✅ John  - 2.5km - Rp 200,000  (available)
✅ Mike  - 3.1km - Rp 180,000  (available)
🟡 David - 1.8km - Rp 170,000  (busy, cheapest busy)
🟡 Emma  - 2.9km - Rp 190,000  (busy)
⚫ Tom   - 1.2km - Rp 160,000  (offline)
```

---

## Testing

### Test Daily Reset

**In Appwrite Console:**
1. Go to Functions → Daily Therapist Reset
2. Click "Execute Now"
3. Check logs for success message

**Expected Response:**
```json
{
  "success": true,
  "totalTherapists": 150,
  "successCount": 150,
  "errorCount": 0,
  "distribution": {
    "offline": 120,
    "busy": 30
  }
}
```

### Verify Price Sorting

1. Open homepage
2. Select a city (e.g., Jakarta)
3. Check therapist cards:
   - Available therapists at top
   - Lowest prices shown first within each status group

---

## Monitoring

### Daily Checks

**Appwrite Console** → Functions → Executions

- Check function runs at 6 AM daily
- Verify success rate
- Review error logs if any

### Database Verification

```javascript
// Query therapists after 6 AM reset
const therapists = await databases.listDocuments(
  databaseId,
  therapistsCollectionId
);

// Check status distribution
const counts = therapists.documents.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {});

console.log(counts);
// Expected right after 6 AM: { offline: ~80%, busy: ~20% }
```

---

## Files Created/Modified

### New Files
```
appwrite-functions/daily-therapist-reset/
  ├── src/main.js           # Reset function code
  ├── package.json          # Dependencies
  └── README.md            # Function documentation

docs/
  ├── DAILY_RESET_SYSTEM.md    # Complete documentation
  └── QUICK_START_RESET.md     # This file
```

### Modified Files
```
src/pages/HomePage.tsx        # Added price sorting (lines 1914-1920)
```

---

## Troubleshooting

### Function Not Running

**Check:**
- Function is "Active" in Appwrite Console
- Schedule is `0 6 * * *`
- Timezone is `Asia/Jakarta`
- API key has write permissions

### Partial Updates

**Check execution logs:**
- `successCount` should equal `totalTherapists`
- Failed therapists keep previous status
- Will be reset in next daily run

### Price Sorting Not Working

**Verify:**
- Therapist records have `price` or `basePrice` field
- Values are numbers (not strings)
- Check browser console for sort logs

---

## Customization

### Change Reset Time

Edit cron schedule in Appwrite:
```
5 AM:  0 5 * * *
7 AM:  0 7 * * *
Twice: 0 6,18 * * *
```

### Change Distribution

Edit `main.js` line 91:
```javascript
// 70% offline, 30% busy
const offlineCount = Math.floor(totalCount * 0.7);
```

### Change Sort Order

Edit `HomePage.tsx` lines 1914-1920:
```typescript
// Most expensive first
return priceB - priceA;
```

---

## Support

For detailed documentation, see:
- [Complete System Guide](DAILY_RESET_SYSTEM.md)
- [Function README](../appwrite-functions/daily-therapist-reset/README.md)

---

## Impact

### Benefits

✅ **Platform Quality**
- Only active therapists show as available
- Inactive accounts automatically filtered
- Better customer experience

✅ **Competitive Pricing**
- Cheapest therapists get better visibility
- Encourages fair pricing
- Helps budget-conscious customers

✅ **Therapist Engagement**
- Forces daily login and status check
- Creates routine engagement habit
- Increases platform activity

### Metrics to Track

- Daily reset success rate (target: >99%)
- Therapist reactivation rate after 6 AM
- Customer booking conversion rate
- Complaints about unavailable therapists

---

**Status**: ✅ Ready for deployment
**Priority**: HIGH - Deploy to production ASAP
**Next Steps**: Deploy function to Appwrite and monitor daily executions
