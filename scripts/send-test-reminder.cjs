/**
 * Manual Thank You Reminder Trigger
 * Use this to manually send a thank you reminder to test the feature
 * 
 * Usage: node scripts/send-test-reminder.cjs
 */

const { sendImmediateThankYouReminder } = require('../lib/appwrite/services/bookingReminders.service');

// Test data - update with real IDs from your database
const TEST_BOOKING_ID = 'test-booking-123';
const TEST_MEMBER_ID = 'therapist-id-here'; // Your therapist ID
const TEST_MEMBER_TYPE = 'therapist'; // or 'massage-place' or 'facial-place'
const TEST_MEMBER_NAME = 'Test Therapist';
const TEST_CUSTOMER_ID = 'customer-id-here';
const TEST_CUSTOMER_NAME = 'Test Customer';

async function sendTestReminder() {
    console.log('Sending test thank you reminder...\n');
    console.log('Member:', TEST_MEMBER_NAME);
    console.log('Customer:', TEST_CUSTOMER_NAME);
    console.log('');

    try {
        await sendImmediateThankYouReminder(
            TEST_BOOKING_ID,
            TEST_MEMBER_ID,
            TEST_MEMBER_TYPE,
            TEST_MEMBER_NAME,
            TEST_CUSTOMER_ID,
            TEST_CUSTOMER_NAME
        );

        console.log('✅ Test reminder sent successfully!');
        console.log('\nCheck the member\'s chat window to see the reminder notification.');
        console.log('It should appear as an orange notification with "Send Reward Now" button.');
    } catch (error) {
        console.error('❌ Error sending test reminder:', error);
    }
}

sendTestReminder();
