# Chat System Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CHAT SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐              ┌───────────────────────────┐
│     ADMIN DASHBOARD       │              │    MEMBER DASHBOARDS      │
│  (AdminDashboardPage)     │              │  (Therapist/Place/Hotel)  │
│                           │              │                           │
│  ┌─────────────────────┐  │              │  ┌─────────────────────┐  │
│  │  Navigation Drawer  │  │              │  │   Fixed Chat Button │  │
│  │  ┌───────────────┐  │  │              │  │   ┌─────────────┐   │  │
│  │  │ ○ Analytics   │  │  │              │  │   │ 💬 Messages │   │  │
│  │  │ ○ Therapists  │  │  │              │  │   │   Badge: 3  │   │  │
│  │  │ ○ Places      │  │  │              │  │   └─────────────┘   │  │
│  │  │ ● Messages ◄──┼──┼──┼─────┐        │  └─────────────────────┘  │
│  │  │ ○ Payments    │  │  │     │        └───────────┬───────────────┘
│  │  └───────────────┘  │  │     │                    │
│  └─────────────────────┘  │     │                    │
│            │               │     │                    │ onClick()
│            │ Route         │     │                    ▼
│            ▼               │     │        ┌───────────────────────────┐
│  ┌─────────────────────┐  │     │        │   MemberChatWindow.tsx    │
│  │ AdminChatListPage   │◄─┘     │        │   (Modal Popup)           │
│  │  .tsx               │        │        │                           │
│  │                     │        │        │  ┌─────────────────────┐  │
│  │ ┌─────────────────┐ │        │        │  │  Chat with Admin    │  │
│  │ │  Chat List      │ │        │        │  ├─────────────────────┤  │
│  │ │  ┌───────────┐  │ │        │        │  │ Messages...         │  │
│  │ │  │ Therapist │  │ │        │        │  │ ┌─────────────────┐ │  │
│  │ │  │ Place     │  │ │        │        │  │ │ Admin: Hello!   │ │  │
│  │ │  │ Hotel     │  │ │        │        │  │ │ You: Hi there   │ │  │
│  │ │  │ User      │  │ │        │        │  │ └─────────────────┘ │  │
│  │ │  └───────────┘  │ │        │        │  ├─────────────────────┤  │
│  │ └─────────────────┘ │        │        │  │ [😊][📎][📍] Input │  │
│  │                     │        │        │  └─────────────────────┘  │
│  │ ┌─────────────────┐ │        │        └───────────────────────────┘
│  │ │  Chat Window    │ │        │
│  │ │  ┌───────────┐  │ │        │
│  │ │  │ Messages  │  │ │        │
│  │ │  │ [😊][📎] │  │ │        │
│  │ │  │ [📍][🚫] │  │ │        │
│  │ │  └───────────┘  │ │        │
│  │ └─────────────────┘ │        │
│  └─────────────────────┘        │
└───────────────────────┘         │
            │                      │
            │ Calls                │ Calls
            ▼                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          VALIDATION LAYER                                 │
│                      (chatValidation.ts)                                  │
│                                                                           │
│  Admin Message? ──YES──> ✅ ALLOW (No Validation)                        │
│        │                                                                  │
│       NO                                                                  │
│        ▼                                                                  │
│  Check: containsPhoneDigits() ──YES──> ❌ BLOCK "Cannot share phones"   │
│        │                                                                  │
│       NO                                                                  │
│        ▼                                                                  │
│  Check: containsNumberWords() ──YES──> ❌ BLOCK "Cannot use number words"│
│        │                                                                  │
│       NO                                                                  │
│        ▼                                                                  │
│  Check: containsPhonePattern() ──YES──> ❌ BLOCK "Cannot share contacts" │
│        │                                                                  │
│       NO                                                                  │
│        ▼                                                                  │
│  Check: containsAlternativeNumbers() ──YES──> ❌ BLOCK "Invalid format"  │
│        │                                                                  │
│       NO                                                                  │
│        ▼                                                                  │
│  ✅ ALLOW MESSAGE                                                        │
└───────────────────────────────────────────────────────────────────────────┘
            │
            │ If Valid
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        APPWRITE DATABASE                                  │
│                                                                           │
│  Collection: chat_messages                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Message {                                                            │ │
│  │   senderId: "user123"                                                │ │
│  │   senderName: "John Doe"                                             │ │
│  │   senderType: "therapist"                                            │ │
│  │   recipientId: "admin"                                               │ │
│  │   message: "Hello, I need help"                                      │ │
│  │   timestamp: "2025-01-15T10:30:00Z"                                  │ │
│  │   read: false                                                        │ │
│  │   messageType: "text"                                                │ │
│  │ }                                                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Storage Bucket: chat_attachments                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ Files: payment-proof.jpg, document.pdf, etc.                        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
            │
            │ New Message Event
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION SERVICE                                 │
│                   (chatNotificationService.ts)                            │
│                                                                           │
│  ┌─────────────────────┐          ┌─────────────────────┐               │
│  │   Sound Notification │          │ Browser Notification│               │
│  │   ┌───────────────┐  │          │  ┌───────────────┐  │               │
│  │   │ 🔊 Beep!      │  │          │  │ 💬 New Message│  │               │
│  │   │ (Web Audio)   │  │          │  │ From: Admin   │  │               │
│  │   └───────────────┘  │          │  │ "Hello..."    │  │               │
│  └─────────────────────┘          │  └───────────────┘  │               │
│                                     │  (Auto-close 5s)  │               │
│                                     └─────────────────────┘               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Message Flow Diagrams

### Flow 1: Admin Sends Message to Member

```
┌──────────┐                ┌──────────────┐               ┌──────────┐
│  Admin   │                │   Appwrite   │               │  Member  │
│Dashboard │                │   Database   │               │Dashboard │
└────┬─────┘                └──────┬───────┘               └────┬─────┘
     │                             │                            │
     │ 1. Type message             │                            │
     │    "Hello, how can I help?" │                            │
     │                             │                            │
     │ 2. Click Send               │                            │
     │──────────────────────────>  │                            │
     │    (No validation)          │                            │
     │                             │                            │
     │ 3. Create document          │                            │
     │    chat_messages            │                            │
     │                             │                            │
     │ 4. Success ✅               │                            │
     │<──────────────────────────  │                            │
     │                             │                            │
     │                             │ 5. Poll for new messages   │
     │                             │    (every 3 seconds)       │
     │                             │<────────────────────────── │
     │                             │                            │
     │                             │ 6. Return new messages     │
     │                             │ ───────────────────────>   │
     │                             │                            │
     │                             │    7. Show notification    │
     │                             │       🔊 Sound plays       │
     │                             │       💬 Browser popup     │
     │                             │                            │
     │                             │ 8. Mark as read            │
     │                             │<────────────────────────── │
     │                             │                            │
     │                             │ 9. Update read status      │
     │                             │ ───────────────────────>   │
     │                             │                            │
```

---

### Flow 2: Member Sends Message (With Validation)

```
┌──────────┐         ┌─────────────┐        ┌──────────┐        ┌──────────┐
│  Member  │         │ Validation  │        │ Appwrite │        │  Admin   │
│Dashboard │         │   Service   │        │ Database │        │Dashboard │
└────┬─────┘         └──────┬──────┘        └────┬─────┘        └────┬─────┘
     │                      │                     │                   │
     │ 1. Type message      │                     │                   │
     │    "Call me 081234" │                     │                   │
     │                      │                     │                   │
     │ 2. Click Send        │                     │                   │
     │─────────────────>    │                     │                   │
     │                      │                     │                   │
     │ 3. validateChatMessage()                   │                   │
     │    containsPhoneDigits()                   │                   │
     │                      │                     │                   │
     │ 4. BLOCKED ❌        │                     │                   │
     │    "Cannot share     │                     │                   │
     │     phone numbers"   │                     │                   │
     │<─────────────────    │                     │                   │
     │                      │                     │                   │
     │ 5. Show error        │                     │                   │
     │    ⚠️ Warning box    │                     │                   │
     │                      │                     │                   │
     │ 6. User types new    │                     │                   │
     │    message:          │                     │                   │
     │    "I need help"     │                     │                   │
     │                      │                     │                   │
     │ 7. Click Send        │                     │                   │
     │─────────────────>    │                     │                   │
     │                      │                     │                   │
     │ 8. validateChatMessage()                   │                   │
     │    No phone numbers found                  │                   │
     │                      │                     │                   │
     │ 9. ALLOWED ✅        │                     │                   │
     │<─────────────────    │                     │                   │
     │                      │                     │                   │
     │ 10. Create document  │                     │                   │
     │──────────────────────────────────────>     │                   │
     │                      │                     │                   │
     │ 11. Success          │                     │                   │
     │<──────────────────────────────────────     │                   │
     │                      │                     │                   │
     │                      │                     │ 12. Poll          │
     │                      │                     │<──────────────    │
     │                      │                     │                   │
     │                      │                     │ 13. New msg       │
     │                      │                     │ ──────────────>   │
     │                      │                     │                   │
```

---

### Flow 3: File Upload

```
┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Member  │         │ Appwrite │        │ Appwrite │        │  Admin   │
│          │         │ Storage  │        │ Database │        │          │
└────┬─────┘         └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                    │                    │                   │
     │ 1. Click file btn  │                    │                   │
     │    Select image    │                    │                   │
     │                    │                    │                   │
     │ 2. Validate file   │                    │                   │
     │    - Type: JPG ✅  │                    │                   │
     │    - Size: 2MB ✅  │                    │                   │
     │                    │                    │                   │
     │ 3. Upload file     │                    │                   │
     │─────────────────>  │                    │                   │
     │    to bucket:      │                    │                   │
     │    chat_attachments│                    │                   │
     │                    │                    │                   │
     │ 4. File ID         │                    │                   │
     │    & URL           │                    │                   │
     │<─────────────────  │                    │                   │
     │                    │                    │                   │
     │ 5. Create message  │                    │                   │
     │    with fileUrl    │                    │                   │
     │────────────────────────────────────>    │                   │
     │                    │                    │                   │
     │ 6. Success         │                    │                   │
     │<────────────────────────────────────    │                   │
     │                    │                    │                   │
     │                    │                    │ 7. Poll           │
     │                    │                    │<──────────────    │
     │                    │                    │                   │
     │                    │                    │ 8. New message    │
     │                    │                    │    with file      │
     │                    │                    │ ──────────────>   │
     │                    │                    │                   │
     │                    │                    │ 9. Click download │
     │                    │                    │    link           │
     │                    │<───────────────────────────────────    │
     │                    │                    │                   │
     │                    │ 10. Download file  │                   │
     │                    │ ───────────────────────────────────>   │
     │                    │                    │                   │
```

---

## User Permission Matrix

| Feature | Admin | Therapist | Place | Hotel | Villa | User |
|---------|-------|-----------|-------|-------|-------|------|
| **Chat with Admin** | ➖ N/A | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Chat with Members** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Send Text Messages** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Send Emojis** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Send Files** | ✅ Yes | ✅ Admin only | ✅ Admin only | ✅ Admin only | ✅ Admin only | ❌ No |
| **Share Location** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Block Chats** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Phone Validation** | ❌ Exempt | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **See All Chats** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Notifications** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Read Receipts** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Phone Number Validation Logic

```
┌────────────────────────────────────────────────────────────┐
│                 PHONE NUMBER DETECTION                      │
└────────────────────────────────────────────────────────────┘

Input Message: "Call me at 08123456789"

┌─────────────────────────────────────────┐
│ Step 1: Check User Type                 │
│                                         │
│ Is sender "admin"? ──YES──> ✅ ALLOW    │
│        │                                │
│       NO                                │
│        ▼                                │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Step 2: containsPhoneDigits()           │
│                                         │
│ Normalize: "Callmeat08123456789"        │
│ Regex: /\d{6,}/g                        │
│ Found: "08123456789" (11 digits)        │
│                                         │
│ Result: ❌ BLOCKED                      │
│ Error: "Cannot share phone numbers"     │
└─────────────────────────────────────────┘

─────────────────────────────────────────────

Input Message: "Massage costs $50"

┌─────────────────────────────────────────┐
│ Step 1: Check User Type                 │
│ Is sender "admin"? ──NO──>              │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Step 2: containsPhoneDigits()           │
│                                         │
│ Normalize: "Massagecosts$50"            │
│ Regex: /\d{6,}/g                        │
│ Found: "50" (only 2 digits)             │
│                                         │
│ Result: ✅ PASS                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Step 3: containsNumberWords()           │
│                                         │
│ Words: ["massage", "costs", "$50"]      │
│ Number words found: 0                   │
│                                         │
│ Result: ✅ PASS                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Step 4: containsPhonePattern()          │
│                                         │
│ Keywords: ["call", "phone", "whatsapp"] │
│ Found: None                             │
│                                         │
│ Result: ✅ PASS                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Step 5: containsAlternativeNumbers()    │
│                                         │
│ Substitutions: o→0, i→1, etc.           │
│ Converted: "Massagec0sts$50"            │
│ Found: "50" (only 2 digits)             │
│                                         │
│ Result: ✅ PASS                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Final Result: ✅ ALLOWED                │
│ Message can be sent                     │
└─────────────────────────────────────────┘
```

---

## Database Structure

```
Appwrite Database
│
├── Collection: chat_messages
│   │
│   ├── Documents (Messages)
│   │   ├── Message 1 {
│   │   │     senderId: "therapist123"
│   │   │     recipientId: "admin"
│   │   │     message: "Hello"
│   │   │     timestamp: "2025-01-15T10:00:00Z"
│   │   │     read: false
│   │   │   }
│   │   │
│   │   ├── Message 2 {
│   │   │     senderId: "admin"
│   │   │     recipientId: "therapist123"
│   │   │     message: "How can I help?"
│   │   │     timestamp: "2025-01-15T10:05:00Z"
│   │   │     read: true
│   │   │   }
│   │   │
│   │   └── Message 3 {
│   │         senderId: "place456"
│   │         recipientId: "admin"
│   │         message: "📎 payment-proof.jpg"
│   │         messageType: "file"
│   │         fileUrl: "https://..."
│   │         timestamp: "2025-01-15T10:10:00Z"
│   │         read: false
│   │       }
│   │
│   ├── Indexes
│   │   ├── chat_participants [senderId, recipientId]
│   │   ├── unread_messages [recipientId, read]
│   │   └── message_timeline [timestamp ASC]
│   │
│   └── Permissions
│       ├── Create: users
│       ├── Read: users
│       ├── Update: users
│       └── Delete: admins
│
└── Storage Bucket: chat_attachments
    │
    ├── Files
    │   ├── file_001.jpg (2.3 MB)
    │   ├── file_002.pdf (1.5 MB)
    │   └── file_003.png (0.8 MB)
    │
    └── Permissions
        ├── Create: users
        ├── Read: users
        └── Delete: admins
```

---

## Component Hierarchy

```
App
│
├── AdminDashboardPage
│   │
│   ├── Navigation Drawer
│   │   ├── Analytics
│   │   ├── Therapists
│   │   ├── Places
│   │   ├── Accounts
│   │   ├── Messages ◄── Routes to AdminChatListPage
│   │   ├── Payments
│   │   └── Settings
│   │
│   └── AdminChatListPage
│       │
│       ├── Chat List Sidebar
│       │   ├── Search Bar
│       │   └── User List
│       │       ├── TherapistItem (with unread badge)
│       │       ├── PlaceItem (with unread badge)
│       │       ├── HotelItem (with unread badge)
│       │       └── UserItem (with unread badge)
│       │
│       └── Chat Window
│           ├── Chat Header (with block button)
│           ├── Messages Area
│           │   ├── TextMessage
│           │   ├── FileMessage (with download link)
│           │   ├── LocationMessage (with map link)
│           │   └── SystemMessage (block warning)
│           │
│           └── Input Area
│               ├── Emoji Picker Button
│               ├── File Upload Button
│               ├── Location Share Button
│               └── Message Input + Send Button
│
├── TherapistDashboardPage
│   │
│   ├── Dashboard Content
│   │
│   ├── Fixed Chat Button (bottom-right)
│   │   └── Unread Badge
│   │
│   └── MemberChatWindow (if showChatWindow)
│
├── PlaceDashboardPage
│   │
│   ├── Dashboard Content
│   ├── Fixed Chat Button
│   └── MemberChatWindow (if showChatWindow)
│
├── HotelDashboardPage
│   │
│   ├── Dashboard Content
│   ├── Fixed Chat Button
│   └── MemberChatWindow (if showChatWindow)
│
└── VillaDashboardPage
    │
    ├── Dashboard Content
    ├── Fixed Chat Button
    └── MemberChatWindow (if showChatWindow)

MemberChatWindow (Shared Component)
│
├── Modal Overlay
│
└── Chat Window
    ├── Header ("Chat with IndaStreet Team")
    ├── Blocked Warning (if blocked)
    ├── Validation Error (if validation failed)
    ├── Messages Area
    │   ├── Admin Messages (white bubble, left)
    │   └── User Messages (orange bubble, right)
    │
    └── Input Area
        ├── Emoji Picker
        ├── File Upload Button
        ├── Location Share Button
        └── Message Input + Send Button
```

---

## Security Flow

```
┌────────────────────────────────────────────────────────────┐
│              SECURITY & VALIDATION LAYERS                   │
└────────────────────────────────────────────────────────────┘

User Input: "My phone is 08123456789"
      │
      ▼
┌─────────────────────────────────────────┐
│ Layer 1: Client-Side Validation         │
│                                         │
│ chatValidation.ts                       │
│ ├── Check: Phone digits                │
│ ├── Check: Number words                │
│ ├── Check: Phone patterns              │
│ └── Check: Alternative formats         │
│                                         │
│ Result: ❌ BLOCKED                      │
│ Error shown to user immediately         │
│ Message never sent to database          │
└─────────────────────────────────────────┘
      │
      │ If validation passes ✅
      ▼
┌─────────────────────────────────────────┐
│ Layer 2: Database Permissions           │
│                                         │
│ Appwrite Permissions                    │
│ ├── Must be authenticated              │
│ ├── Must have "users" role             │
│ └── Can only create/read own messages  │
│                                         │
│ Result: ✅ ALLOWED                      │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Layer 3: Storage Permissions            │
│                                         │
│ Appwrite Storage                        │
│ ├── File type validation               │
│ ├── File size validation (10MB max)    │
│ ├── Must be authenticated              │
│ └── Antivirus scan (if enabled)        │
│                                         │
│ Result: ✅ ALLOWED                      │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ Layer 4: Admin Moderation               │
│                                         │
│ Admin Controls                          │
│ ├── Can block any chat                 │
│ ├── Blocked users see warning          │
│ ├── Blocked users cannot send          │
│ └── System message sent to user        │
│                                         │
│ Result: Can be blocked anytime          │
└─────────────────────────────────────────┘
```

---

## Real-Time Update Mechanism

```
┌────────────────────────────────────────────────────────────┐
│                  POLLING MECHANISM                          │
└────────────────────────────────────────────────────────────┘

Time: 0s
┌──────────┐
│ Client   │ ──── Initial Load ────> [Fetch Messages]
└──────────┘

Time: 3s
┌──────────┐
│ Client   │ ──── Poll #1 ──────────> [Fetch Messages]
└──────────┘                           (Check for new)

Time: 6s
┌──────────┐
│ Client   │ ──── Poll #2 ──────────> [Fetch Messages]
└──────────┘                           (Check for new)
                                       
                                       New message found!
                                       ▼
                                [Compare last message ID]
                                       ▼
                                [Trigger notification]
                                       ├──> 🔊 Sound
                                       └──> 💬 Browser popup

Time: 9s
┌──────────┐
│ Client   │ ──── Poll #3 ──────────> [Fetch Messages]
└──────────┘                           (Check for new)

... continues every 3 seconds ...

───────────────────────────────────────────────────────────

Implementation:
```typescript
useEffect(() => {
  // Initial fetch
  fetchMessages();
  
  // Set up polling
  const interval = setInterval(() => {
    fetchMessages();
  }, 3000); // 3 seconds
  
  // Cleanup
  return () => clearInterval(interval);
}, [userId]);
```
```

---

**Last Updated:** January 2025  
**Version:** 1.0
