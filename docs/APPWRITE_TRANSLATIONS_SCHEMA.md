# Appwrite Translations Collection Schema

## Collection: `translations`
**Purpose:** Store app translations for multilingual support (Indonesian & English)

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Description |
|---------------|------|------|----------|-------|---------|-------------|
| key | string | 255 | Yes | No | - | Translation key (e.g., "membership.title") |
| en | string | 10000 | Yes | No | - | English translation |
| id | string | 10000 | Yes | No | - | Indonesian translation |
| category | string | 100 | Yes | No | - | Category (e.g., "membership", "auth", "dashboard") |
| lastUpdated | datetime | - | No | No | - | Last update timestamp |

### Indexes
- `key_idx` on `key` (unique)
- `category_idx` on `category`

### Permissions
- Read: `any`
- Create: `role:admin`
- Update: `role:admin`
- Delete: `role:admin`

## Initial Data Structure

### Membership Page Translations

```json
{
  "key": "membership.menuTitle",
  "en": "Menu",
  "id": "Menu",
  "category": "membership"
},
{
  "key": "membership.backToDashboard",
  "en": "Back to Dashboard",
  "id": "Kembali ke Dashboard",
  "category": "membership"
},
{
  "key": "membership.currentPlan",
  "en": "Current Plan",
  "id": "Paket Saat Ini",
  "category": "membership"
},
{
  "key": "membership.status",
  "en": "Status",
  "id": "Status",
  "category": "membership"
},
{
  "key": "membership.active",
  "en": "Active",
  "id": "Aktif",
  "category": "membership"
},
{
  "key": "membership.freePlan",
  "en": "Free Plan",
  "id": "Paket Gratis",
  "category": "membership"
},
{
  "key": "membership.title",
  "en": "Membership Plans",
  "id": "Paket Keanggotaan",
  "category": "membership"
},
{
  "key": "membership.subtitle",
  "en": "Choose the perfect plan for your business needs",
  "id": "Pilih paket yang sempurna untuk kebutuhan bisnis Anda",
  "category": "membership"
},
{
  "key": "membership.aboutTitle",
  "en": "About Our Membership Plans",
  "id": "Tentang Paket Keanggotaan Kami",
  "category": "membership"
},
{
  "key": "membership.aboutDescription",
  "en": "Our membership packages are designed to enhance your online presence and provide secure data storage. <strong>Indastreet never withholds commissions or fees from your massage services.</strong> We believe in empowering our community to grow and succeed at minimal cost. Think of this as your investment in joining an awesome community that helps you progress to the next level.",
  "id": "Paket keanggotaan kami dirancang untuk meningkatkan kehadiran online Anda dan menyediakan penyimpanan data yang aman. <strong>Indastreet tidak pernah menahan komisi atau biaya dari layanan pijat Anda.</strong> Kami percaya dalam memberdayakan komunitas kami untuk tumbuh dan sukses dengan biaya minimal. Anggap ini sebagai investasi Anda untuk bergabung dengan komunitas yang luar biasa yang membantu Anda maju ke tingkat berikutnya.",
  "category": "membership"
},
{
  "key": "membership.team",
  "en": "- The Indastreet Team",
  "id": "- Tim Indastreet",
  "category": "membership"
},
{
  "key": "membership.mostPopular",
  "en": "Most Popular",
  "id": "Paling Populer",
  "category": "membership"
},
{
  "key": "membership.month",
  "en": "Month",
  "id": "Bulan",
  "category": "membership"
},
{
  "key": "membership.months",
  "en": "Months",
  "id": "Bulan",
  "category": "membership"
},
{
  "key": "membership.year",
  "en": "Year",
  "id": "Tahun",
  "category": "membership"
},
{
  "key": "membership.save",
  "en": "Save",
  "id": "Hemat",
  "category": "membership"
},
{
  "key": "membership.featuresIncluded",
  "en": "Features Included:",
  "id": "Fitur Termasuk:",
  "category": "membership"
},
{
  "key": "membership.selectPlan",
  "en": "Select Plan",
  "id": "Pilih Paket",
  "category": "membership"
},
{
  "key": "membership.currentPlanBtn",
  "en": "Current Plan",
  "id": "Paket Saat Ini",
  "category": "membership"
},
{
  "key": "membership.livePresence",
  "en": "Live Presence",
  "id": "Kehadiran Live",
  "category": "membership"
},
{
  "key": "membership.livePresenceDesc",
  "en": "Maintain your active status on the platform for maximum customer visibility",
  "id": "Pertahankan status aktif Anda di platform untuk visibilitas pelanggan maksimal",
  "category": "membership"
},
{
  "key": "membership.secureStorage",
  "en": "Secure Storage",
  "id": "Penyimpanan Aman",
  "category": "membership"
},
{
  "key": "membership.secureStorageDesc",
  "en": "Safe and reliable data storage for your profiles, bookings, and customer information",
  "id": "Penyimpanan data yang aman dan andal untuk profil, pemesanan, dan informasi pelanggan Anda",
  "category": "membership"
},
{
  "key": "membership.zeroCommission",
  "en": "Zero Commission",
  "id": "Tanpa Komisi",
  "category": "membership"
},
{
  "key": "membership.zeroCommissionDesc",
  "en": "Keep 100% of your earnings. We never take a cut from your massage service fees",
  "id": "Simpan 100% penghasilan Anda. Kami tidak pernah mengambil potongan dari biaya layanan pijat Anda",
  "category": "membership"
},
{
  "key": "membership.loadingPlans",
  "en": "Loading membership plans...",
  "id": "Memuat paket keanggotaan...",
  "category": "membership"
},
{
  "key": "membership.feature.livePresence",
  "en": "Live presence on platform",
  "id": "Kehadiran live di platform",
  "category": "membership"
},
{
  "key": "membership.feature.bookingManagement",
  "en": "Customer booking management",
  "id": "Manajemen pemesanan pelanggan",
  "category": "membership"
},
{
  "key": "membership.feature.profileCustomization",
  "en": "Profile customization",
  "id": "Kustomisasi profil",
  "category": "membership"
},
{
  "key": "membership.feature.basicAnalytics",
  "en": "Basic analytics",
  "id": "Analitik dasar",
  "category": "membership"
},
{
  "key": "membership.feature.customerTools",
  "en": "Customer communication tools",
  "id": "Alat komunikasi pelanggan",
  "category": "membership"
},
{
  "key": "membership.feature.allPrevious",
  "en": "All features",
  "id": "Semua fitur",
  "category": "membership"
},
{
  "key": "membership.feature.priorityListing",
  "en": "Priority listing placement",
  "id": "Penempatan daftar prioritas",
  "category": "membership"
},
{
  "key": "membership.feature.advancedAnalytics",
  "en": "Advanced analytics dashboard",
  "id": "Dashboard analitik lanjutan",
  "category": "membership"
},
{
  "key": "membership.feature.bulkBooking",
  "en": "Bulk booking management",
  "id": "Manajemen pemesanan massal",
  "category": "membership"
},
{
  "key": "membership.feature.extendedProfile",
  "en": "Extended profile options",
  "id": "Opsi profil diperluas",
  "category": "membership"
},
{
  "key": "membership.feature.reviewManagement",
  "en": "Customer review management",
  "id": "Manajemen ulasan pelanggan",
  "category": "membership"
},
{
  "key": "membership.feature.featuredStatus",
  "en": "Featured provider status",
  "id": "Status penyedia unggulan",
  "category": "membership"
},
{
  "key": "membership.feature.premiumSupport",
  "en": "Premium customer support",
  "id": "Dukungan pelanggan premium",
  "category": "membership"
},
{
  "key": "membership.feature.marketingTools",
  "en": "Marketing tools & promotions",
  "id": "Alat pemasaran & promosi",
  "category": "membership"
},
{
  "key": "membership.feature.revenueInsights",
  "en": "Revenue optimization insights",
  "id": "Wawasan optimasi pendapatan",
  "category": "membership"
},
{
  "key": "membership.feature.multiLocation",
  "en": "Multi-location management",
  "id": "Manajemen multi-lokasi",
  "category": "membership"
},
{
  "key": "membership.feature.exclusiveBenefits",
  "en": "Exclusive partner benefits",
  "id": "Manfaat mitra eksklusif",
  "category": "membership"
},
{
  "key": "membership.feature.apiAccess",
  "en": "API access for integrations",
  "id": "Akses API untuk integrasi",
  "category": "membership"
},
{
  "key": "membership.feature.whiteLabel",
  "en": "White-label booking widgets",
  "id": "Widget pemesanan white-label",
  "category": "membership"
},
{
  "key": "membership.feature.priorityFeatures",
  "en": "Priority feature requests",
  "id": "Permintaan fitur prioritas",
  "category": "membership"
},
{
  "key": "membership.feature.accountManager",
  "en": "Dedicated account manager",
  "id": "Manajer akun khusus",
  "category": "membership"
}
```

## Usage
Admin can manage all translations through Appwrite dashboard, allowing dynamic language updates without code changes.
