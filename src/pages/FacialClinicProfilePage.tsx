// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect, useRef } from 'react';
import { 
    Clock, MapPin, Phone, Mail, Star, 
    Award, Users, Sparkles, Calendar, CheckCircle, X, Heart,
    Image as ImageIcon, Play, Shield, TrendingUp
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import HomeIcon from '../components/icons/HomeIcon';

interface Treatment {
    id: string;
    name: string;
    description: string;
    image: string;
    prices: {
        min60: number;
        min90: number;
        min120: number;
    };
    category: string;
    popular?: boolean;
    new?: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    specialization: string;
    experience: string;
}

interface GalleryImage {
    id: string;
    url: string;
    caption: string;
    category: 'before-after' | 'interior' | 'treatment';
}

interface FacialClinic {
    id: string;
    name: string;
    tagline: string;
    description: string;
    heroImage: string;
    logo: string;
    location: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    website?: string;
    rating: number;
    reviewCount: number;
    totalTreatments: number;
    yearsInBusiness: number;
    certifications: string[];
    operatingHours: {
        weekdays: string;
        weekend: string;
    };
    treatments: Treatment[];
    team: TeamMember[];
    gallery: GalleryImage[];
    amenities: string[];
    specialOffers?: {
        title: string;
        description: string;
        discount: number;
        validUntil: string;
    };
}

interface FacialClinicProfilePageProps {
    clinic: FacialClinic;
    onBack?: () => void;
    onBook?: (treatment: Treatment) => void;
    onNavigate?: (page: string) => void;
    therapists?: any[];
    places?: any[];
}

const FacialClinicProfilePage: React.FC<FacialClinicProfilePageProps> = ({
    clinic,
    onBack,
    onBook,
    onNavigate,
    therapists = [],
    places = []
}) => {
    const [currentTreatmentIndex, setCurrentTreatmentIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120>(90);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Auto-scroll treatments slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTreatmentIndex((prev) => 
                (prev + 1) % filteredTreatments.length
            );
        }, 5000);
        return () => clearInterval(interval);
    }, [clinic.treatments.length]);

    // Filter treatments by category
    const categories = ['all', ...Array.from(new Set(clinic.treatments.map(t => t.category)))];
    const filteredTreatments = selectedCategory === 'all' 
        ? clinic.treatments 
        : clinic.treatments.filter(t => t.category === selectedCategory);

    const handlePrevTreatment = () => {
        setCurrentTreatmentIndex((prev) => 
            prev === 0 ? filteredTreatments.length - 1 : prev - 1
        );
    };

    const handleNextTreatment = () => {
        setCurrentTreatmentIndex((prev) => 
            (prev + 1) % filteredTreatments.length
        );
    };

    const currentTreatment = filteredTreatments[currentTreatmentIndex];

    const handleBookTreatment = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setShowBookingModal(true);
    };

    const confirmBooking = () => {
        if (selectedTreatment && onBook) {
            onBook(selectedTreatment);
        }
        setShowBookingModal(false);
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={() => onNavigate?.('massage-jobs')}
                onVillaPortalClick={() => onNavigate?.('villa-portal')}
                onTherapistPortalClick={() => onNavigate?.('therapist-portal')}
                onFacialPortalClick={() => onNavigate?.('facial-portal')}
                onAgentPortalClick={() => onNavigate?.('agent-portal')}
                onCustomerPortalClick={() => onNavigate?.('customer-portal')}
                onAdminPortalClick={() => onNavigate?.('admin-portal')}
                onTermsClick={() => onNavigate?.('terms')}
                onPrivacyClick={() => onNavigate?.('privacy')}
                therapists={therapists}
                places={places}
            />

            {/* Fixed Header */}
            <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span>◀</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <img src={clinic.logo} alt={clinic.name} className="w-8 h-8 rounded-full" />
                        <h1 className="text-lg font-bold truncate max-w-[200px]">{clinic.name}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <HomeIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <BurgerMenuIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden">
                <img 
                    src={clinic.heroImage} 
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-7xl mx-auto">
                        {clinic.specialOffers && (
                            <div className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full text-sm font-semibold mb-3 animate-pulse">
                                <Sparkles className="w-4 h-4" />
                                <span>{clinic.specialOffers.discount}% OFF - Limited Time!</span>
                            </div>
                        )}
                        
                        <h2 className="text-4xl font-bold mb-2">{clinic.name}</h2>
                        <p className="text-xl mb-4 text-orange-100">{clinic.tagline}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold">{clinic.rating.toFixed(1)}</span>
                                <span className="text-sm">({clinic.reviewCount} reviews)</span>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Users className="w-5 h-5" />
                                <span className="font-semibold">{clinic.totalTreatments}+ Treatments</span>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Award className="w-5 h-5" />
                                <span className="font-semibold">{clinic.yearsInBusiness} Years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <a
                        href={`tel:${clinic.phone}`}
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Call</span>
                    </a>
                    
                    <a
                        href={`https://wa.me/${clinic.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
                    </a>
                    
                    <button
                        onClick={() => window.location.href = `https://maps.google.com/?q=${clinic.location}`}
                        className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Directions</span>
                    </button>
                </div>

                {/* Featured Treatments Slider */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Our Treatments</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevTreatment}
                                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            >
                                <span>◀</span>
                            </button>
                            <button
                                onClick={handleNextTreatment}
                                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            >
                                <span>▶</span>
                            </button>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                                    selectedCategory === category
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-orange-50'
                                }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Treatment Card Slider */}
                    {currentTreatment && (
                        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="relative h-80">
                                <img
                                    src={currentTreatment.image}
                                    alt={currentTreatment.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                
                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {currentTreatment.popular && (
                                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <Heart className="w-4 h-4" /> Popular
                                        </span>
                                    )}
                                    {currentTreatment.new && (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <Sparkles className="w-4 h-4" /> New
                                        </span>
                                    )}
                                </div>

                                {/* Treatment Info Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="text-sm text-orange-200 font-semibold mb-1">
                                        {currentTreatment.category.toUpperCase()}
                                    </div>
                                    <h4 className="text-2xl font-bold mb-2">{currentTreatment.name}</h4>
                                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                                        {currentTreatment.description}
                                    </p>
                                </div>
                            </div>

                            {/* Pricing Grid */}
                            <div className="p-6 bg-gradient-to-br from-orange-50 to-white">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer">
                                        <div className="text-sm text-gray-600 mb-1">60 Min</div>
                                        <div className="text-xl font-bold text-orange-600">
                                            Rp {currentTreatment.prices.min60.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Basic</div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md text-white transform scale-105">
                                        <div className="text-sm mb-1 opacity-90">90 Min</div>
                                        <div className="text-2xl font-bold">
                                            Rp {currentTreatment.prices.min90.toLocaleString()}
                                        </div>
                                        <div className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full inline-block">
                                            Most Popular
                                        </div>
                                    </div>
                                    
                                    <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer">
                                        <div className="text-sm text-gray-600 mb-1">120 Min</div>
                                        <div className="text-xl font-bold text-orange-600">
                                            Rp {currentTreatment.prices.min120.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Luxury</div>
                                    </div>
                                </div>

                                {/* Book Now Button */}
                                <button
                                    onClick={() => handleBookTreatment(currentTreatment)}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Book This Treatment
                                </button>
                            </div>

                            {/* Slider Indicators */}
                            <div className="flex justify-center gap-2 py-4 bg-gray-50">
                                {filteredTreatments.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentTreatmentIndex(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentTreatmentIndex
                                                ? 'w-8 bg-orange-500'
                                                : 'w-2 bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* About Section */}
                <section className="mb-12 bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                        About {clinic.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        {clinic.description}
                    </p>
                    
                    {/* Certifications */}
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-orange-500" />
                            Certifications & Awards
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {clinic.certifications.map((cert, index) => (
                                <span
                                    key={index}
                                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-500" />
                            Amenities & Facilities
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {clinic.amenities.map((amenity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-gray-700"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-sm">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Image Gallery */}
                <section className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-orange-500" />
                        Gallery
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {clinic.gallery.map((image) => (
                            <button
                                key={image.id}
                                onClick={() => setSelectedImage(image)}
                                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                            >
                                <img
                                    src={image.url}
                                    alt={image.caption}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className="text-white text-sm font-semibold">
                                        {image.caption}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Our Team */}
                <section className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-500" />
                        Meet Our Team
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {clinic.team.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-center gap-4 p-6">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-orange-100"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-gray-900">{member.name}</h4>
                                        <p className="text-orange-600 font-semibold text-sm">{member.role}</p>
                                        <p className="text-gray-600 text-sm mt-1">{member.specialization}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <TrendingUp className="w-4 h-4" />
                                            {member.experience}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact & Hours */}
                <section className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Operating Hours */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-orange-500" />
                            Operating Hours
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="font-semibold text-gray-700">Monday - Friday</span>
                                <span className="text-orange-600 font-bold">{clinic.operatingHours.weekdays}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="font-semibold text-gray-700">Saturday - Sunday</span>
                                <span className="text-orange-600 font-bold">{clinic.operatingHours.weekend}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-6 h-6 text-orange-500" />
                            Contact Us
                        </h3>
                        <div className="space-y-3">
                            <a
                                href={`tel:${clinic.phone}`}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <Phone className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-700">{clinic.phone}</span>
                            </a>
                            <a
                                href={`mailto:${clinic.email}`}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <Mail className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-700">{clinic.email}</span>
                            </a>
                            <a
                                href={`https://maps.google.com/?q=${clinic.location}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <MapPin className="w-5 h-5 text-orange-500" />
                                <span className="text-gray-700">{clinic.address}</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Special Offer Banner */}
                {clinic.specialOffers && (
                    <section className="mb-12">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-6 h-6" />
                                    <span className="font-bold text-lg">Limited Time Offer!</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{clinic.specialOffers.title}</h3>
                                <p className="text-orange-100 mb-4">{clinic.specialOffers.description}</p>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl font-bold">{clinic.specialOffers.discount}% OFF</div>
                                    <div className="text-sm">
                                        <div>Valid until</div>
                                        <div className="font-bold">{clinic.specialOffers.validUntil}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <section className="text-center bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Skin?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Book your appointment today and experience the best facial treatments in town!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => handleBookTreatment(clinic.treatments[0])}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Calendar className="w-5 h-5 inline mr-2" />
                            Book Now
                        </button>
                        <a
                            href={`https://wa.me/${clinic.whatsapp}?text=Hi! I'd like to inquire about your facial treatments.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Phone className="w-5 h-5 inline mr-2" />
                            WhatsApp Us
                        </a>
                    </div>
                </section>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedTreatment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] ">
                        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Book Treatment</h3>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <img
                                    src={selectedTreatment.image}
                                    alt={selectedTreatment.name}
                                    className="w-full h-48 object-cover rounded-xl mb-4"
                                />
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedTreatment.name}
                                </h4>
                                <p className="text-gray-600">{selectedTreatment.description}</p>
                            </div>

                            {/* Duration Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Select Duration
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[60, 90, 120].map((duration) => (
                                        <button
                                            key={duration}
                                            onClick={() => setSelectedDuration(duration as 60 | 90 | 120)}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                selectedDuration === duration
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                        >
                                            <div className="text-sm text-gray-600 mb-1">{duration} Min</div>
                                            <div className="font-bold text-orange-600">
                                                Rp {selectedTreatment.prices[`min${duration}` as keyof typeof selectedTreatment.prices].toLocaleString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={confirmBooking}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
                                >
                                    Confirm Booking
                                </button>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="max-w-4xl w-full">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.caption}
                            className="w-full h-auto rounded-xl"
                        />
                        <p className="text-white text-center mt-4 text-lg">
                            {selectedImage.caption}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacialClinicProfilePage;
