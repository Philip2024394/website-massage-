# 🎯 PHASE B - Standalone Chat System Architecture

## 🎪 Current Problem: Chat is Tightly Coupled to App Lifecycle

### Issues with Current Implementation

**1. Chat Depends on App.tsx State**
```typescript
// App.tsx (lines 110-125)
const [activeChat, setActiveChat] = useState<{
  chatRoomId: string;
  bookingId: string;
  providerId: string;
  // ... 8 more properties
} | null>(null);
```
**Problem:** Chat window only renders when App.tsx decides. If App.tsx has errors or re-renders, chat disappears.

**2. Event-Based Communication**
```typescript
// Current pattern (FRAGILE)
window.dispatchEvent(new CustomEvent('openChat', { detail: {...} }));
```
**Problem:** Events can be missed, lost, or fired before listeners are ready.

**3. Chat Mount Timing is Unpredictable**
```typescript
// App.tsx
{activeChat && (
  <Suspense fallback={<LoadingState />}>
    <FloatingChatWindow {...activeChat} />
  </Suspense>
)}
```
**Problem:** Chat component may not be mounted when needed. No guarantee of visibility.

---

## 🏗️ Required Architecture: Appwrite-First Chat System

### Design Principles

1. **Single Source of Truth**: Appwrite is the only source of chat state
2. **Always-On Subscriptions**: Chat subscribes to Appwrite from app mount
3. **Independent Lifecycle**: Chat exists independently of booking UI state
4. **Guaranteed Visibility**: If chatRoomId exists in booking, chat MUST render

---

## 📐 Phase B Implementation Plan

### B.1 - Create Standalone Chat Provider

**Create: `context/ChatProvider.tsx`**

```typescript
/**
 * 🎪 STANDALONE CHAT PROVIDER
 * - Subscribes to Appwrite chat rooms on mount
 * - Maintains chat state independently of app state
 * - Guarantees chat visibility when booking has chatRoomId
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { client, databases } from '../lib/appwriteConfig';
import { DATABASE_ID, CHAT_ROOMS_COLLECTION_ID } from '../lib/constants';

interface ChatRoom {
  $id: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  providerImage: string | null;
  customerId: string;
  customerName: string;
  customerWhatsApp: string;
  status: 'waiting' | 'active' | 'completed';
  pricing: Record<string, number>;
  createdAt: string;
  expiresAt: string | null;
}

interface ChatContextValue {
  activeChatRooms: ChatRoom[];
  openChatRoom: (chatRoomId: string) => void;
  closeChatRoom: (chatRoomId: string) => void;
  minimizeChatRoom: (chatRoomId: string) => void;
  isMinimized: (chatRoomId: string) => boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChatRooms, setActiveChatRooms] = useState<ChatRoom[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set());
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  // Subscribe to Appwrite chat rooms on mount
  useEffect(() => {
    console.log('🎪 ChatProvider: Subscribing to Appwrite chat rooms');

    // Subscribe to chat room changes
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHAT_ROOMS_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as ChatRoom;
        
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('💬 New chat room created:', payload.$id);
          setActiveChatRooms(prev => [...prev, payload]);
        }
        
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          console.log('💬 Chat room updated:', payload.$id);
          setActiveChatRooms(prev =>
            prev.map(room => room.$id === payload.$id ? payload : room)
          );
        }
        
        if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          console.log('💬 Chat room deleted:', payload.$id);
          setActiveChatRooms(prev => prev.filter(room => room.$id !== payload.$id));
        }
      }
    );

    setSubscriptionActive(true);
    console.log('✅ ChatProvider: Appwrite subscription active');

    // Fetch existing chat rooms for current user
    fetchUserChatRooms();

    return () => {
      console.log('🔌 ChatProvider: Unsubscribing from Appwrite');
      unsubscribe();
      setSubscriptionActive(false);
    };
  }, []);

  const fetchUserChatRooms = async () => {
    try {
      // TODO: Get current user ID from auth context
      const userId = 'current-user-id';
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        [
          // Query for chat rooms where user is customer OR provider
          // TODO: Add proper query filters
        ]
      );

      setActiveChatRooms(response.documents as ChatRoom[]);
      console.log(`📊 Loaded ${response.documents.length} active chat rooms`);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  };

  const openChatRoom = (chatRoomId: string) => {
    console.log('💬 Opening chat room:', chatRoomId);
    setMinimizedChats(prev => {
      const next = new Set(prev);
      next.delete(chatRoomId);
      return next;
    });
  };

  const closeChatRoom = (chatRoomId: string) => {
    console.log('❌ Closing chat room:', chatRoomId);
    setActiveChatRooms(prev => prev.filter(room => room.$id !== chatRoomId));
  };

  const minimizeChatRoom = (chatRoomId: string) => {
    console.log('📦 Minimizing chat room:', chatRoomId);
    setMinimizedChats(prev => new Set(prev).add(chatRoomId));
  };

  const isMinimized = (chatRoomId: string) => {
    return minimizedChats.has(chatRoomId);
  };

  return (
    <ChatContext.Provider
      value={{
        activeChatRooms,
        openChatRoom,
        closeChatRoom,
        minimizeChatRoom,
        isMinimized,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
```

---

### B.2 - Refactor FloatingChatWindow to Use Provider

**Modify: `chat/FloatingChatWindow.tsx`**

```typescript
/**
 * 🎪 FLOATING CHAT WINDOW (Appwrite-Driven)
 * - Consumes ChatProvider state
 * - No dependency on App.tsx props
 * - Always renders if chat rooms exist
 */

import { useChatContext } from '../context/ChatProvider';

export function FloatingChatWindow() {
  const { activeChatRooms, isMinimized, closeChatRoom, minimizeChatRoom } = useChatContext();

  return (
    <>
      {activeChatRooms.map(chatRoom => (
        <div
          key={chatRoom.$id}
          className={`
            fixed bottom-0 right-4 w-96 
            ${isMinimized(chatRoom.$id) ? 'h-16' : 'h-[600px]'}
            transition-all duration-300 ease-in-out
          `}
        >
          <ChatWindow
            chatRoomId={chatRoom.$id}
            chatRoom={chatRoom}
            onClose={() => closeChatRoom(chatRoom.$id)}
            onMinimize={() => minimizeChatRoom(chatRoom.$id)}
            isMinimized={isMinimized(chatRoom.$id)}
          />
        </div>
      ))}
    </>
  );
}
```

---

### B.3 - Update Booking System to Write to Appwrite

**Modify: Booking Creation Flow**

```typescript
/**
 * 🎪 BOOKING CREATES CHAT ROOM IN APPWRITE
 * - Single source of truth
 * - Chat automatically appears via subscription
 * - No window events needed
 */

async function createBooking(bookingData: BookingData) {
  // 1. Create booking
  const booking = await databases.createDocument(
    DATABASE_ID,
    BOOKINGS_COLLECTION_ID,
    ID.unique(),
    bookingData
  );

  // 2. Create chat room in Appwrite (if customer wants chat)
  if (bookingData.enableChat) {
    const chatRoom = await databases.createDocument(
      DATABASE_ID,
      CHAT_ROOMS_COLLECTION_ID,
      ID.unique(),
      {
        bookingId: booking.$id,
        providerId: bookingData.therapistId,
        providerName: bookingData.therapistName,
        providerImage: bookingData.therapistImage,
        customerId: bookingData.customerId,
        customerName: bookingData.customerName,
        customerWhatsApp: bookingData.customerWhatsApp,
        status: 'waiting',
        pricing: bookingData.pricing,
        createdAt: new Date().toISOString(),
        expiresAt: bookingData.expiresAt,
      }
    );

    // 3. Link chatRoomId to booking
    await databases.updateDocument(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      booking.$id,
      {
        chatRoomId: chatRoom.$id
      }
    );

    console.log('💬 Chat room created:', chatRoom.$id);
    // NO WINDOW EVENTS - ChatProvider subscription handles visibility
  }

  return booking;
}
```

---

### B.4 - Remove Event-Based Chat Opening

**Delete/Replace:**
- ❌ `window.dispatchEvent(new CustomEvent('openChat', ...))`
- ❌ `useOpenChatListener` hook
- ❌ Event listeners in App.tsx

**Replace with:**
```typescript
// Direct Appwrite query when user clicks "View Chat"
async function openExistingChat(bookingId: string) {
  const booking = await databases.getDocument(
    DATABASE_ID,
    BOOKINGS_COLLECTION_ID,
    bookingId
  );

  if (booking.chatRoomId) {
    // ChatProvider already has this room subscribed
    // Just open it (remove from minimized)
    useChatContext().openChatRoom(booking.chatRoomId);
  } else {
    console.warn('Booking has no chat room');
  }
}
```

---

### B.5 - Guarantee Chat Visibility

**Add to ChatProvider:**

```typescript
/**
 * 🎪 VISIBILITY GUARANTEE
 * If booking exists AND has chatRoomId, chat MUST appear
 */

useEffect(() => {
  // On component mount, check for URL-based chat room
  const urlParams = new URLSearchParams(window.location.search);
  const chatRoomIdFromUrl = urlParams.get('chatRoomId');

  if (chatRoomIdFromUrl) {
    console.log('🎪 URL contains chatRoomId, ensuring visibility:', chatRoomIdFromUrl);
    openChatRoom(chatRoomIdFromUrl);
  }
}, []);

// Add to booking status tracker
useEffect(() => {
  activeChatRooms.forEach(room => {
    if (room.status === 'waiting' || room.status === 'active') {
      // Ensure these rooms are visible (not minimized)
      if (isMinimized(room.$id)) {
        console.log('⚠️ Auto-opening minimized active chat:', room.$id);
        openChatRoom(room.$id);
      }
    }
  });
}, [activeChatRooms]);
```

---

## 🔄 Data Flow (Phase B Architecture)

### Before (Event-Based - FRAGILE)
```
1. User clicks "Book"
2. BookingModal creates booking
3. BookingModal fires window event: 'openChat'
4. useOpenChatListener catches event (if mounted)
5. App.tsx sets activeChat state
6. FloatingChatWindow renders (if App didn't unmount)
```
**Problems:** Events can be missed, chat can disappear, timing-dependent

### After (Appwrite-First - SOLID)
```
1. User clicks "Book"
2. BookingModal creates booking in Appwrite
3. BookingModal creates chatRoom in Appwrite (linked to booking)
4. Appwrite subscription fires in ChatProvider
5. ChatProvider adds room to activeChatRooms
6. FloatingChatWindow automatically renders (always mounted)
```
**Benefits:** No events, no timing issues, chat guaranteed to appear

---

## 📋 Phase B Implementation Checklist

### B.1 - Standalone Chat Provider
- [ ] Create `context/ChatProvider.tsx`
- [ ] Implement Appwrite subscription to chat rooms
- [ ] Add state management for active/minimized chats
- [ ] Export `useChatContext()` hook

### B.2 - Refactor FloatingChatWindow
- [ ] Remove props dependency (chatRoomId, bookingId, etc.)
- [ ] Consume `useChatContext()` instead
- [ ] Map over `activeChatRooms` array
- [ ] Handle minimized state from context

### B.3 - Update Booking System
- [ ] Modify booking creation to create chat room in Appwrite
- [ ] Link chatRoomId to booking document
- [ ] Remove window.dispatchEvent('openChat')
- [ ] Test end-to-end booking → chat appearance

### B.4 - Remove Event System
- [ ] Delete `useOpenChatListener.ts`
- [ ] Remove event listeners from App.tsx
- [ ] Remove activeChat state from App.tsx
- [ ] Clean up event dispatches across codebase

### B.5 - Add Visibility Guarantees
- [ ] Implement URL-based chat room opening
- [ ] Auto-open minimized active/waiting chats
- [ ] Add booking → chat room lookup utility
- [ ] Test chat persists across page refresh

### B.6 - Integration Testing
- [ ] Create booking with chat → verify chat appears
- [ ] Refresh page → verify chat persists
- [ ] Minimize chat → verify state maintained
- [ ] Close chat → verify removed from active list
- [ ] Multiple chats → verify all visible simultaneously

---

## 🎯 Success Criteria

| Requirement | Verification Method |
|-------------|-------------------|
| **Chat independent of App.tsx** | Remove App.tsx render → chat still works |
| **No window events** | Search codebase for 'openChat' → zero results |
| **Appwrite-first** | Chat room created → chat appears automatically |
| **Survives refresh** | Refresh page with active chat → chat reappears |
| **Visibility guarantee** | If booking.chatRoomId exists → chat renders |
| **Multiple chats** | Create 3 bookings → 3 chat windows appear |

---

## 📊 Before/After Comparison

### Current (Event-Based)
```typescript
// ❌ FRAGILE: 42 dependencies, 8 state variables, 200+ lines
const [activeChat, setActiveChat] = useState(...);
const [isChatMinimized, setIsChatMinimized] = useState(...);
// ... 6 more state variables

useEffect(() => {
  const handleOpenChat = (event: CustomEvent) => { /* ... */ };
  window.addEventListener('openChat', handleOpenChat);
  return () => window.removeEventListener('openChat', handleOpenChat);
}, [/* 12 dependencies */]);
```

### Proposed (Appwrite-First)
```typescript
// ✅ SOLID: 0 dependencies, 1 context, 20 lines
function App() {
  return (
    <ChatProvider>
      <AppRouter />
      <FloatingChatWindow />
    </ChatProvider>
  );
}

// Chat automatically appears when Appwrite subscription fires
```

**Reduction:**
- 180 lines of event handling → 0 lines
- 8 state variables → 0 (moved to provider)
- 12 useEffect dependencies → 0
- Event listeners → Appwrite subscriptions

---

## ⏱️ Estimated Implementation Time

| Task | Estimated Time | Priority |
|------|---------------|----------|
| B.1 - Create ChatProvider | 2-3 hours | HIGH |
| B.2 - Refactor FloatingChatWindow | 1-2 hours | HIGH |
| B.3 - Update Booking System | 1 hour | HIGH |
| B.4 - Remove Event System | 1 hour | MEDIUM |
| B.5 - Visibility Guarantees | 2 hours | MEDIUM |
| B.6 - Integration Testing | 2-3 hours | HIGH |
| **Total** | **9-12 hours** | - |

---

## 🚀 Next Steps

1. **Create ChatProvider** - Foundation for standalone system
2. **Test Appwrite subscriptions** - Verify real-time updates work
3. **Refactor FloatingChatWindow** - Remove props, use context
4. **Update booking creation** - Write to Appwrite, not events
5. **Clean up events** - Remove all window.dispatchEvent calls
6. **Integration test** - End-to-end booking → chat flow

**Priority:** Start with B.1 (ChatProvider) as it's the foundation for everything else.
