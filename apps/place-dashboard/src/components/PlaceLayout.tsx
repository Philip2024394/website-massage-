import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home,
  Calendar,
  BarChart3,
  CreditCard,
  MessageCircle,
  Bell,
  Crown,
  Shield,
  Settings,
  Clock,
  DollarSign,
  User
} from 'lucide-react';

interface PlaceLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const PlaceLayout: React.FC<PlaceLayoutProps> = ({ children, activePage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'text-green-600' },
    { id: 'bookings', name: 'Bookings', icon: Calendar, color: 'text-purple-600' },
    { id: 'earnings', name: 'Earnings', icon: DollarSign, color: 'text-orange-600' },
    { id: 'payment-history', name: 'Payment History', icon: CreditCard, color: 'text-indigo-600' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-cyan-600' },
    { id: 'menu-pricing', name: 'Menu & Pricing', icon: Menu, color: 'text-pink-600' },
    { id: 'chat', name: 'Messages', icon: MessageCircle, color: 'text-teal-600' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'text-yellow-600' },
    { id: 'membership', name: 'Membership', icon: Crown, color: 'text-amber-600' },
    { id: 'legal', name: 'Legal & Compliance', icon: Shield, color: 'text-red-600' },
    { id: 'profile', name: 'Profile Settings', icon: User, color: 'text-gray-600' },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Place Dashboard</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    closeSidebar();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Massage Place</p>
              <p className="text-xs text-gray-500 truncate">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {navigationItems.find(item => item.id === activePage)?.name || 'Dashboard'}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PlaceLayout;