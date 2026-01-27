# Daily Reset & Price Sorting - Deployment Checklist

## Pre-Deployment

- [x] Daily reset function code created
- [x] Price sorting implemented in HomePage
- [x] Documentation created
- [x] No TypeScript errors

## Deployment Steps

### Step 1: Deploy Appwrite Function

- [ ] Open Appwrite Console (https://cloud.appwrite.io)
- [ ] Navigate to Functions → Create Function
- [ ] Configure function settings:
  - [ ] Name: `Daily Therapist Reset`
  - [ ] Runtime: `Node.js 18.x` or higher
  - [ ] Trigger Type: `Schedule`
  - [ ] Schedule: `0 6 * * *`
  - [ ] Timezone: `Asia/Jakarta` (WIB - UTC+7)
  
### Step 2: Set Environment Variables

In Function Settings → Variables, add:

- [ ] `APPWRITE_ENDPOINT` = `https://cloud.appwrite.io/v1`
- [ ] `APPWRITE_PROJECT_ID` = `68f23b11000d25eb3664`
- [ ] `APPWRITE_API_KEY` = `<create-new-api-key>` ⚠️
- [ ] `DATABASE_ID` = `<your-database-id>`
- [ ] `THERAPISTS_COLLECTION_ID` = `<therapist-collection-id>`

⚠️ **Create API Key**:
1. Go to Appwrite Console → Project Settings → API Keys
2. Create new API Key with:
   - Name: `Daily Reset Function`
   - Expiration: `Never` (or set long expiration)
   - Scopes: `databases.read`, `databases.write`
3. Copy API key and add to function environment variables

### Step 3: Upload Function Code

#### Option A: Appwrite CLI (Recommended)

```bash
# Install Appwrite CLI if not installed
npm install -g appwrite

# Login to Appwrite
appwrite login

# Navigate to function directory
cd appwrite-functions/daily-therapist-reset

# Install dependencies
npm install

# Deploy function (get function ID from Appwrite Console)
appwrite functions createDeployment \
  --functionId=<function-id-from-console> \
  --activate=true \
  --entrypoint=src/main.js \
  --code=.
```

#### Option B: Manual Upload (Appwrite Console)

1. Zip the function directory:
   ```bash
   cd appwrite-functions/daily-therapist-reset
   # Windows PowerShell
   Compress-Archive -Path * -DestinationPath daily-reset.zip
   ```

2. In Appwrite Console:
   - Go to Function → Deployments
   - Click "Create Deployment"
   - Upload `daily-reset.zip`
   - Set entrypoint: `src/main.js`
   - Click "Activate"

### Step 4: Test Function

- [ ] In Appwrite Console, go to Function → Execute
- [ ] Click "Execute Now"
- [ ] Wait for execution to complete
- [ ] Check execution logs for success message
- [ ] Verify response JSON shows success

### Step 5: Monitor First Execution

- [ ] Wait for 6:00 AM Indonesia time (next day)
- [ ] Check Appwrite Console → Functions → Executions
- [ ] Verify function executed successfully
- [ ] Check execution logs
- [ ] Verify therapist statuses were reset

## Success Metrics

Track after deployment:

- Function execution success rate: Target >95%
- Therapist reactivation patterns
- Customer booking conversion rate

## Support Resources

- **Function Docs**: [appwrite-functions/daily-therapist-reset/README.md](../appwrite-functions/daily-therapist-reset/README.md)
- **System Guide**: [DAILY_RESET_SYSTEM.md](DAILY_RESET_SYSTEM.md)
- **Quick Start**: [QUICK_START_RESET.md](QUICK_START_RESET.md)

---

**Status**: ✅ Ready for deployment
**Priority**: HIGH
**Next**: Deploy Appwrite function following steps above
