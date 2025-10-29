import React, { useState, useEffect, useMemo } from 'react';
import type { Agent, Therapist, Place, AdminMessage, AgentVisit } from '../types';
import { Users, RefreshCw, DollarSign, MessageSquare, User as UserIcon, LogOut, Code, TrendingUp, MapPin, Calendar, CheckCircle } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import TabButton from '../components/dashboard/TabButton';
import { agentVisitService } from '../lib/appwriteService';

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

const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ agent, onLogout, t: _t, isAdminView = false, onStopImpersonating, messages = [], onSendMessage, onMarkMessagesAsRead, onSaveProfile }) => {
    const [activeTab, setActiveTab] = useState<'visits' | 'clients' | 'renewals' | 'earnings' | 'messages' | 'profile'>('visits');
    const [clients, setClients] = useState<(Therapist | Place)[]>([]);
    const [visits, setVisits] = useState<AgentVisit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    
    // Visit Form State
    const [providerName, setProviderName] = useState('');
    const [providerType, setProviderType] = useState<'therapist' | 'place'>('therapist');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string; timestamp: string } | null>(null);
    const [isCapturingLocation, setIsCapturingLocation] = useState(false);
    const [meetingNotes, setMeetingNotes] = useState('');
    const [callbackDate, setCallbackDate] = useState('');
    const [membershipAgreed, setMembershipAgreed] = useState<'none' | '1month' | '3month' | '6month' | '1year'>('none');
    
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
            // TODO: Fetch from Appwrite
            const mockClients: any[] = [];
            setClients(mockClients);
            setIsLoading(false);
        };
        fetchClients();
    }, [agent.id]);

    useEffect(() => {
        const fetchVisits = async () => {
            setIsLoading(true);
            try {
                const agentId = agent.$id || agent.id.toString();
                const fetchedVisits = await agentVisitService.getVisitsByAgent(agentId);
                setVisits(fetchedVisits);
            } catch (error) {
                console.error('Error fetching visits:', error);
                setVisits([]);
            }
            setIsLoading(false);
        };
        fetchVisits();
    }, [agent.id, agent.$id]);

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

    const handleTabClick = (tab: 'visits' | 'clients' | 'renewals' | 'earnings' | 'messages' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'messages' && !isAdminView && unreadMessagesCount > 0) {
            onMarkMessagesAsRead?.();
        }
    };

    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsCapturingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Reverse geocode to get address
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    
                    setLocation({
                        lat,
                        lng,
                        address,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    setLocation({
                        lat,
                        lng,
                        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        timestamp: new Date().toISOString()
                    });
                }
                setIsCapturingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please enable location services.');
                setIsCapturingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmitVisit = async () => {
        if (!providerName || !whatsappNumber || !location || !meetingNotes) {
            alert('Please fill in all required fields and set your location');
            return;
        }

        const newVisit: AgentVisit = {
            agentId: agent.$id || agent.id.toString(),
            agentName: agent.name,
            agentCode: agent.agentCode,
            providerName,
            providerType,
            whatsappNumber,
            visitDate: new Date().toISOString(),
            location,
            meetingNotes,
            callbackDate: callbackDate || undefined,
            membershipAgreed,
            status: membershipAgreed !== 'none' ? 'completed' : 'followup_required',
            createdAt: new Date().toISOString()
        };

        try {
            const createdVisit = await agentVisitService.createVisit(newVisit);
            console.log('✅ Visit created:', createdVisit);
            setVisits(prev => [createdVisit, ...prev]);
            
            // Reset form
            setProviderName('');
            setWhatsappNumber('');
            setLocation(null);
            setMeetingNotes('');
            setCallbackDate('');
            setMembershipAgreed('none');
            
            alert('Visit recorded successfully!');
        } catch (error) {
            console.error('Error creating visit:', error);
            alert('Failed to record visit. Please try again.');
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const currentCommission = agent.tier === 'Toptier' ? 23 : 20;

    const ClientCard: React.FC<{ client: Therapist | Place }> = ({ client }) => (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
            <h4 className="font-bold text-gray-800 text-lg">{client.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{client.email}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Membership expires: {formatDate(client.activeMembershipDate)}</p>
        </div>
    );
    
    const RenewalCard: React.FC<{ client: Therapist | Place }> = ({ client }) => {
        const handleWhatsAppClick = () => {
            const audio = new Audio('/sounds/success-notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Sound play failed:', err));
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
                    <span>Contact</span>
                </button>
            </div>
        );
    };

    const VisitCard: React.FC<{ visit: AgentVisit }> = ({ visit }) => (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">{visit.providerName}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{visit.providerType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    visit.membershipAgreed !== 'none' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {visit.membershipAgreed !== 'none' ? visit.membershipAgreed : 'Pending'}
                </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{visit.location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>{formatDateTime(visit.visitDate)}</span>
                </div>
                {visit.callbackDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-600">Callback: {formatDate(visit.callbackDate)}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-3">{visit.meetingNotes}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Same as Hotel Dashboard */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-base sm:text-2xl font-bold">
                        <span className="text-gray-900">Inda</span>
                        <span className="text-orange-500">Street</span>
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
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-20">
                {/* Admin Impersonation Banner */}
                {isAdminView && (
                    <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6">
                        <p className="font-bold text-sm text-yellow-900">Viewing as {agent.name}</p>
                        <button onClick={onStopImpersonating} className="text-sm font-semibold underline hover:text-yellow-800 mt-1">Return to Admin</button>
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
                                    {agent.tier === 'Toptier' ? 'Top Tier' : 'Standard'}
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
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 inline-block">
                            <span className="font-mono text-xl font-bold text-orange-600">{agent.agentCode}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation - Same as Hotel Dashboard */}
                <nav className="bg-white border-2 border-gray-200 rounded-xl mb-6 p-2">
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                        <TabButton
                            icon={<MapPin />}
                            label="Visits"
                            isActive={activeTab === 'visits'}
                            onClick={() => handleTabClick('visits')}
                            badge={visits.filter(v => v.status === 'followup_required').length || undefined}
                        />
                        <TabButton
                            icon={<Users />}
                            label="Clients"
                            isActive={activeTab === 'clients'}
                            onClick={() => handleTabClick('clients')}
                        />
                        <TabButton
                            icon={<RefreshCw />}
                            label="Renewals"
                            isActive={activeTab === 'renewals'}
                            onClick={() => handleTabClick('renewals')}
                            badge={renewalsDue.length > 0 ? renewalsDue.length : undefined}
                        />
                        <TabButton
                            icon={<DollarSign />}
                            label="Earnings"
                            isActive={activeTab === 'earnings'}
                            onClick={() => handleTabClick('earnings')}
                        />
                        <TabButton
                            icon={<MessageSquare />}
                            label="Messages"
                            isActive={activeTab === 'messages'}
                            onClick={() => handleTabClick('messages')}
                            badge={!isAdminView && unreadMessagesCount > 0 ? unreadMessagesCount : undefined}
                        />
                        <TabButton
                            icon={<UserIcon />}
                            label="Profile"
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
                        {/* VISITS TAB - NEW */}
                        {activeTab === 'visits' && (
                            <div className="space-y-6">
                                {/* Visit Recording Form */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Record New Visit</h2>
                                            <p className="text-xs text-gray-500">Track your meetings with therapists and massage places</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Provider Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type *</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        value="therapist" 
                                                        checked={providerType === 'therapist'}
                                                        onChange={(e) => setProviderType(e.target.value as 'therapist')}
                                                        className="mr-2"
                                                    />
                                                    <span>Therapist</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        value="place" 
                                                        checked={providerType === 'place'}
                                                        onChange={(e) => setProviderType(e.target.value as 'place')}
                                                        className="mr-2"
                                                    />
                                                    <span>Massage Place</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Provider Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {providerType === 'therapist' ? 'Therapist' : 'Massage Place'} Name *
                                            </label>
                                            <input 
                                                type="text"
                                                value={providerName}
                                                onChange={(e) => setProviderName(e.target.value)}
                                                placeholder={`Enter ${providerType} name`}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {/* WhatsApp Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
                                            <input 
                                                type="tel"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                placeholder="e.g., 628123456789"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {/* Location Capture */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                            {location ? (
                                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-green-800 mb-1">Location Verified</p>
                                                            <p className="text-xs text-gray-700">{location.address}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Captured: {new Date(location.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setLocation(null)}
                                                            className="text-xs text-red-600 hover:text-red-800 underline"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleCaptureLocation}
                                                    disabled={isCapturingLocation}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <MapPin className="w-5 h-5" />
                                                    {isCapturingLocation ? 'Capturing Location...' : 'Set My Current Location'}
                                                </button>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                📍 Location verification ensures you are physically present at the meeting
                                            </p>
                                        </div>

                                        {/* Meeting Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Notes *</label>
                                            <textarea
                                                value={meetingNotes}
                                                onChange={(e) => setMeetingNotes(e.target.value)}
                                                placeholder="Describe the meeting, discussion points, and outcomes..."
                                                rows={4}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {/* Callback Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Callback Date (Optional)</label>
                                            <input 
                                                type="date"
                                                value={callbackDate}
                                                onChange={(e) => setCallbackDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>

                                        {/* Membership Agreement */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Agreement</label>
                                            <select
                                                value={membershipAgreed}
                                                onChange={(e) => setMembershipAgreed(e.target.value as any)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="none">Not Yet Agreed</option>
                                                <option value="1month">1 Month</option>
                                                <option value="3month">3 Months</option>
                                                <option value="6month">6 Months</option>
                                                <option value="1year">1 Year</option>
                                            </select>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleSubmitVisit}
                                            disabled={!providerName || !whatsappNumber || !location || !meetingNotes}
                                            className="w-full px-6 py-4 bg-orange-500 text-white font-bold text-lg rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            Record Visit
                                        </button>
                                    </div>
                                </div>

                                {/* Visit History */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Visit History</h2>
                                            <p className="text-xs text-gray-500">{visits.length} total visits</p>
                                        </div>
                                    </div>

                                    {visits.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {visits.map((visit, index) => (
                                                <VisitCard key={visit.$id || index} visit={visit} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">No visits recorded yet</p>
                                            <p className="text-xs text-gray-400 mt-2">Record your first visit above</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CLIENTS TAB */}
                        {activeTab === 'clients' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Therapists</h2>
                                        <p className="text-xs text-gray-500">Manage therapist clients</p>
                                    </div>
                                </div>
                                {clients.filter(c => 'status' in c).length > 0 ? (
                                    <div className="grid gap-4">
                                        {clients.filter(c => 'status' in c).map(c => <ClientCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">No therapist clients yet</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 mt-8">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Massage Places</h2>
                                        <p className="text-xs text-gray-500">Manage massage place clients</p>
                                    </div>
                                </div>
                                {clients.filter(c => 'openingTime' in c).length > 0 ? (
                                    <div className="grid gap-4">
                                        {clients.filter(c => 'openingTime' in c).map(c => <ClientCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">No massage place clients yet</p>
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
                                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Renewals</h2>
                                        <p className="text-xs text-gray-500">Clients with memberships expiring soon</p>
                                    </div>
                                </div>
                                {renewalsDue.length > 0 ? (
                                    <div className="grid gap-4">
                                        {renewalsDue.map(c => <RenewalCard key={c.id} client={c} />)}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                                        <p className="text-gray-500">No upcoming renewals</p>
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
                                        <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                                        <p className="text-xs text-gray-500">Commission breakdown and earnings</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
                                    {/* Total Signups */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                                        <p className="text-gray-600 text-sm mb-2">Total Signups</p>
                                        <p className="text-5xl font-bold text-orange-600">{clients.length}</p>
                                    </div>
                                    
                                    {/* Commission Info */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg mb-3">Commission Structure</h4>
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
                                                <span className="text-gray-700">10% recurring commission on renewals</span>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    {/* Toptier Info */}
                                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                                        <h4 className="font-bold text-green-800 flex items-center gap-2">
                                            <span className="text-xl">🏆</span>
                                            Top Tier Agent Benefits
                                        </h4>
                                        <p className="text-sm text-green-700 mt-2">Achieve monthly targets to unlock 3% bonus commission on all sales!</p>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 text-center pt-4 border-t">Commissions are calculated and paid monthly</p>
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
                                        <h2 className="text-2xl font-bold text-gray-900">Admin Messages</h2>
                                        <p className="text-xs text-gray-500">Communication with admin</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    {!isAdminView && unreadMessagesCount > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                            <p className="text-sm font-semibold text-red-600">{unreadMessagesCount} unread message{unreadMessagesCount > 1 ? 's' : ''}</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3 h-96 overflow-y-auto mb-4 border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                        {messages.length > 0 ? messages.map(msg => (
                                            <div key={msg.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-800">{msg.message}</p>
                                                <p className="text-xs text-gray-500 text-right mt-2">{new Date(msg.createdAt || '').toLocaleString()}</p>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-gray-500">No messages</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isAdminView && (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder="Type message to agent..."
                                                className="flex-grow px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                            >
                                                Send
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
                                        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                                        <p className="text-xs text-gray-500">Update your account information</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                                        <input 
                                            type="text" 
                                            value={bankName} 
                                            onChange={e => setBankName(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                        <input 
                                            type="text" 
                                            value={bankAccountNumber} 
                                            onChange={e => setBankAccountNumber(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                                        <input 
                                            type="text" 
                                            value={bankAccountName} 
                                            onChange={e => setBankAccountName(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                        <input 
                                            type="tel" 
                                            value={contactNumber} 
                                            onChange={e => setContactNumber(e.target.value)} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Home Address</label>
                                        <textarea 
                                            value={homeAddress} 
                                            onChange={e => setHomeAddress(e.target.value)} 
                                            rows={3} 
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                                        />
                                    </div>
                                    <ImageUpload
                                        id="id-card-upload"
                                        label="ID Card Image"
                                        currentImage={idCardImage}
                                        onImageChange={setIdCardImage}
                                    />
                                    <button 
                                        onClick={handleProfileSave}
                                        className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all"
                                    >
                                        Save Profile
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
