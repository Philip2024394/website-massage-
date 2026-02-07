// Integration example for existing TherapistCard components
import React, { useState, useMemo } from 'react';
import ServiceBadges from '../components/badges/ServiceBadges';
import { useBadgeSession } from '../hooks/useBadgeSession';
import '../styles/badges.css';

// Example: Enhanced TherapistCard with Badges
export function EnhancedTherapistCard({ therapist, onBooking }) {
  const { refreshKey } = useBadgeSession();
  const [selectedService, setSelectedService] = useState(null);
  
  // Session-based refresh key for consistent badge display
  const sessionRefreshKey = useMemo(() => 
    `${Date.now().toString().slice(0, -5)}`, // Updates every ~10 seconds for demo
    []
  );

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Therapist Header */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img
            className="w-16 h-16 rounded-full object-cover"
            src={therapist.profilePicture}
            alt={therapist.name}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{therapist.name}</h2>
            <p className="text-gray-600">Licensed Therapist</p>
          </div>
        </div>
      </div>

      {/* Services with Badges */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h3>
        <div className="space-y-4">
          {therapist.services?.map((service, index) => (
            <div
              key={service.id}
              className={`relative bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                selectedService?.id === service.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              {/* Dynamic Badges */}
              <ServiceBadges
                serviceId={service.id}
                serviceName={service.name}
                refreshKey={sessionRefreshKey}
                animate={true}
                maxBadges={2}
                className="absolute top-2 right-2 z-10"
              />

              <div className="pr-8"> {/* Add padding to avoid badge overlap */}
                <h4 className="font-semibold text-gray-900 mb-2">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {service.description}
                </p>
                
                {/* Duration Options */}
                <div className="flex gap-2">
                  {service.durations?.map((duration) => (
                    <button
                      key={duration.minutes}
                      onClick={() => setSelectedService({
                        id: service.id,
                        duration: duration.minutes,
                        price: duration.price
                      })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedService?.id === service.id && 
                        selectedService?.duration === duration.minutes
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {duration.minutes}min - Rp {duration.price.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Button */}
        <button
          onClick={() => selectedService && onBooking(selectedService)}
          disabled={!selectedService}
          className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors ${
            selectedService
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedService ? '📅 Book Now' : '👆 Select a Service'}
        </button>
      </div>
    </div>
  );
}

// Example: Integration with existing TherapistPriceListModal
export function enhanceExistingPriceModal() {
  /*
  To integrate badges into your existing TherapistPriceListModal:
  
  1. Import the badge components:
     import ServiceBadges from '../components/badges/ServiceBadges';
     import { useBadgeSession } from '../hooks/useBadgeSession';
     import '../styles/badges.css';
  
  2. Add badge session management:
     const { refreshKey } = useBadgeSession();
  
  3. Update the service card rendering:
     <div className="relative bg-white rounded-xl border-2 p-4">
       <ServiceBadges
         serviceId={service.id}
         serviceName={service.serviceName}
         refreshKey={refreshKey}
         animate={true}
         maxBadges={2}
       />
       // ... existing service content
     </div>
  
  4. Add props to control badge behavior:
     interface TherapistPriceListModalProps {
       // ... existing props
       showBadges?: boolean;
       badgesRefreshKey?: string;
     }
  */
}

// Example: Standalone Service Grid with Badges
export function ServiceGrid({ services, onServiceSelect }) {
  const { refreshKey, refreshBadges } = useBadgeSession();

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Massage Services</h2>
        <button
          onClick={refreshBadges}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh Badges
        </button>
      </div>

      {/* Service Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onServiceSelect(service)}
          >
            {/* Badges */}
            <ServiceBadges
              serviceId={service.id}
              serviceName={service.name}
              refreshKey={refreshKey}
              animate={true}
              maxBadges={2}
            />

            {/* Service Content */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {service.description}
              </p>
              <div className="text-orange-600 font-bold">
                From Rp {service.startingPrice.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example: Mobile-Optimized Service List
export function MobileServiceList({ services, onServiceSelect }) {
  const { refreshKey } = useBadgeSession();

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="relative bg-white rounded-lg border border-gray-200 p-4"
        >
          {/* Mobile-optimized badges */}
          <ServiceBadges
            serviceId={service.id}
            serviceName={service.name}
            refreshKey={refreshKey}
            animate={true}
            maxBadges={1} // Limit to 1 badge on mobile
            className="absolute top-2 right-2 z-10 service-badge-mobile"
          />

          <div className="pr-16"> {/* More padding on mobile */}
            <h4 className="font-semibold text-gray-900">
              {service.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {service.shortDescription}
            </p>
            <div className="text-orange-600 font-bold mt-2">
              Rp {service.price.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sample data for testing
export const sampleTherapistData = {
  id: '1',
  name: 'Sarah Johnson',
  profilePicture: '/images/therapist-1.jpg',
  services: [
    {
      id: 'service-1',
      name: 'Swedish Massage',
      description: 'Gentle, relaxing massage perfect for stress relief',
      durations: [
        { minutes: 60, price: 150000 },
        { minutes: 90, price: 200000 }
      ]
    },
    {
      id: 'service-2', 
      name: 'Deep Tissue Massage',
      description: 'Intense therapeutic massage for muscle tension',
      durations: [
        { minutes: 60, price: 180000 },
        { minutes: 90, price: 240000 },
        { minutes: 120, price: 320000 }
      ]
    },
    {
      id: 'service-3',
      name: 'Hot Stone Massage',
      description: 'Heated stones enhance relaxation and muscle relief',
      durations: [
        { minutes: 90, price: 270000 },
        { minutes: 120, price: 350000 }
      ]
    }
  ]
};

// Usage Examples:
export const BadgeIntegrationExamples = {
  // 1. Basic integration
  basic: `
    <ServiceBadges
      serviceId="service-1"
      serviceName="Swedish Massage"
      refreshKey="session-123"
    />
  `,
  
  // 2. With custom configuration
  custom: `
    <ServiceBadges
      serviceId="service-1"
      serviceName="Swedish Massage"
      refreshKey="session-123"
      animate={true}
      maxBadges={1}
      className="custom-badge-positioning"
    />
  `,
  
  // 3. With session management
  withSession: `
    const { refreshKey, refreshBadges } = useBadgeSession();
    
    return (
      <div>
        <button onClick={refreshBadges}>Refresh</button>
        <ServiceBadges
          serviceId="service-1"
          serviceName="Swedish Massage"
          refreshKey={refreshKey}
        />
      </div>
    );
  `,
  
  // 4. Integration with existing modal
  modalIntegration: `
    // In your existing TherapistPriceListModal component:
    
    // Add to imports:
    import ServiceBadges from '../components/badges/ServiceBadges';
    import { useBadgeSession } from '../hooks/useBadgeSession';
    
    // Add session management:
    const { refreshKey } = useBadgeSession();
    
    // Update service card JSX:
    <div className="relative bg-white rounded-xl border-2 p-4">
      <ServiceBadges
        serviceId={service.id}
        serviceName={service.serviceName}
        refreshKey={refreshKey}
      />
      {/* ... existing service content */}
    </div>
  `
};