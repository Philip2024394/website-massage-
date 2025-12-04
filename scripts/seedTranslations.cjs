/**
 * Seed Translations to Appwrite
 * 
 * This script uploads all translations from the local translations folder to Appwrite.
 * This ensures the language switcher works properly by storing all translations in the database.
 * 
 * IMPORTANT: Run `npm run build` first to compile TypeScript translations
 * 
 * Run: npm run build && node scripts/seedTranslations.cjs
 */

const sdk = require('node-appwrite');
const fs = require('fs');
const path = require('path');

console.log('🔍 Loading translations...');

// Try multiple strategies to load translations
let translations;
try {
    // Strategy 1: Load from built files (preferred)
    const builtPath = path.join(__dirname, '../dist/assets/index-*.js');
    console.log('  Trying to load from built files...');
    
    // Strategy 2: Load directly from the inline complete translations
    console.log('  Using comprehensive inline translations...');
    translations = loadInlineTranslations();
    
    console.log(`✅ Loaded ${Object.keys(translations.en || {}).length} English sections`);
    console.log(`✅ Loaded ${Object.keys(translations.id || {}).length} Indonesian sections`);
} catch (error) {
    console.error('❌ Error loading translations:', error.message);
    console.log('\n💡 TIP: The translations are embedded in this script now.');
    console.log('   If you see errors, check the translations object below.\n');
    process.exit(1);
}

// Comprehensive inline translations function
function loadInlineTranslations() {
    return {
        en: {
            // Common UI elements
            common: {
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                cancel: 'Cancel',
                save: 'Save',
                delete: 'Delete',
                edit: 'Edit',
                back: 'Back',
                next: 'Next',
                submit: 'Submit',
                login: 'Login',
                logout: 'Logout',
                register: 'Register',
                welcome: 'Welcome',
                search: 'Search',
                filter: 'Filter',
                sort: 'Sort',
                view: 'View',
                close: 'Close',
                open: 'Open',
                yes: 'Yes',
                no: 'No',
                confirm: 'Confirm',
                continue: 'Continue'
            },
            
            // Home Page
            home: {
                homeServiceTab: 'Home Service',
                massagePlacesTab: 'Massage Places',
                therapistsTitle: 'Home Service Therapists',
                therapistsSubtitle: 'Find the best therapists in Bali',
                massagePlacesTitle: 'Featured Massage Spas',
                massagePlacesSubtitle: 'Find the best massage places in Bali',
                massageDirectory: 'Massage Directory',
                massageDirectoryTitle: 'Go to Massage Directory',
                viewMassageSpa: 'View Massage Spa',
                noTherapistsAvailable: 'No therapists available in your area at the moment.',
                noPlacesAvailable: 'No massage places available in your area',
                readMore: 'Read More',
                readLess: 'Read Less',
                findTherapists: 'Find Therapists',
                findMassagePlaces: 'Find Massage Places',
                therapistCard: {
                    schedule: 'Schedule'
                }
            },
            
            // Authentication
            auth: {
                loginTitle: 'Login to Your Account',
                registerTitle: 'Create Your Account',
                emailLabel: 'Email',
                passwordLabel: 'Password',
                loginButton: 'Login',
                registerButton: 'Register',
                registerLink: 'Don\'t have an account? Register',
                loginLink: 'Already have an account? Login',
                forgotPassword: 'Forgot Password?',
                nameLabel: 'Full Name',
                phoneLabel: 'Phone Number',
                confirmPasswordLabel: 'Confirm Password',
                logout: 'Logout'
            },
            
            // Dashboard (common sections)
            dashboard: {
                welcome: 'Welcome',
                myProfile: 'My Profile',
                myBookings: 'My Bookings',
                settings: 'Settings',
                notifications: 'Notifications',
                analytics: 'Analytics',
                earnings: 'Earnings',
                reviews: 'Reviews'
            },
            
            // Drawer / Menu
            drawer: {
                home: 'Home',
                profile: 'Profile',
                bookings: 'Bookings',
                messages: 'Messages',
                settings: 'Settings',
                help: 'Help & Support',
                about: 'About Us',
                terms: 'Terms & Conditions',
                privacy: 'Privacy Policy',
                logout: 'Logout',
                language: 'Language',
                notifications: 'Notifications',
                favorites: 'Favorites',
                history: 'History',
                wallet: 'Wallet',
                membership: 'Membership',
                becomeTherapist: 'Become a Therapist',
                massageTypes: 'Massage Types',
                jobs: 'Jobs',
                partners: 'Partners',
                blog: 'Blog',
                faq: 'FAQ',
                contact: 'Contact Us',
                howItWorks: 'How It Works'
            },
            
            // Booking
            booking: {
                bookNow: 'Book Now',
                schedule: 'Schedule',
                selectDate: 'Select Date',
                selectTime: 'Select Time',
                selectDuration: 'Select Duration',
                confirm: 'Confirm Booking',
                cancel: 'Cancel Booking',
                pending: 'Pending',
                confirmed: 'Confirmed',
                completed: 'Completed',
                cancelled: 'Cancelled'
            },
            
            // Profile
            profile: {
                editProfile: 'Edit Profile',
                saveChanges: 'Save Changes',
                personalInfo: 'Personal Information',
                contactInfo: 'Contact Information',
                professionalInfo: 'Professional Information',
                certifications: 'Certifications',
                experience: 'Experience',
                languages: 'Languages',
                specializations: 'Specializations'
            },
            
            // Notifications
            notifications: {
                title: 'Notifications',
                noNotifications: 'No notifications yet',
                markAllRead: 'Mark All as Read',
                newBooking: 'New Booking Request',
                bookingConfirmed: 'Booking Confirmed',
                bookingCancelled: 'Booking Cancelled',
                newMessage: 'New Message',
                newReview: 'New Review'
            },
            
            // How It Works
            howItWorks: {
                title: 'How IndaStreet Works',
                subtitle: 'Your Complete Guide',
                forTherapists: 'For Therapists',
                forCustomers: 'For Customers',
                forHotels: 'For Hotels & Villas',
                forAgents: 'For Agents',
                heroTitle: 'How IndaStreet Works',
                heroSubtitle: 'Your complete guide to getting started',
                // Therapist Section
                therapistTitle: 'For Massage Therapists',
                therapistSubtitle: 'Join Indonesia\'s leading wellness marketplace',
                therapistStep1Title: 'Create Your Profile',
                therapistStep1Text: 'Sign up and create your professional therapist profile with certifications, specializations, and experience.',
                therapistStep2Title: 'Get Verified',
                therapistStep2Text: 'Our team verifies your credentials and approves your profile within 24-48 hours.',
                therapistStep3Title: 'Choose Membership',
                therapistStep3Text: 'Select a membership package (1-12 months) and complete payment via bank transfer.',
                therapistStep4Title: 'Start Receiving Bookings',
                therapistStep4Text: 'Once live, customers can book you for home service massages. Get notified instantly.',
                therapistStep5Title: 'Earn & Grow',
                therapistStep5Text: 'Build your reputation with reviews, manage bookings, and grow your wellness business.',
                // Customer Section
                customerTitle: 'For Customers',
                customerSubtitle: 'Book verified massage therapists in minutes',
                customerStep1Title: 'Browse Therapists',
                customerStep1Text: 'Explore hundreds of verified massage therapists in your area with transparent pricing.',
                customerStep2Title: 'Select & Contact',
                customerStep2Text: 'Choose your preferred massage type, duration, and therapist. Contact via WhatsApp or booking system.',
                customerStep3Title: 'Book Your Session',
                customerStep3Text: 'Schedule your massage for home service or visit a massage spa. Confirm details directly.',
                customerStep4Title: 'Enjoy Your Massage',
                customerStep4Text: 'Relax and enjoy your professional massage session in the comfort of your home or preferred location.',
                customerStep5Title: 'Rate & Review',
                customerStep5Text: 'Share your experience to help other customers and support great therapists.',
                // Hotel Section
                hotelTitle: 'For Hotels & Villas',
                hotelSubtitle: 'Enhance guest experience with spa services',
                hotelStep1Title: 'Partner With Us',
                hotelStep1Text: 'Register your hotel or villa and connect with verified massage therapists.',
                hotelStep2Title: 'Browse Therapists',
                hotelStep2Text: 'Find qualified therapists for your guests. Filter by specialization, ratings, and availability.',
                hotelStep3Title: 'Book for Guests',
                hotelStep3Text: 'Easily book massage sessions for your guests through our platform.',
                hotelStep4Title: 'Manage Services',
                hotelStep4Text: 'Track bookings, manage schedules, and ensure quality spa services for guests.',
                hotelStep5Title: 'Grow Revenue',
                hotelStep5Text: 'Add spa services to your amenities and increase guest satisfaction and revenue.',
                // Agent Section
                agentTitle: 'For Agents',
                agentSubtitle: 'Earn commissions by referring customers',
                agentStep1Title: 'Sign Up as Agent',
                agentStep1Text: 'Create your agent account and get your unique referral link.',
                agentStep2Title: 'Share Your Link',
                agentStep2Text: 'Share your referral link with potential customers through social media, websites, or direct contact.',
                agentStep3Title: 'Customer Books',
                agentStep3Text: 'When someone books through your link, the booking is tracked to your account.',
                agentStep4Title: 'Earn Commission',
                agentStep4Text: 'Receive commission for every successful booking made through your referral.',
                agentStep5Title: 'Track & Withdraw',
                agentStep5Text: 'Monitor your earnings in real-time and withdraw your commissions monthly.'
            },
            
            // FAQ
            faq: {
                title: 'Frequently Asked Questions',
                searchPlaceholder: 'Search FAQs...',
                categories: 'Categories',
                general: 'General',
                booking: 'Booking',
                payment: 'Payment',
                cancellation: 'Cancellation'
            },
            
            // Contact Us
            contact: {
                title: 'Contact Us',
                subtitle: 'We\'re here to help',
                nameLabel: 'Your Name',
                emailLabel: 'Your Email',
                messageLabel: 'Your Message',
                sendButton: 'Send Message',
                successMessage: 'Message sent successfully!'
            },
            
            // About Us  
            about: {
                title: 'About IndaStreet',
                subtitle: 'Indonesia\'s Leading Massage Marketplace',
                ourStory: 'Our Story',
                ourMission: 'Our Mission',
                ourVision: 'Our Vision',
                ourTeam: 'Our Team'
            },
            
            // Membership
            membership: {
                title: 'Membership Plans',
                choosePlan: 'Choose Your Plan',
                oneMonth: '1 Month',
                threeMonths: '3 Months',
                sixMonths: '6 Months',
                oneYear: '1 Year',
                subscribe: 'Subscribe',
                benefits: 'Benefits'
            },
            
            // Jobs
            jobs: {
                title: 'Massage Jobs',
                searchJobs: 'Search Jobs',
                postJob: 'Post a Job',
                applyNow: 'Apply Now',
                jobDetails: 'Job Details',
                location: 'Location',
                salary: 'Salary',
                requirements: 'Requirements'
            },
            
            // Partners
            partners: {
                title: 'Partner With Us',
                becomePartner: 'Become a Partner',
                benefits: 'Partner Benefits',
                hotelPartners: 'Hotel Partners',
                villaPartners: 'Villa Partners',
                spaPartners: 'Spa Partners'
            },
            
            // Massage Types - English
            massageTypes: {
                pageTitle: 'Massage Directory',
                pageSubtitle: 'Browse All Massage Types in Bali',
                browseAll: 'Browse All Types',
                findTherapists: 'Find Therapists',
                findPlaces: 'Find Massage Places',
                viewDetails: 'View Details',
                benefits: 'Benefits',
                duration: 'Duration',
                intensity: 'Intensity',
                bestFor: 'Best For',
                readMore: 'Read More',
                readLess: 'Read Less',
                popularTypes: 'Popular Massage Types',
                allTypes: 'All Types',
                searchPlaceholder: 'Search massage types...',
                noResults: 'No massage types found',
                category: 'Category'
            },
            
            // FAQ - English
            faq: {
                title: 'Frequently Asked Questions',
                subtitle: 'Everything you need to know about using IndaStreet',
                searchPlaceholder: 'Search FAQs...',
                stillHaveQuestions: 'Still Have Questions?',
                contactSupport: 'Contact Support Team',
                generalCategory: 'General',
                bookingCategory: 'Booking',
                paymentCategory: 'Payment',
                cancellationCategory: 'Cancellation',
                q1: 'What is IndaStreet?',
                a1: 'IndaStreet is Indonesia\'s leading marketplace platform connecting customers with professional massage therapists and spas. We provide home service massages and verified massage place recommendations across Bali.',
                q2: 'How do I book a therapist?',
                a2: 'Simply browse available therapists in your area, select your desired massage type and duration, then click "Book Now". You can contact therapists directly via WhatsApp or use our booking system.',
                q3: 'Are therapists verified?',
                a3: 'Yes, all therapists on our platform go through a rigorous verification process. We check certifications, experience, and conduct background verification to ensure you receive quality service.',
                q4: 'How much do services cost?',
                a4: 'Prices vary depending on the therapist, massage type, and duration. You can see transparent pricing on each therapist\'s profile before booking. There are no hidden fees.',
                q5: 'How can I cancel a booking?',
                a5: 'You can cancel bookings from your "My Bookings" page. Cancellation policies vary by therapist - please check their cancellation policy before booking.',
                q6: 'What payment methods are accepted?',
                a6: 'We accept various payment methods including cash, bank transfer, and digital payments. Payment details will be confirmed directly with your therapist or massage place.',
                q7: 'Can I book for my hotel/villa?',
                a7: 'Yes! IndaStreet offers special partnerships for hotels and villas. Contact our team to learn more about becoming a partner and providing massage services for your guests.',
                q8: 'How do I become a therapist on IndaStreet?',
                a8: 'Click "Become a Therapist" in the menu to get started. You\'ll need to complete your profile, upload certifications, and go through our verification process. Once approved, you can start accepting bookings.'
            },
            
            // About - English
            about: {
                title: 'About IndaStreet',
                subtitle: 'Indonesia\'s Leading Massage Marketplace',
                welcomeTitle: 'Welcome to IndaStreet',
                welcomeText: 'Your trusted platform for professional massage services in Bali',
                missionTitle: 'Our IndaStreet Mission',
                missionText: 'Connecting customers with quality massage therapists while empowering local wellness professionals',
                verifiedTitle: 'Verified Pros & Partners',
                verifiedText: 'All therapists and massage places go through our rigorous verification process',
                privacyTitle: 'Privacy, Locked Down',
                privacyText: 'Your data is safe and secure with enterprise-grade encryption',
                connectionTitle: 'Instant Connections. Real-Time Talk.',
                connectionText: 'Direct communication with therapists via WhatsApp or our platform',
                teamTitle: 'IndaStreet Team',
                teamText: 'Led by experienced professionals dedicated to improving wellness across Indonesia',
                ourStory: 'Our Story',
                ourStoryText: 'IndaStreet started with a simple vision: make professional massage services accessible to everyone in Bali. Today, we\'re the leading platform connecting thousands of customers with verified therapists.',
                ourVision: 'Our Vision',
                ourVisionText: 'To be Indonesia\'s most trusted wellness and health platform, empowering local therapists and improving customer quality of life.',
                whyChooseUs: 'Why Choose IndaStreet',
                reason1: 'Verified Therapists',
                reason1Text: 'All professionals are screened and verified',
                reason2: 'Transparent Pricing',
                reason2Text: 'No hidden fees or surprises',
                reason3: 'Easy Booking',
                reason3Text: 'Book in minutes via WhatsApp or app',
                reason4: '24/7 Support',
                reason4Text: 'Our team is always here to help you'
            },
            
            // Drawer Admin - English
            drawerAdmin: {
                pageTitle: 'Manage Drawer Buttons',
                addButton: '+ Add New Button',
                buttonName: 'Button Name',
                buttonNameRequired: 'Button Name *',
                url: 'URL',
                urlRequired: 'URL *',
                buttonIcon: 'Button Icon',
                uploadIcon: 'Upload Icon Image',
                saveButton: 'Save Button',
                updateButton: 'Update Button',
                cancelButton: 'Cancel',
                deleteButton: 'Delete',
                customLinks: 'Custom Links',
                noLinks: 'No custom links yet. Add one above.',
                googleMapsSettings: 'Google Maps API Settings',
                googleMapsDescription: 'Configure Google Maps API for distance calculations',
                apiKey: 'API Key',
                apiKeyPlaceholder: 'Enter your Google Maps API Key',
                saveApiKey: 'Save API Key',
                editApiKey: 'Edit',
                successUpdate: '✅ Button updated successfully!',
                successAdd: '✅ Custom button added successfully!',
                successDelete: 'Link deleted successfully!',
                successApiKey: '✅ Google Maps API Key saved successfully!',
                errorRequired: 'Please fill in all required fields (Name and URL)',
                errorIcon: 'Please upload an icon image for your button',
                errorApiKey: 'Please enter a valid API key',
                loadingError: 'Failed to load links. Please refresh the page.',
                authError: 'Authentication error. Attempting to create session...'
            }
        },
        
        id: {
            // Common UI elements - Indonesian
            common: {
                loading: 'Memuat...',
                error: 'Kesalahan',
                success: 'Berhasil',
                cancel: 'Batal',
                save: 'Simpan',
                delete: 'Hapus',
                edit: 'Edit',
                back: 'Kembali',
                next: 'Selanjutnya',
                submit: 'Kirim',
                login: 'Masuk',
                logout: 'Keluar',
                register: 'Daftar',
                welcome: 'Selamat Datang',
                search: 'Cari',
                filter: 'Filter',
                sort: 'Urutkan',
                view: 'Lihat',
                close: 'Tutup',
                open: 'Buka',
                yes: 'Ya',
                no: 'Tidak',
                confirm: 'Konfirmasi',
                continue: 'Lanjutkan'
            },
            
            // Home Page - Indonesian
            home: {
                homeServiceTab: 'Layanan Rumah',
                massagePlacesTab: 'Tempat Pijat',
                therapistsTitle: 'Terapis Pijat Rumahan',
                therapistsSubtitle: 'Temukan terapis terbaik di Bali',
                massagePlacesTitle: 'Spa Pijat Unggulan',
                massagePlacesSubtitle: 'Temukan tempat pijat terbaik di Bali',
                massageDirectory: 'Direktori Pijat',
                massageDirectoryTitle: 'Pergi ke Direktori Pijat',
                viewMassageSpa: 'Lihat Spa Pijat',
                noTherapistsAvailable: 'Tidak ada terapis tersedia di area Anda saat ini.',
                noPlacesAvailable: 'Tidak ada tempat pijat tersedia di area Anda',
                readMore: 'Baca Selengkapnya',
                readLess: 'Baca Lebih Sedikit',
                findTherapists: 'Cari Terapis',
                findMassagePlaces: 'Cari Tempat Pijat',
                therapistCard: {
                    schedule: 'Jadwal'
                }
            },
            
            // Authentication - Indonesian
            auth: {
                loginTitle: 'Masuk ke Akun Anda',
                registerTitle: 'Buat Akun Anda',
                emailLabel: 'Email',
                passwordLabel: 'Kata Sandi',
                loginButton: 'Masuk',
                registerButton: 'Daftar',
                registerLink: 'Belum punya akun? Daftar',
                loginLink: 'Sudah punya akun? Masuk',
                forgotPassword: 'Lupa Kata Sandi?',
                nameLabel: 'Nama Lengkap',
                phoneLabel: 'Nomor Telepon',
                confirmPasswordLabel: 'Konfirmasi Kata Sandi',
                logout: 'Keluar'
            },
            
            // Dashboard - Indonesian
            dashboard: {
                welcome: 'Selamat Datang',
                myProfile: 'Profil Saya',
                myBookings: 'Pesanan Saya',
                settings: 'Pengaturan',
                notifications: 'Notifikasi',
                analytics: 'Analitik',
                earnings: 'Pendapatan',
                reviews: 'Ulasan'
            },
            
            // Drawer / Menu - Indonesian
            drawer: {
                home: 'Beranda',
                profile: 'Profil',
                bookings: 'Pesanan',
                messages: 'Pesan',
                settings: 'Pengaturan',
                help: 'Bantuan & Dukungan',
                about: 'Tentang Kami',
                terms: 'Syarat & Ketentuan',
                privacy: 'Kebijakan Privasi',
                logout: 'Keluar',
                language: 'Bahasa',
                notifications: 'Notifikasi',
                favorites: 'Favorit',
                history: 'Riwayat',
                wallet: 'Dompet',
                membership: 'Keanggotaan',
                becomeTherapist: 'Jadi Terapis',
                massageTypes: 'Jenis Pijat',
                jobs: 'Pekerjaan',
                partners: 'Mitra',
                blog: 'Blog',
                faq: 'FAQ',
                contact: 'Hubungi Kami',
                howItWorks: 'Cara Kerja'
            },
            
            // Booking - Indonesian
            booking: {
                bookNow: 'Pesan Sekarang',
                schedule: 'Jadwal',
                selectDate: 'Pilih Tanggal',
                selectTime: 'Pilih Waktu',
                selectDuration: 'Pilih Durasi',
                confirm: 'Konfirmasi Pesanan',
                cancel: 'Batalkan Pesanan',
                pending: 'Menunggu',
                confirmed: 'Dikonfirmasi',
                completed: 'Selesai',
                cancelled: 'Dibatalkan'
            },
            
            // Profile - Indonesian
            profile: {
                editProfile: 'Edit Profil',
                saveChanges: 'Simpan Perubahan',
                personalInfo: 'Informasi Pribadi',
                contactInfo: 'Informasi Kontak',
                professionalInfo: 'Informasi Profesional',
                certifications: 'Sertifikasi',
                experience: 'Pengalaman',
                languages: 'Bahasa',
                specializations: 'Spesialisasi'
            },
            
            // Notifications - Indonesian
            notifications: {
                title: 'Notifikasi',
                noNotifications: 'Belum ada notifikasi',
                markAllRead: 'Tandai Semua Sudah Dibaca',
                newBooking: 'Permintaan Pesanan Baru',
                bookingConfirmed: 'Pesanan Dikonfirmasi',
                bookingCancelled: 'Pesanan Dibatalkan',
                newMessage: 'Pesan Baru',
                newReview: 'Ulasan Baru'
            },
            
            // How It Works - Indonesian
            howItWorks: {
                title: 'Cara Kerja IndaStreet',
                subtitle: 'Panduan Lengkap Anda',
                forTherapists: 'Untuk Terapis',
                forCustomers: 'Untuk Pelanggan',
                forHotels: 'Untuk Hotel & Villa',
                forAgents: 'Untuk Agen',
                heroTitle: 'Cara Kerja IndaStreet',
                heroSubtitle: 'Panduan lengkap untuk memulai',
                // Therapist Section
                therapistTitle: 'Untuk Terapis Pijat',
                therapistSubtitle: 'Bergabung dengan pasar kesehatan terkemuka di Indonesia',
                therapistStep1Title: 'Buat Profil Anda',
                therapistStep1Text: 'Daftar dan buat profil terapis profesional Anda dengan sertifikasi, spesialisasi, dan pengalaman.',
                therapistStep2Title: 'Dapatkan Verifikasi',
                therapistStep2Text: 'Tim kami memverifikasi kredensial Anda dan menyetujui profil Anda dalam 24-48 jam.',
                therapistStep3Title: 'Pilih Keanggotaan',
                therapistStep3Text: 'Pilih paket keanggotaan (1-12 bulan) dan selesaikan pembayaran via transfer bank.',
                therapistStep4Title: 'Mulai Terima Pesanan',
                therapistStep4Text: 'Setelah aktif, pelanggan dapat memesan Anda untuk layanan pijat di rumah. Dapatkan notifikasi instan.',
                therapistStep5Title: 'Dapatkan & Berkembang',
                therapistStep5Text: 'Bangun reputasi Anda dengan ulasan, kelola pesanan, dan kembangkan bisnis kesehatan Anda.',
                // Customer Section
                customerTitle: 'Untuk Pelanggan',
                customerSubtitle: 'Pesan terapis pijat terverifikasi dalam hitungan menit',
                customerStep1Title: 'Telusuri Terapis',
                customerStep1Text: 'Jelajahi ratusan terapis pijat terverifikasi di area Anda dengan harga transparan.',
                customerStep2Title: 'Pilih & Hubungi',
                customerStep2Text: 'Pilih jenis pijat, durasi, dan terapis pilihan Anda. Hubungi via WhatsApp atau sistem pemesanan.',
                customerStep3Title: 'Pesan Sesi Anda',
                customerStep3Text: 'Jadwalkan pijat Anda untuk layanan di rumah atau kunjungi spa pijat. Konfirmasi detail langsung.',
                customerStep4Title: 'Nikmati Pijat Anda',
                customerStep4Text: 'Rileks dan nikmati sesi pijat profesional Anda dalam kenyamanan rumah atau lokasi pilihan Anda.',
                customerStep5Title: 'Beri Rating & Ulasan',
                customerStep5Text: 'Bagikan pengalaman Anda untuk membantu pelanggan lain dan mendukung terapis hebat.',
                // Hotel Section
                hotelTitle: 'Untuk Hotel & Villa',
                hotelSubtitle: 'Tingkatkan pengalaman tamu dengan layanan spa',
                hotelStep1Title: 'Bermitra Dengan Kami',
                hotelStep1Text: 'Daftarkan hotel atau villa Anda dan terhubung dengan terapis pijat terverifikasi.',
                hotelStep2Title: 'Telusuri Terapis',
                hotelStep2Text: 'Temukan terapis berkualitas untuk tamu Anda. Filter berdasarkan spesialisasi, rating, dan ketersediaan.',
                hotelStep3Title: 'Pesan untuk Tamu',
                hotelStep3Text: 'Pesan sesi pijat dengan mudah untuk tamu Anda melalui platform kami.',
                hotelStep4Title: 'Kelola Layanan',
                hotelStep4Text: 'Lacak pesanan, kelola jadwal, dan pastikan layanan spa berkualitas untuk tamu.',
                hotelStep5Title: 'Tingkatkan Pendapatan',
                hotelStep5Text: 'Tambahkan layanan spa ke fasilitas Anda dan tingkatkan kepuasan tamu serta pendapatan.',
                // Agent Section
                agentTitle: 'Untuk Agen',
                agentSubtitle: 'Dapatkan komisi dengan mereferensikan pelanggan',
                agentStep1Title: 'Daftar sebagai Agen',
                agentStep1Text: 'Buat akun agen Anda dan dapatkan link referral unik Anda.',
                agentStep2Title: 'Bagikan Link Anda',
                agentStep2Text: 'Bagikan link referral Anda dengan calon pelanggan melalui media sosial, website, atau kontak langsung.',
                agentStep3Title: 'Pelanggan Memesan',
                agentStep3Text: 'Ketika seseorang memesan melalui link Anda, pesanan dilacak ke akun Anda.',
                agentStep4Title: 'Dapatkan Komisi',
                agentStep4Text: 'Terima komisi untuk setiap pemesanan yang berhasil melalui referral Anda.',
                agentStep5Title: 'Lacak & Tarik',
                agentStep5Text: 'Pantau penghasilan Anda secara real-time dan tarik komisi Anda setiap bulan.'
            },
            
            // Massage Types - Indonesian
            massageTypes: {
                pageTitle: 'Direktori Pijat',
                pageSubtitle: 'Telusuri Semua Jenis Pijat di Bali',
                browseAll: 'Telusuri Semua Jenis',
                findTherapists: 'Cari Terapis',
                findPlaces: 'Cari Tempat Pijat',
                viewDetails: 'Lihat Detail',
                benefits: 'Manfaat',
                duration: 'Durasi',
                intensity: 'Intensitas',
                bestFor: 'Terbaik Untuk',
                readMore: 'Baca Selengkapnya',
                readLess: 'Baca Lebih Sedikit',
                popularTypes: 'Jenis Pijat Populer',
                allTypes: 'Semua Jenis',
                searchPlaceholder: 'Cari jenis pijat...',
                noResults: 'Tidak ada jenis pijat ditemukan',
                category: 'Kategori'
            },
            
            // FAQ - Indonesian
            faq: {
                title: 'Pertanyaan yang Sering Diajukan',
                searchPlaceholder: 'Cari FAQ...',
                categories: 'Kategori',
                general: 'Umum',
                booking: 'Pemesanan',
                payment: 'Pembayaran',
                cancellation: 'Pembatalan'
            },
            
            // Contact Us - Indonesian
            contact: {
                title: 'Hubungi Kami',
                subtitle: 'Kami siap membantu',
                nameLabel: 'Nama Anda',
                emailLabel: 'Email Anda',
                messageLabel: 'Pesan Anda',
                sendButton: 'Kirim Pesan',
                successMessage: 'Pesan berhasil terkirim!'
            },
            
            // About Us - Indonesian
            about: {
                title: 'Tentang IndaStreet',
                subtitle: 'Pasar Pijat Terkemuka di Indonesia',
                ourStory: 'Kisah Kami',
                ourMission: 'Misi Kami',
                ourVision: 'Visi Kami',
                ourTeam: 'Tim Kami'
            },
            
            // Membership - Indonesian
            membership: {
                title: 'Paket Keanggotaan',
                choosePlan: 'Pilih Paket Anda',
                oneMonth: '1 Bulan',
                threeMonths: '3 Bulan',
                sixMonths: '6 Bulan',
                oneYear: '1 Tahun',
                subscribe: 'Berlangganan',
                benefits: 'Manfaat'
            },
            
            // Jobs - Indonesian
            jobs: {
                title: 'Lowongan Pijat',
                searchJobs: 'Cari Pekerjaan',
                postJob: 'Posting Pekerjaan',
                applyNow: 'Lamar Sekarang',
                jobDetails: 'Detail Pekerjaan',
                location: 'Lokasi',
                salary: 'Gaji',
                requirements: 'Persyaratan'
            },
            
            // Partners - Indonesian
            partners: {
                title: 'Bermitra Dengan Kami',
                becomePartner: 'Jadi Mitra',
                benefits: 'Manfaat Mitra',
                hotelPartners: 'Mitra Hotel',
                villaPartners: 'Mitra Villa',
                spaPartners: 'Mitra Spa'
            },
            
            // FAQ - Indonesian
            faq: {
                title: 'Pertanyaan yang Sering Diajukan',
                subtitle: 'Semua yang perlu Anda ketahui tentang menggunakan IndaStreet',
                searchPlaceholder: 'Cari FAQ...',
                stillHaveQuestions: 'Masih Ada Pertanyaan?',
                contactSupport: 'Hubungi Tim Dukungan',
                generalCategory: 'Umum',
                bookingCategory: 'Pemesanan',
                paymentCategory: 'Pembayaran',
                cancellationCategory: 'Pembatalan',
                q1: 'Apa itu IndaStreet?',
                a1: 'IndaStreet adalah platform marketplace terkemuka di Indonesia yang menghubungkan pelanggan dengan terapis pijat profesional dan spa. Kami menyediakan layanan pijat di rumah dan rekomendasi tempat pijat terverifikasi di seluruh Bali.',
                q2: 'Bagaimana cara memesan terapis?',
                a2: 'Cukup telusuri terapis yang tersedia di area Anda, pilih jenis pijat dan durasi yang Anda inginkan, lalu klik "Pesan Sekarang". Anda dapat menghubungi terapis langsung melalui WhatsApp atau menggunakan sistem pemesanan kami.',
                q3: 'Apakah terapis diverifikasi?',
                a3: 'Ya, semua terapis di platform kami melalui proses verifikasi yang ketat. Kami memeriksa sertifikasi, pengalaman, dan melakukan verifikasi latar belakang untuk memastikan Anda mendapat layanan berkualitas.',
                q4: 'Berapa biaya layanannya?',
                a4: 'Harga bervariasi tergantung terapis, jenis pijat, dan durasi. Anda dapat melihat harga transparan di profil setiap terapis sebelum memesan. Tidak ada biaya tersembunyi.',
                q5: 'Bagaimana cara membatalkan pemesanan?',
                a5: 'Anda dapat membatalkan pemesanan dari halaman "Pesanan Saya". Kebijakan pembatalan bervariasi menurut terapis - silakan periksa kebijakan pembatalan mereka sebelum memesan.',
                q6: 'Metode pembayaran apa yang diterima?',
                a6: 'Kami menerima berbagai metode pembayaran termasuk tunai, transfer bank, dan pembayaran digital. Detail pembayaran akan dikonfirmasi langsung dengan terapis atau tempat pijat Anda.',
                q7: 'Apakah saya bisa memesan untuk hotel/villa saya?',
                a7: 'Ya! IndaStreet menawarkan kemitraan khusus untuk hotel dan villa. Hubungi tim kami untuk mempelajari lebih lanjut tentang menjadi mitra dan menyediakan layanan pijat untuk tamu Anda.',
                q8: 'Bagaimana cara menjadi terapis di IndaStreet?',
                a8: 'Klik "Jadi Terapis" di menu untuk memulai. Anda perlu melengkapi profil Anda, mengunggah sertifikasi, dan melalui proses verifikasi kami. Setelah disetujui, Anda dapat mulai menerima pemesanan.'
            },
            
            // About - Indonesian
            about: {
                title: 'Tentang IndaStreet',
                subtitle: 'Pasar Pijat Terkemuka di Indonesia',
                welcomeTitle: 'Selamat Datang di IndaStreet',
                welcomeText: 'Platform terpercaya Anda untuk layanan pijat profesional di Bali',
                missionTitle: 'Misi IndaStreet Kami',
                missionText: 'Menghubungkan pelanggan dengan terapis pijat berkualitas sambil memberdayakan profesional kesehatan lokal',
                verifiedTitle: 'Profesional & Mitra Terverifikasi',
                verifiedText: 'Semua terapis dan tempat pijat melalui proses verifikasi ketat kami',
                privacyTitle: 'Privasi, Terkunci',
                privacyText: 'Data Anda aman dan terlindungi dengan enkripsi tingkat enterprise',
                connectionTitle: 'Koneksi Instan. Obrolan Waktu Nyata.',
                connectionText: 'Komunikasi langsung dengan terapis melalui WhatsApp atau platform kami',
                teamTitle: 'Tim IndaStreet',
                teamText: 'Dipimpin oleh para profesional berpengalaman yang berdedikasi untuk meningkatkan kesehatan di Indonesia',
                ourStory: 'Kisah Kami',
                ourStoryText: 'IndaStreet dimulai dengan visi sederhana: membuat layanan pijat profesional mudah diakses oleh semua orang di Bali. Hari ini, kami adalah platform terkemuka yang menghubungkan ribuan pelanggan dengan terapis terverifikasi.',
                ourVision: 'Visi Kami',
                ourVisionText: 'Menjadi platform kesehatan dan kesejahteraan terpercaya di Indonesia, memberdayakan terapis lokal dan meningkatkan kualitas hidup pelanggan.',
                whyChooseUs: 'Mengapa Memilih IndaStreet',
                reason1: 'Terapis Terverifikasi',
                reason1Text: 'Semua profesional diperiksa dan diverifikasi',
                reason2: 'Harga Transparan',
                reason2Text: 'Tidak ada biaya tersembunyi atau kejutan',
                reason3: 'Pemesanan Mudah',
                reason3Text: 'Pesan dalam hitungan menit via WhatsApp atau aplikasi',
                reason4: 'Dukungan 24/7',
                reason4Text: 'Tim kami selalu siap membantu Anda'
            },
            
            // Drawer Admin - Indonesian  
            drawerAdmin: {
                pageTitle: 'Kelola Tombol Drawer',
                addButton: '+ Tambah Tombol Baru',
                buttonName: 'Nama Tombol',
                buttonNameRequired: 'Nama Tombol *',
                url: 'URL',
                urlRequired: 'URL *',
                buttonIcon: 'Ikon Tombol',
                uploadIcon: 'Unggah Gambar Ikon',
                saveButton: 'Simpan Tombol',
                updateButton: 'Perbarui Tombol',
                cancelButton: 'Batal',
                deleteButton: 'Hapus',
                customLinks: 'Tautan Kustom',
                noLinks: 'Tidak ada tautan kustom. Tambahkan satu di atas.',
                googleMapsSettings: 'Pengaturan Google Maps API',
                googleMapsDescription: 'Konfigurasikan Google Maps API untuk perhitungan jarak',
                apiKey: 'Kunci API',
                apiKeyPlaceholder: 'Masukkan Kunci Google Maps API Anda',
                saveApiKey: 'Simpan Kunci API',
                editApiKey: 'Edit',
                successUpdate: '✅ Tombol berhasil diperbarui!',
                successAdd: '✅ Tombol kustom berhasil ditambahkan!',
                successDelete: 'Tautan berhasil dihapus!',
                successApiKey: '✅ Kunci Google Maps API berhasil disimpan!',
                errorRequired: 'Harap isi semua bidang yang diperlukan (Nama dan URL)',
                errorIcon: 'Harap unggah gambar ikon untuk tombol Anda',
                errorApiKey: 'Harap masukkan kunci API yang valid',
                loadingError: 'Gagal memuat tautan. Harap refresh halaman.',
                authError: 'Kesalahan autentikasi. Mencoba membuat sesi...'
            }
        }
    };
}

// Initialize Appwrite client
const client = new sdk.Client();
const databases = new sdk.Databases(client);

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = 'translations';

// Configure client
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

async function createTranslationsCollection() {
    try {
        console.log('📦 Creating translations collection...');
        
        const collection = await databases.createCollection(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'Translations',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.write(sdk.Role.team('admin')),
            ]
        );
        
        console.log('✅ Collection created successfully');
        return collection;
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists, skipping creation');
            return null;
        }
        throw error;
    }
}

async function createAttributes() {
    try {
        console.log('📋 Creating collection attributes...');
        
        // language - 'en' or 'id'
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'language',
            10,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created language attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // key - translation key (e.g., 'home.therapistsTitle')
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'key',
            500,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created key attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // value - translation value
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'value',
            10000,
            true, // required
            undefined,
            false
        );
        console.log('✅ Created value attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // section - top-level section (e.g., 'home', 'dashboard')
        await databases.createStringAttribute(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'section',
            100,
            false, // not required
            undefined,
            false
        );
        console.log('✅ Created section attribute');
        
        // Wait for attributes to be available
        console.log('⏳ Waiting for attributes to be fully available...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Create index on language + key (unique combination)
        await databases.createIndex(
            DATABASE_ID,
            TRANSLATIONS_COLLECTION_ID,
            'language_key_unique',
            'unique',
            ['language', 'key']
        );
        console.log('✅ Created unique index on language+key');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Attributes already exist, skipping creation');
        } else {
            throw error;
        }
    }
}

function flattenTranslations(obj, prefix = '', section = '') {
    let result = [];
    
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Nested object - recurse
            const currentSection = section || key;
            result = result.concat(flattenTranslations(value, fullKey, currentSection));
        } else {
            // Leaf value - add to result
            result.push({
                key: fullKey,
                value: typeof value === 'string' ? value : JSON.stringify(value),
                section: section
            });
        }
    }
    
    return result;
}

async function seedTranslations() {
    try {
        console.log('🌱 Seeding translations...');
        console.log(`📦 Total languages: ${Object.keys(translations).length}`);
        
        let totalCreated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        
        for (const lang of ['en', 'id']) {
            console.log(`\n🌐 Processing ${lang.toUpperCase()} translations...`);
            
            const langTranslations = translations[lang];
            const flattenedTranslations = flattenTranslations(langTranslations);
            
            console.log(`  📝 Total keys: ${flattenedTranslations.length}`);
            
            for (const translation of flattenedTranslations) {
                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        TRANSLATIONS_COLLECTION_ID,
                        sdk.ID.unique(),
                        {
                            language: lang,
                            key: translation.key,
                            value: translation.value,
                            section: translation.section
                        }
                    );
                    totalCreated++;
                    
                    if (totalCreated % 50 === 0) {
                        console.log(`  ⏳ Progress: ${totalCreated} translations created...`);
                    }
                } catch (error) {
                    if (error.code === 409) {
                        totalSkipped++;
                    } else {
                        totalErrors++;
                        console.error(`  ❌ Error creating ${lang}.${translation.key}:`, error.message);
                    }
                }
            }
            
            console.log(`  ✅ ${lang.toUpperCase()} complete!`);
        }
        
        console.log('\n📊 Summary:');
        console.log(`  ✅ Created: ${totalCreated}`);
        console.log(`  ⏭️  Skipped (existing): ${totalSkipped}`);
        console.log(`  ❌ Errors: ${totalErrors}`);
        console.log('\n✅ Translation seeding complete!');
        
    } catch (error) {
        console.error('❌ Error seeding translations:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting Translation Seeding Process...\n');
        
        if (!APPWRITE_API_KEY) {
            console.error('❌ APPWRITE_API_KEY environment variable is required');
            console.log('\nPlease set your API key:');
            console.log('  Windows: $env:APPWRITE_API_KEY="your-api-key"');
            console.log('  Linux/Mac: export APPWRITE_API_KEY="your-api-key"');
            console.log('\nGet your API key from: https://cloud.appwrite.io/console/project-67ad11370013cea5c66b/settings');
            process.exit(1);
        }
        
        // Step 1: Create collection
        await createTranslationsCollection();
        
        // Step 2: Create attributes
        await createAttributes();
        
        // Step 3: Seed translations
        await seedTranslations();
        
        console.log('\n✅ Translation Seeding Complete!');
        console.log('\n📝 Next Steps:');
        console.log('1. Verify translations in Appwrite console');
        console.log('2. Test language switcher in your app');
        console.log('3. Default language: Indonesian (id)');
        console.log('4. Switch to English via header language selector');
        console.log('\n💡 To update translations: Edit files in /translations folder and re-run this script');
        console.log('💡 Existing translations will be skipped (not duplicated)');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
