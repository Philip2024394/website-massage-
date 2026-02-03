# Enhanced Booking Timeout System

## Overview

This document describes the enhanced booking timeout system that implements the user's requirements for handling booking timeouts with location-based broadcasting and improved user experience.

## User Requirements Implemented

✅ **When booking timer reaches zero and therapist/places have not accepted or rejected:**
- System actively sends the booking to ALL other therapists/places in user's location
- First-come-first-serve acceptance model
- User is updated in chat window with information about finding next available provider
- User can select cancel booking which shows directory browse message

## System Components

### 1. Enhanced Broadcast Service (`enhancedBroadcastService.ts`)

**Purpose**: Handles location-based broadcasting to nearby providers when timeout occurs.

**Key Features**:
- Finds therapists and places within configurable radius (default 10km, urgent 15km)
- Filters by availability status ('available', 'busy', 'active', 'open')
- First-come-first-serve acceptance handling
- Comprehensive logging and analytics
- Real-time notifications to providers

**Usage**:
```typescript
import { broadcastToNearbyProviders } from '../services/enhancedBroadcastService';

const result = await broadcastToNearbyProviders({
  bookingId: 'BK1234',
  userLocation: { lat: -6.2088, lng: 106.8456 },
  serviceType: 'massage',
  duration: 60,
  price: 150000,
  customerName: 'John Doe',
  isUrgent: true
});
```

### 2. Booking Timeout Handler (`bookingTimeoutHandler.ts`)

**Purpose**: Orchestrates the complete timeout handling process.

**Key Features**:
- Location detection and validation
- Automated fallback broadcasting
- User-friendly message generation
- Error handling and recovery

**Timeout Flow**:
1. Timer expires (5 minutes)
2. System checks for user location
3. If location available → broadcast to nearby providers
4. If no location → request location permission
5. If broadcast successful → update UI with provider count
6. If no providers found → show manual directory option

### 3. Enhanced Timeout Hook (`useEnhancedTimeout.ts`)

**Purpose**: React hook for managing timeout state and actions.

**Features**:
- Countdown timer management
- Timeout handling integration
- Status tracking ('idle', 'counting', 'expired', 'timeout_handled', 'cancelled')
- Location retry functionality
- Automatic directory redirection on cancel

### 4. Enhanced Booking Timeout Component (`EnhancedBookingTimeout.tsx`)

**Purpose**: UI component for timeout scenarios with user options.

**Features**:
- Status-aware messaging
- Location permission requests
- Provider count display
- Cancel with directory browse option
- Responsive design

## User Experience Flow

### Normal Booking Flow
1. User creates booking
2. 5-minute countdown starts
3. Therapist responds within time limit
4. Booking proceeds normally

### Enhanced Timeout Flow
1. User creates booking
2. 5-minute countdown starts
3. **Timer reaches zero (no response)**
4. System displays: *"⏰ No response received. We are now finding the next available therapist in your location for first-come-first-serve acceptance."*
5. System broadcasts to ALL nearby therapists/places
6. User sees provider count: *"📡 Found X nearby providers. First to accept gets the booking!"*
7. User options:
   - Wait for provider acceptance
   - **Cancel & Browse Directory** → redirects to `/therapists`

### Location Required Flow
1. Timer expires but no location available
2. System displays: *"📍 Location services required to find nearby therapists"*
3. User options:
   - Enable location → retry broadcast
   - Cancel → browse directory manually

### No Providers Flow
1. Timer expires and broadcast finds no providers
2. System displays: *"🚫 No nearby providers available"*
3. User message: *"Please view directory for your preferred Therapist / Places"*
4. Cancel button redirects to directory

## Integration Points

### Chat Window Integration
- Enhanced timeout messages in chat
- Status updates for broadcast progress
- Cancel button with directory message

### Booking Progress Component
- Added 'broadcast_all' status
- Enhanced status messages
- Improved cancel button behavior

### Status Tracker Integration
- Broadcasting status support
- Enhanced notification system
- Directory redirection handling

## Configuration

### Broadcast Settings
```typescript
const DEFAULT_RADIUS = 10; // 10km default search radius
const URGENT_RADIUS = 15;  // Expand radius for urgent bookings
const MAX_PROVIDERS = 50;  // Limit broadcast to prevent spam
```

### Timeout Settings
```typescript
const INITIAL_TIMEOUT = 300; // 5 minutes in seconds
const BROADCAST_TIMEOUT = 120; // 2 minutes for broadcast response
```

## Database Schema

### Broadcast Notifications Collection
```json
{
  "broadcastId": "broadcast_BK1234_1672531200000",
  "bookingId": "BK1234",
  "providerId": "therapist_123",
  "providerType": "therapist",
  "customerName": "John Doe",
  "serviceType": "massage",
  "distance": 5.2,
  "isUrgent": true,
  "status": "sent",
  "sentAt": "2024-01-01T10:00:00.000Z",
  "expiresAt": "2024-01-01T10:05:00.000Z"
}
```

### Broadcast Logs Collection
```json
{
  "broadcastId": "broadcast_BK1234_1672531200000",
  "bookingId": "BK1234",
  "userLocation": "{\"lat\":-6.2088,\"lng\":106.8456}",
  "totalProviders": 12,
  "therapistCount": 8,
  "placeCount": 4,
  "acceptedBy": "therapist_456",
  "acceptedAt": "2024-01-01T10:02:30.000Z",
  "status": "accepted"
}
```

## API Endpoints

### Broadcast Endpoints
- `POST /api/broadcast/nearby-providers` - Trigger location-based broadcast
- `POST /api/broadcast/accept` - Handle provider acceptance
- `GET /api/broadcast/{broadcastId}/status` - Check broadcast status

### Provider Notification Endpoints
- `POST /api/notifications/provider` - Send notification to provider
- `PUT /api/notifications/{notificationId}/status` - Update notification status

## Testing

### Test Scenarios
1. **Normal timeout flow** - Timer expires, location available, providers found
2. **Location required flow** - Timer expires, no location, request permission
3. **No providers flow** - Timer expires, location available, no providers found
4. **Provider acceptance** - First provider accepts during broadcast
5. **User cancellation** - User cancels during broadcast, redirects to directory

### Example Test Implementation
```typescript
describe('Enhanced Timeout System', () => {
  it('should broadcast to nearby providers on timeout', async () => {
    const result = await handleBookingTimeout({
      bookingId: 'TEST_123',
      originalTherapistId: 'therapist_1',
      customerName: 'Test User',
      serviceType: 'massage',
      duration: 60,
      price: 100000,
      location: { lat: -6.2088, lng: 106.8456 }
    });
    
    expect(result.success).toBe(true);
    expect(result.action).toBe('broadcasted');
    expect(result.providerCount).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### Optimization Strategies
1. **Cached location data** - Store user location for 5 minutes to avoid repeated requests
2. **Provider filtering** - Pre-filter providers by status before distance calculation
3. **Batch notifications** - Send notifications in batches to avoid API limits
4. **Database indexing** - Index location fields and provider status for fast queries

### Monitoring
- Track broadcast success rates
- Monitor provider response times
- Log timeout patterns for optimization
- Alert on high failure rates

## Security Considerations

### Privacy Protection
- Location data is not stored permanently
- Provider contact information protected for Pro members
- Broadcast logs exclude sensitive customer data
- Notification expiration prevents stale requests

### Rate Limiting
- Prevent spam broadcasting
- Limit notifications per provider per hour
- Throttle location requests

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
BROADCAST_DEFAULT_RADIUS=10
BROADCAST_URGENT_RADIUS=15
BROADCAST_MAX_PROVIDERS=50
TIMEOUT_INITIAL_SECONDS=300
TIMEOUT_BROADCAST_SECONDS=120
```

### Required Collections
1. `broadcast_notifications`
2. `broadcast_logs`
3. `provider_notifications`
4. `therapists` (existing)
5. `places` (existing)

## Future Enhancements

### Planned Features
1. **Smart radius adjustment** - Dynamically adjust search radius based on provider density
2. **Priority scoring** - Rank providers by rating, distance, and availability
3. **Machine learning** - Predict optimal timeout duration based on historical data
4. **Multi-language support** - Localized messages for different regions
5. **Real-time provider tracking** - Live location updates for better matching

### Analytics Dashboard
- Timeout rates by time of day
- Provider response analytics
- Geographic broadcast patterns
- User behavior after timeout

---

## Summary

The enhanced booking timeout system provides a comprehensive solution that:

✅ **Meets all user requirements**:
- Active broadcasting on timeout
- Location-based provider search
- First-come-first-serve acceptance
- Clear user communication
- Directory browse option with proper messaging

✅ **Improves user experience**:
- Clear status messages
- Multiple fallback options
- Automatic directory redirection
- Progress visibility

✅ **Maintains system reliability**:
- Comprehensive error handling
- Performance optimizations
- Security considerations
- Monitoring and analytics

The system is production-ready and integrates seamlessly with the existing booking flow without breaking current functionality.