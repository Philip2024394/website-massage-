/**
 * Setup Translations Collection and Upload Data
 * Creates the collection if it doesn't exist, then uploads translations
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';

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

async function createCollection() {
  try {
    console.log('Creating Translations collection...');
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      ID.unique(),
      'Translations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    
    const COLLECTION_ID = collection.$id;
    console.log(`✅ Collection created with ID: ${COLLECTION_ID}\n`);
    
    // Create attributes
    console.log('Creating attributes...');
    
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'language', 5, true);
    console.log('  ✓ language (string, required)');
    
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'Key', 200, true);
    console.log('  ✓ Key (string, required)');
    
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'value', 5000, true);
    console.log('  ✓ value (string, required)');
    
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'lastUpdated', 50, false);
    console.log('  ✓ lastUpdated (string, optional)');
    
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, 'autoTranslated', false, false, false);
    console.log('  ✓ autoTranslated (boolean, optional)');
    
    console.log('\n⏳ Waiting for attributes to be ready (15 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Create indexes
    console.log('\nCreating indexes...');
    
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'language_key', 'key', ['language', 'Key']);
    console.log('  ✓ language_key index');
    
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'language_idx', 'key', ['language']);
    console.log('  ✓ language_idx index');
    
    console.log('\n✅ Collection setup complete!\n');
    console.log(`📝 Add this to your .env file:`);
    console.log(`VITE_TRANSLATIONS_COLLECTION_ID=${COLLECTION_ID}\n`);
    
    return COLLECTION_ID;
    
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('Collection already exists, fetching...');
      const collections = await databases.listCollections(DATABASE_ID);
      const translationsCollection = collections.collections.find(c => c.name === 'Translations');
      if (translationsCollection) {
        console.log(`Found existing collection: ${translationsCollection.$id}\n`);
        return translationsCollection.$id;
      }
    }
    throw error;
  }
}

async function uploadTranslation(collectionId, lang, key, value) {
  try {
    await databases.createDocument(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      {
        language: lang,
        Key: key,
        value,
        lastUpdated: new Date().toISOString(),
        autoTranslated: false
      }
    );
    console.log(`✅ ${lang}.${key}`);
  } catch (error) {
    console.error(`❌ ${lang}.${key}: ${error.message}`);
  }
}

async function uploadAll(collectionId) {
  console.log('🚀 Uploading translations...\n');
  
  let total = 0;
  for (const [section, langs] of Object.entries(TRANSLATIONS)) {
    console.log(`📦 Section: ${section}`);
    
    for (const [lang, keys] of Object.entries(langs)) {
      console.log(`  └─ ${lang.toUpperCase()}`);
      
      for (const [key, value] of Object.entries(keys)) {
        const fullKey = `${section}.${key}`;
        await uploadTranslation(collectionId, lang, fullKey, value);
        total++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log(`\n🎉 Upload complete! Total: ${total} translations`);
}

async function main() {
  try {
    const collectionId = await createCollection();
    await uploadAll(collectionId);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
