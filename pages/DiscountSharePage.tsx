import React, { useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, Clock, AlertCircle, Zap, Power, Timer } from 'lucide-react';
import Button from '../components/Button';
import { activateDiscount, deactivateDiscount, getActiveDiscountByProvider } from '../lib/discountService';
import { broadcastDiscountToCustomers } from '../lib/discountBroadcastService';

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
        color: 'from-green-500 to-emerald-600',
        theme: 'green'
    },
    {
        id: '10-percent',
        percentage: 10,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896',
        color: 'from-blue-500 to-indigo-600',
        theme: 'blue'
    },
    {
        id: '15-percent',
        percentage: 15,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221',
        color: 'from-orange-500 to-amber-600',
        theme: 'orange'
    },
    {
        id: '20-percent',
        percentage: 20,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034',
        color: 'from-red-500 to-rose-600',
        theme: 'red'
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

    // Activate discount
    const handleActivateDiscount = async () => {
        if (!selectedDiscount) return;

        setActivating(true);
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + selectedDuration);

            // Save to Appwrite database
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

            setActiveDiscount({
                percentage: selectedDiscount.percentage,
                expiresAt,
                isActive: true,
                duration: selectedDuration
            });

            // Auto-broadcast to all customers
            await broadcastToCustomers();

            setShareStats(prev => ({ ...prev, activations: prev.activations + 1 }));
            setShowActivateModal(false);
            
            alert(`✅ ${selectedDiscount.percentage}% discount is now LIVE for ${selectedDuration} hours!\n\n🔔 Broadcasted to all your customers!`);
        } catch (err) {
            console.error('Failed to activate discount:', err);
            alert('Failed to activate discount. Please try again.');
        } finally {
            setActivating(false);
        }
    };

    // Deactivate discount
    const handleDeactivateDiscount = async () => {
        if (!activeDiscount) return;

        if (confirm('Are you sure you want to deactivate this discount early?')) {
            try {
                // Get the active discount ID from database
                const existing = await getActiveDiscountByProvider(providerId, providerType);
                if (existing && existing.$id) {
                    await deactivateDiscount(existing.$id);
                }
                
                setActiveDiscount(null);
                alert('✅ Discount deactivated successfully!');
            } catch (error) {
                console.error('Error deactivating discount:', error);
                alert('Failed to deactivate discount. Please try again.');
            }
        }
    };

    // Broadcast to all customers
    const broadcastToCustomers = async () => {
        if (!selectedDiscount) return;
        
        try {
            const result = await broadcastDiscountToCustomers(
                providerId,
                providerName,
                providerType,
                selectedDiscount.percentage,
                selectedDuration
            );
            
            if (result.success) {
                setShareStats(prev => ({ 
                    ...prev, 
                    chatsSent: prev.chatsSent + result.customerCount 
                }));
                console.log(`✅ Broadcasted to ${result.customerCount} customers`);
            } else {
                console.error('Broadcast failed:', result.error);
            }
        } catch (err) {
            console.error('Failed to broadcast:', err);
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
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading discount settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">🎁 Promotional Discounts</h1>
                    <p className="text-orange-100">Activate limited-time offers to attract customers</p>
                </div>
            </div>

            {/* Active Discount Banner */}
            {activeDiscount && (
                <div className="max-w-4xl mx-auto px-4 mt-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-2xl border-4 border-green-300 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Zap size={32} className="animate-bounce" />
                                <div>
                                    <h3 className="text-2xl font-bold">LIVE DISCOUNT: {activeDiscount.percentage}% OFF</h3>
                                    <p className="text-sm text-green-100">Active promotion - Visible to all customers!</p>
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

            {/* Statistics Cards */}
            <div className="max-w-4xl mx-auto px-4 mt-6 mb-8">
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-orange-200">
                        <p className="text-xs text-gray-600">Activations</p>
                        <p className="text-2xl font-bold text-orange-600">{shareStats.activations}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-200">
                        <p className="text-xs text-gray-600">Total Shares</p>
                        <p className="text-2xl font-bold text-purple-600">{shareStats.totalShares}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200">
                        <p className="text-xs text-gray-600">Chat Sent</p>
                        <p className="text-2xl font-bold text-blue-600">{shareStats.chatsSent}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-200">
                        <p className="text-xs text-gray-600">Social</p>
                        <p className="text-2xl font-bold text-green-600">{shareStats.socialShares}</p>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="max-w-4xl mx-auto px-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={20} />
                        How Promotional Discounts Work
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Select a discount and set duration (4-24 hours)</li>
                        <li>✓ Discount auto-broadcasts to ALL your chat customers</li>
                        <li>✓ Appears on your profile card with countdown timer</li>
                        <li>✓ Shows in "Today's Discounts" page for new customers</li>
                        <li>✓ Auto-expires when timer runs out</li>
                    </ul>
                </div>
            </div>

            {/* Discount Cards Grid */}
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Discount to Activate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div className="absolute top-2 right-2 bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                            LIVE NOW
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold opacity-90">Special Offer</p>
                                            <p className="text-4xl font-bold">{discount.percentage}% OFF</p>
                                        </div>
                                        <Share2 size={40} className="opacity-80" />
                                    </div>
                                </div>

                                {/* Discount Image */}
                                <div className="p-4 bg-gray-50">
                                    <img
                                        src={discount.imageUrl}
                                        alt={`${discount.percentage}% discount`}
                                        className="w-full h-48 object-cover rounded-lg shadow-md"
                                    />
                                </div>

                                {/* Action Button */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    {isCurrentlyActive ? (
                                        <div className="text-center py-2">
                                            <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                                                <Zap className="animate-pulse" />
                                                Currently Active
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectDiscount(discount);
                                            }}
                                            className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                            disabled={!!activeDiscount}
                                        >
                                            <Power size={20} />
                                            {activeDiscount ? 'Deactivate Current First' : 'Activate Offer'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Activate Modal */}
            {showActivateModal && selectedDiscount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${selectedDiscount.color} p-6 text-white`}>
                            <h2 className="text-2xl font-bold mb-1">Activate {selectedDiscount.percentage}% Discount</h2>
                            <p className="text-sm opacity-90">Set duration and launch promotion</p>
                        </div>

                        {/* Preview Image */}
                        <div className="p-4 bg-gray-50">
                            <img
                                src={selectedDiscount.imageUrl}
                                alt="Discount preview"
                                className="w-full h-40 object-cover rounded-lg"
                            />
                        </div>

                        {/* Duration Selection */}
                        <div className="p-6">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Timer size={20} />
                                Select Duration
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.hours}
                                        onClick={() => setSelectedDuration(option.hours)}
                                        className={`py-3 px-4 rounded-xl font-bold transition-all ${
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
                                    <li>✅ Discount broadcasts to ALL your chat customers</li>
                                    <li>✅ Appears on your profile card with countdown</li>
                                    <li>✅ Shows in "Today's Discounts" public page</li>
                                    <li>✅ Auto-expires after {selectedDuration} hours</li>
                                </ul>
                            </div>

                            {/* Activate Button */}
                            <button
                                onClick={handleActivateDiscount}
                                disabled={activating}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 mb-3"
                            >
                                <Zap size={24} className="animate-pulse" />
                                {activating ? 'Activating...' : `Activate for ${selectedDuration} Hours`}
                            </button>

                            {/* Share Options */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-600 font-semibold mb-2">Or share manually:</p>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <button
                                        onClick={() => handleWhatsAppShare(selectedDiscount)}
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-all text-xs"
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={() => handleFacebookShare(selectedDiscount)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all text-xs"
                                    >
                                        Facebook
                                    </button>
                                    <button
                                        onClick={() => handleTwitterShare(selectedDiscount)}
                                        className="bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-bold transition-all text-xs"
                                    >
                                        Twitter
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleCopyLink(selectedDiscount)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadImage(selectedDiscount)}
                                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 rounded-lg font-semibold transition-all text-xs flex items-center justify-center gap-1"
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowActivateModal(false)}
                                className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
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
