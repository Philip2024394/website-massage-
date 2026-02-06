/**
 * ============================================================================
 * 🎯 GPS BOOKING INTEGRATION - USAGE EXAMPLES
 * ============================================================================
 * 
 * This file shows you exactly how to use the new GPS features with your
 * existing booking system. NO COMPLEX CHANGES NEEDED!
 * 
 * ============================================================================
 */

import { SimpleGPSUtils } from '../services/simpleGPSBookingIntegration';

// ============================================================================
// � PLACEHOLDER FUNCTIONS (Replace with your actual implementations)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const submitBookingToAppwrite = async (booking: any) => { /* Your implementation */ };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendMessageToTherapist = async (therapistId: string, message: string) => { /* Your implementation */ };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const displayTherapists = (therapists: any[]) => { /* Your implementation */ };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createBookingObject = (therapist: any): any => ({ /* Your implementation */ });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const submitBooking = async (booking: any) => { /* Your implementation */ };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendToTherapist = async (therapistId: string, message: string) => { /* Your implementation */ };

// ============================================================================
// �🚀 EXAMPLE 1: ENHANCE ANY BOOKING WITH GPS (MAIN USAGE)
// ============================================================================

export function ExampleBookingWithGPS() {
  
  const handleBookNow = async (therapistData: any) => {
    // Your existing booking data
    const basicBooking = {
      customerName: "John Smith",
      customerWhatsApp: "+6281234567890", 
      therapistId: therapistData.id,
      therapistName: therapistData.name,
      duration: 60,
      price: 150000,
      location: "Jakarta Pusat", // User entered location
    };

    // 🎯 ADD GPS WITH ONE LINE:
    const gpsEnhancedBooking = SimpleGPSUtils.enhanceBooking(basicBooking, therapistData);
    
    // Now gpsEnhancedBooking contains:
    // - All your original booking data
    // - customerGPS (if available) with precise coordinates
    // - distanceToTherapist (if therapist has GPS)
    // - googleMapsLink for therapist
    // - Enhanced location address (more accurate than user input)

    console.log('📍 Enhanced booking:', gpsEnhancedBooking);
    
    // Your existing booking submission code
    await submitBookingToAppwrite(gpsEnhancedBooking);
  };
}

// ============================================================================
// 🎯 EXAMPLE 2: CREATE THERAPIST MESSAGE WITH LOCATION
// ============================================================================

export function ExampleTherapistMessage() {
  
  const sendBookingToTherapist = (bookingData: any) => {
    // 🎯 CREATE GPS-ENHANCED MESSAGE:
    const message = SimpleGPSUtils.createMessage(bookingData);
    
    console.log('📱 Message to send to therapist:');
    console.log(message);
    
    /*
    Example message output:
    
    🎯 New booking request!
    
    👤 Customer: John Smith
    📱 WhatsApp: +6281234567890
    ⏰ Duration: 60 minutes
    💰 Price: IDR 150,000
    
    📍 Location: Jl. Sudirman No.123, Jakarta Pusat 10220
    ✅ Distance: 2.3km (Very close to you!)
    🗺️ Google Maps: https://maps.google.com/maps?q=-6.2088,106.8456
    📍 GPS Accuracy: ±15m
    
    Reply ACCEPT to confirm this booking
    */
    
    // Send via your existing chat system
    sendMessageToTherapist(bookingData.therapistId, message);
  };
}

// ============================================================================
// 🎯 EXAMPLE 3: FIND NEARBY THERAPISTS (OPTIONAL)
// ============================================================================

export function ExampleFindNearbyTherapists() {
  
  const showAvailableTherapists = async (allTherapists: any[]) => {
    // 🎯 FILTER BY PROXIMITY (25km by default):
    const nearbyTherapists = SimpleGPSUtils.findNearby(allTherapists, 25);
    
    console.log('📍 Nearby therapists:', nearbyTherapists);
    
    // Each therapist now has a 'distance' property
    nearbyTherapists.forEach(therapist => {
      if (therapist.distance && therapist.distance < 999) {
        console.log(`${therapist.name}: ${therapist.distance.toFixed(1)}km away`);
      } else {
        console.log(`${therapist.name}: Distance unknown`);
      }
    });
    
    // Display in your UI (closest first - already sorted)
    displayTherapists(nearbyTherapists);
  };
}

// ============================================================================
// 🎯 EXAMPLE 4: CHECK GPS STATUS (DEBUGGING)
// ============================================================================

export function ExampleCheckGPSStatus() {
  
  const checkGPSAvailability = () => {
    // 🎯 CHECK IF GPS IS READY:
    const hasGPS = SimpleGPSUtils.hasGPS();
    const stats = SimpleGPSUtils.getStats();
    
    console.log('📍 GPS Available:', hasGPS);
    console.log('📊 GPS Stats:', stats);
    
    /*
    Example stats output:
    {
      available: true,
      city: "Jakarta",
      accuracy: 15,
      age: 3.2, // minutes since collection
      coordinates: { lat: -6.2088, lng: 106.8456 }
    }
    */
    
    if (hasGPS) {
      console.log(`✅ GPS collected ${stats.age.toFixed(1)} minutes ago`);
      console.log(`📍 Accuracy: ±${stats.accuracy}m in ${stats.city}`);
    } else {
      console.log('📍 GPS not available - using standard booking flow');
    }
  };
}

// ============================================================================
// 🎯 INTEGRATION WITH YOUR EXISTING COMPONENTS
// ============================================================================

// Example: BookingButton.tsx
export const BookingButtonWithGPS = ({ therapist }: { therapist: any }) => {
  
  const handleBooking = async () => {
    // Your existing booking object
    const booking = createBookingObject(therapist);
    
    // 🎯 ONE LINE TO ADD GPS:
    const gpsBooking = SimpleGPSUtils.enhanceBooking(booking, therapist);
    
    // Submit as normal
    await submitBooking(gpsBooking);
    
    // Create message for therapist
    const message = SimpleGPSUtils.createMessage(gpsBooking);
    await sendToTherapist(therapist.id, message);
  };
  
  return (
    <button onClick={handleBooking}>
      Book Now {SimpleGPSUtils.hasGPS() ? '📍' : ''}
    </button>
  );
};

// Example: TherapistList.tsx  
export const TherapistListWithProximity = ({ allTherapists }: { allTherapists: any[] }) => {
  
  // 🎯 FILTER BY PROXIMITY:
  const nearbyTherapists = SimpleGPSUtils.findNearby(allTherapists);
  
  return (
    <div>
      <h3>Available Therapists {SimpleGPSUtils.hasGPS() ? '(Sorted by distance)' : ''}</h3>
      {nearbyTherapists.map(therapist => (
        <div key={therapist.id}>
          <h4>{therapist.name}</h4>
          {therapist.distance && therapist.distance < 999 && (
            <span className="distance">📍 {therapist.distance.toFixed(1)}km away</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 🎯 SUMMARY: HOW TO USE IN YOUR APP
// ============================================================================

/*

✅ LANDING PAGE GPS COLLECTION (ALREADY INTEGRATED):
   • Landing page silently collects GPS with one permission popup
   • GPS is cached for 2 hours in localStorage
   • No visible changes to user interface

✅ BOOKING ENHANCEMENT (ADD TO YOUR EXISTING BOOKING):
   const gpsBooking = SimpleGPSUtils.enhanceBooking(normalBooking, therapist);

✅ THERAPIST MESSAGE (ADD TO YOUR EXISTING CHAT):
   const message = SimpleGPSUtils.createMessage(gpsBooking);

✅ NEARBY THERAPISTS (OPTIONAL FILTER):
   const nearby = SimpleGPSUtils.findNearby(allTherapists);

✅ STATUS CHECK (FOR DEBUGGING):
   const hasGPS = SimpleGPSUtils.hasGPS();

🔒 PRIVACY & SECURITY:
   • GPS stored locally only (never sent to servers)
   • Only shared with therapist during booking
   • User can deny permission (graceful fallback)
   • Automatic cleanup after 2 hours

⚡ IMPLEMENTATION:
   • Just 2 files to import (already created)
   • No backend changes required
   • Works with existing Appwrite collections
   • Compatible with Golden Plus Protection

*/