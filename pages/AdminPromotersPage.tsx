import React, { useEffect, useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';
import { ToggleLeft, ToggleRight, RefreshCcw } from 'lucide-react';

const AdminPromotersPage: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId || DATABASE_ID,
        (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS,
        [Query.orderDesc('$createdAt'), Query.limit(200)]
      );
      setRows(res.documents || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load promoters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (doc: any) => {
    try {
      const current = (doc.isActive ?? doc.active) ? true : false;
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId || DATABASE_ID,
        (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS,
        doc.$id,
        { isActive: !current }
      );
      await load();
    } catch (e) {
      alert('Failed to update promoter status');
    }
  };

  return (
    <div className="bg-white shadow-sm border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Promoters</h2>
        <button onClick={load} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"><RefreshCcw className="w-4 h-4"/>Refresh</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">WhatsApp</th>
                <th className="px-3 py-2 text-left font-semibold">Active</th>
                <th className="px-3 py-2 text-left font-semibold">Terms</th>
                <th className="px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">No promoters found.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.$id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{r.name || '-'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.$id}</td>
                  <td className="px-3 py-2 text-gray-700">{r.whatsapp || '-'}</td>
                  <td className="px-3 py-2">{(r.isActive ?? r.active) ? <span className="text-green-700">Yes</span> : <span className="text-gray-600">No</span>}</td>
                  <td className="px-3 py-2">{r.acceptedTermsAt ? new Date(r.acceptedTermsAt).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggleActive(r)} className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 inline-flex items-center gap-2">
                      {(r.isActive ?? r.active) ? (<><ToggleLeft className="w-4 h-4"/>Deactivate</>) : (<><ToggleRight className="w-4 h-4"/>Activate</>)}
                    </button>
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

export default AdminPromotersPage;
