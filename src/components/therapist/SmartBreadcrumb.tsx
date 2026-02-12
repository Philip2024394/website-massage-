/**
 * ============================================================================
 * 🧭 SMART BREADCRUMB NAVIGATION - CONTEXT AWARENESS
 * ============================================================================
 * 
 * Intelligent breadcrumb system with:
 * - Dynamic path generation based on current context
 * - Quick navigation to parent sections
 * - Mobile-responsive with collapsing/expanding
 * - Context-sensitive actions and shortcuts
 * - Visual hierarchy with proper styling
 * 
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { Play as ChevronRight, Home, Calendar, DollarSign, User, Settings, Bell, BarChart as BarChart3, Users, Gift, Clock, ChevronDown} from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  isClickable: boolean;
  color?: string;
}

interface SmartBreadcrumbProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
  therapistData?: any;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// Page hierarchy and metadata
const PAGE_HIERARCHY: Record<string, {
  parent?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  color: string;
  description?: string;
}> = {
  'home': {
    label: 'Home',
    icon: Home,
    category: 'main',
    color: 'text-gray-700'
  },
  'dashboard': {
    parent: 'home',
    label: 'Dashboard',
    icon: User,
    category: 'business',
    color: 'text-blue-600',
    description: 'Your profile and main dashboard'
  },
  'bookings': {
    parent: 'home',
    label: 'Bookings',
    icon: Calendar,
    category: 'bookings',
    color: 'text-orange-600',
    description: 'Manage your appointments'
  },
  'status': {
    parent: 'bookings',
    label: 'Online Status',
    icon: Clock,
    category: 'bookings',
    color: 'text-green-600',
    description: 'Control your availability'
  },
  'earnings': {
    parent: 'home',
    label: 'Earnings',
    icon: DollarSign,
    category: 'financial',
    color: 'text-green-600',
    description: 'View your income and payouts'
  },
  'payment': {
    parent: 'earnings',
    label: 'Payment Proof',
    icon: DollarSign,
    category: 'financial',
    color: 'text-green-500',
    description: 'Submit payment verification'
  },
  'commission-payment': {
    parent: 'earnings',
    label: 'Commission',
    icon: DollarSign,
    category: 'financial',
    color: 'text-green-500',
    description: 'Commission payments'
  },
  'analytics': {
    parent: 'dashboard',
    label: 'Analytics',
    icon: BarChart3,
    category: 'business',
    color: 'text-indigo-600',
    description: 'Performance insights'
  },
  'more-customers': {
    parent: 'dashboard',
    label: 'More Customers',
    icon: Users,
    category: 'business',
    color: 'text-teal-600',
    description: 'Grow your customer base'
  },
  'notifications': {
    parent: 'home',
    label: 'Notifications',
    icon: Bell,
    category: 'tools',
    color: 'text-purple-600',
    description: 'Manage your alerts'
  },
  'send-discount': {
    parent: 'more-customers',
    label: 'Send Discount',
    icon: Gift,
    category: 'tools',
    color: 'text-pink-600',
    description: 'Create discount campaigns'
  },
  'custom-menu': {
    parent: 'bookings',
    label: 'Service Menu',
    icon: Settings,
    category: 'settings',
    color: 'text-gray-600',
    description: 'Customize your services'
  }
};

export const SmartBreadcrumb: React.FC<SmartBreadcrumbProps> = ({
  currentPage,
  onNavigate,
  therapistData,
  showActions = true,
  compact = false,
  className = ""
}) => {
  // Generate breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: BreadcrumbItem[] = [];
    let currentId = currentPage;
    
    // Build path from current page to root
    while (currentId && PAGE_HIERARCHY[currentId]) {
      const pageInfo = PAGE_HIERARCHY[currentId];
      path.unshift({
        id: currentId,
        label: pageInfo.label,
        icon: pageInfo.icon,
        isClickable: currentId !== currentPage,
        color: pageInfo.color
      });
      currentId = pageInfo.parent || '';
    }
    
    // For therapist context, use 'status' as the home page instead of 'home'
    // The 'status' page (Online Status) is the main working page for therapists
    if (path.length > 0 && path[0].id !== 'status' && currentPage !== 'status') {
      path.unshift({
        id: 'status',
        label: 'Home',
        icon: Home,
        isClickable: true,
        color: 'text-gray-700'
      });
    }
    
    return path;
  }, [currentPage]);

  // Get current page info
  const currentPageInfo = PAGE_HIERARCHY[currentPage];
  
  // Get context actions based on current page
  const getContextActions = () => {
    const actions = [];
    
    switch (currentPageInfo?.category) {
      case 'bookings':
        actions.push(
          { id: 'status', label: 'Status', icon: Clock, color: 'text-green-600' },
          { id: 'custom-menu', label: 'Menu', icon: Settings, color: 'text-gray-600' }
        );
        break;
      case 'financial':
        actions.push(
          { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-600' }
        );
        break;
      case 'business':
        actions.push(
          { id: 'more-customers', label: 'Customers', icon: Users, color: 'text-teal-600' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-600' }
        );
        break;
    }
    
    return actions.filter(action => action.id !== currentPage);
  };

  const contextActions = showActions ? getContextActions() : [];

  if (breadcrumbPath.length <= 1 && !compact) {
    return null; // Don't show breadcrumb for single items unless compact
  }

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Path */}
          <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {breadcrumbPath.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === breadcrumbPath.length - 1;
              
              return (
                <div key={item.id} className="flex items-center space-x-1 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  
                  <button
                    onClick={() => item.isClickable ? onNavigate(item.id) : undefined}
                    disabled={!item.isClickable}
                    className={`flex items-center space-x-2 px-2 py-1 rounded-lg transition-colors ${
                      item.isClickable
                        ? 'hover:bg-gray-100 cursor-pointer text-gray-600 hover:text-gray-900'
                        : 'cursor-default'
                    } ${isLast ? 'font-semibold text-gray-900' : ''} ${
                      compact ? 'text-sm' : ''
                    }`}
                    title={currentPageInfo?.description}
                  >
                    {Icon && (
                      <Icon className={`w-4 h-4 flex-shrink-0 ${item.color || 'text-gray-500'}`} />
                    )}
                    <span className="truncate">{item.label}</span>
                    {isLast && therapistData?.unreadCount && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                        {therapistData.unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Context Actions */}
          {contextActions.length > 0 && !compact && (
            <div className="flex items-center space-x-2 ml-4 border-l border-gray-200 pl-4">
              <span className="text-sm text-gray-500 whitespace-nowrap">Quick:</span>
              {contextActions.slice(0, 3).map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onNavigate(action.id)}
                    className={`flex items-center space-x-1 px-2 py-1 text-sm rounded-lg 
                      transition-colors hover:bg-gray-100 ${action.color} whitespace-nowrap`}
                    title={`Go to ${action.label}`}
                  >
                    <ActionIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                );
              })}
              
              {contextActions.length > 3 && (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-2 py-1 text-sm rounded-lg transition-colors hover:bg-gray-100 text-gray-600">
                    <ChevronDown className="w-4 h-4" />
                    <span className="hidden sm:inline">More</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    {contextActions.slice(3).map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => onNavigate(action.id)}
                          className={`flex items-center space-x-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${action.color} w-full text-left whitespace-nowrap`}
                        >
                          <ActionIcon className="w-4 h-4" />
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Page Description */}
        {currentPageInfo?.description && !compact && (
          <p className="text-sm text-gray-500 mt-1 pl-6">
            {currentPageInfo.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SmartBreadcrumb;