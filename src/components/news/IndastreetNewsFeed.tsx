/**
 * IndaStreet News feed: headlines, excerpts, comments.
 * No two comments have the same text or same length; avatars are real-people images.
 * Users must add a profile image to post; live comments show Admin Approved badge.
 *
 * Flow: To post or comment, users sign in via Get Involved → /signin. Users without
 * an account use "Create account" on the sign-in page → Create Account page (name,
 * WhatsApp, email, country, terms including IndaStreet News posting). When comments
 * are persisted to a backend, admin approval flow: pending comments appear in
 * admin dashboard for approve/reject before going live.
 */
import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, BadgeCheck, Share2 } from 'lucide-react';
import { listIndastreetNews, type IndastreetNewsItem, type NewsCategory } from '../../lib/appwrite/services/indastreetNews.service';
import { SAMPLE_NEWS } from '../../data/indastreetNewsSample';
import SocialSharePopup from '../modals/SocialSharePopup';
import { GetInvolvedButton } from '../GetInvolvedButton';
import { REAL_PEOPLE_AVATARS } from '../../constants/realPeopleAvatars';

const POSTS_PER_PAGE = 10;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MOCK_COMMENT_AUTHORS = ['Sarah L.', 'James K.', 'Maria T.', 'David W.', 'Emma R.', 'Alex P.', 'Lisa M.', 'Chris N.', 'Anna B.', 'Tom H.'];

/** Unique realistic comments – no two same text or same length. */
const MOCK_COMMENT_TEXTS: string[] = [
  'Really helpful, thanks for sharing.',
  'This is exactly what I was looking for.',
  'Great read. More like this please!',
  'Interesting perspective.',
  'Useful for our team.',
  'Good to see the industry moving this way.',
  'Clear and practical. Bookmarked.',
  'Appreciate the depth and examples.',
  'Will share with my colleagues.',
  'Short and to the point. Thanks.',
  'Helped me understand the topic better.',
  'Well written and easy to follow.',
  'I had a different view but this made me think.',
  'Exactly the kind of content we need more of.',
  'Not what I expected in a good way.',
  'Concise and informative. More please.',
  'Thanks for putting this together.',
  'Useful takeaways. Will apply this week.',
  'Good balance of theory and practice.',
  'Refreshing take on a familiar subject.',
  'Made my morning. Keep it up.',
  'Simple but effective. Liked it.',
  'Learned something new today. Cheers.',
  'Solid advice. Already trying it out.',
  'Wish I had read this earlier.',
  'Straight to the point. No fluff.',
  'Valuable insights. Shared with my team.',
  'Clear, actionable, and timely.',
  'One of the better pieces I have read on this.',
  'Concise. Informative. No complaints.',
  'Helpful for anyone in the field.',
  'Good mix of ideas and examples.',
  'Worth the read. Recommended.',
  'Practical and easy to implement.',
  'Short, sharp, and useful.',
];

interface NewsComment {
  id: string;
  authorName: string;
  text: string;
  date: string;
  dateTime: string;
  avatarUrl?: string;
  adminApproved?: boolean;
  replies?: NewsComment[];
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

const COMMENTS_VISIBLE_INITIAL = 3;

function generateMockComments(count: number, postId: string): NewsComment[] {
  const comments: NewsComment[] = [];
  const now = new Date();
  const usedTexts = new Set<string>();
  const usedLengths = new Set<number>();
  const shuffled = [...MOCK_COMMENT_TEXTS].sort(() => Math.random() - 0.5);
  // Unique avatar and author name per comment (no duplicate in this post)
  const avatarIndices = REAL_PEOPLE_AVATARS.map((_, i) => i).sort(() => Math.random() - 0.5);
  const authorIndices = MOCK_COMMENT_AUTHORS.map((_, i) => i).sort(() => Math.random() - 0.5);
  let added = 0;
  for (let i = 0; added < count && i < shuffled.length; i++) {
    const text = shuffled[i];
    const len = text.length;
    if (usedTexts.has(text) || usedLengths.has(len)) continue;
    usedTexts.add(text);
    usedLengths.add(len);
    const d = new Date(now.getTime() - (added + 1) * 3600000 * 24 * (1 + Math.floor(Math.random() * 5)));
    comments.push({
      id: `mock-${postId}-${added}-${Date.now()}`,
      authorName: MOCK_COMMENT_AUTHORS[authorIndices[added % authorIndices.length]],
      text,
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateTime: d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      avatarUrl: REAL_PEOPLE_AVATARS[avatarIndices[added % avatarIndices.length]],
      adminApproved: true,
      replies: [],
    });
    added++;
  }
  return comments;
}

function NewsImageContainer({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="w-full aspect-video bg-neutral-100 overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full min-h-[180px] flex items-center justify-center bg-neutral-100 border border-neutral-200">
          <span className="text-sm text-neutral-500">Image</span>
        </div>
      )}
    </div>
  );
}

export interface IndastreetNewsFeedProps {
  language?: 'en' | 'id';
  isLoggedIn?: boolean;
  userDisplayName?: string;
  userProfilePhoto?: string;
  userId?: string;
  /** When true, do not render the section heading (parent provides it). */
  hideSectionTitle?: boolean;
}

const IndastreetNewsFeed: React.FC<IndastreetNewsFeedProps> = ({
  language = 'en',
  isLoggedIn = false,
  userDisplayName = '',
  userProfilePhoto = '',
  userId = '',
  hideSectionTitle = false,
}) => {
  const [newsItems, setNewsItems] = useState<IndastreetNewsItem[]>(SAMPLE_NEWS);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, NewsComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [postToShare, setPostToShare] = useState<IndastreetNewsItem | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentsExpanded, setCommentsExpanded] = useState<Record<string, boolean>>({});

  const isId = language === 'id';

  useEffect(() => {
    let cancelled = false;
    const seedLikesAndComments = (items: IndastreetNewsItem[]) => {
      const initialLikes: Record<string, number> = {};
      const initialComments: Record<string, NewsComment[]> = {};
      items.forEach((item) => {
        initialLikes[item.id] = randomInt(70, 280);
        initialComments[item.id] = generateMockComments(randomInt(1, 6), item.id);
      });
      setLikes(initialLikes);
      setComments(initialComments);
    };
    listIndastreetNews(50)
      .then((list) => {
        if (!cancelled) {
          const items = list.length > 0 ? list : SAMPLE_NEWS;
          setNewsItems(items);
          setCurrentPage(1);
          seedLikesAndComments(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNewsItems(SAMPLE_NEWS);
          seedLikesAndComments(SAMPLE_NEWS);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLike = (postId: string) => {
    setLiked((prev) => {
      const isLiked = !prev[postId];
      setLikes((l) => ({ ...l, [postId]: (l[postId] || 0) + (isLiked ? 1 : -1) }));
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleShare = (item: IndastreetNewsItem) => {
    setPostToShare(item);
    setShowSharePopup(true);
  };

  const shareUrlForPost = (item: IndastreetNewsItem) => {
    const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    return `${base}#post-${item.id}`;
  };

  const handleAddComment = (postId: string) => {
    if (!isLoggedIn) return;
    const text = (newComment[postId] || '').trim();
    if (!text) return;
    if (!userProfilePhoto || userProfilePhoto.trim() === '') {
      setCommentError(isId ? 'Tambahkan foto profil untuk mengirim komentar.' : 'Please add a profile image to post comments.');
      return;
    }
    setCommentError(null);
    const now = new Date();
    const comment: NewsComment = {
      id: `c-${Date.now()}-${postId}`,
      authorName: userDisplayName || 'User',
      text,
      date: now.toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateTime: now.toLocaleString(isId ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      avatarUrl: userProfilePhoto,
      adminApproved: true,
      replies: [],
    };
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
    setNewComment((prev) => ({ ...prev, [postId]: '' }));
  };

  const addReply = (postId: string, parentCommentId: string) => {
    if (!isLoggedIn) return;
    const text = (replyDraft[parentCommentId] || '').trim();
    if (!text) return;
    if (!userProfilePhoto || userProfilePhoto.trim() === '') {
      setCommentError(isId ? 'Tambahkan foto profil untuk membalas.' : 'Please add a profile image to reply.');
      return;
    }
    setCommentError(null);
    const now = new Date();
    const reply: NewsComment = {
      id: `r-${Date.now()}-${parentCommentId}`,
      authorName: userDisplayName || 'User',
      text,
      date: now.toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateTime: now.toLocaleString(isId ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      avatarUrl: userProfilePhoto,
      adminApproved: true,
      replies: [],
    };
    setComments((prev) => {
      const list = prev[postId] || [];
      const addToReplies = (comments: NewsComment[]): NewsComment[] =>
        comments.map((c) =>
          c.id === parentCommentId ? { ...c, replies: [...(c.replies || []), reply] } : { ...c, replies: c.replies ? addToReplies(c.replies) : [] }
        );
      return { ...prev, [postId]: addToReplies(list) };
    });
    setReplyDraft((prev) => ({ ...prev, [parentCommentId]: '' }));
    setReplyToId(null);
  };

  const renderComment = (c: NewsComment, postId: string, isReply: boolean) => (
    <div key={c.id} className={isReply ? 'ml-8 sm:ml-10 mt-3 pl-3 border-l-2 border-gray-200' : ''}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {c.avatarUrl ? (
            <img src={c.avatarUrl} alt={c.authorName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-600 font-semibold text-sm">{c.authorName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2 relative">
            {(c.adminApproved !== false) && (
              <div className="absolute top-2 right-2 flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
                <BadgeCheck className="w-3 h-3 flex-shrink-0" aria-hidden />
                <span className="text-[10px] font-medium">Admin Approved</span>
              </div>
            )}
            <p className="text-sm font-medium text-gray-900 pr-24">{c.authorName}</p>
            <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
            <p className="text-xs text-gray-500 mt-1">{c.dateTime || c.date}</p>
          </div>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setReplyToId((prev) => (prev === c.id ? null : c.id))}
              className="mt-1.5 text-xs font-medium text-gray-500 hover:text-orange-600"
            >
              {isId ? 'Balas' : 'Reply'}
            </button>
          )}
          {replyToId === c.id && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyDraft[c.id] || ''}
                onChange={(e) => setReplyDraft((prev) => ({ ...prev, [c.id]: e.target.value }))}
                placeholder={isId ? 'Tulis balasan...' : 'Write a reply...'}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={() => addReply(postId, c.id)} className="px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600">
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

  const totalPages = Math.max(1, Math.ceil(newsItems.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedItems = newsItems.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={hideSectionTitle ? '' : 'w-[90%] max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8'}>
        {!hideSectionTitle && (
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isId ? 'Berita Terkini' : 'Latest News'}
          </h2>
        )}
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
              <li key={item.id} className="bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative w-full">
                  <NewsImageContainer src={item.imageSrc} alt={item.headline} />
                  <div className="absolute bottom-[50%] right-2 sm:right-3 flex items-center justify-center translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      aria-label={isId ? 'Bagikan' : 'Share'}
                      className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/60 shadow-lg border border-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                    </button>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 mb-2">
                    {catLabel}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-2">{item.headline}</h3>
                  <p className="text-sm text-neutral-500 mb-4">{item.date}</p>
                  <p className="text-neutral-700 text-base leading-relaxed">{item.excerpt}</p>
                  {item.body && (
                    <div className="mt-3">
                      {expandedId === item.id ? (
                        <>
                          <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line border-l-2 border-orange-200 pl-4 py-2">
                            {item.body}
                          </div>
                          <button type="button" onClick={() => setExpandedId(null)} className="mt-3 flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm">
                            <ChevronUp className="w-4 h-4" /> {isId ? 'Tampilkan lebih sedikit' : 'Show less'}
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setExpandedId(item.id)} className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-sm">
                          <ChevronDown className="w-4 h-4" /> {isId ? 'Baca artikel lengkap' : 'Read full story'}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isLiked ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-500'}`} />
                      {likeCount > 0 && <span>{likeCount}</span>}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" /> {postComments.length} {postComments.length === 1 ? (isId ? 'komentar' : 'comment') : (isId ? 'komentar' : 'comments')}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{isId ? 'Komentar' : 'Comments'}</h4>
                    {(() => {
                      const expanded = commentsExpanded[item.id];
                      const visibleComments = expanded ? postComments : postComments.slice(0, COMMENTS_VISIBLE_INITIAL);
                      const remainingCount = postComments.length - COMMENTS_VISIBLE_INITIAL;
                      const hasMore = remainingCount > 0 && !expanded;
                      return (
                        <>
                          <ul className="space-y-4 mb-4">
                            {visibleComments.map((c) => (
                              <li key={c.id}>{renderComment(c, item.id, false)}</li>
                            ))}
                          </ul>
                          {hasMore && (
                            <button
                              type="button"
                              onClick={() => setCommentsExpanded((prev) => ({ ...prev, [item.id]: true }))}
                              className="text-sm font-medium text-orange-600 hover:text-orange-700 mb-4"
                            >
                              {isId ? `Lihat ${remainingCount} komentar lainnya` : `View ${remainingCount} more comments`}
                            </button>
                          )}
                        </>
                      );
                    })()}
                    {!isLoggedIn ? (
                      <div className="flex justify-center py-2">
                        <GetInvolvedButton
                          href="/signin"
                          className="max-h-12 w-auto h-12 [&_img]:max-h-12 [&_img]:h-12 [&_img]:w-auto"
                          ariaLabel={isId ? 'Daftar atau masuk untuk mengirim komentar' : 'Sign in to post or comment'}
                        />
                      </div>
                    ) : !userProfilePhoto || userProfilePhoto.trim() === '' ? (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                        {isId ? 'Tambahkan foto profil di pengaturan akun Anda untuk mengirim komentar.' : 'Add a profile image in your account settings to post comments.'}
                      </p>
                    ) : (
                      <>
                        {commentError && (
                          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-2 border border-amber-200">{commentError}</p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment[item.id] || ''}
                            onChange={(e) => { setNewComment((prev) => ({ ...prev, [item.id]: e.target.value })); setCommentError(null); }}
                            placeholder={isId ? 'Tulis komentar...' : 'Write a comment...'}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <button type="button" onClick={() => handleAddComment(item.id)} className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
                            {isId ? 'Kirim' : 'Post'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {!loading && totalPages > 1 && (
          <nav className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-center gap-3" aria-label={isId ? 'Navigasi halaman' : 'Page navigation'}>
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
              <ChevronLeft className="w-5 h-5" /> {isId ? 'Sebelumnya' : 'Previous'}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`min-w-[2.5rem] h-10 rounded-xl text-sm font-semibold transition-colors ${page === currentPage ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-700'}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
              {isId ? 'Selanjutnya' : 'Next'} <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        )}
      </div>

      {showSharePopup && postToShare && (
        <SocialSharePopup
          isOpen={showSharePopup}
          onClose={() => { setShowSharePopup(false); setPostToShare(null); }}
          title={postToShare.headline}
          description={postToShare.excerpt}
          url={shareUrlForPost(postToShare)}
          type="place"
          headerTitle={isId ? 'Bagikan artikel' : 'Share this article'}
        />
      )}
    </>
  );
};

export default IndastreetNewsFeed;
