import React, { useState, useRef, useEffect } from 'react';
import { INDONESIAN_CITIES_CATEGORIZED, CityLocation } from '../constants/indonesianCities';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedCity === 'all') {
      return placeholder;
    }
    
    // Find the selected city to include its emoji
    for (const category of INDONESIAN_CITIES_CATEGORIZED) {
      const foundCity = category.cities.find(city => city.name === selectedCity);
      if (foundCity) {
        return `${foundCity.name}${foundCity.isTouristDestination ? ' 🏖️' : foundCity.isMainCity ? ' 🏙️' : ''}`;
      }
    }
    
    return selectedCity;
  };

  const ChevronDownIcon = () => (
    <svg 
      className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className={className} ref={dropdownRef}>
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
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
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

        {/* Custom Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
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
            
            {INDONESIAN_CITIES_CATEGORIZED.map((category, categoryIndex) => (
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
            ))}
          </div>
        )}
      </div>
      
      {selectedCity && selectedCity !== 'all' && (
        <p className="mt-1 text-xs text-gray-500">
          📍 Selected: {getDisplayText()}
        </p>
      )}
    </div>
  );
};

export default CityLocationDropdown;