/**
 * 🔒 BOOKING FLOW E2E TEST - SIMPLIFIED & FOCUSED
 * Tests the critical commission-on-acceptance flow
 */

import { test, expect } from '@playwright/test';
import { databases, DATABASE_ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const BASE_URL = 'http://localhost:3002';

// Test will use guest mode (no login required for booking)
test.describe('🔒 Booking Flow: Commission on Acceptance (Guest)', () => {
    let bookingId: string | undefined;
    let commissionId: string | undefined;

    test.afterEach(async () => {
        console.log('🧹 Cleaning up test data...');
        
        // Cleanup created records
        try {
            if (bookingId) {
                await databases.deleteDocument(DATABASE_ID, APPWRITE_CONFIG.collections.bookings!, bookingId);
                console.log(`✅ Deleted booking: ${bookingId}`);
            }
        } catch (e) {
            console.warn('Could not delete booking:', e);
        }

        try {
            if (commissionId) {
                await databases.deleteDocument(DATABASE_ID, APPWRITE_CONFIG.collections.commissionRecords!, commissionId);
                console.log(`✅ Deleted commission: ${commissionId}`);
            }
        } catch (e) {
            console.warn('Could not delete commission:', e);
        }
    });

    test('✅ CRITICAL: Order Now → PENDING → ACCEPTED → Commission Recorded', async ({ page }) => {
        console.log('\n📋 Starting booking flow test...\n');

        /**
         * STEP 1: Navigate to homepage
         */
        console.log('Step 1: Navigate to homepage');
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for React to hydrate

        /**
         * STEP 2: Find first available therapist
         */
        console.log('Step 2: Looking for available therapist...');
        
        // Wait for therapist cards to load
        const therapistCards = page.locator('[data-testid="therapist-card"], .therapist-card, [class*="TherapistCard"]');
        await therapistCards.first().waitFor({ state: 'visible', timeout: 10000 });
        
        const therapistCount = await therapistCards.count();
        console.log(`✅ Found ${therapistCount} therapists`);

        // Click on first therapist to open profile
        await therapistCards.first().click();
        await page.waitForTimeout(1000);

        /**
         * STEP 3: Click "Order Now" or "Book Now" button
         */
        console.log('Step 3: Clicking Order Now button...');
        
        // Try multiple button selectors
        const orderNowButton = page.locator('button').filter({ 
            hasText: /Order Now|Book Now|จองตอนนี้/i 
        }).first();
        
        await orderNowButton.waitFor({ state: 'visible', timeout: 5000 });
        await orderNowButton.click();
        console.log('✅ Clicked Order Now');

        /**
         * STEP 4: Fill booking form in chat window
         */
        console.log('Step 4: Filling booking form...');
        await page.waitForTimeout(1000); // Wait for chat to open

        // Fill customer details
        const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="ชื่อ"]').first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('E2E Test Customer');
        }

        const whatsappInput = page.locator('input[name="whatsapp"], input[name="phone"], input[placeholder*="WhatsApp"]').first();
        if (await whatsappInput.isVisible()) {
            await whatsappInput.fill('081234567890');
        }

        // Select duration (if available)
        const durationSelect = page.locator('select[name="duration"]').first();
        if (await durationSelect.isVisible()) {
            await durationSelect.selectOption('60');
        }

        // Submit booking
        const submitButton = page.locator('button[type="submit"], button').filter({ 
            hasText: /Submit|Confirm|Send|ส่ง|ยืนยัน/i 
        }).first();
        
        await submitButton.waitFor({ state: 'visible', timeout: 5000 });
        await submitButton.click();
        console.log('✅ Submitted booking form');

        /**
         * STEP 5: Wait for booking to be created in database
         */
        console.log('Step 5: Waiting for booking creation...');
        await page.waitForTimeout(2000);

        // Query for most recent booking
        const bookings = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.bookings!,
            [Query.orderDesc('$createdAt'), Query.limit(1)]
        );

        expect(bookings.documents.length).toBeGreaterThan(0);
        const booking = bookings.documents[0];
        bookingId = booking.$id;

        console.log(`✅ Booking created: ${bookingId}`);
        console.log(`   Status: ${booking.bookingStatus}`);
        console.log(`   Total Price: ${booking.totalPrice}`);
        console.log(`   Admin Commission: ${booking.adminCommission}`);

        /**
         * STEP 6: Verify booking status is PENDING
         */
        console.log('Step 6: Verifying PENDING status...');
        expect(booking.bookingStatus).toBe('PENDING');
        console.log('✅ Booking status is PENDING');

        /**
         * STEP 7: Verify NO commission recorded yet
         */
        console.log('Step 7: Verifying NO commission before acceptance...');
        
        const commissionsBefore = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.commissionRecords!,
            [Query.equal('bookingId', booking.bookingId), Query.limit(10)]
        );

        expect(commissionsBefore.documents.length).toBe(0);
        console.log('✅ No commission recorded yet (correct!)');

        /**
         * STEP 8: Simulate therapist accepting booking
         */
        console.log('Step 8: Simulating therapist acceptance...');
        
        // Import bookingLifecycleService
        const { bookingLifecycleService } = await import('../lib/services/bookingLifecycleService');
        
        // Call acceptBooking
        const acceptedBooking = await bookingLifecycleService.acceptBooking(bookingId);
        
        console.log(`✅ Booking accepted`);
        console.log(`   Status: ${acceptedBooking.bookingStatus}`);

        /**
         * STEP 9: Verify booking status changed to ACCEPTED
         */
        console.log('Step 9: Verifying ACCEPTED status...');
        expect(acceptedBooking.bookingStatus).toBe('ACCEPTED');
        console.log('✅ Booking status is ACCEPTED');

        /**
         * STEP 10: Verify commission WAS recorded on acceptance
         */
        console.log('Step 10: Verifying commission recorded on ACCEPTANCE...');
        
        await page.waitForTimeout(1000); // Give database a moment
        
        const commissionsAfter = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.commissionRecords!,
            [Query.equal('bookingId', booking.bookingId), Query.limit(10)]
        );

        expect(commissionsAfter.documents.length).toBe(1);
        const commission = commissionsAfter.documents[0];
        commissionId = commission.$id;

        console.log('✅ Commission recorded on ACCEPTANCE!');
        console.log(`   Commission ID: ${commissionId}`);
        console.log(`   Admin Commission: ${commission.adminCommission}`);
        console.log(`   Provider Payout: ${commission.providerPayout}`);
        console.log(`   Status: ${commission.status}`);

        /**
         * STEP 11: Verify commission amounts are correct (30/70 split)
         */
        console.log('Step 11: Verifying commission calculations...');
        
        const expectedAdminCommission = Math.round(booking.totalPrice * 0.30);
        const expectedProviderPayout = booking.totalPrice - expectedAdminCommission;

        expect(commission.adminCommission).toBe(expectedAdminCommission);
        expect(commission.providerPayout).toBe(expectedProviderPayout);
        expect(commission.commissionRate).toBe(0.30);
        
        console.log('✅ Commission calculations correct (30% admin, 70% provider)');

        /**
         * STEP 12: Verify commission status
         */
        console.log('Step 12: Verifying commission status...');
        expect(commission.status).toBe('ACCEPTED');
        console.log('✅ Commission status is ACCEPTED (locked in)');

        /**
         * STEP 13: Verify NO duplicate commissions
         */
        console.log('Step 13: Verifying no duplicate commissions...');
        
        const allCommissions = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.commissionRecords!,
            [Query.equal('bookingId', booking.bookingId), Query.limit(10)]
        );

        expect(allCommissions.documents.length).toBe(1);
        console.log('✅ Only 1 commission record exists (no duplicates)');

        /**
         * FINAL VERIFICATION: Complete flow summary
         */
        console.log('\n' + '='.repeat(60));
        console.log('📊 BOOKING FLOW TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Booking ID: ${bookingId}`);
        console.log(`✅ Status Flow: PENDING → ACCEPTED`);
        console.log(`✅ Commission ID: ${commissionId}`);
        console.log(`✅ Admin Commission: ${commission.adminCommission} (30%)`);
        console.log(`✅ Provider Payout: ${commission.providerPayout} (70%)`);
        console.log(`✅ Commission activated on ACCEPTANCE ✅`);
        console.log(`✅ No duplicate commissions ✅`);
        console.log('='.repeat(60));
        console.log('🎉 ALL ASSERTIONS PASSED!');
        console.log('='.repeat(60) + '\n');
    });

    test('⚠️ VERIFY: Commission NOT recorded on PENDING', async () => {
        console.log('\n📋 Testing commission timing...\n');

        /**
         * Create a booking directly via service (skip UI)
         */
        console.log('Step 1: Creating booking via service...');
        
        const { bookingLifecycleService, BookingType } = await import('../lib/services/bookingLifecycleService');
        
        const testBooking = await bookingLifecycleService.createBooking({
            customerId: 'test-customer',
            customerName: 'E2E Test Customer',
            customerPhone: '081234567890',
            therapistId: 'test-therapist',
            therapistName: 'Test Therapist',
            providerType: 'therapist',
            serviceType: 'Swedish Massage',
            duration: 60,
            locationZone: 'Test Zone',
            bookingType: BookingType.BOOK_NOW,
            totalPrice: 300000,
            therapistStatus: 'Available'
        });

        bookingId = testBooking.$id!;
        console.log(`✅ Booking created: ${bookingId}`);
        console.log(`   Status: ${testBooking.bookingStatus}`);

        /**
         * Verify booking is PENDING
         */
        expect(testBooking.bookingStatus).toBe('PENDING');
        console.log('✅ Booking is PENDING');

        /**
         * Verify NO commission exists
         */
        console.log('Step 2: Verifying no commission on PENDING...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const commissions = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.commissionRecords!,
            [Query.equal('bookingId', testBooking.bookingId), Query.limit(10)]
        );

        expect(commissions.documents.length).toBe(0);
        console.log('✅ No commission recorded on PENDING (correct!)');

        /**
         * Now accept the booking
         */
        console.log('Step 3: Accepting booking...');
        
        const acceptedBooking = await bookingLifecycleService.acceptBooking(bookingId);
        expect(acceptedBooking.bookingStatus).toBe('ACCEPTED');
        console.log('✅ Booking accepted');

        /**
         * Verify commission NOW exists
         */
        console.log('Step 4: Verifying commission after ACCEPTANCE...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const commissionsAfter = await databases.listDocuments(
            DATABASE_ID,
            APPWRITE_CONFIG.collections.commissionRecords!,
            [Query.equal('bookingId', testBooking.bookingId), Query.limit(10)]
        );

        expect(commissionsAfter.documents.length).toBe(1);
        commissionId = commissionsAfter.documents[0].$id;
        
        console.log('✅ Commission recorded after ACCEPTANCE!');
        console.log(`   Commission ID: ${commissionId}`);
        
        console.log('\n✅ TEST PASSED: Commission timing is correct!');
    });
});
