# 📝 MANUAL STEPS: Create Messages Collection in Appwrite Console

## ⚠️ CRITICAL: Messages Collection Does Not Exist

The 400 error is caused by the **Messages collection not existing** in your Appwrite database.

**Current State:**
- ❌ Collection ID `'Messages'` not found in database `68f76ee1000e64ca8d05`
- ❌ Cannot create via SDK (requires API key with database.write permissions)
- ✅ **Must create manually in Appwrite Console**

---

## 🚀 Step-by-Step Creation Guide

### Step 1: Access Appwrite Console

1. Open: https://syd.cloud.appwrite.io/console
2. Login to your account
3. Navigate to: **Database** → Database ID: `68f76ee1000e64ca8d05`

### Step 2: Create Messages Collection

1. Click **"Add Collection"** button
2. **Collection Name:** `Messages`
3. **Collection ID:** `Messages` (MUST match exactly - case-sensitive)
4. Click **"Create"**

### Step 3: Add All 17 Attributes

Click **"Add Attribute"** for each attribute below. **DO NOT SKIP ANY!**

#### Required String Attributes (13)

| # | Attribute Name | Type | Size | Required | Default |
|---|----------------|------|------|----------|---------|
| 1 | `messageId` | String | 255 | ✅ Yes | - |
| 2 | `conversationId` | String | 500 | ✅ Yes | - |
| 3 | `senderId` | String | 255 | ✅ Yes | - |
| 4 | `senderName` | String | 255 | ✅ Yes | - |
| 5 | `senderRole` | String | 50 | ✅ Yes | - |
| 6 | `senderType` | String | 50 | ✅ Yes | - |
| 7 | `recipientId` | String | 255 | ✅ Yes | - |
| 8 | `receiverId` | String | 255 | ✅ Yes | - |
| 9 | `receiverName` | String | 255 | ✅ Yes | - |
| 10 | `receiverRole` | String | 50 | ✅ Yes | - |
| 11 | `message` | String | 5000 | ✅ Yes | - |
| 12 | `content` | String | 5000 | ✅ Yes | - |
| 13 | `messageType` | String | 50 | ✅ Yes | - |

#### Optional String Attributes (2)

| # | Attribute Name | Type | Size | Required | Default |
|---|----------------|------|------|----------|---------|
| 14 | `bookingId` | String | 255 | ❌ No | - |
| 15 | `metadata` | String | 10000 | ❌ No | - |

#### Boolean Attribute (1)

| # | Attribute Name | Type | Required | Default |
|---|----------------|------|----------|---------|
| 16 | `isRead` | Boolean | ✅ Yes | `false` |

#### DateTime Attribute (1)

| # | Attribute Name | Type | Required | Default |
|---|----------------|------|----------|---------|
| 17 | `sentAt` | DateTime | ✅ Yes | - |

### Step 4: Set Permissions (Testing Phase)

1. Click **"Settings"** tab in Messages collection
2. Click **"Permissions"** section
3. Add these permissions:

```
CREATE:
  - Role: Any
  
READ:
  - Role: Any
  
UPDATE:
  - Role: Any

DELETE:
  - (Leave empty for now)
```

**Why "Any"?**  
During testing, we need to verify the schema works before locking down security. After confirming chat works, we'll restrict to authenticated users only.

### Step 5: Create Indexes (Optional but Recommended)

For better query performance:

1. Click **"Indexes"** tab
2. Add these indexes:

| Index Key | Type | Attributes |
|-----------|------|------------|
| `conversationId_idx` | Key | `conversationId` |
| `senderId_idx` | Key | `senderId` |
| `receiverId_idx` | Key | `receiverId` |
| `sentAt_idx` | Key | `sentAt` |
| `isRead_idx` | Key | `isRead` |

---

## ✅ Verification Checklist

After creating the collection, verify:

- [ ] Collection ID is exactly `Messages` (capital M)
- [ ] All 17 attributes created:
  - [ ] 13 required string attributes
  - [ ] 2 optional string attributes
  - [ ] 1 required boolean attribute (`isRead`)
  - [ ] 1 required datetime attribute (`sentAt`)
- [ ] Permissions set to Create/Read/Update: Any
- [ ] Collection is enabled (toggle should be ON)

---

## 🧪 Test After Creation

### 1. Run Validation Script

```powershell
node fix-messages-collection.mjs
```

**Expected Output:**
```
✅ OK: messageId (string, required: true)
✅ OK: conversationId (string, required: true)
✅ OK: senderId (string, required: true)
... (17 total)
✅ TEST MESSAGE CREATED SUCCESSFULLY!
🎉 COLLECTION IS WORKING CORRECTLY!
```

### 2. Test in Browser

1. Build production: `pnpm run build`
2. Start dev server: `pnpm run dev`
3. Open site in browser
4. Navigate to therapist profile
5. Click "Chat" button
6. Send test message
7. Check console:
   - ✅ Should see: "✅ Message sent: [documentId]"
   - ❌ Should NOT see: "400 Invalid document structure"

### 3. Verify in Appwrite Console

1. Go to Messages collection
2. Should see new document with your test message
3. All 17 attributes should be populated
4. `sentAt` should have valid datetime
5. `isRead` should be `false`
6. Optional fields (`bookingId`, `metadata`) can be `null`

---

## 🔧 Troubleshooting

### "Collection already exists" Error

If you see this in validation script:
1. Collection exists but may have wrong attributes
2. Run: `node fix-messages-collection.mjs`
3. It will show which attributes are missing or have wrong types
4. Go to Appwrite Console → Messages → Attributes
5. Add missing attributes or fix types

### "401 Unauthorized" Error

**Fix Permissions:**
1. Appwrite Console → Messages collection
2. Settings → Permissions
3. Ensure Create/Read/Update all have "Role: Any"
4. Save changes

### "400 Invalid document structure" Error

**Missing Attributes:**
1. Check validation script output
2. It will list exact missing attributes
3. Add them in Appwrite Console
4. Match exact names (case-sensitive!)

### Attribute Type Mismatch

**Example:** `sentAt` created as String instead of DateTime

**Fix:**
1. Delete the wrong attribute in Appwrite Console
2. Recreate with correct type (DateTime)
3. Run validation script to confirm

---

## 📦 Alternative: Automated Creation (If You Have API Key)

If you have an Appwrite API key with database.write permissions:

### 1. Create .env file

```powershell
# Copy example
cp .env.example .env

# Edit .env and add your API key
APPWRITE_API_KEY=your_api_key_here
```

### 2. Run automated creation script

```powershell
node create-messages-collection.mjs
```

This will:
- Create Messages collection
- Add all 17 attributes automatically
- Set permissions
- Create indexes
- Verify setup

### 3. Get API Key from Appwrite

1. Appwrite Console → Project Settings
2. Click "API Keys" tab
3. Create new API key with:
   - **Scopes:** `databases.read`, `databases.write`, `collections.read`, `collections.write`, `attributes.read`, `attributes.write`
4. Copy key and add to `.env`

---

## 🎯 Success Criteria

✅ **Collection Created:**
- Name: `Messages`
- ID: `Messages`
- Database: `68f76ee1000e64ca8d05`

✅ **All Attributes:**
- 17 total (15 required + 2 optional)
- Correct types (13 string, 2 string optional, 1 boolean, 1 datetime)
- Names match exactly (case-sensitive)

✅ **Permissions Set:**
- Create: Any
- Read: Any
- Update: Any

✅ **Validation Passes:**
- `node fix-messages-collection.mjs` shows all OK
- Test message creates successfully
- No 400 errors

✅ **Chat Works:**
- Can send messages in browser
- Messages save to Appwrite
- No console errors

---

## 📝 After Testing Phase

Once chat is stable for 24-48 hours, lock down permissions:

**Production Permissions:**
```
CREATE:
  - role:member (authenticated users)

READ:
  - role:member
  - document creator

UPDATE:
  - document creator only

DELETE:
  - (disabled)
```

**How to Update:**
1. Appwrite Console → Messages collection → Settings → Permissions
2. Remove "Role: Any" permissions
3. Add role:member for Create/Read
4. Add document-level permissions for Update

---

## 📞 Support

If 400 errors persist after following this guide:

1. **Export Collection Schema:**
   - Appwrite Console → Messages collection
   - Click "..." menu → Export
   - Save JSON file
   - Compare with required schema above

2. **Capture Full Error:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Copy full error message
   - Note exact error code and type

3. **Check Payload vs Schema:**
   - See [FIX_MESSAGES_COLLECTION_400_ERROR.md](FIX_MESSAGES_COLLECTION_400_ERROR.md)
   - Compare payload structure with your collection attributes
   - Ensure ALL fields exist with correct types

---

**Last Updated:** January 1, 2026  
**Required Attributes:** 17 (15 required + 2 optional)  
**Collection ID:** `Messages` (case-sensitive)  
**Database ID:** `68f76ee1000e64ca8d05`  
**Status:** Awaiting manual creation in Appwrite Console
