/**
 * Beautician Dashboard – Service Category Selector (max 5)
 * and Facial Therapist upgrade modal (brand protection: do not auto-reclassify).
 */

import React, { useState, useEffect } from 'react';
import { therapistService } from '../../lib/appwriteService';
import { showToast, showErrorToast } from '../../lib/toastUtils';
import {
  BEAUTICIAN_SERVICE_CATEGORIES,
  BEAUTICIAN_CATEGORY_IDS,
  MAX_BEAUTICIAN_CATEGORIES,
  FACIAL_THERAPIST_UPGRADE_FEE_IDR,
  type BeauticianCategoryId,
} from '../../constants/beauticianServiceCategories';
import { Check } from 'lucide-react';

const LANGUAGE = 'id';

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

interface BeauticianServiceCategoriesProps {
  therapist: { $id?: string; id?: string } & Record<string, unknown>;
  onRefresh?: () => void;
  language?: 'en' | 'id';
}

const BeauticianServiceCategories: React.FC<BeauticianServiceCategoriesProps> = ({
  therapist,
  onRefresh,
  language = LANGUAGE,
}) => {
  const therapistId = therapist?.$id || (therapist as any)?.id;
  const [selectedIds, setSelectedIds] = useState<BeauticianCategoryId[]>(() =>
    parseCategories((therapist as any)?.beauticianServiceCategories)
  );
  const [saving, setSaving] = useState(false);
  const [facialUpgradeModal, setFacialUpgradeModal] = useState<'none' | 'choose' | 'pay'>('none');
  const [facialListingActive, setFacialListingActive] = useState<boolean>(
    Boolean((therapist as any)?.facialTherapistListingActive)
  );
  const [facialListingExpiresAt, setFacialListingExpiresAt] = useState<string | null>(
    (therapist as any)?.facialTherapistListingExpiresAt || null
  );

  const isFacialExpired =
    facialListingExpiresAt && new Date(facialListingExpiresAt) < new Date();
  const displayFacialActive = facialListingActive && !isFacialExpired;

  useEffect(() => {
    const raw = (therapist as any)?.beauticianServiceCategories;
    setSelectedIds(parseCategories(raw));
    setFacialListingActive(Boolean((therapist as any)?.facialTherapistListingActive));
    setFacialListingExpiresAt((therapist as any)?.facialTherapistListingExpiresAt || null);
  }, [therapist]);

  const toggleCategory = (id: BeauticianCategoryId) => {
    const isFacial = id === BEAUTICIAN_CATEGORY_IDS.FACIAL_TREATMENTS;
    const currentlySelected = selectedIds.includes(id);

    if (currentlySelected) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      setFacialUpgradeModal('none');
      return;
    }

    if (selectedIds.length >= MAX_BEAUTICIAN_CATEGORIES) {
      showToast(
        language === 'id'
          ? `Maksimal ${MAX_BEAUTICIAN_CATEGORIES} kategori. Hapus salah satu untuk menambah.`
          : `Maximum ${MAX_BEAUTICIAN_CATEGORIES} categories. Remove one to add more.`,
        'warning'
      );
      return;
    }

    if (isFacial) {
      setSelectedIds((prev) => [...prev, id]);
      setFacialUpgradeModal('choose');
      return;
    }

    setSelectedIds((prev) => [...prev, id]);
  };

  const saveCategories = async (payload: {
    beauticianServiceCategories: BeauticianCategoryId[];
    facialTherapistListingActive?: boolean;
    facialTherapistListingExpiresAt?: string | null;
  }) => {
    if (!therapistId) return;
    setSaving(true);
    try {
      await therapistService.update(therapistId, payload);
      setFacialListingActive(Boolean(payload.facialTherapistListingActive));
      setFacialListingExpiresAt(payload.facialTherapistListingExpiresAt || null);
      onRefresh?.();
      showToast(language === 'id' ? 'Disimpan.' : 'Saved.', 'success');
    } catch (e) {
      showErrorToast((e as Error)?.message || (language === 'id' ? 'Gagal menyimpan.' : 'Failed to save.'));
    } finally {
      setSaving(false);
      setFacialUpgradeModal('none');
    }
  };

  const handleStayBeautician = () => {
    saveCategories({
      beauticianServiceCategories: selectedIds,
      facialTherapistListingActive: false,
      facialTherapistListingExpiresAt: null,
    });
  };

  const handleUpgradePay = () => {
    setFacialUpgradeModal('pay');
  };

  const confirmUpgradePayment = async () => {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await saveCategories({
      beauticianServiceCategories: selectedIds,
      facialTherapistListingActive: true,
      facialTherapistListingExpiresAt: expiresAt.toISOString(),
    });
    setFacialUpgradeModal('none');
  };

  const label = (en: string, id: string) => (language === 'id' ? id : en);

  return (
    <div className="rounded-xl border-2 border-orange-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        {label('Service categories', 'Kategori Layanan')} (maks. {MAX_BEAUTICIAN_CATEGORIES})
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {label(
          'Select up to 5 categories. They control which profile features are enabled.',
          'Pilih maksimal 5 kategori. Mereka mengaktifkan fitur profil yang sesuai.'
        )}
      </p>

      <div className="space-y-2 mb-4">
        {BEAUTICIAN_SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <label
              key={cat.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
              } ${selectedIds.length >= MAX_BEAUTICIAN_CATEGORIES && !isSelected ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleCategory(cat.id)}
                disabled={selectedIds.length >= MAX_BEAUTICIAN_CATEGORIES && !isSelected}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900">{label(cat.labelEn, cat.labelId)}</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {cat.subServices.slice(0, 3).join(', ')}
                  {cat.subServices.length > 3 ? '...' : ''}
                </p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-orange-600 flex-shrink-0" />}
            </label>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">
          {label('Selected categories', 'Kategori terpilih')}:{' '}
          {selectedIds.length === 0
            ? label('None', 'Belum ada')
            : selectedIds
                .map(
                  (id) =>
                    BEAUTICIAN_SERVICE_CATEGORIES.find((c) => c.id === id)?.[
                      language === 'id' ? 'labelId' : 'labelEn'
                    ]
                )
                .filter(Boolean)
                .join(', ')}
        </p>
        <p className="text-sm font-medium text-gray-700">
          {label('Facial Therapist listing', 'Listing Terapis Facial')}:{' '}
          <span className={displayFacialActive ? 'text-green-600' : 'text-gray-500'}>
            {displayFacialActive ? label('Active', 'Aktif') : label('Not active', 'Tidak aktif')}
          </span>
          {facialListingExpiresAt && !isFacialExpired && (
            <span className="text-xs text-gray-500 ml-1">
              ({label('Expires', 'Berlaku sampai')} {new Date(facialListingExpiresAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')})
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          saveCategories({
            beauticianServiceCategories: selectedIds,
            ...(displayFacialActive && facialListingExpiresAt
              ? { facialTherapistListingActive: true, facialTherapistListingExpiresAt }
              : {}),
          })
        }
        disabled={saving}
        className="mt-4 w-full py-2.5 px-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {saving ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : label('Save categories', 'Simpan kategori')}
      </button>

      {/* Modal: Upgrade choice (Stay Beautician / Upgrade to Facial Therapist) */}
      {facialUpgradeModal === 'choose' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {label('Upgrade Your Visibility', 'Tingkatkan Visibilitas Anda')}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {label(
                'You have selected Facial Treatments. Would you like to be listed in the "Facial Therapist" category for greater visibility?',
                'Anda memilih Perawatan Facial. Apakah Anda ingin tampil di kategori "Terapis Facial" untuk visibilitas lebih besar?'
              )}
            </p>
            <p className="text-sm font-medium text-orange-700 mb-4">
              {label('Upgrade fee', 'Biaya upgrade')}: Rp {FACIAL_THERAPIST_UPGRADE_FEE_IDR.toLocaleString('id-ID')} / {label('year', 'tahun')}
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 cursor-pointer">
                <input
                  type="radio"
                  name="facial-upgrade-choice"
                  defaultChecked
                  className="text-orange-600"
                />
                <span className="text-sm">
                  {label('Stay listed as Beautician (Facials included)', 'Tetap sebagai Beautician (Facial tetap ditampilkan di profil)')}
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-orange-300 bg-orange-50 cursor-pointer">
                <input type="radio" name="facial-upgrade-choice" value="upgrade" className="text-orange-600" />
                <span className="text-sm">
                  {label('Upgrade to Facial Therapist listing', 'Tampil juga di kategori Terapis Facial')} (Rp {FACIAL_THERAPIST_UPGRADE_FEE_IDR.toLocaleString('id-ID')})
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleStayBeautician}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {label('Stay as Beautician', 'Tetap Beautician')}
              </button>
              <button
                type="button"
                onClick={handleUpgradePay}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {label('Upgrade (Pay)', 'Upgrade (Bayar)')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm payment (placeholder – actual payment gateway can be wired later) */}
      {facialUpgradeModal === 'pay' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {label('Upgrade to Facial Therapist', 'Upgrade ke Terapis Facial')}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {label('Fee', 'Biaya')}: Rp {FACIAL_THERAPIST_UPGRADE_FEE_IDR.toLocaleString('id-ID')} / {label('year', 'tahun')}.{' '}
              {label('After payment, your profile will appear under both Beautician and Facial Therapist.', 'Setelah pembayaran, profil Anda akan tampil di Beautician dan Terapis Facial.')}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFacialUpgradeModal('choose')}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                {label('Back', 'Kembali')}
              </button>
              <button
                type="button"
                onClick={confirmUpgradePayment}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? '...' : label('Confirm & Pay Rp 200,000', 'Konfirmasi & Bayar Rp 200.000')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeauticianServiceCategories;
