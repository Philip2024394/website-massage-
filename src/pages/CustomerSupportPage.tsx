import React from 'react';
import PageNumberBadge from '../components/PageNumberBadge';

interface CustomerSupportPageProps {
  user: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
}

const CustomerSupportPage: React.FC<CustomerSupportPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageNumberBadge pageNumber={303} pageName="CustomerSupport" isLocked={false} />
      <header className="bg-white p-4 shadow-md sticky top-0 z-40 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-700 hover:text-orange-600 font-semibold">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">Customer Support</h1>
        <div />
      </header>
      <div className="p-4 space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg p-6 shadow border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Need Help?</h2>
          <p className="text-sm text-gray-600">We're here to help with booking issues, account questions, coins & loyalty, or reporting a problem with a therapist or massage place.</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">📧 Email Support:</p>
            <p className="text-lg font-semibold text-orange-600 select-all">indastreet.id@gmail.com</p>
            <p className="text-xs text-gray-600 mt-2">Response times vary based on traffic flow. Please allow up to <span className="font-semibold">48 hours</span> for a reply. We answer every message.</p>
          </div>
          <div className="space-y-2 text-xs text-gray-500">
            <p>Include details for faster help: booking ID (if applicable), therapist/place name, date & time, and a brief description of the issue.</p>
            <p>For urgent changes or cancellations, please use the in-app booking management first.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Booking Issues</h3>
            <p className="text-xs text-gray-600">Problems with scheduling, timing conflicts, or therapist availability.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Account & Profile</h3>
            <p className="text-xs text-gray-600">Login, password, profile photo and membership questions.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Coins & Loyalty</h3>
            <p className="text-xs text-gray-600">Missing coins, tier discounts, redemption issues.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Report a Problem</h3>
            <p className="text-xs text-gray-600">Service quality, inappropriate behavior, listing inaccuracies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;
