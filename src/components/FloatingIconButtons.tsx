import React, { useState, useEffect } from 'react';
import { Home, Search, MessageCircle, Calendar, User } from 'lucide-react';
import type { Page } from '../types/pageTypes';

interface FloatingIconButtonsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userRole?: 'customer' | 'therapist' | 'place' | 'admin';
}

interface IconButton {
  id: Page;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  label: string;
  pages?: Page[]; // Pages where this button should appear
}

const iconButtons: IconButton[] = [
  {
    id: 'home',
    icon: Home,
    color: '#3B82F6', // Blue
    label: 'Home',
  },
  {
    id: 'advanced-search',
    icon: Search,
    color: '#F5C77A', // Gold
    label: 'Filter',
  },
  {
    id: 'chat',
    icon: MessageCircle,
    color: '#22C55E', // Green
    label: 'Chat',
  },
  {
    id: 'booking-details',
    icon: Calendar,
    color: '#8B5CF6', // Purple
    label: 'Bookings',
  },
  {
    id: 'profile',
    icon: User,
    color: '#64748B', // Gray
    label: 'Profile',
  },
];

export const FloatingIconButtons: React.FC<FloatingIconButtonsProps> = ({
  currentPage,
  onNavigate,
  userRole = 'customer',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredButton, setHoveredButton] = useState<Page | null>(null);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Filter buttons based on current page (exclude current page button)
  const visibleButtons = iconButtons.filter(btn => btn.id !== currentPage);

  if (visibleButtons.length === 0) return null;

  return (
    <div
      className={`fixed right-4 flex flex-col gap-3.5 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24 pointer-events-none'
      }`}
      style={{
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {visibleButtons.map((button) => {
        const Icon = button.icon;
        const isHovered = hoveredButton === button.id;
        
        return (
          <div
            key={button.id}
            className="relative"
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {/* Tooltip Label - Shows on hover */}
            <div
              className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap pointer-events-none transition-all duration-200 ${
                isHovered
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2'
              }`}
              style={{
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              {button.label}
            </div>

            {/* Circular Icon Button */}
            <button
              onClick={() => onNavigate(button.id)}
              className="floating-icon-btn group"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: button.color,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              aria-label={button.label}
              title={button.label}
            >
              <Icon
                size={22}
                strokeWidth={2}
                style={{
                  transition: 'transform 0.15s ease',
                }}
                className="group-hover:scale-110"
              />

              {/* Hover Glow Effect */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  boxShadow: `0 0 0 6px ${button.color}26`, // 26 = 15% opacity in hex
                }}
              />
            </button>
          </div>
        );
      })}

      {/* Add active state CSS */}
      <style>{`
        .floating-icon-btn:active {
          transform: scale(0.94);
        }
        
        @media (max-width: 768px) {
          .floating-icon-btn {
            width: 56px !important;
            height: 56px !important;
          }
        }
        
        @media (min-width: 769px) {
          .floating-icon-btn {
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingIconButtons;
