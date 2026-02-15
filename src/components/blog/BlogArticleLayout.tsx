/**
 * Shared layout for blog article pages.
 * Matches home page quality: UniversalHeader, AppDrawer, consistent styling.
 * Provides hero image container and optional inline image containers (update src to suit).
 */

import React, { useState } from 'react';
import UniversalHeader from '../shared/UniversalHeader';
import { AppDrawer } from '../AppDrawerClean';

export interface BlogArticleLayoutProps {
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

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
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

      <article className="max-w-4xl mx-auto px-4 pt-6 pb-16">
        <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-orange-600 transition-colors">
            {language === 'id' ? 'Beranda' : 'Home'}
          </button>
          <span className="mx-1">/</span>
          <button type="button" onClick={() => onNavigate?.('blog')} className="hover:text-orange-600 transition-colors">
            Blog
          </button>
          {breadcrumbLabel && (
            <>
              <span className="mx-1">/</span>
              <span className="text-gray-900 font-medium">{breadcrumbLabel}</span>
            </>
          )}
        </nav>

        <header className="mb-8">
          {category && (
            <span className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              {category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm">
            {author && <span>{author}</span>}
            {date && <span>{date}</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        </header>

        {/* Hero / featured image container – replace heroImageSrc to use your image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-xl bg-gray-100">
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

        <div className="prose prose-lg max-w-none text-gray-700">
          {children}
        </div>
      </article>
    </div>
  );
};

export default BlogArticleLayout;
