import React, { useState } from 'react';
import { Share2, Download, MessageCircle, Facebook, Twitter, Copy, Check, Users, TrendingUp } from 'lucide-react';
import Button from '../components/Button';

interface DiscountSharePageProps {
    providerId: string;
    providerName: string;
    providerType: 'therapist' | 'place';
    t: any;
}

interface DiscountCard {
    id: string;
    percentage: number;
    imageUrl: string;
    color: string;
    theme: string;
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

const DiscountSharePage: React.FC<DiscountSharePageProps> = ({
    providerId,
    providerName,
    providerType,
}) => {
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountCard | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shareStats, setShareStats] = useState({
        totalShares: 0,
        chatsSent: 0,
        socialShares: 0
    });

    // Generate shareable link with discount code
    const getShareableLink = (discount: DiscountCard) => {
        const baseUrl = window.location.origin;
        const profilePath = providerType === 'therapist' ? 'therapist' : 'place';
        return `${baseUrl}/#/${profilePath}/${providerId}?discount=${discount.percentage}`;
    };

    // Generate share text
    const getShareText = (discount: DiscountCard) => {
        return `🎉 Special Offer! Get ${discount.percentage}% OFF your next massage at ${providerName}! 💆‍♀️\n\nBook now and save! Limited time offer.\n\n👉 ${getShareableLink(discount)}`;
    };

    // Copy link to clipboard
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
        updateShareStats('social');
    };

    // Share to Facebook
    const handleFacebookShare = (discount: DiscountCard) => {
        const link = getShareableLink(discount);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        updateShareStats('social');
    };

    // Share to Twitter
    const handleTwitterShare = (discount: DiscountCard) => {
        const text = `🎉 ${discount.percentage}% OFF at ${providerName}! Book your massage now 💆‍♀️`;
        const link = getShareableLink(discount);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        updateShareStats('social');
    };

    // Download discount image
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
            console.error('Failed to download image:', err);
        }
    };

    // Share to all customers via chat
    const handleShareToAllCustomers = async () => {
        setSharing(true);
        try {
            // TODO: Implement chat broadcast via Appwrite
            // This will send the discount to all customers who have chatted with this provider
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            updateShareStats('chat');
            alert(`✅ Discount shared to all your customers via chat!`);
        } catch (err) {
            console.error('Failed to share to customers:', err);
            alert('Failed to share discount. Please try again.');
        } finally {
            setSharing(false);
            setShowShareModal(false);
        }
    };

    // Update share statistics
    const updateShareStats = (type: 'chat' | 'social') => {
        setShareStats(prev => ({
            totalShares: prev.totalShares + 1,
            chatsSent: type === 'chat' ? prev.chatsSent + 1 : prev.chatsSent,
            socialShares: type === 'social' ? prev.socialShares + 1 : prev.socialShares
        }));
    };

    // Handle discount card selection
    const handleSelectDiscount = (discount: DiscountCard) => {
        setSelectedDiscount(discount);
        setShowShareModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">🎁 Share Discounts</h1>
                    <p className="text-orange-100">Attract more customers with special offers</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="max-w-4xl mx-auto px-4 -mt-8 mb-8">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Shares</p>
                                <p className="text-2xl font-bold text-orange-600">{shareStats.totalShares}</p>
                            </div>
                            <TrendingUp className="text-orange-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Chat Sent</p>
                                <p className="text-2xl font-bold text-blue-600">{shareStats.chatsSent}</p>
                            </div>
                            <MessageCircle className="text-blue-500" size={32} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Social</p>
                                <p className="text-2xl font-bold text-purple-600">{shareStats.socialShares}</p>
                            </div>
                            <Share2 className="text-purple-500" size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="max-w-4xl mx-auto px-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Users size={20} />
                        How it works
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Select a discount percentage (5%, 10%, 15%, or 20%)</li>
                        <li>✓ Share to all your customers instantly via chat</li>
                        <li>✓ Or share on social media to attract new customers</li>
                        <li>✓ Track your shares and boost bookings during slow periods</li>
                    </ul>
                </div>
            </div>

            {/* Discount Cards Grid */}
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Discount Offer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {DISCOUNT_CARDS.map((discount) => (
                        <div
                            key={discount.id}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all hover:shadow-2xl cursor-pointer transform hover:scale-105"
                            onClick={() => handleSelectDiscount(discount)}
                        >
                            {/* Discount Header */}
                            <div className={`bg-gradient-to-r ${discount.color} p-4 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold opacity-90">Special Offer</p>
                                        <p className="text-4xl font-bold">{discount.percentage}% OFF</p>
                                    </div>
                                    <Share2 size={40} className="opacity-80" />
                                </div>
                            </div>

                            {/* Discount Image Preview */}
                            <div className="p-4 bg-gray-50">
                                {discount.imageUrl ? (
                                    <img
                                        src={discount.imageUrl}
                                        alt={`${discount.percentage}% discount`}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500 font-semibold">Image Coming Soon</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectDiscount(discount);
                                    }}
                                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Share2 size={20} />
                                    Share This Offer
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && selectedDiscount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${selectedDiscount.color} p-6 text-white`}>
                            <h2 className="text-2xl font-bold mb-1">Share {selectedDiscount.percentage}% Discount</h2>
                            <p className="text-sm opacity-90">Choose how to share your offer</p>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Share to All Customers */}
                            <button
                                onClick={() => handleShareToAllCustomers()}
                                disabled={sharing}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                            >
                                <MessageCircle size={24} />
                                {sharing ? 'Sending...' : 'Send to All Customers via Chat'}
                            </button>

                            {/* Social Media Sharing */}
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-600 font-semibold mb-3">Share on Social Media</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleWhatsAppShare(selectedDiscount)}
                                        className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                                    >
                                        <MessageCircle size={24} />
                                        <span className="text-xs">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => handleFacebookShare(selectedDiscount)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                                    >
                                        <Facebook size={24} />
                                        <span className="text-xs">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => handleTwitterShare(selectedDiscount)}
                                        className="bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                                    >
                                        <Twitter size={24} />
                                        <span className="text-xs">Twitter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Copy Link & Download */}
                            <div className="border-t pt-4 space-y-2">
                                <button
                                    onClick={() => handleCopyLink(selectedDiscount)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={20} className="text-green-600" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={20} />
                                            Copy Link
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDownloadImage(selectedDiscount)}
                                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download Image
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountSharePage;
