import React from 'react';
import { membershipService } from '../lib/membershipService';

interface MemberDashboardPageProps {
  onNavigate: (page: string) => void;
}

const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [membership, setMembership] = React.useState<any | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const m = await membershipService.getMyMembership();
        setMembership(m);
      } catch (e: any) {
        setError('Failed to load membership');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button onClick={() => onNavigate('home')} className="text-blue-600 hover:underline">← Back</button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Membership</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow border p-6">
            {membership ? (
              <div>
                <div className="text-gray-700"><span className="font-semibold">Tier:</span> {membership.tier}</div>
                <div className="text-gray-700 mt-2"><span className="font-semibold">Status:</span> {membership.status}</div>
                {membership.currentPeriodEnd && (
                  <div className="text-gray-700 mt-2">
                    <span className="font-semibold">Renews:</span> {new Date(membership.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-700">You don't have an active membership.</p>
                <button
                  onClick={() => onNavigate('memberPlans')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboardPage;
