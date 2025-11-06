import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

interface HowItWorksPageProps {
    onNavigate?: (page: string) => void;
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
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-4 pb-20 text-gray-600">
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
            />

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Hero Section */}
            <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20 relative bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382)',
                }}
            >
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl font-bold mb-6">How IndaStreet Works</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Your Complete Guide to Indonesia's Leading Wellness Marketplace
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('therapist')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'therapist'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Therapists
                    </button>
                    <button
                        onClick={() => setActiveTab('hotel')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'hotel'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Hotels & Villas
                    </button>
                    <button
                        onClick={() => setActiveTab('employer')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'employer'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Employers
                    </button>
                    <button
                        onClick={() => setActiveTab('agent')}
                        className={`flex-1 min-w-[150px] py-4 px-6 rounded-xl font-bold transition-all ${
                            activeTab === 'agent'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Agents
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* For Therapists */}
                {activeTab === 'therapist' && (
                    <div className="space-y-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Therapists Succeed on IndaStreet</h2>
                            <p className="text-xl text-gray-600">Build your career, find opportunities, grow your client base</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Create Your Profile</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Sign up and create a detailed profile showcasing your certifications, specializations, 
                                    experience, and languages.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Upload certifications
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        List specializations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Add work experience
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Choose Your Membership</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Select a membership package that fits your needs. Get verified and featured in search results.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        1, 3, 6, or 12 months
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Verified badge
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Priority placement
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <span className="text-3xl font-bold text-orange-600">3</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Start Getting Bookings</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Receive booking requests from hotels, spas, and direct clients. Accept jobs that fit your schedule.
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Instant notifications
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        WhatsApp integration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Flexible scheduling
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border-2 border-orange-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Membership Benefits</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Enhanced Visibility</h4>
                                        <p className="text-gray-600 text-sm">Appear at the top of search results</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Direct Client Bookings</h4>
                                        <p className="text-gray-600 text-sm">Receive bookings from verified clients</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Professional Dashboard</h4>
                                        <p className="text-gray-600 text-sm">Manage bookings and profile easily</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Verified Badge</h4>
                                        <p className="text-gray-600 text-sm">Build trust with verified status</p>
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Hotels & Villas Use IndaStreet</h2>
                            <p className="text-xl text-gray-600">Find qualified therapists, manage your spa, grow your business</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">1</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Register Your Property</h3>
                                <p className="text-sm text-gray-600">Create hotel/villa account with property details</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">2</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Browse Therapists</h3>
                                <p className="text-sm text-gray-600">Search verified professionals by specialty and location</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">3</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Send Booking Requests</h3>
                                <p className="text-sm text-gray-600">Contact therapists directly via WhatsApp integration</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl font-bold text-blue-600">4</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Manage Your Spa</h3>
                                <p className="text-sm text-gray-600">Track bookings, therapists, and services from dashboard</p>
                            </div>
                        </div>

                        <div 
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white relative bg-cover bg-center"
                            style={{
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets.png?updatedAt=1762092327438)',
                            }}
                        >
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-6">Hotel Benefits</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Access to 500+ Verified Therapists</h4>
                                        <p className="text-blue-100">All certified with background checks</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Same-Day Staffing Solutions</h4>
                                        <p className="text-blue-100">Find replacement therapists quickly</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Spa Management Dashboard</h4>
                                        <p className="text-blue-100">Track services, bookings, and therapists</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pb-20">
                                    <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Multi-Language Therapists</h4>
                                        <p className="text-blue-100">Serve international guests effectively</p>
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Employers Hire on IndaStreet</h2>
                            <p className="text-xl text-gray-600">Privacy-protected job marketplace for contract hiring</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Browse Job Seekers</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Search our "Therapist For Contract" marketplace to find qualified professionals actively 
                                    seeking employment opportunities.
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Filter by specialty, experience, location</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>View certifications and work history</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Names protected until you unlock</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔓</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Unlock Contact Details</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Pay one-time fee of IDR 300,000 to unlock full contact information including WhatsApp 
                                    number and full name.
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Secure payment via bank transfer</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Instant access after verification</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Direct WhatsApp communication</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Interview & Hire</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Contact therapists directly via WhatsApp. Conduct interviews, check references, and make 
                                    your hiring decision.
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>No platform fees on hiring</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Negotiate terms directly</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Verify certifications yourself</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-4 pb-20 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Leave Reviews</h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    After hiring, leave honest reviews to help other employers and build the therapist's 
                                    reputation on the platform.
                                </p>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Rate professionalism</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Share your experience</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Help build community trust</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Our Privacy Model Works</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-purple-900 mb-2">🛡️ For Therapists:</h4>
                                    <p className="text-gray-600">
                                        Protects them from spam, harassment, and unwanted contact. Only serious employers 
                                        who pay can reach them.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-900 mb-2">✅ For Employers:</h4>
                                    <p className="text-gray-600">
                                        Ensures access to serious job seekers. Small fee filters out time-wasters and 
                                        ensures quality candidates.
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Agents Earn on IndaStreet</h2>
                            <p className="text-xl text-gray-600">Recruit therapists, earn commissions, build your network</p>
                        </div>

                        <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12 text-white mb-12 relative bg-cover bg-center"
                            style={{
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets%20agent.png?updatedAt=1762092663015)',
                            }}
                        >
                            <div className="relative z-10">
                                <div className="grid md:grid-cols-3 gap-8 text-center">
                                    <div>
                                        <div className="text-5xl font-bold mb-2">20%</div>
                                        <div className="text-green-100">Commission Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2">∞</div>
                                        <div className="text-green-100">Unlimited Recruits</div>
                                    </div>
                                    <div>
                                        <div className="text-5xl font-bold mb-2">💰</div>
                                        <div className="text-green-100">Passive Income</div>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Sign Up as Agent</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Register as an agent and get your unique referral code to start recruiting therapists.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Recruit Therapists</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Share your referral code with therapists. When they sign up and purchase membership, you earn.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Earn Commissions</h3>
                                <p className="text-gray-600 text-center mb-4">
                                    Receive 20% commission on every membership purchase from your referred therapists. Track earnings in dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Commission Example</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 text-gray-700">Package</th>
                                            <th className="text-right py-3 px-4 text-gray-700">Price</th>
                                            <th className="text-right py-3 px-4 text-gray-700">Your Commission (20%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">1 Month</td>
                                            <td className="text-right py-3 px-4">IDR 100,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 20,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">3 Months</td>
                                            <td className="text-right py-3 px-4">IDR 250,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 50,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4">6 Months</td>
                                            <td className="text-right py-3 px-4">IDR 450,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600">IDR 90,000</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-bold">1 Year</td>
                                            <td className="text-right py-3 px-4 font-bold">IDR 800,000</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-600 text-lg">IDR 160,000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 p-4 pb-20 bg-green-50 rounded-lg">
                                <p className="text-gray-700">
                                    <span className="font-bold">Example:</span> Recruit 10 therapists who each buy a 6-month package = 
                                    <span className="font-bold text-green-600"> IDR 900,000 commission</span> 💰
                                </p>
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
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of therapists, hotels, employers, and agents already using IndaStreet
                        </p>
                        <div className="flex flex-wrap gap-4 pb-20 justify-center">
                            <button className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                                Sign Up Now
                            </button>
                            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-orange-600 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default HowItWorksPage;

