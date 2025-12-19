# Appwrite Database Schema for Chat Translations

## Quick Reference Card

### Collection: `chat_translations`

#### Attributes Configuration

| Attribute Name | Type | Required | Size/Options | Default | Description |
|---------------|------|----------|--------------|---------|-------------|
| `key` | String | ✅ Yes | 100 | - | Unique translation key identifier |
| `en` | String | ✅ Yes | 500 | - | English translation text |
| `id` | String | ✅ Yes | 500 | - | Indonesian translation text |
| `category` | String | ✅ Yes | 50 | - | Enum: chat, buttons, errors, messages |
| `createdAt` | DateTime | ✅ Yes | - | - | Record creation timestamp |
| `updatedAt` | DateTime | ✅ Yes | - | - | Last update timestamp |

#### Indexes

| Index Name | Type | Attributes | Order | Purpose |
|-----------|------|------------|-------|---------|
| `translation_key` | Unique | `key` | - | Ensure unique translation keys |
| `by_category` | Fulltext | `category` | - | Filter translations by category |
| `updated_recently` | Key | `updatedAt` | DESC | Sort by last update |

#### Permissions

```javascript
// Read Permission - Public access for translations
{
  "role": "any",
  "permission": "read"
}

// Create Permission - Admin only
{
  "role": "admins", 
  "permission": "create"
}

// Update Permission - Admin only
{
  "role": "admins",
  "permission": "update"
}

// Delete Permission - Admin only
{
  "role": "admins",
  "permission": "delete"
}
```

## Collection Setup Instructions

### Step 1: Create Collection
1. Navigate to Appwrite Console → Database
2. Create new collection with ID: `chat_translations`
3. Set collection name: "Chat Translations"

### Step 2: Add Attributes
Execute these attribute creations in order:

```javascript
// Required String Attributes
key: String, Required, Size: 100
en: String, Required, Size: 500
id: String, Required, Size: 500  
category: String, Required, Size: 50

// DateTime Attributes
createdAt: DateTime, Required
updatedAt: DateTime, Required
```

### Step 3: Create Indexes
1. **translation_key** (Unique): `key`
2. **by_category** (Fulltext): `category`
3. **updated_recently** (Key): `updatedAt` (DESC)

### Step 4: Set Permissions
Configure permissions:
- ✅ **Read**: Role "any" (public access)
- ✅ **Create**: Role "admins" 
- ✅ **Update**: Role "admins"
- ✅ **Delete**: Role "admins"

### Step 5: Verify Configuration
The collection should be accessible via:
```typescript
import { databases } from './lib/appwrite.config';
import { APPWRITE_CONFIG } from './lib/appwrite.config';

// Collection ID should be: 'chat_translations'
const collectionId = APPWRITE_CONFIG.collections.chatTranslations;
```

## Default Translations

The system will automatically populate these translations when first initialized:

### Button Translations
- `book_now`: "Book Now" / "Pesan Sekarang"
- `schedule`: "Schedule" / "Jadwalkan" 
- `activate_chat`: "Activate Chat" / "Aktifkan Chat"
- `send_message`: "Send Message" / "Kirim Pesan"
- `close_chat`: "Close Chat" / "Tutup Chat"

### Chat Interface
- `chat_with`: "Chat with" / "Chat dengan"
- `type_message`: "Type your message..." / "Ketik pesan Anda..."
- `your_name`: "Your Name" / "Nama Anda"
- `whatsapp_number`: "WhatsApp Number" / "Nomor WhatsApp"
- `select_duration`: "Select Duration" / "Pilih Durasi"

### Error Messages  
- `chat_service_error`: "Chat Service Error" / "Kesalahan Layanan Chat"
- `network_connectivity_issues`: "Network connectivity issues" / "Masalah konektivitas jaringan"
- `connection_failed`: "Connection failed. Please check your internet connection." / "Koneksi gagal. Silakan periksa koneksi internet Anda."

### System Messages
- `welcome_message`: "Hello! How can I help you today?" / "Halo! Bagaimana saya bisa membantu Anda hari ini?"
- `therapist_will_respond`: "Your therapist will respond shortly." / "Terapis Anda akan segera merespons."
- `booking_confirmed`: "Booking confirmed! We will contact you shortly." / "Pemesanan dikonfirmasi! Kami akan menghubungi Anda segera."

## Usage Example

```typescript
import { chatTranslationService } from './services/chatTranslationService';

// Get single translation
const bookNowText = chatTranslationService.getTranslation('book_now', 'id');
// Returns: "Pesan Sekarang"

// Get multiple translations
const translations = chatTranslationService.getTranslations(['book_now', 'schedule'], 'en');
// Returns: { book_now: "Book Now", schedule: "Schedule" }

// Get translations by category
const buttonTexts = chatTranslationService.getTranslationsByCategory('buttons', 'id');
// Returns all button translations in Indonesian

// Add new translation (admin only)
await chatTranslationService.setTranslation(
    'new_feature', 
    'New Feature', 
    'Fitur Baru', 
    'buttons'
);
```

## Notes

- Public read access allows frontend to fetch translations
- Admin-only write access ensures translation quality
- Automatic fallback to English if Indonesian translation missing
- Service caches translations in memory for performance
- Auto-initializes with default translations on first run
- Supports real-time language switching