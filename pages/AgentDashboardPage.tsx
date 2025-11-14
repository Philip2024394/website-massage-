import React, { useState, useEffect, useMemo } from 'react';
import type { Agent, Therapist, Place, AdminMessage } from '../types';
import { Users, RefreshCw, DollarSign, MessageSquare, User as UserIcon, LogOut, Code, TrendingUp } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import TabButton from '../components/dashboard/TabButton';

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
            setIsLoading(true);
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
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
            <h4 className="font-bold text-gray-800 text-lg">{client.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{client.email}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{t.clients.membershipExpires.replace('{date}', formatDate(client.activeMembershipDate))}</p>
        </div>
    );
    
    const RenewalCard: React.FC<{ client: Therapist | Place }> = ({ client }) => {
        const handleWhatsAppClick = () => {
            // Play click sound
            const audio = new Audio('/sounds/success-notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Sound play failed:', err));
            
            // Open WhatsApp
            window.open(`https://wa.me/${client.whatsappNumber}`, '_blank');
        };
        
        return (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">{client.name}</h4>
                    <p className="text-sm text-red-600 font-semibold mt-1">Expires: {formatDate(client.activeMembershipDate)}</p>
                </div>
                <button onClick={handleWhatsAppClick} className="flex items-center gap-2 bg-green-500 text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors">
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>{t.renewals.contact}</span>
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-base sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🤝</span>
                        <span className="text-gray-900">Agent Dashboard</span>
                    </h1>
                    {!isAdminView && (
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
                {/* Admin Impersonation Banner */}
                {isAdminView && (
                    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 pb-20 mb-6">
                        <p className="font-bold text-sm text-yellow-900">{t.messages.impersonationBanner.replace('{agentName}', agent.name)}</p>
                        <button onClick={onStopImpersonating} className="text-sm font-semibold underline hover:text-yellow-800 mt-1">{t.messages.returnToAdmin}</button>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="space-y-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Welcome, {agent.name}!</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">Agent Dashboard</p>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${agent.tier === 'Toptier' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                    {agent.tier === 'Toptier' ? t.earnings.toptierTier : t.earnings.standardTier}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Agent Code Display */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Code className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-bold text-gray-900">Your Agent Code</h3>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 pb-20 inline-block">
                            <span className="font-mono text-xl font-bold text-orange-600">{agent.agentCode}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="bg-white border-2 border-gray-200 rounded-xl mb-6 p-2">
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                        <TabButton
                            icon={<Users />}
                            label={t.tabs.clients}
                            isActive={activeTab === 'clients'}
                            onClick={() => handleTabClick('clients')}
                        />
                        <TabButton
                            icon={<RefreshCw />}
                            label={t.tabs.renewals}
                            isActive={activeTab === 'renewals'}
                            onClick={() => handleTabClick('renewals')}
                            badge={renewalsDue.length > 0 ? renewalsDue.length : undefined}
                        />
                        <TabButton
                            icon={<DollarSign />}
                            label={t.tabs.earnings}
                            isActive={activeTab === 'earnings'}
                            onClick={() => handleTabClick('earnings')}
                        />
                        <TabButton
                            icon={<MessageSquare />}
                            label={t.tabs.messages}
                            isActive={activeTab === 'messages'}
                            onClick={() => handleTabClick('messages')}
                            badge={!isAdminView && unreadMessagesCount > 0 ? unreadMessagesCount : undefined}
                        />
                        <TabButton
                            icon={<UserIcon />}
                            label={t.tabs.profile}
                            isActive={activeTab === 'profile'}
                            onClick={() => handleTabClick('profile')}
                        />
                    </div>
                </nav>

                {/* Tab Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div>
                        {/* CLIENTS TAB */}
                        {activeTab === 'clients' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.clients.therapists}</h2>
                                        <p className="text-xs text-gray-500">Manage therapist clients</p>
                                    </div>
                                </div>
                                {clients.filter(c => 'status' in c).length > 0 ? (
                                    <div className="grid gap-4 pb-20">
                                        {clients.filter(c => 'status' in c).map(c => <ClientCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">{t.clients.noClients}</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 mt-8">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.clients.places}</h2>
                                        <p className="text-xs text-gray-500">Manage massage place clients</p>
                                    </div>
                                </div>
                                {clients.filter(c => 'openingTime' in c).length > 0 ? (
                                    <div className="grid gap-4 pb-20">
                                        {clients.filter(c => 'openingTime' in c).map(c => <ClientCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">{t.clients.noClients}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* RENEWALS TAB */}
                        {activeTab === 'renewals' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.renewals.title}</h2>
                                        <p className="text-xs text-gray-500">Clients with upcoming renewals</p>
                                    </div>
                                </div>
                                {renewalsDue.length > 0 ? (
                                    <div className="grid gap-4 pb-20">
                                        {renewalsDue.map(c => <RenewalCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">{t.renewals.noRenewals}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EARNINGS TAB */}
                        {activeTab === 'earnings' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.earnings.title}</h2>
                                        <p className="text-xs text-gray-500">Commission breakdown and earnings</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
                                    {/* Total Signups */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                                        <p className="text-gray-600 text-sm mb-2">{t.earnings.totalSignups}</p>
                                        <p className="text-5xl font-bold text-orange-600">{clients.length}</p>
                                    </div>
                                    
                                    {/* Commission Info */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg mb-3">{t.earnings.commissionInfo}</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700"><strong>{currentCommission}%</strong> for all new sign-ups {agent.tier === 'Toptier' && <span className="font-semibold text-green-600">(20% base + 3% bonus)</span>}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700">{t.earnings.commissionRecurring}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    {/* Toptier Info */}
                                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 pb-20">
                                        <h4 className="font-bold text-green-800 flex items-center gap-2">
                                            <span className="text-xl">🏆</span>
                                            {t.earnings.toptierInfoTitle}
                                        </h4>
                                        <p className="text-sm text-green-700 mt-2">{t.earnings.toptierInfoContent}</p>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 text-center pt-4 border-t">{t.earnings.note}</p>
                                </div>
                            </div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.messages.adminMessageTitle}</h2>
                                        <p className="text-xs text-gray-500">Communication with admin</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    {!isAdminView && unreadMessagesCount > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                            <p className="text-sm font-semibold text-red-600">{t.messages.unreadMessages}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3 h-96 overflow-y-auto mb-4 border-2 border-gray-200 rounded-lg p-4 pb-20 bg-gray-50">
                                        {messages.length > 0 ? messages.map(msg => (
                                            <div key={msg.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-800">{msg.message}</p>
                                                <p className="text-xs text-gray-500 text-right mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">{t.messages.noMessages}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isAdminView && (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder={t.messages.adminChatPlaceholder}
                                                className="flex-grow px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                            >
                                                {t.messages.sendButton}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && !isAdminView && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{t.profile.title}</h2>
                                        <p className="text-xs text-gray-500">Update your account information</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">{t.profile.bankName}</label>
                                        <input 
                                            type="text" 
                                            value={bankName} 
                                            onChange={e => setBankName(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">{t.profile.accountNumber}</label>
                                        <input 
                                            type="text" 
                                            value={bankAccountNumber} 
                                            onChange={e => setBankAccountNumber(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">{t.profile.accountName}</label>
                                        <input 
                                            type="text" 
                                            value={bankAccountName} 
                                            onChange={e => setBankAccountName(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">{t.profile.contactNumber}</label>
                                        <input 
                                            type="tel" 
                                            value={contactNumber} 
                                            onChange={e => setContactNumber(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">{t.profile.homeAddress}</label>
                                        <textarea 
                                            value={homeAddress} 
                                            onChange={e => setHomeAddress(e.target.value)} 
                                            rows={3} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <ImageUpload
                                        id="id-card-upload"
                                        label={t.profile.idCard}
                                        currentImage={idCardImage}
                                        onImageChange={setIdCardImage}
                                    />
                                    <button 
                                        onClick={handleProfileSave}
                                        className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                    >
                                        {t.profile.saveButton}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboardPage;

