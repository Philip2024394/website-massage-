/**
 * IndaStreet Social Media page — same experience for all countries.
 * One elite-standard social media: same sections (feed, news, articles, video, products),
 * connected to the same social pages; only hero text and language vary by country.
 * Hero shows country name; feed and all UI are translated into the country's language.
 * Accessed from side drawer "IndaStreet Countries" → e.g. Indonesia, United Kingdom.
 *
 * ─── FEATURE AUDIT (wellness/beauty industry, admin & feed) ───
 * ✅ REGISTRATION: "Join Community" → signup flow; user details stored in app
 *   (auth + user_registrations / therapist / place collections) and visible in
 *   admin dashboard (user/therapist/place lists). 100% connected.
 * ✅ FEED: Merges (1) mock community posts + (2) IndaStreet News from main app
 *   (indastreet_news). New updates from main app auto-appear in this feed.
 * ✅ CONVERSATIONS / SHARED FILES: Notifications & Messages in top nav route to
 *   existing app chat/notifications when implemented; Profile → signin/signup.
 * ✅ DESIGN FOR WELLNESS: Warm neutrals, soft amber/gold accents, calm typography,
 *   subtle hero text animation, gentle image hover zoom, soft icon hover states
 *   (amber). No harsh motion; suitable for trust + relaxation + beauty authority.
 * ⚠️ POST COMPOSER / CREATE POST: UI only; backend for user-generated posts
 *   (photo/video/article/event) requires a dedicated feed collection + API.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Bell,
  User,
  Home,
  Sparkles,
  Calendar,
  TrendingUp,
  Settings,
  Image as ImageIcon,
  FileText,
  Star,
  Play,
  Check,
  ThumbsUp,
  Package,
  Clock,
  CreditCard,
  MapPin,
  Briefcase,
  Trash2,
} from 'lucide-react';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';

const ChevronRightIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const ShoppingBagIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const ShieldCheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getTherapistDisplayName } from '../utils/therapistCardHelpers';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { listIndastreetNews } from '../lib/appwrite/services/indastreetNews.service';
import type { Page } from '../types/pageTypes';
import { setupSocialPageSEO } from '../utils/seoSchema';
import { SOCIAL_PAGE_SEO } from '../lib/seoConfig';
import IndastreetNewsFeed from '../components/news/IndastreetNewsFeed';
import BlogIndexContent from '../components/blog/BlogIndexContent';

// —— Design system (warm neutrals, soft beige, light gold, earth tones)
const COLORS = {
  bg: 'bg-[#faf8f5]',
  bgCard: 'bg-white',
  surface: 'bg-white/80',
  glass: 'bg-white/70 backdrop-blur-xl',
  accent: 'text-amber-700',
  accentBg: 'bg-amber-50',
  accentGold: 'text-amber-600',
  muted: 'text-stone-600',
  mutedLight: 'text-stone-500',
  border: 'border-stone-200',
  hoverGlow: 'hover:shadow-[0_0_24px_-4px_rgba(180,140,80,0.15)]',
  gradientHero: 'from-stone-900/60 via-stone-800/30 to-transparent',
};
const SPACING = { card: 'p-4 sm:p-5', section: 'space-y-4', gap: 'gap-3' };
const TYPO = {
  headline: 'font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-stone-900',
  body: 'text-stone-600 text-sm sm:text-base leading-relaxed',
  label: 'text-xs font-medium uppercase tracking-wider text-stone-500',
  meta: 'text-xs text-stone-400',
};

const HERO_IMAGE_SRC = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026';
const NEWS_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20news.png';
const LOGO_TEXT = 'IndaStreet Social';

// Mock feed post for social layout (in production would come from API)
interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  timeAgo: string;
  text: string;
  mediaUrl?: string;
  mediaAlt?: string;
  /** Up to 5 images; first is main. When set, PostCard shows main + thumbnails. */
  mediaUrls?: string[];
  videoLink?: string; // YouTube or other video URL
  /** Optional file attachment (e.g. PDF, doc) to display in post. */
  attachment?: { name: string; dataUrl: string };
  likes: number;
  comments: number;
  shares?: number; // how many times shared to social / copy link
  saved?: boolean;
  liked?: boolean;
  pending?: boolean; // true = only goes live with confirmed account
  /** Show active indicator on author avatar when true */
  authorActive?: boolean;
  /** When true, show "Busy" status instead of "Online" */
  authorBusy?: boolean;
  /** When true, show verified badge on post; clicking opens verified popup */
  authorVerified?: boolean;
  authorCountry?: string;
  authorDateJoined?: string;
  authorHobbyInterest?: string;
  authorDivisionOfEmployment?: string;
  authorBio?: string;
  commentPreview?: {
    author: string;
    text: string;
    avatar?: string;
    active?: boolean;
    country?: string;
    dateJoined?: string;
    hobbyInterest?: string;
    divisionOfEmployment?: string;
    likes?: number;
    dislikes?: number;
    replies?: { author: string; text: string }[];
    /** Star rating (1–5) from posts liked or selling; shown beside author when present */
    authorRating?: number;
  }[];
  /** Timestamp (ms) for sorting feed: latest first */
  createdAt?: number;
  /** Optional type for feed filtering: video, news, article, buy-sell, job, or general post. */
  postType?: 'video' | 'news' | 'article' | 'buy-sell' | 'job-offered' | 'job-wanted' | 'post';
  /** Job post badge label: "Job Offered" (employer) or "Position Required" (seeker). */
  jobBadge?: 'Job Offered' | 'Position Required';
  /** When jobBadge is "Job Offered", owner can add these details. */
  jobSalary?: string;
  jobHoursPerWeek?: string;
  jobAccommodationIncluded?: boolean;
  jobDailyMeals?: string;
  jobHolidayPay?: string;
  jobStartDate?: string;
  jobPositionAvailable?: string;
  jobExperienceRequired?: string;
  jobCvRequired?: boolean;
  /** When jobBadge is "Position Required", seeker can add these details. */
  positionSalary?: string;
  positionHoursPerWeek?: string;
  positionAccommodationRequired?: boolean;
  positionDailyMeals?: string;
  positionHolidayPay?: string;
  positionStartDate?: string;
  positionSought?: string;
  positionExperience?: string;
  positionCvAvailable?: boolean;
}
/** Derive postType for filtering when not explicitly set. */
function getPostType(p: FeedPost): 'video' | 'news' | 'article' | 'buy-sell' | 'job-offered' | 'job-wanted' | 'post' {
  if (p.postType) return p.postType;
  if (p.videoLink) return 'video';
  if (p.id.startsWith('news-')) return 'news';
  return 'post';
}

/** Return embed URL for YouTube or Vimeo so we can show a video player instead of a raw link. */
function getVideoEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  // YouTube: watch, youtu.be, embed
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of ytPatterns) {
    const m = trimmed.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  // Vimeo: vimeo.com/123456789 or player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function getMockFeedPosts(therapists: any[], language: string): FeedPost[] {
  const isId = language === 'id';
  const t = (en: string, id: string) => (isId ? id : en);
  const now = Date.now();
  const base: FeedPost[] = [
    {
      id: '1',
      authorName: 'Dewi Spa',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      authorRole: t('Facial & massage therapist', 'Terapis facial & pijat'),
      timeAgo: t('2h ago', '2 jam lalu'),
      text: t('Tip: Always hydrate before a massage session. It helps muscles relax and improves circulation. 💆‍♀️', 'Tip: Selalu minum air sebelum pijat. Membantu otot rileks dan sirkulasi lebih baik. 💆‍♀️'),
      mediaUrl: 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026',
      mediaAlt: 'Wellness',
      likes: 24,
      comments: 3,
      shares: 0,
      saved: false,
      liked: false,
      authorActive: true,
      authorBusy: false,
      authorVerified: true,
      authorCountry: 'Indonesia',
      authorDateJoined: t('Jan 2024', 'Jan 2024'),
      authorDivisionOfEmployment: t('Wellness & Spa', 'Wellness & Spa'),
      authorHobbyInterest: t('Skincare, aromatherapy', 'Skincare, aromaterapi'),
      authorBio: t('Facial and massage therapist. Passionate about holistic wellness.', 'Terapis facial dan pijat. Tertarik pada wellness holistik.'),
      commentPreview: [
        { author: 'Budi', text: t('Great tip!', 'Tip bagus!'), active: true, country: 'Indonesia', dateJoined: t('Mar 2024', 'Mar 2024'), divisionOfEmployment: t('Freelance', 'Freelance'), hobbyInterest: t('Massage', 'Pijat'), likes: 2, dislikes: 0, replies: [], authorRating: 5 },
      ],
      createdAt: now - 2 * 60 * 60 * 1000,
    },
    {
      id: '2',
      authorName: 'Bali Wellness',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      authorRole: t('Skin clinic', 'Klinik kulit'),
      timeAgo: t('5h ago', '5 jam lalu'),
      text: t('Our new aromatherapy blend is now available for home service bookings. Relaxation + glow in one session.', 'Blend aromaterapi baru kami tersedia untuk booking layanan rumah. Relaksasi + glow dalam satu sesi.'),
      likes: 18,
      comments: 7,
      shares: 0,
      saved: true,
      liked: false,
      authorActive: false,
      authorBusy: true,
      authorVerified: true,
      authorCountry: 'Indonesia',
      authorDateJoined: t('Sep 2023', 'Sep 2023'),
      authorDivisionOfEmployment: t('Skin clinic', 'Klinik kulit'),
      authorHobbyInterest: t('Aromatherapy, wellness', 'Aromaterapi, wellness'),
      commentPreview: [],
      createdAt: now - 5 * 60 * 60 * 1000,
    },
    {
      id: 'mock-video-1',
      authorName: 'Bali Wellness',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      authorRole: t('Skin clinic', 'Klinik kulit'),
      timeAgo: t('3h ago', '3 jam lalu'),
      text: t('Quick tutorial: how to apply our new facial serum for best results.', 'Tutorial singkat: cara pakai serum facial baru kami untuk hasil terbaik.'),
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likes: 42,
      comments: 8,
      shares: 2,
      saved: false,
      liked: false,
      authorVerified: true,
      commentPreview: [],
      createdAt: now - 3 * 60 * 60 * 1000,
      postType: 'video',
    },
    {
      id: 'mock-article-1',
      authorName: 'Dewi Spa',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      authorRole: t('Facial & massage therapist', 'Terapis facial & pijat'),
      timeAgo: t('1d ago', '1 hari lalu'),
      text: t('5 benefits of regular facial massage — improved circulation, relaxation, and glowing skin. Read the full article on our blog.', '5 manfaat pijat wajah rutin — sirkulasi lebih baik, relaksasi, dan kulit bersinar. Baca artikel lengkap di blog kami.'),
      mediaUrl: 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026',
      mediaAlt: 'Facial',
      likes: 31,
      comments: 5,
      commentPreview: [],
      createdAt: now - 24 * 60 * 60 * 1000,
      postType: 'article',
    },
    {
      id: 'mock-buysell-1',
      authorName: 'Bali Wellness',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      authorRole: t('Skin clinic', 'Klinik kulit'),
      timeAgo: t('6h ago', '6 jam lalu'),
      text: t('Selling unused aromatherapy diffuser — like new, IDR 150K. Local pickup or delivery in Bali. DM for details.', 'Jual diffuser aromaterapi belum dipakai — seperti baru, Rp 150rb. Ambil di tempat atau antar di Bali. DM untuk detail.'),
      likes: 5,
      comments: 2,
      commentPreview: [],
      createdAt: now - 6 * 60 * 60 * 1000,
      postType: 'buy-sell',
    },
  ];
  therapists.slice(0, 2).forEach((th, i) => {
    const name = getTherapistDisplayName(th.name ?? th.displayName);
    const img = th.mainImage ?? th.profilePicture ?? getRandomTherapistImage((th.$id ?? th.id ?? i).toString());
    base.push({
      id: `th-${th.$id ?? th.id ?? i}`,
      authorName: name,
      authorAvatar: img,
      authorRole: t('Massage therapist', 'Terapis pijat'),
      timeAgo: t('1d ago', '1 hari lalu'),
      text: t('Available for home massage in your area today. Book a session and unwind.', 'Tersedia untuk pijat di rumah di area Anda hari ini. Pesan sesi dan rileks.'),
      mediaUrl: img,
      mediaAlt: name,
      likes: 12 + i * 5,
      comments: 1,
      shares: 0,
      saved: false,
      liked: false,
      authorActive: i === 0,
      authorBusy: i === 1,
      authorVerified: true,
      authorCountry: 'Indonesia',
      authorDateJoined: t('2024', '2024'),
      authorDivisionOfEmployment: t('Therapist', 'Terapis'),
      commentPreview: [],
      createdAt: now - (24 + i) * 60 * 60 * 1000,
    });
  });
  return base;
}

// Mock events for search (in production would come from API)
interface SearchEvent {
  id: string;
  title: string;
  date: string;
  description: string;
}
function getMockEvents(language: string): SearchEvent[] {
  const isId = language === 'id';
  return [
    { id: 'ev1', title: isId ? 'Workshop Pijat Bali' : 'Balinese Massage Workshop', date: '2025-02-15', description: isId ? 'Pelatihan pijat tradisional Bali.' : 'Traditional Balinese massage training.' },
    { id: 'ev2', title: isId ? 'Wellness Weekend Jakarta' : 'Wellness Weekend Jakarta', date: '2025-02-20', description: isId ? 'Acara wellness dan spa di Jakarta.' : 'Wellness and spa event in Jakarta.' },
    { id: 'ev3', title: isId ? 'Sesi Facial Gratis' : 'Free Facial Session', date: '2025-03-01', description: isId ? 'Demo perawatan wajah dan konsultasi.' : 'Facial treatment demo and consultation.' },
  ];
}

/** Map main-app news items to feed post shape so they auto-appear in the IndaStreet Social feed. Uses date for createdAt so latest news appears first. */
function newsToFeedPosts(news: { id: string; headline: string; excerpt: string; date: string; imageSrc?: string }[], language: string): FeedPost[] {
  const isId = language === 'id';
  return news.slice(0, 10).map((n) => {
    const createdAt = n.date ? new Date(n.date).getTime() : Date.now();
    return {
      id: `news-${n.id}`,
      authorName: 'IndaStreet',
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026',
      authorRole: isId ? 'Berita wellness' : 'Wellness updates',
      timeAgo: n.date || (isId ? 'Baru' : 'New'),
      text: n.headline + (n.excerpt ? '\n\n' + n.excerpt : ''),
      mediaUrl: n.imageSrc,
      mediaAlt: n.headline,
      likes: 0,
      comments: 0,
      shares: 0,
      saved: false,
      liked: false,
      commentPreview: [],
      createdAt: Number.isNaN(createdAt) ? Date.now() : createdAt,
      postType: 'news',
    };
  });
}

// —— Top nav: logo, location row, icons + notification dropdown when signed in
const TopNav: React.FC<{
  onMenuClick: () => void;
  onProfileClick?: () => void;
  language: string;
  isLoggedIn?: boolean;
  notifications?: FeedNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onNotificationClick?: (n: FeedNotification) => void;
  /** Location text shown under the main nav row (e.g. "Location: Indonesia") */
  locationText?: string;
}> = ({ onMenuClick, onProfileClick, language, isLoggedIn, notifications = [], onMarkNotificationRead, onNotificationClick, locationText }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const isId = language === 'id';
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [notifOpen]);

  return (
    <header className={`sticky top-0 z-50 ${COLORS.glass} ${COLORS.border} border-b`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">
        <span className={`${TYPO.headline} text-lg sm:text-xl truncate`}>{LOGO_TEXT}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 sm:gap-2">
          {isLoggedIn && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2.5 rounded-xl hover:bg-amber-50 text-stone-600 hover:text-amber-700 transition-colors"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 max-h-[70vh] overflow-auto bg-white rounded-xl border border-stone-200 shadow-xl z-50">
                  <div className="p-2 border-b border-stone-100 font-semibold text-stone-800 text-sm">
                    {isId ? 'Notifikasi' : 'Notifications'}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-stone-500">{isId ? 'Belum ada notifikasi' : 'No notifications yet'}</p>
                  ) : (
                    <ul className="divide-y divide-stone-100">
                      {[...notifications].reverse().map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onMarkNotificationRead?.(n.id);
                              onNotificationClick?.(n);
                              setNotifOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 hover:bg-amber-50/80 transition-colors ${n.read ? 'bg-stone-50/50' : 'bg-amber-50/50'}`}
                          >
                            <p className="text-sm font-medium text-stone-900">
                              <span className="text-amber-700">{n.commentAuthorName}</span>
                              {isId ? ' mengomentari postingan Anda' : ' commented on your post'}
                            </p>
                            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{n.commentText}</p>
                            <p className="text-[10px] text-stone-400 mt-1">
                              {new Date(n.createdAt).toLocaleString(isId ? 'id-ID' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          {!isLoggedIn && (
            <button type="button" className="p-2.5 rounded-xl hover:bg-amber-50 text-stone-600 hover:text-amber-700 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
          )}
          <button type="button" className="p-2.5 rounded-xl hover:bg-amber-50 text-stone-600 hover:text-amber-700 transition-colors" aria-label="Messages">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button type="button" onClick={onProfileClick} className="p-2.5 rounded-full overflow-hidden border-2 border-stone-200 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/20 transition-all duration-300" aria-label="Profile">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-700" />
            </div>
          </button>
          <button type="button" onClick={onMenuClick} className="flex-shrink-0 p-2 rounded-lg hover:bg-white/50 transition-colors" aria-label="Menu">
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="block h-0.5 bg-stone-600 rounded" />
              <span className="block h-0.5 bg-stone-600 rounded" />
              <span className="block h-0.5 bg-stone-600 rounded" />
            </div>
          </button>
        </div>
      </div>
      {locationText != null && locationText !== '' && (
        <div className="bg-stone-100/95 border-t border-stone-200/80 px-3 sm:px-6 py-1.5 flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" aria-hidden />
          <span className="text-xs font-medium text-stone-700">{locationText}</span>
        </div>
      )}
    </header>
  );
};

// —— Hero: full-width image (default or IndaStreet News), headline, CTAs
const HeroSection: React.FC<{
  heroImageSrc?: string;
  label: string;
  headline: string;
  subtext: string;
  ctaCommunity: string;
  ctaExplore: string;
  onJoinCommunity: () => void;
  onExplorePosts: () => void;
}> = ({ heroImageSrc = HERO_IMAGE_SRC, label, headline, subtext, ctaCommunity, ctaExplore, onJoinCommunity, onExplorePosts }) => (
  <section className="relative w-full min-h-[280px] sm:min-h-[360px] overflow-hidden rounded-b-3xl">
    <img src={heroImageSrc} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out hover:scale-[1.02]" />
    <div className={`absolute inset-0 bg-gradient-to-t ${COLORS.gradientHero}`} />
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-14 text-white">
      <p className={TYPO.label + ' text-amber-200/90 mb-2'} style={{ animation: 'indoFadeInUp 0.6s ease-out 0.1s forwards', opacity: 0 }}>{label}</p>
      <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-white drop-shadow-lg mb-3" style={{ animation: 'indoFadeInUp 0.7s ease-out 0.2s forwards', opacity: 0 }}>
        {headline}
      </h1>
      <p className="text-white/90 text-sm sm:text-base max-w-xl mb-6" style={{ animation: 'indoFadeInUp 0.7s ease-out 0.35s forwards', opacity: 0 }}>
        {subtext}
      </p>
      <div className="flex flex-wrap gap-3" style={{ animation: 'indoFadeInUp 0.6s ease-out 0.5s forwards', opacity: 0 }}>
        <button
          type="button"
          onClick={onJoinCommunity}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900/20"
        >
          {ctaCommunity}
        </button>
        <button
          type="button"
          onClick={onExplorePosts}
          className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur border border-white/40 text-white font-semibold text-sm hover:bg-white/30 transition-all duration-300"
        >
          {ctaExplore}
        </button>
      </div>
    </div>
  </section>
);

// —— Search bar under hero (controlled); placeholder can rotate through options (running text)
const HeroSearchBar: React.FC<{
  placeholder: string;
  /** When set, placeholder cycles through these for a "running text" effect. */
  placeholderOptions?: string[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  searchButtonLabel: string;
}> = ({ placeholder, placeholderOptions, value, onChange, onSubmit, onClear, searchButtonLabel }) => {
  const options = placeholderOptions?.length ? placeholderOptions : [placeholder];
  const [runningIndex, setRunningIndex] = useState(0);
  useEffect(() => {
    if (options.length <= 1) return;
    const t = setInterval(() => setRunningIndex((i) => (i + 1) % options.length), 2000);
    return () => clearInterval(t);
  }, [options.length]);
  const displayPlaceholder = options[runningIndex % options.length] ?? placeholder;
  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm -mt-1 relative z-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <form className="relative" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={displayPlaceholder}
            className="w-full pl-12 pr-24 py-3 rounded-xl bg-stone-100/80 border border-stone-200 text-stone-800 placeholder-stone-500 placeholder:transition-opacity duration-300 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
            aria-label="Search"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value.trim() && onClear && (
              <button type="button" onClick={onClear} className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/80" aria-label="Clear search">
                <span className="text-lg leading-none">&times;</span>
              </button>
            )}
            <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600">
              {searchButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// —— Profile preview for post/comment authors (professional popup)
export interface SocialProfilePreview {
  name: string;
  avatar: string;
  role?: string;
  country?: string;
  dateJoined?: string;
  hobbyInterest?: string;
  divisionOfEmployment?: string;
  bio?: string;
  active?: boolean;
}
const SocialProfilePopup: React.FC<{
  profile: SocialProfilePreview | null;
  onClose: () => void;
  language: string;
}> = ({ profile, onClose, language }) => {
  const isId = language === 'id';
  if (!profile) return null;
  const rows: { label: string; value?: string }[] = [
    { label: isId ? 'Negara' : 'Country', value: profile.country },
    { label: isId ? 'Bergabung' : 'Date joined', value: profile.dateJoined },
    { label: isId ? 'Divisi / Pekerjaan' : 'Division of employment', value: profile.divisionOfEmployment },
    { label: isId ? 'Hobi & minat' : 'Hobby & interest', value: profile.hobbyInterest },
    { label: isId ? 'Tentang' : 'About', value: profile.bio },
  ].filter((r) => r.value && r.value.trim());
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-stone-200">
        <div className="p-5 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-amber-100 border-2 border-white shadow-lg mx-auto">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            {profile.active && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title={isId ? 'Aktif' : 'Active'} aria-hidden />
            )}
          </div>
          <h3 className="mt-3 font-semibold text-stone-900 text-lg">{profile.name}</h3>
          {profile.role && <p className="text-sm text-amber-600 font-medium">{profile.role}</p>}
        </div>
        {rows.length > 0 && (
          <dl className="px-5 pb-5 pt-2 border-t border-stone-100 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">{r.label}</dt>
                <dd className="text-sm text-stone-800">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="px-5 pb-5">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50">
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// —— Verified badge popup: small window when user clicks verified badge on a post
const VerifiedBadgePopup: React.FC<{
  author: { name: string; avatar: string; role?: string } | null;
  onClose: () => void;
  language: string;
}> = ({ author, onClose, language }) => {
  const isId = language === 'id';
  if (!author) return null;
  const indastreetUrl = 'https://www.indastreetmassage.com';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xs w-full overflow-hidden border border-stone-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-amber-100 flex-shrink-0">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-900 truncate">{author.name}</h3>
            {author.role && <p className="text-xs text-amber-600 font-medium truncate">{author.role}</p>}
          </div>
          <img src={VERIFIED_BADGE_IMAGE_URL} alt="" className="w-8 h-8 flex-shrink-0 object-contain" aria-hidden />
        </div>
        <p className="text-sm text-stone-600">
          {isId
            ? 'Anggota ini adalah penyedia layanan terverifikasi di indastreetmassage.com'
            : 'This member is a verified service provider on indastreetmassage.com'}
        </p>
        <a
          href={indastreetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          indastreetmassage.com
        </a>
        <div className="mt-4">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50">
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// —— Notifications (e.g. comment on your post) — shown in header when signed in
export interface FeedNotification {
  id: string;
  type: 'comment';
  postId: string;
  /** Who wrote the comment */
  commentAuthorName: string;
  commentText: string;
  /** Post author who receives this notification */
  postAuthorName: string;
  createdAt: number;
  read: boolean;
}

// —— Search results: topics, video, news, events, posts (full system)
function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return false;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return terms.some((t) => lower.includes(t));
}
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u024F]+/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1).toLowerCase()))] : [];
}

const SearchResultsView: React.FC<{
  query: string;
  topics: string[];
  video: FeedPost[];
  news: FeedPost[];
  events: SearchEvent[];
  posts: FeedPost[];
  products: ProductListing[];
  onClearSearch: () => void;
  onPostClick: (postId: string) => void;
  onProductClick?: (product: ProductListing) => void;
  language: string;
  renderPostCard: (post: FeedPost) => React.ReactNode;
}> = ({ query, topics, video, news, events, posts, products, onClearSearch, onPostClick, onProductClick, language, renderPostCard }) => {
  const isId = language === 'id';
  const hasResults = topics.length > 0 || video.length > 0 || news.length > 0 || events.length > 0 || posts.length > 0 || products.length > 0;

  return (
    <main className="flex-1 min-w-0 max-w-2xl mx-auto space-y-6 pb-24 lg:pb-12">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          {isId ? 'Hasil pencarian' : 'Search results'}: <span className="text-amber-600">&quot;{query}&quot;</span>
        </h2>
        <button type="button" onClick={onClearSearch} className="text-sm font-medium text-amber-600 hover:text-amber-700">
          {isId ? 'Hapus & tampilkan feed' : 'Clear & show feed'}
        </button>
      </div>
      {!hasResults ? (
        <div className={`${COLORS.bgCard} rounded-2xl ${COLORS.border} border p-8 text-center`}>
          <p className="text-stone-600">{isId ? 'Tidak ada hasil. Coba kata kunci lain atau jelajahi feed.' : 'No results. Try different keywords or browse the feed.'}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {topics.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                {isId ? 'Topik' : 'Topics'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button key={t} type="button" className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100">
                    #{t}
                  </button>
                ))}
              </div>
            </section>
          )}
          {video.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <Play className="w-4 h-4 text-amber-600" />
                {isId ? 'Video' : 'Video'}
              </h3>
              <div className="space-y-4">
                {video.map((post) => (
                  <div key={post.id} onClick={() => onPostClick(post.id)} className="cursor-pointer">
                    {renderPostCard(post)}
                  </div>
                ))}
              </div>
            </section>
          )}
          {news.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <Bell className="w-4 h-4 text-amber-600" />
                {isId ? 'Berita' : 'News'}
              </h3>
              <div className="space-y-4">
                {news.map((post) => (
                  <div key={post.id} onClick={() => onPostClick(post.id)} className="cursor-pointer">
                    {renderPostCard(post)}
                  </div>
                ))}
              </div>
            </section>
          )}
          {events.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <Calendar className="w-4 h-4 text-amber-600" />
                {isId ? 'Acara' : 'Events'}
              </h3>
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className={`${COLORS.bgCard} rounded-xl ${COLORS.border} border p-4 hover:border-amber-300 transition-colors`}>
                    <p className="font-semibold text-stone-900">{ev.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{ev.date}</p>
                    <p className="text-sm text-stone-600 mt-1">{ev.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {posts.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                {isId ? 'Postingan' : 'Posts'}
              </h3>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} onClick={() => onPostClick(post.id)} className="cursor-pointer">
                    {renderPostCard(post)}
                  </div>
                ))}
              </div>
            </section>
          )}
          {products.length > 0 && onProductClick && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                <ShoppingBagIcon className="w-4 h-4 text-amber-600" />
                {isId ? 'Produk (Jual/Beli)' : 'Products (Buy/Sell)'}
              </h3>
              <ul className="space-y-2">
                {products.slice(0, 5).map((p) => (
                  <li key={p.id} className={`${COLORS.bgCard} rounded-xl ${COLORS.border} border p-4 flex gap-3 hover:border-amber-300 transition-colors`}>
                    <img src={p.mainImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 truncate">{p.title}</p>
                      <p className="text-xs text-stone-500">{p.price} {p.currency}</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onProductClick(p); }} className="text-amber-600 text-sm font-medium flex-shrink-0">
                      {isId ? 'Lihat' : 'View'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
};

// —— Quick links under hero: Feed, Video, Articles, News, Buy/Sell
const HeroQuickLinks: React.FC<{
  onFeed?: () => void;
  feedUnviewedCount?: number;
  onVideo?: () => void;
  onArticles?: () => void;
  onNews?: () => void;
  onBuySell?: () => void;
  language: string;
}> = ({ onFeed, feedUnviewedCount = 0, onVideo, onArticles, onNews, onBuySell, language }) => {
  const isId = language === 'id';
  const links = [
    ...(onFeed ? [{ id: 'feed' as const, icon: Home, label: isId ? 'Feed' : 'Feed', onClick: onFeed, badge: feedUnviewedCount }] : []),
    ...(onVideo ? [{ id: 'video' as const, icon: Play, label: isId ? 'Video' : 'Video', onClick: onVideo, badge: 0 }] : []),
    ...(onArticles ? [{ id: 'articles', icon: FileText, label: isId ? 'Artikel' : 'Articles', onClick: onArticles, badge: 0 }] : []),
    ...(onNews ? [{ id: 'news', icon: Bell, label: isId ? 'Berita' : 'News', onClick: onNews, badge: 0 }] : []),
    ...(onBuySell ? [{ id: 'buy-sell', icon: ShoppingBagIcon, label: isId ? 'Jual/Beli' : 'Buy/Sell', onClick: onBuySell, badge: 0 }] : []),
  ];
  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm -mt-1 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3">
          {links.map(({ id, icon: Icon, label, onClick, badge = 0 }) => (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-stone-600 hover:text-amber-700 hover:bg-amber-50 font-medium text-sm transition-colors"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {badge > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// —— Job offer form fields (when owner selects "Job Offered")
export interface JobOfferFields {
  salary: string;
  hoursPerWeek: string;
  accommodationIncluded: boolean;
  dailyMeals: string;
  holidayPay: string;
  startDate: string;
  positionAvailable: string;
  experienceRequired: string;
  cvRequired: boolean;
}
const initialJobOfferFields: JobOfferFields = {
  salary: '',
  hoursPerWeek: '',
  accommodationIncluded: false,
  dailyMeals: '',
  holidayPay: '',
  startDate: '',
  positionAvailable: '',
  experienceRequired: '',
  cvRequired: false,
};

// —— Position Required form fields (when user selects "Position Required" — job seeker)
export interface PositionRequiredFields {
  salary: string;
  hoursPerWeek: string;
  accommodationRequired: boolean;
  dailyMeals: string;
  holidayPay: string;
  startDate: string;
  positionSought: string;
  experience: string;
  cvAvailable: boolean;
}
const initialPositionRequiredFields: PositionRequiredFields = {
  salary: '',
  hoursPerWeek: '',
  accommodationRequired: false,
  dailyMeals: '',
  holidayPay: '',
  startDate: '',
  positionSought: '',
  experience: '',
  cvAvailable: false,
};

// —— Post composer: premium social UI (glass card, toolbar, images up to 5, video link, char count)
const MAX_CHARS = 2000;
const MAX_IMAGES = 5;
const PostComposer: React.FC<{
  placeholder: string;
  textValue: string;
  videoLinkValue: string;
  imageUrls: string[];
  attachment: { name: string; dataUrl: string } | null;
  /** When set, post is a job listing (Job Offered or Position Required). Job posts can be text-only. */
  jobBadge?: null | 'Job Offered' | 'Position Required';
  /** When jobBadge is "Job Offered", owner fills these. */
  jobOfferFields?: JobOfferFields;
  onJobOfferFieldsChange?: (fields: JobOfferFields) => void;
  /** When jobBadge is "Position Required", seeker fills these. */
  positionRequiredFields?: PositionRequiredFields;
  onPositionRequiredFieldsChange?: (fields: PositionRequiredFields) => void;
  onTextChange: (v: string) => void;
  onVideoLinkChange: (v: string) => void;
  onImageUrlsChange: (urls: string[]) => void;
  onAttachmentChange: (att: { name: string; dataUrl: string } | null) => void;
  onJobBadgeChange?: (v: null | 'Job Offered' | 'Position Required') => void;
  onPost: () => void;
  postLabel: string;
  videoLinkPlaceholder: string;
  language: string;
}> = ({ placeholder, textValue, videoLinkValue, imageUrls, attachment, jobBadge = null, jobOfferFields = initialJobOfferFields, onJobOfferFieldsChange, positionRequiredFields = initialPositionRequiredFields, onPositionRequiredFieldsChange, onTextChange, onVideoLinkChange, onImageUrlsChange, onAttachmentChange, onJobBadgeChange, onPost, postLabel, videoLinkPlaceholder, language }) => {
  const isId = language === 'id';
  const [showLinkSection, setShowLinkSection] = useState(!!videoLinkValue);
  const [focused, setFocused] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const hasMedia = imageUrls.length >= 1 || !!videoLinkValue.trim();
  const jobBadgeVal = jobBadge ?? null;
  const isJobPost = jobBadgeVal != null;
  const canPost = hasMedia && !(textValue.length > MAX_CHARS) && (!isJobPost || textValue.trim().length > 0);
  const charCount = textValue.length;
  const nearLimit = charCount > MAX_CHARS * 0.9;
  const overLimit = charCount > MAX_CHARS;

  useEffect(() => {
    if (videoLinkValue.trim()) setShowLinkSection(true);
  }, [videoLinkValue]);
  useEffect(() => {
    if (mainImageIndex >= imageUrls.length && imageUrls.length > 0) setMainImageIndex(0);
  }, [imageUrls.length, mainImageIndex]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length <= MAX_CHARS) onTextChange(v);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) return;
    const toAdd = Math.min(remaining, files.length);
    const newUrls: string[] = [];
    let processed = 0;
    const readNext = () => {
      if (processed >= toAdd) {
        onImageUrlsChange([...imageUrls, ...newUrls]);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') newUrls.push(reader.result);
        processed++;
        readNext();
      };
      reader.readAsDataURL(files[processed]);
    };
    readNext();
  };

  const removeImage = (index: number) => {
    const next = imageUrls.filter((_, i) => i !== index);
    onImageUrlsChange(next);
    if (mainImageIndex >= next.length && next.length > 0) setMainImageIndex(next.length - 1);
    else if (mainImageIndex > index) setMainImageIndex(mainImageIndex - 1);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onAttachmentChange({ name: file.name, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/90 backdrop-blur-xl
        border border-stone-200/90
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)]
        transition-all duration-300
        ${focused ? 'shadow-[0_2px_8px_rgba(180,140,80,0.12),0_12px_32px_-4px_rgba(0,0,0,0.08)] border-amber-200/60 ring-2 ring-amber-500/10' : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_28px_-4px_rgba(180,140,80,0.08)]'}
      `}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90" />

      <div className="p-4 sm:p-5">
        {/* Header: avatar + label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ring-2 ring-white shadow-md">
              <User className="w-5 h-5 text-amber-700" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title={isId ? 'Aktif' : 'Active'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-900 text-sm">{isId ? 'Buat postingan' : 'Create post'}</p>
            <p className="text-xs text-stone-500">{isId ? 'Wajib ada foto atau video. Hingga 5 foto + 1 link video — atau posting lowongan (gratis)' : 'Photo or video required. Up to 5 images + 1 video link — or post a job (free)'}</p>
          </div>
        </div>

        {/* Job post badge: Job Offered (employer) / Position Required (seeker) — free */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500">{isId ? 'Posting sebagai:' : 'Post as:'}</span>
          <button type="button" onClick={() => onJobBadgeChange?.(jobBadgeVal === 'Job Offered' ? null : 'Job Offered')} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${jobBadgeVal === 'Job Offered' ? 'bg-black text-amber-400 ring-2 ring-amber-400 [&_svg]:text-amber-400' : 'bg-stone-100 text-stone-600 hover:bg-black hover:text-amber-400 [&_svg]:hover:text-amber-400'}`}>
            <Briefcase className="w-3.5 h-3.5" />
            {isId ? 'Lowongan Ditawarkan' : 'Job Offered'}
          </button>
          <button type="button" onClick={() => onJobBadgeChange?.(jobBadgeVal === 'Position Required' ? null : 'Position Required')} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${jobBadgeVal === 'Position Required' ? 'bg-black text-amber-400 ring-2 ring-amber-400 [&_svg]:text-amber-400' : 'bg-stone-100 text-stone-600 hover:bg-black hover:text-amber-400 [&_svg]:hover:text-amber-400'}`}>
            <Briefcase className="w-3.5 h-3.5" />
            {isId ? 'Posisi Dibutuhkan' : 'Position Required'}
          </button>
          {jobBadgeVal && (
            <button type="button" onClick={() => onJobBadgeChange?.(null)} className="text-[10px] text-stone-400 hover:text-stone-600 font-medium">
              {isId ? 'Batal' : 'Clear'}
            </button>
          )}
        </div>

        {/* Job Offered details — owner fills when posting a job offer */}
        {jobBadgeVal === 'Job Offered' && onJobOfferFieldsChange && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-3">
            <p className="text-xs font-semibold text-amber-800">{isId ? 'Detail lowongan (opsional)' : 'Job details (optional)'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Gaji' : 'Salary'}</label>
                <input type="text" value={jobOfferFields.salary} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, salary: e.target.value })} placeholder={isId ? 'Contoh: Rp 4–6 jt' : 'e.g. Rp 4–6M'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Jam/minggu' : 'Hours per week'}</label>
                <input type="text" value={jobOfferFields.hoursPerWeek} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, hoursPerWeek: e.target.value })} placeholder="e.g. 40" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="job-acc" checked={jobOfferFields.accommodationIncluded} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, accommodationIncluded: e.target.checked })} className="rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="job-acc" className="text-xs font-medium text-stone-700">{isId ? 'Akomodasi disediakan' : 'Accommodation included'}</label>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Makan sehari-hari' : 'Daily meals'}</label>
                <input type="text" value={jobOfferFields.dailyMeals} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, dailyMeals: e.target.value })} placeholder={isId ? 'Ya / Tidak / Sebagian' : 'Yes / No / Partial'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Bayaran libur' : 'Holiday pay'}</label>
                <input type="text" value={jobOfferFields.holidayPay} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, holidayPay: e.target.value })} placeholder={isId ? 'Opsional' : 'Optional'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Tanggal mulai' : 'Start date'}</label>
                <input type="text" value={jobOfferFields.startDate} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, startDate: e.target.value })} placeholder="e.g. ASAP / Jan 2026" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Posisi tersedia' : 'Position available'}</label>
                <input type="text" value={jobOfferFields.positionAvailable} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, positionAvailable: e.target.value })} placeholder={isId ? 'Contoh: Terapis pijat' : 'e.g. Massage therapist'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Pengalaman dibutuhkan' : 'Experience required'}</label>
                <input type="text" value={jobOfferFields.experienceRequired} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, experienceRequired: e.target.value })} placeholder="e.g. 2+ years" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="job-cv" checked={jobOfferFields.cvRequired} onChange={(e) => onJobOfferFieldsChange({ ...jobOfferFields, cvRequired: e.target.checked })} className="rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="job-cv" className="text-xs font-medium text-stone-700">{isId ? 'CV wajib' : 'CV required'}</label>
              </div>
            </div>
          </div>
        )}

        {/* Position Required details — seeker fills when looking for a job */}
        {jobBadgeVal === 'Position Required' && onPositionRequiredFieldsChange && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
            <p className="text-xs font-semibold text-emerald-800">{isId ? 'Detail posisi yang dicari (opsional)' : 'Position details (optional)'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Posisi dicari' : 'Position sought'}</label>
                <input type="text" value={positionRequiredFields.positionSought} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, positionSought: e.target.value })} placeholder={isId ? 'Contoh: Terapis pijat' : 'e.g. Massage therapist'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Gaji yang diharapkan' : 'Expected salary'}</label>
                <input type="text" value={positionRequiredFields.salary} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, salary: e.target.value })} placeholder={isId ? 'Contoh: Rp 4–6 jt' : 'e.g. Rp 4–6M'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Jam/minggu' : 'Hours per week'}</label>
                <input type="text" value={positionRequiredFields.hoursPerWeek} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, hoursPerWeek: e.target.value })} placeholder="e.g. 40" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Tersedia mulai' : 'Available from'}</label>
                <input type="text" value={positionRequiredFields.startDate} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, startDate: e.target.value })} placeholder="e.g. ASAP / Jan 2026" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="pos-acc" checked={positionRequiredFields.accommodationRequired} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, accommodationRequired: e.target.checked })} className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="pos-acc" className="text-xs font-medium text-stone-700">{isId ? 'Akomodasi dibutuhkan' : 'Accommodation required'}</label>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Makan sehari-hari' : 'Daily meals'}</label>
                <input type="text" value={positionRequiredFields.dailyMeals} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, dailyMeals: e.target.value })} placeholder={isId ? 'Ya / Tidak / Opsional' : 'Yes / No / Optional'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Bayaran libur' : 'Holiday pay'}</label>
                <input type="text" value={positionRequiredFields.holidayPay} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, holidayPay: e.target.value })} placeholder={isId ? 'Opsional' : 'Optional'} className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-stone-500 mb-0.5">{isId ? 'Pengalaman' : 'Experience'}</label>
                <input type="text" value={positionRequiredFields.experience} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, experience: e.target.value })} placeholder="e.g. 2+ years" className="w-full py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="pos-cv" checked={positionRequiredFields.cvAvailable} onChange={(e) => onPositionRequiredFieldsChange({ ...positionRequiredFields, cvAvailable: e.target.checked })} className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="pos-cv" className="text-xs font-medium text-stone-700">{isId ? 'CV tersedia' : 'CV available'}</label>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={attachmentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={handleAttachmentSelect}
        />

        {imageUrls.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex items-center gap-2 py-2.5 px-3 rounded-xl border border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-600 transition-all duration-200 text-sm font-medium w-full justify-center"
          >
            <ImageIcon className="w-4 h-4" />
            {isId ? 'Tambah foto (hingga 5)' : 'Add photos (up to 5)'}
          </button>
        )}

        {/* Image preview: main + thumbnails (up to 5) */}
        {imageUrls.length > 0 && (
          <div className="mb-4">
            <div className="rounded-xl overflow-hidden bg-stone-100 aspect-video max-h-72 w-full">
              <img src={imageUrls[mainImageIndex]} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <button
                    type="button"
                    onClick={() => setMainImageIndex(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${mainImageIndex === i ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-200 hover:border-amber-400'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    aria-label={isId ? 'Hapus' : 'Remove'}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-lg border-2 border-amber-500 bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center text-2xl font-light flex-shrink-0"
                  aria-label={isId ? 'Tambah foto' : 'Add photo'}
                >
                  +
                </button>
              )}
            </div>
          </div>
        )}

        {/* Optional file attachment (1 file) */}
        {attachment && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 p-2.5">
            <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="flex-1 min-w-0 text-sm text-stone-700 truncate" title={attachment.name}>{attachment.name}</span>
            <a href={attachment.dataUrl} download={attachment.name} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-amber-600 hover:text-amber-700">{isId ? 'Lihat' : 'View'}</a>
            <button type="button" onClick={() => onAttachmentChange(null)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100" aria-label={isId ? 'Hapus lampiran' : 'Remove attachment'}>×</button>
          </div>
        )}

        {/* Main textarea */}
        <div className="relative mb-3">
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={handleTextChange}
            onFocus={() => { setFocused(true); }}
            onBlur={() => { setFocused(false); }}
            placeholder={placeholder}
            rows={3}
            className={`
              w-full py-3.5 px-4 rounded-xl text-stone-800 placeholder-stone-400 text-sm leading-relaxed
              bg-stone-50/80 border transition-all duration-200 resize-y min-h-[88px] max-h-[240px]
              focus:outline-none focus:bg-white
              ${focused ? 'border-amber-300/70 shadow-inner' : 'border-stone-200 hover:border-stone-300'}
            `}
          />
          {charCount > 0 && (
            <span className={`absolute bottom-2 right-3 text-[10px] font-medium tabular-nums ${overLimit ? 'text-rose-500' : nearLimit ? 'text-amber-600' : 'text-stone-400'}`}>
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>

        {/* Expandable video/link section */}
        {showLinkSection ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50/80 border border-red-200/80 p-2.5">
            <Play className="w-4 h-4 text-red-600 flex-shrink-0" />
            <input
              type="url"
              value={videoLinkValue}
              onChange={(e) => onVideoLinkChange(e.target.value)}
              placeholder={videoLinkPlaceholder}
              className="flex-1 min-w-0 py-2 px-3 rounded-lg bg-white/80 border border-stone-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            />
            <button
              type="button"
              onClick={() => { onVideoLinkChange(''); setShowLinkSection(false); }}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label={isId ? 'Hapus link' : 'Remove link'}
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLinkSection(true)}
            className="mb-4 flex items-center gap-2 py-2.5 px-3 rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 transition-all duration-200 text-sm font-medium w-full justify-center"
          >
            <Play className="w-4 h-4" />
            {isId ? 'Tambah 1 link video (opsional)' : 'Add 1 video link (optional)'}
          </button>
        )}

        {/* Divider + toolbar */}
        <div className="border-t border-stone-200/80 pt-3 mt-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUrls.length >= MAX_IMAGES}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isId ? 'Foto' : 'Photo'}</span>
                {imageUrls.length > 0 && <span>({imageUrls.length}/{MAX_IMAGES})</span>}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkSection(true)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors text-xs font-medium"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">{isId ? 'Video' : 'Video'}</span>
              </button>
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={!!attachment}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{isId ? 'Lampiran' : 'Attach file'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onPost}
              disabled={!canPost || overLimit}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                bg-gradient-to-r from-amber-500 to-amber-600 text-white
                shadow-md shadow-amber-500/25
                hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/30
                active:scale-[0.98] transition-all duration-200
                disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
              `}
            >
              <span>{postLabel}</span>
              <ChevronRightIcon className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 mt-2.5">{!hasMedia ? (isId ? 'Tambahkan foto atau video untuk mengirim.' : 'Add a photo or video to post.') : (isId ? 'Postingan tampil di feed setelah Anda masuk atau punya akun.' : 'Posts go live in the feed once you\'re signed in or have an account.')}</p>
        </div>
      </div>
    </div>
  );
};

// —— Single post card (like, comment, share, save; optional pending overlay; active comment input; emoji picker; edit/delete own post)
const PostCard: React.FC<{
  post: FeedPost;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSave: (id: string) => void;
  onProfileClick?: (profile: SocialProfilePreview) => void;
  onVerifiedBadgeClick?: (author: { name: string; avatar: string; role: string }) => void;
  onAddComment?: (postId: string, text: string) => void;
  onAddReply?: (postId: string, commentIndex: number, text: string) => void;
  onEditPost?: (postId: string, newText: string) => void;
  onDeletePost?: (postId: string) => void;
  currentUserName?: string;
  hasAccount: boolean;
  language: string;
}> = ({ post, onLike, onComment, onShare, onSave, onProfileClick, onVerifiedBadgeClick, onAddComment, onAddReply, onEditPost, onDeletePost, currentUserName = '', hasAccount, language }) => {
  const [liked, setLiked] = useState(!!post.liked);
  const [saved, setSaved] = useState(!!post.saved);
  const [commentText, setCommentText] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [replyingToCommentIndex, setReplyingToCommentIndex] = useState<number | null>(null);
  const [commentReactions, setCommentReactions] = useState<Record<number, 'liked' | 'disliked'>>({});
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editDraftText, setEditDraftText] = useState(post.text ?? '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const isId = language === 'id';
  const isOwnPost = hasAccount && (post.authorName === currentUserName || post.authorName === 'You' || post.authorName === 'Anda');
  const DESC_TRUNCATE_LEN = 200;
  const text = post.text ?? '';
  const isLong = text.length > DESC_TRUNCATE_LEN;
  const displayText = isLong && !descriptionExpanded ? text.slice(0, DESC_TRUNCATE_LEN).trim() + '…' : text;
  const likeCount = post.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0);
  const commentCount = (post.commentPreview?.length ?? 0) + (post.commentPreview?.reduce((sum, c) => sum + (c.replies?.length ?? 0), 0) ?? 0);
  const handleSubmitComment = () => {
    const t = commentText.trim();
    if (!t) return;
    if (replyingToCommentIndex !== null && onAddReply) {
      onAddReply(post.id, replyingToCommentIndex, t);
      setReplyingToCommentIndex(null);
    } else if (onAddComment) {
      onAddComment(post.id, t);
    }
    setCommentText('');
  };
  useEffect(() => {
    if (!showPostMenu) return;
    const close = (e: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showPostMenu]);
  const handleSaveEdit = () => {
    const trimmed = editDraftText.trim();
    if (trimmed && onEditPost) {
      onEditPost(post.id, trimmed);
      setIsEditingPost(false);
      setShowPostMenu(false);
    }
  };
  const handleDeletePost = () => {
    if (!onDeletePost) return;
    if (window.confirm(isId ? 'Hapus postingan ini?' : 'Delete this post?')) {
      onDeletePost(post.id);
      setShowPostMenu(false);
    }
  };
  return (
    <article id={`post-${post.id}`} className={`relative ${COLORS.bgCard} rounded-2xl ${COLORS.border} border shadow-sm overflow-hidden ${COLORS.hoverGlow} transition-all duration-300 hover:border-stone-300 ${post.pending ? 'opacity-75' : ''}`}>
      {post.pending && (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-4 bg-stone-900/20 rounded-2xl pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/95 text-white text-xs font-medium shadow-lg">
            {isId ? 'Menunggu — konfirmasi akun untuk tampil' : 'Pending — confirm account to go live'}
          </span>
        </div>
      )}
      <div className={`${SPACING.card} ${SPACING.section}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onProfileClick?.({
              name: post.authorName,
              avatar: post.authorAvatar,
              role: post.authorRole,
              country: post.authorCountry,
              dateJoined: post.authorDateJoined,
              hobbyInterest: post.authorHobbyInterest,
              divisionOfEmployment: post.authorDivisionOfEmployment,
              bio: post.authorBio,
              active: post.authorActive,
            })}
            className="relative flex-shrink-0 w-10 h-10 rounded-full ring-2 ring-stone-100 overflow-visible"
          >
            <span className="block w-full h-full rounded-full overflow-hidden">
              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
            </span>
            {post.authorActive && !post.authorBusy && (
              <span className="absolute bottom-0 right-0 w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-emerald-500 border-2 border-white box-content shrink-0" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} title={language === 'id' ? 'Online' : 'Online'} aria-hidden />
            )}
            {post.authorBusy && (
              <span className="absolute bottom-0 right-0 w-3 h-3 min-w-[12px] min-h-[12px] rounded-full bg-amber-500 border-2 border-white box-content shrink-0" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} title={language === 'id' ? 'Sibuk' : 'Busy'} aria-hidden />
            )}
          </button>
          <div className="flex-1 min-w-0 flex flex-col">
            <button
              type="button"
              onClick={() => onProfileClick?.({
                name: post.authorName,
                avatar: post.authorAvatar,
                role: post.authorRole,
                country: post.authorCountry,
                dateJoined: post.authorDateJoined,
                hobbyInterest: post.authorHobbyInterest,
                divisionOfEmployment: post.authorDivisionOfEmployment,
                bio: post.authorBio,
                active: post.authorActive,
              })}
              className="font-semibold text-stone-900 hover:text-amber-700 transition-colors text-sm text-left truncate block w-full"
            >
              {post.authorName}
            </button>
            <p className={COLORS.mutedLight + ' text-xs mt-0.5'}>{post.authorRole} · {post.timeAgo}</p>
            {post.jobBadge && (
              <span className="inline-flex items-center w-fit mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black text-amber-400">
                {post.jobBadge}
              </span>
            )}
            {post.jobBadge === 'Job Offered' && (post.jobSalary || post.jobHoursPerWeek || post.jobPositionAvailable || post.jobStartDate || post.jobAccommodationIncluded || post.jobDailyMeals || post.jobHolidayPay || post.jobExperienceRequired || post.jobCvRequired) && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-left space-y-1">
                {post.jobPositionAvailable && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Posisi:' : 'Position:'}</span> {post.jobPositionAvailable}</p>}
                {post.jobSalary && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Gaji:' : 'Salary:'}</span> {post.jobSalary}</p>}
                {post.jobHoursPerWeek && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Jam/minggu:' : 'Hours/week:'}</span> {post.jobHoursPerWeek}</p>}
                {post.jobStartDate && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Mulai:' : 'Start:'}</span> {post.jobStartDate}</p>}
                {post.jobAccommodationIncluded && <p className="text-[10px] text-stone-700">{language === 'id' ? '✓ Akomodasi disediakan' : '✓ Accommodation included'}</p>}
                {post.jobDailyMeals && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Makan:' : 'Meals:'}</span> {post.jobDailyMeals}</p>}
                {post.jobHolidayPay && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Bayaran libur:' : 'Holiday pay:'}</span> {post.jobHolidayPay}</p>}
                {post.jobExperienceRequired && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Pengalaman:' : 'Experience:'}</span> {post.jobExperienceRequired}</p>}
                {post.jobCvRequired && <p className="text-[10px] text-stone-700">{language === 'id' ? '✓ CV wajib' : '✓ CV required'}</p>}
              </div>
            )}
            {post.jobBadge === 'Position Required' && (post.positionSalary || post.positionHoursPerWeek || post.positionSought || post.positionStartDate || post.positionAccommodationRequired || post.positionDailyMeals || post.positionHolidayPay || post.positionExperience || post.positionCvAvailable) && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-left space-y-1">
                {post.positionSought && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Posisi dicari:' : 'Position sought:'}</span> {post.positionSought}</p>}
                {post.positionSalary && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Gaji diharapkan:' : 'Expected salary:'}</span> {post.positionSalary}</p>}
                {post.positionHoursPerWeek && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Jam/minggu:' : 'Hours/week:'}</span> {post.positionHoursPerWeek}</p>}
                {post.positionStartDate && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Tersedia:' : 'Available:'}</span> {post.positionStartDate}</p>}
                {post.positionAccommodationRequired && <p className="text-[10px] text-stone-700">{language === 'id' ? '✓ Akomodasi dibutuhkan' : '✓ Accommodation required'}</p>}
                {post.positionDailyMeals && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Makan:' : 'Meals:'}</span> {post.positionDailyMeals}</p>}
                {post.positionHolidayPay && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Bayaran libur:' : 'Holiday pay:'}</span> {post.positionHolidayPay}</p>}
                {post.positionExperience && <p className="text-[10px] text-stone-700"><span className="font-medium text-stone-600">{language === 'id' ? 'Pengalaman:' : 'Experience:'}</span> {post.positionExperience}</p>}
                {post.positionCvAvailable && <p className="text-[10px] text-stone-700">{language === 'id' ? '✓ CV tersedia' : '✓ CV available'}</p>}
              </div>
            )}
            {(post.authorActive || post.authorBusy) && (
              <span className={`inline-flex items-center w-fit mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${post.authorBusy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {post.authorBusy ? (language === 'id' ? 'Sibuk' : 'Busy') : (language === 'id' ? 'Online' : 'Online')}
              </span>
            )}
          </div>
          {post.authorVerified && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onVerifiedBadgeClick?.({ name: post.authorName, avatar: post.authorAvatar, role: post.authorRole });
              }}
              className="flex-shrink-0 self-center rounded-full p-0.5 ring-1 ring-amber-200 hover:ring-amber-400 transition-colors"
              title={language === 'id' ? 'Terverifikasi' : 'Verified'}
              aria-label={language === 'id' ? 'Terverifikasi — lihat detail' : 'Verified — view details'}
            >
              <img src={VERIFIED_BADGE_IMAGE_URL} alt="" className="w-5 h-5 object-contain" />
            </button>
          )}
          {isOwnPost && (onEditPost || onDeletePost) && (
            <div ref={postMenuRef} className="relative flex-shrink-0 self-center ml-auto">
              <button
                type="button"
                onClick={() => setShowPostMenu((m) => !m)}
                className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                aria-label={isId ? 'Menu postingan' : 'Post menu'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
              </button>
              {showPostMenu && (
                <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-xl border border-stone-200 shadow-lg z-20 min-w-[120px]">
                  {onEditPost && (
                    <button type="button" onClick={() => { setEditDraftText(post.text ?? ''); setIsEditingPost(true); setShowPostMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> {isId ? 'Edit' : 'Edit'}
                    </button>
                  )}
                  {onDeletePost && (
                    <button type="button" onClick={handleDeletePost} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" /> {isId ? 'Hapus' : 'Delete'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {isEditingPost && onEditPost ? (
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <textarea
              value={editDraftText}
              onChange={(e) => setEditDraftText(e.target.value)}
              className="w-full min-h-[80px] py-2 px-3 rounded-lg border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-y"
              placeholder={isId ? 'Edit postingan…' : 'Edit post…'}
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveEdit} disabled={!editDraftText.trim()} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                {isId ? 'Simpan' : 'Save'}
              </button>
              <button type="button" onClick={() => { setIsEditingPost(false); setEditDraftText(post.text ?? ''); }} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50">
                {isId ? 'Batal' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : null}
        {(post.mediaUrls?.length ? post.mediaUrls : post.mediaUrl ? [post.mediaUrl] : []).length > 0 && (() => {
          const urls = post.mediaUrls?.length ? post.mediaUrls! : [post.mediaUrl!];
          const idx = Math.min(selectedImageIndex, urls.length - 1);
          return (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden bg-stone-100 aspect-video max-h-72 group">
                <img src={urls[idx]} alt={post.mediaAlt || ''} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
              </div>
              {urls.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {urls.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === i ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-200 hover:border-amber-400'}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        {post.videoLink && (() => {
          const embedUrl = getVideoEmbedUrl(post.videoLink);
          return embedUrl ? (
            <div className="rounded-xl overflow-hidden bg-stone-100 aspect-video max-h-80 w-full">
              <iframe
                src={embedUrl}
                title="Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-stone-100 p-2">
              <a href={post.videoLink} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 text-sm font-medium break-all">
                {post.videoLink}
              </a>
            </div>
          );
        })()}
        {post.attachment && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <span className="flex-1 min-w-0 text-sm font-medium text-stone-800 truncate" title={post.attachment.name}>{post.attachment.name}</span>
            <a href={post.attachment.dataUrl} download={post.attachment.name} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600">
              {language === 'id' ? 'Unduh' : 'Download'}
            </a>
          </div>
        )}
        <div className="flex items-center gap-4 pt-2 border-t border-stone-100">
          <button type="button" onClick={() => { setLiked(!liked); onLike(post.id); }} className={`flex items-center gap-1.5 ${liked ? 'text-rose-700' : COLORS.muted} hover:text-rose-500 transition-colors`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-700 text-rose-700' : ''}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
          <button type="button" onClick={() => onComment(post.id)} className={`flex items-center gap-1.5 ${COLORS.muted} hover:text-amber-600 transition-colors`}>
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </button>
          <button type="button" onClick={() => onShare(post.id)} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium">{post.shares ?? 0}</span>
          </button>
          <button type="button" onClick={() => { setSaved(!saved); onSave(post.id); }} className={`ml-auto flex items-center gap-1.5 ${saved ? 'text-yellow-500' : 'text-stone-500'} hover:text-yellow-500 transition-colors`}>
            <Star className={`w-4 h-4 ${saved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
        </div>
        {text ? (
          <div className="pt-2 border-t border-stone-100">
            <p className={TYPO.body + ' whitespace-pre-wrap'}>{displayText}</p>
            {isLong && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((e) => !e)}
                className="mt-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                {descriptionExpanded ? (isId ? 'Tampilkan lebih sedikit' : 'Show less') : (isId ? 'Baca selengkapnya' : 'Read more')}
              </button>
            )}
          </div>
        ) : null}
        {post.commentPreview && post.commentPreview.length > 0 && (
          <div className="pt-1.5 border-t border-stone-100 space-y-0.5">
            {post.commentPreview.map((c, i) => {
              const commentProfile: SocialProfilePreview = {
                name: c.author,
                avatar: c.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&size=96`,
                active: c.active,
                country: c.country,
                dateJoined: c.dateJoined,
                hobbyInterest: c.hobbyInterest,
                divisionOfEmployment: c.divisionOfEmployment,
              };
              const likeCountC = (c.likes ?? 0) + (commentReactions[i] === 'liked' ? 1 : 0);
              const dislikeCountC = (c.dislikes ?? 0) + (commentReactions[i] === 'disliked' ? 1 : 0);
              const toggleReaction = (action: 'liked' | 'disliked') => {
                setCommentReactions((prev) => {
                  const next = { ...prev };
                  if (next[i] === action) delete next[i];
                  else next[i] = action;
                  return next;
                });
              };
              const starRating = typeof c.authorRating === 'number' ? Math.min(5, Math.max(1, Math.round(c.authorRating))) : 0;
              return (
                <div key={i} className="py-1 px-1.5 rounded-lg bg-stone-50/80 border border-stone-100">
                  <div className="flex items-start gap-1">
                    <button type="button" onClick={() => onProfileClick?.(commentProfile)} className="relative flex-shrink-0 rounded-full overflow-hidden w-5 h-5 ring-1 ring-stone-200">
                      <img src={commentProfile.avatar} alt={c.author} className="w-full h-full object-cover" />
                      {c.active && <span className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-emerald-500 border border-white" aria-hidden />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-stone-700 leading-tight">
                        <button type="button" onClick={() => onProfileClick?.(commentProfile)} className="font-semibold text-stone-800 hover:text-amber-700">
                          {c.author}
                        </button>
                        {starRating > 0 && (
                          <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= starRating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} aria-hidden />
                            ))}
                          </span>
                        )}
                        <span className="text-stone-600">{' '}{c.text}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button type="button" onClick={() => toggleReaction('liked')} className={`flex items-center gap-0.5 text-[10px] font-medium ${commentReactions[i] === 'liked' ? 'text-amber-600' : 'text-stone-500 hover:text-amber-600'}`} aria-label="Like">
                          <ThumbsUp className={`w-3.5 h-3.5 ${commentReactions[i] === 'liked' ? 'fill-current' : ''}`} />
                          <span>{likeCountC}</span>
                        </button>
                        <button type="button" onClick={() => toggleReaction('disliked')} className={`flex items-center gap-0.5 text-[10px] font-medium ${commentReactions[i] === 'disliked' ? 'text-stone-600' : 'text-stone-500 hover:text-stone-600'}`} aria-label="Dislike">
                          <svg className={`w-3.5 h-3.5 ${commentReactions[i] === 'disliked' ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h2.14" /><path d="M14 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" /></svg>
                          <span>{dislikeCountC}</span>
                        </button>
                        {onAddReply && (
                          <button type="button" onClick={() => setReplyingToCommentIndex(i)} className="text-[10px] font-medium text-amber-600 hover:text-amber-700">
                            {isId ? 'Balas' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {(c.replies?.length ?? 0) > 0 && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-stone-200 pl-1.5">
                      {c.replies!.map((r, ri) => (
                        <p key={ri} className="text-[10px] text-stone-600 leading-tight">
                          <span className="font-semibold text-stone-700">{r.author}</span>
                          <span>{' '}{r.text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {onAddComment && (
          <div className="pt-2 border-t border-stone-100">
            <div className="flex gap-2 items-center">
              <div className="flex-1 min-w-0">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingToCommentIndex !== null && post.commentPreview?.[replyingToCommentIndex]
                    ? (isId ? `Balas ke ${post.commentPreview[replyingToCommentIndex].author}…` : `Reply to ${post.commentPreview[replyingToCommentIndex].author}…`)
                    : (isId ? 'Tulis komentar…' : 'Write a comment…')}
                  className="w-full min-w-0 py-1.5 px-2.5 rounded-lg bg-stone-100/80 border border-stone-200 text-stone-800 placeholder-stone-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>
              {replyingToCommentIndex !== null && (
                <button type="button" onClick={() => setReplyingToCommentIndex(null)} className="text-[10px] text-stone-500 hover:text-stone-700 flex-shrink-0" aria-label="Cancel reply">
                  ×
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none flex-shrink-0"
              >
                {isId ? 'Kirim' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

// —— Left sidebar nav (desktop)
const LeftSidebar: React.FC<{
  items: { icon: React.ElementType; label: string; page?: Page }[];
  onNavigate: (page: Page) => void;
  active?: string;
  feedUnviewedCount?: number;
  onFeedClick?: () => void;
}> = ({ items, onNavigate, active, feedUnviewedCount = 0, onFeedClick }) => (
  <aside className="hidden lg:block w-56 flex-shrink-0">
    <nav className="sticky top-20 space-y-1">
      {items.map(({ icon: Icon, label, page }, index) => {
        const isFeedItem = index === 0;
        const handleClick = () => {
          if (isFeedItem && onFeedClick) onFeedClick();
          if (page) onNavigate(page);
        };
        return (
          <button
            key={label}
            type="button"
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${active === label ? 'bg-amber-50 text-amber-800' : COLORS.muted + ' hover:bg-stone-100 hover:text-stone-800'}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
            {isFeedItem && feedUnviewedCount > 0 && (
              <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                {feedUnviewedCount > 99 ? '99+' : feedUnviewedCount}
              </span>
            )}
            <ChevronRightIcon className="w-4 h-4 ml-auto opacity-50" />
          </button>
        );
      })}
    </nav>
  </aside>
);

// —— Right sidebar (trending, suggested, featured)
const RightSidebar: React.FC<{
  trending: string[];
  suggestedProfessionals: { name: string; role: string; avatar: string }[];
  featuredTreatments: string[];
  onNavigate: (page: Page) => void;
  language: string;
}> = ({ trending, suggestedProfessionals, featuredTreatments, onNavigate, language }) => {
  const isId = language === 'id';
  return (
    <aside className="hidden xl:block w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-6">
        <div className={`${COLORS.bgCard} rounded-2xl ${COLORS.border} border shadow-sm ${SPACING.card}`}>
          <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            {isId ? 'Topik trending' : 'Trending wellness'}
          </h3>
          <ul className="space-y-2">
            {trending.map((t) => (
              <li key={t}>
                <button type="button" className="text-sm text-stone-600 hover:text-amber-700 transition-colors w-full text-left py-1">
                  #{t}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${COLORS.bgCard} rounded-2xl ${COLORS.border} border shadow-sm ${SPACING.card}`}>
          <h3 className="font-semibold text-stone-900 mb-3">{isId ? 'Profesional disarankan' : 'Suggested professionals'}</h3>
          <ul className="space-y-3">
            {suggestedProfessionals.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-stone-500 truncate">{p.role}</p>
                </div>
                <button type="button" onClick={() => onNavigate('home')} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                  {isId ? 'Lihat' : 'View'}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${COLORS.bgCard} rounded-2xl ${COLORS.border} border shadow-sm ${SPACING.card}`}>
          <h3 className="font-semibold text-stone-900 mb-3">{isId ? 'Perawatan unggulan' : 'Featured treatments'}</h3>
          <ul className="space-y-2">
            {featuredTreatments.map((t) => (
              <li key={t}>
                <button type="button" onClick={() => onNavigate('massage-types')} className="text-sm text-stone-600 hover:text-amber-700 transition-colors w-full text-left py-1">
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

// —— Mobile bottom nav
const BottomNav: React.FC<{
  items: { icon: React.ElementType; label: string; page?: Page }[];
  onNavigate: (page: Page) => void;
  active?: string;
  feedUnviewedCount?: number;
  onFeedClick?: () => void;
}> = ({ items, onNavigate, active, feedUnviewedCount = 0, onFeedClick }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200 safe-area-pb">
    <div className="flex items-center justify-around h-14">
      {items.slice(0, 5).map(({ icon: Icon, label, page }, index) => {
        const isFeedItem = index === 0;
        const handleClick = () => {
          if (isFeedItem && onFeedClick) onFeedClick();
          if (page) onNavigate(page);
        };
        return (
          <button
            key={label}
            type="button"
            onClick={handleClick}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${active === label ? 'text-amber-600' : 'text-stone-500'}`}
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            {isFeedItem && feedUnviewedCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {feedUnviewedCount > 99 ? '99+' : feedUnviewedCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </nav>
);

// —— Floating action button (mobile create post)
const FAB: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all"
    aria-label="Create post"
  >
    <span className="text-2xl leading-none font-light">+</span>
  </button>
);

// —— Account gate modal: posts/comments only go live with confirmed account
const AccountGateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  onSignIn: () => void;
  language: string;
}> = ({ isOpen, onClose, onCreateAccount, onSignIn, language }) => {
  const isId = language === 'id';
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-stone-200">
        <h3 className="font-semibold text-stone-900 text-lg mb-2">
          {isId ? 'Posting hanya tampil dengan akun terkonfirmasi' : 'Posts only go live with a confirmed account'}
        </h3>
        <p className="text-stone-600 text-sm mb-5">
          {isId
            ? 'Buat akun atau masuk untuk mempublikasikan postingan dan komentar Anda. Akun yang sama bisa dipakai untuk terapis dan pelanggan.'
            : 'Create an account or sign in to publish your posts and comments. The same account can be used as therapist or customer.'}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
          >
            {isId ? 'Buat akun' : 'Create account'}
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="w-full py-3 rounded-xl border-2 border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            {isId ? 'Masuk' : 'Sign in'}
          </button>
          <button type="button" onClick={onClose} className="text-stone-500 text-sm mt-1 hover:text-stone-700">
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// —— Share post popup: same design as therapist SocialSharePopup, amber accent (social page colors)
const SharePostPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
  onShared?: () => void; // called when user performs any share (social button or copy link)
  language: string;
  /** Canonical base URL so shared posts always link back to IndaStreet Social (SEO + social discovery) */
  canonicalBaseUrl?: string;
}> = ({ isOpen, onClose, post, onShared, language, canonicalBaseUrl }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const isId = language === 'id';

  if (!isOpen || !post) return null;

  const baseUrl = canonicalBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
  const shareUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}#post-${post.id}` : '';
  const shareText = `${post.text.slice(0, 200)}${post.text.length > 200 ? '…' : ''}\n\n🔗 ${shareUrl}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const recordShare = () => { onShared?.(); };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
      recordShare();
    } catch {
      alert(isId ? 'Gagal menyalin. Coba lagi.' : 'Failed to copy. Please try again.');
    }
  };

  const shareButtons = [
    { name: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', icon: <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.486L.057 24z" fill="currentColor" />, action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=600'); recordShare(); } },
    { name: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />, action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=600'); recordShare(); } },
    { name: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600', icon: <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="currentColor" />, action: () => { window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=600,height=600'); recordShare(); } },
    { name: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800', icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" />, action: () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=600'); recordShare(); } },
    { name: 'Telegram', color: 'bg-sky-400 hover:bg-sky-500', icon: <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="currentColor" />, action: () => { window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=600'); recordShare(); } },
    { name: 'Email', color: 'bg-stone-600 hover:bg-stone-700', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" fill="none" stroke="currentColor" />, action: () => { window.location.href = `mailto:?subject=${encodedText}&body=${encodeURIComponent(shareText)}`; recordShare(); } },
  ];

  const copyLabel = isId ? 'Salin link' : 'Copy link';
  const doneLabel = isId ? 'Berhasil' : 'Done';
  const headerTitle = isId ? 'Bagikan postingan' : 'Share this post';
  const chooseLabel = isId ? 'Pilih platform' : 'Choose your platform';
  const orCopyLabel = isId ? 'Atau salin link' : 'Or copy link';
  const copiedLabel = isId ? 'Link disalin ke clipboard!' : 'Link copied to clipboard!';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm" style={{ animation: 'shareFadeIn 0.2s ease-out' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-stone-200 overflow-hidden" style={{ animation: 'shareSlideUp 0.3s ease-out' }}>
        <div className="relative p-4 sm:p-6 pb-4 border-b border-stone-200">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-stone-400 hover:text-stone-600 transition-colors" aria-label={isId ? 'Tutup' : 'Close'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3 pr-8">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-7 h-7 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">{headerTitle}</h3>
              <p className="text-sm text-stone-500">{chooseLabel}</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {shareButtons.map((b) => (
              <button key={b.name} type="button" onClick={b.action} className={`${b.color} text-white rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 hover:shadow-lg active:scale-95 min-h-[64px] sm:min-h-[72px]`} title={`Share on ${b.name}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={b.name === 'Email' ? 2 : 0}>{b.icon}</svg>
                <span className="text-[10px] sm:text-xs font-semibold">{b.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-4 sm:pt-6">
            <p className="text-sm font-semibold text-stone-700 mb-3">{orCopyLabel}</p>
            <div className="flex gap-2">
              <input type="text" value={shareUrl} readOnly className="flex-1 px-3 sm:px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-0" />
              <button type="button" onClick={handleCopyLink} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg min-w-[72px] sm:min-w-[84px] flex-shrink-0">
                {showCopySuccess ? (
                  <><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-xs sm:text-sm">{doneLabel}</span></>
                ) : (
                  <><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span className="text-xs sm:text-sm">{copyLabel}</span></>
                )}
              </button>
            </div>
            {showCopySuccess && <p className="text-sm text-emerald-600 mt-2 font-medium">{copiedLabel}</p>}
          </div>
        </div>
      </div>
      <style>{`@keyframes shareFadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes shareSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

// —— Safe international trade from Indonesia: verification + Terms & conditions popup
const InternationalVerificationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  language: string;
}> = ({ isOpen, onClose, language }) => {
  const isId = language === 'id';
  const [showTerms, setShowTerms] = useState(false);
  useEffect(() => {
    if (!isOpen) setShowTerms(false);
  }, [isOpen]);
  if (!isOpen) return null;

  const whatsappLink = 'https://wa.me/6281392000050';
  const TermCard = ({ icon: Icon, iconBg, title, children }: { icon: React.ElementType; iconBg: string; title: string; children: React.ReactNode }) => (
    <div className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4 text-stone-700" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-stone-800 text-sm mb-1">{title}</h4>
        <div className="text-stone-600 text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );

  const termsContentEn = (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100">
        <p className="text-stone-700 text-sm leading-relaxed">
          This service is activated after cleared payment is received and forms the basis of our service agreement. Additional terms, conditions, and rates can be discussed with our team via WhatsApp at{' '}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-700 hover:text-amber-800 underline">+62 813 9200 0050</a>.
        </p>
      </div>
      <p className="text-stone-600 text-xs font-medium uppercase tracking-wider">What we ensure</p>
      <div className="space-y-3">
        <TermCard icon={Package} iconBg="bg-emerald-100" title="Product condition">
          Your order is inspected to confirm it is not broken or defective. For electrical or specialist equipment requiring professional verification, we may ask you to arrange an independent check, as IndaStreet cannot provide expert sign-off for every industry.
        </TermCard>
        <TermCard icon={Check} iconBg="bg-stone-200" title="Non-standard items">
          Items without standard specifications or materials are checked on arrival. Any defect or concern is reported to you with clear details so you can make an informed decision.
        </TermCard>
        <TermCard icon={ShieldCheckIcon} iconBg="bg-amber-100" title="Your rights">
          You may cancel the order only when the product is defective or damaged. Exercising this right does not affect your buyer profile, reviews, or standing on the platform.
        </TermCard>
        <TermCard icon={CreditCard} iconBg="bg-blue-100" title="Secure payment">
          IndaStreet can provide a secure payment option at 10% of the order value plus transfer fees, when requested by the buyer.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-stone-200" title="Warehouse & logistics">
          All orders are sent to the IndaStreet warehouse for inspection. IndaStreet is not responsible for shipping or freight to or from the warehouse; those arrangements remain between you and your chosen carrier.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-amber-100" title="Returns">
          If an item is defective or does not match the agreed specification (including colour), it will be returned to the seller. Return costs for defective or non-conforming items are borne by the seller.
        </TermCard>
        <TermCard icon={Clock} iconBg="bg-emerald-100" title="Inspection window">
          Once we have received the product, you have up to 8 hours to raise any issue via WhatsApp. If we do not receive a response within this time, the order is deemed accepted and will await collection by your freight provider.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-stone-200" title="Storage">
          Goods may be held at our warehouse for up to 1 week at no extra charge. After that, storage is charged at 10% of the product value per day and must be paid in full before dispatch.
        </TermCard>
        <TermCard icon={FileText} iconBg="bg-stone-200" title="Documentation">
          IndaStreet does not handle customs or export documentation unless you request this in advance; additional fees may apply.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-amber-100" title="Larger orders">
          For pallet or container shipments, we offer customs and logistics support; please contact us via WhatsApp to discuss your requirements.
        </TermCard>
      </div>
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone-500">{isId ? 'Pertanyaan?' : 'Questions?'}</span>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp +62 813 9200 0050
        </a>
      </div>
    </div>
  );

  const termsContentId = (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100">
        <p className="text-stone-700 text-sm leading-relaxed">
          Layanan ini aktif setelah pembayaran diterima dan menjadi dasar perjanjian layanan. Syarat, ketentuan, dan tarif tambahan dapat didiskusikan dengan tim kami melalui WhatsApp{' '}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-700 hover:text-amber-800 underline">+62 813 9200 0050</a>.
        </p>
      </div>
      <p className="text-stone-600 text-xs font-medium uppercase tracking-wider">Yang kami jamin</p>
      <div className="space-y-3">
        <TermCard icon={Package} iconBg="bg-emerald-100" title="Kondisi produk">
          Pesanan diperiksa untuk memastikan tidak rusak atau cacat. Untuk barang elektronik atau yang memerlukan verifikasi ahli, kami dapat meminta Anda mengatur pemeriksaan independen, karena IndaStreet tidak dapat memberikan verifikasi ahli untuk semua industri.
        </TermCard>
        <TermCard icon={Check} iconBg="bg-stone-200" title="Barang nonstandar">
          Barang tanpa spesifikasi atau material standar diperiksa saat tiba. Cacat atau masalah dilaporkan kepada Anda dengan rincian jelas agar Anda dapat mengambil keputusan.
        </TermCard>
        <TermCard icon={ShieldCheckIcon} iconBg="bg-amber-100" title="Hak pembeli">
          Anda dapat membatalkan pesanan hanya jika produk cacat atau rusak. Hak ini tidak memengaruhi profil, ulasan, atau reputasi Anda di platform.
        </TermCard>
        <TermCard icon={CreditCard} iconBg="bg-blue-100" title="Pembayaran aman">
          IndaStreet dapat menyediakan opsi pembayaran aman sebesar 10% nilai pesanan plus biaya transfer, jika diminta pembeli.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-stone-200" title="Gudang & logistik">
          Semua pesanan dikirim ke gudang IndaStreet untuk inspeksi. IndaStreet tidak bertanggung jawab atas pengiriman atau angkutan ke/dari gudang; pengaturan tersebut tetap antara Anda dan carrier pilihan Anda.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-amber-100" title="Pengembalian">
          Jika barang cacat atau tidak sesuai (termasuk warna), akan dikembalikan ke penjual. Biaya pengembalian untuk barang cacat atau tidak sesuai ditanggung penjual.
        </TermCard>
        <TermCard icon={Clock} iconBg="bg-emerald-100" title="Jangka waktu inspeksi">
          Setelah kami menerima produk, Anda memiliki 8 jam untuk melaporkan masalah via WhatsApp. Jika tidak ada respons dalam waktu tersebut, pesanan dianggap diterima dan menunggu pengambilan oleh penyedia angkutan Anda.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-stone-200" title="Penyimpanan">
          Barang dapat disimpan di gudang kami maksimal 1 minggu tanpa biaya tambahan. Setelah itu, penyimpanan dikenakan 10% nilai produk per hari dan harus dibayar penuh sebelum pengiriman.
        </TermCard>
        <TermCard icon={FileText} iconBg="bg-stone-200" title="Dokumentasi">
          IndaStreet tidak mengurus dokumen bea cukai atau ekspor kecuali Anda meminta sebelumnya; biaya tambahan dapat berlaku.
        </TermCard>
        <TermCard icon={Package} iconBg="bg-amber-100" title="Pesanan besar">
          Untuk pengiriman palet atau kontainer, kami menawarkan dukungan bea cukai dan logistik; hubungi kami via WhatsApp untuk mendiskusikan kebutuhan Anda.
        </TermCard>
      </div>
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-stone-500">{isId ? 'Pertanyaan?' : 'Questions?'}</span>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp +62 813 9200 0050
        </a>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-stone-200 flex flex-col">
        <div className="flex-shrink-0 p-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 text-lg leading-tight">
                {showTerms
                  ? (isId ? 'Syarat & ketentuan' : 'Terms and conditions')
                  : (isId ? 'Perdagangan internasional aman' : 'Safe international trade')}
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                {isId ? 'Dari Indonesia' : 'From Indonesia'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!showTerms ? (
            <>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {isId
                  ? 'IndaStreet memverifikasi pembelian internasional dari Indonesia sehingga Anda dapat bertransaksi dengan aman. Layanan ini aktif setelah pembayaran diterima.'
                  : 'IndaStreet verifies international purchases from Indonesia so you can trade with confidence. This service is activated after cleared payment is received.'}
              </p>
              <p className="text-stone-500 text-xs mb-5">
                {isId ? 'Tarif dasar 20% dari harga produk. Syarat lengkap dan tarif tambahan dapat didiskusikan via WhatsApp.' : 'Base fee 20% of product price. Full terms and additional rates can be discussed via WhatsApp.'}
              </p>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="w-full py-3 rounded-xl border-2 border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-50 mb-3 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isId ? 'Syarat & ketentuan lengkap' : 'Full terms and conditions'}
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2 mb-3"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp +62 813 9200 0050
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-stone-500 font-medium text-sm hover:bg-stone-50"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto pr-1">
              {isId ? termsContentId : termsContentEn}
            </div>
          )}
        </div>
        {showTerms && (
          <div className="flex-shrink-0 p-6 pt-0 flex gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50"
            >
              {isId ? 'Kembali' : 'Back'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600"
            >
              {isId ? 'Tutup' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// —— Product listing (Buy/Sell): no payment on platform; contact via WhatsApp
export interface ProductListing {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  thumbnails: string[]; // up to 4 (5 images total with main)
  price: string;
  currency: string;
  inStock: number;
  shipping: 'international' | 'local_only';
  sellerName: string;
  sellerLanguages: string[];
  whatsappNumber: string;
  condition: string;
  location?: string;
  verifiedInternational?: boolean;
  reviews: { author: string; text: string; rating?: number; avatar?: string }[];
  /** Different sizes available (e.g. S, M, L) */
  sizesAvailable?: boolean;
  /** Different colors available */
  colorsAvailable?: boolean;
  /** Colors list e.g. "Red, Blue, Green" */
  colorsList?: string;
  /** Next day dispatch or preparation time */
  dispatchType?: 'next_day' | 'preparation';
  /** Preparation time e.g. "2-3 business days" */
  preparationTime?: string;
  /** Any other info for local & international buyers */
  additionalInfo?: string;
  /** Optional YouTube video URL for the product (displayed with IndaStreet backlinks for SEO) */
  youtubeVideoUrl?: string;
}

/** Base URL for IndaStreet backlinks and SEO */
const INDSTREET_BASE_URL = 'https://www.indastreetmassage.com';

/** Extract YouTube video ID from watch, youtu.be, or embed URL */
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

function getMockProducts(language: string): ProductListing[] {
  const isId = language === 'id';
  const t = (en: string, id: string) => (isId ? id : en);
  return [
    {
      id: 'p1',
      title: t('Organic Balinese Coconut Oil 500ml', 'Minyak kelapa Bali organik 500ml'),
      description: t('Cold-pressed, ideal for massage and skin. Export quality.', 'Dingin, ideal untuk pijat dan kulit. Kualitas ekspor.'),
      mainImage: 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026',
      thumbnails: ['https://ik.imagekit.io/7grri5v7d/facial%202.png', 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026', '', ''],
      price: '85',
      currency: 'IDR K',
      inStock: 24,
      shipping: 'international',
      sellerName: 'Bali Wellness',
      sellerLanguages: ['English', 'Indonesian'],
      whatsappNumber: '6281234567890',
      condition: t('New', 'Baru'),
      location: 'Bali, Indonesia',
      verifiedInternational: true,
      reviews: [{ author: 'Sarah', text: t('Fast shipping, great product.', 'Pengiriman cepat, produk bagus.'), rating: 5, avatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png' }],
    },
    {
      id: 'p2',
      title: t('Jamu Herbal Pack (5 sachets)', 'Paket jamu herbal (5 sachet)'),
      description: t('Traditional wellness blend. Local pickup or domestic shipping.', 'Blend wellness tradisional. Ambil di tempat atau pengiriman domestik.'),
      mainImage: 'https://ik.imagekit.io/7grri5v7d/facial%202.png',
      thumbnails: [],
      price: '35',
      currency: 'IDR K',
      inStock: 50,
      shipping: 'local_only',
      sellerName: 'Dewi Spa',
      sellerLanguages: ['Indonesian'],
      whatsappNumber: '6289876543210',
      condition: t('New', 'Baru'),
      location: 'Jakarta',
      verifiedInternational: false,
      reviews: [],
    },
  ];
}

// —— Product card for Buy/Sell
const ProductCard: React.FC<{
  product: ProductListing;
  onContact: (product: ProductListing) => void;
  onInternationalInfo: () => void;
  onAddReview?: (productId: string, author: string, text: string, rating?: number) => void;
  onViewSeller?: (product: ProductListing) => void;
  canContactSeller?: boolean;
  language: string;
}> = ({ product, onContact, onInternationalInfo, onAddReview, onViewSeller, canContactSeller = true, language }) => {
  const isId = language === 'id';
  const [selectedImage, setSelectedImage] = useState(product.mainImage);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFormExpanded, setReviewFormExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const thumbnails = [product.mainImage, ...product.thumbnails].filter(Boolean).slice(0, 5);
  const REVIEWS_VISIBLE_INITIAL = 3;
  const reviewsToShow = reviewsExpanded ? product.reviews : product.reviews.slice(-REVIEWS_VISIBLE_INITIAL);
  const hasMoreReviews = product.reviews.length > REVIEWS_VISIBLE_INITIAL;
  const moreCount = product.reviews.length - REVIEWS_VISIBLE_INITIAL;

  return (
    <article className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 flex-shrink-0">
          <div className="aspect-square bg-stone-100 relative">
            <img src={selectedImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {thumbnails.length > 1 && (
            <div className="flex gap-1 p-2 border-t border-stone-100">
              {thumbnails.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(src)}
                  className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 ${selectedImage === src ? 'border-amber-500' : 'border-transparent'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 text-sm leading-tight">{product.title}</h3>
            <span className="text-amber-600 font-semibold text-sm whitespace-nowrap">{product.price} {product.currency}</span>
          </div>
          <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 mb-2">{product.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
              <Package className="w-3 h-3 flex-shrink-0 text-amber-600" />
              {isId ? 'Stok' : 'In stock'}: {product.inStock} {isId ? 'pcs' : 'pcs'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
              <MapPin className="w-3 h-3 flex-shrink-0 text-amber-600" />
              {product.shipping === 'international' ? (isId ? 'Kirim internasional' : 'International freight') : (isId ? 'Lokal saja' : 'Local only')}
            </span>
            {product.sizesAvailable && <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">{isId ? 'Ukuran' : 'Sizes'}</span>}
            {product.colorsAvailable && <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">{product.colorsList ? product.colorsList : (isId ? 'Warna' : 'Colors')}</span>}
            {product.dispatchType === 'next_day' && <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium">{isId ? 'Kirim besok' : 'Next day'}</span>}
            {product.dispatchType === 'preparation' && product.preparationTime && <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">{product.preparationTime}</span>}
            {product.verifiedInternational && (
              <button
                type="button"
                onClick={onInternationalInfo}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium hover:bg-amber-100"
              >
                <ShieldCheckIcon className="w-3 h-3" />
                {isId ? 'Verifikasi internasional' : 'Intl. verified'}
              </button>
            )}
          </div>
          <p className="text-[10px] text-stone-500 mb-2">
            {onViewSeller ? (
              <button type="button" onClick={() => onViewSeller(product)} className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-1">
                {product.sellerName}
              </button>
            ) : (
              product.sellerName
            )}
            {' · '}{product.condition}{product.location ? ` · ${product.location}` : ''}
          </p>
          <p className="text-[10px] text-stone-500 mb-2">
            {isId ? 'Bahasa' : 'Languages'}: {product.sellerLanguages.join(', ')}
          </p>
          {canContactSeller ? (
            <button
              type="button"
              onClick={() => onContact(product)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {isId ? 'Hubungi via WhatsApp' : 'Contact via WhatsApp'}
            </button>
          ) : (
            <p className="text-xs text-stone-500 py-2 text-center">
              {isId ? 'Masuk untuk menghubungi penjual' : 'Log in to contact seller'}
            </p>
          )}
        </div>
      </div>
      {product.youtubeVideoUrl && getYoutubeEmbedUrl(product.youtubeVideoUrl) && (
        <div className="border-t border-stone-100 p-3 bg-stone-50/50" itemScope itemType="https://schema.org/VideoObject">
          <p className="text-xs font-semibold text-stone-700 mb-2">{isId ? 'Video produk' : 'Product video'}</p>
          <div className="aspect-video rounded-lg overflow-hidden bg-stone-200 mb-2">
            <iframe
              src={getYoutubeEmbedUrl(product.youtubeVideoUrl)!}
              title={`${product.title} — ${isId ? 'Video' : 'Video'}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <p className="text-[10px] text-stone-600">
            {isId ? 'Produk terdaftar di' : 'Product listed on'}{' '}
            <a href={INDSTREET_BASE_URL} rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-medium underline">IndaStreet Massage</a>
            {' — '}
            <a href={INDSTREET_BASE_URL} rel="noopener noreferrer" className="text-stone-600 hover:text-stone-800">indastreetmassage.com</a>
          </p>
        </div>
      )}
      {(product.reviews.length > 0 || onAddReview) && (
        <div className="border-t border-stone-100 bg-stone-50/50">
          {product.reviews.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-stone-700 mb-2">{isId ? 'Ulasan' : 'Reviews'} ({product.reviews.length})</p>
              <ul className="space-y-2">
                {reviewsToShow.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-amber-100 flex items-center justify-center ring-1 ring-stone-200">
                      {r.avatar ? (
                        <img src={r.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-amber-800">{r.author.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-stone-800 flex items-center gap-1 flex-wrap">
                        <span>{r.author}</span>
                        {typeof r.rating === 'number' && (
                          <span className="inline-flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => {
                              const starRating = Math.min(5, Math.max(1, r.rating! <= 5 ? Math.round(r.rating!) : Math.round(r.rating! / 2)));
                              return <Star key={i} className={`w-3.5 h-3.5 ${i <= starRating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />;
                            })}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-600">{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {hasMoreReviews && (
                <button
                  type="button"
                  onClick={() => setReviewsExpanded((e) => !e)}
                  className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700"
                  aria-expanded={reviewsExpanded}
                >
                  {reviewsExpanded
                    ? (isId ? 'Tampilkan lebih sedikit' : 'Show less')
                    : (isId ? `Lebih banyak ulasan (${moreCount})` : `More reviews (${moreCount})`)}
                </button>
              )}
            </div>
          )}
          {onAddReview && (
            <div className="border-t border-stone-100">
              <button
                type="button"
                onClick={() => setReviewFormExpanded((e) => !e)}
                className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-stone-100/80 transition-colors"
                aria-expanded={reviewFormExpanded}
              >
                <h4 className="text-sm font-semibold text-stone-800">
                  {isId ? `Ulasan (${product.sellerName})` : `Review (${product.sellerName})`}
                </h4>
                {reviewFormExpanded ? (
                  <svg className="w-4 h-4 flex-shrink-0 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </button>
              {reviewFormExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-600 mr-2">{isId ? 'Rating:' : 'Rating:'}</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                        aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                      >
                        <Star className={`w-5 h-5 transition-colors ${reviewRating >= n ? 'fill-amber-500 text-amber-500' : 'text-stone-300 hover:text-stone-400'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-stone-500 ml-1">({reviewRating}/5)</span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={isId ? 'Tulis ulasan Anda…' : 'Write your review…'}
                    rows={3}
                    className="w-full py-2 px-3 rounded-lg border border-stone-200 text-sm resize-y min-h-[72px]"
                  />
                  <p className="text-[10px] text-stone-500">
                    {isId
                      ? 'Ulasan pengalaman Anda ini akan ditampilkan di halaman profil perusahaan penjual, di bagian ulasan dari pembeli.'
                      : 'This review for your experience will be displayed on the seller\'s company profile page under reviews from buyers.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (reviewText.trim()) {
                        onAddReview(product.id, 'You', reviewText.trim(), reviewRating);
                        setReviewText('');
                        setReviewRating(5);
                      }
                    }}
                    disabled={!reviewText.trim()}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isId ? 'Kirim ulasan' : 'Submit review'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

// —— Buy/Sell section: product grid + list item CTA
const BuySellSection: React.FC<{
  products: ProductListing[];
  onContact: (product: ProductListing) => void;
  onInternationalInfo: () => void;
  onListProduct: () => void;
  onAddReview?: (productId: string, author: string, text: string, rating?: number) => void;
  onViewSeller?: (product: ProductListing) => void;
  canContactSeller?: boolean;
  language: string;
}> = ({ products, onContact, onInternationalInfo, onListProduct, onAddReview, onViewSeller, canContactSeller = true, language }) => {
  const isId = language === 'id';
  return (
    <section id="section-buy-sell" className="scroll-mt-24">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 flex items-center gap-2">
              <ShoppingBagIcon className="w-6 h-6 text-amber-600" />
              {isId ? 'Produk' : 'Products'}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              {isId ? 'Produk terbaru di IndaStreet' : 'Latest Products On IndaStreet'}
            </p>
          </div>
          <button
            type="button"
            onClick={onListProduct}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 flex items-center gap-2"
          >
            <span>+</span>
            {isId ? 'Pasang produk' : 'List product'}
          </button>
        </div>
        <p className="text-stone-600 text-sm mb-4">
          {isId ? 'Tidak ada pembayaran di platform — hubungi penjual via WhatsApp. Pembayaran dan pengiriman diatur langsung.' : 'No payment on platform — contact seller via WhatsApp. Payment and shipping arranged directly.'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onContact={onContact}
              onInternationalInfo={onInternationalInfo}
              onAddReview={onAddReview}
              onViewSeller={onViewSeller}
              canContactSeller={canContactSeller}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// —— List product modal: upload up to 5 images, product name, local price, city/area, new/used, stock, shipping, sizes, colors, dispatch/preparation, extra info
const ListProductModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<ProductListing, 'id' | 'reviews'>) => void;
  language: string;
}> = ({ isOpen, onClose, onSubmit, language }) => {
  const isId = language === 'id';
  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '', '', '']);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('IDR K');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const [inStock, setInStock] = useState('');
  const [shipping, setShipping] = useState<'international' | 'local_only'>('local_only');
  const [sizesAvailable, setSizesAvailable] = useState(false);
  const [colorsAvailable, setColorsAvailable] = useState(false);
  const [colorsList, setColorsList] = useState('');
  const [dispatchType, setDispatchType] = useState<'next_day' | 'preparation'>('next_day');
  const [preparationTime, setPreparationTime] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerLanguages, setSellerLanguages] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verifiedInternational, setVerifiedInternational] = useState(false);
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrls((prev) => {
        const next = [...prev];
        next[index] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const setImageUrlByIndex = (index: number, url: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = url.trim();
      return next;
    });
  };

  if (!isOpen) return null;

  const mainImage = imageUrls[0]?.trim() || '';
  const thumbnails = imageUrls.slice(1, 5).filter(Boolean);
  const canSubmit = title.trim() && mainImage && price.trim() && inStock.trim() && sellerName.trim() && whatsappNumber.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: [additionalInfo.trim(), colorsAvailable && colorsList.trim() ? (isId ? 'Warna: ' : 'Colors: ') + colorsList.trim() : '', sizesAvailable ? (isId ? 'Ukuran berbeda tersedia.' : 'Different sizes available.') : ''].filter(Boolean).join('\n') || (isId ? 'Lihat deskripsi.' : 'See description.'),
      mainImage,
      thumbnails,
      price: price.trim(),
      currency: currency.trim() || 'IDR K',
      inStock: parseInt(inStock, 10) || 0,
      shipping,
      sellerName: sellerName.trim(),
      sellerLanguages: sellerLanguages ? sellerLanguages.split(',').map((s) => s.trim()).filter(Boolean) : [],
      whatsappNumber: whatsappNumber.trim().replace(/\D/g, ''),
      condition: condition === 'new' ? (isId ? 'Baru' : 'New') : (isId ? 'Bekas' : 'Used'),
      location: location.trim() || undefined,
      verifiedInternational,
      sizesAvailable,
      colorsAvailable,
      colorsList: colorsList.trim() || undefined,
      dispatchType,
      preparationTime: preparationTime.trim() || undefined,
      additionalInfo: additionalInfo.trim() || undefined,
      youtubeVideoUrl: youtubeVideoUrl.trim() || undefined,
    });
    setImageUrls(['', '', '', '', '']);
    setTitle(''); setPrice(''); setInStock(''); setSellerName(''); setSellerLanguages(''); setWhatsappNumber('');
    setLocation(''); setColorsList(''); setPreparationTime(''); setAdditionalInfo('');
    setCondition('new'); setShipping('local_only'); setSizesAvailable(false); setColorsAvailable(false); setDispatchType('next_day'); setVerifiedInternational(false);
    setYoutubeVideoUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-900 text-lg mb-4">{isId ? 'Pasang produk' : 'List product'}</h3>
        <p className="text-xs text-stone-500 mb-4">{isId ? 'Informasi untuk pembeli lokal dan internasional' : 'Information for local and international buyers'}</p>
        <div className="space-y-4 text-sm">
          {/* Product pictures – up to 5 */}
          <div>
            <span className="font-medium text-stone-700 block mb-2">{isId ? 'Foto produk (maks. 5)' : 'Product pictures (up to 5)'}</span>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg border border-stone-200 bg-stone-50 overflow-hidden relative">
                  {imageUrls[i] ? (
                    <>
                      <img src={imageUrls[i]} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImageUrlByIndex(i, '')} className="absolute top-1 right-1 w-5 h-5 rounded bg-stone-800/70 text-white text-xs leading-none">&times;</button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(i, e)} />
                      <span className="text-stone-400 text-xs">+</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">{isId ? 'Atau isi URL gambar di bawah (opsional)' : 'Or paste image URLs below (optional)'}</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <input key={i} type="url" placeholder={i === 0 ? (isId ? 'Gambar 1 (utama) URL' : 'Image 1 (main) URL') : (isId ? `Gambar ${i + 1} URL` : `Image ${i + 1} URL`)} value={imageUrls[i]?.startsWith('http') ? imageUrls[i] : ''} onChange={(e) => setImageUrlByIndex(i, e.target.value)} className="py-1.5 px-2 rounded border border-stone-200 text-xs" />
              ))}
            </div>
          </div>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Nama produk' : 'Product name'}</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isId ? 'Nama produk' : 'Product name'} className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Harga lokal' : 'Local price'}</span><div className="flex gap-2 mt-1"><input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="85" className="py-2 px-3 rounded-lg border border-stone-200 w-24" /><input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="IDR K" className="py-2 px-3 rounded-lg border border-stone-200 flex-1" /></div></label>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Kota / area pengiriman dari' : 'City / area product dispatches from'}</span><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={isId ? 'Contoh: Bali, Jakarta' : 'e.g. Bali, Jakarta'} className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <div>
            <span className="font-medium text-stone-700 block mb-1">{isId ? 'Baru atau bekas' : 'New or used'}</span>
            <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="cond" checked={condition === 'new'} onChange={() => setCondition('new')} />{isId ? 'Baru' : 'New'}</label><label className="flex items-center gap-2"><input type="radio" name="cond" checked={condition === 'used'} onChange={() => setCondition('used')} />{isId ? 'Bekas' : 'Used'}</label></div>
          </div>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Jumlah pcs stok' : 'How many pcs in stock'}</span><input type="number" min={0} value={inStock} onChange={(e) => setInStock(e.target.value)} placeholder="1" className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <div>
            <span className="font-medium text-stone-700 block mb-1">{isId ? 'Pengiriman' : 'Ships'}</span>
            <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="ship" checked={shipping === 'international'} onChange={() => setShipping('international')} />{isId ? 'Internasional' : 'International'}</label><label className="flex items-center gap-2"><input type="radio" name="ship" checked={shipping === 'local_only'} onChange={() => setShipping('local_only')} />{isId ? 'Lokal saja' : 'Local only'}</label></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sizesAvailable} onChange={(e) => setSizesAvailable(e.target.checked)} /><span className="font-medium text-stone-700">{isId ? 'Ukuran berbeda tersedia' : 'Different sizes available'}</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={colorsAvailable} onChange={(e) => setColorsAvailable(e.target.checked)} /><span className="font-medium text-stone-700">{isId ? 'Warna berbeda tersedia' : 'Different colors available'}</span></label>
          {colorsAvailable && <label className="block"><span className="font-medium text-stone-700">{isId ? 'Daftar warna (opsional)' : 'Colors list (optional)'}</span><input type="text" value={colorsList} onChange={(e) => setColorsList(e.target.value)} placeholder={isId ? 'Merah, Biru, Hijau' : 'Red, Blue, Green'} className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>}
          <div>
            <span className="font-medium text-stone-700 block mb-1">{isId ? 'Pengiriman besok atau waktu persiapan' : 'Next day dispatch or preparation time'}</span>
            <div className="flex flex-wrap gap-4 mb-2"><label className="flex items-center gap-2"><input type="radio" name="dispatch" checked={dispatchType === 'next_day'} onChange={() => setDispatchType('next_day')} />{isId ? 'Kirim besok' : 'Next day dispatch'}</label><label className="flex items-center gap-2"><input type="radio" name="dispatch" checked={dispatchType === 'preparation'} onChange={() => setDispatchType('preparation')} />{isId ? 'Waktu persiapan' : 'Preparation time'}</label></div>
            {dispatchType === 'preparation' && <input type="text" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} placeholder={isId ? 'Contoh: 2-3 hari kerja' : 'e.g. 2-3 business days'} className="w-full py-2 px-3 rounded-lg border border-stone-200" />}
          </div>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Informasi lain untuk pembeli' : 'Any other information for buyers'}</span><textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows={3} placeholder={isId ? 'Detail produk, bahan, dimensi, dll.' : 'Product details, materials, dimensions, etc.'} className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <hr className="border-stone-200" />
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Nama penjual' : 'Seller name'}</span><input type="text" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <label className="block"><span className="font-medium text-stone-700">{isId ? 'Bahasa penjual' : 'Seller languages'}</span><input type="text" value={sellerLanguages} onChange={(e) => setSellerLanguages(e.target.value)} placeholder="English, Indonesian" className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <label className="block"><span className="font-medium text-stone-700">WhatsApp</span><input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="6281234567890" className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200" /></label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verifiedInternational} onChange={(e) => setVerifiedInternational(e.target.checked)} />
            <span className="font-medium text-stone-700">{isId ? 'Tawarkan verifikasi pembelian internasional (20% dari harga)' : 'Offer safe international verification (20% of price)'}</span>
          </label>
          <label className="block">
            <span className="font-medium text-stone-700">{isId ? 'Link video YouTube (opsional)' : 'YouTube video link (optional)'}</span>
            <input
              type="url"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 w-full py-2 px-3 rounded-lg border border-stone-200"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              {isId ? 'Video akan ditampilkan di listing produk dengan tautan IndaStreet untuk SEO.' : 'Video will be shown on your product listing with IndaStreet backlinks for SEO.'}
            </p>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold">{isId ? 'Batal' : 'Cancel'}</button>
          <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none">{isId ? 'Kirim' : 'Submit'}</button>
        </div>
      </div>
    </div>
  );
};

// —— Seller company profile modal: full info for international & local buyers, reviews from buyers, WhatsApp for logged-in
const SellerProfileModal: React.FC<{
  product: ProductListing | null;
  onClose: () => void;
  onContact: (product: ProductListing) => void;
  canContactSeller: boolean;
  language: string;
}> = ({ product, onClose, onContact, canContactSeller, language }) => {
  const isId = language === 'id';
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-900 text-lg mb-4">{product.sellerName}</h3>
        <p className="text-xs text-stone-500 mb-4">
          {isId ? 'Profil perusahaan penjual — informasi untuk pembeli lokal dan internasional' : 'Seller company profile — information for local and international buyers'}
        </p>
        <dl className="space-y-2 text-sm mb-4">
          <div><dt className="font-medium text-stone-700">{isId ? 'Bahasa' : 'Languages'}</dt><dd className="text-stone-600">{product.sellerLanguages.join(', ') || '—'}</dd></div>
          <div><dt className="font-medium text-stone-700">{isId ? 'Lokasi' : 'Location'}</dt><dd className="text-stone-600">{product.location || '—'}</dd></div>
          <div><dt className="font-medium text-stone-700">{isId ? 'Pengiriman' : 'Shipping'}</dt><dd className="text-stone-600">{product.shipping === 'international' ? (isId ? 'Internasional' : 'International') : (isId ? 'Lokal saja' : 'Local only')}</dd></div>
          {product.verifiedInternational && (
            <div className="flex items-center gap-2"><dt className="font-medium text-stone-700">{isId ? 'Verifikasi' : 'Verification'}</dt><dd><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs"><ShieldCheckIcon className="w-3.5 h-3.5" />{isId ? 'Verifikasi internasional' : 'International verified'}</span></dd></div>
          )}
          <div><dt className="font-medium text-stone-700">WhatsApp</dt><dd className="text-stone-600">{product.whatsappNumber}</dd></div>
        </dl>
        {product.youtubeVideoUrl && getYoutubeEmbedUrl(product.youtubeVideoUrl) && (
          <div className="mb-4" itemScope itemType="https://schema.org/VideoObject">
            <h4 className="font-semibold text-stone-800 text-sm mb-2">{isId ? 'Video produk' : 'Product video'}</h4>
            <div className="aspect-video rounded-lg overflow-hidden bg-stone-200 mb-2">
              <iframe
                src={getYoutubeEmbedUrl(product.youtubeVideoUrl)!}
                title={`${product.title} — ${product.sellerName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-[10px] text-stone-600">
              {isId ? 'Produk terdaftar di' : 'Product listed on'}{' '}
              <a href={INDSTREET_BASE_URL} rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-medium underline">IndaStreet Massage</a>
              {' — '}
              <a href={INDSTREET_BASE_URL} rel="noopener noreferrer" className="text-stone-600 hover:text-stone-800">indastreetmassage.com</a>
            </p>
          </div>
        )}
        {canContactSeller ? (
          <button
            type="button"
            onClick={() => { onContact(product); onClose(); }}
            className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2 mb-4"
          >
            <MessageCircle className="w-4 h-4" />
            {isId ? 'Hubungi via WhatsApp' : 'Contact via WhatsApp'}
          </button>
        ) : (
          <p className="text-xs text-stone-500 py-2 mb-4 text-center">{isId ? 'Masuk untuk menghubungi penjual' : 'Log in to contact seller'}</p>
        )}
        <h4 className="font-semibold text-stone-800 text-sm mb-2">{isId ? 'Ulasan dari pembeli' : 'Reviews from buyers'}</h4>
        {product.reviews.length > 0 ? (
          <ul className="space-y-3">
            {product.reviews.map((r, i) => (
              <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-amber-100 flex items-center justify-center ring-1 ring-stone-200">
                  {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-amber-800">{r.author.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-stone-800 flex items-center gap-1 flex-wrap">
                    <span>{r.author}</span>
                    {typeof r.rating === 'number' && (
                      <span className="inline-flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const starRating = Math.min(5, Math.max(1, r.rating! <= 5 ? Math.round(r.rating!) : Math.round(r.rating! / 2)));
                          return <Star key={i} className={`w-3.5 h-3.5 ${i <= starRating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />;
                        })}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-600">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-stone-500 py-2">{isId ? 'Belum ada ulasan dari pembeli.' : 'No reviews from buyers yet.'}</p>
        )}
        <button type="button" onClick={onClose} className="w-full mt-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold">{isId ? 'Tutup' : 'Close'}</button>
      </div>
    </div>
  );
};

interface IndonesiaLandingPageProps {
  onNavigate?: (page: Page) => void;
  language?: 'en' | 'id' | 'gb';
  onLanguageChange?: (lang: string) => void;
  /** Country name for hero (e.g. "Indonesia", "United Kingdom"). Same social page for all countries. */
  countryName?: string;
  loggedInCustomer?: { id: string; name?: string; email?: string } | null;
  loggedInProvider?: { id: string; name?: string; email?: string } | null;
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onFacialPortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  therapists?: any[];
  places?: any[];
  facialPlaces?: any[];
  handleSetSelectedTherapist?: (therapist: any) => void;
}

const IndonesiaLandingPage: React.FC<IndonesiaLandingPageProps> = ({
  onNavigate,
  handleSetSelectedTherapist,
  language: lang = 'en',
  onLanguageChange,
  countryName = 'Indonesia',
  loggedInCustomer,
  loggedInProvider,
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onFacialPortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  therapists = [],
  places = [],
  facialPlaces = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showInternationalModal, setShowInternationalModal] = useState(false);
  const [showListProductModal, setShowListProductModal] = useState(false);
  const [selectedSellerProduct, setSelectedSellerProduct] = useState<ProductListing | null>(null);
  const [sharedPost, setSharedPost] = useState<FeedPost | null>(null);
  const [pendingPost, setPendingPost] = useState<FeedPost | null>(null);
  const [composerText, setComposerText] = useState('');
  const [composerVideoLink, setComposerVideoLink] = useState('');
  const [composerImages, setComposerImages] = useState<string[]>([]);
  const [composerAttachment, setComposerAttachment] = useState<{ name: string; dataUrl: string } | null>(null);
  const [composerJobBadge, setComposerJobBadge] = useState<null | 'Job Offered' | 'Position Required'>(null);
  const [composerJobOfferFields, setComposerJobOfferFields] = useState<JobOfferFields>(() => ({ ...initialJobOfferFields }));
  const [composerPositionRequiredFields, setComposerPositionRequiredFields] = useState<PositionRequiredFields>(() => ({ ...initialPositionRequiredFields }));
  const [products, setProducts] = useState<ProductListing[]>(() => getMockProducts(lang));
  const [searchQuery, setSearchQuery] = useState('');
  const [heroVariant, setHeroVariant] = useState<'default' | 'news'>('default');
  const hasAccount = !!(loggedInCustomer || loggedInProvider);
  const customerProfilePhoto = (loggedInCustomer as unknown as { profilePhoto?: string } | undefined)?.profilePhoto ?? '';
  const customerUserId = (loggedInCustomer as unknown as { $id?: string } | undefined)?.$id ?? '';
  const providerProfilePhoto = (loggedInProvider as unknown as { profilePhoto?: string } | undefined)?.profilePhoto ?? '';
  const providerUserId = (loggedInProvider as unknown as { $id?: string } | undefined)?.$id ?? '';
  const isId = lang === 'id';

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // SEO: every post and shared post links back to www.indastreetmassage.com/indonesia; hashtags and meta for discovery
  useEffect(() => {
    const isIdLang = lang === 'id';
    const cleanup = setupSocialPageSEO({
      title: isIdLang ? SOCIAL_PAGE_SEO.titleId : SOCIAL_PAGE_SEO.title,
      description: isIdLang ? SOCIAL_PAGE_SEO.descriptionId : SOCIAL_PAGE_SEO.description,
      keywords: isIdLang ? SOCIAL_PAGE_SEO.keywordsId : SOCIAL_PAGE_SEO.keywords,
      url: SOCIAL_PAGE_SEO.canonicalUrl,
      ogImage: SOCIAL_PAGE_SEO.ogImage,
      ogSiteName: SOCIAL_PAGE_SEO.ogSiteName,
      twitterCard: SOCIAL_PAGE_SEO.twitterCard,
      pageName: 'IndaStreet Social Media',
    });
    return cleanup;
  }, [lang]);

  const copy = {
    searchPlaceholder: isId ? 'Cari topik, video, berita, acara…' : 'Search topics, video, news, events…',
    searchPlaceholders: isId
      ? ['Cari topik…', 'Cari video…', 'Cari berita…', 'Cari acara…', 'Cari terapis…', 'Cari perawatan…']
      : ['Search topics…', 'Search video…', 'Search news…', 'Search events…', 'Search therapists…', 'Search treatments…'],
    searchButton: isId ? 'Cari' : 'Search',
    heroLabel: isId ? 'IndaStreet Social Media' : 'IndaStreet Social Media',
    heroHeadline: isId ? `${countryName} · Pijat, facial & kecantikan` : `${countryName} · Massage, facial & beauty`,
    heroSubtext: isId ? 'Terapis dan klien terhubung di satu tempat. Bergabung atau jelajahi konten.' : 'Professionals and clients in one place. Join or explore.',
    heroNewsLabel: isId ? 'Berita & Analisis' : 'News & Analysis',
    heroNewsHeadline: 'IndaStreet News',
    heroNewsSubtext: isId ? 'Berita terbaru untuk pijat dan klinik kulit — teknik baru, produsen, tempat buka/tutup, berita positif dan terkini.' : 'The latest massage and skin care news — new techniques, producers, places opening and closing, latest industry news.',
    articlesIntroText: isId ? 'Ikuti berita terbaru seputar wellness dan kecantikan dari seluruh dunia—tren industri, insight para ahli, dan tips praktis untuk terapis, spa, dan klinik kulit.' : 'Stay up to date with the latest wellness and beauty news from around the world—industry trends, expert insights, and practical tips for therapists, spas, and skin clinics.',
    ctaCommunity: isId ? 'Bergabung' : 'Join',
    ctaExplore: isId ? 'Jelajahi postingan' : 'Explore Posts',
    composerPlaceholder: isId ? 'Bagikan tip perawatan atau insight wellness…' : 'Share a treatment tip or wellness insight…',
    postLabel: isId ? 'Posting' : 'Post',
    videoLinkPlaceholder: isId ? 'Tambah link video (YouTube atau lainnya)' : 'Add video link (YouTube or other)',
    homeFeed: isId ? 'Home Feed' : 'Home Feed',
    exploreTreatments: isId ? 'Jelajahi perawatan' : 'Explore Treatments',
    professionals: isId ? 'Profesional' : 'Professionals',
    bookSession: isId ? 'Pesan sesi' : 'Book Session',
    trending: isId ? 'Trending' : 'Trending',
    saved: isId ? 'Tersimpan' : 'Saved',
    settings: isId ? 'Pengaturan' : 'Settings',
  };

  const leftNavItems = [
    { icon: Home, label: copy.homeFeed, page: undefined as Page | undefined },
    { icon: Sparkles, label: copy.exploreTreatments, page: 'massage-types' as Page },
    { icon: User, label: copy.professionals, page: 'home' as Page },
    { icon: Calendar, label: copy.bookSession, page: 'home' as Page },
    { icon: TrendingUp, label: copy.trending, page: undefined as Page | undefined },
    { icon: Check, label: copy.saved, page: undefined as Page | undefined },
    { icon: Settings, label: copy.settings, page: undefined as Page | undefined },
  ].map((i) => ({ ...i, page: i.page ?? 'home' }));

  const trendingTopics = isId ? ['pijatbali', 'facialrumah', 'spaweekend', 'wellnessid'] : ['balimassage', 'homefacial', 'weekendspa', 'wellness'];
  const suggestedProfessionals = therapists.slice(0, 3).map((t) => ({
    name: getTherapistDisplayName(t.name ?? t.displayName),
    role: isId ? 'Terapis pijat' : 'Massage therapist',
    avatar: t.mainImage ?? t.profilePicture ?? getRandomTherapistImage((t.$id ?? t.id ?? '').toString()),
  }));
  if (suggestedProfessionals.length < 3) {
    suggestedProfessionals.push({ name: 'Dewi Spa', role: isId ? 'Terapis facial' : 'Facial therapist', avatar: 'https://ik.imagekit.io/7grri5v7d/facial%202.png' });
  }
  const featuredTreatments = isId ? ['Pijat Bali', 'Facial glow', 'Pijat deep tissue'] : ['Balinese massage', 'Facial glow', 'Deep tissue'];

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => getMockFeedPosts(therapists, lang));
  const [feedLastViewedCount, setFeedLastViewedCount] = useState<number | null>(null);
  /** When set, feed shows only this type. null = mixed live feed (all posts). */
  const [feedFilter, setFeedFilter] = useState<null | 'video' | 'articles' | 'news' | 'buy-sell' | 'jobs'>(null);
  const [profilePreview, setProfilePreview] = useState<SocialProfilePreview | null>(null);
  const [verifiedBadgeAuthor, setVerifiedBadgeAuthor] = useState<{ name: string; avatar: string; role: string } | null>(null);
  const [notifications, setNotifications] = useState<FeedNotification[]>([]);
  const feedUnviewedCount = feedLastViewedCount === null ? 0 : Math.max(0, feedPosts.length - feedLastViewedCount);
  const currentUserName = loggedInCustomer?.name ?? loggedInProvider?.name ?? '';
  const notificationsForMe = notifications.filter((n) => n.postAuthorName === currentUserName);

  const scrollToFeedAndReset = () => {
    scrollToSection('section-news');
    setFeedLastViewedCount(feedPosts.length);
  };

  const handleNav = (page: Page) => {
    if (page === 'facial-types' && onNavigate) {
      try { sessionStorage.setItem('home_initial_tab', 'facials'); } catch (_) {}
    }
    setShowAccountModal(false);
    onNavigate?.(page);
  };

  const handlePost = () => {
    const text = composerText.trim();
    const videoLink = composerVideoLink.trim();
    const hasImages = composerImages.length >= 1;
    const hasVideo = !!videoLink;
    const isJobPost = composerJobBadge != null;
    const hasMedia = hasImages || hasVideo;
    if (!hasMedia) return; // all posts must have either a photo or video
    if (isJobPost && !text) return; // job posts need at least title/description
    const newPost: FeedPost = {
      id: `user-${Date.now()}`,
      authorName: hasAccount ? (loggedInCustomer?.name ?? loggedInProvider?.name ?? 'You') : (isId ? 'Anda' : 'You'),
      authorAvatar: 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?v=2026',
      authorRole: isId ? 'Anggota' : 'Member',
      timeAgo: isId ? 'Baru saja' : 'Just now',
      text: text || (hasVideo ? (isId ? '(link video)' : '(video link)') : hasImages ? (isId ? '(gambar)' : '(image)') : (isId ? '(lowongan)' : '(job)')),
      mediaUrls: hasImages ? [...composerImages] : undefined,
      videoLink: videoLink || undefined,
      attachment: composerAttachment ? { name: composerAttachment.name, dataUrl: composerAttachment.dataUrl } : undefined,
      postType: isJobPost ? (composerJobBadge === 'Job Offered' ? 'job-offered' : 'job-wanted') : undefined,
      jobBadge: composerJobBadge ?? undefined,
      ...(composerJobBadge === 'Job Offered' && {
        jobSalary: composerJobOfferFields.salary || undefined,
        jobHoursPerWeek: composerJobOfferFields.hoursPerWeek || undefined,
        jobAccommodationIncluded: composerJobOfferFields.accommodationIncluded,
        jobDailyMeals: composerJobOfferFields.dailyMeals || undefined,
        jobHolidayPay: composerJobOfferFields.holidayPay || undefined,
        jobStartDate: composerJobOfferFields.startDate || undefined,
        jobPositionAvailable: composerJobOfferFields.positionAvailable || undefined,
        jobExperienceRequired: composerJobOfferFields.experienceRequired || undefined,
        jobCvRequired: composerJobOfferFields.cvRequired,
      }),
      ...(composerJobBadge === 'Position Required' && {
        positionSalary: composerPositionRequiredFields.salary || undefined,
        positionHoursPerWeek: composerPositionRequiredFields.hoursPerWeek || undefined,
        positionAccommodationRequired: composerPositionRequiredFields.accommodationRequired,
        positionDailyMeals: composerPositionRequiredFields.dailyMeals || undefined,
        positionHolidayPay: composerPositionRequiredFields.holidayPay || undefined,
        positionStartDate: composerPositionRequiredFields.startDate || undefined,
        positionSought: composerPositionRequiredFields.positionSought || undefined,
        positionExperience: composerPositionRequiredFields.experience || undefined,
        positionCvAvailable: composerPositionRequiredFields.cvAvailable,
      }),
      likes: 0,
      comments: 0,
      shares: 0,
      commentPreview: [],
      createdAt: Date.now(),
    };
    if (hasAccount) {
      setFeedPosts((prev) => [newPost, ...prev]);
      setComposerText('');
      setComposerVideoLink('');
      setComposerImages([]);
      setComposerAttachment(null);
      setComposerJobBadge(null);
      setComposerJobOfferFields({ ...initialJobOfferFields });
      setComposerPositionRequiredFields({ ...initialPositionRequiredFields });
    } else {
      newPost.pending = true;
      setPendingPost(newPost);
      setShowAccountModal(true);
    }
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    if (!hasAccount) {
      setShowAccountModal(true);
      return;
    }
    const author = loggedInCustomer?.name ?? loggedInProvider?.name ?? (isId ? 'Anda' : 'You');
    const post = pendingPost?.id === postId ? pendingPost : feedPosts.find((p) => p.id === postId);
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments ?? 0) + 1,
              commentPreview: [...(p.commentPreview ?? []), { author, text: text.trim(), likes: 0, dislikes: 0, replies: [] }],
            }
          : p
      )
    );
    // Notify the post author when someone else comments on their post (only when signed in)
    if (post && post.authorName !== author && currentUserName) {
      setNotifications((prev) => [
        ...prev,
        {
          id: `notif-${Date.now()}-${postId}`,
          type: 'comment',
          postId,
          commentAuthorName: author,
          commentText: text.trim(),
          postAuthorName: post.authorName,
          createdAt: Date.now(),
          read: false,
        },
      ]);
    }
  };

  const handleAddReply = (postId: string, commentIndex: number, text: string) => {
    if (!text.trim() || !hasAccount) {
      if (!hasAccount) setShowAccountModal(true);
      return;
    }
    const author = loggedInCustomer?.name ?? loggedInProvider?.name ?? (isId ? 'Anda' : 'You');
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.commentPreview?.[commentIndex]) return p;
        return {
          ...p,
          comments: (p.comments ?? 0) + 1,
          commentPreview: p.commentPreview.map((c, j) =>
            j === commentIndex ? { ...c, replies: [...(c.replies ?? []), { author, text: text.trim() }] } : c
          ),
        };
      })
    );
  };

  const handleEditPost = (postId: string, newText: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, text: newText } : p))
    );
    setPendingPost((prev) => (prev && prev.id === postId ? { ...prev, text: newText } : prev));
  };

  const handleDeletePost = (postId: string) => {
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
    setPendingPost((prev) => (prev && prev.id === postId ? null : prev));
  };

  useEffect(() => {
    let cancelled = false;
    listIndastreetNews(15).then((news) => {
      if (cancelled) return;
      const fromNews = newsToFeedPosts(news, lang);
      const fromMock = getMockFeedPosts(therapists, lang);
      const merged = [...fromNews, ...fromMock];
      merged.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setFeedPosts(merged);
      setFeedLastViewedCount((prev) => (prev === null ? merged.length : prev));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [therapists, lang]);

  useEffect(() => {
    setProducts(getMockProducts(lang));
  }, [lang]);

  const handleContactProduct = (product: ProductListing) => {
    const num = product.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_blank', 'noopener,noreferrer');
  };

  const handleListProductSubmit = (p: Omit<ProductListing, 'id' | 'reviews'>) => {
    setProducts((prev) => [...prev, { ...p, id: `user-${Date.now()}`, reviews: [] }]);
  };

  const handleAddProductReview = (productId: string, author: string, text: string, rating?: number) => {
    setProducts((prev) =>
      prev.map((q) =>
        q.id === productId ? { ...q, reviews: [...q.reviews, { author, text, rating }] } : q
      )
    );
  };

  const displayPosts = (() => {
    const combined = pendingPost ? [pendingPost, ...feedPosts] : feedPosts;
    const sorted = [...combined].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return sorted.filter((p) => p.videoLink || (p.mediaUrls && p.mediaUrls.length > 0));
  })();

  const filteredDisplayPosts = (() => {
    if (!feedFilter) return displayPosts;
    return displayPosts.filter((p) => {
      const type = getPostType(p);
      if (feedFilter === 'video') return type === 'video';
      if (feedFilter === 'news') return type === 'news';
      if (feedFilter === 'articles') return type === 'article';
      if (feedFilter === 'buy-sell') return type === 'buy-sell';
      if (feedFilter === 'jobs') return type === 'job-offered' || type === 'job-wanted';
      return true;
    });
  })();

  const mockEvents = React.useMemo(() => getMockEvents(lang), [lang]);
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return { topics: [] as string[], video: [] as FeedPost[], news: [] as FeedPost[], events: [] as SearchEvent[], posts: [] as FeedPost[], products: [] as ProductListing[] };
    const topicsSet = new Set<string>();
    trendingTopics.filter((t) => matchQuery(t, q)).forEach((t) => topicsSet.add(t));
    featuredTreatments.filter((t) => matchQuery(t, q)).forEach((t) => topicsSet.add(t));
    displayPosts.forEach((p) => extractHashtags(p.text).filter((tag) => matchQuery(tag, q)).forEach((tag) => topicsSet.add(tag)));
    const topics = Array.from(topicsSet);
    const video = displayPosts.filter((p) => p.videoLink && (matchQuery(p.text, q) || matchQuery(p.authorName, q)));
    const news = displayPosts.filter((p) => p.id.startsWith('news-') && (matchQuery(p.text, q) || matchQuery(p.authorName, q)));
    const events = mockEvents.filter((e) => matchQuery(e.title + ' ' + e.description, q));
    const posts = displayPosts.filter((p) => !p.videoLink && !p.id.startsWith('news-') && (matchQuery(p.text, q) || matchQuery(p.authorName, q)));
    const productsFiltered = products.filter((p) => matchQuery(p.title + ' ' + p.description, q));
    return { topics, video, news, events, posts, products: productsFiltered };
  }, [displayPosts, products, trendingTopics, featuredTreatments, mockEvents, searchQuery]);

  const handleSharePost = (postId: string) => {
    const post = displayPosts.find((p) => p.id === postId);
    if (post) setSharedPost(post);
  };

  return (
    <div className={`min-h-screen ${COLORS.bg}`}>
      <style>{`@keyframes indoFadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <AccountGateModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onCreateAccount={() => handleNav('simpleSignup')}
        onSignIn={() => handleNav('signin')}
        language={lang}
      />
      <InternationalVerificationModal
        isOpen={showInternationalModal}
        onClose={() => setShowInternationalModal(false)}
        language={lang}
      />
      <SharePostPopup
        isOpen={!!sharedPost}
        onClose={() => setSharedPost(null)}
        post={sharedPost}
        canonicalBaseUrl={SOCIAL_PAGE_SEO.canonicalUrl}
        onShared={() => {
          if (sharedPost) {
            setFeedPosts((prev) => prev.map((p) => (p.id === sharedPost.id ? { ...p, shares: (p.shares ?? 0) + 1 } : p)));
            setPendingPost((prev) => (prev && prev.id === sharedPost.id ? { ...prev, shares: (prev.shares ?? 0) + 1 } : prev));
          }
        }}
        language={lang}
      />
      <TopNav
        onMenuClick={() => setIsMenuOpen(true)}
        onProfileClick={() => handleNav('signin')}
        language={lang}
        isLoggedIn={hasAccount}
        notifications={notificationsForMe}
        onMarkNotificationRead={(id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onNotificationClick={(n) => {
          document.getElementById(`post-${n.postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
        locationText={isId ? `Lokasi: ${countryName}` : `Location: ${countryName}`}
      />
      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={onNavigate}
          language={lang}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onFacialPortalClick={onFacialPortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onTermsClick={onTermsClick}
          onPrivacyClick={onPrivacyClick}
          therapists={therapists}
          places={places}
        />
      </React19SafeWrapper>

      <HeroSection
        heroImageSrc={heroVariant === 'news' ? NEWS_HERO_IMAGE : HERO_IMAGE_SRC}
        label={heroVariant === 'news' ? copy.heroNewsLabel : copy.heroLabel}
        headline={heroVariant === 'news' ? copy.heroNewsHeadline : copy.heroHeadline}
        subtext={heroVariant === 'news' ? copy.heroNewsSubtext : copy.heroSubtext}
        ctaCommunity={copy.ctaCommunity}
        ctaExplore={copy.ctaExplore}
        onJoinCommunity={() => handleNav('simpleSignup')}
        onExplorePosts={() => { setHeroVariant('default'); scrollToSection('section-news'); }}
      />
      <HeroSearchBar
        placeholder={copy.searchPlaceholder}
        placeholderOptions={copy.searchPlaceholders}
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={() => {}}
        onClear={() => setSearchQuery('')}
        searchButtonLabel={copy.searchButton}
      />
      <HeroQuickLinks
        onFeed={() => { setHeroVariant('default'); setFeedFilter(null); scrollToFeedAndReset(); }}
        feedUnviewedCount={feedUnviewedCount}
        onVideo={() => { setHeroVariant('default'); setFeedFilter('video'); setTimeout(() => scrollToSection('section-news'), 0); }}
        onArticles={() => { setHeroVariant('default'); setFeedFilter('articles'); setTimeout(() => scrollToSection('section-news'), 0); }}
        onNews={() => { setHeroVariant('default'); setFeedFilter('news'); setTimeout(() => scrollToSection('section-news'), 0); }}
        onBuySell={() => { setHeroVariant('default'); setFeedFilter('buy-sell'); setTimeout(() => scrollToSection('section-news'), 0); }}
        language={lang}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">
          <LeftSidebar items={leftNavItems} onNavigate={handleNav} active={copy.homeFeed} feedUnviewedCount={feedUnviewedCount} onFeedClick={scrollToFeedAndReset} />

          {searchQuery.trim() ? (
            <SearchResultsView
              query={searchQuery.trim()}
              topics={searchResults.topics}
              video={searchResults.video}
              news={searchResults.news}
              events={searchResults.events}
              posts={searchResults.posts}
              products={searchResults.products}
              onClearSearch={() => setSearchQuery('')}
              onPostClick={(postId) => {
                setSearchQuery('');
                setTimeout(() => document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
              }}
              onProductClick={(product) => {
                setSearchQuery('');
                scrollToSection('section-buy-sell');
              }}
              language={lang}
              renderPostCard={(post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => {}}
                  onComment={() => {}}
                  onShare={handleSharePost}
                  onSave={() => {}}
                  onProfileClick={(profile) => setProfilePreview(profile)}
                  onVerifiedBadgeClick={(author) => setVerifiedBadgeAuthor(author)}
                  onAddComment={handleAddComment}
                  onAddReply={handleAddReply}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  currentUserName={currentUserName}
                  hasAccount={hasAccount}
                  language={lang}
                />
              )}
            />
          ) : (
            <>
              <main className="flex-1 min-w-0 max-w-2xl mx-auto space-y-6 pb-24 lg:pb-12">
                <PostComposer
                  placeholder={copy.composerPlaceholder}
                  textValue={composerText}
                  videoLinkValue={composerVideoLink}
                  imageUrls={composerImages}
                  attachment={composerAttachment}
                  jobBadge={composerJobBadge}
                  jobOfferFields={composerJobOfferFields}
                  onJobOfferFieldsChange={setComposerJobOfferFields}
                  positionRequiredFields={composerPositionRequiredFields}
                  onPositionRequiredFieldsChange={setComposerPositionRequiredFields}
                  onTextChange={setComposerText}
                  onVideoLinkChange={setComposerVideoLink}
                  onImageUrlsChange={setComposerImages}
                  onAttachmentChange={setComposerAttachment}
                  onJobBadgeChange={setComposerJobBadge}
                  onPost={handlePost}
                  postLabel={copy.postLabel}
                  videoLinkPlaceholder={copy.videoLinkPlaceholder}
                  language={lang}
                />
                <section id="section-news" className="scroll-mt-24 space-y-4">
                  <h2 className="sr-only">{isId ? 'Berita & Feed' : 'News & Feed'}</h2>
                  {feedFilter && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm text-stone-600">
                        {isId ? 'Menampilkan:' : 'Showing:'}
                        {' '}
                        {feedFilter === 'video' ? (isId ? 'Video' : 'Video') : feedFilter === 'news' ? (isId ? 'Berita' : 'News') : feedFilter === 'articles' ? (isId ? 'Artikel' : 'Articles') : feedFilter === 'jobs' ? (isId ? 'Lowongan' : 'Jobs') : (isId ? 'Jual/Beli' : 'Buy/Sell')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFeedFilter(null)}
                        className="text-sm font-medium text-amber-600 hover:text-amber-700"
                      >
                        {isId ? 'Tampilkan semua' : 'Show all'}
                      </button>
                    </div>
                  )}
                  {filteredDisplayPosts.map((post: FeedPost) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => {}}
                      onComment={() => {}}
                      onShare={handleSharePost}
                      onSave={() => {}}
                      onProfileClick={(profile) => setProfilePreview(profile)}
                      onVerifiedBadgeClick={(author) => setVerifiedBadgeAuthor(author)}
                      onAddComment={handleAddComment}
                      onAddReply={handleAddReply}
                      onEditPost={handleEditPost}
                      onDeletePost={handleDeletePost}
                      currentUserName={currentUserName}
                      hasAccount={hasAccount}
                      language={lang}
                    />
                  ))}
                </section>
                {feedFilter !== 'buy-sell' && (
                <section id="section-indastreet-news" className="scroll-mt-24">
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="px-4 pt-4 pb-2">
                      <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" />
                        {isId ? 'Berita' : 'News'}
                      </h2>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {isId ? 'Berita terbaru di IndaStreet' : 'Latest News On IndaStreet'}
                      </p>
                    </div>
                    <IndastreetNewsFeed
                      language={lang === 'id' ? 'id' : 'en'}
                      isLoggedIn={hasAccount}
                      userDisplayName={loggedInCustomer?.name ?? loggedInProvider?.name ?? ''}
                      userProfilePhoto={customerProfilePhoto || providerProfilePhoto}
                      userId={customerUserId || providerUserId}
                      hideSectionTitle
                      onProfileClick={(profile) => setProfilePreview(profile)}
                    />
                  </div>
                </section>
                )}
                {feedFilter !== 'buy-sell' && (
                <section id="section-articles" className="scroll-mt-24">
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="px-4 pt-4 pb-2">
                      <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        {isId ? 'Artikel' : 'Articles'}
                      </h2>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {isId ? 'Artikel terbaru di IndaStreet' : 'Latest Articles On IndaStreet'}
                      </p>
                    </div>
                    <BlogIndexContent
                      pageTitle="IndaStreet News"
                      heroImageUrl={NEWS_HERO_IMAGE}
                      heroSubtitle={heroVariant === 'news' ? copy.heroNewsSubtext : (isId ? 'Berita terbaru untuk pijat dan klinik kulit' : 'The latest massage and skin care news')}
                      hideHero
                      hideCategoryFilter
                      introText={copy.articlesIntroText}
                      language={lang === 'id' ? 'id' : 'en'}
                      onNavigate={onNavigate ? (page: string) => onNavigate(page as Page) : undefined}
                    />
                  </div>
                </section>
                )}
                {feedFilter !== 'buy-sell' && (
                <section id="section-video" className="scroll-mt-24">
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-stone-200 shadow-sm p-6">
                    <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                      <Play className="w-5 h-5 text-amber-600" />
                      {isId ? 'Video' : 'Video'}
                    </h2>
                    <p className="text-sm text-stone-500 mt-0.5 mb-2">
                      {isId ? 'Video terbaru di IndaStreet' : 'Latest Video On IndaStreet'}
                    </p>
                    <p className="text-stone-600 text-sm">{isId ? 'Konten video komunitas akan tampil di sini.' : 'Community video content will appear here.'}</p>
                  </div>
                </section>
                )}
                <BuySellSection
                  products={products}
                  onContact={handleContactProduct}
                  onInternationalInfo={() => setShowInternationalModal(true)}
                  onListProduct={() => setShowListProductModal(true)}
                  onAddReview={handleAddProductReview}
                  onViewSeller={(p) => setSelectedSellerProduct(p)}
                  canContactSeller={hasAccount}
                  language={lang}
                />
              </main>
            </>
          )}

          <RightSidebar
            trending={trendingTopics}
            suggestedProfessionals={suggestedProfessionals}
            featuredTreatments={featuredTreatments}
            onNavigate={handleNav}
            language={lang}
          />
        </div>
      </div>

      <ListProductModal
        isOpen={showListProductModal}
        onClose={() => setShowListProductModal(false)}
        onSubmit={handleListProductSubmit}
        language={lang}
      />
      <SellerProfileModal
        product={selectedSellerProduct}
        onClose={() => setSelectedSellerProduct(null)}
        onContact={handleContactProduct}
        canContactSeller={hasAccount}
        language={lang}
      />
      <SocialProfilePopup profile={profilePreview} onClose={() => setProfilePreview(null)} language={lang} />
      <VerifiedBadgePopup author={verifiedBadgeAuthor} onClose={() => setVerifiedBadgeAuthor(null)} language={lang} />
      <BottomNav items={leftNavItems} onNavigate={handleNav} active={copy.homeFeed} feedUnviewedCount={feedUnviewedCount} onFeedClick={scrollToFeedAndReset} />
      <FAB onClick={() => {}} />
    </div>
  );
};

export default IndonesiaLandingPage;
