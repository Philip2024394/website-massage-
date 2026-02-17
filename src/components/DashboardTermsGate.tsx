import React, { useState, useEffect } from 'react';
import { getTermsAgreed, setTermsAgreed } from '../lib/termsAgreementStorage';
import { therapistService } from '../lib/appwrite/services/therapist.service';
import { facialPlaceService } from '../lib/appwrite/services/facial.service';
import DashboardTermsModal from './DashboardTermsModal';

interface DashboardTermsGateProps {
  userId: string | undefined | null;
  /** 'therapist' | 'facial' = Appwrite terms_acknowledged; 'place' = localStorage only (massage place) */
  providerType?: 'therapist' | 'facial' | 'place';
  t: any;
  ChildComponent: React.ComponentType<any>;
  childProps: Record<string, unknown>;
  onAgreedAfter?: () => void;
}

/**
 * Gates therapist/facial dashboard: first-time users must acknowledge T&C before proceeding.
 * Stores terms_acknowledged in Appwrite; falls back to localStorage for legacy.
 * Optional: show reminder popup (non-blocking) for existing users who agreed via localStorage only.
 */
export const DashboardTermsGate: React.FC<DashboardTermsGateProps> = ({
  userId,
  providerType,
  t,
  ChildComponent,
  childProps,
  onAgreedAfter
}) => {
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setAgreed(true);
      setLoading(false);
      return;
    }
    const type = providerType ?? 'place';
    if (type === 'place') {
      setAgreed(getTermsAgreed(userId));
      setLoading(false);
      return;
    }
    const service = type === 'therapist' ? therapistService : facialPlaceService;
    service
      .getTermsAcknowledged(userId)
      .then((dbAgreed) => {
        if (dbAgreed) {
          setAgreed(true);
          setShowReminder(false);
        } else {
          const localAgreed = getTermsAgreed(userId);
          if (localAgreed) {
            setAgreed(true);
            setShowReminder(true);
          } else {
            setAgreed(false);
          }
        }
      })
      .catch(() => {
        const localAgreed = getTermsAgreed(userId);
        setAgreed(localAgreed);
        setShowReminder(false);
      })
      .finally(() => setLoading(false));
  }, [userId, providerType ?? 'place']);

  const handleAccept = async () => {
    if (!userId) return;
    setAccepting(true);
    try {
      const type = providerType ?? 'place';
      if (type === 'place') {
        setTermsAgreed(userId);
        setAgreed(true);
        setShowReminder(false);
        onAgreedAfter?.();
      } else {
        const service = type === 'therapist' ? therapistService : facialPlaceService;
        await service.setTermsAcknowledged(userId);
        setTermsAgreed(userId);
        setAgreed(true);
        setShowReminder(false);
        onAgreedAfter?.();
      }
    } catch (e) {
      setTermsAgreed(userId);
      setAgreed(true);
      onAgreedAfter?.();
    } finally {
      setAccepting(false);
    }
  };

  if (!userId) {
    return <ChildComponent {...childProps} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!agreed) {
    return (
      <DashboardTermsModal
        t={t?.dashboardTerms != null ? t : { dashboardTerms: t }}
        onAccept={handleAccept}
        loading={accepting}
      />
    );
  }

  return (
    <>
      <ChildComponent {...childProps} />
      {showReminder && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-2">
              {t?.dashboardTerms?.modalTitle ?? 'Updated Terms & Conditions'}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Please confirm you have read and accept the updated dashboard terms.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReminder(false)}
                className="flex-1 py-2.5 rounded-lg font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
              >
                {accepting ? '...' : (t?.dashboardTerms?.agreeButton ?? 'I Agree')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardTermsGate;
