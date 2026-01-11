# 🔧 FIX APPWRITE MESSAGES COLLECTION (400 ERROR)

## Root Cause Analysis

**400 Error:** Schema mismatch between payload sent from `appwriteService.LEGACY.ts` and Messages collection attributes in Appwrite.

**Source:** [appwriteService.LEGACY.ts](lib/appwriteService.LEGACY.ts#L3117-L3137)

---

## ✅ REQUIRED MESSAGES COLLECTION SCHEMA

### Required Attributes (15)

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| `messageId` | string | 255 | ✅ Yes | Unique message identifier |
| `conversationId` | string | 500 | ✅ Yes | Conversation thread ID |
| `senderId` | string | 255 | ✅ Yes | User/therapist/place ID who sent message |
| `senderName` | string | 255 | ✅ Yes | Display name of sender |
| `senderRole` | string | 50 | ✅ Yes | Role: 'user', 'therapist', 'place' |
| `senderType` | string | 50 | ✅ Yes | Same as senderRole (legacy compatibility) |
| `recipientId` | string | 255 | ✅ Yes | Legacy field for receiver ID |
| `receiverId` | string | 255 | ✅ Yes | User/therapist/place ID who receives message |
| `receiverName` | string | 255 | ✅ Yes | Display name of receiver |
| `receiverRole` | string | 50 | ✅ Yes | Role: 'user', 'therapist', 'place' |
| `message` | string | 5000 | ✅ Yes | Legacy field for message content |
| `content` | string | 5000 | ✅ Yes | Actual message content |
| `messageType` | string | 50 | ✅ Yes | Always 'text' for now |
| `isRead` | boolean | - | ✅ Yes | Read status (false by default) |
| `sentAt` | datetime | - | ✅ Yes | ISO timestamp when sent |

### Optional Attributes (2)

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| `bookingId` | string | 255 | ❌ No | Related booking ID (null if no booking) |
| `metadata` | string | 10000 | ❌ No | Extra JSON data (null by default) |

**Total:** 17 attributes (15 required + 2 optional)

---

## 🚀 Quick Fix Instructions

### Step 1: Run Validation Script

```powershell
node fix-messages-collection.mjs
```

This will:
- ✅ Check if Messages collection exists
- ✅ Validate all 17 attributes exist
- ✅ Check data types match
- ✅ Verify required/optional settings
- ✅ Test message creation
- ✅ Show missing attributes and type mismatches

### Step 2: Fix in Appwrite Console

1. **Go to Appwrite Console:**
   - URL: https://syd.cloud.appwrite.io/console
   - Navigate to: Database → `68f76ee1000e64ca8d05` → `messages` collection

2. **Add Missing Attributes:**
   - Click "Add Attribute" for each missing field
   - Use exact names and types from table above
   - Mark optional fields as NOT required

3. **Fix Type Mismatches:**
   - If attribute exists with wrong type, DELETE it first
   - Then recreate with correct type

4. **Set Permissions (Testing Phase):**
   - Click "Settings" → "Permissions"
   - Add permissions:
     - **Create:** Any
     - **Read:** Any
     - **Update:** Any
   - (We'll lock this down after testing)

### Step 3: Re-test

```powershell
node fix-messages-collection.mjs
```

Should show: "🎉 COLLECTION IS WORKING CORRECTLY!"

---

## 📋 Exact Payload Structure

From [appwriteService.LEGACY.ts](lib/appwriteService.LEGACY.ts#L3117-L3137):

```typescript
{
    messageId: ID.unique(),
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderType,        // 'user' | 'therapist' | 'place'
    senderType: message.senderType,         // duplicate for legacy
    recipientId: message.receiverId,        // duplicate for legacy
    receiverId: message.receiverId,
    receiverName: message.receiverName,
    receiverRole: message.receiverType,     // 'user' | 'therapist' | 'place'
    message: message.content,               // duplicate for legacy
    content: message.content,
    messageType: 'text',
    bookingId: message.bookingId || null,   // OPTIONAL
    metadata: null,                          // OPTIONAL
    isRead: false,
    sentAt: new Date().toISOString()        // "2026-01-01T07:30:00.000Z"
}
```

**Key Points:**
- `message` and `content` are duplicates (legacy compatibility)
- `recipientId` and `receiverId` are duplicates (legacy compatibility)
- `senderRole` copies `senderType` value
- `receiverRole` copies `receiverType` value
- `bookingId` and `metadata` can be null (optional)
- `sentAt` is ISO datetime string

---

## 🔍 Troubleshooting

### Still Getting 400 Error After Schema Fix?

1. **Check Attribute Names (Case-Sensitive):**
   ```
   ❌ Wrong: MessageId, conversation_id, sender_id
   ✅ Correct: messageId, conversationId, senderId
   ```

2. **Check Data Types:**
   ```
   ❌ Wrong: sentAt as string
   ✅ Correct: sentAt as datetime
   ```

3. **Check Required Settings:**
   ```
   ❌ Wrong: bookingId marked as required
   ✅ Correct: bookingId marked as optional
   ```

4. **Check Size Limits:**
   ```
   ❌ Wrong: message with size 255 (too small)
   ✅ Correct: message with size 5000
   ```

### Getting 401/403 Error?

**Fix Permissions:**
1. Appwrite Console → Messages collection → Settings → Permissions
2. Add: Create: Any, Read: Any, Update: Any
3. Save changes
4. Test again

### Collection Not Found?

**Create Collection:**
1. Appwrite Console → Database `68f76ee1000e64ca8d05`
2. Click "Add Collection"
3. Name: `messages` (lowercase)
4. Collection ID: `messages` (must match code)
5. Run validation script to add attributes

---

## 🧪 Testing Steps

### 1. Validate Schema
```powershell
node fix-messages-collection.mjs
```

Expected output:
```
✅ OK: messageId (string, required: true)
✅ OK: conversationId (string, required: true)
✅ OK: senderId (string, required: true)
... (15 required + 2 optional = 17 total)
✅ TEST MESSAGE CREATED SUCCESSFULLY!
🎉 COLLECTION IS WORKING CORRECTLY!
```

### 2. Test in Browser
1. Open live site
2. Open DevTools Console (F12)
3. Navigate to therapist profile
4. Click "Chat" button
5. Send test message
6. Check console:
   - ✅ Should see: "✅ Message sent: [documentId]"
   - ❌ Should NOT see: "400 Invalid document structure"

### 3. Verify in Appwrite
1. Appwrite Console → Messages collection
2. Should see new document with all 17 attributes populated
3. `sentAt` should be valid datetime
4. `isRead` should be false
5. Optional fields can be null

---

## 📦 Files Modified

- **Validation Script:** [fix-messages-collection.mjs](fix-messages-collection.mjs)
  - Checks schema completeness
  - Tests message creation
  - Shows missing attributes
  - Validates data types

- **Service Code:** [appwriteService.LEGACY.ts](lib/appwriteService.LEGACY.ts#L3102-L3170)
  - `messagingService.sendMessage()` sends payload
  - Lines 3117-3137 define exact structure
  - Creates notification for therapist/place

- **Chat Component:** [ChatWindow.tsx](src/components/chat/ChatWindow.tsx)
  - Calls `messagingService.sendMessage()` with correct params
  - Uses LEGACY format (8 parameters)

---

## 🎯 Success Criteria

✅ **Schema Valid:**
- All 17 attributes exist in Messages collection
- Correct data types (15 string, 1 boolean, 1 datetime)
- 15 required, 2 optional
- No type mismatches

✅ **Permissions Set:**
- Create: Any
- Read: Any
- Update: Any
- (Temporary for testing)

✅ **Test Message Created:**
- Validation script creates test document
- No 400 error
- Document saved successfully
- Test document deleted cleanly

✅ **Production Chat Works:**
- User sends message in chat
- No 400 error in console
- Message appears in conversation
- Document created in Appwrite

---

## 📝 Post-Fix Checklist

After Messages collection is fixed:

1. [ ] Run `node fix-messages-collection.mjs` - All checks pass
2. [ ] Test chat on development site - Message sent successfully
3. [ ] Build production: `pnpm run build`
4. [ ] Push to GitHub: `git push origin main`
5. [ ] Wait for Netlify deployment (2-5 min)
6. [ ] Test chat on live site - No 400 errors
7. [ ] Check Appwrite Documents - Message saved correctly
8. [ ] Monitor console for 24 hours - No errors
9. [ ] Lock down permissions (after stable testing)

---

## 🔐 Production Permissions (Future)

After testing phase is stable, lock down permissions:

**Messages Collection:**
```
Create: 
  - role:member (authenticated users only)
  - team:therapists/write
  - team:places/write

Read:
  - role:member
  - team:therapists/read
  - team:places/read

Update:
  - Document creator only
  - Or admin team
```

**Currently (Testing Phase):**
```
Create: Any
Read: Any
Update: Any
```

---

## 📞 Support

If 400 errors persist after following this guide:

1. **Capture Full Error:**
   - Open DevTools Console (F12)
   - Copy full error message including stack trace
   - Note exact error code and type

2. **Export Collection Schema:**
   - Appwrite Console → Messages collection → Export
   - Save JSON schema file
   - Compare with required schema above

3. **Test Direct API Call:**
   ```javascript
   // Run in DevTools Console
   const { Databases } = window.Appwrite;
   const databases = new Databases(client);
   
   await databases.createDocument(
     '68f76ee1000e64ca8d05',
     'messages',
     'test_' + Date.now(),
     {
       messageId: 'test_123',
       conversationId: 'test_conv',
       senderId: 'test_sender',
       senderName: 'Test',
       senderRole: 'user',
       senderType: 'user',
       recipientId: 'test_receiver',
       receiverId: 'test_receiver',
       receiverName: 'Receiver',
       receiverRole: 'therapist',
       message: 'Test content',
       content: 'Test content',
       messageType: 'text',
       bookingId: null,
       metadata: null,
       isRead: false,
       sentAt: new Date().toISOString()
     }
   );
   ```

4. **Check Appwrite Server Logs:**
   - Appwrite Console → Settings → Logs
   - Look for 400 errors with details
   - Note which attribute causes failure

---

**Last Updated:** January 1, 2026  
**Service Worker:** v5  
**Messages Collection:** 17 attributes (15 required + 2 optional)  
**Status:** Schema validation script ready to run
