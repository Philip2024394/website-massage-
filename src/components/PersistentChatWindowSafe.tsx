import React, { useState, useEffect } from 'react';
import PersistentChatWindow from './PersistentChatWindow';
import { usePersistentChat } from '../context/PersistentChatProvider';

/** Parse first segment from hash or pathname (e.g. #/home → home, #/therapist-profile/123 → therapist-profile, /share/therapist/123 → share) */
function getCurrentPageFromHash(): string {
  if (typeof window === 'undefined') return '';
  let raw = window.location.hash.replace('#', '').replace(/^\//, '').trim();
  if (!raw && window.location.pathname && window.location.pathname !== '/') {
    raw = window.location.pathname.replace(/^\//, '').trim();
  }
  return raw.split('/')[0] || '';
}

/** True if chat should be hidden (landing/home only) */
function isLandingOrHome(page: string): boolean {
  return !page || page === 'landing' || page === 'home';
}

/**
 * BYPASS WRAPPER for PersistentChatWindow JSX parsing issue
 * OOM FIX: Only mount PersistentChatWindow when chat is open (chatState.isOpen).
 * When closed, return null so the ~3100-line component never loads — saves memory.
 */
export default function PersistentChatWindowSafe(props: any) {
  const [currentPage, setCurrentPage] = useState(getCurrentPageFromHash);
  const { chatState } = usePersistentChat();
  const isChatOpen = chatState.isOpen;

  useEffect(() => {
    const sync = () => setCurrentPage(getCurrentPageFromHash());
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  if (isLandingOrHome(currentPage)) {
    return null;
  }
  if (!isChatOpen) {
    return null;
  }

  return (
    <>
      <PersistentChatWindow {...props} />
    </>
  );
}
