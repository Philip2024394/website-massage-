// Provider Rewards Service
// Handles coin rewards for therapists, massage places, hotels, and villas

import { databases, ID } from './appwrite';
import { Query } from 'appwrite';
import { COIN_CONFIG } from './coinConfig';

const PROVIDER_REWARDS_DATABASE_ID = '68f76ee1000e64ca8d05'; // Same as coin shop database
const PROVIDER_ACTIVITIES_COLLECTION_ID = 'provideractivities';
const COMMISSION_CONFIRMATIONS_COLLECTION_ID = 'commissionconfirmations';

export interface ProviderActivity {
    $id?: string;
    providerId: string;
    providerType: 'therapist' | 'place' | 'hotel' | 'villa';
    providerName: string;
    activityType: 'booking_completed' | 'rating_received' | 'weekly_bonus' | 'monthly_bonus' | 'commission_confirmed';
    coinsEarned: number;
    relatedBookingId?: string;
    rating?: number;
    hoursWorked?: number;
    bookingsCount?: number;
    description: string;
    createdAt?: string;
}

export interface CommissionConfirmation {
    $id?: string;
    bookingId: string;
    hotelVillaId: string;
    hotelVillaType: 'hotel' | 'villa';
    hotelVillaName: string;
    therapistId: string;
    therapistName: string;
    commissionAmount: number;
    confirmedBy: string;
    confirmedAt?: string;
    therapistStatusUpdated: boolean;
    coinsAwarded: number;
}

export const providerRewardsService = {
    
    /**
     * Award coins to therapist for booking completion with rating bonus
     */
    async awardTherapistBookingCoins(
        therapistId: string,
        therapistName: string,
        bookingId: string,
        rating?: number,
        isWeekend: boolean = false,
        acceptedWithinMinutes?: number
    ): Promise<void> {
        try {
            let totalCoins = COIN_CONFIG.THERAPIST_BOOKING_COMPLETION;
            let description = `Booking completed - ${totalCoins} coins`;

            // 5-star rating bonus
            if (rating === 5.0) {
                totalCoins += COIN_CONFIG.THERAPIST_5_STAR_BONUS;
                description += ` + ${COIN_CONFIG.THERAPIST_5_STAR_BONUS} (5-star bonus)`;
            }

            // Weekend bonus
            if (isWeekend) {
                totalCoins += COIN_CONFIG.THERAPIST_WEEKEND_BONUS;
                description += ` + ${COIN_CONFIG.THERAPIST_WEEKEND_BONUS} (weekend bonus)`;
            }

            // Early bird bonus
            if (acceptedWithinMinutes && acceptedWithinMinutes <= COIN_CONFIG.EARLY_ACCEPTANCE_MINUTES) {
                totalCoins += COIN_CONFIG.THERAPIST_EARLY_BIRD_BONUS;
                description += ` + ${COIN_CONFIG.THERAPIST_EARLY_BIRD_BONUS} (quick acceptance)`;
            }

            // Award coins
            const { coinService } = await import('./appwriteService');
            await coinService.addCoins(
                therapistId,
                'therapist',
                therapistName,
                totalCoins,
                description,
                bookingId
            );

            // Log activity
            await this.logProviderActivity({
                providerId: therapistId,
                providerType: 'therapist',
                providerName: therapistName,
                activityType: 'booking_completed',
                coinsEarned: totalCoins,
                relatedBookingId: bookingId,
                rating,
                description
            });

            console.log(`💰 Therapist ${therapistName} earned ${totalCoins} coins for booking ${bookingId}`);

        } catch (error) {
            console.error('Error awarding therapist booking coins:', error);
        }
    },

    /**
     * Award coins to massage place for booking completion
     */
    async awardPlaceBookingCoins(
        placeId: string,
        placeName: string,
        bookingId: string,
        rating?: number,
        serviceMinutes?: number,
        isReturnCustomer: boolean = false
    ): Promise<void> {
        try {
            let totalCoins = COIN_CONFIG.PLACE_BOOKING_COMPLETION;
            let description = `Booking completed - ${totalCoins} coins`;

            // 5-star rating bonus
            if (rating === 5.0) {
                totalCoins += COIN_CONFIG.PLACE_5_STAR_BONUS;
                description += ` + ${COIN_CONFIG.PLACE_5_STAR_BONUS} (5-star bonus)`;
            }

            // Premium service bonus (120 minutes)
            if (serviceMinutes === 120) {
                totalCoins += COIN_CONFIG.PLACE_PREMIUM_SERVICE_BONUS;
                description += ` + ${COIN_CONFIG.PLACE_PREMIUM_SERVICE_BONUS} (premium service)`;
            }

            // Customer retention bonus
            if (isReturnCustomer) {
                totalCoins += COIN_CONFIG.PLACE_CUSTOMER_RETENTION;
                description += ` + ${COIN_CONFIG.PLACE_CUSTOMER_RETENTION} (return customer)`;
            }

            // Award coins
            const { coinService } = await import('./appwriteService');
            await coinService.addCoins(
                placeId,
                'place',
                placeName,
                totalCoins,
                description,
                bookingId
            );

            // Log activity
            await this.logProviderActivity({
                providerId: placeId,
                providerType: 'place',
                providerName: placeName,
                activityType: 'booking_completed',
                coinsEarned: totalCoins,
                relatedBookingId: bookingId,
                rating,
                description
            });

            console.log(`💰 Place ${placeName} earned ${totalCoins} coins for booking ${bookingId}`);

        } catch (error) {
            console.error('Error awarding place booking coins:', error);
        }
    },

    /**
     * Award coins to hotel/villa for guest booking
     */
    async awardHotelVillaBookingCoins(
        hotelVillaId: string,
        hotelVillaName: string,
        hotelVillaType: 'hotel' | 'villa',
        bookingId: string,
        wasChatBooking: boolean = false
    ): Promise<void> {
        try {
            const baseCoins = hotelVillaType === 'hotel' ? COIN_CONFIG.HOTEL_GUEST_BOOKING : COIN_CONFIG.VILLA_GUEST_BOOKING;
            let totalCoins = baseCoins;
            let description = `Guest booking - ${totalCoins} coins`;

            // Chat booking bonus
            if (wasChatBooking) {
                const chatBonus = hotelVillaType === 'hotel' ? COIN_CONFIG.HOTEL_CHAT_BOOKING : COIN_CONFIG.VILLA_CHAT_BOOKING;
                totalCoins += chatBonus;
                description += ` + ${chatBonus} (chat booking)`;
            }

            // Award coins
            const { coinService } = await import('./appwriteService');
            await coinService.addCoins(
                hotelVillaId,
                hotelVillaType,
                hotelVillaName,
                totalCoins,
                description,
                bookingId
            );

            // Log activity
            await this.logProviderActivity({
                providerId: hotelVillaId,
                providerType: hotelVillaType,
                providerName: hotelVillaName,
                activityType: 'booking_completed',
                coinsEarned: totalCoins,
                relatedBookingId: bookingId,
                description
            });

            console.log(`💰 ${hotelVillaType} ${hotelVillaName} earned ${totalCoins} coins for guest booking ${bookingId}`);

        } catch (error) {
            console.error('Error awarding hotel/villa booking coins:', error);
        }
    },

    /**
     * Process commission confirmation and award coins
     */
    async confirmCommissionPayment(
        bookingId: string,
        hotelVillaId: string,
        hotelVillaType: 'hotel' | 'villa',
        hotelVillaName: string,
        therapistId: string,
        therapistName: string,
        commissionAmount: number,
        confirmedBy: string
    ): Promise<{
        success: boolean;
        therapistStatusUpdated: boolean;
        coinsAwarded: number;
        message: string;
    }> {
        try {
            // Check if already confirmed
            const existingConfirmation = await databases.listDocuments(
                PROVIDER_REWARDS_DATABASE_ID,
                COMMISSION_CONFIRMATIONS_COLLECTION_ID,
                [
                    Query.equal('bookingId', bookingId),
                    Query.limit(1)
                ]
            );

            if (existingConfirmation.documents.length > 0) {
                return {
                    success: false,
                    therapistStatusUpdated: false,
                    coinsAwarded: 0,
                    message: 'Commission already confirmed for this booking.'
                };
            }

            const confirmationCoins = hotelVillaType === 'hotel' 
                ? COIN_CONFIG.HOTEL_COMMISSION_CONFIRMATION 
                : COIN_CONFIG.VILLA_COMMISSION_CONFIRMATION;

            // Create commission confirmation record
            await databases.createDocument(
                PROVIDER_REWARDS_DATABASE_ID,
                COMMISSION_CONFIRMATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    bookingId,
                    hotelVillaId,
                    hotelVillaType,
                    hotelVillaName,
                    therapistId,
                    therapistName,
                    commissionAmount,
                    confirmedBy,
                    therapistStatusUpdated: true,
                    coinsAwarded: confirmationCoins
                }
            );

            // Award coins to hotel/villa for confirming payment
            const { coinService } = await import('./appwriteService');
            await coinService.addCoins(
                hotelVillaId,
                hotelVillaType,
                hotelVillaName,
                confirmationCoins,
                `Commission confirmation - ${confirmationCoins} coins`,
                bookingId
            );

            // Update therapist status to available (they can now accept new bookings)
            const { therapistService } = await import('./appwriteService');
            await therapistService.update(therapistId, { status: 'available' });

            console.log(`✅ Commission confirmed for booking ${bookingId}. Therapist ${therapistName} status updated to available.`);

            return {
                success: true,
                therapistStatusUpdated: true,
                coinsAwarded: confirmationCoins,
                message: `Commission confirmed! You earned ${confirmationCoins} coins. Therapist status updated.`
            };

        } catch (error) {
            console.error('Error confirming commission payment:', error);
            return {
                success: false,
                therapistStatusUpdated: false,
                coinsAwarded: 0,
                message: 'Failed to confirm commission. Please try again.'
            };
        }
    },

    /**
     * Check and award weekly bonuses for all providers
     */
    async processWeeklyBonuses(): Promise<void> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Process therapist weekly bonuses (40+ hours)
            await this.processTherapistWeeklyBonuses(oneWeekAgo);

            // Process place weekly bonuses (10+ bookings)
            await this.processPlaceWeeklyBonuses(oneWeekAgo);

            // Process hotel/villa weekly bonuses (5+ guest bookings)
            await this.processHotelVillaWeeklyBonuses(oneWeekAgo);

        } catch (error) {
            console.error('Error processing weekly bonuses:', error);
        }
    },

    /**
     * Process therapist weekly bonuses
     */
    async processTherapistWeeklyBonuses(_since: Date): Promise<void> {
        try {
            // This would typically query your booking system to check hours worked
            // For now, I'll create a placeholder that you can integrate with your booking data
            
            // Example: Get all therapists and check their hours
            // const therapists = await therapistService.getAllActiveTherapists();
            // 
            // for (const therapist of therapists) {
            //     const hoursWorked = await this.calculateTherapistWeeklyHours(therapist.$id, since);
            //     
            //     if (hoursWorked >= 60) { // Updated threshold to 60+ hours
            //         await this.awardWeeklyBonus(
            //             therapist.$id,
            //             therapist.name,
            //             'therapist',
            //             COIN_CONFIG.THERAPIST_WEEKLY_60_HOURS, // Updated config name
            //             `Weekly bonus for ${hoursWorked} hours worked (60+ hours)`
            //         );
            //     }
            // }
            
            console.log('Therapist weekly bonuses processed');
        } catch (error) {
            console.error('Error processing therapist weekly bonuses:', error);
        }
    },

    /**
     * Process place weekly bonuses
     */
    async processPlaceWeeklyBonuses(_since: Date): Promise<void> {
        try {
            // Similar implementation for massage places
            console.log('Place weekly bonuses processed');
        } catch (error) {
            console.error('Error processing place weekly bonuses:', error);
        }
    },

    /**
     * Process hotel/villa weekly bonuses
     */
    async processHotelVillaWeeklyBonuses(_since: Date): Promise<void> {
        try {
            // Similar implementation for hotels and villas
            console.log('Hotel/Villa weekly bonuses processed');
        } catch (error) {
            console.error('Error processing hotel/villa weekly bonuses:', error);
        }
    },

    /**
     * Award weekly/monthly bonus
     */
    async awardWeeklyBonus(
        providerId: string,
        providerName: string,
        providerType: 'therapist' | 'place' | 'hotel' | 'villa',
        bonusAmount: number,
        description: string
    ): Promise<void> {
        try {
            const { coinService } = await import('./appwriteService');
            await coinService.addCoins(
                providerId,
                providerType,
                providerName,
                bonusAmount,
                description
            );

            await this.logProviderActivity({
                providerId,
                providerType,
                providerName,
                activityType: 'weekly_bonus',
                coinsEarned: bonusAmount,
                description
            });

            console.log(`🎉 Weekly bonus: ${providerName} earned ${bonusAmount} coins`);
        } catch (error) {
            console.error('Error awarding weekly bonus:', error);
        }
    },

    /**
     * Log provider activity
     */
    async logProviderActivity(activity: Omit<ProviderActivity, '$id' | 'createdAt'>): Promise<void> {
        try {
            await databases.createDocument(
                PROVIDER_REWARDS_DATABASE_ID,
                PROVIDER_ACTIVITIES_COLLECTION_ID,
                ID.unique(),
                activity
            );
        } catch (error) {
            console.error('Error logging provider activity:', error);
        }
    },

    /**
     * Get provider activity stats
     */
    async getProviderStats(providerId: string, period: 'week' | 'month' | 'all' = 'month'): Promise<{
        totalCoinsEarned: number;
        totalActivities: number;
        averageRating: number;
        topActivityType: string;
        weeklyBonusesEarned: number;
        monthlyBonusesEarned: number;
    }> {
        try {
            const queries = [Query.equal('providerId', providerId)];
            
            if (period !== 'all') {
                const date = new Date();
                if (period === 'week') {
                    date.setDate(date.getDate() - 7);
                } else {
                    date.setMonth(date.getMonth() - 1);
                }
                queries.push(Query.greaterThan('$createdAt', date.toISOString()));
            }

            const response = await databases.listDocuments(
                PROVIDER_REWARDS_DATABASE_ID,
                PROVIDER_ACTIVITIES_COLLECTION_ID,
                queries
            );

            const activities = response.documents as unknown as ProviderActivity[];
            
            const totalCoinsEarned = activities.reduce((sum, a) => sum + a.coinsEarned, 0);
            const ratingsReceived = activities.filter(a => a.rating && a.rating > 0);
            const averageRating = ratingsReceived.length > 0 
                ? ratingsReceived.reduce((sum, a) => sum + (a.rating || 0), 0) / ratingsReceived.length 
                : 0;

            return {
                totalCoinsEarned,
                totalActivities: activities.length,
                averageRating: parseFloat(averageRating.toFixed(2)),
                topActivityType: 'booking_completed', // Could calculate most frequent
                weeklyBonusesEarned: activities.filter(a => a.activityType === 'weekly_bonus').length,
                monthlyBonusesEarned: activities.filter(a => a.activityType === 'monthly_bonus').length
            };

        } catch (error) {
            console.error('Error getting provider stats:', error);
            return {
                totalCoinsEarned: 0,
                totalActivities: 0,
                averageRating: 0,
                topActivityType: 'none',
                weeklyBonusesEarned: 0,
                monthlyBonusesEarned: 0
            };
        }
    }
};