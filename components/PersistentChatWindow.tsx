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
import { usePersistentChat, ChatMessage, BookingStep } from '../context/PersistentChatProvider';
import { MessageCircle, X, Minus, Send, Clock, MapPin, User, Phone, Check, ChevronLeft, Wifi, WifiOff, Calendar, Star, Sparkles } from 'lucide-react';

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
  } = usePersistentChat();

  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    whatsApp: '',
    location: '',
    locationType: '' as 'home' | 'hotel' | 'villa' | '',
    coordinates: null as { lat: number; lng: number } | null,
    hotelVillaName: '',
    roomNumber: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [arrivalCountdown, setArrivalCountdown] = useState(3600); // 1 hour in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      whatsApp: customerForm.whatsApp,
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
    
    let bookingMessage = `📋 ${isScheduleMode ? 'SCHEDULED BOOKING REQUEST' : 'BOOKING REQUEST'}\n\n` +
      `👤 Name: ${customerForm.name}\n` +
      `📱 WhatsApp: ${customerForm.whatsApp}\n` +
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
      await sendMessage(bookingMessage);
      setBookingStep('chat');
    } catch (error) {
      console.error('Failed to send booking request:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      await sendMessage(content);
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
      className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ 
        height: 'min(600px, calc(100vh - 100px))',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center gap-3">
        {bookingStep !== 'duration' && (
          <button
            onClick={() => setBookingStep('duration')}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
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
            {isConnected ? (
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

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-white">
        
        {/* Duration Selection Step */}
        {bookingStep === 'duration' && (
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-semibold text-gray-800">Select Duration</h4>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred massage duration</p>
            </div>
            
            <div className="space-y-3">
              {DURATION_OPTIONS.map((option) => {
                const price = getPrice(option.minutes);
                return (
                  <button
                    key={option.minutes}
                    onClick={() => handleDurationSelect(option.minutes)}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-left group"
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
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Prices may vary based on location and time
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
            <div className="text-center mb-4">
              <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                  alt="Indastreet Massage"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h4 className="font-semibold text-gray-800">Your Details</h4>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDuration} min • {formatPrice(getPrice(selectedDuration || 60))}
              </p>
              {isScheduleMode && selectedDate && selectedTime && (
                <p className="text-sm text-orange-600 mt-1">
                  📅 {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                </p>
              )}
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
                  <Phone className="w-4 h-4 inline mr-1" />
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={customerForm.whatsApp}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, whatsApp: e.target.value }))}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Massage Required In... *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'home', label: 'Home', icon: '🏠' },
                    { value: 'hotel', label: 'Hotel', icon: '🏨' },
                    { value: 'villa', label: 'Villa', icon: '🏡' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCustomerForm(prev => ({ ...prev, locationType: option.value as 'home' | 'hotel' | 'villa' }))}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        customerForm.locationType === option.value
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Your Location (Optional)
                </label>
                
                {/* GPS Set Location Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!navigator.geolocation) {
                      alert('Geolocation is not supported by your browser. You can share your location in chat.');
                      return;
                    }
                    
                    setIsGettingLocation(true);
                    
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setCustomerForm(prev => ({
                          ...prev,
                          coordinates: { lat: latitude, lng: longitude }
                        }));
                        setIsGettingLocation(false);
                        console.log('📍 Location set:', latitude, longitude);
                      },
                      (error) => {
                        console.error('Location error:', error);
                        setIsGettingLocation(false);
                        alert('Unable to get your location. Don\'t worry - you can share your location in chat with the therapist.');
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
                {customerForm.coordinates && (
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
                        {customerForm.coordinates.lat.toFixed(6)}, {customerForm.coordinates.lng.toFixed(6)}
                      </div>
                    </div>
                    <a 
                      href={`https://www.google.com/maps?q=${customerForm.coordinates.lat},${customerForm.coordinates.lng}`}
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
                      {customerForm.locationType === 'hotel' ? '🏨' : '🏡'} {customerForm.locationType === 'hotel' ? 'Hotel' : 'Villa'} Name *
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
                      🛏️ Room Number *
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
                disabled={isSending || !customerForm.name || !customerForm.whatsApp || !customerForm.locationType || ((customerForm.locationType === 'hotel' || customerForm.locationType === 'villa') && (!customerForm.hotelVillaName || !customerForm.roomNumber))}
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
                    return (
                      <div key={msg.$id} className="flex justify-center">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {msg.message}
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

      {/* Message Input - Only show in chat step */}
      {bookingStep === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
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
