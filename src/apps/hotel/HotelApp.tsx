import React from 'react';

const HotelApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
        </h1>
        <h2 className="text-xl font-semibold text-white mb-4">Hotel Portal</h2>
        <p className="text-white/80 mb-6">
          Hotel application is under development. This will include guest services, QR menu management, and provider coordination.
        </p>
        <div className="text-6xl mb-4">🏨</div>
        <div className="text-white/60 text-sm">
          Coming Soon: Full hotel functionality
        </div>
      </div>
    </div>
  );
};

export default HotelApp;