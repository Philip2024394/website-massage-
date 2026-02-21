/**
 * Beautician profile sections: Services I offer, Color & Design Chart (dropdowns), Service disclaimers.
 * Chart dropdowns: Nail (when nail_services), Hair (when hair_beauty). Each shows custom or default image.
 */

import React, { useState } from 'react';
import {
  BEAUTICIAN_SERVICE_CATEGORIES,
  BEAUTICIAN_CATEGORY_IDS,
  type BeauticianCategoryId,
} from '../../constants/beauticianServiceCategories';
import {
  BEAUTICIAN_CHART_TYPES,
  BEAUTICIAN_CHART_IDS,
  CHART_FIELD_LEGACY,
  type BeauticianChartId,
} from '../../constants/beauticianChartTypes';

const NAIL_CHART_HEADER_EN = 'Nail Colors';
const NAIL_CHART_HEADER_ID = 'Warna Kuku';
const NAIL_CHART_SUBTITLE_EN = "Additional Nail Color's On Request";
const NAIL_CHART_SUBTITLE_ID = 'Warna kuku tambahan atas permintaan';
import { Sparkles, Palette, FileText, ChevronDown, ChevronUp } from 'lucide-react';

function parseCategories(raw: unknown): BeauticianCategoryId[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is BeauticianCategoryId => typeof x === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x: unknown): x is BeauticianCategoryId => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseChartImages(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => typeof v === 'string' && v.length > 0)
      ) as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return {};
}

/** Default nail colour swatches when no image is set. */
const NAIL_SWATCHES = [
  { name: 'Classic Red', hex: '#C41E3A' },
  { name: 'Nude', hex: '#E8D5C4' },
  { name: 'Blush Pink', hex: '#F4C2C2' },
  { name: 'French White', hex: '#FFFEF7' },
  { name: 'Black', hex: '#1C1C1C' },
  { name: 'Navy', hex: '#2C3E50' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Coral', hex: '#E07850' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
];

const BEAUTICIAN_DISCLAIMER_EN =
  'Home service: clean, well-lit area required. Results may vary. Patch test recommended for first-time colour or chemical treatments. Prices are fixed per treatment.';
const BEAUTICIAN_DISCLAIMER_ID =
  'Layanan ke rumah: area bersih dan cukup cahaya diperlukan. Hasil dapat bervariasi. Tes tempel disarankan untuk perawatan warna/kimia pertama. Harga tetap per perawatan.';

function getChartImageUrl(
  therapist: Record<string, unknown>,
  chartId: BeauticianChartId
): string | undefined {
  const legacyKey = CHART_FIELD_LEGACY[chartId];
  const legacy = (therapist as any)[legacyKey];
  if (legacy && typeof legacy === 'string' && legacy.trim()) return legacy.trim();
  const chartImages = parseChartImages((therapist as any).beauticianChartImages);
  return chartImages[chartId];
}

interface BeauticianProfileSectionsProps {
  therapist: Record<string, unknown>;
  language?: 'en' | 'id';
}

const BeauticianProfileSections: React.FC<BeauticianProfileSectionsProps> = ({
  therapist,
  language = 'id',
}) => {
  const categoryIds = parseCategories((therapist as any).beauticianServiceCategories);
  const isEn = language === 'en';
  const categories = BEAUTICIAN_SERVICE_CATEGORIES.filter((c) => categoryIds.includes(c.id));
  const customDisclaimer = (therapist as any).beauticianDisclaimers as string | undefined;

  // Which chart dropdowns to show: chart type is shown when its category is selected
  const activeCharts = BEAUTICIAN_CHART_TYPES.filter((ct) => categoryIds.includes(ct.categoryId));
  // Always show Nail Colors chart for beauticians (default image until they upload their own)
  const nailChartType = BEAUTICIAN_CHART_TYPES.find((ct) => ct.id === BEAUTICIAN_CHART_IDS.NAIL_COLOUR);
  const chartsToShow =
    nailChartType && !activeCharts.some((c) => c.id === BEAUTICIAN_CHART_IDS.NAIL_COLOUR)
      ? [nailChartType, ...activeCharts]
      : activeCharts;
  const [openChartId, setOpenChartId] = useState<BeauticianChartId | null>(
    chartsToShow.length > 0 ? chartsToShow[0].id : null
  );

  if (categories.length === 0 && chartsToShow.length === 0 && !customDisclaimer) {
    return null;
  }

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Services I offer */}
      {categories.length > 0 && (
        <section className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl border border-orange-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" aria-hidden />
            {isEn ? 'Services I offer' : 'Layanan yang saya tawarkan'}
          </h3>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id} className="text-sm">
                <span className="font-semibold text-gray-800">
                  {isEn ? cat.labelEn : cat.labelId}:
                </span>
                <span className="text-gray-600 ml-1">
                  {cat.subServices.join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Color & Design Chart – dropdown sections */}
      {chartsToShow.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 p-4 pb-2">
            <Palette className="w-4 h-4 text-orange-500" aria-hidden />
            {isEn ? 'Color & design chart' : 'Daftar warna & desain'}
          </h3>
          <p className="text-xs text-gray-600 px-4 pb-3">
            {isEn ? 'Tap to expand each chart.' : 'Ketuk untuk membuka setiap chart.'}
          </p>
          <div className="divide-y divide-gray-100">
            {chartsToShow.map((chartType) => {
              const isOpen = openChartId === chartType.id;
              const imageUrl = getChartImageUrl(therapist, chartType.id) || chartType.defaultImageUrl;
              const label = isEn ? chartType.labelEn : chartType.labelId;

              return (
                <div key={chartType.id} className="bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setOpenChartId(isOpen ? null : chartType.id)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-orange-50/50 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`chart-content-${chartType.id}`}
                    id={`chart-heading-${chartType.id}`}
                  >
                    <span className="text-sm font-semibold text-gray-900">{label}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-orange-500 flex-shrink-0" aria-hidden />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-orange-500 flex-shrink-0" aria-hidden />
                    )}
                  </button>
                  <div
                    id={`chart-content-${chartType.id}`}
                    role="region"
                    aria-labelledby={`chart-heading-${chartType.id}`}
                    className={isOpen ? 'block' : 'hidden'}
                  >
                    <div className="px-4 pb-4 pt-0">
                      {imageUrl ? (
                        chartType.id === BEAUTICIAN_CHART_IDS.NAIL_COLOUR ? (
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                              {isEn ? NAIL_CHART_HEADER_EN : NAIL_CHART_HEADER_ID}
                            </h4>
                            <img
                              src={imageUrl}
                              alt={isEn ? NAIL_CHART_HEADER_EN : NAIL_CHART_HEADER_ID}
                              className="w-full h-auto object-contain"
                              loading="lazy"
                            />
                            <p className="text-sm text-gray-600 mt-2">
                              {isEn ? NAIL_CHART_SUBTITLE_EN : NAIL_CHART_SUBTITLE_ID}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={imageUrl}
                              alt={label}
                              className="w-full h-auto object-contain max-h-56"
                              loading="lazy"
                            />
                          </div>
                        )
                      ) : chartType.id === BEAUTICIAN_CHART_IDS.NAIL_COLOUR ? (
                        <>
                          <p className="text-xs text-gray-600 mb-3">
                            {isEn
                              ? 'Sample shades. Ask for full chart when you book.'
                              : 'Contoh warna. Minta daftar lengkap saat booking.'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {NAIL_SWATCHES.slice(0, 10).map((s, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-inner"
                                style={{ backgroundColor: s.hex }}
                                title={s.name}
                                aria-hidden
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2">
                            {isEn ? 'Full chart on request.' : 'Daftar lengkap on request.'}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          {isEn ? 'Chart image can be added by the beautician.' : 'Gambar chart dapat ditambahkan oleh beautician.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Service disclaimers */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
        <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
          <FileText className="w-3.5 h-3.5" aria-hidden />
          {isEn ? 'Service notice' : 'Pemberitahuan layanan'}
        </h3>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          {customDisclaimer && customDisclaimer.trim()
            ? customDisclaimer
            : isEn
              ? BEAUTICIAN_DISCLAIMER_EN
              : BEAUTICIAN_DISCLAIMER_ID}
        </p>
      </section>
    </div>
  );
};

export default BeauticianProfileSections;
