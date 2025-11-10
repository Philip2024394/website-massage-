import React, { useState, useEffect } from 'react';
import { ShopItem, UserCoins } from '../types';
import { shopItemService, coinService, shopOrderService } from '../lib/appwriteService';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import LocationModal from '../components/LocationModal';
import { AppDrawer } from '../components/AppDrawer';

interface CoinShopPageProps {
    onNavigate: (page: string) => void;
    onBack?: () => void;
    currentUser?: {
        id: string;
        name: string;
        type: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    };
    onSetUserLocation?: (location: any) => void;
    onAgentPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onOpenMenu?: () => void; // Function to open the HomePage drawer
    t?: any;
}

const CoinShopPage: React.FC<CoinShopPageProps> = ({ 
    currentUser,
    onSetUserLocation,
    t
}) => {
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [userCoins, setUserCoins] = useState<UserCoins | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [processingItemId, setProcessingItemId] = useState<string | null>(null);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [deliveryInfo, setDeliveryInfo] = useState({
        name: '',
        whatsapp: '',
        address: '',
        postcode: ''
    });
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    const [showLoginNotice, setShowLoginNotice] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Location modal state
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        loadShopData();
    }, [currentUser]);

    const loadShopData = async () => {
        try {
            setLoading(true);
            
            // Load shop items
            const items = await shopItemService.getActiveItems();
            setShopItems(items);

            // Load user coins if logged in
            if (currentUser?.id) {
                let userCoinsData = await coinService.getUserCoins(currentUser.id);
                if (!userCoinsData) {
                    userCoinsData = await coinService.initializeUserCoins(
                        currentUser.id,
                        currentUser.type,
                        currentUser.name
                    );
                }
                setUserCoins(userCoinsData);
            }
        } catch (error) {
            console.error('Error loading shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All', icon: '🛍️' },
        { id: 'electronics', label: 'Electronics', icon: '📱' },
        { id: 'fashion', label: 'Fashion', icon: '👕' },
        { id: 'wellness', label: 'Wellness', icon: '💆' },
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'gift_cards', label: 'Gift Cards', icon: '🎁' },
    ];

    const filteredItems = selectedCategory === 'all' 
        ? shopItems 
        : shopItems.filter(item => item.category === selectedCategory);

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCashIn = (item: ShopItem) => {
        if (!currentUser) {
            setShowLoginNotice(true);
            return;
        }

        setSelectedItem(item);
        
        // Check if user has enough coins
        if (!userCoins || userCoins.totalCoins < item.coinPrice) {
            setShowInsufficientModal(true);
            return;
        }

        // Show delivery form with celebration
        setShowDeliveryForm(true);
        setAgreedToTerms(false); // Reset checkbox
    };

    const handleConfirmOrder = async () => {
        if (!selectedItem || !currentUser || !userCoins) return;

        // Validate delivery info
        if (!deliveryInfo.name || !deliveryInfo.whatsapp || !deliveryInfo.address || !deliveryInfo.postcode) {
            alert('Please fill in all delivery information');
            return;
        }

        if (!agreedToTerms) {
            alert('Please confirm that you understand products cannot be changed once processed');
            return;
        }

        try {
            setProcessingItemId(selectedItem.$id || '');

            // Deduct coins
            await coinService.deductCoins(
                currentUser.id,
                currentUser.type,
                currentUser.name,
                selectedItem.coinPrice,
                `Redeemed: ${selectedItem.name}`,
                selectedItem.$id
            );

            // Create order
            await shopOrderService.createOrder({
                userId: currentUser.id,
                userType: currentUser.type,
                userName: currentUser.name,
                userEmail: '',
                userPhone: deliveryInfo.whatsapp,
                shippingAddress: {
                    fullName: deliveryInfo.name,
                    phone: deliveryInfo.whatsapp,
                    addressLine1: deliveryInfo.address,
                    city: '',
                    province: '',
                    postalCode: deliveryInfo.postcode,
                    country: 'Indonesia'
                } as any,
                items: [{
                    itemId: selectedItem.$id || '',
                    itemName: selectedItem.name,
                    itemImage: selectedItem.imageUrl,
                    coinPrice: selectedItem.coinPrice,
                    quantity: 1
                }] as any,
                totalCoins: selectedItem.coinPrice,
                estimatedDelivery: '7-10 days',
                notes: `Name: ${deliveryInfo.name}, WhatsApp: ${deliveryInfo.whatsapp}, Address: ${deliveryInfo.address}, Postcode: ${deliveryInfo.postcode}`
            });

            // Reload user coins
            await loadShopData();

            // Show final confirmation modal
            setShowDeliveryForm(false);
            setShowFinalConfirmation(true);
            setProcessingItemId(null);

            // Reset delivery info
            setDeliveryInfo({ name: '', whatsapp: '', address: '', postcode: '' });
            setAgreedToTerms(false);
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Error processing order. Please try again.');
            setProcessingItemId(null);
        }
    };

    return (
        <>
            {/* Falling Coins Animation CSS */}
            <style>{`
                @keyframes fall-slow {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(calc(100vh)) rotate(360deg);
                        opacity: 0.3;
                    }
                }
                .animate-fall-slow {
                    animation: fall-slow linear infinite;
                }
                
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                }

                /* Mobile optimizations for slower animations */
                @media (max-width: 768px) {
                    .animate-fall-slow {
                        animation: fall-slow linear infinite;
                        animation-duration: 15s !important; /* Override inline duration on mobile */
                    }
                    
                    .animate-confetti {
                        animation: confetti linear forwards;
                        animation-duration: 6s !important; /* Override inline duration on mobile */
                    }
                }
            `}</style>

            <div className="min-h-screen bg-white">
            {/* HomePage-style Header */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={() => setIsDrawerOpen(true)} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <AppDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                onNavigate={() => {
                    setIsDrawerOpen(false);
                    // Handle navigation here
                }}
                t={t}
            />

            {/* Coin Balance Display */}
            <div id="coin-balance-bar" className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">🪙 Your Coin Balance</span>
                    
                    {/* Category Dropdown */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white text-gray-800 rounded-lg px-3 py-2 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Coin Stats - Glass Effect */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                    {/* Total Earned */}
                    <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white border-opacity-20">
                        <div className="text-xs text-white text-opacity-80 mb-1">Total Earned</div>
                        <div className="text-lg font-bold text-white">{userCoins?.lifetimeEarned || 0}</div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white border-opacity-20">
                        <div className="text-xs text-white text-opacity-80 mb-1">Total Spent</div>
                        <div className="text-lg font-bold text-white">{userCoins?.lifetimeSpent || 0}</div>
                    </div>

                    {/* Available (Expired renamed to Available) */}
                    <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white border-opacity-20">
                        <div className="text-xs text-white text-opacity-80 mb-1">Available</div>
                        <div className="text-lg font-bold text-white">{userCoins?.totalCoins || 0}</div>
                    </div>
                </div>
            </div>

            {/* Header Text */}
            <div className="text-center py-6 px-4">
                <h2 className="text-4xl font-bold mb-3">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </h2>
                <p className="text-gray-600 text-base max-w-2xl mx-auto">
                    Let's Cash in your coins for awesome products dispatched within 48 hours. Delivery times may vary across Indonesia
                </p>
            </div>

            {/* Shop Items Grid with Falling Coins Background */}
            <div className="max-w-7xl mx-auto px-4 py-6 relative">
                {/* Falling Coins Animation - Positioned from coin bar */}
                <div className="fixed left-0 right-0 pointer-events-none overflow-hidden z-5" style={{ top: '112px', bottom: 0 }}>
                    {[...Array(15)].map((_, i) => {
                        // Slower animation on mobile
                        const isMobile = window.innerWidth <= 768;
                        const baseDuration = isMobile ? 15 : 8;
                        const randomExtra = isMobile ? Math.random() * 8 : Math.random() * 4;
                        const delay = isMobile ? Math.random() * 8 : Math.random() * 5;
                        
                        return (
                            <div
                                key={i}
                                className="absolute animate-fall-slow"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: 0,
                                    animationDelay: `${delay}s`,
                                    animationDuration: `${baseDuration + randomExtra}s`,
                                    fontSize: `${20 + Math.random() * 20}px`
                                }}
                            >
                                🪙
                            </div>
                        );
                    })}
                </div>

                {/* Product Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
                        <p className="mt-4 text-gray-600">Loading shop items...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Available</h3>
                        <p className="text-gray-600">Check back later for new items!</p>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-2 gap-4 pb-20">
                        {paginatedItems.map((item) => (
                            <div
                                key={item.$id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-square bg-gray-100">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Coin Price Badge - Top Right - Black Glass Effect */}
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border border-white border-opacity-20">
                                        <span className="font-bold text-sm">{item.coinPrice.toLocaleString()}</span>
                                        <span className="text-xs">🪙</span>
                                    </div>
                                    
                                    {item.stockQuantity <= 0 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-3">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Coin Price */}
                                    <div className="flex items-center gap-1 mb-2">
                                        <span className="text-orange-500 text-lg font-bold">
                                            {item.coinPrice}
                                        </span>
                                        <span className="text-orange-500 text-sm">🪙</span>
                                    </div>

                                    {/* Delivery Time */}
                                    <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                                        <span>🚚</span>
                                        <span>Delivery: 7-10 days</span>
                                    </div>

                                    {/* Cash In Button */}
                                    <button
                                        onClick={() => handleCashIn(item)}
                                        disabled={item.stockQuantity <= 0 || processingItemId === item.$id}
                                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                                            item.stockQuantity <= 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : processingItemId === item.$id
                                                ? 'bg-orange-300 text-white cursor-wait'
                                                : 'bg-orange-500 text-white hover:bg-orange-600'
                                        }`}
                                    >
                                        {processingItemId === item.$id ? 'Processing...' : 'Cash In'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pb-20 mt-8 mb-6">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                                    currentPage === 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            <div className="text-gray-700 font-semibold">
                                Page {currentPage} of {totalPages}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                                    currentPage === totalPages
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                            >
                                Next
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>

            {/* Delivery Info Modal with Confetti */}
            {showDeliveryForm && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 overflow-y-auto">
                    {/* Confetti Animation */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => {
                            // Slower confetti animation on mobile
                            const isMobile = window.innerWidth <= 768;
                            const baseDuration = isMobile ? 5 : 2;
                            const randomExtra = isMobile ? Math.random() * 3 : Math.random() * 2;
                            const delay = isMobile ? Math.random() * 4 : Math.random() * 3;
                            
                            return (
                                <div
                                    key={`confetti-${i}`}
                                    className="absolute animate-confetti"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: '-10%',
                                        animationDelay: `${delay}s`,
                                        animationDuration: `${baseDuration + randomExtra}s`,
                                        opacity: 0.8,
                                        fontSize: `${10 + Math.random() * 10}px`,
                                        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]
                                    }}
                                >
                                    {['🎉', '🎊', '✨', '⭐', '💫'][Math.floor(Math.random() * 5)]}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn relative z-10 my-8">
                        {/* Celebration Header */}
                        <div className="text-center mb-4">
                            <div className="text-5xl mb-2 animate-bounce">🎉</div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
                            <p className="text-gray-600">
                                You have enough coins for: <strong className="text-orange-600">{selectedItem.name}</strong>
                            </p>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Delivery Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.name}
                                        onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        WhatsApp Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={deliveryInfo.whatsapp}
                                        onChange={(e) => setDeliveryInfo({...deliveryInfo, whatsapp: e.target.value})}
                                        placeholder="+62 812 3456 7890"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        value={deliveryInfo.address}
                                        onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                                        placeholder="Enter your complete delivery address"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postcode *
                                    </label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.postcode}
                                        onChange={(e) => setDeliveryInfo({...deliveryInfo, postcode: e.target.value})}
                                        placeholder="Enter postcode"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">
                                    I understand that <strong>products cannot be changed once the item is being processed</strong>
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeliveryForm(false);
                                    setSelectedItem(null);
                                    setDeliveryInfo({ name: '', whatsapp: '', address: '', postcode: '' });
                                    setAgreedToTerms(false);
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                disabled={!agreedToTerms}
                                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-colors ${
                                    agreedToTerms
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Process My Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Notice Modal */}
            {showLoginNotice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
                        <div className="text-6xl mb-4">🔐</div>
                        <h2 className="text-2xl font-bold text-orange-600 mb-4">Login Required</h2>
                        <p className="text-gray-700 mb-6">
                            Please log in to your account before cashing in coins for products.
                        </p>
                        <button
                            onClick={() => setShowLoginNotice(false)}
                            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Final Confirmation Modal */}
            {showFinalConfirmation && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
                        <p className="text-lg text-gray-700 mb-4">
                            Your item <strong className="text-orange-600">{selectedItem.name}</strong> is being processed and will soon be dispatched.
                        </p>
                        <p className="text-gray-600 mb-6">
                            <strong>IndaStreet Team</strong>
                        </p>
                        <button
                            onClick={() => {
                                setShowFinalConfirmation(false);
                                setSelectedItem(null);
                            }}
                            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {/* Insufficient Coins Modal */}
            {showInsufficientModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Insufficient Coins</h2>
                        <p className="text-gray-700 mb-2">
                            You need <strong className="text-orange-600">{selectedItem.coinPrice} coins</strong> to redeem this item.
                        </p>
                        <p className="text-gray-600 mb-6">
                            You currently have <strong>{userCoins?.totalCoins || 0} coins</strong>.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            💡 Earn more coins by completing bookings and referring friends!
                        </p>
                        <button
                            onClick={() => {
                                setShowInsufficientModal(false);
                                setSelectedItem(null);
                            }}
                            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Location Modal */}
            {isLocationModalOpen && onSetUserLocation && (
                <LocationModal
                    onConfirm={(location) => {
                        onSetUserLocation(location);
                        setIsLocationModalOpen(false);
                    }}
                    onClose={() => setIsLocationModalOpen(false)}
                    t={t?.locationModal || {
                        title: 'Select Your Location',
                        country: 'Country',
                        city: 'City',
                        confirmButton: 'Confirm Location'
                    }}
                />
            )}

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
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
        </>
    );
};

export default CoinShopPage;

