import React from 'react';
import { BLOGGER_URL, MEDIUM_URL } from '../../config/blogLinks';

const BLOGGER_IMAGE = 'https://ik.imagekit.io/7grri5v7d/blog%202.png';
const MEDIUM_IMAGE = 'https://ik.imagekit.io/7grri5v7d/blog%2022.png';

/** Full-width Blogger and Medium link buttons – used on each blog post card */
export function BlogCardExternalLinks({ language }: { language?: string }) {
  return (
    <div className="flex flex-col gap-2 mt-3 w-full" role="group" aria-label={language === 'id' ? 'Tautan ke Blogger dan Medium' : 'Links to Blogger and Medium'}>
      <a
        href={BLOGGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center rounded-xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1 min-h-[2.75rem] py-2"
        aria-label={language === 'id' ? 'Baca di Blogger' : 'Read on Blogger'}
        title="Blogger"
      >
        <img src={BLOGGER_IMAGE} alt="" className="w-full h-full max-h-10 object-contain object-center" />
      </a>
      <a
        href={MEDIUM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center rounded-xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 min-h-[2.75rem] py-2"
        aria-label={language === 'id' ? 'Baca di Medium' : 'Read on Medium'}
        title="Medium"
      >
        <img src={MEDIUM_IMAGE} alt="" className="w-full h-full max-h-10 object-contain object-center" />
      </a>
    </div>
  );
}
