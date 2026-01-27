import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { useCityContext } from '../context/CityContext';
import { useLanguageContext } from '../context/LanguageContext';

interface CitySwitcherProps {
  onClose?: () => void;
}

const INDONESIAN_CITIES = [
  'Jakarta',
  'Canggu',
  'Seminyak',
  'Kuta',
  'Ubud',
  'Sanur',
  'Nusa Dua',
  'Jimbaran',
  'Denpasar',
  'Yogyakarta',
  'Bandung',
  'Surabaya',
  'Medan',
  'Makassar',
  'Batam',
];

export const CitySwitcher: React.FC<CitySwitcherProps> = ({ onClose }) => {
  const { city: currentCity, setCity } = useCityContext();
  const { language } = useLanguageContext();

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (onClose) {
      onClose();
    }
  };

  const label = language === 'id' ? 'Ganti Kota' : 'Change City';
  const currentLabel = language === 'id' ? 'Kota Saat Ini' : 'Current City';

  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>

      <div className="mb-2 text-sm text-gray-500">
        {currentLabel}: <span className="font-semibold text-teal-600">{currentCity}</span>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-1">
        {INDONESIAN_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleCityChange(city)}
            className={`
              w-full text-left px-4 py-3 rounded-lg transition-all
              flex items-center justify-between
              ${
                currentCity === city
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }
            `}
          >
            <span>{city}</span>
            {currentCity === city && <Check className="w-5 h-5 text-teal-600" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitySwitcher;
