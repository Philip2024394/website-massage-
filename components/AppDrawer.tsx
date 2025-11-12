import React from 'react';
import { 
    Home, Briefcase, Users, Building, MapPin, Heart, 
    Info, BookOpen, Phone, HelpCircle, Hotel,
    X as CloseIcon
} from 'lucide-react';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    
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
    
    // Data for display
    therapists?: any[];
    places?: any[];
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
    isOpen,
    onClose,
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
    therapists = [],
    places = []
}) => {
    console.log('🚪 AppDrawer rendered with isOpen:', isOpen);
    console.log('🔤 AppDrawer t prop:', { t, tType: typeof t, tIsFunction: typeof t === 'function' });
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
            'home.menu.villa': 'Villa',
            'home.menu.villaDesc': 'Villa partner portal',
            'home.menu.therapists': 'Therapists',
            'home.menu.therapistsDesc': 'Therapist portal',
            'home.menu.massageSpa': 'Massage Spa',
            'home.menu.massageSpaDesc': 'Spa partner portal',
            'home.menu.agent': 'Agent',
            'home.menu.agentDesc': 'Agent portal',
            'home.menu.customer': 'Customer',
            'home.menu.customerDesc': 'Customer portal',
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

    const handleItemClick = (callback?: () => void) => {
        callback?.();
        onClose();
    };

    return (
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
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                onClick={onClose}
            />
            
            {/* Drawer Panel */}
            <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-gray-200">
                    <h2 className="font-bold text-2xl">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Close menu"
                    >
                        <CloseIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Scrollable Menu Content */}
                <nav className="flex-grow overflow-y-auto p-4">
                    <div className="space-y-2">
                        
                        {/* JOB POSTING SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                {translate('home.menu.sections.jobPosting')}
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(onMassageJobsClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {translate('home.menu.massageJobs')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.massageJobsDesc')}</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* LOGIN / CREATE ACCOUNT SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                {translate('home.menu.sections.loginCreateAccount')}
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(onHotelPortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-orange-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                        <Hotel className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            {translate('home.menu.hotel')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.hotelDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(onVillaPortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-pink-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                                        <Home className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                                            {translate('home.menu.villa')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.villaDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(onTherapistPortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-teal-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                                            {translate('home.menu.therapists')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.therapistsDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(onMassagePlacePortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-indigo-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                                        <Building className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                            {translate('home.menu.massageSpa')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.massageSpaDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(onAgentPortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-yellow-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">
                                            {translate('home.menu.agent')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.agentDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('website-management'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                        <Building className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                            Website Management
                                        </p>
                                        <p className="text-xs text-gray-500">Apply for partnership</p>
                                    </div>
                                </button>

                                {onCustomerPortalClick && (
                                    <button 
                                        onClick={() => handleItemClick(onCustomerPortalClick)}
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-red-500 group transform hover:scale-105"
                                    >
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <Heart className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                                                {translate('home.menu.customer')}
                                            </p>
                                            <p className="text-xs text-gray-500">{translate('home.menu.customerDesc')}</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* COMPANY SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                {translate('home.menu.sections.company')}
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('about-us'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                                        <Info className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                            {translate('home.menu.aboutUs')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.aboutUsDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('how-it-works'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                                        <HelpCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                            {translate('home.menu.howItWorks')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.howItWorksDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('blog'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                            {translate('home.menu.blog')}
                                        </p>
                                        <p className="text-xs text-gray-500">{translate('home.menu.blogDesc')}</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('indastreet-partners'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-orange-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            🤝 Indastreet Partners
                                        </p>
                                        <p className="text-xs text-gray-500">View our partner directory</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('about-us'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                                        <Phone className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">Contact Us</p>
                                        <p className="text-xs text-gray-500">Get in touch</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* LOCATIONS SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                Locations
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('massage-bali'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-orange-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                                            Massage in Bali
                                        </p>
                                        {(therapists.length > 0 || places.length > 0) && (
                                            <p className="text-xs text-gray-500">
                                                {therapists.length + places.length}+ therapists
                                            </p>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* SERVICES SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                Services
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('balinese-massage'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Balinese Massage</p>
                                        <p className="text-xs text-gray-500">Traditional therapy</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('deep-tissue-massage'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Deep Tissue Massage</p>
                                        <p className="text-xs text-gray-500">Deep relaxation</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* HELP & SUPPORT SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                Help & Support
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(() => onNavigate?.('faq'))}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-slate-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                                        <HelpCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-slate-600 transition-colors">FAQ</p>
                                        <p className="text-xs text-gray-500">Common questions</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* FOOTER LINKS */}
                        <div className="pt-4 mt-6 border-t border-gray-300">
                            <div className="flex justify-center gap-4 px-4 py-2">
                                {onAdminPortalClick && (
                                    <button 
                                        onClick={() => handleItemClick(onAdminPortalClick)}
                                        className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
                                    >
                                        Admin
                                    </button>
                                )}
                                {(onAdminPortalClick && (onTermsClick || onPrivacyClick)) && (
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
};

