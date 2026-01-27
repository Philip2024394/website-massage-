# Daily Therapist Status Reset & Sorting System

## Overview

This system implements two key features for better platform management and user experience:

1. **Daily Status Reset** - Automatically resets therapist statuses at 6 AM Indonesia time
2. **Intelligent Sorting** - Displays therapists prioritized by availability and price

---

## 1. Daily Status Reset

### Purpose
Controls inactive therapist accounts and forces daily manual reactivation to maintain platform quality.

### How It Works

#### Timing
- **Execution**: Every day at 6:00 AM Indonesia time (WIB/WITA/WIT)
- **Automation**: Scheduled via Appwrite Functions cron job

#### Reset Logic
When the function executes at 6 AM:
1. Fetches ALL therapists from database
2. Randomly shuffles therapist list
3. Assigns new statuses:
   - **80%** → `status = 'offline'`
   - **20%** → `status = 'busy'`
4. Updates all therapist records in batches
5. Adds `lastResetAt` timestamp to each record

#### Example

**Before Reset (5:59 AM)**
```
Therapist A: available ✅
Therapist B: busy      🟡
Therapist C: offline   ⚫
Therapist D: available ✅
Therapist E: available ✅
```

**After Reset (6:00 AM)**
```
Therapist A: offline  ⚫ (80% chance)
Therapist B: busy     🟡 (20% chance)
Therapist C: offline  ⚫ (80% chance)
Therapist D: busy     🟡 (20% chance)
Therapist E: offline  ⚫ (80% chance)
```

**After Manual Reactivation (7:30 AM)**
```
Therapist A: available  ✅ (Manually set - active therapist)
Therapist B: busy       🟡 (Not reactivated yet)
Therapist C: offline    ⚫ (Inactive - didn't reactivate)
Therapist D: available  ✅ (Manually set - active therapist)
Therapist E: offline    ⚫ (Inactive - didn't reactivate)
```

### Benefits

1. **Account Quality Control**
   - Inactive therapists automatically set to offline/busy
   - Forces daily engagement from active therapists
   - Prevents "ghost" profiles appearing as available

2. **Platform Credibility**
   - Only active therapists show as available
   - Reduces customer frustration with unresponsive therapists
   - Maintains service quality standards

3. **Therapist Accountability**
   - Must actively log in daily to set status
   - Encourages regular platform engagement
   - Creates routine check-in habit

---

## 2. Intelligent Therapist Sorting

### Purpose
Improve user experience by showing the most relevant therapists first - those who are available AND offer competitive pricing.

### Sorting Algorithm

Therapists are sorted using a **4-level priority system**:

#### Priority 1: Status (Availability)
```
Available (highest priority)
  ↓
Busy (medium priority)
  ↓
Offline (lowest priority)
```

#### Priority 2: Distance (if user location available)
Within each status group, sort by **nearest first**

#### Priority 3: Price (NEW)
Within same status + distance, sort by **lowest price first**

#### Priority 4: Random
For identical status + distance + price, randomize order

### Implementation

Located in: [HomePage.tsx](../src/pages/HomePage.tsx) lines 1898-1921

```typescript
.sort((a: any, b: any) => {
    // 🎯 PRIMARY: Status Priority (Available → Busy → Offline)
    if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
    }
    
    // 🌍 SECONDARY: Distance (nearest first)
    if (currentUserLocation && a._distance !== null && b._distance !== null) {
        if (a._distance !== b._distance) {
            return a._distance - b._distance;
        }
    }
    
    // 💰 TERTIARY: Price (lowest first) ⭐ NEW
    const priceA = parseFloat(a.price) || parseFloat(a.basePrice) || 999999;
    const priceB = parseFloat(b.price) || parseFloat(b.basePrice) || 999999;
    if (priceA !== priceB) {
        return priceA - priceB; // Cheapest first
    }
    
    // Quaternary: Random for identical items
    return a.randomSeed - b.randomSeed;
});
```

### Example Display Order

**User searches in Jakarta, Indonesia**

Homepage shows therapists in this order:

1. **Available Therapists** (manually reactivated after 6 AM)
   ```
   ✅ Sarah - 2.5km - Rp 180,000 (cheapest available)
   ✅ John  - 2.5km - Rp 200,000
   ✅ Mike  - 3.1km - Rp 180,000
   ✅ Lisa  - 4.2km - Rp 250,000
   ```

2. **Busy Therapists** (from daily reset or manual setting)
   ```
   🟡 David - 1.8km - Rp 170,000 (cheapest busy)
   🟡 Emma  - 2.9km - Rp 190,000
   🟡 Alex  - 5.1km - Rp 210,000
   ```

3. **Offline Therapists** (from daily reset or manual setting)
   ```
   ⚫ Tom   - 1.2km - Rp 160,000
   ⚫ Jane  - 3.4km - Rp 180,000
   ⚫ Mark  - 6.7km - Rp 220,000
   ```

### Benefits

1. **Better User Experience**
   - Available therapists shown first (highest chance of booking)
   - Cheapest options prioritized (better value)
   - Nearest therapists displayed (faster service)

2. **Competitive Pricing**
   - Encourages therapists to offer competitive rates
   - Rewards affordable pricing with better visibility
   - Helps budget-conscious customers find best deals

3. **Fair Distribution**
   - All available therapists get equal exposure
   - Price sorting is transparent and predictable
   - No favoritism or hidden ranking factors

---

## Setup & Deployment

### Prerequisites

1. **Appwrite Account** with Functions enabled
2. **API Key** with write permissions to therapist collection
3. **Node.js 18+** for function runtime

### Step 1: Configure Appwrite Function

1. Navigate to **Appwrite Console** → **Functions**
2. Click **Create Function**
3. Configure:
   - **Name**: Daily Therapist Reset
   - **Runtime**: Node.js 18+
   - **Trigger**: Schedule
   - **Schedule**: `0 6 * * *` (6 AM daily)
   - **Timezone**: `Asia/Jakarta` (WIB - UTC+7)
     - Alternative: `Asia/Makassar` (WITA - UTC+8)
     - Alternative: `Asia/Jayapura` (WIT - UTC+9)

### Step 2: Set Environment Variables

Add these in Function settings:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key_here
DATABASE_ID=your_database_id
THERAPISTS_COLLECTION_ID=therapists_collection_id
```

### Step 3: Deploy Function

#### Option A: Appwrite CLI
```bash
cd appwrite-functions/daily-therapist-reset
npm install
appwrite functions createDeployment \
  --functionId=<your-function-id> \
  --activate=true \
  --entrypoint=src/main.js
```

#### Option B: Appwrite Console UI
1. Navigate to Function → Deployments
2. Click **Create Deployment**
3. Upload function code (zip or manual)
4. Set entrypoint: `src/main.js`
5. Activate deployment

### Step 4: Test

#### Manual Test
1. Go to **Functions** → **Daily Therapist Reset** → **Execute**
2. Click **Execute Now**
3. Check execution logs

#### Expected Output
```json
{
  "success": true,
  "timestamp": "2024-01-15T06:00:00.000Z",
  "timezone": "Asia/Jakarta (WIB UTC+7)",
  "totalTherapists": 150,
  "successCount": 150,
  "errorCount": 0,
  "distribution": {
    "offline": 120,
    "busy": 30
  }
}
```

---

## Monitoring

### Check Execution History

**Appwrite Console** → **Functions** → **Daily Therapist Reset** → **Executions**

View:
- Execution timestamp
- Success/failure status
- Logs and errors
- Response data

### Alert on Failures

Add monitoring webhook to function (optional):

```javascript
// In main.js, add after reset completion
if (errorCount > 0) {
  await fetch('https://your-monitoring-webhook.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alert: 'Daily Reset Errors',
      errorCount,
      timestamp: new Date().toISOString()
    })
  });
}
```

### Database Verification

Query therapists to verify reset:

```javascript
const therapists = await databases.listDocuments(
  databaseId,
  therapistsCollectionId
);

// Count by status
const counts = therapists.documents.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {});

console.log('Status distribution:', counts);
// Expected right after 6 AM: { offline: ~80%, busy: ~20%, available: 0 }
```

---

## Troubleshooting

### Function Not Executing

**Check:**
1. Function is **Active** in Appwrite Console
2. Cron schedule is correct: `0 6 * * *`
3. Timezone is set properly
4. No errors in previous executions

**Solution:**
- View execution logs for error details
- Test manual execution first
- Verify API key permissions

### Rate Limit Errors

**Symptoms:**
- Partial updates (successCount < totalTherapists)
- Rate limit errors in logs

**Solution:**
- Function already uses batching (10 per batch)
- Reduce `batchSize` in main.js if needed
- Add longer delays between batches

### Partial Updates

**Check:**
- `successCount` vs `totalTherapists` in logs
- Specific therapist IDs that failed
- Error messages for failed updates

**Solution:**
- Failed therapists keep previous status until next reset
- Check therapist record permissions
- Verify database schema matches update fields

---

## Customization

### Change Distribution Ratio

Edit `main.js` line 91:

```javascript
// Current: 80% offline, 20% busy
const offlineCount = Math.floor(totalCount * 0.8);

// Example: 70% offline, 30% busy
const offlineCount = Math.floor(totalCount * 0.7);
```

### Change Reset Time

Update cron schedule in Appwrite Console:

```
5 AM:  0 5 * * *
7 AM:  0 7 * * *
Twice: 0 6,18 * * *  (6 AM and 6 PM)
```

### Adjust Price Sorting

Edit [HomePage.tsx](../src/pages/HomePage.tsx) lines 1914-1920:

```typescript
// Current: Ascending (cheapest first)
return priceA - priceB;

// Reverse: Descending (most expensive first)
return priceB - priceA;
```

---

## Security

- **API Key**: Stored as environment variable, never in code
- **Permissions**: API key has write access to therapist collection only
- **Execution**: Function only runs via Appwrite scheduled trigger
- **No Public Access**: Function not exposed as public endpoint

---

## Impact & Metrics

### Expected Outcomes

1. **Therapist Engagement**
   - Daily login rate increases
   - More active status management
   - Better platform responsiveness

2. **Customer Satisfaction**
   - Higher booking success rate
   - Fewer unresponsive therapists
   - Better value (cheapest shown first)

3. **Platform Health**
   - Cleaner therapist listings
   - More accurate availability
   - Reduced ghost profiles

### Key Metrics to Monitor

- **Daily Reset Success Rate**: Should be >99%
- **Therapist Reactivation Rate**: % who manually set status after 6 AM
- **Booking Conversion**: Compare before/after implementation
- **Customer Complaints**: Should decrease about unavailable therapists

---

## Files Modified

1. **New Files**:
   - `appwrite-functions/daily-therapist-reset/src/main.js` - Reset function
   - `appwrite-functions/daily-therapist-reset/package.json` - Dependencies
   - `appwrite-functions/daily-therapist-reset/README.md` - Function docs
   - `docs/DAILY_RESET_SYSTEM.md` - This document

2. **Modified Files**:
   - `src/pages/HomePage.tsx` - Added price sorting (lines 1914-1920)

---

## Support

For issues or questions:

1. Check function execution logs in Appwrite Console
2. Review [function README](../appwrite-functions/daily-therapist-reset/README.md)
3. Test manual execution to verify configuration
4. Check therapist collection schema and permissions

---

## License

MIT - Part of website-massage platform
