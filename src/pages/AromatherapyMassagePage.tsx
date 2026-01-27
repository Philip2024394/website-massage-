import React, { useState } from 'react';
// Drawer is home-only; not used here
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FlyingButterfly from '../components/FlyingButterfly';

interface AromatherapyMassagePageProps {
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

const AromatherapyMassagePage: React.FC<AromatherapyMassagePageProps> = ({ 
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
    t: _t 
}) => {
    // No drawer state here; drawer is restricted to HomePage

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Quick Access Buttons */}
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('notifications');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Notifications"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('referral');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Invite Friends"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        <button onClick={() => onNavigate && onNavigate('home')} title="Home" style={{ zIndex: 9999, position: 'relative' }}>
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            

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
