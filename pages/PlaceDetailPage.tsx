import React from 'react';
import type { Place } from '../types';

interface PlaceDetailPageProps {
    place: Place;
    onBack: () => void;
    t: any;
}

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z"/>
    </svg>
);


const PlaceDetailPage: React.FC<PlaceDetailPageProps> = ({ place, onBack, t }) => {

    const openWhatsApp = () => {
        window.open(`https://wa.me/${place.whatsappNumber}`, '_blank');
    };
    
    return (
        <div className="min-h-screen bg-white">
             <div className="relative">
                <img className="w-full h-64 object-cover" src={place.mainImage} alt={place.name} />
                <button onClick={onBack} className="absolute top-4 left-4 bg-white/70 rounded-full p-2 text-gray-800 hover:bg-white transition-colors">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {place.thumbnailImages.map((img, index) => (
                        <img key={index} src={img} alt={`${place.name} thumbnail ${index+1}`} className="w-full h-24 object-cover rounded-lg shadow-sm" />
                    ))}
                </div>

                <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
                <p className="mt-2 text-gray-600">{place.description}</p>
            </div>

            <div className="px-4 py-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.pricingTitle}</h3>
                 <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>60 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {place.pricing[60]}k</p>
                    </div>
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>90 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {place.pricing[90]}k</p>
                    </div>
                    <div className="bg-brand-green-light p-3 rounded-lg">
                        <p>120 min</p>
                        <p className="font-bold text-lg text-brand-green-dark">Rp {place.pricing[120]}k</p>
                    </div>
                </div>
            </div>

            <div className="p-4 mt-4 sticky bottom-0 bg-white border-t">
                 <button
                    onClick={openWhatsApp}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
                >
                    <WhatsAppIcon className="w-5 h-5"/>
                    <span>{t.contactButton}</span>
                </button>
            </div>
        </div>
    );
};

export default PlaceDetailPage;