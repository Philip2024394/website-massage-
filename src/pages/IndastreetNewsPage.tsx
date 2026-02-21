/**
 * IndaStreet News – World-class news experience: hero, headlines feed, and in-depth articles.
 * All article links keep the IndaStreet header and hero (via BlogArticleLayout branding).
 */
import React, { useState } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BlogIndexContent from '../components/blog/BlogIndexContent';
import IndastreetNewsFeed from '../components/news/IndastreetNewsFeed';

const NEWS_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20news.png';

interface IndastreetNewsPageProps {
  onNavigate?: (page: string) => void;
  onLanguageChange?: (lang: string) => void;
  language?: 'en' | 'id';
  t?: any;
  loggedInCustomer?: { $id?: string; name?: string; username?: string; profilePhoto?: string } | null;
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
}

type NewsOrArticleTab = 'news' | 'article';

const IndastreetNewsPage: React.FC<IndastreetNewsPageProps> = ({
  onNavigate,
  onLanguageChange,
  language = 'en',
  t,
  loggedInCustomer = null,
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
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NewsOrArticleTab>('news');

  const isId = language === 'id';
  const heroSubtitle = isId
    ? 'Berita terbaru untuk pijat dan klinik kulit — teknik baru, produsen, tempat buka/tutup, berita positif dan terkini.'
    : 'The latest massage and skin care news — new techniques, producers, places opening and closing, latest industry news.';
  const articlesIntroText = isId
    ? 'Ikuti berita terbaru seputar wellness dan kecantikan dari seluruh dunia—tren industri, insight para ahli, dan tips praktis untuk terapis, spa, dan klinik kulit.'
    : 'Stay up to date with the latest wellness and beauty news from around the world—industry trends, expert insights, and practical tips for therapists, spas, and skin clinics.';

  const isLoggedIn = !!loggedInCustomer;
  const userDisplayName = loggedInCustomer?.name || loggedInCustomer?.username || '';
  const userProfilePhoto = loggedInCustomer?.profilePhoto || '';
  const userId = loggedInCustomer?.$id || '';

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-[#f8f9fa]">
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
        language={language}
      />

      <div className="pt-[60px]" aria-hidden />

      {/* Hero – editorial standard: full-width, strong typography */}
      <header className="relative w-full bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={NEWS_HERO_IMAGE}
            alt=""
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-14 sm:pb-20">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-3">
            {isId ? 'Berita & Analisis' : 'News & Analysis'}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            IndaStreet News
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </header>

      {/* Tabs under hero – right-aligned: News (left tab) | Article (right tab) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-end -mt-2 sm:-mt-3 relative z-10">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            aria-pressed={activeTab === 'news'}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'news'
                ? 'bg-orange-500 text-white shadow'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {isId ? 'Berita' : 'News'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('article')}
            aria-pressed={activeTab === 'article'}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'article'
                ? 'bg-orange-500 text-white shadow'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {isId ? 'Artikel' : 'Article'}
          </button>
        </div>
      </div>

      {/* Main content – single column max-width for readability */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {activeTab === 'news' && (
          <section className="pt-6 sm:pt-10 pb-16 sm:pb-24" aria-labelledby="headlines-label">
            <h2
              id="headlines-label"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-6"
            >
              {isId ? 'Berita Terkini' : 'Latest'}
            </h2>
            <IndastreetNewsFeed
              language={language}
              isLoggedIn={isLoggedIn}
              userDisplayName={userDisplayName}
              userProfilePhoto={userProfilePhoto}
              userId={userId}
              hideSectionTitle
            />
          </section>
        )}

        {activeTab === 'article' && (
          <section className="pt-6 sm:pt-10 pb-16 sm:pb-24" aria-labelledby="articles-label">
            <h2
              id="articles-label"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-2"
            >
              {isId ? 'Semua Artikel' : 'All Articles'}
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
              {articlesIntroText}
            </p>
            <BlogIndexContent
              pageTitle="IndaStreet News"
              heroImageUrl={NEWS_HERO_IMAGE}
              heroSubtitle={heroSubtitle}
              hideHero
              hideCategoryFilter
              introText={undefined}
              language={language}
              t={t}
              onNavigate={onNavigate}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default IndastreetNewsPage;
