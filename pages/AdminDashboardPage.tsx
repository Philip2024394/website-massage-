

import React, { useState, useEffect } from 'react';
import type { Page } from '../types/pageTypes';
import { BarChart, Users, Building, Settings, Percent, LogOut, CreditCard, DollarSign, ShoppingBag, UserCheck, Menu, X, Package, Briefcase, Globe, Bell } from 'lucide-react';
import ConfirmTherapistsPage from './ConfirmTherapistsPage';
import ConfirmPlacesPage from './ConfirmPlacesPage';
import ConfirmAccountsPage from './ConfirmAccountsPage';
// Removed chat import - chat system removed
// import AdminChatListPage from './AdminChatListPage';
import DrawerButtonsPage from './DrawerButtonsPage';
import PlatformAnalyticsPage from './PlatformAnalyticsPage';
import GoogleMapsAPIStatus from '../components/GoogleMapsAPIStatus';
import { adminAgentOverviewService } from '../lib/appwriteService';
import { Users as UsersIcon, DollarSign as DollarIcon, Target, TrendingUp } from 'lucide-react';
import BankDetailsManagementPage from './BankDetailsManagementPage';
import PaymentTransactionsPage from './PaymentTransactionsPage';
import AdminShopManagementPage from './AdminShopManagementPage';
import MembershipPricingPage from './MembershipPricingPage';
import AdminJobPostingsPage from './AdminJobPostingsPage';
import AdminPromotersPage from './AdminPromotersPage';
import AdminMembershipReferralsPage from './AdminMembershipReferralsPage';
import TranslationManager from '../components/TranslationManager';
import AdminTranslationPanel from '../components/AdminTranslationPanel';
import PlaceActivationRequests from '../components/PlaceActivationRequests';
import { authService } from '../lib/appwriteService';
import '../utils/pricingHelper'; // Load pricing helper for console access

interface AdminDashboardPageProps {
    onLogout: () => void;
    initialTab?: DashboardPage;
    onNavigate?: (page: Page) => void;
}
type DashboardPage = 'platform-analytics' | 'confirm-therapists' | 'confirm-places' | 'confirm-accounts' | 'drawer-buttons' | 'bank-details' | 'payment-transactions' | 'shop-management' | 'membership-pricing' | 'job-postings' | 'translations' | 'therapist-translations' | 'place-activation-requests' | 'promoters' | 'membership-referrals';
const AdminDashboardPage: React.FC<Pick<AdminDashboardPageProps, 'onLogout' | 'initialTab' | 'onNavigate'>> = ({ onLogout, initialTab, onNavigate }) => {
  const [activePage, setActivePage] = useState<DashboardPage>(initialTab || 'platform-analytics');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [showTranslationManager, setShowTranslationManager] = useState(false);
  const [showTherapistTranslations, setShowTherapistTranslations] = useState(false);
  const [agentRows, setAgentRows] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      if (activePage !== 'platform-analytics') return; // show in analytics page area
      try {
        setAgentLoading(true);
        setAgentError(null);
        const rows = await adminAgentOverviewService.listAgentOverviews();
        setAgentRows(rows);
      } catch (e: any) {
        setAgentError(e?.message || 'Failed to load agents');
      } finally {
        setAgentLoading(false);
      }
    };
    loadAgents();
  }, [activePage]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Side Drawer Overlay */}
      {isSideDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-[2px]" 
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
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
              setActivePage('place-activation-requests');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'place-activation-requests'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Place Activations</span>
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

          <button
            onClick={() => {
              setActivePage('promoters');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'promoters'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Promoters</span>
          </button>

          <button
            onClick={() => {
              setActivePage('membership-referrals');
              setIsSideDrawerOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activePage === 'membership-referrals'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DollarIcon className="w-5 h-5" />
            <span className="font-medium">Membership Referrals</span>
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

          {/* Agent Commission removed */}

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

        {/* Drawer Footer - Footer Links & Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t">
          {/* Footer Links */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  onNavigate?.('adminLogin');
                }}
                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
              >
                Admin
              </button>
              <span className="text-xs text-gray-400">•</span>
              <button 
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  onNavigate?.('serviceTerms');
                }}
                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
              >
                Terms
              </button>
              <span className="text-xs text-gray-400">•</span>
              <button 
                onClick={() => {
                  setIsSideDrawerOpen(false);
                  onNavigate?.('privacy');
                }}
                className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-bold"
              >
                Privacy
              </button>
            </div>
          </div>
          {/* Logout Button */}
          <div className="p-4">
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
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm px-2 sm:px-3 py-2 sm:py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">⚡</span>
              <span className="text-gray-900">Admin Dashboard</span>
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-6 pb-24">
        {activePage === 'platform-analytics' && (
          <div className="space-y-6">
            {/* Google Maps API status indicator */}
            <GoogleMapsAPIStatus className="border rounded-xl" />
            <PlatformAnalyticsPage />
            {/* Agent Overview Section */}
            <div className="bg-white shadow-sm border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UsersIcon className="w-5 h-5 text-orange-600" /> Agents Overview</h2>
                {agentLoading && <span className="text-xs text-gray-500">Loading...</span>}
              </div>
              {agentError && <p className="text-xs text-red-600 mb-3">{agentError}</p>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="px-3 py-2 text-left font-semibold">Agent</th>
                      <th className="px-3 py-2 text-left font-semibold">Code</th>
                      <th className="px-3 py-2 text-left font-semibold">Tier</th>
                      <th className="px-3 py-2 text-left font-semibold">Visits</th>
                      <th className="px-3 py-2 text-left font-semibold">Therapists</th>
                      <th className="px-3 py-2 text-left font-semibold">Places</th>
                      <th className="px-3 py-2 text-left font-semibold">Month New</th>
                      <th className="px-3 py-2 text-left font-semibold">Month Rec</th>
                      <th className="px-3 py-2 text-left font-semibold">Target</th>
                      <th className="px-3 py-2 text-left font-semibold">Streak</th>
                      <th className="px-3 py-2 text-left font-semibold">Comm Due</th>
                      <th className="px-3 py-2 text-left font-semibold">Payout Ready</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentRows.length === 0 && !agentLoading && (
                      <tr>
                        <td colSpan={12} className="px-3 py-6 text-center text-gray-500">No agents found.</td>
                      </tr>
                    )}
                    {agentRows.map(row => (
                      <tr key={row.agentId} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{row.name}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-700">{row.agentCode}</td>
                        <td className="px-3 py-2 text-xs"><span className={`px-2 py-0.5 rounded-full font-semibold ${row.tier === 'Toptier' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{row.tier || 'Std'}</span></td>
                        <td className="px-3 py-2 text-center">{row.visits}</td>
                        <td className="px-3 py-2 text-center">{row.therapistSignups}</td>
                        <td className="px-3 py-2 text-center">{row.placeSignups}</td>
                        <td className="px-3 py-2 text-center">{row.monthNew}</td>
                        <td className="px-3 py-2 text-center">{row.monthRecurring}</td>
                        <td className="px-3 py-2 text-center">{row.targetMet ? '✓' : '—'}</td>
                        <td className="px-3 py-2 text-center">{row.streakCount}</td>
                        <td className="px-3 py-2 text-center">{row.commissionDue}</td>
                        <td className="px-3 py-2 text-center">{row.payoutReady ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activePage === 'confirm-therapists' && <ConfirmTherapistsPage />}
        {activePage === 'confirm-places' && <ConfirmPlacesPage />}
        {activePage === 'place-activation-requests' && <PlaceActivationRequests />}
        {activePage === 'confirm-accounts' && <ConfirmAccountsPage />}
        {activePage === 'job-postings' && <AdminJobPostingsPage />}
        {activePage === 'promoters' && <AdminPromotersPage />}
        {activePage === 'membership-referrals' && <AdminMembershipReferralsPage />}
        {/* Chat system removed - using WhatsApp booking */}
        {/* {activePage === 'chat-messages' && <AdminChatListPage />} */}
        {activePage === 'bank-details' && <BankDetailsManagementPage />}
        {activePage === 'payment-transactions' && <PaymentTransactionsPage />}
        {activePage === 'shop-management' && <AdminShopManagementPage onNavigate={() => {}} />}
        {activePage === 'membership-pricing' && <MembershipPricingPage />}
        {activePage === 'drawer-buttons' && <DrawerButtonsPage />}
        {/* Agent Commission removed */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Platform</h4>
            <ul className="space-y-1">
              <li className="text-gray-600">Version 2.0.0</li>
              <li className="text-gray-600">Status: <span className="text-green-600 font-medium">Operational</span></li>
              <li className="text-gray-600">Region: Global</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><button onClick={() => onNavigate?.('serviceTerms')} className="text-orange-600 hover:underline">Terms of Service</button></li>
              <li><button onClick={() => onNavigate?.('privacy')} className="text-orange-600 hover:underline">Privacy Policy</button></li>
              <li><button onClick={() => setActivePage('membership-pricing')} className="text-orange-600 hover:underline">Membership Pricing</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Admin Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActivePage('platform-analytics')} className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600">Analytics</button>
              <button onClick={() => setActivePage('confirm-therapists')} className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200">Therapists</button>
              <button onClick={() => setActivePage('confirm-places')} className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200">Places</button>
              <button onClick={() => setActivePage('shop-management')} className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200">Shop</button>
              {/* Agent quick link removed */}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border-t text-center text-xs text-gray-500 py-3">
          © {new Date().getFullYear()} IndaStreet Admin. All rights reserved.
        </div>
      </footer>

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
