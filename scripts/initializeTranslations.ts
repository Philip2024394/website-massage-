/**
 * Initialize Translations Script
 * Migrates existing translations from local files to Appwrite with auto-translation
 * Run this once to populate your Appwrite translations collection
 */

import { autoTranslationService } from '../services/autoTranslationService';

// All text that needs translation for the booking system
const BOOKING_TRANSLATIONS = {
  // Guest Booking Page
  'booking.title': 'Book Appointment',
  'booking.guestDetails': 'Guest Details',
  'booking.guestName': 'Guest Name',
  'booking.guestNamePlaceholder': 'Enter your name',
  'booking.roomNumber': 'Room Number',
  'booking.roomNumberPlaceholder': 'e.g. 201',
  'booking.selectDate': 'Select Date',
  'booking.selectTime': 'Select Time',
  'booking.selectDuration': 'Select Service Duration',
  'booking.min60': '60 Minutes',
  'booking.min90': '90 Minutes',
  'booking.min120': '120 Minutes',
  'booking.chargeToRoom': 'Charge to my room',
  'booking.confirmBooking': 'Confirm Booking',
  'booking.back': 'Back',
  'booking.fillAllFields': 'Please fill in all required fields',
  'booking.oneHourNotice': 'Bookings require at least 1 hour advance notice',
  'booking.noAvailableSlots': 'No available time slots for selected date',
  'booking.bookingWith': 'Booking with',
  
  // Hotel/Villa Menu Page
  'menu.selectLanguage': 'Select Your Language',
  'menu.welcomeMessage': 'Welcome to',
  'menu.selectProvider': 'Select a Massage Provider',
  'menu.availableNow': 'Available Now',
  'menu.noProviders': 'No providers available at the moment. Please try again later.',
  'menu.refreshing': 'Refreshing...',
  'menu.liveUpdates': 'Live updates active',
  'menu.individualTherapists': 'Individual Therapists',
  'menu.massageSpas': 'Massage Spas',
  
  // Provider Booking Card
  'provider.awaitingResponse': 'AWAITING RESPONSE',
  'provider.confirmed': 'CONFIRMED',
  'provider.onTheWay': 'ON THE WAY',
  'provider.timedOut': 'TIMED OUT',
  'provider.hotelVilla': 'Hotel/Villa',
  'provider.roomNumber': 'Room Number',
  'provider.guestName': 'Guest Name',
  'provider.serviceDuration': 'Service Duration',
  'provider.minutes': 'minutes',
  'provider.chargeToRoom': 'Charge to room',
  'provider.confirmButton': 'Confirmed',
  'provider.onTheWayButton': 'On the Way',
  'provider.declineButton': 'Decline',
  'provider.confirmedMessage': 'You have confirmed this booking.',
  'provider.onTheWayMessage': 'You have indicated you are on the way to the guest.',
  'provider.guestNotified': 'Guest and hotel have been notified.',
  'provider.timeoutMessage': 'Response time expired. This booking may have been reassigned to another provider.',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.minutes': 'minutes',
  'common.hours': 'hours',
  'common.days': 'days',
  
  // Days of week
  'days.monday': 'Monday',
  'days.tuesday': 'Tuesday',
  'days.wednesday': 'Wednesday',
  'days.thursday': 'Thursday',
  'days.friday': 'Friday',
  'days.saturday': 'Saturday',
  'days.sunday': 'Sunday',
  
  // Months
  'months.january': 'January',
  'months.february': 'February',
  'months.march': 'March',
  'months.april': 'April',
  'months.may': 'May',
  'months.june': 'June',
  'months.july': 'July',
  'months.august': 'August',
  'months.september': 'September',
  'months.october': 'October',
  'months.november': 'November',
  'months.december': 'December',
};

async function initializeTranslations() {
  console.log('🌍 Starting translation initialization...\n');
  console.log(`Total phrases to translate: ${Object.keys(BOOKING_TRANSLATIONS).length}`);
  console.log(`Languages: English, Indonesian, Chinese, Japanese, Korean, Russian, French, German\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const [key, englishText] of Object.entries(BOOKING_TRANSLATIONS)) {
    try {
      console.log(`\n📝 Processing: ${key}`);
      await autoTranslationService.getOrTranslate(key, englishText);
      successCount++;
      console.log(`✅ Success (${successCount}/${Object.keys(BOOKING_TRANSLATIONS).length})`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error translating "${key}":`, error);
    }
    
    // Add a delay to avoid rate limiting (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Translation initialization complete!');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));
}

// Export for use in other scripts
export { initializeTranslations, BOOKING_TRANSLATIONS };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeTranslations()
    .then(() => {
      console.log('\n✨ All translations saved to Appwrite!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Translation initialization failed:', error);
      process.exit(1);
    });
}
