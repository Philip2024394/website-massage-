import React, { useState, useEffect, useMemo } from 'react';
import type { Agent, Therapist, Place } from '../types';
import Button from '../components/Button';
import { getSupabase } from '../lib/supabase';

interface AgentDashboardPageProps {
    agent: Agent;
    onLogout: () => void;
    t: any;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z" />
    </svg>
);

const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ agent, onLogout, t }) => {
    const [activeTab, setActiveTab] = useState<'clients' | 'renewals' | 'earnings'>('clients');
    const [clients, setClients] = useState<(Therapist | Place)[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const supabase = getSupabase();
            if (!supabase) return;
            setIsLoading(true);

            const { data: therapists, error: therapistsError } = await supabase.from('therapists').select('*').eq('agentId', agent.id);
            const { data: places, error: placesError } = await supabase.from('places').select('*').eq('agentId', agent.id);

            if (therapistsError) console.error(therapistsError);
            if (placesError) console.error(placesError);

            const allClients = [...(therapists || []), ...(places || [])];
            setClients(allClients);
            setIsLoading(false);
        };

        fetchClients();
    }, [agent.id]);

    const renewalsDue = useMemo(() => {
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);

        return clients.filter(client => {
            const expiryDate = new Date(client.activeMembershipDate);
            return expiryDate >= now && expiryDate <= oneWeekFromNow;
        });
    }, [clients]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // FIX: Explicitly type component as React.FC to allow 'key' prop.
    const ClientCard: React.FC<{ client: Therapist | Place }> = ({ client }) => (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800">{client.name}</h4>
            <p className="text-sm text-gray-600">{client.email}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{t.clients.membershipExpires.replace('{date}', formatDate(client.activeMembershipDate))}</p>
        </div>
    );
    
    // FIX: Explicitly type component as React.FC to allow 'key' prop.
    const RenewalCard: React.FC<{ client: Therapist | Place }> = ({ client }) => (
        <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
                <h4 className="font-bold text-gray-800">{client.name}</h4>
                <p className="text-sm text-red-600 font-semibold">Expires: {formatDate(client.activeMembershipDate)}</p>
            </div>
            <a href={`https://wa.me/${client.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-green-600 transition-colors">
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t.renewals.contact}</span>
            </a>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                    <p className="text-sm text-gray-600">Welcome, {agent.name}!</p>
                </div>
                <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logout}</Button>
            </header>
            
            <div className="mb-6">
                <p className="text-sm text-center bg-blue-100 text-blue-800 p-3 rounded-lg">
                    <strong>Your Agent Code:</strong> <span className="font-mono bg-blue-200 px-2 py-1 rounded">{agent.agentCode}</span>
                </p>
            </div>

            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
                <button onClick={() => setActiveTab('clients')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'clients' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.clients}
                </button>
                <button onClick={() => setActiveTab('renewals')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 relative ${activeTab === 'renewals' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.renewals}
                    {renewalsDue.length > 0 && <span className="absolute top-0 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                <button onClick={() => setActiveTab('earnings')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'earnings' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.earnings}
                </button>
            </div>

            {isLoading ? (
                 <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div></div>
            ) : (
                <div>
                    {activeTab === 'clients' && (
                        <div className="space-y-4">
                             <h2 className="text-xl font-semibold text-gray-700">{t.clients.therapists}</h2>
                             {clients.filter(c => 'status' in c).length > 0 ? clients.filter(c => 'status' in c).map(c => <ClientCard key={c.id} client={c} />) : <p className="text-sm text-gray-500">{t.clients.noClients}</p>}
                             
                             <h2 className="text-xl font-semibold text-gray-700 mt-6">{t.clients.places}</h2>
                             {clients.filter(c => 'openingTime' in c).length > 0 ? clients.filter(c => 'openingTime' in c).map(c => <ClientCard key={c.id} client={c} />) : <p className="text-sm text-gray-500">{t.clients.noClients}</p>}
                        </div>
                    )}
                    {activeTab === 'renewals' && (
                         <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700">{t.renewals.title}</h2>
                            {renewalsDue.length > 0 ? renewalsDue.map(c => <RenewalCard key={c.id} client={c} />) : <p className="text-sm text-gray-500">{t.renewals.noRenewals}</p>}
                         </div>
                    )}
                    {activeTab === 'earnings' && (
                        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700">{t.earnings.title}</h2>
                            <div className="text-center bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">{t.earnings.totalSignups}</p>
                                <p className="text-4xl font-bold text-brand-green">{clients.length}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{t.earnings.commissionInfo}</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                                    <li>{t.earnings.commissionNew}</li>
                                    <li>{t.earnings.commissionRecurring}</li>
                                </ul>
                            </div>
                            <p className="text-xs text-gray-500 text-center pt-4 border-t">{t.earnings.note}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgentDashboardPage;