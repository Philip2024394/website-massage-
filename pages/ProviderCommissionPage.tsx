import React, { useEffect, useMemo, useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

const ProviderCommissionPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void; loggedInProvider?: { id: string | number; type: 'therapist' | 'place' } | null }> = ({ t, onBack, onNavigate, loggedInProvider }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState(false);
  const [promoters, setPromoters] = useState<Record<string, any>>({});

  const providerId = useMemo(() => (loggedInProvider?.id ? String(loggedInProvider.id) : ''), [loggedInProvider]);
  const colId = (APPWRITE_CONFIG.collections as any)?.affiliateAttributions;

  const refresh = async () => {
    if (!providerId || !colId) { setRows([]); return; }
    setLoading(true);
    try {
      const res = await databases.listDocuments(APPWRITE_CONFIG.databaseId, colId, [
        Query.equal('providerId', providerId),
        Query.orderDesc('$createdAt'),
        Query.limit(500)
      ]);
      setRows(res.documents || []);
      // Fetch promoter bank details for unique affiliate codes
      const codes = Array.from(new Set((res.documents || []).map((d: any) => String(d.affiliateCode || '')))).filter(Boolean);
      const map: Record<string, any> = {};
      for (const code of codes) {
        try {
          const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROMOTERS, code);
          map[code] = doc;
        } catch { /* ignore */ }
      }
      setPromoters(map);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [providerId]);

  const totals = useMemo(() => {
    const out = { pending: 0, approved: 0, paid: 0, amountPending: 0, amountApproved: 0, amountPaid: 0 } as any;
    for (const r of rows) {
      const st = String(r.commissionStatus || 'pending').toLowerCase();
      const amt = Number(r.commissionAmount || 0);
      if (st === 'pending') { out.pending++; out.amountPending += amt; }
      else if (st === 'approved') { out.approved++; out.amountApproved += amt; }
      else if (st === 'paid') { out.paid++; out.amountPaid += amt; }
    }
    return out;
  }, [rows]);

  const markPaid = async () => {
    if (!colId) return;
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) { alert('Select at least one row'); return; }
    setUpdating(true);
    try {
      for (const id of ids) {
        await databases.updateDocument(APPWRITE_CONFIG.databaseId, colId, id, { commissionStatus: 'paid', paidAt: new Date().toISOString() });
      }
      await refresh();
      setSelected({});
      alert('Marked as paid');
    } catch {
      alert('Failed to update some rows');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Provider Commissions</h1>
        <button onClick={markPaid} disabled={updating} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Mark Paid</button>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
          Pay commissions within 48 hours directly to the promoter's bank account shown below for each attributed booking.
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-2xl font-bold">{totals.pending}</div>
            <div className="text-xs text-gray-500">Rp {totals.amountPending.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Approved</div>
            <div className="text-2xl font-bold">{totals.approved}</div>
            <div className="text-xs text-gray-500">Rp {totals.amountApproved.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500">Paid</div>
            <div className="text-2xl font-bold">{totals.paid}</div>
            <div className="text-xs text-gray-500">Rp {totals.amountPaid.toLocaleString()}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-600">No attributed bookings found.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y">
            {rows.map((r: any) => {
              const id = r.$id;
              const checked = !!selected[id];
              const promo = promoters[String(r.affiliateCode || '')];
              return (
                <label key={id} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-1">
                    <input type="checkbox" checked={checked} onChange={(e) => setSelected(s => ({ ...s, [id]: e.target.checked }))} />
                  </div>
                  <div className="sm:col-span-5">
                    <div className="font-semibold text-gray-900">Booking #{r.bookingId || id}</div>
                    <div className="text-xs text-gray-500">Affiliate: {r.affiliateCode} • {new Date(r.$createdAt || r.createdAt).toLocaleString()}</div>
                    {promo && (
                      <div className="mt-2 text-xs text-gray-700">
                        <div className="font-semibold text-gray-900">Pay To</div>
                        <div>{promo.accountHolderName || '-'} • {promo.bankName || '-'} • {promo.accountNumber || '-'}</div>
                        {promo.whatsapp && (<div>WhatsApp: {promo.whatsapp}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-3 text-sm">
                    <div className="text-gray-500">Status</div>
                    <div className="font-semibold">{String(r.commissionStatus || 'pending').toUpperCase()}</div>
                  </div>
                  <div className="sm:col-span-3 text-right">
                    <div className="text-gray-500 text-sm">Commission</div>
                    <div className="font-semibold">Rp {(Number(r.commissionAmount || 0)).toLocaleString()}</div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderCommissionPage;
