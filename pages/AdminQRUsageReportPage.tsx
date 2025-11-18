import React, { useEffect, useState } from 'react';
import { qrUsageService } from '../lib/qrUsageService';
import { account } from '../lib/appwrite';

// Simple admin page; gating can be enhanced later (e.g., check admin collection)
const AdminQRUsageReportPage: React.FC<{ t?: any; onBack?: () => void }> = ({ t, onBack }) => {
  const [summary, setSummary] = useState<{ total: number; byUsage: Record<string, number>; byVenue: Record<string, number>; actions: Record<string, number> } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await account.get();
        if (!mounted) return;
        setUserId((me as any).$id || '');
      } catch {}
      try {
        const [s, l] = await Promise.all([
          qrUsageService.getSummary(),
          qrUsageService.listLogs({ limit: 500 })
        ]);
        if (!mounted) return;
        setSummary(s);
        setLogs(l);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load usage logs');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const sortedUsage = summary ? Object.entries(summary.byUsage).sort((a,b)=> b[1]-a[1]) : [];
  const sortedVenue = summary ? Object.entries(summary.byVenue).sort((a,b)=> b[1]-a[1]) : [];
  const sortedActions = summary ? Object.entries(summary.actions).sort((a,b)=> b[1]-a[1]) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">QR Usage Report</h1>
          {onBack && <button onClick={onBack} className="text-sm text-blue-600 hover:underline">Back</button>}
        </div>
        {loading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {summary && !loading && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Usage Types</h2>
              <ul className="space-y-1 text-sm">
                {sortedUsage.map(([u,c]) => <li key={u} className="flex justify-between"><span className="capitalize">{u}</span><span className="font-mono">{c}</span></li>)}
                {!sortedUsage.length && <li className="text-gray-500">None</li>}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Top Venues</h2>
              <ul className="space-y-1 text-sm max-h-60 overflow-auto">
                {sortedVenue.map(([v,c]) => <li key={v} className="flex justify-between"><span className="truncate max-w-[160px]" title={v}>{v}</span><span className="font-mono">{c}</span></li>)}
                {!sortedVenue.length && <li className="text-gray-500">None</li>}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Actions</h2>
              <ul className="space-y-1 text-sm">
                {sortedActions.map(([a,c]) => <li key={a} className="flex justify-between"><span className="capitalize">{a}</span><span className="font-mono">{c}</span></li>)}
                {!sortedActions.length && <li className="text-gray-500">None</li>}
              </ul>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Logs ({logs.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-1">Time</th>
                  <th className="text-left px-2 py-1">Affiliate</th>
                  <th className="text-left px-2 py-1">Usage</th>
                  <th className="text-left px-2 py-1">Venue</th>
                  <th className="text-left px-2 py-1">Action</th>
                  <th className="text-left px-2 py-1">URL</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => {
                  const dt = l.createdAt || l.$createdAt || '';
                  return (
                    <tr key={l.$id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap" title={dt}>{dt.slice(0,19).replace('T',' ')}</td>
                      <td className="px-2 py-1 font-mono text-xs">{l.affiliateCode}</td>
                      <td className="px-2 py-1 capitalize">{l.usageType}</td>
                      <td className="px-2 py-1" title={l.venueName}>{l.venueName || '-'}</td>
                      <td className="px-2 py-1 capitalize">{l.actionType}</td>
                      <td className="px-2 py-1 max-w-[220px] truncate" title={l.shareUrl}>{l.shareUrl}</td>
                    </tr>
                  );
                })}
                {!logs.length && !loading && (
                  <tr><td colSpan={6} className="px-2 py-4 text-center text-gray-500">No logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQRUsageReportPage;
