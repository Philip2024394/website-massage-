/**
 * 🔒 PERSISTENT CHAT WINDOW - Facebook Messenger Style
 * Orange minimalistic design with REAL Appwrite backend
 * 
 * Features:
 * - Real-time messages synced with Appwrite
 * - Therapist can respond instantly
 * - Beautiful orange gradient theme
 * - Booking flow integration
 * - Never disappears once opened
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { usePersistentChat, ChatMessage, BookingStep, validateMessage } from '../context/PersistentChatProvider';
import { MessageCircle, X, Minus, Send, Clock, MapPin, User, Phone, Check, ChevronLeft, Wifi, WifiOff, Calendar, Star, Sparkles, CreditCard, AlertTriangle } from 'lucide-react';

// Duration options with prices
const DURATION_OPTIONS = [
  { minutes: 60, label: '1 Hour' },
  { minutes: 90, label: '1.5 Hours' },
  { minutes: 120, label: '2 Hours' },
];

// Format price to IDR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export function PersistentChatWindow() {
  const {
    chatState,
    isLocked,
    isConnected,
    minimizeChat,
    maximizeChat,
    closeChat,
    setBookingStep,
    setSelectedDuration,
    setSelectedDateTime,
    setCustomerDetails,
    sendMessage,
    addMessage,
    createBooking,
    confirmBooking,
    cancelBooking,
    shareBankCard,
    confirmPayment,
    addSystemNotification,
  } = usePersistentChat();

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationAttempts, setLocationAttempts] = useState(0);
  const [messageWarning, setMessageWarning] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    countryCode: '+62',
    whatsApp: '',
    location: '',
    locationType: '' as 'home' | 'hotel' | 'villa' | '',
    coordinates: null as { lat: number; lng: number } | null,
    hotelVillaName: '',
    roomNumber: '',
    massageFor: '' as 'male' | 'female' | 'children' | '',
  });
  const [clientMismatchError, setClientMismatchError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [arrivalCountdown, setArrivalCountdown] = useState(3600); // 1 hour in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset form when minimized or therapist changes
  useEffect(() => {
    if (chatState.isMinimized || chatState.bookingStep === 'duration') {
      // Reset local form state
      setCustomerForm({
        name: '',
        countryCode: '+62',
        whatsApp: '',
        location: '',
        locationType: '',
        coordinates: null,
        hotelVillaName: '',
        roomNumber: '',
        massageFor: '',
      });
      setClientMismatchError(null);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [chatState.isMinimized, chatState.bookingStep]);

  // Reset form when viewing a different therapist
  useEffect(() => {
    setCustomerForm({
      name: '',
      countryCode: '+62',
      whatsApp: '',
      location: '',
      locationType: '',
      coordinates: null,
      hotelVillaName: '',
      roomNumber: '',
      massageFor: '',
    });
    setClientMismatchError(null);
    setSelectedDate('');
    setSelectedTime('');
  }, [chatState.therapist?.id]);

  // Arrival countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setArrivalCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown to MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatState.messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatState.messages.length]); // Only trigger on message count change, not full array

  // Don't render if no therapist or not open
  if (!chatState.isOpen || !chatState.therapist) {
    return null;
  }

  const { therapist, messages, bookingStep, selectedDuration, isMinimized } = chatState;
  const isScheduleMode = chatState.bookingMode === 'schedule';

  // Get price for duration
  const getPrice = (minutes: number) => {
    const pricing = therapist.pricing || {};
    return pricing[minutes.toString()] || pricing['60'] || 0;
  };

  // Handle duration selection
  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
    
    // If schedule mode, go to datetime picker first
    if (isScheduleMode) {
      setBookingStep('datetime');
    } else {
      setBookingStep('details');
    }
    
    // Add system message
    addMessage({
      senderId: 'system',
      senderName: 'System',
      message: `Selected ${minutes} minutes massage - ${formatPrice(getPrice(minutes))}`,
      type: 'system',
    });
  };

  // Handle datetime selection
  const handleDateTimeSubmit = () => {
    if (!selectedDate || !selectedTime) return;
    
    setSelectedDateTime(selectedDate, selectedTime);
    setBookingStep('details');
    
    // Add system message
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    addMessage({
      senderId: 'system',
      senderName: 'System',
      message: `📅 Scheduled for ${formattedDate} at ${selectedTime}`,
      type: 'system',
    });
  };

  // Handle customer form submission
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerForm.name || !customerForm.whatsApp) {
      return;
    }

    setCustomerDetails({
      name: customerForm.name,
      whatsApp: `${customerForm.countryCode}${customerForm.whatsApp}`,
      location: customerForm.location,
    });

    // Build booking request message
    const locationTypeLabels = { home: '🏠 Home', hotel: '🏨 Hotel', villa: '🏡 Villa' };
    const locationTypeText = customerForm.locationType ? locationTypeLabels[customerForm.locationType] : 'Not specified';
    
    // Generate Google Maps link if coordinates available
    const mapsLink = customerForm.coordinates 
      ? `https://www.google.com/maps?q=${customerForm.coordinates.lat},${customerForm.coordinates.lng}`
      : null;
    
    // Build location details based on type
    let locationDetails = '';
    if (customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') {
      locationDetails = `🏨 ${customerForm.locationType === 'hotel' ? 'Hotel' : 'Villa'} Name: ${customerForm.hotelVillaName}\n` +
        `🛏️ Room Number: ${customerForm.roomNumber}\n`;
    }
    
    // Massage recipient label
    const massageForLabels = { male: '👨 Male', female: '👩 Female', children: '👶 Children' };
    const massageForText = customerForm.massageFor ? massageForLabels[customerForm.massageFor] : 'Not specified';
    
    let bookingMessage = `📋 ${isScheduleMode ? 'SCHEDULED BOOKING REQUEST' : 'BOOKING REQUEST'}\n\n` +
      `👤 Name: ${customerForm.name}\n` +
      `📱 WhatsApp: ${customerForm.countryCode}${customerForm.whatsApp}\n` +
      `🧍 Massage For: ${massageForText}\n` +
      `🏢 Massage At: ${locationTypeText}\n` +
      locationDetails +
      (mapsLink 
        ? `🔐 GPS Location: ${mapsLink}\n` 
        : `📍 GPS: Not provided - please ask customer for location\n`) +
      `⏱️ Duration: ${selectedDuration} minutes\n` +
      `💰 Price: ${formatPrice(getPrice(selectedDuration || 60))}`;
    
    // Add scheduled date/time if in schedule mode
    if (isScheduleMode && selectedDate && selectedTime) {
      const dateObj = new Date(selectedDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      bookingMessage += `\n📅 Date: ${formattedDate}\n⏰ Time: ${selectedTime}`;
    }
    
    bookingMessage += `\n\nPlease confirm my booking!`;

    try {
      setIsSending(true);
      const result = await sendMessage(bookingMessage);
      if (result.sent) {
        // Create booking with countdown timer
        createBooking({
          duration: selectedDuration || 60,
          price: getPrice(selectedDuration || 60),
          location: customerForm.location,
          coordinates: customerForm.coordinates || undefined,
          scheduledDate: selectedDate || undefined,
          scheduledTime: selectedTime || undefined,
        });
      }
      setBookingStep('chat');
    } catch (error) {
      console.error('Failed to send booking request:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle send message (with spam detection)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    
    // Validate message for phone numbers/contact info before sending
    const validation = validateMessage(content);
    if (!validation.isValid) {
      setMessageWarning(validation.warning);
      // Clear warning after 5 seconds
      setTimeout(() => setMessageWarning(null), 5000);
      return;
    }
    
    setMessageInput('');
    setMessageWarning(null);
    setIsSending(true);

    try {
      const result = await sendMessage(content);
      if (!result.sent && result.warning) {
        setMessageWarning(result.warning);
        setTimeout(() => setMessageWarning(null), 5000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Minimized bubble
  // Show profile picture only if booking sent or in active chat, otherwise show chat icon
  const hasActiveChat = messages.length > 0 && bookingStep === 'chat';
  
  if (isMinimized) {
    return (
      <button
        onClick={maximizeChat}
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <div className="relative">
          {hasActiveChat ? (
            <>
              <img 
                src={therapist.image || '/placeholder-avatar.jpg'} 
                alt={therapist.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="font-semibold text-sm">{hasActiveChat ? therapist.name : 'Continue Booking'}</div>
          <div className="text-xs text-orange-100">{hasActiveChat ? 'Tap to continue chat' : 'Tap to continue'}</div>
        </div>
      </button>
    );
  }

  // Full chat window
  return (
    <div
      className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 z-[9999] w-full sm:w-[380px] sm:max-w-[calc(100vw-32px)] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
      style={{ 
        height: 'min(600px, calc(100vh - 60px))',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Slide up animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img 
            src={therapist.image || '/placeholder-avatar.jpg'} 
            alt={therapist.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-orange-500"></span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{therapist.name}</h3>
          <div className="flex items-center gap-1 text-xs text-orange-100">
            {/* Booking countdown timer */}
            {chatState.bookingCountdown !== null ? (
              <span className="flex items-center gap-1 text-yellow-200 font-medium animate-pulse">
                <Clock className="w-3 h-3" />
                {Math.floor(chatState.bookingCountdown / 60)}:{(chatState.bookingCountdown % 60).toString().padStart(2, '0')}
              </span>
            ) : isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Connected • Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Bank Card Button - for payment sharing */}
          {chatState.currentBooking && (chatState.currentBooking.status === 'completed' || chatState.currentBooking.status === 'on_the_way') && (
            <button
              onClick={shareBankCard}
              className="p-1.5 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
              title="Share Bank Card for Payment"
            >
              <CreditCard className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            onClick={minimizeChat}
            className="p-1.5 bg-black rounded-full hover:bg-gray-800 transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          {!isLocked && (
            <button
              onClick={closeChat}
              className="p-1.5 bg-black rounded-full hover:bg-gray-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Booking Status Banner */}
      {chatState.currentBooking && (
        <div className={`px-4 py-2 text-xs font-medium ${
          chatState.currentBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          chatState.currentBooking.status === 'therapist_accepted' ? 'bg-blue-100 text-blue-800' :
          chatState.currentBooking.status === 'user_confirmed' ? 'bg-green-100 text-green-800' :
          chatState.currentBooking.status === 'on_the_way' ? 'bg-purple-100 text-purple-800' :
          chatState.currentBooking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
          chatState.currentBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {chatState.currentBooking.status === 'pending' && '⏳ Waiting for therapist to accept...'}
          {chatState.currentBooking.status === 'waiting_others' && '🔄 Searching for available therapists...'}
          {chatState.currentBooking.status === 'therapist_accepted' && '✅ Therapist accepted! Confirm below.'}
          {chatState.currentBooking.status === 'user_confirmed' && '🎉 Booking confirmed!'}
          {chatState.currentBooking.status === 'on_the_way' && '🚗 Therapist is on the way!'}
          {chatState.currentBooking.status === 'completed' && '✨ Service completed - Payment ready'}
          {chatState.currentBooking.status === 'cancelled' && '❌ Booking cancelled'}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-white">
        
        {/* Duration Selection Step */}
        {bookingStep === 'duration' && (
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="w-48 h-48 mx-auto mb-3 rounded-full overflow-hidden">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                  alt="Indastreet Massage" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-semibold text-gray-800">Select Duration</h4>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred massage duration</p>
            </div>
            
            {/* CSS for animated hand clicking effect */}
            {/* Using CSS variables for responsive container positioning */}
            <style>{`
              :root {
                --container-height: 68px;
                --container-gap: 12px;
                --hand-size: 120px;
                --hand-offset: 15px;
              }
              @keyframes handMove {
                0%, 10% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
                15% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                20%, 30% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
                33%, 43% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset))); }
                48% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                53%, 63% { transform: translateX(-50%) translateY(calc(var(--container-height) + var(--container-gap) + var(--container-height) / 2 + var(--hand-offset))); }
                66%, 76% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset))); }
                81% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset) + 5px)) scale(0.95); }
                86%, 96% { transform: translateX(-50%) translateY(calc((var(--container-height) + var(--container-gap)) * 2 + var(--container-height) / 2 + var(--hand-offset))); }
                100% { transform: translateX(-50%) translateY(calc(var(--container-height) / 2 + var(--hand-offset))); }
              }
              @keyframes containerHighlight1 {
                0%, 10% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                15% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                20%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              @keyframes containerHighlight2 {
                0%, 32% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
                33%, 43% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                48% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                53%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              @keyframes containerHighlight3 {
                0%, 65% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
                66%, 76% { border-color: #fb923c; background-color: #fff7ed; box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3); }
                81% { border-color: #f97316; background-color: #ffedd5; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); transform: scale(1.02); }
                86%, 100% { border-color: #e5e7eb; background-color: white; box-shadow: none; transform: scale(1); }
              }
              .hand-animation { animation: handMove 10s ease-in-out infinite; }
              .container-animate-1 { animation: containerHighlight1 10s ease-in-out infinite; }
              .container-animate-2 { animation: containerHighlight2 10s ease-in-out infinite; }
              .container-animate-3 { animation: containerHighlight3 10s ease-in-out infinite; }
              .duration-container { height: var(--container-height); }
            `}</style>
            
            <div className="relative">
              {/* Animated clicking hand */}
              <div className="absolute left-1/2 top-0 z-10 hand-animation pointer-events-none">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/glove-removebg-preview.png" 
                  alt="Click to select" 
                  className="w-[120px] h-[120px] drop-shadow-lg object-contain"
                />
              </div>
              
              <div className="space-y-3">
                {DURATION_OPTIONS.map((option, index) => {
                  const price = getPrice(option.minutes);
                  const animationClass = index === 0 ? 'container-animate-1' : index === 1 ? 'container-animate-2' : 'container-animate-3';
                  return (
                    <button
                      key={option.minutes}
                      onClick={() => handleDurationSelect(option.minutes)}
                      className={`w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left group cursor-pointer duration-container ${animationClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-orange-600">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500">{option.minutes} minutes</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-500 text-lg">
                            {formatPrice(price)}
                          </div>
                          <div className="text-xs text-gray-400 group-hover:text-orange-400">Book Now →</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Indonesia's Premium Choice
            </p>
          </div>
        )}

        {/* DateTime Selection Step (for Schedule mode) */}
        {bookingStep === 'datetime' && (
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Schedule Appointment</h4>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDuration} min • {formatPrice(getPrice(selectedDuration || 60))}
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                />
              </div>
              
              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Selected Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="text-sm text-orange-800">
                    <strong>Selected:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {selectedTime}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleDateTimeSubmit}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step - Pre-selected service from Menu Harga */}
        {bookingStep === 'confirmation' && chatState.selectedService && (
          <div className="p-4">
            {/* Service Card with Arrival Countdown */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200 shadow-sm mb-4">
              {/* Header with therapist */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img 
                    src={therapist.image || '/placeholder-avatar.jpg'} 
                    alt={therapist.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{therapist.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>4.9</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Selected Service Details */}
              <div className="bg-white rounded-xl p-3 border border-orange-200 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Selected Service</span>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1">
                  {chatState.selectedService.serviceName}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{chatState.selectedService.duration} min</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatPrice(chatState.selectedService.price)}
                  </div>
                </div>
              </div>

              {/* Arrival Time Countdown */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs opacity-90">Estimated Arrival</div>
                      <div className="font-semibold">~1 Hour</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">Countdown</div>
                    <div className="font-bold text-2xl font-mono tracking-wider">
                      {formatCountdown(arrivalCountdown)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm & Book Button */}
            <button
              onClick={() => setBookingStep('details')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Check className="w-5 h-5" />
              Confirm & Book Now
            </button>

            {/* Change Selection Link */}
            <button
              onClick={() => setBookingStep('duration')}
              className="w-full mt-3 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Change selection
            </button>
          </div>
        )}

        {/* Customer Details Step */}
        {bookingStep === 'details' && (
          <div className="p-4">
            <h4 className="text-lg font-bold text-gray-800 text-left mb-4">Booking Details</h4>
            <div className="text-center mb-4">
              <div className="w-64 h-64 mx-auto -mt-[15px] mb-1 flex items-center justify-center">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                  alt="Indastreet Massage"
                  className="w-64 h-64 object-contain"
                />
              </div>
              {chatState.selectedService ? (
                <div className="mt-2 space-y-1">
                  <p className="text-lg font-medium text-orange-600">{chatState.selectedService.serviceName}</p>
                  <p className="text-base text-gray-700">
                    <span className="font-bold">{chatState.selectedService.duration} min</span> • <span className="font-bold">IDR {chatState.selectedService.price.toLocaleString('id-ID')}</span>
                  </p>
                </div>
              ) : (
                <p className="text-base text-gray-700 mt-1">
                  <span className="font-bold">{selectedDuration} min</span> • <span className="font-bold">IDR {(getPrice(selectedDuration || 60)).toLocaleString('id-ID')}</span>
                </p>
              )}
              {isScheduleMode && selectedDate && selectedTime && (
                <p className="text-sm text-orange-600 mt-1">
                  📅 {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                🕐 Estimated Arrival: 30-60 minutes
              </p>
            </div>
            
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <svg className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={customerForm.countryCode}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="px-2 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-white text-sm accent-orange-500"
                    style={{ accentColor: '#f97316' }}
                  >
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+7">🇷🇺 +7</option>
                  </select>
                  <input
                    type="tel"
                    value={customerForm.whatsApp}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, whatsApp: e.target.value }))}
                    placeholder="812 3456 7890"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Massage For Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  The Massage Is For... *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: 'Male', icon: 'https://ik.imagekit.io/7grri5v7d/male_ss-removebg-preview.png', isImage: true },
                    { value: 'female', label: 'Female', icon: 'https://ik.imagekit.io/7grri5v7d/male_sss-removebg-preview.png', isImage: true },
                    { value: 'children', label: 'Children', icon: 'https://ik.imagekit.io/7grri5v7d/male_ssss-removebg-preview.png', isImage: true },
                  ].map((option) => {
                    // Check if therapist accepts this client type
                    const clientPref = therapist.clientPreferences || 'Males And Females';
                    let isCompatible = true;
                    
                    if (option.value === 'male') {
                      isCompatible = clientPref === 'Males Only' || clientPref === 'Males And Females' || clientPref === 'All Ages And Genders';
                    } else if (option.value === 'female') {
                      isCompatible = clientPref === 'Females Only' || clientPref === 'Males And Females' || clientPref === 'All Ages And Genders';
                    } else if (option.value === 'children') {
                      isCompatible = clientPref === 'Babies Only' || clientPref === 'All Ages And Genders';
                    }
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setCustomerForm(prev => ({ ...prev, massageFor: option.value as 'male' | 'female' | 'children' }));
                          // Validate compatibility and set error message
                          if (!isCompatible) {
                            const prefLabels: Record<string, string> = {
                              'Males Only': 'Male clients only',
                              'Females Only': 'Female clients only',
                              'Males And Females': 'Male and Female clients',
                              'Babies Only': 'Babies/Children only',
                              'All Ages And Genders': 'All ages and genders'
                            };
                            setClientMismatchError(`Unfortunately ${therapist.name} only provides massage service for ${prefLabels[clientPref] || clientPref}`);
                          } else {
                            setClientMismatchError(null);
                          }
                        }}
                        className={`text-sm font-medium transition-all flex flex-col items-center gap-1 relative ${
                          option.isImage
                            ? customerForm.massageFor === option.value
                              ? 'scale-105'
                              : ''
                            : `py-3 px-2 rounded-xl ${customerForm.massageFor === option.value
                              ? isCompatible
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'}`
                        }`}
                      >
                        {option.isImage ? (
                          <div className="relative -mt-[10px]">
                            <img src={option.icon} alt={option.label} className="w-[100px] h-[100px] object-cover" />
                            <span className={`absolute bottom-6 left-1/2 -translate-x-1/2 font-bold text-sm drop-shadow-lg ${
                              customerForm.massageFor === option.value ? 'text-orange-500' : 'text-white'
                            }`}>{option.label}</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">{option.icon}</span>
                            <span>{option.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Client mismatch error message */}
                {clientMismatchError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">⚠️ {clientMismatchError}</p>
                    <p className="text-xs text-red-600 mt-1">Please choose a different therapist or select a compatible option.</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Massage Required At... *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'home', label: 'Home', icon: 'https://ik.imagekit.io/7grri5v7d/home%20icon.png', isImage: true },
                    { value: 'hotel', label: 'Hotel', icon: 'https://ik.imagekit.io/7grri5v7d/hotel%20icon.png', isImage: true },
                    { value: 'villa', label: 'Villa', icon: 'https://ik.imagekit.io/7grri5v7d/villa%20icon.png', isImage: true },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCustomerForm(prev => ({ ...prev, locationType: option.value as 'home' | 'hotel' | 'villa' }))}
                      className={`text-sm font-medium transition-all flex flex-col items-center gap-1 relative ${
                        option.isImage
                          ? customerForm.locationType === option.value
                            ? 'scale-105'
                            : ''
                          : `py-3 px-2 rounded-xl ${customerForm.locationType === option.value
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'}`
                      }`}
                    >
                      {option.isImage ? (
                        <div className="relative -mt-[10px]">
                          <img src={option.icon} alt={option.label} className="w-[100px] h-[100px] object-cover" />
                          <span className={`absolute bottom-6 left-1/2 -translate-x-1/2 font-bold text-sm drop-shadow-lg ${
                            customerForm.locationType === option.value ? 'text-orange-500' : 'text-white'
                          }`}>{option.label}</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-xl">{option.icon}</span>
                          <span>{option.label}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Your Location
                </label>
                
                {/* GPS Set Location Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!navigator.geolocation) {
                      // After 3 attempts, silently succeed
                      const newAttempts = locationAttempts + 1;
                      setLocationAttempts(newAttempts);
                      if (newAttempts >= 3) {
                        setCustomerForm(prev => ({
                          ...prev,
                          coordinates: { lat: 0, lng: 0 } // Dummy coordinates to proceed
                        }));
                      }
                      return;
                    }
                    
                    setIsGettingLocation(true);
                    
                    // Check permission status first (if available)
                    try {
                      if (navigator.permissions) {
                        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                        console.log('📍 Location permission status:', permissionStatus.state);
                      }
                    } catch (permErr) {
                      console.log('Permissions API not available, proceeding with geolocation request');
                    }
                    
                    // Request location - this will trigger the mobile permission dialog
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setCustomerForm(prev => ({
                          ...prev,
                          coordinates: { lat: latitude, lng: longitude }
                        }));
                        setIsGettingLocation(false);
                        setLocationAttempts(0); // Reset on success
                        console.log('📍 Location set:', latitude, longitude);
                      },
                      (error) => {
                        console.error('Location error:', error.code, error.message);
                        setIsGettingLocation(false);
                        // Track failed attempts and auto-succeed after 3
                        const newAttempts = locationAttempts + 1;
                        setLocationAttempts(newAttempts);
                        if (newAttempts >= 3) {
                          setCustomerForm(prev => ({
                            ...prev,
                            coordinates: { lat: 0, lng: 0 } // Dummy coordinates to proceed
                          }));
                        }
                      },
                      { 
                        enableHighAccuracy: true, 
                        timeout: 15000, // Increased timeout for mobile
                        maximumAge: 0 
                      }
                    );
                  }}
                  disabled={isGettingLocation || !!customerForm.coordinates}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    customerForm.coordinates
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg cursor-default'
                      : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Getting Location...
                    </>
                  ) : customerForm.coordinates ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      🔒 Location Secured
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      📍 Set My Location
                    </>
                  )}
                </button>
                
                {/* Show coordinates with lock when location is set */}
                {customerForm.coordinates && customerForm.coordinates.lat !== undefined && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">Location Locked</span>
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-green-200">
                      <div className="text-xs text-gray-500 mb-1">GPS Coordinates:</div>
                      <div className="font-mono text-sm text-green-800">
                        {(customerForm.coordinates.lat || 0).toFixed(6)}, {(customerForm.coordinates.lng || 0).toFixed(6)}
                      </div>
                    </div>
                    <a 
                      href={`https://www.google.com/maps?q=${customerForm.coordinates.lat || 0},${customerForm.coordinates.lng || 0}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      <MapPin className="w-3 h-3" />
                      View on Google Maps
                    </a>
                  </div>
                )}
                
                {/* Info text when no location */}
                {!customerForm.coordinates && !isGettingLocation && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    📍 Location helps therapist find you faster. You can also share in chat.
                  </p>
                )}
              </div>
              
              {/* Hotel/Villa Name and Room Number - only show for hotel or villa */}
              {(customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      {customerForm.locationType === 'hotel' ? 'Hotel' : 'Villa'} Name *
                    </label>
                    <input
                      type="text"
                      value={customerForm.hotelVillaName}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, hotelVillaName: e.target.value }))}
                      placeholder={customerForm.locationType === 'hotel' ? 'e.g. Grand Hyatt Bali' : 'e.g. Villa Seminyak Estate'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={customerForm.roomNumber}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="e.g. Room 1205"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      required
                    />
                  </div>
                </>
              )}
              
              <button
                type="submit"
                disabled={isSending || !customerForm.name || !customerForm.whatsApp || !customerForm.massageFor || !!clientMismatchError || !customerForm.locationType || ((customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (!customerForm.hotelVillaName || !customerForm.roomNumber))}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Booking Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Chat Messages Step */}
        {bookingStep === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">Start a conversation with {therapist.name}</p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => {
                  const isOwn = msg.senderType === 'customer' || 
                               (msg.senderId !== therapist.id && msg.senderType !== 'therapist' && msg.senderType !== 'system');
                  const isSystem = msg.senderType === 'system' || msg.isSystemMessage;

                  if (isSystem) {
                    // Enhanced system message styling based on content
                    const isSuccess = msg.message.includes('✅') || msg.message.includes('🎉') || msg.message.includes('✨');
                    const isWarning = msg.message.includes('⚠️') || msg.message.includes('⏰');
                    const isError = msg.message.includes('❌');
                    const isInfo = msg.message.includes('📨') || msg.message.includes('🔄') || msg.message.includes('🚗') || msg.message.includes('💳');
                    
                    return (
                      <div key={msg.$id} className="flex justify-center my-2">
                        <div className={`text-xs px-4 py-2 rounded-xl max-w-[90%] text-center ${
                          isError ? 'bg-red-100 text-red-700 border border-red-200' :
                          isWarning ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          isSuccess ? 'bg-green-100 text-green-700 border border-green-200' :
                          isInfo ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.$id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        {!isOwn && (
                          <div className="text-xs font-medium text-orange-500 mb-1">
                            {msg.senderName}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-orange-100 justify-end' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                          {isOwn && msg.read && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Booking Action Buttons - Show when therapist accepted */}
      {bookingStep === 'chat' && chatState.currentBooking?.status === 'therapist_accepted' && (
        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <p className="text-xs text-blue-700 mb-2 text-center">
            ✅ {therapist.name} accepted your booking. Confirm now!
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmBooking}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              Confirm Booking
            </button>
            <button
              onClick={cancelBooking}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Options - Show when service completed */}
      {bookingStep === 'chat' && chatState.currentBooking?.status === 'completed' && !chatState.currentBooking?.paymentStatus && (
        <div className="p-3 bg-emerald-50 border-t border-emerald-200">
          <p className="text-xs text-emerald-700 mb-2 text-center">
            ✨ Service completed! How would you like to pay?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => confirmPayment('cash')}
              className="flex-1 py-2.5 bg-white border-2 border-emerald-400 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-1"
            >
              💵 Cash
            </button>
            <button
              onClick={() => {
                shareBankCard();
                confirmPayment('bank_transfer');
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-1"
            >
              <CreditCard className="w-4 h-4" />
              Bank Transfer
            </button>
          </div>
        </div>
      )}

      {/* Message Input - Only show in chat step */}
      {bookingStep === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
          {/* Spam Warning */}
          {messageWarning && (
            <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{messageWarning}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                // Clear warning when user starts typing again
                if (messageWarning) setMessageWarning(null);
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-orange-200 outline-none text-sm"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || isSending}
              className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Connection status */}
          <div className={`text-xs text-center mt-2 flex items-center justify-center gap-1 ${isConnected ? 'text-green-500' : 'text-orange-500'}`}>
            {isConnected ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Messages delivered instantly
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Connecting to server...
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PersistentChatWindow);
