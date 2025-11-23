import React from 'react';

// Deprecated: Agent dashboard consolidated into Indastreet Partners.
// This stub remains for legacy imports and will not render.
const AgentDashboardPage: React.FC = () => {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('[Deprecated] AgentDashboardPage is no longer in use. Routes redirect to Indastreet Partners.');
    }
    return null;
};

export default AgentDashboardPage;
            bankAccountNumber,
            bankAccountName,
            idCardImage,
            contactNumber,
            homeAddress,
            // Persist compliance agreements as optional flags
            agreedTaxResponsibility,
            agreedUniformRequirement,
            agreedTransportation,
            agreedNoCriminalRecord,
            agreedIdPresentation
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Commission calculation logic placeholder
    // Base: 20% new signups. If agent.tier === 'Toptier' show 23% (20% + 3% bonus)
    // Recurring 10% only if monthly target (20 signups) met; streak of 3 months upgrades tier.
    // Commission & metrics derived from backend monthly metrics snapshot
    const latestMetrics = metrics[0];
    const monthlySignups = latestMetrics ? latestMetrics.newSignUpsCount : clients.length; // fallback
    const targetMet = latestMetrics ? latestMetrics.targetMet : monthlySignups >= 20;
    const recurringEligible = targetMet;
    const currentCommission = agentDoc.tier === 'Toptier' ? 23 : 20;
    const commissionRecurringRate = recurringEligible ? 10 : 0;
    // Fetch agent latest doc (refresh agreements / tier) and metrics when relevant tabs selected
    useEffect(() => {
        const fetchAgentAndMetrics = async () => {
            if (activeTab !== 'stats' && activeTab !== 'earnings') return;
            try {
                setMetricsLoading(true);
                setErrorMsg(null);
                // Refresh agent doc by code if available
                const refreshed = await agentService.getByCode(agentDoc.agentCode);
                if (refreshed) setAgentDoc({ ...agentDoc, ...refreshed });
                const metricList = await monthlyAgentMetricsService.listByAgent(agentDoc.$id || agentDoc.agentId, 6);
                setMetrics(metricList);
            } catch (err: any) {
                setErrorMsg(err?.message || 'Failed to load metrics');
            } finally {
                setMetricsLoading(false);
            }
        };
        fetchAgentAndMetrics();
    }, [activeTab, agentDoc.agentCode, agentDoc.agentId, agentDoc.$id]);

    // Fetch attribution + commission overview for earnings & stats tabs (lightweight)
    useEffect(() => {
        const fetchOverview = async () => {
            if (activeTab !== 'earnings' && activeTab !== 'stats') return;
            try {
                setOverviewLoading(true);
                const agentId = agentDoc.$id || agentDoc.agentId;
                const [therapistCount, placeCount, latestSnapshot] = await Promise.all([
                    adminAgentOverviewService.countTherapistsByAgentCode(agentDoc.agentCode),
                    adminAgentOverviewService.countPlacesByAgentCode(agentDoc.agentCode),
                    adminAgentOverviewService.getLatestMonthlySnapshot(agentId)
                ]);
                setAttributionCounts({ therapists: therapistCount, places: placeCount });
                setCommissionDue(adminAgentOverviewService.calculateCommissionDue(latestSnapshot));
            } catch (e) {
                console.error('Agent overview fetch error:', e);
            } finally {
                setOverviewLoading(false);
            }
        };
        fetchOverview();
    }, [activeTab, agentDoc.agentCode, agentDoc.agentId, agentDoc.$id]);

    // Fetch visits when visits tab opened
    useEffect(() => {
        const fetchVisits = async () => {
            if (activeTab !== 'visits') return;
            try {
                setVisitsLoading(true);
                setErrorMsg(null);
                const list = await agentVisitService.getVisitsByAgent(agentDoc.$id || agentDoc.agentId);
                setRemoteVisits(list);
            } catch (err: any) {
                setErrorMsg(err?.message || 'Failed to load visits');
            } finally {
                setVisitsLoading(false);
            }
        };
        fetchVisits();
    }, [activeTab, agentDoc.agentId, agentDoc.$id]);

    // Fetch recruits when shares tab opened
    useEffect(() => {
        const loadRecruits = async () => {
            if (activeTab !== 'shares') return;
            try {
                const [ths, pls] = await Promise.all([
                    recruitLookupService.therapistsByAgentCode(agentDoc.agentCode),
                    recruitLookupService.placesByAgentCode(agentDoc.agentCode)
                ]);
                setRecruitedTherapists(ths);
                setRecruitedPlaces(pls);
                // Load counts per recruit
                const counts: any = {};
                const tasks: Array<Promise<void>> = [];
                const addTask = (ptype: 'therapist' | 'place', doc: any) => {
                    const pid = (doc.id ?? doc.$id ?? '').toString();
                    tasks.push(
                        agentShareAnalyticsService.getCountsByPlatform({
                            agentCode: agentDoc.agentCode,
                            providerType: ptype,
                            providerId: pid
                        }).then(c => { counts[`${ptype}-${pid}`] = c; })
                    );
                };
                ths.forEach(d => addTask('therapist', d));
                pls.forEach(d => addTask('place', d));
                await Promise.all(tasks);
                setShareCounts(counts);
            } catch (e) {
                console.warn('Failed to load recruits', e);
                setRecruitedTherapists([]);
                setRecruitedPlaces([]);
            }
        };
        loadRecruits();
    }, [activeTab, agentDoc.agentCode]);

    // Agreement checkboxes state (profile compliance)
    const [agreedTaxResponsibility, setAgreedTaxResponsibility] = useState(false);
    const [agreedUniformRequirement, setAgreedUniformRequirement] = useState(false);
    const [agreedTransportation, setAgreedTransportation] = useState(false);
    const [agreedNoCriminalRecord, setAgreedNoCriminalRecord] = useState(false);
    const [agreedIdPresentation, setAgreedIdPresentation] = useState(false);


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
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-base sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                            <span className="text-gray-900">Agent Dashboard</span>
                        </h1>
                    </div>
                    {/* Burger on the right */}
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        aria-label="Open menu"
                        onClick={() => setIsSideDrawerOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-gray-800" />
                    </button>
                </div>
            </header>

            {/* Main Container (scrolls between header and footer) */}
            <main className="flex-1 overflow-y-auto pt-4 sm:pt-6 mb-[var(--footer-height,64px)]">
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
                {/* Side Drawer */}
                {isSideDrawerOpen && (
                    <div className="fixed inset-0 z-[1000]">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsSideDrawerOpen(false)}
                        />
                        {/* Drawer (moved to right side) */}
                        <div className={`absolute right-0 top-0 bottom-0 w-[78%] sm:w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col transform transition-transform duration-300 ${isSideDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            {/* Drawer Header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                                        <p className="text-xs text-gray-500">Agent</p>
                                    </div>
                                </div>
                                <button
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                    aria-label="Close menu"
                                    onClick={() => setIsSideDrawerOpen(false)}
                                >
                                    <X className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Drawer Menu - styled like Home AppDrawer */}
                            <nav className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-6">
                                    {/* Agent Workspace */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Agent Workspace</h3>
                                        <div className="space-y-2">
                                            <button onClick={() => handleTabClick('clients')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-teal-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{t?.tabs?.clients || 'Clients'}</p>
                                                    <p className="text-xs text-gray-500">Therapists & places</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('renewals')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-orange-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg"><RefreshCw className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{t?.tabs?.renewals || 'Renewals'}</p>
                                                    <p className="text-xs text-gray-500">Upcoming expiries</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('earnings')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-green-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg"><Banknote className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{t?.tabs?.earnings || 'Earnings'}</p>
                                                    <p className="text-xs text-gray-500">Commission & payouts</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('messages')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-sky-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg"><MessageSquare className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{t?.tabs?.messages || 'Messages'}</p>
                                                    <p className="text-xs text-gray-500">Admin communications</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('visits')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"><ClipboardList className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">{t?.tabs?.visits || 'Visits'}</p>
                                                    <p className="text-xs text-gray-500">Log recruitment visits</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('stats')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-indigo-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{t?.tabs?.stats || 'Stats'}</p>
                                                    <p className="text-xs text-gray-500">Performance metrics</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Account</h3>
                                        <div className="space-y-2">
                                            <button onClick={() => handleTabClick('profile')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-gray-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg"><UserIcon className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">{t?.tabs?.profile || 'Profile'}</p>
                                                    <p className="text-xs text-gray-500">Personal & contact info</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('bank')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-emerald-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg"><Banknote className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">Bank Details</p>
                                                    <p className="text-xs text-gray-500">Payout destination</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('agreements')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-yellow-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg"><ShieldCheck className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">Agreements & Compliance</p>
                                                    <p className="text-xs text-gray-500">Policies & confirmations</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('settings')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-slate-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg"><Settings className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-slate-600 transition-colors">Settings</p>
                                                    <p className="text-xs text-gray-500">Preferences</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Growth */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Growth</h3>
                                        <div className="space-y-2">
                                            <button onClick={() => handleTabClick('marketing')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-pink-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg"><Megaphone className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">Marketing Toolkit</p>
                                                    <p className="text-xs text-gray-500">Assets & referrals</p>
                                                </div>
                                            </button>
                                            <button onClick={() => handleTabClick('help')} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border-l-4 border-cyan-500 group transform hover:scale-105">
                                                <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg"><HelpCircle className="w-5 h-5 text-white" /></div>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">Help & Support</p>
                                                    <p className="text-xs text-gray-500">FAQs & contact</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            {/* Drawer Footer */}
                            <div className="p-3 border-t border-gray-100">
                                {!isAdminView && (
                                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-black">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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

                {/* Tab Navigation (kept for quick access) */}
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
                            icon={<Banknote />}
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
                        <TabButton
                            icon={<ClipboardList />}
                            label={t?.tabs?.visits || 'Visits'}
                            isActive={activeTab === 'visits'}
                            onClick={() => handleTabClick('visits')}
                            badge={visits.length > 0 ? visits.length : undefined}
                        />
                        <TabButton
                            icon={<BarChart3 />}
                            label={t?.tabs?.stats || 'Stats'}
                            isActive={activeTab === 'stats'}
                            onClick={() => handleTabClick('stats')}
                        />
                        <TabButton
                            icon={<Banknote />}
                            label={'Bank'}
                            isActive={activeTab === 'bank'}
                            onClick={() => handleTabClick('bank')}
                        />
                        <TabButton
                            icon={<ShieldCheck />}
                            label={'Agreements'}
                            isActive={activeTab === 'agreements'}
                            onClick={() => handleTabClick('agreements')}
                        />
                        <TabButton
                            icon={<Megaphone />}
                            label={'Marketing'}
                            isActive={activeTab === 'marketing'}
                            onClick={() => handleTabClick('marketing')}
                        />
                        <TabButton
                            icon={<Share2 />}
                            label={'Recruits & Shares'}
                            isActive={activeTab === 'shares'}
                            onClick={() => handleTabClick('shares')}
                        />
                        <TabButton
                            icon={<HelpCircle />}
                            label={'Help'}
                            isActive={activeTab === 'help'}
                            onClick={() => handleTabClick('help')}
                        />
                        <TabButton
                            icon={<Settings />}
                            label={'Settings'}
                            isActive={activeTab === 'settings'}
                            onClick={() => handleTabClick('settings')}
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

                        {/* SHARES TAB */}
                        {activeTab === 'shares' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Share2 className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Recruits & Share Links</h2>
                                        <p className="text-xs text-gray-500">Share profiles with your agent code and see clicks</p>
                                    </div>
                                </div>

                                {/* Help text */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                                    <p className="text-sm text-gray-700">Share therapist and massage place profiles you've recruited. Each link includes your agent code. When people open the link, we count the click by platform.</p>
                                </div>

                                {/* Therapists */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">Therapists <span className="text-xs font-semibold text-gray-500">({recruitedTherapists.length})</span></h3>
                                    {recruitedTherapists.length === 0 ? (
                                        <p className="text-sm text-gray-500">No recruited therapists found.</p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {recruitedTherapists.map((th: any) => {
                                                const pid = (th.id ?? th.$id ?? '').toString();
                                                const key = `therapist-${pid}`;
                                                const counts = shareCounts[key] || { whatsapp: 0, facebook: 0, twitter: 0, linkedin: 0, telegram: 0, copy: 0 };
                                                const base = window.location.origin;
                                                const build = (platform: string) => `${base}/?provider=therapist-${encodeURIComponent(pid)}&agent=${encodeURIComponent(agentDoc.agentCode)}&platform=${encodeURIComponent(platform)}`;
                                                const share = async (platform: 'whatsapp'|'facebook'|'twitter'|'linkedin'|'telegram'|'copy') => {
                                                    const url = build(platform);
                                                    await agentShareAnalyticsService.trackShareInitiated({ agentCode: agentDoc.agentCode, providerType: 'therapist', providerId: pid, platform });
                                                    if (platform === 'copy') {
                                                        await navigator.clipboard.writeText(url);
                                                        alert('Link copied');
                                                    } else {
                                                        const encUrl = encodeURIComponent(url);
                                                        const text = encodeURIComponent(`Check this therapist profile on IndaStreet`);
                                                        const maps: Record<'whatsapp'|'facebook'|'twitter'|'linkedin'|'telegram'|'copy', string> = {
                                                            whatsapp: `https://wa.me/?text=${text}%20${encUrl}`,
                                                            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
                                                            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encUrl}`,
                                                            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
                                                            telegram: `https://t.me/share/url?url=${encUrl}&text=${text}`,
                                                            copy: ''
                                                        };
                                                        window.open(maps[platform], '_blank', 'noopener,noreferrer');
                                                    }
                                                };
                                                return (
                                                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{th.name || 'Therapist'}</p>
                                                                <p className="text-xs text-gray-500">ID: {pid}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => share('whatsapp')} className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded-md">WhatsApp ({counts.whatsapp})</button>
                                                                <button onClick={() => share('facebook')} className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md">Facebook ({counts.facebook})</button>
                                                                <button onClick={() => share('twitter')} className="px-3 py-2 text-xs bg-sky-50 text-sky-700 rounded-md">X/Twitter ({counts.twitter})</button>
                                                                <button onClick={() => share('linkedin')} className="px-3 py-2 text-xs bg-indigo-50 text-indigo-700 rounded-md">LinkedIn ({counts.linkedin})</button>
                                                                <button onClick={() => share('telegram')} className="px-3 py-2 text-xs bg-cyan-50 text-cyan-700 rounded-md">Telegram ({counts.telegram})</button>
                                                                <button onClick={() => share('copy')} className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md">Copy ({counts.copy})</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Places */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">Massage Places <span className="text-xs font-semibold text-gray-500">({recruitedPlaces.length})</span></h3>
                                    {recruitedPlaces.length === 0 ? (
                                        <p className="text-sm text-gray-500">No recruited places found.</p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {recruitedPlaces.map((pl: any) => {
                                                const pid = (pl.id ?? pl.$id ?? '').toString();
                                                const key = `place-${pid}`;
                                                const counts = shareCounts[key] || { whatsapp: 0, facebook: 0, twitter: 0, linkedin: 0, telegram: 0, copy: 0 };
                                                const base = window.location.origin;
                                                const build = (platform: string) => `${base}/?provider=place-${encodeURIComponent(pid)}&agent=${encodeURIComponent(agentDoc.agentCode)}&platform=${encodeURIComponent(platform)}`;
                                                const share = async (platform: 'whatsapp'|'facebook'|'twitter'|'linkedin'|'telegram'|'copy') => {
                                                    const url = build(platform);
                                                    await agentShareAnalyticsService.trackShareInitiated({ agentCode: agentDoc.agentCode, providerType: 'place', providerId: pid, platform });
                                                    if (platform === 'copy') {
                                                        await navigator.clipboard.writeText(url);
                                                        alert('Link copied');
                                                    } else {
                                                        const encUrl = encodeURIComponent(url);
                                                        const text = encodeURIComponent(`Check this massage place on IndaStreet`);
                                                        const maps: Record<'whatsapp'|'facebook'|'twitter'|'linkedin'|'telegram'|'copy', string> = {
                                                            whatsapp: `https://wa.me/?text=${text}%20${encUrl}`,
                                                            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
                                                            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encUrl}`,
                                                            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
                                                            telegram: `https://t.me/share/url?url=${encUrl}&text=${text}`,
                                                            copy: ''
                                                        };
                                                        window.open(maps[platform], '_blank', 'noopener,noreferrer');
                                                    }
                                                };
                                                return (
                                                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{pl.name || 'Massage Place'}</p>
                                                                <p className="text-xs text-gray-500">ID: {pid}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => share('whatsapp')} className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded-md">WhatsApp ({counts.whatsapp})</button>
                                                                <button onClick={() => share('facebook')} className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md">Facebook ({counts.facebook})</button>
                                                                <button onClick={() => share('twitter')} className="px-3 py-2 text-xs bg-sky-50 text-sky-700 rounded-md">X/Twitter ({counts.twitter})</button>
                                                                <button onClick={() => share('linkedin')} className="px-3 py-2 text-xs bg-indigo-50 text-indigo-700 rounded-md">LinkedIn ({counts.linkedin})</button>
                                                                <button onClick={() => share('telegram')} className="px-3 py-2 text-xs bg-cyan-50 text-cyan-700 rounded-md">Telegram ({counts.telegram})</button>
                                                                <button onClick={() => share('copy')} className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md">Copy ({counts.copy})</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
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
                                        {metricsLoading && <p className="text-xs text-gray-500">Loading metrics...</p>}
                                        {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
                                        {overviewLoading && <p className="text-xs text-gray-500">Loading attribution...</p>}
                                    {/* Total Signups */}
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                                        <p className="text-gray-600 text-sm mb-2">Attributed Signups (All-Time)</p>
                                        <p className="text-5xl font-bold text-orange-600">{attributionCounts.therapists + attributionCounts.places}</p>
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
                                                <span className="text-gray-700">Recurring Membership Commission: <strong>{commissionRecurringRate}%</strong> {recurringEligible ? '(Active)' : '(Inactive - need 20 signups this month)'}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700">Monthly Sign-Ups: <strong>{monthlySignups}</strong> / 20 target</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700">Tier: <strong>{agent.tier || 'Standard'}</strong></span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700">Commission Due (est.): <strong>{idrFormatter.format(commissionDue)}</strong></span>
                                                <span className="text-xs text-gray-500 block mt-1">All amounts shown in IDR (Rupiah).</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-orange-600 text-xs">✓</span>
                                                </div>
                                                <span className="text-gray-700">Bank Details Ready: <strong>{(agent.bankAccountNumber && agent.bankName && agent.bankAccountName) ? 'Yes' : 'No'}</strong></span>
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
                                
                                {/* Personal Information */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                                    <ImageUpload
                                        id="profile-photo-upload"
                                        label="Profile Photo"
                                        currentImage={profileImage}
                                        onImageChange={setProfileImage}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Age</label>
                                            <input
                                                type="number"
                                                min={16}
                                                value={age}
                                                onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Religion</label>
                                            <select
                                                value={religion}
                                                onChange={e => setReligion(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                <option value="">Select religion</option>
                                                <option value="Islam">Islam</option>
                                                <option value="Protestant">Protestant</option>
                                                <option value="Catholic">Catholic</option>
                                                <option value="Hindu">Hindu</option>
                                                <option value="Buddhist">Buddhist</option>
                                                <option value="Confucian">Confucian</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
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
                                </div>

                                {/* Banking & ID Verification */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Bank & ID Verification</h3>
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
                                        {nameMismatch && (
                                            <p className="text-xs text-red-600 mt-1">
                                                The name on your ID card must match your bank account holder name.
                                            </p>
                                        )}
                                    </div>
                                    <ImageUpload
                                        id="id-card-upload"
                                        label={t.profile.idCard}
                                        currentImage={idCardImage}
                                        onImageChange={setIdCardImage}
                                    />
                                    <p className="text-xs text-gray-600">For payouts, your ID card name and bank account holder name must match.</p>
                                    {/* Agreement Checkboxes */}
                                    <div className="pt-4 border-t space-y-3">
                                        <p className="font-semibold text-gray-900">Agent Agreements</p>
                                        <label className="flex items-start gap-3 text-sm cursor-pointer">
                                            <input type="checkbox" checked={agreedTaxResponsibility} onChange={e => setAgreedTaxResponsibility(e.target.checked)} className="mt-0.5" />
                                            <span>I acknowledge I am responsible for my own taxes and any government fees.</span>
                                        </label>
                                        <label className="flex items-start gap-3 text-sm cursor-pointer">
                                            <input type="checkbox" checked={agreedUniformRequirement} onChange={e => setAgreedUniformRequirement(e.target.checked)} className="mt-0.5" />
                                            <span>I agree to wear the IndaStreet uniform and present my ID card at all times while representing the platform.</span>
                                        </label>
                                        <label className="flex items-start gap-3 text-sm cursor-pointer">
                                            <input type="checkbox" checked={agreedTransportation} onChange={e => setAgreedTransportation(e.target.checked)} className="mt-0.5" />
                                            <span>I confirm I have my own transportation for carrying out agent duties.</span>
                                        </label>
                                        <label className="flex items-start gap-3 text-sm cursor-pointer">
                                            <input type="checkbox" checked={agreedNoCriminalRecord} onChange={e => setAgreedNoCriminalRecord(e.target.checked)} className="mt-0.5" />
                                            <span>I confirm I have no criminal convictions and am not listed on police records.</span>
                                        </label>
                                        <label className="flex items-start gap-3 text-sm cursor-pointer">
                                            <input type="checkbox" checked={agreedIdPresentation} onChange={e => setAgreedIdPresentation(e.target.checked)} className="mt-0.5" />
                                            <span>I agree to present my IndaStreet agent ID and uphold platform standards.</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleProfileSave}
                                        className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                                        disabled={nameMismatch}
                                        title={nameMismatch ? 'Full Name and Bank Account Name must match' : undefined}
                                    >
                                        {t.profile.saveButton}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STATS TAB */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Performance Stats</h2>
                                        <p className="text-xs text-gray-500">Monthly sign-ups and recurring membership activity</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">New Sign-Ups (Month)</p>
                                        <p className="text-3xl font-bold text-orange-600">{monthlySignups}</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Recurring Eligible</p>
                                        <p className={`text-3xl font-bold ${recurringEligible ? 'text-green-600' : 'text-red-600'}`}>{recurringEligible ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
                                        <p className="text-3xl font-bold text-gray-800">{currentCommission}%</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Attributed (Therapists)</p>
                                        <p className="text-3xl font-bold text-indigo-600">{attributionCounts.therapists}</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Attributed (Places)</p>
                                        <p className="text-3xl font-bold text-purple-600">{attributionCounts.places}</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Visits Logged</p>
                                        <p className="text-3xl font-bold text-teal-600">{remoteVisits.length}</p>
                                    </div>
                                </div>
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                        {metricsLoading && <p className="text-xs text-gray-500 mb-2">Loading performance data...</p>}
                                        {errorMsg && <p className="text-xs text-red-600 mb-2">{errorMsg}</p>}
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Growth & Eligibility</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-bold">✓</span>
                                            Current month sign-ups: <strong>{monthlySignups}</strong> / 20 target
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-bold">✓</span>
                                            Recurring commission status: <strong>{recurringEligible ? 'Active (10%)' : 'Inactive (0%)'}</strong>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-bold">✓</span>
                                            Tier: <strong>{agent.tier || 'Standard'}</strong> {agent.tier === 'Toptier' && '(23% new sign-up commission)'}
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-600 font-bold">✓</span>
                                            Next upgrade criteria: 20 sign-ups per month for 3 consecutive months → Toptier
                                        </li>
                                    </ul>
                                    <p className="text-xs text-gray-500 mt-4 border-t pt-4">Historical streak & detailed signup sources will appear here once backend tracking is integrated.</p>
                                </div>
                            </div>
                        )}

                        {/* VISITS TAB */}
                        {activeTab === 'visits' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <ClipboardList className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Visit Log</h2>
                                        <p className="text-xs text-gray-500">Track all therapist and spa meetings</p>
                                    </div>
                                </div>
                                {/* Visit Form */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Entity Type</label>
                                            <select value={visitEntityType} onChange={e => setVisitEntityType(e.target.value as 'therapist' | 'place')} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                                <option value="therapist">Therapist</option>
                                                <option value="place">Massage Place / Spa</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                                            <input type="text" value={visitEntityName} onChange={e => setVisitEntityName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                                            <input type="text" value={visitLocation} onChange={e => setVisitLocation(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="City / Area" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Outcome</label>
                                            <select value={visitOutcome} onChange={e => setVisitOutcome(e.target.value as any)} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                                <option value="positive">Positive</option>
                                                <option value="negative">Negative</option>
                                                <option value="need_info">Need More Info</option>
                                                <option value="need_time">Need More Time</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1"><Calendar className="w-4 h-4" /> Callback Date</label>
                                            <input type="date" value={visitCallbackDate} onChange={e => setVisitCallbackDate(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-900 mb-2">Callback Time</label>
                                            <input type="time" value={visitCallbackTime} onChange={e => setVisitCallbackTime(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                                        <textarea value={visitNotes} onChange={e => setVisitNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="General information about the meeting" />
                                    </div>
                                    <button onClick={handleAddVisit} className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50" disabled={!visitEntityName.trim()}>Add Visit</button>
                                </div>
                                {/* Visit List */}
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-600" /> Logged Visits</h3>
                                    {visitsLoading && <p className="text-xs text-gray-500">Loading visits...</p>}
                                    {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
                                    {remoteVisits.length === 0 && !visitsLoading ? (
                                        <p className="text-gray-500">No visits logged yet.</p>
                                    ) : (
                                        <div className="space-y-4 max-h-[480px] overflow-y-auto pb-4">
                                            {remoteVisits.map(v => (
                                                <div key={v.$id || v.agentCode + v.visitDate} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="font-semibold text-gray-800">{v.providerName} <span className="text-xs font-medium text-gray-500">({v.providerType})</span></p>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${v.status === 'completed' ? 'bg-green-100 text-green-700' : v.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status.replace('_',' ')}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">Visited: {new Date(v.visitDate).toLocaleString()}</p>
                                                    {v.location?.address && <p className="text-sm text-gray-700"><strong>Location:</strong> {v.location.address}</p>}
                                                    {v.callbackDate && <p className="text-sm text-gray-700"><strong>Callback:</strong> {v.callbackDate}</p>}
                                                    {v.meetingNotes && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{v.meetingNotes}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* BANK DETAILS (placeholder routed within profile for now) */}
                        {activeTab === 'bank' && (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Bank Details</h3>
                                <p className="text-sm text-gray-600 mb-4">Manage payout bank details here. For now, this section mirrors Profile → Banking.</p>
                                {/* Quick link to Profile tab */}
                                <button onClick={() => handleTabClick('profile')} className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline">Go to Profile</button>
                            </div>
                        )}

                        {/* AGREEMENTS & COMPLIANCE */}
                        {activeTab === 'agreements' && (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-yellow-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Agreements & Compliance</h3>
                                        <p className="text-xs text-gray-500">Your current IndaStreet Agent terms and requirements</p>
                                    </div>
                                </div>

                                {/* Render shared Agent Terms content */}
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-700">{agreementTerms.title}</p>
                                    <div className="divide-y divide-gray-100 border rounded-lg">
                                        {agreementTerms.sections.map((s: any, idx: number) => (
                                            <div key={idx} className="p-4">
                                                <h4 className="font-semibold text-gray-900 mb-1">{s.title}</h4>
                                                <p className="text-sm text-gray-700">{s.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">Note: Updates to these terms may require re-acceptance.</p>
                                </div>
                            </div>
                        )}

                        {/* MARKETING TOOLKIT */}
                        {activeTab === 'marketing' && (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                        <Megaphone className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Marketing Toolkit</h3>
                                        <p className="text-xs text-gray-500">Share banners with your agent code and WhatsApp</p>
                                    </div>
                                </div>

                                {/* Helper text */}
                                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                                    <p className="text-sm text-gray-800">
                                        Use these banners to invite therapists and places. Your agent code will be included in the registration link. At the bottom-right of each banner, the website address “www.indastreetmassage.com” is shown.
                                    </p>
                                </div>

                                {/* Registration link with agent attribution */}
                                <div className="border-2 border-gray-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Your registration link</p>
                                    {(() => {
                                        const regUrl = `https://www.indastreetmassage.com/signup?agent=${encodeURIComponent(agent.agentCode)}`;
                                        return (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    readOnly
                                                    value={regUrl}
                                                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        try { await navigator.clipboard.writeText(regUrl); alert('Registration link copied'); } catch {/* noop */}
                                                    }}
                                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
                                                >Copy</button>
                                            </div>
                                        );
                                    })()}
                                    <p className="text-xs text-gray-500 mt-2">Tip: Send this link directly or use the WhatsApp button on any banner below.</p>
                                </div>

                                {/* Banner gallery */}
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-gray-900">Shareable banners</p>
                                    {(() => {
                                        const banners: string[] = Array.isArray(BANNERS) ? BANNERS : [];

                                        const formatWaNumber = (num?: string) => {
                                            if (!num) return '';
                                            const digits = (num || '').replace(/\D+/g, '');
                                            if (!digits) return '';
                                            if (digits.startsWith('62')) return digits;
                                            if (digits.startsWith('0')) return `62${digits.slice(1)}`;
                                            return digits;
                                        };

                                        const agentWa = formatWaNumber(agent.contactNumber);
                                        const registrationUrl = `https://www.indastreetmassage.com/signup?agent=${encodeURIComponent(agent.agentCode)}`;

                                        const handleShareWhatsApp = (imgUrl: string) => {
                                            const message = [
                                                'Bergabunglah dengan IndaStreet Massage sebagai terapis atau mitra tempat! ✨',
                                                `Daftar di: ${registrationUrl}`,
                                                agentWa ? `Kontak saya (WhatsApp): https://wa.me/${agentWa}` : undefined,
                                                `Banner: ${imgUrl}`
                                            ].filter(Boolean).join('\n');
                                            const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                            window.open(shareUrl, '_blank', 'noopener,noreferrer');
                                        };

                                        const buildShareLinks = (imgUrl: string) => {
                                            const message = [
                                                'Bergabunglah dengan IndaStreet Massage sebagai terapis atau mitra tempat! ✨',
                                                `Daftar di: ${registrationUrl}`,
                                                agentWa ? `Kontak saya (WhatsApp): https://wa.me/${agentWa}` : undefined,
                                                `Banner: ${imgUrl}`
                                            ].filter(Boolean).join('\n');
                                            return {
                                                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registrationUrl)}`,
                                                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(registrationUrl)}`,
                                                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(registrationUrl)}`,
                                                telegram: `https://t.me/share/url?url=${encodeURIComponent(registrationUrl)}&text=${encodeURIComponent(message)}`,
                                                copyText: message
                                            };
                                        };

                                        const drawWatermarkAndDownload = async (imgUrl: string) => {
                                            try {
                                                const img = new Image();
                                                img.crossOrigin = 'anonymous';
                                                const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
                                                    img.onload = () => resolve(img);
                                                    img.onerror = () => reject(new Error('Image load failed'));
                                                    img.src = imgUrl;
                                                });
                                                const canvas = document.createElement('canvas');
                                                canvas.width = loaded.naturalWidth;
                                                canvas.height = loaded.naturalHeight;
                                                const ctx = canvas.getContext('2d');
                                                if (!ctx) throw new Error('Canvas not supported');
                                                ctx.drawImage(loaded, 0, 0);
                                                // Watermark box
                                                const pad = Math.max(12, Math.floor(canvas.width * 0.01));
                                                const text = 'www.indastreetmassage.com';
                                                ctx.font = `${Math.max(18, Math.floor(canvas.width * 0.028))}px Arial`;
                                                const textMetrics = ctx.measureText(text);
                                                const textW = textMetrics.width;
                                                const textH = Math.max(24, Math.floor(canvas.width * 0.04));
                                                const boxW = textW + pad * 2;
                                                const boxH = textH + pad;
                                                const x = canvas.width - boxW - pad;
                                                const y = canvas.height - boxH - pad;
                                                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                                                ctx.fillRect(x, y, boxW, boxH);
                                                ctx.fillStyle = '#fff';
                                                ctx.textBaseline = 'middle';
                                                ctx.fillText(text, x + pad, y + boxH / 2);
                                                const url = canvas.toDataURL('image/png');
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'indastreet-banner.png';
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                            } catch (e) {
                                                alert('Download failed. The image source may block downloads. Try "Open Original" and save manually.');
                                            }
                                        };

                                        if (!banners || banners.length === 0) {
                                            return (
                                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
                                                    <p className="text-sm text-gray-600">
                                                        No banners configured yet. Please add your 7 banner image URLs to <code className="px-1 py-0.5 bg-gray-100 rounded">src/marketingBanners.config.ts</code> as the exported <code>BANNERS</code> array.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {banners.map((url: string, idx: number) => (
                                                    <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col">
                                                        <div className="relative aspect-[3/4] bg-gray-100">
                                                            <img src={url} alt={`Marketing banner ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[11px] rounded">www.indastreetmassage.com</div>
                                                        </div>
                                                        <div className="p-3 flex gap-2 flex-wrap">
                                                            <button onClick={() => handleShareWhatsApp(url)} className="flex-1 min-w-[140px] px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 flex items-center justify-center gap-2">
                                                                <WhatsAppIcon className="w-4 h-4" /> Share WhatsApp
                                                            </button>
                                                            {(() => {
                                                                const s = buildShareLinks(url);
                                                                return (
                                                                    <>
                                                                        <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook</a>
                                                                        <a href={s.twitter} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 flex items-center gap-2"><Twitter className="w-4 h-4" /> X</a>
                                                                        <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-sky-700 text-white rounded-lg text-sm font-semibold hover:bg-sky-800 flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                                                                        <a href={s.telegram} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 flex items-center gap-2"><Send className="w-4 h-4" /> Telegram</a>
                                                                        <button onClick={async () => { try { await navigator.clipboard.writeText(s.copyText); alert('Share text copied'); } catch {} }} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Copy Text</button>
                                                                    </>
                                                                );
                                                            })()}
                                                            <button onClick={() => drawWatermarkAndDownload(url)} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600">Download</button>
                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200">Open Original</a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <p className="text-xs text-gray-500">Note: Instagram does not support direct web share with a pre-attached image. Use Download, then post in the Instagram app.</p>
                            </div>
                        )}

                        {/* HELP & SUPPORT */}
                        {activeTab === 'help' && (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                        <HelpCircle className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Help & Support</h3>
                                        <p className="text-xs text-gray-500">We’re here to help you succeed</p>
                                    </div>
                                </div>

                                {/* WhatsApp Support */}
                                <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                            <WhatsAppIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">WhatsApp Support (Preferred)</p>
                                            <p className="text-xs text-gray-600">+62 813-9200-0050</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open('https://wa.me/6281392000050?text=Hello%20IndaStreet%20Support%2C%20I%20need%20assistance%20with%20my%20agent%20account.', '_blank')}
                                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600"
                                    >
                                        <WhatsAppIcon className="w-5 h-5" />
                                        Message on WhatsApp
                                    </button>
                                    <p className="text-xs text-gray-700 mt-3">
                                        WhatsApp connects you to our customer service team. Depending on your request, we may need time to assign the correct specialist to assist you.
                                    </p>
                                </div>

                                {/* Email Support */}
                                <div className="border-2 border-gray-200 rounded-xl p-4">
                                    <p className="font-semibold text-gray-900 mb-1">Email Support</p>
                                    <a href="mailto:indastreet.id@gmail.com" className="text-sm text-blue-600 underline">indastreet.id@gmail.com</a>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Emails are typically replied to within 72 hours. For faster support, WhatsApp is preferred.
                                    </p>
                                </div>

                                {/* Tips */}
                                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                                    <p className="text-sm text-gray-800">
                                        Tip: Include your full name, agent code, and a brief summary of your request so we can help you quicker.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SETTINGS (placeholder) */}
                        {activeTab === 'settings' && (
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
                                <p className="text-sm text-gray-600">Notification and personalization settings. Coming soon.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            </main>
        </div>
    );
};

export default AgentDashboardPage;

