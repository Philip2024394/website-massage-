
import React, { useState, useEffect } from 'react';
import type { Therapist, Place } from '../types';
import ToggleSwitch from '../components/ToggleSwitch';
import Button from '../components/Button';

interface AdminDashboardPageProps {
    therapists: Therapist[];
    places: Place[];
    onToggleTherapist: (id: number) => void;
    onTogglePlace: (id: number) => void;
    onLogout: () => void;
    isSupabaseConnected: boolean;
    onGoToSupabaseSettings: () => void;
    onUpdateMembership: (id: number, type: 'therapist' | 'place', months: number) => void;
    googleMapsApiKey: string | null;
    onSaveGoogleMapsApiKey: (key: string) => void;
    appContactNumber: string | null;
    onSaveAppContactNumber: (number: string) => void;
    t: any;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const MembershipControls: React.FC<{ onUpdate: (months: number) => void, t: any }> = ({ onUpdate, t: t_membership }) => {
    const durations = [
        { months: 1, label: t_membership.oneMonth },
        { months: 3, label: t_membership.threeMonths },
        { months: 6, label: t_membership.sixMonths },
        { months: 12, label: t_membership.oneYear },
    ];

    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">{t_membership.membershipTitle || 'Membership Management'}</h4>
            <div className="flex items-center gap-2 flex-wrap">
                {durations.map(({ months, label }) => (
                    <button
                        key={months}
                        onClick={() => onUpdate(months)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full hover:bg-blue-200 transition-colors"
                    >
                        + {label}
                    </button>
                ))}
            </div>
        </div>
    );
};


const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ therapists, places, onToggleTherapist, onTogglePlace, onLogout, isSupabaseConnected, onGoToSupabaseSettings, onUpdateMembership, googleMapsApiKey, onSaveGoogleMapsApiKey, appContactNumber, onSaveAppContactNumber, t }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [contactNumberInput, setContactNumberInput] = useState('');
    const [activeView, setActiveView] = useState<'members' | 'settings'>('members');

    useEffect(() => {
        if (googleMapsApiKey) {
            setApiKeyInput(googleMapsApiKey);
        }
    }, [googleMapsApiKey]);

    useEffect(() => {
        if (appContactNumber) {
            setContactNumberInput(appContactNumber);
        }
    }, [appContactNumber]);
    
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
             if (isNaN(date.getTime())) {
                return "Invalid Date";
            }
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        } catch (error) {
            return "Invalid Date";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logout}</Button>
            </header>

            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
                <button
                    onClick={() => setActiveView('members')}
                    className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeView === 'members' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                >
                    {t.tabs.members}
                </button>
                <button
                    onClick={() => setActiveView('settings')}
                    className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeView === 'settings' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}
                >
                    {t.tabs.settings}
                </button>
            </div>
            
            {activeView === 'members' && (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.therapists} ({therapists.length})</h2>
                        <div className="space-y-4">
                            {therapists.map(therapist => (
                                <div key={therapist.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-bold text-lg text-gray-900">{therapist.name}</h3>
                                        <div className="flex-shrink-0">
                                            <ToggleSwitch 
                                                id={`therapist-${therapist.id}`}
                                                checked={therapist.isLive}
                                                onChange={() => onToggleTherapist(therapist.id)}
                                                labelOn={t.live}
                                                labelOff={t.notLive}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1 border-t pt-3 mt-3">
                                        <p><span className="font-semibold">Email:</span> {therapist.email}</p>
                                        <p><span className="font-semibold">WhatsApp:</span> {therapist.whatsappNumber}</p>
                                        <p><span className="font-semibold">Location:</span> {therapist.location}</p>
                                        <p><span className="font-semibold">Membership Active Until:</span> {formatDate(therapist.activeMembershipDate)}</p>
                                        <div className="flex items-center gap-1 text-sm pt-1">
                                            <StarIcon className="w-5 h-5 text-yellow-400"/>
                                            <span className="font-bold text-gray-700">{therapist.rating.toFixed(1)}</span>
                                            <span className="text-gray-500">({therapist.reviewCount} reviews)</span>
                                        </div>
                                    </div>
                                    <MembershipControls onUpdate={(months) => onUpdateMembership(therapist.id, 'therapist', months)} t={{...t, ...t.membershipDurations}} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.places} ({places.length})</h2>
                        <div className="space-y-4">
                            {places.map(place => (
                            <div key={place.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-bold text-lg text-gray-900">{place.name}</h3>
                                        <div className="flex-shrink-0">
                                            <ToggleSwitch 
                                                id={`place-${place.id}`}
                                                checked={place.isLive}
                                                onChange={() => onTogglePlace(place.id)}
                                                labelOn={t.live}
                                                labelOff={t.notLive}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1 border-t pt-3 mt-3">
                                        <p><span className="font-semibold">Email:</span> {place.email}</p>
                                        <p><span className="font-semibold">WhatsApp:</span> {place.whatsappNumber}</p>
                                        <p><span className="font-semibold">Location:</span> {place.location}</p>
                                        <p><span className="font-semibold">Membership Active Until:</span> {formatDate(place.activeMembershipDate)}</p>
                                        <div className="flex items-center gap-1 text-sm pt-1">
                                            <StarIcon className="w-5 h-5 text-yellow-400"/>
                                            <span className="font-bold text-gray-700">{place.rating.toFixed(1)}</span>
                                            <span className="text-gray-500">({place.reviewCount} reviews)</span>
                                        </div>
                                    </div>
                                    <MembershipControls onUpdate={(months) => onUpdateMembership(place.id, 'place', months)} t={{...t, ...t.membershipDurations}} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'settings' && (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.dbSettings}</h2>
                        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800">Supabase Connection</p>
                                <p className={`text-sm font-bold ${isSupabaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                                    {isSupabaseConnected ? t.dbStatusConnected : t.dbStatusNotConnected}
                                </p>
                            </div>
                            <Button onClick={onGoToSupabaseSettings} variant="secondary" className="w-auto px-4 py-2 text-sm">
                                {t.manageConnection}
                            </Button>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.googleMapsApiKey.title}</h2>
                        <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
                            <p className="text-sm text-gray-600">{t.googleMapsApiKey.description}</p>
                            <div>
                                <label htmlFor="gmaps-api-key" className="block text-sm font-medium text-gray-700">{t.googleMapsApiKey.label}</label>
                                <input
                                    id="gmaps-api-key"
                                    type="text"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                    placeholder={t.googleMapsApiKey.placeholder}
                                />
                            </div>
                            <Button onClick={() => onSaveGoogleMapsApiKey(apiKeyInput)} variant="primary" className="w-auto px-4 py-2 text-sm">
                                {t.googleMapsApiKey.saveButton}
                            </Button>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.appContactNumber.title}</h2>
                        <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
                            <p className="text-sm text-gray-600">{t.appContactNumber.description}</p>
                            <div>
                                <label htmlFor="contact-number-input" className="block text-sm font-medium text-gray-700">{t.appContactNumber.label}</label>
                                <input
                                    id="contact-number-input"
                                    type="text"
                                    value={contactNumberInput}
                                    onChange={(e) => setContactNumberInput(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                    placeholder={t.appContactNumber.placeholder}
                                />
                            </div>
                            <Button onClick={() => onSaveAppContactNumber(contactNumberInput)} variant="primary" className="w-auto px-4 py-2 text-sm">
                                {t.appContactNumber.saveButton}
                            </Button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
