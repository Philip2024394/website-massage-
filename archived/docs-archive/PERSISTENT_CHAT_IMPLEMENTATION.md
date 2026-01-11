# 🔒 Persistent Chat Window Implementation

## Overview

This implementation creates a **Facebook Messenger-style persistent chat window** that:
- **NEVER disappears** once opened
- Opens from any booking button (Book Now, Schedule, Price Menu)
- Fixed position at bottom-right
- z-index: 99999 (above everything)
- Can be minimized but not closed (while locked)

## Architecture

```
App.tsx
├── LanguageProvider
│   └── ChatProvider (existing)
│       └── PersistentChatProvider 👈 NEW
│           └── DeviceStylesProvider
│               └── AppLayout
│               └── PersistentChatWindow 👈 NEW (at ROOT level)
```

## Files Created

### 1. `context/PersistentChatProvider.tsx`
The context provider that manages the chat window state.

**Exports:**
- `PersistentChatProvider` - Wrapper component
- `usePersistentChat()` - Hook to access chat state and actions
- `ChatTherapist` - Type for therapist data
- `ChatMessage` - Type for messages
- `ChatWindowState` - Type for chat state

**Actions:**
- `openChat(therapist, mode)` - Open chat for a therapist
- `minimizeChat()` - Collapse to bubble
- `maximizeChat()` - Restore from bubble
- `closeChat()` - Close (only works if unlocked)
- `lockChat()` / `unlockChat()` - Control close ability
- `setBookingStep(step)` - Change booking flow step
- `setSelectedDuration(duration)` - Set session duration
- `setCustomerDetails(details)` - Set customer info
- `addMessage(message)` - Add a chat message

### 2. `components/PersistentChatWindow.tsx`
The visual chat window component.

**Features:**
- Fixed position bottom-right
- Purple gradient header
- Booking flow: Duration → Details → Confirmation → Chat
- Minimized state shows avatar bubble
- Real-time message display

### 3. `hooks/usePersistentChatIntegration.ts`
Bridge hook for TherapistCard.

**Exports:**
- `openBookingChat(therapist)` - For Book Now button
- `openScheduleChat(therapist)` - For Schedule button
- `openPriceChat(therapist)` - For Price Menu button

## How It Works

### Button Click Flow
1. User clicks "Book Now" on TherapistCard
2. `openBookingChat(therapist)` is called
3. Therapist data converted to `ChatTherapist` format
4. `PersistentChatProvider.openChat()` called
5. Chat state updated: `isOpen: true`, `isLocked: true`
6. `PersistentChatWindow` renders (fixed position, z-99999)

### Booking Flow
1. **Duration Step**: Select 60/90/120 minutes
2. **Details Step**: Enter name, WhatsApp, location
3. **Confirmation Step**: Review and confirm booking
4. **Chat Step**: Real-time messaging with therapist

### Persistence Guarantee
- Chat window is rendered at **ROOT level** in App.tsx
- It's **OUTSIDE** all routes and page components
- Navigation/page changes **CANNOT unmount it**
- State is preserved in `PersistentChatProvider`

## Usage Example

```tsx
// In TherapistCard.tsx
import { usePersistentChatIntegration } from '../hooks/usePersistentChatIntegration';

function TherapistCard({ therapist }) {
  const { openBookingChat, openScheduleChat } = usePersistentChatIntegration();
  
  return (
    <div>
      <button onClick={() => openBookingChat(therapist)}>
        Book Now
      </button>
      <button onClick={() => openScheduleChat(therapist)}>
        Schedule
      </button>
    </div>
  );
}
```

## Debugging

Access the chat state from browser console:
```javascript
window.__PERSISTENT_CHAT__.state
window.__PERSISTENT_CHAT__.openChat({ id: '1', name: 'Test', pricing: {} })
```

## CSS Isolation

The chat window uses **inline styles** to prevent:
- CSS class conflicts
- Tailwind utility conflicts
- Style inheritance issues

## Mobile Responsive

- Max width: `calc(100vw - 40px)`
- Max height: `calc(100vh - 100px)`
- Touch-friendly button sizes
- Smooth animations
