
import React from 'react';
import type { Therapist, Place } from '../types';
import ToggleSwitch from '../components/ToggleSwitch';
import Button from '../components/Button';

interface AdminDashboardPageProps {
    therapists: Therapist[];
    places: Place[];
    onToggleTherapist: (id: number) => void;
    onTogglePlace: (id: number) => void;
    onLogout: () => void;
    t: any;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ therapists, places, onToggleTherapist, onTogglePlace, onLogout, t }) => {
    
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logout}</Button>
            </header>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.therapists} ({therapists.length})</h2>
                    <div className="space-y-4">
                        {therapists.map(therapist => (
                            <div key={therapist.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-gray-900">{therapist.name}</h3>
                                    <ToggleSwitch 
                                        id={`therapist-${therapist.id}`}
                                        checked={therapist.isLive}
                                        onChange={() => onToggleTherapist(therapist.id)}
                                        labelOn={t.live}
                                        labelOff={t.notLive}
                                    />
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-semibold">WhatsApp:</span> {therapist.whatsappNumber}</p>
                                    <p><span className="font-semibold">Location:</span> {therapist.location}</p>
                                    <p><span className="font-semibold">Membership Active Until:</span> {formatDate(therapist.activeMembershipDate)}</p>
                                </div>
                                 <div className="flex items-center gap-1 text-sm">
                                    <StarIcon className="w-5 h-5 text-yellow-400"/>
                                    <span className="font-bold text-gray-700">{therapist.rating.toFixed(1)}</span>
                                    <span className="text-gray-500">({therapist.reviewCount} reviews)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.places} ({places.length})</h2>
                     <div className="space-y-4">
                        {places.map(place => (
                           <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-medium text-gray-900">{place.name}</span>
                                 <ToggleSwitch 
                                    id={`place-${place.id}`}
                                    checked={place.isLive}
                                    onChange={() => onTogglePlace(place.id)}
                                    labelOn={t.live}
                                    labelOff={t.notLive}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboardPage;