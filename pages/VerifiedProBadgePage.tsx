import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Info, Star, Award, Menu } from 'lucide-react';
import { verificationService } from '../lib/appwriteService';
import PageContainer from '../components/layout/PageContainer';

interface VerifiedProBadgePageProps {
  onBack: () => void;
  providerId: number;
  providerType: 'therapist' | 'place';
  providerName?: string;
}

interface Eligibility {
  isEligible: boolean;
  reason: string;
  accountAge: number;
  completedBookings: number;
  averageRating: number;
}

const VerifiedProBadgePage: React.FC<VerifiedProBadgePageProps> = ({ onBack, providerId, providerType, providerName }) => {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = useMemo(() => (providerType === 'therapist' ? 'Therapist' : 'Massage Place'), [providerType]);

  const loadEligibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await verificationService.checkEligibility(providerId, providerType);
      setEligibility(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, providerType]);

  const applyForBadge = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await verificationService.applyForVerification(providerId, providerType);
      setSuccess('Verification badge applied successfully. Congratulations!');
      setEligibility(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to apply for verification');
    } finally {
      setLoading(false);
    }
  };

  const revokeBadge = async () => {
    const reason = prompt('Enter reason to revoke verification (for record):', 'Requested by provider');
    if (reason === null) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await verificationService.revokeVerification(providerId, providerType, reason || '');
      setSuccess('Verification badge revoked.');
      await loadEligibility();
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold"><span className="text-gray-900">Inda</span><span className="text-orange-500">Street</span></h1>
            <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Menu className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Side Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-orange-500 to-red-500 shadow-xl">
            <div className="p-6 border-b border-orange-400 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-white hover:bg-orange-600 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <button onClick={() => { setDrawerOpen(false); onBack(); }} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-orange-600 rounded-lg transition-colors text-left">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="space-y-6">
        <PageContainer className="pt-6 pb-20">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Verified Pro Badge</h1>
              <p className="text-sm text-gray-600">{title}{providerName ? `: ${providerName}` : ''}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Build trust with a verified badge shown on your profile image across the app.</p>
        </div>

        {/* Eligibility and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-blue-500" /> Eligibility</h2>
          {loading && <p className="text-sm text-gray-600">Checking eligibility…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          {eligibility && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Account Age</p>
                <p className="text-lg font-semibold">{eligibility.accountAge} days</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Completed Bookings</p>
                <p className="text-lg font-semibold">{eligibility.completedBookings}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-lg font-semibold flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {eligibility.averageRating.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-sm font-semibold ${eligibility.isEligible ? 'text-emerald-600' : 'text-orange-600'}`}>{eligibility.isEligible ? 'Eligible' : eligibility.reason || 'Not eligible yet'}</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={loadEligibility} disabled={loading} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium disabled:opacity-50 min-h-[44px]">Refresh</button>
            <button onClick={applyForBadge} disabled={loading || (!!eligibility && !eligibility.isEligible)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 flex items-center gap-2 min-h-[44px]">
              <CheckCircle2 className="w-4 h-4" /> Apply for Verification
            </button>
            <button onClick={revokeBadge} disabled={loading} className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium disabled:opacity-50 min-h-[44px]">Revoke</button>
          </div>
        </div>

        {/* Program Terms */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Award className="w-5 h-5 text-purple-500" /> Program Terms</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Minimum account age: 90 days.</li>
            <li>At least 10 completed bookings with verified customers.</li>
            <li>Maintain average rating of 4.0 or higher.</li>
            <li>Badge may be revoked for policy violations or quality issues.</li>
            <li>Badge symbol shows as a small golden rosette on your profile image.</li>
          </ul>
        </div>

        </PageContainer>
      </main>
    </div>
  );
};

export default VerifiedProBadgePage;
