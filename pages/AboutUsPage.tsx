import React, { useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';

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
    const { t } = useTranslations(language);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
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
            {/* Global App Drawer - same content as Home */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    language={language}
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
                <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-6xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                    </h1>
                    <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {t('about.subtitle') || "Indonesia's First Comprehensive Wellness Marketplace Connecting Therapists, Hotels, and Employers"}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {t('about.missionTitle') || 'Our IndaStreet Mission'}
                        </h2>
                        <p className="text-lg text-gray-700 mb-4">
                            We're igniting the future for Indonesia's youth. IndaStreet is the SuperApp that puts everything at your fingertips: from sizzling food delivery and seamless rides to unforgettable local destinations, exciting motor rentals, and genuine connections through dating.
                        </p>
                        <p className="text-lg text-gray-700">
                            For our partners – from local eateries to drivers, hosts, and wellness experts – we're ditching commissions, boosting profits, and fueling local success. We're not just connecting services; we're empowering lifestyles, building community, and making every day in Indonesia an adventure, 100% locally powered.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 pb-20">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Verified Pros & Partners</h3>
                                    <p className="text-gray-600">Every therapist, driver, food vendor, and hotel host is thoroughly vetted. We ensure background checks, certifications, and real-world reviews across all IndaStreet services—so you always feel safe and confident, whether booking a ride, ordering dinner, or booking a wellness session.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 pb-20">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Privacy, Locked Down</h3>
                                    <p className="text-gray-600">Your data belongs to you—period. From your wellness bookings to your ride history, we use military-grade privacy controls. Personal info stays hidden until you decide to share it. We don't sell your data, we don't share it with third parties, and we sure as hell don't use it to bombard you with ads. Your trust is everything.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 pb-20">
                                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Instant Connections. Real-Time Talk.</h3>
                                    <p className="text-gray-600">Whether you're matching with a driver, booking a therapist, or messaging a hotel—everything happens in real time. Our WhatsApp integration and in-app chat mean you're always one tap away from getting exactly what you need, exactly when you need it. No waiting. No delays. Just instant connections.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Us Story Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        About Inda<span className="text-orange-500">StreetMassage.com</span>
                    </h2>
                    <h3 className="text-2xl font-bold text-orange-600 mb-6">
                        The Global Massage Hub Built on Trust, Skill, and Culture
                    </h3>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                        <p>
                            IndaStreetMassage.com—affectionately known to our community as The Hub—is a premium online directory connecting users with thousands of massage professionals from all walks of life and countries around the world. Right here at your fingertips, we bring together experience, technique, and passion, ensuring that relaxation starts before the massage even begins. Our platform is more than just a directory; it's a curated wellness ecosystem where trust and quality meet accessibility.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">A Modern Massage Directory Rooted in Ancient Healing Traditions</h4>
                        
                        <p>
                            Massage therapy is one of the oldest wellness practices in human history, with roots stretching back over 5,000 years to ancient China, Egypt, and Greece. For centuries, skilled practitioners have used the power of touch to promote relaxation, recovery, and balance in the body and mind. At IndaStreetMassage.com, we honor these historic foundations while creating a modern, trusted, and accessible massage platform for today's world. We understand that massage is not just a luxury—it's a time-honored tradition of healing and self-care that deserves to be celebrated and made available to everyone.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">From the Massage IndaStreet Experience to a Premium Global Hub</h4>
                        
                        <p>
                            What began as the Massage IndaStreet experience—a grassroots, hands-on connection between people and quality bodywork—has evolved into IndaStreetMassage.com, a premium massage directory used and loved by millions around the world. Our journey was driven by one clear goal: to create the most powerful, trusted, and inclusive massage platform in the industry. We started small, focusing on building genuine relationships between massage professionals and their clients, and we've grown into a global hub that celebrates diversity, skill, and authentic wellness connections.
                        </p>
                        
                        <p>
                            Today, IndaStreetMassage Hub connects users with licensed and experienced massage therapists, independent providers, studio professionals, and specialists in multiple massage techniques. We bring together providers from diverse cultures, backgrounds, and countries, creating a truly global wellness community. This diversity is our greatest strength—it's what makes the Hub truly international and allows clients to find exactly the right therapist for their unique needs and preferences.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Thousands of Massage Professionals. One Trusted Platform.</h4>
                        
                        <p>
                            IndaStreetMassage.com is more than just a directory—it's a curated wellness ecosystem designed with intention and care. We focus on connecting users with high-quality service providers who maintain professional standards and accountability. We emphasize ethical massage practices, continuous education, refined technique, and ongoing growth within the industry. Our commitment to quality means that when users trust our platform, they can fully relax and enjoy their experience, often feeling at ease even before the massage begins. We believe that trust is the foundation of great wellness experiences, and we work tirelessly to earn and maintain that trust every single day.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why Users Trust IndaStreetMassage Hub</h4>
                        
                        <p>
                            Trust is everything in wellness, and people choose IndaStreetMassage.com because they want confidence in who they're booking. They seek access to skilled massage professionals and desire a safe, stress-free experience from start to finish. Our platform respects both clients and therapists equally, creating an environment where everyone feels valued and supported. We're building an industry where professionalism meets accessibility, and where massage is treated with the respect and dignity it truly deserves. When you book through The Hub, you're not just scheduling an appointment—you're joining a community that values quality, integrity, and authentic human connection.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Community & Culture</h4>
                        
                        <p>
                            We are an urban-style collective with a professional mindset—not corporate, not outdated, just real people who love massage, bodywork, and the transformative power of skilled hands. Our community includes massage therapists, bodywork specialists, wellness professionals, and clients who value quality and genuine care. From the streets to studios, from local providers to international professionals, this is the Hub where everyone connects. We celebrate the individuality of each practitioner while fostering a sense of belonging and shared purpose. Whether you're a therapist looking to grow your practice or a client seeking the perfect massage experience, you'll find your place in our vibrant, inclusive community.
                        </p>
                        
                        <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">We Love What We Do—So You Can Too</h4>
                        
                        <p className="text-lg font-semibold text-gray-900">
                            IndaStreetMassage.com exists to elevate the massage industry while making high-level wellness accessible to everyone, everywhere. From ancient techniques passed down through generations to modern practice and innovation, from a local experience rooted in community to a global platform connecting continents, IndaStreetMassage Hub is redefining what a massage directory can be. We're not just connecting therapists with clients—we're building bridges between cultures, traditions, and healing modalities. We're creating a space where massage is honored as both an art and a science, where practitioners can thrive, and where clients can find exactly what they need to relax, recover, and rejuvenate.
                        </p>
                        
                        <p className="text-xl font-bold text-orange-600 text-center mt-8">
                            Welcome to the Hub. Welcome to the future of massage. Welcome to IndaStreetMassage.com. 🌍💆‍♀️
                        </p>
                    </div>
                </div>

                {/* Statistics - Floating Circles */}
                <div className="relative py-20 mb-20 overflow-hidden">
                    {/* Background Text */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <div className="text-[15rem] font-bold text-gray-900 whitespace-nowrap">
                            IndaStreet
                        </div>
                    </div>
                    
                    {/* Floating Circles Container */}
                    <div className="relative z-10 flex flex-wrap justify-center items-center gap-16 px-4">
                        {/* 1000+ Circle */}
                        <div className="animate-float">
                            <div 
                                className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20roomss.png?updatedAt=1761151275863)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="relative z-10 text-4xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">1000+</div>
                                <div className="relative z-10 text-sm mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Therapists</div>
                            </div>
                        </div>

                        {/* 500+ Circle */}
                        <div className="animate-float-delay-1">
                            <div 
                                className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20hotels.png?updatedAt=1761574517976)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="relative z-10 text-4xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">500+</div>
                                <div className="relative z-10 text-sm mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Hotels</div>
                            </div>
                        </div>

                        {/* 50+ Circle */}
                        <div className="animate-float-delay-2">
                            <div 
                                className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/inda%20street%20team.png?updatedAt=1761573836444)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="relative z-10 text-4xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">50+</div>
                                <div className="relative z-10 text-sm mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Agents</div>
                            </div>
                        </div>

                        {/* 10K+ Circle */}
                        <div className="animate-float-delay-3">
                            <div 
                                className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 relative overflow-hidden"
                                style={{
                                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/therapist%20traning%20indonisea%20de.png?updatedAt=1761574296957)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="relative z-10 text-4xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">10K+</div>
                                <div className="relative z-10 text-sm mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Bookings</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the Wellness Revolution</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Whether you're a therapist seeking opportunities, a hotel looking for talent, or an employer 
                        searching for professionals, IndaStreet is your trusted partner.
                    </p>
                    <div className="flex flex-wrap gap-4 pb-20 justify-center">
                        <button 
                            onClick={() => {
                                const event = new CustomEvent('toggleDrawer');
                                window.dispatchEvent(event);
                            }}
                            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            {t('about.cta.getStarted') || 'Get Started Today'}
                        </button>
                        <button 
                            onClick={() => onNavigate('company-profile')}
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            {t('about.cta.viewCompanyProfile') || 'View Company Profile'}
                        </button>
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-lg transition-colors"
                        >
                            {t('about.cta.contactTeam') || 'Contact Our Team'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Floating Animation Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-float-delay-1 {
                    animation: float 3s ease-in-out infinite;
                    animation-delay: 0.5s;
                }
                
                .animate-float-delay-2 {
                    animation: float 3s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .animate-float-delay-3 {
                    animation: float 3s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
            `}</style>
        </div>
    );
};

export default AboutUsPage;

