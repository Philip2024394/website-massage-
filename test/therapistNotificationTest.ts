/**
 * 🧪 TEST THERAPIST NOTIFICATIONS
 * 
 * This file provides test functions to simulate booking notifications
 * for therapists during development and testing.
 */

import { therapistNotificationService, type BookingNotification } from '../src/services/therapistNotificationService';

/**
 * Simulate a new booking notification for testing
 */
export function testTherapistNotification(): void {
  const mockBooking: BookingNotification = {
    bookingId: `booking_${Date.now()}`,
    customerId: 'customer_123',
    customerName: 'John Doe',
    customerPhone: '+62 812-3456-7890',
    serviceType: 'Traditional Massage',
    duration: 60,
    price: 350000,
    location: {
      address: 'Jl. Sunset Road No. 45, Seminyak, Bali',
      coordinates: {
        lat: -8.6914,
        lng: 115.1728
      },
      zone: 'Seminyak'
    },
    requestedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
  };

  console.log('🧪 Testing therapist notification:', mockBooking);
  therapistNotificationService.notifyBookingRequest(mockBooking);
}

/**
 * Test multiple notifications
 */
export function testMultipleNotifications(): void {
  const mockBookings: BookingNotification[] = [
    {
      bookingId: `booking_${Date.now()}_1`,
      customerId: 'customer_456',
      customerName: 'Sarah Wilson',
      customerPhone: '+62 821-9876-5432',
      serviceType: 'Deep Tissue Massage',
      duration: 90,
      price: 450000,
      location: {
        address: 'Jl. Raya Canggu No. 88, Canggu, Bali',
        zone: 'Canggu'
      },
      requestedTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    },
    {
      bookingId: `booking_${Date.now()}_2`,
      customerId: 'customer_789',
      customerName: 'Michael Chen',
      customerPhone: '+62 878-1234-5678',
      serviceType: 'Reflexology',
      duration: 45,
      price: 250000,
      location: {
        address: 'Jl. Monkey Forest Road, Ubud, Bali',
        zone: 'Ubud'
      },
      requestedTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  ];

  mockBookings.forEach((booking, index) => {
    setTimeout(() => {
      console.log(`🧪 Testing notification ${index + 1}:`, booking);
      therapistNotificationService.notifyBookingRequest(booking);
    }, index * 2000); // 2 seconds apart
  });
}

/**
 * Test notification preferences
 */
export function testNotificationPreferences(): void {
  console.log('🧪 Testing notification preferences');
  
  // Test with sound disabled
  therapistNotificationService.updatePreferences({
    sound: false,
    vibration: true,
    autoOpenChat: false,
    volume: 0.5
  });

  setTimeout(() => {
    testTherapistNotification();
  }, 1000);

  // Reset to default after 10 seconds
  setTimeout(() => {
    therapistNotificationService.updatePreferences({
      sound: true,
      vibration: true,
      autoOpenChat: true,
      volume: 0.8
    });
    console.log('🔧 Notification preferences reset to default');
  }, 10000);
}

/**
 * Test user entry tracking
 */
export function testUserTracking(): void {
  const entryData = therapistNotificationService.getUserEntryData();
  console.log('📍 User entry tracking data:', entryData);
}

// Make test functions globally available in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testTherapistNotification = testTherapistNotification;
  (window as any).testMultipleNotifications = testMultipleNotifications;
  (window as any).testNotificationPreferences = testNotificationPreferences;
  (window as any).testUserTracking = testUserTracking;
  
  console.log(`
🧪 THERAPIST NOTIFICATION TESTS AVAILABLE:
- testTherapistNotification() - Test single booking notification
- testMultipleNotifications() - Test multiple notifications
- testNotificationPreferences() - Test preference changes
- testUserTracking() - View user entry data
  `);
}