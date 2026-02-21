/**
 * Beautician dashboard – Color & design chart config.
 * For each chart type activated by selected categories (Nail, Hair, etc.), therapist can
 * upload their own chart image. If not uploaded, profile shows default/placeholder.
 */

import React, { useState, useRef } from 'react';
import { therapistService, imageUploadService } from '../../lib/appwriteService';
import { showToast, showErrorToast } from '../../lib/toastUtils';
import { BEAUTICIAN_CHART_TYPES, CHART_FIELD_LEGACY, type BeauticianChartId } from '../../constants/beauticianChartTypes';
import type { BeauticianCategoryId } from '../../constants/beauticianServiceCategories';
import { Palette, Upload, ImageIcon } from 'lucide-react';

function parseCategoriesRaw(raw: unknown): BeauticianCategoryId[] {
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

interface BeauticianColorChartsConfigProps {
  therapist: { $id?: string; id?: string } & Record<string, unknown>;
  onRefresh?: () => void;
  language?: 'en' | 'id';
}

const label = (en: string, id: string, lang: string) => (lang === 'id' ? id : en);

const BeauticianColorChartsConfig: React.FC<BeauticianColorChartsConfigProps> = ({
  therapist,
  onRefresh,
  language = 'id',
}) => {
  const therapistId = therapist?.$id || (therapist as any)?.id;
  const categoryIds = parseCategoriesRaw((therapist as any)?.beauticianServiceCategories);
  const activeCharts = BEAUTICIAN_CHART_TYPES.filter((ct) => categoryIds.includes(ct.categoryId));

  const [uploadingChart, setUploadingChart] = useState<BeauticianChartId | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getChartImageUrl = (chartId: BeauticianChartId): string | undefined => {
    const legacyKey = CHART_FIELD_LEGACY[chartId];
    const url = (therapist as any)[legacyKey];
    return url && typeof url === 'string' && url.trim() ? url.trim() : undefined;
  };

  const handleFileSelect = async (chartId: BeauticianChartId, file: File | null) => {
    if (!therapistId || !file) return;
    if (!file.type.startsWith('image/')) {
      showErrorToast(label('Please choose an image file (JPG, PNG).', 'Pilih file gambar (JPG, PNG).', language));
      return;
    }
    setUploadingChart(chartId);
    try {
      const url = await imageUploadService.uploadImage(file, 'beautician-charts');
      const legacyKey = CHART_FIELD_LEGACY[chartId];
      const payload: Record<string, string> = { [legacyKey]: url };
      await therapistService.update(therapistId, payload);
      onRefresh?.();
      showToast(label('Chart image saved.', 'Gambar chart disimpan.', language), 'success');
    } catch (e) {
      showErrorToast((e as Error)?.message ?? label('Upload failed.', 'Upload gagal.', language));
    } finally {
      setUploadingChart(null);
      const input = fileInputRefs.current[chartId];
      if (input) input.value = '';
    }
  };

  if (activeCharts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Palette className="w-5 h-5 text-orange-500" aria-hidden />
        {label('Color & design chart', 'Daftar warna & desain', language)}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {label(
          'Upload your chart image for each type below. Clients will see these in dropdowns on your profile.',
          'Unggah gambar chart untuk setiap jenis di bawah. Klien akan melihat ini di dropdown di profil Anda.',
          language
        )}
      </p>
      <div className="space-y-4">
        {activeCharts.map((chartType) => {
          const chartLabel = label(chartType.labelEn, chartType.labelId, language);
          const currentUrl = getChartImageUrl(chartType.id);
          const isUploading = uploadingChart === chartType.id;

          return (
            <div
              key={chartType.id}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">{chartLabel}</span>
                <label className="cursor-pointer">
                  <input
                    ref={(el) => { fileInputRefs.current[chartType.id] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(chartType.id, f);
                    }}
                    disabled={isUploading}
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors">
                    {isUploading ? (
                      <span>{label('Uploading…', 'Mengunggah…', language)}</span>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" aria-hidden />
                        {label('Upload chart', 'Unggah chart', language)}
                      </>
                    )}
                  </span>
                </label>
              </div>
              {currentUrl ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={currentUrl}
                    alt={chartLabel}
                    className="w-full h-auto max-h-40 object-contain"
                    loading="lazy"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    {label('Current chart image. Upload a new file to replace.', 'Gambar chart saat ini. Unggah file baru untuk mengganti.', language)}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-gray-500">
                  <ImageIcon className="w-8 h-8 flex-shrink-0" aria-hidden />
                  <p className="text-xs">
                    {label('No image yet. Upload to show your chart on profile.', 'Belum ada gambar. Unggah untuk menampilkan chart di profil.', language)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BeauticianColorChartsConfig;
