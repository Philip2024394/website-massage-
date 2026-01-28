/**
 * HowItWorksPage - Informational page about platform processes
 * Read-only content explaining bookings, payments, and notifications
 * 
 * @ts-expect-error - lucide-react ForwardRefExoticComponent incompatible with React 19 types
 * Component functions correctly at runtime. Type fix pending lucide-react or @types/react update.
 */
import React from 'react';
import { BookOpen } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';

interface HowItWorksPageProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ therapist, onBack, onNavigate }) => {
  const handleBackToStatus = () => {
    onNavigate?.('therapist-status');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <TherapistPageHeader
        title="How It Works"
        subtitle="Learn about bookings, payments, and notifications"
        onBackToStatus={handleBackToStatus}
      />

      {/* Main Content */}
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
            Panduan Dashboard Terapis
          </p>

          {/* Main Content */}
          <div className="prose prose-gray max-w-none">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 mb-8 border border-orange-200">
              <p className="text-gray-800 leading-relaxed mb-0">
                Selamat datang di IndaStreetmassage — kami senang Anda bergabung sebagai profesional terverifikasi di platform kami.
                Halaman ini menjelaskan secara detail apa yang terjadi ketika pengguna memesan layanan Anda, cara kerja pembayaran, 
                dan bagaimana notifikasi ditangani, sehingga tidak ada kejutan.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Jenis Pemesanan di IndaStreetmassage
              </h2>
              <p className="text-gray-700 mb-4">Ada dua cara pengguna dapat memesan Anda:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">⚡</span>
                    <p className="font-bold text-blue-900 text-lg">Pesan Sekarang</p>
                  </div>
                  <p className="text-blue-800 text-sm">Pemesanan instan untuk pijat segera</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-5">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">📅</span>
                    <p className="font-bold text-purple-900 text-lg">Booking Terjadwal</p>
                  </div>
                  <p className="text-purple-800 text-sm">Pemesanan di masa depan dengan uang muka 30%</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-900 font-semibold">⚠️ Perbedaan Penting:</p>
                <ul className="mt-2 space-y-1 text-yellow-800 text-sm">
                  <li>• <strong>Pesan Sekarang:</strong> Timer 5 menit, tidak ada uang muka</li>
                  <li>• <strong>Booking Terjadwal:</strong> Konfirmasi instan, uang muka 30% (tidak dapat dikembalikan)</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Pesan Sekarang (Pemesanan Instan)
              </h2>
              <p className="text-gray-700 mb-4">Pesan Sekarang untuk pengguna yang menginginkan pijat segera.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cara kerja:</h3>
              <ol className="space-y-3 mb-4">
                <li className="flex items-start">
                  <span className="font-semibold text-orange-600 mr-2">1.</span>
                  <span className="text-gray-700">Pengguna mengklik <strong>Pesan Sekarang</strong> di profil Anda</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-orange-600 mr-2">2.</span>
                  <div>
                    <span className="text-gray-700 block mb-2">Anda menerima:</span>
                    <ul className="ml-4 space-y-1">
                      <li className="text-gray-600">• Notifikasi instan</li>
                      <li className="text-gray-600">• <strong>Timer hitung mundur 5 menit</strong> (WAJIB: Terima atau Tolak sebelum waktu habis)</li>
                      <li className="text-gray-600">• <strong>🔊 Peringatan suara MP3</strong> diputar otomatis agar tidak terlewat</li>
                    </ul>
                  </div>
                </li>
              </ol>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-orange-900 mb-2 flex items-center">
                  <span className="text-xl mr-2">⏰</span>
                  Timer 5 Menit - Sangat Penting!
                </h4>
                <p className="text-orange-800 mb-2">
                  Saat pemesanan masuk, <strong>timer hitung mundur 5 menit</strong> langsung dimulai. 
                  Anda HARUS merespons sebelum timer habis.
                </p>
                <ul className="space-y-1 text-orange-700 text-sm">
                  <li>✓ Notifikasi suara MP3 diputar otomatis</li>
                  <li>✓ Timer ditampilkan di layar dashboard Anda</li>
                  <li>✓ Jika tidak merespons dalam 5 menit → Pemesanan kadaluarsa</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pilihan Anda:</h3>
              <div className="space-y-2 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">✅ Terima pemesanan</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 font-medium">❌ Tolak pemesanan</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-medium">⏱️ Jika Anda tidak merespons dalam 5 menit, pemesanan akan otomatis kedaluwarsa dan pengguna dapat memesan terapis lain.</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pembayaran:</h3>
              <ul className="space-y-2">
                <li className="text-gray-700">• Pengguna membayar Anda secara langsung untuk layanan pijat Anda</li>
                <li className="text-gray-700">• IndaStreetmassage menerapkan <strong>komisi platform 30%</strong></li>
                <li className="text-gray-700">• Penghasilan Anda dicatat di dashboard Anda</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Pemesanan Terjadwal (Pemesanan Masa Depan)
              </h2>
              <p className="text-gray-700 mb-4">Pemesanan terjadwal memungkinkan pengguna memesan Anda di muka.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cara kerja:</h3>
              <ol className="space-y-2 mb-4">
                <li className="text-gray-700">1. Pengguna memilih tanggal & waktu di masa depan</li>
                <li className="text-gray-700">2. Pengguna membayar <strong>uang muka 30% yang tidak dapat dikembalikan</strong></li>
                <li className="text-gray-700">3. Pemesanan dikonfirmasi secara instan</li>
              </ol>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-900 mb-2">💰 Uang Muka 30% - TIDAK DAPAT DIKEMBALIKAN</h3>
                <p className="text-red-800 mb-2">
                  Untuk pemesanan terjadwal, pengguna WAJIB membayar <strong>uang muka 30%</strong> dari total harga sebelum konfirmasi.
                </p>
                <ul className="space-y-1">
                  <li className="text-red-800">• Uang muka <strong>TIDAK DAPAT DIKEMBALIKAN</strong> dalam kondisi apapun</li>
                  <li className="text-red-800">• Uang muka ini mengamankan waktu dan ketersediaan Anda</li>
                  <li className="text-red-800">• Sisa 70% dibayar sesuai aturan platform (langsung ke terapis)</li>
                  <li className="text-red-800">• Uang muka dibayar oleh pengguna <strong>sebelum booking dikonfirmasi</strong></li>
                </ul>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                  <span className="text-xl mr-2">🏦</span>
                  Detail Bank Diperlukan (Aktivasi Booking Terjadwal)
                </h4>
                <p className="text-blue-800 mb-2">
                  Untuk menerima pemesanan terjadwal, Anda WAJIB mengisi detail bank di halaman <strong>Payment Info</strong>.
                </p>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>✓ Nama Bank (contoh: BCA, Mandiri, BNI)</li>
                  <li>✓ Nama Pemilik Rekening (sesuai KTP)</li>
                  <li>✓ Nomor Rekening</li>
                </ul>
                <p className="text-blue-900 font-semibold mt-2">
                  ⚠️ Tanpa detail bank, tombol "Terima" untuk booking terjadwal akan diblokir oleh sistem.
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Detail bank ditampilkan di chat kepada pelanggan saat booking dikonfirmasi untuk pembayaran sisa 70%.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notifikasi:</h3>
              <p className="text-gray-700 mb-2">Pengingat otomatis dikirim ke:</p>
              <ul className="space-y-1 mb-2">
                <li className="text-gray-700">• Terapis</li>
                <li className="text-gray-700">• Tempat (jika berlaku)</li>
                <li className="text-gray-700">• Pengguna</li>
              </ul>
              <p className="text-gray-600 italic">Notifikasi dikirim <strong>5 jam sebelum pemesanan</strong> agar tidak ada yang lupa</p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                Komisi & Biaya Platform (Indonesia)
              </h2>
              <p className="text-gray-700 mb-4">Untuk semua akun berbasis Indonesia:</p>
              <div className="space-y-2 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-900 font-medium">✅ Terapis: komisi 30%</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-900 font-medium">✅ Tempat: komisi 30%</p>
                </div>
              </div>
              <p className="text-gray-700 mb-2">Tidak ada tingkat tersembunyi atau tarif variabel.</p>
              <p className="text-gray-900 font-semibold">Komisi 30% berlaku untuk semua pemesanan, baik Pesan Sekarang maupun Terjadwal.</p>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
                Tempat vs Pemesanan Terapis
              </h2>
              <p className="text-gray-700 mb-3">Jika Anda terkait dengan Tempat:</p>
              <ul className="space-y-2">
                <li className="text-gray-700">• Alur pemesanan tetap sama</li>
                <li className="text-gray-700">• Notifikasi dikirim ke terapis dan tempat</li>
                <li className="text-gray-700">• Penghasilan dan komisi ditangani secara otomatis</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
                Verifikasi KTP & Badge Kepercayaan
              </h2>
              <p className="text-gray-700 mb-4">
                Verifikasi identitas meningkatkan kepercayaan pelanggan dan meningkatkan pemesanan hingga 60%.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cara Upload KTP:</h3>
              <ol className="space-y-2 mb-4">
                <li className="text-gray-700">1. Buka halaman <strong>Payment Info</strong> di dashboard Anda</li>
                <li className="text-gray-700">2. Upload foto KTP yang jelas (JPG/PNG)</li>
                <li className="text-gray-700">3. Klik <strong>Simpan</strong></li>
              </ol>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">3 Status Badge Verifikasi:</h3>
              <div className="space-y-3 mb-4">
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      Menunggu Verifikasi
                    </span>
                    <span className="text-orange-700 font-semibold">🟠 Badge Oranye</span>
                  </div>
                  <p className="text-orange-800 text-sm">
                    <strong>Ditampilkan SEGERA</strong> setelah Anda upload KTP. Menunjukkan kepada pelanggan bahwa Anda sedang dalam proses verifikasi.
                  </p>
                </div>

                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-2">
                      Terverifikasi
                    </span>
                    <span className="text-green-700 font-semibold">🟢 Badge Hijau</span>
                  </div>
                  <p className="text-green-800 text-sm">
                    Ditampilkan setelah admin IndaStreetmassage menyetujui KTP Anda. Badge ini <strong>meningkatkan kepercayaan pelanggan</strong> dan menghasilkan lebih banyak pemesanan.
                  </p>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-red-700 font-semibold">🔴 Ditolak</span>
                  </div>
                  <p className="text-red-800 text-sm mb-2">
                    Jika KTP Anda ditolak, badge akan disembunyikan dan Anda akan menerima alasan penolakan.
                  </p>
                  <p className="text-red-700 text-sm font-semibold">
                    ✓ Upload ulang KTP yang lebih jelas untuk verifikasi ulang
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-900 font-semibold">📊 Badge Verifikasi = +60% Pemesanan</p>
                <p className="text-purple-700 text-sm mt-1">
                  Profil terverifikasi menerima lebih banyak kepercayaan dan pemesanan dibandingkan profil tanpa verifikasi.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
                Visibilitas Profil Penting
              </h2>
              <p className="text-gray-700 mb-4">Profil yang lengkap berkinerja jauh lebih baik.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ Foto profil profesional</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ Deskripsi layanan yang jelas</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ Harga yang akurat</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ Ketersediaan tetap diperbarui</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ KTP terverifikasi (badge hijau)</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">✔ Detail bank lengkap</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-900 font-semibold">📈 Profil yang lengkap menerima hingga 80% lebih banyak lalu lintas dibandingkan profil dasar.</p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">8</span>
                Keandalan & Penggunaan yang Adil
              </h2>
              <p className="text-gray-700 mb-4">Untuk menjaga platform tetap terpercaya dan adil:</p>
              <ul className="space-y-2 mb-4">
                <li className="text-gray-700">• Terima pemesanan hanya saat tersedia</li>
                <li className="text-gray-700">• Hindari pembatalan mendadak berulang</li>
                <li className="text-gray-700">• Jaga notifikasi tetap aktif</li>
                <li className="text-gray-700">• Tiba tepat waktu untuk pemesanan terjadwal</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-900 font-medium">⚠️ Kegagalan mengikuti aturan platform dapat mempengaruhi visibilitas profil.</p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">9</span>
                Butuh Bantuan?
              </h2>
              <p className="text-gray-700 mb-3">Jika Anda mengalami:</p>
              <ul className="space-y-1 mb-4">
                <li className="text-gray-700">• Masalah pemesanan</li>
                <li className="text-gray-700">• Masalah notifikasi</li>
                <li className="text-gray-700">• Pertanyaan pembayaran</li>
              </ul>
              <p className="text-gray-900 font-semibold">Silakan hubungi Dukungan IndaStreetmassage melalui dashboard Anda.</p>
            </div>

            {/* Final Note */}
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Catatan Akhir</h2>
              <p className="mb-4 text-gray-700">IndaStreetmassage dibangun untuk:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="mr-2 text-gray-700">✓</span>
                  <span className="text-gray-700">Melindungi waktu terapis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-700">✓</span>
                  <span className="text-gray-700">Mengurangi ketidakhadiran</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-700">✓</span>
                  <span className="text-gray-700">Meningkatkan kualitas pemesanan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-700">✓</span>
                  <span className="text-gray-700">Menyediakan sistem profesional dan terpercaya untuk Indonesia dan pengguna internasional</span>
                </li>
              </ul>
              <p className="text-xl font-bold text-center text-gray-900">Kami senang bertumbuh bersama Anda 🚀</p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-8 flex justify-center items-center space-x-6">
            <a 
              href="https://www.tiktok.com/@indastreet.team?is_from_webapp=1&sender_device=pc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
              aria-label="TikTok kami"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/share/g/1C2QCPTp62/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
              aria-label="Facebook kami"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/indastreet.id/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
              aria-label="Instagram kami"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;
