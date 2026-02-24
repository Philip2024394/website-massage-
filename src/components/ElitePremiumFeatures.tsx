/**
 * ELITE Premium Features – Massage City Places Profile Page.
 * Diamond-standard layout and color theme aligned with Visit Us and profile cards.
 * All content is driven by place props so the place dashboard can let members
 * add/edit under their assigned ELITE package.
 *
 * Dashboard field mapping (members edit in dashboard, shown here):
 * - whatsIncluded[] + Spa Amenities (icons) → in Visit Us block on profile (under address)
 * - amenities (or default icons) → same block in Visit Us
 * - languagesSpoken[] → shown on profile card under description (with flags) when member selects in dashboard
 * - paymentMethods → in Visit Us block (under Get Directions / Call Spa)
 * - safetyFeatures[] → "Safety & Comfort"
 * - ambianceTags[] / couplesTreatment → shown on hero / elsewhere (removed from here to avoid duplicate)
 * - viewingNow, lastBookedMinutesAgo → on hero over main image (removed from here)
 * - therapists[] → "Services & Therapist Trending Now" section on profile
 * - testimonials[] → "Customer Reviews"
 * - giftCardAvailable → "Gift This Spa" button
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Gift, Star, Quote,
} from 'lucide-react';

export interface Therapist {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  yearsExperience: number;
  rating?: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto?: string;
  rating: number;
  text: string;
  date?: string;
  treatment?: string;
}

export interface ElitePremiumFeaturesProps {
  place: {
    membershipPlan?: string;
    plan?: string;
    membership?: string;
    whatsIncluded?: string[];
    amenities?: string[];
    languagesSpoken?: string[];
    paymentMethods?: string[];
    safetyFeatures?: string[];
    ambianceTags?: string[];
    therapists?: Therapist[];
    testimonials?: Testimonial[];
    viewingNow?: number;
    lastBookedMinutesAgo?: number;
    couplesTreatmentAvailable?: boolean;
    giftCardAvailable?: boolean;
    [key: string]: any;
  };
  language?: string;
  onGiftCardClick?: () => void;
}

const DEFAULT_SAFETY_FEATURES = [
  'Female therapists available',
  'Private treatment rooms',
  'Licensed & registered',
  'Hygiene certified',
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: '1', customerName: 'Sarah M.', rating: 5, text: 'Best massage experience in Bali! The therapists are incredibly skilled and the ambiance is perfect.', date: '2 weeks ago', treatment: '90 min Traditional' },
  { id: '2', customerName: 'John D.', rating: 5, text: 'Professional service from start to finish. Will definitely come back!', date: '1 month ago', treatment: '120 min Deep Tissue' },
  { id: '3', customerName: 'Amanda L.', rating: 4, text: 'Great value for money. Clean facilities and friendly staff.', date: '3 weeks ago', treatment: '60 min Aromatherapy' },
];

/** Shared card style: matches Visit Us / price container diamond standard */
const sectionCardClass = 'rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden';
const sectionTitleClass = 'flex items-center gap-2 text-sm font-bold text-gray-900';
const sectionIconClass = 'w-4 h-4 text-amber-500 flex-shrink-0';

export default function ElitePremiumFeatures({
  place,
  language = 'id',
  onGiftCardClick,
}: ElitePremiumFeaturesProps) {
  const p = place as any;
  const membershipPlan = p.membershipPlan || p.plan || p.membership;
  if (membershipPlan !== 'elite') return null;

  const isId = language === 'id';
  const safetyFeatures = p.safetyFeatures || DEFAULT_SAFETY_FEATURES;
  const testimonials = p.testimonials || DEFAULT_TESTIMONIALS;
  const giftCardAvailable = p.giftCardAvailable ?? true;

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className={`mt-8 ${sectionCardClass}`}>
      {/* Diamond accent bar – same as Visit Us / profile hero */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-90 rounded-t-2xl" aria-hidden />

      <div className="p-4 sm:p-6 space-y-6">
        {/* ——— Safety & Comfort (full width, same style as hours block) ——— */}
        <div className="p-4 rounded-xl border-2 bg-orange-50/80 border-orange-400">
          <h4 className={`${sectionTitleClass} mb-3`}>
            <ShieldCheck className={sectionIconClass} />
            {isId ? 'Keamanan & Kenyamanan' : 'Safety & Comfort'}
          </h4>
          <ul className="space-y-2">
            {safetyFeatures.map((feature: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Featured Therapists moved to "Services & Therapist Trending Now" section on profile */}

        {/* ——— Customer Reviews carousel ——— */}
        <div className="p-4 rounded-xl border-2 bg-orange-50/80 border-orange-400">
          <h4 className={`${sectionTitleClass} mb-3`}>
            <Quote className={sectionIconClass} />
            {isId ? 'Testimoni Pelanggan' : 'Customer Reviews'}
          </h4>
          <div className="relative min-h-[88px]">
            {testimonials.map((testimonial: Testimonial, i: number) => (
              <div
                key={testimonial.id}
                className={`transition-opacity duration-300 ${i === testimonialIndex ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none invisible'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold text-sm">
                    {testimonial.customerPhoto ? (
                      <img src={testimonial.customerPhoto} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      testimonial.customerName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-gray-900">{testimonial.customerName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">"{testimonial.text}"</p>
                    {(testimonial.treatment || testimonial.date) && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {[testimonial.treatment, testimonial.date].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTestimonialIndex(i)}
                className={`h-2 rounded-full transition-all ${i === testimonialIndex ? 'bg-amber-500 w-5' : 'bg-amber-200 w-2'}`}
                aria-label={isId ? `Testimoni ${i + 1}` : `Review ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ——— Gift This Spa CTA ——— */}
        {giftCardAvailable && (
          <button
            type="button"
            onClick={onGiftCardClick}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.98] transition-all border-2 border-amber-600 shadow-md"
          >
            <Gift className="w-5 h-5" />
            {isId ? 'Beli Voucher Hadiah' : 'Gift This Spa'}
          </button>
        )}
      </div>
    </section>
  );
}
