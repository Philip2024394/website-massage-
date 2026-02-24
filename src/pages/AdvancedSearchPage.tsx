// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import FloatingPageFooter from '../components/FloatingPageFooter';
import CityLocationDropdown from '../components/CityLocationDropdown';
import AreaFilter from '../components/AreaFilter';
import { useCityContext } from '../context/CityContext';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';

interface AdvancedSearchPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const AdvancedSearchPage: React.FC<AdvancedSearchPageProps> = ({ t, language, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'id');
    const { city: contextCity, setCity } = useCityContext();
    // Use local state for selected city, initialized from context
    const [selectedCity, setSelectedCity] = useState<string>(contextCity || 'all');
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [providerType, setProviderType] = useState<'therapist' | 'massage_place' | 'skin_care'>('therapist');
    const [filters, setFilters] = useState({
        massageType: '',
        gender: '',
        clientType: '',
        priceRange: '',
        rating: '',
        availability: '',
        experience: '',
        safePass: false,
        specialties: [] as string[]
    });

    const handleLanguageChange = (newLang: string) => {
        setCurrentLanguage(newLang as 'en' | 'id');
        console.log('Language changed to:', newLang);
    };

    const handleSearch = () => {
        const params = {
            providerType,
            city: selectedCity,
            area: selectedArea,
            ...filters
        };
        try {
            sessionStorage.setItem('advanced_search_params', JSON.stringify(params));
        } catch (_) {}
        onNavigate?.('home');
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
            <UniversalHeader
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
            />

            <main className="pt-[56px] pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
                {/* Page header – same as home/app theme */}
                <header className="pt-6 pb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">street</span>
                    </h1>
                    <p className="text-lg font-semibold text-gray-700">
                        {currentLanguage === 'id' ? 'Pencarian Lanjutan' : 'Advanced Search'}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                        {currentLanguage === 'id'
                            ? 'Cari terapis, tempat pijat, dan klinik perawatan kulit'
                            : 'Search therapists, massage places & skin care clinics'}
                    </p>
                </header>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    
                    {/* Provider type: Therapist | Massage Place | Skin Care Clinic */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {currentLanguage === 'id' ? 'Jenis penyedia' : 'Provider type'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 'therapist' as const, labelEn: 'Therapists', labelId: 'Terapis' },
                                { value: 'massage_place' as const, labelEn: 'Massage Places', labelId: 'Tempat Pijat' },
                                { value: 'skin_care' as const, labelEn: 'Skin Care Clinics', labelId: 'Klinik Perawatan Kulit' }
                            ].map(({ value, labelEn, labelId }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setProviderType(value)}
                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${
                                        providerType === value
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {currentLanguage === 'id' ? labelId : labelEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* City Location Filter - Primary Filter */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {currentLanguage === 'id' ? '📍 Lokasi Kota' : '📍 City Location'}
                        </label>
                        <div className="relative">
                            <CityLocationDropdown
                                selectedCity={selectedCity}
                                onCityChange={(newCity) => {
                                    setSelectedCity(newCity);
                                    if (newCity !== 'all') setCity(newCity);
                                    setSelectedArea(null);
                                }}
                                placeholder={currentLanguage === 'id' ? '🇮🇩 Semua Indonesia' : '🇮🇩 All Indonesia'}
                                includeAll={true}
                                showLabel={false}
                                className="w-full rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {currentLanguage === 'id' ? '💡 Filter terapis, tempat pijat, dan klinik berdasarkan kota' : '💡 Filter therapists, massage places & skin care clinics by city'}
                        </p>
                    </div>

                    {/* Area Filter - Sub-areas within selected city */}
                    {selectedCity && selectedCity !== 'all' && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {currentLanguage === 'id' ? '📍 Area dalam ' + selectedCity : '📍 Areas in ' + selectedCity}
                            </label>
                            <AreaFilter
                                city={selectedCity}
                                selectedArea={selectedArea}
                                onAreaChange={setSelectedArea}
                            />
                        </div>
                    )}

                    {/* Verified Members */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-800">
                                {currentLanguage === 'id' ? 'Member terverifikasi' : 'Verified members'}
                            </h3>
                            <img 
                                src={VERIFIED_BADGE_IMAGE_URL} 
                                alt="Verified" 
                                className="w-6 h-6 object-contain"
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            {currentLanguage === 'id' ? 'Cari dari terapis, tempat pijat, dan klinik yang terverifikasi' : 'Search verified therapists, massage places & skin care clinics'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Massage Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Jenis Pijat' : 'Massage Type'}
                            </label>
                            <select
                                value={filters.massageType}
                                onChange={(e) => setFilters({ ...filters, massageType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Semua Jenis Pijat' : 'All Massage Types'}</option>
                                <option value="balinese">{currentLanguage === 'id' ? 'Pijat Bali' : 'Balinese Massage'}</option>
                                <option value="aromatherapy">{currentLanguage === 'id' ? 'Pijat Aromaterapi' : 'Aromatherapy Massage'}</option>
                                <option value="deep-tissue">{currentLanguage === 'id' ? 'Pijat Deep Tissue' : 'Deep Tissue Massage'}</option>
                                <option value="swedish">{currentLanguage === 'id' ? 'Pijat Swedish' : 'Swedish Massage'}</option>
                                <option value="thai">{currentLanguage === 'id' ? 'Pijat Thai' : 'Thai Massage'}</option>
                                <option value="sports">{currentLanguage === 'id' ? 'Pijat Olahraga' : 'Sports Massage'}</option>
                                <option value="shiatsu">{currentLanguage === 'id' ? 'Pijat Shiatsu' : 'Shiatsu Massage'}</option>
                                <option value="hot-stone">{currentLanguage === 'id' ? 'Pijat Batu Panas' : 'Hot Stone Massage'}</option>
                                <option value="reflexology">{currentLanguage === 'id' ? 'Pijat Refleksi' : 'Reflexology Massage'}</option>
                                <option value="pregnancy">{currentLanguage === 'id' ? 'Pijat Kehamilan' : 'Pregnancy Massage'}</option>
                                <option value="couples">{currentLanguage === 'id' ? 'Pijat Pasangan' : 'Couples Massage'}</option>
                                <option value="head-shoulder">{currentLanguage === 'id' ? 'Pijat Kepala & Bahu' : 'Head & Shoulder Massage'}</option>
                                <option value="foot-massage">{currentLanguage === 'id' ? 'Pijat Kaki' : 'Foot Massage'}</option>
                                <option value="facial-massage">{currentLanguage === 'id' ? 'Pijat Wajah' : 'Facial Massage'}</option>
                                <option value="lymphatic-drainage">{currentLanguage === 'id' ? 'Drainase Limfatik' : 'Lymphatic Drainage'}</option>
                                <option value="traditional-javanese">{currentLanguage === 'id' ? 'Pijat Tradisional Jawa' : 'Traditional Javanese Massage'}</option>
                                <option value="acupressure">{currentLanguage === 'id' ? 'Pijat Akupresur' : 'Acupressure Massage'}</option>
                                <option value="cupping-massage">{currentLanguage === 'id' ? 'Pijat Bekam' : 'Cupping Massage'}</option>
                                <option value="body-scrub">{currentLanguage === 'id' ? 'Lulur & Pijat' : 'Body Scrub & Massage'}</option>
                            </select>
                        </div>

                        {/* Therapist Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Gender Terapis' : 'Therapist Gender'}
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value=""
                                        checked={filters.gender === ''}
                                        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                        className="mr-2"
                                    />
                                    {currentLanguage === 'id' ? 'Semua' : 'All'}
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={filters.gender === 'female'}
                                        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                        className="mr-2"
                                    />
                                    <span className="w-3 h-3 rounded-full bg-pink-500 mr-1.5"></span>
                                    {currentLanguage === 'id' ? 'Wanita' : 'Female'}
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={filters.gender === 'male'}
                                        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                        className="mr-2"
                                    />
                                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
                                    {currentLanguage === 'id' ? 'Pria' : 'Male'}
                                </label>
                            </div>
                        </div>

                        {/* Client Specialization */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Spesialisasi Klien' : 'Client Specialization'}
                            </label>
                            <select
                                value={filters.clientType}
                                onChange={(e) => setFilters({ ...filters, clientType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Semua Klien' : 'All Clients'}</option>
                                <option value="women">{currentLanguage === 'id' ? 'Khusus Wanita' : 'Women Only'}</option>
                                <option value="men">{currentLanguage === 'id' ? 'Khusus Pria' : 'Men Only'}</option>
                                <option value="children">{currentLanguage === 'id' ? 'Khusus Anak-anak' : 'Children Only'}</option>
                                <option value="pregnant">{currentLanguage === 'id' ? 'Khusus Ibu Hamil' : 'Pregnant Women Only'}</option>
                                <option value="couples">{currentLanguage === 'id' ? 'Pasangan' : 'Couples'}</option>
                                <option value="families">{currentLanguage === 'id' ? 'Keluarga' : 'Families'}</option>
                                <option value="elderly">{currentLanguage === 'id' ? 'Lansia' : 'Elderly'}</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {currentLanguage === 'id' ? '💡 Terapis yang berpengalaman dengan kelompok klien tertentu' : '💡 Therapists experienced with specific client groups'}
                            </p>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Rentang Harga' : 'Price Range'}
                            </label>
                            <select
                                value={filters.priceRange}
                                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Semua Rentang Harga' : 'All Price Ranges'}</option>
                                <option value="0-150000">{currentLanguage === 'id' ? 'Rp 0 - 150,000 (Ekonomis)' : 'Rp 0 - 150,000 (Budget)'}</option>
                                <option value="150000-300000">{currentLanguage === 'id' ? 'Rp 150,000 - 300,000 (Standar)' : 'Rp 150,000 - 300,000 (Standard)'}</option>
                                <option value="300000-500000">{currentLanguage === 'id' ? 'Rp 300,000 - 500,000 (Premium)' : 'Rp 300,000 - 500,000 (Premium)'}</option>
                                <option value="500000-750000">{currentLanguage === 'id' ? 'Rp 500,000 - 750,000 (VIP)' : 'Rp 500,000 - 750,000 (VIP)'}</option>
                                <option value="750000-1000000">{currentLanguage === 'id' ? 'Rp 750,000 - 1,000,000 (Luxury)' : 'Rp 750,000 - 1,000,000 (Luxury)'}</option>
                                <option value="1000000+">{currentLanguage === 'id' ? 'Rp 1,000,000+ (Elite)' : 'Rp 1,000,000+ (Elite)'}</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {currentLanguage === 'id' ? '💡 Harga untuk sesi 60 menit' : '💡 Prices for 60-minute sessions'}
                            </p>
                        </div>

                        {/* Availability */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Ketersediaan' : 'Availability'}
                            </label>
                            <select
                                value={filters.availability}
                                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Kapan Saja' : 'Anytime'}</option>
                                <option value="now">{currentLanguage === 'id' ? 'Sekarang' : 'Available Now'}</option>
                                <option value="today">{currentLanguage === 'id' ? 'Hari Ini' : 'Today'}</option>
                                <option value="tomorrow">{currentLanguage === 'id' ? 'Besok' : 'Tomorrow'}</option>
                                <option value="thisweek">{currentLanguage === 'id' ? 'Minggu Ini' : 'This Week'}</option>
                            </select>
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentLanguage === 'id' ? 'Pengalaman Minimum' : 'Minimum Experience'}
                            </label>
                            <select
                                value={filters.experience}
                                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Semua Level' : 'All Levels'}</option>
                                <option value="1">{currentLanguage === 'id' ? '1+ Tahun' : '1+ Years'}</option>
                                <option value="3">{currentLanguage === 'id' ? '3+ Tahun' : '3+ Years'}</option>
                                <option value="5">{currentLanguage === 'id' ? '5+ Tahun' : '5+ Years'}</option>
                                <option value="10">{currentLanguage === 'id' ? '10+ Tahun' : '10+ Years'}</option>
                            </select>
                        </div>

                        {/* SafePass Filter */}
                        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.safePass}
                                    onChange={(e) => setFilters({ ...filters, safePass: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3"
                                />
                                <div className="flex items-center gap-2">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/hotel%205.png?updatedAt=1770362023320" 
                                        alt="SafePass" 
                                        className="w-8 h-8 object-contain"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {currentLanguage === 'id' ? 'SafePass Terverifikasi' : 'SafePass Verified'}
                                        </span>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {currentLanguage === 'id' ? 'Terapis dengan sertifikasi hotel, villa & tempat umum' : 'Therapists certified for hotels, villas & public places'}
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                {currentLanguage === 'id'
                                ? (providerType === 'therapist' ? '🔍 Cari Terapis' : providerType === 'massage_place' ? '🔍 Cari Tempat Pijat' : '🔍 Cari Klinik')
                                : (providerType === 'therapist' ? '🔍 Search Therapists' : providerType === 'massage_place' ? '🔍 Search Massage Places' : '🔍 Search Skin Care Clinics')}
                            </button>
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                {currentLanguage === 'id' ? 'Batal' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <FloatingPageFooter
                currentLanguage={currentLanguage}
                onNavigate={onNavigate}
            />

            {/* App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate || (() => {})}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
            />
        </div>
    );
};

export default AdvancedSearchPage;
