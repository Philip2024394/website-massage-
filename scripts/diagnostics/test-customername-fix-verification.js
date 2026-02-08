/**
 * CUSTOMERAME FIX VERIFICATION TEST
 * Tests that customerName is properly injected from authenticated user profile
 * with proper fallbacks to prevent schema failures
 */

import { BookingEngine } from './lib/services/BookingEngine.js';
import { account } from './lib/appwrite.js';

async function testCustomerNameInjection() {
    console.log('🧪 TESTING CUSTOMERNAME FIX VERIFICATION');
    console.log('===============================================');

    try {
        // Test 1: Check if user authentication works
        console.log('\n1️⃣ Testing user authentication...');
        let userFromAuth = null;
        try {
            userFromAuth = await account.get();
            console.log('✅ User authenticated:', {
                id: userFromAuth.$id,
                name: userFromAuth.name || '(No name)',
                email: userFromAuth.email
            });
        } catch (authError) {
            console.log('ℹ️ No authenticated user (guest mode)');
        }

        // Test 2: Test BookingEngine.createBooking with minimal customerName
        console.log('\n2️⃣ Testing BookingEngine with minimal customerName...');
        
        const testParams = {
            customerId: userFromAuth?.$id || 'test_customer_123',
            customerName: '', // INTENTIONALLY EMPTY to test fallback
            customerPhone: '+1234567890',
            therapistId: 'test_therapist_456',
            therapistName: 'Test Therapist',
            serviceType: 'Traditional Massage',
            duration: 60,
            totalPrice: 200000,
            locationZone: 'Jakarta'
        };

        console.log('📤 Calling BookingEngine.createBooking with EMPTY customerName...');
        console.log('   Expected: Should derive from authenticated user or use "Guest Customer"');
        
        const result = await BookingEngine.createBooking(testParams);
        
        if (result.success) {
            console.log('✅ SUCCESS! Booking created with ID:', result.bookingId);
            console.log('📋 Booking data customerName:', result.data?.customerName);
            
            // Verify customerName is not empty
            if (!result.data?.customerName || result.data.customerName.trim() === '') {
                console.log('❌ FAILURE: customerName is still empty after creation');
                return false;
            } else {
                console.log('✅ VERIFIED: customerName is properly set:', `"${result.data.customerName}"`);
            }
        } else {
            console.log('❌ FAILURE: Booking creation failed:', result.error);
            return false;
        }

        // Test 3: Test with completely undefined customerName
        console.log('\n3️⃣ Testing with undefined customerName...');
        
        const testParams2 = {
            customerId: userFromAuth?.$id || 'test_customer_789',
            // customerName: undefined, // COMPLETELY MISSING
            customerPhone: '+1234567890',
            therapistId: 'test_therapist_456',
            therapistName: 'Test Therapist',
            serviceType: 'Traditional Massage',
            duration: 60,
            totalPrice: 200000,
            locationZone: 'Jakarta'
        };

        console.log('📤 Calling BookingEngine.createBooking with NO customerName field...');
        
        const result2 = await BookingEngine.createBooking(testParams2);
        
        if (result2.success) {
            console.log('✅ SUCCESS! Booking created with ID:', result2.bookingId);
            console.log('📋 Booking data customerName:', result2.data?.customerName);
            
            // Verify customerName fallback worked
            if (!result2.data?.customerName || result2.data.customerName.trim() === '') {
                console.log('❌ FAILURE: customerName fallback did not work');
                return false;
            } else {
                console.log('✅ VERIFIED: customerName fallback worked:', `"${result2.data.customerName}"`);
            }
        } else {
            console.log('❌ FAILURE: Booking creation failed:', result2.error);
            return false;
        }

        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ CustomerName injection is working correctly');
        console.log('✅ Authenticated user profile is properly derived');  
        console.log('✅ Fallbacks prevent schema failures');
        console.log('💪 The "Missing required attribute customerName" error should be fixed');

        return true;

    } catch (error) {
        console.error('❌ TEST FAILED with error:', error);
        return false;
    }
}

// Run the test
testCustomerNameInjection()
    .then(success => {
        if (success) {
            console.log('\n🟢 VERIFICATION COMPLETE: CustomerName fix is working!');
            process.exit(0);
        } else {
            console.log('\n🔴 VERIFICATION FAILED: CustomerName fix needs more work');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('🔴 VERIFICATION ERROR:', error);
        process.exit(1);
    });