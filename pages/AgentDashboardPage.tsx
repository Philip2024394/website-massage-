import React, { useState, useEffect, useMemo } from 'react';
import type { Agent, Therapist, Place, AdminMessage } from '../types';
import Button from '../components/Button';

import ImageUpload from '../components/ImageUpload';

interface AgentDashboardPageProps {
    agent: Agent;
    onLogout: () => void;
    t: any;
    isAdminView?: boolean;
    onStopImpersonating?: () => void;
    messages: AdminMessage[];
    onSendMessage?: (message: string) => void;
    onMarkMessagesAsRead?: () => void;
    onSaveProfile?: (data: Partial<Agent>) => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24zM6.591 17.419c.404.652.812 1.272 1.242 1.85 1.58 2.116 3.663 3.22 5.953 3.218 5.55-.006 10.038-4.488 10.043-10.038.005-5.55-4.488-10.038-10.038-10.043-5.55.005-10.038 4.488-10.043 10.038.002 2.13.642 4.148 1.822 5.898l-1.03 3.766 3.844-1.025z" />
    </svg>
);

const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ agent, onLogout, t, isAdminView = false, onStopImpersonating, messages = [], onSendMessage, onMarkMessagesAsRead, onSaveProfile }) => {
    const [activeTab, setActiveTab] = useState<'clients' | 'renewals' | 'earnings' | 'messages' | 'profile'>('clients');
    const [clients, setClients] = useState<(Therapist | Place)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    
    // Profile state
    const [bankName, setBankName] = useState(agent.bankName || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(agent.bankAccountNumber || '');
    const [bankAccountName, setBankAccountName] = useState(agent.bankAccountName || '');
    const [idCardImage, setIdCardImage] = useState(agent.idCardImage || '');
    const [contactNumber, setContactNumber] = useState(agent.contactNumber || '');
    const [homeAddress, setHomeAddress] = useState(agent.homeAddress || '');


    useEffect(() => {
        const fetchClients = async () => {
            // Mock implementation - replace with your actual data fetching logic
            setIsLoading(true);
            
            // Mock data - replace with actual API calls
            const mockClients: any[] = [];
            setClients(mockClients);
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
    
    const unreadMessagesCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages]);

    const handleTabClick = (tab: 'clients' | 'renewals' | 'earnings' | 'messages' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'messages' && !isAdminView && unreadMessagesCount > 0) {
            onMarkMessagesAsRead?.();
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && onSendMessage) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleProfileSave = () => {
        if (!onSaveProfile) return;
        onSaveProfile({
            bankName,
            bankAccountNumber,
            bankAccountName,
            idCardImage,
            contactNumber,
            homeAddress
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const currentCommission = agent.tier === 'Toptier' ? 23 : 20;

    const ClientCard: React.FC<{ client: Therapist | Place }> = ({ client }) => (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800">{client.name}</h4>
            <p className="text-sm text-gray-600">{client.email}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{t.clients.membershipExpires.replace('{date}', formatDate(client.activeMembershipDate))}</p>
        </div>
    );
    
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
            {isAdminView && (
                <div className="bg-yellow-200 text-yellow-900 text-center p-3 rounded-lg mb-4 shadow">
                    <p className="font-bold text-sm">{t.messages.impersonationBanner.replace('{agentName}', agent.name)}</p>
                    <button onClick={onStopImpersonating} className="text-sm font-semibold underline hover:text-yellow-800 mt-1">{t.messages.returnToAdmin}</button>
                </div>
            )}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                    <p className="text-sm text-gray-600 flex items-center">
                        Welcome, {agent.name}!
                        <span className={`ml-2 font-bold px-2 py-0.5 rounded-full text-xs ${agent.tier === 'Toptier' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                            {agent.tier === 'Toptier' ? t.earnings.toptierTier : t.earnings.standardTier}
                        </span>
                    </p>
                </div>
                {!isAdminView && <Button onClick={onLogout} variant="secondary" className="w-auto px-4 py-2 text-sm">{t.logout}</Button>}
            </header>
            
            <div className="mb-6">
                <p className="text-sm text-center bg-blue-100 text-blue-800 p-3 rounded-lg">
                    <strong>Your Agent Code:</strong> <span className="font-mono bg-blue-200 px-2 py-1 rounded">{agent.agentCode}</span>
                </p>
            </div>

            <div className="flex bg-gray-200 rounded-full p-1 mb-6 text-center">
                <button onClick={() => handleTabClick('clients')} className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${activeTab === 'clients' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.clients}
                </button>
                <button onClick={() => handleTabClick('renewals')} className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 relative ${activeTab === 'renewals' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.renewals}
                    {renewalsDue.length > 0 && <span className="absolute top-0 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                <button onClick={() => handleTabClick('earnings')} className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${activeTab === 'earnings' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.earnings}
                </button>
                 <button onClick={() => handleTabClick('messages')} className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 relative ${activeTab === 'messages' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.messages}
                    {!isAdminView && unreadMessagesCount > 0 && <span className="absolute top-0 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>}
                </button>
                <button onClick={() => handleTabClick('profile')} className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-300 ${activeTab === 'profile' ? 'bg-brand-green text-white shadow' : 'text-gray-600'}`}>
                    {t.tabs.profile}
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
                        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                            <h2 className="text-xl font-semibold text-gray-700">{t.earnings.title}</h2>
                            <div className="text-center bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">{t.earnings.totalSignups}</p>
                                <p className="text-4xl font-bold text-brand-green">{clients.length}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{t.earnings.commissionInfo}</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                                    <li><strong>{currentCommission}%</strong> for all new sign-ups {agent.tier === 'Toptier' && <span className="font-semibold">(20% base + 3% bonus)</span>}.</li>
                                    <li>{t.earnings.commissionRecurring}</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                                <h4 className="font-bold text-green-800">{t.earnings.toptierInfoTitle}</h4>
                                <p className="text-sm text-green-700 mt-1">{t.earnings.toptierInfoContent}</p>
                            </div>
                            <p className="text-xs text-gray-500 text-center pt-4 border-t">{t.earnings.note}</p>
                        </div>
                    )}
                    {activeTab === 'messages' && (
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t.messages.adminMessageTitle}</h2>
                             {!isAdminView && unreadMessagesCount > 0 && <p className="text-sm font-semibold text-red-600 mb-4">{t.messages.unreadMessages}</p>}
                            <div className="space-y-3 h-64 overflow-y-auto mb-4 border rounded-lg p-3 bg-gray-50">
                                {messages.length > 0 ? messages.map(msg => (
                                    <div key={msg.id} className="bg-blue-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-800">{msg.message}</p>
                                        <p className="text-xs text-gray-500 text-right mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                                    </div>
                                )) : <p className="text-sm text-gray-500 text-center py-8">{t.messages.noMessages}</p>}
                            </div>
                            {isAdminView && (
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder={t.messages.adminChatPlaceholder}
                                        className="flex-grow w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage} className="w-auto px-4">{t.messages.sendButton}</Button>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'profile' && !isAdminView && (
                         <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700">{t.profile.title}</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.profile.bankName}</label>
                                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t.profile.accountNumber}</label>
                                <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.profile.accountName}</label>
                                <input type="text" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t.profile.contactNumber}</label>
                                <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.profile.homeAddress}</label>
                                <textarea value={homeAddress} onChange={e => setHomeAddress(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <ImageUpload
                                id="id-card-upload"
                                label={t.profile.idCard}
                                currentImage={idCardImage}
                                onImageChange={setIdCardImage}
                            />
                            <Button onClick={handleProfileSave}>{t.profile.saveButton}</Button>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgentDashboardPage;