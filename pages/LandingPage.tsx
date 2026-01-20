import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import PageNumberBadge from '../components/PageNumberBadge';
import PWAInstallIOSModal from '../components/PWAInstallIOSModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MapPin, Play, Globe, Search, X, ChevronDown } from 'lucide-react';
import { useCityContext } from '../context/CityContext';
import UniversalHeader from '../components/shared/UniversalHeader';
import { loadLanguageResources } from '../lib/i18n';
import { ipGeolocationService } from '../lib/ipGeolocationService';
import type { UserLocation } from '../types';
import type { Language } from '../types/pageTypes';

interface LandingPageProps {
    onLanguageSelect?: (lang: Language) => void;
    onEnterApp?: (language: Language, location: UserLocation) => void;
    handleEnterApp?: (lang: Language, location: UserLocation) => Promise<void>;
    handleLanguageSelect?: (lang: Language) => Promise<void>;
    language?: Language;
    onLanguageChange?: (lang: Language) => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

// Multi-country data for location selectors with native language mapping
const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', description: 'Southeast Asian archipelago', language: 'id', languages: ['id', 'en'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', description: 'Truly Asia', language: 'en', languages: ['en'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', description: 'Lion City', language: 'en', languages: ['en'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', description: 'Land of Smiles', language: 'en', languages: ['en'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', description: 'Pearl of the Orient Seas', language: 'tl', languages: ['tl', 'en'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', description: 'Timeless Charm', language: 'en', languages: ['en'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', description: 'England, Scotland, Wales', language: 'en', languages: ['en'] },
  { code: 'US', name: 'United States', flag: '🇺🇸', description: 'Land of opportunity', language: 'en', languages: ['en'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', description: 'Down under', language: 'en', languages: ['en'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', description: 'Heart of Europe', language: 'de', languages: ['de', 'en'] },
];

interface CityOption {
  name: string;
  region: string;
  description: string;
  popular: boolean;
  country: string;
}

const CITIES_BY_COUNTRY: Record<string, CityOption[]> = {
  // INDONESIA - 80+ cities with regions
  ID: [
    { name: 'Jakarta', region: 'DKI Jakarta', description: 'Capital of Indonesia', popular: true, country: 'ID' },
    { name: 'Canggu', region: 'Bali', description: 'Surfing & digital nomad hub', popular: true, country: 'ID' },
    { name: 'Seminyak', region: 'Bali', description: 'Luxury beach resort area', popular: true, country: 'ID' },
    { name: 'Kuta', region: 'Bali', description: 'Famous beach & nightlife', popular: true, country: 'ID' },
    { name: 'Ubud', region: 'Bali', description: 'Cultural heart of Bali', popular: true, country: 'ID' },
    { name: 'Sanur', region: 'Bali', description: 'Relaxed beachside town', popular: true, country: 'ID' },
    { name: 'Denpasar', region: 'Bali', description: 'Capital of Bali', popular: true, country: 'ID' },
    { name: 'Nusa Dua', region: 'Bali', description: 'Luxury resort enclave', popular: true, country: 'ID' },
    { name: 'Jimbaran', region: 'Bali', description: 'Seafood & sunset beaches', popular: true, country: 'ID' },
    { name: 'Yogyakarta', region: 'DI Yogyakarta', description: 'Cultural & historical city', popular: true, country: 'ID' },
    { name: 'Bandung', region: 'West Java', description: 'Cool mountain city', popular: true, country: 'ID' },
    { name: 'Surabaya', region: 'East Java', description: 'Second largest city', popular: true, country: 'ID' },
    { name: 'Medan', region: 'North Sumatra', description: 'Gateway to Sumatra', popular: true, country: 'ID' },
    { name: 'Malang', region: 'East Java', description: 'Cool highland city', popular: false, country: 'ID' },
    { name: 'Semarang', region: 'Central Java', description: 'Port city', popular: false, country: 'ID' },
    { name: 'Palembang', region: 'South Sumatra', description: 'River city', popular: false, country: 'ID' },
    { name: 'Makassar', region: 'South Sulawesi', description: 'Gateway to eastern Indonesia', popular: false, country: 'ID' },
    { name: 'Batam', region: 'Riau Islands', description: 'Industrial island city', popular: false, country: 'ID' },
    { name: 'Pekanbaru', region: 'Riau', description: 'Oil city', popular: false, country: 'ID' },
    { name: 'Tangerang', region: 'Banten', description: 'Jakarta satellite city', popular: false, country: 'ID' },
    { name: 'Bogor', region: 'West Java', description: 'Rain city', popular: false, country: 'ID' },
    { name: 'Bekasi', region: 'West Java', description: 'Industrial hub', popular: false, country: 'ID' },
    { name: 'Depok', region: 'West Java', description: 'University town', popular: false, country: 'ID' },
  ],
  
  // MALAYSIA - Major cities
  MY: [
    { name: 'Kuala Lumpur', region: 'Federal Territory', description: 'Capital of Malaysia', popular: true, country: 'MY' },
    { name: 'KLCC', region: 'Kuala Lumpur', description: 'Twin towers district', popular: true, country: 'MY' },
    { name: 'Bukit Bintang', region: 'Kuala Lumpur', description: 'Shopping & entertainment', popular: true, country: 'MY' },
    { name: 'George Town', region: 'Penang', description: 'UNESCO heritage city', popular: true, country: 'MY' },
    { name: 'Johor Bahru', region: 'Johor', description: 'Gateway to Singapore', popular: true, country: 'MY' },
    { name: 'Petaling Jaya', region: 'Selangor', description: 'Satellite city', popular: true, country: 'MY' },
    { name: 'Shah Alam', region: 'Selangor', description: 'State capital', popular: false, country: 'MY' },
    { name: 'Ipoh', region: 'Perak', description: 'Heritage city', popular: false, country: 'MY' },
    { name: 'Malacca City', region: 'Malacca', description: 'Historic port city', popular: false, country: 'MY' },
    { name: 'Kota Kinabalu', region: 'Sabah', description: 'Gateway to Borneo', popular: false, country: 'MY' },
  ],
  
  // SINGAPORE - City-state
  SG: [
    { name: 'Singapore', region: 'Central', description: 'City-state', popular: true, country: 'SG' },
    { name: 'Marina Bay', region: 'Downtown Core', description: 'Iconic waterfront', popular: true, country: 'SG' },
    { name: 'Orchard Road', region: 'Orchard', description: 'Shopping paradise', popular: true, country: 'SG' },
    { name: 'Chinatown', region: 'Outram', description: 'Historic district', popular: true, country: 'SG' },
    { name: 'Sentosa', region: 'Southern Islands', description: 'Resort island', popular: true, country: 'SG' },
    { name: 'Clarke Quay', region: 'Singapore River', description: 'Riverside dining & nightlife', popular: true, country: 'SG' },
    { name: 'Bugis', region: 'Rochor', description: 'Shopping & culture', popular: false, country: 'SG' },
    { name: 'Raffles Place', region: 'Downtown Core', description: 'Financial district', popular: false, country: 'SG' },
  ],
  
  // THAILAND - Major cities
  TH: [
    { name: 'Bangkok', region: 'Central Thailand', description: 'Capital of Thailand', popular: true, country: 'TH' },
    { name: 'Sukhumvit', region: 'Bangkok', description: 'Expat & nightlife hub', popular: true, country: 'TH' },
    { name: 'Silom', region: 'Bangkok', description: 'Business district', popular: true, country: 'TH' },
    { name: 'Siam', region: 'Bangkok', description: 'Shopping paradise', popular: true, country: 'TH' },
    { name: 'Phuket', region: 'Southern Thailand', description: 'Beach paradise', popular: true, country: 'TH' },
    { name: 'Patong', region: 'Phuket', description: 'Beach & nightlife', popular: true, country: 'TH' },
    { name: 'Chiang Mai', region: 'Northern Thailand', description: 'Cultural hub', popular: true, country: 'TH' },
    { name: 'Pattaya', region: 'Eastern Thailand', description: 'Beach resort city', popular: true, country: 'TH' },
    { name: 'Krabi', region: 'Southern Thailand', description: 'Limestone cliffs & beaches', popular: false, country: 'TH' },
    { name: 'Koh Samui', region: 'Southern Thailand', description: 'Tropical island', popular: false, country: 'TH' },
    { name: 'Hua Hin', region: 'Central Thailand', description: 'Royal beach resort', popular: false, country: 'TH' },
  ],
  
  // PHILIPPINES - Major cities with areas
  PH: [
    { name: 'Manila', region: 'Metro Manila', description: 'Capital of Philippines', popular: true, country: 'PH' },
    { name: 'Makati', region: 'Metro Manila', description: 'Financial district', popular: true, country: 'PH' },
    { name: 'Quezon City', region: 'Metro Manila', description: 'Largest city in Metro Manila', popular: true, country: 'PH' },
    { name: 'Pasig', region: 'Metro Manila', description: 'Business hub', popular: true, country: 'PH' },
    { name: 'Taguig (BGC)', region: 'Metro Manila', description: 'Bonifacio Global City', popular: true, country: 'PH' },
    { name: 'Cebu City', region: 'Cebu', description: 'Queen City of the South', popular: true, country: 'PH' },
    { name: 'Boracay', region: 'Aklan', description: 'World-famous beach island', popular: true, country: 'PH' },
    { name: 'Davao City', region: 'Davao del Sur', description: 'Largest city in Mindanao', popular: true, country: 'PH' },
    { name: 'Puerto Princesa', region: 'Palawan', description: 'Underground river', popular: true, country: 'PH' },
    { name: 'Baguio', region: 'Benguet', description: 'Summer capital', popular: true, country: 'PH' },
    { name: 'Iloilo City', region: 'Iloilo', description: 'City of love', popular: false, country: 'PH' },
    { name: 'Mandaue', region: 'Cebu', description: 'Industrial city', popular: false, country: 'PH' },
    { name: 'Lapu-Lapu', region: 'Cebu', description: 'Mactan Island', popular: false, country: 'PH' },
  ],
  
  // VIETNAM - Major cities
  VN: [
    { name: 'Ho Chi Minh City', region: 'Southern Vietnam', description: 'Economic capital', popular: true, country: 'VN' },
    { name: 'District 1', region: 'Ho Chi Minh City', description: 'Downtown core', popular: true, country: 'VN' },
    { name: 'District 3', region: 'Ho Chi Minh City', description: 'Expat area', popular: true, country: 'VN' },
    { name: 'Hanoi', region: 'Northern Vietnam', description: 'Capital of Vietnam', popular: true, country: 'VN' },
    { name: 'Old Quarter', region: 'Hanoi', description: 'Historic heart', popular: true, country: 'VN' },
    { name: 'Da Nang', region: 'Central Vietnam', description: 'Coastal city', popular: true, country: 'VN' },
    { name: 'Hoi An', region: 'Central Vietnam', description: 'Ancient town', popular: true, country: 'VN' },
    { name: 'Nha Trang', region: 'Central Vietnam', description: 'Beach resort city', popular: true, country: 'VN' },
    { name: 'Vung Tau', region: 'Southern Vietnam', description: 'Beach city near Saigon', popular: false, country: 'VN' },
    { name: 'Dalat', region: 'Central Highlands', description: 'Mountain resort town', popular: false, country: 'VN' },
    { name: 'Hue', region: 'Central Vietnam', description: 'Imperial city', popular: false, country: 'VN' },
  ],
  
  // UNITED KINGDOM - Major cities with areas
  GB: [
    { name: 'London', region: 'Greater London', description: 'Capital of UK', popular: true, country: 'GB' },
    { name: 'Westminster', region: 'London', description: 'Political heart', popular: true, country: 'GB' },
    { name: 'Camden', region: 'London', description: 'Arts & music hub', popular: true, country: 'GB' },
    { name: 'Kensington', region: 'London', description: 'Royal borough', popular: true, country: 'GB' },
    { name: 'Shoreditch', region: 'London', description: 'Trendy East London', popular: true, country: 'GB' },
    { name: 'Canary Wharf', region: 'London', description: 'Financial district', popular: true, country: 'GB' },
    { name: 'Manchester', region: 'Greater Manchester', description: 'Northern powerhouse', popular: true, country: 'GB' },
    { name: 'Birmingham', region: 'West Midlands', description: 'Second largest city', popular: true, country: 'GB' },
    { name: 'Liverpool', region: 'Merseyside', description: 'Beatles city', popular: true, country: 'GB' },
    { name: 'Leeds', region: 'West Yorkshire', description: 'Yorkshire hub', popular: true, country: 'GB' },
    { name: 'Glasgow', region: 'Scotland', description: 'Largest Scottish city', popular: true, country: 'GB' },
    { name: 'Edinburgh', region: 'Scotland', description: 'Capital of Scotland', popular: true, country: 'GB' },
    { name: 'Bristol', region: 'South West England', description: 'Creative city', popular: true, country: 'GB' },
    { name: 'Newcastle', region: 'Tyne and Wear', description: 'Geordie city', popular: false, country: 'GB' },
    { name: 'Cardiff', region: 'Wales', description: 'Capital of Wales', popular: false, country: 'GB' },
    { name: 'Brighton', region: 'East Sussex', description: 'Seaside city', popular: false, country: 'GB' },
    { name: 'Oxford', region: 'Oxfordshire', description: 'University city', popular: false, country: 'GB' },
    { name: 'Cambridge', region: 'Cambridgeshire', description: 'University city', popular: false, country: 'GB' },
    { name: 'Nottingham', region: 'Nottinghamshire', description: 'Robin Hood city', popular: false, country: 'GB' },
    { name: 'Sheffield', region: 'South Yorkshire', description: 'Steel city', popular: false, country: 'GB' },
  ],
  
  // UNITED STATES - Major cities with areas
  US: [
    { name: 'New York City', region: 'New York', description: 'The Big Apple', popular: true, country: 'US' },
    { name: 'Manhattan', region: 'New York', description: 'Heart of NYC', popular: true, country: 'US' },
    { name: 'Brooklyn', region: 'New York', description: 'Hipster capital', popular: true, country: 'US' },
    { name: 'Queens', region: 'New York', description: 'Diverse borough', popular: true, country: 'US' },
    { name: 'Los Angeles', region: 'California', description: 'City of Angels', popular: true, country: 'US' },
    { name: 'Hollywood', region: 'California', description: 'Entertainment capital', popular: true, country: 'US' },
    { name: 'Santa Monica', region: 'California', description: 'Beach city', popular: true, country: 'US' },
    { name: 'Beverly Hills', region: 'California', description: 'Luxury district', popular: true, country: 'US' },
    { name: 'Chicago', region: 'Illinois', description: 'Windy City', popular: true, country: 'US' },
    { name: 'Houston', region: 'Texas', description: 'Space City', popular: true, country: 'US' },
    { name: 'Phoenix', region: 'Arizona', description: 'Valley of the Sun', popular: true, country: 'US' },
    { name: 'Philadelphia', region: 'Pennsylvania', description: 'City of Brotherly Love', popular: true, country: 'US' },
    { name: 'San Antonio', region: 'Texas', description: 'Alamo city', popular: true, country: 'US' },
    { name: 'San Diego', region: 'California', description: 'Americas Finest City', popular: true, country: 'US' },
    { name: 'Dallas', region: 'Texas', description: 'Big D', popular: true, country: 'US' },
    { name: 'San Francisco', region: 'California', description: 'Golden Gate city', popular: true, country: 'US' },
    { name: 'Austin', region: 'Texas', description: 'Live music capital', popular: true, country: 'US' },
    { name: 'Seattle', region: 'Washington', description: 'Emerald City', popular: true, country: 'US' },
    { name: 'Denver', region: 'Colorado', description: 'Mile High City', popular: true, country: 'US' },
    { name: 'Washington DC', region: 'District of Columbia', description: 'Nations capital', popular: true, country: 'US' },
    { name: 'Boston', region: 'Massachusetts', description: 'Historic city', popular: true, country: 'US' },
    { name: 'Las Vegas', region: 'Nevada', description: 'Entertainment capital', popular: true, country: 'US' },
    { name: 'Miami', region: 'Florida', description: 'Magic City', popular: true, country: 'US' },
    { name: 'Orlando', region: 'Florida', description: 'Theme park capital', popular: false, country: 'US' },
    { name: 'Atlanta', region: 'Georgia', description: 'Capital of the South', popular: false, country: 'US' },
    { name: 'Portland', region: 'Oregon', description: 'Keep Portland weird', popular: false, country: 'US' },
    { name: 'Nashville', region: 'Tennessee', description: 'Music City', popular: false, country: 'US' },
    { name: 'New Orleans', region: 'Louisiana', description: 'The Big Easy', popular: false, country: 'US' },
  ],
  
  // AUSTRALIA - Major cities with areas
  AU: [
    { name: 'Sydney', region: 'New South Wales', description: 'Harbor city', popular: true, country: 'AU' },
    { name: 'CBD Sydney', region: 'New South Wales', description: 'Business district', popular: true, country: 'AU' },
    { name: 'Bondi', region: 'New South Wales', description: 'Famous beach', popular: true, country: 'AU' },
    { name: 'Manly', region: 'New South Wales', description: 'Beach suburb', popular: true, country: 'AU' },
    { name: 'Parramatta', region: 'New South Wales', description: 'Western Sydney', popular: true, country: 'AU' },
    { name: 'Melbourne', region: 'Victoria', description: 'Cultural capital', popular: true, country: 'AU' },
    { name: 'CBD Melbourne', region: 'Victoria', description: 'City center', popular: true, country: 'AU' },
    { name: 'St Kilda', region: 'Victoria', description: 'Beachside suburb', popular: true, country: 'AU' },
    { name: 'Fitzroy', region: 'Victoria', description: 'Hipster hub', popular: true, country: 'AU' },
    { name: 'Brisbane', region: 'Queensland', description: 'River city', popular: true, country: 'AU' },
    { name: 'Gold Coast', region: 'Queensland', description: 'Beach paradise', popular: true, country: 'AU' },
    { name: 'Perth', region: 'Western Australia', description: 'Most isolated city', popular: true, country: 'AU' },
    { name: 'Adelaide', region: 'South Australia', description: 'City of churches', popular: true, country: 'AU' },
    { name: 'Canberra', region: 'Australian Capital Territory', description: 'Nations capital', popular: true, country: 'AU' },
    { name: 'Hobart', region: 'Tasmania', description: 'Island capital', popular: false, country: 'AU' },
    { name: 'Darwin', region: 'Northern Territory', description: 'Top End city', popular: false, country: 'AU' },
    { name: 'Cairns', region: 'Queensland', description: 'Great Barrier Reef gateway', popular: false, country: 'AU' },
    { name: 'Newcastle', region: 'New South Wales', description: 'Coal city', popular: false, country: 'AU' },
    { name: 'Wollongong', region: 'New South Wales', description: 'Steel city', popular: false, country: 'AU' },
  ],
  
  // GERMANY - Major cities with areas
  DE: [
    { name: 'Berlin', region: 'Berlin', description: 'Capital of Germany', popular: true, country: 'DE' },
    { name: 'Mitte', region: 'Berlin', description: 'Central district', popular: true, country: 'DE' },
    { name: 'Kreuzberg', region: 'Berlin', description: 'Multicultural hub', popular: true, country: 'DE' },
    { name: 'Friedrichshain', region: 'Berlin', description: 'Alternative scene', popular: true, country: 'DE' },
    { name: 'Charlottenburg', region: 'Berlin', description: 'Western district', popular: true, country: 'DE' },
    { name: 'Munich', region: 'Bavaria', description: 'Bavarian capital', popular: true, country: 'DE' },
    { name: 'Hamburg', region: 'Hamburg', description: 'Port city', popular: true, country: 'DE' },
    { name: 'Frankfurt', region: 'Hesse', description: 'Financial capital', popular: true, country: 'DE' },
    { name: 'Cologne', region: 'North Rhine-Westphalia', description: 'Cathedral city', popular: true, country: 'DE' },
    { name: 'Stuttgart', region: 'Baden-Württemberg', description: 'Auto industry hub', popular: true, country: 'DE' },
    { name: 'Düsseldorf', region: 'North Rhine-Westphalia', description: 'Fashion capital', popular: true, country: 'DE' },
    { name: 'Dortmund', region: 'North Rhine-Westphalia', description: 'Industrial city', popular: false, country: 'DE' },
    { name: 'Essen', region: 'North Rhine-Westphalia', description: 'Ruhr area', popular: false, country: 'DE' },
    { name: 'Leipzig', region: 'Saxony', description: 'Music city', popular: false, country: 'DE' },
    { name: 'Dresden', region: 'Saxony', description: 'Baroque city', popular: false, country: 'DE' },
    { name: 'Hanover', region: 'Lower Saxony', description: 'Fair city', popular: false, country: 'DE' },
    { name: 'Nuremberg', region: 'Bavaria', description: 'Medieval city', popular: false, country: 'DE' },
    { name: 'Bremen', region: 'Bremen', description: 'Hanseatic city', popular: false, country: 'DE' },
  ],
};

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, handleEnterApp, onLanguageSelect, handleLanguageSelect, language = 'id', onLanguageChange }) => {
    console.log('🎬 LandingPage component mounted');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
    const defaultLanguage: Language = 'id';
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
    const isMountedRef = React.useRef(true);
    const ipDetectionRan = React.useRef(false);
    
    // Location state - now using auto-detected country
    const { city: contextCity, countryCode, autoDetected, detectionMethod, setCity, setCountry, clearCountry } = useCityContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<string | null>(contextCity || null);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [cityNotListed, setCityNotListed] = useState(false);
    
    // Use either prop name for backward compatibility
    const enterAppCallback = handleEnterApp || onEnterApp;
    const selectLanguage = handleLanguageSelect || onLanguageSelect;

    // Handle language change
    const handleLanguageToggle = (newLang: Language) => {
        console.log('🌐 Language changed to:', newLang);
        setCurrentLanguage(newLang);
        
        if (onLanguageChange) {
            onLanguageChange(newLang);
        }
        
        if (selectLanguage) {
            selectLanguage(newLang);
        }
    };

    // Track component mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // IP-based country detection - runs ONLY ONCE on initial mount
    useEffect(() => {
        if (ipDetectionRan.current) return;
        ipDetectionRan.current = true;
        
        const detectCountry = async () => {
            // Skip if country already detected
            if (countryCode && countryCode !== 'ID') {
                console.log('✅ Country already detected:', countryCode);
                return;
            }
            
            try {
                // IP-based detection happens automatically via CityContext
                console.log('🌍 IP detection initiated by CityContext');
            } catch (error) {
                console.warn('⚠️ IP detection skipped:', error);
            }
        };
        
        detectCountry();
    }, []); // Empty deps - runs ONLY ONCE

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true);
    }, []);

    const handleEnterClick = async () => {
        if (isDetectingLocation) return;
        if (!isMountedRef.current) return;
        
        // If no city selected, do nothing (button should be disabled)
        if (!selectedCity) {
            console.log('⚠️ No city selected - cannot proceed');
            return;
        }
        
        setIsDetectingLocation(true);
        
        try {
            // First, try the provided callback
            if (enterAppCallback) {
                console.log('🚀 Using provided enterApp callback');
                const userLocation = await locationService.requestLocationWithFallback();
                if (!isMountedRef.current) return;
                await enterAppCallback(defaultLanguage, userLocation);
                return;
            }
            
            // Fallback: Direct navigation to home page
            console.log('🚀 Using fallback navigation to home');
            
            // If we have an onNavigate prop, use it
            if (selectLanguage || (window as any).setPage) {
                const userLocation = await locationService.requestLocationWithFallback();
                if (!isMountedRef.current) return;
                
                // Set language if possible
                if (selectLanguage) {
                    await selectLanguage(defaultLanguage);
                }
                
                // Navigate to home page
                if ((window as any).setPage) {
                    console.log('🚀 Navigating to home via global setPage');
                    (window as any).setPage('home');
                } else {
                    // Final fallback - redirect via URL
                    console.log('🚀 Fallback: Redirecting to /home');
                    window.location.href = '/home';
                }
                return;
            }
            
            // Final fallback - URL redirect
            console.log('🚀 Final fallback: URL redirect');
            window.location.href = '/home';
            
        } catch (error) {
            console.error('❌ Failed to handle enter click:', error);
            
            // Emergency fallback
            console.log('🚀 Emergency fallback: Direct URL navigation');
            window.location.href = '/home';
        } finally {
            // Don't reset loading state if component is unmounting
            if (isMountedRef.current) {
                setIsDetectingLocation(false);
            }
        }
    };

    // Location selector handlers - NEW UX: Only city selection, country auto-detected
    const handleCitySelectNew = async (city: CityOption) => {
        setSelectedCity(city.name);
        setCity(city.name);
        setSearchQuery('');
        
        console.log('📍 City selected:', city.name, 'in country:', city.country);
        
        // Auto-set language based on city's country
        const selectedCountryInfo = COUNTRIES.find(c => c.code === city.country);
        if (selectedCountryInfo && selectedCountryInfo.language !== currentLanguage) {
            console.log('🌍 Auto-switching to country language:', selectedCountryInfo.language);
            
            try {
                const newLang = selectedCountryInfo.language;
                
                // Load language resources
                await loadLanguageResources(newLang);
                
                // Change language
                handleLanguageToggle(newLang as Language);
                
                console.log('✅ Language auto-switched to:', newLang);
            } catch (error) {
                console.warn('⚠️ Language auto-switch failed, using English:', error);
                handleLanguageToggle('en');
            }
        }
        
        // Update country in context
        setCountry(city.country, false);
        
        console.log('📍 Navigating to home page...');
        
        // Small delay to show selection feedback
        setTimeout(async () => {
            try {
                // Try the provided callback first
                if (enterAppCallback) {
                    console.log('🚀 Using provided enterApp callback');
                    const userLocation = await locationService.requestLocationWithFallback();
                    await enterAppCallback(defaultLanguage, userLocation);
                    return;
                }
                
                // Fallback navigation methods
                if (selectLanguage || (window as any).setPage) {
                    if (selectLanguage) {
                        await selectLanguage(defaultLanguage);
                    }
                    
                    if ((window as any).setPage) {
                        console.log('🚀 Navigating to home via global setPage');
                        (window as any).setPage('home');
                        // Scroll to top to show therapist cards immediately
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    } else {
                        console.log('🚀 Redirecting to /home');
                        window.location.href = '/home';
                    }
                    return;
                }
                
                // Final fallback - URL redirect
                console.log('🚀 Final fallback: URL redirect to home');
                window.location.href = '/home';
                
            } catch (error) {
                console.error('❌ Failed to navigate to home:', error);
                window.location.href = '/home';
            }
        }, 300);
    };
    
    // Handle manual country change via modal
    const handleManualCountrySelect = async (newCountryCode: string) => {
        const selectedCountryInfo = COUNTRIES.find(c => c.code === newCountryCode);
        
        setShowCountryModal(false);
        setSelectedCity(null);
        setSearchQuery('');
        
        // Update country in context (this will auto-update currency via CityContext)
        setCountry(newCountryCode, true); // Save preference
        console.log('🌍 Country manually changed to:', newCountryCode, '- Currency auto-updated');
        
        // Auto-set language based on country (English-only for US, UK, AU; bilingual support for DE)
        if (selectedCountryInfo) {
            const defaultLang = selectedCountryInfo.language;
            const availableLanguages = selectedCountryInfo.languages || [defaultLang];
            
            // For English-only countries (US, UK, AU, PH), force English
            if (availableLanguages.length === 1 && availableLanguages[0] === 'en') {
                console.log('🌍 English-only country detected, setting language to English');
                try {
                    await loadLanguageResources('en');
                    handleLanguageToggle('en');
                    console.log('✅ Language set to English');
                } catch (error) {
                    console.warn('⚠️ Language switch failed:', error);
                }
            }
            // For bilingual countries (Germany: de + en), use default but allow switching
            else if (availableLanguages.length > 1) {
                console.log(`🌍 Bilingual country detected (${availableLanguages.join(', ')}), using default: ${defaultLang}`);
                try {
                    await loadLanguageResources(defaultLang);
                    handleLanguageToggle(defaultLang as Language);
                    console.log(`✅ Language set to: ${defaultLang}`);
                } catch (error) {
                    console.warn('⚠️ Language switch failed, using English:', error);
                    handleLanguageToggle('en');
                }
            }
            // For other countries (Indonesia), use native language
            else if (defaultLang !== currentLanguage) {
                console.log('🌍 Switching to:', defaultLang);
                try {
                    await loadLanguageResources(defaultLang);
                    handleLanguageToggle(defaultLang as Language);
                    console.log('✅ Language switched to:', defaultLang);
                } catch (error) {
                    console.warn('⚠️ Language switch failed, using English:', error);
                    handleLanguageToggle('en');
                }
            }
        }
    };

    // Handle "My city is not listed" - use GPS to auto-detect user's actual location
    const handleCityNotListed = async () => {
        console.log('📍 City not listed - requesting GPS to auto-detect location...');
        setCityNotListed(true);
        setIsDetectingLocation(true);
        
        try {
            // Request GPS permission and get precise location
            console.log('🎯 Requesting GPS location...');
            const gpsLocation = await locationService.getCurrentLocation();
            
            // Extract city name from the GPS address
            const addressParts = gpsLocation.address.split(',');
            let detectedCity = addressParts[0].trim(); // Usually city is first part
            
            // If address has multiple parts, try to find the city (usually first or second part)
            if (addressParts.length > 1) {
                // Remove postal code and country from city name if present
                detectedCity = addressParts
                    .slice(0, 2) // Take first 2 parts (usually street/area and city)
                    .find(part => !part.match(/^\d{5}/) && part.length > 2) || addressParts[0];
                detectedCity = detectedCity.trim();
            }
            
            console.log('📍 GPS detected city:', detectedCity);
            console.log('📍 Full address:', gpsLocation.address);
            
            // Save the detected city
            setSelectedCity(detectedCity);
            setCity(detectedCity);
            
            // Small delay to show feedback
            setTimeout(async () => {
                // Navigate to home page
                try {
                    if (enterAppCallback) {
                        console.log('🚀 Using provided enterApp callback with GPS location');
                        await enterAppCallback(defaultLanguage, gpsLocation);
                        return;
                    }
                    
                    if (selectLanguage || (window as any).setPage) {
                        if (selectLanguage) {
                            await selectLanguage(defaultLanguage);
                        }
                        
                        if ((window as any).setPage) {
                            console.log('🚀 Navigating to home via global setPage');
                            (window as any).setPage('home');
                            // Scroll to top to show therapist cards immediately
                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                        } else {
                            console.log('🚀 Redirecting to /home');
                            window.location.href = '/home';
                        }
                        return;
                    }
                    
                    // Final fallback - URL redirect
                    console.log('🚀 Final fallback: URL redirect to home');
                    window.location.href = '/home';
                    
                } catch (error) {
                    console.error('❌ Failed to navigate to home:', error);
                    window.location.href = '/home';
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ GPS detection failed:', error);
            
            // Fallback: Navigate to home without specific city
            alert('Unable to detect your location. You\'ll see all available therapists.');
            
            try {
                if (enterAppCallback) {
                    const fallbackLocation = await locationService.requestLocationWithFallback();
                    await enterAppCallback(defaultLanguage, fallbackLocation);
                    return;
                }
                
                if ((window as any).setPage) {
                    (window as any).setPage('home');
                } else {
                    window.location.href = '/home';
                }
            } catch (navError) {
                console.error('❌ Navigation failed:', navError);
                window.location.href = '/home';
            }
        } finally {
            if (isMountedRef.current) {
                setIsDetectingLocation(false);
            }
        }
    };

    
    // Get cities for the currently detected/selected country
    const availableCities = CITIES_BY_COUNTRY[countryCode] || [];
    const filteredCities = searchQuery.trim()
        ? availableCities.filter(city =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.region.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : availableCities;
    const currentCountryData = COUNTRIES.find(c => c.code === countryCode);

    return (
        <div className="landing-page-container scrollable relative w-full min-h-screen bg-gray-900 overflow-y-auto" style={{ paddingBottom: '2rem' }}>
            <PageNumberBadge pageNumber={1} pageName="LandingPage" />
            
            {/* Fixed background image - stays in place while scrolling */}
            <div
                className="fixed inset-0 z-0 w-full h-full bg-gray-900"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            
            {/* Absolute overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none" />
            
            {/* Scrollable content */}
            <div className="scrollable relative z-20 flex flex-col items-center text-white px-4 sm:px-6 text-center w-full py-4 sm:py-16" style={{ paddingBottom: '2rem' }}>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 sm:mb-8">
                    {currentCountryData?.name === 'Philippines' 
                        ? `${currentCountryData?.name}' Massage Hub`
                        : `${currentCountryData?.name}'s Massage Hub`
                    }
                </p>
                
                {/* Location Selector - NEW UX: Auto-detected country, city selection only */}
                <div className="w-full max-w-2xl px-2 sm:px-4 mb-4 sm:mb-6">
                    <div className="bg-gray-900 rounded-2xl p-3 sm:p-6 border border-gray-700 shadow-xl" style={{ backgroundColor: 'rgba(17, 24, 39, 0.95)' }}>
                        {/* Auto-detected Country Header */}
                        <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xl sm:text-2xl">{currentCountryData?.flag}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-white text-sm sm:text-base">{currentCountryData?.name}</h3>
                                            {autoDetected && (
                                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white whitespace-nowrap">
                                                    {detectionMethod === 'ip' ? '📍 Auto-detected' : '✓ Saved'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-orange-100 mt-1">Select your city to continue</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCountryModal(true)}
                                    className="text-xs text-white hover:text-orange-200 underline font-medium whitespace-nowrap"
                                >
                                    Change country
                                </button>
                            </div>
                        </div>

                        {/* Search Box */}
                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search city in ${currentCountryData?.name}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Cities List - Scrollable container (max-height 60vh) */}
                        <div className="scrollable space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-700" style={{ maxHeight: '60vh' }}>
                            {filteredCities.length > 0 ? (
                                <>
                                    {filteredCities.map((city, index) => (
                                        <button
                                            key={`${city.name}-${index}`}
                                            onClick={() => handleCitySelectNew(city)}
                                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                                selectedCity === city.name
                                                    ? "border-orange-500 bg-orange-500 text-white shadow-lg"
                                                    : "border-gray-600 bg-gray-800 hover:border-orange-400 hover:bg-gray-700 text-white"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className={`w-4 h-4 flex-shrink-0 ${
                                                    selectedCity === city.name ? "text-white" : "text-orange-400"
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">{city.name}</div>
                                                    <div className={`text-xs truncate ${
                                                        selectedCity === city.name ? "text-orange-100" : "text-gray-400"
                                                    }`}>{city.region} • {city.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    
                                    {/* "My city is not listed" option */}
                                    <button
                                        onClick={handleCityNotListed}
                                        disabled={isDetectingLocation}
                                        className="w-full p-3 mt-2 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 hover:border-orange-400 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {isDetectingLocation && cityNotListed 
                                                        ? 'Detecting your location...' 
                                                        : 'Use my GPS location'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {isDetectingLocation && cityNotListed
                                                        ? 'Please allow location access'
                                                        : 'Automatically detect your precise city'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No cities found matching "{searchQuery}"</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-xs text-orange-400 hover:text-orange-300 mt-2 underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <PWAInstallIOSModal
                    visible={
                        showIOSInstructions && isIOS && !isInstalled &&
                        (() => { try { return !localStorage.getItem('ios_a2hs_dismissed'); } catch { return true; } })()
                    }
                    onClose={() => setShowIOSInstructions(false)}
                />
            </div>
            
            {/* Country Change Modal - MOVED OUTSIDE main container */}
            {showCountryModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                     style={{ 
                         position: 'fixed', 
                         top: '0', 
                         left: '0', 
                         width: '100vw', 
                         height: '100vh',
                         zIndex: 9999
                     }}>
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Change Country</h3>
                            <button
                                onClick={() => setShowCountryModal(false)}
                                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {COUNTRIES.map((country) => (
                                <button
                                    key={country.code}
                                    onClick={() => handleManualCountrySelect(country.code)}
                                    className={`p-3 rounded-lg transition-all text-left ${
                                        countryCode === country.code
                                            ? 'bg-orange-500 border-2 border-orange-400'
                                            : 'bg-gray-800 border-2 border-gray-700 hover:border-orange-400 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{country.flag}</span>
                                            <div>
                                                <div className={`font-semibold text-sm ${
                                                    countryCode === country.code ? 'text-white' : 'text-white'
                                                }`}>{country.name}</div>
                                                <div className={`text-xs ${
                                                    countryCode === country.code ? 'text-orange-100' : 'text-gray-300'
                                                }`}>{country.description}</div>
                                            </div>
                                        </div>
                                        {countryCode === country.code && (
                                            <ChevronDown className="w-4 h-4 text-white rotate-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <p className="text-xs text-gray-400 text-center mt-4">
                            Your city selection will be cleared when changing country
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
