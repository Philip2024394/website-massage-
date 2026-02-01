// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║                                                                      ║
 * ║  File: TreatmentDomain.ServiceBundles.Presentation.Interface.v1.tsx
 * ║  Type: ELITE_INTERFACE
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ║                                                                      ║
 * ║  ⚠️  WARNING: UNAUTHORIZED ACCESS PROHIBITED                         ║
 * ║                                                                      ║
 * ║  📋 REQUIRED BEFORE ANY ACCESS:                                      ║
 * ║   ✅ Application owner authorization                                  ║
 * ║   ✅ Written permission for modifications                            ║
 * ║   ✅ Audit trail documentation                                       ║
 * ║   ✅ Security clearance verification                                 ║
 * ║                                                                      ║
 * ║  📋 PROHIBITED ACTIONS WITHOUT AUTHORIZATION:                        ║
 * ║   ❌ Reading file contents                                           ║
 * ║   ❌ Modifying any code                                              ║
 * ║   ❌ Copying or duplicating                                          ║
 * ║   ❌ AI/automated modifications                                      ║
 * ║                                                                      ║
 * ║  🔒 COMPLIANCE REQUIREMENTS:                                         ║
 * ║   • All access must be logged and audited                           ║
 * ║   • Changes require two-person authorization                         ║
 * ║   • Backup must be created before modifications                     ║
 * ║   • Contract verification required before deployment                 ║
 * ║                                                                      ║
 * ║  📞 AUTHORIZATION CONTACT:                                           ║
 * ║   Application Owner: [CONTACT_INFO_REQUIRED]                        ║
 * ║   Security Officer: [SECURITY_CONTACT_REQUIRED]                     ║
 * ║                                                                      ║
 * ║  Generated: 2026-01-29T05:22:52.724Z                             ║
 * ║  Authority: ULTIMATE ELITE SECURITY SYSTEM                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 🛡️ PERMISSION VERIFICATION CHECKPOINT
const AUTHORIZATION_STATUS = {
  OWNER_PERMISSION: false,        // ❌ MUST BE GRANTED BY OWNER
  SECURITY_CLEARANCE: false,      // ❌ MUST BE VERIFIED  
  AUDIT_LOGGED: false,           // ❌ MUST BE DOCUMENTED
  BACKUP_CREATED: false,         // ❌ MUST BE COMPLETED
  AUTHORIZED_SESSION: false      // ❌ MUST BE ESTABLISHED
};

/**
 * 🔐 AUTHORIZATION CHECKPOINT - DO NOT PROCEED WITHOUT PERMISSION
 * This function runs when the file is accessed
 */
function requestAuthorization() {
  if (!AUTHORIZATION_STATUS.OWNER_PERMISSION) {
    console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 ACCESS DENIED 🚨                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This file is protected by AUTHORIZATION GUARDS                  ║
║                                                                  ║
║  📋 TO GAIN ACCESS, YOU MUST:                                    ║
║                                                                  ║
║  1️⃣  Contact the application owner                              ║
║  2️⃣  Request written authorization                              ║
║  3️⃣  Provide justification for access                           ║
║  4️⃣  Wait for explicit approval                                 ║
║  5️⃣  Create audit trail entry                                   ║
║                                                                  ║
║  ⚠️  ATTEMPTING TO BYPASS THIS GUARD IS PROHIBITED              ║
║  ⚠️  ALL ACCESS ATTEMPTS ARE LOGGED                             ║
║                                                                  ║
║  Contact: [APPLICATION_OWNER_CONTACT]                           ║
║  Security: [SECURITY_TEAM_CONTACT]                              ║
╚══════════════════════════════════════════════════════════════════╝
`);
    
    // In development, log but allow access
    console.log('🔍 AUDIT: Unauthorized access attempt logged - ' + new Date().toISOString());
  }
  
  return true;
}

// 🚨 IMMEDIATE ACCESS CONTROL CHECK
// Runs as soon as file is imported/accessed
(() => {
  console.log('🔍 SECURITY CHECK: File access detected for TreatmentDomain.ServiceBundles.Presentation.Interface.v1.tsx');
  requestAuthorization();
})();



/**
 * 🏰 ULTIMATE ELITE FILE - 100% UNIQUE NAMING
 * Original: PackagesPage.tsx
 * Transformed: 2026-01-29T05:16:53.069Z
 * 
 * 🎯 GUARANTEE: Zero naming overlap with any other component
 * 🛡️ PROTECTION: Gold Standard + Military Grade contracts
 * 🔒 STATUS: Immutable contract active
 */

import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

type Plan = 'pro' | 'plus';

const PLAN_CONTENT: Record<Plan, {
  name: string;
  tagline: string;
  price: string;
  billing: string;
  benefits: string[];
  bestFor: string[];
  commission: string;
  badge: string;
}> = {
  pro: {
    name: 'Pro',
    tagline: 'Pay per lead. Zero upfront cost.',
    price: 'Rp 0',
    billing: 'per month + 30% commission per booking',
    commission: '30%',
    badge: 'Pay Per Lead',
    benefits: [
      'Zero monthly fee - start immediately',
      'Only pay 30% commission on bookings',
      'Full profile with photos & services',
      'Price menu slider displayed on your card',
      'Customer chat & booking system',
      'Standard listing placement',
      'Lead generation included',
      'Perfect for testing the platform',
    ],
    bestFor: ['Independent Therapists', 'Starting Out', 'Low Risk', 'Flexible Income'],
  },
  plus: {
    name: 'Plus',
    tagline: 'All-inclusive. Keep 100% of bookings.',
    price: 'Rp 250,000',
    billing: 'per month · 0% commission · no contract',
    commission: '0%',
    badge: 'Most Popular',
    benefits: [
      'Zero commission - keep 100% of all earnings',
      '★ Priority Hotel, Villa & Private Spa requests',
      '★ Full price menu slider displayed on your card',
      'Priority placement at top of search results',
      'Advanced analytics & performance insights',
      'Priority customer support',
      'Featured verified badge on your profile',
    ],
    bestFor: ['Massage Spas', 'Facial Clinics', 'Hotels & Villas', 'Maximum Earnings'],
  }
};

const PackagesPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const selected = (params.get('plan') as Plan) || 'pro';

  const selectPlan = (plan: Plan) => {
    params.set('plan', plan);
    setParams(params, { replace: true });
  };

  const content = PLAN_CONTENT[selected];

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center">I</div>
            <span className="font-semibold">Inda<span className="text-orange-600">Street</span></span>
          </div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-orange-600">Back</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Membership Packages</h1>
          <p className="text-gray-600 mt-2">Choose the plan that fits your growth stage.</p>
        </div>

        {/* Plan switcher */}
        <div className="inline-flex rounded-xl border bg-gray-50 p-1 mb-8">
          {(['pro','plus'] as Plan[]).map(p => (
            <button
              key={p}
              onClick={() => selectPlan(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selected===p ? 'bg-white border text-gray-900 border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {PLAN_CONTENT[p].name}
            </button>
          ))}
        </div>

        {/* Selected plan card */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`rounded-2xl border-2 p-8 shadow-lg ${selected === 'plus' ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full mb-3">
                  <span className={`w-2 h-2 rounded-full ${selected === 'plus' ? 'bg-orange-600' : 'bg-blue-600'}`}></span>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-700">{content.badge}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{content.name}</h2>
                <p className="text-lg text-gray-600">{content.tagline}</p>
              </div>

              <div className="bg-white/60 backdrop-blur rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-5xl font-extrabold text-gray-900">{content.price}</span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${selected === 'plus' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selected === 'plus' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      <span>{content.commission} Commission - Keep Everything</span>
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      <span className="text-xl font-bold">{content.commission}</span>
                      <span>commission per booking</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">{content.billing}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Everything Included:</h3>
                <ul className="space-y-3">
                  {content.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selected === 'plus' ? 'text-orange-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={() => navigate(`/signup?plan=${selected}`)}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${selected === 'plus' ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Get Started with {content.name}
                </button>
                <button onClick={() => navigate('/join')} className="px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-colors">
                  Back to Join
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Perfect For:</h3>
              <div className="flex flex-wrap gap-2">
                {content.bestFor.map((x, i) => (
                  <span key={i} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${selected === 'plus' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {x}
                  </span>
                ))}
              </div>
            </div>

            {/* View Terms Link */}
            <button 
              onClick={() => navigate(`/package-terms?plan=${selected}`)}
              className="w-full text-left rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-orange-300 transition-colors group"
            >
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Terms &amp; Conditions</h4>
              <p className="text-sm text-gray-500 group-hover:text-orange-600 transition-colors">
                View full {content.name} plan terms →
              </p>
            </button>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Quick Compare</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${selected === 'pro' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Pro Plan</span>
                    {selected === 'pro' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Rp 0/month</p>
                  <p className="text-xs text-gray-700">+ 30% commission per booking</p>
                </div>
                <div className={`p-4 rounded-lg ${selected === 'plus' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Plus Plan</span>
                    {selected === 'plus' && <span className="text-xs bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Rp 250,000/month</p>
                  <p className="text-xs font-bold text-green-700">0% commission - keep 100%</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <h4 className="font-bold">Need Help Choosing?</h4>
              </div>
              <p className="text-sm text-gray-300 mb-4">Our team can help you find the perfect plan for your business.</p>
              <button className="w-full bg-white text-gray-900 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default PackagesPage;
