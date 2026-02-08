/**
 * 🎛️ ENTERPRISE BOOKING MENU SLIDER
 * 
 * Elegant menu slider for booking type selection
 * - Book Now vs Scheduled Booking
 * - Smooth animations and transitions
 * - Mobile-optimized touch interactions
 * - Enterprise-grade UI/UX
 * - Preserves existing chat window UI
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Calendar, Clock, Zap, Users, MapPin, DollarSign } from 'lucide-react';

export interface BookingType {
  id: 'book-now' | 'scheduled';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  estimatedTime?: string;
  priceModifier?: number;
}

export interface BookingMenuSliderProps {
  onBookingTypeSelect: (type: BookingType) => void;
  selectedType?: 'book-now' | 'scheduled';
  className?: string;
  disabled?: boolean;
  showFeatures?: boolean;
}

const bookingTypes: BookingType[] = [
  {
    id: 'book-now',
    title: 'Pesan Sekarang',
    subtitle: 'Layanan langsung',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    description: 'Dapatkan layanan pijat langsung dalam 30-60 menit',
    features: [
      'Hanya terapis yang tersedia',
      'Layanan dalam 30-60 menit',
      'Dukungan chat real-time',
      'Prioritas pemesanan darurat'
    ],
    estimatedTime: '30-60 menit',
    priceModifier: 1.2
  },
  {
    id: 'scheduled',
    title: 'Jadwalkan',
    subtitle: 'Rencanakan sebelumnya',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-gradient-to-r from-blue-500 to-purple-500',
    description: 'Jadwalkan pijat Anda untuk tanggal dan waktu tertentu',
    features: [
      'Pilih terapis spesifik',
      'Pilih slot waktu yang disukai',
      'Rencanakan hingga 7 hari ke depan',
      'Pemberitahuan pengingat'
    ],
    estimatedTime: 'Pilihan Anda',
    priceModifier: 1.0
  }
];

export const BookingMenuSlider: React.FC<BookingMenuSliderProps> = ({
  onBookingTypeSelect,
  selectedType = 'book-now',
  className = '',
  disabled = false,
  showFeatures = true
}) => {
  const [activeType, setActiveType] = useState<'book-now' | 'scheduled'>(selectedType);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle type selection with smooth animation
  const handleTypeSelect = useCallback(async (type: BookingType) => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    setActiveType(type.id);

    // Trigger selection callback after animation
    setTimeout(() => {
      onBookingTypeSelect(type);
      setIsAnimating(false);
    }, 200);
  }, [onBookingTypeSelect, disabled, isAnimating]);

  // Get current selected booking type
  const currentBookingType = bookingTypes.find(type => type.id === activeType) || bookingTypes[0];

  // Handle keyboard navigation
  const handleKeyPress = useCallback((event: React.KeyboardEvent, type: BookingType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTypeSelect(type);
    }
  }, [handleTypeSelect]);

  return (
    <div className={`enterprise-booking-slider ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Pilih Tipe Pemesanan
        </h3>
        <p className="text-gray-600 text-sm">
          Pilih cara Anda ingin memesan layanan pijat
        </p>
      </div>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="relative bg-gray-100 rounded-xl p-1 shadow-inner mb-6"
      >
        {/* Background Slider */}
        <div 
          className={`
            absolute top-1 left-1 w-1/2 h-[calc(100%-8px)] 
            ${currentBookingType.color} 
            rounded-lg shadow-lg transition-transform duration-300 ease-in-out
            ${activeType === 'scheduled' ? 'translate-x-full' : 'translate-x-0'}
          `}
        />

        {/* Booking Type Options */}
        <div className="relative grid grid-cols-2 gap-1">
          {bookingTypes.map((type) => {
            const isActive = activeType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                onKeyPress={(e) => handleKeyPress(e, type)}
                disabled={disabled}
                className={`
                  relative z-10 px-4 py-4 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isAnimating ? 'pointer-events-none' : ''}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {type.icon}
                  </span>
                  <span className="font-semibold text-sm">
                    {type.title}
                  </span>
                </div>
                
                <div className={`text-xs transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                  {type.subtitle}
                </div>

                {/* Estimated Time Badge */}
                {type.estimatedTime && (
                  <div className={`
                    mt-2 px-2 py-1 rounded-full text-xs font-medium
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {type.estimatedTime}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Type Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${currentBookingType.color} text-white`}>
            {currentBookingType.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 mb-1">
              {currentBookingType.title}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {currentBookingType.description}
            </p>

            {/* Features List */}
            {showFeatures && (
              <div className="space-y-2">
                {currentBookingType.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <div className={`w-2 h-2 rounded-full ${currentBookingType.color.replace('bg-gradient-to-r', 'bg')}`} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Modifier */}
            {currentBookingType.priceModifier !== 1.0 && (
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  {currentBookingType.priceModifier > 1 
                    ? `+${Math.round((currentBookingType.priceModifier - 1) * 100)}% untuk layanan langsung`
                    : `${Math.round((1 - currentBookingType.priceModifier) * 100)}% harga standar`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Pilihan akan dilanjutkan ke {activeType === 'book-now' ? 'pemesanan langsung' : 'kalender penjadwalan'}
        </p>
      </div>
    </div>
  );
};

/**
 * Booking Type Selection Hook
 */
export const useBookingTypeSelection = (initialType: 'book-now' | 'scheduled' = 'book-now') => {
  const [selectedType, setSelectedType] = useState<BookingType | null>(
    bookingTypes.find(type => type.id === initialType) || bookingTypes[0]
  );
  
  const [isBookingFlowActive, setIsBookingFlowActive] = useState(false);

  const selectBookingType = useCallback((type: BookingType) => {
    setSelectedType(type);
    
    // Log selection for analytics
    console.log(`📋 Booking type selected: ${type.id} (${type.title})`);
    
    // Track custom metric for enterprise monitoring
    if (typeof window !== 'undefined' && (window as any).enterprisePerformanceService) {
      (window as any).enterprisePerformanceService.trackCustomMetric(
        'booking_type_selection', 
        1, 
        { 
          type: type.id, 
          title: type.title,
          priceModifier: type.priceModifier
        }
      );
    }
  }, []);

  const startBookingFlow = useCallback(() => {
    setIsBookingFlowActive(true);
    
    console.log(`🚀 Starting booking flow for: ${selectedType?.title}`);
    
    // Initialize enterprise booking flow
    if (typeof window !== 'undefined' && (window as any).enterpriseBookingFlowService) {
      (window as any).enterpriseBookingFlowService.initialize().catch(console.error);
    }
  }, [selectedType]);

  const resetSelection = useCallback(() => {
    setSelectedType(bookingTypes[0]);
    setIsBookingFlowActive(false);
  }, []);

  return {
    selectedType,
    selectBookingType,
    startBookingFlow,
    resetSelection,
    isBookingFlowActive,
    availableTypes: bookingTypes
  };
};

/**
 * Enhanced Booking Menu with Chat Integration
 */
export const EnterpriseBookingMenu: React.FC<{
  onBookingStart: (type: BookingType) => void;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  className?: string;
}> = ({
  onBookingStart,
  onChatToggle,
  isChatOpen = false,
  className = ''
}) => {
  const {
    selectedType,
    selectBookingType,
    startBookingFlow,
    isBookingFlowActive
  } = useBookingTypeSelection();

  const handleProceed = useCallback(() => {
    if (selectedType) {
      startBookingFlow();
      onBookingStart(selectedType);
    }
  }, [selectedType, startBookingFlow, onBookingStart]);

  return (
    <div className={`enterprise-booking-menu ${className}`}>
      {/* Booking Type Slider */}
      <BookingMenuSlider
        onBookingTypeSelect={selectBookingType}
        selectedType={selectedType?.id}
        disabled={isBookingFlowActive}
        showFeatures={true}
      />

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selectedType || isBookingFlowActive}
          className={`
            flex-1 px-6 py-4 rounded-xl font-semibold text-white
            transition-all duration-300 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${selectedType?.color || 'bg-gray-400'}
            ${isBookingFlowActive ? 'animate-pulse' : ''}
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            {selectedType?.icon}
            <span>
              {isBookingFlowActive 
                ? 'Memulai...' 
                : `Lanjutkan dengan ${selectedType?.title || 'Pemesanan'}`
              }
            </span>
          </div>
        </button>

        {/* Chat Toggle Button */}
        {onChatToggle && (
          <button
            onClick={onChatToggle}
            className={`
              px-4 py-4 rounded-xl border-2 transition-all duration-300
              ${isChatOpen 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <Users className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {isBookingFlowActive && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Menginisialisasi sistem pemesanan...</span>
        </div>
      )}
    </div>
  );
};

export default BookingMenuSlider;