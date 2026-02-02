# 🔍 Booking Flow Diagnostics Guide

## Overview
The booking flow diagnostic system tracks every step of the "Order Now" booking process to identify exactly where failures occur.

## How to Use

### 1. Reproduce the Issue
1. Open browser console (F12)
2. Navigate to a therapist profile
3. Click "Order Now" button
4. Fill in the booking form
5. Click "Order Now" to submit

### 2. Check the Diagnostic Output

The console will show detailed logs like:

```
═══════════════════════════════════════════
🔍 [BOOKING MONITOR] Session started: booking_1234567890_abc123
═══════════════════════════════════════════
Therapist ID: therapist_123
Customer ID: guest
Start time: 14:30:45

🔄 [CHECKPOINT] INITIALIZATION: started
✅ [CHECKPOINT] THERAPIST_VALIDATION: success
✅ [CHECKPOINT] FORM_VALIDATION: success  
🔄 [CHECKPOINT] BOOKING_CREATION: started
❌ [CHECKPOINT] BOOKING_CREATION: failed
  Error: Appwrite connection timeout
  
═══════════════════════════════════════════
❌ [BOOKING MONITOR] Session ended: FAILED
═══════════════════════════════════════════
Failure point: booking_creation
Failure reason: Appwrite connection timeout
```

### 3. Get Diagnostic Report

In the browser console, type:

```javascript
bookingFlowMonitor.getDiagnosticReport()
```

This will output a complete report of the current booking attempt.

### 4. Analyze Failure Patterns

To see patterns across multiple booking attempts:

```javascript
bookingFlowMonitor.analyzeFailurePatterns()
```

This shows:
- Total booking attempts
- Success vs failure rate
- Most common failure points
- Most common error messages

## Common Failure Points

### 1. **therapist_validation failed**
**Problem**: Therapist ID not set or lost
**Check**: 
- Is therapist selected before clicking Order Now?
- Check console for "therapist object:" log
- Verify therapist has both `id` and `$id` properties

**Fix**: Ensure therapist data is properly loaded before showing Order Now button

### 2. **booking_creation failed**
**Problem**: Appwrite connection or booking service error
**Check**:
- Network tab for failed API calls
- Appwrite project status
- Authentication session status
- Error message in checkpoint log

**Common Causes**:
- Appwrite service down
- Network timeout
- Missing authentication session
- Invalid booking data

### 3. **chat_step_transition failed**
**Problem**: Unable to switch from 'details' to 'chat' step
**Check**:
- Chat state before and after booking
- Any errors in setBookingStep call
- State management conflicts

### 4. **message_sending failed**
**Problem**: Cannot send initial message to therapist
**Check**:
- Chat infrastructure status
- Real-time connection status
- Message payload validity

## Debugging Commands

### Check Recent Sessions
```javascript
// Get last 10 booking attempts
const sessions = bookingFlowMonitor.getRecentSessions();
console.table(sessions.map(s => ({
  id: s.sessionId,
  therapist: s.therapistId,
  success: !s.failurePoint,
  failurePoint: s.failurePoint || 'N/A',
  duration: s.endTime ? `${s.endTime - s.startTime}ms` : 'In progress'
})));
```

### View Specific Session
```javascript
// Get detailed info about a specific session
const sessions = bookingFlowMonitor.getRecentSessions();
const lastSession = sessions[sessions.length - 1];
console.log('Checkpoints:', lastSession.checkpoints);
```

### Check Therapist ID Propagation
```javascript
// After selecting therapist, check if ID is available
console.log('Therapist ID:', window.chatState?.therapist?.id);
console.log('Therapist $id:', window.chatState?.therapist?.$id);
```

## Expected Successful Flow

A successful booking should have these checkpoints:

1. ✅ initialization - Session started
2. ✅ submit_handler_start - Form submitted
3. ✅ therapist_validation - Therapist ID confirmed
4. ✅ form_validation - Customer details validated
5. ✅ booking_creation - Appwrite booking created
6. ✅ chat_step_transition - Switched to chat view
7. ✅ booking_success - Complete

## If Redirect Occurs

If the app redirects to home page, check:

1. **Last successful checkpoint**: This tells you how far the booking got before failing
2. **Failure reason**: The error message at the failure point
3. **URL changes**: Check if URL changed during the booking flow
4. **Network errors**: Check Network tab for failed Appwrite API calls

## Reporting Issues

When reporting a booking failure, include:

1. Diagnostic report output from `bookingFlowMonitor.getDiagnosticReport()`
2. Console logs showing error messages
3. Network tab showing failed requests (if any)
4. Therapist ID and customer details (anonymized)
5. Exact steps to reproduce

## Advanced: Monitor in Real-Time

```javascript
// Set up real-time monitoring
setInterval(() => {
  const report = bookingFlowMonitor.getDiagnosticReport();
  if (report !== 'No active booking session') {
    console.clear();
    console.log(report);
  }
}, 1000);
```

This will update the console every second with the current booking progress.
