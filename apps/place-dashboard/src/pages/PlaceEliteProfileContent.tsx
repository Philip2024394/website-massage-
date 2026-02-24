/**
 * ELITE Profile Content – Place Dashboard.
 * Only for members on ELITE plan. Edit content that appears on the Massage City Places profile:
 * What's Included, Spa Amenities, Languages, Payment, Safety, Ambiance tags,
 * Featured Therapists, Testimonials, Couple's Treatment, Gift Card.
 * Saves to place document; fields match ElitePremiumFeatures.tsx props.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ShowerHead, ShieldCheck, Users, Quote, Heart, Gift, ArrowLeft, Plus, X } from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  yearsExperience: number;
  rating?: number;
}

interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto?: string;
  rating: number;
  text: string;
  date?: string;
  treatment?: string;
}

interface PlaceEliteProfileContentProps {
  place: any;
  onBack: () => void;
  onSave?: (data: Partial<{
    whatsIncluded: string[];
    safetyFeatures: string[];
    ambianceTags: string[];
    languagesSpoken: string[];
    couplesTreatmentAvailable: boolean;
    giftCardAvailable: boolean;
    therapists: Therapist[];
    testimonials: Testimonial[];
  }>) => void | Promise<void>;
  language?: string;
}

const DEFAULT_WHATS_INCLUDED = ['Complimentary welcome drink', 'Hot towel service', 'Shower facilities', 'Locker & storage'];
const DEFAULT_SAFETY = ['Female therapists available', 'Private treatment rooms', 'Licensed & registered', 'Hygiene certified'];
const DEFAULT_AMBIANCE = ['Relaxing', 'Modern', 'Traditional Balinese'];
const DEFAULT_LANGUAGES = ['English', 'Indonesian', 'Mandarin'];

export default function PlaceEliteProfileContent({ place, onBack, onSave, language = 'id' }: PlaceEliteProfileContentProps) {
  const p = place || {};
  const plan = p.membershipPlan || p.plan || p.membership;
  const isId = language === 'id';

  const [whatsIncluded, setWhatsIncluded] = useState<string[]>(p.whatsIncluded || DEFAULT_WHATS_INCLUDED);
  const [safetyFeatures, setSafetyFeatures] = useState<string[]>(p.safetyFeatures || DEFAULT_SAFETY);
  const [ambianceTags, setAmbianceTags] = useState<string[]>(p.ambianceTags || DEFAULT_AMBIANCE);
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(p.languagesSpoken || DEFAULT_LANGUAGES);
  const [couplesTreatment, setCouplesTreatment] = useState(p.couplesTreatmentAvailable !== false);
  const [giftCardAvailable, setGiftCardAvailable] = useState(p.giftCardAvailable !== false);
  const [therapists, setTherapists] = useState<Therapist[]>(p.therapists || []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(p.testimonials || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWhatsIncluded(p.whatsIncluded || DEFAULT_WHATS_INCLUDED);
    setSafetyFeatures(p.safetyFeatures || DEFAULT_SAFETY);
    setAmbianceTags(p.ambianceTags || DEFAULT_AMBIANCE);
    setLanguagesSpoken(p.languagesSpoken || DEFAULT_LANGUAGES);
    setCouplesTreatment(p.couplesTreatmentAvailable !== false);
    setGiftCardAvailable(p.giftCardAvailable !== false);
    setTherapists(p.therapists || []);
    setTestimonials(p.testimonials || []);
  }, [p.whatsIncluded, p.safetyFeatures, p.ambianceTags, p.languagesSpoken, p.couplesTreatmentAvailable, p.giftCardAvailable, p.therapists, p.testimonials]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({
        whatsIncluded,
        safetyFeatures,
        ambianceTags,
        languagesSpoken,
        couplesTreatmentAvailable: couplesTreatment,
        giftCardAvailable,
        therapists,
        testimonials,
      });
    } finally {
      setSaving(false);
    }
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], placeholder: string) => {
    const value = window.prompt(isId ? 'Tambah item' : 'Add item', placeholder);
    if (value?.trim()) setter([...list, value.trim()]);
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => {
    setter(list.filter((_, i) => i !== index));
  };

  if (plan !== 'elite') {
    return (
      <div className="p-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> {isId ? 'Kembali' : 'Back'}
        </button>
        <p className="text-gray-600">{isId ? 'Halaman ini hanya untuk paket ELITE.' : 'This page is only available for ELITE plan.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> {isId ? 'Kembali' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? (isId ? 'Menyimpan...' : 'Saving...') : (isId ? 'Simpan' : 'Save')}
        </button>
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {isId ? 'Konten Profil ELITE' : 'ELITE Profile Content'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isId ? 'Edit konten yang tampil di halaman profil Massage City Places Anda.' : 'Edit the content shown on your Massage City Places profile page.'}
        </p>
      </div>

      {/* What's Included */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {isId ? "Termasuk dalam Perawatan" : "What's Included"}
        </h2>
        <ul className="space-y-2">
          {whatsIncluded.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <button type="button" onClick={() => removeListItem(setWhatsIncluded, whatsIncluded, i)} className="text-red-500 p-1"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => addListItem(setWhatsIncluded, whatsIncluded, 'e.g. Post-massage tea')} className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> {isId ? 'Tambah' : 'Add'}
        </button>
      </section>

      {/* Ambiance Tags */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2">{isId ? 'Tag Suasana' : 'Ambiance Tags'}</h2>
        <div className="flex flex-wrap gap-2">
          {ambianceTags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
              {tag}
              <button type="button" onClick={() => setAmbianceTags(ambianceTags.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <button type="button" onClick={() => { const v = window.prompt(isId ? 'Tag baru' : 'New tag', 'e.g. Traditional Balinese'); if (v?.trim()) setAmbianceTags([...ambianceTags, v.trim()]); }} className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> {isId ? 'Tambah tag' : 'Add tag'}
        </button>
      </section>

      {/* Languages Spoken */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2">{isId ? 'Bahasa yang Digunakan' : 'Languages Spoken'}</h2>
        <div className="flex flex-wrap gap-2">
          {languagesSpoken.map((lang, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs">
              {lang}
              <button type="button" onClick={() => setLanguagesSpoken(languagesSpoken.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <button type="button" onClick={() => { const v = window.prompt(isId ? 'Bahasa' : 'Language', 'e.g. Mandarin'); if (v?.trim()) setLanguagesSpoken([...languagesSpoken, v.trim()]); }} className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> {isId ? 'Tambah bahasa' : 'Add language'}
        </button>
      </section>

      {/* Safety & Comfort */}
      <section className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          {isId ? 'Keamanan & Kenyamanan' : 'Safety & Comfort'}
        </h2>
        <ul className="space-y-2">
          {safetyFeatures.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <button type="button" onClick={() => removeListItem(setSafetyFeatures, safetyFeatures, i)} className="text-red-500 p-1"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => addListItem(setSafetyFeatures, safetyFeatures, 'e.g. CCTV in public areas')} className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> {isId ? 'Tambah' : 'Add'}
        </button>
      </section>

      {/* Toggles */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Heart className="w-4 h-4 text-amber-500" />
            {isId ? 'Tampilkan Perawatan Pasangan' : "Show Couple's Treatment"}
          </span>
          <input type="checkbox" checked={couplesTreatment} onChange={(e) => setCouplesTreatment(e.target.checked)} className="rounded border-amber-300 text-amber-500" />
        </label>
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Gift className="w-4 h-4 text-amber-500" />
            {isId ? 'Tampilkan Tombol Gift Voucher' : 'Show Gift This Spa button'}
          </span>
          <input type="checkbox" checked={giftCardAvailable} onChange={(e) => setGiftCardAvailable(e.target.checked)} className="rounded border-amber-300 text-amber-500" />
        </label>
      </section>

      {/* Therapists & Testimonials note */}
      <section className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          {isId ? 'Terapis & Testimoni' : 'Therapists & Testimonials'}
        </h2>
        <p className="text-xs text-gray-600">
          {isId ? 'Terapis unggulan dan testimoni pelanggan dapat diatur dari versi dashboard lengkap (API/backend). Saat ini tampilan profil menggunakan data contoh.' : 'Featured therapists and customer testimonials can be managed from the full dashboard (API/backend). Profile currently uses sample data.'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {therapists.length} {isId ? 'terapis' : 'therapists'}, {testimonials.length} {isId ? 'testimoni' : 'testimonials'}.
        </p>
      </section>
    </div>
  );
}
