import React, { useMemo } from 'react';
import type { Therapist, UserLocation } from '../../types';

interface SharedTherapistProfileLiteProps {
  therapists: Therapist[];
  selectedTherapist?: Therapist | null;
  userLocation?: UserLocation | null;
  loggedInCustomer?: any;
  handleQuickBookWithChat?: (provider: Therapist, type: 'therapist' | 'place') => Promise<void> | void;
  onNavigate?: (page: any) => void;
  language?: 'en' | 'id' | 'gb';
}

function extractIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/\/therapist-profile\/([^\/]+)/);
  if (!match) return null;
  const full = match[1];
  return full.split('-')[0];
}

const SharedTherapistProfileLite: React.FC<SharedTherapistProfileLiteProps> = ({
  therapists,
  selectedTherapist,
  userLocation,
  loggedInCustomer,
  handleQuickBookWithChat,
  onNavigate,
  language = 'en'
}) => {
  const therapist = useMemo(() => {
    if (selectedTherapist) return selectedTherapist;
    const id = extractIdFromPathname(window.location.pathname);
    if (!id) return null;
    const found = (therapists || []).find(th => {
      const thId = (th as any).$id ?? (th as any).id ?? '';
      return thId?.toString() === id || id && id.length > 0 && thId?.toString() === id.split('-')[0];
    }) || null;
    return found;
  }, [selectedTherapist, therapists]);

  const handleQuickBook = () => {
    if (handleQuickBookWithChat && therapist) {
      handleQuickBookWithChat(therapist, 'therapist');
    }
  };

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow">
          <div className="mb-2 text-4xl">😔</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">We couldn't find this therapist profile. The link may be invalid or the therapist is no longer available.</p>
          <button className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" onClick={() => (window.location.href = '/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{therapist.name}</h1>
          <p className="text-gray-600">{therapist.location}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            {therapist.profilePicture && (
              <img src={therapist.profilePicture} alt={therapist.name} className="w-24 h-24 object-cover rounded" />
            )}
            <div>
              <div className="text-sm text-gray-700">Rating: {therapist.rating} ⭐</div>
              <div className="text-sm text-gray-700">Reviews: {therapist.reviewCount}</div>
            </div>
          </div>
          <p className="mt-4 text-gray-700">{therapist.description}</p>
          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" onClick={handleQuickBook}>Quick Book</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => onNavigate?.('home')}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTherapistProfileLite;
