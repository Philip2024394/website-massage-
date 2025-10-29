import { motion, AnimatePresence } from 'framer-motion';

interface CoinWelcomePopupProps {
    isOpen: boolean;
    onClose: () => void;
    customerName?: string;
}

export const CoinWelcomePopup = ({ isOpen, onClose, customerName }: CoinWelcomePopupProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-30 -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full blur-3xl opacity-30 -z-10"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="text-7xl mb-4"
                            >
                                🎁
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                                Welcome{customerName ? `, ${customerName}` : ''}!
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Introducing IndaStreet Loyalty Coins
                            </p>
                        </div>

                        {/* How It Works */}
                        <div className="space-y-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4"
                            >
                                <div className="text-3xl flex-shrink-0">🪙</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Earn Coins</h3>
                                    <p className="text-gray-600 text-sm">
                                        Get 5 coins for every completed booking with your favorite therapists and places
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-start gap-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4"
                            >
                                <div className="text-3xl flex-shrink-0">💎</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Unlock Rewards</h3>
                                    <p className="text-gray-600 text-sm">
                                        After just 3 visits, unlock 5% discount. Keep booking to unlock up to 20% off!
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4"
                            >
                                <div className="text-3xl flex-shrink-0">👛</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Your Wallet</h3>
                                    <p className="text-gray-600 text-sm">
                                        Track all your coins from different providers in one place. Each has unique benefits!
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex items-start gap-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4"
                            >
                                <div className="text-3xl flex-shrink-0">🔥</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Bonus Streaks</h3>
                                    <p className="text-gray-600 text-sm">
                                        Book within 7 days to build streaks and earn extra bonus coins!
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Discount Tiers */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 text-center">Discount Tiers</h3>
                            <div className="grid grid-cols-4 gap-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center"
                                >
                                    <div className="bg-orange-100 rounded-lg p-2 mb-1">
                                        <div className="text-xl">🥉</div>
                                        <div className="text-xs font-semibold text-orange-700">Bronze</div>
                                    </div>
                                    <div className="text-xs text-gray-600">3 visits</div>
                                    <div className="text-sm font-bold text-orange-600">5% off</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-center"
                                >
                                    <div className="bg-gray-200 rounded-lg p-2 mb-1">
                                        <div className="text-xl">🥈</div>
                                        <div className="text-xs font-semibold text-gray-700">Silver</div>
                                    </div>
                                    <div className="text-xs text-gray-600">5 visits</div>
                                    <div className="text-sm font-bold text-gray-600">10% off</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 }}
                                    className="text-center"
                                >
                                    <div className="bg-yellow-100 rounded-lg p-2 mb-1">
                                        <div className="text-xl">🥇</div>
                                        <div className="text-xs font-semibold text-yellow-700">Gold</div>
                                    </div>
                                    <div className="text-xs text-gray-600">10 visits</div>
                                    <div className="text-sm font-bold text-yellow-600">15% off</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1 }}
                                    className="text-center"
                                >
                                    <div className="bg-purple-100 rounded-lg p-2 mb-1">
                                        <div className="text-xl">👑</div>
                                        <div className="text-xs font-semibold text-purple-700">Platinum</div>
                                    </div>
                                    <div className="text-xs text-gray-600">20 visits</div>
                                    <div className="text-sm font-bold text-purple-600">20% off</div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-shadow"
                        >
                            Start Earning Coins! 🚀
                        </motion.button>

                        <p className="text-center text-gray-500 text-xs mt-3">
                            Book your first massage to start earning rewards
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
