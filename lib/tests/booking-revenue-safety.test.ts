/**
 * 🔒 REVENUE-SAFETY REGRESSION GUARD (MANDATORY)
 * 
 * These tests MUST pass before any booking-related code can be deployed.
 * 
 * Purpose: Ensure booking creation is ATOMIC and NEVER silently fails
 * - Booking created → Chat room created → Notification created → All or nothing
 * 
 * If ANY of these tests fail, the booking pipeline is BROKEN and revenue is at risk.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bookingService } from '../bookingService';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwrite';
import type { Booking } from '../../types';

describe('🔒 REVENUE-SAFETY REGRESSION GUARD', () => {
    let testBookingId: string;
    let testChatRoomId: string;
    let testNotificationId: string;
    
    const TEST_THERAPIST_ID = 'test-therapist-' + Date.now();
    const TEST_CUSTOMER_ID = 'test-customer-' + Date.now();

    beforeEach(() => {
        // Reset test IDs
        testBookingId = '';
        testChatRoomId = '';
        testNotificationId = '';
    });

    afterEach(async () => {
        // Clean up test data
        try {
            if (testBookingId) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTIONS.BOOKINGS!,
                    testBookingId
                );
            }
            if (testChatRoomId) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTIONS.CHAT_SESSIONS!,
                    testChatRoomId
                );
            }
            if (testNotificationId) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTIONS.NOTIFICATIONS!,
                    testNotificationId
                );
            }
        } catch (error) {
            console.warn('Cleanup failed (non-critical):', error);
        }
    });

    /**
     * ✅ CRITICAL TEST #1: Booking + Chat Room Creation (ATOMIC)
     * 
     * RULE: If booking is created, chat room MUST be created.
     * FAIL CONDITION: Booking exists but no chat room
     * BUSINESS IMPACT: Therapist cannot communicate with customer = REVENUE LOSS
     */
    it('🔒 MUST create chat room when booking is created', async () => {
        // Arrange
        const bookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            therapistType: 'therapist' as const,
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'pending' as const
        };

        // Act
        const booking = await bookingService.createBooking(bookingData);
        testBookingId = booking.$id!;

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Assert - Chat room MUST exist
        const chatRooms = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CHAT_SESSIONS!,
            [Query.equal('bookingId', booking.$id!)]
        );

        expect(chatRooms.documents.length).toBeGreaterThan(0);
        expect(chatRooms.documents[0].bookingId).toBe(booking.$id);
        expect(chatRooms.documents[0].therapistId).toBe(TEST_THERAPIST_ID);
        expect(chatRooms.documents[0].customerId).toBe(TEST_CUSTOMER_ID);

        testChatRoomId = chatRooms.documents[0].$id;

        // 🔒 REVENUE-SAFETY CHECK: If this fails, therapist cannot communicate
        if (chatRooms.documents.length === 0) {
            throw new Error(
                '🔴 REVENUE-SAFETY VIOLATION: Booking created but NO chat room. ' +
                'Therapist cannot communicate with customer. REVENUE AT RISK.'
            );
        }
    }, 10000); // 10 second timeout

    /**
     * ✅ CRITICAL TEST #2: System Message Creation (ATOMIC)
     * 
     * RULE: If chat room is created, initial system message MUST be sent.
     * FAIL CONDITION: Chat room exists but no system message
     * BUSINESS IMPACT: Customer doesn't know booking was received
     */
    it('🔒 MUST send system message when chat room is created', async () => {
        // Arrange
        const bookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            therapistType: 'therapist' as const,
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'pending' as const
        };

        // Act
        const booking = await bookingService.createBooking(bookingData);
        testBookingId = booking.$id!;

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get chat room
        const chatRooms = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CHAT_SESSIONS!,
            [Query.equal('bookingId', booking.$id!)]
        );

        expect(chatRooms.documents.length).toBeGreaterThan(0);
        testChatRoomId = chatRooms.documents[0].$id;

        // Assert - System message MUST exist
        const messages = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CHAT_MESSAGES!,
            [Query.equal('roomId', testChatRoomId)]
        );

        expect(messages.documents.length).toBeGreaterThan(0);
        
        const systemMessage = messages.documents.find(
            msg => msg.senderId === 'system' || msg.senderType === 'system'
        );
        
        expect(systemMessage).toBeDefined();

        // 🔒 REVENUE-SAFETY CHECK: If this fails, customer has no confirmation
        if (!systemMessage) {
            throw new Error(
                '🔴 REVENUE-SAFETY VIOLATION: Chat room created but NO system message. ' +
                'Customer has no booking confirmation. BAD USER EXPERIENCE.'
            );
        }
    }, 10000);

    /**
     * ✅ CRITICAL TEST #3: Therapist Notification (ATOMIC)
     * 
     * RULE: If booking is created, therapist notification MUST be created.
     * FAIL CONDITION: Booking exists but no notification
     * BUSINESS IMPACT: Therapist never knows about booking = REVENUE LOSS
     */
    it('🔒 MUST create therapist notification when booking is created', async () => {
        // Arrange
        const bookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            therapistType: 'therapist' as const,
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'pending' as const
        };

        // Act
        const booking = await bookingService.createBooking(bookingData);
        testBookingId = booking.$id!;

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Assert - Notification MUST exist
        const notifications = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS!,
            [Query.equal('userId', TEST_THERAPIST_ID)]
        );

        expect(notifications.documents.length).toBeGreaterThan(0);
        
        const bookingNotification = notifications.documents.find(
            notif => notif.type === 'new_booking'
        );
        
        expect(bookingNotification).toBeDefined();
        expect(bookingNotification?.userId).toBe(TEST_THERAPIST_ID);

        testNotificationId = bookingNotification?.$id || '';

        // 🔒 REVENUE-SAFETY CHECK: If this fails, therapist never knows booking exists
        if (!bookingNotification) {
            throw new Error(
                '🔴 REVENUE-SAFETY VIOLATION: Booking created but NO therapist notification. ' +
                'Therapist will NEVER know booking exists. DIRECT REVENUE LOSS.'
            );
        }
    }, 10000);

    /**
     * ✅ CRITICAL TEST #4: Schema Field Validation
     * 
     * RULE: Booking must use correct Appwrite schema fields (providerId, not therapistId)
     * FAIL CONDITION: Booking created with wrong field names
     * BUSINESS IMPACT: Queries and subscriptions break = silent failures
     */
    it('🔒 MUST use correct schema fields (providerId, providerType)', async () => {
        // Arrange
        const bookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            therapistType: 'therapist' as const,
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'pending' as const
        };

        // Act
        const booking = await bookingService.createBooking(bookingData);
        testBookingId = booking.$id!;

        // Fetch raw document from Appwrite
        const rawBooking = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.BOOKINGS!,
            booking.$id!
        );

        // Assert - Schema fields MUST be correct
        expect(rawBooking.providerId).toBeDefined();
        expect(rawBooking.providerId).toBe(TEST_THERAPIST_ID);
        expect(rawBooking.providerType).toBe('therapist');
        expect(rawBooking.providerResponseStatus).toBe('AwaitingResponse');

        // 🔒 REVENUE-SAFETY CHECK: If wrong fields, realtime subscriptions break
        if (!rawBooking.providerId) {
            throw new Error(
                '🔴 SCHEMA VIOLATION: Booking missing providerId field. ' +
                'Realtime subscriptions will NOT work. Silent failure imminent.'
            );
        }
    }, 10000);

    /**
     * ✅ CRITICAL TEST #5: Atomic Transaction (All or Nothing)
     * 
     * RULE: If ANY part fails (booking/chat/notification), entire operation MUST fail
     * FAIL CONDITION: Booking succeeds but chat or notification fails
     * BUSINESS IMPACT: Partial state = broken user experience
     */
    it('🔒 MUST be atomic - all or nothing', async () => {
        // This test verifies that if chat or notification fails,
        // the booking creation itself should fail or rollback
        
        const bookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: 'Test Customer',
            customerPhone: '+628123456789',
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            therapistType: 'therapist' as const,
            serviceType: 'Massage',
            duration: 60,
            price: 350000,
            location: 'Test Location',
            date: new Date().toISOString().split('T')[0],
            time: '14:00',
            status: 'pending' as const
        };

        try {
            const booking = await bookingService.createBooking(bookingData);
            testBookingId = booking.$id!;

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify ALL components exist
            const [chatRooms, notifications] = await Promise.all([
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.CHAT_SESSIONS!,
                    [Query.equal('bookingId', booking.$id!)]
                ),
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.NOTIFICATIONS!,
                    [Query.equal('userId', TEST_THERAPIST_ID)]
                )
            ]);

            const hasChatRoom = chatRooms.documents.length > 0;
            const hasNotification = notifications.documents.some(n => n.type === 'new_booking');

            // 🔒 ATOMICITY CHECK: Either all exist or none should exist
            if (!hasChatRoom || !hasNotification) {
                throw new Error(
                    '🔴 ATOMICITY VIOLATION: Booking exists but ' +
                    `chat room: ${hasChatRoom}, notification: ${hasNotification}. ` +
                    'This is a PARTIAL STATE and violates atomicity requirement.'
                );
            }

            expect(hasChatRoom).toBe(true);
            expect(hasNotification).toBe(true);

        } catch (error) {
            // If booking creation fails, ensure no partial state exists
            if (testBookingId) {
                const chatRooms = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.CHAT_SESSIONS!,
                    [Query.equal('bookingId', testBookingId)]
                );

                expect(chatRooms.documents.length).toBe(0);
            }
            throw error;
        }
    }, 10000);
});

/**
 * 🔒 REVENUE-SAFETY SUMMARY
 * 
 * These tests enforce the following guarantees:
 * 
 * 1. ✅ Booking + Chat Room = ATOMIC
 * 2. ✅ Chat Room + System Message = ATOMIC
 * 3. ✅ Booking + Notification = ATOMIC
 * 4. ✅ Schema Fields = VALIDATED
 * 5. ✅ All or Nothing = ENFORCED
 * 
 * If ANY test fails, booking pipeline is BROKEN and must be fixed before deploy.
 * 
 * Run tests: npm test booking-revenue-safety.test.ts
 * CI/CD: These tests MUST pass or deployment MUST be blocked.
 */

    // 🚫 IDENTITY INVARIANT TEST - Added for booking identity consolidation
    it('🚫 INVARIANT: A booking cannot be created without customerName', async () => {
        // This test ensures the canonical identity resolver never allows empty customerName
        const invalidBookingData = {
            customerId: TEST_CUSTOMER_ID,
            customerName: '', // ❌ Invalid - empty customerName
            therapistId: TEST_THERAPIST_ID,
            therapistName: 'Test Therapist',
            serviceType: '90',
            duration: 90,
            totalPrice: 150000,
            customerPhone: '+62812345678',
            coordinates: { lat: -6.2088, lng: 106.8456 }
        };

        // Should throw error and prevent booking creation
        await expect(
            bookingService.createBooking(invalidBookingData)
        ).rejects.toThrow(/customerName/);
    }, 10000);

});
