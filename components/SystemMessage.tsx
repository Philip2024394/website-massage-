/**
 * Production-grade system message components
 * Visually distinct from user/therapist messages with proper state management
 */

import React from 'react'
import { 
  ChatMessage, 
  Booking, 
  TherapistMatch, 
  ServiceDuration,
  SystemMessageAction 
} from '../types/booking.types'

// System message props
interface SystemMessageProps {
  message: ChatMessage
  onConfirm?: () => void
  onCancel?: () => void
  onAcceptTherapist?: () => void
  onFindAnother?: () => void
}

// Service confirmation card props
interface ServiceConfirmationProps {
  duration: ServiceDuration
  price: number
  location: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

// Therapist match card props
interface TherapistCardProps {
  therapist: TherapistMatch
  onAccept: () => void
  onReject: () => void
  onCancel: () => void
  isLoading?: boolean
}

// Search status component props
interface SearchStatusProps {
  countdown: number
  searchAttempt: number
  onCancel: () => void
}

/**
 * Main system message component with routing to specific card types
 */
export const SystemMessage: React.FC<SystemMessageProps> = ({ 
  message, 
  onConfirm, 
  onCancel, 
  onAcceptTherapist, 
  onFindAnother 
}) => {
  const { content, messageType, metadata } = message

  // Route to appropriate component based on message type
  if (messageType === 'system_card' && metadata?.booking) {
    return (
      <ServiceConfirmationCard
        duration={metadata.booking.serviceDuration!}
        price={metadata.booking.price!}
        location={metadata.booking.location?.address || 'Unknown location'}
        onConfirm={onConfirm!}
        onCancel={onCancel!}
      />
    )
  }

  if (messageType === 'therapist_card' && metadata?.therapist) {
    return (
      <TherapistCard
        therapist={metadata.therapist}
        onAccept={onAcceptTherapist!}
        onReject={onFindAnother!}
        onCancel={onCancel!}
      />
    )
  }

  // Standard system message
  return (
    <div className="w-full mb-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          {/* System avatar */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Message content */}
          <div className="flex-1">
            <div className="text-sm text-blue-800 font-medium mb-1">
              System Message
            </div>
            <div className="text-sm text-blue-700 whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Service confirmation card with price and location details
 */
export const ServiceConfirmationCard: React.FC<ServiceConfirmationProps> = ({
  duration,
  price,
  location,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="w-full mb-4">
      <div className="bg-white border-2 border-orange-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-orange-800">Confirm Your Service</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <div className="font-medium text-gray-900">{duration} minutes</div>
            </div>
            <div>
              <span className="text-gray-600">Price:</span>
              <div className="font-bold text-orange-600 text-lg">{formatPrice(price)}</div>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Location:</span>
            <div className="font-medium text-gray-900 mt-1">{location}</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800">
                No therapist will be contacted until you confirm. You can cancel at any time during the search.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Starting Search...
                </>
              ) : (
                'Confirm & Search'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Therapist match card with accept/reject options
 */
export const TherapistCard: React.FC<TherapistCardProps> = ({
  therapist,
  onAccept,
  onReject,
  onCancel,
  isLoading = false
}) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-green-50 px-4 py-3 border-b border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-800">Therapist Available!</h3>
          </div>
        </div>

        {/* Therapist details */}
        <div className="p-4">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={therapist.photo}
              alt={therapist.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'
              }}
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">{therapist.name}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {therapist.rating}
                </span>
                <span>•</span>
                <span>📍 {therapist.distance}km away</span>
              </div>
            </div>
          </div>

          {/* ETA and specialties */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Estimated Arrival:</span>
                <div className="font-bold text-green-600 text-lg">{therapist.eta} minutes</div>
                <div className="text-xs text-gray-500">Within 1 hour or less</div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">Specialties:</span>
                <div className="text-sm text-gray-800">
                  {therapist.specialties.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-800">
                The therapist is not dispatched until you accept. You can decline and search for another therapist.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Find Another
            </button>
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Accepting...
                </>
              ) : (
                'Accept Therapist'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Search status component with countdown and cancel option
 */
export const SearchStatus: React.FC<SearchStatusProps> = ({
  countdown,
  searchAttempt,
  onCancel
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full mb-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <h3 className="font-semibold text-blue-800">Searching for Therapists</h3>
        </div>
        
        <p className="text-sm text-blue-700 mb-4">
          Looking for available therapists in your area...
          {searchAttempt > 1 && ` (Attempt ${searchAttempt})`}
        </p>

        {/* Countdown timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-blue-800">Search timeout in:</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            countdown <= 10 
              ? 'bg-red-100 text-red-600' 
              : countdown <= 30 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-blue-100 text-blue-600'
          }`}>
            {formatTime(countdown)}
          </div>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          Cancel Search
        </button>
      </div>
    </div>
  )
}

/**
 * Booking confirmation message
 */
export const BookingConfirmed: React.FC<{ therapistName: string; eta: number }> = ({
  therapistName,
  eta
}) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-green-800 font-bold mb-2">
              🎉 Booking Confirmed!
            </div>
            <div className="text-sm text-green-700">
              {therapistName} has accepted your booking and is on the way. 
              They will arrive within 1 hour or less.
            </div>
            <div className="mt-2 inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800">
              🕐 ETA: {eta} minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}