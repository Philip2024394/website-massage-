import React from 'react';
import type { Therapist } from '../../types';
import ShareTherapistProfile from '../../components/ShareTherapistProfile';

interface ShareActionsProps {
  therapist: Therapist;
}

const ShareActions: React.FC<ShareActionsProps> = ({ therapist }) => {
  const handleShareComplete = (platform: string, url: string) => {
    console.log(`🔗 [SHARE TRACKING] Shared via ${platform}:`, url);
    
    // Track analytics here if needed
    try {
      // You can add analytics tracking here
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: platform,
          content_type: 'therapist_profile',
          item_id: therapist.id || therapist.$id
        });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <ShareTherapistProfile 
        therapist={therapist}
        variant="primary"
        showLabel={true}
        onShareComplete={handleShareComplete}
        className="w-full max-w-sm"
      />
      
      {/* Additional sharing info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          💡 <strong>Share this profile</strong> to help {therapist.name} reach more customers
        </p>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-center gap-4">
            <span>✅ Works on all platforms</span>
            <span>🔒 No login required</span>
            <span>🔗 Permanent link</span>
          </div>
        </div>
      </div>
    </div>
  );
};
};

export default ShareActions;