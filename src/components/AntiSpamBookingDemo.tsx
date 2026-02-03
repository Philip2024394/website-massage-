/**
 * ============================================================================
 * 🛡️ ANTI-SPAM BOOKING DEMO - COMPLETE SYSTEM DEMONSTRATION
 * ============================================================================
 * 
 * Interactive demo showing comprehensive anti-spam protection for:
 * - Therapist bookings
 * - Massage place bookings  
 * - Skin clinic bookings
 * 
 * Features demonstrated:
 * - Real-time spam detection
 * - Phone verification flow
 * - GPS validation
 * - Risk scoring
 * - Rate limiting
 * - Pattern detection
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Phone, MapPin, Clock, TrendingUp } from 'lucide-react';
import AntiSpamBookingComponent from '../components/AntiSpamBookingComponent';
import { AntiSpamUtils } from '../services/bookingAntiSpamService';

export const AntiSpamBookingDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'therapist' | 'massage' | 'clinic'>('therapist');
  const [showBooking, setShowBooking] = useState(false);
  const [demoStats, setDemoStats] = useState({
    totalBookings: 127,
    spamBlocked: 23,
    verificationsSent: 15,
    falsePositives: 1
  });

  // Demo data
  const demoProviders = {
    therapist: {
      id: 'therapist_demo',
      name: 'Maya (Female Therapist)',
      type: 'therapist' as const,
      services: [
        { name: 'Traditional Massage', duration: 60, price: 300000 },
        { name: 'Deep Tissue Massage', duration: 90, price: 400000 },
        { name: 'Relaxation Massage', duration: 120, price: 500000 }
      ]
    },
    massage: {
      id: 'place_demo',
      name: 'Bali Serenity Spa',
      type: 'massage_place' as const,
      services: [
        { name: 'Hot Stone Massage', duration: 90, price: 450000 },
        { name: 'Couples Massage', duration: 120, price: 800000 },
        { name: 'Aromatherapy Massage', duration: 60, price: 350000 }
      ]
    },
    clinic: {
      id: 'clinic_demo',
      name: 'Jakarta Skin Care Clinic',
      type: 'skin_clinic' as const,
      services: [
        { name: 'Facial Treatment', duration: 60, price: 250000 },
        { name: 'Chemical Peel', duration: 90, price: 400000 },
        { name: 'Laser Treatment', duration: 45, price: 600000 }
      ]
    }
  };

  const [selectedService, setSelectedService] = useState(demoProviders[selectedDemo].services[0]);

  const handleServiceSelect = (service: typeof selectedService) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  const handleBookingComplete = (bookingData: any) => {
    setShowBooking(false);
    
    // Update demo stats
    setDemoStats(prev => ({
      ...prev,
      totalBookings: prev.totalBookings + 1,
      verificationsSent: bookingData.antiSpamValidated ? prev.verificationsSent + 1 : prev.verificationsSent
    }));

    alert(`🛡️ Protected booking completed!\n\nBooking Data:\n${JSON.stringify(bookingData, null, 2)}`);
  };

  const currentProvider = demoProviders[selectedDemo];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg mb-4">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">Anti-Spam Booking System</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Comprehensive protection against fake bookings for therapists, massage places, and skin clinics
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{demoStats.totalBookings}</div>
              <div className="text-sm text-gray-500">Total Bookings</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{demoStats.spamBlocked}</div>
              <div className="text-sm text-gray-500">Spam Blocked</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{demoStats.verificationsSent}</div>
              <div className="text-sm text-gray-500">Verifications</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(((demoStats.totalBookings - demoStats.spamBlocked - demoStats.falsePositives) / demoStats.totalBookings) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Service Type to Demo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedDemo('therapist');
              setSelectedService(demoProviders.therapist.services[0]);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedDemo === 'therapist'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-4xl mb-3">💆‍♀️</div>
            <h3 className="font-bold text-lg mb-2">Therapist Booking</h3>
            <p className="text-sm text-gray-600">Individual massage therapists</p>
          </button>

          <button
            onClick={() => {
              setSelectedDemo('massage');
              setSelectedService(demoProviders.massage.services[0]);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedDemo === 'massage'
                ? 'border-orange-500 bg-orange-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="font-bold text-lg mb-2">Massage Place</h3>
            <p className="text-sm text-gray-600">Spa and massage establishments</p>
          </button>

          <button
            onClick={() => {
              setSelectedDemo('clinic');
              setSelectedService(demoProviders.clinic.services[0]);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedDemo === 'clinic'
                ? 'border-pink-500 bg-pink-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="font-bold text-lg mb-2">Skin Clinic</h3>
            <p className="text-sm text-gray-600">Medical skin treatments</p>
          </button>
        </div>
      </div>

      {/* Selected Provider Demo */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
            selectedDemo === 'therapist' ? 'bg-blue-100' :
            selectedDemo === 'massage' ? 'bg-orange-100' : 'bg-pink-100'
          }`}>
            {selectedDemo === 'therapist' ? '💆‍♀️' : selectedDemo === 'massage' ? '🏢' : '🏥'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentProvider.name}</h2>
            <p className="text-gray-600 capitalize">{selectedDemo.replace('_', ' ')} Services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentProvider.services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                  <div className="font-bold text-green-600">
                    IDR {service.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleServiceSelect(service)}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedDemo === 'therapist' ? 'bg-blue-500 hover:bg-blue-600' :
                  selectedDemo === 'massage' ? 'bg-orange-500 hover:bg-orange-600' :
                  'bg-pink-500 hover:bg-pink-600'
                } text-white`}
              >
                <span>Book Now</span>
                <Shield className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Protection Features */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🛡️ Protection Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Phone Verification</h3>
              <p className="text-sm text-gray-600 mt-1">
                SMS verification for suspicious bookings
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">GPS Validation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Location consistency checking
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Risk Scoring</h3>
              <p className="text-sm text-gray-600 mt-1">
                Real-time spam probability assessment
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Rate Limiting</h3>
              <p className="text-sm text-gray-600 mt-1">
                3 bookings per hour, 10 per day max
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pattern Detection</h3>
              <p className="text-sm text-gray-600 mt-1">
                Fake names, numbers, and locations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bot Detection</h3>
              <p className="text-sm text-gray-600 mt-1">
                Timing analysis and fingerprinting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Test Cases to Try</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">✅ Valid Booking Test</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Name: "John Smith"</li>
              <li>• Phone: "+6281234567890"</li>
              <li>• Location: "Jl. Sudirman, Jakarta"</li>
              <li>• Expected: Low risk, no verification</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">🚨 Spam Booking Test</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Name: "test" or "aaa"</li>
              <li>• Phone: "1111111111"</li>
              <li>• Location: "hotel"</li>
              <li>• Expected: High risk, verification required</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">⚠️ Suspicious Booking Test</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Name: "budi" (common fake name)</li>
              <li>• Phone: "+6280000000000"</li>
              <li>• Location: "jakarta" (too generic)</li>
              <li>• Expected: Medium risk, warnings shown</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📱 Verification Test</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use any suspicious data above</li>
              <li>• When prompted, enter: "123456"</li>
              <li>• Or any code containing "1"</li>
              <li>• Expected: Verification success</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Protected Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AntiSpamBookingComponent
            providerId={currentProvider.id}
            providerName={`${currentProvider.name} - ${selectedService.name}`}
            serviceType={currentProvider.type}
            duration={selectedService.duration}
            price={selectedService.price}
            onBookingComplete={handleBookingComplete}
            onClose={() => setShowBooking(false)}
            language="id"
          />
        </div>
      )}
    </div>
  );
};

export default AntiSpamBookingDemo;