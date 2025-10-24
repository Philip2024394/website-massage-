

import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import TopNav from '../components/TopNav';
import ConfirmTherapistsPage from './ConfirmTherapistsPage';
import ConfirmPlacesPage from './ConfirmPlacesPage';
import DrawerButtonsPage from './DrawerButtonsPage';
import { authService } from '../lib/appwriteService';

interface AdminDashboardPageProps {
    onLogout: () => void;
}
type DashboardPage = 'confirm-therapists' | 'confirm-places' | 'drawer-buttons';
const AdminDashboardPage: React.FC<Pick<AdminDashboardPageProps, 'onLogout'>> = ({ onLogout }) => {
  const [activePage, setActivePage] = useState<DashboardPage>('confirm-therapists');

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
        {activePage === 'confirm-therapists' && <ConfirmTherapistsPage />}
        {activePage === 'confirm-places' && <ConfirmPlacesPage />}
        {activePage === 'drawer-buttons' && <DrawerButtonsPage />}
      </main>
    </div>
  );
};
export default AdminDashboardPage;