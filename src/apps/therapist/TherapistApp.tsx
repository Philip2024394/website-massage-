// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';

const TherapistApp: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-500 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
        </h1>
        <h2 className="text-xl font-semibold text-white mb-4">Therapist Portal</h2>
        <p className="text-white/80 mb-6">
          Therapist application is under development. This will include schedule management, booking notifications, and earnings tracking.
        </p>
        <div className="text-6xl mb-4">💆</div>
        <div className="text-white/60 text-sm">
          Coming Soon: Full therapist functionality
        </div>
      </div>
    </div>
  );
};

export default TherapistApp;