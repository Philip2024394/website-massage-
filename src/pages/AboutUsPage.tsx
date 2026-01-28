import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import UniversalHeader from '../components/shared/UniversalHeader';

interface AboutUsPageProps {
    onNavigate: (page: string) => void;
    onBack?: () => void;
    t?: any;
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

const AboutUsPage: React.FC<AboutUsPageProps> = ({ 
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
    const { language } = useLanguage();
    const { t } = useTranslations(language as 'en' | 'id');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Universal Header */}
            <UniversalHeader 
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
                showLanguageSelector={false}
            />
            {/* Global App Drawer - same content as Home */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    language={language as 'en' | 'id' | 'gb'}
                />
            </React19SafeWrapper>
            
            
            {/* Hero Section */}
            <div 
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20 relative bg-cover bg-center"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20apps.png?updatedAt=1761568212865)',
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    {/* Back Arrow */}
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="flex items-center gap-2 mb-8 text-white/90 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                        <span className="font-medium">
                            {language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
                        </span>
                    </button>
                    
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <span className="text-white">About IndaStreet Massage</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-light">
                            International wellness platform connecting people with verified massage therapists, professional massage spas, and licensed skin clinics
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Introduction */}
                <div className="mb-16">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        IndaStreet Massage is an international wellness platform connecting people with verified massage therapists, professional massage spas, and licensed skin clinics — safely, transparently, and on demand.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mt-4">
                        With operations in Ireland and Indonesia, we combine international standards with strong local expertise to deliver a trusted booking experience for customers, providers, and partners.
                    </p>
                </div>

                {/* Our Mission */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Our mission is to make professional wellness services easy to access, safe to book, and reliable to deliver, while empowering therapists, spas, and clinics with tools that support sustainable business growth.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-3">
                        We are focused on building long-term trust across the wellness, hospitality, and healthcare-related sectors.
                    </p>
                </div>

                {/* Built on Trust */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Built on Trust & Professional Standards</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        IndaStreet Massage is designed around safety, professionalism, and transparency.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">Our platform includes:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Verified provider identity and documentation</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Secure booking and payment workflows</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Clear service listings and transparent pricing</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Admin-verified provider profiles</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Platform rules that protect users, providers, and partners</span>
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                        Every provider listed on IndaStreet Massage operates under defined professional standards.
                    </p>
                </div>

                {/* Collaboration With Partners */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Collaboration With Hotels, Travel & Sports Partners</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        IndaStreet Massage actively collaborates with:
                    </p>
                    <ul className="space-y-2 text-gray-700 ml-6 mb-4">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Hotels and villas</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Travel agencies and tour operators</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Sports complexes and fitness facilities</span>
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        Through these partnerships, we facilitate access to verified massage specialists and skin clinics for guests, athletes, and travelers — ensuring consistent quality, safety, and professionalism in every location.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">Our partner integrations allow wellness services to be delivered:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>On-site at hotels and villas</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>As part of travel and recovery packages</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Within sports and performance environments</span>
                        </li>
                    </ul>
                </div>

                {/* Supporting Professionals */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Supporting Wellness Professionals</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">We support:</p>
                    <ul className="space-y-2 text-gray-700 ml-6 mb-4">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Independent massage therapists</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Professional massage spas</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Licensed skin clinics</span>
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-3">By providing:</p>
                    <ul className="space-y-2 text-gray-700 ml-6 mb-4">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Professional digital profiles</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Scheduled and on-demand booking tools</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Transparent commission structure</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Secure in-app communication</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Calendar and availability management</span>
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                        Our goal is to let professionals focus on delivering exceptional care — while we handle the platform and technology.
                    </p>
                </div>

                {/* International Presence */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">International Presence</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        With offices and operational support in Ireland and Indonesia, IndaStreet Massage is built for scalability, compliance, and long-term growth.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">This dual presence allows us to:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Apply international platform standards</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Respect local regulations and cultural practices</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Support partners and providers on the ground</span>
                        </li>
                    </ul>
                </div>

                {/* Our Commitment */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">We are committed to:</p>
                    <ul className="space-y-2 text-gray-700 ml-6">
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>User and guest safety</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Provider and partner protection</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Secure handling of personal and business data</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Continuous platform improvement</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>Clear and transparent communication</span>
                        </li>
                    </ul>
                </div>

                {/* The Future */}
                <div className="mb-16 text-center py-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">The Future of Professional Wellness</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        IndaStreet Massage is evolving with the needs of modern wellness, hospitality, and performance industries.
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                        Our focus remains clear:
                    </p>
                    <p className="text-xl font-bold text-orange-600 mt-3">
                        Professional wellness. Verified providers. Trusted delivery.
                    </p>
                </div>

                {/* CTA Section */}
                <div className="text-center py-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button 
                            onClick={() => {
                                const event = new CustomEvent('toggleDrawer');
                                window.dispatchEvent(event);
                            }}
                            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                        >
                            {t('about.cta.getStarted') || 'Get Started Today'}
                        </button>
                        <button 
                            onClick={() => onNavigate('company-profile')}
                            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-md"
                        >
                            {t('about.cta.viewCompanyProfile') || 'View Company Profile'}
                        </button>
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="px-8 py-3 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-colors"
                        >
                            {t('about.cta.contactTeam') || 'Contact Our Team'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;

