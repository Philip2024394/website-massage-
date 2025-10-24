import React from 'react';

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
    <div className="text-2xl font-bold tracking-tight">
      <span className="text-black">Indo</span>
      <span className="text-orange-500">Street</span>
    </div>
    <button 
      onClick={onLogout} 
      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" 
      title="Logout"
    >
      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
      <span className="text-black font-medium text-sm">Logout</span>
    </button>
  </header>
);

export default DashboardHeader;
