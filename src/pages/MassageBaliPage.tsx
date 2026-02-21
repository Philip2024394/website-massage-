// Massage in Bali – Indonesia-only. UI matches app theme (orange/white). No counts. Prices estimated by area/provider.
import React, { useState, useEffect } from 'react';
import { therapistService, placesService as placeService } from '../lib/appwriteService';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';
import { useCityContext } from '../context/CityContext';
import { ViewProfileButton } from '../components/ViewProfileButton';

interface MassageBaliPageProps {
    onNavigate?: (page: string) => void;
    onSelectTherapist?: (therapistId: number) => void;
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

const MassageBaliPage: React.FC<MassageBaliPageProps> = ({
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
    const { countryCode } = useCityContext();
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [featuredTherapists, setFeaturedTherapists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Only show this page when Indonesia is selected
    const isIndonesia = countryCode === 'ID';
    useEffect(() => {
        if (!isIndonesia && onNavigate) {
            onNavigate('home');
        }
    }, [isIndonesia, onNavigate]);

    useEffect(() => {
        const fetchRealData = async () => {
            try {
                setIsLoading(true);
                const [therapistsData, placesData] = await Promise.all([
                    therapistService.getTherapists(),
                    placeService.getPlaces()
                ]);
                const activeTherapists = therapistsData?.filter((t: any) => t.isLive === true) || [];
                const topRated = activeTherapists
                    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3);
                setFeaturedTherapists(topRated);
            } catch (error) {
                console.error('MassageBaliPage: Error fetching data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRealData();
    }, []);

    const areas = [
        { id: 'seminyak', name: 'Seminyak', type: 'Luxury Beach Resort' },
        { id: 'ubud', name: 'Ubud', type: 'Cultural Wellness Hub' },
        { id: 'canggu', name: 'Canggu', type: 'Surf & Wellness' },
        { id: 'sanur', name: 'Sanur', type: 'Family-Friendly Beach' },
        { id: 'nusa-dua', name: 'Nusa Dua', type: 'Premium Resort Area' },
        { id: 'jimbaran', name: 'Jimbaran', type: 'Beachfront Spa' },
    ];

    const areaImages: Record<string, string> = {
        'seminyak': 'https://ik.imagekit.io/7grri5v7d/indonisea%20city.png?updatedAt=1761741384361',
        'ubud': 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395',
        'canggu': 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20er.png?updatedAt=1761742046025',
        'sanur': 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20paddie.png?updatedAt=1761742312003',
        'nusa-dua': 'https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea.png?updatedAt=1761742702514',
        'jimbaran': 'https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea%20island.png?updatedAt=1761743048054',
    };

    const serviceTypes = [
        { name: 'Traditional Balinese Massage', price: 'IDR 150,000 – 300,000/hour', description: 'Deep tissue with acupressure, reflexology and aromatherapy oils', popularity: 'Most Popular', icon: 'https://ik.imagekit.io/7grri5v7d/hot%20stone%20massage.png?updatedAt=1761745973146' },
        { name: 'Hot Stone Massage', price: 'IDR 250,000 – 450,000/90min', description: 'Heated volcanic stones for deep relaxation', popularity: 'Luxury', icon: 'https://ik.imagekit.io/7grri5v7d/hot%20stone%20massage%20indonisea.png?updatedAt=1761746078889' },
        { name: 'Aromatherapy Massage', price: 'IDR 180,000 – 350,000/hour', description: 'Essential oils for relaxation and healing', popularity: 'Relaxation', icon: 'https://ik.imagekit.io/7grri5v7d/athoromathi%20massage.png?updatedAt=1761746249380' },
        { name: 'Deep Tissue Massage', price: 'IDR 200,000 – 400,000/hour', description: 'Targets muscle knots and chronic tension', popularity: 'Therapeutic', icon: 'https://ik.imagekit.io/7grri5v7d/deep%20tissue.png?updatedAt=1761746165070' },
    ];

    if (!isIndonesia) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md text-center">
                    <p className="text-gray-600 mb-4">This page is only available when Indonesia is selected.</p>
                    <button onClick={() => onNavigate?.('home')} className="rounded-full bg-orange-500 text-white px-5 py-2.5 font-semibold hover:bg-orange-600 transition-colors">Go to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <PageContainer className="py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onNavigate?.('home')} className="p-2 rounded-full hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors" title="Home" aria-label="Home">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </button>
                            <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-orange-50 text-gray-600" title="Menu" aria-label="Menu">
                                <BurgerMenuIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </PageContainer>
            </header>

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

            {/* Hero – same image, app theme overlay */}
            <div className="relative w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382)' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="relative z-10 py-14 md:py-20 text-center">
                    <PageContainer>
                        <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">Bali Wellness</h1>
                        <p className="text-orange-200 text-base md:text-xl font-medium drop-shadow-md mb-1">Therapists · Massage Spas · Facial & Skin Clinics</p>
                        <p className="text-white/90 text-sm md:text-base drop-shadow mb-6">Find verified therapists, spas and facial clinics across the island</p>
                        <p className="text-white/80 text-xs md:text-sm mb-6 max-w-xl mx-auto">Prices are estimated based on area and provider (therapist or spa) location.</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button onClick={() => onNavigate?.('home')} className="rounded-full bg-orange-500 text-white font-semibold px-6 py-3 hover:bg-orange-600 transition-colors shadow-lg text-sm md:text-base">Browse Therapists</button>
                            <button onClick={() => onNavigate?.('home')} className="rounded-full border-2 border-white text-white font-semibold px-6 py-3 hover:bg-white/10 transition-colors text-sm md:text-base">Book Now</button>
                        </div>
                    </PageContainer>
                </div>
            </div>

            <PageContainer className="py-8 md:py-12">
                {/* Popular Areas – no counts */}
                <section className="mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Popular Areas in Bali</h2>
                    <p className="text-center text-gray-600 text-sm mb-6">Therapists, massage spas and facial clinics across the island</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {areas.map((area) => (
                            <div
                                key={area.id}
                                onClick={() => setSelectedArea(area.id)}
                                className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${selectedArea === area.id ? 'border-orange-500 shadow-lg' : 'border-gray-200 bg-white hover:border-orange-300'}`}
                            >
                                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${areaImages[area.id] || ''})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="relative z-10 p-4 flex flex-col justify-end min-h-[120px]">
                                    <h3 className="text-lg font-bold text-white drop-shadow">{area.name}</h3>
                                    <p className="text-white/90 text-xs drop-shadow">{area.type}</p>
                                    <button onClick={(e) => { e.stopPropagation(); onNavigate?.('home'); }} className="mt-3 w-full py-2 rounded-full bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors">View providers</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Service types – pricing note */}
                <section className="mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Popular Services in Bali</h2>
                    <p className="text-center text-gray-600 text-sm mb-2">Massage, spa and facial treatments</p>
                    <p className="text-center text-xs text-gray-500 mb-6">Prices are estimated by area and provider location.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {serviceTypes.map((type, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                    <img src={type.icon} alt={type.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-sm md:text-base">{type.name}</h3>
                                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">{type.popularity}</span>
                                    </div>
                                    <p className="text-gray-600 text-xs mb-2">{type.description}</p>
                                    <p className="text-orange-600 font-semibold text-xs md:text-sm">{type.price}</p>
                                    <button onClick={() => onNavigate?.('home')} className="mt-2 text-orange-600 hover:text-orange-700 font-semibold text-xs">Find provider →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured spas – same images, no counts */}
                <section className="mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Featured Spas & Clinics in Bali</h2>
                    <p className="text-center text-gray-600 text-sm mb-6">Massage spas and facial clinics</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: 'Serene Bali Spa & Wellness', area: 'Seminyak', desc: 'Traditional Balinese massage, hot stone and aromatherapy in a garden setting.', price: 'IDR 250,000', img: 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382' },
                            { name: 'Ubud Healing Center', area: 'Ubud', desc: 'Authentic Balinese healing, deep tissue and reflexology.', price: 'IDR 180,000', img: 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395' },
                            { name: 'Ocean Breeze Spa', area: 'Canggu', desc: 'Beachfront spa with traditional massage and ocean views.', price: 'IDR 300,000', img: 'https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea%20island.png?updatedAt=1761743048054' },
                        ].map((place, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${place.img})` }} />
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{place.name}</h3>
                                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        {place.area}, Bali
                                    </p>
                                    <p className="text-gray-600 text-xs mb-3">{place.desc}</p>
                                    <p className="text-orange-600 font-bold text-sm mb-3">From {place.price}</p>
                                    <button onClick={() => onNavigate?.('home')} className="w-full py-2 rounded-full bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors">View & book</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured therapists – no count in title */}
                <section className="mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Featured Bali Therapists</h2>
                    <p className="text-center text-gray-600 text-sm mb-6">Verified therapists for massage and wellness</p>
                    {isLoading ? (
                        <p className="text-center text-gray-500 py-8">Loading...</p>
                    ) : featuredTherapists.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No featured therapists at the moment</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredTherapists.map((therapist, index) => (
                                <div key={therapist.id || index} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow text-center">
                                    <div className="flex justify-center mb-3">
                                        {therapist.profileImage ? (
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-200">
                                                <img src={therapist.profileImage} alt={therapist.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">{therapist.name?.charAt(0) || '?'}</div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900">{therapist.name}</h3>
                                    <p className="text-gray-500 text-xs">{therapist.location || 'Bali'}</p>
                                    {therapist.rating && <p className="text-orange-600 font-semibold text-sm mt-1">⭐ {therapist.rating.toFixed(1)}</p>}
                                    <ViewProfileButton onClick={() => onNavigate?.('home')} className="mt-3 w-full py-2 rounded-full" ariaLabel="View profile" />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Why Bali – same image */}
                <section className="mb-10 md:mb-14 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="relative h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395)' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
                    <div className="relative z-10 -mt-32 md:-mt-40 p-6 md:p-10 text-white">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Therapists, Spas & Facial Clinics in Bali</h2>
                        <p className="text-center text-white/90 text-sm md:text-base max-w-2xl mx-auto">
                            Bali is a wellness hub for massage therapists, massage spas and facial & skin clinics. Find verified providers for in-room, villa or spa treatments.
                        </p>
                    </div>
                </section>

                {/* How to book – app theme */}
                <section className="mb-10 md:mb-14">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How to book</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { step: 1, title: 'Browse', text: 'Therapists, spas and facial clinics by area' },
                            { step: 2, title: 'Check reviews', text: 'Verified reviews from real clients' },
                            { step: 3, title: 'Chat & book', text: 'Chat with therapist or spa to arrange booking' },
                            { step: 4, title: 'Enjoy', text: 'In-room, villa or at the spa' },
                        ].map(({ step, title, text }) => (
                            <div key={step} className="text-center">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center mx-auto mb-2 text-sm">{step}</div>
                                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                                <p className="text-gray-600 text-xs">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-10 md:mb-14 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">How much do massage and spa services cost in Bali?</h3>
                            <p className="text-gray-600 text-xs mt-1">Prices are estimated by area and provider (therapist or spa). Traditional Balinese massage is typically IDR 150,000–300,000/hour; hot stone and premium treatments can be IDR 250,000–450,000. Hotel and resort spas are often higher.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Where can I find therapists, massage spas and facial clinics in Bali?</h3>
                            <p className="text-gray-600 text-xs mt-1">Popular areas include Ubud, Seminyak, Canggu, Nusa Dua, Sanur and Jimbaran. IndaStreet lists verified therapists, massage spas and facial & skin clinics across the island.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Can I book at my hotel or villa?</h3>
                            <p className="text-gray-600 text-xs mt-1">Yes. Many therapists offer in-room or in-villa services; specify your location when booking.</p>
                        </div>
                    </div>
                </section>

                {/* CTA – no count */}
                <section className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="relative py-12 md:py-16 bg-cover bg-center" style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382)' }}>
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative z-10 text-center text-white px-4">
                            <h2 className="text-xl md:text-2xl font-bold mb-2">Book therapists, spas & facial clinics in Bali</h2>
                            <p className="text-white/90 text-sm mb-6 max-w-md mx-auto">Verified therapists, massage spas and facial & skin clinics. Prices estimated by area and provider.</p>
                            <button onClick={() => onNavigate?.('home')} className="rounded-full bg-orange-500 text-white font-semibold px-6 py-3 hover:bg-orange-600 transition-colors">Browse providers</button>
                        </div>
                    </div>
                </section>
            </PageContainer>
        </div>
    );
};

export default MassageBaliPage;
