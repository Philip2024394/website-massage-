/**
 * Indastreet News – Massage & skin clinic news and headlines.
 * Fetches from Appwrite collection indastreet_news; fallback to sample data so page always opens.
 * Each post: image container (add src to suit), like, share, Facebook-style comments.
 */
import React, { useState, useEffect } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import { ThumbsUp, Share2, MessageCircle } from 'lucide-react';
import { listIndastreetNews, type IndastreetNewsItem } from '../lib/appwrite/services/indastreetNews.service';

/** Image container – add src when you have the image; placeholder shown until then */
function NewsImageContainer({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="w-full aspect-video bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full min-h-[180px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-t-xl">
          <span className="text-sm text-gray-500">Image container – add image to suit</span>
        </div>
      )}
    </div>
  );
}

type NewsCategory = 'techniques' | 'producers' | 'places-opening' | 'places-closing' | 'good-news' | 'negative' | 'headlines';

interface NewsComment {
  id: string;
  authorName: string;
  text: string;
  date: string;
}

interface NewsItem {
  id: string;
  headline: string;
  excerpt: string;
  date: string;
  category: NewsCategory;
  imageSrc?: string;
}

const CATEGORY_LABELS: Record<NewsCategory, { en: string; id: string }> = {
  techniques: { en: 'New Techniques', id: 'Teknik Baru' },
  producers: { en: 'Producers & Therapists', id: 'Produsen & Terapis' },
  'places-opening': { en: 'Places Opening', id: 'Tempat Dibuka' },
  'places-closing': { en: 'Places Closing', id: 'Tempat Ditutup' },
  'good-news': { en: 'Good News', id: 'Berita Positif' },
  negative: { en: 'Industry News', id: 'Berita Industri' },
  headlines: { en: 'Headlines', id: 'Berita Utama' },
};

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: '1',
    headline: 'New lymphatic drainage technique gains traction in spas across Asia',
    excerpt: 'Therapy centres and skin clinics are adopting updated lymphatic drainage protocols. Experts say the technique supports recovery and wellness demand.',
    date: 'Nov 10, 2025',
    category: 'techniques',
  },
  {
    id: '2',
    headline: 'Wellness chain opens three new massage and facial locations',
    excerpt: 'A major operator has announced the opening of three new sites, creating jobs for therapists and skin clinic staff in the region.',
    date: 'Nov 8, 2025',
    category: 'places-opening',
  },
  {
    id: '3',
    headline: 'Therapist certification programme expands to more countries',
    excerpt: 'The international certification body has extended its programme to additional markets, giving producers and places a unified standard.',
    date: 'Nov 5, 2025',
    category: 'producers',
  },
  {
    id: '4',
    headline: 'Skin clinic group reports strong demand for post-summer treatments',
    excerpt: 'Facial and skin clinic bookings are up as clients return to routines. Positive news for clinics and therapists in the sector.',
    date: 'Nov 2, 2025',
    category: 'good-news',
  },
  {
    id: '5',
    headline: 'Industry responds to new safety guidelines for massage and spa',
    excerpt: 'Updated guidelines have been published. Some venues are adjusting operations; associations are offering support to places and producers.',
    date: 'Oct 28, 2025',
    category: 'headlines',
  },
];

interface IndastreetNewsPageProps {
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
}

const IndastreetNewsPage: React.FC<IndastreetNewsPageProps> = ({
  onNavigate,
  onLanguageChange,
  language = 'en',
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>(SAMPLE_NEWS);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, NewsComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    listIndastreetNews(50)
      .then((list) => {
        if (!cancelled) {
          setNewsItems(list.length > 0 ? (list as NewsItem[]) : SAMPLE_NEWS);
        }
      })
      .catch(() => {
        if (!cancelled) setNewsItems(SAMPLE_NEWS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleLike = (postId: string) => {
    setLiked((prev) => {
      const isLiked = !prev[postId];
      setLikes((l) => ({ ...l, [postId]: (l[postId] || 0) + (isLiked ? 1 : -1) }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      const item = newsItems.find((n) => n.id === postId);
      navigator.share({
        title: item?.headline || 'Indastreet News',
        text: item?.excerpt || '',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleAddComment = (postId: string) => {
    const text = (newComment[postId] || '').trim();
    if (!text) return;
    const comment: NewsComment = {
      id: `c-${Date.now()}-${postId}`,
      authorName: 'Guest',
      text,
      date: new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
    setNewComment((prev) => ({ ...prev, [postId]: '' }));
  };

  const isId = language === 'id';

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
        language={language}
      />

      {/* Spacer so content starts below fixed header */}
      <div className="pt-[60px]" aria-hidden />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="overflow-hidden rounded-2xl mb-6">
            <img
              src="https://ik.imagekit.io/7grri5v7d/indastreet%20news.png"
              alt="Indastreet News"
              className="w-full h-auto object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Indastreet News
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            {isId
              ? 'Berita terbaru untuk pijat dan klinik kulit — teknik baru, produsen, tempat buka/tutup, berita positif dan terkini.'
              : 'The latest massage and skin clinic news — new techniques, producers, places opening and closing, good and industry news.'}
          </p>
        </div>
      </section>

      {/* News feed */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
        {loading && (
          <p className="text-center text-gray-500 py-8">{isId ? 'Memuat berita...' : 'Loading news...'}</p>
        )}
        <ul className="space-y-6">
          {newsItems.map((item) => {
            const postComments = comments[item.id] || [];
            const likeCount = likes[item.id] ?? 0;
            const isLiked = liked[item.id] ?? false;
            const catLabel = CATEGORY_LABELS[item.category][isId ? 'id' : 'en'];

            return (
              <li key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Image container – add imageSrc to item when you have images */}
                <NewsImageContainer src={item.imageSrc} alt={item.headline} />

                <div className="p-4 sm:p-5">
                  <span className="inline-block bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase mb-2">
                    {catLabel}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    {item.headline}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">{item.date}</p>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {item.excerpt}
                  </p>

                  {/* Like, Share, Comment counts */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isLiked ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                      <span className="sr-only">{isId ? 'Suka' : 'Like'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      {isId ? 'Bagikan' : 'Share'}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {postComments.length} {postComments.length === 1 ? (isId ? 'komentar' : 'comment') : (isId ? 'komentar' : 'comments')}
                    </span>
                  </div>

                  {/* Comments section – Facebook style */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      {isId ? 'Komentar' : 'Comments'}
                    </h3>
                    <ul className="space-y-3 mb-4">
                      {postComments.map((c) => (
                        <li key={c.id} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-semibold text-sm">
                            {c.authorName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-sm font-medium text-gray-900">{c.authorName}</p>
                            <p className="text-sm text-gray-700">{c.text}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{c.date}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment[item.id] || ''}
                        onChange={(e) => setNewComment((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder={isId ? 'Tulis komentar...' : 'Write a comment...'}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(item.id)}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {isId ? 'Kirim' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default IndastreetNewsPage;
