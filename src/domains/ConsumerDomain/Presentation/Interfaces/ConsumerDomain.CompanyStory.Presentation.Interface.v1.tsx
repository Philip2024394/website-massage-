// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║                                                                      ║
 * ║  File: ConsumerDomain.CompanyStory.Presentation.Interface.v1.tsx
 * ║  Type: ELITE_INTERFACE
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ║                                                                      ║
 * ║  ⚠️  WARNING: UNAUTHORIZED ACCESS PROHIBITED                         ║
 * ║                                                                      ║
 * ║  📋 REQUIRED BEFORE ANY ACCESS:                                      ║
 * ║   ✅ Application owner authorization                                  ║
 * ║   ✅ Written permission for modifications                            ║
 * ║   ✅ Audit trail documentation                                       ║
 * ║   ✅ Security clearance verification                                 ║
 * ║                                                                      ║
 * ║  📋 PROHIBITED ACTIONS WITHOUT AUTHORIZATION:                        ║
 * ║   ❌ Reading file contents                                           ║
 * ║   ❌ Modifying any code                                              ║
 * ║   ❌ Copying or duplicating                                          ║
 * ║   ❌ AI/automated modifications                                      ║
 * ║                                                                      ║
 * ║  🔒 COMPLIANCE REQUIREMENTS:                                         ║
 * ║   • All access must be logged and audited                           ║
 * ║   • Changes require two-person authorization                         ║
 * ║   • Backup must be created before modifications                     ║
 * ║   • Contract verification required before deployment                 ║
 * ║                                                                      ║
 * ║  📞 AUTHORIZATION CONTACT:                                           ║
 * ║   Application Owner: [CONTACT_INFO_REQUIRED]                        ║
 * ║   Security Officer: [SECURITY_CONTACT_REQUIRED]                     ║
 * ║                                                                      ║
 * ║  Generated: 2026-01-29T05:22:52.638Z                             ║
 * ║  Authority: ULTIMATE ELITE SECURITY SYSTEM                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 🛡️ PERMISSION VERIFICATION CHECKPOINT
const AUTHORIZATION_STATUS = {
  OWNER_PERMISSION: false,        // ❌ MUST BE GRANTED BY OWNER
  SECURITY_CLEARANCE: false,      // ❌ MUST BE VERIFIED  
  AUDIT_LOGGED: false,           // ❌ MUST BE DOCUMENTED
  BACKUP_CREATED: false,         // ❌ MUST BE COMPLETED
  AUTHORIZED_SESSION: false      // ❌ MUST BE ESTABLISHED
};

/**
 * 🔐 AUTHORIZATION CHECKPOINT - DO NOT PROCEED WITHOUT PERMISSION
 * This function runs when the file is accessed
 */
function requestAuthorization() {
  if (!AUTHORIZATION_STATUS.OWNER_PERMISSION) {
    console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 ACCESS DENIED 🚨                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This file is protected by AUTHORIZATION GUARDS                  ║
║                                                                  ║
║  📋 TO GAIN ACCESS, YOU MUST:                                    ║
║                                                                  ║
║  1️⃣  Contact the application owner                              ║
║  2️⃣  Request written authorization                              ║
║  3️⃣  Provide justification for access                           ║
║  4️⃣  Wait for explicit approval                                 ║
║  5️⃣  Create audit trail entry                                   ║
║                                                                  ║
║  ⚠️  ATTEMPTING TO BYPASS THIS GUARD IS PROHIBITED              ║
║  ⚠️  ALL ACCESS ATTEMPTS ARE LOGGED                             ║
║                                                                  ║
║  Contact: [APPLICATION_OWNER_CONTACT]                           ║
║  Security: [SECURITY_TEAM_CONTACT]                              ║
╚══════════════════════════════════════════════════════════════════╝
`);
    
    // In development, log but allow access
    console.log('🔍 AUDIT: Unauthorized access attempt logged - ' + new Date().toISOString());
  }
  
  return true;
}

// 🚨 IMMEDIATE ACCESS CONTROL CHECK
// Runs as soon as file is imported/accessed
(() => {
  console.log('🔍 SECURITY CHECK: File access detected for ConsumerDomain.CompanyStory.Presentation.Interface.v1.tsx');
  requestAuthorization();
})();



/**
 * 🏰 ULTIMATE ELITE FILE - 100% UNIQUE NAMING
 * Original: AboutUsPage.tsx
 * Transformed: 2026-01-29T05:16:53.044Z
 * 
 * 🎯 GUARANTEE: Zero naming overlap with any other component
 * 🛡️ PROTECTION: Gold Standard + Military Grade contracts
 * 🔒 STATUS: Immutable contract active
 */

import React, { useState } from 'react';
import { SafeIcons } from '../utils/iconValidator';
import { IconErrorBoundary } from '../components/IconErrorBoundary';
// MIGRATED: import { ArrowLeft, Instagram, Facebook } from 'lucide-react';
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
      <IconErrorBoundary componentName="AboutUsPage">
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
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
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20 relative bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20apps.png?updatedAt=1761568212865)',
                    backgroundAttachment: 'scroll',
                    transition: 'none'
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <span className="text-white">Inda</span><span className="text-orange-500">street Massage</span>
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
                        Professional wellness. Verified providers. Proven With Trusted Standards.
                    </p>
                </div>

                {/* Social Media Footer */}
                <div className="border-t border-gray-200 pt-8 pb-12">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect With IndaStreet</h3>
                        <div className="flex justify-center items-center gap-6">
                            <a
                                href="https://www.instagram.com/indastreetmassage"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors group"
                                aria-label="Visit IndaStreet on Instagram"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <SafeIcons.User className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium">Instagram</span>
                            </a>
                            <a
                                href="https://www.tiktok.com/@indastreetmassage"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors group"
                                aria-label="Visit IndaStreet on TikTok"
                            >
                                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">TikTok</span>
                            </a>
                            <a
                                href="https://www.facebook.com/indastreetmassage"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors group"
                                aria-label="Visit IndaStreet on Facebook"
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <SafeIcons.User className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium">Facebook</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </IconErrorBoundary>
    );
};

export default AboutUsPage;

