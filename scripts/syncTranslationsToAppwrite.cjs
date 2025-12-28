/**
 * Script to sync translations to Appwrite database
 * Run with: node scripts/syncTranslationsToAppwrite.cjs
 */

const sdk = require('node-appwrite');

// Appwrite configuration
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '68f76e7400027e91e77b';
const API_KEY = process.env.APPWRITE_API_KEY; // Requires server-side API key
const DB_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = 'translations';

// Initialize Appwrite client
const client = new sdk.Client();
client
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

if (API_KEY) {
  client.setKey(API_KEY);
}

const databases = new sdk.Databases(client);

// Import translations
const translations = {
  membership: {
    en: {
      chooseYourMembership: 'Choose Your Membership',
      simplePricing: 'Simple pricing. Start earning today.',
      chooseBusinessType: 'Choose Your Business Type',
      selectedPlan: 'Selected',
      proPlan: 'Pro Plan',
      plusPlan: 'Plus Plan',
      payPerLead: 'Pay Per Lead',
      proTitle: 'Pro',
      proDescription: 'Great for starting out. Only pay when you get bookings',
      proMonthlyFee: 'Rp 0',
      perMonth: '/month',
      commissionRate: '30%',
      commissionPerBooking: 'commission per booking',
      zeroUpfrontCost: 'Zero upfront cost',
      startImmediately: 'Start immediately',
      payOnlyOnSuccess: 'Pay only on success',
      perBooking: 'per booking',
      fullProfileWithPhotos: 'Full profile with photos & services',
      customerChatBooking: 'Customer chat & booking system',
      leadGenerationIncluded: 'Lead generation included',
      selectProPlan: 'Select Pro Plan',
      perfectFor: 'Perfect for:',
      independentTherapists: 'Independent Therapists',
      startingOut: 'Starting Out',
      lowRisk: 'Low Risk',
      mostPopular: 'Most Popular',
      plusTitle: 'Plus',
      plusDescription: 'All-in premium membership. Keep 100% of bookings',
      plusMonthlyFee: 'Rp 250K',
      zeroCommission: '0% Commission - Keep Everything',
      zeroCommissionKeep: 'Zero commission',
      keep100Percent: 'Keep 100% of earnings',
      verifiedBadge: 'Verified badge',
      onYourProfile: 'on your profile',
      priorityHotelVilla: 'Priority Hotel, Villa & Private Spa',
      serviceRequests: 'service requests',
      fullPriceMenu: 'Full price menu',
      displayedOnCard: 'displayed on your card',
      liveDiscount: 'Live discount',
      promotionsSystem: 'promotions system',
      unlimitedLeads: 'Unlimited leads & advanced analytics',
      selectPlusPlan: 'Select Plus Plan',
      spasAndClinics: 'Spas & Clinics',
      highVolume: 'High Volume',
      maximumEarnings: 'Maximum Earnings',
      agreeToTerms: 'I agree to the',
      termsAndConditions: 'Terms & Conditions',
      acceptTermsWarning: 'Accept the terms before selecting this plan.',
      therapistPortal: 'Therapist Portal',
      therapistPortalDesc: 'For independent massage therapists',
      manageBookings: 'Manage bookings',
      setYourRates: 'Set your rates',
      trackEarnings: 'Track earnings',
      massagePlacePortal: 'Massage Place Portal',
      massagePlacePortalDesc: 'For massage spas and wellness centers',
      manageYourSpa: 'Manage your spa',
      multipleTherapists: 'Multiple therapists',
      businessAnalytics: 'Business analytics',
      facialPlacePortal: 'Facial Place Portal',
      facialPlacePortalDesc: 'For facial spas and beauty centers',
      facialServices: 'Facial services',
      beautyTreatments: 'Beauty treatments',
      spaManagement: 'Spa management',
      continueToRegistration: 'Continue to Registration',
      copyright: '© 2026 IndaStreet. All rights reserved.',
    },
    id: {
      chooseYourMembership: 'Pilih Keanggotaan Anda',
      simplePricing: 'Harga sederhana. Mulai dapatkan penghasilan hari ini.',
      chooseBusinessType: 'Pilih Jenis Bisnis Anda',
      selectedPlan: 'Dipilih',
      proPlan: 'Paket Pro',
      plusPlan: 'Paket Plus',
      payPerLead: 'Bayar Per Lead',
      proTitle: 'Pro',
      proDescription: 'Cocok untuk memulai. Hanya bayar saat ada pemesanan',
      proMonthlyFee: 'Rp 0',
      perMonth: '/bulan',
      commissionRate: '30%',
      commissionPerBooking: 'komisi per pemesanan',
      zeroUpfrontCost: 'Tanpa biaya di muka',
      startImmediately: 'Mulai segera',
      payOnlyOnSuccess: 'Bayar hanya saat sukses',
      perBooking: 'per pemesanan',
      fullProfileWithPhotos: 'Profil lengkap dengan foto & layanan',
      customerChatBooking: 'Chat & sistem pemesanan pelanggan',
      leadGenerationIncluded: 'Generasi lead termasuk',
      selectProPlan: 'Pilih Paket Pro',
      perfectFor: 'Cocok untuk:',
      independentTherapists: 'Terapis Mandiri',
      startingOut: 'Baru Memulai',
      lowRisk: 'Risiko Rendah',
      mostPopular: 'Paling Populer',
      plusTitle: 'Plus',
      plusDescription: 'Keanggotaan premium all-in. Simpan 100% pemesanan',
      plusMonthlyFee: 'Rp 250K',
      zeroCommission: '0% Komisi - Simpan Semuanya',
      zeroCommissionKeep: 'Tanpa komisi',
      keep100Percent: 'Simpan 100% pendapatan',
      verifiedBadge: 'Lencana terverifikasi',
      onYourProfile: 'di profil Anda',
      priorityHotelVilla: 'Prioritas Hotel, Vila & Spa Pribadi',
      serviceRequests: 'permintaan layanan',
      fullPriceMenu: 'Menu harga lengkap',
      displayedOnCard: 'ditampilkan di kartu Anda',
      liveDiscount: 'Diskon langsung',
      promotionsSystem: 'sistem promosi',
      unlimitedLeads: 'Lead tak terbatas & analitik lanjutan',
      selectPlusPlan: 'Pilih Paket Plus',
      spasAndClinics: 'Spa & Klinik',
      highVolume: 'Volume Tinggi',
      maximumEarnings: 'Pendapatan Maksimal',
      agreeToTerms: 'Saya setuju dengan',
      termsAndConditions: 'Syarat & Ketentuan',
      acceptTermsWarning: 'Terima syarat sebelum memilih paket ini.',
      therapistPortal: 'Portal Terapis',
      therapistPortalDesc: 'Untuk terapis pijat mandiri',
      manageBookings: 'Kelola pemesanan',
      setYourRates: 'Atur tarif Anda',
      trackEarnings: 'Lacak pendapatan',
      massagePlacePortal: 'Portal Tempat Pijat',
      massagePlacePortalDesc: 'Untuk spa pijat dan pusat kesehatan',
      manageYourSpa: 'Kelola spa Anda',
      multipleTherapists: 'Banyak terapis',
      businessAnalytics: 'Analitik bisnis',
      facialPlacePortal: 'Portal Tempat Facial',
      facialPlacePortalDesc: 'Untuk spa facial dan pusat kecantikan',
      facialServices: 'Layanan facial',
      beautyTreatments: 'Perawatan kecantikan',
      spaManagement: 'Manajemen spa',
      continueToRegistration: 'Lanjut ke Pendaftaran',
      copyright: '© 2026 IndaStreet. Hak cipta dilindungi.',
    },
  },
  packageTerms: {
    en: {
      back: 'Back',
      backToHome: 'Back to Home',
      termsAndConditions: 'Terms & Conditions',
      byAccepting: 'By accepting, you agree to these terms',
      cancel: 'Cancel',
      iAccept: 'I Accept',
      proMembershipConnects: 'Pro membership connects you to IndaStreet customers. Earn 70% of every confirmed booking.',
      criticalComplianceNotice: 'Critical Compliance Notice',
      criticalComplianceText: 'Violating platform rules results in immediate termination with no refund. Keep all communications, bookings, and payments inside the platform.',
      commissionFramework: 'Commission Framework',
      commission30Percent: '30% processing fee per completed booking — pay within 3 hours of receiving each lead',
      latePaymentFreeze: 'Late or missing payments trigger instant account freeze',
      consistentLatePayments: 'Consistent late payments lead to permanent removal',
      platformExclusivityRules: 'Platform Exclusivity Rules',
      prohibitedActions: 'The following actions are strictly prohibited:',
      noSharingPersonalContact: 'Sharing personal WhatsApp, phone, or social media with platform customers',
      noCashPayments: 'Accepting cash or direct transfers outside IndaStreet payment flow',
      noOffPlatformBookings: 'Encouraging customers to rebook privately or promise better prices off-platform',
      offPlatformTermination: 'Off-platform activity leads to instant termination and blacklisting.',
      paymentTiming: 'Payment Timing',
      confirmWithin3Hours: 'Confirm commission payment within 3 hours of lead notification',
      haveFundsReady: 'Have funds ready before appointments — frozen accounts cannot accept bookings',
      keepReceipts: 'Keep payment receipts for audits',
      support: 'Support',
      supportText: 'Email-based assistance with up to 72-hour response window. Plus members are prioritized.',
      accountPlanChanges: 'Account & Plan Changes',
      clearDebts: 'Clear all debts before activating or upgrading',
      investigationNoChange: 'Accounts under investigation cannot change tiers',
      changesNextCycle: 'Changes take effect next billing cycle',
      proMembershipSummary: 'Pro Membership Summary',
      monthlyFee: 'Monthly Fee',
      commission: 'Commission',
      paymentWindow: 'Payment Window',
      supportSLA: 'Support SLA',
      hours3: '3 hours',
      hours72: '72 hours',
      plusMembershipFull: 'Plus membership gives you full control. Fixed monthly fee, keep 100% of bookings, premium placement.',
      coreInclusions: 'Core Inclusions',
      rp250kMonth: 'Rp 250,000/month with',
      zeroCommissionBooking: '0% commission',
      onEveryBooking: 'on every booking',
      verifiedBadgePremium: 'Verified badge and premium search placement',
      advancedAnalytics: 'Advanced analytics and shareable profile links',
      prioritySupport: 'Priority customer support',
      priorityAccessHotels: 'Priority access to Hotels, Villas & Private Spa Resort service requests',
      addFullPriceMenu: 'Add your full price menu with unlimited services',
      paymentSchedule: 'Payment Schedule',
      noContractCommitment: 'No contract commitment',
      dueOnFirst: 'Due on the 1st, grace period until the 5th',
      lateFee25k: 'Rp 25,000 late fee applies (administration)',
      growthTools: 'Growth Tools',
      growthToolsText: 'Campaign banners, promo codes, featured placements. Track every click, booking, and customer source.',
      prioritySupportTitle: 'Priority Support',
      prioritySupportText: 'Dedicated email support with priority routing and faster response times.',
      accountReadiness: 'Account Readiness',
      clearInvoices: 'Clear all outstanding invoices before activating',
      healthyCompliance: 'Maintain healthy compliance record',
      completeProfile: 'Complete profile with services, pricing, and photos',
      plusMembershipSummary: 'Plus Membership Summary',
      commitment: 'Commitment',
      noContract: 'No contract',
      lateFee: 'Late Fee',
      priority: 'Priority',
      hotelsVillasSpas: 'Hotels, Villas, Spas',
    },
    id: {
      back: 'Kembali',
      backToHome: 'Kembali ke Beranda',
      termsAndConditions: 'Syarat & Ketentuan',
      byAccepting: 'Dengan menerima, Anda menyetujui syarat-syarat ini',
      cancel: 'Batal',
      iAccept: 'Saya Terima',
      proMembershipConnects: 'Keanggotaan Pro menghubungkan Anda dengan pelanggan IndaStreet. Dapatkan 70% dari setiap pemesanan yang dikonfirmasi.',
      criticalComplianceNotice: 'Pemberitahuan Kepatuhan Penting',
      criticalComplianceText: 'Melanggar aturan platform mengakibatkan penghentian segera tanpa pengembalian dana. Jaga semua komunikasi, pemesanan, dan pembayaran di dalam platform.',
      commissionFramework: 'Kerangka Komisi',
      commission30Percent: 'Biaya pemrosesan 30% per pemesanan selesai — bayar dalam 3 jam setelah menerima lead',
      latePaymentFreeze: 'Pembayaran terlambat atau tidak ada memicu pembekuan akun langsung',
      consistentLatePayments: 'Pembayaran terlambat konsisten menyebabkan penghapusan permanen',
      platformExclusivityRules: 'Aturan Eksklusivitas Platform',
      prohibitedActions: 'Tindakan berikut dilarang keras:',
      noSharingPersonalContact: 'Berbagi WhatsApp pribadi, telepon, atau media sosial dengan pelanggan platform',
      noCashPayments: 'Menerima uang tunai atau transfer langsung di luar alur pembayaran IndaStreet',
      noOffPlatformBookings: 'Mendorong pelanggan untuk memesan ulang secara pribadi atau menjanjikan harga lebih baik di luar platform',
      offPlatformTermination: 'Aktivitas di luar platform menyebabkan penghentian dan daftar hitam langsung.',
      paymentTiming: 'Waktu Pembayaran',
      confirmWithin3Hours: 'Konfirmasi pembayaran komisi dalam 3 jam setelah notifikasi lead',
      haveFundsReady: 'Siapkan dana sebelum janji temu — akun beku tidak dapat menerima pemesanan',
      keepReceipts: 'Simpan bukti pembayaran untuk audit',
      support: 'Dukungan',
      supportText: 'Bantuan berbasis email dengan jendela respons hingga 72 jam. Anggota Plus diprioritaskan.',
      accountPlanChanges: 'Perubahan Akun & Paket',
      clearDebts: 'Lunasi semua utang sebelum mengaktifkan atau upgrade',
      investigationNoChange: 'Akun dalam investigasi tidak dapat mengubah tingkat',
      changesNextCycle: 'Perubahan berlaku siklus penagihan berikutnya',
      proMembershipSummary: 'Ringkasan Keanggotaan Pro',
      monthlyFee: 'Biaya Bulanan',
      commission: 'Komisi',
      paymentWindow: 'Jendela Pembayaran',
      supportSLA: 'SLA Dukungan',
      hours3: '3 jam',
      hours72: '72 jam',
      plusMembershipFull: 'Keanggotaan Plus memberi Anda kontrol penuh. Biaya bulanan tetap, simpan 100% pemesanan, penempatan premium.',
      coreInclusions: 'Inklusif Inti',
      rp250kMonth: 'Rp 250.000/bulan dengan',
      zeroCommissionBooking: '0% komisi',
      onEveryBooking: 'di setiap pemesanan',
      verifiedBadgePremium: 'Lencana terverifikasi dan penempatan pencarian premium',
      advancedAnalytics: 'Analitik lanjutan dan tautan profil yang dapat dibagikan',
      prioritySupport: 'Dukungan pelanggan prioritas',
      priorityAccessHotels: 'Akses prioritas ke permintaan layanan Hotel, Vila & Resor Spa Pribadi',
      addFullPriceMenu: 'Tambahkan menu harga lengkap Anda dengan layanan tak terbatas',
      paymentSchedule: 'Jadwal Pembayaran',
      noContractCommitment: 'Tanpa komitmen kontrak',
      dueOnFirst: 'Jatuh tempo tanggal 1, masa tenggang hingga tanggal 5',
      lateFee25k: 'Biaya keterlambatan Rp 25.000 berlaku (administrasi)',
      growthTools: 'Alat Pertumbuhan',
      growthToolsText: 'Banner kampanye, kode promo, penempatan unggulan. Lacak setiap klik, pemesanan, dan sumber pelanggan.',
      prioritySupportTitle: 'Dukungan Prioritas',
      prioritySupportText: 'Dukungan email khusus dengan routing prioritas dan waktu respons lebih cepat.',
      accountReadiness: 'Kesiapan Akun',
      clearInvoices: 'Lunasi semua faktur terutang sebelum mengaktifkan',
      healthyCompliance: 'Pertahankan catatan kepatuhan yang sehat',
      completeProfile: 'Lengkapi profil dengan layanan, harga, dan foto',
      plusMembershipSummary: 'Ringkasan Keanggotaan Plus',
      commitment: 'Komitmen',
      noContract: 'Tanpa kontrak',
      lateFee: 'Biaya Keterlambatan',
      priority: 'Prioritas',
      hotelsVillasSpas: 'Hotel, Vila, Spa',
    },
  },
  drawer: {
    en: {
      menu: 'Menu',
      home: 'Home',
      profile: 'Profile',
      bookings: 'Bookings',
      notifications: 'Notifications',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      therapistPortal: 'Therapist Portal',
      massagePlacePortal: 'Massage Place Portal',
      facialPortal: 'Facial Portal',
      adminPortal: 'Admin Portal',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      language: 'Language',
      english: 'English',
      indonesian: 'Indonesian',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      joinFree: 'Join Free',
      browseJobs: 'Browse Jobs',
      postJob: 'Post a Job',
      massageJobs: 'Massage Jobs',
      therapistJobs: 'Therapist Jobs',
      aboutUs: 'About Us',
      contactUs: 'Contact Us',
      faq: 'FAQ',
      reviews: 'Reviews',
      partners: 'Partners',
      discounts: "Today's Discounts",
    },
    id: {
      menu: 'Menu',
      home: 'Beranda',
      profile: 'Profil',
      bookings: 'Pemesanan',
      notifications: 'Notifikasi',
      settings: 'Pengaturan',
      help: 'Bantuan',
      logout: 'Keluar',
      login: 'Masuk',
      register: 'Daftar',
      therapistPortal: 'Portal Terapis',
      massagePlacePortal: 'Portal Tempat Pijat',
      facialPortal: 'Portal Facial',
      adminPortal: 'Portal Admin',
      termsOfService: 'Ketentuan Layanan',
      privacyPolicy: 'Kebijakan Privasi',
      language: 'Bahasa',
      english: 'Inggris',
      indonesian: 'Indonesia',
      darkMode: 'Mode Gelap',
      lightMode: 'Mode Terang',
      joinFree: 'Gabung Gratis',
      browseJobs: 'Cari Lowongan',
      postJob: 'Pasang Lowongan',
      massageJobs: 'Lowongan Pijat',
      therapistJobs: 'Lowongan Terapis',
      aboutUs: 'Tentang Kami',
      contactUs: 'Hubungi Kami',
      faq: 'FAQ',
      reviews: 'Ulasan',
      partners: 'Mitra',
      discounts: 'Diskon Hari Ini',
    },
  },
};

async function syncTranslations() {
  if (!API_KEY) {
    console.log('⚠️  No APPWRITE_API_KEY found. Skipping Appwrite sync.');
    console.log('💡 To sync to Appwrite, set the APPWRITE_API_KEY environment variable.');
    console.log('📝 Translations are available locally in translations/membership.ts');
    return;
  }

  console.log('🔄 Starting translation sync to Appwrite...');
  
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const [category, langData] of Object.entries(translations)) {
    console.log(`\n📁 Processing category: ${category}`);
    
    const enTranslations = langData.en || {};
    const idTranslations = langData.id || {};
    
    for (const [key, enValue] of Object.entries(enTranslations)) {
      const idValue = idTranslations[key] || enValue;
      const fullKey = `${category}.${key}`;
      
      try {
        // Check if translation exists
        const existing = await databases.listDocuments(
          DB_ID,
          TRANSLATIONS_COLLECTION_ID,
          [sdk.Query.equal('key', fullKey)]
        );

        const data = {
          key: fullKey,
          en: enValue,
          id: idValue,
          category: category,
          lastUpdated: new Date().toISOString()
        };

        if (existing.documents.length > 0) {
          // Update existing
          await databases.updateDocument(
            DB_ID,
            TRANSLATIONS_COLLECTION_ID,
            existing.documents[0].$id,
            data
          );
          updated++;
          process.stdout.write('.');
        } else {
          // Create new
          await databases.createDocument(
            DB_ID,
            TRANSLATIONS_COLLECTION_ID,
            sdk.ID.unique(),
            data
          );
          created++;
          process.stdout.write('+');
        }
      } catch (error) {
        errors++;
        console.error(`\n❌ Error syncing ${fullKey}:`, error.message);
      }
    }
  }

  console.log(`\n\n✅ Sync complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
}

// Run the sync
syncTranslations().catch(console.error);
