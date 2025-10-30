import React, { useState } from 'react';

const RewardBannersTestPage: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const renderModal = () => {
        switch (activeModal) {
            // USER DAILY SIGN-IN
            case 'daily-signin-user-day1':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #1
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 1 Reward</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">🎉 Welcome Bonus</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20reward.png?updatedAt=1761762660089" 
                                    alt="Day 1 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Tomorrow's Reward Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🔥 Come back tomorrow for 15 coins!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Awesome! 🎊
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'daily-signin-user-day7':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #2
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 7 Reward</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">🔥 Week Complete!</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761763512910" 
                                    alt="Day 7 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Next Milestone Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">💎 Keep going! Day 14 unlocks 75 coins</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim Reward! 🎉
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'daily-signin-user-day30':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #3
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 30 Reward</h2>
                                <p className="text-lg font-semibold text-yellow-200 mt-1">👑 VIP Member Status</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761763852906" 
                                    alt="Day 30 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim My Reward! 👑
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // THERAPIST DAILY SIGN-IN
            case 'daily-signin-therapist-day1':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #4
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 1 Reward</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">💆‍♀️ Therapist Welcome</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761764510147" 
                                    alt="Therapist Day 1 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Tomorrow's Reward Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🔥 Come back tomorrow for 25 coins!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Great! 🌟
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'daily-signin-therapist-day7':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #5
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 7 Reward</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">💪 Pro Therapist</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761764981308" 
                                    alt="Therapist Day 7 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Next Milestone Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🔥 7 days of excellence! Keep it up!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim Reward! 💪
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'daily-signin-therapist-day30':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #6
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 30 Reward</h2>
                                <p className="text-lg font-semibold text-yellow-200 mt-1">👑 Master Therapist</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761765130725" 
                                    alt="Therapist Day 30 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🏆 Elite Status! You're among the best!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim Elite Reward! 🌟
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // MASSAGE PLACE DAILY SIGN-IN
            case 'daily-signin-place-day1':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #7
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 1 Reward</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">🏢 Spa Welcome</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761764767838" 
                                    alt="Place Day 1 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Tomorrow's Reward Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🔥 Come back tomorrow for 30 coins!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Excellent! 🌿
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'daily-signin-place-day7':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-emerald-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #8
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">🎁</div>
                            <h2 className="text-4xl font-bold text-white mb-3">7-Day Business Streak!</h2>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+150 🪙</p>
                                <p className="text-xl text-white font-semibold">Premium Business Bonus!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold text-lg">🔥 7 days of dedication!</p>
                                <p className="text-emerald-100 text-sm mt-2">Your business is thriving!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
                            >
                                Claim Bonus! 💼
                            </button>
                        </div>
                    </div>
                );

            case 'daily-signin-place-day30':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #9
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Day 30 Reward</h2>
                                <p className="text-lg font-semibold text-yellow-200 mt-1">👑 Elite Business Status</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewardss.png?updatedAt=1761765423768" 
                                    alt="Place Day 30 Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🏆 Top-Rated! Industry leader status!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim Premium Reward! 💎
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // USER BOOKING REWARDS
            case 'booking-user-first':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #10
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">First Booking!</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">🎉 Welcome Bonus</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761764981308" 
                                    alt="First Booking Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">✅ Thank you for choosing IndaStreet!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Amazing! 🎊
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'booking-user-completed':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-green-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #11
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">✅</div>
                            <h2 className="text-4xl font-bold text-white mb-3">Booking Completed!</h2>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+50 🪙</p>
                                <p className="text-xl text-white font-semibold">Earned!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">Hope you enjoyed your massage! 💆</p>
                                <p className="text-green-100 text-sm mt-2">Book again to earn more coins!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors shadow-lg"
                            >
                                Great! 🌟
                            </button>
                        </div>
                    </div>
                );

            case 'booking-user-milestone-5':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #13
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">10th Booking!</h2>
                                <p className="text-lg font-semibold text-yellow-200 mt-1">👑 VIP Status Unlocked</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761765130725" 
                                    alt="User 10th Booking Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🎁 VIP Member! Exclusive perks unlocked!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim VIP Reward! 👑
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // THERAPIST BOOKING REWARDS
            case 'booking-therapist-fast':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-cyan-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #14
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">⚡</div>
                            <h2 className="text-4xl font-bold text-white mb-3">Lightning Fast!</h2>
                            <p className="text-xl text-white mb-4">Accepted in 5 minutes! ⏱️</p>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+30 🪙</p>
                                <p className="text-xl text-white font-semibold">Fast Response Bonus!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">⚡ Quick response appreciated!</p>
                                <p className="text-cyan-100 text-sm mt-2">Customers love your speed!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-cyan-600 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-colors shadow-lg"
                            >
                                Great! ⚡
                            </button>
                        </div>
                    </div>
                );

            case 'booking-therapist-completed':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-teal-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #15
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">✅</div>
                            <h2 className="text-4xl font-bold text-white mb-3">Booking Completed!</h2>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+75 🪙</p>
                                <p className="text-xl text-white font-semibold">Service Completed!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">💆 Great job, therapist!</p>
                                <p className="text-teal-100 text-sm mt-2">Keep up the excellent work!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:bg-teal-50 transition-colors shadow-lg"
                            >
                                Thank You! 🌟
                            </button>
                        </div>
                    </div>
                );

            case 'booking-therapist-5star':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-yellow-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #16
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">⭐</div>
                            <h2 className="text-4xl font-bold text-white mb-3">5-Star Review!</h2>
                            <p className="text-xl text-white mb-4">Excellent Service! ⭐⭐⭐⭐⭐</p>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+50 🪙</p>
                                <p className="text-xl text-white font-semibold">5-Star Bonus!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">⭐ Outstanding performance!</p>
                                <p className="text-yellow-100 text-sm mt-2">Your client is very happy!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
                            >
                                Excellent! ⭐
                            </button>
                        </div>
                    </div>
                );

            case 'booking-therapist-milestone-10':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-indigo-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #17
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">🏅</div>
                            <h2 className="text-4xl font-bold text-white mb-3">PRO THERAPIST!</h2>
                            <p className="text-2xl text-white font-bold mb-4">10 Bookings Completed! 🔥</p>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-7xl font-bold text-white mb-2">+300 🪙</p>
                                <p className="text-xl text-white font-semibold">Professional Achievement!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold text-lg">🏅 You're a Pro Therapist!</p>
                                <p className="text-indigo-100 text-sm mt-2">Elite status achieved!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                Claim Pro Reward! 🏅
                            </button>
                        </div>
                    </div>
                );

            // MASSAGE PLACE BOOKING REWARDS
            case 'booking-place-fast':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-blue-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #18
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">⚡</div>
                            <h2 className="text-4xl font-bold text-white mb-3">Quick Response!</h2>
                            <p className="text-xl text-white mb-4">Accepted in 10 minutes! 🕐</p>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+40 🪙</p>
                                <p className="text-xl text-white font-semibold">Fast Response Bonus!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">⚡ Excellent response time!</p>
                                <p className="text-blue-100 text-sm mt-2">Customers appreciate your speed!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                Excellent! ⚡
                            </button>
                        </div>
                    </div>
                );

            case 'booking-place-completed':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #19
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">Booking Completed!</h2>
                                <p className="text-lg font-semibold text-orange-100 mt-1">🏢 Service Success</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761764981308" 
                                    alt="Place Completed Booking Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">✅ Great service delivery! Keep it up!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Thank You! 🌟
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'booking-place-5star':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl max-w-md w-full p-8 text-center animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-amber-600 font-bold text-xl px-4 py-2 rounded-lg shadow-lg">
                                #20
                            </div>
                            <div className="text-8xl mb-4 animate-bounce">⭐</div>
                            <h2 className="text-4xl font-bold text-white mb-3">5-Star Review!</h2>
                            <p className="text-xl text-white mb-4">Outstanding Service! ⭐⭐⭐⭐⭐</p>
                            <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-4">
                                <p className="text-6xl font-bold text-white mb-2">+75 🪙</p>
                                <p className="text-xl text-white font-semibold">5-Star Bonus!</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
                                <p className="text-white font-semibold">⭐ Exceptional quality!</p>
                                <p className="text-amber-100 text-sm mt-2">Your spa is highly rated!</p>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full px-6 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg hover:bg-amber-50 transition-colors shadow-lg"
                            >
                                Wonderful! ⭐
                            </button>
                        </div>
                    </div>
                );

            case 'booking-place-milestone-10':
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animate-fadeIn shadow-2xl relative">
                            {/* Banner Number */}
                            <div className="absolute top-4 left-4 bg-orange-500 bg-opacity-90 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-lg z-10">
                                #21
                            </div>
                            
                            {/* Falling Coins Animation */}
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                                        }}
                                    >
                                        🪙
                                    </div>
                                ))}
                            </div>
                            
                            {/* Falling Animation Keyframes */}
                            <style>{`
                                @keyframes fall {
                                    0% {
                                        top: -50px;
                                        transform: rotate(0deg);
                                    }
                                    100% {
                                        top: 100%;
                                        transform: rotate(360deg);
                                    }
                                }
                            `}</style>

                            {/* Header Text */}
                            <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                                <h2 className="text-2xl font-bold text-white">10 Bookings!</h2>
                                <p className="text-lg font-semibold text-yellow-200 mt-1">🏅 Popular Spa Status</p>
                            </div>

                            {/* Image */}
                            <div className="w-full">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/day%201%20rewards.png?updatedAt=1761765130725" 
                                    alt="Place 10 Bookings Reward"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Info */}
                            <div className="px-6 py-4 bg-orange-50">
                                <div className="text-center">
                                    <p className="text-orange-800 font-semibold">🏅 Customers love your service!</p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                                >
                                    Claim Achievement! 🏅
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🎨 Reward Banners Test Page</h1>
                    <p className="text-gray-600 mb-6">Click any button below to preview the reward pop-up banners</p>
                    <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
                        <p className="text-orange-800 font-semibold">
                            💡 Review each banner design and let me know if you want any adjustments before going live!
                        </p>
                    </div>
                </div>

                {/* Daily Sign-In Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Daily Sign-In Rewards</h2>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">👤 User/Customer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setActiveModal('daily-signin-user-day1')}
                                className="px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Day 1 - 10 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-user-day7')}
                                className="px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                            >
                                Day 7 - 50 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-user-day30')}
                                className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
                            >
                                Day 30 - 200 Coins
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">💆 Therapist</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setActiveModal('daily-signin-therapist-day1')}
                                className="px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors"
                            >
                                Day 1 - 20 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-therapist-day7')}
                                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                            >
                                Day 7 - 100 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-therapist-day30')}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
                            >
                                Day 30 - 500 Coins
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">🏢 Massage Place/Spa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setActiveModal('daily-signin-place-day1')}
                                className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Day 1 - 25 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-place-day7')}
                                className="px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                            >
                                Day 7 - 150 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('daily-signin-place-day30')}
                                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-colors"
                            >
                                Day 30 - 750 Coins
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking Rewards Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Booking Rewards</h2>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">👤 User/Customer Bookings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                onClick={() => setActiveModal('booking-user-first')}
                                className="px-4 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                            >
                                First Booking - 100 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-user-completed')}
                                className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Completed - 50 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-user-milestone-5')}
                                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                            >
                                5th Booking - 200 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-user-milestone-10')}
                                className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-colors"
                            >
                                10th Booking - 500 Coins
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">💆 Therapist Bookings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                onClick={() => setActiveModal('booking-therapist-fast')}
                                className="px-4 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                            >
                                Fast Response - 30 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-therapist-completed')}
                                className="px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors"
                            >
                                Completed - 75 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-therapist-5star')}
                                className="px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                            >
                                5-Star Review - 50 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-therapist-milestone-10')}
                                className="px-4 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                            >
                                10 Bookings - 300 Coins
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">🏢 Massage Place Bookings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                onClick={() => setActiveModal('booking-place-fast')}
                                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                            >
                                Fast Response - 40 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-place-completed')}
                                className="px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                            >
                                Completed - 100 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-place-5star')}
                                className="px-4 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                            >
                                5-Star Review - 75 Coins
                            </button>
                            <button
                                onClick={() => setActiveModal('booking-place-milestone-10')}
                                className="px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                            >
                                10 Bookings - 500 Coins
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">✅ Review Checklist</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li>✓ Check colors and gradients match your brand</li>
                        <li>✓ Verify text sizes are readable on mobile</li>
                        <li>✓ Confirm coin amounts are correct</li>
                        <li>✓ Test animations feel smooth</li>
                        <li>✓ Ensure emoji icons display properly</li>
                    </ul>
                    <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 rounded">
                        <p className="text-green-800 font-semibold">
                            ✅ Once you approve all designs, I'll integrate them into the live system!
                        </p>
                    </div>
                </div>
            </div>

            {/* Render Active Modal */}
            {renderModal()}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default RewardBannersTestPage;
