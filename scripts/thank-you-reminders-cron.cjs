/**
 * Cron Job: Process Thank You Reminders
 * Run this script every 30 minutes to send thank you discount reminders
 * 
 * Setup with node-cron:
 * 1. npm install node-cron
 * 2. node scripts/thank-you-reminders-cron.cjs
 * 
 * Or setup with system cron:
 * */30 * * * * cd /path/to/project && node scripts/thank-you-reminders-cron.cjs
 */

const { processThankYouReminders } = require('../lib/appwrite/services/bookingReminders.service');

async function runReminderJob() {
    console.log(`\n[${new Date().toISOString()}] Starting thank you reminder job...`);
    
    try {
        const sentCount = await processThankYouReminders();
        console.log(`✅ Job completed. Sent ${sentCount} reminders.`);
    } catch (error) {
        console.error('❌ Job failed:', error);
    }
}

// If using node-cron (optional)
// const cron = require('node-cron');
// cron.schedule('*/30 * * * *', runReminderJob); // Every 30 minutes

// Run immediately
runReminderJob();
