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

const CityLocationDropdown: React.FC<CityLocationDropdownProps> = ({
  selectedCity,
  onCityChange,
  placeholder = 'Select City / Location',
  className = '',
  label = 'City / Tourist Location',
  showLabel = false,
  disabled = false,
  includeAll = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState(INDONESIAN_CITIES_CATEGORIZED); // Start with static fallback
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

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

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedCity === 'all') {
      return placeholder;
    }
    
    // Find the selected city to include its emoji and "Viewing:" prefix
    for (const category of cities) {
      const foundCity = category.cities.find(city => city.name === selectedCity);
      if (foundCity) {
        return `Viewing: ${foundCity.name}${foundCity.isTouristDestination ? ' 🏖️' : foundCity.isMainCity ? ' 🏙️' : ''}`;
      }
    }
    
    return `Viewing: ${selectedCity}`;
  };

  const ChevronDownIcon = () => (
    <svg 
      className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 pointer-events-none z-30 ${isOpen ? 'rotate-180' : ''}`}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        
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
            w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg 
            text-sm text-left cursor-pointer focus:outline-none 
            focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900
            hover:border-gray-300 transition-colors duration-200
            ${disabled ? 'opacity-50' : ''}
            ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''}
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
            className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
              cities.map((category, categoryIndex) => (
                <div key={`${category.category}-${categoryIndex}`}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    {category.category}
                  </div>
                  {category.cities.map((city: CityLocation, cityIndex: number) => (
                    <button
                      key={`${category.category}-${city.name}-${categoryIndex}-${cityIndex}`}
                      type="button"
                      onClick={() => handleCitySelect(city.name)}
                      className={`
                        w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                        ${selectedCity === city.name ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-900'}
                      `}
                    >
                      {city.name}
                      {city.isTouristDestination && ' 🏖️'}
                      {city.isMainCity && !city.isTouristDestination && ' 🏙️'}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default CityLocationDropdown;