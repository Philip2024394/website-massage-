/**
 * ORDER NOW BOOKING METRICS COLLECTOR
 * 
 * Run this in browser console to automatically collect booking test metrics.
 * This script intercepts console.log calls with [ORDER_NOW_MONITOR] pattern
 * and aggregates statistics for easy reporting.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Paste and run this entire script
 * 3. Click "Order Now" button multiple times
 * 4. Type `getBookingReport()` to see summary
 * 5. Type `exportBookingReport()` to download JSON
 */

(function() {
  // Metrics storage
  window.bookingMetrics = {
    attempts: [],
    startTime: Date.now(),
    totalAttempts: 0,
    successfulBookings: 0,
    failedBookings: 0,
    
    // Track current booking attempt
    currentAttempt: null,
  };

  // Intercept console.log to capture ORDER_NOW_MONITOR logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = function(...args) {
    captureLog('log', args);
    originalLog.apply(console, args);
  };

  console.error = function(...args) {
    captureLog('error', args);
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    captureLog('warn', args);
    originalWarn.apply(console, args);
  };

  function captureLog(level, args) {
    const message = args.join(' ');
    
    // Detect booking attempt start
    if (message.includes('[ORDER_NOW_MONITOR] Booking attempt #') && message.includes('start:')) {
      const attemptMatch = message.match(/attempt #(\d+)/);
      const timestampMatch = message.match(/start: (.+)$/);
      
      if (attemptMatch && timestampMatch) {
        const attemptNum = parseInt(attemptMatch[1]);
        const timestamp = timestampMatch[1];
        
        if (attemptNum === 1) {
          // New booking session
          window.bookingMetrics.currentAttempt = {
            sessionId: Date.now(),
            startTime: new Date(timestamp).getTime(),
            attempts: [],
            finalResult: null,
          };
          window.bookingMetrics.totalAttempts++;
        }
        
        if (window.bookingMetrics.currentAttempt) {
          window.bookingMetrics.currentAttempt.attempts.push({
            attemptNumber: attemptNum,
            startTime: new Date(timestamp).getTime(),
            status: 'pending',
          });
        }
      }
    }
    
    // Detect booking attempt success
    if (message.includes('[ORDER_NOW_MONITOR] Booking attempt #') && message.includes('SUCCESS')) {
      const attemptMatch = message.match(/attempt #(\d+)/);
      const durationMatch = message.match(/Duration: (\d+)ms/);
      
      if (attemptMatch && durationMatch && window.bookingMetrics.currentAttempt) {
        const attemptNum = parseInt(attemptMatch[1]);
        const duration = parseInt(durationMatch[1]);
        
        const attempt = window.bookingMetrics.currentAttempt.attempts.find(
          a => a.attemptNumber === attemptNum
        );
        
        if (attempt) {
          attempt.status = 'success';
          attempt.duration = duration;
        }
      }
    }
    
    // Detect booking attempt failure
    if (message.includes('[ORDER_NOW_MONITOR] Booking attempt #') && message.includes('FAILED')) {
      const attemptMatch = message.match(/attempt #(\d+)/);
      const durationMatch = message.match(/Duration: (\d+)ms/);
      const errorMatch = message.match(/Error: (.+)$/);
      
      if (attemptMatch && durationMatch && window.bookingMetrics.currentAttempt) {
        const attemptNum = parseInt(attemptMatch[1]);
        const duration = parseInt(durationMatch[1]);
        const error = errorMatch ? errorMatch[1] : 'Unknown error';
        
        const attempt = window.bookingMetrics.currentAttempt.attempts.find(
          a => a.attemptNumber === attemptNum
        );
        
        if (attempt) {
          attempt.status = 'failed';
          attempt.duration = duration;
          attempt.error = error;
        }
      }
    }
    
    // Detect final booking result
    if (message.includes('[ORDER_NOW_MONITOR] Booking operation completed:')) {
      if (window.bookingMetrics.currentAttempt) {
        const successMatch = message.match(/success: (true|false)/);
        const attemptsMatch = message.match(/attempts: (\d+)/);
        const durationMatch = message.match(/duration: (\d+)/);
        const bookingIdMatch = message.match(/bookingId: ['"]?([^,'"}\]]+)/);
        
        const success = successMatch && successMatch[1] === 'true';
        const totalAttempts = attemptsMatch ? parseInt(attemptsMatch[1]) : 0;
        const totalDuration = durationMatch ? parseInt(durationMatch[1]) : 0;
        const bookingId = bookingIdMatch ? bookingIdMatch[1] : 'unknown';
        
        window.bookingMetrics.currentAttempt.finalResult = {
          success,
          totalAttempts,
          totalDuration,
          bookingId,
          timestamp: Date.now(),
        };
        
        if (success) {
          window.bookingMetrics.successfulBookings++;
        } else {
          window.bookingMetrics.failedBookings++;
        }
        
        // Save completed attempt
        window.bookingMetrics.attempts.push({
          ...window.bookingMetrics.currentAttempt,
        });
        
        window.bookingMetrics.currentAttempt = null;
      }
    }
  }

  // Generate report summary
  window.getBookingReport = function() {
    const metrics = window.bookingMetrics;
    const successfulAttempts = metrics.attempts.filter(a => a.finalResult?.success);
    const failedAttempts = metrics.attempts.filter(a => !a.finalResult?.success);
    
    const durations = successfulAttempts.map(a => a.finalResult.totalDuration);
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    
    const retries = successfulAttempts.filter(a => a.finalResult.totalAttempts > 1).length;
    const timeouts = failedAttempts.filter(a => 
      a.attempts.some(att => att.error?.includes('timeout'))
    ).length;
    
    const successRate = metrics.totalAttempts > 0
      ? Math.round((metrics.successfulBookings / metrics.totalAttempts) * 100)
      : 0;
    
    const report = `
╔════════════════════════════════════════════════════════════════╗
║           ORDER NOW BOOKING TEST REPORT SUMMARY                ║
╚════════════════════════════════════════════════════════════════╝

📊 OVERVIEW
  Total Attempts:          ${metrics.totalAttempts}
  Successful Bookings:     ${metrics.successfulBookings}
  Failed Bookings:         ${metrics.failedBookings}
  Success Rate:            ${successRate}%

⏱️  PERFORMANCE
  Average Response Time:   ${avgDuration}ms
  Fastest Booking:         ${minDuration}ms
  Slowest Booking:         ${maxDuration}ms

🔄 RELIABILITY
  Retries Triggered:       ${retries}
  Timeouts:                ${timeouts}

✅ SUCCESSFUL BOOKINGS
${successfulAttempts.map((a, i) => `
  ${i + 1}. Booking ID: ${a.finalResult.bookingId}
     Duration: ${a.finalResult.totalDuration}ms
     Attempts: ${a.finalResult.totalAttempts}
     Timestamp: ${new Date(a.finalResult.timestamp).toISOString()}
`).join('')}

❌ FAILED BOOKINGS
${failedAttempts.map((a, i) => `
  ${i + 1}. Reason: ${a.attempts[a.attempts.length - 1]?.error || 'Unknown'}
     Attempts: ${a.attempts.length}
     Total Duration: ${a.attempts.reduce((sum, att) => sum + (att.duration || 0), 0)}ms
`).join('')}

📈 RESPONSE TIME DISTRIBUTION
  < 1000ms:  ${durations.filter(d => d < 1000).length} bookings (${Math.round(durations.filter(d => d < 1000).length / durations.length * 100) || 0}%)
  1-2000ms:  ${durations.filter(d => d >= 1000 && d < 2000).length} bookings (${Math.round(durations.filter(d => d >= 1000 && d < 2000).length / durations.length * 100) || 0}%)
  2-5000ms:  ${durations.filter(d => d >= 2000 && d < 5000).length} bookings (${Math.round(durations.filter(d => d >= 2000 && d < 5000).length / durations.length * 100) || 0}%)
  > 5000ms:  ${durations.filter(d => d >= 5000).length} bookings (${Math.round(durations.filter(d => d >= 5000).length / durations.length * 100) || 0}%)

💡 RECOMMENDATIONS
${successRate < 95 ? '  ⚠️  Success rate below 95% target - investigate failures' : '  ✅ Success rate meets target'}
${avgDuration > 3000 ? '  ⚠️  Average response time above 3s target - consider optimization' : '  ✅ Response time within target'}
${retries > metrics.successfulBookings * 0.3 ? '  ⚠️  High retry rate - check network stability' : '  ✅ Retry rate acceptable'}
${timeouts > 0 ? '  ⚠️  Timeouts detected - may need to increase timeout threshold' : '  ✅ No timeouts detected'}

🔍 To see detailed data, run: exportBookingReport()
`;
    
    console.log(report);
    return metrics;
  };

  // Export report as JSON
  window.exportBookingReport = function() {
    const report = {
      testDate: new Date().toISOString(),
      testDuration: Date.now() - window.bookingMetrics.startTime,
      summary: {
        totalAttempts: window.bookingMetrics.totalAttempts,
        successfulBookings: window.bookingMetrics.successfulBookings,
        failedBookings: window.bookingMetrics.failedBookings,
        successRate: Math.round((window.bookingMetrics.successfulBookings / window.bookingMetrics.totalAttempts) * 100) || 0,
      },
      attempts: window.bookingMetrics.attempts,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Report exported as JSON file');
    return report;
  };

  // Reset metrics
  window.resetBookingMetrics = function() {
    window.bookingMetrics = {
      attempts: [],
      startTime: Date.now(),
      totalAttempts: 0,
      successfulBookings: 0,
      failedBookings: 0,
      currentAttempt: null,
    };
    console.log('✅ Metrics reset - ready for new test session');
  };

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║      ORDER NOW BOOKING METRICS COLLECTOR - INITIALIZED         ║
╚════════════════════════════════════════════════════════════════╝

📋 Available Commands:
  • getBookingReport()        - Display summary report
  • exportBookingReport()      - Download JSON report
  • resetBookingMetrics()      - Clear metrics and start fresh

🎯 Instructions:
  1. Click "Order Now" button multiple times to test
  2. Watch the console for [ORDER_NOW_MONITOR] logs
  3. Run getBookingReport() to see statistics
  4. Run exportBookingReport() to save data

✨ Metrics collection is now active!
  `);
})();
