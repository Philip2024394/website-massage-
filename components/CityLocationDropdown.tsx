import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { INDONESIAN_CITIES_CATEGORIZED, CityLocation } from '../constants/indonesianCities';
import { citiesService } from '../lib/citiesService';

interface CityLocationDropdownProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  includeAll?: boolean;
}

const CityLocationDropdown = ({
  selectedCity,
  onCityChange,
  placeholder = 'Select City / Location',
  className = '',
  label = 'City / Tourist Location',
  showLabel = false,
  disabled = false,
  includeAll = true
}: CityLocationDropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState(INDONESIAN_CITIES_CATEGORIZED); // Start with static fallback
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Removed auto-close timer to prevent dropdown from closing unexpectedly

  // DEV-ONLY: Validate city data on mount
  useEffect(() => {
    if (import.meta.env.DEV) {
      const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
      const missingLocationId = allCities.filter(city => !city.locationId);
      const missingCoords = allCities.filter(city => !city.coordinates || !city.coordinates.lat || !city.coordinates.lng);
      
      if (missingLocationId.length > 0) {
        console.error('❌ DEV ERROR: Cities missing locationId:', missingLocationId.map(c => c.name));
      }
      if (missingCoords.length > 0) {
        console.error('❌ DEV ERROR: Cities missing coordinates:', missingCoords.map(c => c.name));
      }
      
      if (missingLocationId.length === 0 && missingCoords.length === 0) {
        console.log('✅ DEV CHECK: All', allCities.length, 'cities have valid locationId and coordinates');
      }
    }
  }, []);

  // Fetch cities from Appwrite on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        console.log('🏙️ Loading cities from Appwrite...');
        const categorizedCities = await citiesService.getCitiesByCategory();
        setCities(categorizedCities);
        console.log('✅ Cities loaded from Appwrite:', categorizedCities.length, 'categories');
      } catch (error) {
        console.error('❌ Failed to load cities, using static fallback:', error);
        // Keep static fallback data
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  // Close dropdown when clicking outside (supports portalized menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideRoot = !!rootRef.current && rootRef.current.contains(target);
      const clickedInsidePortal = !!portalRef.current && portalRef.current.contains(target);
      if (!clickedInsideRoot && !clickedInsidePortal) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position the portal menu relative to the button
  useEffect(() => {
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const width = rect.width;
      let left = rect.left + window.scrollX;
      const top = rect.bottom + window.scrollY; // place just below
      // Clamp within viewport horizontally if needed
      const maxLeft = window.scrollX + document.documentElement.clientWidth - width - 8;
      if (left > maxLeft) left = Math.max(window.scrollX + 8, maxLeft);
      setMenuPos({ top, left, width });
    };

    if (isOpen) {
      updatePosition();
      const handler = () => updatePosition();
      window.addEventListener('scroll', handler, true);
      window.addEventListener('resize', handler);
      return () => {
        window.removeEventListener('scroll', handler, true);
        window.removeEventListener('resize', handler);
      };
    }
  }, [isOpen]);

  const handleCitySelect = (city: CityLocation | string) => {
    if (typeof city === 'string') {
      // Handle 'all' option
      onCityChange(city);
    } else {
      // 🔒 STRICT: locationId must come from data, no runtime fallback
      if (!city.locationId) {
        console.error('❌ City missing locationId:', city.name);
        if (import.meta.env.DEV) {
          alert(`⚠️ DEV ERROR: City "${city.name}" is missing locationId in indonesianCities.ts`);
        }
        return; // Don't proceed without locationId
      }
      console.log(`🎯 City selected: ${city.name} → locationId: ${city.locationId}`);
      onCityChange(city.locationId);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter cities based on search query
  const filteredCities = searchQuery.trim()
    ? cities.map(category => ({
        ...category,
        cities: category.cities.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.aliases?.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.cities.length > 0)
    : cities;

  const getDisplayText = () => {
    if (selectedCity === 'all') {
      return placeholder;
    }
    
    // Find the selected city by locationId or name - display readable name
    for (const category of cities) {
      const foundCity = category.cities.find(city => 
        city.locationId === selectedCity || 
        city.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') === selectedCity ||
        city.name === selectedCity
      );
      if (foundCity) {
        return foundCity.name;
      }
    }
    
    return selectedCity;
  };

  const ChevronDownIcon = () => (
    <svg 
      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black transition-transform duration-200 pointer-events-none z-30 ${isOpen ? 'rotate-180' : ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className={className} ref={rootRef}>
      {showLabel && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Custom Dropdown Button */}
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              console.log('🔽 Dropdown clicked, current isOpen:', isOpen);
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled}
          ref={buttonRef}
          className={`
            w-full px-4 py-2.5 bg-white border-2 rounded-lg 
            text-sm text-center cursor-pointer focus:outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900
            transition-all duration-200
            ${disabled ? 'opacity-50 border-gray-200' : ''}
            ${isOpen ? 'ring-2 ring-orange-400 border-orange-500' : 'border-orange-500 hover:border-orange-600'}
          `}
        >
          {getDisplayText()}
        </button>
        
        <ChevronDownIcon />

        {/* Custom Dropdown Menu (rendered in a body portal to avoid clipping) */}
        {isOpen && !disabled && createPortal(
          <div
            ref={portalRef}
            style={{
              position: 'absolute',
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
              zIndex: 9999
            }}
            className="mt-1 bg-white border-2 border-orange-500 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            {includeAll && (
              <button
                type="button"
                onClick={() => handleCitySelect('all')}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                  ${selectedCity === 'all' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-900'}
                `}
              >
                {placeholder}
              </button>
            )}

            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Loading cities from Appwrite... 🏙️
              </div>
            ) : (
              <>
                {/* Search Input */}
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-3 z-10">
                  <input
                    type="text"
                    placeholder="🔍 Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No locations found. Try "Other Location" below.
                  </div>
                ) : (
                  filteredCities.map((category, categoryIndex) => (
                    <div key={`${category.category}-${categoryIndex}`}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                        {category.category}
                      </div>
                      {category.cities.map((city: CityLocation, cityIndex: number) => (
                        <button
                          key={`${category.category}-${city.name}-${categoryIndex}-${cityIndex}`}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={`
                            w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                            ${selectedCity === (city.locationId || city.name.toLowerCase()) ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-900'}
                          `}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  ))
                )}
                
                {/* Custom Location Option */}
                <div className="border-t-2 border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    📍 Other Location
                  </div>
                  <div className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Type your city/area..."
                      value={selectedCity && !cities.some(cat => cat.cities.some(c => c.name === selectedCity)) ? selectedCity : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.trim()) {
                          handleCitySelect(value);
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Can't find your location? Type it manually
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default CityLocationDropdown;