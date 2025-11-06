import React, { useState, useEffect } from 'react';
import { ArrowLeft, Badge, Clock, Star, Zap, Menu } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

interface PlaceDiscountBadgePageProps {
    onBack: () => void;
    placeId: number;
    placeName: string;
    t: any;
    onNavigateToNotifications?: () => void;
    unreadNotificationsCount?: number;
}

interface DiscountBadge {
    id: string;
    percentage: number;
    duration: number; // hours
    isActive: boolean;
    activatedAt?: Date;
    expiresAt?: Date;
}

const PlaceDiscountBadgePage: React.FC<PlaceDiscountBadgePageProps> = ({ 
    onBack, 
    placeId, 
    placeName,
    onNavigateToNotifications,
    unreadNotificationsCount = 0
}) => {
    const [activeBadges, setActiveBadges] = useState<DiscountBadge[]>([]);
    const [selectedBadge, setSelectedBadge] = useState<{percentage: number, duration: number} | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);

    // Available discount options
    const discountOptions = [
        { percentage: 5, color: 'from-blue-400 to-blue-600', borderColor: 'border-blue-500' },
        { percentage: 10, color: 'from-green-400 to-green-600', borderColor: 'border-green-500' },
        { percentage: 15, color: 'from-orange-400 to-orange-600', borderColor: 'border-orange-500' },
        { percentage: 20, color: 'from-red-400 to-red-600', borderColor: 'border-red-500' }
    ];

    // Available duration options (in hours)
    const durationOptions = [1, 2, 4, 6, 8, 12, 24];

    useEffect(() => {
        // Load existing active badges from localStorage or API
        const savedBadges = localStorage.getItem(`place_discount_badges_${placeId}`);
        if (savedBadges) {
            const badges = JSON.parse(savedBadges).map((badge: any) => ({
                ...badge,
                activatedAt: badge.activatedAt ? new Date(badge.activatedAt) : undefined,
                expiresAt: badge.expiresAt ? new Date(badge.expiresAt) : undefined
            }));
            
            // Filter out expired badges
            const activeBadges = badges.filter((badge: DiscountBadge) => 
                badge.isActive && (!badge.expiresAt || badge.expiresAt > new Date())
            );
            
            setActiveBadges(activeBadges);
        }
    }, [placeId]);

    const handleActivateBadge = (percentage: number, duration: number) => {
        setSelectedBadge({ percentage, duration });
        setShowConfirmModal(true);
    };

    const confirmActivation = () => {
        if (!selectedBadge) return;

        const now = new Date();
        const expiresAt = new Date(now.getTime() + selectedBadge.duration * 60 * 60 * 1000);
        
        const newBadge: DiscountBadge = {
            id: `${selectedBadge.percentage}_${Date.now()}`,
            percentage: selectedBadge.percentage,
            duration: selectedBadge.duration,
            isActive: true,
            activatedAt: now,
            expiresAt: expiresAt
        };

        const updatedBadges = [...activeBadges, newBadge];
        setActiveBadges(updatedBadges);

        // Save to localStorage (in a real app, this would be saved to your backend)
        localStorage.setItem(`place_discount_badges_${placeId}`, JSON.stringify(updatedBadges));

        setShowConfirmModal(false);
        setSelectedBadge(null);

        // Show success notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3">
                <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <span class="font-medium">🎯 ${selectedBadge.percentage}% discount badge activated for ${selectedBadge.duration} hours!</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    };

    const handleDeactivateBadge = (badgeId: string) => {
        const updatedBadges = activeBadges.filter(badge => badge.id !== badgeId);
        setActiveBadges(updatedBadges);
        localStorage.setItem(`place_discount_badges_${placeId}`, JSON.stringify(updatedBadges));
    };

    const formatTimeRemaining = (expiresAt: Date) => {
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m remaining`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m remaining`;
        } else {
            return 'Expiring soon';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Burger Menu */}
            <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        {onNavigateToNotifications && (
                            <NotificationBell count={unreadNotificationsCount} onClick={onNavigateToNotifications} />
                        )}
                        <button
                            onClick={() => setIsSideDrawerOpen(true)}
                            className="p-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-orange-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isSideDrawerOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSideDrawerOpen(false)}
                    />
                    
                    {/* Drawer */}
                    <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-orange-400">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setIsSideDrawerOpen(false)}
                                    className="p-2 text-white hover:bg-orange-600 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Drawer Content */}
                        <div className="p-6">
                            <div className="space-y-1">
                                <button
                                    onClick={() => {
                                        setIsSideDrawerOpen(false);
                                        onBack();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-lg transition-colors text-left"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="p-6 space-y-6 max-w-4xl mx-auto">
                {/* Page Title */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="w-8 h-8 text-orange-500" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Discount Badge Manager</h1>
                            <p className="text-sm text-gray-600">{placeName}</p>
                        </div>
                    </div>
                </div>

                {/* Active Badges */}
                {activeBadges.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-green-500" />
                            Active Discount Badges
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                            {activeBadges.map((badge) => {
                                const discountOption = discountOptions.find(opt => opt.percentage === badge.percentage);
                                return (
                                    <div key={badge.id} className={`bg-gradient-to-r ${discountOption?.color} rounded-lg p-4 text-white relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-8 translate-x-8"></div>
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-bold">{badge.percentage}% OFF</span>
                                                <Star className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4" />
                                                {badge.expiresAt && formatTimeRemaining(badge.expiresAt)}
                                            </div>
                                            <button
                                                onClick={() => handleDeactivateBadge(badge.id)}
                                                className="mt-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-medium hover:bg-white/30 transition-colors"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Discount Badge Options */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Activate New Discount Badge</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Choose a discount percentage and duration. The badge will appear on your massage place card and attract more customers.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20 mb-6">
                        {discountOptions.map((option) => (
                            <div key={option.percentage} className="space-y-3">
                                <div className={`bg-gradient-to-r ${option.color} rounded-lg p-4 text-white text-center cursor-pointer transition-transform hover:scale-105`}>
                                    <div className="text-2xl font-bold">{option.percentage}%</div>
                                    <div className="text-sm">OFF</div>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Duration:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {durationOptions.map((duration) => (
                                            <button
                                                key={duration}
                                                onClick={() => handleActivateBadge(option.percentage, duration)}
                                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all hover:scale-105 ${option.borderColor} text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center justify-center`}
                                                disabled={activeBadges.some(badge => badge.percentage === option.percentage && badge.isActive)}
                                            >
                                                {duration}h
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 pb-20">
                        <h3 className="font-semibold text-orange-900 mb-2">💡 Tips for Maximum Impact:</h3>
                        <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Activate badges during peak hours (evening/weekend) for better visibility</li>
                            <li>• Higher percentages attract more bookings but reduce profit margins</li>
                            <li>• Use shorter durations for flash sales, longer for sustained promotion</li>
                            <li>• Monitor booking increases to optimize your discount strategy</li>
                        </ul>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">How Discount Badges Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Badge className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">1. Activate Badge</h3>
                            <p className="text-sm text-gray-600 mt-1">Choose discount percentage and duration</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">2. Increased Visibility</h3>
                            <p className="text-sm text-gray-600 mt-1">Your place appears higher in search results</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">3. More Bookings</h3>
                            <p className="text-sm text-gray-600 mt-1">Attract customers with attractive discounts</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && selectedBadge && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">Confirm Discount Badge Activation</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className={`bg-gradient-to-r ${discountOptions.find(opt => opt.percentage === selectedBadge.percentage)?.color} rounded-lg p-4 text-white inline-block mb-4`}>
                                    <div className="text-3xl font-bold">{selectedBadge.percentage}% OFF</div>
                                </div>
                                <p className="text-gray-600">
                                    This discount badge will be active for <strong>{selectedBadge.duration} hours</strong> and will appear on your massage place card.
                                </p>
                            </div>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 pb-20 mb-6">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Once activated, the badge cannot be modified. You can deactivate it early if needed.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmActivation}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-md transition-all"
                            >
                                Activate Badge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaceDiscountBadgePage;

