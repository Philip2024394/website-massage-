// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * FloatingChatWindow Component - Appwrite-First Architecture
 * 
 * Purpose: Main standalone chat window that consumes ChatProvider
 * Data Flow: Appwrite → ChatProvider → FloatingChatWindow → UI Components
 * 
 * CRITICAL: This component now uses ChatProvider instead of props
 * - No dependency on App.tsx state
 * - Always renders if chat rooms exist
 * - Automatically appears when Appwrite subscription fires
 * 
 * Features:
 * - Draggable window
 * - Minimizable/Maximizable
 * - Orange header (brand color)  
 * - Real-time message updates via ChatProvider
 * - Multiple chat rooms support
 * - Persists position across reloads
 * - Fully standalone architecture
 * 
 * Usage:
 * ```tsx
 * <ChatProvider>
 *   <FloatingChatWindow />
 * </ChatProvider>
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatProvider';
import { useChatMessages } from './hooks/useChatMessages';
import { useNotifications } from './hooks/useNotifications';
import { BookingBanner } from './BookingBanner';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { getAutoAssignedAvatar, type AvatarOption } from '../constants/chatAvatars';

interface FloatingChatWindowProps {
  userId?: string;
  userName?: string;
  userRole?: string;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({ 
  userId = 'guest', 
  userName = 'Guest User', 
  userRole = 'customer' 
}) => {
  console.log('🎪 [FloatingChatWindow] Initialized with ChatProvider');

  // Get chat data from provider
  const {
    activeChatRooms,
    isLoading,
    subscriptionActive,
    openChatRoom,
    closeChatRoom,
    minimizeChatRoom,
    isMinimized: isChatMinimized
  } = useChatContext();

  // Window state
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 420, 
    y: window.innerHeight - 620 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Avatar state (automatically assigned)
  const [userAvatar, setUserAvatar] = useState<AvatarOption | null>(null);

  // NEW: Booking form state for booking-in-progress chats
  const [bookingFormData, setBookingFormData] = useState({
    customerName: '',
    customerWhatsApp: '',
    location: '',
    coordinates: null as { lat: number; lng: number } | null,
    serviceVenueType: 'home' as 'home' | 'villa' | 'hotel',
    manualAddress1: '',
    manualAddress2: '',
    roomNumber: ''
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  // 🌍 FACEBOOK-STYLE: Auto-populate location from silent capture
  useEffect(() => {
    const loadSilentLocation = async () => {
      // Only if we don't have coordinates yet
      if (bookingFormData.coordinates) return;
      
      try {
        const { getStoredLocation, enhanceLocation } = await import('../utils/silentLocationCapture');
        const stored = getStoredLocation();
        
        if (stored) {
          console.log('🎯 Auto-populating location from silent capture:', stored);
          
          // Enhance location for better address
          const enhanced = await enhanceLocation(stored);
          
          setBookingFormData(prev => ({
            ...prev,
            coordinates: { lat: enhanced.lat, lng: enhanced.lng },
            location: enhanced.address || `${enhanced.lat.toFixed(4)}, ${enhanced.lng.toFixed(4)}`
          }));
        }
      } catch (error) {
        console.log('ℹ️ No auto-location available:', error);
      }
    };
    
    // Load when booking form is active
    if (activeChatRooms.length > 0) {
      loadSilentLocation();
    }
  }, [activeChatRooms.length, bookingFormData.coordinates]);

  // Refs
  const windowRef = useRef<HTMLDivElement>(null);

  // Select first chat room by default and auto-open chat window
  useEffect(() => {
    if (activeChatRooms.length > 0 && !selectedChatId) {
      const firstRoom = activeChatRooms[0];
      setSelectedChatId(firstRoom.$id);
      
      // Auto-open the first chat room to show booking details
      openChatRoom(firstRoom.$id);
      
      console.log('📬 [FloatingChatWindow] Auto-selected and opened first chat room:', firstRoom.$id);
    }
  }, [activeChatRooms, selectedChatId, openChatRoom]);

  // Get current chat room
  const currentChatRoom = activeChatRooms.find(room => room.$id === selectedChatId);

  // Chat messages hook for current room
  const {
    messages,
    loading: messagesLoading,
    sending,
    error: messagesError,
    sendMessage
  } = useChatMessages(
    currentChatRoom?.$id || null,
    currentChatRoom?.customerId || '', // TODO: Get from auth context
    currentChatRoom?.customerName || '', // TODO: Get from auth context  
    'customer' // TODO: Get from auth context
  );

  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications();

  // Show notification for new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    
    // Only notify for messages from others
    if (latestMessage.senderId !== userId && latestMessage.senderType !== userRole) {
      addNotification(
        'info',
        'New Message',
        `${latestMessage.senderName}: ${latestMessage.content.substring(0, 50)}${latestMessage.content.length > 50 ? '...' : ''}`
      );
    }
  }, [messages.length]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragOffset.y));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('chat-window-position', JSON.stringify(position));
  }, [position]);

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chat-window-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (err) {
        console.warn('⚠️ [FloatingChatWindow] Could not parse saved position');
      }
    }
  }, []);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      
      // Show success notification
      addNotification('success', 'Message Sent', 'Your message was delivered', { duration: 2000 });
    } catch (err) {
      addNotification('error', 'Send Failed', 'Could not send message. Please try again.');
      throw err;
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!currentChatRoom) return;
    
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.');
    if (!confirmCancel) return;
    
    try {
      console.log('🚫 Cancelling booking:', currentChatRoom.bookingId);
      
      // Dynamic import to avoid circular dependency
      const { cancelBooking } = await import('../lib/chatService');
      
      await cancelBooking(
        currentChatRoom.bookingId as string,
        currentChatRoom.$id,
        currentChatRoom.customerId
      );
      
      addNotification('success', 'Booking Cancelled', 'Your booking has been cancelled successfully', { duration: 3000 });
    } catch (err: any) {
      console.error('❌ Failed to cancel booking:', err);
      addNotification('error', 'Cancel Failed', err.message || 'Could not cancel booking. Please try again.');
    }
  };

  // NEW: Handle sharing bank details
  const handleShareBankDetails = async (chatRoomId: string) => {
    try {
      // Mock bank details - in production, fetch from therapist profile
      const bankDetails = {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '1234567890',
        accountHolder: userName || 'Therapist Name'
      };

      const bankMessage = `💳 **Bank Details for Payment**

🏦 **Bank:** ${bankDetails.bankName}
💳 **Account:** ${bankDetails.accountNumber}
👤 **Name:** ${bankDetails.accountHolder}

*Please transfer after service completion*`;

      await sendMessage(bankMessage);
      addNotification('success', 'Bank Details Shared', 'Your bank details have been sent to the customer');
    } catch (err: any) {
      addNotification('error', 'Share Failed', 'Could not share bank details. Please try again.');
      console.error('❌ Failed to share bank details:', err);
    }
  };

  // Auto-assign avatar when chat opens
  useEffect(() => {
    if (activeChatRooms.length > 0 && !userAvatar) {
      const autoAvatar = getAutoAssignedAvatar(userId);
      setUserAvatar(autoAvatar);
      
      console.log('✅ Avatar auto-assigned:', {
        avatar: autoAvatar.label,
        imageUrl: autoAvatar.imageUrl
      });
      
      addNotification(
        'success', 
        'Avatar Assigned', 
        `Your chat avatar has been set!`
      );
    }
  }, [activeChatRooms.length, userAvatar, userId]);

  // NEW: Handle getting GPS location with Google Geocoding
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      addNotification('error', 'Not Supported', 'Geolocation is not supported by your device');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        try {
          // Use Google Geocoding API to get readable address
          const { GOOGLE_MAPS_API_KEY } = await import('../lib/appwrite.config');
          
          if (!GOOGLE_MAPS_API_KEY) {
            console.warn('⚠️ Google Maps API key not configured, using GPS coordinates');
            setBookingFormData(prev => ({ 
              ...prev, 
              coordinates: coords,
              location: `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
            }));
            setGettingLocation(false);
            addNotification('success', 'Location Set', 'Using GPS coordinates');
            return;
          }

          // Call Google Geocoding API
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
          
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Get the formatted address (most detailed)
            const formattedAddress = data.results[0].formatted_address;
            
            // Try to extract meaningful parts
            const addressComponents = data.results[0].address_components;
            let cityName = '';
            let areaName = '';
            
            // Find locality (city) and sublocality (area/district)
            for (const component of addressComponents) {
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                cityName = component.long_name;
              }
              if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                areaName = component.long_name;
              }
            }
            
            // Create a clean location string
            const locationString = areaName && cityName 
              ? `${areaName}, ${cityName}` 
              : cityName || formattedAddress;
            
            console.log('📍 Google Geocoding Result:', {
              formattedAddress,
              cityName,
              areaName,
              finalLocation: locationString
            });
            
            setBookingFormData(prev => ({ 
              ...prev, 
              coordinates: coords,
              location: locationString
            }));
            setGettingLocation(false);
            addNotification('success', 'Location Set', `Found: ${locationString}`);
          } else {
            // Geocoding failed, fallback to GPS coordinates
            console.warn('⚠️ Geocoding failed:', data.status);
            setBookingFormData(prev => ({ 
              ...prev, 
              coordinates: coords,
              location: `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
            }));
            setGettingLocation(false);
            addNotification('success', 'Location Set', 'Using GPS coordinates');
          }
        } catch (geocodeError) {
          console.error('❌ Geocoding error:', geocodeError);
          // Fallback to GPS coordinates on error
          setBookingFormData(prev => ({ 
            ...prev, 
            coordinates: coords,
            location: `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
          }));
          setGettingLocation(false);
          addNotification('success', 'Location Set', 'Using GPS coordinates');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Could not get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable in settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out';
        }
        addNotification('error', 'Location Error', errorMsg);
        setGettingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, // Increased timeout for geocoding
        maximumAge: 0 
      }
    );
  };

  // NEW: Handle booking confirmation from form
  const handleConfirmBooking = async (chatRoomId: string) => {
    const chatRoom = activeChatRooms.find(r => r.$id === chatRoomId);
    if (!chatRoom || chatRoom.status !== 'booking-in-progress') return;

    // Validate form
    if (!bookingFormData.customerName || !bookingFormData.customerWhatsApp || !bookingFormData.coordinates) {
      addNotification('error', 'Missing Information', 'Please fill in all required fields and set your location');
      return;
    }

    // Validate manual address (at least one field required)
    if (!bookingFormData.manualAddress1 && !bookingFormData.manualAddress2) {
      addNotification('error', 'Address Required', 'Please enter your complete address in the address fields');
      return;
    }

    // Validate WhatsApp number
    const cleanedWhatsApp = bookingFormData.customerWhatsApp.replace(/\D/g, '');
    if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
      addNotification('error', 'Invalid WhatsApp', 'Please enter a valid WhatsApp number (8-15 digits)');
      return;
    }

    try {
      console.log('🔥 BOOKING CONFIRMED', bookingFormData);

      // Import necessary services
      const { databases } = await import('../lib/appwrite');
      const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
      const { ensureAuthSession } = await import('../lib/authSessionHelper');
      const { createChatRoom, sendWelcomeMessage, sendBookingReceivedMessage } = await import('../lib/chatService');
      
      // Ensure authentication
      const authResult = await ensureAuthSession('booking confirmation');
      if (!authResult.success) {
        addNotification('error', 'Authentication Failed', 'Please try again');
        return;
      }

      const userId = authResult.userId!;
      const formattedWhatsApp = `+62${cleanedWhatsApp}`;

      // Calculate price - Use therapist's exact pricing from profile
      const price = chatRoom.pricing[String(chatRoom.duration)] || 0;
      
      // Validate price exists
      if (!price || price === 0) {
        console.error('⚠️ PRICING ERROR: No price found for duration', chatRoom.duration, 'in pricing:', chatRoom.pricing);
        addNotification('error', 'Price Error', 'Could not determine service price. Please try again.');
        return;
      }
      
      console.log('💰 Booking price calculation:', {
        duration: chatRoom.duration,
        totalPrice: price,
        adminCommission: Math.round(price * 0.30),
        therapistReceives: Math.round(price * 0.70)
      });

      // Prepare booking data
      const bookingData: any = {
        bookingId: `booking_${Date.now()}`,
        bookingDate: new Date().toISOString(),
        userId: String(userId),
        status: 'Pending',
        duration: Number(chatRoom.duration),
        providerId: String(chatRoom.providerId),
        providerType: 'therapist',
        providerName: String(chatRoom.providerName),
        service: String(chatRoom.duration),
        startTime: new Date().toISOString(),
        price: Number(Math.round(price / 1000)),
        createdAt: new Date().toISOString(),
        responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),   
        totalCost: price,
        paymentMethod: 'Unpaid',
        scheduledTime: new Date().toISOString(),
        customerName: bookingFormData.customerName,
        customerWhatsApp: formattedWhatsApp,
        customerLocation: bookingFormData.location,
        customerLatitude: bookingFormData.coordinates.lat,
        customerLongitude: bookingFormData.coordinates.lng,          serviceVenueType: bookingFormData.serviceVenueType,
          manualAddress1: bookingFormData.manualAddress1,
          manualAddress2: bookingFormData.manualAddress2,
          fullAddress: `${bookingFormData.manualAddress1}${bookingFormData.manualAddress2 ? ', ' + bookingFormData.manualAddress2 : ''}`,        bookingType: 'immediate',
        therapistId: chatRoom.providerId,
        therapistName: chatRoom.providerName,
        therapistType: 'therapist'
      };

      // 🔥 Save booking to Appwrite with dashboard integration
      console.log('📡 [CHAT→DASHBOARD] Creating booking that will notify therapist dashboard in real-time');
      
      const bookingResponse = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        'unique()',
        bookingData
      );

      console.log('✅ [CHAT→DASHBOARD] Booking saved with dashboard integration:', bookingResponse.$id);
      console.log('📡 [REAL-TIME] Therapist dashboard will receive notification via subscription');

      // 🔥 Create real chat room with full integration
      console.log('🎪 [CHAT INTEGRATION] Creating chat room for booking communication');
      
      const realChatRoom = await createChatRoom({
        bookingId: bookingResponse.$id,
        customerId: userId,
        customerName: bookingFormData.customerName,
        customerLanguage: 'en',
        customerPhoto: '',
        therapistId: chatRoom.providerId,
        therapistName: chatRoom.providerName,
        therapistLanguage: 'id',
        therapistType: 'therapist',
        therapistPhoto: chatRoom.providerImage || '',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });

      console.log('✅ Chat room created:', realChatRoom.$id);

      // Send welcome messages
      try {
        await sendWelcomeMessage(realChatRoom.$id || '', chatRoom.providerName || '', userId || '');
        await sendBookingReceivedMessage(realChatRoom.$id || '', userId || '');
      } catch (err) {
        console.warn('⚠️ Welcome messages failed:', err);
      }

      // Replace temp chat with real chat
      closeChatRoom(chatRoomId);
      
      addNotification('success', 'Booking Confirmed', 'Chat window will update shortly');
      
      // Reset form
      setBookingFormData({ customerName: '', customerWhatsApp: '', location: '', coordinates: null });

      // The Appwrite subscription will automatically add the new chat room

    } catch (err: any) {
      console.error('❌ Booking confirmation failed:', err);
      addNotification('error', 'Booking Failed', err.message || 'Please try again');
    }
  };

  // Don't render anything if no subscription or loading
  if (!subscriptionActive && !isLoading) {
    console.log('🔌 [FloatingChatWindow] No subscription - not rendering');
    return null;
  }

  if (activeChatRooms.length === 0 && !isLoading) {
    console.log('📭 [FloatingChatWindow] No active chat rooms - not rendering');
    return null;
  }

  console.log('🎯 [FloatingChatWindow] Rendering with rooms:', activeChatRooms.map(r => r.$id));

  return (
    <>
      {/* Render all active chat rooms */}
      {activeChatRooms.map((chatRoom, index) => {
        const isMinimized = isChatMinimized(chatRoom.$id);
        const isSelected = chatRoom.$id === selectedChatId;
        
        return (
          <div
            key={chatRoom.$id}
            ref={isSelected ? windowRef : null}
            className={`
              fixed bg-white rounded-t-2xl shadow-2xl border border-gray-200 z-50
              transition-all duration-300 ease-in-out
              ${isMinimized ? 'h-16' : 'h-[600px]'}
              w-96
            `}
            style={{
              right: `${16 + (index * 20)}px`,
              bottom: '0px',
              transform: isMinimized ? 'translateY(calc(100% - 64px))' : 'translateY(0)'
            }}
          >
            {/* Header */}
            <div 
              className="bg-orange-500 text-white p-4 rounded-t-2xl cursor-move flex items-center justify-between"
              onMouseDown={isSelected ? handleMouseDown : undefined}
            >
              <div className="flex items-center gap-3">
                {/* Profile Image */}
                <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(chatRoom as any).providerProfilePicture || (chatRoom as any).profilePicture ? (
                    <img 
                      src={(chatRoom as any).providerProfilePicture || (chatRoom as any).profilePicture} 
                      alt={chatRoom.providerName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-lg font-bold">${chatRoom.providerName.charAt(0).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {chatRoom.providerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Chat Info */}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {chatRoom.providerName}
                    {/* Lock Indicator for Booking in Progress */}
                    {chatRoom.status === 'booking-in-progress' && (
                      <span 
                        className="text-sm bg-orange-400 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse"
                        title="Complete booking to unlock full chat"
                      >
                        🔒
                      </span>
                    )}
                  </h3>
                  <p className="text-orange-100 text-sm">
                    {chatRoom.status === 'booking-in-progress' ? '📋 Complete Booking Form' : '📍 Service Location'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Lock Status Indicator */}
                {chatRoom.status === 'booking-in-progress' && (
                  <button
                    onClick={() => {
                      addNotification(
                        'info',
                        'Chat Locked',
                        'Complete the booking form below to unlock full chat features',
                        { duration: 3000 }
                      );
                    }}
                    className="p-2 hover:bg-orange-600 rounded-full transition-colors text-white animate-pulse"
                    title="Chat locked until booking is complete"
                  >
                    🔒
                  </button>
                )}

                {/* Bank Details for Therapists */}
                {userRole === 'therapist' && (
                  <button
                    onClick={() => handleShareBankDetails(chatRoom.$id)}
                    className="p-2 hover:bg-orange-600 rounded-full transition-colors text-white"
                    title="Share Bank Details"
                  >
                    💳
                  </button>
                )}
                
                {/* Chat Selector (if multiple chats) */}
                {activeChatRooms.length > 1 && (
                  <button
                    onClick={() => setSelectedChatId(chatRoom.$id)}
                    className={`
                      p-2 rounded-full transition-colors text-sm font-bold
                      ${isSelected ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-400'}
                    `}
                  >
                    {index + 1}
                  </button>
                )}

                {/* Minimize/Maximize */}
                <button
                  onClick={() => isMinimized ? openChatRoom(chatRoom.$id) : minimizeChatRoom(chatRoom.$id)}
                  className="p-2 hover:bg-orange-600 rounded-full transition-colors"
                >
                  {isMinimized ? '⬆️' : '⬇️'}
                </button>

                {/* Close */}
                <button
                  onClick={() => closeChatRoom(chatRoom.$id)}
                  className="p-2 hover:bg-orange-600 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Only show content for selected & non-minimized chat */}
            {isSelected && !isMinimized && (
              <div className="flex flex-col h-[calc(100%-80px)] relative">
                
                {/* BOOKING FORM for booking-in-progress status */}
                {chatRoom.status === 'booking-in-progress' && (
                  <div className="flex-1 flex flex-col p-4  scrollbar-hide relative">
                    
                    {/* Lock Overlay floating over the booking form */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/95 to-white/95 backdrop-blur-md z-20 flex items-center justify-center">
                      <div className="text-center px-6 py-8 max-w-sm bg-white/90 rounded-2xl shadow-2xl border-2 border-orange-200">
                        <div className="mb-6 relative">
                          <div className="inline-block text-7xl drop-shadow-2xl lock-bounce filter">
                            🔒
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center -z-10">
                            <div className="w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-ping"></div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 drop-shadow">Chat Locked</h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4 font-medium">
                          Complete the booking form below to unlock the full chat experience with <span className="text-orange-600 font-bold">{chatRoom.providerName}</span>
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-orange-700 font-bold bg-orange-100 rounded-full px-4 py-2 animate-pulse shadow-inner">
                          <span className="text-base">⬇️</span>
                          <span>Scroll down to fill the form</span>
                          <span className="text-base">⬇️</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                          Form fields are below
                        </div>\n                      </div>\n                    </div>

                    {/* Booking Details Banner */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-orange-600">📋</span>
                        Booking Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Therapist:</span>
                          <span className="font-medium text-gray-900">{chatRoom.providerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium text-gray-900">{chatRoom.duration} minutes massage</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="font-bold text-orange-600">
                            IDR {Math.round((chatRoom.pricing[String(chatRoom.duration)] || 0) / 1000)}K
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-orange-200 pt-2 mt-2">
                          <span className="text-gray-500 text-xs">Admin Fee (30%):</span>
                          <span className="text-gray-700 text-xs font-medium">
                            IDR {Math.round((chatRoom.pricing[String(chatRoom.duration)] || 0) * 0.30 / 1000)}K
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-xs">Therapist Receives:</span>
                          <span className="text-green-600 text-xs font-bold">
                            IDR {Math.round((chatRoom.pricing[String(chatRoom.duration)] || 0) * 0.70 / 1000)}K
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={bookingFormData.customerName}
                          onChange={(e) => setBookingFormData(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Number
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                            +62
                          </span>
                          <input
                            type="tel"
                            value={bookingFormData.customerWhatsApp}
                            onChange={(e) => setBookingFormData(prev => ({ ...prev, customerWhatsApp: e.target.value.replace(/\D/g, '') }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="812345678"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter without +62 prefix</p>
                      </div>

                    {/* Gender Preference Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Therapist Gender Preference
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, gender: 'male' }))}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                            bookingFormData.gender === 'male'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <img 
                            src="https://ik.imagekit.io/7grri5v7d/male_icon-removebg-preview%20(1).png" 
                            alt="Male"
                            className="w-6 h-6 object-contain"
                          />
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, gender: 'female' }))}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                            bookingFormData.gender === 'female'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <img 
                            src="https://ik.imagekit.io/7grri5v7d/male_icons-removebg-preview.png" 
                            alt="Female"
                            className="w-6 h-6 object-contain"
                          />
                          Female
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, gender: 'children' }))}
                          className={`px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                            bookingFormData.gender === 'children'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <img 
                            src="https://ik.imagekit.io/7grri5v7d/male_iconss-removebg-preview.png" 
                            alt="Children"
                            className="w-6 h-6 object-contain"
                          />
                          Children
                        </button>
                      </div>
                    </div>

                    {/* NEW: Venue Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Venue
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, serviceVenueType: 'home' }))}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            bookingFormData.serviceVenueType === 'home'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          🏠 Home
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, serviceVenueType: 'villa' }))}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            bookingFormData.serviceVenueType === 'villa'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          🏡 Villa
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFormData(prev => ({ ...prev, serviceVenueType: 'hotel' }))}
                          className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                            bookingFormData.serviceVenueType === 'hotel'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          🏨 Hotel
                        </button>
                      </div>
                    </div>

                    {/* NEW: Manual Address Input Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address / Building Name
                      </label>
                      <input
                        type="text"
                        value={bookingFormData.manualAddress1 || ''}
                        onChange={(e) => setBookingFormData(prev => ({ ...prev, manualAddress1: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Jl. Sunset Road No. 123 or Villa Seminyak"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area / District / Postal Code
                      </label>
                      <input
                        type="text"
                        value={bookingFormData.manualAddress2 || ''}
                        onChange={(e) => setBookingFormData(prev => ({ ...prev, manualAddress2: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Seminyak, Badung 80361"
                      />
                    </div>
                      <div className="hidden">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Location
                        </label>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={gettingLocation}
                          className={`w-full px-4 py-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                            bookingFormData.coordinates
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100'
                          } ${gettingLocation ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <span>
                            {gettingLocation
                              ? 'Getting Location...'
                              : bookingFormData.coordinates
                              ? '✓ Location Set'
                              : 'Set My Location'}
                          </span>
                        </button>
                          <p className="text-xs text-gray-500 mt-1">🌍 Location automatically detected for spam verification (Facebook-style)</p>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={() => handleConfirmBooking(chatRoom.$id)}
                        disabled={!bookingFormData.customerName || !bookingFormData.customerWhatsApp || !bookingFormData.coordinates || (!bookingFormData.manualAddress1 && !bookingFormData.manualAddress2)}
                      className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      Confirm Booking
                    </button>

                    {/* Lock Status Info */}
                    <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl animate-pulse">🔒</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-yellow-800 text-sm mb-1">Chat Locked</h4>
                          <p className="text-xs text-yellow-700 leading-relaxed">
                            Complete the booking form above to unlock the full chat. Once confirmed, you'll be able to message {chatRoom.providerName} directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* REGULAR CHAT for other statuses */}
                {chatRoom.status !== 'booking-in-progress' && (
                  <>
                    {/* Booking Banner with Real Booking Data */}
                    <BookingBanner
                      therapistName={chatRoom.providerName}
                      therapistPhoto={(chatRoom as any).therapistPhoto}
                      bookingDate={(chatRoom as any).serviceDate || 'Today'}
                      bookingTime={(chatRoom as any).serviceTime || 'Now'}
                      serviceDuration={String((chatRoom as any).serviceDuration || chatRoom.duration || 60)}
                      serviceType={(chatRoom as any).serviceType || 'Massage'}
                      bookingType={(chatRoom as any).bookingType || 'book_now'}
                      bookingStatus={chatRoom.status}
                      responseDeadline={(chatRoom as any).responseDeadline}
                      bookingId={(chatRoom as any).bookingId}
                      chatRoomId={chatRoom.$id}
                      onCancelBooking={handleCancelBooking}
                    />

                    {/* Loading state */}
                    {isLoading && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
                          <p className="text-gray-500 text-sm">Loading messages...</p>
                        </div>
                      </div>
                    )}

                    {/* Messages Error */}
                    {messagesError && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                          <div className="text-red-500 text-4xl mb-2">⚠️</div>
                          <p className="text-red-600 font-medium">Error Loading Messages</p>
                          <p className="text-gray-500 text-sm mt-1">{messagesError}</p>
                        </div>
                      </div>
                    )}

                    {/* Messages Container with Lock Overlay */}
                    {!isLoading && !messagesError && (
                      <div className="flex-1 relative overflow-hidden">
                        {/* Lock Overlay - Only visible when booking is in progress */}
                        {chatRoom.status === 'booking-in-progress' && (
                          <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="text-center px-6 py-8 max-w-xs">
                              <div className="mb-4 animate-bounce">
                                <div className="inline-block text-6xl drop-shadow-lg">🔒</div>
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">Chat Locked</h3>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                Complete the booking form to unlock chat with {chatRoom.providerName}
                              </p>
                              <div className="flex items-center justify-center gap-2 text-xs text-orange-600 font-medium">
                                <span className="animate-pulse">⬇️</span>
                                <span>Fill out the form below</span>
                                <span className="animate-pulse">⬇️</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Messages */}
                        <ChatMessages
                          messages={messages}
                          loading={messagesLoading}
                          currentUserId={currentChatRoom?.customerId || ''}
                          userRole="customer" // TODO: Get from auth context
                          therapistImage={currentChatRoom?.profilePicture}
                          customerAvatar={userAvatar}
                          therapistName={currentChatRoom?.providerName}
                          customerName={userName}
                        />
                      </div>
                    )}

                    {/* Input */}
                    {!isLoading && !messagesError && (
                      <ChatInput
                        onSend={sendMessage}
                        sending={sending}
                        placeholder={`Message ${chatRoom.providerName}...`}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
              notification.type === 'info' ? 'bg-blue-50 border-blue-500' :
              notification.type === 'success' ? 'bg-green-50 border-green-500' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{notification.title}</div>
                <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>


    </>
  );
};
