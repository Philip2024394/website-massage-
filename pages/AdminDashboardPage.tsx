

import React, { useState, useEffect } from 'react';
import { BarChart, Users, Building, Settings, Percent, LogOut, CreditCard, DollarSign, ShoppingBag, UserCheck, Menu, X, Package, Briefcase, Globe } from 'lucide-react';
import ConfirmTherapistsPage from './ConfirmTherapistsPage';
import ConfirmPlacesPage from './ConfirmPlacesPage';
import ConfirmAccountsPage from './ConfirmAccountsPage';
// Removed chat import - chat system removed
// import AdminChatListPage from './AdminChatListPage';
import DrawerButtonsPage from './DrawerButtonsPage';
import AgentCommissionPage from './AgentCommissionPage';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';
import BankDetailsManagementPage from './BankDetailsManagementPage';
import PaymentTransactionsPage from './PaymentTransactionsPage';
import AdminShopManagementPage from './AdminShopManagementPage';
import MembershipPricingPage from './MembershipPricingPage';
import AdminJobPostingsPage from './AdminJobPostingsPage';
import TranslationManager from '../components/TranslationManager';
import AdminTranslationPanel from '../components/AdminTranslationPanel';
import { authService } from '../lib/appwriteService';
import '../utils/pricingHelper'; // Load pricing helper for console access

interface AdminDashboardPageProps {
    onLogout: () => void;
    initialTab?: DashboardPage;
}
type DashboardPage = 'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'confirm-accounts' | 'drawer-buttons' | 'agent-commission' | 'bank-details' | 'payment-transactions' | 'shop-management' | 'membership-pricing' | 'job-postings' | 'translations' | 'therapist-translations';
const AdminDashboardPage: React.FC<Pick<AdminDashboardPageProps, 'onLogout' | 'initialTab'>> = ({ onLogout, initialTab }) => {
  const [activePage, setActivePage] = useState<DashboardPage>(initialTab || 'platform-analytics');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [showTranslationManager, setShowTranslationManager] = useState(false);
  const [showTherapistTranslations, setShowTherapistTranslations] = useState(false);

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
      {/* Side Drawer Overlay */}
      {isSideDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSideDrawerOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isSideDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={() => setIsSideDrawerOpen(false)}
            className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Items */}
        <nav className="flex flex-col p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          <button
            onClick={() => {
              setActivePage('platform-analytics');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'platform-analytics'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button
            onClick={() => {
              setActivePage('confirm-therapists');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'confirm-therapists'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Therapists</span>
          </button>

          <button
            onClick={() => {
              setActivePage('confirm-places');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'confirm-places'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building className="w-5 h-5" />
            <span className="font-medium">Places</span>
          </button>

          <button
            onClick={() => {
              setActivePage('confirm-accounts');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'confirm-accounts'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="font-medium">Accounts</span>
          </button>

          <button
            onClick={() => {
              setActivePage('job-postings');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'job-postings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">Job Postings</span>
          </button>

          {/* Chat system removed - using WhatsApp booking */}
          {/* <button
            onClick={() => {
              setActivePage('chat-messages');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'chat-messages'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Messages</span>
          </button> */}

          <button
            onClick={() => {
              setActivePage('bank-details');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'bank-details'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Bank Details</span>
          </button>

          <button
            onClick={() => {
              setActivePage('payment-transactions');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'payment-transactions'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Payments</span>
          </button>

          <button
            onClick={() => {
              setActivePage('shop-management');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'shop-management'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">Shop</span>
          </button>

          <button
            onClick={() => {
              setActivePage('agent-commission');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'agent-commission'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Percent className="w-5 h-5" />
            <span className="font-medium">Agent Commission</span>
          </button>

          <button
            onClick={() => {
              setActivePage('membership-pricing');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'membership-pricing'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Membership Pricing</span>
          </button>

          <button
            onClick={() => {
              setActivePage('drawer-buttons');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'drawer-buttons'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={() => {
              setShowTranslationManager(true);
              setIsSideDrawerOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">UI Translations</span>
          </button>

          <button
            onClick={() => {
              setShowTherapistTranslations(true);
              setIsSideDrawerOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Therapist Data Translations</span>
          </button>
        </nav>

        {/* Drawer Footer - Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
          <button
            onClick={() => {
              setIsSideDrawerOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-2xl font-bold">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
          </div>
          <button
            onClick={() => setIsSideDrawerOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-20">
        {activePage === 'platform-analytics' && <PlatformAnalyticsPage />}
        {activePage === 'confirm-therapists' && <ConfirmTherapistsPage />}
        {activePage === 'confirm-places' && <ConfirmPlacesPage />}
        {activePage === 'confirm-accounts' && <ConfirmAccountsPage />}
        {activePage === 'job-postings' && <AdminJobPostingsPage />}
        {/* Chat system removed - using WhatsApp booking */}
        {/* {activePage === 'chat-messages' && <AdminChatListPage />} */}
        {activePage === 'bank-details' && <BankDetailsManagementPage />}
        {activePage === 'payment-transactions' && <PaymentTransactionsPage />}
        {activePage === 'shop-management' && <AdminShopManagementPage onNavigate={() => {}} />}
        {activePage === 'membership-pricing' && <MembershipPricingPage />}
        {activePage === 'drawer-buttons' && <DrawerButtonsPage />}
        {activePage === 'agent-commission' && <AgentCommissionPage />}
      </main>

      {/* Translation Manager Modal */}
      {showTranslationManager && (
        <TranslationManager onClose={() => setShowTranslationManager(false)} />
      )}

      {/* Therapist Data Translation Panel */}
      {showTherapistTranslations && (
        <AdminTranslationPanel onClose={() => setShowTherapistTranslations(false)} />
      )}
    </div>
  );
};
export default AdminDashboardPage;
