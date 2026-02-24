/**
 * ELITE Floating Action Buttons – WhatsApp Quick Chat & Like.
 * Like: adds the place to the social feed as "getting attention". Amber + white heart, floating hearts.
 */

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { addEliteLikeEvent, removeEliteLikeEvent } from '../utils/eliteLikeFeedStorage';

/* Scoped keyframes so floating hearts always work (no Tailwind purge risk) */
const floatHeartStyles = `
  @keyframes elite-float-heart {
    0% { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 0.95; }
    100% { transform: translate(-50%, -50%) translateY(-52px) scale(0.4); opacity: 0; }
  }
  .elite-float-heart {
    animation: elite-float-heart 2.2s ease-out infinite;
  }
`;

export interface EliteFloatingActionsProps {
  placeId: string;
  placeName: string;
  whatsappNumber?: string;
  language?: string;
  /** Optional image URL for the place (used when posting to social feed). */
  placeImageUrl?: string;
  /** Optional rich data for premium like-post on social feed & share text */
  description?: string;
  location?: string;
  starRating?: number;
  reviewCount?: number;
  bookedThisMonth?: number;
  onSaveToggle?: (isSaved: boolean) => void;
}

const LIKES_STORAGE_KEY = 'elite_spa_likes';

function getLikes(): string[] {
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLikes(likes: string[]) {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
  } catch {}
}

export default function EliteFloatingActions({
  placeId,
  placeName,
  whatsappNumber,
  language = 'id',
  placeImageUrl,
  description,
  location,
  starRating,
  reviewCount,
  bookedThisMonth,
  onSaveToggle,
}: EliteFloatingActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showLikedToast, setShowLikedToast] = useState(false);
  const [likedToastAddedToFeed, setLikedToastAddedToFeed] = useState(true);
  const isId = language === 'id';

  useEffect(() => {
    const likes = getLikes();
    setIsLiked(likes.includes(placeId));
  }, [placeId]);

  const handleLikeToggle = () => {
    const likes = getLikes();
    let newLikes: string[];
    let newLikedState: boolean;

    if (likes.includes(placeId)) {
      newLikes = likes.filter((id) => id !== placeId);
      newLikedState = false;
      removeEliteLikeEvent(placeId);
    } else {
      newLikes = [...likes, placeId];
      newLikedState = true;
      const addedToFeed = addEliteLikeEvent({
        placeId,
        placeName,
        placeImageUrl,
        description,
        location,
        starRating,
        reviewCount,
        bookedThisMonth,
      });
      setShowLikedToast(true);
      setLikedToastAddedToFeed(addedToFeed);
      setTimeout(() => setShowLikedToast(false), 2000);
    }

    saveLikes(newLikes);
    setIsLiked(newLikedState);
    onSaveToggle?.(newLikedState);
  };

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) return;
    const cleanNumber = whatsappNumber.replace(/\D/g, '').replace(/^0/, '62');
    const message = isId
      ? `Halo, saya tertarik dengan ${placeName}. Boleh info lebih lanjut?`
      : `Hi, I'm interested in ${placeName}. Can I get more info?`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: floatHeartStyles }} />
      {/* Floating buttons container - fixed bottom right */}
      <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3 overflow-visible">
        {/* Like – amber infill, white heart, floating hearts; posts to social feed when liked */}
        <div className="relative w-12 h-12 overflow-visible">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 bg-amber-500 hover:bg-amber-600 text-white overflow-visible"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className="w-5 h-5 flex-shrink-0 fill-white text-white" />
          </button>
          {/* Floating hearts – on top so visible, emanating from button */}
          <span
            className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center"
            style={{ zIndex: 10 }}
            aria-hidden
          >
            {[
              { delay: 0, x: 0 },
              { delay: 350, x: -8 },
              { delay: 700, x: 8 },
              { delay: 175, x: -4 },
              { delay: 525, x: 4 },
            ].map(({ delay, x }, i) => (
              <Heart
                key={i}
                className="elite-float-heart w-3 h-3 text-white fill-white absolute"
                style={{
                  animationDelay: `${delay}ms`,
                  left: `calc(50% + ${x}px)`,
                  top: '50%',
                }}
              />
            ))}
          </span>
        </div>

        {/* WhatsApp Quick Chat */}
        {whatsappNumber && (
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all"
            aria-label="WhatsApp Quick Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Liked toast – post is live on social feed (or already posted in last hour) */}
      {showLikedToast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
          {likedToastAddedToFeed
            ? (isId ? 'Disukai — muncul di feed sosial' : 'Liked — now on the social feed')
            : (isId ? 'Disukai — satu posting per jam untuk tempat ini' : 'Liked — one post per hour for this place')}
        </div>
      )}
    </>
  );
}
