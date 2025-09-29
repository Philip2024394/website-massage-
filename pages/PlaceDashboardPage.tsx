import React, { useState, useEffect, useRef } from 'react';
import type { Place, Pricing } from '../types';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';

interface PlaceDashboardPageProps {
    onSave: (data: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount'>) => void;
    onBack: () => void;
    place?: Place | null;
    t: any;
}

const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onBack, place, t }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [thumbnailImages, setThumbnailImages] = useState(['', '', '']);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');

    const locationInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (place) {
            setName(place.name);
            setDescription(place.description);
            setMainImage(place.mainImage);
            setThumbnailImages([...place.thumbnailImages, '', '', ''].slice(0, 3));
            setWhatsappNumber(place.whatsappNumber);
            setPricing(place.pricing);
            setLocation(place.location);
        }
    }, [place]);

    useEffect(() => {
        if ((window as any).google && locationInputRef.current) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(locationInputRef.current, {
                types: ['establishment', 'geocode'],
                componentRestrictions: { country: 'id' }
            });
            autocomplete.addListener('place_changed', () => {
                const placeResult = autocomplete.getPlace();
                if (placeResult.formatted_address) {
                    setLocation(placeResult.formatted_address);
                }
            });
        }
    }, []);

    const handleSave = () => {
        onSave({
            name,
            description,
            mainImage,
            thumbnailImages,
            whatsappNumber,
            pricing,
            location,
            distance: 0, // dummy value
        });
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        const numValue = parseInt(value, 10);
        setPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
    };
    
    const handleThumbnailChange = (index: number, value: string) => {
        const newThumbs = [...thumbnailImages];
        newThumbs[index] = value;
        setThumbnailImages(newThumbs);
    };

    const handleSetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const geocoder = new (window as any).google.maps.Geocoder();
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                geocoder.geocode({ location: latlng }, (results: any, status: string) => {
                    if (status === 'OK' && results[0]) {
                        setLocation(results[0].formatted_address);
                        alert(t.locationSetConfirmation);
                    } else {
                        console.error('Geocoder failed due to: ' + status);
                        alert('Could not find address for your location.');
                    }
                });
            }, () => {
                alert('Could not get your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const renderInput = (value: string, onChange: (val: string) => void, Icon: React.FC<{className?:string}>, placeholder?: string, type: string = 'text') => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
             <header className="flex justify-between items-center mb-6 relative">
                 <button onClick={onBack} className="absolute left-0 text-gray-600 hover:text-gray-800">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">{t.placeTitle}</h1>
            </header>

            <div className={`p-4 rounded-lg mb-6 text-center text-sm font-medium ${place?.isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {place?.isLive ? t.profileLive : t.pendingApproval}
            </div>

            <div className="space-y-6">
                <ImageUpload
                    id="main-image-upload"
                    label={t.uploadMainImage}
                    currentImage={mainImage}
                    onImageChange={setMainImage}
                />

                <div className="grid grid-cols-3 gap-4">
                     {thumbnailImages.map((thumb, index) => (
                        <ImageUpload
                            key={index}
                            id={`thumb-upload-${index}`}
                            label={`${t.uploadThumb} ${index + 1}`}
                            currentImage={thumb}
                            onImageChange={(dataUrl) => handleThumbnailChange(index, dataUrl)}
                            heightClass="h-28"
                        />
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                    {renderInput(name, setName, UserSolidIcon)}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
                    <div className="relative">
                        <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t.whatsappLabel}</label>
                     {renderInput(whatsappNumber, setWhatsappNumber, PhoneIcon, '6281234567890')}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.locationLabel}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input ref={locationInputRef} type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t.locationPlaceholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green" />
                    </div>
                     <Button onClick={handleSetLocation} variant="secondary" className="flex items-center justify-center gap-2 mt-2 text-sm py-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{t.setLocation}</span>
                    </Button>
                </div>
                <div>
                    <h3 className="text-md font-medium text-gray-800">{t.pricingTitle}</h3>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                         <div>
                           <label className="block text-xs font-medium text-gray-600">{t['60min']}</label>
                           <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                               <input type="number" value={pricing[60]} onChange={e => handlePriceChange(60, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-600">{t['90min']}</label>
                             <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                               <input type="number" value={pricing[90]} onChange={e => handlePriceChange(90, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                         <div>
                           <label className="block text-xs font-medium text-gray-600">{t['120min']}</label>
                            <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                               <input type="number" value={pricing[120]} onChange={e => handlePriceChange(120, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave}>{t.saveButton}</Button>
                </div>
            </div>
        </div>
    );
};

export default PlaceDashboardPage;