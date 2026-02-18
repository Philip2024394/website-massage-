// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
/**
 * HowItWorksPage - Informational page about platform processes
 * Read-only content explaining bookings, payments, and notifications
 * 
 * @ts-expect-error - lucide-react ForwardRefExoticComponent incompatible with React 19 types
 * Component functions correctly at runtime. Type fix pending lucide-react or @types/react update.
 */
import React from 'react';
import { BookOpen } from 'lucide-react';
import TherapistSimplePageLayout from '../../components/therapist/TherapistSimplePageLayout';

interface HowItWorksPageProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  language?: 'en' | 'id';
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ therapist, onBack, onNavigate, language = 'id' }) => {
  const handleBackToStatus = () => {
    onNavigate?.('therapist-status');
  };

  return (
    <TherapistSimplePageLayout
      title="How It Works"
      subtitle="Booking flow via WhatsApp"
      onBackToStatus={handleBackToStatus}
      onNavigate={onNavigate}
      therapist={therapist}
      currentPage="therapist-how-it-works"
      icon={<BookOpen className="w-6 h-6 text-orange-600" />}
      language={language}
    >
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Icon Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Cara Kerja
          </h1>
          <p className="text-lg text-gray-600 text-center mb-8">
            Booking via WhatsApp
          </p>

          {/* Main Content - WhatsApp booking flow */}
          <div className="prose prose-gray max-w-none">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-8 border border-orange-200">
              <p className="text-gray-800 leading-relaxed mb-0">
                Semua pemesanan layanan Anda dilakukan melalui <strong>WhatsApp</strong>. Pelanggan memilih &quot;Book via WhatsApp&quot; di profil Anda; admin IndaStreet mengoordinasikan dan mengonfirmasi booking. Anda melihat jadwal dan notifikasi di dashboard ini.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Alur Booking via WhatsApp
              </h2>
              <ol className="space-y-3 mb-4">
                <li className="flex items-start"><span className="font-semibold text-orange-600 mr-2">1.</span><span className="text-gray-700">Pelanggan melihat profil Anda di app dan mengetuk <strong>Book via WhatsApp</strong></span></li>
                <li className="flex items-start"><span className="font-semibold text-orange-600 mr-2">2.</span><span className="text-gray-700">WhatsApp terbuka ke admin dengan pesan berisi nama Anda, ID, layanan, dan lokasi pelanggan</span></li>
                <li className="flex items-start"><span className="font-semibold text-orange-600 mr-2">3.</span><span className="text-gray-700">Admin IndaStreet mengoordinasikan dengan Anda dan mengonfirmasi booking</span></li>
                <li className="flex items-start"><span className="font-semibold text-orange-600 mr-2">4.</span><span className="text-gray-700">Anda menerima notifikasi dan melihat booking di <strong>Bookings</strong> serta kalender di dashboard</span></li>
              </ol>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Dashboard Anda
              </h2>
              <p className="text-gray-700 mb-3">Gunakan menu di samping untuk:</p>
              <ul className="space-y-2 mb-4">
                <li className="text-gray-700"><strong>Online Status</strong> — Atur Available/Busy</li>
                <li className="text-gray-700"><strong>Bookings</strong> — Lihat dan kelola pemesanan (termasuk kalender)</li>
                <li className="text-gray-700"><strong>Menu Prices</strong> — Edit layanan dan harga</li>
                <li className="text-gray-700"><strong>Notifications</strong> — Notifikasi sistem dan pembaruan jadwal</li>
                <li className="text-gray-700"><strong>Analytics</strong> — Ringkasan aktivitas</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Profil & Ketersediaan
              </h2>
              <p className="text-gray-700 mb-2">Jaga profil tetap lengkap (foto, deskripsi, harga) dan atur status <strong>Available</strong> saat siap menerima booking. Admin dapat mengatur Anda sebagai Busy untuk jangka waktu tertentu setelah booking WhatsApp.</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Butuh Bantuan?
              </h2>
              <p className="text-gray-700">Untuk masalah booking, jadwal, atau pembayaran, hubungi dukungan IndaStreet melalui dashboard atau WhatsApp admin.</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
              <p className="text-xl font-bold text-center text-gray-900">Semua booking melalui WhatsApp — admin siap membantu Anda.</p>
            </div>
          </div>

          {/* Social Media Links - same style as app footer */}
          <div className="mt-8 flex justify-center items-center gap-6">
            {[
              { name: 'TikTok', url: 'https://www.tiktok.com/@indastreet.team?is_from_webapp=1&sender_device=pc', imgSrc: 'https://ik.imagekit.io/7grri5v7d/tik%20tok.png' },
              { name: 'Facebook', url: 'https://www.facebook.com/share/g/1C2QCPTp62/', imgSrc: 'https://ik.imagekit.io/7grri5v7d/facebook.png' },
              { name: 'Instagram', url: 'https://www.instagram.com/indastreet.id/', imgSrc: 'https://ik.imagekit.io/7grri5v7d/instagrame.png' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-110 active:scale-95 hover:opacity-80 p-2 rounded-xl hover:bg-white hover:shadow-md"
                aria-label={social.name}
                title={`Follow us on ${social.name}`}
              >
                <img
                  src={social.imgSrc}
                  alt={social.name}
                  className="w-14 h-14 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </main>
    </TherapistSimplePageLayout>
  );
};

export default HowItWorksPage;
