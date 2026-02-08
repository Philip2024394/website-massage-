# 🕐 Countdown Component - Integration Guide

## 🎯 Quick Start

The new `Countdown` component provides a flexible, reusable countdown timer perfect for booking flows, session timers, and timeout scenarios.

### Basic Usage

```tsx
import { Countdown } from './components';

// Simple 5-minute countdown
<Countdown secondsRemaining={300} />

// With completion callback
<Countdown 
  secondsRemaining={1500} // 25 minutes
  onComplete={() => handleTimeout()}
/>
```

### Props & Configuration

```tsx
interface CountdownProps {
  secondsRemaining: number;    // Required: Timer duration in seconds
  onComplete?: () => void;     // Optional: Callback when timer reaches 0
  className?: string;          // Optional: Additional CSS classes
  showIcon?: boolean;          // Optional: Show clock icon (default: true)
  size?: 'sm' | 'md' | 'lg';  // Optional: Size variant (default: 'md')
  variant?: 'default' | 'warning' | 'danger' | 'success'; // Color theme
}
```

## 🎨 Styling Variants

### Sizes
```tsx
<Countdown secondsRemaining={300} size="sm" />   // Small: 12px text
<Countdown secondsRemaining={300} size="md" />   // Medium: 14px text
<Countdown secondsRemaining={300} size="lg" />   // Large: 16px text
```

### Color Variants
```tsx
<Countdown secondsRemaining={300} variant="default" />  // Gray
<Countdown secondsRemaining={300} variant="warning" />  // Orange  
<Countdown secondsRemaining={300} variant="danger" />   // Red
<Countdown secondsRemaining={300} variant="success" />  // Green
```

### Auto Color-Changing
The component automatically changes color based on time remaining:
- **Green/Default**: > 2 minutes remaining
- **Orange/Warning**: ≤ 2 minutes remaining  
- **Red/Danger**: ≤ 30 seconds remaining

## 🏥 Massage Booking Integration

### 1. Therapist Response Timer (25 minutes)

```tsx
// In TherapistCard component or booking popup
const [waitingForResponse, setWaitingForResponse] = useState(true);

<div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
  <h3 className="font-semibold text-orange-900 mb-2">
    Waiting for {therapist.name}
  </h3>
  <p className="text-sm text-orange-700 mb-3">
    Therapist has 25 minutes to accept your booking
  </p>
  
  <Countdown
    secondsRemaining={1500} // 25 minutes
    variant="warning"
    size="lg"
    onComplete={() => {
      setWaitingForResponse(false);
      // Handle timeout - cancel booking, show message, etc.
      handleBookingTimeout();
    }}
  />
</div>
```

### 2. Session Duration Timer

```tsx
// During active massage session
<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
  <h3 className="font-semibold text-blue-900 mb-2">
    Session in Progress
  </h3>
  <p className="text-sm text-blue-700 mb-3">
    {sessionDuration}-minute massage session
  </p>
  
  <Countdown
    secondsRemaining={sessionDuration * 60}
    variant="default"
    size="lg"
    onComplete={() => {
      // Session completed
      showSessionCompleteModal();
    }}
  />
</div>
```

### 3. Arrival Countdown

```tsx
// When therapist is en route
<div className="bg-green-50 border border-green-200 rounded-xl p-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-green-900">
        {therapist.name} is arriving soon
      </h3>
      <p className="text-sm text-green-700">Estimated arrival:</p>
    </div>
    
    <Countdown
      secondsRemaining={1800} // 30 minutes
      variant="success"
      size="lg"
      onComplete={() => {
        // Therapist should have arrived
        showArrivalNotification();
      }}
    />
  </div>
</div>
```

## 🔧 Integration with Existing Components

### Adding to TherapistCard.tsx

```tsx
// In your TherapistCard component
import { Countdown } from '../components';

// When booking is pending therapist response
{showBookingCountdown && (
  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
    <div className="flex items-center justify-between text-sm">
      <span className="text-orange-700">Awaiting response:</span>
      <Countdown
        secondsRemaining={timeRemaining}
        variant="warning"
        size="sm"
        onComplete={handleBookingTimeout}
      />
    </div>
  </div>
)}
```

### Adding to Booking Modals

```tsx
// In BookingPopup or similar components
<div className="booking-timeout-section p-4 border-t">
  <div className="flex items-center gap-3">
    <AlertTriangle className="w-5 h-5 text-orange-500" />
    <div className="flex-1">
      <p className="font-medium text-gray-900">Complete booking within:</p>
    </div>
    <Countdown
      secondsRemaining={600} // 10 minutes
      variant="warning"
      onComplete={() => {
        // Close modal, show timeout message
        handleBookingExpired();
      }}
    />
  </div>
</div>
```

## 📱 Mobile Considerations

The component is fully responsive and mobile-optimized:

- **Touch-friendly**: Appropriate sizing for finger interaction
- **Readable**: Clear typography with high contrast
- **Battery-efficient**: Uses optimized animation and reduced motion support

## 🎯 Common Use Cases

1. **Booking Response Timer**: 25-minute countdown for therapist acceptance
2. **Payment Processing**: 10-minute timeout for payment completion
3. **Session Timer**: Real-time countdown during massage sessions
4. **Arrival Countdown**: Estimate when therapist will arrive
5. **Preparation Time**: Countdown before session starts

## 🔄 State Management 

### With React State
```tsx
const [timeRemaining, setTimeRemaining] = useState(1500);
const [isExpired, setIsExpired] = useState(false);

<Countdown
  secondsRemaining={timeRemaining}
  onComplete={() => setIsExpired(true)}
/>
```

### With Context or Redux
```tsx
// Using your existing booking context
const { bookingTimeout, handleTimeout } = useBookingContext();

<Countdown
  secondsRemaining={bookingTimeout}
  onComplete={handleTimeout}
/>
```

## ✅ Best Practices

1. **Always provide onComplete callback** for user feedback
2. **Use appropriate variants** based on urgency level
3. **Consider accessibility** - component supports reduced motion
4. **Test timeout scenarios** thoroughly in your booking flow
5. **Provide clear messaging** about what happens when timer expires

## 🚀 Ready to Use

The Countdown component is now available in your project and ready for integration. Import it from your components directory and start using it in your booking flows!

```tsx
import { Countdown } from './components';
// or
import Countdown from './components/Countdown';
```