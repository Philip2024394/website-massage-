// @ts-nocheck
/**
 * Admin: Emergency alerts from therapist/place 3-tap emergency button.
 * Plays alert sound in loop until admin opens this view and acknowledges all pending alerts.
 */
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertTriangle, MapPin, User, Calendar, CheckCircle } from 'lucide-react';
import { emergencyAlertsService } from '../lib/appwrite';

const EMERGENCY_SOUND_URL = '/sounds/alert-notification.mp3';
const POLL_INTERVAL_MS = 5000;

interface EmergencyAlert {
  $id: string;
  therapistId: string;
  therapistName: string;
  providerType: string;
  lat?: number;
  lng?: number;
  triggeredAt: string;
  bookingId?: string;
  customerName?: string;
  bookingSummary?: string;
  status: string;
  acknowledgedAt?: string;
}

interface AdminEmergencyAlertsProps {
  onBack: () => void;
}

export default function AdminEmergencyAlerts({ onBack }: AdminEmergencyAlertsProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [pending, setPending] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAlerts = async () => {
    try {
      const list = filter === 'pending'
        ? await emergencyAlertsService.listPending()
        : await emergencyAlertsService.listAll();
      setAlerts(Array.isArray(list) ? list : []);
      const pendingList = (list || []).filter((a: EmergencyAlert) => a.status === 'pending');
      setPending(pendingList);
    } catch (e) {
      console.error('Failed to fetch emergency alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [filter]);

  // Play sound in loop while there are pending alerts
  useEffect(() => {
    if (pending.length === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }
    try {
      const audio = new Audio(EMERGENCY_SOUND_URL);
      audio.loop = true;
      audio.volume = 0.8;
      audio.play().catch(() => {});
      audioRef.current = audio;
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } catch {
      // ignore
    }
  }, [pending.length]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await emergencyAlertsService.acknowledge(alertId);
      await fetchAlerts();
    } catch (e) {
      console.error('Failed to acknowledge:', e);
    }
  };

  const mapUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

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
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Emergency Alerts
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
              {pending.length} pending — sound on until acknowledged
            </span>
          )}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'pending' | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="pending">Pending only</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <p className="text-sm text-gray-600 mb-4">
          Therapists and places can trigger an emergency alert (3 taps) during booking windows. Acknowledge each alert to stop the alert sound.
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No emergency alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((a) => (
              <div
                key={a.$id}
                className={`rounded-xl border-2 overflow-hidden ${
                  a.status === 'pending' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-bold text-gray-900">{a.therapistName}</span>
                        {a.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">PENDING</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        {a.triggeredAt ? new Date(a.triggeredAt).toLocaleString() : '—'}
                      </div>
                      {a.customerName && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">With:</span> {a.customerName}
                          {a.bookingSummary && ` • ${a.bookingSummary}`}
                        </p>
                      )}
                      {a.lat != null && a.lng != null && (
                        <a
                          href={mapUrl(a.lat, a.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm mt-2"
                        >
                          <MapPin className="w-4 h-4" />
                          View location on map
                        </a>
                      )}
                    </div>
                    {a.status === 'pending' && (
                      <button
                        onClick={() => handleAcknowledge(a.$id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Acknowledge
                      </button>
                    )}
                    {a.status === 'acknowledged' && a.acknowledgedAt && (
                      <span className="text-sm text-gray-500">
                        Acknowledged {new Date(a.acknowledgedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
