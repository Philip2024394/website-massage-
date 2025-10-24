import React from 'react';

type DashboardPage = 'confirm-therapists' | 'confirm-places' | 'drawer-buttons';
interface TopNavProps {
  active: DashboardPage;
  onNavigate: (page: DashboardPage) => void;
}

const links: { label: string; page: DashboardPage }[] = [
  { label: 'Confirm Therapists', page: 'confirm-therapists' },
  { label: 'Confirm Places', page: 'confirm-places' },
  { label: 'Drawer Buttons', page: 'drawer-buttons' },
];

const TopNav: React.FC<TopNavProps> = ({ active, onNavigate }) => (
  <nav className="flex gap-6 px-6 pt-4 pb-2 border-b bg-white text-xs font-medium text-gray-500">
    {links.map(link => (
      <button
        key={link.page}
        className={`pb-1 border-b-2 transition-colors duration-150 ${active === link.page ? 'border-brand-green text-brand-green' : 'border-transparent hover:text-brand-green'}`}
        onClick={() => onNavigate(link.page)}
      >
        {link.label}
      </button>
    ))}
  </nav>
);

export default TopNav;
