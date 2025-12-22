/**
 * Add thankYouReminderSent field to bookings collection
 * Run this script once to update your Appwrite bookings collection
 * 
 * Usage: node scripts/add-booking-reminder-field.cjs
 */

const sdk = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your API key
const DATABASE_ID = '68f76ee1000e64ca8d05';
const BOOKINGS_COLLECTION_ID = 'bookings'; // Update if different

async function addThankYouReminderField() {
    const client = new sdk.Client();
    const databases = new sdk.Databases(client);

    client
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    try {
        console.log('Adding thankYouReminderSent field to bookings collection...');

        // Add boolean attribute
        await databases.createBooleanAttribute(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            'thankYouReminderSent',
            false, // Not required
            false  // Default value: false
        );

        console.log('✅ Field added successfully!');
        console.log('\nNext steps:');
        console.log('1. Wait a few seconds for Appwrite to process the attribute');
        console.log('2. Set up a cron job to run processThankYouReminders() every 30 minutes');
        console.log('3. Call sendImmediateThankYouReminder() when customer completes payment');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️ Field already exists - no action needed');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

// Run the script
addThankYouReminderField();
