/**
 * Therapist Documents Section – Indastreet Achievements & Insurance
 * Therapist can upload documents (licenses, certs, insurance) under two headers:
 * - Achievements (licenses / certifications)
 * - Insurance
 * Each section shows thumbnails in a container; therapist can select one or both and upload files.
 */

import React, { useState, useCallback } from 'react';
import { Award, Shield, Upload, X, FileText } from 'lucide-react';
import { imageUploadService } from '../../lib/appwriteService';
import { logger } from '../../utils/logger';

export interface DocumentItem {
  url: string;
  name: string;
  fileId?: string;
}

interface TherapistDocumentsSectionProps {
  /** Current list of achievement/cert documents (licenses, certs) */
  achievementsDocuments: DocumentItem[];
  /** Current list of insurance documents */
  insuranceDocuments: DocumentItem[];
  /** Callback when achievements list changes */
  onAchievementsChange: (docs: DocumentItem[]) => void;
  /** Callback when insurance list changes */
  onInsuranceChange: (docs: DocumentItem[]) => void;
  /** Whether uploads are in progress (disable buttons) */
  uploading?: boolean;
  /** Language for labels */
  language?: 'en' | 'id';
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPT = 'image/*,.pdf';

export const TherapistDocumentsSection: React.FC<TherapistDocumentsSectionProps> = ({
  achievementsDocuments,
  insuranceDocuments,
  onAchievementsChange,
  onInsuranceChange,
  uploading = false,
  language = 'id'
}) => {
  const [uploadingSection, setUploadingSection] = useState<'achievements' | 'insurance' | null>(null);

  const t = {
    title: language === 'id' ? 'Dokumen – Pencapaian & Asuransi' : 'Documents – Achievements & Insurance',
    achievements: language === 'id' ? 'Achievements' : 'Achievements',
    achievementsHint: language === 'id' ? 'Lisensi, sertifikat, atau pencapaian' : 'Licenses, certificates, or achievements',
    insurance: language === 'id' ? 'Insurance' : 'Insurance',
    insuranceHint: language === 'id' ? 'Dokumen asuransi' : 'Insurance documents',
    addFile: language === 'id' ? 'Tambah file' : 'Add file',
    uploading: language === 'id' ? 'Mengunggah...' : 'Uploading...',
    remove: language === 'id' ? 'Hapus' : 'Remove',
    maxSize: language === 'id' ? `Maks ${MAX_FILE_SIZE_MB}MB` : `Max ${MAX_FILE_SIZE_MB}MB`,
  };

  const handleFile = useCallback(
    async (file: File, section: 'achievements' | 'insurance') => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        logger.warn('Document too large', { size: file.size, max: MAX_FILE_SIZE_MB * 1024 * 1024 });
        return;
      }
      setUploadingSection(section);
      try {
        const url = await imageUploadService.uploadImage(file, `therapist-docs/${section}`);
        const item: DocumentItem = { url, name: file.name };
        if (section === 'achievements') {
          onAchievementsChange([...achievementsDocuments, item]);
        } else {
          onInsuranceChange([...insuranceDocuments, item]);
        }
      } catch (e) {
        logger.error('Document upload failed', { section, error: e });
      } finally {
        setUploadingSection(null);
      }
    },
    [achievementsDocuments, insuranceDocuments, onAchievementsChange, onInsuranceChange]
  );

  const removeDoc = useCallback(
    (section: 'achievements' | 'insurance', index: number) => {
      if (section === 'achievements') {
        onAchievementsChange(achievementsDocuments.filter((_, i) => i !== index));
      } else {
        onInsuranceChange(insuranceDocuments.filter((_, i) => i !== index));
      }
    },
    [achievementsDocuments, insuranceDocuments, onAchievementsChange, onInsuranceChange]
  );

  const renderDocThumbnail = (item: DocumentItem, section: 'achievements' | 'insurance', index: number) => {
    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(item.name) || item.url.includes('/view');
    return (
      <div
        key={`${section}-${index}-${item.url}`}
        className="relative group rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="aspect-square w-full min-h-[80px] flex items-center justify-center bg-gray-50">
          {isImage ? (
            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <p className="p-2 text-xs text-gray-700 truncate" title={item.name}>
          {item.name}
        </p>
        <button
          type="button"
          onClick={() => removeDoc(section, index)}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={t.remove}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderSection = (
    section: 'achievements' | 'insurance',
    headerLabel: string,
    headerHint: string,
    Icon: React.ComponentType<{ className?: string }>,
    docs: DocumentItem[]
  ) => {
    const isUploading = uploading || uploadingSection === section;
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file, section);
      e.target.value = '';
    };

    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{headerLabel}</h4>
            <p className="text-xs text-gray-500">{headerHint}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {docs.map((item, index) => renderDocThumbnail(item, section, index))}
          <label className="flex flex-col items-center justify-center w-24 min-h-[80px] rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition-colors">
            <input
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={onChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <span className="text-xs text-orange-600">{t.uploading}</span>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-600 text-center px-1">{t.addFile}</span>
              </>
            )}
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t.maxSize} • PDF or image</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-orange-500" />
        <h3 className="text-base font-semibold text-gray-900">{t.title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {language === 'id'
          ? 'Unggah lisensi, sertifikat, atau dokumen asuransi. Pilih salah satu atau kedua kategori dan tambahkan file.'
          : 'Upload licenses, certificates, or insurance documents. Select one or both categories and add files.'}
      </p>

      {renderSection(
        'achievements',
        t.achievements,
        t.achievementsHint,
        Award,
        achievementsDocuments
      )}
      {renderSection(
        'insurance',
        t.insurance,
        t.insuranceHint,
        Shield,
        insuranceDocuments
      )}
    </div>
  );
};

export default TherapistDocumentsSection;
