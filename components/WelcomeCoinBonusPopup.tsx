import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeCoinBonusPopupProps {
    isOpen: boolean;
    onClose: () => void;
    coinsAwarded: number;
    userName?: string;
}

/**
 * Welcome Bonus Popup for New Users
 * Displays congratulations message with coin bonus details
 * Auto-detects device/IP to prevent duplicate claims
 */
export const WelcomeCoinBonusPopup: React.FC<WelcomeCoinBonusPopupProps> = ({
    isOpen,
    onClose,
    coinsAwarded,
    userName
}) => {
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
        if (isOpen) {
            // Trigger animations in sequence
            const timer1 = setTimeout(() => setAnimationPhase(1), 500);
            const timer2 = setTimeout(() => setAnimationPhase(2), 1000);
            const timer3 = setTimeout(() => setAnimationPhase(3), 1500);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 100, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
                    className="relative bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Confetti Background Effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ 
                                    y: 600, 
                                    opacity: [0, 1, 1, 0],
                                    x: Math.random() * 400 - 200
                                }}
                                transition={{ 
                                    duration: Math.random() * 2 + 2,
                                    delay: Math.random() * 0.5,
                                    repeat: Infinity
                                }}
                                className="absolute text-2xl"
                                style={{ left: `${Math.random() * 100}%` }}
                            >
                                {['🎉', '🎊', '⭐', '💫', '🪙'][Math.floor(Math.random() * 5)]}
                            </motion.div>
                        ))}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="relative z-10 p-8">
                        {/* Animated Trophy/Gift Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                            className="text-center mb-6"
                        >
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl mb-4">
                                <span className="text-6xl">🎁</span>
                            </div>
                        </motion.div>

                        {/* Congratulations Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center mb-6"
                        >
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                🎊 Congratulations{userName ? `, ${userName}` : ''}! 🎊
                            </h1>
                            <p className="text-gray-700 text-lg font-medium">
                                Welcome to IndaStreet Massage Directory!
                            </p>
                        </motion.div>

                        {/* Coin Award Display */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: animationPhase >= 1 ? 1 : 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6 border-2 border-orange-300 shadow-lg"
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-4xl">🪙</span>
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ 
                                            opacity: animationPhase >= 2 ? 1 : 0,
                                            scale: animationPhase >= 2 ? 1 : 0
                                        }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                                    >
                                        {coinsAwarded}
                                    </motion.span>
                                    <span className="text-4xl">🪙</span>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: animationPhase >= 2 ? 1 : 0 }}
                                    className="text-orange-800 font-semibold text-lg"
                                >
                                    IndaStreet Coins Awarded!
                                </motion.p>
                            </div>
                        </motion.div>

                        {/* Benefits List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: animationPhase >= 3 ? 1 : 0, y: animationPhase >= 3 ? 0 : 20 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3 mb-6"
                        >
                            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                                <span className="text-2xl flex-shrink-0">💰</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Use for Discounts</h3>
                                    <p className="text-gray-600 text-xs">
                                        Redeem your coins for discounts on massage bookings
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                                <span className="text-2xl flex-shrink-0">🎯</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Earn More Coins</h3>
                                    <p className="text-gray-600 text-xs">
                                        Get 5 coins for every completed booking
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                                <span className="text-2xl flex-shrink-0">👛</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Check Your Dashboard</h3>
                                    <p className="text-gray-600 text-xs">
                                        View all your coins and rewards in your dashboard
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Expiry Notice */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: animationPhase >= 3 ? 1 : 0 }}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6"
                        >
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-orange-800 text-xs font-medium">
                                        <strong>Important:</strong> Use your welcome bonus within 30 days!
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <span>Go to Dashboard</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </motion.button>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center text-gray-500 text-xs mt-4"
                        >
                            Your coins are waiting in your dashboard! 🎉
                        </motion.p>
                    </div>

                    {/* Bottom Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeCoinBonusPopup;
