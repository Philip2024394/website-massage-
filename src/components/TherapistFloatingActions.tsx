/**
 * Therapist profile floating actions – WhatsApp & Like.
 * Same system as massage city places (EliteFloatingActions): Like adds to social feed, WhatsApp uses booking number (admin or therapist).
 */

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { addTherapistLikeEvent, removeTherapistLikeEvent } from '../utils/eliteLikeFeedStorage';
import { getBookingWhatsAppNumber, buildWhatsAppUrl } from '../utils/whatsappBookingMessages';
import { APP_CONSTANTS } from '../constants/appConstants';
import type { Therapist } from '../types';

const LIKES_STORAGE_KEY = 'elite_therapist_likes';

function getTherapistLikes(): string[] {
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTherapistLikes(ids: string[]) {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

const floatHeartStyles = `
  @keyframes therapist-float-heart {
    0% { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 0.95; }
    100% { transform: translate(-50%, -50%) translateY(-52px) scale(0.4); opacity: 0; }
  }
  .therapist-float-heart {
    animation: therapist-float-heart 2.2s ease-out infinite;
  }
`;

export interface TherapistFloatingActionsProps {
  therapist: Therapist | null;
  language?: string;
  onSaveToggle?: (isLiked: boolean) => void;
}

export default function TherapistFloatingActions({
  therapist,
  language = 'id',
  onSaveToggle,
}: TherapistFloatingActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showLikedToast, setShowLikedToast] = useState(false);
  const [likedToastAddedToFeed, setLikedToastAddedToFeed] = useState(true);
  const isId = language === 'id';

  const therapistId = therapist ? String(therapist.$id || therapist.id || '') : '';
  const therapistName = therapist?.name || '';
  const therapistImageUrl =
    (therapist as any)?.mainImage ||
    (therapist as any)?.profileImageUrl ||
    (therapist as any)?.profilePicture ||
    undefined;
  const location = therapist?.location;
  const rating = (therapist as any)?.rating;
  const reviewCount = (therapist as any)?.reviewCount;

  useEffect(() => {
    if (!therapistId) return;
    const likes = getTherapistLikes();
    setIsLiked(likes.includes(therapistId));
  }, [therapistId]);

  const handleLikeToggle = () => {
    if (!therapistId || !therapistName) return;
    const likes = getTherapistLikes();
    let newLikes: string[];
    let newLikedState: boolean;

    if (likes.includes(therapistId)) {
      newLikes = likes.filter((id) => id !== therapistId);
      newLikedState = false;
      removeTherapistLikeEvent(therapistId);
    } else {
      newLikes = [...likes, therapistId];
      newLikedState = true;
      const addedToFeed = addTherapistLikeEvent({
        therapistId,
        therapistName,
        therapistImageUrl,
        location,
        rating,
        reviewCount,
      });
      setShowLikedToast(true);
      setLikedToastAddedToFeed(addedToFeed);
      setTimeout(() => setShowLikedToast(false), 2000);
    }

    saveTherapistLikes(newLikes);
    setIsLiked(newLikedState);
    onSaveToggle?.(newLikedState);
  };

  const adminNumber = APP_CONSTANTS.DEFAULT_CONTACT_NUMBER ?? '6281392000050';
  const whatsappDigits = getBookingWhatsAppNumber(therapist ?? {}, adminNumber) || adminNumber.replace(/\D/g, '');
  const whatsappMessage = isId
    ? `Halo, saya tertarik dengan layanan ${therapistName}. Boleh info lebih lanjut?`
    : `Hi, I'm interested in ${therapistName}'s services. Can I get more info?`;
  const whatsappUrl = buildWhatsAppUrl(whatsappDigits, whatsappMessage);

  const handleWhatsAppClick = () => {
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank');
  };

  if (!therapist) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: floatHeartStyles }} />
      <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3 overflow-visible">
        {/* Like – same as massage city places */}
        <div className="relative w-12 h-12 overflow-visible">
          <button
            type="button"
            onClick={handleLikeToggle}
            className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 bg-amber-500 hover:bg-amber-600 text-white overflow-visible"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className="w-5 h-5 flex-shrink-0 fill-white text-white" />
          </button>
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
                className="therapist-float-heart w-3 h-3 text-white fill-white absolute"
                style={{
                  animationDelay: `${delay}ms`,
                  left: `calc(50% + ${x}px)`,
                  top: '50%',
                }}
              />
            ))}
          </span>
        </div>

        {/* WhatsApp – uses booking number (admin or therapist) */}
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {showLikedToast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
          {likedToastAddedToFeed
            ? (isId ? 'Disukai — muncul di feed sosial' : 'Liked — now on the social feed')
            : (isId ? 'Disukai — satu posting per jam untuk terapis ini' : 'Liked — one post per hour for this therapist')}
        </div>
      )}
    </>
  );
}
