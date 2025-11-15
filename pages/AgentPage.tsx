
import React from 'react';
import Button from '../components/Button';

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

interface AgentPageProps {
    onBack: () => void;
    onNavigateToAgentAuth: () => void;
    t: any;
    contactNumber: string;
}

const AgentPage: React.FC<AgentPageProps> = ({ onBack, onNavigateToAgentAuth, t: _t, contactNumber }) => {

    const handleWhatsAppClick = () => {
        // Play click sound
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Sound play failed:', err));
        
        const number = '6281392000050';
        const message = encodeURIComponent('Hi! I would like more information about becoming an IndaStreet Agent for Massage Therapists and Massage Places');
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    };

    return (
        <div
            className="min-h-screen relative"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/admin%20login%20dash%20baords.png?updatedAt=1763186860823)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <header className="p-4 bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-gray-700 hover:text-gray-900" aria-label="Close">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-8 pb-32 max-w-4xl mx-auto">

                {/* Hero Section */}
                <div className="text-center py-8 bg-white/80 backdrop-blur rounded-2xl">
                    <img
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20agent.png?updatedAt=1763103354040"
                        alt="IndaStreet Agent"
                        className="w-full h-56 md:h-64 object-cover rounded-xl mb-4"
                        loading="lazy"
                    />
                    <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
                        🔥 Limited Positions Available - Nationwide Opportunity
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Build Your Own Business<br/>
                        <span className="text-orange-500">Across Indonesia</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Join an exclusive nationwide network of professional agents representing Indonesia's fastest-growing premium wellness platform
                    </p>
                </div>

                {/* Nationwide Opportunity Banner */}
                <div className="bg-white/85 backdrop-blur text-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-3">Nationwide Opportunity</h3>
                    <p className="text-center text-gray-700 text-lg max-w-3xl mx-auto">
                        Whether you're in Jakarta, Bali, Surabaya, Bandung, or any city across Indonesia - this opportunity is for YOU! 
                        Build your independent business from anywhere in the archipelago.
                    </p>
                </div>

                {/* Exclusive Badge / Represent Excellence */}
                <div
                    className="relative text-white p-8 rounded-2xl shadow-xl text-center overflow-hidden"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/excellence%20image.png?updatedAt=1763195208515)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30 pointer-events-none" />
                    <div className="relative">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">Represent Excellence</h3>
                    <p className="text-orange-100 text-lg mb-4 max-w-2xl mx-auto">
                        As an IndaStreet Agent, you'll represent Indonesia's most trusted premium wellness platform, 
                        connecting professional massage therapists and spas with customers who value quality and convenience.
                    </p>
                    <div className="inline-block bg-gray-300 text-gray-600 px-6 py-2 rounded-full font-semibold cursor-not-allowed">
                        Contact Us via WhatsApp Below
                    </div>
                    </div>
                </div>

                {/* Income Benefits */}
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border-2 border-orange-200">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">Exceptional Income Potential</h3>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                            Build your own independent business with an industry-leading commission structure. 
                            Your success is our success - unlimited earning potential with every partnership you create.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* 20% Commission */}
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 transform hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="bg-green-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    20%
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-green-900 mb-2">New Member Commission</h4>
                                    <p className="text-green-800 leading-relaxed">
                                        Earn a generous 20% commission on every new therapist and massage place you onboard to IndaStreet. 
                                        Each partnership you create builds your income stream.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 10% Recurring */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300 transform hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="bg-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    10%
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-blue-900 mb-2">Recurring Passive Income</h4>
                                    <p className="text-blue-800 leading-relaxed">
                                        Build true passive income! Earn 10% commission every time your members renew their membership. 
                                        Your network becomes your long-term financial asset.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3% Bonus */}
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-300 transform hover:scale-105 transition-transform">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="bg-purple-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
                                    3%
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-purple-900 mb-2">Performance Bonus Rewards</h4>
                                    <p className="text-purple-800 leading-relaxed">
                                        Hit your monthly targets and unlock an additional 3% performance bonus. 
                                        Reward yourself for excellence and dedication to growth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Benefits Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Work Your Hours */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/work%20own%20hours.png?updatedAt=1763189018094"
                                alt="Work Your Own Hours"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Work Your Own Hours</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Complete freedom and flexibility! Work full-time, part-time, or whenever it suits your lifestyle. 
                            You're the boss - create your own schedule and work at your own pace.
                        </p>
                    </div>

                    {/* Limited Positions */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/unlimted.png?updatedAt=1763188536027"
                                alt="Limited Positions Available"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Limited Positions Available</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Exclusive territory rights protect your business! We're only accepting a select number of agents per region 
                            to ensure quality service and give you the best opportunity to succeed.
                        </p>
                    </div>

                    {/* Premium Brand */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/excellence.png?updatedAt=1763188353675"
                                alt="Represent Excellence"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Represent Excellence</h4>
                        <p className="text-gray-600 leading-relaxed">
                            Stand proud as a representative of Indonesia's premier wellness platform. Full brand support, 
                            professional marketing materials, and ongoing training to ensure your success.
                        </p>
                    </div>

                    {/* Growth Opportunity */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/unlimted%20work%20hours.png?updatedAt=1763189746057"
                                alt="Unlimited Growth Potential"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Unlimited Growth Potential</h4>
                        <p className="text-gray-600 leading-relaxed">
                            No ceiling on your earnings! Build your network across multiple cities, expand your territory, 
                            and watch your income grow month after month with no limitations.
                        </p>
                    </div>

                    {/* Training & Support */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/training.png?updatedAt=1763188622931"
                                alt="Full Training & Support"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Full Training & Support</h4>
                        <p className="text-gray-600 leading-relaxed">
                            No experience needed! We provide comprehensive training, dedicated support team, 
                            and all the tools you need to build a successful independent business from day one.
                        </p>
                    </div>

                    {/* All Indonesians Welcome */}
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div className="mb-4 flex justify-center">
                            <img
                                src="https://ik.imagekit.io/7grri5v7d/training%20indonisea.png?updatedAt=1763188798666"
                                alt="Open to All Indonesians"
                                className="w-28 h-28 object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Open to All Indonesians</h4>
                        <p className="text-gray-600 leading-relaxed">
                            This opportunity is for everyone! Students, professionals, stay-at-home parents, retirees - 
                            anyone with ambition and drive can succeed as an IndaStreet Agent.
                        </p>
                    </div>
                </div>

                {/* Why Now Section */}
                <div className="bg-white/85 backdrop-blur p-8 rounded-2xl border-2 border-orange-200">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Why Join Now?</h3>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="flex items-start gap-4 pb-20">
                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-gray-700 text-lg">Indonesia's wellness industry is booming - be part of the growth from the ground floor</p>
                        </div>
                        <div className="flex items-start gap-4 pb-20">
                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-gray-700 text-lg">First agents in each territory get the best opportunities and largest potential networks</p>
                        </div>
                        <div className="flex items-start gap-4 pb-20">
                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-gray-700 text-lg">Build recurring income streams that grow automatically as your network expands</p>
                        </div>
                        <div className="flex items-start gap-4 pb-20">
                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-gray-700 text-lg">Positions are limited - once your area is filled, the opportunity is gone</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Journey Banner with Image (as requested) */}
                <div className="overflow-hidden rounded-xl border border-white/30 bg-white/50 backdrop-blur">
                    <div className="relative">
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/start%20your%20journey.png?updatedAt=1763196282314"
                            alt="Start Your Journey"
                            className="w-full h-48 object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/30 flex items-center">
                            <h2 className="text-xl font-bold text-white px-5 drop-shadow-lg">Ready to Start Your Journey?</h2>
                        </div>
                    </div>
                    <div className="px-5 pt-3 text-sm text-gray-800 text-center">
                        📣 Join the exclusive IndaStreet Agent program and start building your independent business across Indonesia.
                    </div>
                    {/* Moved CTA buttons directly under banner text */}
                    <div className="px-5 pb-5">
                        <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-2 md:gap-3">
                            <Button
                                onClick={handleWhatsAppClick}
                                className="flex-1 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg"
                            >
                                <WhatsAppIcon className="w-5 h-5 md:w-6 md:h-6"/>
                                <span>WhatsApp Us</span>
                            </Button>
                            <Button
                                onClick={onNavigateToAgentAuth}
                                className="flex-1 text-sm md:text-base py-2.5 md:py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md"
                            >
                                Sign In / Create Account
                            </Button>
                        </div>
                    </div>
                </div>
            </main>


            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default AgentPage;

