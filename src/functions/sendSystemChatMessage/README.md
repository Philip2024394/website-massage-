# 🔒 ENTERPRISE SYSTEM MESSAGE FUNCTION DEPLOYMENT

This directory contains the backend Appwrite function for sending system chat messages with proper server-side authentication.

## Function Details
- **Name:** sendSystemChatMessage
- **Runtime:** Node.js 18.0
- **Purpose:** Send system messages using API key authentication (frontend is blocked)
- **Security:** Only this function can send senderType="system" messages

## Deployment Steps

### 1. Install Appwrite CLI (if not installed)
```bash
npm install -g appwrite-cli
```

### 2. Login to Appwrite
```bash
appwrite login
```

### 3. Deploy Function
```bash
cd functions/sendSystemChatMessage
appwrite functions createDeployment --functionId sendSystemChatMessage
```

### 4. Configure Environment Variables
In Appwrite Console → Functions → sendSystemChatMessage → Settings → Variables:

```
APPWRITE_API_KEY = [Your API Key with Database Write permissions]
```

### 5. Test Function
```bash
# Test payload
{
  "conversationId": "test-123",
  "recipientId": "user-456", 
  "recipientName": "Test User",
  "recipientType": "user",
  "content": "Test system message"
}
```

## API Usage

### Frontend Integration
```typescript
import { systemMessageService } from '../lib/services/systemMessage.service';

await systemMessageService.sendSystemMessage({
  conversationId: 'conv-123',
  recipientId: 'user-456',
  recipientName: 'John Doe',
  recipientType: 'user',
  content: 'Welcome to the chat!'
});
```

### Success Response
```json
{
  "success": true,
  "messageId": "64f123...",
  "createdAt": "2026-01-06T12:00:00.000Z",
  "message": "System message sent successfully"
}
```

### Error Response  
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Missing required fields: recipientType"
}
```

## Security Features

✅ **Server-side authentication** with API key
✅ **Input validation** - all required fields checked
✅ **Enum validation** - recipientType must be valid
✅ **Error handling** - detailed error responses
✅ **Audit logging** - all requests logged
✅ **Schema compliance** - matches chat_messages collection

## Database Schema

The function creates documents in:
- Database ID: `68f76ee1000e64ca8d05`
- Collection: `chat_messages`

Document structure:
```json
{
  "senderId": "system",
  "senderName": "System", 
  "senderType": "system",
  "recipientId": "string",
  "recipientName": "string", 
  "recipientType": "user|therapist|place|hotel|villa|agent|admin",
  "conversationId": "string",
  "content": "string",
  "createdAt": "ISO-8601",
  "read": false,
  "type": "text"
}
```

## Frontend Changes Applied

All direct `messagingService.sendMessage()` calls with `senderId: 'system'` have been replaced with `systemMessageService` calls:

- ✅ ChatWindow.tsx - Welcome messages, discount confirmations, therapist notifications
- ✅ FloatingChat.tsx - Admin system messages  
- ✅ bookingService.ts - Alternative search notifications
- ✅ chatService.ts - Routing system messages through backend

## Expected Results

✅ **Zero 401 Unauthorized errors** - System messages sent via backend
✅ **Instant message delivery** - No frontend blocking
✅ **Enhanced security** - No client-side system message creation
✅ **Schema compliance** - All enum validations enforced
✅ **Audit trail** - Complete logging of system messages

## Troubleshooting

### Function not executing
- Check API key permissions in Appwrite Console
- Verify function deployment status
- Check function logs for errors

### 401 Errors persist  
- Ensure all frontend system message calls use systemMessageService
- Check no direct messagingService calls with senderId="system" remain
- Verify enforcement.ts is not bypassed

### Messages not appearing
- Check database write permissions for API key
- Verify collection ID and database ID are correct
- Check function execution logs in Appwrite Console