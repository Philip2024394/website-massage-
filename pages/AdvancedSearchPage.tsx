import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FloatingPageFooter from '../components/FloatingPageFooter';
import CityLocationDropdown from '../components/CityLocationDropdown';
import AreaFilter from '../components/AreaFilter';
import { useCityContext } from '../context/CityContext';

interface AdvancedSearchPageProps {
    t: any;
    language?: 'en' | 'id';
    onNavigate?: (page: string) => void;
}

const AdvancedSearchPage: React.FC<AdvancedSearchPageProps> = ({ t, language, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'en');
    const { selectedCity, setSelectedCity } = useCityContext();
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        massageType: '',
        gender: '',
        clientType: '',
        priceRange: '',
        rating: '',
        availability: '',
        experience: '',
        specialties: [] as string[]
    });

    const handleLanguageChange = (newLang: string) => {
        setCurrentLanguage(newLang as 'en' | 'id');
        console.log('Language changed to:', newLang);
    };

    const handleSearch = () => {
        // Implement search logic here
        console.log('Searching with filters:', filters);
        onNavigate?.('home');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Universal Header */}
            <UniversalHeader 
                language={currentLanguage}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
                {/* Back Arrow */}
                <button
                    onClick={() => onNavigate?.('home')}
                    className="mb-6 ml-2 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 will-change-transform"
                    title={currentLanguage === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-8 -mt-10">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                        alt="IndaStreet Massage Logo" 
                        className="w-60 h-60 object-contain mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {currentLanguage === 'id' ? 'Pencarian Lanjutan' : 'Advanced Search'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        {currentLanguage === 'id' ? 'Temukan terapis yang sesuai dengan kebutuhan Anda' : 'Find therapists that match your specific needs'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    
                    {/* City Location Filter - Primary Filter */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {currentLanguage === 'id' ? '📍 Lokasi Kota' : '📍 City Location'}
                        </label>
                        <CityLocationDropdown
                            selectedCity={selectedCity}
                            onCityChange={(newCity) => {
                                console.log('🏙️ City changed in advanced search:', newCity);
                                setSelectedCity(newCity);
                                setSelectedArea(null); // Reset area when city changes
                            }}
                            placeholder={currentLanguage === 'id' ? '🇮🇩 Semua Indonesia' : '🇮🇩 All Indonesia'}
                            includeAll={true}
                            showLabel={false}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {currentLanguage === 'id' ? '💡 Filter terapis dan tempat berdasarkan kota' : '💡 Filter therapists and places by city'}
                        </p>
                    </div>

                    {/* Area Filter - Sub-areas within selected city */}
                    {selectedCity && selectedCity !== 'all' && (
                        <div className="mb-8">
                            <AreaFilter
                                city={selectedCity}
                                selectedArea={selectedArea}
                                onAreaChange={setSelectedArea}
                            />
                        </div>
                    )}
                    <>                    {/* Verified Members Header */
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {currentLanguage === 'id' ? 'Pencarian Member Terverifikasi' : 'Verified Members Search'}
                            </h3>
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565" 
                                alt="Verified Badge" 
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            {currentLanguage === 'id' ? 'Cari hanya dari terapis yang telah diverifikasi' : 'Search only verified therapists'}
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">{currentLanguage === 'id' ? 'Semua Level' : 'All Levels'}</option>
                                <option value="1">{currentLanguage === 'id' ? '1+ Tahun' : '1+ Years'}</option>
                                <option value="3">{currentLanguage === 'id' ? '3+ Tahun' : '3+ Years'}</option>
                                <option value="5">{currentLanguage === 'id' ? '5+ Tahun' : '5+ Years'}</option>
                                <option value="10">{currentLanguage === 'id' ? '10+ Tahun' : '10+ Years'}</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                {currentLanguage === 'id' ? '🔍 Cari Terapis' : '🔍 Search Therapists'}
                            </button>
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                {currentLanguage === 'id' ? 'Batal' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                    </>
                </div>
            </div>

            {/* Footer */}
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
