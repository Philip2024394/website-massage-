

import React, { useState, useEffect } from 'react';
import { BarChart, Users, Building, Settings, Percent, LogOut, CreditCard, DollarSign } from 'lucide-react';
import ConfirmTherapistsPage from './ConfirmTherapistsPage';
import ConfirmPlacesPage from './ConfirmPlacesPage';
import DrawerButtonsPage from './DrawerButtonsPage';
import AgentCommissionPage from './AgentCommissionPage';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';
import BankDetailsManagementPage from './BankDetailsManagementPage';
import PaymentTransactionsPage from './PaymentTransactionsPage';
import { authService } from '../lib/appwriteService';
import TabButton from '../components/dashboard/TabButton';

interface AdminDashboardPageProps {
    onLogout: () => void;
}
type DashboardPage = 'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'drawer-buttons' | 'agent-commission' | 'bank-details' | 'payment-transactions';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-base sm:text-2xl font-bold">
            <span className="text-gray-900">Inda</span>
            <span className="text-orange-500">Street</span>
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b sticky top-[52px] sm:top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-2">
          <TabButton
            icon={<BarChart />}
            label="Analytics"
            isActive={activePage === 'platform-analytics'}
            onClick={() => setActivePage('platform-analytics')}
          />
          <TabButton
            icon={<Users />}
            label="Therapists"
            isActive={activePage === 'confirm-therapists'}
            onClick={() => setActivePage('confirm-therapists')}
          />
          <TabButton
            icon={<Building />}
            label="Places"
            isActive={activePage === 'confirm-places'}
            onClick={() => setActivePage('confirm-places')}
          />
          <TabButton
            icon={<CreditCard />}
            label="Bank Details"
            isActive={activePage === 'bank-details'}
            onClick={() => setActivePage('bank-details')}
          />
          <TabButton
            icon={<DollarSign />}
            label="Payments"
            isActive={activePage === 'payment-transactions'}
            onClick={() => setActivePage('payment-transactions')}
          />
          <TabButton
            icon={<Percent />}
            label="Commissions"
            isActive={activePage === 'agent-commission'}
            onClick={() => setActivePage('agent-commission')}
          />
          <TabButton
            icon={<Settings />}
            label="Settings"
            isActive={activePage === 'drawer-buttons'}
            onClick={() => setActivePage('drawer-buttons')}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {activePage === 'platform-analytics' && <PlatformAnalyticsPage />}
        {activePage === 'confirm-therapists' && <ConfirmTherapistsPage />}
        {activePage === 'confirm-places' && <ConfirmPlacesPage />}
        {activePage === 'bank-details' && <BankDetailsManagementPage />}
        {activePage === 'payment-transactions' && <PaymentTransactionsPage />}
        {activePage === 'drawer-buttons' && <DrawerButtonsPage />}
        {activePage === 'agent-commission' && <AgentCommissionPage />}
      </main>
    </div>
  );
};
export default AdminDashboardPage;