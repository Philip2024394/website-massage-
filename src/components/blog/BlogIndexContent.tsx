/**
 * Reusable blog/IndaStreet News index content: hero, category filter, featured + all articles, newsletter, topics.
 * Used by IndastreetNewsPage (branded as IndaStreet News) and optionally BlogIndexPage.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BLOG_POSTS, BLOG_SLUG_TO_PAGE, type BlogPost } from '../../data/blogPosts';
import { BlogCardExternalLinks } from './BlogCardExternalLinks';

const CATEGORIES_BASE = [
  { id: 'all', nameKey: 'categoryAll', nameEn: 'All Articles', count: 16 },
  { id: 'international', nameKey: 'categoryInternational', nameEn: 'International', count: 4 },
  { id: 'industry', nameKey: 'categoryIndustry', nameEn: 'Industry Trends', count: 4 },
  { id: 'techniques', nameKey: 'categoryTechniques', nameEn: 'Massage Techniques', count: 4 },
  { id: 'career', nameKey: 'categoryCareer', nameEn: 'Career Advice', count: 3 },
  { id: 'wellness', nameKey: 'categoryWellness', nameEn: 'Wellness Tips', count: 1 },
] as const;

export interface BlogIndexContentProps {
  pageTitle: string;
  heroImageUrl: string;
  heroSubtitle: string;
  /** When true, do not render the hero (e.g. when hero is shown above the news feed on same page). */
  hideHero?: boolean;
  /** When true, hide the category filter pills and show intro text instead (e.g. on IndaStreet News page). */
  hideCategoryFilter?: boolean;
  /** Intro paragraph when hideCategoryFilter is true (e.g. wellness & beauty news from around the world). */
  introText?: string;
  language?: 'en' | 'id';
  t?: any;
  onNavigate?: (page: string) => void;
}

function getBlogPageId(slug: string): string {
  return BLOG_SLUG_TO_PAGE[slug] ?? `blog/${slug}`;
}

const BlogIndexContent: React.FC<BlogIndexContentProps> = ({
  pageTitle,
  heroImageUrl,
  heroSubtitle,
  hideHero = false,
  hideCategoryFilter = false,
  introText,
  language = 'id',
  t,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const effectiveCategory = hideCategoryFilter ? 'all' : selectedCategory;

  const categories = CATEGORIES_BASE.map((c) => ({
    id: c.id,
    name: t?.blog?.[c.nameKey] ?? c.nameEn,
    count: c.count,
  }));

  const filteredPosts = effectiveCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter((p) => p.category === effectiveCategory);
  const featuredPosts = BLOG_POSTS.filter((p) => p.featured);

  return (
    <>
      {!hideHero && (
        <section className="px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-10">
          <div className="relative w-full aspect-[21/9] min-h-[200px] sm:min-h-[260px] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden">
            <img
              src={heroImageUrl}
              alt={pageTitle}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-sm">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-white/90 max-w-xl">
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${hideHero ? 'pt-6' : 'py-10'} sm:py-14`}>
        {hideHero && hideCategoryFilter && introText && (
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-3xl mb-10 sm:mb-12">
            {introText}
          </p>
        )}
        {hideHero && !hideCategoryFilter && (
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {t?.blog?.allArticles ?? 'Articles'}
          </h2>
        )}
        {!hideCategoryFilter && (
          <div className="mb-10 sm:mb-12">
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'} text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured */}
        {effectiveCategory === 'all' && (
          <section className="mb-14 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              {t?.blog?.featuredArticles ?? 'Featured Articles'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredPosts.map((post) => (
                <ArticleCard key={post.id} post={post} categories={categories} language={language} t={t} onNavigate={onNavigate} featured expandedPostId={expandedPostId} onToggleExpand={setExpandedPostId} />
              ))}
            </div>
          </section>
        )}

        {/* All articles grid */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {effectiveCategory === 'all' ? (t?.blog?.allArticles ?? 'All Articles') : categories.find((c) => c.id === effectiveCategory)?.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} categories={categories} language={language} t={t} onNavigate={onNavigate} featured={false} expandedPostId={expandedPostId} onToggleExpand={setExpandedPostId} />
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-14 sm:mt-16">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[220px] bg-gray-100">
                <img
                  src="https://ik.imagekit.io/7grri5v7d/udun%20massage%20indoniseas.png?updatedAt=1761562429353"
                  alt="Wellness Industry Insights"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  {t?.blog?.stayUpdated ?? 'Stay Updated'}
                </h2>
                <p className="text-orange-100 text-sm sm:text-base mb-5">
                  {t?.blog?.newsletterDesc ?? (language === 'id'
                    ? 'Artikel mingguan untuk terapis, tempat pijat, dan klinik kulit — tren dan tips karier'
                    : 'Weekly articles for therapists, massage places and skin clinics — trends and career tips')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={t?.blog?.enterEmail ?? 'Enter your email'}
                    className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button type="button" className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap">
                    {t?.blog?.subscribe ?? 'Subscribe'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular topics */}
        <section className="mt-14 sm:mt-16 pb-16 sm:pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            {t?.blog?.popularTopics ?? 'Popular Topics'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {([
              { key: 'balineseMassage', fallback: 'Balinese Massage' },
              { key: 'hotelSpaManagement', fallback: 'Hotel Spa Management' },
              { key: 'skinClinicTrends', fallback: 'Skin Clinic Trends' },
              { key: 'therapistCertification', fallback: 'Therapist Certification' },
              { key: 'wellnessTourism', fallback: 'Wellness Tourism' },
              { key: 'deepTissueTechniques', fallback: 'Deep Tissue Techniques' },
              { key: 'careerGrowth', fallback: 'Career Growth' },
              { key: 'facialTreatments', fallback: 'Facial Treatments' },
            ] as const).map((topic, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">{t?.blog?.topics?.[topic.key] ?? topic.fallback}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

function ArticleCard({
  post,
  categories,
  language,
  t,
  onNavigate,
  featured,
  expandedPostId,
  onToggleExpand,
}: {
  post: BlogPost;
  categories: { id: string; name: string; count: number }[];
  language: string;
  t: any;
  onNavigate?: (page: string) => void;
  featured: boolean;
  expandedPostId: string | null;
  onToggleExpand: (id: string | null) => void;
}) {
  const catName = categories.find((c) => c.id === post.category)?.name;
  const isExpanded = expandedPostId === post.id;
  const hasExpandable = !!post.expandableSummary;
  const isId = language === 'id';
  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
      <div className={`${featured ? 'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-video'} bg-gray-100 overflow-hidden`}>
        {post.image.startsWith('http') ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">{post.image}</div>
        )}
      </div>
      <div className={featured ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
            {catName}
          </span>
          {featured && (
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
              {t?.blog?.featured ?? 'Featured'}
            </span>
          )}
        </div>
        <h3 className={featured ? 'text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2' : 'text-base sm:text-lg font-bold text-gray-900 mt-2 mb-2 line-clamp-2'}>
          {post.title}
        </h3>
        <p className={`text-gray-600 text-sm ${featured ? 'mb-4 line-clamp-3' : 'mb-3 line-clamp-2'}`}>
          {post.excerpt}
        </p>
        {hasExpandable && (
          <div className="mb-3">
            {isExpanded ? (
              <>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line border-l-2 border-orange-200 pl-4 py-2 mb-2">
                  {post.expandableSummary}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleExpand(null)}
                  className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  <ChevronUp className="w-4 h-4" />
                  {isId ? 'Tampilkan lebih sedikit' : 'Show less'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onToggleExpand(post.id)}
                className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                <ChevronDown className="w-4 h-4" />
                {isId ? 'Baca artikel lengkap' : 'Read full article'}
              </button>
            )}
          </div>
        )}
        <div className={`flex items-center justify-between ${featured ? 'text-sm' : 'text-xs'} text-gray-500 mb-3`}>
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.(getBlogPageId(post.slug))}
          className={`w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors ${!featured ? 'text-sm' : ''}`}
        >
          {featured ? (t?.blog?.readArticle ?? 'Read Article') : (t?.blog?.readMore ?? 'Read More')}
        </button>
        <BlogCardExternalLinks language={language as 'en' | 'id'} />
      </div>
    </article>
  );
}

export default BlogIndexContent;
