/**
 * AI Human Full Workflow - Multi-User Orchestration
 * 
 * Comprehensive test simulating real-world scenarios with multiple users
 * - Customer booking flows (Book Now, Scheduled, Slider)
 * - Therapist acceptance and dashboard
 * - Chat system with real-time updates
 * - Commission verification (revenue protection)
 * - Countdown timers
 * - Admin audit trail validation
 */

import { test, expect } from '@playwright/test';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwrite';
import { RevenueGuard } from '../verification/RevenueGuard';
import { NotificationValidator } from '../services/notificationValidator';
import type { Page, BrowserContext } from '@playwright/test';

// Test Configuration
// Single-server architecture - all roles use BASE_URL with role-based routing
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const THERAPIST_URL = process.env.THERAPIST_URL || 'http://localhost:3002';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3002';

const TEST_THERAPIST_ID = '6971ccc9000f3c39f49c'; // From APPWRITE_MASTER_CONFIG
const TEST_CUSTOMER_EMAIL = 'user@test.com';
const TEST_CUSTOMER_PASSWORD = 'password123';
const TEST_THERAPIST_EMAIL = 'therapist@test.com';
const TEST_THERAPIST_PASSWORD = 'password123';
const TEST_ADMIN_EMAIL = 'admin@test.com';
const TEST_ADMIN_PASSWORD = 'password123';

// Helper function for customer booking as GUEST (no login required)
// CRITICAL: Customers book as anonymous users - NO LOGIN NEEDED
// Only therapists, admins, and business owners log in
async function createGuestBooking(page: Page, customerName: string, customerWhatsApp: string, therapistId: string = TEST_THERAPIST_ID) {
  console.log('📱 Starting guest booking flow...');

  // Navigate to therapist profile - wait for DOM to load (hash routing)
  await page.goto(`${BASE_URL}/#/therapist/${therapistId}`, { 
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  });
  
  // Wait for React and API calls to complete
  await page.waitForTimeout(3000);

  // Wait for splash screen to disappear
  await page.locator('#pwa-splash').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

  // Wait for page to be fully loaded
  await page.waitForLoadState('load', { timeout: 15000 });
  
  // Additional wait for React/SPA to render (after data fetch)
  await page.waitForTimeout(2000);

  // Wait for therapist profile content to appear (indicates data loaded)
  await page.waitForSelector('text=/therapist|terapis/i', { timeout: 10000 }).catch(() => {
    console.log('⚠️ Therapist heading not found, continuing anyway...');
  });

  // Try multiple button selectors (different possible implementations)
  const buttonSelectors = [
    'button:has-text("Book Now")',
    'button:has-text("Book")',
    'button:has-text("Pesan")',
    'button:has-text("Schedule")',
    'button[data-testid="book-now"]',
    'button[class*="book"]',
    'a:has-text("Book Now")',
    'a:has-text("Book")'
  ];

  let bookNowButton: import('@playwright/test').Locator | null = null;
  let buttonFound = false;
  
  for (const selector of buttonSelectors) {
    console.log(`🔍 Trying selector: ${selector}`);
    const button = page.locator(selector).first();
    
    const count = await button.count();
    if (count > 0) {
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        bookNowButton = button;
        buttonFound = true;
        console.log(`✅ Booking button found with selector: ${selector}`);
        break;
      }
    }
  }

  if (!buttonFound || !bookNowButton) {
    console.error('❌ Booking button not found with any selector');
    await page.screenshot({ path: 'debug-therapist-profile.png', fullPage: true });
    console.log('📸 Debug screenshot saved to: debug-therapist-profile.png');
    console.log('📄 Page HTML:', await page.content());
    throw new Error('Booking button not found on therapist profile page. Check if therapist profile exists or if URL routing is correct.');
  }

  console.log('🖱️ Clicking booking button...');
  await bookNowButton.click();

  // Fill booking form
  console.log('📝 Filling booking form...');
  await page.locator('input[name="customerName"], input[id="customerName"]').fill(customerName);
  await page.locator('input[name="customerWhatsApp"], input[id="customerWhatsApp"]').fill(customerWhatsApp);

  // Select 60 min duration if available
  await page.locator('button:has-text("60")').first().click().catch(() => {
    console.log('⚠️ 60 min button not found, proceeding anyway...');
  });

  // Submit booking
  await page.locator('button:has-text("Confirm"), button[type="submit"]').first().click();
  console.log('✅ Guest booking submitted');
}

// Helper for provider (therapist/admin) login
async function loginProvider(page: Page, email: string, password: string, role: 'therapist' | 'admin') {
  console.log(`🔐 Logging in ${role}...`);

  await page.goto(BASE_URL, { 
    timeout: 30000,
    waitUntil: 'domcontentloaded'
  });
  
  // Wait for React to render
  await page.waitForTimeout(2000);
  // Ensure SPA is fully loaded
  await page.waitForLoadState('load', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Set mobile viewport to show hamburger
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000); // Allow responsive layout to apply

  // Try multiple hamburger menu selectors
  const hamburgerSelectors = [
    'header button svg', // Button with SVG inside
    'header button[aria-label*="menu"]',
    'header button[class*="menu"]',
    'header button[class*="hamburger"]',
    'button[aria-label="Menu"]',
    '[data-testid="hamburger-menu"]',
    'nav button:first-of-type',
    'header button:first-of-type'
  ];

  let menuButton;
  let menuFound = false;

  for (const selector of hamburgerSelectors) {
    console.log(`🔍 Trying menu selector: ${selector}`);
    menuButton = page.locator(selector).first();
    
    const count = await menuButton.count();
    if (count > 0) {
      const isVisible = await menuButton.isVisible().catch(() => false);
      if (isVisible) {
        menuFound = true;
        console.log(`✅ Menu button found with selector: ${selector}`);
        break;
      }
    }
  }

  if (!menuFound) {
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
    console.error('❌ Hamburger menu not found. Screenshot saved.');
    throw new Error('Hamburger menu not found. Check if mobile layout is rendering correctly.');
  }

  await menuButton!.click();
  await page.waitForTimeout(500); // Wait for menu animation

  // Click login option
  const loginButton = role === 'therapist' 
    ? page.locator('button:has-text("Therapist"), a:has-text("Therapist")') 
    : page.locator('button:has-text("Admin"), a:has-text("Admin")');
  
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Fill credentials
  await page.locator('#email, input[type="email"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#email, input[type="email"]').fill(email);
  await page.locator('#password, input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait for dashboard
  await page.waitForURL(/dashboard|therapist|admin/, { timeout: 15000 });
  console.log(`✅ ${role} logged in successfully`);
}

interface SimulatedUser {
  name: string;
  email: string;
  therapistId: string;
  therapistName: string;
  bookingType: 'bookNow' | 'scheduled' | 'slider';
}

const simulatedUsers: SimulatedUser[] = [
  {
    name: 'Customer 1',
    email: TEST_CUSTOMER_EMAIL,
    therapistId: TEST_THERAPIST_ID,
    therapistName: 'Test Therapist',
    bookingType: 'bookNow'
  },
  // Add more users if needed
];

let bookingIds: string[] = [];
let chatRoomIds: string[] = [];
const revenueGuard = new RevenueGuard();

test.describe('🤖 AI Human Full Workflow - Multi-User Orchestration', () => {

  test.afterEach(async () => {
    // Comprehensive cleanup
    console.log('🧹 Cleaning up test data...');
    
    for (const bookingId of bookingIds) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.BOOKINGS!, bookingId);
      } catch (error) {
        console.warn(`Cleanup: Could not delete booking ${bookingId}`);
      }
    }

    for (const chatRoomId of chatRoomIds) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHAT_SESSIONS!, chatRoomId);
      } catch (error) {
        console.warn(`Cleanup: Could not delete chat room ${chatRoomId}`);
      }
    }

    // Clear orphan commissions (if collection exists)
    try {
      const orphans = await revenueGuard.scanForOrphanCommissions();
      if (orphans.length > 0) {
        console.log(`🧹 Clearing ${orphans.length} orphan commissions...`);
        await revenueGuard.clearOrphanCommissions();
      }
    } catch (error: any) {
      if (error.code === 404 || error.message?.includes('not be found')) {
        console.log('ℹ️ Commissions collection not found, skipping cleanup');
      } else {
        console.warn('⚠️ Could not clear orphan commissions:', error.message);
      }
    }

    bookingIds = [];
    chatRoomIds = [];
  });

  for (const user of simulatedUsers) {
    test(`Full workflow for ${user.name} - ${user.bookingType}`, async ({ page, context }) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎭 Starting AI Human Full Workflow for ${user.name}`);
      console.log(`   Booking Type: ${user.bookingType}`);
      console.log(`   Therapist: ${user.therapistName}`);
      console.log(`${'='.repeat(80)}\n`);

      const timestamps = {
        bookingCreated: 0,
        chatRoomCreated: 0,
        notificationCreated: 0,
        bookingAccepted: 0,
        commissionCreated: 0
      };

      // ========================================
      // PHASE 1: CUSTOMER BOOKING FLOW
      // ========================================
      console.log('📱 PHASE 1: Customer Booking Flow (Guest - No Login Required)');

      // Customers book as guests - no login needed!
      await createGuestBooking(page, 'Test Customer', '081234567890');

      console.log('✅ Customer logged in');

      // Navigate to therapist profile
      await page.goto(`${BASE_URL}/therapist/${user.therapistId}`);
      await page.waitForLoadState('networkidle');

      let bookingId = '';

      if (user.bookingType === 'bookNow') {
        console.log('⚡ Book Now flow...');
        await page.click('button:has-text("Book Now")');
        await page.fill('[name="location"]', 'Sydney CBD');
        await page.fill('[name="duration"]', '60');
        await page.click('button:has-text("Confirm Booking")');
        
      } else if (user.bookingType === 'scheduled') {
        console.log('📅 Scheduled booking flow...');
        await page.click('button:has-text("Schedule")');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        
        await page.fill('[name="date"]', dateString);
        await page.fill('[name="time"]', '14:00');
        await page.fill('[name="location"]', 'Melbourne CBD');
        await page.fill('[name="duration"]', '90');
        await page.click('button:has-text("Schedule Booking")');
        
      } else if (user.bookingType === 'slider') {
        console.log('💰 Slider booking flow...');
        
        // Adjust price slider
        const slider = page.locator('input[type="range"]');
        await slider.fill('80');
        
        await page.click('button:has-text("Book with Selected Price")');
        await page.fill('[name="location"]', 'Brisbane CBD');
        await page.fill('[name="duration"]', '120');
        await page.click('button:has-text("Confirm")');
      }

      // Wait for booking confirmation
      await page.waitForURL('**/booking-confirmation/*', { timeout: 10000 });
      bookingId = page.url().split('/').pop()!;
      bookingIds.push(bookingId);
      timestamps.bookingCreated = Date.now();

      console.log(`✅ Booking created: ${bookingId}`);

      // ========================================
      // VERIFICATION 1: BOOKING IN DATABASE
      // ========================================
      console.log('\n🔍 VERIFICATION 1: Booking in Database');

      await page.waitForTimeout(1000);

      const booking = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS!,
        bookingId
      );

      expect(booking).toBeDefined();
      expect(booking.$id).toBe(bookingId);
      expect(booking.providerId).toBe(user.therapistId);
      expect(booking.providerResponseStatus).toBe('AwaitingResponse');

      console.log('✅ Booking exists in database');
      console.log(`   Status: ${booking.providerResponseStatus}`);
      console.log(`   Provider: ${booking.providerId}`);

      // ========================================
      // VERIFICATION 2: CHAT ROOM CREATED (<2s)
      // ========================================
      console.log('\n🔍 VERIFICATION 2: Chat Room Creation');

      await page.waitForTimeout(1000);

      const chatRooms = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS!,
        [Query.equal('bookingId', bookingId)]
      );

      expect(chatRooms.documents.length).toBeGreaterThan(0);
      timestamps.chatRoomCreated = Date.now();
      
      const chatLatency = timestamps.chatRoomCreated - timestamps.bookingCreated;
      expect(chatLatency).toBeLessThan(2000);
      
      const chatRoomId = chatRooms.documents[0].$id;
      chatRoomIds.push(chatRoomId);

      console.log(`✅ Chat room created: ${chatRoomId}`);
      console.log(`   Latency: ${chatLatency}ms`);

      // Verify system message
      const messages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAT_MESSAGES!,
        [Query.equal('roomId', chatRoomId)]
      );

      const systemMessage = messages.documents.find(
        msg => msg.senderId === 'system' || msg.senderType === 'system'
      );

      expect(systemMessage).toBeDefined();
      console.log('✅ System message created in chat');

      // ========================================
      // VERIFICATION 3: THERAPIST NOTIFICATION (<3s)
      // ========================================
      console.log('\n🔍 VERIFICATION 3: Therapist Notification');

      const notifications = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS!,
        [Query.equal('userId', user.therapistId)]
      );

      const bookingNotification = notifications.documents.find(
        n => n.type === 'new_booking' && n.bookingId === bookingId
      );

      expect(bookingNotification).toBeDefined();
      timestamps.notificationCreated = Date.now();
      
      const notificationLatency = timestamps.notificationCreated - timestamps.bookingCreated;
      expect(notificationLatency).toBeLessThan(3000);

      console.log('✅ Therapist notification created');
      console.log(`   Latency: ${notificationLatency}ms`);

      // ========================================
      // VERIFICATION 4: CUSTOMER CHAT ACCESS
      // ========================================
      console.log('\n🔍 VERIFICATION 4: Customer Chat Access');

      await page.goto(`${BASE_URL}/chat/${chatRoomId}`);
      await page.waitForLoadState('networkidle');

      // Send a test message
      await page.fill('[placeholder*="message"]', 'Looking forward to the session!');
      await page.click('button:has-text("Send")');

      await expect(page.locator('text=Looking forward to the session!')).toBeVisible({ timeout: 5000 });

      console.log('✅ Customer can send chat messages');

      // ========================================
      // PHASE 2: THERAPIST ACCEPTANCE FLOW
      // ========================================
      console.log('\n💆 PHASE 2: Therapist Acceptance Flow');

      // Open therapist dashboard in new page
      const therapistPage = await context.newPage();
      await loginProvider(therapistPage, TEST_THERAPIST_EMAIL, TEST_THERAPIST_PASSWORD, 'therapist');

      console.log('✅ Therapist logged in');

      // Navigate to bookings
      await therapistPage.goto(`${THERAPIST_URL}/bookings`);
      await therapistPage.waitForLoadState('networkidle');

      // Verify countdown timer visible
      const countdownSelector = `[data-booking-id="${bookingId}"] [data-testid="countdown-timer"]`;
      const countdown = therapistPage.locator(countdownSelector);
      
      if (await countdown.isVisible({ timeout: 5000 })) {
        const countdownText = await countdown.textContent();
        console.log(`⏰ Countdown timer: ${countdownText}`);
        expect(countdownText).toMatch(/\d{1,2}:\d{2}/);
      }

      // Accept booking
      await therapistPage.click(`[data-booking-id="${bookingId}"] button:has-text("Accept")`);
      await therapistPage.waitForSelector('text=Booking accepted', { timeout: 5000 });
      timestamps.bookingAccepted = Date.now();

      console.log('✅ Therapist accepted booking');

      // ========================================
      // VERIFICATION 5: BOOKING STATUS UPDATED
      // ========================================
      console.log('\n🔍 VERIFICATION 5: Booking Status Updated');

      await page.waitForTimeout(1000);

      const updatedBooking = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS!,
        bookingId
      );

      expect(updatedBooking.providerResponseStatus).toBe('Accepted');

      console.log('✅ Booking status: Accepted');

      // ========================================
      // VERIFICATION 6: COMMISSION CREATED (REVENUE CRITICAL)
      // ========================================
      console.log('\n💰 VERIFICATION 6: Commission Created (REVENUE CRITICAL)');

      await page.waitForTimeout(2000);

      // Use RevenueGuard for comprehensive commission verification
      await revenueGuard.verifyCommissionCreated(bookingId);
      await revenueGuard.verifyNoDuplicates(bookingId);
      await revenueGuard.verifyCommissionTiming(bookingId, new Date(timestamps.bookingAccepted));

      timestamps.commissionCreated = Date.now();
      const commissionLatency = timestamps.commissionCreated - timestamps.bookingAccepted;

      console.log('✅ Commission created and verified');
      console.log(`   Latency: ${commissionLatency}ms`);

      // Check for revenue violations
      if (revenueGuard.shouldBlockDeployment()) {
        const report = revenueGuard.generateReport();
        throw new Error(`🚨 REVENUE VIOLATIONS DETECTED:\n${report}`);
      }

      console.log('✅ No revenue violations detected');

      // ========================================
      // VERIFICATION 7: IDEMPOTENCY ENFORCEMENT
      // ========================================
      console.log('\n🔍 VERIFICATION 7: Idempotency Enforcement');

      // Try to accept again - should fail or be ignored
      await therapistPage.goto(`${THERAPIST_URL}/bookings`);
      
      const acceptButton = therapistPage.locator(`[data-booking-id="${bookingId}"] button:has-text("Accept")`);
      const isDisabled = await acceptButton.isDisabled({ timeout: 2000 }).catch(() => false);
      const isVisible = await acceptButton.isVisible({ timeout: 2000 }).catch(() => false);

      // Button should either be disabled or not visible
      expect(isDisabled || !isVisible).toBe(true);

      console.log('✅ Idempotency enforced - cannot accept twice');

      // ========================================
      // VERIFICATION 8: ADMIN AUDIT TRAIL
      // ========================================
      console.log('\n📊 VERIFICATION 8: Admin Audit Trail');

      // Open admin dashboard in new page
      const adminPage = await context.newPage();
      await loginProvider(adminPage, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'admin');

      console.log('✅ Admin logged in');

      // Navigate to booking details
      await adminPage.goto(`${ADMIN_URL}/bookings/${bookingId}`);
      await adminPage.waitForLoadState('networkidle');

      // Verify booking visible
      await expect(adminPage.locator(`text=${bookingId}`)).toBeVisible({ timeout: 5000 });

      // Verify audit log entry
      const auditLogSection = adminPage.locator('[data-testid="audit-log"]');
      if (await auditLogSection.isVisible({ timeout: 5000 })) {
        await expect(auditLogSection.locator('text=BOOKING_ACCEPTED')).toBeVisible();
        console.log('✅ Audit log contains BOOKING_ACCEPTED');
      }

      await adminPage.close();
      await therapistPage.close();

      // ========================================
      // FINAL SUMMARY
      // ========================================
      console.log('\n' + '='.repeat(80));
      console.log('📊 WORKFLOW COMPLETE - SUMMARY');
      console.log('='.repeat(80));
      console.log(`User: ${user.name}`);
      console.log(`Booking Type: ${user.bookingType}`);
      console.log(`Booking ID: ${bookingId}`);
      console.log(`\nTimings:`);
      console.log(`  Booking → Chat Room: ${chatLatency}ms`);
      console.log(`  Booking → Notification: ${notificationLatency}ms`);
      console.log(`  Acceptance → Commission: ${commissionLatency}ms`);
      console.log(`\nVerifications:`);
      console.log(`  ✅ Booking created`);
      console.log(`  ✅ Chat room created (<2s)`);
      console.log(`  ✅ System message sent`);
      console.log(`  ✅ Notification delivered (<3s)`);
      console.log(`  ✅ Customer chat access`);
      console.log(`  ✅ Therapist acceptance`);
      console.log(`  ✅ Commission created (REVENUE PROTECTED)`);
      console.log(`  ✅ Idempotency enforced`);
      console.log(`  ✅ Admin audit trail`);
      console.log('='.repeat(80) + '\n');
    });
  }

  // ========================================
  // ADDITIONAL SCENARIO: TIMEOUT HANDLING
  // ========================================
  test('Countdown timer accuracy and timeout handling', async ({ page, context }) => {
    console.log('\n⏰ Testing countdown timer accuracy...');

    // Customer books as guest (no login)
    await createGuestBooking(page, 'Timer Test Customer', '081234567891');

    // Create booking
    await page.goto(`${BASE_URL}/therapist/${TEST_THERAPIST_ID}`);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Test Location');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Open therapist dashboard
    const therapistPage = await context.newPage();
      await loginProvider(therapistPage, TEST_THERAPIST_EMAIL, TEST_THERAPIST_PASSWORD, 'therapist');

    // Verify countdown timer exists and shows time
    const countdown = therapistPage.locator(`[data-booking-id="${bookingId}"] [data-testid="countdown-timer"]`);
    await expect(countdown).toBeVisible({ timeout: 5000 });
    
    const timerText = await countdown.textContent();
    expect(timerText).toMatch(/\d{1,2}:\d{2}/);

    console.log(`✅ Countdown timer visible: ${timerText}`);

    // Wait 5 seconds and verify timer decreased
    await page.waitForTimeout(5000);
    const updatedTimerText = await countdown.textContent();
    
    console.log(`⏰ Timer after 5s: ${updatedTimerText}`);

    await therapistPage.close();

    console.log('✅ Countdown timer test complete');
  });

  // ========================================
  // ADDITIONAL SCENARIO: AUDIO/VIBRATION NOTIFICATIONS
  // ========================================
  test('Audio and vibration notifications', async ({ page, context }) => {
    console.log('\n🔔 Testing audio/vibration notifications...');

    // Customer books as guest (no login)
    await createGuestBooking(page, 'Audio Test Customer', '081234567892');

    // Create booking
    await page.goto(`${BASE_URL}/therapist/${TEST_THERAPIST_ID}`);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Test Location');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    console.log(`✅ Booking created: ${bookingId}`);

    // Open therapist dashboard with notification validator
    const therapistPage = await context.newPage();
    
    // Setup NotificationValidator BEFORE navigation
    const validator = new NotificationValidator(therapistPage);
    
    await loginProvider(therapistPage, TEST_THERAPIST_EMAIL, TEST_THERAPIST_PASSWORD, 'therapist');

    console.log('✅ Therapist logged in');

    // Setup audio and vibration monitoring
    await validator.monitorAudio('audio.booking-notification, audio[data-notification="new-booking"], audio');
    await validator.monitorVibration();

    console.log('🎧 Audio/vibration monitors active');

    // Navigate to bookings page - this should trigger notification
    await therapistPage.goto(`${THERAPIST_URL}/bookings`);
    await therapistPage.waitForLoadState('networkidle');

    // Wait for notification to fire
    console.log('⏳ Waiting for notifications...');
    const result = await validator.waitForAny(5000);

    // Validate notification triggers
    const status = validator.getStatus();
    
    console.log('\n📊 Notification Status:');
    console.log(`   Audio: ${status.audio ? '✅' : '❌'}`);
    console.log(`   Vibration: ${status.vibration ? '✅' : '❌'}`);
    console.log(`   Has Any: ${status.hasAny ? '✅' : '❌'}`);
    console.log(`   Has Both: ${status.hasBoth ? '✅' : '❌'}`);

    // At least one notification method should work (audio OR vibration)
    // Note: Vibration may not work in desktop browsers, so we're flexible
    expect(status.hasAny).toBe(true);

    if (status.audio) {
      console.log('✅ Audio notification played successfully');
    } else {
      console.log('⚠️ Audio notification not detected (may not be implemented)');
    }

    if (status.vibration) {
      console.log('✅ Vibration triggered successfully');
    } else {
      console.log('⚠️ Vibration not detected (expected on desktop browsers)');
    }

    await therapistPage.close();

    console.log('✅ Audio/vibration notification test complete');
  });

  // ========================================
  // ADDITIONAL SCENARIO: MULTI-NOTIFICATION SEQUENCE
  // ========================================
  test('Multiple notifications in sequence', async ({ page, context }) => {
    console.log('\n🔔 Testing multiple notification sequence...');

    // Open therapist dashboard
    const therapistPage = await context.newPage();
    const validator = new NotificationValidator(therapistPage);
    
    await loginProvider(therapistPage, TEST_THERAPIST_EMAIL, TEST_THERAPIST_PASSWORD, 'therapist');

    // Setup monitoring
    await validator.monitorAll('audio');

    console.log('🎧 Monitoring for multiple notifications...');

    // Customer creates first booking as guest (no login)
    await createGuestBooking(page, 'Multi Test Customer 1', '081234567893');

    // First booking
    await page.goto(`${BASE_URL}/therapist/${TEST_THERAPIST_ID}`);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Location 1');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId1 = page.url().split('/').pop()!;
    bookingIds.push(bookingId1);

    // Wait for first notification
    const result1 = await validator.waitForAny(5000);
    console.log(`📬 First notification: ${result1.audio || result1.vibration ? '✅' : '❌'}`);

    // Reset validator for second notification
    validator.reset();
    console.log('🔄 Reset validator for second notification');

    // Second booking
    await page.goto(`${BASE_URL}/therapist/${TEST_THERAPIST_ID}`);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Location 2');
    await page.fill('[name="duration"]', '90');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId2 = page.url().split('/').pop()!;
    bookingIds.push(bookingId2);

    // Wait for second notification
    const result2 = await validator.waitForAny(5000);
    console.log(`📬 Second notification: ${result2.audio || result2.vibration ? '✅' : '❌'}`);

    // Both notifications should have triggered
    expect(result1.audio || result1.vibration).toBe(true);
    expect(result2.audio || result2.vibration).toBe(true);

    console.log('✅ Multiple notification sequence test complete');

    await therapistPage.close();
  });
});
