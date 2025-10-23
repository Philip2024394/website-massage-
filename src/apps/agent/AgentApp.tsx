import React from 'react';

const AgentApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-500 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
        </h1>
        <h2 className="text-xl font-semibold text-white mb-4">Agent Portal</h2>
        <p className="text-white/80 mb-6">
          Agent application is under development. This will include referral management, commission tracking, and performance analytics.
        </p>
        <div className="text-6xl mb-4">💼</div>
        <div className="text-white/60 text-sm">
          Coming Soon: Full agent functionality
        </div>
      </div>
    </div>
  );
};

export default AgentApp;