import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';

interface ReflexologyMassagePageProps {
    onBack?: () => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onHotelPortalClick?: () => void;
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

const ReflexologyMassagePage: React.FC<ReflexologyMassagePageProps> = ({ 
    onBack, 
    onNavigate,
    onMassageJobsClick,

    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onHotelPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    t: _t 
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
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

            <div className="p-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                {onBack && (
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Reflexology Massage</h1>
                </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Reflexology?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Reflexology is a therapeutic method of relieving pain by stimulating predefined pressure 
                                points on the feet and hands. This ancient practice is based on the principle that these 
                                reflex points correspond to different body organs and systems.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Promotes deep relaxation and stress relief</li>
                                <li>Improves circulation throughout the body</li>
                                <li>Helps balance the nervous system</li>
                                <li>May boost immune system function</li>
                                <li>Assists with pain management</li>
                                <li>Enhances overall well-being</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">How It Works</h3>
                            <p className="text-gray-600 leading-relaxed">
                                During a reflexology session, a trained therapist applies pressure to specific points on 
                                your feet, hands, and sometimes ears. These pressure points are believed to correspond to 
                                different organs and systems in your body, promoting healing and balance.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Expect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                You'll remain fully clothed during the session, removing only shoes and socks. The therapist 
                                will examine your feet and then use thumb, finger, and hand techniques to apply pressure to 
                                various points. Sessions typically last 30-60 minutes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Book Reflexology Massage
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

export default ReflexologyMassagePage;
