# 📊 Analytics, Monitoring & Backup System - Implementation Guide

## 🚀 Complete System Enhancement

Your IndaStreet Massage application now includes three powerful new systems:

1. **📊 User Analytics** - Comprehensive behavior tracking
2. **🏥 Health Monitoring** - Automated system health checks
3. **🛡️ Automated Backups** - Data protection and recovery

---

## 📋 Quick Setup Guide

### Step 1: Initialize Database Collections

Run the setup script to create required collections:

```bash
node scripts/setupAnalyticsCollections.mjs
```

This creates:
- `user_analytics` - User behavior tracking
- `system_health_logs` - Health monitoring data
- `backup_logs` - Backup operation records  
- `backup_metadata` - Backup file metadata

### Step 2: Import Services

```typescript
// Analytics tracking
import { analyticsService, useAnalytics } from './lib/analyticsService';

// Health monitoring
import { healthMonitoringService } from './lib/healthMonitoringService';

// Backup management
import { automatedBackupService } from './lib/automatedBackupService';

// React hooks
import { useAnalytics, useHealthMonitoring, useBackupManagement } from './hooks/useAnalytics';
```

### Step 3: Add Dashboard to Admin Pages

```tsx
import SystemDashboard from './components/SystemDashboard';

// In your admin route
<Route path="/admin/dashboard" component={SystemDashboard} />
```

---

## 📊 Analytics System

### Features
- ✅ **User Behavior Tracking** - Page views, bookings, chat sessions
- ✅ **Real-time Metrics** - Active users, conversion rates, error tracking
- ✅ **Performance Monitoring** - Load times, response times
- ✅ **Geographic Data** - User location tracking (with permission)
- ✅ **Search Analytics** - Popular terms, filter usage

### Usage Examples

```typescript
// In React components
const { trackBooking, trackChatActivity, trackSearch } = useAnalytics();

// Track booking attempt
trackBooking('attempt', {
    therapistId: 'therapist123',
    serviceType: 'massage',
    duration: 90,
    totalPrice: 150000,
    location: 'Jakarta'
});

// Track chat start
trackChatActivity('started', {
    chatId: 'chat123',
    participantType: 'customer'
});

// Track search
trackSearch('massage therapist', { city: 'Jakarta' }, 25);
```

### Analytics Dashboard Metrics

```typescript
const metrics = await analyticsService.getDashboardMetrics();
// Returns:
{
    activeUsers: 150,
    todayBookings: 23,
    chatSessions: 45,
    errorRate: 0.5,
    topPages: [
        { page: '/', views: 1250 },
        { page: '/therapists', views: 890 }
    ]
}
```

---

## 🏥 Health Monitoring System

### Features
- ✅ **Database Connectivity** - Connection health checks
- ✅ **Collection Accessibility** - Permission and data validation
- ✅ **Authentication Service** - Auth system health
- ✅ **Performance Metrics** - Response time monitoring
- ✅ **Service Dependencies** - External service checks

### Usage Examples

```typescript
// Perform comprehensive health check
const healthReport = await healthMonitoringService.performHealthCheck();

// Get current system status
const status = await healthMonitoringService.getSystemStatus();
// Returns:
{
    status: 'operational', // 'operational' | 'degraded' | 'maintenance'
    uptime: 99.8,
    lastCheck: '2026-01-01T10:00:00Z',
    criticalIssues: [],
    activeIncidents: 0
}
```

### Health Check Results

```typescript
// Each service returns detailed status
{
    service: 'Database Connection',
    status: 'healthy', // 'healthy' | 'degraded' | 'unhealthy'
    responseTime: 45,
    message: 'Connected successfully. Found 5 databases.',
    timestamp: '2026-01-01T10:00:00Z'
}
```

---

## 🛡️ Automated Backup System

### Features
- ✅ **Collection Backups** - Export all data collections
- ✅ **Scheduled Backups** - Automated daily/weekly/monthly
- ✅ **Multiple Formats** - JSON, CSV, or both
- ✅ **Data Integrity** - Checksum verification
- ✅ **Restore Capability** - Full data restoration

### Usage Examples

```typescript
// Perform manual backup
const result = await automatedBackupService.performBackup();

// Schedule daily backups
const scheduleId = automatedBackupService.scheduleBackup({
    collections: ['therapists', 'places', 'bookings'],
    format: 'json',
    schedule: 'daily',
    retention: 30
});

// Restore from backup
await automatedBackupService.restoreFromBackup('backup_123', ['therapists']);
```

### Backup Configuration

```typescript
interface BackupConfiguration {
    collections: string[];           // Which collections to backup
    format: 'json' | 'csv' | 'both'; // Export format
    compression: boolean;            // Compress backup files
    encryption: boolean;             // Encrypt sensitive data
    schedule: 'daily' | 'weekly';    // Automatic schedule
    retention: number;               // Days to keep backups
    incremental: boolean;            // Incremental vs full backup
}
```

---

## 🎛️ System Dashboard

### Features
- ✅ **Unified Overview** - All systems in one place
- ✅ **Real-time Updates** - Live data refresh every minute
- ✅ **Health Alerts** - Critical issue notifications
- ✅ **Performance Charts** - Visual metrics display
- ✅ **Action Controls** - Run health checks & backups

### Dashboard Sections

1. **Overview Tab**
   - System status cards
   - Today's activity metrics
   - Critical issue alerts

2. **Analytics Tab**
   - User behavior metrics
   - Performance statistics
   - Top pages and features

3. **Health Tab**
   - Service status details
   - Response time metrics
   - Historical health data

4. **Backups Tab**
   - Backup history
   - Schedule management
   - Restore operations

---

## 🔧 Integration Examples

### 1. Track User Registration

```typescript
// In registration components
const { trackUserRegistration } = useAnalytics();

const handleRegistration = async (userData) => {
    try {
        await registerUser(userData);
        trackUserRegistration('therapist', 'email_signup');
    } catch (error) {
        trackError(error, 'user_registration');
    }
};
```

### 2. Monitor Search Performance

```typescript
// In search components
const { trackSearch } = useAnalytics();

const handleSearch = async (query, filters) => {
    const results = await searchTherapists(query, filters);
    trackSearch(query, filters, results.length);
};
```

### 3. Health Status Widget

```typescript
const HealthWidget = () => {
    const { getSystemStatus } = useHealthMonitoring();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            const healthStatus = await getSystemStatus();
            setStatus(healthStatus);
        };
        checkHealth();
    }, []);

    return (
        <div className={`status-${status?.status}`}>
            System Status: {status?.status}
            Uptime: {status?.uptime}%
        </div>
    );
};
```

---

## 📈 Analytics Data Structure

### Event Types Tracked
- `page_view` - User visits a page
- `booking_attempt` - User tries to book service
- `booking_completed` - Booking confirmed by therapist
- `chat_started` - Chat session initiated
- `chat_message_sent` - Message sent in chat
- `search_performed` - User searches for services
- `user_registered` - New user signs up
- `login_attempt` - User tries to log in
- `error_occurred` - Application error
- `notification_sent` - Push notification delivered

### Metadata Examples

```typescript
// Booking event metadata
{
    therapistId: 'therapist123',
    serviceType: 'massage',
    duration: 90,
    totalPrice: 150000,
    location: 'Jakarta',
    paymentMethod: 'cash'
}

// Chat event metadata
{
    chatId: 'conversation456',
    participantType: 'customer',
    messageLength: 45,
    hasAttachment: false
}
```

---

## 🚨 Error Handling & Monitoring

### Error Tracking

All systems include comprehensive error handling:

```typescript
try {
    await performOperation();
} catch (error) {
    // Analytics automatically tracks errors
    analyticsService.trackError(error, 'operation_context');
    
    // Health monitoring logs system errors
    // Backups continue despite individual failures
}
```

### Graceful Degradation

- **Analytics failures** → Don't break app functionality
- **Health check timeouts** → Mark services as degraded
- **Backup errors** → Continue with remaining collections

---

## 🔒 Security & Permissions

### Collection Permissions

```javascript
// Analytics - Public read, admin write
Permission.read(Role.any())
Permission.create(Role.any())
Permission.update(Role.label('admin'))
Permission.delete(Role.label('admin'))

// Health & Backup - Admin only
Permission.read(Role.label('admin'))
Permission.create(Role.label('admin'))
Permission.update(Role.label('admin'))
Permission.delete(Role.label('admin'))
```

### Data Privacy

- User analytics respect privacy settings
- Sensitive data excluded from analytics
- Geographic data requires user consent
- Personal information anonymized in logs

---

## 📊 Performance Impact

### Optimizations
- **Async tracking** - Never blocks user interactions  
- **Batched writes** - Reduces database calls
- **Smart caching** - Prevents duplicate events
- **Rate limiting** - Prevents spam tracking

### Resource Usage
- **Analytics**: ~1KB per event, minimal CPU
- **Health checks**: Run every 10 minutes, 5-10 seconds duration
- **Backups**: Scheduled during low-traffic hours

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Advanced Analytics**
   - User journey mapping
   - Conversion funnel analysis
   - A/B testing framework

2. **Enhanced Monitoring** 
   - External service monitoring
   - Performance alerting
   - Custom health checks

3. **Backup Improvements**
   - Cloud storage integration
   - Encrypted backups
   - Automated testing

### Custom Integrations

```typescript
// Add custom analytics events
analyticsService.trackEvent('custom_event', {
    feature: 'special_promotion',
    value: promotionValue,
    timestamp: new Date().toISOString()
});

// Custom health checks
healthMonitoringService.addCustomCheck({
    name: 'Payment Gateway',
    check: async () => await testPaymentConnection(),
    critical: true
});
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Collections not created** → Run `setupAnalyticsCollections.mjs`
2. **Permission errors** → Check Appwrite collection permissions
3. **High error rates** → Review health monitoring alerts
4. **Missing analytics** → Verify service imports

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('analytics_debug', 'true');
localStorage.setItem('health_debug', 'true');
localStorage.setItem('backup_debug', 'true');
```

### Health Check Endpoint

```typescript
// Quick system health check
GET /api/health
// Returns: { status: 'healthy', timestamp, checks: [...] }
```

---

## ✅ Implementation Checklist

- [x] ✅ Analytics service created and integrated
- [x] ✅ Health monitoring system operational  
- [x] ✅ Automated backup system configured
- [x] ✅ Database collections setup script ready
- [x] ✅ React hooks for easy component integration
- [x] ✅ System dashboard for admin monitoring
- [x] ✅ Analytics tracking added to booking flow
- [x] ✅ Analytics tracking added to chat system
- [x] ✅ Error tracking integrated throughout
- [x] ✅ Documentation and usage examples provided

**🎉 Your system is now production-ready with comprehensive analytics, monitoring, and backup capabilities!**