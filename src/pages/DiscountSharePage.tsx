// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, Clock, AlertCircle, Zap, Power, Timer } from 'lucide-react';
import Button from '../components/Button';
import { activateDiscount, deactivateDiscount, getActiveDiscountByProvider } from '../lib/discountService';

interface DiscountSharePageProps {
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
}

interface DiscountCard {
    id: string;
    percentage: number;
    imageUrl: string;
    color: string;
    theme: string;
}

interface ActiveDiscount {
    percentage: number;
    expiresAt: Date;
    isActive: boolean;
    duration: number;
}

const DISCOUNT_CARDS: DiscountCard[] = [
    {
        id: '5-percent',
        percentage: 5,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532',
        color: 'from-orange-400 to-orange-600',
        theme: 'orange'
    },
    {
        id: '10-percent',
        percentage: 10,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896',
        color: 'from-orange-500 to-orange-700',
        theme: 'orange'
    },
    {
        id: '15-percent',
        percentage: 15,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221',
        color: 'from-orange-600 to-orange-800',
        theme: 'orange'
    },
    {
        id: '20-percent',
        percentage: 20,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034',
        color: 'from-orange-700 to-red-600',
        theme: 'orange'
    }
];

const DURATION_OPTIONS = [
    { label: '4 Hours', hours: 4 },
    { label: '8 Hours', hours: 8 },
    { label: '12 Hours', hours: 12 },
    { label: '24 Hours', hours: 24 }
];

// Countdown Timer Component
const CountdownTimer: React.FC<{ expiresAt: Date }> = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiresAt.getTime() - now;

            if (distance < 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <div className="flex items-center gap-2 text-orange-600 font-bold">
            <Clock size={20} className="animate-pulse" />
            <span>{timeLeft}</span>
        </div>
    );
};

const DiscountSharePage: React.FC<DiscountSharePageProps> = ({
    providerId,
    providerName,
    providerType,
}) => {
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountCard | null>(null);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(8); // Default 8 hours
    const [activeDiscount, setActiveDiscount] = useState<ActiveDiscount | null>(null);
    const [copied, setCopied] = useState(false);
    const [activating, setActivating] = useState(false);
    const [shareStats, setShareStats] = useState({
        totalShares: 0,
        chatsSent: 0,
        socialShares: 0,
        activations: 0
    });
    const [loading, setLoading] = useState(true);

    // Load existing active discount on mount
    useEffect(() => {
        const loadActiveDiscount = async () => {
            try {
                const existing = await getActiveDiscountByProvider(providerId, providerType);
                if (existing) {
                    setActiveDiscount({
                        percentage: existing.percentage,
                        expiresAt: new Date(existing.expiresAt),
                        isActive: true,
                        duration: existing.duration
                    });
                }
            } catch (error) {
                console.error('Error loading active discount:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActiveDiscount();
    }, [providerId, providerType]);

    // Check if discount is expired
    useEffect(() => {
        if (activeDiscount && new Date() > activeDiscount.expiresAt) {
            setActiveDiscount(null);
        }
    }, [activeDiscount]);

    // Generate shareable link
    const getShareableLink = (discount: DiscountCard) => {
        const baseUrl = window.location.origin;
        const profilePath = providerType === 'therapist' ? 'therapist' : 'place';
        return `${baseUrl}/#/${profilePath}/${providerId}?discount=${discount.percentage}`;
    };

    // Generate share text
    const getShareText = (discount: DiscountCard) => {
        return `🎉 Special Offer! Get ${discount.percentage}% OFF your next massage at ${providerName}! 💆‍♀️\n\nBook now and save! Limited time offer.\n\n👉 ${getShareableLink(discount)}`;
    };

    // Activate discount badge and prepare for sharing
    const handleActivateDiscount = async () => {
        if (!selectedDiscount) return;

        setActivating(true);
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + selectedDuration);

            // Save to Appwrite database for live badge display
            await activateDiscount(
                providerId,
                providerName,
                providerType,
                selectedDiscount.percentage,
                selectedDuration,
                selectedDiscount.imageUrl,
                '', // location - will be populated by query
                0,  // rating - will be populated by query
                ''  // profilePicture - will be populated by query
            );

            // Set local state for both live display and sharing
            setActiveDiscount({
                percentage: selectedDiscount.percentage,
                expiresAt,
                isActive: true,
                duration: selectedDuration
            });

            setShareStats(prev => ({ ...prev, activations: prev.activations + 1 }));
            setShowActivateModal(false);
            
            alert(`✅ ${selectedDiscount.percentage}% discount is now LIVE!\n\n� Badge appears on your profile card\n📱 Ready for WhatsApp & social media sharing!`);
        } catch (err) {
            console.error('Failed to activate discount:', err);
            alert('Failed to activate discount. Please try again.');
        } finally {
            setActivating(false);
        }
    };

    // Deactivate live discount and stop sharing
    const handleDeactivateDiscount = async () => {
        if (!activeDiscount) return;

        if (confirm('Are you sure you want to deactivate this discount? This will remove the badge from your profile card and stop sharing.')) {
            try {
                // Remove from database (live badge)
                const existing = await getActiveDiscountByProvider(providerId, providerType);
                if (existing && existing.$id) {
                    await deactivateDiscount(existing.$id);
                }
                
                setActiveDiscount(null);
                alert('✅ Discount deactivated! Badge removed from profile card.');
            } catch (err) {
                console.error('Failed to deactivate discount:', err);
                alert('Failed to deactivate discount. Please try again.');
            }
        }
    };

    // Copy link
    const handleCopyLink = async (discount: DiscountCard) => {
        const link = getShareableLink(discount);
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Share to WhatsApp
    const handleWhatsAppShare = (discount: DiscountCard) => {
        const text = getShareText(discount);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
        setShareStats(prev => ({ ...prev, socialShares: prev.socialShares + 1, totalShares: prev.totalShares + 1 }));
    };

    // Share to Facebook
    const handleFacebookShare = (discount: DiscountCard) => {
        const link = getShareableLink(discount);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        setShareStats(prev => ({ ...prev, socialShares: prev.socialShares + 1, totalShares: prev.totalShares + 1 }));
    };

    // Share to Twitter
    const handleTwitterShare = (discount: DiscountCard) => {
        const text = `🎉 ${discount.percentage}% OFF at ${providerName}! Book your massage now 💆‍♀️`;
        const link = getShareableLink(discount);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        setShareStats(prev => ({ ...prev, socialShares: prev.socialShares + 1, totalShares: prev.totalShares + 1 }));
    };

    // Download image
    const handleDownloadImage = async (discount: DiscountCard) => {
        try {
            const response = await fetch(discount.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${providerName}-${discount.percentage}-percent-discount.png`;
            
            // React-safe DOM manipulation with error handling
            try {
                document.body.appendChild(link);
                setTimeout(() => {
                    try {
                        link.click();
                        setTimeout(() => {
                            try {
                                if (link.parentNode === document.body) {
                                    document.body.removeChild(link);
                                }
                            } catch (removeErr) {
                                console.warn('Element already removed:', removeErr);
                            }
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    } catch (clickErr) {
                        console.error('Click failed:', clickErr);
                        window.URL.revokeObjectURL(url);
                    }
                }, 10);
            } catch (appendErr) {
                console.error('Failed to append link:', appendErr);
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Failed to download:', err);
        }
    };

    // Handle discount selection
    const handleSelectDiscount = (discount: DiscountCard) => {
        setSelectedDiscount(discount);
        setShowActivateModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading discount settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-20">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white p-6 shadow-xl">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">� Discount Badges & Sharing</h1>
                            <p className="text-orange-100 text-lg">Live profile badges + social media sharing</p>
                        </div>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                        <p className="text-sm text-orange-100">
                            ✨ <strong>Dual Purpose System:</strong> Your discount appears as a live badge on your profile card 
                            AND is ready for sharing on WhatsApp, Facebook, Instagram and other platforms.
                        </p>
                    </div>
                </div>
            </div>

            {/* Promotional Image */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <img
                        src="https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea%20new%20job.png?updatedAt=1761591600248"
                        alt="Bali Massage Indonesia New Job Promotion"
                        className="w-full h-64 object-cover"
                    />
                </div>
            </div>

            {/* Active Discount - Live Badge + Sharing */}
            {activeDiscount && (
                <div className="max-w-4xl mx-auto px-4 mt-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-2xl border-4 border-green-300 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Zap size={32} className="animate-bounce" />
                                <div>
                                    <h3 className="text-2xl font-bold">LIVE: {activeDiscount.percentage}% OFF</h3>
                                    <p className="text-sm text-green-100">Badge showing on profile + Ready for sharing!</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDeactivateDiscount}
                                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-all"
                            >
                                <Power size={20} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-4">
                            <div>
                                <p className="text-sm font-semibold">Time Remaining:</p>
                                <CountdownTimer expiresAt={activeDiscount.expiresAt} />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold">Duration:</p>
                                <p className="text-lg font-bold">{activeDiscount.duration} Hours</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Statistics Cards */}
            <div className="max-w-4xl mx-auto px-4 mt-6 mb-8">
                <h2 className="text-xl font-bold text-orange-600 mb-4 text-center">📊 Discount Performance Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-orange-500 text-white rounded-full p-2">
                                <Zap size={16} />
                            </div>
                            <p className="text-sm font-bold text-orange-700">Live Activations</p>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{shareStats.activations}</p>
                        <p className="text-xs text-orange-600 mt-1">Total discount activations</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-green-500 text-white rounded-full p-2">
                                <Share2 size={16} />
                            </div>
                            <p className="text-sm font-bold text-green-700">Total Shares</p>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{shareStats.totalShares}</p>
                        <p className="text-xs text-green-600 mt-1">All platform shares</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-purple-500 text-white rounded-full p-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-purple-700">Social Shares</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{shareStats.socialShares}</p>
                        <p className="text-xs text-purple-600 mt-1">Facebook, Instagram, etc.</p>
                    </div>
                </div>
            </div>

            {/* Enhanced Instructions */}
            <div className="max-w-4xl mx-auto px-4 mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 md:p-6 shadow-lg">
                    <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-base md:text-lg">
                        <AlertCircle size={20} className="md:w-6 md:h-6" />
                        How Professional Promotional Banners Work
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-orange-800 mb-2 text-sm">📱 Banner Features:</h4>
                            <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                                <li>✓ Professional 5%, 10%, 15%, 20% discount banners</li>
                                <li>✓ Orange-themed design matching Indastreet branding</li>
                                <li>✓ Appears on your profile card with countdown timer</li>
                                <li>✓ Duration selector: 4-24 hours activation</li>
                                <li>✓ Shows in "Today's Discounts" public page</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-orange-800 mb-2 text-sm">🔗 Indastreet App Integration:</h4>
                            <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                                <li>✓ Banners link directly to your therapist profile card</li>
                                <li>✓ Visible to all app users browsing discounts</li>
                                <li>✓ WhatsApp & social media sharing for promotion</li>
                                <li>✓ Auto-expires when timer runs out</li>
                                <li>✓ Performance stats tracking included</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Cards Grid */}
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl md:text-2xl font-bold text-orange-600 mb-4 text-center">Select Discount to Activate</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {DISCOUNT_CARDS.map((discount) => {
                        const isCurrentlyActive = activeDiscount?.percentage === discount.percentage;
                        
                        return (
                            <div
                                key={discount.id}
                                className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-all ${
                                    isCurrentlyActive 
                                        ? 'border-green-500 ring-4 ring-green-200' 
                                        : 'border-gray-200 hover:border-orange-400 hover:shadow-2xl cursor-pointer transform hover:scale-105'
                                }`}
                                onClick={() => !isCurrentlyActive && handleSelectDiscount(discount)}
                            >
                                {/* Discount Header */}
                                <div className={`bg-gradient-to-r ${discount.color} p-4 text-white relative`}>
                                    {isCurrentlyActive && (
                                        <div className="absolute top-2 right-2 bg-green-400 text-green-900 px-2 md:px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                            LIVE NOW
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs md:text-sm font-semibold opacity-90">Special Offer</p>
                                            <p className="text-2xl md:text-4xl font-bold">{discount.percentage}% OFF</p>
                                        </div>
                                        <Share2 size={32} className="md:w-10 md:h-10 opacity-80" />
                                    </div>
                                </div>

                                {/* Discount Image */}
                                <div className="p-3 md:p-4 bg-gray-50">
                                    <img
                                        src={discount.imageUrl}
                                        alt={`${discount.percentage}% discount`}
                                        className="w-full h-36 md:h-48 object-cover rounded-lg shadow-md"
                                    />
                                </div>

                                {/* Action Button */}
                                <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                                    {isCurrentlyActive ? (
                                        <div className="text-center py-2">
                                            <p className="text-green-600 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
                                                <Zap className="animate-pulse w-4 h-4 md:w-5 md:h-5" />
                                                Currently Active
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectDiscount(discount);
                                            }}
                                            className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-2 md:py-3 rounded-xl font-bold text-sm md:text-base hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                            disabled={!!activeDiscount}
                                        >
                                            <Power size={16} className="md:w-5 md:h-5" />
                                            {activeDiscount ? 'Stop Current Banner First' : 'Create Banner'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Banner Modal */}
            {showActivateModal && selectedDiscount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[95vh]  shadow-2xl">
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${selectedDiscount.color} p-4 md:p-6 text-white`}>
                            <h2 className="text-xl md:text-2xl font-bold mb-1">Activate {selectedDiscount.percentage}% Discount</h2>
                            <p className="text-sm opacity-90">Live badge + sharing capabilities</p>
                        </div>

                        {/* Full Size Banner Preview */}
                        <div className="p-4 md:p-6 bg-gray-50">
                            <h3 className="font-bold text-gray-800 mb-3 text-center">� Live Badge & Sharing Preview</h3>
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <img
                                    src={selectedDiscount.imageUrl}
                                    alt={`${selectedDiscount.percentage}% discount banner preview`}
                                    className="w-full h-64 md:h-80 object-cover"
                                />
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-center">
                                    <p className="text-sm font-bold">Live on Profile Card + Ready for Sharing</p>
                                </div>
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="p-4 md:p-6">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                                <Timer size={18} className="md:w-5 md:h-5" />
                                Set Banner Duration
                            </h3>
                            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.hours}
                                        onClick={() => setSelectedDuration(option.hours)}
                                        className={`py-2 md:py-3 px-3 md:px-4 rounded-xl font-bold text-sm md:text-base transition-all ${
                                            selectedDuration === option.hours
                                                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* What Happens */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                                <h4 className="font-bold text-blue-900 mb-2 text-sm">What happens when you activate:</h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>🔥 <strong>Live badge appears on your profile card</strong></li>
                                    <li>👀 Visible to all customers browsing for deals</li>
                                    <li>📱 Ready for WhatsApp & social media sharing</li>
                                    <li>⏰ Auto-expires after selected duration</li>
                                </ul>
                            </div>

                            {/* Activate Button */}
                            <button
                                onClick={handleActivateDiscount}
                                disabled={activating}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg disabled:opacity-50 mb-3"
                            >
                                <Zap size={20} className="md:w-6 md:h-6 animate-pulse" />
                                {activating ? 'Activating...' : `Activate for ${selectedDuration} Hours`}
                            </button>

                            {/* Enhanced Share Options */}
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-700 font-bold mb-3 text-center">📱 Share Your Promotional Banner</p>
                                
                                {/* Primary WhatsApp Sharing */}
                                <div className="mb-3">
                                    <button
                                        onClick={() => handleWhatsAppShare(selectedDiscount)}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 md:py-3 rounded-lg font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg mb-2"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        <span className="hidden sm:inline">Share Banner on WhatsApp</span>
                                        <span className="sm:hidden">WhatsApp</span>
                                    </button>
                                </div>

                                {/* Social Media Grid */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button
                                        onClick={() => handleFacebookShare(selectedDiscount)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        Facebook
                                    </button>
                                    <button
                                        onClick={() => handleTwitterShare(selectedDiscount)}
                                        className="bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                        Twitter/X
                                    </button>
                                </div>

                                {/* Additional Sharing Options */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button
                                        onClick={() => {
                                            const url = `https://www.instagram.com/`;
                                            window.open(url, '_blank');
                                            setShareStats(prev => ({ ...prev, socialShares: prev.socialShares + 1, totalShares: prev.totalShares + 1 }));
                                        }}
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                                        </svg>
                                        Instagram
                                    </button>
                                    <button
                                        onClick={() => {
                                            const message = `🌟 Check out ${providerName}'s ${selectedDiscount.percentage}% OFF massage special!`;
                                            const url = `https://telegram.me/share/url?url=${encodeURIComponent(getShareableLink(selectedDiscount))}&text=${encodeURIComponent(message)}`;
                                            window.open(url, '_blank');
                                            setShareStats(prev => ({ ...prev, socialShares: prev.socialShares + 1, totalShares: prev.totalShares + 1 }));
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                        </svg>
                                        Telegram
                                    </button>
                                </div>

                                {/* Utility Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleCopyLink(selectedDiscount)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadImage(selectedDiscount)}
                                        className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 rounded-lg font-semibold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="p-3 md:p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowActivateModal(false)}
                                className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 text-sm md:text-base"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountSharePage;
