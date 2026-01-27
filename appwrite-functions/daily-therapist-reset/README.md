# Daily Therapist Status Reset Function

Automatically resets ALL therapist online statuses at 6 AM Indonesia time daily.

## Purpose

Controls inactive therapist accounts and forces daily manual reactivation.

### Reset Logic
- **80%** of therapists → `status = 'offline'`
- **20%** of therapists → `status = 'busy'`
- Randomized distribution each day
- Forces therapists to manually set status to 'available' or 'busy' after 6 AM
- Prevents inactive accounts from appearing as available

## Scheduling

Configure in Appwrite Console:

### Schedule Settings
- **Cron Schedule**: `0 6 * * *` (Every day at 6:00 AM)
- **Timezone**: `Asia/Jakarta` (WIB - UTC+7)
- **Alternative Timezones** (for other Indonesia regions):
  - Central Indonesia: `Asia/Makassar` (WITA - UTC+8)
  - Eastern Indonesia: `Asia/Jayapura` (WIT - UTC+9)

### Environment Variables

Set these in Appwrite Function settings:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key_with_write_permissions
DATABASE_ID=your_database_id
THERAPISTS_COLLECTION_ID=therapists_collection_id
```

## Installation

1. **Create Function in Appwrite Console**:
   - Navigate to Functions → Create Function
   - Name: "Daily Therapist Reset"
   - Runtime: Node.js 18+
   - Trigger: Schedule
   - Schedule: `0 6 * * *`
   - Timezone: `Asia/Jakarta`

2. **Deploy Code**:
   ```bash
   cd appwrite-functions/daily-therapist-reset
   npm install
   ```

3. **Upload to Appwrite**:
   - Use Appwrite CLI:
     ```bash
     appwrite functions createDeployment \
       --functionId=<your-function-id> \
       --activate=true \
       --entrypoint=src/main.js
     ```
   - Or use Appwrite Console UI to upload the function code

4. **Set Environment Variables** in Appwrite Console

5. **Test Manually**:
   - Go to Functions → Daily Therapist Reset → Execute
   - Check logs for successful execution

## Testing

### Manual Test Execution
```bash
# Test via Appwrite Console
1. Navigate to Functions → Daily Therapist Reset
2. Click "Execute Now"
3. Check execution logs

# Expected output:
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

### Verify Reset Results
```javascript
// Query therapists after reset
const therapists = await databases.listDocuments(
  databaseId,
  therapistsCollectionId
);

// Count by status
const statusCounts = therapists.documents.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {});

console.log(statusCounts);
// Expected: { offline: ~80%, busy: ~20%, available: 0 }
```

## Monitoring

### Check Execution History
- Appwrite Console → Functions → Daily Therapist Reset → Executions
- View logs for each daily execution
- Monitor success/error rates

### Alert on Failures
```javascript
// Optional: Add monitoring webhook
if (errorCount > 0) {
  // Send alert to admin (Slack, email, etc.)
  await fetch('your-monitoring-webhook', {
    method: 'POST',
    body: JSON.stringify({
      alert: 'Daily Reset Errors',
      errorCount,
      timestamp: new Date().toISOString()
    })
  });
}
```

## Behavior

### Before Reset (5:59 AM)
```
Therapist A: available
Therapist B: busy  
Therapist C: offline
Therapist D: available
```

### After Reset (6:00 AM)
```
Therapist A: offline  ← 80% chance
Therapist B: busy     ← 20% chance
Therapist C: offline  ← 80% chance  
Therapist D: busy     ← 20% chance
```

### After Manual Reactivation (7:30 AM)
```
Therapist A: available  ← Manually set by therapist
Therapist B: busy       ← Still from reset (not reactivated)
Therapist C: offline    ← Still from reset (inactive therapist)
Therapist D: available  ← Manually set by therapist
```

## Integration with Homepage

The homepage already prioritizes therapists by status:
1. **Available** therapists (manually reactivated after 6 AM)
2. **Busy** therapists (from reset or manual setting)
3. **Offline** therapists (from reset or manual setting)

Within each group, therapists are sorted by **lowest price first**.

See [HomePage.tsx](../../src/pages/HomePage.tsx) lines 1900-1920 for sorting implementation.

## Troubleshooting

### Function Not Executing
- Check function is **Active** in Appwrite Console
- Verify schedule cron syntax: `0 6 * * *`
- Check timezone is set correctly
- View execution logs for errors

### Rate Limit Errors
- Function processes therapists in batches of 10
- 200ms delay between batches
- If still hitting limits, reduce `batchSize` in main.js

### Partial Updates
- Check `successCount` vs `totalTherapists` in logs
- Failed updates logged with therapist ID
- Therapists with errors retain previous status until next reset

## Maintenance

### Adjust Distribution Ratio
Edit `main.js` line 91:
```javascript
const offlineCount = Math.floor(totalCount * 0.8); // Change 0.8 to desired percentage
```

### Change Reset Time
Update cron schedule in Appwrite Console:
- 5 AM: `0 5 * * *`
- 7 AM: `0 7 * * *`
- Twice daily: `0 6,18 * * *` (6 AM and 6 PM)

### Add Status Field
If adding `lastResetAt` tracking:
```javascript
// Already included in main.js
await databases.updateDocument(
  databaseId,
  therapistsCollectionId,
  therapist.$id,
  {
    status: newStatus,
    lastResetAt: new Date().toISOString() // Track last reset
  }
);
```

## Security

- Uses Appwrite API Key with **write** permissions to therapist collection
- API key stored as environment variable (never committed to code)
- Function only accessible via Appwrite scheduled execution
- No public endpoints exposed

## License

MIT - Part of website-massage platform
