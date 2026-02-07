import React from 'react';
import { useBadgeSession, useBadgeConfig } from '../../hooks/useBadgeSession';
import ServiceBadges from '../../components/badges/ServiceBadges';

/**
 * Enhanced Therapist Menu Slider with Dynamic Badges
 * 
 * This component demonstrates the complete implementation of the badge system
 * integrated with the therapist pricing components. It can be used as a reference
 * or directly integrated into existing therapist cards.
 */

// Sample menu data for demonstration
const sampleMenuData = [
  {
    id: '1',
    serviceName: 'Swedish Massage',
    description: 'Relaxing full-body massage with gentle pressure',
    price60: '150',
    price90: '200',
    price120: '280'
  },
  {
    id: '2', 
    serviceName: 'Deep Tissue Massage',
    description: 'Therapeutic massage targeting muscle tension',
    price60: '180',
    price90: '240',
    price120: '320'
  },
  {
    id: '3',
    serviceName: 'Hot Stone Massage',
    description: 'Warming stones to enhance relaxation',
    price60: '200',
    price90: '270',
    price120: '350'
  },
  {
    id: '4',
    serviceName: 'Aromatherapy Massage',
    description: 'Essential oils for enhanced well-being',
    price60: '170',
    price90: '230',
    price120: '300'
  }
];

interface EnhancedTherapistMenuProps {
  therapistId: string;
  menuData?: typeof sampleMenuData;
  onServiceSelect?: (serviceId: string, duration: string, price: number) => void;
  className?: string;
}

const EnhancedTherapistMenu: React.FC<EnhancedTherapistMenuProps> = ({
  therapistId,
  menuData = sampleMenuData,
  onServiceSelect,
  className = ''
}) => {
  const { refreshKey, refreshBadges } = useBadgeSession();
  const { config, updateConfig } = useBadgeConfig({
    showBadges: true,
    maxBadges: 2,
    animate: true
  });

  const [selectedService, setSelectedService] = React.useState<{
    serviceId: string;
    duration: string;
  } | null>(null);

  const handleServiceSelect = (serviceId: string, duration: string, price: number) => {
    setSelectedService({ serviceId, duration });
    onServiceSelect?.(serviceId, duration, price);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with badge controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Massage Services</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshBadges}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            🔄 Refresh Badges
          </button>
          <button
            onClick={() => updateConfig({ showBadges: !config.showBadges })}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              config.showBadges 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {config.showBadges ? '🏷️ Hide Badges' : '🏷️ Show Badges'}
          </button>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {menuData.map((service) => {
          const availableDurations = ['60', '90', '120'].filter(
            duration => service[`price${duration}` as keyof typeof service]
          );

          return (
            <div
              key={service.id}
              className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-300 ${
                selectedService?.serviceId === service.id
                  ? 'border-orange-500 shadow-lg bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
            >
              {/* Dynamic Service Badges */}
              {config.showBadges && (
                <ServiceBadges
                  serviceId={service.id}
                  serviceName={service.serviceName}
                  refreshKey={refreshKey}
                  animate={config.animate}
                  maxBadges={config.maxBadges}
                  className="badge-container-top-right"
                />
              )}

              {/* Service Info */}
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {service.serviceName}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              </div>

              {/* Pricing Options */}
              <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-3">
                  {availableDurations.map((duration) => {
                    const price = service[`price${duration}` as keyof typeof service] as string;
                    const isSelected = selectedService?.serviceId === service.id && 
                                     selectedService?.duration === duration;
                    
                    return (
                      <button
                        key={duration}
                        onClick={() => handleServiceSelect(
                          service.id, 
                          duration, 
                          Number(price) * 1000
                        )}
                        className={`flex-1 min-w-[100px] max-w-[140px] px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500 text-white shadow-lg transform scale-105'
                            : 'border-orange-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-semibold mb-1">
                            {duration} min
                          </div>
                          <div className="text-sm font-bold">
                            Rp {(Number(price) * 1000).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="text-center">
                <button
                  className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    selectedService?.serviceId === service.id
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={selectedService?.serviceId !== service.id}
                >
                  {selectedService?.serviceId === service.id
                    ? '📅 Book Now'
                    : '👆 Select Duration'
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Badge Meanings:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            <span className="text-gray-700">New Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-gray-700">Popular Choice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
            <span className="text-gray-700">Recently Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
            <span className="text-gray-700">Best Value</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTherapistMenu;