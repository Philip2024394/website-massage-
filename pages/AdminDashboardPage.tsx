
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

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ therapists, places, onToggleTherapist, onTogglePlace, onLogout, t }) => {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logout}</Button>
            </header>

            <div className="space-y-8">
                <section className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.therapists} ({therapists.length})</h2>
                    <div className="space-y-4">
                        {therapists.map(therapist => (
                            <div key={therapist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="font-medium text-gray-900">{therapist.name}</span>
                                <ToggleSwitch 
                                    id={`therapist-${therapist.id}`}
                                    checked={therapist.isLive}
                                    onChange={() => onToggleTherapist(therapist.id)}
                                    labelOn={t.live}
                                    labelOff={t.notLive}
                                />
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
