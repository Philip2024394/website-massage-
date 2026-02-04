// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { INDONESIAN_CITIES_CATEGORIZED, CityLocation } from '../constants/indonesianCities';
import { citiesService } from '../lib/citiesService';
import { locations } from '../../locations';
import { getPopularCustomLocations, type PopularCustomLocation } from '../utils/customLocationsService';

interface CityLocationDropdownProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  includeAll?: boolean;
  onCoordinatesChange?: (coordinates: { lat: number; lng: number } | null) => void; // NEW: Auto-populate coordinates
  country?: string; // NEW: Filter by country
}

const CityLocationDropdown = ({
  selectedCity,
  onCityChange,
  placeholder = 'Select City / Location',
  className = '',
  label = 'City / Tourist Location',
  showLabel = false,
  disabled = false,
  includeAll = true,
  onCoordinatesChange, // NEW: Auto-populate coordinates callback
  country // NEW: Filter by country
}: CityLocationDropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState(INDONESIAN_CITIES_CATEGORIZED); // Start with static fallback
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCustomLocations, setPopularCustomLocations] = useState<PopularCustomLocation[]>([]);
  const [baliExpanded, setBaliExpanded] = useState(false);
  const [lombokExpanded, setLombokExpanded] = useState(false);
  const [floresExpanded, setFloresExpanded] = useState(false);
  const [sumatraExpanded, setSumatraExpanded] = useState(false);
  const [easternExpanded, setEasternExpanded] = useState(false);
  const [beachExpanded, setBeachExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Removed auto-close timer to prevent dropdown from closing unexpectedly

  // Auto-expand sections when cities from those regions are selected
  useEffect(() => {
    const allCities = INDONESIAN_CITIES_CATEGORIZED.flatMap(cat => cat.cities);
    const selectedCityData = allCities.find(city => city.locationId === selectedCity);
    if (selectedCityData) {
      // Reset all expanded states
      setBaliExpanded(false);
      setLombokExpanded(false);
      setFloresExpanded(false);
      setSumatraExpanded(false);
      setEasternExpanded(false);
      setBeachExpanded(false);
      
      // Expand relevant section
      if (selectedCityData.province === 'Bali') {
        setBaliExpanded(true);
      } else if (selectedCityData.province === 'West Nusa Tenggara') {
        setLombokExpanded(true);
      } else if (selectedCityData.province === 'East Nusa Tenggara') {
        setFloresExpanded(true);
      } else if (['North Sumatra', 'South Sumatra', 'West Sumatra', 'Riau', 'Lampung', 'Aceh'].includes(selectedCityData.province)) {
        setSumatraExpanded(true);
      } else if (['South Sulawesi', 'North Sulawesi', 'Southeast Sulawesi', 'Papua', 'West Papua', 'Maluku'].includes(selectedCityData.province)) {
        setEasternExpanded(true);
      } else if (['Riau Islands', 'Bangka Belitung', 'East Kalimantan', 'DKI Jakarta'].includes(selectedCityData.province) && selectedCityData.isTouristDestination) {
        setBeachExpanded(true);
      }
    }
  }, [selectedCity]);

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
        
        // Load popular custom locations
        console.log('📍 Loading popular custom locations...');
        const popularLocations = await getPopularCustomLocations(5); // Min 5 therapists
        setPopularCustomLocations(popularLocations);
        console.log('✅ Popular custom locations loaded:', popularLocations.length);
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

  const handleCitySelect = (city: CityLocation | string | PopularCustomLocation) => {
    if (typeof city === 'string') {
      // Handle 'all' option - clear coordinates
      onCityChange(city);
      if (onCoordinatesChange) {
        onCoordinatesChange(null); // Clear coordinates for "All Indonesia"
      }
    } 
    // Handle popular custom location selection
    else if ('customCity' in city) {
      console.log(`📍 Popular custom location selected: ${city.customCity} (${city.count} therapists)`);
      onCityChange(city.locationId);
      
      // Auto-populate with custom location center coordinates
      if (onCoordinatesChange && city.centerCoordinates) {
        console.log(`📍 Auto-populating center coordinates for ${city.customCity}:`, city.centerCoordinates);
        onCoordinatesChange({
          lat: city.centerCoordinates.lat,
          lng: city.centerCoordinates.lng
        });
      }
    }
    // Handle predefined city selection
    else {
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
      
      // 📍 NEW: Auto-populate coordinates from city data (convenience feature)
      if (onCoordinatesChange && city.coordinates) {
        console.log(`📍 Auto-populating coordinates for ${city.name}:`, city.coordinates);
        onCoordinatesChange({
          lat: city.coordinates.lat,
          lng: city.coordinates.lng
        });
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter cities based on search query and country
  const filteredCities = (() => {
    let filtered = cities;
    
    // Apply country filter if provided
    if (country) {
      filtered = cities.map(category => ({
        ...category,
        cities: category.cities.filter(city => {
          // Check if city belongs to selected country from locations.ts
          const locationEntry = locations.find(loc => 
            loc.cities.includes(city.name) && loc.country === country
          );
          return !!locationEntry;
        })
      })).filter(category => category.cities.length > 0);
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.map(category => ({
        ...category,
        cities: category.cities.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.aliases?.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.cities.length > 0);
    }
    
    return filtered;
  })();

  const getDisplayText = () => {
    if (selectedCity === 'all') {
      return placeholder;
    }
    
    if (selectedCity === 'custom') {
      return '📍 Enter Custom Location';
    }
    
    // Check if it's a popular custom location
    const customLocation = popularCustomLocations.find(loc => loc.locationId === selectedCity);
    if (customLocation) {
      return `📍 ${customLocation.customCity}`;
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
            w-full px-4 py-3.5 bg-white border-2 rounded-lg 
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
              zIndex: 9999,
              backgroundColor: '#ffffff',
              color: '#1f2937',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
              padding: '8px 0'
            }}
            className="mt-1 max-h-60 overflow-y-auto"
          >
            {includeAll && (
              <button
                type="button"
                onClick={() => handleCitySelect('all')}
                className={`
                  w-full px-4 py-3 text-left text-sm transition-colors duration-150
                  ${selectedCity === 'all' ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-900 hover:bg-gray-50'}
                `}
                style={{
                  padding: '12px 16px'
                }}
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
                <div className="sticky top-0 border-b-2 border-gray-200 p-3 z-10" style={{ backgroundColor: '#ffffff' }}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                      style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200"
                        title="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                                {filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No locations found. Try "Other Location" below.
                  </div>
                ) : (
                  filteredCities.map((category, categoryIndex) => {
                    // Determine if this category should be hierarchical
                    const getHierarchicalConfig = (categoryName: string) => {
                      switch (categoryName) {
                        case "🏝️ Bali":
                          return { expanded: baliExpanded, setExpanded: setBaliExpanded, icon: "🏖️" };
                        case "🌊 Lombok & Gili":
                          return { expanded: lombokExpanded, setExpanded: setLombokExpanded, icon: "🏝️" };
                        case "🦎 Flores & Komodo":
                          return { expanded: floresExpanded, setExpanded: setFloresExpanded, icon: "🦎" };
                        case "🦀 Sumatra":
                          return { expanded: sumatraExpanded, setExpanded: setSumatraExpanded, icon: "🌋" };
                        case "🏝️ Eastern Indonesia":
                          return { expanded: easternExpanded, setExpanded: setEasternExpanded, icon: "🌺" };
                        case "🏖️ Beach Destinations":
                          return { expanded: beachExpanded, setExpanded: setBeachExpanded, icon: "🏖️" };
                        default:
                          return null;
                      }
                    };
                    
                    const hierarchicalConfig = getHierarchicalConfig(category.category);
                    
                    return (
                    <div key={`${category.category}-${categoryIndex}`}>
                      {/* Hierarchical categories */}
                      {hierarchicalConfig ? (
                        <div>
                          {/* Expandable Header */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              hierarchicalConfig.setExpanded(!hierarchicalConfig.expanded);
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between"
                          >
                            <span>{category.category}</span>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-200 ${hierarchicalConfig.expanded ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Sub-areas - Collapsible */}
                          {hierarchicalConfig.expanded && (
                            <div className="border-l-2 border-orange-200">
                              {category.cities.map((city: CityLocation, cityIndex: number) => (
                                <button
                                  key={`${category.category}-${city.name}-${categoryIndex}-${cityIndex}`}
                                  type="button"
                                  onClick={() => handleCitySelect(city)}
                                  className={`
                                    w-full text-left text-sm transition-colors duration-150 pl-8
                                    ${selectedCity === (city.locationId || city.name.toLowerCase()) ? 'bg-orange-100 text-orange-800 font-medium border-r-2 border-orange-500' : 'text-gray-700 hover:bg-gray-50'}
                                  `}
                                  style={{
                                    padding: '12px 24px 12px 32px'
                                  }}
                                >
                                  {hierarchicalConfig.icon} {city.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Regular categories - flat structure */
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                            {category.category}
                          </div>
                          {category.cities.map((city: CityLocation, cityIndex: number) => (
                            <button
                              key={`${category.category}-${city.name}-${categoryIndex}-${cityIndex}`}
                              type="button"
                              onClick={() => handleCitySelect(city)}
                              className={`
                                w-full text-left text-sm transition-colors duration-150
                                ${selectedCity === (city.locationId || city.name.toLowerCase()) ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-900 hover:bg-gray-50'}
                              `}
                              style={{
                                padding: '12px 16px'
                              }}
                            >
                              {city.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    );
                  })
                )}
                
                {/* Popular Custom Locations Section */}
                {popularCustomLocations.length > 0 && (
                  <div className="border-t-2 border-blue-200">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100">
                      📍 Popular Other Locations
                    </div>
                    {popularCustomLocations.map((location, index) => (
                      <button
                        key={`custom-${location.locationId}-${index}`}
                        type="button"
                        onClick={() => {
                          handleCitySelect(location);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100
                          ${selectedCity === location.locationId ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📍</span>
                            <span className="font-medium">{location.customCity}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {location.count} therapist{location.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Custom Location Option */}
                <div className="border-t-2 border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-orange-50 border-b border-orange-100">
                    📍 Other Location (Custom)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onCityChange('custom');
                      if (onCoordinatesChange) {
                        onCoordinatesChange(null); // Clear coordinates for custom
                      }
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left text-sm hover:bg-orange-50 transition-colors duration-150 border-b border-gray-100
                      ${selectedCity === 'custom' ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-700'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <div>
                        <div className="font-medium">Enter Custom Location</div>
                        <div className="text-xs text-gray-500">For cities/areas not listed above</div>
                      </div>
                    </div>
                  </button>
                  <div className="px-4 py-2 text-xs text-gray-500 bg-yellow-50 border-t border-yellow-100">
                    ⚠️ GPS location required for custom locations
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