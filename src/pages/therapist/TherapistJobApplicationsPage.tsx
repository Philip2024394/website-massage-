// Therapist Job Applications – upload info + optional CV for employer job postings
// Same UI design as other therapist dashboard pages (simple header, cards)
import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, Save, Upload, X, User } from 'lucide-react';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { therapistDashboardService } from '../../lib/appwrite/services/therapistDashboard.service';
import { showToast } from '../../utils/showToastPortal';
import { containsContactSpam, CONTACT_SPAM_MESSAGE_EN, CONTACT_SPAM_MESSAGE_ID } from '../../utils/contactSpam';
import type { Therapist } from '../../types';

interface TherapistJobApplicationsPageProps {
  therapist: Therapist | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const CV_MAX_SIZE_MB = 5;
const ALLOWED_CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const TherapistJobApplicationsPage: React.FC<TherapistJobApplicationsPageProps> = ({
  therapist,
  onBack,
  onNavigate,
  onLogout,
  language = 'id',
}) => {
  const [experience, setExperience] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreviewName, setCvPreviewName] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  const labels = {
    en: {
      title: 'Job Applications',
      subtitle: 'Your info and CV for employer job postings',
      intro: 'Use this profile when you apply to jobs from the Massage Jobs page. Employers can view your experience and optional CV.',
      experience: 'Experience',
      experiencePlaceholder: 'e.g. 5 years massage therapy, spa and hotel experience',
      specialties: 'Specialties',
      specialtiesPlaceholder: 'e.g. Swedish, deep tissue, prenatal',
      coverLetter: 'Short intro for applications',
      coverLetterPlaceholder: 'A few lines about yourself for employers',
      cvOptional: 'CV / Resume (optional)',
      cvHint: 'PDF or DOC/DOCX, max 5MB',
      uploadCv: 'Upload CV',
      removeCv: 'Remove',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved successfully',
      error: 'Could not save. Try again.',
      browseJobs: 'Browse jobs',
      tipsTitle: 'CV & application tips',
      tipsContent: 'Keep your CV to 1–2 pages with clear sections. List your real job titles, employers, and dates. Include your contact details. If you don\'t have a CV, you can still apply using the fields below—uploading a CV is optional.',
      tipsBenefits: [
        'Experience: years and types (spa, hotel, freelance)',
        'Massage types and skills (e.g. Swedish, deep tissue)',
        'Languages you speak',
        'Short intro so employers see your communication style',
      ],
    },
    id: {
      title: 'Lamaran Pekerjaan',
      subtitle: 'Info dan CV Anda untuk lowongan employer',
      intro: 'Gunakan profil ini saat melamar dari halaman Massage Jobs. Employer dapat melihat pengalaman dan CV Anda.',
      experience: 'Pengalaman',
      experiencePlaceholder: 'Contoh: 5 tahun terapi pijat, pengalaman spa dan hotel',
      specialties: 'Keahlian',
      specialtiesPlaceholder: 'Contoh: Swedish, deep tissue, prenatal',
      coverLetter: 'Intro singkat untuk lamaran',
      coverLetterPlaceholder: 'Beberapa kalimat tentang Anda untuk employer',
      cvOptional: 'CV / Resume (opsional)',
      cvHint: 'PDF atau DOC/DOCX, maks 5MB',
      uploadCv: 'Unggah CV',
      removeCv: 'Hapus',
      save: 'Simpan',
      saving: 'Menyimpan...',
      saved: 'Berhasil disimpan',
      error: 'Gagal menyimpan. Coba lagi.',
      browseJobs: 'Cari lowongan',
      tipsTitle: 'Tips CV & lamaran',
      tipsContent: 'Usahakan CV 1–2 halaman dengan bagian yang jelas. Cantumkan jabatan, nama employer, dan tanggal. Sertakan kontak. Jika belum punya CV, Anda tetap bisa melamar lewat kolom di bawah—unggah CV bersifat opsional.',
      tipsBenefits: [
        'Pengalaman: tahun dan jenis (spa, hotel, freelance)',
        'Jenis pijat dan keahlian (mis. Swedish, deep tissue)',
        'Bahasa yang Anda kuasai',
        'Intro singkat agar employer melihat gaya komunikasi Anda',
      ],
    },
  };

  const t = labels[language] || labels.id;

  useEffect(() => {
    const load = async () => {
      if (!therapist?.$id && !therapist?.id) {
        setLoading(false);
        return;
      }
      try {
        const id = String(therapist.$id || therapist.id);
        const data = await therapistDashboardService.get(id);
        if (data) {
          setExperience(data.jobSeekerExperience || '');
          setSpecialties(data.jobSeekerSpecialties || '');
          setCoverLetter(data.jobSeekerCoverLetter || '');
          setCvUrl(data.cvUrl || '');
          setCvPreviewName(data.cvFileName || '');
        }
      } catch (e) {
        console.error('Load job application data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [therapist?.$id, therapist?.id]);

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > CV_MAX_SIZE_MB * 1024 * 1024) {
      showToast(`File max ${CV_MAX_SIZE_MB}MB`, 'error');
      return;
    }
    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      showToast('Only PDF or DOC/DOCX', 'error');
      return;
    }
    setCvFile(file);
    setCvPreviewName(file.name);
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setCvPreviewName('');
    setCvUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!therapist?.$id && !therapist?.id) return;
    const spamMsg = language === 'id' ? CONTACT_SPAM_MESSAGE_ID : CONTACT_SPAM_MESSAGE_EN;
    if (containsContactSpam(experience) || containsContactSpam(specialties) || containsContactSpam(coverLetter)) {
      showToast(spamMsg, 'error');
      return;
    }
    setSaving(true);
    try {
      const id = String(therapist.$id || therapist.id);
      let finalCvUrl = cvUrl;
      let finalCvFileName = cvPreviewName;

      if (cvFile) {
        setUploadingCv(true);
        const { url } = await therapistDashboardService.uploadCv(id, cvFile);
        finalCvUrl = url;
        finalCvFileName = cvFile.name;
        setUploadingCv(false);
        setCvFile(null);
        setCvUrl(url);
        setCvPreviewName(cvFile.name);
      }

      await therapistDashboardService.upsert(id, {
        jobSeekerExperience: experience,
        jobSeekerSpecialties: specialties,
        jobSeekerCoverLetter: coverLetter,
        cvUrl: finalCvUrl || undefined,
        cvFileName: finalCvFileName || undefined,
      });
      showToast(t.saved, 'success');
    } catch (err) {
      console.error('Save job application:', err);
      showToast(t.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = (page: string) => onNavigate?.(page);

  if (loading) {
    return (
      <TherapistSimplePageLayout
        title={t.title}
        subtitle={t.subtitle}
        onBackToStatus={onBack}
        onNavigate={handleNavigate}
        therapist={therapist}
        currentPage="therapist-job-applications"
        language={language}
        onLogout={onLogout}
        icon={<Briefcase className="w-6 h-6 text-orange-600" />}
      >
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-gray-600">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
            </div>
          </div>
        </div>
      </TherapistSimplePageLayout>
    );
  }

  return (
    <TherapistSimplePageLayout
      title={t.title}
      subtitle={t.subtitle}
      onBackToStatus={onBack}
      onNavigate={handleNavigate}
      therapist={therapist}
      currentPage="therapist-job-applications"
      language={language}
      onLogout={onLogout}
      icon={<Briefcase className="w-6 h-6 text-orange-600" />}
    >
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Intro card – same style as Payment Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-gray-900">{t.title}</h2>
                  <HelpTooltip
                    title={t.tipsTitle}
                    content={t.tipsContent}
                    benefits={t.tipsBenefits}
                    position="bottom"
                    size="sm"
                  />
                </div>
                <p className="text-sm text-gray-600">{t.intro}</p>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('massage-jobs')}
                    className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    → {t.browseJobs}
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Contact info from profile (read-only hint) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">Info dari profil Anda</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Nama, WhatsApp, dan email dari profil akan ikut saat Anda melamar.
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                <span>{therapist?.name || '–'}</span>
                <span>•</span>
                <span>{therapist?.whatsappNumber || therapist?.email || '–'}</span>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.experience}</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={t.experiencePlaceholder}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
              />
            </div>

            {/* Specialties */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.specialties}</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder={t.specialtiesPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
              />
            </div>

            {/* Cover letter */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.coverLetter}</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={t.coverLetterPlaceholder}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
              />
            </div>

            {/* Optional CV */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">{t.cvOptional}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">{t.cvHint}</p>
              {cvPreviewName ? (
                <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700 truncate">{cvPreviewName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveCv}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" /> {t.removeCv}
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
                  <Upload className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">{t.uploadCv}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || uploadingCv}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving || uploadingCv ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t.save}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </TherapistSimplePageLayout>
  );
};

export default TherapistJobApplicationsPage;
