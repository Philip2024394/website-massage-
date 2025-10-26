

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import TopNav from '../components/TopNav';
import ConfirmTherapistsPage from './ConfirmTherapistsPage';
import ConfirmPlacesPage from './ConfirmPlacesPage';
import DrawerButtonsPage from './DrawerButtonsPage';
import AgentCommissionPage from './AgentCommissionPage';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';
import { authService } from '../lib/appwriteService';

interface AdminDashboardPageProps {
    onLogout: () => void;
}
type DashboardPage = 'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'drawer-buttons' | 'agent-commission';
const AdminDashboardPage: React.FC<Pick<AdminDashboardPageProps, 'onLogout'>> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState<DashboardPage>('platform-analytics');

  useEffect(() => {
    // Initialize anonymous session for Appwrite access
    const initSession = async () => {
      try {
        await authService.createAnonymousSession();
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    initSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader onLogout={onLogout} />
      <TopNav active={activePage} onNavigate={setActivePage} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activePage === 'platform-analytics' && <PlatformAnalyticsPage />}
        {activePage === 'confirm-therapists' && <ConfirmTherapistsPage />}
        {activePage === 'confirm-places' && <ConfirmPlacesPage />}
        {activePage === 'drawer-buttons' && <DrawerButtonsPage />}
        {activePage === 'agent-commission' && <AgentCommissionPage />}
      </main>
    </div>
  );
};
export default AdminDashboardPage;