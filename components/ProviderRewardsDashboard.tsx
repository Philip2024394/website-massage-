import React, { useState, useEffect } from 'react';
import { coinService } from '../lib/appwriteService';
import { COIN_CONFIG } from '../lib/coinConfig';

interface ProviderRewardsData {
    totalCoins: number;
    weeklyBonus: boolean;
    monthlyBonus: boolean;
    activityStats: {
        weeklyHours: number;
        monthlyBookings: number;
        averageRating: number;
        consecutiveWeeks: number;
    };
    recentEarnings: {
        date: string;
        activity: string;
        coins: number;
    }[];
}

interface ProviderRewardsDashboardProps {
    userId: string;
    userType: 'therapist' | 'place' | 'hotel' | 'villa';
    userName: string;
}

const ProviderRewardsDashboard: React.FC<ProviderRewardsDashboardProps> = ({
    userId,
    userType,
    userName
}) => {
    const [rewardsData, setRewardsData] = useState<ProviderRewardsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRewardsData();
    }, [userId]);

    const loadRewardsData = async () => {
        try {
            const userCoins = await coinService.getUserCoins(userId);
            
            // Mock data for demonstration - in real app this would come from analytics
            const mockData: ProviderRewardsData = {
                totalCoins: userCoins?.totalCoins || 0,
                weeklyBonus: false,
                monthlyBonus: false,
                activityStats: {
                    weeklyHours: userType === 'therapist' ? 65 : 0, // Updated to show 60+ hours
                    monthlyBookings: 12,
                    averageRating: 4.8,
                    consecutiveWeeks: 3
                },
                recentEarnings: [
                    { date: '2024-01-15', activity: 'Booking Completion', coins: COIN_CONFIG.THERAPIST_BOOKING_COMPLETION },
                    { date: '2024-01-14', activity: '5-Star Rating', coins: COIN_CONFIG.THERAPIST_5_STAR_BONUS },
                    { date: '2024-01-13', activity: 'Weekend Booking', coins: COIN_CONFIG.THERAPIST_WEEKEND_BONUS }
                ]
            };
            
            setRewardsData(mockData);
        } catch (error) {
            console.error('Failed to load rewards data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityBonuses = () => {
        const bonuses = [];
        
        if (userType === 'therapist') {
            if (rewardsData?.activityStats?.weeklyHours && rewardsData.activityStats.weeklyHours >= 60) {
                bonuses.push({
                    name: '60+ Hours Week',
                    coins: COIN_CONFIG.THERAPIST_WEEKLY_60_HOURS,
                    eligible: true
                });
            }
            
            if (rewardsData?.activityStats?.consecutiveWeeks && rewardsData.activityStats.consecutiveWeeks >= 4) {
                bonuses.push({
                    name: 'Monthly Consistency',
                    coins: COIN_CONFIG.THERAPIST_STREAK_BONUS,
                    eligible: true
                });
            }
            
            if (rewardsData?.activityStats?.averageRating && rewardsData.activityStats.averageRating >= 4.8) {
                bonuses.push({
                    name: 'Excellence Rating',
                    coins: COIN_CONFIG.THERAPIST_MONTHLY_PERFECT_RATING,
                    eligible: true
                });
            }
        }
        
        if (userType === 'place') {
            if (rewardsData?.activityStats?.monthlyBookings && rewardsData.activityStats.monthlyBookings >= 20) {
                bonuses.push({
                    name: 'High Volume Bonus',
                    coins: COIN_CONFIG.PLACE_MONTHLY_HIGH_VOLUME,
                    eligible: true
                });
            }
        }
        
        return bonuses;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">Loading rewards dashboard...</div>
            </div>
        );
    }

    const activityBonuses = getActivityBonuses();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    🎯 {userName} - Rewards Dashboard
                </h1>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 inline-block">
                    <span className="text-yellow-700 font-bold">🪙 {rewardsData?.totalCoins} Total Coins</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h2 className="font-bold text-gray-800 mb-4">📊 Activity Stats</h2>
                    <div className="space-y-3">
                        {userType === 'therapist' && (
                            <div className="flex justify-between">
                                <span>Weekly Hours:</span>
                                <span className="font-bold">{rewardsData?.activityStats.weeklyHours}h</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Monthly Bookings:</span>
                            <span className="font-bold">{rewardsData?.activityStats.monthlyBookings}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Average Rating:</span>
                            <span className="font-bold">⭐ {rewardsData?.activityStats.averageRating}</span>
                        </div>
                        {userType === 'therapist' && (
                            <div className="flex justify-between">
                                <span>Consecutive Weeks:</span>
                                <span className="font-bold">{rewardsData?.activityStats.consecutiveWeeks}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Bonuses */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h2 className="font-bold text-gray-800 mb-4">🎁 Available Bonuses</h2>
                    {activityBonuses.length === 0 ? (
                        <p className="text-gray-500">Keep working to unlock bonuses!</p>
                    ) : (
                        <div className="space-y-3">
                            {activityBonuses.map((bonus, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm">{bonus.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-600">+{bonus.coins}</span>
                                        {bonus.eligible && <span className="text-green-500">✅</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Earnings */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
                    <h2 className="font-bold text-gray-800 mb-4">📈 Recent Earnings</h2>
                    <div className="space-y-2">
                        {rewardsData?.recentEarnings.map((earning, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <span className="font-medium">{earning.activity}</span>
                                    <div className="text-xs text-gray-500">{earning.date}</div>
                                </div>
                                <span className="font-bold text-green-600">+{earning.coins} coins</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Earning Opportunities */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:col-span-2">
                    <h2 className="font-bold text-blue-800 mb-4">💡 Earning Opportunities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {userType === 'therapist' && (
                            <>
                                <div>📅 <strong>Complete bookings:</strong> +{COIN_CONFIG.THERAPIST_BOOKING_COMPLETION} coins each</div>
                                <div>⭐ <strong>Get 5-star ratings:</strong> +{COIN_CONFIG.THERAPIST_5_STAR_BONUS} coins each</div>
                                <div>⏰ <strong>Work 60+ hours/week:</strong> +{COIN_CONFIG.THERAPIST_WEEKLY_60_HOURS} coins weekly</div>
                                <div>🏆 <strong>Maintain excellence:</strong> +{COIN_CONFIG.THERAPIST_MONTHLY_PERFECT_RATING} coins monthly</div>
                            </>
                        )}
                        {userType === 'place' && (
                            <>
                                <div>📅 <strong>Host bookings:</strong> +{COIN_CONFIG.PLACE_BOOKING_COMPLETION} coins each</div>
                                <div>📈 <strong>High volume (20+/month):</strong> +{COIN_CONFIG.PLACE_MONTHLY_HIGH_VOLUME} coins</div>
                                <div>⭐ <strong>Maintain quality:</strong> +{COIN_CONFIG.PLACE_5_STAR_BONUS} coins monthly</div>
                            </>
                        )}
                        {(userType === 'hotel' || userType === 'villa') && (
                            <>
                                <div>🏨 <strong>Host bookings:</strong> +{COIN_CONFIG.HOTEL_GUEST_BOOKING} coins each</div>
                                <div>✅ <strong>Confirm commissions:</strong> +{COIN_CONFIG.HOTEL_COMMISSION_CONFIRMATION} coins each</div>
                                <div>📈 <strong>High volume bonus:</strong> +{COIN_CONFIG.HOTEL_MONTHLY_PARTNERSHIP} coins monthly</div>
                            </>
                        )}
                        <div>🎁 <strong>Weekend services:</strong> +{COIN_CONFIG.THERAPIST_WEEKEND_BONUS} bonus coins</div>
                        <div>🎯 <strong>Daily check-in:</strong> +{COIN_CONFIG.DAILY_CHECK_IN} coins daily</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderRewardsDashboard;