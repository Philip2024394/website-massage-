/**
 * Translation Upload Script
 * Uploads all translations to Appwrite in organized sections
 * 
 * Usage: ts-node scripts/uploadTranslations.ts
 */

import { translationsService } from '../lib/appwrite/services/translation.service';

// ============================================
// TRANSLATION DATA - ORGANIZED BY SECTION
// ============================================

const TRANSLATIONS = {
  // ==================== COMMON ====================
  common: {
    id: {
      // Buttons
      'button.save': 'Simpan',
      'button.cancel': 'Batal',
      'button.confirm': 'Konfirmasi',
      'button.close': 'Tutup',
      'button.back': 'Kembali',
      'button.next': 'Selanjutnya',
      'button.submit': 'Kirim',
      'button.edit': 'Edit',
      'button.delete': 'Hapus',
      'button.view': 'Lihat',
      'button.select': 'Pilih',
      
      // Status
      'status.available': 'Tersedia',
      'status.busy': 'Sibuk',
      'status.offline': 'Offline',
      'status.online': 'Online',
      'status.loading': 'Memuat...',
      'status.error': 'Terjadi kesalahan',
      'status.success': 'Berhasil',
      
      // Time
      'time.minutes': 'menit',
      'time.hours': 'jam',
      'time.days': 'hari',
      'time.now': 'Sekarang',
      'time.today': 'Hari Ini',
      'time.tomorrow': 'Besok',
      
      // Common Labels
      'label.rating': 'Penilaian',
      'label.reviews': 'Ulasan',
      'label.distance': 'Jarak',
      'label.location': 'Lokasi',
      'label.price': 'Harga',
      'label.duration': 'Durasi',
      'label.name': 'Nama',
      'label.phone': 'Telepon',
      'label.email': 'Email',
      'label.address': 'Alamat',
      
      // Messages
      'message.noResults': 'Tidak ada hasil ditemukan',
      'message.tryAgain': 'Silakan coba lagi',
      'message.required': 'Wajib diisi',
      'message.invalid': 'Tidak valid',
    },
    en: {
      // Buttons
      'button.save': 'Save',
      'button.cancel': 'Cancel',
      'button.confirm': 'Confirm',
      'button.close': 'Close',
      'button.back': 'Back',
      'button.next': 'Next',
      'button.submit': 'Submit',
      'button.edit': 'Edit',
      'button.delete': 'Delete',
      'button.view': 'View',
      'button.select': 'Select',
      
      // Status
      'status.available': 'Available',
      'status.busy': 'Busy',
      'status.offline': 'Offline',
      'status.online': 'Online',
      'status.loading': 'Loading...',
      'status.error': 'An error occurred',
      'status.success': 'Success',
      
      // Time
      'time.minutes': 'minutes',
      'time.hours': 'hours',
      'time.days': 'days',
      'time.now': 'Now',
      'time.today': 'Today',
      'time.tomorrow': 'Tomorrow',
      
      // Common Labels
      'label.rating': 'Rating',
      'label.reviews': 'Reviews',
      'label.distance': 'Distance',
      'label.location': 'Location',
      'label.price': 'Price',
      'label.duration': 'Duration',
      'label.name': 'Name',
      'label.phone': 'Phone',
      'label.email': 'Email',
      'label.address': 'Address',
      
      // Messages
      'message.noResults': 'No results found',
      'message.tryAgain': 'Please try again',
      'message.required': 'Required',
      'message.invalid': 'Invalid',
    }
  },

  // ==================== HOMEPAGE ====================
  homepage: {
    id: {
      'header.title': 'Selamat Datang di Indastreet',
      'header.subtitle': 'Platform Terapi & Wellness Terbaik',
      
      'tabs.therapists': 'Terapis',
      'tabs.places': 'Tempat Pijat',
      'tabs.facials': 'Klinik Kecantikan',
      
      'filter.availableNow': 'Tersedia Sekarang',
      'filter.allLocations': 'Semua Lokasi',
      'filter.selectCity': 'Pilih Kota',
      
      'search.placeholder': 'Cari terapis, tempat, atau layanan...',
      'search.noResults': 'Tidak ada hasil yang cocok dengan pencarian Anda',
      'search.loading': 'Mencari...',
      
      'card.bookNow': 'Pesan Sekarang',
      'card.viewProfile': 'Lihat Profil',
      'card.viewMenu': 'Lihat Menu',
    },
    en: {
      'header.title': 'Welcome to Indastreet',
      'header.subtitle': 'Best Therapy & Wellness Platform',
      
      'tabs.therapists': 'Therapists',
      'tabs.places': 'Massage Places',
      'tabs.facials': 'Beauty Clinics',
      
      'filter.availableNow': 'Available Now',
      'filter.allLocations': 'All Locations',
      'filter.selectCity': 'Select City',
      
      'search.placeholder': 'Search therapists, places, or services...',
      'search.noResults': 'No results match your search',
      'search.loading': 'Searching...',
      
      'card.bookNow': 'Book Now',
      'card.viewProfile': 'View Profile',
      'card.viewMenu': 'View Menu',
    }
  },

  // ==================== THERAPIST ====================
  therapist: {
    id: {
      'card.menuHarga': 'Menu Harga',
      'card.experiencedIn': 'Berpengalaman Dalam',
      'card.languages': 'Bahasa',
      'card.accepts': 'Menerima',
      'card.reportProfile': 'Laporkan Profil',
      
      'profile.about': 'Tentang',
      'profile.specializations': 'Spesialisasi',
      'profile.experience': 'Pengalaman',
      'profile.certifications': 'Sertifikasi',
      'profile.reviews': 'Ulasan',
      
      'menu.serviceTitle': 'Harga Layanan',
      'menu.60min': '60 menit',
      'menu.90min': '90 menit',
      'menu.120min': '120 menit',
      'menu.selectDuration': 'Pilih Durasi',
    },
    en: {
      'card.menuHarga': 'Price Menu',
      'card.experiencedIn': 'Experienced In',
      'card.languages': 'Languages',
      'card.accepts': 'Accepts',
      'card.reportProfile': 'Report Profile',
      
      'profile.about': 'About',
      'profile.specializations': 'Specializations',
      'profile.experience': 'Experience',
      'profile.certifications': 'Certifications',
      'profile.reviews': 'Reviews',
      
      'menu.serviceTitle': 'Service Prices',
      'menu.60min': '60 minutes',
      'menu.90min': '90 minutes',
      'menu.120min': '120 minutes',
      'menu.selectDuration': 'Select Duration',
    }
  },

  // ==================== BOOKING ====================
  booking: {
    id: {
      'form.title': 'Detail Booking',
      'form.yourName': 'Nama Anda',
      'form.whatsappNumber': 'Nomor WhatsApp',
      'form.yourLocation': 'Lokasi Anda',
      'form.selectDuration': 'Pilih Durasi Pijatan',
      'form.selectTime': 'Pilih Waktu',
      'form.roomNumber': 'Nomor Kamar (Opsional)',
      
      'button.activateChat': 'Aktifkan Chat',
      'button.confirmBooking': 'Konfirmasi Booking',
      'button.scheduleBooking': 'Jadwalkan Booking',
      
      'message.bookingConfirmed': 'Booking Dikonfirmasi!',
      'message.chatActivated': 'Chat Diaktifkan',
      'message.depositNotice': '30% Deposit booking mungkin diminta',
      
      'status.pending': 'Menunggu Konfirmasi',
      'status.confirmed': 'Dikonfirmasi',
      'status.onTheWay': 'Dalam Perjalanan',
      'status.arrived': 'Sudah Tiba',
      'status.completed': 'Selesai',
      'status.cancelled': 'Dibatalkan',
      
      'privacy.whatsappNotice': 'Nomor WhatsApp Anda pribadi dan hanya akan digunakan oleh admin',
    },
    en: {
      'form.title': 'Booking Details',
      'form.yourName': 'Your Name',
      'form.whatsappNumber': 'WhatsApp Number',
      'form.yourLocation': 'Your Location',
      'form.selectDuration': 'Select Massage Duration',
      'form.selectTime': 'Select Time',
      'form.roomNumber': 'Room Number (Optional)',
      
      'button.activateChat': 'Activate Chat',
      'button.confirmBooking': 'Confirm Booking',
      'button.scheduleBooking': 'Schedule Booking',
      
      'message.bookingConfirmed': 'Booking Confirmed!',
      'message.chatActivated': 'Chat Activated',
      'message.depositNotice': '30% Booking deposit may be requested',
      
      'status.pending': 'Pending Confirmation',
      'status.confirmed': 'Confirmed',
      'status.onTheWay': 'On The Way',
      'status.arrived': 'Arrived',
      'status.completed': 'Completed',
      'status.cancelled': 'Cancelled',
      
      'privacy.whatsappNotice': 'Your WhatsApp number is private and will only be used by admin',
    }
  },

  // ==================== PLACE ====================
  place: {
    id: {
      'card.openNow': 'Buka Sekarang',
      'card.closed': 'Tutup',
      'card.therapists': 'Terapis',
      'card.amenities': 'Fasilitas',
      
      'profile.hours': 'Jam Operasional',
      'profile.contact': 'Kontak',
      'profile.amenities': 'Fasilitas',
      'profile.about': 'Tentang Kami',
      'profile.photos': 'Foto',
      
      'booking.selectTherapist': 'Pilih Terapis',
      'booking.selectService': 'Pilih Layanan',
    },
    en: {
      'card.openNow': 'Open Now',
      'card.closed': 'Closed',
      'card.therapists': 'Therapists',
      'card.amenities': 'Amenities',
      
      'profile.hours': 'Operating Hours',
      'profile.contact': 'Contact',
      'profile.amenities': 'Amenities',
      'profile.about': 'About Us',
      'profile.photos': 'Photos',
      
      'booking.selectTherapist': 'Select Therapist',
      'booking.selectService': 'Select Service',
    }
  },

  // ==================== FOOTER ====================
  footer: {
    id: {
      'about.title': 'Tentang Kami',
      'about.description': 'Platform wellness & terapi terpercaya di Indonesia',
      
      'links.aboutUs': 'Tentang Kami',
      'links.contact': 'Kontak',
      'links.terms': 'Syarat & Ketentuan',
      'links.privacy': 'Kebijakan Privasi',
      'links.careers': 'Karir',
      'links.faq': 'FAQ',
      
      'providers.title': 'Untuk Penyedia Layanan',
      'providers.joinAsTherapist': 'Bergabung sebagai Terapis',
      'providers.joinAsPlace': 'Daftarkan Tempat Anda',
      'providers.pricing': 'Harga',
      
      'copyright': '© 2025 Indastreet. Hak Cipta Dilindungi.',
    },
    en: {
      'about.title': 'About Us',
      'about.description': 'Trusted wellness & therapy platform in Indonesia',
      
      'links.aboutUs': 'About Us',
      'links.contact': 'Contact',
      'links.terms': 'Terms & Conditions',
      'links.privacy': 'Privacy Policy',
      'links.careers': 'Careers',
      'links.faq': 'FAQ',
      
      'providers.title': 'For Service Providers',
      'providers.joinAsTherapist': 'Join as Therapist',
      'providers.joinAsPlace': 'Register Your Place',
      'providers.pricing': 'Pricing',
      
      'copyright': '© 2025 Indastreet. All Rights Reserved.',
    }
  },
};

// ============================================
// UPLOAD FUNCTIONS
// ============================================

async function uploadSection(sectionName: string, sectionData: any) {
  console.log(`\n📦 Uploading ${sectionName} section...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [lang, keys] of Object.entries(sectionData)) {
    console.log(`  └─ Language: ${lang.toUpperCase()}`);
    
    for (const [key, value] of Object.entries(keys as Record<string, string>)) {
      const fullKey = `${sectionName}.${key}`;
      
      try {
        await translationsService.set(lang, fullKey, value);
        console.log(`     ✅ ${fullKey}`);
        successCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`     ❌ ${fullKey}:`, error);
        errorCount++;
      }
    }
  }
  
  return { successCount, errorCount };
}

async function uploadAllTranslations() {
  console.log('🚀 Starting translation upload to Appwrite...\n');
  console.log('⏱️  This may take a few minutes...\n');
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  for (const [sectionName, sectionData] of Object.entries(TRANSLATIONS)) {
    const { successCount, errorCount } = await uploadSection(sectionName, sectionData);
    totalSuccess += successCount;
    totalErrors += errorCount;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Upload Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Success: ${totalSuccess}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📝 Total: ${totalSuccess + totalErrors}`);
  console.log('='.repeat(50) + '\n');
  
  if (totalErrors === 0) {
    console.log('🎉 All translations uploaded successfully!');
  } else {
    console.log('⚠️  Some translations failed. Please review errors above.');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function clearAllTranslations() {
  console.log('🗑️  Clearing all existing translations...');
  // Implementation depends on your needs
  console.log('⚠️  Manual deletion recommended via Appwrite Console');
}

async function exportTranslations() {
  console.log('📤 Exporting translations from Appwrite...');
  const allTranslations = await translationsService.getAll();
  console.log(JSON.stringify(allTranslations, null, 2));
}

// ============================================
// MAIN EXECUTION
// ============================================

const command = process.argv[2];

switch (command) {
  case 'upload':
    uploadAllTranslations();
    break;
  case 'export':
    exportTranslations();
    break;
  case 'clear':
    clearAllTranslations();
    break;
  default:
    console.log('Usage:');
    console.log('  ts-node scripts/uploadTranslations.ts upload   - Upload all translations');
    console.log('  ts-node scripts/uploadTranslations.ts export   - Export existing translations');
    console.log('  ts-node scripts/uploadTranslations.ts clear    - Clear all translations');
}
