import React from 'react';

interface SocialMediaSectionProps {
  instagramUrl?: string;
  instagramPosts?: string[]; // Full post URLs like https://www.instagram.com/p/SHORTCODE/
  facebookPageUrl?: string;  // Facebook Page URL
}

const extractInstagramShortcode = (url: string): string | null => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'p' || p === 'reel');
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return null;
  } catch {
    return null;
  }
};

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ instagramUrl, instagramPosts, facebookPageUrl }) => {
  const hasInstagram = !!instagramUrl;
  const hasFacebook = !!facebookPageUrl;
  const shortcodes = (instagramPosts || [])
    .map(extractInstagramShortcode)
    .filter((c): c is string => !!c);

  // Heuristic height for embeds
  const igHeight = shortcodes.length > 0 ? 480 : 120;
  const fbHeight = 500;

  if (!hasInstagram && !hasFacebook) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 max-w-full">
      <div className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Social Media</h3>

        {hasInstagram && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-800">Instagram</h4>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View Profile
              </a>
            </div>

            {shortcodes.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-4 pb-2">
                  {shortcodes.map((code) => (
                    <div key={code} className="flex-shrink-0 w-[320px]">
                      <iframe
                        src={`https://www.instagram.com/p/${code}/embed/`}
                        width="320"
                        height={igHeight}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        style={{ border: 0, overflow: 'hidden' }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Live feed requires post URLs. Add latest post links to show a carousel here, or keep it as a profile link.
                </p>
              </div>
            )}
          </div>
        )}

        {hasFacebook && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-800">Facebook</h4>
              <a
                href={facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View Page
              </a>
            </div>
            <div className="w-full">
              <iframe
                title="Facebook Page Plugin"
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookPageUrl!)}&tabs=timeline&width=500&height=${fbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                style={{ border: 'none', overflow: 'hidden', width: '100%', height: fbHeight }}
                scrolling="no"
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaSection;
