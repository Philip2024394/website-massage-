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
  
  // Check if this is Canggu for special orange highlighting
  const isCanggu = city.toLowerCase() === 'canggu';
  
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
    <div className={`relative ${className}`}>
      {/* Single Glass Card - Orange for Canggu */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: isCanggu ? '#fde68a' : 'rgba(20, 20, 25, 0.75)',
          backdropFilter: isCanggu ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isCanggu ? 'none' : 'blur(20px)',
          border: isCanggu ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          boxShadow: isCanggu ? '0 4px 16px rgba(245, 158, 11, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          padding: '14px 16px'
        }}
      >
        {/* Header - Minimal */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: isCanggu ? '1px solid rgba(124, 45, 18, 0.15)' : '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isCanggu ? 'rgba(124, 45, 18, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: isCanggu ? 'none' : 'blur(4px)'
              }}
            >
              <MapPin className="w-5 h-5" style={{ color: isCanggu ? '#7c2d12' : 'rgba(255, 255, 255, 0.7)' }} strokeWidth={2} />
            </div>
            <h3 className="text-base font-medium tracking-tight" style={{ color: isCanggu ? '#7c2d12' : 'rgba(255, 255, 255, 0.9)' }}>
              {language === 'id' ? 'Area' : 'Area'}
            </h3>
          </div>
          {selectedArea && (
            <button
              onClick={handleClearFilter}
              className="text-sm transition-colors duration-200 font-medium"
              style={{
                color: isCanggu ? 'rgba(124, 45, 18, 0.5)' : 'rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = isCanggu ? '#7c2d12' : 'rgba(255, 255, 255, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.color = isCanggu ? 'rgba(124, 45, 18, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
            >
              {language === 'id' ? 'Reset' : 'Reset'}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {/* Popular Areas */}
          {popularAreas.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: isCanggu ? 'rgba(124, 45, 18, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
                {language === 'id' ? 'Populer' : 'Popular'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {popularAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaClick(area.id)}
                    className={`
                      relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        selectedArea === area.id
                          ? 'text-black shadow-lg shadow-[#F5C77A]/30'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                    style={{
                      background: selectedArea === area.id ? '#F5C77A' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedArea === area.id ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: selectedArea === area.id ? 'none' : 'blur(10px)'
                    }}
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
              <p className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: isCanggu ? 'rgba(124, 45, 18, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
                {language === 'id' ? 'Lainnya' : 'Other'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {otherAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaClick(area.id)}
                    className={`
                      relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        selectedArea === area.id
                          ? 'text-black shadow-lg shadow-[#F5C77A]/30'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                    style={{
                      background: selectedArea === area.id ? '#F5C77A' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedArea === area.id ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: selectedArea === area.id ? 'none' : 'blur(10px)'
                    }}
                  >
                    {getAreaName(area)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaFilter;
