import React, { useState, useEffect } from 'react';
import { Clock, X, User, Phone, Calendar, Star } from 'lucide-react';
import { databases, ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';
import { showToast } from '../utils/showToastPortal';
import { createChatRoom, sendSystemMessage, sendWelcomeMessage, sendBookingReceivedMessage } from '../lib/chatService';
import { commissionTrackingService } from '../lib/services/commissionTrackingService';
import { useBookingForm } from '../booking/useBookingForm';
import { useTimeSlots } from '../booking/useTimeSlots';
import { useBookingSubmit } from '../booking/useBookingSubmit';
import { useChatContext } from '../context/ChatProvider';  // NEW: Import ChatProvider hook
import ScheduledBookingDepositPopup from './ScheduledBookingDepositPopup';
import DateChangeRequestModal from './DateChangeRequestModal';
import { scheduledBookingService } from '../lib/services/scheduledBookingService';

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
  providerRating?: number;
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
  providerRating,
  discountPercentage = 0,
  discountActive = false
}) => {
  const { language } = useLanguage();
  const lang = language === 'gb' ? 'en' : language;
  const t = translations[lang] || translations['id'];

  // NEW: Get ChatProvider functions
  const { openBookingChat } = useChatContext();

  // Deposit popup states
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [showDateChangeModal, setShowDateChangeModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  // Initialize form state hook
  const formState = useBookingForm();
  const {
    step, setStep,
    selectedDuration, setSelectedDuration,
    selectedTime, setSelectedTime,
    customerName, setCustomerName,
    customerWhatsApp, setCustomerWhatsApp,
    roomNumber, setRoomNumber,
    selectedAvatar, setSelectedAvatar,
    isCreating, setIsCreating,
    error, setError,
    resetForm,
    AVATAR_OPTIONS
  } = formState;

  // Initialize time slots hook
  const { timeSlots } = useTimeSlots(isOpen, therapistId, therapistType, step, selectedDuration);

  // Initialize booking submit hook with deposit requirement for scheduled bookings
  const handleCreateBooking = useBookingSubmit(
    pricing,
    therapistId,
    therapistName,
    therapistType,
    profilePicture,
    hotelVillaId,
    isImmediateBooking,
    { requireDeposit: !isImmediateBooking, depositPercentage: 50 }
  );

  const ratingValue = typeof providerRating === 'number' && providerRating > 0 ? providerRating.toFixed(1) : null;

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

  // Deposit handling functions
  const handleDepositConfirmation = async (depositData: any) => {
    try {
      if (!pendingBookingData) return;

      // Create the booking first
      const bookingResult = await handleCreateBooking(
        pendingBookingData.formData,
        { setError, setIsCreating, onClose: () => {}, resetForm }
      );

      if ((bookingResult as any)?.success) {
        // Create deposit requirement
        await scheduledBookingService.createDepositRequirement(
          (bookingResult as any).bookingId,
          pendingBookingData.userId,
          therapistId,
          pendingBookingData.totalPrice,
          50, // 50% deposit
          {
            originalBookingDate: pendingBookingData.formData.selectedTime.date,
            originalBookingTime: pendingBookingData.formData.selectedTime.time,
            serviceDuration: pendingBookingData.formData.selectedDuration,
            totalBookingPrice: pendingBookingData.totalPrice,
            therapistName,
            location: hotelVillaName || 'Your Location'
          }
        );

        // Upload payment proof if provided
        if (depositData.paymentProof) {
          await scheduledBookingService.uploadPaymentProof(
            (bookingResult as any).bookingId,
            depositData.paymentProof
          );
        }

        showToast('✅ Booking created! Deposit verification pending', 'success');
        setShowDepositPopup(false);
        setPendingBookingData(null);
        onClose();
      }
    } catch (error) {
      console.error('Error confirming deposit:', error);
      showToast('❌ Failed to process deposit', 'error');
    }
  };

  const handleScheduledBooking = async (formData: any) => {
    // For scheduled bookings, show deposit popup first
    const selectedDurationData = durations.find(d => d.minutes === formData.selectedDuration);
    const totalPrice = selectedDurationData?.price || 0;

    const bookingData = {
      formData,
      totalPrice,
      userId: 'current-user-id' // You'll need to get this from your auth context
    };

    setPendingBookingData(bookingData);
    setShowDepositPopup(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
            {ratingValue && (
              <div className="flex items-center gap-1 bg-white/90 rounded-full px-3 py-1 shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-black">{ratingValue}</span>
              </div>
            )}
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
                    
                    // NEW: Open chat window immediately after duration selection
                    console.log('🚀 Duration selected, opening booking chat...');
                    openBookingChat({
                      therapistId,
                      therapistName,
                      therapistImage: profilePicture,
                      duration: option.minutes,
                      pricing: pricing || { "60": 250000, "90": 350000, "120": 450000 }
                    });
                    
                    // Close this popup - user will complete booking in chat
                    onClose();
                  }}
                  className={`w-full p-2 sm:p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    selectedDuration === option.minutes
                      ? 'border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg animate-pulse'
                      : 'border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:border-orange-500 hover:from-orange-100 hover:to-amber-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex items-center gap-2">
                      <Clock className="text-orange-600" size={18} />
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{option.label}</div>
                        {therapistType === 'therapist' && (
                          <div className="text-xs text-gray-500">{language === 'id' ? '+ 30 menit waktu perjalanan' : '+ 30 min travel time'}</div>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg sm:text-xl font-bold ${selectedDuration === option.minutes ? 'text-white' : 'text-orange-700'}`}>IDR {Math.round(option.price / 1000)}K</div>
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
                    <>{language === 'id' ? `Buka hari ini: 9:00–21:00` : `Open today: 9:00–21:00`}</>
                  ) : (
                    <>{language === 'id' ? `Booking terakhir hari ini: 20:00` : `Last booking today: 20:00`}</>
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

              {/* <EnhancedFormField
                label="Your Name"
                required={true}
                error={error && !customerName.trim() ? "Name is required" : null}
              >
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                />
              </EnhancedFormField> */}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <svg className="inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border-2 border-r-0 border-gray-200 bg-gray-50 text-gray-700 rounded-l-lg text-sm font-medium">
                    +62
                  </span>
                  <input
                    type="tel"
                    value={customerWhatsApp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCustomerWhatsApp(value);
                    }}
                    placeholder="812345678"
                    maxLength={15}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-r-lg focus:border-orange-500 focus:outline-none text-sm text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your number without the country code (+62)
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

              {/* Commission Reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
                <p className="text-blue-800">
                  ℹ️ {language === 'id' 
                    ? 'Pemesanan ini tunduk pada komisi IndaStreetMassage dan aturan platform.'
                    : 'This booking is subject to IndaStreetMassage commission and platform rules.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (isImmediateBooking) {
                    // Immediate booking - no deposit required
                    handleCreateBooking(
                      { selectedDuration, selectedTime, customerName, customerWhatsApp, roomNumber, selectedAvatar },
                      { setError, setIsCreating, onClose, resetForm }
                    );
                  } else {
                    // Scheduled booking - require deposit
                    handleScheduledBooking({ selectedDuration, selectedTime, customerName, customerWhatsApp, roomNumber, selectedAvatar });
                  }
                }}
                disabled={!customerName || !customerWhatsApp || isCreating}
                className={`w-full py-3 rounded-lg font-bold text-white ${
                  customerName && customerWhatsApp && !isCreating
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isCreating ? 'Processing...' : (isImmediateBooking ? '✅ Book Now' : '💳 Secure with Deposit')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Booking Deposit Popup */}
      {showDepositPopup && pendingBookingData && (
        <ScheduledBookingDepositPopup
          isOpen={showDepositPopup}
          onClose={() => {
            setShowDepositPopup(false);
            setPendingBookingData(null);
          }}
          onConfirmDeposit={handleDepositConfirmation}
          bookingDetails={{
            therapistName,
            serviceDuration: pendingBookingData.formData.selectedDuration,
            totalPrice: pendingBookingData.totalPrice,
            scheduledDate: pendingBookingData.formData.selectedTime?.date || '',
            scheduledTime: pendingBookingData.formData.selectedTime?.time || '',
            location: hotelVillaName || 'Your Location'
          }}
          depositPercentage={50}
        />
      )}

      {/* Date Change Request Modal */}
      {showDateChangeModal && (
        <DateChangeRequestModal
          isOpen={showDateChangeModal}
          onClose={() => setShowDateChangeModal(false)}
          onSubmitRequest={async (requestData) => {
            try {
              // Handle date change request submission
              console.log('Date change request:', requestData);
              showToast('✅ Date change request submitted', 'success');
              setShowDateChangeModal(false);
            } catch (error) {
              console.error('Error submitting date change request:', error);
              showToast('❌ Failed to submit request', 'error');
            }
          }}
          booking={{
            id: 'current-booking-id',
            therapistName,
            therapistId,
            currentDate: new Date().toISOString().split('T')[0],
            currentTime: '10:00',
            serviceDuration: selectedDuration,
            depositAmount: 125000,
            location: hotelVillaName || 'Your Location'
          }}
        />
      )}
    </div>
  );
};

export default ScheduleBookingPopup;

