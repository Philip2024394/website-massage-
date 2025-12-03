import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

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
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Social Media</h3>

        {/* Instagram Section */}
        {hasInstagram && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
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

            {/* 3 Cards per Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {instagramPosts.slice(0, 9).map((post, index) => (
                <a
                  key={index}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="w-5 h-5" fill="white" />
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="w-5 h-5" fill="white" />
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <Share2 className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Facebook Section */}
        {hasFacebook && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
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

            {/* 3 Cards per Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {facebookPosts.slice(0, 9).map((post, index) => (
                <a
                  key={index}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="w-5 h-5" fill="white" />
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="w-5 h-5" fill="white" />
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <Share2 className="w-5 h-5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaSection;
