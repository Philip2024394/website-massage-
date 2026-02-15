/**
 * ============================================================================
 * 🚀 FLOATING ACTION BUTTON - QUICK ACTIONS HUB
 * ============================================================================
 * 
 * Floating action button with expandable quick actions menu:
 * - One-tap access to most common therapist actions
 * - Smart positioning and mobile-friendly design
 * - Context-aware actions based on current page
 * - Smooth animations and accessibility support
 * - Customizable action sets and user preferences
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Calendar, Clock, DollarSign, Bell, 
  MessageCircle, Settings, Search, Zap,
  Users, Gift, BarChart as BarChart3, Home, X
} from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  onClick: () => void;
  badge?: number;
  priority: 'high' | 'medium' | 'low';
  contextual?: string[]; // Show only on these pages
}

interface FloatingActionButtonProps {
  onNavigate: (pageId: string) => void;
  currentPage: string;
  therapistData?: any;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onNavigate,
  currentPage,
  therapistData,
  className = "",
  position = 'bottom-right',
  size = 'md',
  showLabel = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fabRef = useRef<HTMLDivElement>(null);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 hover:bg-orange-200',
      onClick: () => onNavigate('bookings'),
      badge: therapistData?.pendingBookings || 2,
      priority: 'high'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100 hover:bg-green-200',
      onClick: () => onNavigate('status'),
      priority: 'high'
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      onClick: () => onNavigate('earnings'),
      priority: 'high'
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 hover:bg-purple-200',
      onClick: () => onNavigate('notifications'),
      badge: 3,
      priority: 'medium'
    },
    {
      id: 'dashboard',
      label: 'Profile Upload',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      onClick: () => onNavigate('dashboard'),
      priority: 'medium'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 hover:bg-indigo-200',
      onClick: () => onNavigate('analytics'),
      priority: 'low',
      contextual: ['dashboard', 'earnings']
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100 hover:bg-teal-200',
      onClick: () => onNavigate('more-customers'),
      priority: 'low'
    },
    {
      id: 'discount',
      label: 'Discount',
      icon: Gift,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 hover:bg-pink-200',
      onClick: () => onNavigate('send-discount'),
      priority: 'low',
      contextual: ['bookings', 'more-customers']
    }
  ];

  // Filter actions based on context and priority
  const getVisibleActions = () => {
    let actions = quickActions.filter(action => 
      !action.contextual || action.contextual.includes(currentPage)
    );

    // Show high priority actions first, limit to 6 for mobile
    actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return actions.slice(0, 6);
  };

  // Handle scroll for auto-hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setIsVisible(!isScrollingDown || currentScrollY < 100);
      setLastScrollY(currentScrollY);
      
      // Close expanded menu on scroll
      if (isScrollingDown && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isExpanded]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Position classes - below floating chat button (chat is above, FAB under)
  const positionClasses = {
    'bottom-right': 'top-32 right-4 sm:top-28 sm:right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const visibleActions = getVisibleActions();

  if (!isVisible) return null;

  return (
    <div
      ref={fabRef}
      className={`fixed z-40 ${positionClasses[position]} ${className}`}
    >
      {/* Quick Action Items - black glass effect, icons, stacked above main button */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-3 space-y-2 animate-fadeIn flex flex-col-reverse">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="relative group animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => {
                    action.onClick();
                    setIsExpanded(false);
                  }}
                  className="w-12 h-12 rounded-full shadow-lg backdrop-blur-md bg-black/40 border border-white/20 text-white
                    flex items-center justify-center transition-all duration-200 transform hover:scale-110 hover:bg-black/60
                    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent relative"
                  aria-label={action.label}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Badge */}
                  {action.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                      w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}
                </button>
                
                {/* Label - left of button on hover */}
                {(showLabel || size === 'sm') && (
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2 
                    bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/10">
                    {action.label}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 
                      border-l-4 border-l-black/80 border-y-4 border-y-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${sizeClasses[size]} bg-gradient-to-r from-orange-500 to-orange-600 
          text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
          transform hover:scale-105 active:scale-95 flex items-center justify-center 
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
          group relative`}
        aria-label={isExpanded ? "Close quick actions" : "Open quick actions"}
      >
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}>
          {isExpanded ? (
            <X className={iconSizeClasses[size]} />
          ) : (
            <Plus className={iconSizeClasses[size]} />
          )}
        </div>
        
        {/* Pulse animation for notifications */}
        {quickActions.some(action => action.badge && action.badge > 0) && !isExpanded && (
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 
          transition-opacity duration-200"></div>
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;