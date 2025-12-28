/**
 * Simplified Translation Upload Script for Node.js
 * Run with: node scripts/uploadTranslationsSimple.mjs
 */

import { Client, Databases, ID } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite with hardcoded values
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = '675092f60030f16044c6';

// Translation data
const TRANSLATIONS = {
  common: {
    id: {
      'button.save': 'Simpan',
      'button.cancel': 'Batal',
      'button.confirm': 'Konfirmasi',
      'button.close': 'Tutup',
      'button.back': 'Kembali',
      'button.next': 'Selanjutnya',
      'button.bookNow': 'Pesan Sekarang',
      'button.schedule': 'Jadwalkan',
      'button.viewProfile': 'Lihat Profil',
      'status.available': 'Tersedia',
      'status.busy': 'Sibuk',
      'status.offline': 'Offline',
      'status.loading': 'Memuat...',
      'time.minutes': 'menit',
      'time.hours': 'jam',
      'label.rating': 'Penilaian',
      'label.reviews': 'Ulasan',
      'label.distance': 'Jarak',
      'label.location': 'Lokasi',
    },
    en: {
      'button.save': 'Save',
      'button.cancel': 'Cancel',
      'button.confirm': 'Confirm',
      'button.close': 'Close',
      'button.back': 'Back',
      'button.next': 'Next',
      'button.bookNow': 'Book Now',
      'button.schedule': 'Schedule',
      'button.viewProfile': 'View Profile',
      'status.available': 'Available',
      'status.busy': 'Busy',
      'status.offline': 'Offline',
      'status.loading': 'Loading...',
      'time.minutes': 'minutes',
      'time.hours': 'hours',
      'label.rating': 'Rating',
      'label.reviews': 'Reviews',
      'label.distance': 'Distance',
      'label.location': 'Location',
    }
  },
  homepage: {
    id: {
      'tabs.therapists': 'Terapis',
      'tabs.places': 'Tempat Pijat',
      'tabs.facials': 'Klinik Kecantikan',
      'filter.availableNow': 'Tersedia Sekarang',
      'filter.allLocations': 'Semua Lokasi',
      'search.placeholder': 'Cari terapis, tempat, atau layanan...',
    },
    en: {
      'tabs.therapists': 'Therapists',
      'tabs.places': 'Massage Places',
      'tabs.facials': 'Beauty Clinics',
      'filter.availableNow': 'Available Now',
      'filter.allLocations': 'All Locations',
      'search.placeholder': 'Search therapists, places, or services...',
    }
  }
};

async function uploadTranslation(lang, key, value) {
  try {
    // Check if exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      TRANSLATIONS_COLLECTION_ID,
      [`language=${lang}`, `Key=${key}`]
    );

    if (existing.documents.length > 0) {
      // Update existing
      await databases.updateDocument(
        DATABASE_ID,
        TRANSLATIONS_COLLECTION_ID,
        existing.documents[0].$id,
        { value, lastUpdated: new Date().toISOString() }
      );
      console.log(`✅ Updated: ${lang}.${key}`);
    } else {
      // Create new
      await databases.createDocument(
        DATABASE_ID,
        TRANSLATIONS_COLLECTION_ID,
        ID.unique(),
        {
          language: lang,
          Key: key,
          value,
          lastUpdated: new Date().toISOString(),
          autoTranslated: false
        }
      );
      console.log(`✅ Created: ${lang}.${key}`);
    }
  } catch (error) {
    console.error(`❌ Error with ${lang}.${key}:`, error.message);
  }
}

async function uploadAll() {
  console.log('🚀 Starting upload to Appwrite...\n');
  
  let total = 0;
  for (const [section, langs] of Object.entries(TRANSLATIONS)) {
    console.log(`\n📦 Section: ${section}`);
    
    for (const [lang, keys] of Object.entries(langs)) {
      console.log(`  └─ Language: ${lang.toUpperCase()}`);
      
      for (const [key, value] of Object.entries(keys)) {
        const fullKey = `${section}.${key}`;
        await uploadTranslation(lang, fullKey, value);
        total++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log(`\n🎉 Upload complete! Total: ${total} translations`);
}

uploadAll().catch(console.error);
