import React, { useState, useEffect, useMemo } from 'react';
import { ShopItem, UserCoins } from '../types';
import { shopItemService, coinService, shopOrderService } from '../lib/appwriteService';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import LocationModal from '../components/LocationModal';
import { AppDrawer } from '../components/AppDrawer';

interface CategoryOption {
    id: string;
    label: string;
    icon: string;
}

const BASE_CATEGORY_CONFIGS: CategoryOption[] = [
    { id: 'all', label: 'All', icon: '🛍️' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'fashion', label: 'Fashion', icon: '👕' },
    { id: 'wellness', label: 'Wellness', icon: '💆' },
    { id: 'educational', label: 'Educational', icon: '📚' },
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'gift_cards', label: 'Gift Cards', icon: '🎁' },
    { id: 'lighter', label: 'Lighter', icon: '🔥' },
];

const CATEGORY_ICON_OVERRIDES: Record<string, string> = {
    'Leather Belts': '👖',
    Watches: '⌚',
    'Work Belts': '🛠️',
    Home: '🏠',
    electronics: '📱',
    fashion: '👕',
    wellness: '💆',
    educational: '📚',
    lighter: '🔥',
};

const BASE_CATEGORY_IDS = new Set(BASE_CATEGORY_CONFIGS.map((category) => category.id));

const formatCategoryLabel = (category: string) =>
    category
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

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
    isFromTherapistDashboard?: boolean;
    dashboardType?: 'villa' | 'therapist' | 'standalone';
}

const CoinShopPage: React.FC<CoinShopPageProps> = ({ 
    onNavigate,
    onBack,
    currentUser,
    onSetUserLocation,
    onTermsClick,
    onPrivacyClick,
    t,
    isFromTherapistDashboard = false,
    dashboardType = 'standalone'
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
    // Image preview state for enlarging product images with details
    const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        loadShopData();
    }, [currentUser]);

    const loadShopData = async () => {
        try {
            setLoading(true);
            console.log('Starting loadShopData...');
            
            // Load shop items
            const items = await shopItemService.getActiveItems();
            console.log('Loaded shop items:', items.length);
            // Ensure "lighter" category items exist in Appwrite (persist, not just local)
            const existingLighter = items.filter(i => i.category === 'lighter');
            let augmented = items;
            if (existingLighter.length === 0) {
                const lighterImages = [
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%202.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%203.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%204.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%205.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%206.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%207.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%208.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%209.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2010.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2011.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2012.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2013.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2014.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2015.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2016.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2017.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2018.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2019.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2020.png',
                    'https://ik.imagekit.io/7grri5v7d/indastreet%20indonisea%2021.png'
                ];

                const phrases = [
                    'Modern UV print.',
                    'Premium UV finish.',
                    'Durable metal body.',
                    'Compact and reliable.',
                    'Refillable oil design.',
                    'Smooth ignition.',
                    'Travel‑ready size.',
                    'Clean, classic look.',
                    'Gift‑ready packaging.',
                    'Everyday carry friendly.'
                ];

                const randCoin = () => Math.floor(780 + Math.random() * (930 - 780 + 1)); // 780..930 inclusive
                const nowIso = new Date().toISOString();
                const lighterItems = lighterImages.map((url, idx): Partial<ShopItem> => {
                    const coin = randCoin();
                    const stock = 3 + Math.floor(Math.random() * 8); // 3..10
                    const desc = `Oil lighters for all occasions. ${phrases[idx % phrases.length]} Ready to fill and use.`;
                    return {
                        name: `IndaStreet Lighter ${idx + 1}`,
                        description: desc,
                        coinPrice: coin,
                        imageUrl: url,
                        category: 'lighter',
                        stockQuantity: stock,
                        isActive: true,
                        estimatedDelivery: '6-10 days',
                        disclaimer: 'Design may vary from image shown.',
                        createdAt: nowIso,
                        updatedAt: nowIso
                    };
                });
                // Persist each new lighter item to Appwrite
                const created: ShopItem[] = [];
                for (const it of lighterItems) {
                    try {
                        const doc = await shopItemService.createItem({
                            name: it.name!,
                            description: it.description!,
                            coinPrice: it.coinPrice!,
                            imageUrl: it.imageUrl!,
                            category: 'lighter',
                            stockQuantity: it.stockQuantity!,
                            isActive: true,
                            estimatedDelivery: it.estimatedDelivery!,
                            disclaimer: it.disclaimer!
                        });
                        created.push(doc);
                    } catch (e) {
                        console.warn('Failed to create lighter item', it.name, e);
                    }
                }
                augmented = [...items, ...created];
                console.log(`Persisted ${created.length} lighter items to Appwrite.`);
            }
            // Ensure "Watches" category items exist in Appwrite (persist)
            const existingWatches = augmented.filter(i => (i.category || '').trim() === 'Watches');
            const providedWatchImages = [
                'https://ik.imagekit.io/7grri5v7d/belt%2020.png?updatedAt=1763284365379',
                'https://ik.imagekit.io/7grri5v7d/belt%2021.png?updatedAt=1763284381996',
                'https://ik.imagekit.io/7grri5v7d/belt%2022.png?updatedAt=1763284402810',
                'https://ik.imagekit.io/7grri5v7d/belt%2019.png?updatedAt=1763284340327'
            ];
            if (existingWatches.length === 0) {
                const nowIso = new Date().toISOString();
                const watchImages = providedWatchImages;
                const watchPhrases = [
                    'Classic analog design.',
                    'Durable strap, daily wear.',
                    'Water resistant build.',
                    'Clear dial, easy read.'
                ];
                const randCoin = () => Math.floor(2400 + Math.random() * (3200 - 2400 + 1)); // 2400..3200
                const watchItems: Partial<ShopItem>[] = watchImages.map((url, idx) => ({
                    name: `IndaStreet Watch ${idx + 1}`,
                    description: `Stylish wrist watch. ${watchPhrases[idx % watchPhrases.length]}`,
                    coinPrice: randCoin(),
                    imageUrl: url,
                    category: 'Watches' as any,
                    stockQuantity: 5 + Math.floor(Math.random() * 6),
                    isActive: true,
                    estimatedDelivery: '6-10 days',
                    disclaimer: 'Designs may vary slightly from images.',
                    createdAt: nowIso,
                    updatedAt: nowIso
                }));
                const createdWatches: ShopItem[] = [];
                for (const it of watchItems) {
                    try {
                        const doc = await shopItemService.createItem({
                            name: it.name!,
                            description: it.description!,
                            coinPrice: it.coinPrice!,
                            imageUrl: it.imageUrl!,
                            category: 'Watches' as any,
                            stockQuantity: it.stockQuantity!,
                            isActive: true,
                            estimatedDelivery: it.estimatedDelivery!,
                            disclaimer: it.disclaimer!
                        });
                        createdWatches.push(doc);
                    } catch (e) {
                        console.warn('Failed to create watch item', it.name, e);
                    }
                }
                augmented = [...augmented, ...createdWatches];
                console.log(`Persisted ${createdWatches.length} watch items to Appwrite.`);
            } else {
                // Dev-only migration: if watches already exist with placeholder images, update to provided images
                const isDevHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                if (isDevHost) {
                    const placeholders = existingWatches.filter(w => (w.imageUrl || '').includes('placehold.co'));
                    if (placeholders.length > 0) {
                        const updatedDocs: ShopItem[] = [];
                        for (let i = 0; i < placeholders.length; i++) {
                            const w = placeholders[i];
                            const newUrl = providedWatchImages[i % providedWatchImages.length];
                            try {
                                const doc = await shopItemService.updateItem(w.$id || '', { imageUrl: newUrl });
                                updatedDocs.push(doc);
                            } catch (e) {
                                console.warn('Failed to update existing watch image', w.$id, e);
                            }
                        }
                        if (updatedDocs.length > 0) {
                            const updatedIds = new Set(updatedDocs.map(d => d.$id));
                            augmented = augmented.map(it => updatedIds.has(it.$id || '') ? (updatedDocs.find(d => d.$id === it.$id) || it) : it);
                            console.log(`Updated ${updatedDocs.length} existing watch items with new images.`);
                        }
                    }
                }
            }
            // ================= Coin Value Overrides for Leather Belts =================
            const BELT_COIN_OVERRIDES: Record<string, number> = {
                'BEL-71104': 1270,
                'BEL-05270': 1089,
                'BEL-12250': 1360,
                'BEL-92404': 1430
            };
            const computeProductNumberLocal = (item: ShopItem) => {
                const getCategoryPrefixLocal = (category?: string) => {
                    const c = (category || '').toLowerCase();
                    if (c === 'watches') return 'WAT';
                    if (c === 'lighter') return 'LIT';
                    if (c === 'leather belts') return 'BEL';
                    if (c === 'work belts') return 'WBEL';
                    if (c === 'home') return 'HOME';
                    return 'PRD';
                };
                const source = (item.$id || item.name || '').trim();
                let hash = 0;
                for (let i = 0; i < source.length; i++) {
                    hash = ((hash << 5) - hash) + source.charCodeAt(i);
                    hash |= 0;
                }
                const num = Math.abs(hash % 100000);
                return `${getCategoryPrefixLocal(item.category)}-${num.toString().padStart(5, '0')}`;
            };
            augmented = augmented.map(it => {
                try {
                    const cat = (it.category || '').toLowerCase();
                    if (cat === 'leather belts') {
                        const pn = computeProductNumberLocal(it);
                        if (BELT_COIN_OVERRIDES[pn]) {
                            it.coinPrice = BELT_COIN_OVERRIDES[pn];
                        } else if (typeof it.coinPrice !== 'number' || it.coinPrice < 800 || it.coinPrice > 5000) {
                            // Assign random coin value between 840 and 976 inclusive for other leather belts
                            it.coinPrice = Math.floor(840 + Math.random() * (976 - 840 + 1));
                        }
                    } else if (cat === 'watches') {
                        // Normalize watch coin values into 740 - 830 range as requested
                        if (typeof it.coinPrice !== 'number' || it.coinPrice < 740 || it.coinPrice > 830) {
                            it.coinPrice = Math.floor(740 + Math.random() * (830 - 740 + 1)); // 740..830 inclusive
                        }
                    }
                } catch (e) {
                    console.warn('Belt coin override failed for item', it?.name, e);
                }
                return it;
            });

            setShopItems(augmented);

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
            setShopItems([]);
        } finally {
            setLoading(false);
        }
    };

    const dynamicCategories = useMemo<CategoryOption[]>(() => {
        const uniqueCategories = Array.from(
            new Set(
                shopItems
                    .map((item) => (item.category || '').trim())
                    .filter((category): category is string => Boolean(category))
            )
        );

        return uniqueCategories
            .filter((category) => !BASE_CATEGORY_IDS.has(category))
            .sort((a, b) => formatCategoryLabel(a).localeCompare(formatCategoryLabel(b)))
            .map((category) => ({
                id: category,
                label: formatCategoryLabel(category),
                icon: CATEGORY_ICON_OVERRIDES[category] || '🧾'
            }));
    }, [shopItems]);

    const categories = useMemo<CategoryOption[]>(
        () => [...BASE_CATEGORY_CONFIGS, ...dynamicCategories],
        [dynamicCategories]
    );

    useEffect(() => {
        if (selectedCategory !== 'all' && !categories.some((category) => category.id === selectedCategory)) {
            setSelectedCategory('all');
        }
    }, [categories, selectedCategory]);

    // Mixed interleaved product list when "all" is selected
    const mixedAllItems = useMemo(() => {
        if (selectedCategory !== 'all') return [];
        const categoryOrder = Array.from(new Set(shopItems.map(i => i.category)));
        const buckets = categoryOrder.map(cat => shopItems.filter(i => i.category === cat));
        const result: ShopItem[] = [];
        let remaining = buckets.reduce((acc, b) => acc + b.length, 0);
        while (remaining > 0) {
            for (const bucket of buckets) {
                if (bucket.length > 0) {
                    result.push(bucket.shift()!);
                }
            }
            remaining = buckets.reduce((acc, b) => acc + b.length, 0);
        }
        return result;
    }, [shopItems, selectedCategory]);

    const filteredItems = selectedCategory === 'all'
        ? mixedAllItems
        : shopItems.filter(item => item.category === selectedCategory);
    
    console.log('Selected category:', selectedCategory);
    console.log('Total shop items:', shopItems.length);
    console.log('Filtered items:', filteredItems.length);
    console.log('Shop items categories:', shopItems.map(item => item.category));

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

    // Product number helpers
    const getCategoryPrefix = (category?: string) => {
        const c = (category || '').toLowerCase();
        if (c === 'watches') return 'WAT';
        if (c === 'lighter') return 'LIT';
        if (c === 'leather belts') return 'BEL';
        if (c === 'work belts') return 'WBEL';
        if (c === 'home') return 'HOME';
        return 'PRD';
    };
    const computeProductNumber = (item: ShopItem) => {
        const source = (item.$id || item.name || '').trim();
        let hash = 0;
        for (let i = 0; i < source.length; i++) {
            hash = ((hash << 5) - hash) + source.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        const num = Math.abs(hash % 100000);
        return `${getCategoryPrefix(item.category)}-${num.toString().padStart(5, '0')}`;
    };

    // Safer renderer to avoid complex nested JSX ternaries in-place
    const renderProductContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
                    <p className="mt-4 text-gray-600">Loading shop items...</p>
                </div>
            );
        }

        if (filteredItems.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Available</h3>
                    <p className="text-gray-600">Check back later for new items!</p>
                </div>
            );
        }

        return (
            <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-20">
                    {paginatedItems.map((item) => (
                        <div
                            key={item.$id}
                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            {/* Product Image (smaller on mobile, no cropping) */}
                            <div className="relative bg-gray-50 h-28 sm:h-36 md:h-44 flex items-center justify-center">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain cursor-zoom-in p-2"
                                    onClick={() => setPreviewItem(item)}
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
                                        {item.coinPrice.toLocaleString()}
                                    </span>
                                    <span className="text-orange-500 text-sm">🪙</span>
                                </div>

                                {/* Delivery Time */}
                                <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                                    <>
                                        <span>🚚</span>
                                        <span>Delivery: {item.estimatedDelivery || '7-10 days'}</span>
                                    </>
                                </div>

                                {/* Product Number */}
                                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                                    <span>🏷️</span>
                                    <span>Product No: {computeProductNumber(item)}</span>
                                </div>

                                {/* Action Button */}
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
        );
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



        // Show delivery form with celebration for physical items
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
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        {/* Hotel dashboard removed */}
                        {dashboardType === 'villa' && (
                            <>
                                <span className="text-3xl">🏡</span>
                                <span>Indastreet Partners</span>
                                <span className="text-sm text-gray-500">- Coin Shop</span>
                            </>
                        )}
                        {dashboardType === 'therapist' && (
                            <>
                                <span className="text-3xl">💆</span>
                                <span>Therapist Dashboard</span>
                                <span className="text-sm text-gray-500">- Coin Shop</span>
                            </>
                        )}
                        {dashboardType === 'standalone' && (
                            <>
                                <span className="text-3xl">🛒</span>
                                <span>Coin Shop</span>
                            </>
                        )}
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button 
                            onClick={() => {
                                console.log('🍔 CoinShop burger menu clicked! Dashboard context:', {
                                    isFromTherapistDashboard,
                                    dashboardType
                                });
                                if (dashboardType === 'villa') {
                                    // Navigate back to villa dashboard where drawer is available
                                    if (onNavigate) {
                                        onNavigate('villaDashboard');
                                    } else if (onBack) {
                                        onBack();
                                    }
                                } else if (dashboardType === 'therapist' || isFromTherapistDashboard) {
                                    // Navigate back to therapist dashboard where drawer is available
                                    if (onNavigate) {
                                        onNavigate('therapistDashboard');
                                    } else if (onBack) {
                                        onBack();
                                    }
                                } else {
                                    // Use generic drawer for standalone access
                                    setIsDrawerOpen(true);
                                }
                            }} 
                            title={
                                dashboardType === 'villa' ? "Back to Indastreet Partners" :
                                (dashboardType === 'therapist' || isFromTherapistDashboard) ? "Back to Therapist Dashboard" : "Menu"
                            }
                        >
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <AppDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                onNavigate={(page) => {
                    setIsDrawerOpen(false);
                    try { onNavigate(page); } catch {}
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
                    {typeof t === 'function' 
                        ? t('coinShop.header.description') 
                        : "Let's Cash in your coins for awesome products dispatched within 48 hours. Delivery times may vary across Indonesia"}
                </p>
                <div className="text-xs text-gray-600 mt-2 max-w-2xl mx-auto">
                    {typeof t === 'function' 
                        ? t('coinShop.notice.internationalShipping') 
                        : 'For countries outside Indonesia, recipients pay postal costs for cash-in gifts at local postal rates. Delivery times vary by destination.'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    By cashing in, you agree to our
                    {' '}
                    <button
                        className="text-orange-600 underline"
                        onClick={() => {
                            if (typeof (onTermsClick) === 'function') {
                                onTermsClick();
                            } else if (typeof (onNavigate) === 'function') {
                                onNavigate('serviceTerms');
                            }
                        }}
                    >
                        Shop Terms & Conditions
                    </button>
                    .
                </div>
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
                {renderProductContent()}
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
                            <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                                {typeof t === 'function' 
                                    ? t('coinShop.notice.internationalShipping') 
                                    : 'For countries outside Indonesia, recipients pay postal costs for cash-in gifts at local postal rates. Delivery times vary by destination.'}
                            </div>
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

            {/* Image Preview Modal */}
            {previewItem && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewItem(null)}
                >
                    <button
                        onClick={() => setPreviewItem(null)}
                        aria-label="Close preview"
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                    >
                        ✕
                    </button>
                    <div
                        className="bg-white rounded-xl max-w-3xl w-full p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full grid grid-cols-1 gap-3">
                            <img
                                src={previewItem.imageUrl}
                                alt={previewItem.name}
                                className="max-h-[70vh] object-contain rounded-lg"
                            />
                            <div className="px-1 pb-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 text-base">{previewItem.name}</h3>
                                    <div className="flex items-center gap-1 text-orange-600 font-bold">
                                        <span>{previewItem.coinPrice.toLocaleString()}</span>
                                        <span>🪙</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{previewItem.description}</p>
                                <div className="text-xs text-gray-500">🏷️ Product No: {computeProductNumber(previewItem)}</div>
                            </div>
                        </div>
                    </div>
                </div>
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

