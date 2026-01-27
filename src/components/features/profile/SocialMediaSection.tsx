import React from 'react';
import { Heart, MessageCircle, Share2, Grid3x3, Users } from 'lucide-react';

interface SocialMediaSectionProps {
  instagramUrl?: string;
  instagramPosts?: Array<{ image: string; link: string }>; // Array of {image, link} objects
  facebookPageUrl?: string;
  facebookPosts?: Array<{ image: string; link: string }>; // Array of {image, link} objects
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ 
  instagramUrl, 
  instagramPosts, 
  facebookPageUrl,
  facebookPosts 
}) => {
  const hasInstagram = !!instagramUrl && instagramPosts && instagramPosts.length > 0;
  const hasFacebook = !!facebookPageUrl && facebookPosts && facebookPosts.length > 0;

  if (!hasInstagram && !hasFacebook) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 max-w-full">
      <div className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Latest Updates</h3>
        <p className="text-gray-600 text-sm mb-4">
          Check our Social Media page for the latest photos. Please note, we are not daily active on social media. Please refrain from sending us direct messages through social media.
        </p>

        {/* Instagram Section */}
        {hasInstagram && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Instagram</h4>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 mb-3"
            >
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-900">5,722 followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-900">534 likes</span>
              </div>
            </a>

            {/* Single Row - 3 Images Visible */}
            <div className="horizontal-scroll-safe" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-2 sm:gap-3 pb-2">
                {instagramPosts.slice(0, 9).map((post, index) => (
                  <a
                    key={index}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex-shrink-0 w-[calc(33.333%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={post.image}
                      alt={`Instagram post ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png';
                      }}
                    />
                    {/* Hover Overlay with Icons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="w-5 h-5 fill-white" />
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <Share2 className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Facebook Section */}
        {hasFacebook && (
          <div className="mb-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Facebook</h4>
            <a
              href={facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 mb-3"
            >
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-900">8,934 followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-900">1,245 likes</span>
              </div>
            </a>

            {/* Single Row - 3 Images Visible */}
            <div className="horizontal-scroll-safe" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex gap-2 sm:gap-3 pb-2">
                {facebookPosts.slice(0, 9).map((post, index) => (
                  <a
                    key={index}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex-shrink-0 w-[calc(33.333%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={post.image}
                      alt={`Facebook post ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png';
                      }}
                    />
                    {/* Hover Overlay with Icons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="w-5 h-5 fill-white" />
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <Share2 className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaSection;
