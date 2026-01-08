# Standalone Chat System

A complete, decoupled React chat system with real-time Appwrite integration.

## 🚀 Features

- **Real-time messaging** using Appwrite Realtime API
- **Draggable floating window** that persists position
- **Booking countdown timer** with visual warnings
- **Toast notifications** for new messages and events
- **Orange branded header** (customizable)
- **Fully responsive** design for desktop and mobile
- **Type-safe** with full TypeScript support
- **Zero coupling** with main app - pulls all data from Appwrite
- **Plug-and-play** - import anywhere without breaking existing UI

## 📦 Installation

This system is self-contained in the `/chat` directory. Simply import the main component:

```tsx
import { FloatingChatWindow } from './chat';

function App() {
  return (
    <div>
      <YourExistingApp />
      <FloatingChatWindow 
        userId="user123"
        userName="John Doe"
        userRole="customer"
      />
    </div>
  );
}
```

## 📁 File Structure

```
/chat/
├── index.ts                      # Main export file
├── FloatingChatWindow.tsx         # Main draggable chat window
├── BookingBanner.tsx             # Booking details with countdown
├── ChatMessages.tsx              # Message list display
├── ChatInput.tsx                 # Message input component
├── hooks/
│   ├── useChatRooms.ts          # Manages active chat rooms
│   ├── useChatMessages.ts       # Real-time message handling
│   ├── useBookingCountdown.ts   # Countdown timer logic
│   └── useNotifications.ts      # Toast notifications
└── README.md                    # This file
```

## 🎯 Components

### FloatingChatWindow

The main component that brings everything together.

**Props:**
- `userId` (string): Current user's ID
- `userName` (string): Current user's display name
- `userRole` ('customer' | 'therapist'): User's role
- `initialPosition?` (object): Initial window position

**Example:**
```tsx
<FloatingChatWindow 
  userId="user123"
  userName="John Doe"
  userRole="customer"
  initialPosition={{ x: 100, y: 100 }}
/>
```

### BookingBanner

Displays booking details with live countdown timer.

**Props:**
- `therapistName` (string)
- `therapistPhoto?` (string)
- `bookingDate` (string)
- `bookingTime` (string)
- `serviceDuration` (string)
- `serviceType` (string)

### ChatMessages

Renders the message list with auto-scroll.

**Props:**
- `messages` (ChatMessage[])
- `loading` (boolean)
- `currentUserId` (string)
- `userRole` ('customer' | 'therapist')

### ChatInput

Message input with send functionality.

**Props:**
- `onSend` ((message: string) => Promise<void>)
- `sending` (boolean)
- `disabled?` (boolean)
- `placeholder?` (string)

## 🪝 Hooks

### useChatRooms

Fetches and manages user's active chat rooms.

```tsx
const {
  chatRooms,
  activeChatRoom,
  loading,
  error,
  setActiveChatRoom,
  refreshRooms
} = useChatRooms(userId, userRole);
```

### useChatMessages

Handles real-time messages for a chat room.

```tsx
const {
  messages,
  loading,
  sending,
  error,
  sendMessage,
  markAsRead
} = useChatMessages(chatRoomId, userId, userName, userRole);
```

### useBookingCountdown

Calculates time remaining until booking starts.

```tsx
const {
  timeRemaining,
  formatted,
  isExpired,
  isWithin15Minutes,
  isWithin5Minutes,
  percentComplete
} = useBookingCountdown(bookingDate, bookingTime);
```

### useNotifications

Manages toast-style notifications.

```tsx
const {
  notifications,
  addNotification,
  removeNotification,
  clearAll
} = useNotifications();

// Add notification
addNotification('success', 'Message Sent', 'Your message was delivered');
```

## 🔧 Appwrite Configuration

The system expects the following Appwrite collections:

### chat_sessions Collection
- `customerId` (string)
- `therapistId` (string)
- `customerName` (string)
- `therapistName` (string)
- `therapistPhoto` (string, optional)
- `bookingId` (string)
- `bookingDate` (string)
- `bookingTime` (string)
- `serviceDuration` (string)
- `serviceType` (string)
- `status` (string: 'active' | 'completed' | 'cancelled')
- `unreadCount` (number, optional)

### chat_messages Collection
- `chatRoomId` (string)
- `content` (string)
- `senderType` (string: 'customer' | 'therapist' | 'system' | 'admin')
- `senderName` (string)
- `senderId` (string)
- `timestamp` (datetime)
- `read` (boolean)

## 🎨 Customization

### Change Header Color

Edit `FloatingChatWindow.tsx`:

```tsx
// Change from orange to blue
<div className="bg-gradient-to-r from-blue-500 to-blue-600">
```

### Adjust Window Size

Edit `FloatingChatWindow.tsx`:

```tsx
style={{
  width: '500px',  // Change width
  height: '700px'  // Change height
}}
```

### Custom Notification Sounds

Add sound files to `/public/sounds/`:
- `notification-info.mp3`
- `notification-success.mp3`
- `notification-warning.mp3`
- `notification-error.mp3`

## 🔒 Security

- All Appwrite requests use the configured endpoint and project ID
- Messages are filtered by chatRoomId to prevent cross-chat leakage
- User role validation ensures proper access control
- Real-time subscriptions are cleaned up on unmount

## 🚦 Testing

1. **Test Real-time Messages:**
   - Open chat window for User A
   - Open chat window for User B (same room)
   - Send message from User A
   - Verify User B receives it instantly

2. **Test Countdown Timer:**
   - Create booking with future time
   - Verify countdown updates every second
   - Check visual warnings at 15min and 5min marks

3. **Test Notifications:**
   - Minimize chat window
   - Send message from another user
   - Verify notification appears

4. **Test Dragging:**
   - Click and hold header
   - Drag to new position
   - Reload page - verify position persists

## 📝 TypeScript

Full TypeScript support with exported types:

```tsx
import type { ChatRoom, ChatMessage, Notification } from './chat';
```

## 🐛 Troubleshooting

**Chat not opening?**
- Verify userId is provided and valid
- Check Appwrite collections exist
- Verify user has active chat rooms

**Messages not real-time?**
- Check Appwrite Realtime is enabled
- Verify network connection
- Check browser console for WebSocket errors

**Countdown not updating?**
- Verify bookingDate and bookingTime are valid ISO strings
- Check browser console for calculation errors

## 📄 License

Part of the main application - same license applies.

## 🤝 Contributing

This is a standalone module - feel free to enhance:
- Add emoji picker
- Add file upload support
- Add typing indicators
- Add message reactions
- Add chat history export

---

**Made with ❤️ for seamless booking-to-chat experience**
