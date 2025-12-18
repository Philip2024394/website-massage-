import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { translations, getStoredLanguage } from '../translations';

interface PrivacyPolicyPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack, onNavigate }) => {
  const [language, setLanguage] = useState<'en' | 'id'>(getStoredLanguage());
  const t = translations[language].auth;
  
  useEffect(() => {
    const handleStorageChange = () => setLanguage(getStoredLanguage());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-[9997] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <button
              onClick={onBack}
              className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 flex items-center justify-center"
              title="Back to Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.privacyPolicy}</h1>
          <p className="text-sm text-gray-500">{language === 'id' ? 'Terakhir diperbarui: 18 Desember 2025' : 'Last updated: December 18, 2025'}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'id' ? '1. Pendahuluan' : '1. Introduction'}</h2>
            <p className="text-gray-700 leading-relaxed">
              {language === 'id' 
                ? 'IndaStreet ("kami", "milik kami", atau "kita") menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan membagikan informasi Anda saat menggunakan platform kami.'
                : 'Welcome to IndaStreet ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website and mobile applications (collectively, the "Services").'
              }
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              {language === 'id'
                ? 'Dengan menggunakan IndaStreet, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Jika Anda tidak setuju dengan kebijakan kami, mohon jangan gunakan layanan kami.'
                : 'By using our Services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Services.'
              }
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'id' ? '2. Informasi yang Kami Kumpulkan' : '2. Information We Collect'}</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{language === 'id' ? '2.1 Informasi Pribadi' : '2.1 Personal Information'}</h3>
            <p className="text-gray-700 leading-relaxed mb-2">{language === 'id' ? 'Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela saat Anda:' : 'We collect personal information that you voluntarily provide to us when you:'}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{language === 'id' ? 'Mendaftar akun (nama, alamat email, password)' : 'Register for an account (name, email address, password)'}</li>
              <li>{language === 'id' ? 'Membuat profil profesional (nama bisnis, layanan yang ditawarkan, lokasi, nomor telepon)' : 'Create a professional profile (business name, services offered, location, phone number)'}</li>
              <li>{language === 'id' ? 'Membuat atau menerima booking (detail kontak, preferensi layanan)' : 'Make or receive bookings (contact details, service preferences)'}</li>
              <li>{language === 'id' ? 'Memproses pembayaran (informasi pembayaran diproses melalui penyedia pihak ketiga yang aman)' : 'Process payments (payment information processed through secure third-party providers)'}</li>
              <li>{language === 'id' ? 'Menghubungi layanan pelanggan (korespondensi, feedback)' : 'Contact customer support (correspondence, feedback)'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">{language === 'id' ? '2.2 Informasi yang Dikumpulkan Secara Otomatis' : '2.2 Automatically Collected Information'}</h3>
            <p className="text-gray-700 leading-relaxed mb-2">{language === 'id' ? 'Saat Anda menggunakan Layanan kami, kami secara otomatis mengumpulkan informasi tertentu, termasuk:' : 'When you use our Services, we automatically collect certain information, including:'}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{language === 'id' ? 'Informasi perangkat (alamat IP, jenis browser, sistem operasi)' : 'Device information (IP address, browser type, operating system)'}</li>
              <li>{language === 'id' ? 'Data penggunaan (halaman yang dilihat, waktu yang dihabiskan, pola klik)' : 'Usage data (pages viewed, time spent, click patterns)'}</li>
              <li>{language === 'id' ? 'Data lokasi (jika Anda memberikan izin)' : 'Location data (if you grant permission)'}</li>
              <li>{language === 'id' ? 'Cookie dan teknologi pelacakan serupa' : 'Cookies and similar tracking technologies)'}</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'id' ? '3. Bagaimana Kami Menggunakan Informasi Anda' : '3. How We Use Your Information'}</h2>
            <p className="text-gray-700 leading-relaxed mb-2">{language === 'id' ? 'Kami menggunakan informasi Anda untuk tujuan berikut:' : 'We use your information for the following purposes:'}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{language === 'id' ? 'Penyediaan Layanan:' : 'Service Delivery:'}</strong> {language === 'id' ? 'Untuk menyediakan, memelihara, dan meningkatkan Layanan kami, termasuk memfasilitasi booking dan koneksi antara penyedia layanan dan pelanggan' : 'To provide, maintain, and improve our Services, including facilitating bookings and connections between service providers and customers'}</li>
              <li><strong>{language === 'id' ? 'Manajemen Akun:' : 'Account Management:'}</strong> {language === 'id' ? 'Untuk membuat dan mengelola akun Anda, memverifikasi identitas Anda, dan menyediakan dukungan pelanggan' : 'To create and manage your account, verify your identity, and provide customer support'}</li>
              <li><strong>{language === 'id' ? 'Pembayaran:' : 'Payments:'}</strong> {language === 'id' ? 'Untuk memproses transaksi, mengelola langganan, dan menghitung komisi' : 'To process transactions, manage subscriptions, and calculate commissions'}</li>
              <li><strong>{language === 'id' ? 'Komunikasi:' : 'Communications:'}</strong> {language === 'id' ? 'Untuk mengirim notifikasi terkait layanan, konfirmasi booking, dan komunikasi pemasaran (dengan persetujuan Anda)' : 'To send you service-related notifications, booking confirmations, and marketing communications (with your consent)'}</li>
              <li><strong>{language === 'id' ? 'Keamanan:' : 'Safety and Security:'}</strong> {language === 'id' ? 'Untuk mendeteksi dan mencegah penipuan, penyalahgunaan, dan insiden keamanan' : 'To detect and prevent fraud, abuse, and security incidents'}</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-2">We may share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Between Platform Users</h3>
            <p className="text-gray-700 leading-relaxed">
              When you make or accept a booking, we share relevant information between service providers and customers to facilitate the service (e.g., names, contact details, location).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.2 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed">
              We work with third-party service providers who perform services on our behalf, including payment processing, data hosting, analytics, customer support, and marketing. These providers are contractually obligated to protect your information.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.3 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.4 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law, court order, or governmental authority, or to protect our rights, safety, or property.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.5 With Your Consent</h3>
            <p className="text-gray-700 leading-relaxed">
              We may share your information for other purposes with your explicit consent.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and audits</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Account information: Retained while your account is active and for a reasonable period thereafter</li>
              <li>Booking records: Retained for 7 years for tax and legal compliance</li>
              <li>Marketing data: Retained until you withdraw consent</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-2">Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where we rely on consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, please contact us at <a href="mailto:indastreet.id@gmail.com" className="text-orange-500 hover:underline">indastreet.id@gmail.com</a>. We will respond to your request within 30 days.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookies through your browser settings, but disabling cookies may affect the functionality of our Services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">Types of cookies we use:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> Necessary for the Services to function</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Services</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our website and updating the "Last updated" date. Your continued use of our Services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'id' ? '13. Hubungi Kami' : '13. Contact Us'}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {language === 'id' 
                ? 'Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini atau praktik data kami, silakan hubungi kami:'
                : 'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:'
              }
            </p>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <p className="font-semibold text-gray-900 mb-2">IndaStreet Platform</p>
              <p className="text-gray-700">Email: <a href="mailto:indastreet.id@gmail.com" className="text-orange-500 hover:underline font-medium">indastreet.id@gmail.com</a></p>
              <p className="text-gray-700 mt-1">Website: www.indastreetmassage.com</p>
            </div>
          </section>

          {/* GDPR Notice */}
          <section className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">European Users (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local data protection authority. Our lawful basis for processing your information includes: contract performance, legitimate interests, consent, and legal obligations.
            </p>
          </section>

          {/* California Notice */}
          <section className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mt-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">California Residents (CCPA)</h2>
            <p className="text-gray-700 leading-relaxed">
              California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information. We do not sell your personal information. To exercise your rights, contact us at <a href="mailto:indastreet.id@gmail.com" className="text-orange-500 hover:underline">indastreet.id@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-8 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Back to Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;