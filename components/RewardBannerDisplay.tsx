import React, { useState, useEffect } from 'react';
import { rewardBannerService, RewardBannerData } from '../lib/rewardBannerService';

interface RewardBannerDisplayProps {
    className?: string;
}

const RewardBannerDisplay: React.FC<RewardBannerDisplayProps> = ({ className = '' }) => {
    const [currentBanner, setCurrentBanner] = useState<RewardBannerData | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [animatingCoins, setAnimatingCoins] = useState<Array<{ id: number; delay: number }>>([]);

    useEffect(() => {
        // Set up the display callback
        rewardBannerService.setDisplayCallback((banner: RewardBannerData) => {
            setCurrentBanner(banner);
            setIsVisible(true);
            
            // Create coin animation data
            const coinCount = Math.min(banner.coinAmount / 10, 10); // Max 10 coins visually
            const coins = Array.from({ length: coinCount }, (_, i) => ({
                id: i,
                delay: i * 100
            }));
            setAnimatingCoins(coins);

            // Auto-hide after 4 seconds
            setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    setCurrentBanner(null);
                    setAnimatingCoins([]);
                }, 300);
            }, 4000);
        });
    }, []);

    if (!currentBanner) return null;

    const getBannerGradient = (userType: string) => {
        switch (userType) {
            case 'therapist':
                return 'from-green-500 to-emerald-600';
            case 'place':
            case 'hotel':
            case 'villa':
            case 'admin':
                return 'from-blue-500 to-indigo-600';
            default:
                return 'from-orange-500 to-red-600';
        }
    };

    const getIconForRewardType = (type: string) => {
        switch (type) {
            case 'daily-signin':
                return '🌅';
            case 'booking-completion':
                return '✅';
            case 'milestone':
                return '🏆';
            case 'referral':
                return '🤝';
            default:
                return '🎉';
        }
    };

    return (
        <div className={`fixed inset-0 z-50 pointer-events-none ${className}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
                }`} 
            />
            
            {/* Banner Modal */}
            <div 
                className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
            >
                <div className={`relative bg-gradient-to-br ${getBannerGradient(currentBanner.userType)} rounded-3xl shadow-2xl p-8 max-w-md w-full text-center text-white overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 text-6xl">💰</div>
                        <div className="absolute top-8 right-8 text-4xl">⭐</div>
                        <div className="absolute bottom-4 left-8 text-5xl">🎯</div>
                        <div className="absolute bottom-8 right-4 text-3xl">✨</div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Icon */}
                        <div className="text-6xl mb-4">
                            {getIconForRewardType(currentBanner.type)}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold mb-2">
                            {currentBanner.title}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-lg opacity-90 mb-6">
                            {currentBanner.subtitle}
                        </p>

                        {/* Coin Amount */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-4xl">🪙</span>
                            <span className="text-3xl font-bold">
                                +{currentBanner.coinAmount}
                            </span>
                        </div>

                        {/* Banner Number */}
                        <div className="text-sm opacity-75">
                            Reward #{currentBanner.bannerNumber}
                        </div>
                    </div>

                    {/* Animated Coins */}
                    <div className="absolute inset-0 pointer-events-none">
                        {animatingCoins.map((coin) => (
                            <div
                                key={coin.id}
                                className="absolute text-2xl animate-bounce"
                                style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 60 + 20}%`,
                                    animationDelay: `${coin.delay}ms`,
                                    animationDuration: '2s',
                                }}
                            >
                                🪙
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardBannerDisplay;