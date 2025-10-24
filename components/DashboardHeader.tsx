import React from 'react';

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
    <div className="text-xl font-bold tracking-tight text-brand-green">indostreet</div>
    <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100" title="Logout">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
    </button>
  </header>
);

export default DashboardHeader;
