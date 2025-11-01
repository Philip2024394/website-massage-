import React from 'react';

interface Service {
    name: string;
    duration: string;
    price: string;
}

interface ServiceItemProps {
    service: Service;
}

/**
 * Reusable Service Item component
 * Displays a single service with duration and pricing
 */
export const ServiceItem: React.FC<ServiceItemProps> = ({ service }) => {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
            <div>
                <h4 className="font-bold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.duration}</p>
            </div>
            <div className="text-orange-600 font-bold">{service.price}</div>
        </div>
    );
};
