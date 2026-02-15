// @ts-nocheck
/**
 * Admin: Therapist location tracking for safety monitoring.
 * Shows last known GPS (geopoint/coordinates) and last updated time.
 * Therapists agree to location monitoring in Terms; this view is for admin use when needed.
 */
import React, { useState, useMemo } from 'react';
import { MapPin, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';

interface TherapistWithLocation {
  $id: string;
  name: string;
  status?: string;
  location?: string;
  locationId?: string;
  city?: string;
  geopoint?: { lat: number; lng: number };
  coordinates?: string | number[] | { lat: number; lng: number };
  lastLocationUpdateAt?: string;
  $updatedAt?: string;
}

interface AdminLocationTrackingProps {
  therapists: TherapistWithLocation[];
  onBack: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

function getCoords(t: TherapistWithLocation): { lat: number; lng: number } | null {
  if (t.geopoint && typeof t.geopoint.lat === 'number' && typeof t.geopoint.lng === 'number') {
    return t.geopoint;
  }
  if (t.coordinates) {
    try {
      if (Array.isArray(t.coordinates)) {
        const arr = t.coordinates as number[];
        if (arr.length >= 2) return { lat: arr[1], lng: arr[0] };
      }
      if (typeof t.coordinates === 'string') {
        const parsed = JSON.parse(t.coordinates);
        if (parsed.lat != null && parsed.lng != null) return { lat: parsed.lat, lng: parsed.lng };
        if (Array.isArray(parsed) && parsed.length >= 2) return { lat: parsed[1], lng: parsed[0] };
      }
      if (typeof t.coordinates === 'object' && (t.coordinates as any).lat != null) {
        return (t.coordinates as any) as { lat: number; lng: number };
      }
    } catch (_) {}
  }
  return null;
}

function formatLastUpdated(lastLocationUpdateAt?: string, $updatedAt?: string): string {
  const dateStr = lastLocationUpdateAt || $updatedAt;
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

const AdminLocationTracking: React.FC<AdminLocationTrackingProps> = ({
  therapists,
  onBack,
  onRefresh,
  loading = false
}) => {
  const [search, setSearch] = useState('');
  const [filterHasLocation, setFilterHasLocation] = useState<'all' | 'yes' | 'no'>('all');

  const rows = useMemo(() => {
    let list = therapists.map((t) => ({
      ...t,
      coords: getCoords(t),
      lastUpdated: formatLastUpdated(t.lastLocationUpdateAt, t.$updatedAt),
      area: t.locationId || t.city || t.location || '—'
    }));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.area?.toLowerCase().includes(q)
      );
    }
    if (filterHasLocation === 'yes') list = list.filter((r) => r.coords);
    if (filterHasLocation === 'no') list = list.filter((r) => !r.coords);
    return list;
  }, [therapists, search, filterHasLocation]);

  const mapUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Location Tracking</h1>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <p className="text-sm text-gray-600 mb-4">
          Last known location for therapists (for safety monitoring). Providers agree to this in our terms. Use when needed for incident response or support.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64"
          />
          <select
            value={filterHasLocation}
            onChange={(e) => setFilterHasLocation(e.target.value as 'all' | 'yes' | 'no')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="yes">Has location</option>
            <option value="no">No location</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Therapist</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Area</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last updated</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Map</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No therapists match the filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.$id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{r.name || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{r.status || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{r.area}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {r.coords
                          ? `${r.coords.lat.toFixed(5)}, ${r.coords.lng.toFixed(5)}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{r.lastUpdated}</td>
                      <td className="py-3 px-4">
                        {r.coords ? (
                          <a
                            href={mapUrl(r.coords.lat, r.coords.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on map
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocationTracking;
