/**
 * ELITE Floating Action Buttons – WhatsApp Quick Chat & Save to Favorites.
 * Fixed position floating buttons for premium spa profile pages.
 */

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';

export interface EliteFloatingActionsProps {
  placeId: string;
  placeName: string;
  whatsappNumber?: string;
  language?: string;
  onSaveToggle?: (isSaved: boolean) => void;
}

const FAVORITES_STORAGE_KEY = 'elite_spa_favorites';

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {}
}

export default function EliteFloatingActions({
  placeId,
  placeName,
  whatsappNumber,
  language = 'id',
  onSaveToggle,
}: EliteFloatingActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const isId = language === 'id';

  useEffect(() => {
    const favorites = getFavorites();
    setIsSaved(favorites.includes(placeId));
  }, [placeId]);

  const handleSaveToggle = () => {
    const favorites = getFavorites();
    let newFavorites: string[];
    let newSavedState: boolean;

    if (favorites.includes(placeId)) {
      newFavorites = favorites.filter((id) => id !== placeId);
      newSavedState = false;
    } else {
      newFavorites = [...favorites, placeId];
      newSavedState = true;
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    }

    saveFavorites(newFavorites);
    setIsSaved(newSavedState);
    onSaveToggle?.(newSavedState);
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
      {/* Floating buttons container - fixed bottom right */}
      <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3">
        {/* Save to Favorites */}
        <button
          type="button"
          onClick={handleSaveToggle}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-500'
          }`}
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* WhatsApp Quick Chat */}
        {whatsappNumber && (
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-12 h-12 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all"
            aria-label="WhatsApp Quick Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          {isId ? 'Disimpan ke Favorit' : 'Saved to Favorites'}
        </div>
      )}
    </>
  );
}
