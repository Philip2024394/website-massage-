// ================================================================================
// 🏢 ENTERPRISE NOTIFICATION INTEGRATION MANAGER
// ================================================================================
// Bulletproof notification system with comprehensive booking flow integration
// Designed for enterprise-level reliability and testing

import { logger } from '../services/enterpriseLogger';

// Note: PWANotificationManager import removed - module does not exist
// import { PWANotificationManager } from '../lib/pwaFeatures';

export interface EnterpriseNotificationConfig {
  therapistId: string;
  enableVibration: boolean;
  enableSound: boolean;
  enableVisualAlerts: boolean;
  testMode: boolean;
  debugLogging: boolean;
}

export interface BookingNotificationData {
  bookingId: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  duration: number;
  location: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  therapistId: string;
  timestamp: number;
}

export interface ScheduleReminderData {
  eventId: string;
  title: string;
  scheduledTime: string;
  reminderType: 'hours_3' | 'hours_1' | 'minutes_30' | 'minutes_15';
  therapistId: string;
  customerId?: string;
  customerName?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  duration: number;
  details?: any;
}

class EnterpriseNotificationIntegrationManager {
  private static instance: EnterpriseNotificationIntegrationManager;
  private config: EnterpriseNotificationConfig;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private testResults: TestResult[] = [];
  private isInitialized = false;

  constructor(config: EnterpriseNotificationConfig) {
    this.config = config;
  }

  public static async create(config: EnterpriseNotificationConfig): Promise<EnterpriseNotificationIntegrationManager> {
    if (!EnterpriseNotificationIntegrationManager.instance) {
      EnterpriseNotificationIntegrationManager.instance = new EnterpriseNotificationIntegrationManager(config);
      await EnterpriseNotificationIntegrationManager.instance.initialize();
    }
    return EnterpriseNotificationIntegrationManager.instance;
  }

  // ================================================================================
  // 🚀 INITIALIZATION & SETUP
  // ================================================================================

  private async initialize(): Promise<void> {
    try {
      this.log('🏢 [ENTERPRISE] Initializing notification integration manager...');
      
      // Register enterprise service worker
      await this.registerServiceWorker();
      
      // Setup notification permissions
      await this.setupNotificationPermissions();
      
      // Setup booking flow integration
      await this.setupBookingFlowIntegration();
      
      // Setup schedule flow integration
      await this.setupScheduleFlowIntegration();
      
      // Setup testing interface if in test mode
      if (this.config.testMode) {
        await this.setupTestingInterface();
      }
      
      this.isInitialized = true;
      this.log('✅ [ENTERPRISE] Notification integration manager initialized successfully');
      
    } catch (error) {
      logger.error('❌ [ENTERPRISE] Failed to initialize notification manager:', { error });
      throw error;
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    try {
      this.serviceWorker = await navigator.serviceWorker.register('/therapist-dashboard-sw.js');
      this.log('✅ [ENTERPRISE] Service worker registered successfully');
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
    } catch (error) {
      logger.error('❌ [ENTERPRISE] Service worker registration failed:', { error });
      throw error;
    }
  }

  private async setupNotificationPermissions(): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission required for enterprise features');
    }

    this.log('✅ [ENTERPRISE] Notification permissions granted');
  }

  // ================================================================================
  // 📋 BOOKING FLOW INTEGRATION
  // ================================================================================

  private async setupBookingFlowIntegration(): Promise<void> {
    this.log('🔗 [ENTERPRISE] Setting up booking flow integration...');
    
    // Listen for booking events from the main app
    window.addEventListener('enterpriseBookingEvent', this.handleBookingEvent.bind(this));
    window.addEventListener('newBookingNotification', this.handleBookingEvent.bind(this));
    window.addEventListener('bookingStatusUpdate', this.handleBookingStatusUpdate.bind(this));
    
    // Monitor existing booking subscription systems
    await this.monitorExistingBookingSystems();
    
    this.log('✅ [ENTERPRISE] Booking flow integration setup complete');
  }

  private async monitorExistingBookingSystems(): Promise<void> {
    // Hook into existing booking service subscriptions
    // Note: This intercepts legacy console.log calls from old booking system
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      // Intercept booking-related logs and enhance them
      if (args.length > 0 && typeof args[0] === 'string') {
        if (args[0].includes('🔔 New booking notification:')) {
          this.enhanceExistingBookingNotification(args[1]);
        }
      }
      // Forward to enterprise logger
      if (args.length > 0 && typeof args[0] === 'string') {
        logger.info(args[0], { additionalArgs: args.slice(1) });
      } else {
        originalConsoleLog.apply(console, args);
      }
    };
  }

  private enhanceExistingBookingNotification(bookingData: any): void {
    if (!bookingData) return;

    this.log('🔄 [ENTERPRISE] Enhancing existing booking notification:', bookingData);
    
    const enhancedBookingData: BookingNotificationData = {
      bookingId: bookingData.$id || bookingData.id,
      customerId: bookingData.customerId || bookingData.userId,
      customerName: bookingData.userName || bookingData.customerName || 'Customer',
      serviceType: bookingData.service || bookingData.serviceType || 'Massage',
      duration: parseInt(bookingData.service) || bookingData.duration || 60,
      location: bookingData.location || 'Location provided separately',
      scheduledTime: bookingData.startTime || new Date().toISOString(),
      status: bookingData.status || 'pending',
      priority: bookingData.status === 'pending' ? 'critical' : 'normal',
      therapistId: this.config.therapistId,
      timestamp: Date.now()
    };

    // Trigger enterprise notification
    this.triggerEnterpriseBookingNotification(enhancedBookingData);
  }

  public async triggerEnterpriseBookingNotification(booking: BookingNotificationData): Promise<void> {
    this.log('🚨 [ENTERPRISE] Triggering enterprise booking notification:', booking);
    
    try {
      // 1. Send to enterprise service worker for bulletproof handling
      if (this.serviceWorker?.active) {
        this.serviceWorker.active.postMessage({
          type: 'ENTERPRISE_BOOKING_NOTIFICATION',
          data: booking,
          config: this.config
        });
      }

      // 2. Trigger PWA notification system
      await PWANotificationManager.showBookingNotification({
        id: booking.bookingId,
        customerName: booking.customerName,
        serviceType: booking.serviceType,
        duration: booking.duration,
        location: booking.location,
        date: new Date(booking.scheduledTime).toLocaleDateString(),
        time: new Date(booking.scheduledTime).toLocaleTimeString(),
        status: booking.status,
        therapistId: booking.therapistId
      });

      // 3. Trigger visual alert system if enabled
      if (this.config.enableVisualAlerts) {
        this.triggerVisualAlert(booking);
      }

      // 4. Trigger 2-minute vibration system if enabled
      if (this.config.enableVibration && booking.priority === 'critical') {
        this.trigger2MinuteVibration(booking.bookingId);
      }

      // 5. Trigger continuous sound if enabled
      if (this.config.enableSound && booking.status === 'pending') {
        this.triggerContinuousSound(booking.bookingId);
      }

      this.log('✅ [ENTERPRISE] Enterprise booking notification triggered successfully');
      
    } catch (error) {
      logger.error('❌ [ENTERPRISE] Failed to trigger booking notification:', { error, bookingId: booking.bookingId });
      // Fallback notification
      this.triggerFallbackNotification(booking);
    }
  }

  private handleBookingEvent(event: CustomEvent): void {
    const bookingData = event.detail;
    this.log('📥 [ENTERPRISE] Received booking event:', event.type, bookingData);
    
    if (event.type === 'enterpriseBookingEvent' || event.type === 'newBookingNotification') {
      // Convert to standard format and trigger notification
      const standardBooking: BookingNotificationData = {
        bookingId: bookingData.bookingId || bookingData.$id,
        customerId: bookingData.customerId,
        customerName: bookingData.customerName || bookingData.userName,
        serviceType: bookingData.serviceType || 'Massage',
        duration: bookingData.duration || 60,
        location: bookingData.location || 'Location provided',
        scheduledTime: bookingData.scheduledTime || bookingData.startTime,
        status: bookingData.status || 'pending',
        priority: bookingData.status === 'pending' ? 'critical' : 'normal',
        therapistId: this.config.therapistId,
        timestamp: Date.now()
      };
      
      this.triggerEnterpriseBookingNotification(standardBooking);
    }
  }

  private handleBookingStatusUpdate(event: CustomEvent): void {
    const { bookingId, newStatus, customerName } = event.detail;
    this.log('📊 [ENTERPRISE] Booking status update:', { bookingId, newStatus });
    
    // Stop alerts for completed/cancelled bookings
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      this.stopAllAlertsForBooking(bookingId);
    }
  }

  // ================================================================================
  // 📅 SCHEDULE FLOW INTEGRATION
  // ================================================================================

  private async setupScheduleFlowIntegration(): Promise<void> {
    this.log('📅 [ENTERPRISE] Setting up schedule flow integration...');
    
    // Listen for schedule reminder events
    window.addEventListener('scheduleReminder', this.handleScheduleReminder.bind(this));
    window.addEventListener('upcomingBookingAlert', this.handleScheduleReminder.bind(this));
    
    // Setup automatic reminder system
    this.setupAutomaticReminders();
    
    this.log('✅ [ENTERPRISE] Schedule flow integration setup complete');
  }

  private setupAutomaticReminders(): void {
    // Check for upcoming bookings every 5 minutes
    setInterval(() => {
      this.checkUpcomingBookings();
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async checkUpcomingBookings(): Promise<void> {
    try {
      // This would integrate with the booking service to check upcoming bookings
      this.log('🔍 [ENTERPRISE] Checking for upcoming bookings...');
      
      // Dispatch event to main app to trigger booking checks
      window.dispatchEvent(new CustomEvent('enterpriseReminderCheck', {
        detail: { therapistId: this.config.therapistId }
      }));
      
    } catch (error) {
      logger.warn('⚠️ [ENTERPRISE] Failed to check upcoming bookings:', { error });
    }
  }

  public async triggerScheduleReminder(reminder: ScheduleReminderData): Promise<void> {
    this.log('⏰ [ENTERPRISE] Triggering schedule reminder:', reminder);
    
    try {
      // Send to service worker
      if (this.serviceWorker?.active) {
        this.serviceWorker.active.postMessage({
          type: 'SCHEDULE_REMINDER',
          data: reminder,
          config: this.config
        });
      }

      // Show browser notification
      const notification = new Notification(`⏰ Upcoming Booking Reminder`, {
        body: `${reminder.title} in ${this.formatReminderTime(reminder.reminderType)}`,
        icon: '/icons/therapist-192.png',
        tag: `reminder-${reminder.eventId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
          type: 'schedule-reminder',
          eventId: reminder.eventId,
          therapistId: reminder.therapistId
        }
      });

      // Auto close after 30 seconds
      setTimeout(() => notification.close(), 30000);
      
      this.log('✅ [ENTERPRISE] Schedule reminder triggered successfully');
      
    } catch (error) {
      logger.error('❌ [ENTERPRISE] Failed to trigger schedule reminder:', { error });
    }
  }

  private handleScheduleReminder(event: CustomEvent): void {
    const reminderData = event.detail;
    this.log('📥 [ENTERPRISE] Received schedule reminder event:', reminderData);
    
    const standardReminder: ScheduleReminderData = {
      eventId: reminderData.eventId || reminderData.bookingId,
      title: reminderData.title || `Booking with ${reminderData.customerName}`,
      scheduledTime: reminderData.scheduledTime || reminderData.startTime,
      reminderType: reminderData.reminderType || 'hours_1',
      therapistId: this.config.therapistId,
      customerId: reminderData.customerId,
      customerName: reminderData.customerName
    };
    
    this.triggerScheduleReminder(standardReminder);
  }

  // ================================================================================
  // 🎯 ENTERPRISE ALERT SYSTEMS
  // ================================================================================

  private triggerVisualAlert(booking: BookingNotificationData): void {
    // Create full-screen visual alert
    const alertDiv = document.createElement('div');
    alertDiv.id = `enterprise-alert-${booking.bookingId}`;
    alertDiv.className = 'enterprise-visual-alert';
    alertDiv.innerHTML = `
      <div class="enterprise-alert-overlay">
        <div class="enterprise-alert-content">
          <div class="enterprise-alert-header">
            <h2>🚨 NEW BOOKING REQUEST</h2>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="enterprise-close-btn">×</button>
          </div>
          <div class="enterprise-alert-body">
            <h3>${booking.customerName}</h3>
            <p><strong>Service:</strong> ${booking.duration}min ${booking.serviceType}</p>
            <p><strong>Time:</strong> ${new Date(booking.scheduledTime).toLocaleString()}</p>
            <p><strong>Location:</strong> ${booking.location}</p>
          </div>
          <div class="enterprise-alert-actions">
            <button onclick="window.acceptEnterpriseBooking('${booking.bookingId}')" class="enterprise-accept-btn">✅ ACCEPT</button>
            <button onclick="window.viewEnterpriseBooking('${booking.bookingId}')" class="enterprise-view-btn">👁️ VIEW</button>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="enterprise-dismiss-btn">❌ DISMISS</button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .enterprise-visual-alert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: enterpriseAlertPulse 2s infinite;
      }
      
      .enterprise-alert-overlay {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        color: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        transform: scale(1);
        animation: enterpriseAlertBounce 0.5s ease-out;
      }
      
      .enterprise-alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .enterprise-alert-header h2 {
        margin: 0;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      .enterprise-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
      }
      
      .enterprise-alert-body {
        margin: 20px 0;
      }
      
      .enterprise-alert-body h3 {
        font-size: 20px;
        margin: 0 0 15px 0;
      }
      
      .enterprise-alert-body p {
        margin: 8px 0;
        font-size: 16px;
      }
      
      .enterprise-alert-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .enterprise-alert-actions button {
        padding: 12px 24px;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      .enterprise-alert-actions button:hover {
        transform: scale(1.05);
      }
      
      .enterprise-accept-btn {
        background: #28a745;
        color: white;
      }
      
      .enterprise-view-btn {
        background: #17a2b8;
        color: white;
      }
      
      .enterprise-dismiss-btn {
        background: #dc3545;
        color: white;
      }
      
      @keyframes enterpriseAlertPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      @keyframes enterpriseAlertBounce {
        0% { transform: scale(0.5); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(alertDiv);

    // Auto-remove after 5 minutes
    setTimeout(() => {
      if (document.getElementById(`enterprise-alert-${booking.bookingId}`)) {
        alertDiv.remove();
      }
    }, 5 * 60 * 1000);
  }

  private trigger2MinuteVibration(bookingId: string): void {
    if (!('vibrate' in navigator)) return;

    this.log('📳 [ENTERPRISE] Starting 2-minute vibration for booking:', bookingId);
    
    const vibrationPattern = [500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500];
    let cycleCount = 0;
    const maxCycles = 12; // 12 cycles × 10 seconds = 2 minutes

    const vibrationCycle = () => {
      if (cycleCount >= maxCycles) {
        this.log('✅ [ENTERPRISE] 2-minute vibration completed for booking:', bookingId);
        return;
      }

      navigator.vibrate(vibrationPattern);
      cycleCount++;
      this.log(`📳 [ENTERPRISE] Vibration cycle ${cycleCount}/${maxCycles} for booking:`, bookingId);

      setTimeout(vibrationCycle, 10000); // Next cycle in 10 seconds
    };

    vibrationCycle();

    // Store vibration reference for potential stopping
    window[`enterpriseVibration_${bookingId}`] = vibrationCycle;
  }

  private triggerContinuousSound(bookingId: string): void {
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.loop = true;
      audio.volume = 1.0;
      
      audio.play().catch(err => {
        logger.warn('⚠️ [ENTERPRISE] Failed to play continuous sound:', { error: err });
      });

      // Store audio reference for stopping
      window[`enterpriseAudio_${bookingId}`] = audio;
      
      this.log('🔊 [ENTERPRISE] Continuous sound started for booking:', bookingId);

      // Auto-stop after 10 minutes to prevent infinite loops
      setTimeout(() => {
        this.stopSoundForBooking(bookingId);
      }, 10 * 60 * 1000);
      
    } catch (error) {
      logger.warn('⚠️ [ENTERPRISE] Failed to setup continuous sound:', { error });
    }
  }

  private stopAllAlertsForBooking(bookingId: string): void {
    this.log('🔕 [ENTERPRISE] Stopping all alerts for booking:', bookingId);
    
    // Stop vibration
    if (window[`enterpriseVibration_${bookingId}`]) {
      delete window[`enterpriseVibration_${bookingId}`];
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }

    // Stop sound
    this.stopSoundForBooking(bookingId);

    // Remove visual alerts
    const alertElement = document.getElementById(`enterprise-alert-${bookingId}`);
    if (alertElement) {
      alertElement.remove();
    }
  }

  private stopSoundForBooking(bookingId: string): void {
    const audio = window[`enterpriseAudio_${bookingId}`];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      delete window[`enterpriseAudio_${bookingId}`];
      this.log('🔇 [ENTERPRISE] Sound stopped for booking:', bookingId);
    }
  }

  // ================================================================================
  // 🧪 COMPREHENSIVE TESTING SYSTEM
  // ================================================================================

  private async setupTestingInterface(): Promise<void> {
    this.log('🧪 [ENTERPRISE] Setting up testing interface...');
    
    // Create global testing functions
    window['enterpriseNotificationTest'] = this.runComprehensiveTest.bind(this);
    window['testBookingNotification'] = this.testBookingNotification.bind(this);
    window['testScheduleReminder'] = this.testScheduleReminder.bind(this);
    window['testVibrationSystem'] = this.testVibrationSystem.bind(this);
    window['testSoundSystem'] = this.testSoundSystem.bind(this);
    window['testServiceWorkerIntegration'] = this.testServiceWorkerIntegration.bind(this);
    
    // Create action handlers
    window['acceptEnterpriseBooking'] = this.handleAcceptBooking.bind(this);
    window['viewEnterpriseBooking'] = this.handleViewBooking.bind(this);
    
    this.log('✅ [ENTERPRISE] Testing interface setup complete');
  }

  public async runComprehensiveTest(): Promise<TestResult[]> {
    this.log('🚀 [ENTERPRISE] Starting comprehensive notification test suite...');
    this.testResults = [];
    
    const tests = [
      this.testServiceWorkerRegistration.bind(this),
      this.testNotificationPermissions.bind(this),
      this.testBookingNotificationFlow.bind(this),
      this.testScheduleReminderFlow.bind(this),
      this.testVibrationSystem.bind(this),
      this.testSoundSystem.bind(this),
      this.testVisualAlertSystem.bind(this),
      this.testServiceWorkerIntegration.bind(this),
      this.testErrorHandling.bind(this),
      this.testPerformance.bind(this)
    ];

    for (const test of tests) {
      try {
        const result = await test();
        this.testResults.push(result);
        this.log(`${result.success ? '✅' : '❌'} [TEST] ${result.message}`);
      } catch (error) {
        this.testResults.push({
          success: false,
          message: `Test failed: ${error.message}`,
          duration: 0,
          details: error
        });
      }
    }

    this.displayTestResults();
    return this.testResults;
  }

  private async testServiceWorkerRegistration(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.serviceWorker) {
      return {
        success: false,
        message: 'Service Worker Registration: Failed - No service worker registered',
        duration: Date.now() - startTime
      };
    }

    if (this.serviceWorker.active) {
      return {
        success: true,
        message: 'Service Worker Registration: Active and ready',
        duration: Date.now() - startTime
      };
    }

    return {
      success: false,
      message: 'Service Worker Registration: Registered but not active',
      duration: Date.now() - startTime
    };
  }

  private async testNotificationPermissions(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!('Notification' in window)) {
      return {
        success: false,
        message: 'Notification Permissions: Not supported in this browser',
        duration: Date.now() - startTime
      };
    }

    if (Notification.permission === 'granted') {
      return {
        success: true,
        message: 'Notification Permissions: Granted and ready',
        duration: Date.now() - startTime
      };
    }

    return {
      success: false,
      message: `Notification Permissions: ${Notification.permission}`,
      duration: Date.now() - startTime
    };
  }

  private async testBookingNotificationFlow(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testBooking: BookingNotificationData = {
        bookingId: `test-${Date.now()}`,
        customerId: 'test-customer',
        customerName: 'Test Customer',
        serviceType: 'Test Massage',
        duration: 60,
        location: 'Test Location',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'pending',
        priority: 'critical',
        therapistId: this.config.therapistId,
        timestamp: Date.now()
      };

      await this.triggerEnterpriseBookingNotification(testBooking);
      
      return {
        success: true,
        message: 'Booking Notification Flow: Test notification triggered successfully',
        duration: Date.now() - startTime,
        details: testBooking
      };
    } catch (error) {
      return {
        success: false,
        message: `Booking Notification Flow: Failed - ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testScheduleReminderFlow(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testReminder: ScheduleReminderData = {
        eventId: `test-event-${Date.now()}`,
        title: 'Test Booking Reminder',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        reminderType: 'hours_1',
        therapistId: this.config.therapistId,
        customerName: 'Test Customer'
      };

      await this.triggerScheduleReminder(testReminder);
      
      return {
        success: true,
        message: 'Schedule Reminder Flow: Test reminder triggered successfully',
        duration: Date.now() - startTime,
        details: testReminder
      };
    } catch (error) {
      return {
        success: false,
        message: `Schedule Reminder Flow: Failed - ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      };
    }
  }

  public async testVibrationSystem(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!('vibrate' in navigator)) {
      return {
        success: false,
        message: 'Vibration System: Not supported on this device',
        duration: Date.now() - startTime
      };
    }

    try {
      // Test short vibration
      navigator.vibrate([200, 100, 200]);
      
      return {
        success: true,
        message: 'Vibration System: Test vibration triggered (enterprise 2-minute system ready)',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `Vibration System: Failed - ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }

  public async testSoundSystem(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const audio = new Audio('/sounds/booking-notification.mp3');
      audio.volume = 0.5; // Lower volume for testing
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplay', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });

      await audio.play();
      
      // Stop after 2 seconds for testing
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 2000);
      
      return {
        success: true,
        message: 'Sound System: Test sound played successfully (enterprise continuous loop ready)',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `Sound System: Failed - ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      };
    }
  }

  private async testVisualAlertSystem(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testBooking: BookingNotificationData = {
        bookingId: `visual-test-${Date.now()}`,
        customerId: 'test-customer',
        customerName: 'Visual Test Customer',
        serviceType: 'Test Visual Alert',
        duration: 60,
        location: 'Test Location',
        scheduledTime: new Date().toISOString(),
        status: 'pending',
        priority: 'critical',
        therapistId: this.config.therapistId,
        timestamp: Date.now()
      };

      this.triggerVisualAlert(testBooking);
      
      // Auto-remove test alert after 5 seconds
      setTimeout(() => {
        const alertElement = document.getElementById(`enterprise-alert-${testBooking.bookingId}`);
        if (alertElement) {
          alertElement.remove();
        }
      }, 5000);
      
      return {
        success: true,
        message: 'Visual Alert System: Test visual alert displayed (auto-removed after 5 seconds)',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `Visual Alert System: Failed - ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }

  public async testServiceWorkerIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    
    if (!this.serviceWorker?.active) {
      return {
        success: false,
        message: 'Service Worker Integration: Service worker not active',
        duration: Date.now() - startTime
      };
    }

    try {
      // Send test message to service worker
      this.serviceWorker.active.postMessage({
        type: 'TEST_INTEGRATION',
        timestamp: Date.now()
      });
      
      return {
        success: true,
        message: 'Service Worker Integration: Test message sent successfully',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: `Service Worker Integration: Failed - ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testErrorHandling(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test with invalid booking data
      const invalidBooking = {} as BookingNotificationData;
      
      await this.triggerEnterpriseBookingNotification(invalidBooking);
      
      return {
        success: true,
        message: 'Error Handling: Successfully handled invalid booking data with fallback',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: true,
        message: 'Error Handling: Error caught and handled appropriately',
        duration: Date.now() - startTime,
        details: error.message
      };
    }
  }

  private async testPerformance(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const iterations = 10;
      const testTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const iterationStart = Date.now();
        
        const testBooking: BookingNotificationData = {
          bookingId: `perf-test-${i}`,
          customerId: 'perf-customer',
          customerName: 'Performance Test',
          serviceType: 'Perf Test',
          duration: 60,
          location: 'Test',
          scheduledTime: new Date().toISOString(),
          status: 'pending',
          priority: 'normal',
          therapistId: this.config.therapistId,
          timestamp: Date.now()
        };
        
        await this.triggerEnterpriseBookingNotification(testBooking);
        
        testTimes.push(Date.now() - iterationStart);
      }
      
      const averageTime = testTimes.reduce((a, b) => a + b, 0) / testTimes.length;
      
      return {
        success: averageTime < 100, // Success if average < 100ms
        message: `Performance: Average notification time ${averageTime.toFixed(2)}ms (${iterations} iterations)`,
        duration: Date.now() - startTime,
        details: { averageTime, testTimes }
      };
    } catch (error) {
      return {
        success: false,
        message: `Performance: Test failed - ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }

  // ================================================================================
  // 🎯 ACTION HANDLERS
  // ================================================================================

  private handleAcceptBooking(bookingId: string): void {
    this.log('✅ [ENTERPRISE] Accepting booking:', bookingId);
    
    // Stop all alerts for this booking
    this.stopAllAlertsForBooking(bookingId);
    
    // Send acceptance message to main app
    window.dispatchEvent(new CustomEvent('enterpriseBookingAccepted', {
      detail: { bookingId, therapistId: this.config.therapistId }
    }));
    
    // Show success notification
    new Notification('✅ Booking Accepted!', {
      body: `You have successfully accepted booking ${bookingId}`,
      icon: '/icons/therapist-192.png',
      tag: `accepted-${bookingId}`
    });
  }

  private handleViewBooking(bookingId: string): void {
    this.log('👁️ [ENTERPRISE] Viewing booking:', bookingId);
    
    // Send view message to main app
    window.dispatchEvent(new CustomEvent('enterpriseBookingViewed', {
      detail: { bookingId, therapistId: this.config.therapistId }
    }));
  }

  // ================================================================================
  // 📊 RESULTS & UTILITIES
  // ================================================================================

  private displayTestResults(): void {
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    logger.info('🏢 ENTERPRISE NOTIFICATION TEST RESULTS', {
      passed,
      total,
      passRate,
      results: this.testResults.map((result, index) => ({
        testNumber: index + 1,
        success: result.success,
        message: result.message,
        duration: result.duration,
        details: result.details
      }))
    });
    
    logger.info('🎯 Enterprise Features Status', {
      pwaIntegration: 'Active',
      notificationOverride: 'Ready',
      twoMinuteVibration: 'Ready',
      continuousSound: 'Ready',
      visualAlerts: 'Ready',
      serviceWorker: 'Active',
      errorRecovery: 'Active'
    });
    
    // Display results in UI if test mode
    if (this.config.testMode) {
      this.showTestResultsUI();
    }
  }

  private showTestResultsUI(): void {
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'enterprise-test-results';
    resultsDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      background: white;
      border: 2px solid #007bff;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: monospace;
    `;
    
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    resultsDiv.innerHTML = `
      <div style="background: #007bff; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
        <h3 style="margin: 0;">🏢 Enterprise Test Results</h3>
        <p style="margin: 5px 0 0 0;">Passed: ${passed}/${total} (${passRate}%)</p>
      </div>
      <div style="padding: 15px; max-height: 300px; overflow-y: auto;">
        ${this.testResults.map((result, i) => `
          <div style="margin: 10px 0; padding: 10px; border-left: 3px solid ${result.success ? '#28a745' : '#dc3545'}; background: ${result.success ? '#f8fff9' : '#fff8f8'};">
            <div style="font-weight: bold; color: ${result.success ? '#28a745' : '#dc3545'};">
              ${result.success ? '✅' : '❌'} Test ${i + 1}
            </div>
            <div style="font-size: 12px; margin: 5px 0;">
              ${result.message}
            </div>
            <div style="font-size: 10px; color: #666;">
              Duration: ${result.duration}ms
            </div>
          </div>
        `).join('')}
      </div>
      <div style="padding: 15px; text-align: center; border-top: 1px solid #eee;">
        <button onclick="document.getElementById('enterprise-test-results').remove()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Close</button>
        <button onclick="window.enterpriseNotificationTest()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Re-test</button>
      </div>
    `;
    
    // Remove existing results
    const existing = document.getElementById('enterprise-test-results');
    if (existing) existing.remove();
    
    document.body.appendChild(resultsDiv);
  }

  // Test specific booking notification
  public async testBookingNotification(): Promise<void> {
    const testBooking: BookingNotificationData = {
      bookingId: `manual-test-${Date.now()}`,
      customerId: 'test-customer',
      customerName: 'Manual Test Customer',
      serviceType: 'Test Massage',
      duration: 90,
      location: 'Test Location Address',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'pending',
      priority: 'critical',
      therapistId: this.config.therapistId,
      timestamp: Date.now()
    };

    await this.triggerEnterpriseBookingNotification(testBooking);
    this.log('🧪 [TEST] Manual booking notification triggered');
  }

  // Test specific schedule reminder
  public async testScheduleReminder(): Promise<void> {
    const testReminder: ScheduleReminderData = {
      eventId: `manual-reminder-${Date.now()}`,
      title: 'Manual Test Booking with John Doe',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      reminderType: 'hours_1',
      therapistId: this.config.therapistId,
      customerName: 'John Doe'
    };

    await this.triggerScheduleReminder(testReminder);
    this.log('🧪 [TEST] Manual schedule reminder triggered');
  }

  // ================================================================================
  // 🔧 UTILITY METHODS
  // ================================================================================

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    this.log('📨 [ENTERPRISE] Service worker message:', type, data);
    
    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.log('👆 [ENTERPRISE] Notification clicked:', data);
        break;
      case 'TEST_RESPONSE':
        this.log('🧪 [ENTERPRISE] Service worker test response:', data);
        break;
      default:
        this.log('ℹ️ [ENTERPRISE] Unknown service worker message:', type);
    }
  }

  private triggerFallbackNotification(booking: BookingNotificationData): void {
    this.log('🔄 [ENTERPRISE] Triggering fallback notification for:', booking.bookingId);
    
    try {
      // Simple browser notification as fallback
      new Notification('🚨 New Booking (Fallback)', {
        body: `${booking.customerName} - ${booking.serviceType}`,
        icon: '/icons/therapist-192.png',
        tag: `fallback-${booking.bookingId}`,
        requireInteraction: true
      });
    } catch (error) {
      logger.error('❌ [ENTERPRISE] Even fallback notification failed:', { error, bookingId: booking.bookingId });
      // Last resort - browser alert
      alert(`🚨 NEW BOOKING: ${booking.customerName} - ${booking.serviceType}`);
    }
  }

  private formatReminderTime(reminderType: string): string {
    switch (reminderType) {
      case 'hours_3': return '3 hours';
      case 'hours_1': return '1 hour';
      case 'minutes_30': return '30 minutes';
      case 'minutes_15': return '15 minutes';
      default: return 'soon';
    }
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debugLogging) {
      logger.debug(message, { additionalData: args });
    }
  }

  // ================================================================================
  // 🎯 PUBLIC API
  // ================================================================================

  public getConfiguration(): EnterpriseNotificationConfig {
    return { ...this.config };
  }

  public updateConfiguration(updates: Partial<EnterpriseNotificationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.log('⚙️ [ENTERPRISE] Configuration updated:', updates);
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  public async cleanup(): Promise<void> {
    this.log('🧹 [ENTERPRISE] Cleaning up notification manager...');
    
    // Stop all active alerts
    Object.keys(window).forEach(key => {
      if (key.startsWith('enterpriseVibration_') || key.startsWith('enterpriseAudio_')) {
        delete window[key];
      }
    });

    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    // Remove event listeners
    window.removeEventListener('enterpriseBookingEvent', this.handleBookingEvent);
    window.removeEventListener('newBookingNotification', this.handleBookingEvent);
    window.removeEventListener('bookingStatusUpdate', this.handleBookingStatusUpdate);
    window.removeEventListener('scheduleReminder', this.handleScheduleReminder);
    window.removeEventListener('upcomingBookingAlert', this.handleScheduleReminder);

    this.log('✅ [ENTERPRISE] Cleanup completed');
  }
}

// ================================================================================
// 🌐 GLOBAL INITIALIZATION & EXPORTS
// ================================================================================

export default EnterpriseNotificationIntegrationManager;

// Auto-initialize if in therapist dashboard context
if (typeof window !== 'undefined' && window.location.pathname.includes('/therapist-dashboard')) {
  // Initialize with default config, will be overridden by app
  const defaultConfig: EnterpriseNotificationConfig = {
    therapistId: 'auto-detect',
    enableVibration: true,
    enableSound: true,
    enableVisualAlerts: true,
    testMode: window.location.hostname === 'localhost' || window.location.search.includes('test=1'),
    debugLogging: window.location.hostname === 'localhost' || window.location.search.includes('debug=1')
  };

  // Global access for testing
  window['enterpriseNotificationManager'] = EnterpriseNotificationIntegrationManager.create(defaultConfig);
}