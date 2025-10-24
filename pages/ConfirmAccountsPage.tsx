import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import { therapistService, placeService } from '../lib/appwriteService';

interface PendingAccount {
  $id: string;
  name: string;
  type: 'Therapist' | 'Place';
  status: 'pending' | 'active' | 'deactivated';
  membershipPackage?: string;
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
          .map((t: any) => ({ $id: t.$id, name: t.name, type: "Therapist" as const, status: t.status, membershipPackage: t.membershipPackage }));
        const pendingPlaces = places
          .filter((p: any) => p.status === 'pending' || p.status === 'deactivated' || p.status === 'active')
          .map((p: any) => ({ $id: p.$id, name: p.name, type: "Place" as const, status: p.status, membershipPackage: p.membershipPackage }));
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Confirm & Manage Accounts</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-4">
          {pendingAccounts.length === 0 ? (
            <li className="text-gray-500">No accounts found.</li>
          ) : (
            pendingAccounts.map((account) => (
              <li key={account.$id} className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50 p-4 rounded border border-gray-200">
                <div className="flex-1">
                  <span className="font-semibold">{account.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({account.type})</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${account.status === 'active' ? 'bg-green-100 text-green-700' : account.status === 'deactivated' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{account.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={account.status}
                    onChange={e => handleStatusChange(account, e.target.value as 'active' | 'deactivated')}
                    disabled={updatingId === account.$id}
                  >
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-sm"
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
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ConfirmAccountsPage;
