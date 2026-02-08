// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
/**
 * 📋 ACTIVE BOOKING FLOW #3: Menu Slider "Book Now"
 * 
 * This component handles booking when users:
 * 1. Click "Price List" on therapist card
 * 2. Select a service (60/90/120 min)
 * 3. Click "Book Now" with pre-selected duration
 * 
 * Flow: TherapistCard → Price List Modal → BookingPopup → Chat Opens
 * Source Attribution: 'price-slider'
 */
import React, { useState } from 'react';
import { Clock, AlertTriangle, X, User } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';
import { createChatRoom, sendSystemMessage } from '../lib/chatService';
import { showToast } from '../utils/showToastPortal';
import { useChatProvider } from '../hooks/useChatProvider';
import { logger } from '../utils/logger';
import { 
  validateBookingPayload, 
  validateUserInput,
  normalizeWhatsApp,
  generateBookingId,
  calculateResponseDeadline,
  logValidation,
  logPayload,
  logAppwriteResponse
} from '../services/bookingValidationService';
import { InlineLoadingSkeleton } from './LoadingSkeletons';
import { enterpriseBookingFlowService } from '../services/enterpriseBookingFlowService';
import { enterpriseChatIntegrationService } from '../services/enterpriseChatIntegrationService';

// Extend window type for global booking tracker
declare global {
  interface Window {
    openBookingStatusTracker?: (statusInfo: {
      bookingId: string;
      therapistName: string;
      duration: number;
      price: number;
      responseDeadline: Date;
    }) => void;
  }
}

interface BookingOption {
  duration: number;
  price: number;
}

interface BookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  profilePicture?: string;
  providerType?: string;
  hotelVillaId?: string;
  hotelVillaName?: string;
  hotelVillaType?: 'hotel' | 'villa';
  hotelVillaLocation?: string;
  pricing?: { [key: string]: number };
  discountPercentage?: number;
  discountActive?: boolean;
  initialDuration?: number; // Prefill duration from price slider
  bookingSource?: string; // Track booking origin (e.g., 'price-slider', 'quick-book')
  discountCode?: string | null; // Discount code from chat
}

const BookingPopup: React.FC<BookingPopupProps> = ({
  isOpen,
  onClose,
  therapistId,
  therapistName,
  profilePicture,
  providerType,
  hotelVillaId,
  hotelVillaName,
  hotelVillaType,
  hotelVillaLocation,
  pricing,
  discountPercentage = 0,
  discountActive = false,
  initialDuration, // Prefill from price slider
  bookingSource = 'quick-book', // Default source
  discountCode = null
}) => {
  const { language } = useLanguage();
  
  // Get ChatProvider functions for opening chats
  const { openBookingChat } = useChatProvider();
  
  const [showWarning, setShowWarning] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(initialDuration || null);
  const [isCreating, setIsCreating] = useState(false);
  
  // User information fields
  const [customerName, setCustomerName] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+62');
  const [customerWhatsApp, setCustomerWhatsApp] = useState<string>('');
  const [locationType, setLocationType] = useState<'hotel' | 'villa' | 'home'>('hotel');
  const [hotelVillaNameInput, setHotelVillaNameInput] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [homeAddress, setHomeAddress] = useState<string>('');

  // Check if this is a hotel/villa booking
  const isHotelVillaBooking = Boolean(hotelVillaId && hotelVillaName);

  // Use pricing from props if available, otherwise use default prices
  // Note: pricing contains FULL IDR amounts (e.g., 250000). We will format to K only for display.
  const bookingOptions: BookingOption[] = [
    { 
      duration: 60, 
      price: pricing && pricing["60"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["60"]) * (1 - discountPercentage / 100))
            : Number(pricing["60"]))
        : 250000 // Default IDR 250K
    },
    { 
      duration: 90, 
      price: pricing && pricing["90"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["90"]) * (1 - discountPercentage / 100))
            : Number(pricing["90"]))
        : 350000 // Default IDR 350K
    },
    { 
      duration: 120, 
      price: pricing && pricing["120"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["120"]) * (1 - discountPercentage / 100))
            : Number(pricing["120"]))
        : 450000 // Default IDR 450K
    }
  ];

  const createBookingRecord = async () => {
    if (!selectedDuration) {
      logger.warn('No duration selected');
      showToast('Please select a service duration', 'error');
      return;
    }
    
    // Enhanced validation for required fields
    if (!customerName || customerName.trim().length === 0) {
      showToast('Please enter your name', 'error');
      return;
    }
    
    if (!customerWhatsApp || customerWhatsApp.trim().length === 0) {
      showToast('Please enter your WhatsApp number', 'error');
      return;
    }
    
    if (locationType === 'home' && (!homeAddress || homeAddress.trim().length === 0)) {
      showToast('Please enter your home address', 'error');
      return;
    }
    
    if (locationType !== 'home') {
      if (!hotelVillaNameInput || hotelVillaNameInput.trim().length === 0) {
        showToast(`Please enter the ${locationType === 'hotel' ? 'hotel' : 'villa'} name`, 'error');
        return;
      }
      if (!roomNumber || roomNumber.trim().length === 0) {
        showToast('Please enter your room number', 'error');
        return;
      }
    }

    logger.info('Starting booking creation process');
    logger.debug('Booking source', { bookingSource, initialDuration });

    try {
      setIsCreating(true);

      // ✅ ENSURE AUTHENTICATION: Anonymous session required for booking creation
      // This is a protected Appwrite operation that requires a valid session
      const { ensureAuthSession } = await import('../lib/authSessionHelper');
      const authResult = await ensureAuthSession('booking creation');
      
      if (!authResult.success) {
        logger.error('Cannot create booking without authentication');
        alert('Unable to authenticate. Please try again.');
        setIsCreating(false);
        return;
      }
      
      logger.info('Authentication confirmed for booking', { userId: authResult.userId });

      // If booking a place (venue), ensure current time is within opening hours
      const isPlace = (providerType || 'therapist') === 'place';
      if (isPlace) {
        try {
          const placeCollection = APPWRITE_CONFIG.collections.places;
          if (placeCollection && placeCollection !== '') {
            const place = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              placeCollection,
              therapistId
            );
            const openingTime: string | undefined = (place as any).openingTime;
            const closingTime: string | undefined = (place as any).closingTime;
            if (openingTime && closingTime) {
              const [oh, om] = openingTime.split(':').map(Number);
              const [ch, cm] = closingTime.split(':').map(Number);
              const now = new Date();
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              const openMinutes = oh * 60 + (om || 0);
              const closeMinutes = ch * 60 + (cm || 0);
              if (nowMinutes < openMinutes || nowMinutes > closeMinutes) {
                alert(`${therapistName} is currently closed (hours ${openingTime}–${closingTime}). Please schedule within opening hours.`);
                setIsCreating(false);
                return;
              }
            }
          }
        } catch (e) {
          logger.warn('Could not validate venue opening hours', e);
          // Continue; do not block booking if hours cannot be fetched
        }
      }

      const selectedOption = bookingOptions.find(opt => opt.duration === selectedDuration);
      if (!selectedOption) throw new Error('Invalid duration selected');

      // ===== PRE-FLIGHT VALIDATION =====
      const userInputValidation = validateUserInput({
        customerName: customerName,
        customerWhatsApp: customerWhatsApp,
        duration: selectedDuration,
        price: selectedOption.price
      });

      if (!userInputValidation.valid) {
        logValidation('User Input Failed', userInputValidation.errors);
        alert(userInputValidation.errors!.join('\n'));
        setIsCreating(false);
        return;
      }

      const now = new Date();
      const responseDeadline = calculateResponseDeadline();
      const bookingId = generateBookingId();

      // Normalize WhatsApp
      const normalizedWhatsApp = normalizeWhatsApp(`${countryCode}${customerWhatsApp}`);

      // ===== BUILD RAW BOOKING DATA =====
      const rawBookingData: any = {
        // REQUIRED FIELDS
        bookingId,
        bookingDate: now.toISOString(),
        userId: authResult.userId || 'anonymous', // ✅ REQUIRED: Ensure userId is never null for Appwrite
        status: 'Pending',
        duration: selectedOption.duration,
        providerId: therapistId,
        providerType: providerType || 'therapist',
        providerName: therapistName,
        service: String(selectedOption.duration),
        startTime: now.toISOString(),
        price: Math.round(selectedOption.price / 1000),
        createdAt: now.toISOString(),
        responseDeadline: responseDeadline.toISOString(),
        
        // OPTIONAL FIELDS
        therapistId: therapistId,
        therapistName: therapistName,
        therapistType: providerType || 'therapist',
        bookingType: 'immediate',
        totalCost: selectedOption.price,
        paymentMethod: 'Unpaid',
        customerName: customerName.trim(),
        customerWhatsApp: normalizedWhatsApp,
        ...(discountCode ? { discountCode } : {})
      };
  // Show discount code in UI if present
  // (Add this to the booking form UI, e.g. above the Confirm button)


      // Add optional location fields if present
      if (locationType !== 'home' && hotelVillaNameInput) {
        rawBookingData.hotelGuestName = hotelVillaNameInput.trim();
      }
      if (locationType !== 'home' && roomNumber) {
        rawBookingData.hotelRoomNumber = roomNumber.trim();
      }
      if (hotelVillaId) {
        rawBookingData.hotelId = hotelVillaId;
      }

      // ===== VALIDATE PAYLOAD =====
      const validation = validateBookingPayload(rawBookingData);

      if (!validation.valid) {
        logValidation('Payload Validation Failed', validation.errors);
        alert('Booking validation failed:\n' + validation.errors!.join('\n'));
        setIsCreating(false);
        return;
      }

      const bookingData = validation.payload!;
      
      // ===== CRITICAL: SANITIZE PAYLOAD (Remove undefined/null) =====
      Object.keys(bookingData).forEach(key => {
        if (bookingData[key] === undefined || bookingData[key] === null) {
          delete bookingData[key];
        }
      });

      logger.debug('[FINAL_BOOKING_PAYLOAD]', { payload: bookingData });
      logPayload(bookingData);

      // ===== 🚀 ENTERPRISE BOOKING FLOW INTEGRATION =====
      logger.info('[ENTERPRISE] Initiating enterprise booking flow');
      
      try {
        // Create enterprise booking request with proper data structure
        const enterpriseBookingId = await enterpriseBookingFlowService.createBookingRequest({
          userId: authResult.userId || 'anonymous_user',
          userDetails: {
            name: customerName.trim(),
            phone: normalizedWhatsApp,
            location: locationType === 'home' 
              ? homeAddress 
              : `${hotelVillaNameInput}, Room ${roomNumber}`
          },
          serviceType: 'book-now', // This is from price slider, always immediate
          services: [
            {
              id: `massage_${selectedDuration}min`,
              name: `${selectedDuration} Minute Massage`,
              duration: selectedOption.duration,
              price: selectedOption.price
            }
          ],
          totalPrice: selectedOption.price,
          duration: selectedOption.duration,
          location: {
            address: locationType === 'home' 
              ? homeAddress 
              : `${hotelVillaNameInput}, Room ${roomNumber}`,
            coordinates: { lat: 0, lng: 0 } // TODO: Get real coordinates
          },
          preferredTherapists: [therapistId],
          urgency: 'normal'
        });
        
        logger.info('[ENTERPRISE] Booking flow initiated', { enterpriseBookingId });
        
        // The enterprise system will:
        // 1. Assign to therapist with 5-minute timer
        // 2. Play MP3 notification sounds
        // 3. Auto-open therapist chat window
        // 4. Handle fallback to other therapists
        // 5. Create WhatsApp-free chat room
        
      } catch (enterpriseError) {
        logger.warn('[ENTERPRISE] Enterprise booking failed, continuing with legacy flow', enterpriseError);
        // Don't block the booking if enterprise system fails
      }
      
      logger.debug('STEP 1: Creating immediate booking with validated data');

      // Enforce Appwrite as single source of truth
      if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
        throw new Error('Bookings collection not configured - cannot create booking');
      }
      
      logger.debug('STEP 2: Creating booking via appwriteBookingService');
      
      // Prepare booking data for the service (map rawBookingData to service expected format)
      const serviceBookingData = {
        ...rawBookingData,
        customerId: authResult.userId || 'anonymous',
        userId: authResult.userId || 'anonymous', // ✅ REQUIRED: Ensure userId is provided
        // Map fields to match the service expectations
        therapistId: therapistId,
        therapistName: therapistName,
        customerName: customerName.trim(), // ✅ REQUIRED: Customer name
        customerWhatsApp: normalizedWhatsApp, // ✅ REQUIRED: Customer WhatsApp
        duration: selectedOption.duration,
        price: selectedOption.price, // Use full price, service will convert
        locationType: locationType,
        address: locationType === 'home' 
          ? homeAddress 
          : `${hotelVillaNameInput}, Room ${roomNumber}`,
        massageFor: 'adults', // Default value
        serviceType: 'Traditional Massage', // Default service type
        date: now.toISOString().split('T')[0], // Date part only
        time: now.toLocaleTimeString('en-US', { hour12: false }), // Time part only
      };
      
      // Use the proper booking service instead of direct database call
      const { appwriteBookingService } = await import('../lib/appwrite/services/booking.service.appwrite');
      const booking = await appwriteBookingService.createBooking(serviceBookingData);

      logger.info('STEP 2 COMPLETE: Booking created successfully', { bookingId: booking.$id });

      const acceptUrl = `${window.location.origin}/accept-booking/${booking.$id}`;
      
      // Enhanced WhatsApp message with complete customer information
      // selectedOption and isPlace already declared above
      
      let message = isPlace
        ? `🏢 NEW VENUE BOOKING - INDASTREET\n\n`
        : `🛵 NEW MOBILE BOOKING - INDASTREET\n\n`;
      
      // Customer Information
      message += `👤 CUSTOMER DETAILS:\n`;
      message += `Name: ${customerName}\n`;
      message += `WhatsApp: ${customerWhatsApp}\n\n`;
      
      // Location Information
      message += `📍 LOCATION:\n`;
      if (locationType === 'home') {
        message += `Type: Home Address\n`;
        message += `Address: ${homeAddress}\n\n`;
      } else {
        message += `Type: ${locationType === 'hotel' ? 'Hotel' : 'Villa'}\n`;
        message += `${locationType === 'hotel' ? 'Hotel' : 'Villa'} Name: ${hotelVillaNameInput}\n`;
        message += `Room Number: ${roomNumber}\n\n`;
      }
      
      // Service Details
      message += `💼 SERVICE DETAILS:\n`;
      message += `Duration: ${selectedDuration} minutes\n`;
      message += `Price: IDR ${Math.round(selectedOption.price / 1000)}K\n`;
      if (discountPercentage > 0) {
        message += `🔥 Discount: ${discountPercentage}% OFF Applied!\n`;
      }
      message += `Time: ${now.toLocaleString()}\n\n`;
      
      // Accept/Reject Link
      message += `🔗 RESPOND TO BOOKING:\n`;
      message += `${acceptUrl}\n\n`;
      
      // Important Notes
      message += `⏰ IMPORTANT:\n`;
      message += `- Click link above to Accept or Reject\n`;
      message += `- You have 5 minutes to respond\n`;
      message += `- After 5 minutes, request goes to next provider\n\n`;
      
      // WhatsApp number collected for admin purposes only
      // All communication happens through platform chat system
      
      // Show success message before creating chat room
      logger.info('Booking created successfully, creating chat room');

      // 🔥 CHAT FLOW RESTORATION: Create chat room and open chat window
      try {
        // Create chat room for the booking
        logger.debug('STEP 3: Creating chat room for immediate booking');
        
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes for response
        
        const chatRoom = await createChatRoom({
          bookingId: booking.$id,
          customerId: 'guest', // Guest user for immediate bookings
          customerName: customerName,
          customerLanguage: 'en', // Default to English
          customerPhoto: '', // No avatar for immediate bookings
          therapistId: therapistId, // ✅ String document $id
          therapistName: therapistName,
          therapistLanguage: 'id', // Default to Indonesian for providers
          therapistType: (providerType || 'therapist') as 'therapist' | 'place',
          therapistPhoto: profilePicture || '',
          expiresAt: expiresAt.toISOString()
        });
        
        logger.info('STEP 3 COMPLETE: Chat room created', { chatRoomId: chatRoom.$id });
        
        // ✅ FIX: Validate chat room creation before proceeding
        if (!chatRoom || !chatRoom.$id) {
          throw new Error('Chat room creation failed - no room ID returned');
        }
        
        // 🔒 STEP 3.5: Update booking and chat room for location verification
        logger.debug('STEP 3.5: Setting up location verification requirement');
        try {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.bookings,
            booking.$id,
            {
              status: 'waiting_for_location'
            }
          );
          
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatRooms,
            chatRoom.$id,
            {
              requiresLocation: true,
              locationVerified: false
            }
          );
          
          logger.info('STEP 3.5 COMPLETE: Location verification enabled');
        } catch (locationSetupError) {
          logger.error('Non-critical: Failed to set location requirement', locationSetupError);
          // Continue - this is not a blocking error
        }
        
        // Create booking confirmation system message
        logger.debug('STEP 4: Creating system message');
        const serviceType = providerType === 'place' && therapistName.toLowerCase().includes('facial') 
          ? 'facial treatment' 
          : 'massage';
        
        const systemMessage = `🚨 NEW IMMEDIATE BOOKING REQUEST

⏱️ YOU HAVE 5 MINUTES TO ACCEPT OR REJECT

👤 Customer: ${customerName}
📱 WhatsApp: ${countryCode}${customerWhatsApp}
📅 Time: ${now.toLocaleString()}
⏱️ Duration: ${selectedDuration} minutes
💰 Price: IDR ${Math.round(selectedOption.price / 1000)}K
${
  locationType === 'home' 
    ? `📍 Location: Home Address\n🏠 Address: ${homeAddress}\n` 
    : `📍 Location: ${locationType === 'hotel' ? 'Hotel' : 'Villa'}\n🏨 ${locationType === 'hotel' ? 'Hotel' : 'Villa'}: ${hotelVillaNameInput}\n🚪 Room: ${roomNumber}\n`
}
📝 Booking ID: ${booking.$id}

⚠️ WARNING: You have 5 minutes to respond. If no response, booking will be sent to all available providers.`;

        // Send system message to chat room
        logger.debug('STEP 5: Sending system message to chat room');
        if (chatRoom?.$id) {
          await sendSystemMessage(chatRoom.$id, { en: systemMessage, id: systemMessage }, therapistId, null as any /* user?.id - user undefined */);
          logger.info('STEP 5 COMPLETE: System message sent successfully');
        } else {
          logger.error('STEP 5 FAILED: Chat room ID is null');
        }
        
        // Show success toast
        showToast('✅ Booking created! Opening chat...', 'success');
        
        // 🔥 STEP 6: Open integrated booking-chat flow
        logger.info('[BOOKING→CHAT] Opening integrated booking-chat flow');
        logger.debug('[MAIN→DASHBOARD] Booking notification sent to therapist dashboard');
        
        // ✅ FIX: Validate required fields before opening chat
        if (!chatRoom.$id) {
          logger.error('STEP 6 FAILED: Cannot open chat - missing chatRoom.$id');
          return;
        }
        
        logger.debug('[INTEGRATION STATUS] Opening chat with booking context', {
          chatRoomId: chatRoom.$id,
          bookingId: booking.$id,
          therapistId: therapistId.toString(),
          dashboardReady: true
        });
        
        // ⚠️ NOTE: This openBookingChat call uses a different signature (booking context)
        // NOT the same as therapist-based openBookingChat
        const chatOpened = openBookingChat({
          chatRoomId: chatRoom.$id,
          bookingId: booking.$id,
          providerId: therapistId.toString(),
          providerName: therapistName,
          providerImage: profilePicture || null,
          customerName: customerName,
          customerWhatsApp: `${countryCode}${customerWhatsApp}`.replace(/\s/g, ''),
          serviceDuration: selectedDuration?.toString(),
          serviceType: providerType === 'place' && therapistName.toLowerCase().includes('facial') ? 'facial treatment' : 'massage',
          serviceDate: new Date().toLocaleDateString(),
          serviceTime: new Date().toLocaleTimeString()
        });
        
        if (chatOpened) {
          logger.info('STEP 6: Chat opened via ChatProvider successfully');
        } else {
          logger.warn('STEP 6: ChatProvider failed to open chat');
        }
        
      } catch (chatError: any) {
        logger.error('Error creating chat room', chatError);
        logger.error('Chat error details', {
          message: chatError.message,
          code: chatError.code,
          type: chatError.type
        });
        // Still show success for booking, but note chat issue
        showToast('✅ Booking created! (Chat setup pending)', 'warning');
      }

      // Open booking status tracker (optional, in addition to chat)
      if (window.openBookingStatusTracker) {
        window.openBookingStatusTracker({
          bookingId: booking.$id,
          therapistName,
          duration: selectedOption.duration,
          price: selectedOption.price,
          responseDeadline
        });
      }

      // Close the booking popup after delay to allow chat to open
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      logger.error('Error creating booking', error);
      logger.error('Error details', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response,
        stack: error.stack
      });
      
      // Enhanced error messaging
      let errorMessage = 'Failed to create booking. ';
      
      if (error.message?.includes('authentication') || error.message?.includes('session')) {
        errorMessage += 'Please refresh the page and try again.';
      } else if (error.message?.includes('validation')) {
        errorMessage += 'Please check all required fields are filled correctly.';
      } else if (error.message?.includes('network') || error.code === 'network_error') {
        errorMessage += 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;
  
  // CRITICAL FIX: Defensive checks to prevent white screen
  if (!therapistId || !therapistName) {
    logger.warn('BookingPopup rendered without required data', { therapistId, therapistName });
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
          <div className="text-center">
          <InlineLoadingSkeleton />
          <p className="text-gray-600 mt-4">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showWarning) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">Important Notice</h2>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <Clock className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm">Booking Requirements</h3>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    <span className="font-bold text-orange-600">⏰ 1-Hour Advance Notice:</span> All bookings must be made at least 1 hour in advance to allow the therapist time for preparation and travel.
                  </p>
                  <p className="text-gray-700 text-xs leading-relaxed mt-2">
                    <span className="font-bold text-orange-600">⏱️ 5-Minute Response:</span> The therapist has 5 minutes to accept your booking.
                  </p>
                  <p className="text-gray-700 text-xs leading-relaxed mt-1">
                    If they don't respond within 5 minutes, your booking will be automatically sent to all available therapists.
                  </p>
                  <p className="text-gray-700 text-xs leading-relaxed mt-1">
                    The first therapist to accept will get the booking.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-gray-700 text-xs">
                <span className="font-semibold">Booking with:</span> {therapistName}
              </p>
            </div>

            <button
              onClick={() => setShowWarning(false)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              I Understand - Continue to Book
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-300 transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={therapistName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center border-2 border-white">
                  <User className="text-white" size={24} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{language === 'id' ? 'Pilih Durasi' : 'Select Duration'}</h2>
                <p className="text-orange-100 text-xs">Indastreet • {therapistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* User Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">{language === 'id' ? 'Informasi Anda' : 'Your Information'}</h3>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Anda' : 'Your Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter your full name'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nomor WhatsApp' : 'WhatsApp Number'} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900 bg-white"
                  style={{ width: '110px' }}
                >
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+63">🇵🇭 +63</option>
                </select>
                <input
                  type="tel"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="812 3456 7890"
                  maxLength={15}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'id' ? 'Jenis Lokasi' : 'Location Type'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('hotel')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'hotel'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Hotel
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('villa')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'villa'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Villa
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('home')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    locationType === 'home'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {language === 'id' ? 'Rumah' : 'Home'}
                </button>
              </div>
            </div>

            {/* Hotel/Villa Details */}
            {(locationType === 'hotel' || locationType === 'villa') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locationType === 'hotel' ? (language === 'id' ? 'Nama Hotel' : 'Hotel Name') : (language === 'id' ? 'Nama Villa' : 'Villa Name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hotelVillaNameInput}
                    onChange={(e) => setHotelVillaNameInput(e.target.value)}
                    placeholder={language === 'id' ? `Masukkan nama ${locationType === 'hotel' ? 'hotel' : 'villa'}` : `Enter ${locationType} name`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'id' ? 'Nomor Kamar' : 'Room Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g., 205"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                  />
                </div>
              </>
            )}

            {/* Home Address */}
            {locationType === 'home' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Alamat Lengkap' : 'Full Address'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan alamat lengkap dengan patokan' : 'Enter your complete address with landmarks'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-gray-800 text-sm">{language === 'id' ? 'Pilih Durasi' : 'Select Duration'}</h3>
          {bookingOptions.map((option) => (
            <button
              key={option.duration}
              onClick={() => setSelectedDuration(option.duration)}
              className={`w-full p-2 rounded-xl border-2 transition-all ${
                selectedDuration === option.duration
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{option.duration} {language === 'id' ? 'menit' : 'minutes'}</div>
                    <div className="text-xs text-gray-500">{language === 'id' ? 'Pijat profesional' : 'Professional massage'}</div>
                  </div>
                </div>
                <div className="text-right">
                  {discountActive && discountPercentage > 0 && pricing && (
                    <div className="text-xs text-gray-500 line-through">
                      IDR {Math.round((pricing[option.duration.toString()]) / 1000)}K
                    </div>
                  )}
                  <div className="text-lg font-bold text-orange-600">
                    IDR {Math.round(option.price / 1000)}K
                  </div>
                </div>
              </div>
            </button>
          ))}
          </div>

          {/* Commission Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
            <p className="text-blue-800">
              ℹ️ {language === 'id' 
                ? 'Pemesanan ini tunduk pada komisi IndaStreetMassage dan aturan platform.'
                : 'This booking is subject to IndaStreetMassage commission and platform rules.'}
            </p>
          </div>

          {/* Remove old Hotel/Villa section since it's now in user info */}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Validate WhatsApp number length (8-15 digits)
              const cleanedWhatsApp = customerWhatsApp.replace(/\D/g, '');
              if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
                alert(language === 'id' 
                  ? 'Mohon masukkan nomor WhatsApp yang valid (8-15 digit)' 
                  : 'Please enter a valid WhatsApp number (8-15 digits)');
                return;
              }
              
              createBookingRecord();
            }}
            disabled={
              !selectedDuration || 
              isCreating || 
              !customerName.trim() || 
              !customerWhatsApp.trim() ||
              customerWhatsApp.replace(/\D/g, '').length < 8 ||
              customerWhatsApp.replace(/\D/g, '').length > 15 ||
              (locationType !== 'home' && (!hotelVillaNameInput.trim() || !roomNumber.trim())) ||
              (locationType === 'home' && !homeAddress.trim())
            }
            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${
              selectedDuration && 
              !isCreating && 
              customerName.trim() && 
              customerWhatsApp.trim() &&
              customerWhatsApp.replace(/\D/g, '').length >= 8 &&
              customerWhatsApp.replace(/\D/g, '').length <= 15 &&
              ((locationType !== 'home' && hotelVillaNameInput.trim() && roomNumber.trim()) ||
               (locationType === 'home' && homeAddress.trim()))
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCreating ? (language === 'id' ? 'Membuat Booking...' : 'Creating Booking...') : (language === 'id' ? 'Konfirmasi Booking' : 'Confirm Booking')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPopup;
