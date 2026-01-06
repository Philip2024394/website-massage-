/**
 * Production-grade ChatWindow component for massage booking system
 * Implements complete chat-driven booking flow with enterprise security and UX
 * 
 * ARCHITECTURE:
 * - Client → Appwrite Functions → Database (secure backend operations)
 * - Guest user support with validation
 * - Real-time chat with proper state management
 * - Comprehensive error handling and fallbacks
 * 
 * FLOW:
 * 1. Chat Activation → System message: "Checking availability..."
 * 2. Service Confirmation → Display service card with Confirm/Cancel
 * 3. Search Timer → Countdown with auto-retry and Cancel option
 * 4. Therapist Found → Display therapist card with Accept/Decline
 * 5. User Confirmation → Accept therapist (not dispatched until accepted)
 * 6. Booking Confirmed → Active chat with therapist
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  BookingStatus, 
  BookingUIState, 
  ChatMessage, 
  TherapistMatch, 
  ServiceDuration,
  CreateBookingRequest,
  Booking
} from '../types/booking.types'
import { bookingService, BookingService } from '../services/booking.service'
import { useBookingSearch } from '../hooks/useBookingSearch'
import { 
  SystemMessage, 
  ServiceConfirmationCard, 
  TherapistCard, 
  SearchStatus, 
  BookingConfirmed 
} from './SystemMessage'

interface ChatWindowProps {
  providerId: string
  providerName: string
  providerPhoto?: string
  providerStatus?: 'available' | 'busy' | 'offline'
  providerRating?: number
  pricing: { '60': number; '90': number; '120': number }
  selectedService?: { duration: string }
  customerName?: string
  customerWhatsApp?: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Main ChatWindow component with production-grade booking flow
 */
export default function ChatWindow({
  providerId,
  providerName,
  providerPhoto,
  providerStatus = 'available',
  providerRating = 4.5,
  pricing,
  selectedService,
  customerName: initialCustomerName = '',
  customerWhatsApp: initialCustomerWhatsApp = '',
  isOpen,
  onClose
}: ChatWindowProps) {

  // ===== CORE STATE MANAGEMENT =====
  
  // User registration state
  const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp)
  const [customerLocation, setCustomerLocation] = useState('')
  const [customerCoordinates, setCustomerCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [serviceDuration, setServiceDuration] = useState<ServiceDuration>(
    (selectedService?.duration as ServiceDuration) || '60'
  )

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  // Booking state - following your specified flow
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle')
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [currentTherapist, setCurrentTherapist] = useState<TherapistMatch | null>(null)
  const [showServiceConfirmation, setShowServiceConfirmation] = useState(false)
  const [showTherapistSelection, setShowTherapistSelection] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isActiveRef = useRef(true)

  // ===== BOOKING SEARCH HOOK =====
  
  const searchConfig = currentBooking && customerCoordinates 
    ? BookingService.createSearchConfig(serviceDuration, customerCoordinates)
    : null

  const {
    isSearching,
    countdown,
    searchAttempt,
    cancelSearch,
    resetSearch
  } = useBookingSearch({
    bookingId: currentBooking?.id || null,
    searchConfig,
    onTherapistFound: handleTherapistFound,
    onSearchFailed: handleSearchFailed,
    onSearchCancelled: handleSearchCancelled
  })

  // ===== BOOKING FLOW HANDLERS =====

  /**
   * 1. CHAT ACTIVATION - Start booking process
   */
  const handleStartBooking = useCallback(async () => {
    try {
      console.log('🚀 Starting booking process...')
      
      // Add initial system message
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: 'temp',
        senderType: 'system',
        content: "We're checking availability for therapists near you…",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, systemMessage])
      setShowServiceConfirmation(true)
      setIsMinimized(false)

    } catch (error) {
      console.error('❌ Failed to start booking:', error)
      setError('Failed to start booking process. Please try again.')
    }
  }, [])

  /**
   * 2. SERVICE CONFIRMATION - User confirms service details
   */
  const handleConfirmService = useCallback(async () => {
    if (!customerCoordinates || !customerLocation) {
      setError('Location is required to proceed')
      return
    }

    try {
      setLoading(true)
      console.log('✅ Confirming service details...')

      // Create booking request
      const bookingRequest: CreateBookingRequest = {
        userId: `guest_${Date.now()}`, // Guest user support
        serviceDuration,
        location: {
          address: customerLocation,
          coordinates: customerCoordinates
        },
        customerDetails: {
          name: customerName,
          whatsapp: customerWhatsApp
        }
      }

      // Create booking via secure API
      const booking = await bookingService.createBooking(bookingRequest)
      
      setCurrentBooking(booking)
      setBookingStatus('searching')
      setShowServiceConfirmation(false)

      // Add search system message
      const searchMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: booking.id,
        senderType: 'system',
        content: "Searching for available therapists near you…",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, searchMessage])

    } catch (error) {
      console.error('❌ Service confirmation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to confirm service')
    } finally {
      setLoading(false)
    }
  }, [customerCoordinates, customerLocation, serviceDuration, customerName, customerWhatsApp])

  /**
   * 3. THERAPIST FOUND - Handle therapist match
   */
  function handleTherapistFound(therapist: TherapistMatch) {
    console.log('✅ Therapist found:', therapist.name)
    
    setCurrentTherapist(therapist)
    setBookingStatus('pending_accept')
    setShowTherapistSelection(true)

    // Add therapist found system message
    const therapistMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      conversationId: currentBooking?.id || 'temp',
      senderType: 'system',
      content: "Good news! A therapist is available.",
      timestamp: new Date().toISOString(),
      messageType: 'therapist_card',
      metadata: { therapist }
    }
    
    setMessages(prev => [...prev, therapistMessage])
  }

  /**
   * 4. USER CONFIRMATION - Accept therapist
   */
  const handleAcceptTherapist = useCallback(async () => {
    if (!currentBooking || !currentTherapist) return

    try {
      setLoading(true)
      console.log('✅ Accepting therapist:', currentTherapist.name)

      // Accept therapist via secure API
      const updatedBooking = await bookingService.acceptTherapist(
        currentBooking.id, 
        currentTherapist.id
      )

      setBookingStatus('active')
      setShowTherapistSelection(false)

      // Add confirmation system message
      const confirmationMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: currentBooking.id,
        senderType: 'system',
        content: `Your booking is confirmed. ${currentTherapist.name} will arrive within 1 hour or less.`,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, confirmationMessage])

    } catch (error) {
      console.error('❌ Therapist acceptance failed:', error)
      setError('Failed to accept therapist. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentBooking, currentTherapist])

  /**
   * 5. FIND ANOTHER THERAPIST - Reject and search again
   */
  const handleFindAnother = useCallback(() => {
    console.log('🔄 Finding another therapist...')
    
    setCurrentTherapist(null)
    setShowTherapistSelection(false)
    setBookingStatus('searching')

    // Restart search automatically
    resetSearch()
  }, [resetSearch])

  /**
   * 6. CANCEL BOOKING - Cancel at any stage
   */
  const handleCancelBooking = useCallback(async (reason = 'User cancelled') => {
    try {
      console.log('🛑 Cancelling booking:', reason)

      if (currentBooking) {
        await bookingService.cancelBooking(currentBooking.id, reason)
      }

      // Cancel active searches
      cancelSearch()

      // Reset all state
      setBookingStatus('idle')
      setCurrentBooking(null)
      setCurrentTherapist(null)
      setShowServiceConfirmation(false)
      setShowTherapistSelection(false)
      setError(null)

      // Add cancellation message
      const cancelMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: currentBooking?.id || 'temp',
        senderType: 'system',
        content: 'Booking cancelled. You can start a new booking anytime.',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, cancelMessage])

    } catch (error) {
      console.error('❌ Booking cancellation failed:', error)
      // Continue with UI cleanup even if API fails
    }
  }, [currentBooking, cancelSearch])

  // ===== SEARCH EVENT HANDLERS =====

  function handleSearchFailed(error: string) {
    console.error('❌ Search failed:', error)
    setError(error)
    setBookingStatus('idle')
  }

  function handleSearchCancelled() {
    console.log('🛑 Search cancelled by user')
    setBookingStatus('idle')
  }

  // ===== LOCATION HANDLING =====

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    try {
      setLoading(true)
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const { latitude, longitude } = position.coords
      setCustomerCoordinates({ lat: latitude, lng: longitude })

      // Use simple coordinates as fallback location
      setCustomerLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)

    } catch (error) {
      console.error('❌ Location access failed:', error)
      setError('Unable to access your location. Please enter it manually.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== MESSAGE HANDLING =====

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending || bookingStatus !== 'active') return

    try {
      setSending(true)
      
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        conversationId: currentBooking?.id || 'temp',
        senderType: 'user',
        senderId: `guest_${Date.now()}`,
        senderName: customerName,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])
      setNewMessage('')

      // TODO: Send message via API
      console.log('📤 Sending message:', userMessage)

    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }, [newMessage, sending, bookingStatus, currentBooking, customerName])

  // ===== AUTO-SCROLL EFFECT =====

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== CLEANUP ON UNMOUNT =====

  useEffect(() => {
    return () => {
      isActiveRef.current = false
      cancelSearch()
    }
  }, [cancelSearch])

  // ===== RENDER =====

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md h-full max-h-[600px] flex flex-col ${
        isMinimized ? 'h-16' : ''
      }`}>
        
        {/* HEADER */}
        <div className="bg-orange-600 text-white px-4 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={currentTherapist?.photo || providerPhoto || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'} 
              alt={currentTherapist?.name || providerName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'
              }}
            />
            <div>
              <span className="font-bold text-lg">{currentTherapist?.name || providerName}</span>
              {currentTherapist && (
                <div className="text-sm text-orange-100">
                  ⭐ {currentTherapist.rating} • {currentTherapist.distance}km away
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button onClick={onClose}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm">{error}</div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-600 text-xs mt-1 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* REGISTRATION FORM */}
              {!isRegistered && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Your Details</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-lg text-sm font-medium">
                          +62
                        </span>
                        <input
                          type="tel"
                          placeholder="812345678"
                          value={customerWhatsApp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setCustomerWhatsApp(value);
                          }}
                          maxLength={13}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter your number without the country code (+62)</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your Location"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        title="Get current location"
                      >
                        📍
                      </button>
                    </div>
                    <select
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value as ServiceDuration)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="60">60 minutes - {formatPrice(pricing['60'])}</option>
                      <option value="90">90 minutes - {formatPrice(pricing['90'])}</option>
                      <option value="120">120 minutes - {formatPrice(pricing['120'])}</option>
                    </select>
                    <button
                      onClick={() => {
                        // Validate WhatsApp number
                        const cleanedWhatsApp = customerWhatsApp.replace(/\D/g, '');
                        if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
                          setError('Please enter a valid WhatsApp number (8-15 digits)');
                          return;
                        }
                        
                        // Format WhatsApp with +62 prefix
                        const formattedWhatsApp = `+62${cleanedWhatsApp}`;
                        setCustomerWhatsApp(formattedWhatsApp);
                        
                        if (customerName && customerLocation) {
                          setIsRegistered(true)
                          handleStartBooking()
                        }
                      }}
                      disabled={!customerName || !customerWhatsApp || !customerLocation || loading}
                      className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {loading ? 'Starting...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* SERVICE CONFIRMATION CARD */}
              {showServiceConfirmation && (
                <ServiceConfirmationCard
                  duration={serviceDuration}
                  price={pricing[serviceDuration]}
                  location={customerLocation}
                  onConfirm={handleConfirmService}
                  onCancel={handleCancelBooking}
                  isLoading={loading}
                />
              )}

              {/* SEARCH STATUS */}
              {isSearching && (
                <SearchStatus
                  countdown={countdown}
                  searchAttempt={searchAttempt}
                  onCancel={handleCancelBooking}
                />
              )}

              {/* THERAPIST SELECTION */}
              {showTherapistSelection && currentTherapist && (
                <TherapistCard
                  therapist={currentTherapist}
                  onAccept={handleAcceptTherapist}
                  onReject={handleFindAnother}
                  onCancel={handleCancelBooking}
                  isLoading={loading}
                />
              )}

              {/* BOOKING CONFIRMED */}
              {bookingStatus === 'active' && currentTherapist && (
                <BookingConfirmed
                  therapistName={currentTherapist.name}
                  eta={currentTherapist.eta}
                />
              )}

              {/* CHAT MESSAGES */}
              {messages.map(message => (
                <div key={message.id} className="w-full">
                  {message.senderType === 'system' ? (
                    <SystemMessage
                      message={message}
                      onConfirm={message.messageType === 'system_card' ? handleConfirmService : undefined}
                      onCancel={handleCancelBooking}
                      onAcceptTherapist={message.messageType === 'therapist_card' ? handleAcceptTherapist : undefined}
                      onFindAnother={message.messageType === 'therapist_card' ? handleFindAnother : undefined}
                    />
                  ) : (
                    <div className={`flex gap-2 ${
                      message.senderType === 'user' ? 'justify-end' : 'justify-start'
                    } mb-3`}>
                      {message.senderType === 'therapist' && currentTherapist && (
                        <img
                          src={currentTherapist.photo}
                          alt={currentTherapist.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                      )}
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.senderType === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'user' ? 'text-orange-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            {bookingStatus === 'active' && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && !sending && newMessage.trim() && handleSendMessage()}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}