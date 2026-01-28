import React, { useState } from 'react';
import PlaceLayout from '../components/PlaceLayout';
import PlaceDashboard from './PlaceDashboard';
import PlaceEarnings from './PlaceEarnings';
import PlacePaymentHistory from './PlacePaymentHistory';
import PlaceMembership from './PlaceMembership';
import PlaceCalendar from './PlaceCalendar';
import PlaceLegal from './PlaceLegal';
import PlaceMenuPricing from './PlaceMenuPricing';
import MoreCustomersPage from './MoreCustomersPage';
import MoreCustomersPage from './MoreCustomersPage';

interface MainPlaceDashboardProps {
  onSave?: (data: any) => void;
  onLogout?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigate?: (page: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: string) => void;
  onNavigateToChat?: () => void;
  onNavigateToPayment?: () => void;
  placeId?: string;
  place?: any;
  bookings?: any[];
  notifications?: any[];
  userLocation?: any;
  t?: any;
}

const MainPlaceDashboard: React.FC<MainPlaceDashboardProps> = ({
  onSave,
  onLogout,
  onNavigateToNotifications,
  onNavigate,
  onUpdateBookingStatus,
  onNavigateToChat,
  onNavigateToPayment,
  placeId = '1',
  place,
  bookings = [],
  notifications = [],
  userLocation,
  t
}) => {
  const [activePage, setActivePage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'more-customers':
        return <MoreCustomersPage place={place} onBack={() => setActivePage('dashboard')} language="id" />;
      
      case 'earnings':
        return <PlaceEarnings placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'payment-history':
        return <PlacePaymentHistory placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'membership':
        return <PlaceMembership placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'calendar':
        return <PlaceCalendar placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'legal':
        return <PlaceLegal placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'menu-pricing':
        return <PlaceMenuPricing placeId={placeId} onBack={() => setActivePage('dashboard')} />;
      
      case 'chat':
        if (onNavigateToChat) {
          onNavigateToChat();
          return null;
        }
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
              <p className="text-gray-600">Chat functionality will be integrated here.</p>
              <button
                onClick={() => setActivePage('dashboard')}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      
      case 'notifications':
        if (onNavigateToNotifications) {
          onNavigateToNotifications();
          return null;
        }
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
              <p className="text-gray-600">Notification management will be integrated here.</p>
              <button
                onClick={() => setActivePage('dashboard')}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      
      case 'dashboard':
      case 'profile':
      case 'bookings':
      case 'analytics':
      default:
        return (
          <PlaceDashboard
            onSave={onSave}
            onLogout={onLogout}
            onNavigateToNotifications={onNavigateToNotifications}
            onNavigate={handleNavigate}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onNavigateToChat={onNavigateToChat}
            onNavigateToPayment={onNavigateToPayment}
            placeId={placeId}
            place={place}
            bookings={bookings}
            notifications={notifications}
            userLocation={userLocation}
            t={t}
          />
        );
    }
  };

  return (
    <PlaceLayout activePage={activePage} onNavigate={handleNavigate}>
      {renderPage()}
    </PlaceLayout>
  );
};

export default MainPlaceDashboard;