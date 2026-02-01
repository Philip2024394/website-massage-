// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React from 'react';
import { X as CloseIcon } from 'lucide-react';

export interface PartnerNavItem {
  id: string;
  label: string;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'indigo' | 'yellow' | 'teal' | 'emerald' | 'red' | 'purple' | 'gray';
  badge?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PartnersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: PartnerNavItem[];
  onSelect: (id: string) => void;
}

export const PartnersDrawer: React.FC<PartnersDrawerProps> = ({ isOpen, onClose, items, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0" role="dialog" aria-modal="true" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ zIndex: 99999 }}>
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-black">
          <h2 className="font-bold text-2xl">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block" style={{ animation: 'float 6s ease-in-out infinite' }}>S</span>treet</span>
            <span className="ml-2 text-gray-800">Partners</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full transition-colors" aria-label="Close menu">
            <CloseIcon className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Scrollable Menu Content */}
        <nav className="flex-grow  p-4">
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon as any;
              const color = item.color || 'gray';
              const borderClass = `border-${color}-500`;
              const textHover = `group-hover:text-${color}-600`;
              const gradientClass = `from-${color}-500 to-${color}-600`;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    try { onSelect(item.id); } finally { onClose(); }
                  }}
                  className={`flex items-center gap-4 w-full text-left p-4 rounded-xl transition-all border-l-4 ${borderClass} bg-white shadow-sm hover:shadow-md group transform hover:scale-105`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className={`font-semibold text-gray-800 ${textHover} transition-colors`}>{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500">{item.description}</p>
                    )}
                  </div>
                  {!!item.badge && item.badge > 0 && (
                    <span className={`ml-auto text-white text-xs rounded-full px-2.5 py-0.5 font-bold bg-gradient-to-br ${gradientClass}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t"></div>
      </div>
    </div>
  );
};

export default PartnersDrawer;
