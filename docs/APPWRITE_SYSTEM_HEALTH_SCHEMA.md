# Appwrite System Health Monitoring Collections

This document describes the collections needed for the rocket-proof system health monitoring feature in the admin dashboard.

## 1. Collection: `system_health_checks`

**Purpose**: Stores periodic health check data from all member dashboards (therapists, places, hotels)

**Collection ID**: `system_health_checks`

### Attributes:

| Attribute | Type | Size | Required | Array | Default | Description |
|-----------|------|------|----------|-------|---------|-------------|
| `memberId` | string | 255 | Yes | No | - | ID of the member (therapist/place/hotel) |
| `notificationsEnabled` | boolean | - | Yes | No | false | Whether browser notifications are enabled |
| `soundEnabled` | boolean | - | Yes | No | false | Whether notification sound is enabled |
| `browserSupport` | boolean | - | Yes | No | false | Whether browser supports notifications |
| `isOnline` | boolean | - | Yes | No | false | Whether member is currently online |
| `browserVersion` | string | 255 | Yes | No | - | Browser name and version (e.g., "Chrome 120") |
| `deviceType` | string | 50 | Yes | No | - | Device type: "Mobile", "Tablet", or "Desktop" |
| `connectionQuality` | string | 50 | Yes | No | - | Connection quality: "excellent", "good", "poor", "offline" |
| `lastMessageSent` | string | 255 | No | No | - | Timestamp of last message sent by member |
| `timestamp` | datetime | - | Yes | No | - | When this health check was performed |

### Indexes:

1. **Index Name**: `member_health`
   - **Type**: Key
   - **Attributes**: `memberId` (ASC), `timestamp` (DESC)
   - **Purpose**: Fast lookup of latest health status for each member

2. **Index Name**: `recent_checks`
   - **Type**: Key
   - **Attributes**: `timestamp` (DESC)
   - **Purpose**: Get recent health checks across all members

### Permissions:

- **Read**: Role `team:admin`
- **Create**: Role `any` (members report their own health)
- **Update**: Role `team:admin`
- **Delete**: Role `team:admin`

---

## 2. Collection: `notification_logs`

**Purpose**: Tracks all notifications sent to members with delivery confirmation

**Collection ID**: `notification_logs`

### Attributes:

| Attribute | Type | Size | Required | Array | Default | Description |
|-----------|------|------|----------|-------|---------|-------------|
| `recipientId` | string | 255 | Yes | No | - | ID of the member receiving notification |
| `type` | string | 50 | Yes | No | - | Type: "booking", "message", "test", "system" |
| `title` | string | 255 | Yes | No | - | Notification title |
| `message` | string | 1000 | Yes | No | - | Notification message body |
| `priority` | string | 50 | Yes | No | "normal" | Priority: "low", "normal", "high", "urgent" |
| `requiresSound` | boolean | - | Yes | No | false | Whether notification should play sound |
| `sentAt` | datetime | - | Yes | No | - | When notification was sent |
| `receivedAt` | datetime | - | No | No | - | When member's device received it (confirmed) |
| `deviceInfo` | string | 255 | No | No | - | Device type that received notification |
| `clickedAt` | datetime | - | No | No | - | When member clicked the notification |
| `relatedBookingId` | string | 255 | No | No | - | If type="booking", the booking ID |

### Indexes:

1. **Index Name**: `recipient_logs`
   - **Type**: Key
   - **Attributes**: `recipientId` (ASC), `sentAt` (DESC)
   - **Purpose**: Get all notifications for a member

2. **Index Name**: `unconfirmed_notifications`
   - **Type**: Key
   - **Attributes**: `receivedAt` (ASC), `sentAt` (DESC)
   - **Purpose**: Find notifications not yet confirmed as received

### Permissions:

- **Read**: Role `team:admin`, Document Owner (recipientId)
- **Create**: Role `team:admin`, Role `any` (for self-reporting)
- **Update**: Role `team:admin`, Document Owner
- **Delete**: Role `team:admin`

---

## 3. Updates to Existing `bookings` Collection

Add these new attributes to track booking acknowledgment:

| Attribute | Type | Size | Required | Array | Default | Description |
|-----------|------|------|----------|-------|---------|-------------|
| `providerAcknowledged` | boolean | - | No | No | false | Whether provider has seen the booking |
| `acknowledgedAt` | datetime | - | No | No | - | When provider acknowledged the booking |
| `isTest` | boolean | - | No | No | false | Whether this is a test booking from admin |

---

## Setup Instructions

### Step 1: Create `system_health_checks` Collection

```bash
# Via Appwrite Console:
1. Go to Databases → Select your database
2. Click "Add Collection"
3. Name: "system_health_checks"
4. Collection ID: "system_health_checks"
5. Add all attributes as specified above
6. Create indexes as specified
7. Set permissions as specified
```

### Step 2: Create `notification_logs` Collection

```bash
# Via Appwrite Console:
1. Go to Databases → Select your database
2. Click "Add Collection"
3. Name: "notification_logs"
4. Collection ID: "notification_logs"
5. Add all attributes as specified above
6. Create indexes as specified
7. Set permissions as specified
```

### Step 3: Update `bookings` Collection

```bash
# Via Appwrite Console:
1. Go to Databases → Select your database → bookings collection
2. Click "Settings" → "Attributes"
3. Add the 3 new attributes:
   - providerAcknowledged (boolean, not required, default: false)
   - acknowledgedAt (datetime, not required)
   - isTest (boolean, not required, default: false)
```

---

## Integration Guide

### For Member Dashboards (Therapist/Place/Hotel)

Add this to your dashboard initialization code:

```typescript
import { systemHealthService } from '@/lib/systemHealthService';

// After user logs in
useEffect(() => {
    if (currentUser?.id) {
        // Start health monitoring
        systemHealthService.startHealthMonitoring(currentUser.id);
        
        // Test notification system on first load
        const hasTestedBefore = localStorage.getItem('notificationTested');
        if (!hasTestedBefore) {
            systemHealthService.testNotificationSystem().then(success => {
                if (success) {
                    localStorage.setItem('notificationTested', 'true');
                }
            });
        }
    }
    
    return () => {
        systemHealthService.stopHealthMonitoring();
    };
}, [currentUser?.id]);
```

### When Receiving Notifications

```typescript
// When notification is received
systemHealthService.logNotificationReceived(notificationId);

// When notification sound plays
systemHealthService.playNotificationSound();
```

### When Acknowledging Bookings

```typescript
// When member clicks on a booking or opens chat
systemHealthService.logBookingAcknowledged(bookingId);
```

---

## Admin Dashboard Integration

Add the new System Health Monitor page to your admin routes:

```typescript
// In admin router
import SystemHealthMonitor from '@/pages/SystemHealthMonitor';

// Add route
<Route path="/system-health" element={<SystemHealthMonitor />} />
```

Add navigation link:

```typescript
<NavLink to="/system-health">
    🏥 System Health Monitor
</NavLink>
```

---

## Features

### 1. **Real-Time Status Overview**
- Total members count
- Healthy / Warning / Critical / Offline counts
- Click summary cards to filter

### 2. **Member Health Table**
Shows for each member:
- Overall status with color coding
- Notification status (enabled, sound on/off)
- Booking stats (total, book now, scheduled, missed)
- Chat status (online/offline, unread messages)
- Last seen timestamp
- Action buttons

### 3. **Test Actions**
Admin can send:
- Test notification (with sound)
- Test "Book Now" booking
- Test "Schedule" booking

### 4. **Detailed View**
Click "Details" to see comprehensive system information:
- Notification system details
- Booking history
- Chat statistics
- Browser and device information
- Connection quality
- Health check timestamps

### 5. **Auto-Refresh**
- Automatically refreshes every 30 seconds (toggle on/off)
- Manual refresh button available

---

## Status Definitions

### Healthy ✅
- All systems working
- Notifications enabled with sound
- No missed bookings
- Online and responsive

### Warning ⚠️
- 1-3 missed bookings
- 10+ unread messages
- Poor connection quality
- Some systems working but degraded

### Critical 🚨
- 4+ missed bookings
- Notifications disabled
- Sound disabled
- Major system issues

### Offline ⚫
- No health check received in last 10 minutes
- Member dashboard not running
- Device turned off or disconnected

---

## Troubleshooting

### If Member Shows Offline:
1. Check if member has dashboard open
2. Verify internet connection
3. Check browser console for errors
4. Send test notification to wake device

### If Notifications Not Working:
1. Check notification permission status
2. Verify sound is enabled
3. Check browser supports notifications
4. Test with "Test Notification" button

### If Missing Bookings:
1. Check notification logs for that time period
2. Verify booking was created correctly
3. Check if member acknowledged it late
4. Send test booking to diagnose

---

## Benefits

✅ **Rocket-Proof Monitoring**: See exactly what's working for each member  
✅ **Proactive Issue Detection**: Catch problems before members lose bookings  
✅ **Real-Time Testing**: Send test notifications/bookings instantly  
✅ **Detailed Diagnostics**: Browser, device, connection quality tracking  
✅ **Missed Booking Alerts**: Instantly see if members are missing opportunities  
✅ **Sound Verification**: Confirm notification music is playing  
✅ **Multi-System Tracking**: Monitors notifications, bookings, and chat together  

This gives you 100% confidence that members are receiving bookings and notifications properly!
