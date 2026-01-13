/**
 * FloatingButtonManager - Enhanced floating button system with URL mapping
 * Renders floating buttons based on current page and user role with proper URL navigation
 */

import React, { useState } from 'react';
import { 
  MessageCircle, 
  Calendar, 
  ExternalLink, 
  Bell, 
  Clock, 
  Phone, 
  MessageSquare, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useFloatingButtonNavigation } from '../hooks/useFloatingButtonNavigation';
import type { Page } from '../types/pageTypes';

const iconMap = {
  MessageCircle,
  Calendar,
  ExternalLink,
  Bell,
  Clock,
  Phone,
  MessageSquare,
  HelpCircle,
  Menu,
  X
};

interface FloatingButtonManagerProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userRole?: string;
  className?: string;
}

export const FloatingButtonManager: React.FC<FloatingButtonManagerProps> = ({
  currentPage,
  setPage,
  userRole = 'guest',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { availableButtons, navigateToButton, openButtonInNewTab } = useFloatingButtonNavigation({
    currentPage,
    setPage,
    userRole
  });

  // Group buttons by position
  const buttonsByPosition = availableButtons.reduce((acc, button) => {
    if (!acc[button.position]) acc[button.position] = [];
    acc[button.position].push(button);
    return acc;
  }, {} as Record<string, typeof availableButtons>);

  const handleButtonClick = (buttonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // If Ctrl/Cmd + Click, open in new tab
    if (event.ctrlKey || event.metaKey) {
      openButtonInNewTab(buttonId);
    } else {
      navigateToButton(buttonId);
    }
  };

  const renderButton = (button: typeof availableButtons[0], index: number) => {
    const IconComponent = iconMap[button.icon as keyof typeof iconMap] || HelpCircle;
    
    return (
      <button
        key={button.id}
        onClick={(e) => handleButtonClick(button.id, e)}
        className={`
          relative bg-black/20 backdrop-blur-md border border-white/10
          text-white rounded-2xl shadow-2xl
          transition-all duration-500 transform 
          hover:scale-110 hover:bg-black/40 hover:border-white/20
          active:scale-95 active:bg-black/60
          w-12 h-12 md:w-14 md:h-14
          flex items-center justify-center
          group overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-br 
          before:from-white/5 before:to-transparent before:rounded-2xl
          after:absolute after:inset-0 after:bg-gradient-to-t 
          after:from-black/20 after:to-transparent after:rounded-2xl
        `}
        style={{
          animationDelay: `${index * 100}ms`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `
        }}
        title={button.description}
        aria-label={button.name}
      >
        <IconComponent className="w-5 h-5 md:w-6 md:h-6 relative z-10 drop-shadow-lg" />
        
        {/* Glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Tooltip with glass effect */}
        <div className="
          absolute right-full mr-3 px-4 py-2 
          bg-black/80 backdrop-blur-md border border-white/10
          text-white text-sm font-medium
          rounded-xl opacity-0 group-hover:opacity-100 
          transition-all duration-300 transform group-hover:translate-x-0 translate-x-2
          pointer-events-none whitespace-nowrap z-50
          shadow-2xl
        "
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          {button.name}
          <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-l-black/80 border-t-transparent border-b-transparent transform -translate-y-1/2"></div>
        </div>
      </button>
    );
  };

  const renderButtonGroup = (position: string, buttons: typeof availableButtons) => {
    if (buttons.length === 0) return null;

    const positionClasses = {
      'bottom-right': 'bottom-4 right-4 flex-col-reverse',
      'bottom-left': 'bottom-4 left-4 flex-col-reverse',
      'top-right': 'top-4 right-4 flex-col',
      'top-left': 'top-4 left-4 flex-col'
    };

    const positionClass = positionClasses[position as keyof typeof positionClasses] || positionClasses['bottom-right'];

    // If multiple buttons in same position, show as expandable menu
    if (buttons.length > 1) {
      return (
        <div key={position} className={`fixed ${positionClass} z-50 flex gap-3 ${className}`}>
          {/* Menu Toggle Button with glass effect */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              relative bg-black/30 backdrop-blur-md border border-white/20
              text-white rounded-2xl shadow-2xl 
              transition-all duration-500 transform 
              hover:scale-110 hover:bg-black/50 hover:border-white/30
              active:scale-95 active:bg-black/70
              w-14 h-14 flex items-center justify-center
              group overflow-hidden
              before:absolute before:inset-0 before:bg-gradient-to-br 
              before:from-white/10 before:to-transparent before:rounded-2xl
              after:absolute after:inset-0 after:bg-gradient-to-t 
              after:from-black/30 after:to-transparent after:rounded-2xl
            `}
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: `
                0 12px 48px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 0, 0, 0.15)
              `
            }}
            title={isExpanded ? 'Close menu' : 'Open quick actions'}
            aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
          >
            {isExpanded ? 
              <X className="w-6 h-6 relative z-10 drop-shadow-lg transition-transform duration-300 rotate-0 group-hover:rotate-90" /> : 
              <Menu className="w-6 h-6 relative z-10 drop-shadow-lg transition-transform duration-300 group-hover:rotate-180" />
            }
            
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Notification badge with glass effect */}
            {buttons.some(b => b.id === 'notifications' || b.id === 'support-chat') && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/90 backdrop-blur-sm border border-red-400/50 rounded-full shadow-lg animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-transparent rounded-full"></div>
              </div>
            )}
          </button>

          {/* Expandable Button List with glass container */}
          {isExpanded && (
            <div className={`
              flex ${position.includes('bottom') ? 'flex-col-reverse' : 'flex-col'} 
              gap-3 animate-fade-in-up
              p-3 rounded-2xl
              bg-black/20 backdrop-blur-md border border-white/10
              shadow-2xl
            `}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)'
            }}>
              {buttons.map((button, index) => renderButton(button, index))}
            </div>
          )}
        </div>
      );
    } else {
      // Single button - show directly with glass effect
      return (
        <div key={position} className={`fixed ${positionClass} z-50 flex gap-3 ${className}`}>
          <div className="relative group">
            {renderButton(buttons[0], 0)}
            
            {/* Floating glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-150"></div>
          </div>
        </div>
      );
    }
  };

  // Don't render if no buttons available
  if (availableButtons.length === 0) return null;

  return (
    <>
      {Object.entries(buttonsByPosition).map(([position, buttons]) =>
        renderButtonGroup(position, buttons)
      )}
      
      {/* Click outside to close expanded menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Add CSS animations and glass effects */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            backdrop-filter: blur(12px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Glass morphism enhancements */
        @supports (backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px)) {
          .glass-effect {
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .glass-effect:hover {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }

        /* Fallback for browsers without backdrop-filter support */
        @supports not ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
          .glass-effect {
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }

        /* Enhanced shadow effects */
        .modern-shadow {
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }

        .modern-shadow:hover {
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </>
  );
};

export default FloatingButtonManager;