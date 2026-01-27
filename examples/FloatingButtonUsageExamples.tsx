/**
 * FloatingButtonManager Usage Examples
 * 
 * This file demonstrates how to integrate the new FloatingButtonManager 
 * with URL mapping into your existing components.
 */

import React from 'react';
import FloatingButtonManager from '../src/components/FloatingButtonManager';
import { useFloatingButtonNavigation, useFloatingButtonState } from '../src/hooks/useFloatingButtonNavigation.ts';
import type { Page } from '../src/types/pageTypes';

// Example 1: Basic integration in your main App component
export const AppWithFloatingButtons: React.FC<{
  currentPage: Page;
  setPage: (page: Page) => void;
  userRole?: string;
}> = ({ currentPage, setPage, userRole }) => {
  return (
    <div className="app-container">
      {/* Your existing app content */}
      <main>
        {/* Your page content here */}
      </main>
      
      {/* Add floating buttons - they will automatically show based on page and user role */}
      <FloatingButtonManager
        currentPage={currentPage}
        setPage={setPage}
        userRole={userRole}
      />
    </div>
  );
};

// Example 2: Using the navigation hook in a custom component
export const CustomChatButton: React.FC<{
  currentPage: Page;
  setPage: (page: Page) => void;
  userRole?: string;
}> = ({ currentPage, setPage, userRole }) => {
  const { navigateToButton, isButtonVisible } = useFloatingButtonNavigation({
    currentPage,
    setPage,
    userRole
  });

  const { button } = useFloatingButtonState('support-chat');

  if (!isButtonVisible('support-chat')) return null;

  return (
    <button
      onClick={() => navigateToButton('support-chat')}
      className={`${button?.color} ${button?.hoverColor} text-white p-4 rounded-full`}
    >
      💬 Chat Support
    </button>
  );
};

// Example 3: HomePage integration
export const HomePageWithFloatingButtons: React.FC<{
  page: Page;
  setPage: (page: Page) => void;
  user?: { role: string };
}> = ({ page, setPage, user }) => {
  return (
    <div className="homepage">
      <header>
        <h1>Welcome to IndaStreet</h1>
      </header>
      
      <main>
        {/* Your existing homepage content */}
        <section className="hero">
          <h2>Find Your Perfect Massage</h2>
          {/* Hero content */}
        </section>
        
        <section className="features">
          {/* Features content */}
        </section>
      </main>
      
      {/* Floating buttons will automatically show relevant buttons for homepage */}
      <FloatingButtonManager
        currentPage={page}
        setPage={setPage}
        userRole={user?.role || 'guest'}
      />
    </div>
  );
};

// Example 4: Therapist Dashboard integration
export const TherapistDashboardWithFloatingButtons: React.FC<{
  page: Page;
  setPage: (page: Page) => void;
}> = ({ page, setPage }) => {
  return (
    <div className="therapist-dashboard">
      <nav>
        {/* Dashboard navigation */}
      </nav>
      
      <main>
        {/* Dashboard content */}
      </main>
      
      {/* Floating buttons for therapists - will show relevant buttons like availability, support chat */}
      <FloatingButtonManager
        currentPage={page}
        setPage={setPage}
        userRole="therapist"
      />
    </div>
  );
};

// Example 5: Programmatic navigation
export const ProgrammaticNavigationExample: React.FC<{
  currentPage: Page;
  setPage: (page: Page) => void;
}> = ({ currentPage, setPage }) => {
  const { navigateToButton, openButtonInNewTab, getButtonUrl } = useFloatingButtonNavigation({
    currentPage,
    setPage,
    userRole: 'customer'
  });

  const handleQuickBooking = () => {
    // Navigate to quick booking with additional parameters
    navigateToButton('booking-quick', { 
      service: 'massage',
      location: 'current' 
    });
  };

  const handleSupportChat = () => {
    // Open support chat in new tab
    openButtonInNewTab('support-chat');
  };

  const copyHelpUrl = () => {
    // Get help URL for sharing
    const url = getButtonUrl('help');
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
  };

  return (
    <div className="action-buttons">
      <button onClick={handleQuickBooking}>
        Quick Book Now
      </button>
      <button onClick={handleSupportChat}>
        Open Support (New Tab)
      </button>
      <button onClick={copyHelpUrl}>
        Copy Help URL
      </button>
    </div>
  );
};

// Example 6: Conditional floating button display
export const ConditionalFloatingButtons: React.FC<{
  currentPage: Page;
  setPage: (page: Page) => void;
  userRole: string;
  showFloatingButtons?: boolean;
}> = ({ currentPage, setPage, userRole, showFloatingButtons = true }) => {
  return (
    <div className="app">
      {/* Main app content */}
      <main>{/* Content */}</main>
      
      {/* Conditionally show floating buttons */}
      {showFloatingButtons && (
        <FloatingButtonManager
          currentPage={currentPage}
          setPage={setPage}
          userRole={userRole}
          className="floating-buttons-custom"
        />
      )}
    </div>
  );
};

// Example 7: Custom button configuration
import { 
  addFloatingButtonConfig, 
  updateFloatingButtonConfig 
} from '../src/config/floatingButtonConfig';

export const CustomButtonConfiguration = () => {
  const addCustomButton = () => {
    // Add a new custom floating button
    addFloatingButtonConfig({
      id: 'custom-promotion',
      name: 'Special Offer',
      icon: 'Star',
      url: '/promo/special-offer',
      page: 'todays-discounts',
      position: 'bottom-left',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      description: 'Check out our special promotion',
      enabled: true,
      roles: ['customer'],
      pages: ['home']
    });
  };

  const updateExistingButton = () => {
    // Update existing button configuration
    updateFloatingButtonConfig('support-chat', {
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      description: 'Updated chat support'
    });
  };

  return (
    <div>
      <button onClick={addCustomButton}>Add Custom Button</button>
      <button onClick={updateExistingButton}>Update Chat Button</button>
    </div>
  );
};