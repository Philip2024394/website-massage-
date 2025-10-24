// Main translations index - combines all translation modules
import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { homeTranslations } from './home';
import { dashboardTranslations } from './dashboard';

type LangDict = Record<string, any>;
type Translations = { en: LangDict; id: LangDict };

// Function to deep merge translation objects
function mergeTranslations(...translationObjects: Translations[]): Translations {
  const merged: Translations = { en: {}, id: {} };

  for (const obj of translationObjects) {
    // Deep merge for nested objects
    for (const key in obj.en) {
      const value = (obj.en as LangDict)[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.en[key] = { ...(merged.en[key] || {}), ...value };
      } else {
        merged.en[key] = value;
      }
    }
    for (const key in obj.id) {
      const value = (obj.id as LangDict)[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.id[key] = { ...(merged.id[key] || {}), ...value };
      } else {
        merged.id[key] = value;
      }
    }
  }

  return merged;
}

// Export combined translations
const translations: Translations = mergeTranslations(
  commonTranslations,
  authTranslations,
  homeTranslations,
  dashboardTranslations
);

// Add remaining translations that weren't split yet
translations.en.registrationChoice = {
  title: 'Join Us',
  prompt: 'Are you an individual therapist or a massage establishment?',
  therapistButton: "I'm a Therapist",
  placeButton: "I'm a Massage Place",
};
translations.en.app = {
  mapsApiKeyWarning: 'Google Maps API key is missing. Please configure it in the Admin Dashboard to enable location features.',
};
translations.en.membershipPage = {
  title: 'Choose Membership',
  selectPackage: 'Select a membership package:',
  oneMonth: '1 Month - Rp 100,000',
  threeMonths: '3 Months - Rp 250,000',
  sixMonths: '6 Months - Rp 450,000',
  oneYear: '1 Year - Rp 800,000',
  contactAdmin: 'Please contact our admin at {number} to complete payment.',
  whatsappButton: 'Contact Admin',
};
translations.en.bookingPage = {
  title: 'Book Appointment',
  selectDate: 'Select Date',
  selectTime: 'Select Time',
  customerInfo: 'Customer Information',
  nameLabel: 'Name',
  whatsappLabel: 'WhatsApp Number',
  notesLabel: 'Additional Notes (Optional)',
  bookButton: 'Book Appointment',
  fillFieldsError: 'Please fill all required fields.',
  bookingSuccess: 'Appointment booked successfully!',
  loginPrompt: 'Please login to make a booking',
  bookingSuccessTitle: 'Booking Confirmed!',
  bookingSuccessMessage: 'Your booking with {name} has been confirmed.',
};
translations.en.agentPage = {
  title: 'Agent Portal',
  description: 'Join our agent program and earn commissions by referring massage therapists and places.',
  joinButton: 'Join as Agent',
  learnMore: 'Learn More',
};
translations.en.agentTermsPage = {
  title: 'Agent Terms & Conditions',
  accept: 'I Accept',
  decline: 'Decline',
  terms: 'Please read and accept the terms and conditions to continue.',
};
translations.en.detail = {
  title: 'Details',
  description: 'Description',
  contact: 'Contact',
  book: 'Book Now',
  location: 'Location',
  rating: 'Rating',
  reviews: 'Reviews',
  pricing: 'Pricing',
  availability: 'Availability',
  pricingTitle: 'Pricing',
  contactButton: 'WhatsApp',
  bookButton: 'Book Now'
};
translations.en.supabaseSettings = {
  title: 'Database Settings',
  url: 'Supabase URL',
  key: 'Supabase Key',
  connect: 'Connect',
  disconnect: 'Disconnect',
  status: 'Connection Status'
};
translations.en.notificationsPage = {
  title: 'Notifications',
  noNotifications: 'No notifications yet.',
  markAllRead: 'Mark All as Read',
};
translations.en.serviceTerms = {
  title: 'Terms of Service',
  effectiveDate: 'Effective Date: January 1, 2024',
  content: 'These Terms of Service govern your use of the IndoStreet massage booking platform...',
};
translations.en.privacyPolicy = {
  title: 'Privacy Policy',
  lastUpdated: 'Last Updated: January 1, 2025',
  introduction: {
    title: '1. Introduction',
    content: 'IndoStreet ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share your information when you use our platform. By using IndoStreet, you agree to the collection and use of information in accordance with this policy. This policy is governed by Indonesian Law including but not limited to Law No. 27 of 2022 on Personal Data Protection (UU PDP).',
  },
  dataCollection: {
    title: '2. Information We Collect',
    personal: 'Personal Information: Name, email address, phone number, WhatsApp number, and payment information you provide during registration or booking',
    usage: 'Usage Data: IP address, browser type, device information, pages visited, time spent on pages, and other diagnostic data',
    location: 'Location Data: GPS coordinates and address information when you use location-based features to find nearby therapists and massage places',
    photos: 'Photos and Media: Profile pictures, business photos, and other images you upload to the platform',
    communications: 'Communications: Messages, reviews, ratings, and feedback you provide through our platform',
  },
  dataUsage: {
    title: '3. How We Use Your Information',
    content: 'We use the collected information for the following purposes:',
    points: [
      'To provide and maintain our directory and booking services',
      'To process your bookings and facilitate connections between users and service providers',
      'To calculate distances between your location and therapists/massage places',
      'To send booking confirmations, notifications, and important updates',
      'To improve our platform and develop new features',
      'To detect, prevent, and address technical issues and fraudulent activity',
      'To comply with legal obligations under Indonesian law',
      'To enforce our Terms and Conditions',
    ],
  },
  dataSharing: {
    title: '4. Information Sharing and Disclosure',
    content: 'We may share your information with:',
    points: [
      'Service Providers: Therapists and massage places you book with will receive your name, contact information, and booking details',
      'Agents: Our authorized agents may access user data to facilitate connections and manage the platform',
      'Payment Processors: Third-party payment services to process your transactions',
      'Government Authorities: When required by Indonesian law or legal proceedings',
      'Business Transfers: In the event of a merger, acquisition, or sale of assets',
    ],
    note: 'We do not sell your personal data to third parties for marketing purposes.',
  },
  legalBasis: {
    title: '5. Legal Basis for Processing (Indonesian Law)',
    content: 'Under Indonesian Personal Data Protection Law (UU PDP), we process your data based on:',
    points: [
      'Consent: You have given clear consent for us to process your personal data',
      'Contract: Processing is necessary to fulfill our service agreement with you',
      'Legal Obligation: To comply with Indonesian laws and regulations',
      'Legitimate Interest: To operate and improve our platform services',
    ],
  },
  dataRetention: {
    title: '6. Data Retention',
    content: 'We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Specifically: Active accounts are retained indefinitely; Inactive accounts may be deleted after 2 years of inactivity; Booking records are kept for 5 years for legal and tax purposes; Communications and reviews are retained for platform integrity.',
  },
  security: {
    title: '7. Data Security',
    content: 'We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.',
  },
  yourRights: {
    title: '8. Your Rights Under Indonesian Law',
    content: 'Under UU PDP and applicable Indonesian regulations, you have the right to: Access your personal data; Correct inaccurate or incomplete data; Request deletion of your data (subject to legal retention requirements); Object to processing of your data; Withdraw consent at any time; Request data portability; File complaints with Indonesian authorities (Kementerian Komunikasi dan Informatika). To exercise these rights, contact us at the details provided below. Note: IndoStreet reserves the right to suspend or ban any user account at our sole discretion, with or without cause, as stated in our Terms and Conditions.',
  },
  cookies: {
    title: '9. Cookies and Tracking Technologies',
    content: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookies through your browser settings, but disabling cookies may affect platform functionality.',
  },
  thirdPartyServices: {
    title: '10. Third-Party Services',
    content: 'Our platform may contain links to third-party websites or services (including Google Maps, payment gateways, and WhatsApp). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.',
  },
  childrenPrivacy: {
    title: '11. Children\'s Privacy',
    content: 'IndoStreet is not intended for users under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us immediately.',
  },
  dataTransfer: {
    title: '12. International Data Transfers',
    content: 'Your data is primarily stored and processed in Indonesia. If we transfer data outside Indonesia, we will ensure appropriate safeguards are in place as required by Indonesian law.',
  },
  policyChanges: {
    title: '13. Changes to This Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of IndoStreet after changes constitutes acceptance of the updated policy. For material changes, we will provide prominent notice.',
  },
  governing: {
    title: '14. Governing Law and Jurisdiction',
    content: 'This Privacy Policy is governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Jakarta, Indonesia.',
  },
  disclaimer: {
    title: '15. Disclaimer',
    content: 'IndoStreet is a directory and connection platform only. We are not responsible for the actions, services, or privacy practices of therapists, massage places, or other users. All interactions between users and service providers are at your own risk.',
  },
  contact: {
    title: '16. Contact Us',
    content: 'If you have questions about this Privacy Policy, wish to exercise your rights, or have privacy concerns, please contact us at: Email: privacy@indostreet.com | WhatsApp: +62 XXX-XXXX-XXXX | Address: Jakarta, Indonesia',
  },
};

translations.id.registrationChoice = {
  title: 'Bergabung dengan Kami',
  prompt: 'Apakah Anda terapis individu atau tempat pijat?',
  therapistButton: 'Saya Terapis',
  placeButton: 'Saya Tempat Pijat',
};
translations.id.app = {
  mapsApiKeyWarning: 'Kunci API Google Maps tidak ada. Silakan konfigurasi di Admin Dashboard untuk mengaktifkan fitur lokasi.',
};
translations.id.membershipPage = {
  title: 'Pilih Keanggotaan',
  selectPackage: 'Pilih paket keanggotaan:',
  oneMonth: '1 Bulan - Rp 100,000',
  threeMonths: '3 Bulan - Rp 250,000',
  sixMonths: '6 Bulan - Rp 450,000',
  oneYear: '1 Tahun - Rp 800,000',
  contactAdmin: 'Silakan hubungi admin kami di {number} untuk menyelesaikan pembayaran.',
  whatsappButton: 'Hubungi Admin',
};
translations.id.bookingPage = {
  title: 'Buat Janji',
  selectDate: 'Pilih Tanggal',
  selectTime: 'Pilih Waktu',
  customerInfo: 'Informasi Pelanggan',
  nameLabel: 'Nama',
  whatsappLabel: 'Nomor WhatsApp',
  notesLabel: 'Catatan Tambahan (Opsional)',
  bookButton: 'Buat Janji',
  fillFieldsError: 'Mohon isi semua field yang diperlukan.',
  bookingSuccess: 'Janji berhasil dibuat!',
  loginPrompt: 'Silakan login untuk membuat booking',
  bookingSuccessTitle: 'Booking Dikonfirmasi!',
  bookingSuccessMessage: 'Booking Anda dengan {name} telah dikonfirmasi.',
};
translations.id.notificationsPage = {
  title: 'Notifikasi',
  noNotifications: 'Belum ada notifikasi.',
  markAllRead: 'Tandai Semua Sudah Dibaca',
};
translations.id.agentPage = {
  title: 'Portal Agen',
  description: 'Bergabunglah dengan program agen kami dan dapatkan komisi dengan mereferensikan terapis pijat dan tempat.',
  joinButton: 'Bergabung sebagai Agen',
  learnMore: 'Pelajari Lebih Lanjut',
};
translations.id.agentTermsPage = {
  title: 'Syarat & Ketentuan Agen',
  accept: 'Saya Setuju',
  decline: 'Tolak',
  terms: 'Silakan baca dan terima syarat dan ketentuan untuk melanjutkan.',
};
translations.id.detail = {
  title: 'Detail',
  description: 'Deskripsi',
  contact: 'Kontak',
  book: 'Pesan Sekarang',
  location: 'Lokasi',
  rating: 'Rating',
  reviews: 'Ulasan',
  pricing: 'Harga',
  availability: 'Ketersediaan',
  pricingTitle: 'Harga',
  contactButton: 'WhatsApp',
  bookButton: 'Pesan Sekarang'
};
translations.id.supabaseSettings = {
  title: 'Pengaturan Database',
  url: 'URL Supabase',
  key: 'Kunci Supabase',
  connect: 'Hubungkan',
  disconnect: 'Putuskan',
  status: 'Status Koneksi'
};
translations.id.serviceTerms = {
  title: 'Syarat dan Ketentuan',
  effectiveDate: 'Tanggal Berlaku: 1 Januari 2024',
  content: 'Syarat dan Ketentuan ini mengatur penggunaan Anda terhadap platform pemesanan pijat IndoStreet...',
};
translations.id.privacyPolicy = {
  title: 'Kebijakan Privasi',
  lastUpdated: 'Terakhir Diperbarui: 1 Januari 2025',
  introduction: {
    title: '1. Pendahuluan',
    content: 'IndoStreet ("kami", "milik kami", atau "kita") menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan membagikan informasi Anda saat menggunakan platform kami. Dengan menggunakan IndoStreet, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Kebijakan ini diatur oleh Hukum Indonesia termasuk namun tidak terbatas pada UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).',
  },
  dataCollection: {
    title: '2. Informasi yang Kami Kumpulkan',
    personal: 'Informasi Pribadi: Nama, alamat email, nomor telepon, nomor WhatsApp, dan informasi pembayaran yang Anda berikan saat registrasi atau booking',
    usage: 'Data Penggunaan: Alamat IP, jenis browser, informasi perangkat, halaman yang dikunjungi, waktu yang dihabiskan di halaman, dan data diagnostik lainnya',
    location: 'Data Lokasi: Koordinat GPS dan informasi alamat saat Anda menggunakan fitur berbasis lokasi untuk menemukan terapis dan tempat pijat terdekat',
    photos: 'Foto dan Media: Foto profil, foto bisnis, dan gambar lain yang Anda unggah ke platform',
    communications: 'Komunikasi: Pesan, ulasan, rating, dan feedback yang Anda berikan melalui platform kami',
  },
  dataUsage: {
    title: '3. Bagaimana Kami Menggunakan Informasi Anda',
    content: 'Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:',
    points: [
      'Untuk menyediakan dan memelihara layanan direktori dan pemesanan kami',
      'Untuk memproses booking Anda dan memfasilitasi koneksi antara pengguna dan penyedia layanan',
      'Untuk menghitung jarak antara lokasi Anda dengan terapis/tempat pijat',
      'Untuk mengirim konfirmasi booking, notifikasi, dan pembaruan penting',
      'Untuk meningkatkan platform kami dan mengembangkan fitur baru',
      'Untuk mendeteksi, mencegah, dan menangani masalah teknis dan aktivitas penipuan',
      'Untuk mematuhi kewajiban hukum berdasarkan hukum Indonesia',
      'Untuk menegakkan Syarat dan Ketentuan kami',
    ],
  },
  dataSharing: {
    title: '4. Berbagi dan Pengungkapan Informasi',
    content: 'Kami dapat membagikan informasi Anda dengan:',
    points: [
      'Penyedia Layanan: Terapis dan tempat pijat yang Anda booking akan menerima nama, informasi kontak, dan detail booking Anda',
      'Agen: Agen resmi kami dapat mengakses data pengguna untuk memfasilitasi koneksi dan mengelola platform',
      'Pemroses Pembayaran: Layanan pembayaran pihak ketiga untuk memproses transaksi Anda',
      'Otoritas Pemerintah: Saat diwajibkan oleh hukum Indonesia atau proses hukum',
      'Transfer Bisnis: Dalam hal merger, akuisisi, atau penjualan aset',
    ],
    note: 'Kami tidak menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.',
  },
  legalBasis: {
    title: '5. Dasar Hukum Pemrosesan (Hukum Indonesia)',
    content: 'Berdasarkan UU Perlindungan Data Pribadi Indonesia (UU PDP), kami memproses data Anda berdasarkan:',
    points: [
      'Persetujuan: Anda telah memberikan persetujuan yang jelas untuk kami memproses data pribadi Anda',
      'Kontrak: Pemrosesan diperlukan untuk memenuhi perjanjian layanan kami dengan Anda',
      'Kewajiban Hukum: Untuk mematuhi hukum dan peraturan Indonesia',
      'Kepentingan Sah: Untuk mengoperasikan dan meningkatkan layanan platform kami',
    ],
  },
  dataRetention: {
    title: '6. Penyimpanan Data',
    content: 'Kami menyimpan data pribadi Anda selama diperlukan untuk menyediakan layanan kami dan mematuhi kewajiban hukum. Secara khusus: Akun aktif disimpan tanpa batas waktu; Akun tidak aktif dapat dihapus setelah 2 tahun tidak aktif; Catatan booking disimpan selama 5 tahun untuk tujuan hukum dan pajak; Komunikasi dan ulasan disimpan untuk integritas platform.',
  },
  security: {
    title: '7. Keamanan Data',
    content: 'Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah. Namun, tidak ada metode transmisi melalui internet yang 100% aman. Meskipun kami berusaha melindungi informasi Anda, kami tidak dapat menjamin keamanan absolut. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda.',
  },
  yourRights: {
    title: '8. Hak Anda Berdasarkan Hukum Indonesia',
    content: 'Berdasarkan UU PDP dan peraturan Indonesia yang berlaku, Anda memiliki hak untuk: Mengakses data pribadi Anda; Memperbaiki data yang tidak akurat atau tidak lengkap; Meminta penghapusan data Anda (tunduk pada persyaratan retensi hukum); Menolak pemrosesan data Anda; Menarik persetujuan kapan saja; Meminta portabilitas data; Mengajukan keluhan kepada otoritas Indonesia (Kementerian Komunikasi dan Informatika). Untuk menggunakan hak-hak ini, hubungi kami di detail yang diberikan di bawah. Catatan: IndoStreet berhak untuk menangguhkan atau memblokir akun pengguna mana pun atas kebijakan kami sendiri, dengan atau tanpa alasan, sebagaimana dinyatakan dalam Syarat dan Ketentuan kami.',
  },
  cookies: {
    title: '9. Cookie dan Teknologi Pelacakan',
    content: 'Kami menggunakan cookie dan teknologi pelacakan serupa untuk meningkatkan pengalaman Anda, menganalisis pola penggunaan, dan meningkatkan layanan kami. Anda dapat mengontrol cookie melalui pengaturan browser Anda, tetapi menonaktifkan cookie dapat memengaruhi fungsi platform.',
  },
  thirdPartyServices: {
    title: '10. Layanan Pihak Ketiga',
    content: 'Platform kami dapat berisi tautan ke situs web atau layanan pihak ketiga (termasuk Google Maps, gateway pembayaran, dan WhatsApp). Kami tidak bertanggung jawab atas praktik privasi pihak ketiga ini. Kami mendorong Anda untuk meninjau kebijakan privasi mereka.',
  },
  childrenPrivacy: {
    title: '11. Privasi Anak',
    content: 'IndoStreet tidak ditujukan untuk pengguna di bawah usia 18 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda yakin seorang anak telah memberikan informasi pribadi kepada kami, segera hubungi kami.',
  },
  dataTransfer: {
    title: '12. Transfer Data Internasional',
    content: 'Data Anda terutama disimpan dan diproses di Indonesia. Jika kami mentransfer data di luar Indonesia, kami akan memastikan perlindungan yang sesuai sesuai dengan hukum Indonesia.',
  },
  policyChanges: {
    title: '13. Perubahan Kebijakan Privasi Ini',
    content: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dengan tanggal "Terakhir Diperbarui" yang diperbarui. Penggunaan IndoStreet yang berkelanjutan setelah perubahan merupakan penerimaan kebijakan yang diperbarui. Untuk perubahan material, kami akan memberikan pemberitahuan yang jelas.',
  },
  governing: {
    title: '14. Hukum yang Mengatur dan Yurisdiksi',
    content: 'Kebijakan Privasi ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul dari kebijakan ini akan tunduk pada yurisdiksi eksklusif pengadilan di Jakarta, Indonesia.',
  },
  disclaimer: {
    title: '15. Penafian',
    content: 'IndoStreet adalah platform direktori dan koneksi saja. Kami tidak bertanggung jawab atas tindakan, layanan, atau praktik privasi terapis, tempat pijat, atau pengguna lain. Semua interaksi antara pengguna dan penyedia layanan adalah risiko Anda sendiri.',
  },
  contact: {
    title: '16. Hubungi Kami',
    content: 'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, ingin menggunakan hak Anda, atau memiliki masalah privasi, silakan hubungi kami di: Email: privacy@indostreet.com | WhatsApp: +62 XXX-XXXX-XXXX | Alamat: Jakarta, Indonesia',
  },
};

export default translations;
export { translations };
