/**
 * Push Notifications Service
 * Facebook-Standard PWA Push Notifications
 * Enterprise-grade real-time notifications with rich media support
 */

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string; // Facebook-style rich media
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
  sound?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface AdminPaymentNotification {
  therapistName: string;
  therapistId: string;
  paymentAmount: number;
  paymentProofUrl: string;
  submissionTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

class PushNotificationsService {
  private vapidPublicKey: string = 'BA0Bp4ShvoJiYaX0wnRgmgwxh3PYBQWc7wg_b0sTW18NfaouhPrCSycDz-yiYOeo9tytbDKdyx60BZ3fDAV2cdQ'; // VAPID public key
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private isAdmin: boolean = false;
  private userId: string | null = null;
  private notificationQueue: NotificationPayload[] = [];
  private maxQueueSize: number = 50;

  // Facebook-standard vibration patterns
  private vibrationPatterns = {
    chat: [100, 50, 100],
    booking: [200, 100, 200, 100, 200],
    payment: [300, 100, 300],
    urgent: [500, 200, 500, 200, 500],
    success: [100, 50, 100, 50, 100],
    error: [1000]
  };

  constructor() {
    this.init();
  }

  private async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    this.permission = Notification.permission;

    // Register service worker
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered for push notifications');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Initialize admin mode for payment notifications
   */
  initializeAsAdmin(userId: string) {
    this.isAdmin = true;
    this.userId = userId;
    console.log('🔧 Push notifications initialized for admin:', userId);
  }

  /**
   * Request notification permission (Facebook-standard UX)
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      // Show custom permission dialog first (Facebook approach)
      const userWantsNotifications = await this.showCustomPermissionDialog();
      if (!userWantsNotifications) {
        return false;
      }

      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Push notification permission granted');
        await this.subscribeToPushNotifications();
        
        // Welcome notification (Facebook style)
        await this.showWelcomeNotification();
        return true;
      } else {
        console.log('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show custom permission dialog (Facebook-style)
   */
  private async showCustomPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      // Create Facebook-style permission dialog
      const dialog = document.createElement('div');
      dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      dialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 p-3 rounded-full mr-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-4 4-4-4h3v-3a1 1 0 011-1h4"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold">Stay Connected</h3>
          </div>
          <p class="text-gray-600 mb-6">Get instant notifications for new bookings, messages, and payment updates. You can change this anytime in settings.</p>
          <div class="flex space-x-3">
            <button id="allow-notifications" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Allow Notifications
            </button>
            <button id="not-now" class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300">
              Not Now
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);

      // Handle button clicks
      dialog.querySelector('#allow-notifications')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });

      dialog.querySelector('#not-now')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });
    });
  }

  /**
   * Show welcome notification after permission granted
   */
  private async showWelcomeNotification() {
    await this.showNotification({
      title: '🎉 Notifications Enabled!',
      body: "You'll now receive instant updates for bookings, messages, and payments.",
      icon: '/icons/icon-192x192.png',
      tag: 'welcome',
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      actions: [
        { action: 'settings', title: 'Settings', icon: '/icons/settings.png' },
        { action: 'dismiss', title: 'Got it!' }
      ]
    });
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications() {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }

    if (!this.vapidPublicKey) {
      console.warn('VAPID public key not configured. Generate one with: npx web-push generate-vapid-keys');
      return;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      });

      console.log('✅ Subscribed to push notifications:', subscription);
      
      // Send subscription to backend
      await this.sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Send subscription to server for storage
   */
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      console.log('Sending subscription to server:', subscription);
      
      // Store in Appwrite with user context
      // await databases.createDocument(
      //   DATABASE_ID,
      //   'pushSubscriptions',
      //   'unique()',
      //   {
      //     subscription: JSON.stringify(subscription),
      //     userId: this.userId,
      //     isAdmin: this.isAdmin,
      //     deviceInfo: {
      //       userAgent: navigator.userAgent,
      //       platform: navigator.platform,
      //       language: navigator.language
      //     },
      //     createdAt: new Date().toISOString(),
      //     lastUsed: new Date().toISOString()
      //   }
      // );
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  /**
   * Show Facebook-standard rich notification
   */
  async showNotification(payload: NotificationPayload) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Add to queue for rate limiting
    this.addToQueue(payload);

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image, // Facebook-style rich media
      data: payload.data,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      timestamp: payload.timestamp || Date.now(),
      vibrate: payload.vibrate || this.vibrationPatterns.chat,
      actions: payload.actions || [
        { action: 'open', title: 'Open', icon: '/icons/open.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
      ]
    };

    if (!this.registration) {
      // Fallback to basic notification
      new Notification(payload.title, options);
      return;
    }

    // Use service worker notification (better for mobile)
    await this.registration.showNotification(payload.title, options);
    
    // Track notification metrics
    this.trackNotificationMetrics(payload);
  }

  /**
   * Queue management for rate limiting (Facebook approach)
   */
  private addToQueue(payload: NotificationPayload) {
    this.notificationQueue.push(payload);
    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue.shift(); // Remove oldest
    }
  }

  /**
   * Track notification metrics
   */
  private trackNotificationMetrics(payload: NotificationPayload) {
    try {
      const metrics = {
        timestamp: Date.now(),
        type: payload.data?.type || 'unknown',
        tag: payload.tag,
        userId: this.userId,
        isAdmin: this.isAdmin
      };
      
      // Store metrics for analytics
      localStorage.setItem(`notification_${Date.now()}`, JSON.stringify(metrics));
      
      console.log('📊 Notification sent:', metrics);
    } catch (error) {
      console.error('Error tracking notification metrics:', error);
    }
  }

  /**
   * 🔥 ADMIN: Payment proof submitted notification (Facebook-standard)
   */
  async notifyAdminPaymentSubmitted(notification: AdminPaymentNotification) {
    if (!this.isAdmin) return;

    const priorityConfig = {
      low: { requireInteraction: false, vibrate: this.vibrationPatterns.chat },
      medium: { requireInteraction: false, vibrate: this.vibrationPatterns.payment },
      high: { requireInteraction: true, vibrate: this.vibrationPatterns.urgent },
      urgent: { requireInteraction: true, vibrate: this.vibrationPatterns.urgent }
    };

    const config = priorityConfig[notification.priority] || priorityConfig.medium;

    await this.showNotification({
      title: '💰 Payment Proof Submitted',
      body: `${notification.therapistName} submitted commission payment of Rp ${notification.paymentAmount.toLocaleString()}`,
      icon: '/icons/admin-payment.png',
      image: notification.paymentProofUrl, // Rich media preview
      tag: `admin-payment-${notification.therapistId}`,
      requireInteraction: config.requireInteraction,
      vibrate: config.vibrate,
      timestamp: new Date(notification.submissionTime).getTime(),
      data: {
        type: 'admin_payment_review',
        therapistId: notification.therapistId,
        priority: notification.priority,
        url: `/admin/payments/review/${notification.therapistId}`,
        source: 'payment_page' // Track upload source
      },
      actions: [
        { action: 'review', title: '👀 Review Now', icon: '/icons/review.png' },
        { action: 'approve', title: '✅ Quick Approve', icon: '/icons/approve.png' },
        { action: 'later', title: '⏰ Review Later', icon: '/icons/clock.png' }
      ]
    });
  }

  /**
   * 🔥 THERAPIST: Payment proof upload via chat
   */
  async notifyPaymentProofFromChat(therapistId: string, therapistName: string, chatRoomId: string, imageUrl: string, amount: number) {
    // Notify admin with chat context
    if (this.isAdmin) {
      await this.showNotification({
        title: '💬💰 Payment Proof via Chat',
        body: `${therapistName} sent payment proof in chat • Rp ${amount.toLocaleString()}`,
        icon: '/icons/chat-payment.png',
        image: imageUrl,
        tag: `chat-payment-${therapistId}`,
        requireInteraction: true,
        vibrate: this.vibrationPatterns.payment,
        data: {
          type: 'admin_payment_review',
          therapistId,
          source: 'chat_window',
          chatRoomId,
          url: `/admin/chat/${chatRoomId}?payment=true`
        },
        actions: [
          { action: 'open_chat', title: '💬 Open Chat', icon: '/icons/chat.png' },
          { action: 'approve', title: '✅ Approve', icon: '/icons/approve.png' },
          { action: 'payment_history', title: '📋 Payment History', icon: '/icons/history.png' }
        ]
      });
    }

    // Confirm to therapist that proof was recorded
    await this.showNotification({
      title: '📤 Payment Proof Uploaded',
      body: `Your payment proof has been sent to admin for review. You can track it in Payment History.`,
      icon: '/icons/upload-success.png',
      tag: `proof-uploaded-${therapistId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      data: {
        type: 'payment_proof_uploaded',
        therapistId,
        source: 'chat_window',
        url: `/therapist/payment-status`
      },
      actions: [
        { action: 'view_history', title: '📋 View History', icon: '/icons/history.png' },
        { action: 'dismiss', title: 'Got it!' }
      ]
    });
  }

  /**
   * 🔥 ADMIN: Payment proof approved/declined notification
   */
  async notifyPaymentReviewComplete(therapistId: string, therapistName: string, status: 'approved' | 'declined', amount: number, adminNotes?: string) {
    const isApproved = status === 'approved';
    
    // Notify therapist
    await this.showNotification({
      title: isApproved ? '✅ Payment Approved!' : '❌ Payment Declined',
      body: isApproved 
        ? `Your commission payment of Rp ${amount.toLocaleString()} has been approved`
        : `Your payment proof was declined. ${adminNotes || 'Please resubmit with correct details.'}`,
      icon: isApproved ? '/icons/approved.png' : '/icons/declined.png',
      tag: `payment-review-${therapistId}`,
      requireInteraction: !isApproved, // Require interaction for declined payments
      vibrate: isApproved ? this.vibrationPatterns.success : this.vibrationPatterns.error,
      data: {
        type: 'payment_review_complete',
        therapistId,
        status,
        amount,
        url: '/therapist/payment-status'
      },
      actions: isApproved ? [
        { action: 'view_history', title: '📋 View History', icon: '/icons/history.png' },
        { action: 'dismiss', title: 'Great!' }
      ] : [
        { action: 'resubmit', title: '📤 Resubmit', icon: '/icons/upload.png' },
        { action: 'contact_admin', title: '💬 Contact Admin', icon: '/icons/support.png' }
      ]
    });

    // Auto-schedule deletion notification (2 weeks)
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    await this.scheduleNotification({
      title: '🗑️ Payment History Cleanup',
      body: `Payment proof for Rp ${amount.toLocaleString()} will be deleted in 24 hours (2-week retention policy)`,
      icon: '/icons/cleanup.png',
      tag: `cleanup-warning-${therapistId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.chat,
      data: {
        type: 'payment_cleanup_warning',
        therapistId,
        amount,
        url: '/therapist/payment-status'
      },
      actions: [
        { action: 'download', title: '💾 Download Copy', icon: '/icons/download.png' },
        { action: 'dismiss', title: 'Understood' }
      ]
    }, twoWeeksMs - (24 * 60 * 60 * 1000)); // 13 days (warn 1 day before deletion)
  }

  /**
   * 🔥 File retention management - Auto cleanup after 2 weeks
   */
  async notifyFileCleanup(therapistId: string, files: Array<{url: string, amount: number, date: string}>) {
    if (files.length === 0) return;

    const totalAmount = files.reduce((sum, file) => sum + file.amount, 0);

    await this.showNotification({
      title: '🗑️ Payment Files Deleted',
      body: `${files.length} payment proof files deleted (2-week retention) • Total: Rp ${totalAmount.toLocaleString()}`,
      icon: '/icons/deleted.png',
      tag: `files-deleted-${therapistId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.chat,
      data: {
        type: 'files_auto_deleted',
        therapistId,
        fileCount: files.length,
        totalAmount,
        url: '/therapist/payment-status'
      },
      actions: [
        { action: 'view_active', title: '📋 View Active', icon: '/icons/active.png' },
        { action: 'dismiss', title: 'Understood' }
      ]
    });
  }

  /**
   * 🔥 Cross-platform payment sync notification
   */
  async notifyPaymentSync(therapistId: string, source: 'chat' | 'payment_page', targetPlatform: 'payment_history' | 'chat_history') {
    await this.showNotification({
      title: '🔄 Payment Synced',
      body: `Payment proof from ${source.replace('_', ' ')} has been added to ${targetPlatform.replace('_', ' ')}`,
      icon: '/icons/sync.png',
      tag: `payment-sync-${therapistId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      silent: true, // Subtle notification
      data: {
        type: 'payment_synced',
        source,
        targetPlatform,
        therapistId,
        url: targetPlatform === 'payment_history' ? '/therapist/payment-status' : '/therapist/chat'
      },
      actions: [
        { action: 'view_target', title: '👀 View', icon: '/icons/view.png' },
        { action: 'dismiss', title: 'OK' }
      ]
    });
  }

  /**
   * 🔥 ADMIN: Multiple payments pending notification
   */
  async notifyAdminBatchPayments(count: number, totalAmount: number) {
    if (!this.isAdmin) return;

    await this.showNotification({
      title: '📊 Multiple Payments Pending',
      body: `${count} payment proofs awaiting review • Total: Rp ${totalAmount.toLocaleString()}`,
      icon: '/icons/admin-batch.png',
      tag: 'admin-batch-payments',
      requireInteraction: true,
      vibrate: this.vibrationPatterns.urgent,
      data: {
        type: 'admin_batch_review',
        count,
        totalAmount,
        url: '/admin/payments/batch-review'
      },
      actions: [
        { action: 'review_all', title: '📋 Review All', icon: '/icons/list.png' },
        { action: 'approve_all', title: '✅ Bulk Approve', icon: '/icons/approve-all.png' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }

  /**
   * 🔥 Enhanced chat notification with rich media
   */
  async notifyNewMessage(senderName: string, messageText: string, chatRoomId: string, senderAvatar?: string) {
    await this.showNotification({
      title: `💬 ${senderName}`,
      body: messageText,
      icon: senderAvatar || '/icons/chat-icon.png',
      image: messageText.includes('http') ? this.extractImageFromMessage(messageText) : undefined,
      tag: `chat-${chatRoomId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.chat,
      data: {
        type: 'chat',
        chatRoomId,
        senderName,
        url: `/therapist/chat?room=${chatRoomId}`
      },
      actions: [
        { action: 'reply', title: '💬 Quick Reply', icon: '/icons/reply.png' },
        { action: 'open', title: '👀 Open Chat', icon: '/icons/open.png' },
        { action: 'mark_read', title: '✓ Mark Read' }
      ]
    });
  }

  /**
   * 🔥 CUSTOMER: Deposit submission confirmation
   */
  async notifyDepositSubmitted(customerName: string, therapistName: string, bookingId: string, depositAmount: number) {
    await this.showNotification({
      title: '📤 Deposit Proof Submitted',
      body: `Your deposit proof of Rp ${depositAmount.toLocaleString()} has been sent to ${therapistName} for review.`,
      icon: '/icons/deposit-submitted.png',
      tag: `deposit-submitted-${bookingId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      data: {
        type: 'deposit_submitted',
        bookingId,
        depositAmount,
        url: `/customer/booking-status/${bookingId}`
      },
      actions: [
        { action: 'view_status', title: '👀 View Status', icon: '/icons/view.png' },
        { action: 'dismiss', title: 'Got it!' }
      ]
    });
  }

  /**
   * 🔥 THERAPIST: New deposit proof received
   */
  async notifyDepositProofReceived(customerName: string, bookingId: string, depositAmount: number, proofUrl: string) {
    await this.showNotification({
      title: '💰 New Deposit Proof',
      body: `${customerName} submitted deposit proof of Rp ${depositAmount.toLocaleString()} for scheduled booking.`,
      icon: '/icons/deposit-received.png',
      image: proofUrl,
      tag: `deposit-proof-${bookingId}`,
      requireInteraction: true,
      vibrate: this.vibrationPatterns.payment,
      data: {
        type: 'deposit_proof_received',
        bookingId,
        customerName,
        depositAmount,
        url: `/therapist/bookings?deposit=${bookingId}`
      },
      actions: [
        { action: 'approve', title: '✅ Approve', icon: '/icons/approve.png' },
        { action: 'view_proof', title: '👀 View Proof', icon: '/icons/view.png' },
        { action: 'request_reupload', title: '🔄 Request Re-upload', icon: '/icons/refresh.png' }
      ]
    });
  }

  /**
   * 🔥 CUSTOMER: Deposit approved by therapist
   */
  async notifyDepositApproved(therapistName: string, bookingId: string, depositAmount: number, bookingDetails?: any) {
    await this.showNotification({
      title: '✅ Deposit Approved!',
      body: `${therapistName} approved your deposit of Rp ${depositAmount.toLocaleString()}. Your booking is confirmed!`,
      icon: '/icons/deposit-approved.png',
      tag: `deposit-approved-${bookingId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      data: {
        type: 'deposit_approved',
        bookingId,
        therapistName,
        depositAmount,
        url: `/customer/booking-confirmed/${bookingId}`
      },
      actions: [
        { action: 'view_booking', title: '📋 View Booking', icon: '/icons/booking.png' },
        { action: 'chat_therapist', title: '💬 Chat Therapist', icon: '/icons/chat.png' }
      ]
    });
  }

  /**
   * 🔥 CUSTOMER: Deposit rejected by therapist
   */
  async notifyDepositRejected(therapistName: string, bookingId: string, depositAmount: number, reason: string) {
    await this.showNotification({
      title: '❌ Deposit Rejected',
      body: `${therapistName} needs clarification on your deposit proof. Reason: ${reason}`,
      icon: '/icons/deposit-rejected.png',
      tag: `deposit-rejected-${bookingId}`,
      requireInteraction: true,
      vibrate: this.vibrationPatterns.error,
      data: {
        type: 'deposit_rejected',
        bookingId,
        therapistName,
        reason,
        url: `/customer/booking-resubmit/${bookingId}`
      },
      actions: [
        { action: 'resubmit', title: '📤 Resubmit Proof', icon: '/icons/upload.png' },
        { action: 'chat_therapist', title: '💬 Contact Therapist', icon: '/icons/chat.png' }
      ]
    });
  }

  /**
   * 🔥 CUSTOMER: Therapist requests re-upload
   */
  async notifyDepositReuploadRequested(therapistName: string, bookingId: string, message: string) {
    await this.showNotification({
      title: '🔄 Re-upload Request',
      body: `${therapistName}: ${message}`,
      icon: '/icons/reupload-request.png',
      tag: `reupload-request-${bookingId}`,
      requireInteraction: true,
      vibrate: this.vibrationPatterns.payment,
      data: {
        type: 'deposit_reupload_requested',
        bookingId,
        therapistName,
        message,
        url: `/customer/booking-reupload/${bookingId}`
      },
      actions: [
        { action: 'upload_new', title: '📤 Upload New Proof', icon: '/icons/upload.png' },
        { action: 'chat_therapist', title: '💬 Ask Therapist', icon: '/icons/chat.png' }
      ]
    });
  }

  /**
   * 🔥 Enhanced booking notification with rich details
   */
  async notifyNewBooking(customerName: string, service: string, bookingId: string, bookingDetails?: any) {
    const estimatedEarnings = bookingDetails?.amount ? (bookingDetails.amount * 0.7) : 0; // 70% after 30% commission

    await this.showNotification({
      title: '🎉 New Booking Request!',
      body: `${customerName} • ${service} • Est. earnings: Rp ${estimatedEarnings.toLocaleString()}`,
      icon: '/icons/booking-icon.png',
      image: bookingDetails?.serviceImage,
      tag: `booking-${bookingId}`,
      requireInteraction: true,
      vibrate: this.vibrationPatterns.booking,
      timestamp: Date.now(),
      data: {
        type: 'booking',
        bookingId,
        customerName,
        estimatedEarnings,
        url: `/therapist/bookings?booking=${bookingId}`
      },
      actions: [
        { action: 'accept', title: '✅ Accept', icon: '/icons/accept.png' },
        { action: 'view', title: '👀 View Details', icon: '/icons/view.png' },
        { action: 'decline', title: '❌ Decline', icon: '/icons/decline.png' }
      ]
    });
  }

  /**
   * 🔥 Payment confirmation notification
   */
  async notifyPaymentConfirmed(therapistName: string, amount: number, bookingId: string) {
    await this.showNotification({
      title: '💰 Payment Confirmed!',
      body: `${therapistName} confirmed payment of Rp ${amount.toLocaleString()}`,
      icon: '/icons/payment-confirmed.png',
      tag: `payment-confirmed-${bookingId}`,
      requireInteraction: false,
      vibrate: this.vibrationPatterns.success,
      data: {
        type: 'payment_confirmed',
        therapistName,
        amount,
        bookingId,
        url: `/admin/bookings/${bookingId}`
      },
      actions: [
        { action: 'view_booking', title: '📋 View Booking', icon: '/icons/booking.png' },
        { action: 'send_review', title: '⭐ Send Review Link', icon: '/icons/star.png' }
      ]
    });
  }

  /**
   * 🔥 System alert notifications (Facebook-standard)
   */
  async notifySystemAlert(alertType: 'success' | 'warning' | 'error' | 'info', title: string, message: string, actionUrl?: string) {
    const configs = {
      success: { 
        icon: '/icons/success.png', 
        vibrate: this.vibrationPatterns.success, 
        requireInteraction: false 
      },
      warning: { 
        icon: '/icons/warning.png', 
        vibrate: this.vibrationPatterns.payment, 
        requireInteraction: true 
      },
      error: { 
        icon: '/icons/error.png', 
        vibrate: this.vibrationPatterns.error, 
        requireInteraction: true 
      },
      info: { 
        icon: '/icons/info.png', 
        vibrate: this.vibrationPatterns.chat, 
        requireInteraction: false 
      }
    };

    const config = configs[alertType];

    await this.showNotification({
      title,
      body: message,
      icon: config.icon,
      tag: `system-${alertType}-${Date.now()}`,
      requireInteraction: config.requireInteraction,
      vibrate: config.vibrate,
      data: {
        type: `system_${alertType}`,
        url: actionUrl
      },
      actions: actionUrl ? [
        { action: 'view', title: '👀 View', icon: '/icons/view.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ] : [
        { action: 'dismiss', title: 'Got it!' }
      ]
    });
  }

  /**
   * Extract image URL from message text
   */
  private extractImageFromMessage(text: string): string | undefined {
    const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const match = text.match(imageUrlRegex);
    return match ? match[0] : undefined;
  }

  /**
   * 🔥 Clear all notifications by tag (Facebook approach)
   */
  async clearNotifications(tag?: string) {
    if (!this.registration) return;

    const notifications = await this.registration.getNotifications({ tag });
    notifications.forEach(notification => notification.close());
    
    console.log(`🧹 Cleared ${notifications.length} notifications${tag ? ` with tag: ${tag}` : ''}`);
  }

  /**
   * 🔥 Get notification history (Facebook-style)
   */
  getNotificationHistory(limit: number = 50): any[] {
    const history = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('notification_')) {
        try {
          const notification = JSON.parse(localStorage.getItem(key) || '');
          history.push(notification);
        } catch (error) {
          console.error('Error parsing notification history:', error);
        }
      }
    }
    
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 🔥 Schedule notification (Facebook-standard)
   */
  async scheduleNotification(payload: NotificationPayload, delayMs: number) {
    setTimeout(async () => {
      await this.showNotification(payload);
    }, delayMs);
    
    console.log(`⏰ Notification scheduled for ${new Date(Date.now() + delayMs).toLocaleString()}`);
  }

  /**
   * 🔥 Batch notifications (Facebook approach for efficiency)
   */
  async sendBatchNotifications(notifications: NotificationPayload[], interval: number = 1000) {
    for (let i = 0; i < notifications.length; i++) {
      await this.showNotification(notifications[i]);
      if (i < notifications.length - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    console.log(`📦 Sent batch of ${notifications.length} notifications`);
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * 🔥 Get notification statistics (Facebook-style analytics)
   */
  getNotificationStats(): {
    totalSent: number;
    byType: Record<string, number>;
    byDay: Record<string, number>;
    clickRate: number;
  } {
    const history = this.getNotificationHistory();
    const stats = {
      totalSent: history.length,
      byType: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
      clickRate: 0
    };

    history.forEach(notification => {
      // Count by type
      const type = notification.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count by day
      const day = new Date(notification.timestamp).toDateString();
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return stats;
  }

  /**
   * Utility: Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Singleton instance
export const pushNotificationsService = new PushNotificationsService();
