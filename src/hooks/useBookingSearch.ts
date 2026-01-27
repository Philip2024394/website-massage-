/**
 * Production-grade booking search hook with countdown timer and auto-retry
 * Handles therapist search lifecycle with proper state management
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  BookingStatus, 
  TherapistMatch, 
  SearchConfig, 
  BookingError, 
  BookingErrorCode 
} from '../types/booking.types'
import { bookingService } from '../services/booking.service'

interface UseBookingSearchProps {
  bookingId: string | null
  searchConfig: SearchConfig | null
  onTherapistFound: (therapist: TherapistMatch) => void
  onSearchFailed: (error: string) => void
  onSearchCancelled: () => void
}

interface BookingSearchState {
  isSearching: boolean
  countdown: number
  searchAttempt: number
  currentTherapist: TherapistMatch | null
  error: string | null
  searchId: string | null
}

/**
 * Custom hook for managing booking search with timer and auto-retry
 */
export const useBookingSearch = ({
  bookingId,
  searchConfig,
  onTherapistFound,
  onSearchFailed,
  onSearchCancelled
}: UseBookingSearchProps) => {
  
  const [state, setState] = useState<BookingSearchState>({
    isSearching: false,
    countdown: 0,
    searchAttempt: 0,
    currentTherapist: null,
    error: null,
    searchId: null
  })

  // Refs for cleanup and state management
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const searchPollingRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true) // Track if component is still mounted

  /**
   * Start therapist search with countdown timer
   */
  const startSearch = useCallback(async () => {
    if (!bookingId || !searchConfig) {
      console.error('❌ Cannot start search: missing bookingId or searchConfig')
      return
    }

    try {
      console.log('🔍 Starting therapist search...')

      // Reset state
      setState(prev => ({
        ...prev,
        isSearching: true,
        countdown: searchConfig.maxSearchTime,
        searchAttempt: prev.searchAttempt + 1,
        error: null,
        currentTherapist: null
      }))

      // Start search via API
      const { searchId } = await bookingService.startTherapistSearch(bookingId, searchConfig)
      
      if (!isActiveRef.current) return

      setState(prev => ({ ...prev, searchId }))

      // Start countdown timer
      startCountdownTimer(searchConfig.maxSearchTime)

      // Start polling for search results
      startSearchPolling(searchId)

    } catch (error) {
      console.error('❌ Search initiation failed:', error)
      
      if (!isActiveRef.current) return

      const errorMessage = error instanceof BookingError 
        ? error.message 
        : 'Failed to start search. Please try again.'
      
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }))

      onSearchFailed(errorMessage)
    }
  }, [bookingId, searchConfig, onSearchFailed])

  /**
   * Start countdown timer with auto-retry
   */
  const startCountdownTimer = useCallback((initialTime: number) => {
    let timeLeft = initialTime

    const updateCountdown = () => {
      if (!isActiveRef.current) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }
        return
      }

      setState(prev => ({ ...prev, countdown: timeLeft }))

      if (timeLeft <= 0) {
        console.log('⏰ Search timeout reached - will retry automatically')
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }
        
        // Auto-retry search
        setTimeout(() => {
          if (isActiveRef.current && state.isSearching) {
            retrySearch()
          }
        }, 1000)
        
        return
      }

      timeLeft--
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(updateCountdown, 1000)
    updateCountdown() // Initial call
  }, [state.isSearching])

  /**
   * Poll for search results
   */
  const startSearchPolling = useCallback((searchId: string) => {
    const pollInterval = 2000 // Poll every 2 seconds

    const poll = async () => {
      if (!isActiveRef.current || !state.isSearching) {
        if (searchPollingRef.current) {
          clearTimeout(searchPollingRef.current)
        }
        return
      }

      try {
        const result = await bookingService.checkSearchStatus(searchId, bookingId!)

        if (!isActiveRef.current) return

        if (result.success && result.therapist) {
          // Therapist found!
          console.log('✅ Therapist found:', result.therapist.name)
          
          stopAllTimers()
          
          setState(prev => ({
            ...prev,
            isSearching: false,
            currentTherapist: result.therapist!,
            error: null
          }))

          onTherapistFound(result.therapist)
          return
        }

        if (result.error) {
          console.warn('⚠️ Search polling error:', result.error)
        }

        // Continue polling
        searchPollingRef.current = setTimeout(poll, pollInterval)

      } catch (error) {
        console.error('❌ Search polling failed:', error)
        
        // Continue polling despite errors (network resilience)
        searchPollingRef.current = setTimeout(poll, pollInterval)
      }
    }

    // Start polling
    searchPollingRef.current = setTimeout(poll, pollInterval)
  }, [bookingId, state.isSearching, onTherapistFound])

  /**
   * Retry search automatically or manually
   */
  const retrySearch = useCallback(async () => {
    if (!searchConfig) return

    const maxAttempts = searchConfig.retryAttempts
    
    if (state.searchAttempt >= maxAttempts) {
      console.log('🛑 Maximum search attempts reached')
      
      stopAllTimers()
      
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: 'No therapists available at the moment. Please try again later.'
      }))

      onSearchFailed('Maximum search attempts reached. Please try again later.')
      return
    }

    console.log(`🔄 Retrying search (attempt ${state.searchAttempt + 1}/${maxAttempts})`)
    
    // Brief delay before retry
    setTimeout(() => {
      if (isActiveRef.current) {
        startSearch()
      }
    }, 2000)
  }, [searchConfig, state.searchAttempt, startSearch, onSearchFailed])

  /**
   * Cancel search and cleanup
   */
  const cancelSearch = useCallback(() => {
    console.log('🛑 Cancelling search...')
    
    stopAllTimers()
    
    // Cancel active searches via API
    bookingService.cancelActiveSearches()
    
    setState(prev => ({
      ...prev,
      isSearching: false,
      countdown: 0,
      searchAttempt: 0,
      error: null,
      currentTherapist: null,
      searchId: null
    }))

    onSearchCancelled()
  }, [onSearchCancelled])

  /**
   * Stop all timers and cleanup
   */
  const stopAllTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    if (searchPollingRef.current) {
      clearTimeout(searchPollingRef.current)
      searchPollingRef.current = null
    }
  }, [])

  /**
   * Reset search state
   */
  const resetSearch = useCallback(() => {
    stopAllTimers()
    
    setState({
      isSearching: false,
      countdown: 0,
      searchAttempt: 0,
      currentTherapist: null,
      error: null,
      searchId: null
    })
  }, [stopAllTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      stopAllTimers()
      bookingService.cancelActiveSearches()
    }
  }, [stopAllTimers])

  // Auto-start search when config is provided
  useEffect(() => {
    if (bookingId && searchConfig && !state.isSearching && state.searchAttempt === 0) {
      startSearch()
    }
  }, [bookingId, searchConfig, startSearch, state.isSearching, state.searchAttempt])

  return {
    // State
    isSearching: state.isSearching,
    countdown: state.countdown,
    searchAttempt: state.searchAttempt,
    currentTherapist: state.currentTherapist,
    error: state.error,
    
    // Actions
    startSearch,
    cancelSearch,
    retrySearch,
    resetSearch,
    
    // Computed properties
    canRetry: state.searchAttempt < (searchConfig?.retryAttempts || 0),
    isCountingDown: state.countdown > 0,
    timeRemaining: state.countdown
  }
}

/**
 * Booking timer hook for countdown display
 */
export const useBookingTimer = (
  initialTime: number,
  onTimeout?: () => void,
  autoStart = false
) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    setIsActive(true)
    setTimeLeft(initialTime)
  }, [initialTime])

  const stop = useCallback(() => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(initialTime)
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [initialTime])

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            onTimeout?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, onTimeout])

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isActive,
    isExpired: timeLeft === 0,
    start,
    stop,
    reset
  }
}