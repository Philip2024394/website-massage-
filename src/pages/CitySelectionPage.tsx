// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { MapPin, Play, Globe } from 'lucide-react';
import { useCityContext } from '../context/CityContext';

/**
 * CitySelectionPage - Country and Location selection
 * 
 * Features:
 * - Required before accessing the app
 * - Country selection first, then location
 * - Shows cities based on selected country
 * - Persists selection across sessions
 */

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  description: string;
}

interface CityOption {
  name: string;
  region: string;
  description: string;
  popular: boolean;
  country: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', description: 'Southeast Asian archipelago' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', description: 'Peninsula and Borneo' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', description: 'City-state island nation' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', description: 'Land of smiles' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', description: 'Pearl of the Orient Seas' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', description: 'S-shaped country' },
];

const CITIES_BY_COUNTRY: Record<string, CityOption[]> = {
  ID: [
    // DKI Jakarta
    { name: 'Jakarta', region: 'DKI Jakarta', description: 'Capital of Indonesia', popular: true, country: 'ID' },
    
    // Bali
    { name: 'Canggu', region: 'Bali', description: 'Surfing & digital nomad hub', popular: true, country: 'ID' },
    { name: 'Seminyak', region: 'Bali', description: 'Luxury beach resort area', popular: true, country: 'ID' },
    { name: 'Kuta', region: 'Bali', description: 'Famous beach & nightlife', popular: true, country: 'ID' },
    { name: 'Ubud', region: 'Bali', description: 'Cultural heart of Bali', popular: true, country: 'ID' },
    { name: 'Sanur', region: 'Bali', description: 'Relaxed beachside town', popular: true, country: 'ID' },
    { name: 'Nusa Dua', region: 'Bali', description: 'Premium resort enclave', popular: true, country: 'ID' },
    { name: 'Jimbaran', region: 'Bali', description: 'Seafood & sunset beach', popular: true, country: 'ID' },
    { name: 'Denpasar', region: 'Bali', description: 'Capital of Bali', popular: true, country: 'ID' },
    
    // Other Major Cities
    { name: 'Yogyakarta', region: 'DI Yogyakarta', description: 'Cultural & historical city', popular: true, country: 'ID' },
    { name: 'Bandung', region: 'West Java', description: 'Cool mountain city', popular: true, country: 'ID' },
    { name: 'Surabaya', region: 'East Java', description: 'Second largest city', popular: true, country: 'ID' },
    { name: 'Medan', region: 'North Sumatra', description: 'Gateway to Sumatra', popular: false, country: 'ID' },
    { name: 'Makassar', region: 'South Sulawesi', description: 'Gateway to Eastern Indonesia', popular: false, country: 'ID' },
    { name: 'Batam', region: 'Riau Islands', description: 'Island city near Singapore', popular: false, country: 'ID' },
  ],
  MY: [
    { name: 'Kuala Lumpur', region: 'Federal Territory', description: 'Capital of Malaysia', popular: true, country: 'MY' },
    { name: 'Penang', region: 'Penang', description: 'Pearl of the Orient', popular: true, country: 'MY' },
    { name: 'Johor Bahru', region: 'Johor', description: 'Southern gateway', popular: true, country: 'MY' },
    { name: 'Langkawi', region: 'Kedah', description: 'Tropical island paradise', popular: true, country: 'MY' },
  ],
  SG: [
    { name: 'Singapore', region: 'Singapore', description: 'City-state nation', popular: true, country: 'SG' },
  ],
  TH: [
    { name: 'Bangkok', region: 'Bangkok', description: 'Capital of Thailand', popular: true, country: 'TH' },
    { name: 'Phuket', region: 'Phuket', description: 'Famous beach destination', popular: true, country: 'TH' },
    { name: 'Pattaya', region: 'Chonburi', description: 'Beach resort city', popular: true, country: 'TH' },
    { name: 'Chiang Mai', region: 'Chiang Mai', description: 'Northern cultural hub', popular: true, country: 'TH' },
  ],
  PH: [
    { name: 'Manila', region: 'Metro Manila', description: 'Capital of Philippines', popular: true, country: 'PH' },
    { name: 'Cebu City', region: 'Cebu', description: 'Queen City of the South', popular: true, country: 'PH' },
    { name: 'Boracay', region: 'Aklan', description: 'World-famous beach island', popular: true, country: 'PH' },
  ],
  VN: [
    { name: 'Ho Chi Minh City', region: 'Ho Chi Minh City', description: 'Largest city in Vietnam', popular: true, country: 'VN' },
    { name: 'Hanoi', region: 'Hanoi', description: 'Capital of Vietnam', popular: true, country: 'VN' },
    { name: 'Da Nang', region: 'Da Nang', description: 'Central coastal city', popular: true, country: 'VN' },
  ],
};

export const CitySelectionPage: React.FC = () => {
  const { setCity } = useCityContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Get cities for selected country
  const availableCities = selectedCountry ? CITIES_BY_COUNTRY[selectedCountry] || [] : [];
  
  const filteredCities = searchQuery.trim()
    ? availableCities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableCities;

  const handleCountrySelect = (countryCode: string) => {
    console.log('🌍 User selected country:', countryCode);
    setSelectedCountry(countryCode);
    setSelectedCity(null); // Reset city when country changes
    setSearchQuery(''); // Reset search
  };

  const handleCitySelect = (city: CityOption) => {
    console.log('📍 User selected city:', city.name);
    setSelectedCity(city.name);
  };

  const handleContinue = () => {
    if (selectedCity && selectedCountry) {
      console.log('📍 Confirming selection:', { country: selectedCountry, city: selectedCity });
      setCity(selectedCity);
      // The routing will automatically redirect to home page
      // when city context updates
    }
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-gray-900">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Massage & Wellness Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Globe className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to IndaStreet
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            To provide you with the best massage therapists and wellness services in your area, 
            please select your country and location.
          </p>
        </div>

        {/* Country Selection */}
        {!selectedCountry && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Your Country
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{country.flag}</span>
                        <span className="font-semibold text-gray-900">{country.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">{country.description}</div>
                    </div>
                    <Play className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location Selection */}
        {selectedCountry && (
          <div>
            {/* Country Header */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCountryData?.flag}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedCountryData?.name}</h3>
                    <p className="text-sm text-gray-600">Now select your city/location</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-sm text-orange-600 hover:text-orange-700 underline"
                >
                  Change Country
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={`Search locations in ${selectedCountryData?.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredCities.map((city, index) => (
                <button
                  key={`${city.name}-${index}`}
                  onClick={() => handleCitySelect(city)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCity === city.name
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${
                      selectedCity === city.name ? "text-orange-500" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-gray-600">{city.region}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleContinue}
              disabled={!selectedCity || !selectedCountry}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                selectedCity && selectedCountry
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedCity && selectedCountry 
                ? `Continue to ${selectedCity}, ${selectedCountryData?.name}` 
                : selectedCountry 
                  ? 'Select a city to continue'
                  : 'Select a country first'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-8 text-sm text-gray-500">
        <p>You can change your city anytime from the menu</p>
      </div>
    </div>
  );
};

export default CitySelectionPage;
