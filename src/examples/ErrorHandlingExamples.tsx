/**
 * 📚 ERROR HANDLING EXAMPLES
 * 
 * This file demonstrates how to implement professional error handling
 * throughout the application. Copy these patterns to replace existing
 * error displays.
 */

import React, { useState } from 'react';
import { errorLogger, withErrorLogging } from '../services/errorLoggingService';
import { ProfessionalErrorModal, useErrorModal } from '../components/ProfessionalErrorModal';
import { redirectToErrorPage } from '../pages/ErrorFallbackPage';

// =============================================================================
// EXAMPLE 1: Booking Creation with Error Handling
// =============================================================================

export function BookingExample() {
  const { isOpen, errorType, showError, hideError } = useErrorModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBooking = async (bookingData: any) => {
    setIsLoading(true);
    
    try {
      // Attempt booking creation
      const booking = await createBooking(bookingData);
      
      // Success - show confirmation
      alert('Booking created successfully!'); // Replace with proper success modal
      return booking;
      
    } catch (error) {
      // Log error silently to admin dashboard
      await errorLogger.logError(error as Error, {
        errorType: 'api',
        severity: 'critical',
        context: {
          operation: 'create_booking',
          therapistId: bookingData.therapistId,
          serviceId: bookingData.serviceId,
          totalAmount: bookingData.totalAmount
        }
      });
      
      // Show user-friendly error
      showError('booking', 'We couldn't process your booking at this time. Please try again in a moment.');
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => handleCreateBooking({})}>Create Booking</button>
      
      {/* Professional error modal */}
      <ProfessionalErrorModal
        isOpen={isOpen}
        onClose={hideError}
        errorType={errorType}
        onRetry={() => handleCreateBooking({})}
        showHomeButton={true}
      />
    </>
  );
}

// =============================================================================
// EXAMPLE 2: Payment Processing with Error Handling
// =============================================================================

export function PaymentExample() {
  const { showError, ...modalProps } = useErrorModal();

  const processPayment = async (amount: number, method: string) => {
    try {
      const result = await fetch('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ amount, method })
      });

      if (!result.ok) {
        throw new Error('Payment failed');
      }

      const payment = await result.json();
      return payment;

    } catch (error) {
      // Critical: Payment failure
      await errorLogger.logError(error as Error, {
        errorType: 'api',
        severity: 'critical',
        context: {
          amount,
          paymentMethod: method,
          endpoint: '/api/payments'
        }
      });

      // Show professional error - reassure user
      showError(
        'payment',
        'We encountered an issue processing your payment. Don't worry - no charges were made. Please try again or contact support.'
      );

      return null;
    }
  };

  return (
    <>
      <button onClick={() => processPayment(500000, 'transfer')}>
        Pay Now
      </button>
      <ProfessionalErrorModal {...modalProps} />
    </>
  );
}

// =============================================================================
// EXAMPLE 3: Authentication Error Handling
// =============================================================================

export function AuthExample() {
  const { showError, ...modalProps } = useErrorModal();

  const handleLogin = async (email: string, password: string) => {
    try {
      const session = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!session.ok) {
        throw new Error('Authentication failed');
      }

      return await session.json();

    } catch (error) {
      // Log authentication failure
      await errorLogger.logError(error as Error, {
        errorType: 'auth',
        severity: 'high',
        context: {
          email, // Don't log password!
          endpoint: '/api/auth/login'
        }
      });

      // User-friendly auth error
      showError(
        'auth',
        'Invalid email or password. Please try again or reset your password.'
      );
    }
  };

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleLogin(
          formData.get('email') as string,
          formData.get('password') as string
        );
      }}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <ProfessionalErrorModal {...modalProps} />
    </>
  );
}

// =============================================================================
// EXAMPLE 4: Network Error with Retry
// =============================================================================

export function NetworkExample() {
  const { showError, ...modalProps } = useErrorModal();
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();

    } catch (error) {
      // Network error - medium severity (recoverable)
      await errorLogger.logError(error as Error, {
        errorType: 'network',
        severity: 'medium',
        context: {
          endpoint: '/api/data',
          retryCount
        }
      });

      // Show network error with retry option
      showError(
        'network',
        'We're having trouble connecting to our servers. Please check your internet connection.'
      );
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  return (
    <>
      <button onClick={fetchData}>Load Data</button>
      <ProfessionalErrorModal 
        {...modalProps}
        onRetry={handleRetry}
        showRefreshButton={true}
      />
    </>
  );
}

// =============================================================================
// EXAMPLE 5: Feature Unavailable (Graceful Degradation)
// =============================================================================

export function FeatureExample() {
  const { showError, ...modalProps } = useErrorModal();

  const handleFeatureClick = () => {
    // Log that user attempted to access unavailable feature
    errorLogger.logError(new Error('Feature temporarily disabled'), {
      errorType: 'runtime',
      severity: 'low',
      context: {
        feature: 'advanced_analytics',
        reason: 'under_maintenance'
      }
    });

    // Show friendly message
    showError(
      'feature',
      'This feature is currently being updated. We'll have it back up shortly!'
    );
  };

  return (
    <>
      <button onClick={handleFeatureClick}>Advanced Analytics</button>
      <ProfessionalErrorModal {...modalProps} />
    </>
  );
}

// =============================================================================
// EXAMPLE 6: Form Validation Error
// =============================================================================

export function ValidationExample() {
  const { showError, ...modalProps } = useErrorModal();

  const handleSubmit = async (formData: any) => {
    // Validation check
    if (!formData.phone || formData.phone.length < 10) {
      // Log validation error (low severity)
      await errorLogger.logError(new Error('Invalid phone number'), {
        errorType: 'validation',
        severity: 'low',
        context: {
          field: 'phone',
          value: formData.phone,
          form: 'registration'
        }
      });

      // Show specific validation message
      showError(
        'generic',
        'Please enter a valid phone number (minimum 10 digits).'
      );
      return;
    }

    // Continue with submission...
  };

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({});
      }}>
        <input name="phone" placeholder="Phone Number" />
        <button type="submit">Submit</button>
      </form>
      <ProfessionalErrorModal {...modalProps} />
    </>
  );
}

// =============================================================================
// EXAMPLE 7: Critical Error with Page Redirect
// =============================================================================

export function CriticalErrorExample() {
  const handleCriticalOperation = async () => {
    try {
      // Critical system operation
      const result = await criticalSystemCall();
      return result;

    } catch (error) {
      // Critical error - log and redirect to error page
      await errorLogger.logError(error as Error, {
        errorType: 'runtime',
        severity: 'critical',
        context: {
          operation: 'system_critical',
          timestamp: new Date().toISOString()
        }
      });

      // Redirect to full-page error
      redirectToErrorPage(
        'critical',
        'Service temporarily unavailable. Our team has been notified.'
      );
    }
  };

  return (
    <button onClick={handleCriticalOperation}>
      Critical Operation
    </button>
  );
}

// =============================================================================
// EXAMPLE 8: Using Error Wrapper (Convenience)
// =============================================================================

export function WrapperExample() {
  const [data, setData] = useState(null);

  const loadUserData = async (userId: string) => {
    // Automatically logs errors and returns fallback
    const userData = await withErrorLogging(
      () => fetch(`/api/users/${userId}`).then(r => r.json()),
      { 
        errorType: 'api', 
        severity: 'medium',
        context: { userId }
      },
      null // fallback value on error
    );

    setData(userData);
  };

  return (
    <button onClick={() => loadUserData('123')}>
      Load User
    </button>
  );
}

// =============================================================================
// EXAMPLE 9: Multiple Error Types in Single Component
// =============================================================================

export function ComprehensiveExample() {
  const { isOpen, errorType, customMessage, showError, hideError } = useErrorModal();
  const [operation, setOperation] = useState<'booking' | 'payment' | 'auth' | null>(null);

  const handleBooking = async () => {
    try {
      await createBooking({});
    } catch (error) {
      await errorLogger.logError(error as Error, { 
        errorType: 'api', 
        severity: 'critical' 
      });
      setOperation('booking');
      showError('booking');
    }
  };

  const handlePayment = async () => {
    try {
      await processPayment(500000);
    } catch (error) {
      await errorLogger.logError(error as Error, { 
        errorType: 'api', 
        severity: 'critical' 
      });
      setOperation('payment');
      showError('payment');
    }
  };

  const handleAuth = async () => {
    try {
      await authenticate();
    } catch (error) {
      await errorLogger.logError(error as Error, { 
        errorType: 'auth', 
        severity: 'high' 
      });
      setOperation('auth');
      showError('auth');
    }
  };

  const handleRetry = () => {
    if (operation === 'booking') handleBooking();
    if (operation === 'payment') handlePayment();
    if (operation === 'auth') handleAuth();
  };

  return (
    <>
      <button onClick={handleBooking}>Create Booking</button>
      <button onClick={handlePayment}>Make Payment</button>
      <button onClick={handleAuth}>Login</button>
      
      <ProfessionalErrorModal
        isOpen={isOpen}
        onClose={hideError}
        errorType={errorType}
        customMessage={customMessage}
        onRetry={handleRetry}
      />
    </>
  );
}

// =============================================================================
// Helper Functions (Mock - Replace with Real Implementations)
// =============================================================================

async function createBooking(data: any) {
  // Mock implementation
  return Promise.resolve({ id: '123' });
}

async function processPayment(amount: number) {
  // Mock implementation
  return Promise.resolve({ id: 'pay_123' });
}

async function authenticate() {
  // Mock implementation
  return Promise.resolve({ token: 'abc123' });
}

async function criticalSystemCall() {
  // Mock implementation
  return Promise.resolve({ success: true });
}
