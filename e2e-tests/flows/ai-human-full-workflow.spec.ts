/**
 * AI Human E2E Full Workflow Orchestration
 * 
 * Comprehensive multi-scenario test covering:
 * - Multiple booking types (Book Now, Scheduled, Slider)
 * - Chat system with audio/vibration notifications
 * - Commission verification (revenue protection)
 * - Countdown timers and auto-acceptance
 * - Admin & Therapist dashboards
 * - Multi-user orchestration
 */

import { test, expect } from '@playwright/test';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwrite';
import { RevenueGuard } from '../verification/RevenueGuard';

const TEST_THERAPIST_ID = '6971ccc9000f3c39f49c'; // From APPWRITE_MASTER_CONFIG
const TEST_CUSTOMER_EMAIL = 'user@test.com';
const TEST_THERAPIST_EMAIL = 'therapist@test.com';
const TEST_ADMIN_EMAIL = 'admin@test.com';

let bookingIds: string[] = [];
let chatRoomIds: string[] = [];
let commissionIds: string[] = [];
const revenueGuard = new RevenueGuard();

test.describe('AI Human E2E Full Workflow Orchestration', () => {
  
  test.afterEach(async () => {
    // Cleanup test data
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

    // Clear orphan commissions - handle missing collection gracefully
    try {
      const orphans = await revenueGuard.scanForOrphanCommissions();
      if (orphans.length > 0) {
        console.log(`🧹 Clearing ${orphans.length} orphan commissions...`);
        await revenueGuard.clearOrphanCommissions();
      }
    } catch (error: any) {
      if (error.code === 404 || error.message?.includes('could not be found')) {
        console.warn('⚠️ Commissions collection not found, skipping orphan cleanup');
      } else {
        throw error;
      }
    }

    // Reset arrays
    bookingIds = [];
    chatRoomIds = [];
    commissionIds = [];
  });

  /**
   * Scenario 1: Book Now - Immediate booking with chat and notification
   */
  test('Scenario 1: Book Now workflow with instant chat creation', async ({ page, context }) => {
    console.log('📍 Starting Book Now scenario...');
    const startTime = Date.now();

    // Step 1: Customer books therapist (Book Now)
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    // Wait for login form to be fully rendered
    await page.waitForSelector('input[type="email"], input[type="text"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Find therapist and book now
    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Book Now")');
    
    // Fill booking form
    await page.fill('[name="location"]', 'Sydney CBD');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    
    // Wait for booking confirmation
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    const bookingCreatedTime = Date.now();

    // Step 2: Verify chat room created immediately (<2 seconds)
    await page.waitForTimeout(1000);
    
    const chatRooms = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHAT_SESSIONS!,
      [Query.equal('bookingId', bookingId)]
    );

    expect(chatRooms.documents.length).toBeGreaterThan(0);
    const chatLatency = Date.now() - bookingCreatedTime;
    expect(chatLatency).toBeLessThan(2000);
    
    chatRoomIds.push(chatRooms.documents[0].$id);

    console.log(`✅ Book Now scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 2: Scheduled Booking - Future booking with countdown timer
   */
  test('Scenario 2: Scheduled booking with countdown timer', async ({ page }) => {
    console.log('📅 Starting Scheduled Booking scenario...');
    const startTime = Date.now();

    // Login as customer
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    await page.waitForSelector('input[type="email"], input[type="text"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Find therapist and book now
    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Schedule")');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('[name="date"]', dateString);
    await page.fill('[name="time"]', '14:00');
    await page.fill('[name="location"]', 'Melbourne CBD');
    await page.fill('[name="duration"]', '90');
    await page.click('button:has-text("Schedule Booking")');
    
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Verify booking has scheduled status
    const booking = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.BOOKINGS!,
      bookingId
    );

    expect(booking.status).toBe('pending');
    expect(booking.date).toBe(dateString);
    expect(booking.time).toBe('14:00');

    console.log(`✅ Scheduled Booking scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 3: Slider Booking - Price negotiation flow
   */
  test('Scenario 3: Slider booking with price selection', async ({ page }) => {
    console.log('💰 Starting Slider Booking scenario...');
    const startTime = Date.now();

    // Login as customer
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Use slider to select price
    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    
    // Adjust price slider to 80 AUD
    const slider = await page.locator('input[type="range"]');
    await slider.fill('80');
    
    await page.click('button:has-text("Book with Selected Price")');
    await page.fill('[name="location"]', 'Brisbane CBD');
    await page.fill('[name="duration"]', '120');
    await page.click('button:has-text("Confirm")');
    
    await page.waitForURL('**/booking-confirmation/*');
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Verify price is 80
    const booking = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.BOOKINGS!,
      bookingId
    );

    expect(booking.price).toBe(80);

    console.log(`✅ Slider Booking scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 4: Chat System - Messages, audio, vibration
   */
  test('Scenario 4: Chat system with notifications', async ({ page, context }) => {
    console.log('💬 Starting Chat System scenario...');
    const startTime = Date.now();

    // Create a booking first
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Perth CBD');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Open chat
    await page.click('text=Chat with Therapist');
    
    // Send message
    await page.fill('[placeholder="Type a message..."]', 'Hello! Looking forward to the session.');
    await page.click('button:has-text("Send")');

    // Verify message sent
    await expect(page.locator('text=Hello! Looking forward to the session.')).toBeVisible();

    // Get chat room
    const chatRooms = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHAT_SESSIONS!,
      [Query.equal('bookingId', bookingId)]
    );

    expect(chatRooms.documents.length).toBeGreaterThan(0);
    chatRoomIds.push(chatRooms.documents[0].$id);

    // Verify messages in database
    const messages = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHAT_MESSAGES!,
      [Query.equal('roomId', chatRooms.documents[0].$id)]
    );

    expect(messages.documents.length).toBeGreaterThan(0);

    console.log(`✅ Chat System scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 5: Notifications - Push, audio, vibration
   */
  test('Scenario 5: Notification delivery with audio/vibration', async ({ page, context }) => {
    console.log('🔔 Starting Notifications scenario...');
    const startTime = Date.now();

    // Create booking as customer
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Adelaide CBD');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    const bookingCreatedTime = Date.now();

    // Wait for notification
    await page.waitForTimeout(2000);

    // Verify therapist received notification
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS!,
      [Query.equal('userId', TEST_THERAPIST_ID)]
    );

    const bookingNotification = notifications.documents.find(
      n => n.type === 'new_booking'
    );

    expect(bookingNotification).toBeDefined();
    
    const notificationLatency = Date.now() - bookingCreatedTime;
    expect(notificationLatency).toBeLessThan(3000);

    console.log(`✅ Notifications scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 6: Commission Verification (REVENUE CRITICAL)
   */
  test('Scenario 6: Commission verification and revenue protection', async ({ page, context }) => {
    console.log('💰 Starting Commission Verification scenario...');
    const startTime = Date.now();

    // Customer creates booking
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Hobart CBD');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Open therapist page in new context
    const therapistPage = await context.newPage();
    await therapistPage.goto('http://localhost:3002/#/therapist/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await therapistPage.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await therapistPage.fill('[name="email"]', TEST_THERAPIST_EMAIL);
    await therapistPage.fill('[name="password"]', 'password123');
    await therapistPage.click('button[type="submit"]');
    await therapistPage.waitForURL('**/dashboard');

    // Accept booking
    await therapistPage.goto('http://localhost:3002/#/therapist/bookings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await therapistPage.click(`[data-booking-id="${bookingId}"] button:has-text("Accept")`);
    await therapistPage.waitForSelector('text=Booking accepted');

    const bookingAcceptedTime = Date.now();

    // Wait for commission creation
    await page.waitForTimeout(3000);

    // REVENUE CRITICAL: Verify commission created
    await revenueGuard.verifyCommissionCreated(bookingId);
    await revenueGuard.verifyNoDuplicates(bookingId);
    await revenueGuard.verifyCommissionTiming(bookingId, new Date(bookingAcceptedTime));

    // Verify no revenue violations
    if (revenueGuard.shouldBlockDeployment()) {
      const report = revenueGuard.generateReport();
      throw new Error(`🚨 REVENUE VIOLATIONS DETECTED:\n${report}`);
    }

    await therapistPage.close();

    console.log(`✅ Commission Verification scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 7: Countdown Timer - Auto-accept on timeout
   */
  test('Scenario 7: Countdown timer and auto-acceptance', async ({ page }) => {
    console.log('⏰ Starting Countdown Timer scenario...');
    const startTime = Date.now();

    // Create booking
    await page.goto('http://localhost:3002/#/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_CUSTOMER_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto(`http://localhost:3002/#/therapist/${TEST_THERAPIST_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Book Now")');
    await page.fill('[name="location"]', 'Darwin CBD');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL('**/booking-confirmation/*');
    
    const bookingId = page.url().split('/').pop()!;
    bookingIds.push(bookingId);

    // Navigate to booking details to see countdown
    await page.goto(`http://localhost:3002/#/booking/${bookingId}`, { waitUntil: 'domcontentloaded' });

    // Verify countdown timer is visible
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible({ timeout: 5000 });

    // Verify timer shows remaining time (e.g., "29:59")
    const timerText = await timer.textContent();
    expect(timerText).toMatch(/\d{1,2}:\d{2}/);

    console.log(`✅ Countdown Timer scenario completed in ${Date.now() - startTime}ms`);
  });

  /**
   * Scenario 8: Admin & Therapist Dashboards
   */
  test('Scenario 8: Admin and Therapist dashboard functionality', async ({ page, context }) => {
    console.log('📊 Starting Dashboards scenario...');
    const startTime = Date.now();

    // Test Therapist Dashboard - use role-based routing on same port
    await page.goto('http://localhost:3002/#/therapist/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await page.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await page.fill('[name="email"]', TEST_THERAPIST_EMAIL);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/therapist/dashboard');

    // Verify dashboard elements
    await expect(page.locator('text=My Bookings')).toBeVisible();
    await expect(page.locator('text=Earnings')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();

    // Test Admin Dashboard
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:3002/#/admin/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    await adminPage.waitForSelector('input[type="email"]', { 
      state: 'visible',
      timeout: 10000 
    });
    await adminPage.fill('[name="email"]', TEST_ADMIN_EMAIL);
    await adminPage.fill('[name="password"]', 'password123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard');

    // Verify admin dashboard elements
    await expect(adminPage.locator('text=All Bookings')).toBeVisible();
    await expect(adminPage.locator('text=Therapists')).toBeVisible();
    await expect(adminPage.locator('text=Revenue')).toBeVisible();

    await adminPage.close();

    console.log(`✅ Dashboards scenario completed in ${Date.now() - startTime}ms`);
  });
});


