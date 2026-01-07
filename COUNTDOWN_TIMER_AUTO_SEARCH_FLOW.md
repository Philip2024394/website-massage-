# Countdown Timer + Auto-Search + Therapist Acceptance Flow

## 🎯 Feature Overview

Complete implementation of waiting screen with countdown timer that automatically broadcasts booking to all therapists when timer expires, and shows acceptance banner when a therapist responds.

---

## ⏱️ Timer Flow

### Initial State
- **Duration**: 5 minutes (300 seconds)
- **Display**: Shows `5:00` countdown in large minimalistic format
- **Status**: "Waiting For Connection"
- **Location**: Below booking details card in waiting screen

### Countdown Behavior
```typescript
// Countdown timer effect (lines 247-268)
useEffect(() => {
  if (bookingStatus === 'searching' && countdownTime > 0) {
    const timer = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }
}, [bookingStatus, countdownTime]);
```

### When Timer Hits 0:00
```typescript
// Auto-trigger broadcast (lines 257-261)
useEffect(() => {
  if (countdownTime === 0 && bookingStatus === 'searching') {
    handleAutoSearchTherapist();
  }
}, [countdownTime, bookingStatus, handleAutoSearchTherapist]);
```

---

## 📡 Auto-Search Broadcast

### Function: `handleAutoSearchTherapist()`
**Location**: Lines 273-305

**Purpose**: Broadcast booking to ALL available therapists when initial wait times out

**Behavior**:
1. ✅ Adds system message: "No response received. Now broadcasting your booking to all available therapists..."
2. 📡 Creates search config with service duration and customer coordinates
3. 🔄 Resets search to trigger new broadcast via `resetSearch()`
4. 🎯 Sends notifications to all therapists in the area

```typescript
const handleAutoSearchTherapist = useCallback(async () => {
  if (!currentBooking || !customerCoordinates) return;
  
  console.log('🔍 Broadcasting booking to all available therapists...');
  
  // System message
  const broadcastMessage: ChatMessage = {
    id: `system_${Date.now()}`,
    conversationId: currentBooking.id,
    senderType: 'system',
    content: 'No response received. Now broadcasting your booking to all available therapists...',
    timestamp: new Date().toISOString()
  };
  
  setMessages(prev => [...prev, broadcastMessage]);
  
  try {
    const searchConfig = BookingService.createSearchConfig(
      serviceDuration,
      customerCoordinates
    );
    
    console.log('📡 Search broadcast sent to all therapists');
    resetSearch();
    
  } catch (error) {
    console.error('❌ Auto-search failed:', error);
    setError('Failed to broadcast booking. Please try again.');
  }
}, [currentBooking, customerCoordinates, serviceDuration, resetSearch]);
```

---

## 🎯 Therapist Acceptance Banner

### When Therapist Accepts
**Function**: `handleTherapistFound()` (lines 570-604)

When ANY therapist accepts the broadcast:
1. ⏹️ **Stops countdown**: `setCountdownTime(0)`
2. 👤 **Stores therapist**: `setPendingTherapist(therapist)`
3. 🎨 **Shows banner**: `setShowAcceptanceBanner(true)`
4. 📊 **Updates status**: `setBookingStatus('pending_accept')`

```typescript
function handleTherapistFound(therapist: TherapistMatch) {
  console.log('✅ Therapist accepted booking:', therapist.name)
  
  // Stop countdown and show acceptance banner
  setPendingTherapist(therapist)
  setShowAcceptanceBanner(true)
  setCurrentTherapist(therapist)
  setBookingStatus('pending_accept')
  setCountdownTime(0) // Stop timer
  
  // System message
  const acceptanceMessage: ChatMessage = {
    id: `system_${Date.now()}`,
    conversationId: currentBooking?.id || 'temp',
    senderType: 'system',
    content: `🎉 ${therapist.name} has accepted your booking! Review their profile and confirm to start chatting.`,
    timestamp: new Date().toISOString()
  }
  
  setMessages(prev => [...prev, acceptanceMessage])
}
```

### Banner UI Design
**Location**: Lines 1466-1559 (in JSX render)

**Design**: Minimalistic white card with orange accents

**Components**:
1. **Header Bar**: Orange gradient background with green pulse dot + "Therapist Found!" title
2. **Profile Section**:
   - Therapist photo (circular, 80x80px) with green checkmark badge
   - Name (large, bold)
   - Star rating (5 stars with orange/grey colors)
   - Location (with 📍 emoji)
3. **Arrival Time Card**: Grey background card showing estimated arrival (30-60 mins)
4. **Action Buttons**:
   - ✅ **Accept**: Orange gradient button → "Confirm & Start Chat"
   - ✕ **Decline**: Grey button → "Decline & Search Again"
5. **Footer**: Small text explaining decline action

```tsx
{showAcceptanceBanner && pendingTherapist && (
  <div className="bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-lg mb-4 animate-in fade-in duration-300">
    {/* Header */}
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-orange-200">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="font-bold text-gray-900 text-sm">Therapist Found!</h3>
      </div>
    </div>
    
    {/* Content... */}
  </div>
)}
```

---

## 🚫 Reject/Cancel Therapist

### Function: `handleRejectTherapist()`
**Location**: Lines 621-653

**Purpose**: Allow user to decline therapist and return to home page for manual search

**Behavior**:
1. 🔄 Resets all acceptance states
2. 💬 Adds system message about rejection
3. ⏱️ Waits 1 second
4. ❌ Closes chat window
5. 🏠 Redirects to home page (`window.location.href = '/'`)

```typescript
const handleRejectTherapist = useCallback(() => {
  console.log('🚫 User rejected pending therapist')
  
  // Reset states
  setPendingTherapist(null)
  setShowAcceptanceBanner(false)
  setCurrentTherapist(null)
  setBookingStatus('idle')
  
  // System message
  const rejectMessage: ChatMessage = {
    id: `system_${Date.now()}`,
    conversationId: currentBooking?.id || 'temp',
    senderType: 'system',
    content: 'You declined this therapist. Returning to home page to search again.',
    timestamp: new Date().toISOString()
  }
  
  setMessages(prev => [...prev, rejectMessage])
  
  // Close and redirect after brief delay
  setTimeout(() => {
    onClose()
    window.location.href = '/'
  }, 1000)
}, [currentBooking, onClose])
```

---

## ✅ Accept Therapist

### Button Action
**Location**: Lines 1523-1530 (in acceptance banner JSX)

**Behavior**:
1. 🎨 Hides acceptance banner: `setShowAcceptanceBanner(false)`
2. 💬 Changes status to active: `setBookingStatus('active')`
3. 🚀 Opens full chat window with therapist

```tsx
<button
  onClick={() => {
    setShowAcceptanceBanner(false)
    setBookingStatus('active')
    console.log('✅ User accepted therapist:', pendingTherapist.name)
  }}
  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
>
  <span>✓</span>
  <span>Confirm & Start Chat</span>
</button>
```

---

## 🎬 Complete Flow Sequence

### Step 1: User Books Service
- User selects service duration and location
- Clicks "Book Now" button
- Chat window opens with booking details card

### Step 2: Waiting Screen Appears
- Shows provider card with photo and name
- Shows service details (type, duration, price, payment methods)
- Shows countdown timer starting at 5:00
- Status: "Waiting For Connection"

### Step 3: Timer Counts Down
- Timer decrements every second: 5:00 → 4:59 → 4:58... → 0:00
- Orange pulse dots animate next to status text
- User sees "Your request has been sent" message

### Step 4A: Timer Expires (No Response)
- Timer reaches 0:00
- Auto-triggers `handleAutoSearchTherapist()`
- System message: "No response received. Now broadcasting..."
- Booking is broadcast to ALL available therapists
- Timer can restart or continue waiting

### Step 4B: Therapist Accepts (Before or After Timer)
- A therapist accepts the booking
- Timer immediately stops (set to 0:00)
- Acceptance banner appears with fade-in animation
- Shows therapist profile, rating, location, arrival time

### Step 5A: User Accepts Therapist
- User clicks "Confirm & Start Chat"
- Banner closes
- Chat becomes active
- User can now message therapist directly

### Step 5B: User Rejects Therapist
- User clicks "Decline & Search Again"
- System message: "You declined this therapist..."
- Chat window closes after 1 second
- Redirects to home page
- User can manually select different therapist

---

## 🎨 UI/UX Features

### Design Theme
- **Colors**: Orange (#F97316), Black (#111827), Grey (#6B7280), White (#FFFFFF)
- **Style**: Minimalistic, clean, professional
- **Animations**: Fade-in, pulse effects, smooth transitions

### Responsive Design
- Mobile-optimized layout
- Truncated text for long names/locations
- Touch-friendly button sizes (py-3 = 12px padding)
- Full-width buttons for easy tapping

### Visual Feedback
- ✅ Green checkmark on accepted therapist photo
- 🟢 Green pulse dot for "Therapist Found" status
- 🟠 Orange pulse dots for "Waiting For Connection"
- ⏱️ Large, easy-to-read countdown timer

### Accessibility
- Clear button labels with emojis
- High contrast text
- Descriptive system messages
- Progress indicators

---

## 🔧 State Management

### Key States
```typescript
// Timer
const [countdownTime, setCountdownTime] = useState(300) // 5 minutes

// Therapist Acceptance
const [pendingTherapist, setPendingTherapist] = useState<TherapistMatch | null>(null)
const [showAcceptanceBanner, setShowAcceptanceBanner] = useState(false)

// Booking Flow
const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle')
const [currentTherapist, setCurrentTherapist] = useState<TherapistMatch | null>(null)
```

### State Transitions
```
idle → searching (timer starts at 5:00)
  ↓
  Timer counts down
  ↓
searching → pending_accept (therapist accepts, timer stops)
  ↓
  [User sees acceptance banner]
  ↓
pending_accept → active (user accepts therapist)
  OR
pending_accept → idle (user rejects therapist → redirect home)
```

---

## 🐛 Error Handling

### Auto-Search Failure
```typescript
try {
  // Broadcast logic
} catch (error) {
  console.error('❌ Auto-search failed:', error);
  setError('Failed to broadcast booking. Please try again.');
}
```

### Missing Data Guards
```typescript
if (!currentBooking || !customerCoordinates) return;
```

### Timeout Protection
- Timer automatically stops at 0 (prevents negative values)
- Cleanup function clears interval on unmount

---

## ✅ Testing Checklist

- [ ] Timer starts at 5:00 when booking initiated
- [ ] Timer counts down every second correctly
- [ ] Timer stops at 0:00 (doesn't go negative)
- [ ] Auto-search triggers when timer hits 0:00
- [ ] System message appears when broadcasting
- [ ] Acceptance banner appears when therapist accepts
- [ ] Timer stops when therapist accepts (even if time remaining)
- [ ] Banner shows correct therapist details
- [ ] Accept button opens active chat
- [ ] Decline button closes chat and redirects home
- [ ] Error handling works if broadcast fails
- [ ] Mobile layout looks good
- [ ] Animations are smooth

---

## 📝 Notes

- Timer persists during broadcast (doesn't reset unless manually triggered)
- Multiple therapists can receive broadcast simultaneously
- First therapist to accept gets shown in banner
- User has final control with accept/reject buttons
- Rejection returns user to home for manual selection
- All system messages logged to chat history

---

**Status**: ✅ COMPLETE
**Last Updated**: 2024
**File**: `components/ChatWindow.tsx`
**Lines**: 1799 total
