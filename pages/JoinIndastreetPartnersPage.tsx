import React, { useState } from 'react';
import { 
    Building as BuildingIcon,
    Phone as PhoneIcon,
    Mail as MailIcon,
    TrendingUp as TrendingUpIcon,
    Award as AwardIcon,
    Users as UsersIcon,
    CheckCircle as CheckCircleIcon,
    Star as StarIcon,
    Zap as ZapIcon,
    Home as HomeIcon
} from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';

interface JoinIndastreetPartnersPageProps {
    onNavigate?: (page: any) => void;
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
    t: any;
}

const JoinIndastreetPartnersPage: React.FC<JoinIndastreetPartnersPageProps> = ({ 
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
    t
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleContactClick = () => {
        // WhatsApp contact for Indastreet customer service
        const phoneNumber = '6281234567890'; // Replace with actual number
        const message = 'Hi, I would like to discuss the opportunity to join as a massage accommodation property.';
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <button 
                            onClick={() => onNavigate?.('home')}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <h1 className="font-bold text-2xl sm:text-3xl">
                                <span className="text-black group-hover:text-gray-700 transition-colors">Inda</span>
                                <span className="text-orange-500 group-hover:text-orange-600 transition-colors">Street</span>
                            </h1>
                        </button>

                        {/* Right side icons */}
                        <div className="flex items-center gap-3">
                            {/* Home Icon */}
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                title="Home"
                            >
                                <HomeIcon className="w-6 h-6 text-gray-600" />
                            </button>
                            
                            {/* Burger Menu */}
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Open menu"
                            >
                                <BurgerMenuIcon className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                isHome={true}
                t={t}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
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
                className="relative bg-gradient-to-r from-orange-600 to-amber-600 text-white py-20 overflow-hidden"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20table%201.png?updatedAt=1763405165686)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">
                        Join Indonesia's Largest Massage Accommodation Directory
                    </h1>
                    <p className="text-xl sm:text-2xl mb-4 text-white/95 font-medium">
                        Welcome Hotels & Villas - List Your Property Today!
                    </p>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto">
                        Partner with Indastreet and offer premium massage services to your guests
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                
                {/* Benefits Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Why Partner With Indastreet?
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-orange-500 transform hover:scale-105 transition-all">
                            <TrendingUpIcon className="w-12 h-12 text-orange-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Increase Revenue by 35-40%
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Properties offering massage services experience significant booking increases. 
                                Our platform connects your accommodation with thousands of wellness-focused travelers, 
                                driving more reservations and higher occupancy rates.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-amber-500 transform hover:scale-105 transition-all">
                            <AwardIcon className="w-12 h-12 text-amber-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Premium Accommodation Status
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Offering massage services elevates your property's image to premium accommodation standards. 
                                Stand out from competitors by providing wellness amenities that modern travelers expect 
                                and actively seek when booking their stay.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500 transform hover:scale-105 transition-all">
                            <UsersIcon className="w-12 h-12 text-green-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Enhanced Guest Experience
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Provide your guests with convenient access to professional massage services without leaving 
                                your property. This added convenience creates memorable experiences, leading to better reviews 
                                and increased guest satisfaction scores.
                            </p>
                        </div>

                        {/* Benefit 4 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500 transform hover:scale-105 transition-all">
                            <ZapIcon className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Zero Staff Burden
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Our automated booking system requires no additional help from your staff. Guests simply scan 
                                the Indastreet QR code in their room, and bookings are handled automatically with room numbers 
                                and guest names pre-filled for seamless service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 sm:p-12 mb-16 border border-orange-200">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                        It's Easy & Completely Free!
                    </h2>
                    
                    <div className="grid sm:grid-cols-3 gap-8 mb-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                1
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">Contact Us</h4>
                            <p className="text-gray-700 text-sm">
                                Reach out to our team via WhatsApp
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                2
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">Get Listed</h4>
                            <p className="text-gray-700 text-sm">
                                Add your property with instant live view
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                                3
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">Display QR Code</h4>
                            <p className="text-gray-700 text-sm">
                                Place our small Indastreet display in each room
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">What's Required?</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Simply display our compact Indastreet QR code display in each guest room. 
                                    Guests can scan and book massage services online with their room number and name 
                                    automatically filled in. No additional work needed from your reception or staff team!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Highlights */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <StarIcon className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-900 mb-2">Premium Listing</h4>
                        <p className="text-sm text-gray-600">Featured placement on our directory</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <PhoneIcon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-900 mb-2">Direct Bookings</h4>
                        <p className="text-sm text-gray-600">Guests book directly through your property</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-900 mb-2">Verified Badge</h4>
                        <p className="text-sm text-gray-600">Get verified partner status instantly</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <ZapIcon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-900 mb-2">Instant Setup</h4>
                        <p className="text-sm text-gray-600">Go live in 24 hours or less</p>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-16 border-l-4 border-orange-500">
                    <div className="flex items-start gap-4 mb-4">
                        <img 
                            src="https://ui-avatars.com/api/?name=Hotel+Manager&background=f97316&color=fff&size=60"
                            alt="Testimonial"
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                        />
                        <div>
                            <div className="flex gap-1 mb-2">
                                {[1,2,3,4,5].map(i => (
                                    <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 italic text-lg leading-relaxed mb-3">
                                "Since partnering with Indastreet, our guest satisfaction scores have increased dramatically. 
                                The massage service is now one of our most requested amenities, and the automated booking 
                                system means zero extra work for our staff. It's been a game-changer for our property!"
                            </p>
                            <p className="font-bold text-gray-900">- Villa Manager, Seminyak</p>
                            <p className="text-sm text-gray-600">Partner since Nov 2024</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Ready to Elevate Your Property?
                    </h2>
                    <p className="text-xl mb-8 text-white/95">
                        Join hundreds of hotels and villas already partnering with Indastreet
                    </p>
                    
                    <button
                        onClick={handleContactClick}
                        className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                    >
                        <PhoneIcon className="w-6 h-6" />
                        <span>Contact Indastreet Customer Service</span>
                    </button>

                    <p className="mt-6 text-white/90 text-sm">
                        <MailIcon className="w-4 h-4 inline mr-2" />
                        Or email us at: indastreet.id@gmail.com
                    </p>

                    <div className="mt-8 pt-8 border-t border-white/30">
                        <p className="text-white/95 font-medium text-lg mb-3">
                            ✨ 100% Free to Join • No Hidden Fees • Instant Verification ✨
                        </p>
                        <p className="text-white/90 text-base">
                            🌏 Welcome partners from all areas across Indonesia • No minimum room quantity required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinIndastreetPartnersPage;
