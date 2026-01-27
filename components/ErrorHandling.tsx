/**
 * Production-grade error handling system for booking chat
 * Provides comprehensive error boundaries, fallbacks, and user-friendly messages
 */

import React, { Component, ReactNode, useState, useEffect } from 'react'
import { BookingError, BookingErrorCode } from '../src/types/booking.types'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * React Error Boundary for catching unhandled errors
 */
export class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Chat Error Boundary caught error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)
  }

  private logError(error: Error, errorInfo: any) {
    try {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
      
      console.error('📊 Error Report:', errorReport)
      
    } catch (reportingError) {
      console.error('❌ Failed to log error:', reportingError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 mb-4">
              We're experiencing a technical issue. Please try again.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={async () => {
                  try {
                    const { softRecover } = await import('../utils/softNavigation');
                    softRecover();
                  } catch {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for handling booking errors with user-friendly messages
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showError = (error: string | Error | BookingError) => {
    let message: string

    if (error instanceof BookingError) {
      message = getBookingErrorMessage(error)
    } else if (error instanceof Error) {
      message = error.message || 'An unexpected error occurred'
    } else {
      message = error
    }

    console.error('🚨 Error:', message)
    setError(message)
    setIsVisible(true)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 10000)
  }

  const clearError = () => {
    setError(null)
    setIsVisible(false)
  }

  return {
    error,
    isVisible,
    showError,
    clearError
  }
}

/**
 * Convert BookingError to user-friendly message
 */
function getBookingErrorMessage(error: BookingError): string {
  switch (error.code) {
    case BookingErrorCode.INVALID_INPUT:
      return 'Please check your information and try again.'
    
    case BookingErrorCode.THERAPIST_NOT_FOUND:
      return 'No therapists are available right now. Please try again in a few minutes.'
    
    case BookingErrorCode.BOOKING_CANCELLED:
      return 'Your booking has been cancelled.'
    
    case BookingErrorCode.SEARCH_TIMEOUT:
      return 'Search is taking longer than expected. We\'ll keep trying to find a therapist for you.'
    
    case BookingErrorCode.PERMISSION_DENIED:
      return 'You don\'t have permission to perform this action.'
    
    case BookingErrorCode.SERVICE_UNAVAILABLE:
      return 'The booking service is temporarily unavailable. Please try again later.'
    
    case BookingErrorCode.NETWORK_ERROR:
      return 'Connection issue. Please check your internet and try again.'
    
    default:
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Network status hook for handling connectivity issues
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionQuality('fast')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionQuality('offline')
    }

    // Monitor connection changes
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const updateConnectionQuality = () => {
        if (!navigator.onLine) {
          setConnectionQuality('offline')
        } else if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setConnectionQuality('slow')
        } else {
          setConnectionQuality('fast')
        }
      }

      connection.addEventListener('change', updateConnectionQuality)
      updateConnectionQuality()

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', updateConnectionQuality)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    connectionQuality,
    isConnected: isOnline && connectionQuality !== 'offline'
  }
}

/**
 * Retry mechanism hook with exponential backoff
 */
export const useRetry = (maxAttempts = 3, initialDelay = 1000) => {
  const [attempts, setAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // ✅ FIX: Use function declaration to avoid JSX generic syntax errors
  async function retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        setAttempts(attempt)
        
        if (attempt > 0) {
          setIsRetrying(true)
          const delay = initialDelay * Math.pow(2, attempt - 1)
          console.log(`🔄 Retrying operation (attempt ${attempt}/${maxAttempts}) after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const result = await operation()
        setIsRetrying(false)
        setAttempts(0)
        return result

      } catch (error) {
        lastError = error as Error
        console.warn(`❌ Attempt ${attempt + 1} failed:`, error)
        
        if (attempt === maxAttempts) {
          setIsRetrying(false)
          setAttempts(0)
          throw lastError
        }
      }
    }

    setIsRetrying(false)
    setAttempts(0)
    throw lastError!
  }

  const reset = () => {
    setAttempts(0)
    setIsRetrying(false)
  }

  return {
    retry,
    attempts,
    isRetrying,
    reset,
    canRetry: attempts < maxAttempts
  }
}

/**
 * Error display component
 */
interface ErrorDisplayProps {
  error: string | null
  isVisible: boolean
  onClose: () => void
  onRetry?: () => void
  className?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  isVisible,
  onClose,
  onRetry,
  className = ''
}) => {
  if (!error || !isVisible) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm text-red-800">{error}</div>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Network status indicator
 */
export const NetworkIndicator: React.FC = () => {
  const { isOnline, connectionQuality } = useNetworkStatus()

  if (isOnline && connectionQuality === 'fast') return null

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium ${
      !isOnline 
        ? 'bg-red-100 text-red-800'
        : connectionQuality === 'slow'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        !isOnline 
          ? 'bg-red-500'
          : connectionQuality === 'slow'
            ? 'bg-yellow-500 animate-pulse'
            : 'bg-gray-500'
      }`} />
      {!isOnline 
        ? 'Offline'
        : connectionQuality === 'slow'
          ? 'Slow connection'
          : 'Connected'
      }
    </div>
  )
}

/**
 * Graceful degradation wrapper for API failures
 */
interface FallbackWrapperProps {
  children: ReactNode
  fallback: ReactNode
  condition: boolean
}

export const FallbackWrapper: React.FC<FallbackWrapperProps> = ({
  children,
  fallback,
  condition
}) => {
  return condition ? <>{children}</> : <>{fallback}</>
}