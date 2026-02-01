// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import UniversalHeader from '../components/shared/UniversalHeader';

interface HowItWorksPageProps {
    onNavigate?: (page: string) => void;
    t?: any;
    language?: 'en' | 'id';
    // Add navigation props for the drawer
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
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
    onNavigate,
    t,
    language = 'id',
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
    places = []
}) => {
    const [activeTab, setActiveTab] = useState<'therapist' | 'hotel' | 'employer' | 'agent'>('therapist');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50  w-full max-w-full">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm w-full max-w-full">
                <div className="flex justify-between items-center">
                    {/* Back Arrow */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                            <span className="font-medium hidden sm:inline">
                                {language === 'id' ? 'Beranda' : 'Home'}
                            </span>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        {/* Home Button */}
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-2 hover:bg-gray-100 rounded-full"
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
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}

                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
                language={language}
            />

            {/* Hero Section */}
            <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20 relative bg-cover bg-center w-full max-w-full overflow-hidden"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382)',
                }}
            >
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl font-bold mb-6">{t?.howItWorks?.heroTitle || 'How IndaStreet Works'}</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {t?.howItWorks?.heroSubtitle || "Your Complete Guide to Indonesia's Leading Wellness Marketplace"}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-6xl mx-auto px-4 mt-8 ">
                <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-wrap gap-2 max-w-full">
                    <button
                        onClick={() => setActiveTab('therapist')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'therapist'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {t?.howItWorks?.tabTherapists || 'Therapists'}
                    </button>
                    <button
                        onClick={() => setActiveTab('hotel')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'hotel'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {t?.howItWorks?.tabHotels || 'Hotels & Villas'}
                    </button>
                    <button
                        onClick={() => setActiveTab('employer')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'employer'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {t?.howItWorks?.tabEmployers || 'Employers'}
                    </button>
                    <button
                        onClick={() => setActiveTab('agent')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'agent'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {t?.howItWorks?.tabAgents || 'Agents'}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* For Therapists */}
                {activeTab === 'therapist' && (
                    <div className="space-y-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t?.howItWorks?.therapistTitle || 'How Therapists Succeed on IndaStreet'}</h2>
                            <p className="text-xl text-gray-600">{t?.howItWorks?.therapistSubtitle || 'Build your career, find opportunities, grow your client base'}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.step1Title || 'Create Your Profile'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.step1Desc || 'Sign up and create a detailed profile showcasing your certifications, specializations, experience, and languages.'}
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step1Item1 || 'Upload certifications'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step1Item2 || 'List specializations'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step1Item3 || 'Add work experience'}
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.step2Title || 'Choose Your Membership'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.step2Desc || 'Select a membership package that fits your needs. Get verified and featured in search results.'}
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step2Item1 || '1, 3, 6, or 12 months'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step2Item2 || 'Verified badge'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step2Item3 || 'Priority placement'}
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">3</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.step3Title || 'Start Getting Bookings'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.step3Desc || 'Receive booking requests from hotels, spas, and direct clients. Accept jobs that fit your schedule.'}
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step3Item1 || 'Instant notifications'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step3Item2 || 'WhatsApp integration'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t?.howItWorks?.step3Item3 || 'Flexible scheduling'}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border-2 border-orange-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t?.howItWorks?.membershipBenefitsTitle || 'Membership Benefits'}</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{t?.howItWorks?.benefit1Title || 'Enhanced Visibility'}</h4>
                                        <p className="text-gray-600 text-sm">{t?.howItWorks?.benefit1Desc || 'Appear at the top of search results'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{t?.howItWorks?.benefit2Title || 'Direct Client Bookings'}</h4>
                                        <p className="text-gray-600 text-sm">{t?.howItWorks?.benefit2Desc || 'Receive bookings from verified clients'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{t?.howItWorks?.benefit3Title || 'Professional Dashboard'}</h4>
                                        <p className="text-gray-600 text-sm">{t?.howItWorks?.benefit3Desc || 'Manage bookings and profile easily'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{t?.howItWorks?.benefit4Title || 'Verified Badge'}</h4>
                                        <p className="text-gray-600 text-sm">{t?.howItWorks?.benefit4Desc || 'Build trust with verified status'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* For Hotels */}
                {activeTab === 'hotel' && (
                    <div className="space-y-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t?.howItWorks?.hotelSectionTitle || 'How Hotels & Villas Use IndaStreet'}</h2>
                            <p className="text-xl text-gray-600">{t?.howItWorks?.hotelSectionSubtitle || 'Find qualified therapists, manage your spa, grow your business'}</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">1</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{t?.howItWorks?.hotelStep1Title || 'Register Your Property'}</h3>
                                <p className="text-sm text-gray-600">{t?.howItWorks?.hotelStep1Desc || 'Create hotel/villa account with property details'}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">2</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{t?.howItWorks?.hotelStep2Title || 'Browse Therapists'}</h3>
                                <p className="text-sm text-gray-600">{t?.howItWorks?.hotelStep2Desc || 'Search verified professionals by specialty and location'}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">3</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{t?.howItWorks?.hotelStep3Title || 'Send Booking Requests'}</h3>
                                <p className="text-sm text-gray-600">{t?.howItWorks?.hotelStep3Desc || 'Contact therapists directly via WhatsApp integration'}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">4</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{t?.howItWorks?.hotelStep4Title || 'Manage Your Spa'}</h3>
                                <p className="text-sm text-gray-600">{t?.howItWorks?.hotelStep4Desc || 'Track bookings, therapists, and services from dashboard'}</p>
                            </div>
                        </div>

                        <div 
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white relative bg-cover bg-center"
                            style={{
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets.png?updatedAt=1762092327438)',
                            }}
                        >
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-6">{t?.howItWorks?.hotelBenefitsTitle || 'Hotel Benefits'}</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{t?.howItWorks?.hotelBenefit1Title || 'Access to 500+ Verified Therapists'}</h4>
                                        <p className="text-blue-100">{t?.howItWorks?.hotelBenefit1Desc || 'All certified with background checks'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{t?.howItWorks?.hotelBenefit2Title || 'Same-Day Staffing Solutions'}</h4>
                                        <p className="text-blue-100">{t?.howItWorks?.hotelBenefit2Desc || 'Find replacement therapists quickly'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{t?.howItWorks?.hotelBenefit3Title || 'Spa Management Dashboard'}</h4>
                                        <p className="text-blue-100">{t?.howItWorks?.hotelBenefit3Desc || 'Track services, bookings, and therapists'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{t?.howItWorks?.hotelBenefit4Title || 'Multi-Language Therapists'}</h4>
                                        <p className="text-blue-100">{t?.howItWorks?.hotelBenefit4Desc || 'Serve international guests effectively'}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* For Employers */}
                {activeTab === 'employer' && (
                    <div className="space-y-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t?.howItWorks?.employerSectionTitle || 'How Employers Hire on IndaStreet'}</h2>
                            <p className="text-xl text-gray-600">{t?.howItWorks?.employerSectionSubtitle || 'Privacy-protected job marketplace for contract hiring'}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t?.howItWorks?.employerCard1Title || 'Browse Job Seekers'}</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t?.howItWorks?.employerCard1Desc || 'Search our "Therapist For Contract" marketplace to find qualified professionals actively seeking employment opportunities.'}
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard1Item1 || 'Filter by specialty, experience, location'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard1Item2 || 'View certifications and work history'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard1Item3 || 'Names protected until you unlock'}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔓</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t?.howItWorks?.employerCard2Title || 'Unlock Contact Details'}</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t?.howItWorks?.employerCard2Desc || 'Pay one-time fee of IDR 300,000 to unlock full contact information including WhatsApp number and full name.'}
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard2Item1 || 'Secure payment via bank transfer'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard2Item2 || 'Instant access after verification'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard2Item3 || 'Direct WhatsApp communication'}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t?.howItWorks?.employerCard3Title || 'Interview & Hire'}</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t?.howItWorks?.employerCard3Desc || 'Contact therapists directly via WhatsApp. Conduct interviews, check references, and make your hiring decision.'}
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard3Item1 || 'No platform fees on hiring'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard3Item2 || 'Negotiate terms directly'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard3Item3 || 'Verify certifications yourself'}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{t?.howItWorks?.employerCard4Title || 'Leave Reviews'}</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t?.howItWorks?.employerCard4Desc || 'After hiring, leave honest reviews to help other employers and build the therapist\'s reputation on the platform.'}
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard4Item1 || 'Rate professionalism'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard4Item2 || 'Share your experience'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t?.howItWorks?.employerCard4Item3 || 'Help build community trust'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t?.howItWorks?.employerPrivacyTitle || 'Why Our Privacy Model Works'}</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-purple-900 mb-2">🛡️ {t?.howItWorks?.employerPrivacyTherapist || 'For Therapists:'}</h4>
                                    <p className="text-gray-600">
                                        {t?.howItWorks?.employerPrivacyTherapistDesc || 'Protects them from spam, harassment, and unwanted contact. Only serious employers who pay can reach them.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-900 mb-2">✅ {t?.howItWorks?.employerPrivacyEmployer || 'For Employers:'}</h4>
                                    <p className="text-gray-600">
                                        {t?.howItWorks?.employerPrivacyEmployerDesc || 'Ensures access to serious job seekers. Small fee filters out time-wasters and ensures quality candidates.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* For Agents */}
                {activeTab === 'agent' && (
                    <div className="space-y-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t?.howItWorks?.agentSectionTitle || 'How Agents Earn on IndaStreet'}</h2>
                            <p className="text-xl text-gray-600">{t?.howItWorks?.agentSectionSubtitle || 'Recruit therapists, earn commissions, build your network'}</p>
                        </div>

                        <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12 text-white mb-12 relative bg-cover bg-center max-w-full overflow-hidden"
                            style={{
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets%20agent.png?updatedAt=1762092663015)',
                            }}
                        >
                            <div className="relative z-10 max-w-full overflow-hidden">
                                <div className="grid md:grid-cols-3 gap-8 text-center max-w-full">
                                    <div>
                                        <div className="text-5xl font-bold mb-2">{t?.howItWorks?.agentStat1 || '20%'}</div>
                                        <div className="text-green-100">{t?.howItWorks?.agentStat1Label || 'Commission Rate'}</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2">{t?.howItWorks?.agentStat2 || '∞'}</div>
                                        <div className="text-green-100">{t?.howItWorks?.agentStat2Label || 'Unlimited Recruits'}</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2">{t?.howItWorks?.agentStat3 || '💰'}</div>
                                        <div className="text-green-100">{t?.howItWorks?.agentStat3Label || 'Passive Income'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.agentStep1Title || 'Sign Up as Agent'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.agentStep1Desc || 'Register as an agent and get your unique referral code to start recruiting therapists.'}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.agentStep2Title || 'Recruit Therapists'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.agentStep2Desc || 'Share your referral code with therapists. When they sign up and purchase membership, you earn.'}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t?.howItWorks?.agentStep3Title || 'Earn Commissions'}</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {t?.howItWorks?.agentStep3Desc || 'Receive 20% commission on every membership purchase from your referred therapists. Track earnings in dashboard.'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t?.howItWorks?.agentCommissionTitle || 'Commission Example'}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-gray-700">{t?.howItWorks?.agentTablePackage || 'Package'}</th>
                                            <th className="text-right py-3 px-4 text-gray-700">{t?.howItWorks?.agentTablePrice || 'Price'}</th>
                                            <th className="text-right py-3 px-4 text-gray-700">{t?.howItWorks?.agentTableCommission || 'Your Commission (20%)'}</th>
                                            <th className="text-right py-3 px-4 text-gray-700">{t?.howItWorks?.agentTableRecurring || 'Recurring Commission (20%)'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">{t?.howItWorks?.agentPackage1Month || '1 Month'}</td>
                                            <td className="text-right py-3 px-4">IDR 200,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 40,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-blue-600">IDR 40,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">{t?.howItWorks?.agentPackage3Months || '3 Months'}</td>
                                            <td className="text-right py-3 px-4">IDR 600,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 120,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-blue-600">IDR 120,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">{t?.howItWorks?.agentPackage6Months || '6 Months'}</td>
                                            <td className="text-right py-3 px-4">IDR 1,200,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 240,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-blue-600">IDR 240,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-bold">{t?.howItWorks?.agentPackage1Year || '1 Year'}</td>
                                            <td className="text-right py-3 px-4 font-bold">IDR 2,400,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600 text-lg">IDR 480,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-blue-600 text-lg">IDR 480,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">{t?.howItWorks?.agentCommissionWorksTitle || '💰 How Commission Works:'}</h4>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-green-600">20%</span>
                                            <span><strong>{language === 'id' ? 'Bulan Pertama:' : 'First Month:'}</strong> {t?.howItWorks?.agentCommissionFirstMonth || 'Earn 20% commission when a therapist you recruit signs up for the first time'}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-blue-600">20%</span>
                                            <span><strong>{language === 'id' ? 'Berulang (Bulan 2+):' : 'Recurring (Month 2+):'}</strong> {t?.howItWorks?.agentCommissionRecurring || 'Earn 20% commission every month the same therapist renews their membership'}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <p className="text-gray-700 mb-2">
                                        <span className="font-bold">{t?.howItWorks?.agentExampleTitle || 'Example:'}</span> {t?.howItWorks?.agentExampleDesc || 'You recruit 1 therapist who buys a 1 Month package (IDR 200,000):'}
                                    </p>
                                    <ul className="space-y-1 text-gray-700 ml-4">
                                        <li>• {t?.howItWorks?.agentExampleMonth1 || 'Month 1: You earn IDR 40,000 (20%)'}</li>
                                        <li>• {t?.howItWorks?.agentExampleMonth2 || 'Month 2: If they renew, you earn IDR 40,000 (20%)'}</li>
                                        <li>• {t?.howItWorks?.agentExampleMonth3Plus || 'Month 3+: You continue earning IDR 40,000 (20%) each month they stay active'}</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                                    <p className="text-gray-700">
                                        <span className="font-bold">{t?.howItWorks?.agentPassiveIncomeTitle || '🚀 Build Passive Income:'}</span> {t?.howItWorks?.agentPassiveIncomeDesc || 'Recruit 10 therapists on 1-month plans = IDR 400,000 first month + IDR 400,000 every month they renew!'}
                                    </p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300">
                                    <h4 className="font-bold text-gray-900 mb-4 text-lg">{t?.howItWorks?.agentTotalEarningsTitle || '📊 Total Earnings From 1 Active Member (IDR 200,000/month):'}</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg shadow">
                                            <div className="text-sm text-gray-600 mb-1">{t?.howItWorks?.agentEarningsAfter1Month || 'After 1 Month'}</div>
                                            <div className="text-2xl font-bold text-purple-600">{t?.howItWorks?.agentEarningsAfter1MonthAmount || 'IDR 40,000'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{t?.howItWorks?.agentEarningsAfter1MonthDesc || '20% first month'}</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow">
                                            <div className="text-sm text-gray-600 mb-1">{t?.howItWorks?.agentEarningsAfter3Months || 'After 3 Months'}</div>
                                            <div className="text-2xl font-bold text-purple-600">{t?.howItWorks?.agentEarningsAfter3MonthsAmount || 'IDR 120,000'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{t?.howItWorks?.agentEarningsAfter3MonthsDesc || 'Month 1 (20%) + Month 2-3 (20% each)'}</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow">
                                            <div className="text-sm text-gray-600 mb-1">After 6 Months</div>
                                            <div className="text-2xl font-bold text-purple-600">IDR 240,000</div>
                                            <div className="text-xs text-gray-500 mt-1">Month 1 (20%) + Month 2-6 (20% each)</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow border-2 border-purple-400">
                                            <div className="text-sm text-gray-600 mb-1">After 1 Year</div>
                                            <div className="text-3xl font-bold text-purple-600">IDR 480,000</div>
                                            <div className="text-xs text-gray-500 mt-1">Month 1 (20%) + Month 2-12 (20% each)</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-bold">💡 Pro Tip:</span> With <span className="font-bold">10 active members</span> staying for 1 year, you earn <span className="font-bold text-purple-600">IDR 4,800,000</span> total! The more members you recruit and keep active, the more passive income you build.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Common CTA */}
                <div 
                    className="mt-16 text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-12 text-white relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161)',
                    }}
                >
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">{t?.howItWorks?.needHelpTitle || 'Need Help?'}</h2>
                        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                            {t?.howItWorks?.needHelpDesc || 'Contact our support team for any questions'}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a 
                                href="https://wa.me/6281392000050"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                {t?.howItWorks?.chatSupport || 'Chat Customer Support'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;

