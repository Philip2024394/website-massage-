

import React, { useState, useEffect, useRef } from 'react';
import type { Therapist, Pricing } from '../types';
import { AvailabilityStatus } from '../types';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import UserSolidIcon from '../components/icons/UserSolidIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CurrencyRpIcon from '../components/icons/CurrencyRpIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';

interface TherapistDashboardPageProps {
    onSave: (data: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate'>) => void;
    onBack: () => void;
    onLogout: () => void;
    therapist?: Therapist | null;
    t: any;
}

const CustomCheckbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-brand-green peer-checked:border-brand-green transition-colors"></div>
            <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4.5L4.33333 8L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);


const TherapistDashboardPage: React.FC<TherapistDashboardPageProps> = ({ onSave, onBack, onLogout, therapist, t }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

    const locationInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (therapist) {
            setName(therapist.name);
            setDescription(therapist.description);
            setProfilePicture(therapist.profilePicture);
            setWhatsappNumber(therapist.whatsappNumber);
            setMassageTypes(therapist.massageTypes);
            setPricing(therapist.pricing);
            setLocation(therapist.location);
            setStatus(therapist.status);
        }
    }, [therapist]);

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
                types: ['address'],
                componentRestrictions: { country: 'id' } 
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setLocation(place.formatted_address);
                }
            });
        }
    }, [mapsApiLoaded]);

    const handleSave = () => {
        onSave({
            name,
            email: therapist?.email || '',
            description,
            profilePicture,
            whatsappNumber,
            pricing,
            massageTypes,
            location,
            status,
            distance: 0, // dummy value
        });
    };
    
    const handlePriceChange = (duration: keyof Pricing, value: string) => {
        const numValue = parseInt(value, 10);
        setPricing(prev => ({ ...prev, [duration]: isNaN(numValue) ? 0 : numValue }));
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
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
             <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.therapistTitle}</h1>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logoutButton}</Button>
            </header>

            <div className={`p-4 rounded-lg mb-6 text-center text-sm font-medium ${therapist?.isLive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {therapist?.isLive ? t.profileLive : t.pendingApproval}
            </div>

            <div className="space-y-6">
                 <ImageUpload
                    id="profile-picture-upload"
                    label={t.uploadProfilePic}
                    currentImage={profilePicture}
                    onImageChange={setProfilePicture}
                />
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t.onlineStatusLabel}</label>
                    <div className="mt-2 flex bg-gray-200 rounded-full p-1">
                        {Object.values(AvailabilityStatus).map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`w-1/3 py-2 px-2 rounded-full text-sm font-semibold transition-colors duration-300 ${status === s ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
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
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.whatsappLabel}</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="absolute inset-y-0 left-10 pl-2 flex items-center text-gray-500 text-sm pointer-events-none">+62</span>
                        <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="81234567890" className="block w-full pl-20 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t.massageTypesLabel}</label>
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-4">
                        {MASSAGE_TYPES_CATEGORIZED.map(category => (
                            <div key={category.category}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.category}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                    {category.types.map(type => (
                                        <CustomCheckbox
                                            key={type}
                                            label={type}
                                            checked={massageTypes.includes(type)}
                                            onChange={() => handleMassageTypeChange(type)}
                                        />
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
                                <input ref={locationInputRef} type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder={t.locationPlaceholder} className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green text-gray-900" />
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
                               <input type="number" value={pricing[60]} onChange={e => handlePriceChange(60, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-600">{t['90min']}</label>
                             <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                               <input type="number" value={pricing[90]} onChange={e => handlePriceChange(90, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
                            </div>
                        </div>
                         <div>
                           <label className="block text-xs font-medium text-gray-600">{t['120min']}</label>
                            <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-4 w-4 text-gray-400" /></div>
                               <input type="number" value={pricing[120]} onChange={e => handlePriceChange(120, e.target.value)} className="mt-1 block w-full pl-9 pr-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900" />
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

export default TherapistDashboardPage;