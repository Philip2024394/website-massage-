// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';

interface HotStoneMassagePageProps {
    onBack?: () => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
    t?: any;
}

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const HotStoneMassagePage: React.FC<HotStoneMassagePageProps> = ({
    onBack,
    onNavigate,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    t: _t = {}
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            {/* Universal Header */}
            <UniversalHeader 
                onMenuClick={() => setIsMenuOpen(true)}
                showLanguageSelector={false}
            />
            
            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick || (() => {})}
                onVillaPortalClick={onVillaPortalClick || (() => {})}
                onTherapistPortalClick={onTherapistPortalClick || (() => {})}
                onMassagePlacePortalClick={onMassagePlacePortalClick || (() => {})}
                onAgentPortalClick={onAgentPortalClick || (() => {})}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick || (() => {})}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            <div className="p-4 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                {onBack && (
                <div className="flex items-center gap-4 pb-20 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Hot Stone Massage</h1>
                </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Hot Stone Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Hot stone massage involves the use of smooth, heated basalt stones placed on key points 
                                of the body and used as an extension of the therapist's hands. The heat from the stones 
                                penetrates deep into the muscles, providing a uniquely relaxing experience.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Deep muscle relaxation and tension relief</li>
                                <li>Improved blood circulation</li>
                                <li>Stress and anxiety reduction</li>
                                <li>Enhanced mental clarity</li>
                                <li>Relief from chronic pain and arthritis</li>
                                <li>Better sleep quality</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Expect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                The heated stones are placed on specific points along your spine, in the palms of your hands, 
                                and between your toes. The therapist may also hold the stones while massaging your body with 
                                Swedish massage techniques. The stones are typically heated to 130-145 degrees Fahrenheit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pb-20">
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Book Hot Stone Massage
                    </button>
                    <button 
                        onClick={() => onNavigate && onNavigate('massageTypes')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        View All Massage Types
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default HotStoneMassagePage;

