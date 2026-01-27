# Appwrite Function Deployment Fix - sendSystemChatMessage

## Problem Diagnosed

The Appwrite function was building from the **wrong package.json** - it was using the root project's package.json which triggered a full Vite build instead of the simple function deployment.

### Error in Logs:
```
WARN Unsupported engine: wanted: {"node":"22.x"} (current: {"node":"v18.20.8","pnpm":"9.15.9"})
...
vite v6.4.1 building for production...
...
Build archive was not created.
```

## Root Cause

When deploying via Appwrite Console's manual upload, if the deployment package isn't structured correctly, Appwrite searches parent directories and finds the main application's package.json, triggering an incorrect build process.

## Solution Implemented

### 1. Updated package.json ✅
Added Node.js engine specification:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Updated appwrite.json ✅
Changed build command to:
```json
{
  "commands": "npm install --omit=dev",
  "entrypoint": "index.js"
}
```

### 3. Created Proper Deployment Archive ✅
Location: `functions/sendSystemChatMessage-deploy.tar.gz`

Contents:
- `index.js` (main function file)
- `package.json` (function dependencies)
- `appwrite.json` (function configuration)

**Size:** 2.21 KB

## Deployment Instructions

### Option 1: Upload via Appwrite Console (RECOMMENDED)

1. **Navigate to Function**
   - Go to: https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664/functions/function-6972e0c30012060a2762

2. **Upload Archive**
   - Click "Create deployment"
   - Choose "Manual"
   - Upload: `functions/sendSystemChatMessage-deploy.tar.gz`
   - Entrypoint: `index.js`
   - Click "Deploy"

3. **Verify Build**
   Expected logs:
   ```
   [open-runtimes] Build command execution started
   npm install --omit=dev
   added X packages
   [open-runtimes] Build completed successfully
   Build archive created ✓
   ```

4. **Test Function**
   - Go to "Executions" tab
   - Click "Execute now"
   - Test payload:
   ```json
   {
     "conversationId": "test-conversation",
     "recipientId": "test-user-id",
     "recipientName": "Test User",
     "recipientType": "user",
     "content": "Test system message"
   }
   ```
   - Expected response: `{"success": true, "messageId": "..."}`

### Option 2: Deploy via CLI

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Deploy function
cd functions/sendSystemChatMessage
appwrite functions createDeployment \
  --functionId 6972e0c30012060a2762 \
  --entrypoint index.js \
  --code .

# Activate deployment
appwrite functions updateDeployment \
  --functionId 6972e0c30012060a2762 \
  --deploymentId <deployment-id> \
  --activate true
```

## Why Previous Deployment Failed

### ❌ What Happened:
1. Appwrite looked for package.json
2. Found root project's package.json (not function's)
3. Ran: `cross-env ROLLUP_NO_NATIVE=1 vite build`
4. Built entire React application (2640 modules!)
5. Build succeeded but **wrong output structure**
6. No proper function entry point → "Build archive was not created"

### ✅ What Should Happen:
1. Appwrite uses function's package.json
2. Runs: `npm install --omit=dev`
3. Installs only `node-appwrite` dependency
4. Creates archive with:
   - `index.js`
   - `node_modules/`
   - `package.json`
5. Sets entrypoint: `index.js`
6. Function ready to execute

## File Structure

### Correct Function Structure:
```
functions/sendSystemChatMessage/
├── index.js              # Main function (ES module)
├── package.json          # Function dependencies only
├── appwrite.json         # Function configuration
└── README.md             # Documentation (not deployed)
```

### Deployment Archive Contains:
```
sendSystemChatMessage-deploy.tar.gz
├── index.js
├── package.json
└── appwrite.json
```

## Verification Checklist

After deployment, verify:

- [ ] Build logs show `npm install --omit=dev` (not Vite)
- [ ] Build completes in < 1 minute (not 40+ seconds)
- [ ] "Build archive created" appears in logs
- [ ] Function status shows "Ready"
- [ ] Test execution returns proper JSON response
- [ ] No Vite/React build warnings in logs

## Common Issues & Solutions

### Issue 1: "Build archive was not created"
**Cause:** Wrong package.json being used  
**Solution:** Deploy from correct directory with proper tar.gz

### Issue 2: "Unsupported engine: wanted node 22.x"
**Cause:** Root package.json requires Node 22  
**Solution:** Use function's package.json with `"node": ">=18.0.0"`

### Issue 3: "vite v6.4.1 building for production"
**Cause:** Running wrong build command  
**Solution:** Use `npm install --omit=dev` in appwrite.json

### Issue 4: Function times out
**Cause:** Large bundle or missing dependencies  
**Solution:** Ensure only necessary files in archive (< 5KB)

### Issue 5: "Cannot find module 'node-appwrite'"
**Cause:** Dependencies not installed  
**Solution:** Verify `npm install` runs during build

## Testing After Deployment

### 1. Test via Console
```json
{
  "conversationId": "67893aef0019f74b01d8",
  "recipientId": "therapist-id",
  "recipientName": "John Therapist",
  "recipientType": "therapist",
  "content": "Your booking has been confirmed!"
}
```

Expected Response:
```json
{
  "success": true,
  "messageId": "67a-message-id",
  "timestamp": "2026-01-23T04:35:00.000Z"
}
```

### 2. Test via Code
```javascript
import { Client, Functions } from 'appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const functions = new Functions(client);

const result = await functions.createExecution(
  '6972e0c30012060a2762', // Function ID
  JSON.stringify({
    conversationId: 'test-id',
    recipientId: 'user-id',
    recipientName: 'Test User',
    recipientType: 'user',
    content: 'Hello from backend!'
  })
);

console.log(result);
```

### 3. Check Execution Logs
- Go to Function → Executions
- Click on execution
- Verify logs show:
  ```
  📥 System message request received
  📋 Request body: {...}
  📤 Creating system message...
  ✅ System message created successfully
  ```

## Production Checklist

Before marking as complete:

- [ ] Function deploys successfully
- [ ] Build archive is created (< 5KB)
- [ ] No Vite/React build in logs
- [ ] Test execution succeeds
- [ ] Message appears in chat_messages collection
- [ ] Response time < 1 second
- [ ] No errors in execution logs
- [ ] Environment variables configured (if needed)
- [ ] Function permissions set correctly
- [ ] Rate limiting configured (if needed)

## Deployment Archive Location

**Ready to deploy:** `functions/sendSystemChatMessage-deploy.tar.gz`

**How it was created:**
```bash
cd functions/sendSystemChatMessage
tar -czf ../sendSystemChatMessage-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=src \
  --exclude=README.md \
  --exclude=.git \
  .
```

## Support

If deployment still fails:
1. Check Appwrite function logs for specific errors
2. Verify entrypoint is set to `index.js`
3. Ensure runtime is `node-18.0`
4. Check that archive contains exactly 3 files (index.js, package.json, appwrite.json)
5. Verify archive size is < 10KB before dependencies

---

**Status:** ✅ Ready to Deploy  
**Archive:** `functions/sendSystemChatMessage-deploy.tar.gz`  
**Size:** 2.21 KB  
**Expected Build Time:** < 30 seconds  
**Last Updated:** January 23, 2026
