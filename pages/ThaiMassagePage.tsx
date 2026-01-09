import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import UniversalHeader from '../components/shared/UniversalHeader';

interface ThaiMassagePageProps {
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

const ThaiMassagePage: React.FC<ThaiMassagePageProps> = ({ 
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
                        {/* Home Button */}
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('home');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Home"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        
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

            <div className="p-4 pb-20">
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
                    <h1 className="text-3xl font-bold text-gray-900">Thai Massage</h1>
                </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">What is Thai Massage?</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Thai massage is an ancient healing practice that combines acupressure, Indian Ayurvedic 
                                principles, and assisted yoga postures. This traditional therapy involves gentle pressure 
                                and stretching techniques to relax the whole body.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Improved flexibility and range of motion</li>
                                <li>Enhanced energy levels</li>
                                <li>Stress and tension relief</li>
                                <li>Better circulation</li>
                                <li>Mental clarity and focus</li>
                                <li>Pain relief and muscle relaxation</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Expect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Thai massage is performed on a mat on the floor, and you'll wear loose, comfortable clothing. 
                                The therapist will use their hands, thumbs, elbows, forearms, and sometimes feet to reduce 
                                tension in your muscles. The session includes gentle stretching and rocking motions.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Traditional Elements</h3>
                            <div className="text-gray-600">
                                <p>Thai massage incorporates principles from traditional Thai medicine, including:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Sen energy lines (similar to meridians in Chinese medicine)</li>
                                    <li>Yoga-like stretches and poses</li>
                                    <li>Rhythmic pressing and palm compression</li>
                                    <li>Joint mobilization techniques</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Book Thai Massage
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

export default ThaiMassagePage;
