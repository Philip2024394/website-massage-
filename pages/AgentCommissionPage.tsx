import React, { useMemo } from 'react';
import PageNumberBadge from '../components/PageNumberBadge';
import CountryAppDrawer from '../components/CountryAppDrawer';

interface AgentCommissionPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  isMenuOpen?: boolean;
  onCloseMenu?: () => void;
}

// Simple static commission structure for agents (Indonesia only deployment)
const AgentCommissionPage: React.FC<AgentCommissionPageProps> = ({
  t,
  onBack,
  onNavigate,
  isMenuOpen = false,
  onCloseMenu
}) => {
  const translate = (key: string, fallback: string) => {
    if (t) {
      try {
        const v = t(key);
        if (v && v !== key) return v;
      } catch {}
    }
    return fallback;
  };

  const structure = useMemo(() => ([
    { rate: '20%', label: 'New Sign-Up Commission', desc: 'Earn 20% on every new membership or provider sign-up you directly refer.' },
    { rate: '10%', label: 'Recurring Commission', desc: 'Earn 10% on recurring renewals when you achieve the monthly activation target.' },
    { rate: '3%', label: 'Streak Bonus', desc: 'Earn an extra 3% in the 4th month after maintaining activation targets for 3 straight months.' }
  ]), []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageNumberBadge pageNumber={102} pageName="AgentCommissionPage" />
      {/* Optional drawer reuse */}
      <CountryAppDrawer 
        countryCode={(() => { try { const raw = localStorage.getItem('app_user_location'); if (raw) return JSON.parse(raw).countryCode; } catch {} return 'ID'; })()} 
        isOpen={isMenuOpen} 
        isHome={false} 
        onClose={() => onCloseMenu?.()} 
        t={t} 
        onNavigate={onNavigate} 
      />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => onBack ? onBack() : onNavigate?.('home')} 
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >← {translate('agent.back', 'Back')}</button>
          <h1 className="text-xl font-bold text-gray-900">{translate('agent.title', 'IndaStreet Agent Commission')}</h1>
        </div>
      </header>
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6">
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{translate('agent.overview', 'Overview')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {translate('agent.intro', 'Agents earn commissions by referring new paying members and service providers. Maintain activation targets to unlock recurring and bonus tiers.')}
          </p>
        </section>
        <section className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-gray-800">{translate('agent.structure', 'Commission Structure')}</h2>
          <div className="grid gap-4">
            {structure.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <span className="text-sm font-bold text-orange-600">{item.rate}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{translate('agent.activation', 'Activation Targets')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {translate('agent.activationDesc', 'Monthly activation targets must be met to keep recurring commissions active. Falling short pauses the recurring tier until target is re-achieved.')}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
            <li>{translate('agent.target.newMembers', 'Hit the monthly new member/provider activation target to unlock 10% recurring commission.')}</li>
            <li>{translate('agent.target.streak', 'Maintain 3 consecutive successful months to unlock the 3% streak bonus in month 4.')}</li>
          </ul>
        </section>
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{translate('agent.status', 'Commission Status')}</h2>
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-4 shadow-md">
            <p className="text-sm font-medium">{translate('agent.statusInfo', 'Live commission tracking will appear here once integrated with real-time referral analytics.')}</p>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{translate('agent.cta', 'Become an Agent')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {translate('agent.ctaDesc', 'Ready to grow the IndaStreet network? Start by registering or logging in through the Agent button in the side menu.')}
          </p>
          <button
            onClick={() => onNavigate?.('agentAuth')}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow focus:outline-none"
          >{translate('agent.ctaButton', 'Go to Agent Login')}</button>
        </section>
        <div className="h-16" />
      </main>
    </div>
  );
};

export default AgentCommissionPage;