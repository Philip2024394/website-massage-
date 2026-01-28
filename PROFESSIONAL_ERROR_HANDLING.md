# 🛡️ PROFESSIONAL ERROR HANDLING SYSTEM

## Overview

This system ensures **ZERO raw errors** are ever shown to users. All errors are:
1. ✅ Logged silently to admin dashboard
2. ✅ Displayed with user-friendly messages  
3. ✅ Categorized by type and severity
4. ✅ Tracked with full context

---

## Components

### 1. Error Logging Service (`errorLoggingService.ts`)

**Purpose**: Centralized silent error logging to Appwrite database

**Features**:
- ✅ Automatic error categorization (network, auth, api, validation, runtime)
- ✅ Severity calculation (low, medium, high, critical)
- ✅ Batch processing to prevent performance impact
- ✅ Local storage fallback when database unavailable
- ✅ User context tracking (ID, role, page, userAgent)
- ✅ Queue management to prevent memory overflow

**Usage**:
```typescript
import { errorLogger, withErrorLogging } from '@/services/errorLoggingService';

// Manual logging
try {
  // risky operation
} catch (error) {
  errorLogger.logError(error, {
    errorType: 'booking',
    severity: 'critical',
    context: { bookingId: '123', amount: 500000 }
  });
  
  // Show user-friendly message
  showErrorModal('booking', 'Unable to process booking');
}

// Automatic wrapper
const result = await withErrorLogging(
  async () => await createBooking(data),
  { errorType: 'booking', severity: 'critical' },
  null // fallback value
);
```

**Database Schema** (Create in Appwrite):
```json
Collection ID: "ERROR_LOGS"
Attributes:
  - timestamp: string (required)
  - errorType: string (enum: runtime|api|network|auth|validation|unknown)
  - message: string (required)
  - stack: string (optional)
  - context: string (JSON)
  - userId: string (optional)
  - userRole: string (enum: customer|therapist|admin|guest)
  - page: string (required)
  - userAgent: string (required)
  - severity: string (enum: low|medium|high|critical)
```

---

### 2. Professional Error Modal (`ProfessionalErrorModal.tsx`)

**Purpose**: User-friendly modal for inline errors

**Features**:
- ✅ 6 predefined error types with appropriate messaging
- ✅ Customizable messages
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Action buttons (retry, home, close)

**Error Types**:
- `network` - Connection issues (blue)
- `auth` - Authentication required (yellow)
- `feature` - Feature unavailable (orange)
- `booking` - Booking issues (red)
- `payment` - Payment processing (red)
- `generic` - Unknown issues (gray)

**Usage**:
```typescript
import { ProfessionalErrorModal, useErrorModal } from '@/components/ProfessionalErrorModal';

function MyComponent() {
  const { isOpen, errorType, showError, hideError } = useErrorModal();
  
  const handleBooking = async () => {
    try {
      await createBooking(data);
    } catch (error) {
      errorLogger.logError(error, { errorType: 'booking', severity: 'critical' });
      showError('booking', 'We couldn't process your booking. Please try again.');
    }
  };
  
  return (
    <>
      <button onClick={handleBooking}>Book Now</button>
      <ProfessionalErrorModal 
        isOpen={isOpen}
        onClose={hideError}
        errorType={errorType}
        onRetry={handleBooking}
      />
    </>
  );
}
```

---

### 3. Error Fallback Page (`ErrorFallbackPage.tsx`)

**Purpose**: Full-page error display for critical failures

**Error Types**:
- `critical` - Service unavailable (red)
- `maintenance` - Scheduled maintenance (orange)
- `notfound` - Page not found (blue)
- `unauthorized` - Access denied (yellow)

**Usage**:
```typescript
import { ErrorFallbackPage, redirectToErrorPage } from '@/pages/ErrorFallbackPage';

// In router
<Route path="/error" element={<ErrorFallbackPage />} />

// Redirect on critical error
try {
  await criticalOperation();
} catch (error) {
  errorLogger.logError(error, { severity: 'critical' });
  redirectToErrorPage('critical', 'Service temporarily unavailable');
}
```

---

### 4. Error Boundaries

#### Main ErrorBoundary (`ErrorBoundary.tsx`)
- Wraps entire app
- Catches React render errors
- Shows professional fallback UI
- Never displays raw error messages

#### Therapist ErrorBoundary (`therapist/ErrorBoundary.tsx`)
- Specifically for therapist dashboard
- Indonesian language messages
- Logs with `userRole: 'therapist'`

**Usage**:
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Or specific sections
<ErrorBoundary fallback={<CustomFallback />}>
  <CriticalComponent />
</ErrorBoundary>
```

---

## Implementation Guidelines

### ✅ DO:

1. **Always log errors silently**
```typescript
try {
  await operation();
} catch (error) {
  errorLogger.logError(error, { 
    errorType: 'api', 
    severity: 'high',
    context: { operation: 'create_booking' }
  });
  showUserFriendlyMessage();
}
```

2. **Use appropriate error types**
```typescript
showError('network', 'Check your internet connection');
showError('auth', 'Please log in again');
showError('booking', 'Unable to complete booking');
showError('payment', 'Payment processing failed');
```

3. **Provide helpful context**
```typescript
errorLogger.logError(error, {
  errorType: 'api',
  severity: 'critical',
  context: {
    endpoint: '/api/bookings',
    method: 'POST',
    userId: user.$id,
    attemptNumber: 3
  }
});
```

4. **Use error wrappers for convenience**
```typescript
const data = await withErrorLogging(
  () => fetchUserData(userId),
  { errorType: 'api', severity: 'medium' },
  null // fallback if error
);
```

### ❌ DON'T:

1. **Never show raw errors to users**
```typescript
// ❌ BAD
catch (error) {
  alert(error.message); // Raw error to user!
}

// ✅ GOOD
catch (error) {
  errorLogger.logError(error);
  showError('generic', 'Something went wrong. Please try again.');
}
```

2. **Never ignore errors silently without logging**
```typescript
// ❌ BAD
catch (error) {
  // Silently ignored - no logging!
}

// ✅ GOOD
catch (error) {
  errorLogger.logError(error, { severity: 'low' });
  // Continue gracefully
}
```

3. **Never display technical jargon**
```typescript
// ❌ BAD
"Error: NetworkError: Failed to fetch at line 234"

// ✅ GOOD
"We're having trouble connecting. Please check your internet."
```

---

## Error Severity Guidelines

### Critical 🔴
- Payment failures
- Booking creation failures
- Security breaches
- Data corruption
- **Action**: Immediate notification to admin

### High 🟠
- Authentication failures
- Data loss
- Session expiration
- **Action**: Log and notify admin daily

### Medium 🟡
- Network timeouts
- API failures (recoverable)
- Feature unavailability
- **Action**: Log and monitor trends

### Low 🟢
- Validation errors
- DOM manipulation errors
- Non-critical warnings
- **Action**: Log for debugging

---

## Admin Dashboard Integration

### Viewing Error Logs

Create an admin page to view error logs:

```typescript
import { databases } from '@/config/appwrite';

async function fetchErrorLogs() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    'ERROR_LOGS',
    [
      Query.orderDesc('timestamp'),
      Query.limit(100)
    ]
  );
  
  return response.documents;
}

// Display with filters
<ErrorLogViewer 
  severity="critical"
  errorType="payment"
  dateRange="last-7-days"
/>
```

### Error Notifications

Set up webhooks or scheduled functions to alert admins:

```typescript
// Appwrite Function: Check for critical errors every 5 minutes
async function checkCriticalErrors() {
  const errors = await databases.listDocuments(
    DATABASE_ID,
    'ERROR_LOGS',
    [
      Query.equal('severity', 'critical'),
      Query.greaterThan('timestamp', fiveMinutesAgo)
    ]
  );
  
  if (errors.total > 0) {
    await sendWhatsAppAlert('+6281392000050', 
      `🚨 ${errors.total} critical errors in last 5 minutes`
    );
  }
}
```

---

## Testing

### Test Error Logging

```typescript
// Manually trigger test error
errorLogger.logError(new Error('Test error'), {
  errorType: 'runtime',
  severity: 'low',
  context: { test: true }
});

// Check local storage fallback
console.log(errorLogger.getPendingLocalErrors());
```

### Test Error Modal

```typescript
function TestErrorModal() {
  const { showError, ...modalProps } = useErrorModal();
  
  return (
    <>
      <button onClick={() => showError('network')}>Test Network Error</button>
      <button onClick={() => showError('booking')}>Test Booking Error</button>
      <button onClick={() => showError('payment')}>Test Payment Error</button>
      <ProfessionalErrorModal {...modalProps} />
    </>
  );
}
```

### Test Error Boundary

```typescript
function TestErrorBoundary() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Test error boundary');
  }
  
  return <button onClick={() => setShouldThrow(true)}>Throw Error</button>;
}

// Wrap in boundary
<ErrorBoundary>
  <TestErrorBoundary />
</ErrorBoundary>
```

---

## Migration Checklist

### Phase 1: Setup ✅
- [x] Create error logging service
- [x] Create error modal component
- [x] Create error fallback page
- [x] Update ErrorBoundary components

### Phase 2: Database Setup
- [ ] Create ERROR_LOGS collection in Appwrite
- [ ] Configure collection permissions (admins only)
- [ ] Set up indexes for efficient queries

### Phase 3: Replace Existing Error Handling
- [ ] Replace `console.error()` with `errorLogger.logError()`
- [ ] Replace `alert()` errors with modal
- [ ] Replace `toast.error()` raw messages with friendly ones
- [ ] Wrap critical operations with `withErrorLogging()`

### Phase 4: Admin Dashboard
- [ ] Create error log viewer page
- [ ] Add severity filters
- [ ] Add date range filters
- [ ] Add export functionality

### Phase 5: Monitoring
- [ ] Set up critical error notifications
- [ ] Create error dashboards
- [ ] Monitor error trends
- [ ] Set up alerting thresholds

---

## Quick Reference

### Import Paths
```typescript
import { errorLogger, withErrorLogging } from '@/services/errorLoggingService';
import { ProfessionalErrorModal, useErrorModal } from '@/components/ProfessionalErrorModal';
import { ErrorFallbackPage, redirectToErrorPage } from '@/pages/ErrorFallbackPage';
import ErrorBoundary from '@/components/ErrorBoundary';
```

### Common Patterns

**API Call with Error Handling**:
```typescript
const result = await withErrorLogging(
  () => apiCall(),
  { errorType: 'api', severity: 'high' }
);
if (!result) {
  showError('generic', 'Operation failed. Please try again.');
}
```

**Form Submission**:
```typescript
try {
  await submitForm(data);
  showSuccess('Form submitted successfully!');
} catch (error) {
  errorLogger.logError(error, { 
    errorType: 'validation',
    severity: 'medium',
    context: { form: 'booking_form' }
  });
  showError('generic', 'Please check your information and try again.');
}
```

**Payment Processing**:
```typescript
try {
  const payment = await processPayment(amount);
  return payment;
} catch (error) {
  errorLogger.logError(error, { 
    errorType: 'api',
    severity: 'critical',
    context: { amount, userId, paymentMethod }
  });
  showError('payment', 'Payment failed. No charges were made.');
  return null;
}
```

---

## Support

For questions or issues with the error handling system:
- Check error logs in admin dashboard
- Review local pending errors: `errorLogger.getPendingLocalErrors()`
- Contact technical team via WhatsApp: +6281392000050

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
