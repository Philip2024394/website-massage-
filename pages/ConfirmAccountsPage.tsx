import React, { useEffect, useState } from 'react';
import { therapistService, placeService } from '../lib/appwriteService';
import { MapPin, Phone, Clock } from 'lucide-react';

interface PendingAccount {
  $id: string;
  name: string;
  type: 'Therapist' | 'Place';
  status: 'pending' | 'active' | 'deactivated';
  membershipPackage?: string;
  whatsappNumber?: string;
  location?: string;
  $createdAt?: string;
  createdAt?: string;
}

const membershipOptions = [
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '12m' },
];

const ConfirmAccountsPage: React.FC = () => {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const [therapists, places] = await Promise.all([
          therapistService.getAll(),
          placeService.getAll(),
        ]);
        const pendingTherapists = therapists
          .filter((t: any) => t.status === 'pending' || t.status === 'deactivated' || t.status === 'active')
          .map((t: any) => ({ 
            $id: t.$id, 
            name: t.name, 
            type: "Therapist" as const, 
            status: t.status, 
            membershipPackage: t.membershipPackage,
            whatsappNumber: t.whatsappNumber,
            location: t.location,
            $createdAt: t.$createdAt,
            createdAt: t.createdAt
          }));
        const pendingPlaces = places
          .filter((p: any) => p.status === 'pending' || p.status === 'deactivated' || p.status === 'active')
          .map((p: any) => ({ 
            $id: p.$id, 
            name: p.name, 
            type: "Place" as const, 
            status: p.status, 
            membershipPackage: p.membershipPackage,
            whatsappNumber: p.whatsappNumber,
            location: p.location,
            $createdAt: p.$createdAt,
            createdAt: p.createdAt
          }));
        setPendingAccounts([...pendingTherapists, ...pendingPlaces]);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleStatusChange = async (account: PendingAccount, newStatus: 'active' | 'deactivated') => {
    setUpdatingId(account.$id);
    try {
      if (account.type === 'Therapist') {
        await therapistService.update(account.$id, { status: newStatus });
      } else {
        await placeService.update(account.$id, { status: newStatus });
      }
      setPendingAccounts((prev) => prev.map((a) => a.$id === account.$id ? { ...a, status: newStatus } : a));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMembershipChange = async (account: PendingAccount, newPackage: string) => {
    setUpdatingId(account.$id);
    try {
      if (account.type === 'Therapist') {
        await therapistService.update(account.$id, { membershipPackage: newPackage });
      } else {
        await placeService.update(account.$id, { membershipPackage: newPackage });
      }
      setPendingAccounts((prev) => prev.map((a) => a.$id === account.$id ? { ...a, membershipPackage: newPackage } : a));
    } catch (error) {
      console.error('Error updating membership:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Format creation date/time
  const formatCreationDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format WhatsApp number with country code
  const formatWhatsApp = (number?: string): string => {
    if (!number) return 'N/A';
    // Add +62 if not present for Indonesian numbers
    if (!number.startsWith('+')) {
      return `+62 ${number}`;
    }
    return number;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pb-20 sm:p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Confirm & Manage Accounts</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAccounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No accounts found.</p>
            </div>
          ) : (
            pendingAccounts.map((account) => (
              <div 
                key={account.$id} 
                className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-900">{account.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {account.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        account.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : account.status === 'deactivated' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {account.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {/* Creation Time */}
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium mb-1">Created</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {formatCreationDate(account.$createdAt || account.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium mb-1">WhatsApp</p>
                      <p className="text-sm text-gray-900 font-semibold break-all">
                        {formatWhatsApp(account.whatsappNumber)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100 sm:col-span-2 lg:col-span-1">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium mb-1">Location (Indonesia)</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {account.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={account.status}
                      onChange={e => handleStatusChange(account, e.target.value as 'active' | 'deactivated')}
                      disabled={updatingId === account.$id}
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <label className="text-sm font-medium text-gray-700">Membership:</label>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={account.membershipPackage || ''}
                      onChange={e => handleMembershipChange(account, e.target.value)}
                      disabled={updatingId === account.$id}
                    >
                      <option value="">Set Membership</option>
                      {membershipOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Loading Indicator */}
                {updatingId === account.$id && (
                  <div className="mt-3 flex items-center gap-2 text-orange-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConfirmAccountsPage;

