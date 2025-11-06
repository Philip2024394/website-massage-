import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';

interface AromatherapyMassagePageProps {
    onBack?: () => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;

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

const AromatherapyMassagePage: React.FC<AromatherapyMassagePageProps> = ({ 
    onBack, 
    onNavigate,
    onMassageJobsClick,

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
                    <h1 className="text-3xl font-bold text-gray-900">Aromatherapy Massage</h1>
                </div>
                )}

                {/* Header */}
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
                    <h1 className="text-3xl font-bold text-gray-900">Aromatherapy Massage</h1>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Aromatherapy Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Aromatherapy massage combines the therapeutic benefits of massage with the healing properties 
                                of essential oils. These natural plant extracts are carefully selected for their specific 
                                therapeutic qualities and blended with carrier oils for a truly holistic experience.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Enhanced relaxation and stress relief</li>
                                <li>Improved mood and emotional well-being</li>
                                <li>Better sleep quality</li>
                                <li>Boosted immune system</li>
                                <li>Pain and inflammation reduction</li>
                                <li>Increased energy and mental clarity</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Popular Essential Oils</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                                <div>
                                    <strong>Lavender:</strong> Relaxation and sleep
                                </div>
                                <div>
                                    <strong>Eucalyptus:</strong> Respiratory relief
                                </div>
                                <div>
                                    <strong>Peppermint:</strong> Energy and focus
                                </div>
                                <div>
                                    <strong>Ylang Ylang:</strong> Stress reduction
                                </div>
                                <div>
                                    <strong>Rosemary:</strong> Mental clarity
                                </div>
                                <div>
                                    <strong>Chamomile:</strong> Calming and soothing
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Book Aromatherapy Massage
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

export default AromatherapyMassagePage;
