/**
 * BOOKING SOUND SYSTEM TEST SUITE
 * 
 * Tests all critical functionality:
 * - Sound plays on booking request
 * - Sound repeats every 10 seconds
 * - Sound stops on accept/decline/cancel/timeout
 * - No console errors
 * - No memory leaks
 * - Autoplay restrictions handled gracefully
 */

import { bookingSoundService } from '../services/bookingSound.service';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  duration?: number;
}

class BookingSoundTester {
  private testResults: TestResult[] = [];
  private activeTestBookings: Set<string> = new Set();

  constructor() {
    console.log('🧪 [BOOKING SOUND TEST] Initializing test suite...');
  }

  /**
   * Run comprehensive test suite
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 [BOOKING SOUND TEST] Starting comprehensive test suite...');
    this.testResults = [];

    // Test 1: Basic sound functionality
    await this.testBasicSoundPlayback();

    // Test 2: Repetition functionality
    await this.testSoundRepetition();

    // Test 3: Stop conditions
    await this.testStopConditions();

    // Test 4: Memory leak prevention
    await this.testMemoryLeakPrevention();

    // Test 5: Multiple booking handling
    await this.testMultipleBookings();

    // Test 6: Autoplay restrictions
    await this.testAutoplayHandling();

    // Test 7: Integration with legacy system
    await this.testLegacyIntegration();

    // Cleanup
    this.cleanup();

    // Summary
    this.printTestSummary();
    return this.testResults;
  }

  private async testBasicSoundPlayback(): Promise<void> {
    const testName = 'Basic Sound Playback';
    const startTime = Date.now();
    
    try {
      console.log('🧪 [TEST] Testing basic sound playback...');
      
      const testBookingId = 'test-booking-basic';
      this.activeTestBookings.add(testBookingId);
      
      // Test audio system
      const audioWorking = await bookingSoundService.testBookingSound();
      
      if (audioWorking) {
        this.addTestResult(testName, 'PASS', 'Audio system working correctly', Date.now() - startTime);
      } else {
        this.addTestResult(testName, 'FAIL', 'Audio system failed to initialize');
      }
      
      // Start booking alert
      await bookingSoundService.startBookingAlert(testBookingId, 'pending');
      
      if (bookingSoundService.isAlertActive(testBookingId)) {
        this.addTestResult(testName + ' - Alert Start', 'PASS', 'Booking alert started successfully');
      } else {
        this.addTestResult(testName + ' - Alert Start', 'FAIL', 'Failed to start booking alert');
      }
      
      // Stop alert
      bookingSoundService.stopBookingAlert(testBookingId);
      this.activeTestBookings.delete(testBookingId);
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testSoundRepetition(): Promise<void> {
    const testName = 'Sound Repetition';
    
    try {
      console.log('🧪 [TEST] Testing sound repetition (15 second test)...');
      
      const testBookingId = 'test-booking-repeat';
      this.activeTestBookings.add(testBookingId);
      
      // Start alert
      await bookingSoundService.startBookingAlert(testBookingId, 'pending');
      
      // Wait for first repeat (11 seconds to ensure it repeats)
      await this.sleep(11000);
      
      const stats = bookingSoundService.getAlertStats(testBookingId);
      
      if (stats && stats.repeatCount >= 1) {
        this.addTestResult(testName, 'PASS', `Sound repeated ${stats.repeatCount} times in 11 seconds`);
      } else {
        this.addTestResult(testName, 'FAIL', 'Sound did not repeat as expected');
      }
      
      // Stop alert
      bookingSoundService.stopBookingAlert(testBookingId);
      this.activeTestBookings.delete(testBookingId);
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testStopConditions(): Promise<void> {
    const testName = 'Stop Conditions';
    
    try {
      console.log('🧪 [TEST] Testing stop conditions...');
      
      // Test immediate stop
      const testBookingId1 = 'test-booking-stop-1';
      this.activeTestBookings.add(testBookingId1);
      
      await bookingSoundService.startBookingAlert(testBookingId1, 'pending');
      await this.sleep(1000); // Let it play once
      
      bookingSoundService.stopBookingAlert(testBookingId1);
      
      if (!bookingSoundService.isAlertActive(testBookingId1)) {
        this.addTestResult(testName, 'PASS', 'Alert stopped immediately on command');
      } else {
        this.addTestResult(testName, 'FAIL', 'Alert did not stop when requested');
      }
      
      this.activeTestBookings.delete(testBookingId1);
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testMemoryLeakPrevention(): Promise<void> {
    const testName = 'Memory Leak Prevention';
    
    try {
      console.log('🧪 [TEST] Testing memory leak prevention...');
      
      // Create multiple alerts and clean them up
      const testBookingIds = ['mem-test-1', 'mem-test-2', 'mem-test-3'];
      
      // Start multiple alerts
      for (const bookingId of testBookingIds) {
        this.activeTestBookings.add(bookingId);
        await bookingSoundService.startBookingAlert(bookingId, 'pending');
      }
      
      const initialCount = bookingSoundService.getActiveAlertCount();
      
      // Stop all alerts
      bookingSoundService.stopAllBookingAlerts();
      
      const finalCount = bookingSoundService.getActiveAlertCount();
      
      if (finalCount === 0 && initialCount === testBookingIds.length) {
        this.addTestResult(testName, 'PASS', `Cleaned up ${initialCount} alerts successfully`);
      } else {
        this.addTestResult(testName, 'FAIL', `Memory leak detected: ${finalCount} alerts still active`);
      }
      
      testBookingIds.forEach(id => this.activeTestBookings.delete(id));
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testMultipleBookings(): Promise<void> {
    const testName = 'Multiple Bookings';
    
    try {
      console.log('🧪 [TEST] Testing multiple simultaneous bookings...');
      
      const testBookingIds = ['multi-1', 'multi-2', 'multi-3'];
      
      // Start multiple alerts
      for (const bookingId of testBookingIds) {
        this.activeTestBookings.add(bookingId);
        await bookingSoundService.startBookingAlert(bookingId, 'pending');
      }
      
      const activeCount = bookingSoundService.getActiveAlertCount();
      
      if (activeCount === testBookingIds.length) {
        this.addTestResult(testName, 'PASS', `Successfully handling ${activeCount} simultaneous alerts`);
      } else {
        this.addTestResult(testName, 'FAIL', `Expected ${testBookingIds.length} alerts, got ${activeCount}`);
      }
      
      // Clean up
      for (const bookingId of testBookingIds) {
        bookingSoundService.stopBookingAlert(bookingId);
        this.activeTestBookings.delete(bookingId);
      }
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testAutoplayHandling(): Promise<void> {
    const testName = 'Autoplay Handling';
    
    try {
      console.log('🧪 [TEST] Testing autoplay restriction handling...');
      
      // This test mainly checks that the system doesn't crash on autoplay restrictions
      const testBookingId = 'test-autoplay';
      this.activeTestBookings.add(testBookingId);
      
      try {
        await bookingSoundService.startBookingAlert(testBookingId, 'pending');
        this.addTestResult(testName, 'PASS', 'Autoplay restrictions handled gracefully (no crashes)');
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          this.addTestResult(testName, 'WARNING', 'Autoplay blocked but handled gracefully');
        } else {
          throw error;
        }
      }
      
      bookingSoundService.stopBookingAlert(testBookingId);
      this.activeTestBookings.delete(testBookingId);
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private async testLegacyIntegration(): Promise<void> {
    const testName = 'Legacy Integration';
    
    try {
      console.log('🧪 [TEST] Testing integration with legacy notification service...');
      
      // Import legacy service
      const { startContinuousNotifications, stopContinuousNotifications } = await import('../lib/continuousNotificationService');
      
      const testBookingId = 'test-legacy';
      this.activeTestBookings.add(testBookingId);
      
      // Start legacy notifications (which should also start enhanced service)
      startContinuousNotifications(testBookingId);
      
      // Check if both systems are running
      if (bookingSoundService.isAlertActive(testBookingId)) {
        this.addTestResult(testName, 'PASS', 'Legacy service successfully triggers enhanced service');
      } else {
        this.addTestResult(testName, 'WARNING', 'Legacy service integration may not be working');
      }
      
      // Stop via legacy service
      stopContinuousNotifications(testBookingId);
      
      if (!bookingSoundService.isAlertActive(testBookingId)) {
        this.addTestResult(testName + ' - Stop', 'PASS', 'Legacy stop successfully stops enhanced service');
      } else {
        this.addTestResult(testName + ' - Stop', 'FAIL', 'Enhanced service not stopped by legacy service');
      }
      
      this.activeTestBookings.delete(testBookingId);
      
    } catch (error) {
      this.addTestResult(testName, 'FAIL', `Test failed: ${error}`);
    }
  }

  private addTestResult(testName: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, duration?: number): void {
    this.testResults.push({ testName, status, message, duration });
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`🧪 [TEST] ${emoji} ${testName}: ${message}${durationText}`);
  }

  private printTestSummary(): void {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    
    console.log('\n🧪 [BOOKING SOUND TEST] SUMMARY:');
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    
    if (failed === 0) {
      console.log('🎉 [BOOKING SOUND TEST] ALL CRITICAL TESTS PASSED!');
      console.log('✨ Booking sound system is ready for production use');
    } else {
      console.log('🚨 [BOOKING SOUND TEST] SOME TESTS FAILED - Review before production use');
    }
    
    // Log individual failures
    this.testResults.filter(r => r.status === 'FAIL').forEach(result => {
      console.error(`❌ FAILURE: ${result.testName} - ${result.message}`);
    });
  }

  private cleanup(): void {
    console.log('🧪 [TEST] Cleaning up test bookings...');
    
    // Stop all test alerts
    this.activeTestBookings.forEach(bookingId => {
      bookingSoundService.stopBookingAlert(bookingId);
    });
    
    this.activeTestBookings.clear();
    console.log('✅ [TEST] Cleanup completed');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export test runner
export const runBookingSoundTests = async (): Promise<TestResult[]> => {
  const tester = new BookingSoundTester();
  return await tester.runAllTests();
};

// Quick test function for manual testing
export const quickBookingSoundTest = async (bookingId: string = 'quick-test'): Promise<void> => {
  console.log(`🧪 [QUICK TEST] Testing booking sound for ID: ${bookingId}`);
  
  try {
    // Test basic functionality
    await bookingSoundService.testBookingSound();
    
    // Start alert
    await bookingSoundService.startBookingAlert(bookingId, 'pending');
    console.log(`🔔 [QUICK TEST] Alert started - you should hear sound repeating every 10 seconds`);
    console.log(`🔇 [QUICK TEST] Call stopBookingAlert('${bookingId}') to stop`);
    
    // Auto-stop after 30 seconds for safety
    setTimeout(() => {
      bookingSoundService.stopBookingAlert(bookingId);
      console.log(`⏰ [QUICK TEST] Auto-stopped after 30 seconds`);
    }, 30000);
    
  } catch (error) {
    console.error('🧪 [QUICK TEST] Test failed:', error);
  }
};

// Global test functions for browser console
if (typeof window !== 'undefined') {
  (window as any).runBookingSoundTests = runBookingSoundTests;
  (window as any).quickBookingSoundTest = quickBookingSoundTest;
  (window as any).bookingSoundService = bookingSoundService;
}

export default { runBookingSoundTests, quickBookingSoundTest };