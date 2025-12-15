import React from 'react';

interface DashboardHeaderProps {
  _onLogout?: () => void;
  onMenuClick?: () => void;
  t?: (key: string) => string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ _onLogout, onMenuClick, t: _t }) => {

  return (
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
    <div className="text-2xl font-bold tracking-tight text-gray-800">
      {/* Dashboard title removed as requested */}
    </div>
    {onMenuClick && (
      <button 
        onClick={onMenuClick} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )}
  </header>
  );
};

export default DashboardHeader;
