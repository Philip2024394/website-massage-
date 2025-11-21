import React from 'react';
import { Home } from 'lucide-react';

interface Props {
  onClick: () => void;
  hidden?: boolean;
}

const GlobalHomeButton: React.FC<Props> = ({ onClick, hidden }) => {
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Home"
      className="fixed top-4 left-4 z-[10000] w-12 h-12 bg-orange-600 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all hover:bg-orange-700"
      style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
    >
      <Home className="w-6 h-6 text-white" />
    </button>
  );
};

export default GlobalHomeButton;
