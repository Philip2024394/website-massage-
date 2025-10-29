import React, { useEffect, useState } from 'react';
import { authService, appwriteDatabases } from '../lib/appwriteService';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface AgentSignup {
  $id: string;
  name: string;
  whatsappNumber: string;
  address: string;
  idCard: string;
  type: 'therapist' | 'place';
  signupDate: string;
  agentId: string;
  agentName: string;
  membershipPrice: number;
  isRenewal: boolean;
}

interface AgentStats {
  agentId: string;
  agentName: string;
  agentWhatsApp: string;
  agentIdCard: string;
  totalSignups: number;
  newSignups: number;
  renewalSignups: number;
  therapistSignups: number;
  placeSignups: number;
  newMemberCommission: number;
  renewalCommission: number;
  bonusCommission: number;
  totalCommissionDue: number;
  hasReachedTarget: boolean;
  signups: AgentSignup[];
}

const NEW_MEMBER_COMMISSION_RATE = 0.20; // 20% of membership price
const RENEWAL_COMMISSION_RATE = 0.10; // 10% of membership price
const BONUS_COMMISSION_RATE = 0.03; // 3% bonus
const MONTHLY_TARGET = 20; // 20 new signups per month

const AgentCommissionPage: React.FC = () => {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await authService.createAnonymousSession().catch(console.error);
      fetchAgentStats();
    };
    init();
  }, [selectedMonth]);

  const fetchAgentStats = async () => {
    setLoading(true);
    try {
      // Fetch all therapists and places
      const [therapistsResponse, placesResponse] = await Promise.all([
        appwriteDatabases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.therapists
        ),
        appwriteDatabases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.places
        ),
      ]);

      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      // Process therapists
      const therapistSignups: AgentSignup[] = therapistsResponse.documents
        .filter((t: any) => {
          if (!t.agentId || !t.$createdAt) return false;
          const createdDate = new Date(t.$createdAt);
          return createdDate >= startDate && createdDate <= endDate;
        })
        .map((t: any) => ({
          $id: t.$id,
          name: t.name || 'N/A',
          whatsappNumber: t.whatsappNumber || t.phoneNumber || 'N/A',
          address: t.location || t.city || 'N/A',
          idCard: t.idCard || 'N/A',
          type: 'therapist' as const,
          signupDate: t.$createdAt,
          agentId: t.agentId,
          agentName: t.agentName || 'N/A',
          membershipPrice: t.membershipPrice || 0,
          isRenewal: t.isRenewal || false,
        }));

      // Process places
      const placeSignups: AgentSignup[] = placesResponse.documents
        .filter((p: any) => {
          if (!p.agentId || !p.$createdAt) return false;
          const createdDate = new Date(p.$createdAt);
          return createdDate >= startDate && createdDate <= endDate;
        })
        .map((p: any) => ({
          $id: p.$id,
          name: p.name || 'N/A',
          whatsappNumber: p.whatsappNumber || p.phoneNumber || 'N/A',
          address: p.location || p.address || 'N/A',
          idCard: p.idCard || 'N/A',
          type: 'place' as const,
          signupDate: p.$createdAt,
          agentId: p.agentId,
          agentName: p.agentName || 'N/A',
          membershipPrice: p.membershipPrice || 0,
          isRenewal: p.isRenewal || false,
        }));

      // Combine and group by agent
      const allSignups = [...therapistSignups, ...placeSignups];
      const agentMap = new Map<string, AgentStats>();

      allSignups.forEach((signup) => {
        if (!agentMap.has(signup.agentId)) {
          agentMap.set(signup.agentId, {
            agentId: signup.agentId,
            agentName: signup.agentName,
            agentWhatsApp: 'N/A',
            agentIdCard: 'N/A',
            totalSignups: 0,
            newSignups: 0,
            renewalSignups: 0,
            therapistSignups: 0,
            placeSignups: 0,
            newMemberCommission: 0,
            renewalCommission: 0,
            bonusCommission: 0,
            totalCommissionDue: 0,
            hasReachedTarget: false,
            signups: [],
          });
        }

        const stats = agentMap.get(signup.agentId)!;
        stats.totalSignups++;
        
        // Calculate commission based on signup type
        if (signup.isRenewal) {
          stats.renewalSignups++;
          // Renewal commission only if target is met (will calculate later)
        } else {
          stats.newSignups++;
          // New member commission: 20% of membership price
          const commission = signup.membershipPrice * NEW_MEMBER_COMMISSION_RATE;
          stats.newMemberCommission += commission;
        }
        
        if (signup.type === 'therapist') {
          stats.therapistSignups++;
        } else {
          stats.placeSignups++;
        }
        stats.signups.push(signup);
      });

      // Calculate final commissions and check target achievement
      agentMap.forEach((stats) => {
        // Check if agent reached monthly target of 20 new signups
        stats.hasReachedTarget = stats.newSignups >= MONTHLY_TARGET;
        
        if (stats.hasReachedTarget) {
          // Calculate renewal commission: 10% of membership price for renewals
          stats.signups.forEach((signup) => {
            if (signup.isRenewal) {
              const renewalComm = signup.membershipPrice * RENEWAL_COMMISSION_RATE;
              stats.renewalCommission += renewalComm;
            }
          });
          
          // Calculate 3% bonus on total new member commissions
          stats.bonusCommission = stats.newMemberCommission * BONUS_COMMISSION_RATE;
          
          // Total commission = new member commission + renewal commission + bonus
          stats.totalCommissionDue = stats.newMemberCommission + stats.renewalCommission + stats.bonusCommission;
        } else {
          // If target not met, only get new member commission (no renewals, no bonus)
          stats.totalCommissionDue = stats.newMemberCommission;
          stats.renewalCommission = 0;
          stats.bonusCommission = 0;
        }
      });

      setAgentStats(Array.from(agentMap.values()).sort((a, b) => b.totalSignups - a.totalSignups));
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Commission Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Track agent performance and commission earnings</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>
      </div>

      {/* Commission Structure Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">📊 Commission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-800">New Member Commission:</p>
            <p className="text-blue-700">20% of membership price</p>
          </div>
          <div>
            <p className="font-semibold text-blue-800">Renewal Commission:</p>
            <p className="text-blue-700">10% of membership price</p>
            <p className="text-xs text-blue-600 italic">(Only if {MONTHLY_TARGET} new signups target met)</p>
          </div>
          <div>
            <p className="font-semibold text-blue-800">Monthly Bonus:</p>
            <p className="text-blue-700">3% bonus on total new member commission</p>
            <p className="text-xs text-blue-600 italic">(Only if {MONTHLY_TARGET} new signups target met)</p>
          </div>
        </div>
      </div>

      {/* Agent Terms and Conditions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span>Agent Terms & Conditions</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Important policies and requirements for all <span className="text-black">Inda</span>Street agents</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💳</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Payment Terms</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Payments ONLY to bank accounts matching agent's ID card name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Processed at the end of each calendar month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Completed within 5 working days after month end</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resignation Policy */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📋</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Resignation Policy</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>2 weeks written notice required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>ID card must be returned to <span className="text-black">Inda</span>Street office</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Final payment processed after ID card return</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Appearance Requirements */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">👕</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Appearance Requirements</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>MANDATORY:</strong> <span className="text-black">Inda</span>Street branded T-shirt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>MANDATORY:</strong> ID card visibly displayed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Professional conduct representing <span className="text-black">Inda</span>Street</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">✅</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Compliance & Agreement</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Follow all <span className="text-black">Inda</span>Street requirements and policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Accept and comply with all Terms & Conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Non-compliance may result in termination</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-red-800 font-medium">
                Non-compliance with these terms may result in immediate suspension of commission payments and/or termination of agent status
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Loading agent statistics...</p>
        </div>
      ) : agentStats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No agent signups found for this month.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Agents</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{agentStats.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">New Signups</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {agentStats.reduce((sum, a) => sum + a.newSignups, 0)}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Renewals</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {agentStats.reduce((sum, a) => sum + a.renewalSignups, 0)}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Total Commission</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatCurrency(agentStats.reduce((sum, a) => sum + a.totalCommissionDue, 0))}
              </p>
            </div>
          </div>

          {/* Agent List */}
          {agentStats.map((agent) => (
            <div
              key={agent.agentId}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedAgent(expandedAgent === agent.agentId ? null : agent.agentId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">{agent.agentName}</h3>
                      {agent.hasReachedTarget && (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          ✓ {MONTHLY_TARGET} Target Reached
                        </span>
                      )}
                      {!agent.hasReachedTarget && (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                          ⚠ {agent.newSignups}/{MONTHLY_TARGET} Target
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📱 {agent.agentWhatsApp}</span>
                      <span>🆔 {agent.agentIdCard}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-green">{agent.newSignups}</p>
                    <p className="text-xs text-gray-500">New Signups</p>
                    <p className="text-lg font-semibold text-purple-600 mt-1">
                      {formatCurrency(agent.totalCommissionDue)}
                    </p>
                  </div>
                  <div className="ml-4 text-gray-400">
                    {expandedAgent === agent.agentId ? '▼' : '▶'}
                  </div>
                </div>

                <div className="flex gap-4 mt-3 text-sm flex-wrap">
                  <div className="bg-blue-50 px-3 py-1 rounded">
                    <span className="font-medium text-blue-700">New: {agent.newSignups}</span>
                  </div>
                  <div className="bg-orange-50 px-3 py-1 rounded">
                    <span className="font-medium text-orange-700">Renewals: {agent.renewalSignups}</span>
                  </div>
                  <div className="bg-green-50 px-3 py-1 rounded">
                    <span className="font-medium text-green-700">Commission: {formatCurrency(agent.newMemberCommission)}</span>
                  </div>
                  {agent.hasReachedTarget && (
                    <>
                      <div className="bg-purple-50 px-3 py-1 rounded">
                        <span className="font-medium text-purple-700">Renewal Comm: {formatCurrency(agent.renewalCommission)}</span>
                      </div>
                      <div className="bg-yellow-50 px-3 py-1 rounded">
                        <span className="font-medium text-yellow-700">Bonus: {formatCurrency(agent.bonusCommission)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAgent === agent.agentId && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Signup Details</h4>
                  <div className="space-y-2">
                    {agent.signups.map((signup) => (
                      <div
                        key={signup.$id}
                        className="bg-white rounded border border-gray-200 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900">{signup.name}</h5>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  signup.type === 'therapist'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {signup.type === 'therapist' ? 'Therapist' : 'Place'}
                              </span>
                              {signup.isRenewal && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                  Renewal
                                </span>
                              )}
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>📱 WhatsApp: {signup.whatsappNumber}</p>
                              <p>📍 Address: {signup.address}</p>
                              <p>🆔 ID Card: {signup.idCard}</p>
                              <p>� Membership: {formatCurrency(signup.membershipPrice)}</p>
                              <p>�📅 Signed up: {formatDate(signup.signupDate)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {signup.isRenewal ? (
                              agent.hasReachedTarget ? (
                                <>
                                  <p className="text-sm font-semibold text-purple-600">
                                    {formatCurrency(signup.membershipPrice * RENEWAL_COMMISSION_RATE)}
                                  </p>
                                  <p className="text-xs text-gray-500">10% Renewal</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-gray-400 line-through">
                                    {formatCurrency(signup.membershipPrice * RENEWAL_COMMISSION_RATE)}
                                  </p>
                                  <p className="text-xs text-red-500">Target not met</p>
                                </>
                              )
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(signup.membershipPrice * NEW_MEMBER_COMMISSION_RATE)}
                                </p>
                                <p className="text-xs text-gray-500">20% New Member</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentCommissionPage;
