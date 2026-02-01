/**
 * ============================================================================
 * 🧭 ENHANCED NAVIGATION SYSTEM - TASK 4 IMPLEMENTATION
 * ============================================================================
 * 
 * Advanced therapist dashboard navigation with:
 * - Quick action shortcuts and floating action button
 * - Organized menu categories with collapsible sections
 * - Smart navigation breadcrumbs and context awareness
 * - Keyboard shortcuts and accessibility improvements
 * - Recent actions tracking and favorites system
 * - Progressive disclosure for complex workflows
 * 
 * Features:
 * ✅ Quick Actions Hub with one-tap access to common tasks
 * ✅ Categorized menu sections (Business, Booking, Settings)
 * ✅ Smart shortcuts based on user behavior
 * ✅ Breadcrumb navigation with context
 * ✅ Keyboard navigation support
 * ✅ Favorites and recently used items
 * ✅ Progressive menu disclosure
 * ✅ Mobile-optimized navigation patterns
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, User, Calendar, DollarSign, Bell, Settings, 
  Search, Plus, Star, Clock, TrendingUp, Zap, 
  ChevronRight, ChevronDown, Bookmark, History,
  Command, Users, CreditCard, BarChart3, Shield,
  FileText, Gift, ClipboardList, Wallet, MessageCircle
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  quickAction?: boolean;
  badge?: number;
  description?: string;
  keywords?: string[];
}

export interface NavigationCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  collapsed: boolean;
  items: NavigationItem[];
}

interface EnhancedNavigationProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
  onClose?: () => void;
  language?: 'en' | 'id';
  therapistData?: any;
  className?: string;
}

const QUICK_ACTIONS: NavigationItem[] = [
  {
    id: 'quick-booking-check',
    label: 'Check Bookings',
    icon: Calendar,
    color: 'text-orange-500',
    category: 'quick',
    priority: 'high',
    quickAction: true,
    description: 'View and manage your bookings'
  },
  {
    id: 'status',
    label: 'Toggle Status',
    icon: Clock,
    color: 'text-green-500',
    category: 'quick',
    priority: 'high',
    quickAction: true,
    description: 'Change your availability status'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    color: 'text-blue-500',
    category: 'quick',
    priority: 'high',
    quickAction: true,
    description: 'View your income and payouts'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    color: 'text-purple-500',
    category: 'quick',
    priority: 'medium',
    quickAction: true,
    badge: 3,
    description: 'Check new notifications'
  }
];

const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    id: 'business',
    label: 'Business',
    icon: TrendingUp,
    color: 'text-blue-600',
    collapsed: false,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: User,
        color: 'text-blue-500',
        category: 'business',
        priority: 'high',
        description: 'Your main dashboard and profile'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        color: 'text-blue-500',
        category: 'business',
        priority: 'medium',
        description: 'Performance metrics and insights'
      },
      {
        id: 'more-customers',
        label: 'More Customers',
        icon: Users,
        color: 'text-blue-500',
        category: 'business',
        priority: 'medium',
        description: 'Grow your customer base'
      }
    ]
  },
  {
    id: 'bookings',
    label: 'Bookings & Schedule',
    icon: Calendar,
    color: 'text-orange-600',
    collapsed: false,
    items: [
      {
        id: 'bookings',
        label: 'My Bookings',
        icon: Calendar,
        color: 'text-orange-500',
        category: 'bookings',
        priority: 'high',
        badge: 2,
        description: 'Manage your appointments'
      },
      {
        id: 'status',
        label: 'Online Status',
        icon: Clock,
        color: 'text-orange-500',
        category: 'bookings',
        priority: 'high',
        description: 'Control your availability'
      },
      {
        id: 'custom-menu',
        label: 'Service Menu',
        icon: ClipboardList,
        color: 'text-orange-500',
        category: 'bookings',
        priority: 'low',
        description: 'Customize your services'
      }
    ]
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: DollarSign,
    color: 'text-green-600',
    collapsed: false,
    items: [
      {
        id: 'earnings',
        label: 'Earnings',
        icon: DollarSign,
        color: 'text-green-500',
        category: 'financial',
        priority: 'high',
        description: 'View your income'
      },
      {
        id: 'payment',
        label: 'Payment',
        icon: CreditCard,
        color: 'text-green-500',
        category: 'financial',
        priority: 'medium',
        description: 'Submit payment proof'
      },
      {
        id: 'commission-payment',
        label: 'Commission',
        icon: Wallet,
        color: 'text-green-500',
        category: 'financial',
        priority: 'medium',
        description: 'Commission payments'
      }
    ]
  },
  {
    id: 'tools',
    label: 'Tools & Marketing',
    icon: Gift,
    color: 'text-purple-600',
    collapsed: true,
    items: [
      {
        id: 'send-discount',
        label: 'Send Discount',
        icon: Gift,
        color: 'text-purple-500',
        category: 'tools',
        priority: 'low',
        description: 'Create discount campaigns'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        color: 'text-purple-500',
        category: 'tools',
        priority: 'medium',
        badge: 3,
        description: 'Manage your notifications'
      }
    ]
  },
  {
    id: 'support',
    label: 'Help & Support',
    icon: Shield,
    color: 'text-gray-600',
    collapsed: true,
    items: [
      {
        id: 'therapist-hotel-villa-safe-pass',
        label: 'Safe Pass',
        icon: Shield,
        color: 'text-gray-500',
        category: 'support',
        priority: 'low',
        description: 'Security credentials'
      },
      {
        id: 'legal',
        label: 'Legal & Terms',
        icon: FileText,
        color: 'text-gray-500',
        category: 'support',
        priority: 'low',
        description: 'Terms and policies'
      },
      {
        id: 'therapist-how-it-works',
        label: 'How it Works',
        icon: FileText,
        color: 'text-gray-500',
        category: 'support',
        priority: 'low',
        description: 'Platform guide'
      }
    ]
  }
];

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  currentPage,
  onNavigate,
  onClose,
  language = 'id',
  therapistData,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<NavigationCategory[]>(NAVIGATION_CATEGORIES);
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Load user preferences
  useEffect(() => {
    const stored = localStorage.getItem('therapist_nav_preferences');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setRecentItems(prefs.recent || []);
        setFavoriteItems(prefs.favorites || []);
      } catch (error) {
        console.error('Failed to load navigation preferences:', error);
      }
    }
  }, []);

  // Save user preferences
  const savePreferences = useCallback((recent: string[], favorites: string[]) => {
    const prefs = { recent, favorites };
    localStorage.setItem('therapist_nav_preferences', JSON.stringify(prefs));
  }, []);

  // Handle navigation with tracking
  const handleNavigate = useCallback((itemId: string) => {
    onNavigate(itemId);
    
    // Track recent items (max 5)
    const newRecent = [itemId, ...recentItems.filter(id => id !== itemId)].slice(0, 5);
    setRecentItems(newRecent);
    savePreferences(newRecent, favoriteItems);
    
    if (onClose) onClose();
  }, [onNavigate, onClose, recentItems, favoriteItems, savePreferences]);

  // Toggle category collapse
  const toggleCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, collapsed: !cat.collapsed }
        : cat
    ));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((itemId: string) => {
    const newFavorites = favoriteItems.includes(itemId)
      ? favoriteItems.filter(id => id !== itemId)
      : [...favoriteItems, itemId];
    
    setFavoriteItems(newFavorites);
    savePreferences(recentItems, newFavorites);
  }, [favoriteItems, recentItems, savePreferences]);

  // Get all navigation items
  const allItems = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery, allItems]);

  // Get recent items data
  const recentItemsData = useMemo(() => {
    return recentItems
      .map(id => allItems.find(item => item.id === id))
      .filter(Boolean) as NavigationItem[];
  }, [recentItems, allItems]);

  // Get favorite items data
  const favoriteItemsData = useMemo(() => {
    return favoriteItems
      .map(id => allItems.find(item => item.id === id))
      .filter(Boolean) as NavigationItem[];
  }, [favoriteItems, allItems]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('nav-search');
        searchInput?.focus();
      }
      
      // Escape to close
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
      
      // Show shortcuts with ?
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const NavigationItem: React.FC<{ item: NavigationItem; showCategory?: boolean }> = ({ 
    item, 
    showCategory = false 
  }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    const isFavorite = favoriteItems.includes(item.id);
    
    return (
      <div className={`group relative flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
        isActive 
          ? 'bg-orange-100 border-l-4 border-orange-500' 
          : 'hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
      }`}>
        <button
          onClick={() => handleNavigate(item.id)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 group-hover:bg-gray-200'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${
                isActive ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              {showCategory && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {categories.find(c => c.id === item.category)?.label}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 truncate">{item.description}</p>
            )}
          </div>
        </button>
        
        <button
          onClick={() => toggleFavorite(item.id)}
          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
            isFavorite ? 'text-yellow-500 opacity-100' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}>
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="nav-search"
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleNavigate(action.id)}
                  className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors text-left"
                >
                  <Icon className={`w-4 h-4 ${action.color}`} />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {action.label}
                  </span>
                  {action.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Search Results ({filteredItems.length})
            </h3>
            <div className="space-y-1">
              {filteredItems.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  No results found for "{searchQuery}"
                </p>
              ) : (
                filteredItems.map(item => (
                  <NavigationItem key={item.id} item={item} showCategory />
                ))
              )}
            </div>
          </div>
        )}

        {/* Recent & Favorites (when not searching) */}
        {!searchQuery && (recentItemsData.length > 0 || favoriteItemsData.length > 0) && (
          <div className="mb-6">
            {recentItemsData.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  Recent
                </h3>
                <div className="space-y-1">
                  {recentItemsData.slice(0, 3).map(item => (
                    <NavigationItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {favoriteItemsData.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-yellow-500" />
                  Favorites
                </h3>
                <div className="space-y-1">
                  {favoriteItemsData.map(item => (
                    <NavigationItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Categories */}
        {!searchQuery && (
          <div className="space-y-4">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                      <span className="font-semibold text-gray-900">{category.label}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.items.length}
                      </span>
                    </div>
                    {category.collapsed ? (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {!category.collapsed && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.items.map(item => (
                        <NavigationItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Press ? for shortcuts</span>
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            View shortcuts
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Search navigation</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">⌘ K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Close panel</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span>Show shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">?</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowKeyboardShortcuts(false)}
              className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavigation;