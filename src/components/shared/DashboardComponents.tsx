// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import type { Page } from '../../types/pageTypes';
import { Star, QrCode, Tag, Building, Menu, Users, Bell, Package, Settings, X } from 'lucide-react';
import { getDisplayRating, getDisplayReviewCount, formatRating } from '../../utils/ratingUtils';
import { useTranslations } from '../../lib/useTranslations';

interface ProviderCard {
    id: string | number;
    name: string;
    type: 'therapist' | 'place';
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    pricing: Record<string, number>;
    discount: number;
    whatsappNumber?: string;
    description: string;
    massageTypes: string[];
    status?: 'Available' | 'Busy' | 'Offline';
    languages?: string[];
}

// Shared Discount Card Component
export const DiscountCard: React.FC<{ 
    data: ProviderCard;
    onQrOpen: (link: string) => void;
    placeholderImage: string;
    hotelVillaName: string;
    type: 'hotel' | 'villa';
}> = ({ data: p, onQrOpen, placeholderImage, hotelVillaName: _hotelVillaName, type: _type }) => {
    const menuUrl = typeof window !== 'undefined' ? window.location.href : '';
    const providerMenuUrl = `${menuUrl}?provider=${encodeURIComponent(`${p.type}-${p.id}`)}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col transition-transform transform hover:scale-[1.02]">
            <div className="relative">
                <img src={p.image || placeholderImage} alt={p.name} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
                    {p.discount}% OFF
                </div>
                <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
                    <h3 className="font-bold text-white text-xl">{p.name}</h3>
                    <p className="text-xs text-gray-200">{p.location}</p>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-yellow-500">
                        <Star className="w-5 h-5" fill="currentColor" />
                        <span className="text-sm font-bold ml-1.5">{formatRating(getDisplayRating(p.rating, p.reviewCount))}</span>
                        <span className="text-xs text-gray-500 ml-2">({getDisplayReviewCount(p.reviewCount)} reviews)</span>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {p.type}
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-5 flex-grow">{p.description}</p>

                <div className="grid grid-cols-3 gap-3 text-sm mb-5">
                    {(['60','90','120'] as Array<keyof typeof p.pricing>).map((d) => (
                        <div key={d} className="text-center p-3 bg-gray-50 rounded-lg border">
                            <div className="text-xs text-gray-500">{d} min</div>
                            <div className="line-through text-gray-400 text-xs">Rp {p.pricing[d]?.toLocaleString() || 0}</div>
                            <div className="font-bold text-orange-600 text-base">Rp {Math.round((p.pricing[d] || 0) * (1 - p.discount/100)).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                    <button onClick={() => onQrOpen(providerMenuUrl)} className="flex-1 text-center px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                        <QrCode size={16} />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Shared Side Drawer Component
export const SideDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    providersCount: number;
    type: 'hotel' | 'villa';
    onNavigate?: (page: Page) => void;
}> = ({ isOpen, onClose, activeTab, setActiveTab, providersCount, type, onNavigate }) => {
    const { t } = useTranslations();
    
    const navigationItems = [
        { id: 'analytics', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: t('dashboard.analytics') },
        { id: 'discounts', icon: <Tag className="w-5 h-5" />, label: t('dashboard.discounts') },
        { id: 'profile', icon: <Building className="w-5 h-5" />, label: t('dashboard.profile') },
        { id: 'menu', icon: <Menu className="w-5 h-5" />, label: t('dashboard.menu'), badge: providersCount > 0 ? providersCount : undefined },
        { id: 'feedback', icon: <Star className="w-5 h-5" />, label: t('dashboard.feedback') },
        { id: 'concierge', icon: <Users className="w-5 h-5" />, label: t('dashboard.concierge') },
        { id: 'commissions', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: t('dashboard.commissions') },
        { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: t('dashboard.notifications') },
        { id: 'services-settings', icon: <Settings className="w-5 h-5" />, label: t('dashboard.services') },
        { id: 'membership', icon: <Package className="w-5 h-5" />, label: t('dashboard.membership') },
        { id: 'coin-rewards', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Coin Rewards' },
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
                {/* Drawer Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">{type === 'hotel' ? 'Hotel' : 'Villa'} Menu</h2>
                        <p className="text-sm text-orange-100">Navigation</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col p-4 space-y-2  h-[calc(100vh-140px)]">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                onClose();
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                activeTab === item.id
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Drawer Footer - Footer Links & Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t">
                    {/* Footer Links */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => {
                                    onClose();
                                    onNavigate?.('adminLogin');
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                            >
                                Admin
                            </button>
                            <span className="text-xs text-gray-400">•</span>
                            <button 
                                onClick={() => {
                                    onClose();
                                    onNavigate?.('serviceTerms');
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                            >
                                Terms
                            </button>
                            <span className="text-xs text-gray-400">•</span>
                            <button 
                                onClick={() => {
                                    onClose();
                                    onNavigate?.('privacy');
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                            >
                                Privacy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Shared Header Component
export const DashboardHeader: React.FC<{
    type: 'hotel' | 'villa';
    onMenuClick: () => void;
}> = ({ type, onMenuClick }) => {
    return (
        <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
            <div className="flex items-center justify-between">
                <h1 className="text-base sm:text-2xl font-bold text-gray-800">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span> {type === 'hotel' ? 'Hotel' : 'Villa'}
                </h1>
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5 text-orange-500" />
                </button>
            </div>
        </header>
    );
};

// Shared Footer Component
export const DashboardFooter: React.FC<{
    type: 'hotel' | 'villa';
}> = ({ type }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="px-4 py-3 max-w-[430px] sm:max-w-5xl mx-auto">
                <div className="flex items-center justify-center">
                    <p className="text-xs text-gray-500 text-center">
                        &copy; 2025 <span className="text-black font-semibold">Inda</span><span className="text-orange-500 font-semibold">street</span> {type === 'hotel' ? 'Hotel' : 'Villa'} Dashboard
                    </p>
                </div>
            </div>
        </footer>
    );
};