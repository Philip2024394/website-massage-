# Member Chat Integration Guide

This document provides step-by-step instructions to add the chat button and chat window to all member dashboards (Therapist, Place, Hotel, Villa, and User).

## Files Already Created ✅

1. **pages/AdminChatListPage.tsx** - Admin chat interface
2. **components/MemberChatWindow.tsx** - Member chat interface
3. **utils/chatValidation.ts** - Phone number protection
4. **services/chatNotificationService.ts** - Notifications
5. **AdminDashboardPage.tsx** - Already integrated with AdminChatListPage

## Integration Steps

### Step 1: Add Chat Button to Dashboards

For each dashboard (TherapistDashboardPage, PlaceDashboardPage, HotelDashboardPage, VillaDashboardPage), follow these steps:

#### A. Import Dependencies

Add to the top of the file:

```typescript
import { MessageCircle } from 'lucide-react';
import MemberChatWindow from '../components/MemberChatWindow';
```

#### B. Add State for Chat Window

Add to the component state:

```typescript
const [showChatWindow, setShowChatWindow] = useState(false);
const [unreadChatCount, setUnreadChatCount] = useState(0);
```

#### C. Add Chat Button to Header/Navigation

Add a chat button (position depends on dashboard layout):

**Option 1: Fixed Button (Bottom Right)**
```typescript
{/* Fixed Chat Button */}
<button
  onClick={() => setShowChatWindow(true)}
  className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl z-40 transition-all transform hover:scale-110"
  aria-label="Open chat"
>
  <MessageCircle className="w-6 h-6" />
  {unreadChatCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
      {unreadChatCount > 9 ? '9+' : unreadChatCount}
    </span>
  )}
</button>
```

**Option 2: Tab Button (For Tabbed Dashboards)**
```typescript
<button
  onClick={() => setActiveTab('chat')}
  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
    activeTab === 'chat'
      ? 'bg-orange-500 text-white shadow-md'
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <MessageCircle className="w-5 h-5" />
  <span>Messages</span>
  {unreadChatCount > 0 && (
    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
      {unreadChatCount}
    </span>
  )}
</button>
```

#### D. Add Chat Window Component

Add before the closing tag of the main component:

```typescript
{/* Chat Window */}
{showChatWindow && (
  <MemberChatWindow
    userId={userId} // The current user's ID
    userName={userName} // The current user's name
    userType="therapist" // Change based on dashboard: 'therapist' | 'place' | 'hotel' | 'villa' | 'user'
    onClose={() => setShowChatWindow(false)}
  />
)}
```

#### E. Fetch Unread Count

Add function to fetch unread message count:

```typescript
const fetchUnreadChatCount = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'chat_messages',
      [
        `recipientId="${userId}"`,
        `senderId="admin"`,
        `read=false`
      ]
    );
    setUnreadChatCount(response.total);
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};

// Call in useEffect
useEffect(() => {
  fetchUnreadChatCount();
  
  // Poll every 10 seconds
  const interval = setInterval(fetchUnreadChatCount, 10000);
  return () => clearInterval(interval);
}, [userId]);
```

---

### Step 2: Specific Dashboard Examples

#### TherapistDashboardPage.tsx

```typescript
// At the top
import { MessageCircle } from 'lucide-react';
import MemberChatWindow from '../components/MemberChatWindow';

// In component
const TherapistDashboardPage: React.FC = () => {
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [therapistId, setTherapistId] = useState('');
  const [therapistName, setTherapistName] = useState('');

  // ... existing code ...

  // Before return statement
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Existing header and content */}
      
      {/* Fixed Chat Button */}
      <button
        onClick={() => setShowChatWindow(true)}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl z-40 transition-all transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadChatCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadChatCount > 9 ? '9+' : unreadChatCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {showChatWindow && (
        <MemberChatWindow
          userId={therapistId}
          userName={therapistName}
          userType="therapist"
          onClose={() => setShowChatWindow(false)}
        />
      )}
    </div>
  );
};
```

#### PlaceDashboardPage.tsx

```typescript
// Same structure, but:
userType="place"
userId={placeId}
userName={placeName}
```

#### HotelDashboardPage.tsx

```typescript
// Same structure, but:
userType="hotel"
userId={hotelId}
userName={hotelName}
```

#### VillaDashboardPage.tsx

```typescript
// Same structure, but:
userType="villa"
userId={villaId}
userName={villaName}
```

---

### Step 3: Database Setup

Create the following in Appwrite:

#### A. Create Collection: `chat_messages`

Attributes:
```
- senderId: string (required)
- senderName: string (required)
- senderType: string (required)
- recipientId: string (required)
- recipientName: string (required)
- recipientType: string (required)
- message: string (required, max 5000 chars)
- timestamp: datetime (required)
- read: boolean (required, default: false)
- messageType: string (required, enum: text, file, location, system)
- fileUrl: string (optional)
- fileName: string (optional)
- location: string (optional) - Store as JSON string
- keepForever: boolean (default: false)
```

Indexes:
```
1. chat_participants
   - Type: fulltext
   - Attributes: [senderId, recipientId]
   
2. unread_messages
   - Type: fulltext
   - Attributes: [recipientId, read]
   
3. message_timeline
   - Type: key
   - Attributes: [timestamp]
   - Order: ASC
```

Permissions:
```
- Create: Any authenticated user
- Read: Any authenticated user (filter by senderId/recipientId in queries)
- Update: Any authenticated user (for marking as read)
- Delete: Admin only
```

#### B. Create Storage Bucket: `chat_attachments`

Settings:
```
- Name: chat_attachments
- Maximum File Size: 10MB
- Allowed File Extensions: jpg, jpeg, png, pdf, doc, docx
- Encryption: Enabled
- Antivirus: Enabled (if available)
```

Permissions:
```
- Create: Any authenticated user
- Read: Any authenticated user
- Update: None
- Delete: Admin only
```

---

### Step 4: Add chatBlocked Field to User Collections

Update the following collections to include a `chatBlocked` field:

```
Collections to Update:
- therapists
- places
- hotels (if exists)
- villas (if exists)
- users (if exists)
```

New Attribute:
```
- chatBlocked: boolean (default: false)
```

This allows admin to block users from chatting.

---

### Step 5: Environment Variables

Add to `.env` file:

```env
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_CHAT_COLLECTION_ID=chat_messages
VITE_APPWRITE_CHAT_STORAGE_BUCKET_ID=chat_attachments
```

---

### Step 6: Add Notification Sound (Optional)

**Option 1: Use existing base64 beep sound (already implemented)**
- No action needed, uses embedded beep sound

**Option 2: Use custom MP3 file**

1. Add MP3 file to `public/sounds/notification.mp3`
2. Update `chatNotificationService.ts`:

```typescript
private initializeAudio() {
  // Replace this line:
  const audioData = this.createBeepSound();
  
  // With this:
  this.audio = new Audio('/sounds/notification.mp3');
  this.audio.volume = 0.5;
}
```

---

## Testing Checklist

### Phone Number Validation Tests

Test sending these messages (should be BLOCKED):

- ✅ "08123456789" - Direct digits
- ✅ "081-234-5678" - Formatted digits
- ✅ "zero eight one two three four five six" - Number words
- ✅ "call me at 0812..." - Phone pattern
- ✅ "o8i234s678" - Letter substitutions
- ✅ "My number is 081 234 5678" - Mixed pattern

Test sending these messages (should be ALLOWED):

- ✅ "Massage costs 500 dollars" - Price
- ✅ "Open from 9am to 5pm" - Time
- ✅ "August 15, 2024" - Date
- ✅ "123 Main Street" - Address
- ✅ "Room 234" - Room number

### Admin Exemption Tests

Admin should be able to send:

- ✅ "Please call me at 08123456789" - Phone number allowed for admin
- ✅ Any message with contact information

### Notification Tests

- ✅ Sound plays when new message arrives
- ✅ Browser notification appears
- ✅ Notification closes after 5 seconds
- ✅ Clicking notification focuses window
- ✅ Permission request works
- ✅ Graceful fallback when permission denied

### File Upload Tests

- ✅ JPG/JPEG uploads successfully
- ✅ PNG uploads successfully
- ✅ PDF uploads successfully
- ✅ DOC/DOCX uploads successfully
- ✅ Files > 10MB are rejected
- ✅ Invalid file types are rejected
- ✅ File appears in chat with download link

### Location Sharing Tests

- ✅ Location permission request works
- ✅ Location accuracy is reasonable
- ✅ Maps link opens correctly
- ✅ Graceful error when permission denied

### Chat Blocking Tests

- ✅ Admin can block user
- ✅ System message appears when blocked
- ✅ Blocked user cannot send messages
- ✅ Blocked user sees suspension warning
- ✅ Admin can unblock user

### Real-time Update Tests

- ✅ New messages appear within 3 seconds
- ✅ Unread count updates correctly
- ✅ Read receipts update when viewed
- ✅ Multiple concurrent chats work

---

## Common Issues & Solutions

### Issue 1: Messages Not Loading

**Solution:**
- Check DATABASE_ID is correct in both AdminChatListPage and MemberChatWindow
- Verify collection 'chat_messages' exists
- Check Appwrite permissions allow reading

### Issue 2: File Upload Fails

**Solution:**
- Verify storage bucket 'chat_attachments' exists
- Check file size is under 10MB
- Verify file type is allowed (jpg, jpeg, png, pdf, doc, docx)
- Check Appwrite permissions allow creating files

### Issue 3: Notifications Not Working

**Solution:**
- Check browser notification permission is granted
- Verify notification service is imported correctly
- Test in incognito mode (some extensions block notifications)
- Check console for audio playback errors

### Issue 4: Phone Validation Too Strict

**Solution:**
- Adjust thresholds in `chatValidation.ts`:
  ```typescript
  // Change from 6 to 8 consecutive digits
  const digitSequences = normalized.match(/\d{8,}/g);
  
  // Change from 6 to 8 consecutive number words
  if (consecutiveNumberWords >= 8) return true;
  ```

### Issue 5: Unread Count Not Updating

**Solution:**
- Verify polling interval is running
- Check query filters match exactly
- Ensure userId is set correctly
- Verify read status is updated after viewing

---

## Next Steps

1. **Integrate chat button into each dashboard** (5 dashboards)
2. **Create Appwrite collections and storage bucket**
3. **Add chatBlocked field to user collections**
4. **Test phone number validation thoroughly**
5. **Test notifications on different browsers**
6. **Test file uploads with various file types**
7. **Conduct user acceptance testing**

---

## Future Enhancements

Consider adding these features in the future:

1. **Voice Messages** - Record and send audio
2. **Typing Indicators** - Show when admin is typing
3. **Message Reactions** - Like/heart messages
4. **Group Chats** - Multiple users in one chat
5. **Message Search** - Search chat history
6. **Chat Export** - Download chat transcript
7. **Auto-Replies** - Admin quick responses
8. **Chat Ratings** - Rate support experience
9. **Video Calls** - Integrate video chat
10. **AI Chatbot** - Automated responses for common questions

---

## Support

For questions or issues with chat integration:
1. Check this documentation
2. Review CHAT_SYSTEM_IMPLEMENTATION.md
3. Test with admin account first
4. Verify Appwrite setup is complete
5. Check browser console for errors

---

**Last Updated:** January 2025  
**Version:** 1.0
