/**
 * ============================================================================
 * 🛡️ ANTI-SPAM BOOKING COMPONENT - PROTECTED BOOKING FLOW
 * ============================================================================
 * 
 * Enhanced booking component with comprehensive anti-spam protection
 * 
 * Features:
 * - Automatic spam detection
 * - Phone verification when needed
 * - Rate limiting protection
 * - Geographic validation
 * - Real-time risk assessment
 * - Clean user experience
 * 
 * Usage: Drop-in replacement for existing booking components
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { bookingAntiSpamService, type BookingValidationRequest } from '../services/bookingAntiSpamService';
import PhoneVerificationModal from './PhoneVerificationModal';
import { SimpleGPSUtils } from '../services/simpleGPSBookingIntegration';
import { logger } from '../utils/logger';

interface AntiSpamBookingProps {
  // Therapist/Service data
  providerId: string;
  providerName: string;
  serviceType: 'therapist' | 'massage_place' | 'skin_clinic';
  duration: number;
  price: number;
  
  // UI props
  onBookingComplete: (bookingData: any) => void;
  onClose: () => void;
  language?: 'id' | 'en';
  
  // Optional existing data
  initialData?: {
    customerName?: string;
    customerPhone?: string;
    location?: string;
  };
}

export const AntiSpamBookingComponent: React.FC<AntiSpamBookingProps> = ({
  providerId,
  providerName,
  serviceType,
  duration,
  price,
  onBookingComplete,
  onClose,
  language = 'id',
  initialData
}) => {
  
  // Form state
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [location, setLocation] = useState(initialData?.location || '');
  
  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  
  // Error state
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Timing tracking for bot detection
  const [timingData, setTimingData] = useState<number[]>([]);

  // Translations
  const t = {
    id: {
      title: 'Booking Terproteksi',
      subtitle: 'Sistem anti-spam aktif untuk mencegah pemesanan palsu',
      customerName: 'Nama Lengkap',
      customerPhone: 'Nomor WhatsApp',
      location: 'Lokasi Anda',
      bookNow: 'Pesan Sekarang',
      validating: 'Memvalidasi...',
      booking: 'Membuat Pesanan...',
      riskLevel: 'Tingkat Risiko',
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      verificationRequired: 'Verifikasi diperlukan',
      gpsDetected: 'GPS terdeteksi',
      noGps: 'GPS tidak tersedia'
    },
    en: {
      title: 'Protected Booking',
      subtitle: 'Anti-spam system active to prevent fake bookings',
      customerName: 'Full Name',
      customerPhone: 'WhatsApp Number',
      location: 'Your Location',
      bookNow: 'Book Now',
      validating: 'Validating...',
      booking: 'Creating Booking...',
      riskLevel: 'Risk Level',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      verificationRequired: 'Verification required',
      gpsDetected: 'GPS detected',
      noGps: 'GPS not available'
    }
  };

  const labels = t[language];

  // Track user interactions for bot detection
  const trackInteraction = () => {
    setTimingData(prev => [...prev, Date.now()]);
  };

  // Check GPS status
  const gpsAvailable = SimpleGPSUtils.hasGPS();
  const gpsStats = SimpleGPSUtils.getStats();

  // Real-time validation as user types
  useEffect(() => {
    if (customerName.length >= 2 && customerPhone.length >= 8) {
      const timer = setTimeout(() => {
        performQuickValidation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [customerName, customerPhone, location]);

  // Quick validation (non-blocking)
  const performQuickValidation = async () => {
    if (!customerName || !customerPhone) return;

    try {
      const request: BookingValidationRequest = {
        customerName,
        customerPhone,
        location: location || 'Not specified',
        serviceType,
        skipPhoneVerification: true // For quick validation
      };

      const result = await bookingAntiSpamService.validateBooking(request);
      setRiskScore(result.riskScore);
      setWarnings(result.warnings);
      
    } catch (error) {
      logger.warn('Quick validation failed:', error);
    }
  };

  // Handle form submission
  const handleBookNow = async () => {
    trackInteraction();
    setIsValidating(true);
    setErrors([]);
    setWarnings([]);

    try {
      // Prepare validation request
      const request: BookingValidationRequest = {
        customerName,
        customerPhone,
        location,
        serviceType,
        timingPatterns: timingData,
        deviceFingerprint: await generateDeviceFingerprint()
      };

      // Validate with anti-spam service
      const result = await bookingAntiSpamService.validateBooking(request);
      setValidationResult(result);
      setRiskScore(result.riskScore);
      setErrors(result.errors);
      setWarnings(result.warnings);

      if (!result.allowed) {
        setIsValidating(false);
        return;
      }

      if (result.requiresVerification) {
        setShowVerification(true);
        setIsValidating(false);
        return;
      }

      // Proceed with booking
      await createBooking();

    } catch (error) {
      logger.error('Validation failed:', error);
      setErrors(['Validation failed. Please try again.']);
    } finally {
      setIsValidating(false);
    }
  };

  // Create the actual booking
  const createBooking = async () => {
    setIsBooking(true);

    try {
      // Create basic booking data
      const bookingData = {
        customerName,
        customerPhone,
        location,
        providerId,
        providerName,
        serviceType,
        duration,
        price,
        timestamp: new Date().toISOString()
      };

      // Enhance with GPS if available
      const gpsBooking = SimpleGPSUtils.enhanceBooking(bookingData);

      // Add anti-spam metadata
      const finalBookingData = {
        ...gpsBooking,
        antiSpamValidated: true,
        riskScore,
        validationTimestamp: new Date().toISOString(),
        deviceFingerprint: await generateDeviceFingerprint()
      };

      logger.debug('🛡️ [PROTECTED BOOKING] Creating validated booking:', finalBookingData);

      // Complete the booking
      onBookingComplete(finalBookingData);

    } catch (error) {
      logger.error('Booking creation failed:', error);
      setErrors(['Booking creation failed. Please try again.']);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle verification completion
  const handleVerificationComplete = (verified: boolean) => {
    setShowVerification(false);
    if (verified) {
      createBooking();
    }
  };

  // Generate device fingerprint for tracking
  const generateDeviceFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent.slice(0, 100),
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL().slice(0, 100),
      timestamp: Date.now()
    }));

    return fingerprint.slice(0, 50);
  };

  // Get risk level display
  const getRiskLevelDisplay = (score: number) => {
    if (score < 25) return { level: labels.low, color: 'text-green-600 bg-green-50 border-green-200' };
    if (score < 50) return { level: labels.medium, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { level: labels.high, color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const riskDisplay = getRiskLevelDisplay(riskScore);

  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{labels.title}</h2>
              <p className="text-blue-100 text-sm">{labels.subtitle}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="p-6">
          
          {/* Risk & GPS Status */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`p-3 rounded-lg border ${riskDisplay.color}`}>
              <div className="text-xs font-medium opacity-75">{labels.riskLevel}</div>
              <div className="text-sm font-bold">{riskDisplay.level} ({riskScore}%)</div>
            </div>
            <div className={`p-3 rounded-lg border ${gpsAvailable ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
              <div className="text-xs font-medium opacity-75">GPS</div>
              <div className="text-sm font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {gpsAvailable ? labels.gpsDetected : labels.noGps}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labels.customerName}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  trackInteraction();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labels.customerPhone}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  trackInteraction();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                placeholder="+6281234567890"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labels.location}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  trackInteraction();
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                placeholder="Jl. Sudirman No. 123, Jakarta"
              />
              {gpsAvailable && gpsStats.available && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  GPS detected in {gpsStats.city} (±{gpsStats.accuracy}m)
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-800">Warnings</div>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    {warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-800">Validation Failed</div>
                  <ul className="text-xs text-red-700 mt-1 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Booking Button */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleBookNow}
              disabled={!customerName || !customerPhone || isValidating || isBooking || errors.length > 0}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-all ${
                !customerName || !customerPhone || isValidating || isBooking || errors.length > 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              {isValidating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {labels.validating}
                </div>
              ) : isBooking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {labels.booking}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  {labels.bookNow}
                </div>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Security Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Shield className="w-3 h-3" />
              <span>Protected by anti-spam system</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showVerification}
        phoneNumber={customerPhone}
        customerName={customerName}
        onVerified={handleVerificationComplete}
        onClose={() => setShowVerification(false)}
        language={language}
      />
    </>
  );
};

export default AntiSpamBookingComponent;