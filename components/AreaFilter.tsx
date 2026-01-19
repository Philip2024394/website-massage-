import React from 'react';
import { MapPin } from 'lucide-react';
import { getServiceAreasForCity, ServiceArea } from '../constants/serviceAreas';
import { useLanguageContext } from '../context/LanguageContext';

interface AreaFilterProps {
  city: string;
  selectedArea: string | null;
  onAreaChange: (areaId: string | null) => void;
  className?: string;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({
  city,
  selectedArea,
  onAreaChange,
  className = '',
}) => {
  const { language } = useLanguageContext();
  const areas = getServiceAreasForCity(city);
  
  if (areas.length === 0) {
    return null;
  }

  const handleAreaClick = (areaId: string) => {
    // Toggle: if same area clicked, clear filter; otherwise set new area
    if (selectedArea === areaId) {
      onAreaChange(null);
    } else {
      onAreaChange(areaId);
    }
  };

  const handleClearFilter = () => {
    onAreaChange(null);
  };

  // Get area name based on language
  const getAreaName = (area: ServiceArea): string => {
    return language === 'id' ? area.nameId : area.name;
  };

  // Separate popular and other areas
  const popularAreas = areas.filter(a => a.popular);
  const otherAreas = areas.filter(a => !a.popular);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {language === 'id' ? 'Filter Area' : 'Filter by Area'}
          </h3>
        </div>
        {selectedArea && (
          <button
            onClick={handleClearFilter}
            className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
          >
            {language === 'id' ? 'Hapus Filter' : 'Clear Filter'}
          </button>
        )}
      </div>

      {/* Popular Areas */}
      {popularAreas.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {language === 'id' ? 'Area Populer' : 'Popular Areas'}
          </p>
          <div className="flex flex-wrap gap-2">
            {popularAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    selectedArea === area.id
                      ? 'bg-teal-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {getAreaName(area)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other Areas */}
      {otherAreas.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {language === 'id' ? 'Area Lainnya' : 'Other Areas'}
          </p>
          <div className="flex flex-wrap gap-2">
            {otherAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    selectedArea === area.id
                      ? 'bg-teal-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {getAreaName(area)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No areas message */}
      {areas.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          {language === 'id'
            ? 'Tidak ada area layanan tersedia untuk kota ini'
            : 'No service areas available for this city'}
        </p>
      )}
    </div>
  );
};

export default AreaFilter;
