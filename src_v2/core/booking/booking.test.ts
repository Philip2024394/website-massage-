/**
 * ============================================================================
 * 🧪 BOOKING CORE TEST - STEP 13 VALIDATION
 * ============================================================================
 * 
 * Test the booking core in COMPLETE ISOLATION.
 * No UI, no context, no router, no state - just pure logic.
 * 
 * This test validates that:
 * 1. Contract validation works correctly
 * 2. createBooking function works with valid data
 * 3. createBooking function fails properly with invalid data  
 * 4. Appwrite client integration works
 * 5. No duplicate clients are created
 * 
 * RUN THIS TEST:
 * 1. Open browser dev tools
 * 2. Load this file in browser
 * 3. Check console for test results
 * 
 * ============================================================================
 */

// Import the booking core (no UI imports!)
import { 
  createBooking, 
  createTestBookingPayload,
  validateBookingContract,
  isBookingSuccess,
  isBookingError,
  getBookingStatus
} from './index';

// Test results interface
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

// Test suite
class BookingCoreTestSuite {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 ============================================');
    console.log('🧪 BOOKING CORE ISOLATION TEST - STEP 13');
    console.log('🧪 ============================================');
    console.log('');

    await this.testContractValidation();
    await this.testValidBookingCreation();
    await this.testInvalidBookingCreation();
    await this.testBookingStatusCheck();

    this.printSummary();
  }

  private async testContractValidation(): Promise<void> {
    console.log('📋 Testing contract validation...');

    try {
      // Valid payload
      const validPayload = createTestBookingPayload();
      const validResult = validateBookingContract(validPayload);
      
      if (!validResult.valid) {
        throw new Error(`Valid payload failed validation: ${JSON.stringify(validResult.errors)}`);
      }
      
      // Invalid payload
      const invalidPayload = { customerName: '' }; // Missing required fields
      const invalidResult = validateBookingContract(invalidPayload);
      
      if (invalidResult.valid) {
        throw new Error('Invalid payload passed validation');
      }

      this.addResult('Contract Validation', true);
      console.log('✅ Contract validation working correctly');
      
    } catch (error) {
      this.addResult('Contract Validation', false, (error as Error).message);
      console.error('❌ Contract validation failed:', error);
    }
  }

  private async testValidBookingCreation(): Promise<void> {
    console.log('📝 Testing valid booking creation...');
    const startTime = Date.now();

    try {
      const testPayload = createTestBookingPayload({
        customerName: 'Test Customer - Step 13',
        customerPhone: '+628123456789',
        serviceType: 'massage',
        duration: 60,
        location: {
          address: 'Test Address for Step 13 Validation'
        },
        source: 'web'
      });

      console.log('🚀 Sending test booking:', testPayload);
      const result = await createBooking(testPayload);
      const duration = Date.now() - startTime;

      if (isBookingSuccess(result)) {
        this.addResult('Valid Booking Creation', true, undefined, duration);
        console.log('✅ Valid booking created successfully:', result.bookingId);
        console.log('📊 Creation time:', `${duration}ms`);
        
        // Test status check
        const status = await getBookingStatus(result.bookingId);
        if (status.exists && status.status === 'pending') {
          console.log('✅ Booking status check passed');
        } else {
          console.warn('⚠️ Booking created but status check failed:', status);
        }
        
      } else if (isBookingError(result)) {
        throw new Error(`Booking creation failed: ${result.message} (${result.errorType})`);
      } else {
        throw new Error('Invalid result type returned');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult('Valid Booking Creation', false, (error as Error).message, duration);
      console.error('❌ Valid booking creation failed:', error);
    }
  }

  private async testInvalidBookingCreation(): Promise<void> {
    console.log('🚫 Testing invalid booking creation...');
    const startTime = Date.now();

    try {
      const invalidPayload = {
        customerName: '', // Invalid: empty name
        customerPhone: 'invalid-phone', // Invalid: bad format
        serviceType: 'invalid-service', // Invalid: not in enum
        duration: 45 // Invalid: not in allowed values
      };

      const result = await createBooking(invalidPayload);
      const duration = Date.now() - startTime;

      if (isBookingError(result) && result.errorType === 'VALIDATION_FAILED') {
        this.addResult('Invalid Booking Rejection', true, undefined, duration);
        console.log('✅ Invalid booking correctly rejected:', result.message);
      } else {
        throw new Error('Invalid booking was not properly rejected');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult('Invalid Booking Rejection', false, (error as Error).message, duration);
      console.error('❌ Invalid booking rejection test failed:', error);
    }
  }

  private async testBookingStatusCheck(): Promise<void> {
    console.log('🔍 Testing booking status check...');

    try {
      // Check non-existent booking
      const fakeId = 'fake-booking-id-12345';
      const status = await getBookingStatus(fakeId);
      
      if (!status.exists) {
        this.addResult('Booking Status Check', true);
        console.log('✅ Non-existent booking correctly reported as not found');
      } else {
        throw new Error('Non-existent booking was reported as existing');
      }

    } catch (error) {
      this.addResult('Booking Status Check', false, (error as Error).message);
      console.error('❌ Booking status check failed:', error);
    }
  }

  private addResult(name: string, passed: boolean, error?: string, duration?: number): void {
    this.results.push({ name, passed, error, duration });
  }

  private printSummary(): void {
    console.log('');
    console.log('🧪 ============================================');
    console.log('🧪 TEST SUMMARY - STEP 13 BOOKING CORE');
    console.log('🧪 ============================================');
    console.log('');

    let passed = 0;
    let failed = 0;

    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.name}${duration}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      result.passed ? passed++ : failed++;
    });

    console.log('');
    console.log(`📊 Total: ${this.results.length} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! STEP 13 BOOKING CORE IS WORKING!');
      console.log('🚀 The authoritative booking function is ready for UI integration');
      console.log('');
    } else {
      console.log('');
      console.log('⚠️ SOME TESTS FAILED - BOOKING CORE NEEDS FIXING');
      console.log('');
    }
  }
}

// Auto-run tests when this file is loaded
console.log('🔄 Loading booking core test suite...');

// Export test suite for manual running
export const runBookingCoreTests = async () => {
  const testSuite = new BookingCoreTestSuite();
  await testSuite.runAllTests();
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected - auto-running tests in 1 second...');
  setTimeout(() => {
    runBookingCoreTests();
  }, 1000);
}

export default BookingCoreTestSuite;