import React from 'react';
import { createPortal } from 'react-dom';
import { 
    Home, Briefcase, Users, Building, MapPin, Heart, 
    Info, BookOpen, Phone, HelpCircle,
    X as CloseIcon
} from 'lucide-react';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    // Restrict rendering to HomePage context only
    isHome?: boolean;
    
    // Translation function
    t?: (key: string) => string;
    
    // Navigation callbacks
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    onQRCodeClick?: () => void;
    
    // Data for display
    therapists?: any[];
    places?: any[];
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
    isOpen,
    onClose,
    isHome = true,
    t,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onNavigate,
    onTermsClick,
    onPrivacyClick,
    onQRCodeClick,
    therapists = [],
    places = []
}) => {
    console.log('🚪 AppDrawer rendered with isOpen:', isOpen);
    console.log('🔤 AppDrawer t prop:', { t, tType: typeof t, tIsFunction: typeof t === 'function' });
    // Enforce drawer availability only on HomePage
    if (!isHome) return null;
    if (!isOpen) return null;

    // Default fallback translations
    const translate = (key: string): string => {
        if (t && typeof t === 'function') {
            try {
                const result = t(key);
                // If translation returns the key itself, it means translation not found
                if (result !== key) return result;
            } catch (error) {
                console.error('Translation function error:', error);
            }
        }
        
        // Fallback translations for AppDrawer
        const fallbacks: Record<string, string> = {
            'home.menu.sections.jobPosting': 'Job Posting',
            'home.menu.sections.loginCreateAccount': 'Login / Create Account',
            'home.menu.sections.company': 'Company',
            'home.menu.massageJobs': 'Massage Jobs',
            'home.menu.massageJobsDesc': 'Find opportunities',
            'home.menu.hotel': 'Hotel',
            'home.menu.hotelDesc': 'Hotel partner portal',
            'home.menu.villa': 'Indastreet Partners',
            'home.menu.villaDesc': 'Partner portal',
            'home.menu.therapists': 'Therapists',
            'home.menu.therapistsDesc': 'Therapist portal',
            'home.menu.massageSpa': 'Massage Spa',
            'home.menu.massageSpaDesc': 'Spa partner portal',
            'home.menu.agent': 'Indastreet Partner',
            'home.menu.agentDesc': 'Partner portal',
            'home.menu.customer': 'Guest',
            'home.menu.customerDesc': 'Guest portal',
            'home.menu.aboutUs': 'About Us',
            'home.menu.aboutUsDesc': 'Learn about us',
            'home.menu.howItWorks': 'How It Works',
            'home.menu.howItWorksDesc': 'Getting started',
            'home.menu.blog': 'Blog',
            'home.menu.blogDesc': 'Read our articles',
            'home.menu.contact': 'Contact',
            'home.menu.contactDesc': 'Get in touch',
            'home.menu.termsOfService': 'Terms of Service',
            'home.menu.termsDesc': 'Legal terms',
            'home.menu.privacyPolicy': 'Privacy Policy',
            'home.menu.privacyDesc': 'Privacy information',
        };
        
        return fallbacks[key] || key;
    };

    const go = (page?: string) => {
        if (page && onNavigate) {
            try { onNavigate(page); } catch {}
            onClose();
        }
    };

    const handleItemClick = (callback?: () => void, fallbackPage?: string) => {
        console.log('🔥 AppDrawer button clicked!');
        console.log('   - callback exists:', !!callback);
        console.log('   - fallback page:', fallbackPage);
        console.log('   - onNavigate exists:', !!onNavigate);
        
        if (callback) {
            try {
                console.log('   - Executing callback...');
                callback();
                console.log('   - Callback executed successfully');
            } catch (error) {
                console.error('   - Callback error:', error);
            }
            onClose();
        } else if (fallbackPage && onNavigate) {
            console.log('   - Using fallback navigation to:', fallbackPage);
            onNavigate(fallbackPage);
            onClose();
        } else {
            console.warn('   - No callback or fallback available!');
        }
    };

    if (!isOpen) return null;

    const content = (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
            <div className="fixed inset-0" role="dialog" aria-modal="true" style={{ zIndex: 99999 }}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={onClose}
            />
            
            {/* Drawer Panel */}
            <div 
                className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ zIndex: 99999 }}
            >
                
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-black">
                    <h2 className="font-bold text-2xl">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <CloseIcon className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Scrollable Menu Content */}
                <nav className="flex-grow overflow-y-auto p-4">
                    <div className="space-y-3">
                        
                        {/* IMPORTANT: Top Priority Items */}
                        <button 
                            onClick={() => handleItemClick(undefined, 'indastreet-partners')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">Accommodation With Massage Service</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'joinIndastreet')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-medium">Join Indastreet</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(onMassageJobsClick, 'massageJobs')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            <span className="font-medium">Massage Jobs</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'how-it-works')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">How It Works</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'about-us')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">About Us</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'company-profile')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">Company Profile</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'contact-us')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-medium">Contact Us</span>
                        </button>

                        <button 
                            onClick={() => handleItemClick(undefined, 'blog')}
                            className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                        >
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="font-medium">Blog</span>
                        </button>

                        {/* LOCATIONS */}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Locations
                            </h3>
                            <button 
                                onClick={() => handleItemClick(undefined, 'massage-bali')}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Massage in Bali</span>
                            </button>
                        </div>

                        {/* MASSAGE SERVICES */}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Massage Services
                            </h3>
                            <button 
                                onClick={() => handleItemClick(() => onNavigate?.('balinese-massage'))}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-medium">Balinese Massage</span>
                            </button>

                            <button 
                                onClick={() => handleItemClick(() => onNavigate?.('deep-tissue-massage'))}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-medium">Deep Tissue Massage</span>
                            </button>
                        </div>

                        {/* HELP & SUPPORT */}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Help & Support
                            </h3>
                            <button 
                                onClick={() => handleItemClick(() => onNavigate?.('faq'))}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">FAQ</span>
                            </button>
                        </div>

                        {/* LOGIN PORTALS - At the end */}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Login / Create Account
                            </h3>
                            
                            <button 
                                onClick={() => handleItemClick(onTherapistPortalClick, 'therapistLogin')}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">Therapist Portal</span>
                            </button>

                            <button 
                                onClick={() => handleItemClick(onMassagePlacePortalClick, 'massagePlaceLogin')}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">Massage Spa Portal</span>
                            </button>

                            <button 
                                onClick={() => handleItemClick(() => onNavigate?.('website-management'))}
                                className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-orange-600 transition-colors py-2"
                            >
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                <span className="font-medium">Website Partners Portal</span>
                            </button>
                        </div>

                        {/* FOOTER LINKS */}
                        <div className="pt-4 mt-6 border-t border-gray-300">
                            <div className="flex justify-center gap-4 px-4 py-2">
                                {onQRCodeClick && (
                                    <button 
                                        onClick={() => handleItemClick(onQRCodeClick)}
                                        className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                                    >
                                        QR Code
                                    </button>
                                )}
                                {(onQRCodeClick && (onTermsClick || onPrivacyClick)) && (
                                    <span className="text-xs text-gray-400">•</span>
                                )}
                                {onTermsClick && (
                                    <button 
                                        onClick={() => handleItemClick(onTermsClick)}
                                        className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                                    >
                                        Terms
                                    </button>
                                )}
                                {onTermsClick && onPrivacyClick && (
                                    <span className="text-xs text-gray-400">•</span>
                                )}
                                {onPrivacyClick && (
                                    <button 
                                        onClick={() => handleItemClick(onPrivacyClick)}
                                        className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                                    >
                                        Privacy
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
        </>
    );

    if (typeof document !== 'undefined' && document.body) {
        return createPortal(content, document.body);
    }
    return content;
};

