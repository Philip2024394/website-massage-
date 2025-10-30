import React, { useState, useEffect } from 'react';
import { Copy, Share2, Gift, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { coinService } from '../lib/coinService';

interface ReferralPageProps {
    userId?: string;
    userCoins?: number;
    onNavigate?: (page: string) => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ userId = '12345', userCoins = 245, onNavigate }) => {
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        activeReferrals: 0,
        coinsEarned: 0,
        pendingRewards: 0,
        thisMonthReferrals: 0
    });

    const referralLink = `https://indastreet.com/ref/${referralCode}`;

    // Load referral code and stats
    useEffect(() => {
        const loadReferralData = async () => {
            if (!userId) return;
            
            try {
                // Initialize or get referral code
                const code = await coinService.initializeReferralCode(userId);
                setReferralCode(code);

                // Load referral statistics
                const stats = await coinService.getReferralStats(userId);
                setReferralStats(stats);
            } catch (error) {
                console.error('Error loading referral data:', error);
            }
        };

        loadReferralData();
    }, [userId]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join IndaStreet!',
                    text: `Get 50 coins when you sign up with my referral code: ${referralCode}`,
                    url: referralLink,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button onClick={() => onNavigate?.('home')} className="text-gray-600 hover:text-gray-800">
                        ← Back
                    </button>
                    <h1 className="text-xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="text-sm font-semibold text-orange-600">
                        🪙 {userCoins}
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 pb-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white mb-6 shadow-lg">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🎁</div>
                        <h2 className="text-3xl font-bold mb-2">Invite Friends,</h2>
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
                        <p className="text-xs text-green-600 mt-1">↑ {referralStats.activeReferrals} active</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                            <p className="text-gray-600 text-sm">Coins Earned</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{referralStats.coinsEarned}</p>
                        <p className="text-xs text-orange-600 mt-1">+{referralStats.pendingRewards} pending</p>
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
                            <p className="text-3xl font-bold text-orange-600 tracking-wider mb-3">
                                {referralCode}
                            </p>
                            <button
                                onClick={handleCopyCode}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 mx-auto"
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
                                value={referralLink}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all border border-gray-300"
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
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            Share Now
                        </button>
                        <button
                            onClick={() => window.open(`https://wa.me/?text=Join IndaStreet and get 50 coins! Use code: ${referralCode} - ${referralLink}`, '_blank')}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
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
    );
};

export default ReferralPage;
