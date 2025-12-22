/**
 * Centralized Chat Auto-Notification System
 * Handles all automated notifications sent to therapist/customer chat
 */

import { messagingService } from '../../appwriteService';

interface NotificationParams {
  recipientId: string;
  recipientType: 'therapist' | 'user' | 'massage-place';
  recipientName: string;
  sendFromAdmin?: boolean;
}

/**
 * BOOKING LIFECYCLE NOTIFICATIONS
 */

// Booking confirmed
export async function sendBookingConfirmedNotification(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  dateTime: string;
  serviceName: string;
  amount: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `✅ **Booking Confirmed!**\n\n📋 Booking ID: #${params.bookingId}\n👤 Customer: ${params.customerName}\n🕐 Date/Time: ${params.dateTime}\n💆 Service: ${params.serviceName}\n💰 Amount: Rp ${params.amount.toLocaleString()}\n\nPlease arrive 10 minutes early. Customer location and contact will be available 1 hour before the session. Good luck! 🌟`,
  });
}

// 24-hour reminder
export async function send24HourBookingReminder(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  dateTime: string;
  locationSummary: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `⏰ **Booking Reminder - Tomorrow!**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n🕐 Time: ${params.dateTime}\n📍 Location: ${params.locationSummary}\n\nPrepare your equipment and confirm your availability. Have a great session! 💪`,
  });
}

// Booking starting soon (1 hour before)
export async function sendBookingStartingSoonNotification(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  fullAddress: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `🎯 **Session Starting Soon!**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n📞 Contact: ${customerPhone}\n📍 Address: ${params.fullAddress}\n\nYour session should be starting now. Please contact the customer if you need directions. 🗺️`,
  });
}

// Late arrival warning
export async function sendLateArrivalWarning(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  minutesLate: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `⚠️ **Customer Late Arrival Alert**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n⏱️ Late by: ${params.minutesLate} minutes\n\nThe customer hasn't checked in yet. You may:\n• Wait up to 30 minutes\n• Contact customer directly\n• Cancel after 30 minutes with full payment\n\nPlease be patient, they may be stuck in traffic. 🚗`,
  });
}

/**
 * PAYMENT NOTIFICATIONS
 */

// Payment received (cash on delivery)
export async function sendPaymentReceivedNotification(params: NotificationParams & {
  bookingId: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'screenshot';
  customerName: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  const methodText = params.paymentMethod === 'cash' 
    ? '💵 Cash Payment (Confirmed by customer)'
    : params.paymentMethod === 'screenshot'
    ? '📸 Screenshot Upload (Pending verification)'
    : '💳 Bank Transfer';

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `💰 **Payment Received!**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n💵 Amount: Rp ${params.amount.toLocaleString()}\n${methodText}\n\n${params.paymentMethod === 'screenshot' ? '⚠️ Please verify the payment screenshot matches the amount. Contact admin if there are any discrepancies.' : 'Thank you for completing the service! 🎉'}`,
  });
}

// Payment pending (screenshot uploaded)
export async function sendPaymentPendingNotification(params: NotificationParams & {
  bookingId: string;
  amount: number;
  customerName: string;
  screenshotUrl: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `⏳ **Payment Screenshot Uploaded**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n💵 Expected: Rp ${params.amount.toLocaleString()}\n📸 Screenshot: View in booking details\n\n⚠️ **Action Required:**\nPlease verify the payment screenshot matches the booking amount. If correct, confirm the payment. If incorrect or suspicious, contact Team Indastreet immediately.\n\n✅ Once verified, the payment will be processed to your account within 24-48 hours.`,
  });
}

// Off-platform payment notification
export async function sendOffPlatformPaymentNotification(params: NotificationParams & {
  bookingId: string;
  amount: number;
  customerName: string;
  notes?: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `💸 **Off-Platform Payment Recorded**\n\n📋 Booking #${params.bookingId}\n👤 Customer: ${params.customerName}\n💵 Amount: Rp ${params.amount.toLocaleString()}\n💰 Method: Direct Payment (Off-platform)\n${params.notes ? `📝 Notes: ${params.notes}` : ''}\n\n⚠️ **Important:** This payment was made outside the IndastreetMassage platform. Please ensure you received the full amount. Platform fees may still apply.\n\nFor your protection, we recommend using on-platform payment methods for all future bookings.`,
  });
}

/**
 * REVIEW & FEEDBACK NOTIFICATIONS
 */

// New review received
export async function sendNewReviewNotification(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  rating: number;
  reviewText: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  const stars = '⭐'.repeat(params.rating);
  const emoji = params.rating >= 4 ? '🎉' : params.rating === 3 ? '😊' : '😔';

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `${emoji} **New Review Received!**\n\n${stars} (${params.rating}/5)\n👤 Customer: ${params.customerName}\n📋 Booking: #${params.bookingId}\n\n💬 Review:\n"${params.reviewText}"\n\n${params.rating >= 4 ? 'Great job! Keep up the excellent work! 💪' : params.rating === 3 ? 'Good service! There\'s always room for improvement. 📈' : 'We noticed a low rating. Please review what happened and improve for next time. Contact support if you need assistance. 🤝'}`,
  });
}

// Review reminder to send to customer
export async function sendReviewReminderSuggestion(params: NotificationParams & {
  bookingId: string;
  customerName: string;
  daysAgo: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `🌟 **Review Follow-up Opportunity**\n\n📋 Booking #${params.bookingId} (${params.daysAgo} days ago)\n👤 Customer: ${params.customerName}\n\nThis customer hasn't left a review yet. Sending a friendly message might encourage them to share their experience! Reviews help grow your business. 📈\n\n💡 Tip: "Hi ${params.customerName}! Hope you enjoyed the massage. Would love to hear your feedback - it helps us serve you better! ⭐"`,
  });
}

/**
 * ACCOUNT & PROFILE NOTIFICATIONS
 */

// Profile incomplete warning
export async function sendProfileIncompleteWarning(params: NotificationParams & {
  missingFields: string[];
  completionPercentage: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `📋 **Complete Your Profile!**\n\nYour profile is ${params.completionPercentage}% complete.\n\n❌ Missing:\n${params.missingFields.map(f => `• ${f}`).join('\n')}\n\n✅ Complete profiles get 3x more bookings!\n\n👉 Update your profile now in the dashboard to start receiving more customers. 🚀`,
  });
}

// Membership expiring soon
export async function sendMembershipExpiringNotification(params: NotificationParams & {
  daysRemaining: number;
  membershipTier: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `👑 **Membership Renewal Reminder**\n\nYour ${params.membershipTier} membership expires in ${params.daysRemaining} days.\n\n⚠️ After expiration:\n• Your bookings will be paused\n• Profile visibility will decrease\n• Premium features will be disabled\n\n💎 Renew now to maintain your benefits and continue receiving bookings!\n\nContact Team Indastreet for renewal options. 💳`,
  });
}

/**
 * AVAILABILITY & SCHEDULE NOTIFICATIONS
 */

// Low availability warning
export async function sendLowAvailabilityWarning(params: NotificationParams & {
  availableSlots: number;
  weekOf: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `⚠️ **Low Availability Alert**\n\nYou only have ${params.availableSlots} time slots available for the week of ${params.weekOf}.\n\n📅 Adding more availability increases your chances of getting bookings!\n\n💡 Tip: Customers book 5-7 days in advance. Update your schedule now to maximize earnings. 💰`,
  });
}

// Going offline warning
export async function sendGoingOfflineWarning(params: NotificationParams & {
  hoursOffline: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `🔴 **You're Offline!**\n\nYou've been offline for ${hoursOffline} hours.\n\n⚠️ While offline:\n• Customers can't book you\n• Your profile ranking decreases\n• You're missing potential earnings\n\n✅ Go online now to start receiving bookings! 📲`,
  });
}

/**
 * PERFORMANCE & ACHIEVEMENTS NOTIFICATIONS
 */

// Weekly performance summary
export async function sendWeeklySummary(params: NotificationParams & {
  weekOf: string;
  totalBookings: number;
  totalEarnings: number;
  avgRating: number;
  topRank?: number;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `📊 **Weekly Performance Summary**\n\nWeek of ${params.weekOf}\n\n📈 Performance:\n• 📅 Bookings: ${params.totalBookings}\n• 💰 Earnings: Rp ${params.totalEarnings.toLocaleString()}\n• ⭐ Avg Rating: ${params.avgRating.toFixed(1)}/5\n${params.topRank ? `• 🏆 Rank: Top ${params.topRank}%\n` : ''}\n${params.totalBookings > 0 ? 'Great work! Keep it up! 💪' : 'Let\'s aim for more bookings next week! 🎯'}`,
  });
}

// Milestone achievement
export async function sendMilestoneNotification(params: NotificationParams & {
  milestone: string;
  count: number;
  reward?: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `🎉 **Milestone Achieved!**\n\n${params.milestone}: ${params.count}!\n\n${params.reward ? `🎁 Reward: ${params.reward}\n\n` : ''}You're doing amazing work! Keep providing excellent service to reach even greater heights! 🌟\n\nThank you for being part of the IndastreetMassage family! 💙`,
  });
}

/**
 * SYSTEM & SAFETY NOTIFICATIONS
 */

// Account warning
export async function sendAccountWarningNotification(params: NotificationParams & {
  violationType: string;
  violationCount: number;
  description: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `⚠️ **Account Warning #${params.violationCount}**\n\nViolation Type: ${params.violationType}\n\n${params.description}\n\n🚨 **Consequences:**\n• Warning #2: Temporary restriction\n• Warning #3: Account suspension\n• Warning #4: Permanent deactivation\n\nPlease review our Terms of Service and Community Guidelines. Contact support if you have questions.\n\nTeam Indastreet - Safety & Compliance`,
  });
}

// Terms update notification
export async function sendTermsUpdateNotification(params: NotificationParams & {
  updateSummary: string;
  effectiveDate: string;
}) {
  const conversationId = messagingService.generateConversationId(
    { id: params.recipientId, role: params.recipientType },
    { id: 'admin', role: 'admin' }
  );

  await messagingService.sendMessage({
    conversationId,
    senderId: 'system',
    senderType: 'system',
    senderName: 'Team Indastreet',
    receiverId: params.recipientId,
    receiverType: params.recipientType,
    receiverName: params.recipientName,
    content: `📢 **Terms of Service Update**\n\nEffective Date: ${params.effectiveDate}\n\n${updateSummary}\n\n📋 Please review the updated terms in your dashboard. Continued use of the platform constitutes acceptance of the new terms.\n\nThank you,\nTeam Indastreet`,
  });
}
