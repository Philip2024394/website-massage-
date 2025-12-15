import React, { useState, useEffect } from 'react';
import { Clock, X, User, Phone, Calendar } from 'lucide-react';
import { databases, ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';
import { showToast } from '../utils/showToastPortal';
import { createChatRoom, sendSystemMessage } from '../lib/chatService';
import { commissionTrackingService } from '../lib/services/commissionTrackingService';

// Avatar options for customer chat profile
const AVATAR_OPTIONS = [
    { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png', label: 'Avatar 1' },
    { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png', label: 'Avatar 2' },
    { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png', label: 'Avatar 3' },
    { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png', label: 'Avatar 4' },
    { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png', label: 'Avatar 6' },
    { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png', label: 'Avatar 7' },
    { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png', label: 'Avatar 8' },
    { id: 8, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%209.png', label: 'Avatar 9' },
    { id: 9, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png', label: 'Avatar 10' },
    { id: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png', label: 'Avatar 11' },
    { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png', label: 'Avatar 12' },
    { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png', label: 'Avatar 13' },
    { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png', label: 'Avatar 14' },
    { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png', label: 'Avatar 15' },
    { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png', label: 'Avatar 16' }
];

// Extend window type
declare global {
  interface Window {
    openScheduleBookingPopup?: (therapistInfo: {
      therapistId: string;
      therapistName: string;
      therapistType: 'therapist' | 'place';
      hotelVillaId?: string;
      hotelVillaName?: string;
      hotelVillaType?: 'hotel' | 'villa';
      isImmediateBooking?: boolean; // For immediate bookings via green "Pesan" button
      pricing?: { [key: string]: number }; // Pricing object (e.g., {"60": 250, "90": 350, "120": 450})
      providerRating?: number; // Provider rating for chat header overlay
      discountPercentage?: number; // Discount percentage if applicable
      discountActive?: boolean; // Whether discount is currently active
    }) => void;
  }
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  available: boolean;
}

interface ScheduleBookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  therapistType: 'therapist' | 'place';
  therapistStatus?: 'available' | 'busy' | 'offline';
  profilePicture?: string;
  hotelVillaId?: string;
  hotelVillaName?: string;
  hotelVillaType?: 'hotel' | 'villa';
  isImmediateBooking?: boolean; // Skip time selection for immediate bookings
  pricing?: { [key: string]: number }; // Pricing object from therapist/place (e.g., {"60": 250, "90": 350, "120": 450})
  discountPercentage?: number; // Discount percentage if applicable
  discountActive?: boolean; // Whether discount is currently active
}

const ScheduleBookingPopup: React.FC<ScheduleBookingPopupProps> = ({
  isOpen,
  onClose,
  therapistId,
  therapistName,
  therapistType,
  therapistStatus,
  profilePicture,
  hotelVillaId,
  hotelVillaName,
  hotelVillaType,
  isImmediateBooking = false,
  pricing,
  discountPercentage = 0,
  discountActive = false
}) => {
  const { language } = useLanguage();
  const lang = language === 'gb' ? 'en' : language;
  const t = translations[lang] || translations['id'];
  
  const [step, setStep] = useState<'duration' | 'time' | 'details'>('duration');
  const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120 | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0].imageUrl);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [lastBookingTime, setLastBookingTime] = useState<string>('22:00');
  const [openingTime, setOpeningTime] = useState<string>('09:00');
  const [closingTime, setClosingTime] = useState<string>('21:00');
  const [isCreating, setIsCreating] = useState(false);

  // Debug pricing values
  console.log('📊 ScheduleBookingPopup pricing debug:', {
    therapistName,
    receivedPricing: pricing,
    discountPercentage,
    pricing60: pricing?.["60"],
    pricing90: pricing?.["90"],
    pricing120: pricing?.["120"]
  });

  // Note: pricing contains full IDR amounts (e.g., 250000), will be divided by 1000 for 'K' display
  const durations = [
    { 
      minutes: 60, 
      price: pricing && pricing["60"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["60"]) * (1 - discountPercentage / 100))
            : Number(pricing["60"]))
        : 250000, 
      label: '60 min' 
    },
    { 
      minutes: 90, 
      price: pricing && pricing["90"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["90"]) * (1 - discountPercentage / 100))
            : Number(pricing["90"]))
        : 350000, 
      label: '90 min' 
    },
    { 
      minutes: 120, 
      price: pricing && pricing["120"] 
        ? (discountActive && discountPercentage > 0 
            ? Math.round(Number(pricing["120"]) * (1 - discountPercentage / 100))
            : Number(pricing["120"]))
        : 450000, 
      label: '120 min' 
    }
  ];

  // Generate time slots from 8 AM to last booking time
  const generateTimeSlots = async () => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // Parse last booking time (format: "HH:MM")
    const [lastHour, lastMinute] = lastBookingTime.split(':').map(Number);
    const [openH, openM] = openingTime.split(':').map(Number);
    const [closeH, closeM] = closingTime.split(':').map(Number);

    // Get today's bookings to mark unavailable slots
    let todayBookings: any[] = [];
    
    if (APPWRITE_CONFIG.collections.bookings && APPWRITE_CONFIG.collections.bookings !== '') {
      const bookingsResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        []
      );

      todayBookings = bookingsResponse.documents.filter((booking: any) => {
        const bookingDate = new Date(booking.scheduledTime || booking.createdAt);
        return (
          booking.therapistId === therapistId &&
          bookingDate.toDateString() === today.toDateString() &&
          (booking.status === 'confirmed' || booking.status === 'pending')
        );
      });
    } else {
      console.warn('⚠️ Bookings collection disabled - no schedule conflicts will be checked');
    }

    // Generate slots: for places, use opening/closing; for therapists, 8AM to last booking time
    const isPlace = therapistType === 'place';
    const startHour = isPlace ? openH : 8;
    const endHour = isPlace ? closeH : lastHour;
    for (let hour = startHour; hour <= endHour; hour++) {
      const startMinute = isPlace ? (hour === openH ? openM : 0) : 0;
      const endMinute = hour === endHour ? (isPlace ? closeM : lastMinute) : 45;

      for (let minute = startMinute; minute <= endMinute; minute += 15) {
        // Skip past times
        if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
          continue;
        }

        const slotTime = new Date(today);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if this slot conflicts with existing bookings (including 30min buffer)
        const isBooked = todayBookings.some((booking: any) => {
          const bookingStart = new Date(booking.scheduledTime || booking.createdAt);
          const buffer = therapistType === 'place' ? 0 : 30; // no travel buffer for places
          const bookingEnd = new Date(bookingStart.getTime() + (booking.duration + buffer) * 60000);
          return slotTime >= bookingStart && slotTime < bookingEnd;
        });

        slots.push({
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: !isBooked
        });
      }
    }

    setTimeSlots(slots);
  };

  // Fetch therapist's last booking time
  useEffect(() => {
    if (isOpen && therapistId) {
      const fetchTherapistSchedule = async () => {
        try {
          const collectionId = therapistType === 'therapist' 
            ? APPWRITE_CONFIG.collections.therapists 
            : APPWRITE_CONFIG.collections.places;
            
          if (!collectionId || collectionId === '') {
            console.warn('⚠️ Collection disabled for therapist type:', therapistType);
            setTimeSlots([]);
            return;
          }
          
          const therapist = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            therapistId
          );
          if (therapistType === 'place') {
            if ((therapist as any).openingTime) setOpeningTime((therapist as any).openingTime);
            if ((therapist as any).closingTime) setClosingTime((therapist as any).closingTime);
          } else {
            if (therapist.lastBookingTime) {
              setLastBookingTime(therapist.lastBookingTime);
            }
          }
        } catch (error) {
          console.error('Error fetching therapist schedule:', error);
        }
      };

      fetchTherapistSchedule();
    }
  }, [isOpen, therapistId, therapistType]);

  // Generate slots when duration is selected
  useEffect(() => {
    if (step === 'time' && selectedDuration) {
      generateTimeSlots();
    }
  }, [step, selectedDuration]);

  const handleCreateBooking = async () => {
    // For immediate bookings, we don't need time selection
    if (!isImmediateBooking && (!selectedDuration || !selectedTime)) return;
    if (!customerName || !customerWhatsApp) return;

    // Check for existing pending bookings with this WhatsApp number
    console.log('🔍 Checking for existing pending bookings for WhatsApp:', customerWhatsApp);
    
    try {
      const existingBookings = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        [
          Query.equal('customerWhatsApp', customerWhatsApp),
          Query.equal('status', 'Pending'),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]
      );

      if (existingBookings.documents.length > 0) {
        const existingBooking = existingBookings.documents[0];
        const providerName = existingBooking.providerName || existingBooking.therapistName || 'a therapist';
        
        console.log('❌ Found existing pending booking:', existingBooking);
        showToast(`You have a pending scheduled booking with ${providerName}. Please wait for their response before booking with another therapist.`, 'warning');
        setIsCreating(false);
        onClose();
        return;
      }
      
      console.log('✅ No existing pending bookings found for WhatsApp number. Proceeding with new booking.');
    } catch (checkError: any) {
      console.warn('⚠️ Could not check existing bookings (proceeding anyway):', checkError.message);
      // Continue with booking creation even if check fails
    }

    // Also check sessionStorage for local pending bookings (backup check)
    const pendingBooking = sessionStorage.getItem('pending_booking');
    if (pendingBooking) {
      const parsed = JSON.parse(pendingBooking);
      const deadline = new Date(parsed.deadline);
      if (deadline > new Date()) {
        showToast(`You have a pending ${parsed.type} booking with ${parsed.therapistName}. Please wait for their response before booking with another therapist.`, 'warning');
        onClose();
        return;
      } else {
        // Expired, clear it
        sessionStorage.removeItem('pending_booking');
      }
    }

    try {
      setIsCreating(true);

      // For immediate bookings, use current time; for scheduled, use selected time
      const scheduledTime = new Date();
      if (!isImmediateBooking && selectedTime) {
        scheduledTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      }
      
      const responseDeadline = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Generate a client-side bookingId - required attribute
      let bookingId: string;
      try {
        bookingId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `booking_${Date.now()}`;
      } catch {
        bookingId = `booking_${Date.now()}`;
      }

      // For immediate bookings, use default 60-minute duration if none selected
      const finalDuration = selectedDuration || (isImmediateBooking ? 60 : 0);
      const finalPrice = durations.find(d => d.minutes === finalDuration)?.price || 0;

      // Prepare booking message for in-app chat
      console.log('📱 Preparing booking notification for therapist:', therapistId);

      // Format booking date and time for chat message
      const bookingDate = scheduledTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const bookingTime = selectedTime?.label || scheduledTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });

      // Save scheduled booking to Appwrite database
      // Match exact Appwrite schema: providerId, providerType, providerName, service, startTime are REQUIRED
      
      const bookingData: any = {
        // Required fields matching Appwrite schema
        bookingId: bookingId,
        bookingDate: new Date().toISOString(), // Required datetime
        status: 'Pending', // Required string (default: 'Pending')
        duration: finalDuration, // Required integer (1-365)
        providerId: therapistId, // Required - Full therapist/place ID (now 255 chars)
        providerType: therapistType, // Required - 'therapist' or 'place'
        providerName: therapistName, // Required - therapist/place name
        service: String(finalDuration), // Required - '60', '90', or '120'
        startTime: scheduledTime.toISOString(), // Required datetime
        price: Math.round(finalPrice / 1000), // Required integer (0-1000)
        createdAt: new Date().toISOString(), // Required datetime
        responseDeadline: responseDeadline.toISOString(), // Required datetime
        
        // Optional fields with proper defaults
        totalCost: finalPrice, // Optional double
        paymentMethod: 'Unpaid', // Optional string (default: 'Unpaid')
        scheduledTime: scheduledTime.toISOString(), // Optional datetime
        customerName: customerName, // Optional string
        customerWhatsApp: customerWhatsApp, // Optional string - WhatsApp contact
        bookingType: isImmediateBooking ? 'immediate' : 'scheduled', // Optional string
        
        // Legacy fields (optional, can be null) - for compatibility
        therapistId: therapistId, // Optional - duplicate of providerId
        therapistName: therapistName, // Optional - duplicate of providerName
        therapistType: therapistType // Optional - duplicate of providerType
      };

      // Add optional fields only if they have values
      if (hotelVillaId) {
        bookingData.hotelId = hotelVillaId;
        bookingData.hotelGuestName = customerName;
      }
      if (roomNumber) bookingData.hotelRoomNumber = roomNumber;

      try {
        console.log('📤 Attempting to save booking with data:', bookingData);
        console.log('📤 Database ID:', APPWRITE_CONFIG.databaseId);
        console.log('📤 Collection ID:', APPWRITE_CONFIG.collections.bookings);
        
        // Save to Appwrite bookings collection (fallback to 'bookings' if config is wrong)
        const bookingResponse = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings || 'bookings',
          'unique()',
          bookingData
        );
        
        console.log('✅ Scheduled booking saved to Appwrite:', bookingResponse);
        
        // Create commission record for Pro members (30% commission)
        try {
          // Fetch therapist data to check membership tier
          const collectionId = therapistType === 'therapist' 
            ? APPWRITE_CONFIG.collections.therapists 
            : APPWRITE_CONFIG.collections.facial_places;
          
          if (collectionId && therapistId) {
            const therapist = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              collectionId,
              therapistId
            );

            // Check if therapist is on Pro plan (free tier with 30% commission)
            // 'free' = Pro plan, 'plus' = Plus plan (no commission)
            const membershipTier = (therapist as any).membershipTier || 'free';
            
            if (membershipTier === 'free') {
              // Pro member - create commission record with 3-hour deadline
              const scheduledDateTime = new Date(bookingDate + ' ' + bookingTime).toISOString();
              
              console.log('💰 Creating commission record for Pro member:', {
                therapistId: therapistId,
                therapistName: therapistName,
                serviceAmount: finalPrice,
                commissionRate: 30,
                scheduledDate: scheduledDateTime
              });

              await commissionTrackingService.createCommissionRecord(
                therapistId,
                therapistName,
                bookingResponse.$id,
                new Date().toISOString(), // bookingDate (when booking was created)
                scheduledDateTime, // scheduledDate (when service is scheduled)
                finalPrice
              );

              console.log('✅ Commission record created successfully');
            } else {
              console.log('ℹ️ Plus member - no commission tracking needed');
            }
          }
        } catch (commissionErr) {
          console.error('⚠️ Failed to create commission record:', commissionErr);
          // Don't block booking if commission creation fails
        }
        
        // Lock booking - store pending booking info (15 min deadline)
        const deadline = new Date();
        deadline.setMinutes(deadline.getMinutes() + 15);
        sessionStorage.setItem('pending_booking', JSON.stringify({
          bookingId: bookingResponse.$id,
          therapistId: therapistId,
          therapistName: therapistName,
          customerWhatsApp: customerWhatsApp,
          deadline: deadline.toISOString(),
          type: isImmediateBooking ? 'immediate' : 'scheduled'
        }));
        
        console.log('🔒 Booking locked until:', deadline.toISOString());
        
        // Create booking message for in-app chat (conditional based on membership)
        const serviceType = therapistType === 'place' && therapistName.toLowerCase().includes('facial') 
          ? 'facial treatment' 
          : 'massage';
        
        // Get membership tier to determine WhatsApp access
        // Default to 'free' since membership tier is not passed as prop
        const therapistMembershipTier = 'free';
        
        // Pro members: NO WhatsApp, strict rules
        const proMessage = `🚨 NEW ${isImmediateBooking ? 'IMMEDIATE' : 'SCHEDULED'} BOOKING REQUEST

⏱️ YOU HAVE 5 MINUTES TO ACCEPT OR REJECT

👤 Customer: ${customerName}
📅 Date: ${bookingDate}
⏰ Time: ${bookingTime}
⏱️ Duration: ${finalDuration} minutes
💰 Price: IDR ${Math.round(finalPrice / 1000)}K
${roomNumber ? `🚪 Room: ${roomNumber}\n` : ''}${hotelVillaName ? `🏨 Location: ${hotelVillaName}\n` : ''}
📝 Booking ID: ${bookingResponse.$id}

⚠️ PRO MEMBER NOTICE:
❌ WhatsApp contact NOT provided (Pro plan)
✅ Communicate through in-app chat only

⚠️ WARNING: Operating outside Indastreet platform = immediate deactivation + WhatsApp blocking

💡 Upgrade to Plus (Rp 250K/month):
✓ Customer WhatsApp access
✓ 0% commission
✓ No payment deadlines`;

        // Plus members: Full WhatsApp access
        const plusMessage = `⭐ NEW ${isImmediateBooking ? 'IMMEDIATE' : 'SCHEDULED'} BOOKING (Plus Member)

👤 Customer: ${customerName}
📱 WhatsApp: ${customerWhatsApp}
📅 Date: ${bookingDate}
⏰ Time: ${bookingTime}
⏱️ Duration: ${finalDuration} minutes
💰 Price: IDR ${Math.round(finalPrice / 1000)}K
${roomNumber ? `🚪 Room: ${roomNumber}\n` : ''}${hotelVillaName ? `🏨 Location: ${hotelVillaName}\n` : ''}
📝 Booking ID: ${bookingResponse.$id}

✅ Plus Member Benefits Active:
✓ 0% commission
✓ Direct WhatsApp access
✓ No payment deadlines

You can contact the customer immediately!`;

        const message = therapistMembershipTier === 'free' ? proMessage : plusMessage;

        // Create chat room and send booking notification
        console.log('💬 Creating chat room for booking...');
        
        try {
          // Create or get existing chat room
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes for response
          
          const chatRoom = await createChatRoom({
            bookingId: bookingResponse.$id,
            customerId: 'guest', // Guest user for now
            customerName: customerName,
            customerLanguage: 'en', // Default to English for scheduled bookings
            customerPhoto: selectedAvatar, // Use selected avatar for chat profile
            therapistId: parseInt(therapistId) || 0,
            therapistName: therapistName,
            therapistLanguage: 'id', // Default to Indonesian for providers
            therapistType: therapistType,
            therapistPhoto: profilePicture || '',
            expiresAt: expiresAt.toISOString()
          });
          
          console.log('✅ Chat room created:', chatRoom.$id);
          
          // Send system message with booking details to the chat room
          if (chatRoom?.$id) await sendSystemMessage(chatRoom.$id, { en: message, id: message });
          
          console.log('✅ Booking notification sent to therapist');
          
          // Open in-app chat with booking details
          console.log('💬 Dispatching openChat event with data:', {
            therapistId,
            therapistName,
            bookingId: bookingResponse.$id,
            chatRoomId: chatRoom.$id
          });
          
          // Small delay to ensure App.tsx listener is ready
          setTimeout(() => {
            // First dispatch the scheduled booking event for chat status tracking
            window.dispatchEvent(new CustomEvent('scheduledBookingCreated', {
              detail: {
                bookingId: bookingResponse.$id,
                therapistId: therapistId,
                therapistName: therapistName,
                bookingType: isImmediateBooking ? 'immediate' : 'scheduled'
              }
            }));
            
            // Then open the chat window
            window.dispatchEvent(new CustomEvent('openChat', {
              detail: {
                therapistId: therapistId,
                therapistName: therapistName,
                therapistType: therapistType,
                bookingId: bookingResponse.$id,
                chatRoomId: chatRoom.$id,
                therapistStatus: therapistStatus,
                profilePicture: profilePicture,
                pricing: pricing,
                discountPercentage: discountPercentage,
                discountActive: discountActive
              }
            }));
            console.log('✅ scheduledBookingCreated and openChat events dispatched');
          }, 100);
          
          showToast('✅ Booking saved! Opening chat...', 'success');
          
        } catch (chatError: any) {
          console.error('❌ Error creating chat/notification:', chatError);
          // Still show success for booking, but note chat issue
          showToast('✅ Booking saved! (Chat setup pending)', 'success');
        }
        
        // Close popup after showing success message
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } catch (saveError: any) {
        console.error('❌ Error saving scheduled booking to Appwrite:', saveError);
        console.error('❌ Error details:', {
          message: saveError.message,
          code: saveError.code,
          type: saveError.type,
          response: saveError.response
        });
        
        // Show detailed error message
        const errorMsg = saveError.message || 'Unknown error occurred';
        showToast(`⚠️ Failed to save booking: ${errorMsg}`, 'error');
        
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Error creating scheduled booking:', error);
      alert(`Failed to send booking request: ${error.message || 'Please try again.'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('duration');
    setSelectedDuration(null);
    setSelectedTime(null);
    setCustomerName('');
    setCustomerWhatsApp('');
    setRoomNumber('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header - Orange Indastreet Branding */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl sticky top-0 z-10">
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
                <h2 className="text-xl font-bold text-white">
                  {isImmediateBooking ? '🟢 Book Now' : '📅 Schedule Booking'}
                </h2>
                <p className="text-orange-100 text-xs">Indastreet • {therapistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {/* Step 1: Select Duration */}
          {step === 'duration' && (
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base font-semibold text-gray-800 mb-2 sm:mb-3">{language === 'id' ? 'Pilih Durasi' : 'Select Duration'}</h3>
              {durations.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => {
                    setSelectedDuration(option.minutes as 60 | 90 | 120);
                    // For immediate bookings, skip time selection and go to details
                    if (isImmediateBooking) {
                      // Set current time as selected time for immediate booking
                      const now = new Date();
                      setSelectedTime({
                        hour: now.getHours(),
                        minute: now.getMinutes(),
                        label: 'Now',
                        available: true
                      });
                      setStep('details');
                    } else {
                      setStep('time');
                    }
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex items-center gap-2">
                      <Clock className="text-orange-500" size={18} />
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{option.label}</div>
                        {therapistType === 'therapist' && (
                          <div className="text-xs text-gray-500">{language === 'id' ? '+ 30 menit waktu perjalanan' : '+ 30 min travel time'}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-orange-600">IDR {Math.round(option.price / 1000)}K</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 'time' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('duration')}
                className="text-orange-600 text-sm font-medium mb-2"
              >
                ← {language === 'id' ? 'Kembali ke durasi' : 'Back to duration'}
              </button>
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="text-orange-500" size={18} />
                {language === 'id' ? `Pilih Waktu (${selectedDuration} menit)` : `Select Time (${selectedDuration} min)`}
              </h3>
              
              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-orange-800 flex items-center gap-1">
                  <Clock className="inline w-3 h-3" />
                  {therapistType === 'place' ? (
                    <>{language === 'id' ? `Buka hari ini: ${openingTime}–${closingTime}` : `Open today: ${openingTime}–${closingTime}`}</>
                  ) : (
                    <>{language === 'id' ? `Booking terakhir hari ini: ${lastBookingTime}` : `Last booking today: ${lastBookingTime}`}</>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      !slot.available
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : selectedTime?.label === slot.label
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-orange-100'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {selectedTime && (
                <button
                  onClick={() => setStep('details')}
                  className="w-full mt-3 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
                >
                  Continue to Details
                </button>
              )}
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 'details' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('time')}
                className="text-orange-600 text-sm font-medium mb-2"
              >
                ← Back to time selection
              </button>
              <h3 className="text-base font-semibold text-gray-800 mb-3">Your Details</h3>

              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <div className="text-xs text-orange-800 flex items-center gap-1">
                  <Calendar className="inline w-3 h-3" />
                  <strong>Scheduled:</strong> Today at {selectedTime?.label}
                </div>
                <div className="text-xs text-orange-800 mt-1 flex items-center gap-1">
                  <Clock className="inline w-3 h-3" />
                  <strong>Duration:</strong> {selectedDuration} min{therapistType === 'therapist' ? ' (+30 min travel)' : ''}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <User className="inline w-3 h-3 mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <svg className="inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  placeholder="e.g., +62 812 3456 7890"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For direct communication and booking updates
                </p>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {language === 'id' ? 'Pilih Avatar Anda' : 'Choose Your Avatar'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.imageUrl)}
                      className="relative transition-all hover:scale-105 focus:outline-none"
                    >
                      <img 
                        src={avatar.imageUrl} 
                        alt={avatar.label} 
                        className={`w-14 h-14 rounded-full object-cover ${
                          selectedAvatar === avatar.imageUrl
                            ? 'ring-3 ring-orange-500 ring-offset-1 shadow-lg'
                            : 'hover:ring-2 hover:ring-orange-300 hover:ring-offset-1'
                        }`}
                      />
                      {selectedAvatar === avatar.imageUrl && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Number - Only for hotel/villa bookings */}
              {hotelVillaId && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <svg className="inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {hotelVillaType === 'hotel' ? 'Hotel' : 'Villa'} Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g., 101, 205A"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {hotelVillaName ? `Your room at ${hotelVillaName}` : 'For service delivery location'}
                  </p>
                </div>
              )}

              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                <p className="text-xs text-orange-800">
                  <strong>💬 In-App Chat Confirmation</strong>
                  <br />
                  {isImmediateBooking 
                    ? `You'll be connected directly with ${therapistName} via in-app chat to discuss availability and pricing.`
                    : `Your booking will be sent to ${therapistName} via in-app chat. They'll confirm availability and arrival time.`
                  }
                </p>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={!customerName || !customerWhatsApp || isCreating}
                className={`w-full py-3 rounded-lg font-bold text-white ${
                  customerName && customerWhatsApp && !isCreating
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isCreating ? 'Sending...' : '💬 Send Booking via Chat'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleBookingPopup;
