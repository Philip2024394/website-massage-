/**
 * Indastreet News – Massage & skin clinic news and headlines.
 * Fetches from Appwrite collection indastreet_news; fallback to sample data so page always opens.
 * Each post: image, excerpt, full article (expand/collapse), like, share, comments.
 * When data is sourced from external news, use reworded body text for fresh grammar and SEO.
 */
import React, { useState, useEffect } from 'react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import { ThumbsUp, ThumbsDown, Share2, MessageCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Reply, Bell } from 'lucide-react';
import { listIndastreetNews, type IndastreetNewsItem } from '../lib/appwrite/services/indastreetNews.service';
import SocialSharePopup from '../components/modals/SocialSharePopup';

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
  authorId?: string;
  profileImageUrl?: string;
  text: string;
  date: string;
  dateTime: string;
  replies?: NewsComment[];
}

type NewsItem = IndastreetNewsItem;

const POSTS_PER_PAGE = 10;
const BASE_SUBSCRIBER_COUNT = 2752;
const NEWS_SUBSCRIBE_STORAGE_KEY = 'indastreet_news_subscribed';

const CATEGORY_LABELS: Record<NewsCategory, { en: string; id: string }> = {
  techniques: { en: 'New Techniques', id: 'Teknik Baru' },
  producers: { en: 'Producers & Therapists', id: 'Produsen & Terapis' },
  'places-opening': { en: 'Places Opening', id: 'Tempat Dibuka' },
  'places-closing': { en: 'Places Closing', id: 'Tempat Ditutup' },
  'good-news': { en: 'Good News', id: 'Berita Positif' },
  negative: { en: 'Industry News', id: 'Berita Industri' },
  headlines: { en: 'Headlines', id: 'Berita Utama' },
};

/** Sample news: 20 posts (2 pages × 10) – engaging reading for users and professionals. */
const SAMPLE_NEWS: NewsItem[] = [
  {
    id: '1',
    headline: 'Lymphatic drainage methods gain popularity in Asian spas and clinics',
    excerpt: 'Wellness centres and skin clinics across the region are rolling out updated lymphatic drainage protocols. Practitioners report strong interest from clients seeking recovery and general wellness.',
    date: 'Jan 14, 2026',
    category: 'techniques',
    body: 'Spas and skin clinics across Asia are increasingly adopting refined lymphatic drainage techniques, according to industry observers. The approach is designed to support circulation and recovery, and many therapists have integrated it into their treatment menus. Several training bodies have expanded their certification programmes to meet demand. Clinic owners say the technique fits well with existing facial and body treatments, and clients are responding positively. Experts suggest the trend will continue as wellness travel and local demand for professional treatments grow.',
  },
  {
    id: '2',
    headline: 'Wellness operator launches three new massage and facial sites',
    excerpt: 'A leading wellness brand has opened three new outlets, adding roles for massage therapists and skin clinic professionals in the area.',
    date: 'Jan 10, 2026',
    category: 'places-opening',
    body: 'A major wellness operator has confirmed the launch of three new locations, creating positions for massage therapists, aestheticians, and support staff. The new sites will offer massage, facials, and related treatments. Recruitment is underway for qualified therapists and clinic personnel. The company said the expansion reflects strong demand for in-person wellness services and a focus on convenient neighbourhood locations. Local industry associations have welcomed the move as a boost for employment in the sector.',
  },
  {
    id: '3',
    headline: 'International therapist certification widens to more markets',
    excerpt: 'A global certification body has extended its programme into additional countries, offering therapists and venues a common standard for training and quality.',
    date: 'Feb 2, 2026',
    category: 'producers',
    body: 'An international certification organisation has expanded its therapist and wellness programme into new regions. The move gives massage and skin care professionals a recognised credential that can be used across borders. Training partners in the new markets will deliver the curriculum and assessments. Industry figures say a shared standard helps clients identify qualified practitioners and supports career mobility for therapists. Venues that employ certified staff can use the credential in their marketing and quality assurance.',
  },
  {
    id: '4',
    headline: 'Skin clinic networks see strong uptake after summer season',
    excerpt: 'Bookings for facials and clinic treatments have risen as clients resume regular routines. The uptick is a positive signal for clinics and therapists.',
    date: 'Jan 28, 2026',
    category: 'good-news',
    body: 'Skin clinic groups are reporting a noticeable rise in bookings for facial and body treatments as clients return to post-summer routines. Demand is particularly strong for maintenance and corrective treatments. Clinic managers say the trend is encouraging after a quieter period and are adjusting staffing and schedules to meet it. Therapists and aestheticians in the network describe steady appointment books and growing interest in combined packages. Analysts point to sustained consumer focus on skin health and self-care as a driver for the sector.',
  },
  {
    id: '5',
    headline: 'Sector reacts to updated safety and hygiene guidelines for massage and spa',
    excerpt: 'New guidelines for massage and spa settings have been released. Venues are reviewing their practices, and industry bodies are providing guidance and support.',
    date: 'Jan 22, 2026',
    category: 'headlines',
    body: 'Updated safety and hygiene guidelines for massage and spa environments have been published by the relevant authorities. The document covers hygiene, equipment, and practitioner conduct. Many venues are reviewing their operations and training to align with the new standards. Industry associations are running briefings and sharing checklists to help members comply. Therapists and clinic owners say clarity on expectations is helpful, even if some adjustments are required. The guidelines are intended to protect both clients and staff and to maintain confidence in professional massage and spa services.',
  },
  {
    id: '6',
    headline: 'Hot stone and aromatherapy combine in new spa protocols',
    excerpt: 'Therapists are blending heated-stone placement with essential-oil selection to offer personalised relaxation and recovery sessions. Clients and venues report strong feedback.',
    date: 'Feb 8, 2026',
    category: 'techniques',
    body: 'A growing number of spas are offering combined hot stone and aromatherapy sessions, with therapists tailoring oil blends to each client’s preferences and goals. The pairing is designed to deepen relaxation and support muscle recovery. Training providers have added short courses on safe stone use and oil selection. Practitioners say the combination is especially popular with guests who want a single, premium treatment. Venue managers note that the add-on helps differentiate their offering and supports higher average spend per visit.',
  },
  {
    id: '7',
    headline: 'Career pathways for massage therapists: from entry level to senior roles',
    excerpt: 'A new report outlines how therapists can progress from initial certification to senior and specialist positions, with clear steps for continuing education and specialisation.',
    date: 'Jan 18, 2026',
    category: 'producers',
    body: 'A sector report has set out a structured career pathway for massage therapists, from first certification through to senior and specialist roles. The framework includes recommended continuing education, mentorship, and optional specialisations such as sports or clinical massage. Professional bodies say the clarity helps new entrants plan their development and gives employers a shared language for progression. Therapists who contributed to the report welcomed the focus on recognition and career growth, which they say supports retention and quality of care.',
  },
  {
    id: '8',
    headline: 'New day-spa and skin bar opens in city centre',
    excerpt: 'A combined day spa and skin bar has opened downtown, offering express facials, massage slots, and walk-in treatments aimed at busy professionals.',
    date: 'Feb 5, 2026',
    category: 'places-opening',
    body: 'A new day spa and skin bar has opened in the city centre, targeting office workers and visitors with express facials, short massage sessions, and walk-in availability. The concept focuses on convenient booking and 30- to 60-minute treatments. The team includes licensed aestheticians and massage therapists. The owner said the location and format were chosen to fit around lunch breaks and errands. Early feedback from clients has highlighted ease of booking and consistent results. Industry watchers see the model as part of a broader trend toward accessible, urban wellness offerings.',
  },
  {
    id: '9',
    headline: 'Demand for sports and recovery massage continues to rise',
    excerpt: 'Gyms, clinics, and independent therapists report increased requests for sports and recovery-focused massage. Clients cite fitness goals and injury prevention as key drivers.',
    date: 'Jan 30, 2026',
    category: 'good-news',
    body: 'Sports and recovery massage is in strong demand, according to gyms, clinics, and independent therapists. Clients are booking for injury prevention, post-workout recovery, and support for training goals. Many practitioners have added or expanded sports massage qualifications. Fitness centres are partnering with therapists to offer on-site or referred sessions. Professionals say the trend reflects greater awareness of recovery as part of training and a willingness to invest in preventive care. The uptick is seen as positive for both therapists and venues that offer recovery services.',
  },
  {
    id: '10',
    headline: 'Insurance and liability: what massage and spa businesses need to know',
    excerpt: 'A practical guide summarises insurance and liability considerations for massage and spa businesses, helping owners and sole traders protect themselves and their clients.',
    date: 'Feb 12, 2026',
    category: 'headlines',
    body: 'A new guide outlines insurance and liability basics for massage and spa businesses. It covers professional indemnity, public liability, and how to document consent and treatment notes. Legal and insurance experts stress the importance of adequate cover and clear client communication. Sole traders and small clinics are encouraged to review their policies as they scale or add services. Industry bodies have welcomed the resource and are signposting it in member communications. Practitioners say having clear guidance reduces uncertainty and supports confidence in running a compliant practice.',
  },
  // Page 2 (posts 11–20)
  {
    id: '11',
    headline: 'Deep tissue and myofascial release: when to refer and when to treat',
    excerpt: 'Practitioners and educators discuss how to integrate deep tissue and myofascial release safely, including when to refer clients to other health professionals.',
    date: 'Oct 12, 2025',
    category: 'techniques',
    body: 'Training providers and experienced therapists have published guidance on integrating deep tissue and myofascial release into practice. The material emphasises assessment, consent, and knowing when to refer clients to physiotherapy or medicine. Practitioners are encouraged to document sessions and to keep their skills updated through continuing education. The guidance is aimed at reducing risk and improving outcomes for clients with muscular or fascial concerns. Many clinics are using it as a basis for in-house protocols and therapist training.',
  },
  {
    id: '12',
    headline: 'Therapist spotlight: building a loyal client base as a mobile practitioner',
    excerpt: 'An experienced mobile therapist shares practical tips on scheduling, communication, and retention that have helped build a stable, repeat client list.',
    date: 'Oct 10, 2025',
    category: 'producers',
    body: 'In a recent interview, an experienced mobile massage therapist shared how she built a loyal client base over several years. Key points included consistent scheduling, clear communication before and after sessions, and simple loyalty touches such as follow-up messages. She also stressed the importance of reliability and professionalism when working in clients’ homes. New and aspiring mobile therapists can use the advice to plan their own approach to retention and growth. The feature is part of an ongoing series highlighting different career paths in the industry.',
  },
  {
    id: '13',
    headline: 'Boutique hotel adds in-room massage and facial menu',
    excerpt: 'A boutique hotel has introduced an in-room massage and facial menu, with treatments delivered by a partner network of verified therapists and aestheticians.',
    date: 'Oct 8, 2025',
    category: 'places-opening',
    body: 'A boutique hotel has launched an in-room wellness menu offering massage and facial treatments delivered in guest rooms. The service is provided through a partner network of verified therapists and aestheticians. Guests can book via the hotel app or concierge. The hotel said the offer was designed to meet demand for privacy and convenience without compromising on quality. Partner therapists report clear protocols for hygiene, setup, and timing. Industry observers see the model as a way for smaller properties to compete with larger spa facilities while supporting local practitioners.',
  },
  {
    id: '14',
    headline: 'Facial and skin treatments: what clients are asking for in 2025',
    excerpt: 'Skin clinics and aestheticians report a shift toward preventative, results-driven treatments and combined packages. Hydration and glow-focused facials remain popular.',
    date: 'Oct 5, 2025',
    category: 'good-news',
    body: 'Skin clinics and aestheticians are seeing a shift in what clients request: more focus on prevention, visible results, and combined packages. Hydration and glow-focused facials remain popular, alongside targeted treatments for specific concerns. Many clients are booking series rather than one-off sessions. Practitioners say consultation and aftercare advice are increasingly important for satisfaction and retention. The trend is seen as positive for clinics that invest in training and clear communication. Suppliers report growing interest in professional-grade products suited to these treatment patterns.',
  },
  {
    id: '15',
    headline: 'Industry standards for cleanliness and equipment in massage and spa',
    excerpt: 'A summary of recommended standards for cleanliness, laundry, and equipment in massage and spa settings, with input from practitioners and health authorities.',
    date: 'Oct 2, 2025',
    category: 'headlines',
    body: 'A summary document has been published outlining recommended standards for cleanliness, laundry, and equipment in massage and spa environments. It draws on input from practitioners, trade bodies, and health authorities. Topics include linens, surface cleaning, and equipment hygiene between clients. The aim is to give venues a clear reference and to support consistent practice across the sector. Many operators are using the summary to update their own checklists and staff training. Practitioners say having a single, accessible reference helps them stay compliant and reassure clients.',
  },
  {
    id: '16',
    headline: 'Pregnancy and postnatal massage: training and safety updates',
    excerpt: 'Updated training and safety guidance for pregnancy and postnatal massage is now available. Educators and therapists stress the importance of specialist training and clear consent.',
    date: 'Sep 28, 2025',
    category: 'techniques',
    body: 'Updated training and safety guidance for pregnancy and postnatal massage has been released by a leading education provider. The material covers positioning, pressure, and when to avoid or modify treatment. Specialists stress the need for dedicated training and clear consent and history-taking. Many therapists are adding or refreshing this qualification to meet client demand. Clinics that offer prenatal and postnatal massage report strong interest from expectant and new parents. The update is intended to support both practitioner confidence and client safety.',
  },
  {
    id: '17',
    headline: 'How to choose a massage or skin clinic: tips for clients',
    excerpt: 'A short guide helps clients choose a massage or skin clinic: what to look for in qualifications, hygiene, and communication, and how to book with confidence.',
    date: 'Sep 25, 2025',
    category: 'good-news',
    body: 'A consumer guide has been published to help people choose a massage or skin clinic with confidence. It suggests checking qualifications, hygiene practices, and how the venue communicates before and during treatment. Clients are encouraged to ask about experience, products, and aftercare. The guide is aimed at first-time and regular users alike. Practitioners and clinics have welcomed it as a way to set expectations and support informed choice. Industry bodies are promoting the guide as part of broader efforts to raise standards and trust.',
  },
  {
    id: '18',
    headline: 'Wellness tourism: how spas and clinics can attract international guests',
    excerpt: 'Experts share practical steps for spas and clinics to reach international visitors: language, booking channels, and packages that suit travellers.',
    date: 'Sep 22, 2025',
    category: 'headlines',
    body: 'Industry experts have outlined how spas and clinics can better attract international wellness tourists. Recommendations include offering information and consent forms in more than one language, listing on booking platforms used by travellers, and creating packages that fit typical trip lengths. Partnerships with hotels and tour operators can help drive visibility. Practitioners say that small changes, such as clear pricing and online booking, often make a big difference. The guidance is intended to support venues in regions where tourism is a key part of the local economy.',
  },
  {
    id: '19',
    headline: 'Reflexology and stress relief: demand and training options',
    excerpt: 'Reflexology is seeing renewed interest as clients look for stress relief and holistic options. Training bodies report steady enrolment on accredited courses.',
    date: 'Sep 20, 2025',
    category: 'techniques',
    body: 'Reflexology is experiencing renewed interest as clients seek stress relief and holistic approaches to wellness. Training bodies report steady enrolment on accredited reflexology courses, with many students already working in massage or beauty. Practitioners say the modality complements other treatments and fits well into spa and clinic menus. Clients often book reflexology for relaxation and general wellbeing. Educators emphasise the importance of thorough training and adherence to scope of practice. The trend is seen as part of a broader appetite for evidence-informed complementary therapies.',
  },
  {
    id: '20',
    headline: 'Salon and clinic partnerships: how massage and skin professionals collaborate',
    excerpt: 'Salons and clinics are increasingly partnering to offer combined massage and skin services. We look at how these partnerships work and what they mean for clients and practitioners.',
    date: 'Sep 18, 2025',
    category: 'producers',
    body: 'Partnerships between salons, skin clinics, and massage practitioners are becoming more common. Arrangements range from shared premises to referral agreements and joint packages. The goal is often to offer clients a fuller wellness experience and to share resources. Practitioners involved say clear agreements on referrals, branding, and revenue help partnerships succeed. Clients benefit from one-stop booking and coordinated care. Industry commentators see the trend as a way for smaller businesses to compete with larger integrated venues while maintaining professional independence.',
  },
];

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

const IndastreetNewsPage: React.FC<IndastreetNewsPageProps> = ({
  onNavigate,
  onLanguageChange,
  language = 'en',
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>(SAMPLE_NEWS);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, NewsComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [commentDislikes, setCommentDislikes] = useState<Record<string, number>>({});
  const [userCommentLike, setUserCommentLike] = useState<Record<string, boolean>>({});
  const [userCommentDislike, setUserCommentDislike] = useState<Record<string, boolean>>({});
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [postToShare, setPostToShare] = useState<NewsItem | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [userSubscribed, setUserSubscribed] = useState(false);
  const [showSubscribeLoginPrompt, setShowSubscribeLoginPrompt] = useState(false);

  const isLoggedIn = !!loggedInCustomer;
  const userDisplayName = loggedInCustomer?.name || loggedInCustomer?.username || '';
  const userProfilePhoto = loggedInCustomer?.profilePhoto || '';
  const userId = loggedInCustomer?.$id || '';

  const subscriberCount = BASE_SUBSCRIBER_COUNT + (userSubscribed ? 1 : 0);

  const handleSubscribeClick = () => {
    if (!isLoggedIn) {
      setShowSubscribeLoginPrompt(true);
      return;
    }
    setUserSubscribed(true);
    try {
      localStorage.setItem(`${NEWS_SUBSCRIBE_STORAGE_KEY}_${userId}`, 'true');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;
    listIndastreetNews(50)
      .then((list) => {
        if (!cancelled) {
          setNewsItems(list.length > 0 ? (list as NewsItem[]) : SAMPLE_NEWS);
          setCurrentPage(1);
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

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`${NEWS_SUBSCRIBE_STORAGE_KEY}_${userId}`);
      setUserSubscribed(stored === 'true');
    } catch {
      // ignore
    }
  }, [userId]);

  const handleLike = (postId: string) => {
    setLiked((prev) => {
      const isLiked = !prev[postId];
      setLikes((l) => ({ ...l, [postId]: (l[postId] || 0) + (isLiked ? 1 : -1) }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = (item: NewsItem) => {
    setPostToShare(item);
    setShowSharePopup(true);
  };

  const shareUrlForPost = (item: NewsItem) => {
    const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    return `${base}#post-${item.id}`;
  };

  const handleAddComment = (postId: string) => {
    if (!isLoggedIn) return;
    const text = (newComment[postId] || '').trim();
    if (!text) return;
    const now = new Date();
    const comment: NewsComment = {
      id: `c-${Date.now()}-${postId}`,
      authorName: userDisplayName || 'User',
      authorId: userId || undefined,
      profileImageUrl: userProfilePhoto || undefined,
      text,
      date: now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateTime: now.toLocaleString(language === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      replies: [],
    };
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
    setNewComment((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCommentLike = (commentId: string) => {
    setUserCommentLike((prev) => {
      const next = !prev[commentId];
      setCommentLikes((l) => ({ ...l, [commentId]: (l[commentId] || 0) + (next ? 1 : -1) }));
      return { ...prev, [commentId]: next };
    });
    if (userCommentDislike[commentId]) {
      setUserCommentDislike((prev) => ({ ...prev, [commentId]: false }));
      setCommentDislikes((d) => ({ ...d, [commentId]: Math.max(0, (d[commentId] || 0) - 1) }));
    }
  };

  const handleCommentDislike = (commentId: string) => {
    setUserCommentDislike((prev) => {
      const next = !prev[commentId];
      setCommentDislikes((d) => ({ ...d, [commentId]: (d[commentId] || 0) + (next ? 1 : -1) }));
      return { ...prev, [commentId]: next };
    });
    if (userCommentLike[commentId]) {
      setUserCommentLike((prev) => ({ ...prev, [commentId]: false }));
      setCommentLikes((l) => ({ ...l, [commentId]: Math.max(0, (l[commentId] || 0) - 1) }));
    }
  };

  const addReply = (postId: string, parentCommentId: string) => {
    if (!isLoggedIn) return;
    const text = (replyDraft[parentCommentId] || '').trim();
    if (!text) return;
    const now = new Date();
    const reply: NewsComment = {
      id: `r-${Date.now()}-${parentCommentId}`,
      authorName: userDisplayName || 'User',
      authorId: userId || undefined,
      profileImageUrl: userProfilePhoto || undefined,
      text,
      date: now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateTime: now.toLocaleString(language === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      replies: [],
    };
    setComments((prev) => {
      const list = prev[postId] || [];
      const addToReplies = (comments: NewsComment[]): NewsComment[] =>
        comments.map((c) =>
          c.id === parentCommentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : { ...c, replies: c.replies ? addToReplies(c.replies) : [] }
        );
      return { ...prev, [postId]: addToReplies(list) };
    });
    setReplyDraft((prev) => ({ ...prev, [parentCommentId]: '' }));
    setReplyToId(null);
  };

  const isId = language === 'id';

  const totalPages = Math.max(1, Math.ceil(newsItems.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedItems = newsItems.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderComment = (c: NewsComment, postId: string, isReply: boolean) => {
    const likeCount = commentLikes[c.id] ?? 0;
    const dislikeCount = commentDislikes[c.id] ?? 0;
    const isLikedC = userCommentLike[c.id] ?? false;
    const isDislikedC = userCommentDislike[c.id] ?? false;
    const showReplyInput = replyToId === c.id;
    const draft = replyDraft[c.id] || '';
    return (
      <div className={isReply ? 'ml-8 sm:ml-10 mt-3 pl-3 border-l-2 border-gray-200' : ''}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {c.profileImageUrl ? (
              <img src={c.profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 font-semibold text-sm">{c.authorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{c.authorName}</p>
              <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
              <p className="text-xs text-gray-500 mt-1">{c.dateTime || c.date}</p>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleCommentLike(c.id)}
                className={`flex items-center gap-1 text-xs font-medium rounded px-2 py-1 transition-colors ${
                  isLikedC ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${isLikedC ? 'fill-current' : ''}`} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
              <button
                type="button"
                onClick={() => handleCommentDislike(c.id)}
                className={`flex items-center gap-1 text-xs font-medium rounded px-2 py-1 transition-colors ${
                  isDislikedC ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${isDislikedC ? 'fill-current' : ''}`} />
                {dislikeCount > 0 && <span>{dislikeCount}</span>}
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setReplyToId((prev) => (prev === c.id ? null : c.id))}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-orange-600 rounded px-2 py-1"
                >
                  <Reply className="w-3.5 h-3.5" />
                  {isId ? 'Balas' : 'Reply'}
                </button>
              )}
            </div>
            {showReplyInput && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setReplyDraft((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder={isId ? 'Tulis balasan...' : 'Write a reply...'}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => addReply(postId, c.id)}
                  className="px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
                >
                  {isId ? 'Kirim' : 'Send'}
                </button>
              </div>
            )}
            {c.replies && c.replies.length > 0 && (
              <ul className="space-y-3 mt-3">
                {c.replies.map((r) => (
                  <li key={r.id}>{renderComment(r, postId, true)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              : 'The latest massage and skin care news — new techniques, producers, places opening and closing, latest industry news.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">
              {subscriberCount.toLocaleString()} {isId ? 'pelanggan' : 'subscribers'}
            </span>
            {userSubscribed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-800" title={isId ? 'Postingan baru akan muncul di dashboard Anda.' : 'New posts will appear in your dashboard.'}>
                <Bell className="w-3.5 h-3.5 fill-current" />
                {isId ? 'Berlangganan' : 'Subscribed'}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSubscribeClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                {isId ? 'Berlangganan' : 'Subscribe'}
              </button>
            )}
          </div>
          {showSubscribeLoginPrompt && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800 mb-2">
                {isId ? 'Masuk atau buat akun untuk berlangganan berita baru.' : 'Log in or create an account to subscribe to new posts.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setShowSubscribeLoginPrompt(false); onNavigate?.('home'); }}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600"
                >
                  {isId ? 'Masuk' : 'Log in'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSubscribeLoginPrompt(false); onNavigate?.('role-selection'); }}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-100"
                >
                  {isId ? 'Buat akun' : 'Create account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubscribeLoginPrompt(false)}
                  className="px-3 py-1.5 text-amber-700 text-xs font-medium"
                >
                  {isId ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* News feed */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
        {loading && (
          <p className="text-center text-gray-500 py-8">{isId ? 'Memuat berita...' : 'Loading news...'}</p>
        )}
        <ul className="space-y-6">
          {paginatedItems.map((item) => {
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

                  {/* Full article – expand / collapse */}
                  {item.body && (
                    <div className="mt-3">
                      {expandedId === item.id ? (
                        <>
                          <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line border-l-2 border-orange-200 pl-4 py-2">
                            {item.body}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="mt-3 flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm"
                          >
                            <ChevronUp className="w-4 h-4" />
                            {isId ? 'Tampilkan lebih sedikit' : 'Show less'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setExpandedId(item.id)}
                          className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          <ChevronDown className="w-4 h-4" />
                          {isId ? 'Baca artikel lengkap' : 'Read full story'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Like, Share, Comment counts */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isLiked ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                      <span className="sr-only">{isId ? 'Suka' : 'Like'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      {isId ? 'Bagikan' : 'Share'}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {postComments.length} {postComments.length === 1 ? (isId ? 'komentar' : 'comment') : (isId ? 'komentar' : 'comments')}
                    </span>
                  </div>

                  {/* Comments section – login required to post; profile + date/time; like, dislike, reply */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      {isId ? 'Komentar' : 'Comments'}
                    </h3>
                    <ul className="space-y-4 mb-4">
                      {postComments.map((c) => (
                        <li key={c.id}>
                          {renderComment(c, item.id, false)}
                        </li>
                      ))}
                    </ul>
                    {!isLoggedIn ? (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          {isId ? 'Masuk atau buat akun untuk mengirim komentar.' : 'Log in or create an account to post a comment.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate?.('home')}
                            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
                          >
                            {isId ? 'Masuk' : 'Log in'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate?.('role-selection')}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50"
                          >
                            {isId ? 'Buat akun' : 'Create account'}
                          </button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pagination – below last post */}
        {!loading && totalPages > 1 && (
          <nav
            className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-center gap-3"
            aria-label={isId ? 'Navigasi halaman' : 'Page navigation'}
          >
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              aria-label={isId ? 'Halaman sebelumnya' : 'Previous page'}
            >
              <ChevronLeft className="w-5 h-5" />
              {isId ? 'Sebelumnya' : 'Previous'}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`min-w-[2.5rem] h-10 rounded-xl text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  aria-label={isId ? `Halaman ${page}` : `Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              aria-label={isId ? 'Halaman berikutnya' : 'Next page'}
            >
              {isId ? 'Selanjutnya' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        )}
      </div>

      {/* Share popup – social media and copy link */}
      {showSharePopup && postToShare && (
        <SocialSharePopup
          isOpen={showSharePopup}
          onClose={() => {
            setShowSharePopup(false);
            setPostToShare(null);
          }}
          title={postToShare.headline}
          description={postToShare.excerpt}
          url={shareUrlForPost(postToShare)}
          type="place"
          headerTitle={isId ? 'Bagikan artikel' : 'Share this article'}
        />
      )}
    </div>
  );
};

export default IndastreetNewsPage;
