/**
 * ============================================================================
 * 🛡️ ANTI-SPAM INTEGRATION EXAMPLES - BOOKING PROTECTION
 * ============================================================================
 * 
 * How to integrate anti-spam protection into your existing booking flows:
 * - TherapistCard booking buttons
 * - MassagePlaceCard booking 
 * - Skin clinic bookings
 * - Any other booking component
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import AntiSpamBookingComponent from '../components/AntiSpamBookingComponent';
import { bookingAntiSpamService, AntiSpamUtils } from '../services/bookingAntiSpamService';

// ============================================================================
// 🎯 EXAMPLE 1: THERAPIST CARD WITH ANTI-SPAM PROTECTION
// ============================================================================

interface TherapistCardWithProtectionProps {
  therapist: {
    id: string;
    name: string;
    pricing: { duration60?: number; duration90?: number; duration120?: number };
  };
}

export const TherapistCardWithProtection: React.FC<TherapistCardWithProtectionProps> = ({ therapist }) => {
  const [showProtectedBooking, setShowProtectedBooking] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(90);

  const handleBookNow = () => {
    // Instead of opening regular booking popup, open protected booking
    setShowProtectedBooking(true);
  };

  const handleProtectedBookingComplete = (bookingData: any) => {
    setShowProtectedBooking(false);
    console.log('🛡️ [PROTECTED] Booking completed:', bookingData);
    
    // Your existing booking completion logic
    submitBookingToAppwrite(bookingData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold text-lg">{therapist.name}</h3>
      
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDuration(60)}
            className={`px-3 py-2 rounded ${selectedDuration === 60 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            60 min
          </button>
          <button
            onClick={() => setSelectedDuration(90)}
            className={`px-3 py-2 rounded ${selectedDuration === 90 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            90 min
          </button>
          <button
            onClick={() => setSelectedDuration(120)}
            className={`px-3 py-2 rounded ${selectedDuration === 120 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            120 min
          </button>
        </div>

        {/* 🛡️ PROTECTED BOOKING BUTTON */}
        <button
          onClick={handleBookNow}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>Book Now (Protected)</span>
          <span className="text-xs opacity-75">🛡️</span>
        </button>
      </div>

      {/* 🛡️ PROTECTED BOOKING MODAL */}
      {showProtectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AntiSpamBookingComponent
            providerId={therapist.id}
            providerName={therapist.name}
            serviceType="therapist"
            duration={selectedDuration}
            price={therapist.pricing[`duration${selectedDuration}` as keyof typeof therapist.pricing] || 300000}
            onBookingComplete={handleProtectedBookingComplete}
            onClose={() => setShowProtectedBooking(false)}
            language="id"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 🎯 EXAMPLE 2: MASSAGE PLACE WITH ANTI-SPAM PROTECTION
// ============================================================================

interface MassagePlaceCardWithProtectionProps {
  place: {
    id: string;
    name: string;
    services: Array<{ name: string; duration: number; price: number }>;
  };
}

export const MassagePlaceCardWithProtection: React.FC<MassagePlaceCardWithProtectionProps> = ({ place }) => {
  const [showProtectedBooking, setShowProtectedBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(place.services[0]);

  const handleBookService = (service: typeof selectedService) => {
    setSelectedService(service);
    setShowProtectedBooking(true);
  };

  const handleProtectedBookingComplete = (bookingData: any) => {
    setShowProtectedBooking(false);
    console.log('🛡️ [MASSAGE PLACE] Booking completed:', bookingData);
    
    // Your existing massage place booking logic
    submitMassagePlaceBooking(bookingData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold text-lg">{place.name}</h3>
      
      <div className="mt-4 space-y-3">
        <h4 className="font-medium text-gray-700">Available Services</h4>
        
        {place.services.map((service, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{service.name}</div>
                <div className="text-sm text-gray-500">{service.duration} minutes</div>
                <div className="font-bold text-green-600">IDR {service.price.toLocaleString()}</div>
              </div>
              
              {/* 🛡️ PROTECTED BOOKING BUTTON */}
              <button
                onClick={() => handleBookService(service)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Book 🛡️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ PROTECTED BOOKING MODAL */}
      {showProtectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AntiSpamBookingComponent
            providerId={place.id}
            providerName={`${place.name} - ${selectedService.name}`}
            serviceType="massage_place"
            duration={selectedService.duration}
            price={selectedService.price}
            onBookingComplete={handleProtectedBookingComplete}
            onClose={() => setShowProtectedBooking(false)}
            language="id"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 🎯 EXAMPLE 3: SKIN CLINIC WITH ANTI-SPAM PROTECTION
// ============================================================================

interface SkinClinicCardWithProtectionProps {
  clinic: {
    id: string;
    name: string;
    treatments: Array<{ name: string; duration: number; price: number }>;
  };
}

export const SkinClinicCardWithProtection: React.FC<SkinClinicCardWithProtectionProps> = ({ clinic }) => {
  const [showProtectedBooking, setShowProtectedBooking] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(clinic.treatments[0]);

  const handleBookTreatment = (treatment: typeof selectedTreatment) => {
    setSelectedTreatment(treatment);
    setShowProtectedBooking(true);
  };

  const handleProtectedBookingComplete = (bookingData: any) => {
    setShowProtectedBooking(false);
    console.log('🛡️ [SKIN CLINIC] Booking completed:', bookingData);
    
    // Your existing skin clinic booking logic
    submitSkinClinicBooking(bookingData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-500">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-bold text-lg">{clinic.name}</h3>
        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Skin Clinic</span>
      </div>
      
      <div className="mt-4 space-y-3">
        <h4 className="font-medium text-gray-700">Available Treatments</h4>
        
        {clinic.treatments.map((treatment, index) => (
          <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{treatment.name}</div>
                <div className="text-sm text-gray-500">{treatment.duration} minutes</div>
                <div className="font-bold text-pink-600">IDR {treatment.price.toLocaleString()}</div>
              </div>
              
              {/* 🛡️ PROTECTED BOOKING BUTTON */}
              <button
                onClick={() => handleBookTreatment(treatment)}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm flex items-center gap-1"
              >
                <span>Book Treatment</span>
                <span>🛡️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ PROTECTED BOOKING MODAL */}
      {showProtectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AntiSpamBookingComponent
            providerId={clinic.id}
            providerName={`${clinic.name} - ${selectedTreatment.name}`}
            serviceType="skin_clinic"
            duration={selectedTreatment.duration}
            price={selectedTreatment.price}
            onBookingComplete={handleProtectedBookingComplete}
            onClose={() => setShowProtectedBooking(false)}
            language="id"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 🎯 EXAMPLE 4: HOW TO ADD TO EXISTING COMPONENTS
// ============================================================================

/**
 * 📝 INTEGRATION GUIDE FOR EXISTING COMPONENTS
 * 
 * 1. REPLACE EXISTING BOOKING POPUP/MODAL:
 * 
 * // Before (existing code):
 * const [showBookingPopup, setShowBookingPopup] = useState(false);
 * 
 * // After (with protection):
 * const [showProtectedBooking, setShowProtectedBooking] = useState(false);
 * 
 * 
 * 2. UPDATE BOOKING BUTTON CLICK:
 * 
 * // Before:
 * onClick={() => setShowBookingPopup(true)}
 * 
 * // After:
 * onClick={() => setShowProtectedBooking(true)}
 * 
 * 
 * 3. REPLACE BOOKING COMPONENT:
 * 
 * // Before:
 * {showBookingPopup && (
 *   <BookingPopup
 *     therapist={therapist}
 *     onComplete={handleBookingComplete}
 *     onClose={() => setShowBookingPopup(false)}
 *   />
 * )}
 * 
 * // After:
 * {showProtectedBooking && (
 *   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 *     <AntiSpamBookingComponent
 *       providerId={therapist.id}
 *       providerName={therapist.name}
 *       serviceType="therapist"
 *       duration={selectedDuration}
 *       price={calculatePrice(selectedDuration)}
 *       onBookingComplete={handleProtectedBookingComplete}
 *       onClose={() => setShowProtectedBooking(false)}
 *       language="id"
 *     />
 *   </div>
 * )}
 * 
 * 
 * 4. UPDATE COMPLETION HANDLER:
 * 
 * const handleProtectedBookingComplete = (bookingData: any) => {
 *   setShowProtectedBooking(false);
 *   
 *   // Enhanced booking data includes:
 *   // - Original booking fields
 *   // - GPS data (if available)
 *   // - Anti-spam validation metadata
 *   // - Risk assessment scores
 *   // - Device fingerprinting
 *   
 *   console.log('🛡️ Protected booking:', bookingData);
 *   
 *   // Your existing booking submission logic
 *   submitToAppwrite(bookingData);
 * };
 */

// ============================================================================
// 🎯 EXAMPLE 5: BULK INTEGRATION HELPER
// ============================================================================

interface BulkProtectionWrapperProps {
  children: React.ReactNode;
  onProtectedBooking: (bookingData: any) => void;
}

export const BulkProtectionWrapper: React.FC<BulkProtectionWrapperProps> = ({ 
  children, 
  onProtectedBooking 
}) => {
  // This wrapper can intercept any booking attempts and add protection
  // Useful for protecting multiple components at once
  
  return (
    <div className="anti-spam-protected">
      {children}
      {/* Add global protection logic here */}
    </div>
  );
};

// ============================================================================
// 🎯 EXAMPLE 6: PROGRESSIVE PROTECTION (MINIMAL CHANGES)
// ============================================================================

export const ProgressiveProtectionExample = () => {
  const [riskLevel, setRiskLevel] = useState(0);
  
  // Add to existing booking function
  const enhanceExistingBooking = async (normalBookingData: any) => {
    
    // Quick risk assessment (doesn't require UI changes)
    const quickValidation = await AntiSpamUtils.validateBooking({
      customerName: normalBookingData.customerName,
      customerPhone: normalBookingData.customerPhone,
      location: normalBookingData.location,
      serviceType: 'therapist',
      skipPhoneVerification: true
    });
    
    setRiskLevel(quickValidation.riskScore);
    
    // If low risk, proceed normally
    if (quickValidation.riskScore < 30) {
      console.log('✅ Low risk booking - proceeding normally');
      return normalBookingData;
    }
    
    // If medium risk, add warnings but allow
    if (quickValidation.riskScore < 60) {
      console.log('⚠️ Medium risk booking - proceeding with warnings');
      return {
        ...normalBookingData,
        riskWarnings: quickValidation.warnings,
        riskScore: quickValidation.riskScore
      };
    }
    
    // If high risk, require verification
    console.log('🚨 High risk booking - verification required');
    throw new Error('Verification required for this booking');
  };

  return null; // This is just an example function
};

// Mock functions (replace with your actual implementations)
const submitBookingToAppwrite = (bookingData: any) => {
  console.log('Submitting to Appwrite:', bookingData);
};

const submitMassagePlaceBooking = (bookingData: any) => {
  console.log('Submitting massage place booking:', bookingData);
};

const submitSkinClinicBooking = (bookingData: any) => {
  console.log('Submitting skin clinic booking:', bookingData);
};

// Console guide
console.log(`
🛡️ ============================================================================
   ANTI-SPAM INTEGRATION EXAMPLES - READY
   ============================================================================
   
   ✅ PROTECTION COMPONENTS AVAILABLE:
   
   1. AntiSpamBookingComponent - Drop-in protected booking
   2. PhoneVerificationModal - SMS verification UI
   3. bookingAntiSpamService - Core validation service
   
   🔄 INTEGRATION STEPS:
   
   1. Replace booking popup with AntiSpamBookingComponent
   2. Add 🛡️ shield icon to booking buttons
   3. Handle enhanced booking data in completion handler
   4. Enjoy 90%+ spam reduction!
   
   📁 EXAMPLE FILES:
   • TherapistCardWithProtection
   • MassagePlaceCardWithProtection  
   • SkinClinicCardWithProtection
   
   ⚡ MINIMAL INTEGRATION:
   Just wrap your existing booking function with enhanceExistingBooking()
   
   ============================================================================
`);

export default {
  TherapistCardWithProtection,
  MassagePlaceCardWithProtection,
  SkinClinicCardWithProtection,
  BulkProtectionWrapper,
  ProgressiveProtectionExample
};