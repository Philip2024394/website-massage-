// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import UserSolidIcon from './icons/UserSolidIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import HomeIcon from './icons/HomeIcon';
import MapPinIcon from './icons/MapPinIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface LoginOption {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
}

interface NavigationLink {
    title: string;
    page: string;
    icon: string;
    category: 'company' | 'locations' | 'services' | 'resources' | 'help';
}

interface LoginDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSelect?: (loginType: string) => void;
    onNavigate?: (page: string) => void;
    t?: any;
}

const LoginDrawer: React.FC<LoginDrawerProps> = ({ isOpen, onClose, onLoginSelect, onNavigate }) => {
    const loginOptions: LoginOption[] = [
        {
            id: 'admin',
            title: 'Admin',
            icon: DocumentTextIcon,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'System administration and management'
        },
        {
            id: 'hotel',
            title: 'Hotel',
            icon: HomeIcon,
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'Hotel management and bookings'
        },
        {
            id: 'villa',
            title: 'Villa',
            icon: MapPinIcon,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Villa rental management'
        },
        {
            id: 'agent',
            title: 'Agent',
            icon: BriefcaseIcon,
            color: 'bg-purple-500 hover:bg-purple-600',
            description: 'Sales agent portal'
        },
        {
            id: 'therapist',
            title: 'Therapist',
            icon: UserSolidIcon,
            color: 'bg-pink-500 hover:bg-pink-600',
            description: 'Therapist dashboard and profile'
        },
        {
            id: 'massagePlace',
            title: 'Massage Place',
            icon: HomeIcon,
            color: 'bg-brand-orange hover:bg-brand-orange-dark',
            description: 'Massage center management'
        }
    ];

    const navigationLinks: NavigationLink[] = [
        // Company
        { title: 'About Us', page: 'about', icon: '🏢', category: 'company' },
        { title: 'How It Works', page: 'how-it-works', icon: '❓', category: 'company' },
        { title: 'Blog', page: 'blog', icon: '📰', category: 'company' },
        { title: 'Contact Us', page: 'contact', icon: '📧', category: 'company' },
        
        // Locations
        { title: 'Massage in Bali', page: 'massage-bali', icon: '🌺', category: 'locations' },
        
        // Services
        { title: 'Balinese Massage', page: 'balinese-massage', icon: '🌿', category: 'services' },
        { title: 'Deep Tissue Massage', page: 'deep-tissue-massage', icon: '💪', category: 'services' },
        
        // Help & Resources
        { title: 'FAQ', page: 'faq', icon: '❔', category: 'help' },
    ];

    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Login Portal</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-brand-orange-light mt-2 text-sm">Select your login type</p>
                </div>

                {/* Login Options */}
                <div className="p-4 " style={{ height: 'calc(100vh - 140px)', paddingBottom: '6rem' }}>
                    {/* Login Buttons Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-2">Login Portal</h3>
                        <div className="space-y-3">
                            {loginOptions.map((option) => {
                                const IconComponent = option.icon;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            onLoginSelect?.(option.id);
                                            onClose();
                                        }}
                                        className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`${option.color} p-3 rounded-lg transition-all duration-200 group-hover:scale-110`}>
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors">
                                                    {option.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {option.description}
                                                </p>
                                            </div>
                                            <div className="text-gray-400 group-hover:text-brand-orange transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Links Section */}
                    <div className="border-t pt-4">
                        {/* Company Section */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Company</h3>
                            <div className="space-y-1">
                                {navigationLinks.filter(link => link.category === 'company').map((link) => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavigate(link.page)}
                                        className="w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 group"
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                        <span className="text-gray-700 group-hover:text-brand-orange font-medium">{link.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Locations Section */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Locations</h3>
                            <div className="space-y-1">
                                {navigationLinks.filter(link => link.category === 'locations').map((link) => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavigate(link.page)}
                                        className="w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 group"
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                        <span className="text-gray-700 group-hover:text-brand-orange font-medium">{link.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Services</h3>
                            <div className="space-y-1">
                                {navigationLinks.filter(link => link.category === 'services').map((link) => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavigate(link.page)}
                                        className="w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 group"
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                        <span className="text-gray-700 group-hover:text-brand-orange font-medium">{link.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 px-2">Help & Support</h3>
                            <div className="space-y-1">
                                {navigationLinks.filter(link => link.category === 'help').map((link) => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavigate(link.page)}
                                        className="w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 group"
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                        <span className="text-gray-700 group-hover:text-brand-orange font-medium">{link.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <span className="text-2xl font-bold text-white">Indo</span>
                                <span className="text-2xl font-bold text-brand-orange">street</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Secure login portal for all user types
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginDrawer;