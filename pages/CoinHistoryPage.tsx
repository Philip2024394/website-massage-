import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Gift, Calendar, AlertCircle, Award, ShoppingBag, CheckCircle } from 'lucide-react';
import { coinService, CoinTransaction, CoinBalance } from '../lib/coinService';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

interface CoinHistoryPageProps {
    userId?: string;
    totalCoins?: number;
    onNavigate?: (page: string) => void;
    onOpenMenu?: () => void;
}

const CoinHistoryPage: React.FC<CoinHistoryPageProps> = ({ 
    userId = '12345', 
    totalCoins: propTotalCoins,
    onNavigate,
    onOpenMenu
}) => {
    const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'earn' | 'spend' | 'expire'>('all');
    const [coinBalance, setCoinBalance] = useState<CoinBalance>({
        total: 0,
        active: 0,
        expired: 0,
        spent: 0,
        expiringSoon: 0
    });

    // Load coin data
    useEffect(() => {
        const loadCoinData = async () => {
            if (!userId) return;
            
            try {
                // Load balance and transactions in parallel
                const [balance, history] = await Promise.all([
                    coinService.getCoinBalance(userId),
                    coinService.getTransactionHistory(userId, 100)
                ]);

                setCoinBalance(balance);
                setTransactions(history);
            } catch (error) {
                console.error('Error loading coin data:', error);
            }
        };

        loadCoinData();
    }, [userId]);

    const totalCoins = propTotalCoins ?? coinBalance.total;

    const filteredTransactions = transactions.filter(t => 
        filterType === 'all' ? true : t.type === filterType
    );

    const totalEarned = transactions
        .filter(t => t.type === 'earn' && t.status === 'active')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = coinBalance.spent;
    const totalExpired = coinBalance.expired;
    const expiringCoins = coinBalance.expiringSoon;

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'earn':
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            case 'spend':
                return <ShoppingBag className="w-5 h-5 text-blue-600" />;
            case 'expire':
                return <Clock className="w-5 h-5 text-red-600" />;
            default:
                return <Gift className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'earn':
                return 'text-green-600';
            case 'spend':
                return 'text-blue-600';
            case 'expire':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTransactionBg = (type: string) => {
        switch (type) {
            case 'earn':
                return 'bg-green-50 border-green-200';
            case 'spend':
                return 'bg-blue-50 border-blue-200';
            case 'expire':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getDaysUntilExpiry = (expiryDate?: Date) => {
        if (!expiryDate) return null;
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Header - HomePage Style */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onOpenMenu} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 pb-20">
                {/* Coin Balance Overview */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white mb-6 shadow-lg">
                    <div className="text-center mb-6">
                        <p className="text-orange-100 text-sm mb-2">Your Coin Balance</p>
                        <div className="text-6xl font-bold mb-2">{totalCoins} 🪙</div>
                        <p className="text-orange-100">Total Coins Available</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                            <p className="text-white text-opacity-80 text-xs mb-1">Total Earned</p>
                            <p className="text-2xl font-bold">{totalEarned}</p>
                        </div>
                        <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                            <p className="text-white text-opacity-80 text-xs mb-1">Total Spent</p>
                            <p className="text-2xl font-bold">{totalSpent}</p>
                        </div>
                        <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                            <p className="text-white text-opacity-80 text-xs mb-1">Expired</p>
                            <p className="text-2xl font-bold">{totalExpired}</p>
                        </div>
                    </div>
                </div>

                {/* Expiring Soon Warning */}
                {expiringCoins > 0 && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900 mb-1">
                                {expiringCoins} coins expiring soon!
                            </p>
                            <p className="text-sm text-red-700">
                                These coins will expire in the next 30 days. Use them before they're gone!
                            </p>
                            <button 
                                onClick={() => onNavigate?.('coinShop')}
                                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            >
                                Shop Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl p-2 shadow-md mb-6 border border-orange-100">
                    <div className="grid grid-cols-4 gap-2">
                        {(['all', 'earn', 'spend', 'expire'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                                    filterType === type
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 mb-4">Transaction History</h3>
                    
                    {filteredTransactions.map((transaction) => {
                        const daysUntilExpiry = getDaysUntilExpiry(transaction.expiryAt);
                        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;

                        return (
                            <div
                                key={transaction.$id || `txn-${Math.random()}`}
                                className={`bg-white rounded-2xl p-4 shadow-md border transition-all hover:shadow-lg ${getTransactionBg(transaction.type)}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="font-semibold text-gray-900 flex-1">
                                                {transaction.reason}
                                            </p>
                                            <p className={`font-bold text-lg ml-2 ${getTransactionColor(transaction.type)}`}>
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} 🪙
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(transaction.earnedAt)}</span>
                                        </div>
                                        
                                        {transaction.expiryAt && transaction.type === 'earn' && (
                                            <div className={`mt-2 flex items-center gap-2 text-xs ${
                                                isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-500'
                                            }`}>
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    {isExpiringSoon ? (
                                                        <>⚠️ Expires in {daysUntilExpiry} days</>
                                                    ) : (
                                                        <>Expires: {formatDate(transaction.expiryAt)}</>
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {transaction.status === 'active' && transaction.type === 'earn' && (
                                            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-semibold">
                                                <CheckCircle className="w-3 h-3" />
                                                Active
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Coin Expiration Policy */}
                <div className="bg-white rounded-2xl p-6 shadow-md mt-6 border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        Coin Expiration Policy
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                1
                            </div>
                            <p>Earned coins expire after <strong className="text-gray-900">12 months</strong> from the date they were earned</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                2
                            </div>
                            <p>We'll send you <strong className="text-gray-900">email & push notifications</strong> 30 days before coins expire</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                3
                            </div>
                            <p>Oldest coins are used first when you redeem rewards (FIFO method)</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                4
                            </div>
                            <p>Stay active by booking or signing in to keep earning fresh coins</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <p className="text-xs text-orange-800">
                            💡 <strong>Pro Tip:</strong> Book massages regularly and refer friends to keep your coin balance healthy and avoid expiration!
                        </p>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
                
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CoinHistoryPage;
