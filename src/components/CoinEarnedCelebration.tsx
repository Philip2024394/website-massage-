import { useEffect, useState } from 'react';
import { LoyaltyEarnedEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinEarnedCelebrationProps {
    event: LoyaltyEarnedEvent | null;
    onClose: () => void;
}

export const CoinEarnedCelebration = ({ event, onClose }: CoinEarnedCelebrationProps) => {
    const [coins, setCoins] = useState<Array<{ id: number; x: number; delay: number }>>([]);

    useEffect(() => {
        if (event) {
            // Generate falling coins
            const coinArray = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100, // Random horizontal position (0-100%)
                delay: Math.random() * 0.5, // Random delay (0-0.5s)
            }));
            setCoins(coinArray);

            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [event, onClose]);

    if (!event) return null;

    const tierMessages = [
        '',
        '🎉 Bronze Tier Unlocked!',
        '🌟 Silver Tier Unlocked!',
        '💎 Gold Tier Unlocked!',
        '👑 Platinum Tier Unlocked!'
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Falling Coins Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {coins.map((coin) => (
                        <motion.div
                            key={coin.id}
                            initial={{ y: -50, x: `${coin.x}%`, opacity: 1 }}
                            animate={{ 
                                y: '100vh', 
                                rotate: 360 * 3,
                                opacity: [1, 1, 0.5, 0]
                            }}
                            transition={{ 
                                duration: 3, 
                                delay: coin.delay,
                                ease: 'easeIn'
                            }}
                            className="absolute text-4xl"
                        >
                            🪙
                        </motion.div>
                    ))}
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ scale: 0.5, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-orange-200 to-orange-300 rounded-3xl opacity-20 blur-xl"></div>

                    <div className="relative z-10">
                        {/* Success Header */}
                        <div className="text-center mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-7xl mb-4"
                            >
                                🎊
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                Booking Confirmed!
                            </h2>
                        </div>

                        {/* Coins Earned */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                            className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-2xl p-6 mb-6 text-center shadow-lg"
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-5xl">🪙</span>
                                <motion.span
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-5xl font-bold text-white"
                                >
                                    +{event.coinsEarned}
                                </motion.span>
                            </div>
                            <p className="text-white text-lg font-semibold">
                                {event.providerCoinId} Earned!
                            </p>
                            {event.streakCount && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-2 flex items-center justify-center gap-1 text-white"
                                >
                                    <span className="text-xl">🔥</span>
                                    <span className="font-semibold">{event.streakCount} Booking Streak!</span>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Tier Unlocked */}
                        {event.tierUnlocked && event.discountUnlocked && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-center"
                            >
                                <div className="text-3xl mb-2">
                                    🎉 New Tier Unlocked!
                                </div>
                                <p className="text-white text-xl font-bold">
                                    Discount Available!
                                </p>
                                <p className="text-white text-sm mt-1">
                                    Your next booking will be discounted
                                </p>
                            </motion.div>
                        )}

                        {/* Provider Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-gray-600 text-sm mb-1">From</p>
                            <p className="text-gray-900 font-semibold text-lg">{event.providerName}</p>
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <div>
                                    <p className="text-gray-500">Total Coins</p>
                                    <p className="text-orange-600 font-bold text-lg">{event.totalCoins} 🪙</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total Visits</p>
                                    <p className="text-orange-600 font-bold text-lg">{event.totalVisits}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress to Next Tier */}
                        {!event.tierUnlocked && event.totalVisits < 20 && (
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Next Reward</span>
                                    <span className="text-gray-900 font-semibold">
                                        {event.totalVisits < 3 && `${3 - event.totalVisits} more visit${3 - event.totalVisits !== 1 ? 's' : ''}`}
                                        {event.totalVisits >= 3 && event.totalVisits < 5 && `${5 - event.totalVisits} more visit${5 - event.totalVisits !== 1 ? 's' : ''}`}
                                        {event.totalVisits >= 5 && event.totalVisits < 10 && `${10 - event.totalVisits} more visits`}
                                        {event.totalVisits >= 10 && event.totalVisits < 20 && `${20 - event.totalVisits} more visits`}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ 
                                            width: `${
                                                event.totalVisits < 3 ? (event.totalVisits / 3) * 100 :
                                                event.totalVisits < 5 ? ((event.totalVisits - 3) / 2) * 100 :
                                                event.totalVisits < 10 ? ((event.totalVisits - 5) / 5) * 100 :
                                                ((event.totalVisits - 10) / 10) * 100
                                            }%`
                                        }}
                                        transition={{ delay: 1.2, duration: 1 }}
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-shadow"
                        >
                            Awesome! 🎉
                        </motion.button>

                        <p className="text-center text-gray-500 text-xs mt-3">
                            Auto-closing in 5 seconds...
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
