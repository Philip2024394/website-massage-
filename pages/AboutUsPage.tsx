import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
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
                        <span className="text-white">Indas</span><span className="text-orange-400">treet</span>
                    </h1>
                    <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Indonesia's First Comprehensive Wellness Marketplace Connecting Therapists, Hotels, and Employers
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Our Indas<span className="text-orange-500">treet</span> Mission
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
                        Indas<span className="text-orange-500">treet</span> Team
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                        <p className="text-2xl font-bold text-orange-600">
                            Yo, IndaStreet Fam!
                        </p>
                        
                        <p className="text-xl font-semibold text-gray-900">
                            Welcome to IndaStreet – it's more than just an app, it's a whole vibe, a movement, and guess what? You're right at the heart of it all. We're the new wave, the game-changers, a vibrant, 100% Indonesian-owned crew dedicated to leveling up your everyday life across the archipelago.
                        </p>
                        
                        <p>
                            Forget the old-school, clunky ways. We're here crafting the most advanced, ridiculously user-friendly SuperApp that's already becoming the absolute go-to for Indonesia's youth. Need to grab some killer food delivery? Score a seamless ride across town? Hook up with someone cool on dating? Rent a motor for that epic road trip? Discover all the hottest local destinations? Or maybe just chill out with a top-notch wellness massage? Yeah, we got you. All of Indonesia, right in your pocket.
                        </p>
                        
                        <p>
                            Who are we, really? We're the cool cats behind the screen, fueled by endless creativity and a serious passion for growth. You might find us kicking back and brainstorming in our "playroom," but trust us, we're relentlessly pushing boundaries to keep the IndaStreet SuperApp thriving, always. We're on it, 24/7 – listening, evolving, and totally committed to making your life easier, more exciting, and seriously lit.
                        </p>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Our Crew – The Local Legends, Merchants & Partners:</h3>
                        
                        <p>
                            IndaStreet sparked from a clear vision: to empower the backbone of Indonesia's local economy. We saw the grind firsthand: small businesses struggling with reach, talented folks (from therapists to drivers) getting tangled in commission traps, and a whole scene operating on whispers. We knew it was time to drop the mic on the old system.
                        </p>
                        
                        <p>
                            Our mission is simple, powerful, and kinda revolutionary: we're kicking commission-based fees to the curb! No joke. We're 100% behind your success, making sure you keep every single Rupiah you earn. We're all about transparency, professionalism, and unlocking insane opportunities for thousands of amazing people and businesses across Indonesia. When you thrive, we all thrive.
                        </p>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For You, The User – The Heartbeat of IndaStreet:</h3>
                        
                        <p>
                            Your energy, your trust, your epic adventures, and those chill moments you find through our SuperApp? That's what transforms our wildest ideas into pure, vibrant reality. Every tap, every discovery, every connection you make on IndaStreet fuels our fire. Seriously, you're not just a user; you're the main character in the IndaStreet story, part of our actual fam.
                        </p>
                        
                        <p className="text-lg font-semibold text-gray-900">
                            So, before we log off from this "About Us" page, a massive THANK YOU! We promise to keep pushing boundaries, dropping fresh features, and working tirelessly to keep the IndaStreet SuperApp the ultimate, most essential tool in your digital arsenal.
                        </p>
                        
                        <p className="text-lg font-bold text-orange-600">
                            Stay Connected. Stay Awesome. Keep Thriving with IndaStreet.
                        </p>
                        
                        <p className="text-right text-orange-600 font-semibold text-xl">
                            IndaStreet Team
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
                            Get Started Today
                        </button>
                        <button 
                            onClick={() => onNavigate('contact')}
                            className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-lg transition-colors"
                        >
                            Contact Our Team
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

