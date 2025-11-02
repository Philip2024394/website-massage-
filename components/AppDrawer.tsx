import React from 'react';
import { 
    Home, Briefcase, Users, Building, Hotel, MapPin, Heart, 
    Info, BookOpen, Phone, HelpCircle,
    X as CloseIcon
} from 'lucide-react';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    
    // Navigation callbacks
    onMassageJobsClick?: () => void;
    onHotelPortalClick: () => void;
    onVillaPortalClick: () => void;
    onTherapistPortalClick: () => void;
    onMassagePlacePortalClick: () => void;
    onAgentPortalClick: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick: () => void;
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
    if (!isOpen) return null;

    const handleItemClick = (callback?: () => void) => {
        callback?.();
        onClose();
    };

    return (
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
                        <span className="text-black">inda</span>
                        <span className="text-orange-500">Street</span>
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
                                Job Posting
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
                                            Massage Jobs
                                        </p>
                                        <p className="text-xs text-gray-500">Find opportunities</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* LOGIN / CREATE ACCOUNT SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                Login / Create Account
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => handleItemClick(onHotelPortalClick)}
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 group transform hover:scale-105"
                                >
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                        <Hotel className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                            Hotel
                                        </p>
                                        <p className="text-xs text-gray-500">Hotel partner portal</p>
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
                                            Villa
                                        </p>
                                        <p className="text-xs text-gray-500">Villa partner portal</p>
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
                                            Therapists
                                        </p>
                                        <p className="text-xs text-gray-500">Therapist portal</p>
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
                                            Massage Spa
                                        </p>
                                        <p className="text-xs text-gray-500">Spa partner portal</p>
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
                                            Agent
                                        </p>
                                        <p className="text-xs text-gray-500">Agent portal</p>
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
                                                Customer
                                            </p>
                                            <p className="text-xs text-gray-500">Customer portal</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* COMPANY SECTION */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                Company
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
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">About Us</p>
                                        <p className="text-xs text-gray-500">Learn about us</p>
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
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">How It Works</p>
                                        <p className="text-xs text-gray-500">Getting started</p>
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
                                        <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">Blog</p>
                                        <p className="text-xs text-gray-500">Read our articles</p>
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
                                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Admin
                                    </button>
                                )}
                                {(onTermsClick || onPrivacyClick) && (
                                    <span className="text-xs text-gray-400">•</span>
                                )}
                                {onTermsClick && (
                                    <button 
                                        onClick={() => handleItemClick(onTermsClick)}
                                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
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
                                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
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
    );
};

