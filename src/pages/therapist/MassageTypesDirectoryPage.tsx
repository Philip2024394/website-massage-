/**
 * Massage Types Directory Page
 *
 * For therapist dashboard and massage city places dashboard.
 * - View massage type names and descriptions
 * - Real name (fixed) vs Displayed name (optional override for online)
 * - Suggested times 60/90/120 min and editable prices
 * - Popularity bar (on-app view/click level)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { massageTypesTranslations } from '../../translations/massageTypes';
import { MASSAGE_TYPES_CATEGORIZED, getMassageTypeDetails } from '../../constants';
import {
  TRADITIONAL_MASSAGE_DIRECTORY_NAMES,
  getTraditionalMassageEntry,
} from '../../constants/massageDirectoryTraditional';
import {
  SPORTS_MASSAGE_DIRECTORY_NAMES,
  getSportsMassageEntry,
} from '../../constants/massageDirectorySports';
import {
  THERAPEUTIC_MASSAGE_DIRECTORY_NAMES,
  getTherapeuticMassageEntry,
} from '../../constants/massageDirectoryTherapeutic';
import {
  WELLNESS_MASSAGE_DIRECTORY_NAMES,
  getWellnessMassageEntry,
} from '../../constants/massageDirectoryWellness';
import {
  COUPLES_MASSAGE_DIRECTORY_NAMES,
  getCouplesMassageEntry,
} from '../../constants/massageDirectoryCouples';
import {
  BODY_SCRUB_DIRECTORY_NAMES,
  getBodyScrubMassageEntry,
} from '../../constants/massageDirectoryBodyScrub';
import {
  PRENATAL_MASSAGE_DIRECTORY_NAMES,
  getPrenatalMassageEntry,
} from '../../constants/massageDirectoryPrenatal';
import {
  HEAD_SCALP_MASSAGE_DIRECTORY_NAMES,
  getHeadScalpMassageEntry,
} from '../../constants/massageDirectoryHeadScalp';
import { listDirectoryMassageTypes, type DirectoryMassageTypeEntry } from '../../lib/appwrite/services/directoryMassageTypes.service';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
import { BookOpen, Eye, Clock, ChevronLeft, Image as ImageIcon, Search, Filter, PlusCircle, MapPin } from 'lucide-react';

/** Recommended price ranges (×1000 IDR) for therapist/place location. Keys: 60, 90, 120 min. */
const RECOMMENDED_PRICE_RANGES: Record<'60' | '90' | '120', { min: number; max: number }> = {
  '60': { min: 100, max: 200 },
  '90': { min: 150, max: 250 },
  '120': { min: 200, max: 350 },
};
const SESSION_KEY_PENDING_MENU_ENTRY = 'pendingDirectoryMenuEntry';

const DEFAULT_THUMB = 'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720';

// Flatten directory list: translation keys + categorized + traditional massage directory names
const EN_TYPES = Object.keys(massageTypesTranslations.en.massageTypes);
const FLAT_CATEGORIZED = MASSAGE_TYPES_CATEGORIZED.flatMap((c) => c.types);
const BASE_NAMES = Array.from(
  new Set([...EN_TYPES, ...FLAT_CATEGORIZED.filter((t) => !EN_TYPES.some((e) => e.toLowerCase() === t.toLowerCase()))])
);
const DIRECTORY_NAMES = Array.from(
  new Set([
    ...BASE_NAMES,
    ...TRADITIONAL_MASSAGE_DIRECTORY_NAMES.filter((t) => !BASE_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...SPORTS_MASSAGE_DIRECTORY_NAMES.filter((t) => !BASE_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...THERAPEUTIC_MASSAGE_DIRECTORY_NAMES.filter((t) => !BASE_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...PRENATAL_MASSAGE_DIRECTORY_NAMES.filter((t) => !BASE_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...HEAD_SCALP_MASSAGE_DIRECTORY_NAMES.filter((t) => !BASE_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
  ])
);
/** Place-only: includes Wellness, Couples & Romantic Spa, and Body Scrub & Exfoliation. Therapist + Place: Prenatal. */
const PLACE_DIRECTORY_NAMES = Array.from(
  new Set([
    ...DIRECTORY_NAMES,
    ...WELLNESS_MASSAGE_DIRECTORY_NAMES.filter((t) => !DIRECTORY_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...COUPLES_MASSAGE_DIRECTORY_NAMES.filter((t) => !DIRECTORY_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
    ...BODY_SCRUB_DIRECTORY_NAMES.filter((t) => !DIRECTORY_NAMES.some((e) => e.toLowerCase() === t.toLowerCase())),
  ])
);

export interface DirectoryEntry {
  realName: string;
  displayedName: string;
  description: string;
  suggestedTimes: string;
  /** Editable minimum duration (minutes) for 60/90/120 slots. Default '60','90','120'. */
  min60?: string;
  min90?: string;
  min120?: string;
  price60: string;
  price90: string;
  price120: string;
  viewCount: number;
  /** Optional thumbnail URL for directory card and for (i) popup on live site. Empty = use placeholder. */
  imageThumbnail?: string;
}

function getDescription(realName: string, lang: 'en' | 'id'): string {
  const traditional = getTraditionalMassageEntry(realName);
  if (traditional) return traditional.shortDescription;
  const sports = getSportsMassageEntry(realName);
  if (sports) return sports.shortDescription;
  const therapeutic = getTherapeuticMassageEntry(realName);
  if (therapeutic) return therapeutic.shortDescription;
  const wellness = getWellnessMassageEntry(realName);
  if (wellness) return wellness.shortDescription;
  const couples = getCouplesMassageEntry(realName);
  if (couples) return couples.shortDescription;
  const bodyScrub = getBodyScrubMassageEntry(realName);
  if (bodyScrub) return bodyScrub.shortDescription;
  const prenatal = getPrenatalMassageEntry(realName);
  if (prenatal) return prenatal.shortDescription;
  const headScalp = getHeadScalpMassageEntry(realName);
  if (headScalp) return headScalp.shortDescription;
  const t = massageTypesTranslations[lang]?.massageTypes as Record<string, { shortDescription?: string }> | undefined;
  const fromT = t?.[realName]?.shortDescription;
  if (fromT) return fromT;
  const details = getMassageTypeDetails(realName);
  return details?.shortDescription || '';
}

function getSuggestedTimes(realName: string, _lang: 'en' | 'id'): string {
  const traditional = getTraditionalMassageEntry(realName);
  if (traditional) return traditional.recommendedDuration;
  const sports = getSportsMassageEntry(realName);
  if (sports) return sports.recommendedDuration;
  const therapeutic = getTherapeuticMassageEntry(realName);
  if (therapeutic) return therapeutic.recommendedDuration;
  const wellness = getWellnessMassageEntry(realName);
  if (wellness) return wellness.recommendedDuration;
  const couples = getCouplesMassageEntry(realName);
  if (couples) return couples.recommendedDuration;
  const bodyScrub = getBodyScrubMassageEntry(realName);
  if (bodyScrub) return bodyScrub.recommendedDuration;
  const prenatal = getPrenatalMassageEntry(realName);
  if (prenatal) return prenatal.recommendedDuration;
  const headScalp = getHeadScalpMassageEntry(realName);
  if (headScalp) return headScalp.recommendedDuration;
  const t = massageTypesTranslations[_lang]?.massageTypes as Record<string, { duration?: string }> | undefined;
  const d = t?.[realName]?.duration;
  if (d) return d;
  const details = getMassageTypeDetails(realName);
  return details?.duration || '60-90 minutes';
}

function getInitialThumbnail(realName: string): string {
  const traditional = getTraditionalMassageEntry(realName);
  if (traditional?.imageThumbnail) return traditional.imageThumbnail.trim();
  const sports = getSportsMassageEntry(realName);
  if (sports?.imageThumbnail) return sports.imageThumbnail.trim();
  const therapeutic = getTherapeuticMassageEntry(realName);
  if (therapeutic?.imageThumbnail) return therapeutic.imageThumbnail.trim();
  const wellness = getWellnessMassageEntry(realName);
  if (wellness?.imageThumbnail) return wellness.imageThumbnail.trim();
  const couples = getCouplesMassageEntry(realName);
  return (couples?.imageThumbnail ?? getBodyScrubMassageEntry(realName)?.imageThumbnail ?? getPrenatalMassageEntry(realName)?.imageThumbnail ?? getHeadScalpMassageEntry(realName)?.imageThumbnail ?? '').trim();
}

// Mock view count (0–100). Replace with analytics when available.
function mockViewCount(name: string): number {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return n % 101;
}

const MAX_VIEWS = 100;

const TRADITIONAL_SET = new Set(TRADITIONAL_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const SPORTS_SET = new Set(SPORTS_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const THERAPEUTIC_SET = new Set(THERAPEUTIC_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const WELLNESS_SET = new Set(WELLNESS_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const COUPLES_SET = new Set(COUPLES_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const BODY_SCRUB_SET = new Set(BODY_SCRUB_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const PRENATAL_SET = new Set(PRENATAL_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));
const HEAD_SCALP_SET = new Set(HEAD_SCALP_MASSAGE_DIRECTORY_NAMES.map((n) => n.toLowerCase()));

/** True if entry's suggestedTimes mentions this duration (e.g. "60", "90", "120"). */
function entryMatchesDuration(entry: DirectoryEntry, duration: string): boolean {
  if (!duration) return true;
  const t = (entry.suggestedTimes || '').toLowerCase();
  if (duration === '60') return /60/.test(t);
  if (duration === '90') return /90/.test(t);
  if (duration === '120') return /120/.test(t);
  return true;
}

/** True if entry is in Traditional Massage directory list. */
function isTraditionalType(realName: string): boolean {
  return TRADITIONAL_SET.has(realName.toLowerCase());
}

/** True if entry is in Sports Massage directory list. */
function isSportsType(realName: string): boolean {
  return SPORTS_SET.has(realName.toLowerCase());
}

/** True if entry is in Therapeutic & Clinical Massage directory list. */
function isTherapeuticType(realName: string): boolean {
  return THERAPEUTIC_SET.has(realName.toLowerCase());
}

/** True if entry is in Wellness & Relaxation (Spa-Based) directory list. Place only. */
function isWellnessType(realName: string): boolean {
  return WELLNESS_SET.has(realName.toLowerCase());
}

interface MassageTypesDirectoryPageProps {
  /** 'therapist' | 'place' */
  variant?: 'therapist' | 'place';
  language?: 'en' | 'id';
  onNavigate?: (page: string) => void;
  onBackToStatus?: () => void;
  /** For place dashboard: pass place; for therapist pass therapist */
  provider?: any;
}

const MassageTypesDirectoryPage: React.FC<MassageTypesDirectoryPageProps> = ({
  variant = 'therapist',
  language = 'id',
  onNavigate,
  onBackToStatus,
  provider,
}) => {
  const isId = language === 'id';

  const [appwriteEntries, setAppwriteEntries] = useState<DirectoryMassageTypeEntry[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | '60' | '90' | '120'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'traditional' | 'sports' | 'therapeutic' | 'wellness' | 'couples' | 'bodyScrub' | 'prenatal' | 'headScalp'>('all');

  useEffect(() => {
    listDirectoryMassageTypes()
      .then(setAppwriteEntries)
      .catch(() => setAppwriteEntries([]));
  }, []);

  const appwriteMap = useMemo(() => {
    if (!appwriteEntries?.length) return new Map<string, DirectoryMassageTypeEntry>();
    return new Map(appwriteEntries.map((e) => [e.name.toLowerCase().trim(), e]));
  }, [appwriteEntries]);

  const directoryNamesForVariant = useMemo(() => {
    if (appwriteEntries && appwriteEntries.length > 0) {
      const fromAppwrite =
        variant === 'place'
          ? appwriteEntries.map((e) => e.name)
          : appwriteEntries.filter((e) => !e.placeOnly).map((e) => e.name);
      return Array.from(new Set([...BASE_NAMES, ...fromAppwrite]));
    }
    return variant === 'place' ? PLACE_DIRECTORY_NAMES : DIRECTORY_NAMES;
  }, [appwriteEntries, variant]);

  const isTraditionalTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'traditional' || TRADITIONAL_SET.has(realName.toLowerCase());
  const isSportsTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'sports' || SPORTS_SET.has(realName.toLowerCase());
  const isTherapeuticTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'therapeutic' || THERAPEUTIC_SET.has(realName.toLowerCase());
  const isWellnessTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'wellness' || WELLNESS_SET.has(realName.toLowerCase());
  const isCouplesTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'couples' || COUPLES_SET.has(realName.toLowerCase());
  const isBodyScrubTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'body_scrub' || BODY_SCRUB_SET.has(realName.toLowerCase());
  const isPrenatalTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'prenatal' || PRENATAL_SET.has(realName.toLowerCase());
  const isHeadScalpTypeAppwrite = (realName: string) =>
    appwriteMap.get(realName.toLowerCase().trim())?.category === 'head_scalp' || HEAD_SCALP_SET.has(realName.toLowerCase());

  const [entries, setEntries] = useState<DirectoryEntry[]>(() =>
    directoryNamesForVariant.map((realName) => ({
      realName,
      displayedName: '',
      description: getDescription(realName, language),
      suggestedTimes: getSuggestedTimes(realName, language),
      min60: '60',
      min90: '90',
      min120: '120',
      price60: '',
      price90: '',
      price120: '',
      viewCount: mockViewCount(realName),
      imageThumbnail: getInitialThumbnail(realName),
    }))
  );

  useEffect(() => {
    setEntries((prev) =>
      directoryNamesForVariant.map((realName) => {
        const existing = prev.find((e) => e.realName === realName);
        return {
          realName,
          displayedName: existing?.displayedName ?? '',
          description: appwriteMap.get(realName.toLowerCase().trim())?.shortDescription ?? getDescription(realName, language),
          suggestedTimes: appwriteMap.get(realName.toLowerCase().trim())?.recommendedDuration ?? getSuggestedTimes(realName, language),
          min60: existing?.min60 ?? '60',
          min90: existing?.min90 ?? '90',
          min120: existing?.min120 ?? '120',
          price60: existing?.price60 ?? '',
          price90: existing?.price90 ?? '',
          price120: existing?.price120 ?? '',
          viewCount: mockViewCount(realName),
          imageThumbnail: appwriteMap.get(realName.toLowerCase().trim())?.imageThumbnail?.trim() ?? getInitialThumbnail(realName) ?? existing?.imageThumbnail ?? '',
        };
      })
    );
  }, [directoryNamesForVariant, appwriteEntries, language]);

  const maxViews = useMemo(() => Math.max(MAX_VIEWS, ...entries.map((e) => e.viewCount)), [entries]);

  const filteredEntries = useMemo(() => {
    let list = entries;
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          (e.realName && e.realName.toLowerCase().includes(q)) ||
          (e.displayedName && e.displayedName.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.suggestedTimes && e.suggestedTimes.toLowerCase().includes(q))
      );
    }
    if (durationFilter !== 'all') {
      list = list.filter((e) => entryMatchesDuration(e, durationFilter));
    }
    if (categoryFilter === 'traditional') {
      list = list.filter((e) => isTraditionalTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'sports') {
      list = list.filter((e) => isSportsTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'therapeutic') {
      list = list.filter((e) => isTherapeuticTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'wellness') {
      list = list.filter((e) => isWellnessTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'couples') {
      list = list.filter((e) => isCouplesTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'bodyScrub') {
      list = list.filter((e) => isBodyScrubTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'prenatal') {
      list = list.filter((e) => isPrenatalTypeAppwrite(e.realName));
    }
    if (categoryFilter === 'headScalp') {
      list = list.filter((e) => isHeadScalpTypeAppwrite(e.realName));
    }
    return list;
  }, [entries, searchQuery, durationFilter, categoryFilter]);

  const updateEntry = (realName: string, patch: Partial<DirectoryEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.realName === realName ? { ...e, ...patch } : e))
    );
  };

  /** Add this directory entry to the therapist/place menu and go to menu page. */
  const handleAddToMenu = (entry: DirectoryEntry) => {
    const serviceName = (entry.displayedName || entry.realName).trim() || entry.realName;
    const payload = {
      serviceName,
      min60: entry.min60 || '60',
      price60: entry.price60?.trim() || String(RECOMMENDED_PRICE_RANGES['60'].min),
      min90: entry.min90 || '90',
      price90: entry.price90?.trim() || String(RECOMMENDED_PRICE_RANGES['90'].min),
      min120: entry.min120 || '120',
      price120: entry.price120?.trim() || String(RECOMMENDED_PRICE_RANGES['120'].min),
    };
    try {
      sessionStorage.setItem(SESSION_KEY_PENDING_MENU_ENTRY, JSON.stringify(payload));
      onNavigate?.('therapist-menu');
    } catch (e) {
      console.warn('sessionStorage set failed', e);
      onNavigate?.('therapist-menu');
    }
  };

  const title = isId ? 'Direktori Jenis Pijat' : 'Massage Types Directory';
  const subtitle = isId
    ? 'Lihat nama, deskripsi, waktu disarankan, dan popularitas tayangan'
    : 'View names, descriptions, suggested times, and on-app viewing popularity';

  if (variant === 'place') {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => onBackToStatus?.() ?? onNavigate?.('dashboard')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label={isId ? 'Kembali' : 'Back'}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          </div>
        </header>
        <div className="overflow-y-auto p-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 2rem)' }}>
          <div className="p-4 pb-8 max-w-4xl mx-auto space-y-6">
            <p className="text-sm text-gray-600">
              {isId ? 'Nama asli = nama standar. Jika "Nama tampilan" diisi, nama itu yang muncul online; jika kosong, nama asli yang ditampilkan. Harga dalam ribuan IDR (mis. 150 = Rp 150.000).' : 'Real name = standard name. If "Displayed name" is entered, it replaces the name online; if empty, the real name is shown. Prices in thousands IDR (e.g. 150 = Rp 150,000).'}
            </p>
            {/* Search and filters — place includes Wellness & Relaxation (Spa-Based) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <Search className="w-4 h-4 inline-block mr-1.5 text-orange-500" />
                {isId ? 'Cari jenis pijat' : 'Search directory'}
              </label>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isId ? 'Nama, deskripsi...' : 'Name, description...'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                aria-label={isId ? 'Cari' : 'Search'}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-600">{isId ? 'Durasi:' : 'Duration:'}</span>
                {(['all', '60', '90', '120'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationFilter(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      durationFilter === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {d === 'all' ? (isId ? 'Semua' : 'All') : `${d} min`}
                  </button>
                ))}
                <span className="text-xs text-gray-500 ml-1">|</span>
                <span className="text-xs font-medium text-gray-600">{isId ? 'Jenis:' : 'Type:'}</span>
                <button type="button" onClick={() => setCategoryFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{isId ? 'Semua jenis' : 'All types'}</button>
                <button type="button" onClick={() => setCategoryFilter('traditional')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'traditional' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Traditional Massage</button>
                <button type="button" onClick={() => setCategoryFilter('sports')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'sports' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Sports Massage</button>
                <button type="button" onClick={() => setCategoryFilter('therapeutic')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'therapeutic' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Therapeutic & Clinical Massage</button>
                <button type="button" onClick={() => setCategoryFilter('wellness')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'wellness' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Wellness & Relaxation (Spa-Based)</button>
                <button type="button" onClick={() => setCategoryFilter('couples')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'couples' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Couples & Romantic Spa</button>
                <button type="button" onClick={() => setCategoryFilter('bodyScrub')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'bodyScrub' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Body Scrub & Exfoliation</button>
                <button type="button" onClick={() => setCategoryFilter('prenatal')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'prenatal' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Prenatal / Pregnancy</button>
                <button type="button" onClick={() => setCategoryFilter('headScalp')} className={`px-3 py-1.5 rounded-full text-xs font-medium ${categoryFilter === 'headScalp' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Head / Scalp</button>
              </div>
              <p className="text-xs text-gray-500">
                {isId ? `Menampilkan ${filteredEntries.length} dari ${entries.length} jenis` : `Showing ${filteredEntries.length} of ${entries.length} types`}
              </p>
            </div>
            {categoryFilter === 'wellness' && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Wellness & Relaxation (Spa-Based)</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {isId ? 'Daftar direktori kategori ini didasarkan pada jenis pijat asli yang diakui industri. Nama dalam bagian ini dapat berupa varisi yang ditingkatkan, bermerek premium, atau fokus area yang dirancang untuk tampilan menu dan keperluan pemasaran.' : 'This category directory listing is based on the original recognized massage type. The names within this section may be enhanced, premium-branded, or focus-area variations designed for menu presentation and marketing purposes.'}
                </p>
              </div>
            )}
            {categoryFilter === 'couples' && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Couples & Romantic Spa</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {isId ? 'Kategori ini hanya untuk Direktori Massage Places. Tidak tersedia untuk layanan pijat ke rumah.' : 'This category is strictly for Massage Places Directory only. Not available for Home Service providers.'}
                </p>
              </div>
            )}
            {categoryFilter === 'bodyScrub' && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Body Scrub & Exfoliation</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {isId ? 'Kategori ini hanya untuk Direktori Massage Places. Tidak tersedia untuk layanan pijat ke rumah.' : 'Massage Places Directory only – not available for Home Service.'}
                </p>
              </div>
            )}
            {categoryFilter === 'prenatal' && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Prenatal / Pregnancy Massage</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {isId ? 'Tersedia di Direktori Massage Places dan Layanan Pijat ke Rumah (Therapist Home Service).' : 'Can be displayed in Massage Places Directory and Therapist Home Service.'}
                </p>
              </div>
            )}
            {categoryFilter === 'headScalp' && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Head / Scalp Massage</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {isId ? 'Tersedia di Direktori Massage Places dan Layanan Pijat ke Rumah (Home Service).' : 'Massage Places Directory & Home Service.'}
                </p>
              </div>
            )}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="bg-white/80 border border-gray-200 rounded-2xl p-8 text-center text-gray-600 shadow-sm">
                  <p className="font-medium">{isId ? 'Tidak ada hasil. Coba ubah filter atau pencarian.' : 'No results. Try changing filters or search.'}</p>
                </div>
              ) : (
              filteredEntries.map((entry) => (
                <div key={entry.realName} className="bg-white rounded-2xl border border-gray-200/90 shadow-lg shadow-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-300">
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                        {entry.imageThumbnail ? (
                          <img src={entry.imageThumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400" title={isId ? 'Gambar nanti' : 'Image to be added'}>
                            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{isId ? 'URL thumbnail (opsional)' : 'Thumbnail URL (optional)'}</label>
                        <input type="url" value={entry.imageThumbnail ?? ''} onChange={(e) => updateEntry(entry.realName, { imageThumbnail: e.target.value.trim() })} placeholder={isId ? 'Tambahkan nanti' : 'Add later'} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isId ? 'Nama asli' : 'Real name'}</label>
                        <p className="text-base font-semibold text-gray-900">{entry.realName}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isId ? 'Nama tampilan (opsional)' : 'Displayed name (optional)'}</label>
                        <input type="text" value={entry.displayedName} onChange={(e) => updateEntry(entry.realName, { displayedName: e.target.value })} placeholder={isId ? 'Kosongkan = tampilkan nama asli' : 'Leave empty = show real name'} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isId ? 'Deskripsi' : 'Description'}</label>
                      <p className="text-sm text-gray-700 leading-relaxed">{entry.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="font-medium">{isId ? 'Waktu disarankan:' : 'Suggested times:'}</span>
                      <span>{entry.suggestedTimes}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-xl px-3 py-2">
                      <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold">{isId ? 'Rekomendasi (area Anda):' : 'Recommended (your area):'}</span>
                      <span className="text-amber-700">60: {RECOMMENDED_PRICE_RANGES['60'].min}–{RECOMMENDED_PRICE_RANGES['60'].max}k · 90: {RECOMMENDED_PRICE_RANGES['90'].min}–{RECOMMENDED_PRICE_RANGES['90'].max}k · 120: {RECOMMENDED_PRICE_RANGES['120'].min}–{RECOMMENDED_PRICE_RANGES['120'].max}k (×1000)</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{isId ? 'Min (menit) & Harga — 60 / 90 / 120 (ribuan IDR)' : 'Min (minutes) & Price — 60 / 90 / 120 (×1000 IDR)'}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { d: '60' as const, minKey: 'min60' as const, priceKey: 'price60' as const },
                          { d: '90' as const, minKey: 'min90' as const, priceKey: 'price90' as const },
                          { d: '120' as const, minKey: 'min120' as const, priceKey: 'price120' as const },
                        ].map(({ d, minKey, priceKey }) => (
                          <div key={d} className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Min</span>
                              <input type="text" inputMode="numeric" value={entry[minKey] ?? d} onChange={(e) => updateEntry(entry.realName, { [minKey]: e.target.value.replace(/\D/g, '').slice(0, 3) })} className="w-12 border-2 border-orange-200 rounded-lg px-1.5 py-1 text-xs font-bold text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder={d} />
                              <span className="text-[10px] text-gray-500">min</span>
                            </div>
                            <input type="text" inputMode="numeric" value={entry[priceKey]} onChange={(e) => updateEntry(entry.realName, { [priceKey]: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder={String(RECOMMENDED_PRICE_RANGES[d as '60'|'90'|'120'].min)} className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-orange-200 focus:border-orange-500" />
                            <p className="text-[10px] text-gray-500 text-center mt-0.5">×1000</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-orange-500" />{isId ? 'Tayangan di aplikasi' : 'On-app views'}</span>
                        <span className="text-gray-500">{entry.viewCount} / {maxViews}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (entry.viewCount / maxViews) * 100)}%` }} />
                      </div>
                    </div>
                    <button type="button" onClick={() => handleAddToMenu(entry)} className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                      <PlusCircle className="w-5 h-5" />
                      {isId ? 'Tambah ke menu' : 'Add to menu'}
                    </button>
                  </div>
                </div>
              )))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
              <p className="font-semibold mb-1">{isId ? 'Fitur lain yang bisa ditambahkan' : 'Other features you could add'}</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>{isId ? 'Tautan cepat ke menu Anda untuk setiap jenis' : 'Quick link to your menu per type'}</li>
                <li>{isId ? 'Filter/sort berdasarkan popularitas' : 'Filter/sort by popularity'}</li>
                <li>{isId ? 'Ekspor daftar ke PDF/CSV' : 'Export directory to PDF/CSV'}</li>
                <li>{isId ? 'Waktu kustom per jenis (bukan hanya 60/90/120)' : 'Custom durations per type (not only 60/90/120)'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TherapistSimplePageLayout
      title={title}
      subtitle={subtitle}
      onBackToStatus={onBackToStatus ?? (() => onNavigate?.('therapist-status'))}
      onNavigate={onNavigate}
      currentPage={variant === 'therapist' ? 'therapist-massage-types-directory' : 'place-massage-types-directory'}
      language={language}
      therapist={provider}
      icon={<BookOpen className="w-6 h-6 text-orange-600" />}
    >
      <div className="overflow-y-auto p-4 pb-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 20px), 2rem)' }}>
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {isId
              ? 'Nama asli = nama standar. Jika "Nama tampilan" diisi, nama itu yang muncul online; jika kosong, nama asli yang ditampilkan. Edit durasi min (60/90/120) dan harga (ribuan IDR). Rekomendasi harga ditampilkan untuk area Anda.'
              : 'Real name = standard name. If "Displayed name" is entered, it replaces the name online. Edit min duration (60/90/120) and price (×1000 IDR). Recommended prices shown for your area.'}
          </p>

          {/* Search + filters — elite pill bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 space-y-4">
            <label className="block text-sm font-semibold text-gray-800">
              <Search className="w-4 h-4 inline-block mr-1.5 text-orange-500" />
              {isId ? 'Cari jenis pijat' : 'Search directory'}
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isId ? 'Nama, deskripsi, 60 menit, 90 menit, 120 menit...' : 'Name, description, 60 min, 90 min, 120 min...'}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-shadow"
              aria-label={isId ? 'Cari' : 'Search'}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{isId ? 'Durasi:' : 'Duration:'}</span>
              {(['all', '60', '90', '120'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationFilter(d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    durationFilter === d ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d === 'all' ? (isId ? 'Semua' : 'All') : `${d} min`}
                </button>
              ))}
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{isId ? 'Jenis:' : 'Type:'}</span>
              <button type="button" onClick={() => setCategoryFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'all' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{isId ? 'Semua jenis' : 'All types'}</button>
              <button type="button" onClick={() => setCategoryFilter('traditional')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'traditional' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Traditional</button>
              <button type="button" onClick={() => setCategoryFilter('sports')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'sports' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Sports</button>
              <button type="button" onClick={() => setCategoryFilter('therapeutic')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'therapeutic' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Therapeutic</button>
              <button type="button" onClick={() => setCategoryFilter('prenatal')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'prenatal' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Prenatal / Pregnancy</button>
              <button type="button" onClick={() => setCategoryFilter('headScalp')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categoryFilter === 'headScalp' ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Head / Scalp</button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {isId ? `Menampilkan ${filteredEntries.length} dari ${entries.length} jenis` : `Showing ${filteredEntries.length} of ${entries.length} types`}
            </p>
          </div>

        {/* Original massage type notice when viewing a category */}
        {categoryFilter === 'traditional' && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Traditional Massage</p>
            <p className="mt-2 text-sm leading-relaxed">{isId ? 'Daftar direktori kategori ini didasarkan pada jenis pijat asli yang diakui industri.' : 'This category directory listing is based on the original recognized massage type.'}</p>
          </div>
        )}
        {categoryFilter === 'sports' && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Sports Massage</p>
            <p className="mt-2 text-sm leading-relaxed">{isId ? 'Daftar direktori kategori ini didasarkan pada jenis pijat asli yang diakui industri.' : 'This category directory listing is based on the original recognized massage type.'}</p>
          </div>
        )}
        {categoryFilter === 'therapeutic' && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Therapeutic & Clinical Massage</p>
            <p className="mt-2 text-sm leading-relaxed">{isId ? 'Daftar direktori kategori ini didasarkan pada jenis pijat asli yang diakui industri.' : 'This category directory listing is based on the original recognized massage type.'}</p>
          </div>
        )}

        {categoryFilter === 'prenatal' && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Prenatal / Pregnancy Massage</p>
            <p className="mt-2 text-sm leading-relaxed">{isId ? 'Tersedia di Direktori Massage Places dan Layanan Pijat ke Rumah (Therapist Home Service).' : 'Can be displayed in Massage Places Directory and Therapist Home Service.'}</p>
          </div>
        )}

        {categoryFilter === 'headScalp' && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">{isId ? 'JENIS PIJAT ASLI:' : 'ORIGINAL MASSAGE TYPE:'} Head / Scalp Massage</p>
            <p className="mt-2 text-sm leading-relaxed">{isId ? 'Tersedia di Direktori Massage Places dan Layanan Pijat ke Rumah (Home Service).' : 'Massage Places Directory & Home Service.'}</p>
          </div>
        )}

        <div className="space-y-5">
          {filteredEntries.length === 0 ? (
            <div className="bg-white/80 border border-gray-200 rounded-2xl p-10 text-center text-gray-600 shadow-sm">
              <p className="font-medium">
                {isId ? 'Tidak ada hasil. Coba ubah filter atau pencarian.' : 'No results. Try changing filters or search.'}
              </p>
            </div>
          ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.realName}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-lg shadow-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-300"
            >
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                    {entry.imageThumbnail ? (
                      <img src={entry.imageThumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMB; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400" title={isId ? 'Gambar nanti' : 'Image to be added'}>
                        <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                        {isId ? 'URL thumbnail (opsional)' : 'Thumbnail URL (optional)'}
                      </label>
                      <input
                        type="url"
                        value={entry.imageThumbnail ?? ''}
                        onChange={(e) => updateEntry(entry.realName, { imageThumbnail: e.target.value.trim() })}
                        placeholder={isId ? 'Tambahkan nanti' : 'Add later'}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {isId ? 'Nama asli' : 'Real name'}
                    </label>
                    <p className="text-base font-semibold text-gray-900">{entry.realName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {isId ? 'Nama tampilan (opsional)' : 'Displayed name (optional)'}
                    </label>
                    <input
                      type="text"
                      value={entry.displayedName}
                      onChange={(e) => updateEntry(entry.realName, { displayedName: e.target.value })}
                      placeholder={isId ? 'Kosongkan = tampilkan nama asli' : 'Leave empty = show real name'}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {isId ? 'Deskripsi' : 'Description'}
                  </label>
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.description}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{isId ? 'Waktu disarankan:' : 'Suggested times:'}</span>
                  <span>{entry.suggestedTimes}</span>
                </div>

                {/* Recommended prices for your area */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-xl px-3 py-2">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold">{isId ? 'Rekomendasi (area Anda):' : 'Recommended (your area):'}</span>
                  <span className="text-amber-700">
                    60: {RECOMMENDED_PRICE_RANGES['60'].min}–{RECOMMENDED_PRICE_RANGES['60'].max}k · 90: {RECOMMENDED_PRICE_RANGES['90'].min}–{RECOMMENDED_PRICE_RANGES['90'].max}k · 120: {RECOMMENDED_PRICE_RANGES['120'].min}–{RECOMMENDED_PRICE_RANGES['120'].max}k (×1000)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {isId ? 'Min (menit) & Harga — 60 / 90 / 120 (ribuan IDR)' : 'Min (minutes) & Price — 60 / 90 / 120 (×1000 IDR)'}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { d: '60' as const, minKey: 'min60' as const, priceKey: 'price60' as const },
                      { d: '90' as const, minKey: 'min90' as const, priceKey: 'price90' as const },
                      { d: '120' as const, minKey: 'min120' as const, priceKey: 'price120' as const },
                    ].map(({ d, minKey, priceKey }) => (
                      <div key={d} className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Min</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={entry[minKey] ?? d}
                            onChange={(e) => updateEntry(entry.realName, { [minKey]: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                            className="w-12 border-2 border-orange-200 rounded-lg px-1.5 py-1 text-xs font-bold text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder={d}
                          />
                          <span className="text-[10px] text-gray-500">min</span>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={entry[priceKey]}
                          onChange={(e) =>
                            updateEntry(entry.realName, { [priceKey]: e.target.value.replace(/\D/g, '').slice(0, 6) })
                          }
                          placeholder={String(RECOMMENDED_PRICE_RANGES[d as '60'|'90'|'120'].min)}
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                        />
                        <p className="text-[10px] text-gray-500 text-center mt-0.5">×1000</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-600 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-orange-500" />
                      {isId ? 'Tayangan di aplikasi' : 'On-app views'}
                    </span>
                    <span className="text-gray-500">{entry.viewCount} / {maxViews}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (entry.viewCount / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToMenu(entry)}
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  {isId ? 'Tambah ke menu saya' : 'Add to my menu'}
                </button>
              </div>
            </div>
          )))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">
            {isId ? 'Fitur lain yang bisa ditambahkan' : 'Other features you could add'}
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li>{isId ? 'Tautan cepat ke menu Anda untuk setiap jenis' : 'Quick link to your menu per type'}</li>
            <li>{isId ? 'Filter/sort berdasarkan popularitas' : 'Filter/sort by popularity'}</li>
            <li>{isId ? 'Ekspor daftar ke PDF/CSV' : 'Export directory to PDF/CSV'}</li>
            <li>{isId ? 'Waktu kustom per jenis (bukan hanya 60/90/120)' : 'Custom durations per type (not only 60/90/120)'}</li>
          </ul>
        </div>
      </div>
    </div>
    </TherapistSimplePageLayout>
  );
};

export default MassageTypesDirectoryPage;
