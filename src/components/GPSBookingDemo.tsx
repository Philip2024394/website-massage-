/**
 * ============================================================================
 * 🚀 GPS BOOKING INTEGRATION DEMO
 * ============================================================================
 * 
 * Complete implementation example showing how to integrate customer GPS
 * collection with therapist location sharing for the booking flow.
 * 
 * This demo shows:
 * • Landing page GPS auto-collection
 * • Booking form with GPS enhancement  
 * • Therapist notification with location verification
 * • Distance-based therapist filtering
 * • No backend changes required!
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Zap, Navigation, Clock, CheckCircle } from 'lucide-react';
import { customerGPSService, CustomerGPSUtils } from '../services/customerGPSCollectionService';
import { bookingGPSIntegration, BookingGPSUtils } from '../services/bookingFlowGPSIntegration';
import TherapistLocationVerification from '../components/TherapistLocationVerification';
import type { GPSEnhancedBookingData } from '../services/bookingFlowGPSIntegration';
import { logger } from '../utils/logger';
import { getTherapistDisplayName } from '../utils/therapistCardHelpers';

// Mock therapist data (replace with your actual therapist data)
const MOCK_THERAPISTS = [
  {
    $id: 'therapist-1',
    name: 'Sarah Professional Massage',
    geopoint: { lat: -6.2088, lng: 106.8456 }, // Jakarta Central
    location: 'Central Jakarta',
    pricing: 150000,
    rating: 4.8,
    availability: 'Available'
  },
  {
    $id: 'therapist-2', 
    name: 'Budi Traditional Therapy',
    geopoint: { lat: -6.1944, lng: 106.8229 }, // Jakarta North
    location: 'North Jakarta',
    pricing: 175000,
    rating: 4.9,
    availability: 'Available'
  }
];

const GPSBookingDemo: React.FC = () => {
  // Booking state
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [bookingData, setBookingData] = useState<GPSEnhancedBookingData | null>(null);
  const [nearbyTherapists, setNearbyTherapists] = useState<any[]>([]);
  
  // GPS state
  const [gpsStats, setGpsStats] = useState<any>({});
  const [isCollectingGPS, setIsCollectingGPS] = useState(false);
  
  // Demo state
  const [activeDemo, setActiveDemo] = useState<'customer' | 'therapist'>('customer');
  const [bookingStep, setBookingStep] = useState<'form' | 'verification' | 'complete'>('form');

  // Load GPS stats on mount
  useEffect(() => {
    loadGPSStats();
    loadNearbyTherapists();
  }, []);

  const loadGPSStats = () => {
    const stats = bookingGPSIntegration.getBookingGPSStats();
    setGpsStats(stats);
    logger.debug('📊 GPS Stats:', stats);
  };

  const loadNearbyTherapists = async () => {
    try {
      const nearby = await bookingGPSIntegration.findNearbyTherapists(MOCK_THERAPISTS);
      setNearbyTherapists(nearby);
      logger.debug('🔍 Found nearby therapists:', nearby.length);
    } catch (error) {
      logger.error('Failed to load nearby therapists:', error);
    }
  };

  // 📍 DEMO: Collect customer GPS
  const handleCollectGPS = async () => {
    setIsCollectingGPS(true);
    try {
      const gpsData = await customerGPSService.collectForBooking();
      if (gpsData) {
        logger.debug('✅ GPS collected:', gpsData);
        loadGPSStats();
        loadNearbyTherapists();
      } else {
        alert('Unable to get your location. Please enable location services.');
      }
    } catch (error) {
      logger.error('GPS collection failed:', error);
      alert('Location collection failed: ' + (error as Error).message);
    } finally {
      setIsCollectingGPS(false);
    }
  };

  // 🎯 DEMO: Book now with GPS proximity
  const handleBookNow = async (therapist: any) => {
    try {
      const result = await bookingGPSIntegration.bookNowWithProximity({
        name: 'Demo Customer',
        whatsapp: '+6281234567890',
        duration: 90,
        serviceType: 'Home Massage'
      }, [therapist]);

      if (result.success && result.bookingData) {
        setBookingData(result.bookingData);
        setSelectedTherapist(therapist);
        setBookingStep('verification');
        logger.debug('✅ GPS Booking created:', result.bookingData);
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      logger.error('Book now failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // 🏠 DEMO: Therapist accepts booking
  const handleAcceptBooking = () => {
    logger.debug('✅ Booking accepted by therapist');
    setBookingStep('complete');
    
    // Here you would integrate with your existing chat system
    if (bookingData) {
      const message = BookingGPSUtils.createBookingMessage(bookingData);
      logger.debug('📝 Booking message for chat:', message);
    }
  };

  const handleDeclineBooking = () => {
    logger.debug('❌ Booking declined by therapist');
    setBookingStep('form');
    setBookingData(null);
    setSelectedTherapist(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🌍 GPS Location Sharing Demo
        </h1>
        <p className="text-gray-600">
          Customer GPS collection & therapist proximity verification
        </p>
      </div>

      {/* Demo Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveDemo('customer')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeDemo === 'customer' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👤 Customer View
        </button>
        <button
          onClick={() => setActiveDemo('therapist')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeDemo === 'therapist' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🧘‍♀️ Therapist View
        </button>
      </div>

      {/* Customer View */}
      {activeDemo === 'customer' && (
        <div className="space-y-6">
          {/* GPS Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              GPS Location Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">GPS Available:</span>
                  <span className={`font-medium ${gpsStats.hasCustomerGPS ? 'text-green-600' : 'text-red-600'}`}>
                    {gpsStats.hasCustomerGPS ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                {gpsStats.hasCustomerGPS && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{gpsStats.gpsAge?.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-medium">±{gpsStats.gpsAccuracy}m</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-col justify-center">
                <button
                  onClick={handleCollectGPS}
                  disabled={isCollectingGPS}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCollectingGPS ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Collect My GPS
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Current Location Display */}
            {gpsStats.hasCustomerGPS && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Location Detected</span>
                </div>
                <p className="text-green-700 text-sm">
                  {CustomerGPSUtils.getAddressForBooking() || 'GPS coordinates available'}
                </p>
              </div>
            )}
          </div>

          {/* Available Therapists */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-500" />
              Nearby Therapists {nearbyTherapists.length > 0 && `(${nearbyTherapists.length})`}
            </h3>
            
            {nearbyTherapists.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {gpsStats.hasCustomerGPS 
                    ? 'No therapists found in your area' 
                    : 'Enable GPS to find nearby therapists'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {nearbyTherapists.map((therapist) => (
                  <div 
                    key={therapist.$id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{getTherapistDisplayName(therapist.name)}</h4>
                        <p className="text-sm text-gray-600">{therapist.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          IDR {therapist.pricing.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">⭐ {therapist.rating}</p>
                      </div>
                    </div>
                    
                    {therapist.distance !== undefined && (
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {therapist.distance.toFixed(1)}km away
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          therapist.proximityScore >= 90 ? 'bg-green-100 text-green-700' :
                          therapist.proximityScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {therapist.proximityScore >= 90 ? 'Very Close' :
                           therapist.proximityScore >= 50 ? 'Nearby' : 'Available'}
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleBookNow(therapist)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Book Now (GPS Enhanced)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Therapist View */}
      {activeDemo === 'therapist' && (
        <div className="space-y-6">
          {bookingStep === 'form' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                Waiting for Booking Requests
              </h3>
              <p className="text-gray-600">
                Create a booking from the Customer View to see the therapist verification interface
              </p>
            </div>
          )}

          {bookingStep === 'verification' && bookingData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                🚨 New Booking Request
              </h3>
              
              <TherapistLocationVerification
                bookingData={bookingData}
                onAcceptBooking={handleAcceptBooking}
                onDeclineBooking={handleDeclineBooking}
                className="max-w-none"
              />
            </div>
          )}

          {bookingStep === 'complete' && bookingData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-green-800 mb-2">
                ✅ Booking Accepted!
              </h3>
              <p className="text-green-700 mb-4">
                Customer has been notified and chat session has been initiated.
              </p>
              
              <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="font-medium text-gray-800 mb-2">Chat Message Preview:</h4>
                <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 whitespace-pre-line">
                  {BookingGPSUtils.createBookingMessage(bookingData).substring(0, 200)}...
                </div>
              </div>
              
              <button
                onClick={() => {
                  setBookingStep('form');
                  setBookingData(null);
                  setSelectedTherapist(null);
                }}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                Start New Demo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Integration Code Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          🛠️ Integration Examples
        </h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">1. Auto-collect GPS on landing page:</h4>
            <code className="bg-gray-800 text-green-400 p-2 rounded block">
              await customerGPSService.autoCollectOnEntry()
            </code>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">2. Enhance booking with GPS:</h4>
            <code className="bg-gray-800 text-green-400 p-2 rounded block">
              const gpsBooking = await BookingGPSUtils.addGPSToBooking(booking, therapist)
            </code>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">3. Find nearby therapists:</h4>
            <code className="bg-gray-800 text-green-400 p-2 rounded block">
              const nearby = await bookingGPSIntegration.findNearbyTherapists(allTherapists)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSBookingDemo;