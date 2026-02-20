/**
 * Beautician dashboard – configure 1–3 treatment containers.
 * Each: treatment name, fixed price, estimated duration (minutes). No per-minute pricing.
 */

import React, { useState, useEffect } from 'react';
import { therapistService } from '../../lib/appwriteService';
import { showToast, showErrorToast } from '../../lib/toastUtils';
import {
  parseBeauticianTreatments,
  BEAUTICIAN_TREATMENT_MIN_CONTAINERS,
  BEAUTICIAN_TREATMENT_MAX_CONTAINERS,
  DEFAULT_BEAUTICIAN_TREATMENT,
} from '../../constants/beauticianTreatments';
import type { BeauticianTreatment } from '../../types';

interface BeauticianTreatmentContainersConfigProps {
  therapist: { $id?: string; id?: string } & Record<string, unknown>;
  onRefresh?: () => void;
  language?: 'en' | 'id';
}

const label = (en: string, id: string, lang: string) => (lang === 'id' ? id : en);

const BeauticianTreatmentContainersConfig: React.FC<BeauticianTreatmentContainersConfigProps> = ({
  therapist,
  onRefresh,
  language = 'en',
}) => {
  const therapistId = therapist?.$id || (therapist as any)?.id;
  const therapistCountry = (therapist as any)?.country ?? (therapist as any)?.countryCode ?? '';
  const [containers, setContainers] = useState<BeauticianTreatment[]>(() => {
    const raw = (therapist as any)?.beauticianTreatments;
    const list = parseBeauticianTreatments(raw);
    if (list.length >= BEAUTICIAN_TREATMENT_MIN_CONTAINERS) return list;
    const out = [...list];
    while (out.length < BEAUTICIAN_TREATMENT_MIN_CONTAINERS) {
      out.push(DEFAULT_BEAUTICIAN_TREATMENT(therapistCountry));
    }
    return out;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = (therapist as any)?.beauticianTreatments;
    const list = parseBeauticianTreatments(raw);
    if (list.length >= BEAUTICIAN_TREATMENT_MIN_CONTAINERS) {
      setContainers(list);
    } else {
      const padded = [...list];
      while (padded.length < BEAUTICIAN_TREATMENT_MIN_CONTAINERS) {
        padded.push(DEFAULT_BEAUTICIAN_TREATMENT(therapistCountry));
      }
      setContainers(padded);
    }
  }, [therapist]);

  const updateContainer = (index: number, patch: Partial<BeauticianTreatment>) => {
    setContainers((prev) => {
      const next = [...prev];
      next[index] = { ...(next[index] ?? DEFAULT_BEAUTICIAN_TREATMENT()), ...patch };
      return next;
    });
  };

  const addContainer = () => {
    if (containers.length >= BEAUTICIAN_TREATMENT_MAX_CONTAINERS) {
      showToast(
        label(
          `Maximum ${BEAUTICIAN_TREATMENT_MAX_CONTAINERS} treatments.`,
          `Maksimal ${BEAUTICIAN_TREATMENT_MAX_CONTAINERS} perawatan.`,
          language
        ),
        'warning'
      );
      return;
    }
    setContainers((prev) => [...prev, DEFAULT_BEAUTICIAN_TREATMENT(therapistCountry)]);
  };

  const removeContainer = (index: number) => {
    if (containers.length <= BEAUTICIAN_TREATMENT_MIN_CONTAINERS) {
      showToast(
        label('At least 1 treatment required.', 'Minimal 1 perawatan diperlukan.', language),
        'warning'
      );
      return;
    }
    setContainers((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!therapistId) return;
    const toSave = containers.map((c) => ({
      treatment_name: String(c.treatment_name ?? '').trim() || 'Treatment',
      fixed_price: Math.max(0, Number(c.fixed_price) || 0),
      estimated_duration_minutes: Math.max(1, Math.floor(Number(c.estimated_duration_minutes) || 60)),
      currency: c.currency ?? 'EUR',
    }));
    setSaving(true);
    try {
      await therapistService.update(therapistId, { beauticianTreatments: JSON.stringify(toSave) });
      onRefresh?.();
      showToast(label('Saved.', 'Disimpan.', language), 'success');
    } catch (e) {
      showErrorToast((e as Error)?.message ?? label('Failed to save.', 'Gagal menyimpan.', language));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {label('Treatment containers (1–3)', 'Kontainer perawatan (1–3)', language)}
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        {label(
          'Fixed price per treatment. Estimated time for scheduling only. No per-minute pricing.',
          'Harga tetap per perawatan. Waktu perkiraan hanya untuk jadwal. Bukan harga per menit.',
          language
        )}
      </p>
      <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4">
        {label(
          'These treatments are shown live on: your listing card (Home Service Beauty tab), your profile page, and your shared profile link.',
          'Perawatan ini ditampilkan langsung di: kartu listing Anda (tab Home Service Beauty), halaman profil Anda, dan tautan profil bersama.',
          language
        )}
      </p>

      <div className="space-y-4 mb-4">
        {containers.map((c, index) => (
          <div key={index} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50/50">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label('Treatment name', 'Nama perawatan', language)}
                </label>
                <input
                  type="text"
                  value={c.treatment_name}
                  onChange={(e) => updateContainer(index, { treatment_name: e.target.value })}
                  placeholder={label('e.g. Glow Facial', 'Contoh: Facial Glow', language)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label('Fixed price', 'Harga tetap', language)}
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={c.fixed_price || ''}
                  onChange={(e) => updateContainer(index, { fixed_price: parseFloat(e.target.value) || 0 })}
                  placeholder="65"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {label('Est. time (min)', 'Waktu perkiraan (menit)', language)}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={c.estimated_duration_minutes || ''}
                    onChange={(e) =>
                      updateContainer(index, {
                        estimated_duration_minutes: Math.max(1, parseInt(e.target.value, 10) || 60),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                {containers.length > BEAUTICIAN_TREATMENT_MIN_CONTAINERS && (
                  <button
                    type="button"
                    onClick={() => removeContainer(index)}
                    className="py-2 px-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                    aria-label={label('Remove', 'Hapus', language)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {containers.length < BEAUTICIAN_TREATMENT_MAX_CONTAINERS && (
        <button
          type="button"
          onClick={addContainer}
          className="mb-4 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          + {label('Add treatment', 'Tambah perawatan', language)}
        </button>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full py-2.5 px-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {saving ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : label('Save treatments', 'Simpan perawatan', language)}
      </button>
    </div>
  );
};

export default BeauticianTreatmentContainersConfig;
