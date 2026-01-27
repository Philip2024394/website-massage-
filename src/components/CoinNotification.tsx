import React, { useState, useEffect } from 'react';
import ConfettiAnimation from './ConfettiAnimation';
import { useNotificationSounds } from '../hooks/useNotificationSounds';

interface CoinNotificationProps {
    isVisible: boolean;
    coinsEarned: number;
    reason: string;
    onClose: () => void;
    autoCloseDelay?: number;
    _userType?: 'customer' | 'therapist' | 'hotel' | 'villa';
}

const CoinNotification: React.FC<CoinNotificationProps> = ({
    isVisible,
    coinsEarned,
    reason,
    onClose,
    autoCloseDelay = 4000,
    _userType = 'customer'
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { playCoinSound, showNotificationWithSound } = useNotificationSounds();

    useEffect(() => {
        if (isVisible && coinsEarned > 0) {
            setShowConfetti(true);
            setIsAnimating(true);
            
            // Play coin sound
            playCoinSound(coinsEarned);
            
            // Show background notification for mobile/desktop
            showNotificationWithSound(
                getCelebrationTitle(coinsEarned),
                {
                    body: `You earned ${coinsEarned} coins for ${reason}`,
                    icon: '/icons/coins.png',
                    tag: 'coin-notification',
                    soundType: coinsEarned >= 100 ? 'achievement' : 'coin',
                    playSound: false // We already played the sound above
                }
            );
            
            // Auto close after delay
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isVisible, coinsEarned, autoCloseDelay, reason, playCoinSound, showNotificationWithSound]);

    const handleClose = () => {
        setIsAnimating(false);
        setShowConfetti(false);
        setTimeout(() => {
            onClose();
        }, 300); // Allow fade out animation
    };

    const getConfettiIntensity = (coins: number): 'low' | 'medium' | 'high' | 'explosive' => {
        if (coins >= 100) return 'explosive';
        if (coins >= 50) return 'high';
        if (coins >= 25) return 'medium';
        return 'low';
    };

    const getCelebrationTitle = (coins: number): string => {
        if (coins >= 100) return '🎉 Amazing Coin Reward!';
        if (coins >= 50) return '💰 Great Coin Reward!';
        if (coins >= 25) return '🪙 Nice Coin Reward!';
        return '✨ Coins Earned!';
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Confetti Animation */}
            <ConfettiAnimation
                isActive={showConfetti}
                intensity={getConfettiIntensity(coinsEarned)}
                duration={3000}
                onComplete={() => setShowConfetti(false)}
            />

            {/* Background Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
                    isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
                }`}
                onClick={handleClose}
            />

            {/* Notification Popup */}
            <div
                className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-300 ${
                    isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}
            >
                <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl transform transition-all duration-500 hover:scale-105">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-yellow-900 hover:text-yellow-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Coin Icon */}
                    <div className="text-center mb-6">
                        <div className="relative inline-block">
                            <div className="text-8xl animate-bounce">🪙</div>
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-2 py-1 text-sm font-bold animate-pulse">
                                +{coinsEarned}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-bold text-yellow-900 mb-2">
                            Coins Earned! 🎉
                        </h2>
                        <div className="text-2xl font-bold text-yellow-800">
                            +{coinsEarned} Coins
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="text-center mb-6">
                        <p className="text-yellow-800 font-medium text-lg">
                            {reason}
                        </p>
                    </div>

                    {/* Celebration Message */}
                    <div className="text-center mb-6">
                        <p className="text-yellow-900 text-sm">
                            {coinsEarned >= 100 ? "🚀 Incredible achievement!" :
                             coinsEarned >= 50 ? "🌟 Great job!" :
                             coinsEarned >= 25 ? "👏 Well done!" :
                             "💪 Keep it up!"}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                        <button
                            onClick={handleClose}
                            className="bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg"
                        >
                            Awesome! 🎊
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-2 left-4 text-yellow-600 animate-spin" style={{animationDuration: '3s'}}>⭐</div>
                    <div className="absolute bottom-4 left-2 text-yellow-600 animate-bounce">✨</div>
                    <div className="absolute top-6 right-8 text-yellow-600 animate-pulse">💎</div>
                    <div className="absolute bottom-2 right-6 text-yellow-600 animate-spin" style={{animationDuration: '3s'}}>🌟</div>
                </div>
            </div>
        </>
    );
};

export default CoinNotification;