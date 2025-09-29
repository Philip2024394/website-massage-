import React, { useState, useEffect, useRef } from 'react';
import type { Place, Pricing } from '../types';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';

interface PlaceDashboardPageProps {
    onSave: (data: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount'>) => void;
    onBack: () => void;
    onLogout: () => void;
    place?: Place | null;
    t: any;
}

const PlaceDashboardPage: React.FC<PlaceDashboardPageProps> = ({ onSave, onBack, onLogout, place, t }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [thumbnailImages, setThumbnailImages] = useState(['', '', '']);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

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
            setMassageTypes(place.massageTypes || []);
        }
    }, [place]);

    useEffect(() => {
        const checkGoogleMaps = () => {
             if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                setMapsApiLoaded(true);
                return true;
            }
            return false;
        };

        if (!checkGoogleMaps()) {
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 500);
            
            const timeout = setTimeout(() => {
                clearInterval(interval);
            }, 5000);

            return () => {
                clearInterval(interval)
                clearTimeout(timeout);
            };
        }
    }, []);

    useEffect(() => {
        if (mapsApiLoaded && locationInputRef.current) {
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
    }, [mapsApiLoaded]);

    const handleSave = () => {
        onSave({
            name,
            email: place?.email || '',
            description,
            mainImage,
            thumbnailImages,
            whatsappNumber,
            pricing,
            location,
            massageTypes,
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

    const handleMassageTypeChange = (type: string) => {
        setMassageTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
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
             <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.placeTitle}</h1>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logoutButton}</Button>
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
                    <label className="block text-sm font-medium text-gray-700">{t.massageTypesLabel}</label>
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-4">
                        {MASSAGE_TYPES_CATEGORIZED.map(category => (
                            <div key={category.category}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.category}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                    {category.types.map(type => (
                                        <label key={type} className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={massageTypes.includes(type)}
                                                onChange={() => handleMassageTypeChange(type)}
                                                className="rounded text-brand-green focus:ring-brand-green"
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.locationLabel}</label>
                    {mapsApiLoaded ? (
                        <>
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
                        </>
                    ) : (
                         <div className="mt-2 p-3 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                           {t.mapsApiError}
                        </div>
                    )}
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