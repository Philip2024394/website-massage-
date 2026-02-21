/**
 * Shared layout for blog article pages.
 * Matches home page quality: UniversalHeader, AppDrawer, consistent styling.
 * When branding="indastreet-news", shows IndaStreet News header hero and breadcrumb so all article links keep the same news experience.
 */

import React, { useState } from 'react';
import UniversalHeader from '../shared/UniversalHeader';
import { AppDrawer } from '../AppDrawerClean';
import { ExternalLink } from 'lucide-react';
import { BLOGGER_URL, MEDIUM_URL } from '../../config/blogLinks';

const INDASTREET_NEWS_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20news.png';

export interface BlogArticleLayoutProps {
  /** When 'indastreet-news', renders IndaStreet News hero and breadcrumb (Home / IndaStreet News / article). */
  branding?: 'default' | 'indastreet-news';
  /** Article title (h1) */
  title: string;
  /** Category label e.g. "Industry Trends" */
  category?: string;
  /** Author name */
  author?: string;
  /** Publish date */
  date?: string;
  /** Read time e.g. "8 min read" */
  readTime?: string;
  /** Hero/featured image URL - replace with your image */
  heroImageSrc?: string;
  /** Alt text for hero image */
  heroImageAlt?: string;
  /** Breadcrumb label for this article */
  breadcrumbLabel?: string;
  onNavigate?: (page: string) => void;
  onLanguageChange?: (lang: string) => void;
  language?: 'en' | 'id';
  t?: any;
  onMassageJobsClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  therapists?: any[];
  places?: any[];
  children: React.ReactNode;
}

/**
 * Inline image container for use inside article body.
 * Replace src with your image URL when ready.
 */
export function BlogImageContainer({
  src,
  alt,
  caption,
  className = '',
}: {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`my-8 rounded-2xl overflow-hidden shadow-lg ${className}`}>
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-200 rounded-2xl">
            <span className="text-sm text-orange-600 font-medium">Image container – update src to add image</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 px-2 text-sm text-gray-500 text-center">{caption}</figcaption>
      )}
    </figure>
  );
}

const BlogArticleLayout: React.FC<BlogArticleLayoutProps> = ({
  branding = 'default',
  title,
  category,
  author,
  date,
  readTime,
  heroImageSrc,
  heroImageAlt,
  breadcrumbLabel,
  onNavigate,
  onLanguageChange,
  language = 'id',
  t,
  onMassageJobsClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  therapists = [],
  places = [],
  children,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isIndastreetNews = branding === 'indastreet-news';

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onMenuClick={() => setIsMenuOpen(true)}
        onHomeClick={() => onNavigate?.('home')}
        showHomeButton
      />

      <AppDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMassageJobsClick={onMassageJobsClick}
        onVillaPortalClick={onVillaPortalClick}
        onTherapistPortalClick={onTherapistPortalClick}
        onMassagePlacePortalClick={onMassagePlacePortalClick}
        onAgentPortalClick={onAgentPortalClick}
        onCustomerPortalClick={onCustomerPortalClick}
        onAdminPortalClick={onAdminPortalClick}
        onNavigate={onNavigate}
        onTermsClick={onTermsClick}
        onPrivacyClick={onPrivacyClick}
        therapists={therapists}
        places={places}
      />

      <div className="pt-[60px] sm:pt-16" aria-hidden />

      {/* IndaStreet News hero – same as news page so all article links share the same header/hero */}
      {isIndastreetNews && (
        <section className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative w-full aspect-[21/9] min-h-[180px] sm:min-h-[220px] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
              <img src={INDASTREET_NEWS_HERO_IMAGE} alt="IndaStreet News" className="absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-sm tracking-tight">IndaStreet News</h1>
                <p className="mt-0.5 text-xs sm:text-sm text-white/90 max-w-xl">
                  {language === 'id' ? 'Berita terbaru untuk pijat dan klinik kulit' : 'The latest massage and skin care news'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-16">
        {/* Breadcrumb – IndaStreet News or default Blog */}
        <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-orange-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-orange-200">
            {language === 'id' ? 'Beranda' : 'Home'}
          </button>
          <span className="mx-1">/</span>
          <button
            type="button"
            onClick={() => onNavigate?.(isIndastreetNews ? 'indastreet-news' : 'blog')}
            className="hover:text-orange-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {isIndastreetNews ? 'IndaStreet News' : 'Blog'}
          </button>
          {breadcrumbLabel && (
            <>
              <span className="mx-1">/</span>
              <span className="text-gray-900 font-medium">{breadcrumbLabel}</span>
            </>
          )}
        </nav>

        {/* Article card – white container matching blog index cards */}
        <article className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <header className="mb-8">
              {category && (
                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide mb-4">
                  {category}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm">
                {author && <span>{author}</span>}
                {date && <span>{date}</span>}
                {readTime && <span>{readTime}</span>}
              </div>
            </header>

            {/* Hero image – rounded-2xl/3xl to match blog index */}
            <div className="mb-4 rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
              {heroImageSrc ? (
                <img
                  src={heroImageSrc}
                  alt={heroImageAlt || title}
                  className="w-full h-auto max-h-[420px] object-cover"
                />
              ) : (
                <div className="aspect-[21/9] min-h-[240px] flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-200">
                  <span className="text-sm text-orange-600 font-medium">Hero image – update heroImageSrc to add image</span>
                </div>
              )}
            </div>

            {/* Blogger + Medium links – full-width buttons */}
            <div className="mb-10 flex flex-col gap-3 w-full">
              <a
                href={BLOGGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                aria-label={language === 'id' ? 'Baca lebih banyak di blog kami di Blogger' : 'Read more on our blog at Blogger'}
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden />
                <span>{language === 'id' ? 'Postingan di Blog Kami' : 'Our posts on Blogger'}</span>
              </a>
              <a
                href={MEDIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label={language === 'id' ? 'Halaman kami di Medium' : 'Our page on Medium'}
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden />
                <span>{language === 'id' ? 'Halaman kami di Medium' : 'Our page on Medium'}</span>
              </a>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline">
              {children}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogArticleLayout;
