import React, { useState, useEffect, useCallback, useRef } from 'react'

interface ChatWindowProps {
  providerId: string
  providerName: string
  providerPhoto?: string
  providerStatus?: 'available' | 'busy' | 'offline'
  providerRating?: number
  providerLocation?: string 
  pricing: { '60': number; '90': number; '120': number }
  selectedService?: { duration: string }
  customerName?: string
  customerWhatsApp?: string
  bookingId?: string
  chatRoomId?: string
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  id: string
  content: string
  senderType: 'customer' | 'therapist' | 'system'
  timestamp: string
  senderName?: string
}

/**
 * Error-safe ChatWindow component
 * Focuses on core chat functionality without complex Appwrite dependencies
 */
function SafeChatWindow({
  providerId,
  providerName,
  providerPhoto,
  providerStatus = 'available',
  providerRating = 4.5,
  providerLocation,
  pricing,
  selectedService,
  customerName: initialCustomerName = '',
  customerWhatsApp: initialCustomerWhatsApp = '',
  bookingId,
  chatRoomId: existingChatRoomId,
  isOpen,
  onClose
}: ChatWindowProps) {
  console.log('🛡️ SafeChatWindow LOADED - Error-safe mode active');
  
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp)
  const [serviceDuration, setServiceDuration] = useState<'60' | '90' | '120'>('60')
  const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp)
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        content: `Hi! I'm ${providerName}. How can I help you today?`,
        senderType: 'system',
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, providerName, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return

    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: newMessage.trim(),
        senderType: 'customer',
        timestamp: new Date().toISOString(),
        senderName: customerName || 'You'
      }

      setMessages(prev => [...prev, userMessage])
      const messageText = newMessage.trim()
      setNewMessage('')

      // Simulate therapist response (basic demo)
      setTimeout(() => {
        const responses = [
          "Thank you for your message. I'll get back to you shortly.",
          "I understand. Let me check my availability for you.",
          "Great! I can help you with that service.",
          "Please let me know your preferred time."
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const therapistMessage: ChatMessage = {
          id: `therapist_${Date.now()}`,
          content: randomResponse,
          senderType: 'therapist',
          timestamp: new Date().toISOString(),
          senderName: providerName
        }
        
        setMessages(prev => [...prev, therapistMessage])
      }, 1000 + Math.random() * 2000) // 1-3 second delay

    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setError('Failed to send message. Please try again.')
    }
  }, [newMessage, customerName, providerName])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartBooking = () => {
    const bookingMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      content: "Great! Let's get you booked. I'll need a few details from you.",
      senderType: 'system',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, bookingMessage])
  }

  const handleRegister = () => {
    if (customerName.trim() && customerWhatsApp.trim()) {
      setIsRegistered(true)
      const welcomeMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        content: `Welcome ${customerName}! I'm ready to help you book your massage service.`,
        senderType: 'system',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, welcomeMessage])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {providerPhoto ? (
                <img src={providerPhoto} alt={providerName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg font-bold">{providerName.charAt(0)}</span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                providerStatus === 'available' ? 'bg-green-500' :
                providerStatus === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold">{providerName}</h3>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span>⭐ {providerRating}</span>
                {providerLocation && <span>📍 {providerLocation}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded"
            >
              {isMinimized ? '↗️' : '↙️'}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Registration Form (if not registered) */}
          {!isRegistered && (
            <div className="p-4 bg-blue-50 border-b">
              <h4 className="font-medium mb-3">Let's get started!</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(pricing).map(([duration, price]) => (
                    <button
                      key={duration}
                      onClick={() => setServiceDuration(duration as '60' | '90' | '120')}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        serviceDuration === duration
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {duration}min
                      <div className="text-xs">Rp{price.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRegister}
                  disabled={!customerName.trim() || !customerWhatsApp.trim()}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.senderType === 'customer'
                      ? 'bg-blue-500 text-white'
                      : message.senderType === 'therapist'
                      ? 'bg-white text-gray-800 border'
                      : 'bg-yellow-100 text-gray-800 text-center'
                  }`}
                >
                  {message.senderName && message.senderType !== 'system' && (
                    <div className="text-xs opacity-70 mb-1">{message.senderName}</div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Message Input */}
          {isRegistered && (
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '...' : '➤'}
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleStartBooking}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
                >
                  📅 Book Now
                </button>
                <button
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                >
                  📍 Share Location
                </button>
                <button
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200"
                >
                  ❓ Ask Question
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SafeChatWindow;