import React from 'react';
import type { Therapist, Analytics } from '../types';
import { AvailabilityStatus } from '../types';
import Button from './Button';

interface TherapistCardProps {
    therapist: Therapist;
    onRate: (therapist: Therapist) => void;
    onBook: (therapist: Therapist) => void;
    onIncrementAnalytics: (metric: keyof Analytics) => void;
    t: any;
}

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);

const LocationPinIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const statusStyles: { [key in AvailabilityStatus]: { text: string; bg: string; dot: string } } = {
    [AvailabilityStatus.Available]: { text: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
    [AvailabilityStatus.Busy]: { text: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
    [AvailabilityStatus.Offline]: { text: 'text-gray-700', bg: 'bg-gray-100', dot: 'bg-gray-500' },
};

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onRate, onBook, onIncrementAnalytics, t }) => {
    const style = statusStyles[therapist.status];

    const openWhatsApp = () => {
        onIncrementAnalytics('whatsappClicks');
        window.open(`https://wa.me/${therapist.whatsappNumber}`, '_blank');
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col gap-4">
            <div className="flex items-start gap-4">
                <img className="w-20 h-20 rounded-full object-cover" src={therapist.profilePicture} alt={therapist.name} />
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-lg font-bold text-gray-900">{therapist.name}</h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} mt-1`}>
                                <span className={`w-2 h-2 mr-1.5 rounded-full ${style.dot}`}></span>
                                {therapist.status}
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 gap-1">
                            <LocationPinIcon className="w-4 h-4 text-gray-400"/>
                            <span>{therapist.distance}km</span>
                        </div>
                    </div>
                     <p className="text-sm text-gray-600 mt-2">{therapist.description}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div 
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => onRate(therapist)}
                    aria-label={`Rate ${therapist.name}`}
                    role="button"
                >
                    <StarIcon className="w-5 h-5 text-yellow-400"/>
                    <span className="font-bold text-gray-700">{therapist.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({therapist.reviewCount} reviews)</span>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">Massage Types</h4>
                <div className="flex flex-wrap gap-2">
                    {therapist.massageTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{type}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                <div className="bg-brand-green-light p-2 rounded-lg">
                    <p>60 min</p>
                    <p className="font-bold text-brand-green-dark">Rp {therapist.pricing[60]}k</p>
                </div>
                <div className="bg-brand-green-light p-2 rounded-lg">
                    <p>90 min</p>
                    <p className="font-bold text-brand-green-dark">Rp {therapist.pricing[90]}k</p>
                </div>
                <div className="bg-brand-green-light p-2 rounded-lg">
                    <p>120 min</p>
                    <p className="font-bold text-brand-green-dark">Rp {therapist.pricing[120]}k</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={openWhatsApp}
                    className="w-1/2 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>{t.orderNow}</span>
                </button>
                 <Button onClick={() => onBook(therapist)} className="w-1/2" variant="primary">
                    {t.schedule}
                </Button>
            </div>
        </div>
    );
};

export default TherapistCard;