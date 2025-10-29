import React, { useState, useEffect } from 'react';
import { ShopItem, UserCoins } from '../types';
import { shopItemService, coinService, shopOrderService } from '../lib/appwriteService';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';
import HomeIcon from '../components/icons/HomeIcon';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import LocationModal from '../components/LocationModal';

interface CoinShopPageProps {
    onNavigate: (page: string) => void;
    currentUser?: {
        id: string;
        name: string;
        type: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    };
    onSetUserLocation?: (location: any) => void;
    onAgentPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    t?: any;
}

// Inline icon components (from HomePage)
const BuildingIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 17l-4 4 4-4 6.293-6.293a1 1 0 011.414 0L21 11" />
    </svg>
);

const CoinShopPage: React.FC<CoinShopPageProps> = ({ 
    onNavigate, 
    currentUser,
    onSetUserLocation,
    onAgentPortalClick,
    onTermsClick,
    onPrivacyClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onCustomerPortalClick,
    onMassageJobsClick,
    onTherapistJobsClick,
    t
}) => {
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [userCoins, setUserCoins] = useState<UserCoins | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [processingItemId, setProcessingItemId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [deliveryInfo, setDeliveryInfo] = useState({
        name: '',
        whatsapp: '',
        address: ''
    });
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    
    // Header state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

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

    const handleCashIn = (item: ShopItem) => {
        if (!currentUser) {
            alert('Please login to redeem items');
            return;
        }

        setSelectedItem(item);
        
        // Check if user has enough coins
        if (!userCoins || userCoins.totalCoins < item.coinPrice) {
            setShowInsufficientModal(true);
            return;
        }

        // Show delivery form
        setShowDeliveryForm(true);
    };

    const handleConfirmOrder = async () => {
        if (!selectedItem || !currentUser || !userCoins) return;

        // Validate delivery info
        if (!deliveryInfo.name || !deliveryInfo.whatsapp || !deliveryInfo.address) {
            alert('Please fill in all delivery information');
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
                    postalCode: '',
                    country: 'Indonesia'
                },
                items: [{
                    itemId: selectedItem.$id || '',
                    itemName: selectedItem.name,
                    itemImage: selectedItem.imageUrl,
                    coinPrice: selectedItem.coinPrice,
                    quantity: 1
                }],
                totalCoins: selectedItem.coinPrice,
                estimatedDelivery: '7-10 days',
                notes: `WhatsApp: ${deliveryInfo.whatsapp}, Address: ${deliveryInfo.address}`
            });

            // Reload user coins
            await loadShopData();

            // Show success modal
            setShowDeliveryForm(false);
            setShowSuccessModal(true);
            setProcessingItemId(null);

            // Reset delivery info
            setDeliveryInfo({ name: '', whatsapp: '', address: '' });
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Error processing order. Please try again.');
            setProcessingItemId(null);
        }
    };

    return (
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
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Drawer Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50" 
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                    
                    {/* Drawer */}
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Brand Header */}
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                {/* Coin Shop - FEATURED AT TOP */}
                                <button 
                                    onClick={() => { onNavigate?.('coin-shop'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group mb-4"
                                >
                                    <span className="text-4xl">🪙</span>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-white text-lg">Coin Shop</h3>
                                        <p className="text-sm text-orange-100">Redeem your coins for rewards</p>
                                    </div>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <div className="border-t border-gray-300 my-3"></div>

                                {/* Job Posting Section */}
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Posting</h3>
                                </div>

                                {onMassageJobsClick && (
                                    <button 
                                        onClick={() => { onMassageJobsClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Massage Jobs</h3>
                                            <p className="text-xs text-gray-500">Browse job openings</p>
                                        </div>
                                    </button>
                                )}

                                {onTherapistJobsClick && (
                                    <button 
                                        onClick={() => { onTherapistJobsClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Therapist For Contract</h3>
                                            <p className="text-xs text-gray-500">Find qualified therapists</p>
                                        </div>
                                    </button>
                                )}

                                {/* Login / Create Account Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Login / Create Account</h3>
                                </div>

                                {onHotelPortalClick && (
                                    <button 
                                        onClick={() => { onHotelPortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <BuildingIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Hotel</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {onVillaPortalClick && (
                                    <button 
                                        onClick={() => { onVillaPortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-green-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <HomeIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Villa</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {onTherapistPortalClick && (
                                    <button 
                                        onClick={() => { onTherapistPortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 via-yellow-300 to-orange-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <UserSolidIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Therapists</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {onMassagePlacePortalClick && (
                                    <button 
                                        onClick={() => { onMassagePlacePortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-pink-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <SparklesIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">Massage Spa</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {onAgentPortalClick && (
                                    <button 
                                        onClick={() => { onAgentPortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-purple-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-purple-500 via-fuchsia-400 to-purple-800 border-2 border-white transform hover:scale-105 transition-transform">
                                            <BriefcaseIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">Agent</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {onCustomerPortalClick && (
                                    <button 
                                        onClick={() => { onCustomerPortalClick(); setIsMenuOpen(false); }} 
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                    >
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 border-2 border-white transform hover:scale-105 transition-transform">
                                            <UserSolidIcon className="w-6 h-6 text-white drop-shadow" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Customer</h3>
                                            <p className="text-xs text-gray-500">Login / Register</p>
                                        </div>
                                    </button>
                                )}

                                {/* Company Section */}
                                <div className="border-t border-gray-300 my-3"></div>
                                <div className="px-2 py-2">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</h3>
                                </div>
                                <button 
                                    onClick={() => { onNavigate?.('about'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-blue-500 group"
                                >
                                    <span className="text-2xl">🏢</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">About Us</h3>
                                        <p className="text-xs text-gray-500">Our story & mission</p>
                                    </div>
                                </button>
                            </div>
                        </nav>

                        {/* Footer with Links */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                            <div className="flex justify-center gap-2">
                                {onAgentPortalClick && (
                                    <>
                                        <button 
                                            onClick={() => { onAgentPortalClick(); setIsMenuOpen(false); }} 
                                            className="text-xs text-orange-500 font-medium hover:underline"
                                        >
                                            Become Agent
                                        </button>
                                        <span className="text-gray-400">|</span>
                                    </>
                                )}
                                {onTermsClick && (
                                    <>
                                        <button 
                                            onClick={() => { onTermsClick(); setIsMenuOpen(false); }} 
                                            className="text-xs text-orange-500 font-medium hover:underline"
                                        >
                                            Terms
                                        </button>
                                        <span className="text-gray-400">|</span>
                                    </>
                                )}
                                {onPrivacyClick && (
                                    <button 
                                        onClick={() => { onPrivacyClick(); setIsMenuOpen(false); }} 
                                        className="text-xs text-orange-500 font-medium hover:underline"
                                    >
                                        Privacy
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                © 2025 IndaStreet Massage
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Coin Balance Display */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white text-center font-bold text-lg">
                🪙 Your Coins: {userCoins?.totalCoins || 0}
            </div>

            {/* Category Filter */}
            <div className="bg-white border-b sticky top-[72px] z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                                    selectedCategory === cat.id
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span className="font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Welcome Banner */}
            {!currentUser && (
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white shadow-xl">
                        <h2 className="text-3xl font-bold mb-4">Welcome to IndaStreet Massage!</h2>
                        <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4">
                            <div className="text-6xl mb-3 animate-bounce">🎉</div>
                            <h3 className="text-4xl font-bold mb-2">Congratulations!</h3>
                            <p className="text-2xl font-semibold mb-3">You Have 100 Coins In Your Account</p>
                        </div>
                        <p className="text-xl font-bold mb-4 animate-pulse">Register To Claim Before Expired</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
                        >
                            Register Now & Claim Your Coins! 🎁
                        </button>
                    </div>
                </div>
            )}

            {/* Shop Items Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
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
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
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
                )}
            </div>

            {/* Delivery Info Modal */}
            {showDeliveryForm && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Information</h2>
                        <p className="text-gray-600 mb-6">
                            Please provide your delivery details for: <strong>{selectedItem.name}</strong>
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
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
                                    WhatsApp Number
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
                                    Delivery Address
                                </label>
                                <textarea
                                    value={deliveryInfo.address}
                                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                                    placeholder="Enter your complete delivery address"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeliveryForm(false);
                                    setSelectedItem(null);
                                    setDeliveryInfo({ name: '', whatsapp: '', address: '' });
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
                        {/* Confetti Animation */}
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations!</h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Your item <strong className="text-orange-600">{selectedItem.name}</strong> is in process and will be soon dispatched for delivery within <strong>10 days approx</strong>.
                        </p>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setSelectedItem(null);
                            }}
                            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                        >
                            Got it! 🎊
                        </button>
                    </div>
                </div>
            )}

            {/* Insufficient Coins Modal */}
            {showInsufficientModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

            {/* Full Width Image at Bottom */}
            <div className="w-full mt-8">
                <img 
                    src="https://ik.imagekit.io/7grri5v7d/indastreet%20shop.png?updatedAt=1761759258038" 
                    alt="IndaStreet Shop" 
                    className="w-full h-auto"
                />
            </div>

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
    );
};

export default CoinShopPage;
