import React, { useState } from 'react';
import { Power, Clock, CheckCircle, XCircle } from 'lucide-react';
import TherapistLayout from '../../components/therapist/TherapistLayout';

interface TherapistOnlineStatusProps {
  therapist: any;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistOnlineStatusPageFixed: React.FC<TherapistOnlineStatusProps> = ({ 
  therapist, 
  onBack, 
  onRefresh, 
  onNavigate, 
  onLogout, 
  language = 'id' 
}) => {
  const [currentStatus, setCurrentStatus] = useState(therapist?.status || 'offline');

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    console.log('Status changed to:', newStatus);
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="status"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Status Online
            </h1>
            <p className="text-gray-600">
              Atur status ketersediaan Anda
            </p>
          </div>

          {/* Current Status Display */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Status Saat Ini
            </h2>
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                currentStatus === 'available' ? 'bg-green-500' :
                currentStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-medium text-gray-800">
                {currentStatus === 'available' ? 'Tersedia' :
                 currentStatus === 'busy' ? 'Sibuk' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Status Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ubah Status
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Available */}
              <button
                onClick={() => handleStatusChange('available')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentStatus === 'available'
                    ? 'bg-green-50 border-green-500'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                  currentStatus === 'available' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-semibold text-gray-600">Tersedia</p>
              </button>

              {/* Busy */}
              <button
                onClick={() => handleStatusChange('busy')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentStatus === 'busy'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <Clock className={`w-8 h-8 mx-auto mb-2 ${
                  currentStatus === 'busy' ? 'text-yellow-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-semibold text-gray-600">Sibuk</p>
              </button>

              {/* Offline */}
              <button
                onClick={() => handleStatusChange('offline')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentStatus === 'offline'
                    ? 'bg-red-50 border-red-500'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                  currentStatus === 'offline' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-semibold text-gray-600">Offline</p>
              </button>

              {/* Active */}
              <button
                onClick={() => handleStatusChange('active')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentStatus === 'active'
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Power className={`w-8 h-8 mx-auto mb-2 ${
                  currentStatus === 'active' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="text-sm font-semibold text-gray-600">Aktif</p>
              </button>
            </div>
          </div>

          {/* Therapist Info */}
          {therapist && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Profil Terapis
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Nama:</strong> {therapist.name || 'Loading...'}</p>
                <p><strong>Email:</strong> {therapist.email || 'Loading...'}</p>
                <p><strong>Status:</strong> {therapist.status || 'Loading...'}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Aksi Cepat
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleNavigate('therapist-bookings')}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Lihat Booking
              </button>
              <button 
                onClick={() => handleNavigate('therapist-earnings')}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Lihat Penghasilan
              </button>
            </div>
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistOnlineStatusPageFixed;