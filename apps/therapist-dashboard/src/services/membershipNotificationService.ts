// Membership notification service for admin panel integration
import { databases, ID } from "../../../../lib/appwrite";
import { APPWRITE_CONFIG } from "../../../../lib/appwrite.config";

interface MembershipNotificationData {
  therapistId: string;
  therapistName: string;
  therapistEmail: string;
  membershipType: 'monthly' | 'commission';
  selectedAt: string;
  membershipData?: any;
}

export const membershipNotificationService = {
  /**
   * Send notification to admin panel when therapist selects membership
   */
  async notifyAdminOfMembershipSelection(data: MembershipNotificationData): Promise<void> {
    try {
      console.log('📧 Sending membership notification to admin...', data);

      // Create admin notification document
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.notifications || 'notifications',
        ID.unique(),
        {
          type: 'membership_selection',
          therapistId: data.therapistId,
          therapistName: data.therapistName,
          therapistEmail: data.therapistEmail,
          membershipType: data.membershipType,
          selectedAt: data.selectedAt,
          title: `New Membership Selection: ${data.therapistName}`,
          message: `Therapist ${data.therapistName} (${data.therapistEmail}) has selected the ${
            data.membershipType === 'monthly' ? '5-Month Package' : 'Lead Commission'
          } membership plan.`,
          status: 'unread',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          membershipDetails: JSON.stringify(data.membershipData || {})
        }
      );

      console.log('✅ Admin notification sent successfully');

      // If it's a monthly package, start time tracking
      if (data.membershipType === 'monthly') {
        await this.startMonthlyPackageTracking(data);
      }

    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
      // Don't throw - membership selection should still complete
    }
  },

  /**
   * Start time tracking for monthly package members
   */
  async startMonthlyPackageTracking(data: MembershipNotificationData): Promise<void> {
    try {
      console.log('⏱️ Starting monthly package tracking...', data.therapistId);

      const trackingData = {
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        therapistEmail: data.therapistEmail,
        packageType: 'monthly',
        currentMonth: 1,
        startDate: data.selectedAt,
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'trial',
        monthlyHistory: JSON.stringify([
          {
            month: 1,
            startDate: data.selectedAt,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 0,
            status: 'trial',
            paid: false
          }
        ]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create or update membership tracking document
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.membershipPricing || 'membership-pricing',
        ID.unique(),
        trackingData
      );

      console.log('✅ Monthly package tracking started');

    } catch (error) {
      console.error('❌ Failed to start package tracking:', error);
      // Don't throw - this is supplementary functionality
    }
  },

  /**
   * Get monthly pricing schedule
   */
  getMonthlyPricingSchedule(): Array<{ month: number; amount: number; description: string }> {
    return [
      { month: 1, amount: 0, description: 'FREE Trial Month' },
      { month: 2, amount: 100000, description: 'Introductory Pricing - Rp 100,000' },
      { month: 3, amount: 135000, description: 'Building Phase - Rp 135,000' },
      { month: 4, amount: 175000, description: 'Growth Phase - Rp 175,000' },
      { month: 5, amount: 200000, description: 'Full Premium - Rp 200,000 (ongoing)' }
    ];
  },

  /**
   * Calculate next billing amount based on current month
   */
  calculateNextBillingAmount(currentMonth: number): number {
    const schedule = this.getMonthlyPricingSchedule();
    const nextMonth = Math.min(currentMonth + 1, 5);
    return schedule.find(s => s.month === nextMonth)?.amount || 200000;
  },

  /**
   * Update admin panel with commission settings
   */
  async updateCommissionSettings(data: MembershipNotificationData): Promise<void> {
    try {
      console.log('💰 Updating commission settings for therapist...', data.therapistId);

      // Create commission tracking document
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
        ID.unique(),
        {
          therapistId: data.therapistId,
          therapistName: data.therapistName,
          therapistEmail: data.therapistEmail,
          commissionRate: 30, // 30% per booking
          packageType: 'commission',
          startDate: data.selectedAt,
          status: 'active',
          totalBookings: 0,
          totalEarnings: 0,
          totalCommission: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          upgradeWarning: 'Upgrade to monthly package costs Rp 275,000/month with 30-day notice requirement'
        }
      );

      console.log('✅ Commission settings updated');

    } catch (error) {
      console.error('❌ Failed to update commission settings:', error);
    }
  }
};