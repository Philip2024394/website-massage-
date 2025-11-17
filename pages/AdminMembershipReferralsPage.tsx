import React, { useEffect, useMemo, useState } from 'react';
import { membershipReferralService, type MembershipReferral } from '../lib/membershipReferralService';
import { RefreshCcw, Filter, CheckCircle2, DollarSign, FileDown } from 'lucide-react';

const formatCurrency = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const AdminMembershipReferralsPage: React.FC = () => {
  const [rows, setRows] = useState<MembershipReferral[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'paid'>('pending');
  const [affiliate, setAffiliate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipReferralService.listAll({
        status: status === 'all' ? undefined : status,
        affiliateCode: affiliate || undefined,
        limit: 500,
      });
      setRows(data);
      setSelected({});
    } catch (e: any) {
      setError(e?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const sumBy = (pred: (r: any) => boolean) => rows.filter(pred).reduce((s, r: any) => s + Number(r.commissionAmount || 0), 0);
    return {
      pending: sumBy(r => (r.status || 'pending') === 'pending'),
      approved: sumBy(r => (r.status || 'pending') === 'approved'),
      paid: sumBy(r => (r.status || 'pending') === 'paid'),
    };
  }, [rows]);

  const setRowStatus = async (id: string, next: 'pending' | 'approved' | 'paid') => {
    try {
      await membershipReferralService.updateStatus(id, next);
      await load();
    } catch {
      alert('Failed to update status');
    }
  };

  const bulkUpdate = async (next: 'approved' | 'paid') => {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) { alert('No rows selected'); return; }
    try {
      for (const id of ids) {
        await membershipReferralService.updateStatus(id, next);
      }
      await load();
    } catch {
      alert('Bulk update failed');
    }
  };

  const exportCsv = () => {
    const header = ['Created At','Affiliate Code','Referred Type','Referred Id','Plan Id','Plan Price','Rate','Commission','Status'];
    const lines = rows.map((r: any) => [
      r.createdAt || r.$createdAt || '',
      r.affiliateCode || '',
      r.referredType || '',
      r.referredId || '',
      r.planId || '',
      r.planPrice || 0,
      r.commissionRate || 0,
      r.commissionAmount || 0,
      r.status || 'pending',
    ]);
    const csv = [header, ...lines].map(arr => arr.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membership_referrals_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-sm border rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">Membership Referrals</h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 inline-flex items-center gap-2"><RefreshCcw className="w-4 h-4"/>Refresh</button>
          <button onClick={exportCsv} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 inline-flex items-center gap-2"><FileDown className="w-4 h-4"/>CSV</button>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-sm text-orange-800">
        Admin clarification: Membership fees are paid by Indastreet to the bank accounts displayed on the Membership Payment page. Only bank transfers are supported.
      </div>

      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Status</label>
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
            <button onClick={load} className="px-2 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200 inline-flex items-center gap-1"><Filter className="w-4 h-4"/>Apply</button>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Affiliate Code</label>
          <input value={affiliate} onChange={e => setAffiliate(e.target.value)} placeholder="userId / promoter code" className="border rounded px-2 py-1 text-sm min-w-[220px]" />
        </div>
        <div className="ml-auto flex gap-2 text-sm items-center flex-wrap">
          <button onClick={() => bulkUpdate('approved')} className="px-3 py-1.5 bg-green-50 text-green-800 rounded border border-green-200 hover:bg-green-100">Bulk Approve</button>
          <button onClick={() => bulkUpdate('paid')} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded border border-blue-200 hover:bg-blue-100">Bulk Mark Paid</button>
          <div>Pending: <span className="font-semibold">{formatCurrency(totals.pending)}</span></div>
          <div>Approved: <span className="font-semibold">{formatCurrency(totals.approved)}</span></div>
          <div>Paid: <span className="font-semibold">{formatCurrency(totals.paid)}</span></div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 text-left font-semibold"><input type="checkbox" onChange={e => {
                  const checked = e.target.checked; 
                  const next: Record<string, boolean> = {}; 
                  for (const r of rows as any[]) next[(r as any).$id] = checked; 
                  setSelected(next);
                }} /></th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
                <th className="px-3 py-2 text-left font-semibold">Affiliate</th>
                <th className="px-3 py-2 text-left font-semibold">Referred</th>
                <th className="px-3 py-2 text-left font-semibold">Plan</th>
                <th className="px-3 py-2 text-left font-semibold">Price</th>
                <th className="px-3 py-2 text-left font-semibold">Rate</th>
                <th className="px-3 py-2 text-left font-semibold">Commission</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-gray-500">No referrals.</td>
                </tr>
              )}
              {rows.map((r: any) => (
                <tr key={r.$id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 align-top"><input type="checkbox" checked={!!selected[r.$id]} onChange={e => setSelected(s => ({ ...s, [r.$id]: e.target.checked }))} /></td>
                  <td className="px-3 py-2 text-xs text-gray-700">{(r.createdAt || r.$createdAt) ? new Date(r.createdAt || r.$createdAt).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.affiliateCode || '—'}</td>
                  <td className="px-3 py-2 text-gray-700">{r.referredType || '—'}<div className="text-xs text-gray-500">{r.referredId || ''}</div></td>
                  <td className="px-3 py-2 text-gray-700">{r.planId}</td>
                  <td className="px-3 py-2">{formatCurrency(Number(r.planPrice || 0))}</td>
                  <td className="px-3 py-2">{Math.round((Number(r.commissionRate || 0)) * 100)}%</td>
                  <td className="px-3 py-2 font-semibold">{formatCurrency(Number(r.commissionAmount || 0))}</td>
                  <td className="px-3 py-2">{(r.status || 'pending')}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => setRowStatus(r.$id, 'approved')} className="px-2 py-1.5 rounded text-xs font-medium bg-green-50 text-green-800 hover:bg-green-100 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Approve</button>
                      <button onClick={() => setRowStatus(r.$id, 'paid')} className="px-2 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 inline-flex items-center gap-1"><DollarSign className="w-4 h-4"/>Mark Paid</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMembershipReferralsPage;
