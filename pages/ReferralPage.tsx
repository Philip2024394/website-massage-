import React, { useState, useEffect } from 'react';
import { Copy, Share2, Gift, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { enhancedReferralService } from '../lib/referralService';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import FlyingButterfly from '../components/FlyingButterfly';
import Footer from '../components/Footer';

interface ReferralPageProps {
    user: {
        $id: string;
        name: string;
        phone?: string;
    };
    userCoins?: number;
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
    // HomePage header functionality props
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onMassageJobsClick?: () => void;
    // Footer functionality props
    onFooterHome?: () => void;
    onFooterProfile?: () => void;
    onFooterDashboard?: () => void;
    onFooterMenu?: () => void;
    onFooterSearch?: () => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ 
    user, 
    userCoins: _userCoins = 245, 
    onNavigate: _onNavigate,
    onAgentPortalClick,
    onCustomerPortalClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAdminPortalClick,
    onMassageJobsClick,
    onFooterHome,
    onFooterProfile,
    onFooterDashboard,
    onFooterMenu,
    onFooterSearch,
    t = {}
}) => {
    const [copied, setCopied] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState(user.phone || '');
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Add menu state
    const [referralData, setReferralData] = useState<{
        referralCode: string;
        referralLink: string;
        shareText: string;
    } | null>(null);
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalClicks: 0,
        totalCoinsEarned: 0,
        conversionRate: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load referral code and stats
    useEffect(() => {
        loadReferralData();
    }, [user.$id]);

    const loadReferralData = async () => {
        try {
            // Check if user already has a referral link
            const existingReferral = await enhancedReferralService.getReferralByUser(user.$id);
            if (existingReferral && existingReferral.referralLink) {
                setReferralData({
                    referralCode: existingReferral.referralCode,
                    referralLink: existingReferral.referralLink,
                    shareText: `🌟 Join me on our amazing massage booking platform! Get 25 welcome coins when you sign up with my link: ${existingReferral.referralLink}`
                });
                setWhatsappNumber(existingReferral.referrerWhatsApp || user.phone || '');
            } else {
                // Create a new referral link automatically
                await createReferralLink();
            }

            // Load referral statistics
            const stats = await enhancedReferralService.getReferralStats(user.$id);
            setReferralStats(stats);
        } catch (error) {
            console.error('Error loading referral data:', error);
        }
    };

    const createReferralLink = async () => {
        setLoading(true);
        setError('');
        
        try {
            const result = await enhancedReferralService.createReferralLink(
                user.$id,
                user.name,
                whatsappNumber || user.phone || `+62${Math.floor(Math.random() * 1000000000)}`
            );
            
            if (result.success) {
                setReferralData({
                    referralCode: result.referralCode,
                    referralLink: result.referralLink,
                    shareText: result.shareText
                });
            } else {
                setError(result.error || 'Failed to create referral link');
            }
        } catch (error) {
            console.error('Error creating referral link:', error);
            setError('Failed to create referral link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (referralData?.referralCode) {
            try {
                await navigator.clipboard.writeText(referralData.referralCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy code:', error);
            }
        }
    };

    const handleCopyLink = async () => {
        if (referralData?.referralLink) {
            try {
                await navigator.clipboard.writeText(referralData.referralLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy link:', error);
            }
        }
    };

    const handleShare = async () => {
        if (referralData?.shareText && referralData?.referralLink) {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Join IndaStreet - Massage Booking Platform',
                        text: referralData.shareText,
                        url: referralData.referralLink
                    });
                } else {
                    // Fallback to copying to clipboard
                    await navigator.clipboard.writeText(referralData.shareText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            } catch (error) {
                console.error('Failed to share:', error);
            }
        }
    };

    const handleWhatsAppShare = () => {
        if (referralData?.shareText) {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(referralData.shareText)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // const _shareUrls = null; // Placeholder for share URLs

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Quick Access Buttons */}
                        <button 
                            onClick={() => {
                                if (_onNavigate) {
                                    _onNavigate('notifications');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Notifications"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (_onNavigate) {
                                    _onNavigate('referral');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Invite Friends"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        {/* Coins Display */}
                        <div className="text-sm font-semibold text-orange-600">
                            🪙 {_userCoins || 0}
                        </div>

                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={_onNavigate}
            />

            {/* Referral Page Content */}
            <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
            <div className="max-w-4xl mx-auto p-4 pb-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white mb-6 shadow-lg">
                    <div className="text-center mb-6">
                        {/* Title Above Image */}
                        <h2 className="text-3xl font-bold mb-6">Invite Friends</h2>
                        
                        {/* Invite Friends Image - Full Size with Rounded Corners */}
                        <div className="mb-6">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/INDASTREET%20INVITE%20FRIENDS.png?updatedAt=1762146851297"
                                alt="Invite Friends - IndaStreet"
                                className="w-full h-auto mx-auto object-contain rounded-3xl drop-shadow-lg hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        
                        {/* Subtitle Below Image */}
                        <h3 className="text-2xl font-semibold mb-4">Earn Coins Together!</h3>
                        <p className="text-orange-100 text-lg">
                            Get 100 coins for each friend who signs up + 50 coins for them!
                        </p>
                    </div>

                    {/* Reward Breakdown */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-orange-100 text-sm mb-1">You Get</p>
                                <p className="text-4xl font-bold">100 🪙</p>
                                <p className="text-orange-100 text-xs mt-1">per referral</p>
                            </div>
                            <div className="text-center">
                                <p className="text-orange-100 text-sm mb-1">They Get</p>
                                <p className="text-4xl font-bold">50 🪙</p>
                                <p className="text-orange-100 text-xs mt-1">welcome bonus</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <p className="text-gray-600 text-sm">Total Referrals</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{referralStats.totalReferrals}</p>
                        <p className="text-xs text-green-600 mt-1">↑ {referralStats.completedReferrals} completed</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                            <p className="text-gray-600 text-sm">Coins Earned</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{referralStats.totalCoinsEarned}</p>
                        <p className="text-xs text-orange-600 mt-1">+{referralStats.pendingReferrals} pending</p>
                    </div>
                </div>

                {/* Referral Code Section */}
                <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-orange-600" />
                        Your Referral Code
                    </h3>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-4 border-2 border-orange-200 border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Share this code:</p>
                            {loading ? (
                                <div className="text-2xl font-bold text-orange-600 mb-3">
                                    Generating...
                                </div>
                            ) : (
                                <p className="text-3xl font-bold text-orange-600 tracking-wider mb-3">
                                    {referralData?.referralCode || 'LOADING...'}
                                </p>
                            )}
                            {error && (
                                <p className="text-red-500 text-sm mb-3">{error}</p>
                            )}
                            <button
                                onClick={handleCopyCode}
                                disabled={!referralData?.referralCode || loading}
                                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 mx-auto"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Copy Code
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-3">Or share the link:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={referralData?.referralLink || (loading ? 'Generating link...' : 'No link available')}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
                                placeholder="Your referral link will appear here"
                            />
                            <button
                                onClick={handleCopyLink}
                                disabled={!referralData?.referralLink || loading}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg transition-all border border-gray-300"
                            >
                                <Copy className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-orange-600" />
                        Share With Friends
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleShare}
                            disabled={!referralData?.shareText || loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            Share Now
                        </button>
                        <button
                            onClick={handleWhatsAppShare}
                            disabled={!referralData?.shareText || loading}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                1
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Share Your Code</p>
                                <p className="text-sm text-gray-600">Send your referral code or link to friends</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                2
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Friend Signs Up</p>
                                <p className="text-sm text-gray-600">They create account using your code & get 50 coins</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                3
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">You Earn Coins!</p>
                                <p className="text-sm text-gray-600">Get 100 coins instantly when they complete first booking</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">📋 Terms & Conditions</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• You earn 100 coins when referred friend completes first booking</li>
                        <li>• New user gets 50 coins welcome bonus</li>
                        <li>• Referral coins expire after 12 months of inactivity</li>
                        <li>• Limit: 50 referrals per month</li>
                        <li>• Fraudulent referrals will result in account suspension</li>
                        <li>• Coins cannot be transferred or exchanged for cash</li>
                    </ul>
                </div>
            </div>
            </div>
            
            {/* App Footer */}
            <Footer
                userRole="user"
                currentPage="referral"
                onHomeClick={onFooterHome || (() => _onNavigate?.('home'))}
                onNotificationsClick={() => {}}
                onBookingsClick={() => {}}
                onProfileClick={onFooterProfile || (() => _onNavigate?.('profile'))}
                onDashboardClick={onFooterDashboard}
                onSearchClick={onFooterSearch || (() => _onNavigate?.('search'))}
                onMenuClick={onFooterMenu || (() => setIsMenuOpen(true))}
                onChatClick={() => {}}
                t={t.footer || {}}
            />
        </div>
    );
};

export default ReferralPage;
