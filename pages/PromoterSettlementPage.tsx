import React, { useEffect, useState } from 'react';
import { aggregateSettlement, mapRecordBreakdown, filterByAffiliateCode, CommissionRecord } from '../services/promoterSettlementService';
import { ADMIN_SHARE_OF_PROMOTER_COMMISSION, PROMOTER_BOOKING_COMMISSION_RATE } from '../constants';
import { Briefcase, RefreshCw } from 'lucide-react';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Client, Databases, Query } from 'appwrite';

interface Props { t?: any; onBack?: () => void; }

// Attempt to create an Appwrite databases client if environment permits
function makeDatabases(): Databases | null {
  try {
    const client = new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
    return new Databases(client);
  } catch (e) {
    console.warn('Appwrite client init failed (offline mode):', e);
    return null;
  }
}

const PromoterSettlementPage: React.FC<Props> = ({ t, onBack }) => {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string>(''); // TODO: derive from logged in promoter state

  const load = async () => {
    setIsLoading(true);
    try {
      const db = makeDatabases();
      if (!db) {
        setRecords([]);
      } else {
        const queries: string[] = [];
        // Filter by affiliateCode if available
        if (affiliateCode) {
          queries.push(Query.equal('affiliateCode', affiliateCode));
        }
        const res: any = await db.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.commissionRecords, queries);
        const docs: CommissionRecord[] = res.documents.map((d: any) => ({
          $id: d.$id,
            serviceAmount: d.serviceAmount || 0,
            commissionAmount: d.commissionAmount || 0,
            commissionRate: d.commissionRate,
            status: d.status,
            affiliateCode: d.affiliateCode,
            createdAt: d.createdAt
        }));
        setRecords(docs);
      }
    } catch (e) {
      console.error('Error loading settlement records', e);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [affiliateCode]);

  const filtered = filterByAffiliateCode(records, affiliateCode);
  const aggregated = aggregateSettlement(filtered);
  const perRecord = filtered.map(mapRecordBreakdown);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settlement Overview</h1>
            <p className="text-sm text-gray-500">Commission rate: {Math.round(PROMOTER_BOOKING_COMMISSION_RATE * 100)}% • Admin share of commission: {Math.round(ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}%</p>
          </div>
        </div>
        <button onClick={load} disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow disabled:opacity-50">
          <RefreshCw className="w-4 h-4" /> {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Service Volume</p>
          <p className="text-xl font-bold text-gray-800">Rp {aggregated.totalServiceVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Gross Commission</p>
          <p className="text-xl font-bold text-green-600">Rp {aggregated.totalGrossPromoterCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Admin Fee</p>
          <p className="text-xl font-bold text-purple-600">Rp {aggregated.totalAdminFee.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Promoter Net</p>
          <p className="text-xl font-bold text-emerald-600">Rp {aggregated.totalPromoterNet.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Admin % vs Volume</p>
          <p className="text-xl font-bold text-gray-800">{aggregated.effectiveAdminPercent.toLocaleString()}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Affiliate / Promoter Code</label>
            <input value={affiliateCode} onChange={e => setAffiliateCode(e.target.value.trim())} placeholder="e.g. PROMO123" className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="text-xs text-gray-500 flex-1">
            Enter your registered promoter code to filter only your attributed bookings. If left blank, all commission records are shown (subject to access permissions).
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
          <h2 className="text-sm font-semibold text-gray-700">Records ({perRecord.length})</h2>
          <span className="text-xs text-gray-500">Pending: {aggregated.pendingCount} • Verified: {aggregated.verifiedCount} • Rejected: {aggregated.rejectedCount}</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading ...</div>
        ) : perRecord.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No commission records found for current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-green-50 text-xs text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Service Amount</th>
                  <th className="px-4 py-2 text-left">Gross</th>
                  <th className="px-4 py-2 text-left">Admin Fee</th>
                  <th className="px-4 py-2 text-left">Promoter Net</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {perRecord.map(r => (
                  <tr key={r.$id || Math.random()} className="hover:bg-green-50">
                    <td className="px-4 py-2 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2">Rp {r.serviceAmount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">Rp {r.grossPromoterCommission.toLocaleString()}</td>
                    <td className="px-4 py-2 text-purple-600">Rp {r.adminFee.toLocaleString()}</td>
                    <td className="px-4 py-2 text-emerald-600 font-semibold">Rp {r.promoterNet.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === 'verified' ? 'bg-green-100 text-green-700' :
                        r.status === 'pending' || r.status === 'awaiting_verification' ? 'bg-yellow-100 text-yellow-700' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>{r.status || 'unknown'}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{r.affiliateCode || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-500 leading-relaxed">
        <p><strong>How settlement works:</strong> Each booking generates a promoter gross commission equal to {Math.round(PROMOTER_BOOKING_COMMISSION_RATE * 100)}% of the service amount. The platform admin receives {Math.round(ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of that gross commission (effective {Math.round(PROMOTER_BOOKING_COMMISSION_RATE * ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of the original booking). The remaining {Math.round((1-ADMIN_SHARE_OF_PROMOTER_COMMISSION)*100)}% of the commission is retained by the promoter.</p>
      </div>
    </div>
  );
};

export default PromoterSettlementPage;
