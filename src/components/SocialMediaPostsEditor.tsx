import React from 'react';

interface SocialMediaPostsEditorProps {
  platform: 'instagram' | 'facebook';
  posts: Array<{ image: string; link: string }>;
  onChange: (posts: Array<{ image: string; link: string }>) => void;
}

export const SocialMediaPostsEditor: React.FC<SocialMediaPostsEditorProps> = ({ platform, posts, onChange }) => {
  const borderColor = platform === 'instagram' ? 'border-orange-400' : 'border-blue-400';
  const ringColor = platform === 'instagram' ? 'focus:ring-orange-500 focus:border-orange-500' : 'focus:ring-blue-500 focus:border-blue-500';
  const label = platform === 'instagram' ? 'Instagram' : 'Facebook';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-3">{label} Posts (up to 9)</label>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(9)].map((_, idx) => {
          const post = posts[idx] || { image: '', link: '' };
          return (
            <div key={idx} className="space-y-2">
              <div className={`relative aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden hover:${borderColor} transition-colors`}>
                {post.image ? (
                  <img src={post.image} alt={`${label} ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Post {idx + 1}</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Image URL"
                value={post.image}
                onChange={(e) => {
                  const newPosts = [...posts];
                  while (newPosts.length <= idx) newPosts.push({ image: '', link: '' });
                  newPosts[idx] = { ...newPosts[idx], image: e.target.value };
                  onChange(newPosts);
                }}
                className={`w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 ${ringColor}`}
              />
              <input
                type="text"
                placeholder={`${label} link`}
                value={post.link}
                onChange={(e) => {
                  const newPosts = [...posts];
                  while (newPosts.length <= idx) newPosts.push({ image: '', link: '' });
                  newPosts[idx] = { ...newPosts[idx], link: e.target.value };
                  onChange(newPosts);
                }}
                className={`w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 ${ringColor}`}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">Paste image URLs and {label.toLowerCase()} post links. Shows as 3 cards per row on your profile.</p>
    </div>
  );
};

export default SocialMediaPostsEditor;
