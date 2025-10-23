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
  effectiveDate: 'Effective Date: January 1, 2024',
  content: 'This Privacy Policy describes how we collect, use, and protect your personal information...',
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
  effectiveDate: 'Tanggal Berlaku: 1 Januari 2024',
  content: 'Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda...',
};

export default translations;
export { translations };
