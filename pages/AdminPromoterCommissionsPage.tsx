import React, { useEffect, useState } from 'react';
import { aggregateSettlement, mapRecordBreakdown, CommissionRecord } from '../services/promoterSettlementService';
import { ADMIN_SHARE_OF_PROMOTER_COMMISSION, PROMOTER_BOOKING_COMMISSION_RATE } from '../constants';
import { Client, Databases } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { RefreshCw, Briefcase, TrendingUp, Percent, Wallet, Users } from 'lucide-react';

interface Props { t?: any; onBack?: () => void; }

function makeDatabases(): Databases | null {
  try {
    const client = new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
    return new Databases(client);
  } catch (e) {
    console.warn('Appwrite client init failed (offline mode):', e);
    return null;
  }
}

// For admin we load all commission records (pagination could be added later)
const AdminPromoterCommissionsPage: React.FC<Props> = ({ t, onBack }) => {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const db = makeDatabases();
      if (!db) {
        setRecords([]);
      } else {
        const res: any = await db.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.commissionRecords, []);
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
      console.error('Error loading commission records (admin)', e);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const aggregated = aggregateSettlement(records);
  const perRecord = records.map(mapRecordBreakdown);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promoter Commission Earnings</h1>
            <p className="text-sm text-gray-500">Platform admin share: {Math.round(ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of promoter commission ({Math.round(PROMOTER_BOOKING_COMMISSION_RATE * ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of booking value)</p>
          </div>
        </div>
        <button onClick={load} disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow disabled:opacity-50">
          <RefreshCw className="w-4 h-4" /> {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-10">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Service Volume</div>
          <div className="text-xl font-bold text-gray-800">Rp {aggregated.totalServiceVolume.toLocaleString()}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Gross Promoter</div>
          <div className="text-xl font-bold text-green-600">Rp {aggregated.totalGrossPromoterCommission.toLocaleString()}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Admin Fee</div>
          <div className="text-xl font-bold text-purple-600">Rp {aggregated.totalAdminFee.toLocaleString()}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Promoter Net</div>
          <div className="text-xl font-bold text-emerald-600">Rp {aggregated.totalPromoterNet.toLocaleString()}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Percent className="w-3 h-3" /> Admin % Volume</div>
          <div className="text-xl font-bold text-gray-800">{aggregated.effectiveAdminPercent.toLocaleString()}%</div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Records</div>
          <div className="text-xl font-bold text-gray-800">{aggregated.recordCount}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Pending / Awaiting</p>
          <p className="text-lg font-semibold text-yellow-600">{aggregated.pendingCount + aggregated.awaitingVerificationCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Verified</p>
          <p className="text-lg font-semibold text-green-600">{aggregated.verifiedCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Rejected</p>
          <p className="text-lg font-semibold text-red-600">{aggregated.rejectedCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Effective Admin Retention</p>
          <p className="text-lg font-semibold text-purple-600">{(PROMOTER_BOOKING_COMMISSION_RATE * ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100).toFixed(2)}% of booking</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100">
          <h2 className="text-sm font-semibold text-gray-700">Commission Records ({perRecord.length})</h2>
          <span className="text-xs text-gray-500">Gross total: Rp {aggregated.totalGrossPromoterCommission.toLocaleString()} • Admin fee: Rp {aggregated.totalAdminFee.toLocaleString()}</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading ...</div>
        ) : perRecord.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No commission records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-50 text-xs text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Service Amount</th>
                  <th className="px-4 py-2 text-left">Gross Commission</th>
                  <th className="px-4 py-2 text-left">Admin Fee</th>
                  <th className="px-4 py-2 text-left">Promoter Net</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Affiliate Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {perRecord.map(r => (
                  <tr key={r.$id || Math.random()} className="hover:bg-purple-50">
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

      <div className="mt-10 text-xs text-gray-500 leading-relaxed">
        <p><strong>Admin earnings model:</strong> The platform retains {Math.round(ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of each promoter commission. At a promoter commission rate of {Math.round(PROMOTER_BOOKING_COMMISSION_RATE * 100)}%, this is an effective {Math.round(PROMOTER_BOOKING_COMMISSION_RATE * ADMIN_SHARE_OF_PROMOTER_COMMISSION * 100)}% of the original booking value. Remaining commission ({Math.round((1-ADMIN_SHARE_OF_PROMOTER_COMMISSION)*100)}% of the commission) is payable to promoters.</p>
      </div>
    </div>
  );
};

export default AdminPromoterCommissionsPage;
