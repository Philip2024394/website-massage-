import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface ChatTranslation {
    $id?: string;
    key: string;
    en: string;
    id: string; // Indonesian
    category: 'chat' | 'buttons' | 'errors' | 'messages';
    createdAt?: string;
    updatedAt?: string;
}

// Default chat translations
const defaultChatTranslations: Omit<ChatTranslation, '$id' | 'createdAt' | 'updatedAt'>[] = [
    // Button translations
    { key: 'book_now', en: 'Book Now', id: 'Pesan Sekarang', category: 'buttons' },
    { key: 'schedule', en: 'Schedule', id: 'Jadwalkan', category: 'buttons' },
    { key: 'activate_chat', en: 'Activate Chat', id: 'Aktifkan Chat', category: 'buttons' },
    { key: 'send_message', en: 'Send Message', id: 'Kirim Pesan', category: 'buttons' },
    { key: 'close_chat', en: 'Close Chat', id: 'Tutup Chat', category: 'buttons' },
    { key: 'try_again', en: 'Try Again', id: 'Coba Lagi', category: 'buttons' },
    { key: 'refresh_page', en: 'Refresh Page', id: 'Muat Ulang Halaman', category: 'buttons' },
    
    // Chat interface
    { key: 'chat_with', en: 'Chat with', id: 'Chat dengan', category: 'chat' },
    { key: 'type_message', en: 'Type your message...', id: 'Ketik pesan Anda...', category: 'chat' },
    { key: 'your_name', en: 'Your Name', id: 'Nama Anda', category: 'chat' },
    { key: 'whatsapp_number', en: 'WhatsApp Number', id: 'Nomor WhatsApp', category: 'chat' },
    { key: 'select_duration', en: 'Select Duration', id: 'Pilih Durasi', category: 'chat' },
    { key: 'minutes', en: 'minutes', id: 'menit', category: 'chat' },
    { key: 'available', en: 'Available', id: 'Tersedia', category: 'chat' },
    { key: 'busy', en: 'Busy', id: 'Sibuk', category: 'chat' },
    { key: 'offline', en: 'Offline', id: 'Offline', category: 'chat' },
    
    // Error messages
    { key: 'chat_service_error', en: 'Chat Service Error', id: 'Kesalahan Layanan Chat', category: 'errors' },
    { key: 'chat_error_description', en: 'The chat service encountered an unexpected error. This might be due to:', id: 'Layanan chat mengalami kesalahan yang tidak terduga. Ini mungkin disebabkan oleh:', category: 'errors' },
    { key: 'network_connectivity_issues', en: 'Network connectivity issues', id: 'Masalah konektivitas jaringan', category: 'errors' },
    { key: 'server_maintenance', en: 'Server maintenance', id: 'Pemeliharaan server', category: 'errors' },
    { key: 'browser_compatibility_issues', en: 'Browser compatibility issues', id: 'Masalah kompatibilitas browser', category: 'errors' },
    { key: 'connection_failed', en: 'Connection failed. Please check your internet connection.', id: 'Koneksi gagal. Silakan periksa koneksi internet Anda.', category: 'errors' },
    { key: 'service_unavailable', en: 'Chat service is temporarily unavailable.', id: 'Layanan chat sementara tidak tersedia.', category: 'errors' },
    
    // System messages
    { key: 'welcome_message', en: 'Hello! How can I help you today?', id: 'Halo! Bagaimana saya bisa membantu Anda hari ini?', category: 'messages' },
    { key: 'therapist_will_respond', en: 'Your therapist will respond shortly.', id: 'Terapis Anda akan segera merespons.', category: 'messages' },
    { key: 'session_started', en: 'Chat session started', id: 'Sesi chat dimulai', category: 'messages' },
    { key: 'session_ended', en: 'Chat session ended', id: 'Sesi chat berakhir', category: 'messages' },
    { key: 'booking_confirmed', en: 'Booking confirmed! We will contact you shortly.', id: 'Pemesanan dikonfirmasi! Kami akan menghubungi Anda segera.', category: 'messages' },
    
    // Chat Window specific translations
    { key: 'schedule_your_massage', en: 'Schedule Your Massage', id: 'Jadwalkan Pijat Anda', category: 'chat' },
    { key: 'select_massage_duration', en: 'Select Massage Duration', id: 'Pilih Durasi Pijatan', category: 'chat' },
    { key: 'next_select_time', en: 'Next: Select Time', id: 'Selanjutnya: Pilih Waktu', category: 'chat' },
    { key: 'select_time', en: 'Select Time', id: 'Pilih Waktu', category: 'chat' },
    { key: 'back', en: '← Back', id: '← Kembali', category: 'buttons' },
    { key: 'next_enter_details', en: 'Next: Enter Details', id: 'Selanjutnya: Masukkan Detail', category: 'buttons' },
    { key: 'customer_details', en: 'Customer Details', id: 'Detail Pelanggan', category: 'chat' },
    { key: 'confirm_booking', en: 'Confirm Booking', id: 'Konfirmasi Booking', category: 'buttons' },
    { key: 'booking_confirmed_title', en: '✅ Booking Confirmed!', id: '✅ Booking Dikonfirmasi!', category: 'messages' },
    { key: 'booking_summary', en: 'Booking Summary:', id: 'Ringkasan Booking:', category: 'chat' },
    { key: 'therapist', en: 'Therapist:', id: 'Terapis:', category: 'chat' },
    { key: 'accepts', en: 'Accepts', id: 'Menerima', category: 'chat' },
    { key: 'time', en: 'Time:', id: 'Waktu:', category: 'chat' },
    { key: 'duration', en: 'Duration:', id: 'Durasi:', category: 'chat' },
    { key: 'total_cost', en: 'Total Cost:', id: 'Total Biaya:', category: 'chat' },
    { key: 'close_window', en: 'Close Window', id: 'Tutup Jendela', category: 'buttons' },
    { key: 'switch_to_english', en: 'Switch to English', id: 'Switch to English', category: 'buttons' },
    { key: 'switch_to_indonesian', en: 'Ganti ke Bahasa Indonesia', id: 'Ganti ke Bahasa Indonesia', category: 'buttons' },
    { key: 'language_id', en: 'ID', id: 'ID', category: 'buttons' },
    { key: 'language_gb', en: 'GB', id: 'GB', category: 'buttons' },
    
    // Mobile Therapist Standards page translations
    { key: 'mobile_therapist_standards', en: 'Mobile Therapist Standards', id: 'Standar Terapis Mobile', category: 'chat' },
    { key: 'professional_in_home_hotel', en: 'Professional In-Home & Hotel Massage Services', id: 'Layanan Pijat Profesional di Rumah & Hotel', category: 'chat' },
    { key: 'therapist_standards', en: 'Therapist Standards', id: 'Standar Terapis', category: 'chat' },
    { key: 'professional_service_location', en: 'Professional Service at Your Location', id: 'Layanan Profesional di Lokasi Anda', category: 'chat' },
    { key: 'verified_badge_confidence', en: 'When you see our verified badge on a mobile therapist\'s profile, you can book with complete confidence knowing they meet our rigorous standards for in-home and hotel massage services. Your comfort, safety, and satisfaction are our top priorities.', id: 'Ketika Anda melihat lencana terverifikasi kami di profil terapis mobile, Anda dapat memesan dengan penuh percaya diri mengetahui mereka memenuhi standar ketat kami untuk layanan pijat di rumah dan hotel. Kenyamanan, keamanan, dan kepuasan Anda adalah prioritas utama kami.', category: 'messages' },
    { key: 'identity_verification_safety', en: '🛡️ Identity Verification & Safety Assurance', id: '🛡️ Verifikasi Identitas & Jaminan Keamanan', category: 'chat' },
    { key: 'identity_verification_description', en: 'All verified badge partners have completed identity verification by submitting official government-issued identification, undergoing comprehensive background checks, and meeting our standard verification requirements. **Indastreet** upholds safety and exceptional service as core industry standards. For your protection, we recommend selecting verified service providers when inviting professionals into your home or hotel villa, ensuring you engage only with trusted therapists who have successfully completed our rigorous screening protocols.', id: 'Semua mitra berverifikasi telah menyelesaikan verifikasi identitas dengan menyerahkan identifikasi resmi pemerintah, menjalani pemeriksaan latar belakang komprehensif, dan memenuhi persyaratan verifikasi standar kami. **Indastreet** menjunjung tinggi keamanan dan layanan luar biasa sebagai standar industri inti. Untuk perlindungan Anda, kami merekomendasikan memilih penyedia layanan terverifikasi saat mengundang profesional ke rumah atau vila hotel Anda, memastikan Anda hanya terlibat dengan terapis terpercaya yang telah berhasil menyelesaikan protokol penyaringan ketat kami.', category: 'messages' },
    { key: 'why_mobile_standards_matter', en: 'Why **Indastreet** Mobile Standards Matter', id: 'Mengapa Standar Mobile **Indastreet** Penting', category: 'chat' },
    { key: 'mobile_standards_intro', en: 'At **Indastreet**, we understand that inviting a massage therapist into your home or hotel room is a personal decision that requires the highest level of trust. That is why every verified mobile therapist on our platform has been carefully evaluated to ensure they meet strict professional standards for in-home services.', id: 'Di **Indastreet**, kami memahami bahwa mengundang terapis pijat ke rumah atau kamar hotel Anda adalah keputusan personal yang memerlukan tingkat kepercayaan tertinggi. Itulah mengapa setiap terapis mobile terverifikasi di platform kami telah dievaluasi dengan cermat untuk memastikan mereka memenuhi standar profesional ketat untuk layanan di rumah.', category: 'messages' },
    
    // Verification standards sections
    { key: 'professional_certification', en: '🎓 Professional Certification & Training', id: '🎓 Sertifikasi & Pelatihan Profesional', category: 'chat' },
    { key: 'professional_certification_desc', en: 'Verified therapists must hold valid professional massage therapy certifications from recognized institutions. They demonstrate proven expertise in various massage techniques and maintain continuing education requirements to stay current with industry best practices.', id: 'Terapis terverifikasi harus memiliki sertifikasi terapi pijat profesional yang valid dari lembaga yang diakui. Mereka menunjukkan keahlian terbukti dalam berbagai teknik pijat dan mempertahankan persyaratan pendidikan berkelanjutan untuk tetap mengikuti praktik terbaik industri.', category: 'messages' },
    { key: 'equipment_hygiene', en: '🧼 Equipment & Hygiene Protocols', id: '🧼 Protokol Peralatan & Kebersihan', category: 'chat' },
    { key: 'equipment_hygiene_desc', en: 'All therapists follow strict hygiene standards, using fresh linens for each session and maintaining sanitized equipment. They carry professional-grade portable massage tables, high-quality oils, and all necessary supplies for a complete spa experience.', id: 'Semua terapis mengikuti standar kebersihan yang ketat, menggunakan seprai segar untuk setiap sesi dan memelihara peralatan yang telah disanitasi. Mereka membawa meja pijat portable tingkat profesional, minyak berkualitas tinggi, dan semua perlengkapan yang diperlukan untuk pengalaman spa yang lengkap.', category: 'messages' },
    { key: 'communication_professionalism', en: '💬 Communication & Professionalism', id: '💬 Komunikasi & Profesionalisme', category: 'chat' },
    { key: 'communication_professionalism_desc', en: 'Verified mobile therapists maintain professional communication from booking to service completion. They arrive punctually, respect your space, and provide clear information about services, pricing, and session expectations.', id: 'Terapis mobile terverifikasi mempertahankan komunikasi profesional dari pemesanan hingga penyelesaian layanan. Mereka tiba tepat waktu, menghormati ruang Anda, dan memberikan informasi yang jelas tentang layanan, harga, dan ekspektasi sesi.', category: 'messages' },
    { key: 'boundary_respect', en: '🤝 Boundary & Privacy Respect', id: '🤝 Menghormati Batasan & Privasi', category: 'chat' },
    { key: 'boundary_respect_desc', en: 'Professional boundaries are paramount. Verified therapists maintain appropriate draping techniques, respect client comfort levels, and ensure all interactions remain strictly therapeutic and professional throughout the session.', id: 'Batasan profesional adalah yang terpenting. Terapis terverifikasi mempertahankan teknik draping yang tepat, menghormati tingkat kenyamanan klien, dan memastikan semua interaksi tetap ketat terapeutik dan profesional sepanjang sesi.', category: 'messages' },
    { key: 'flexible_scheduling', en: '⏰ Flexible Scheduling & Reliability', id: '⏰ Penjadwalan Fleksibel & Keandalan', category: 'chat' },
    { key: 'flexible_scheduling_desc', en: 'Mobile therapists accommodate your schedule with flexible appointment times, including evenings and weekends. They maintain reliable booking systems and provide advance notice for any schedule changes.', id: 'Terapis mobile mengakomodasi jadwal Anda dengan waktu janji yang fleksibel, termasuk malam dan akhir pekan. Mereka mempertahankan sistem pemesanan yang dapat diandalkan dan memberikan pemberitahuan sebelumnya untuk setiap perubahan jadwal.', category: 'messages' },
    { key: 'custom_treatment_plans', en: '🎯 Custom Treatment Plans', id: '🎯 Rencana Perawatan Khusus', category: 'chat' },
    { key: 'custom_treatment_plans_desc', en: 'Each session begins with a consultation to understand your specific needs, preferences, and any health considerations. Therapists customize their approach to deliver the most beneficial and relaxing experience for you.', id: 'Setiap sesi dimulai dengan konsultasi untuk memahami kebutuhan spesifik, preferensi, dan pertimbangan kesehatan Anda. Terapis menyesuaikan pendekatan mereka untuk memberikan pengalaman yang paling bermanfaat dan santai bagi Anda.', category: 'messages' },
    { key: 'insurance_coverage', en: '🛡️ Insurance & Liability Coverage', id: '🛡️ Cakupan Asuransi & Tanggung Jawab', category: 'chat' },
    { key: 'insurance_coverage_desc', en: 'All verified mobile therapists carry professional liability insurance and are covered for in-home services. This provides additional peace of mind for both clients and service providers during mobile sessions.', id: 'Semua terapis mobile terverifikasi membawa asuransi tanggung jawab profesional dan ditanggung untuk layanan di rumah. Ini memberikan ketenangan pikiran tambahan bagi klien dan penyedia layanan selama sesi mobile.', category: 'messages' },
    { key: 'continuous_training', en: '📚 Continuous Training & Development', id: '📚 Pelatihan & Pengembangan Berkelanjutan', category: 'chat' },
    { key: 'continuous_training_desc', en: 'Mobile therapists participate in ongoing professional development, staying updated with the latest techniques, safety protocols, and industry standards to provide the highest quality mobile massage services.', id: 'Terapis mobile berpartisipasi dalam pengembangan profesional yang berkelanjutan, tetap diperbarui dengan teknik terbaru, protokol keselamatan, dan standar industri untuk memberikan layanan pijat mobile berkualitas tertinggi.', category: 'messages' },
    
    // Additional sections translations
    { key: 'verification_process_note', en: 'Our verification process protects you by confirming that mobile therapists arrive prepared with clean equipment, professional appearance, certified products, and exceptional service standards. This commitment to quality means you can relax in your own space knowing you are receiving spa-quality treatment.', id: 'Proses verifikasi kami melindungi Anda dengan memastikan bahwa terapis mobile tiba dengan persiapan peralatan bersih, penampilan profesional, produk bersertifikat, dan standar layanan luar biasa. Komitmen terhadap kualitas ini berarti Anda dapat bersantai di ruang Anda sendiri dengan mengetahui Anda menerima perawatan kualitas spa.', category: 'messages' },
    { key: 'pending_verification_note', en: '**Please note:** Some mobile therapist profiles may not yet display the verified badge due to pending inspection or awaiting final confirmation. We continuously review all providers to maintain the highest standards across our platform.', id: '**Harap dicatat:** Beberapa profil terapis mobile mungkin belum menampilkan lencana terverifikasi karena inspeksi tertunda atau menunggu konfirmasi akhir. Kami terus meninjau semua penyedia untuk mempertahankan standar tertinggi di seluruh platform kami.', category: 'messages' },
    { key: 'therapist_verification_standards', en: '**Indastreet** Therapist Verification Standards', id: 'Standar Verifikasi Terapis **Indastreet**', category: 'chat' },
    { key: 'professional_appearance_hygiene', en: '1. Professional Appearance & Personal Hygiene', id: '1. Penampilan Profesional & Kebersihan Pribadi', category: 'chat' },
    { key: 'fresh_linens_towels', en: '2. Fresh Linens, Towels & Bed Sheets', id: '2. Seprai, Handuk & Seprai Tempat Tidur Segar', category: 'chat' },
    { key: 'regulated_oils_products', en: '3. Regulated Oils & Skin-Safe Products', id: '3. Minyak Teregulasi & Produk Aman Kulit', category: 'chat' },
    { key: 'professionalism_conduct', en: '5. Professionalism & Conduct', id: '5. Profesionalisme & Perilaku', category: 'chat' },
    { key: 'training_certification', en: '6. Training & Certification Requirements', id: '6. Persyaratan Pelatihan & Sertifikasi', category: 'chat' },
    { key: 'health_safety_protocols', en: '7. Health & Safety Protocols', id: '7. Protokol Kesehatan & Keselamatan', category: 'chat' },
    { key: 'additional_requirements', en: '8. Additional Professional Requirements', id: '8. Persyaratan Profesional Tambahan', category: 'chat' },
    { key: 'why_choose_verified', en: 'Why Choose Verified Mobile Therapists?', id: 'Mengapa Memilih Terapis Mobile Terverifikasi?', category: 'chat' },
    { key: 'client_safety_tips', en: 'Client Safety Tips', id: 'Tips Keselamatan Klien', category: 'chat' },
    { key: 'questions_about_standards', en: 'Questions About Our Standards?', id: 'Pertanyaan Tentang Standar Kami?', category: 'chat' },
    { key: 'transparency_commitment', en: 'We are committed to transparency and your safety. If you have questions about our mobile therapist verification standards or want to report a concern, please contact us.', id: 'Kami berkomitmen pada transparansi dan keselamatan Anda. Jika Anda memiliki pertanyaan tentang standar verifikasi terapis mobile kami atau ingin melaporkan kekhawatiran, silakan hubungi kami.', category: 'messages' },
    { key: 'contact_support', en: 'Contact Support', id: 'Hubungi Dukungan', category: 'buttons' },
    
    // Pricing and booking
    { key: 'price_per_session', en: 'Price per session', id: 'Harga per sesi', category: 'chat' },
    { key: 'discount_applied', en: 'Discount applied', id: 'Diskon diterapkan', category: 'chat' },
    { key: 'total_price', en: 'Total Price', id: 'Total Harga', category: 'chat' },
    { key: 'immediate_booking', en: 'Immediate Booking', id: 'Pemesanan Langsung', category: 'chat' },
    { key: 'scheduled_booking', en: 'Scheduled Booking', id: 'Pemesanan Terjadwal', category: 'chat' },
    
    // Validation messages
    { key: 'name_required', en: 'Name is required', id: 'Nama wajib diisi', category: 'errors' },
    { key: 'whatsapp_required', en: 'WhatsApp number is required', id: 'Nomor WhatsApp wajib diisi', category: 'errors' },
    { key: 'invalid_whatsapp', en: 'Please enter a valid WhatsApp number', id: 'Silakan masukkan nomor WhatsApp yang valid', category: 'errors' },
    { key: 'duration_required', en: 'Please select a session duration', id: 'Silakan pilih durasi sesi', category: 'errors' }
];

class ChatTranslationService {
    private static instance: ChatTranslationService;
    private translations: Map<string, ChatTranslation> = new Map();
    private isLoaded = false;

    static getInstance(): ChatTranslationService {
        if (!ChatTranslationService.instance) {
            ChatTranslationService.instance = new ChatTranslationService();
        }
        return ChatTranslationService.instance;
    }

    // Initialize translations from Appwrite
    async initializeTranslations(): Promise<void> {
        if (this.isLoaded) {
            return;
        }

        try {
            console.log('🌍 Loading chat translations from Appwrite...');
            
            // Try to fetch existing translations
            const result = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatTranslations || 'chat_translations',
                []
            );

            if (result.documents.length === 0) {
                console.log('📝 No translations found, creating default translations...');
                await this.createDefaultTranslations();
            } else {
                // Load existing translations
                result.documents.forEach(doc => {
                    const translation = doc as unknown as ChatTranslation;
                    this.translations.set(translation.key, translation);
                });
                console.log(`✅ Loaded ${result.documents.length} chat translations`);
            }

            this.isLoaded = true;
        } catch (error) {
            console.warn('⚠️ Failed to load translations from Appwrite, using defaults:', error);
            this.loadDefaultTranslations();
            this.isLoaded = true;
        }
    }

    // Create default translations in Appwrite
    private async createDefaultTranslations(): Promise<void> {
        try {
            for (const translation of defaultChatTranslations) {
                const doc = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatTranslations || 'chat_translations',
                    ID.unique(),
                    {
                        ...translation,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );

                this.translations.set(translation.key, doc as unknown as ChatTranslation);
            }
            
            console.log(`✅ Created ${defaultChatTranslations.length} default translations in Appwrite`);
        } catch (error) {
            console.error('❌ Failed to create default translations:', error);
            this.loadDefaultTranslations();
        }
    }

    // Load default translations into memory (fallback)
    private loadDefaultTranslations(): void {
        defaultChatTranslations.forEach(translation => {
            this.translations.set(translation.key, {
                ...translation,
                $id: `local-${translation.key}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
    }

    // Get translation by key and language
    getTranslation(key: string, language: 'en' | 'id' = 'en'): string {
        const translation = this.translations.get(key);
        
        if (!translation) {
            console.warn(`⚠️ Translation not found for key: ${key}`);
            return key; // Return key as fallback
        }

        return translation[language] || translation.en || key;
    }

    // Get multiple translations
    getTranslations(keys: string[], language: 'en' | 'id' = 'en'): Record<string, string> {
        const result: Record<string, string> = {};
        keys.forEach(key => {
            result[key] = this.getTranslation(key, language);
        });
        return result;
    }

    // Add or update translation
    async setTranslation(key: string, en: string, id: string, category: ChatTranslation['category']): Promise<void> {
        try {
            const existing = this.translations.get(key);
            
            if (existing && existing.$id && !existing.$id.startsWith('local-')) {
                // Update existing in Appwrite
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatTranslations || 'chat_translations',
                    existing.$id,
                    { en, id, category, updatedAt: new Date().toISOString() }
                );
            } else {
                // Create new in Appwrite
                const doc = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.chatTranslations || 'chat_translations',
                    ID.unique(),
                    {
                        key, en, id, category,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                );
                
                this.translations.set(key, doc as unknown as ChatTranslation);
            }

            console.log(`✅ Translation updated: ${key}`);
        } catch (error) {
            console.error(`❌ Failed to save translation: ${key}`, error);
            // Update in memory as fallback
            this.translations.set(key, {
                $id: `local-${key}`,
                key, en, id, category,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

    // Get all translations by category
    getTranslationsByCategory(category: ChatTranslation['category'], language: 'en' | 'id' = 'en'): Record<string, string> {
        const result: Record<string, string> = {};
        
        this.translations.forEach((translation, key) => {
            if (translation.category === category) {
                result[key] = translation[language] || translation.en || key;
            }
        });
        
        return result;
    }

    // Check if translations are loaded
    isInitialized(): boolean {
        return this.isLoaded;
    }

    // Force reload translations
    async reloadTranslations(): Promise<void> {
        this.isLoaded = false;
        this.translations.clear();
        await this.initializeTranslations();
    }

    // Language preference management
    setLanguagePreference(language: 'en' | 'id'): void {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('preferredLanguage', language === 'en' ? 'gb' : language);
                console.log(`🌐 Language preference set to: ${language}`);
            }
        } catch (error) {
            console.error('❌ Failed to save language preference:', error);
        }
    }

    getLanguagePreference(): 'en' | 'id' {
        try {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('preferredLanguage');
                return saved === 'gb' ? 'en' : saved === 'id' ? 'id' : 'en';
            }
        } catch (error) {
            console.error('❌ Failed to get language preference:', error);
        }
        return 'en'; // Default fallback
    }

    // Sync all translations to Appwrite (for admin use)
    async syncAllTranslations(): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        console.log('🔄 Starting translation sync to Appwrite...');

        for (const translation of defaultChatTranslations) {
            try {
                await this.setTranslation(translation.key, translation.en, translation.id, translation.category);
                success++;
                console.log(`✅ Synced: ${translation.key}`);
            } catch (error) {
                failed++;
                console.error(`❌ Failed to sync: ${translation.key}`, error);
            }
        }

        console.log(`🔄 Translation sync completed: ${success} success, ${failed} failed`);
        return { success, failed };
    }

    // Get translation with language preference
    getTranslationWithPreference(key: string): string {
        const preferredLanguage = this.getLanguagePreference();
        return this.getTranslation(key, preferredLanguage);
    }
}

export const chatTranslationService = ChatTranslationService.getInstance();

// Auto-initialize when service is imported
if (typeof window !== 'undefined') {
    chatTranslationService.initializeTranslations().catch(console.error);
}

export type { ChatTranslation };