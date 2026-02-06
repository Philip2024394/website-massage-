/**
 * Therapist Dashboard Help Content
 * Elite-level contextual help system
 * 
 * Structure: Organized by page → feature
 * Each help item explains what the feature achieves when completed
 */

export interface HelpContent {
  title: string;
  content: string;
  benefits: string[];
  bullets?: string[]; // Alternative to benefits for simpler formatting
}

export interface PageHelpContent {
  [featureKey: string]: HelpContent;
}

/**
 * ============================================================================
 * 🆘 CONTEXTUAL HELP TOPICS - GOLD STANDARD
 * ============================================================================
 * Added: 5 critical help topics based on common mistakes and support requests
 * Language: Bahasa Indonesia (primary)
 * Purpose: Reduce mistakes, improve booking response, prevent support tickets
 * ============================================================================
 */

/**
 * Dashboard Core Features Help
 * Critical contextual help for main dashboard features
 */
export const dashboardHelp: PageHelpContent = {
  onlineStatus: {
    title: 'Status Online',
    content: 'Saat status Anda Online, Anda dapat menerima booking.\n\nStatus Online akan otomatis berubah menjadi Offline setelah 12 jam.',
    bullets: [
      'Mengatur ulang status Online untuk memperpanjang waktu',
      'Mengubah status ke Busy jika sedang tidak tersedia',
      'Melewatkan atau menolak booking dapat menurunkan peringkat Anda'
    ],
    benefits: []
  },
  
  bookingCountdown: {
    title: 'Waktu Konfirmasi Booking',
    content: 'Anda memiliki waktu terbatas untuk menerima booking.',
    bullets: [
      'Booking akan dialihkan ke terapis lain jika waktu habis',
      'Peringkat respons Anda dapat terpengaruh',
      'Selalu pastikan Anda siap sebelum mengatur status Online'
    ],
    benefits: []
  },
  
  earningsCommission: {
    title: 'Pendapatan & Komisi',
    content: 'Setiap booking memiliki komisi platform.\n\nSetelah layanan selesai:',
    bullets: [
      'Unggah bukti pembayaran',
      'Status akan menunggu verifikasi admin',
      'Bukti pembayaran hanya dapat diunggah satu kali per booking'
    ],
    benefits: []
  },
  
  uploadPaymentProof: {
    title: 'Upload Bukti Pembayaran',
    content: 'Pastikan bukti pembayaran:',
    bullets: [
      'Jelas dan dapat dibaca',
      'Sesuai dengan booking yang dipilih',
      'Bukti tidak dapat diubah setelah diunggah',
      'Status menunggu verifikasi admin'
    ],
    benefits: []
  },
  
  profileVisibility: {
    title: 'Visibilitas Profil',
    content: 'Profil Anda akan lebih sering muncul jika:',
    bullets: [
      'Respons cepat terhadap booking',
      'Jarang melewatkan atau menolak booking',
      'Status Online digunakan dengan benar',
      'Performa yang baik meningkatkan peluang mendapatkan booking'
    ],
    benefits: []
  }
};

/**
 * More Customers Help Content
 */
export const moreCustomersHelp: PageHelpContent = {
  profileOptimization: {
    title: 'Optimasi Profil untuk Lebih Banyak Pelanggan',
    content: 'Pelajari strategi lengkap untuk meningkatkan visibilitas profil Anda, menarik lebih banyak booking, dan memaksimalkan pendapatan. Profil yang dioptimasi dapat meningkatkan booking hingga 3x lipat.',
    benefits: [
      'Foto profil profesional meningkatkan trust',
      'Deskripsi menarik menarik perhatian pelanggan',
      'Menu harga jelas meningkatkan konversi',
      'Rating tinggi membangun kredibilitas',
      'Respons cepat meningkatkan kepuasan',
      'Update status real-time untuk availability'
    ]
  }
};

/**
 * Package Terms Help Content
 */
export const packageTermsHelp: PageHelpContent = {
  overview: {
    title: 'Paket Langganan Premium',
    content: 'Pilih paket langganan yang sesuai dengan kebutuhan bisnis Anda. Paket Premium memberikan visibilitas lebih tinggi, prioritas booking, dan fitur analitik lengkap untuk memaksimalkan pendapatan.',
    benefits: [
      'Tampil di urutan teratas hasil pencarian',
      'Badge Premium yang menarik perhatian pelanggan',
      'Notifikasi booking real-time tanpa delay',
      'Analitik dan laporan detail',
      'Support prioritas 24/7',
      'ROI terbukti meningkat hingga 3x lipat'
    ]
  }
};

/**
 * Commission Help Content (alias for commissionPaymentHelp)
 */
export const commissionHelp: PageHelpContent = {
  overview: {
    title: 'Komisi Platform 30%',
    content: 'Platform mengambil komisi 30% dari setiap booking yang berhasil diselesaikan. Anda menerima 70% dari total nilai booking sebagai pendapatan bersih Anda.',
    benefits: [
      'Transparansi pembagian pendapatan yang jelas',
      'Perhitungan otomatis dan akurat',
      'Riwayat komisi tersimpan lengkap',
      'Laporan detail per periode',
      'Sistem pembayaran terpercaya dan tepat waktu'
    ]
  }
};

/**
 * Premium Help Content
 */
export const premiumHelp: PageHelpContent = {
  overview: {
    title: 'Upgrade ke Premium',
    content: 'Tingkatkan akun Anda ke Premium untuk mendapatkan lebih banyak visibilitas, fitur prioritas, dan peningkatan penghasilan. Member Premium muncul di urutan teratas hasil pencarian pelanggan.',
    benefits: [
      'Tampil di urutan teratas hasil pencarian',
      'Badge Premium yang menarik perhatian',
      'Notifikasi booking lebih cepat',
      'Dukungan prioritas dari tim support',
      'Analitik mendalam untuk optimasi bisnis',
      'Peluang booking meningkat hingga 3x lipat'
    ]
  }
};

/**
 * Menu Help Content
 */
export const menuHelp: PageHelpContent = {
  overview: {
    title: 'Kelola Menu Layanan Anda',
    content: 'Atur jenis layanan massage yang Anda tawarkan dan harganya. Menu yang jelas dan kompetitif membantu menarik lebih banyak pelanggan dan meningkatkan booking Anda.',
    benefits: [
      'Tampilkan layanan dengan durasi dan harga jelas',
      'Harga kompetitif menarik lebih banyak pelanggan',
      'Update harga kapan saja sesuai kebutuhan',
      'Menu profesional meningkatkan kepercayaan',
      'Pelanggan dapat memilih layanan sesuai budget'
    ]
  }
};

/**
 * Chat Help Content
 */
export const chatHelp: PageHelpContent = {
  overview: {
    title: 'Sistem Chat dengan Pelanggan',
    content: 'Berkomunikasi langsung dengan pelanggan Anda untuk koordinasi booking, konfirmasi lokasi, dan pertanyaan lainnya. Chat membantu membangun kepercayaan dan meningkatkan kepuasan pelanggan.',
    benefits: [
      'Komunikasi real-time dengan pelanggan',
      'Koordinasi detail booking dan lokasi',
      'Bangun kepercayaan dan profesionalisme',
      'Tingkatkan rating dengan layanan responsif',
      'Terima notifikasi pesan baru secara instant'
    ]
  }
};

/**
 * TherapistEarnings Page Help Content
 */
export const earningsHelp: PageHelpContent = {
  completedEarnings: {
    title: 'Total Pendapatan dari Booking Selesai',
    content: 'Pendapatan aktual Anda dari semua booking yang telah diselesaikan. Ini menunjukkan jumlah yang Anda terima setelah komisi platform 30% dipotong.',
    benefits: [
      'Lihat pendapatan real-time dari booking selesai',
      '70% dari nilai total booking masuk ke Anda',
      'Melacak booking Book Now dan Scheduled',
      'Terhubung langsung ke database Appwrite'
    ]
  },
  lostEarnings: {
    title: 'Pelacak Pendapatan Hilang',
    content: 'Pendapatan yang terlewat dari booking yang kadaluarsa, ditolak, atau dibatalkan. Ini membantu Anda memahami peluang yang hilang karena timeout atau penolakan.',
    benefits: [
      'Identifikasi pola kehilangan pendapatan',
      'Lihat dampak kadaluarsa timeout 5 menit',
      'Lacak konsekuensi booking yang ditolak',
      'Tingkatkan waktu respons untuk maksimalkan pendapatan'
    ]
  },
  serviceBreakdown: {
    title: 'Rincian Durasi Layanan',
    content: 'Pendapatan dipisahkan berdasarkan durasi layanan (60, 90, 120 menit). Menunjukkan jenis layanan mana yang menghasilkan pendapatan terbanyak.',
    benefits: [
      'Identifikasi durasi layanan paling menguntungkan',
      'Optimalkan strategi harga',
      'Fokuskan marketing pada layanan berpenghasilan tinggi',
      'Lacak preferensi pelanggan berdasarkan durasi'
    ]
  },
  bookingTypes: {
    title: 'Book Now vs Scheduled',
    content: 'Bandingkan pendapatan dari booking langsung "Book Now" versus booking terjadwal "Scheduled" dengan deposit.',
    benefits: [
      'Pahami profitabilitas tipe booking',
      'Rencanakan strategi ketersediaan',
      'Seimbangkan pekerjaan langsung vs terjadwal',
      'Lacak pendapatan berbasis deposit'
    ]
  },
  monthlyEarnings: {
    title: 'Pendapatan Bulanan',
    content: 'Total pendapatan Anda untuk bulan berjalan dari semua booking yang diselesaikan. Reset pada tanggal 1 setiap bulan.',
    benefits: [
      'Lacak target pendapatan bulanan',
      'Bandingkan pertumbuhan bulan ke bulan',
      'Rencanakan anggaran pribadi',
      'Pantau performa bisnis'
    ]
  },
  peakHours: {
    title: 'Jam Sibuk Booking',
    content: 'Analitik yang menunjukkan jam tersibuk Anda berdasarkan data booking aktual 30 hari terakhir dari Appwrite.',
    benefits: [
      'Optimalkan ketersediaan selama jam sibuk',
      'Kenakan tarif premium selama jam permintaan tinggi',
      'Rencanakan istirahat selama periode permintaan rendah',
      'Keputusan penjadwalan berbasis data'
    ]
  },
  busiestDays: {
    title: 'Peta Panas Hari Tersibuk',
    content: 'Representasi visual dari hari-hari mana dalam seminggu yang menghasilkan booking terbanyak. Klik hari mana pun untuk melihat rincian per jam.',
    benefits: [
      'Identifikasi hari paling menguntungkan',
      'Jadwalkan hari istirahat secara strategis',
      'Maksimalkan pendapatan di hari puncak',
      'Analisis slot waktu interaktif'
    ]
  },
  dataSource: {
    title: 'Koneksi Appwrite',
    content: 'Semua data pendapatan dihitung secara real-time dari koleksi booking Appwrite. Tidak ada penyimpanan lokal - selalu terbaru.',
    benefits: [
      'Akurasi real-time',
      'Keandalan berbasis cloud',
      'Konsistensi lintas perangkat',
      'Backup data otomatis'
    ]
  }
};

/**
 * TherapistOnlineStatus Page Help Content
 */
export const onlineStatusHelp: PageHelpContent = {
  availabilityToggle: {
    title: '12-Hour Availability Timer',
    content: 'Sistem timer 12 jam otomatis mengatur ketersediaan Anda. Ketika "Tersedia", timer mulai hitung mundur 12 jam. Setelah habis, status berubah ke "Sibuk" secara otomatis. Timer selalu reset ke 12 jam penuh setiap kali Anda pilih "Tersedia".',
    benefits: [
      'Timer selalu reset ke 12 jam saat pilih "Tersedia"',
      'Auto-berubah ke "Sibuk" setelah 12 jam',
      'Cegah ketersediaan tanpa batas waktu',
      'Dorongan manajemen sesi yang aktif',
      'Timer pause saat "Sibuk" atau "Offline"'
    ]
  },
  countdownTimer: {
    title: 'Timer Countdown 12 Jam',
    content: 'Timer menampilkan sisa waktu dalam format "Xh Ym" saat "Tersedia". Setelah mencapai 0, status otomatis berubah ke "Sibuk". Setiap kali Anda pilih "Tersedia" dari status apapun, timer selalu reset ke 12 jam penuh.',
    benefits: [
      'Visual feedback waktu tersisa yang jelas',
      'Format "8h 45m remaining" mudah dibaca', 
      'Reset otomatis ke 12h saat available',
      'Status "Timer Expired" saat habis',
      '"12h 0m when available" saat offline/busy'
    ]
  },
  discountBadge: {
    title: 'Badge Diskon',
    content: 'Tampilkan badge diskon promosi di profil Anda untuk menarik lebih banyak pelanggan. Atur persentase diskon Anda dan langsung muncul di homepage.',
    benefits: [
      'Tingkatkan tingkat booking hingga 40%',
      'Menonjol dari terapis lain',
      'Kontrol diskon fleksibel',
      'Tidak perlu persetujuan - aktivasi instan'
    ]
  },
  downloadApp: {
    title: 'Download Aplikasi Mobile',
    content: 'Install PWA (Progressive Web App) untuk akses lebih cepat, dukungan offline, dan notifikasi push untuk booking baru.',
    benefits: [
      'Notifikasi booking instan',
      'Bekerja offline - lihat jadwal kapan saja',
      'Loading lebih cepat dari website',
      'Tambahkan ke home screen - akses sekali tap'
    ]
  },
  autoOfflineTimer: {
    title: 'Timer Auto Offline',
    content: 'Jadwalkan waktu tertentu setiap hari untuk otomatis mengubah status Anda ke Offline. Sempurna untuk menjaga keseimbangan kerja-hidup tanpa update manual.',
    benefits: [
      'Tidak pernah lupa untuk offline',
      'Atur sekali, berjalan otomatis setiap hari',
      'Jaga konsistensi jam kerja',
      'Fitur Premium - upgrade untuk membuka'
    ]
  }
};

/**
 * MyBookings Page Help Content
 */
export const myBookingsHelp: PageHelpContent = {
  acceptBooking: {
    title: 'Terima Booking',
    content: 'Konfirmasi Anda dapat memenuhi booking ini. Setelah diterima, pelanggan menerima konfirmasi dan mengharapkan Anda tiba tepat waktu.',
    benefits: [
      'Bangun kepercayaan dengan pelanggan',
      'Amankan slot booking Anda',
      'Aktifkan pengingat otomatis',
      'Manfaatkan sistem timer 12 jam'
    ]
  },
  rejectBooking: {
    title: 'Tolak Booking',
    content: 'Tolak booking yang tidak dapat Anda penuhi. Bersikap profesional - tolak hanya jika benar-benar diperlukan. Tingkat penolakan tinggi mempengaruhi peringkat Anda.',
    benefits: [
      'Jaga jadwal yang realistis',
      'Hindari penalti untuk no-show',
      'Manajemen batasan profesional',
      'Pelanggan mendapat refund otomatis'
    ]
  },
  depositApproval: {
    title: 'Persetujuan Deposit',
    content: 'Untuk terapis Premium: Tinjau dan setujui pembayaran deposit pelanggan sebelum mengkonfirmasi booking. Ini melindungi dari no-show.',
    benefits: [
      'Kurangi risiko no-show',
      'Verifikasi pembayaran sebelum komitmen',
      'Alur pembayaran profesional',
      'Bangun akuntabilitas pelanggan'
    ]
  },
  chatWithCustomer: {
    title: 'Chat dengan Pelanggan',
    content: 'Kirim pesan langsung kepada pelanggan tentang detail booking, klarifikasi lokasi, atau preferensi layanan. Riwayat chat disimpan.',
    benefits: [
      'Klarifikasi persyaratan booking',
      'Bangun hubungan dengan pelanggan',
      'Selesaikan masalah dengan cepat',
      'Tingkatkan kualitas layanan'
    ]
  },
  bookingsList: {
    title: 'Manajemen Booking & Jadwal',
    content: 'Lihat dan kelola semua booking Anda di satu tempat. Filter berdasarkan status (Semua, Diterima, Terjadwal, Selesai) untuk mengatur beban kerja. Beralih antara tab Booking dan Jadwal.',
    benefits: [
      'Ringkasan booking lengkap',
      'Filter berdasarkan status booking',
      'Lacak booking terjadwal vs instan',
      'Pantau pendapatan dan tingkat penyelesaian'
    ]
  }
};

/**
 * TherapistBookings Page Help Content (Main booking management page)
 */
export const bookingsScheduleHelp: PageHelpContent = {
  manageBookings: {
    title: 'Manajemen Booking & Jadwal',
    content: 'Lihat semua booking Anda: booking instan, janji terjadwal, dan sesi selesai. Terima atau tolak booking, chat dengan pelanggan, dan kelola jadwal Anda di satu tempat.',
    benefits: [
      'Manajemen booking terpusat',
      'Aksi terima/tolak cepat',
      'Notifikasi booking real-time',
      'Lacak pendapatan per booking'
    ]
  },
  filterBookings: {
    title: 'Filter Booking',
    content: 'Gunakan filter untuk melihat tipe booking tertentu: Semua (semuanya), Diterima (menunggu persetujuan), Terjadwal (booking masa depan terkonfirmasi), atau Selesai (sesi selesai).',
    benefits: [
      'Fokus pada yang memerlukan tindakan',
      'Lacak sesi selesai',
      'Tinjau persetujuan tertunda',
      'Rencanakan jadwal mendatang'
    ]
  },
  depositBookings: {
    title: 'Booking Terjadwal dengan Deposit',
    content: 'Terapis Premium dapat memerlukan deposit 30% untuk booking terjadwal. Tinjau bukti pembayaran, setujui/tolak deposit, dan konfirmasi booking setelah pembayaran terverifikasi.',
    benefits: [
      'Kurangi risiko no-show',
      'Komitmen booking terjamin',
      'Alur pembayaran profesional',
      'Lindungi waktu dan pendapatan Anda'
    ]
  },
  switchScheduleTab: {
    title: 'Tab Jadwal',
    content: 'Beralih ke tab Jadwal untuk mengatur ketersediaan mingguan, blokir slot waktu, dan kelola jam kerja. Ini mengontrol kapan pelanggan dapat memesan Anda.',
    benefits: [
      'Kontrol ketersediaan Anda',
      'Atur jam kerja berulang',
      'Blokir waktu untuk istirahat',
      'Cegah booking di luar jam kerja'
    ]
  },
  blockDates: {
    title: 'Blokir Tanggal untuk Booking Terjadwal',
    content: 'Gunakan tab "Kelola Ketersediaan" untuk memblokir tanggal tertentu ketika Anda tidak tersedia. Tanggal yang diblokir akan tampil MERAH di kalender pelanggan sebagai "booked" dan tidak dapat dipilih.',
    benefits: [
      'Blokir tanggal cuti atau libur',
      'Cegah booking saat tidak tersedia',
      'Tampil sebagai "booked" ke pelanggan',
      'Kelola ketersediaan dengan mudah',
      'Klik tanggal untuk blokir/buka blokir',
      'Lihat daftar tanggal yang diblokir'
    ]
  },
  availabilityCalendar: {
    title: 'Kalender Ketersediaan',
    content: 'Di tab "Kelola Ketersediaan", klik tanggal mana pun untuk memblokir atau membuka blokir. Tanggal yang diblokir berwarna merah. Pelanggan akan melihat tanggal ini sebagai "tidak tersedia" saat memesan.',
    benefits: [
      'Kontrol total atas jadwal Anda',
      'Blokir tanggal masa depan dengan mudah',
      'Navigasi bulan dengan tombol panah',
      'Visual jelas: merah = diblokir',
      'Sinkronisasi langsung dengan database',
      'Perlindungan otomatis dari booking'
    ]
  }
};

/**
 * TherapistCalendar Page Help Content
 */
export const calendarHelp: PageHelpContent = {
  scheduleView: {
    title: 'Jadwal Kalender',
    content: 'Lihat semua booking terkonfirmasi dalam format kalender. Klik tanggal untuk melihat jadwal harian. Auto-sync dengan perubahan status booking.',
    benefits: [
      'Ringkasan jadwal visual',
      'Temukan konflik penjadwalan',
      'Rencanakan minggu Anda dengan efisien',
      'Tidak pernah melewatkan booking'
    ]
  },
  monthNavigation: {
    title: 'Navigasi Bulan',
    content: 'Beralih antar bulan untuk melihat booking masa lalu atau merencanakan ke depan. Jumlah booking ditampilkan pada setiap tanggal.',
    benefits: [
      'Tinjau performa masa lalu',
      'Rencanakan ketersediaan masa depan',
      'Lacak pendapatan bulanan',
      'Identifikasi periode sibuk'
    ]
  },
  bookingDetails: {
    title: 'Detail Booking',
    content: 'Ketuk booking mana pun untuk melihat detail lengkap: info pelanggan, lokasi, jenis layanan, durasi, dan status pembayaran.',
    benefits: [
      'Akses informasi cepat',
      'Verifikasi persyaratan booking',
      'Hubungi pelanggan jika diperlukan',
      'Persiapkan bahan layanan'
    ]
  }
};

/**
 * TherapistPaymentStatus Page Help Content
 */
export const paymentStatusHelp: PageHelpContent = {
  submitProof: {
    title: 'Kirim Bukti Pembayaran',
    content: 'Upload bukti transfer bank atau konfirmasi pembayaran untuk biaya membership, pembayaran komisi, atau sertifikasi Safe Pass.',
    benefits: [
      'Aktifkan fitur premium',
      'Dapatkan persetujuan admin lebih cepat',
      'Lacak status pembayaran',
      'Rekam pembayaran aman'
    ]
  },
  paymentHistory: {
    title: 'Riwayat Pembayaran',
    content: 'Lihat semua pengajuan pembayaran Anda: tertunda, disetujui, atau ditolak. Periksa status dan catatan admin.',
    benefits: [
      'Lacak progres pembayaran',
      'Selesaikan masalah pembayaran',
      'Referensi transaksi masa lalu',
      'Rencanakan pembayaran mendatang'
    ]
  },
  expiryDate: {
    title: 'Kadaluarsa Pembayaran',
    content: 'Pembayaran tertunda kadaluarsa setelah 7 hari jika tidak disetujui. Kirim ulang sebelum kadaluarsa untuk menghindari keterlambatan.',
    benefits: [
      'Hindari kerumitan pengiriman ulang',
      'Jaga membership tetap aktif',
      'Cegah gangguan layanan',
      'Tetap terorganisir'
    ]
  }
};

/**
 * SendDiscountPage Help Content
 */
export const sendDiscountHelp: PageHelpContent = {
  selectCustomers: {
    title: 'Pilih Pelanggan Masa Lalu',
    content: 'Pilih pelanggan dari riwayat booking yang telah mengirim pesan atau meninggalkan review. Banner diskon dikirim langsung di jendela chat mereka.',
    benefits: [
      'Libatkan kembali pelanggan dengan riwayat chat',
      'Beri reward pelanggan yang meninggalkan review',
      'Tingkatkan tingkat booking berulang',
      'Bangun basis pelanggan loyal'
    ]
  },
  discountBanner: {
    title: 'Banner Diskon',
    content: 'Pilih banner yang sudah dirancang dengan penawaran diskon Anda. Pelanggan menerimanya di jendela chat dan dapat booking langsung.',
    benefits: [
      'Materi marketing profesional',
      'Dikirim via chat in-app',
      'Pengiriman instan',
      'Lacak efektivitas banner'
    ]
  },
  sendBanner: {
    title: 'Kirim Banner',
    content: 'Konfirmasi dan kirim banner yang dipilih ke pelanggan terpilih. Mereka menerima banner di jendela chat dengan link booking.',
    benefits: [
      'Kampanye marketing sekali klik',
      'Engagement pelanggan langsung',
      'Hasil terukur',
      'Tingkatkan booking secara instan'
    ]
  }
};

/**
 * HotelVillaSafePass Page Help Content
 */
export const safePassHelp: PageHelpContent = {
  uploadLetter: {
    title: 'Upload Surat Rekomendasi',
    content: 'Upload surat resmi dari hotel/villa tempat Anda bekerja. Memerlukan 3 surat total untuk sertifikasi Safe Pass.',
    benefits: [
      'Buktikan pengalaman hotel',
      'Kualifikasi untuk venue premium',
      'Tingkatkan tingkat booking',
      'Biaya layanan lebih tinggi'
    ]
  },
  adminApproval: {
    title: 'Proses Persetujuan Admin',
    content: 'Admin meninjau surat Anda dan memverifikasi keaslian. Persetujuan biasanya memakan waktu 2-3 hari kerja.',
    benefits: [
      'Jaminan kualitas',
      'Kredibilitas industri',
      'Sertifikasi profesional',
      'Kepercayaan dari klien premium'
    ]
  },
  paymentFee: {
    title: 'Biaya Safe Pass',
    content: 'Biaya satu kali IDR 500.000 untuk sertifikasi seumur hidup. Bayar setelah persetujuan admin atas surat Anda.',
    benefits: [
      'Sertifikasi seumur hidup',
      'Akses ke booking hotel/villa',
      'Tier harga premium',
      'Pengakuan profesional'
    ]
  },
  certificationBenefits: {
    title: 'Manfaat Sertifikasi',
    content: 'Safe Pass aktif membuka booking hotel/villa, peringkat pencarian prioritas, dan akses pelanggan premium.',
    benefits: [
      'Otorisasi hotel/villa',
      'Tingkat booking lebih tinggi',
      'Segmen pelanggan premium',
      'Keunggulan kompetitif'
    ]
  }
};

/**
 * CommissionPayment Page Help Content
 */
export const commissionPaymentHelp: PageHelpContent = {
  commissionRate: {
    title: 'Tarif Komisi',
    content: 'Platform mengambil komisi 30% per booking. Ini adalah tarif tetap yang diterapkan untuk semua booking di Indonesia.',
    benefits: [
      'Harga transparan',
      'Tidak ada biaya tersembunyi',
      'Tarif lebih rendah untuk premium',
      'Bayar per booking saja'
    ]
  },
  paymentSchedule: {
    title: 'Jadwal Pembayaran',
    content: 'Komisi dipotong otomatis dari setiap pembayaran booking. Anda menerima jumlah bersih setelah komisi.',
    benefits: [
      'Pemrosesan otomatis',
      'Tidak ada perhitungan manual',
      'Pembayaran instan',
      'Rincian pendapatan jelas'
    ]
  },
  submitPayment: {
    title: 'Kirim Pembayaran Komisi',
    content: 'Untuk paket pembayaran manual: Kirim bukti transfer bank untuk biaya komisi bulanan.',
    benefits: [
      'Opsi pembayaran fleksibel',
      'Lacak riwayat pembayaran',
      'Verifikasi admin',
      'Jaga akses layanan'
    ]
  }
};

/**
 * TherapistNotifications Page Help Content
 */
export const notificationsHelp: PageHelpContent = {
  bookingNotifications: {
    title: 'Notifikasi Booking',
    content: 'Terima alert instan untuk booking baru, pesan pelanggan, dan perubahan status booking.',
    benefits: [
      'Tidak pernah melewatkan booking',
      'Respons cepat ke pelanggan',
      'Tetap terinformasi 24/7',
      'Tingkatkan waktu respons'
    ]
  },
  messageNotifications: {
    title: 'Notifikasi Pesan',
    content: 'Dapatkan notifikasi ketika pelanggan mengirim pesan chat tentang booking atau layanan.',
    benefits: [
      'Dukungan pelanggan cepat',
      'Selesaikan masalah lebih cepat',
      'Bangun kepercayaan pelanggan',
      'Tingkatkan kepuasan'
    ]
  },
  systemNotifications: {
    title: 'Notifikasi Sistem',
    content: 'Update penting tentang membership, pembayaran, perubahan kebijakan, dan fitur platform.',
    benefits: [
      'Tetap patuh',
      'Ketahui fitur baru',
      'Hindari deadline terlewat',
      'Update platform'
    ]
  },
  markAsRead: {
    title: 'Tandai Sebagai Dibaca',
    content: 'Hapus notifikasi setelah ditinjau untuk menjaga inbox terorganisir.',
    benefits: [
      'Pusat notifikasi terorganisir',
      'Fokus pada item belum dibaca',
      'Lacak apa yang perlu tindakan',
      'Interface bersih'
    ]
  }
};

/**
 * TherapistSchedule Page Help Content
 */
export const scheduleHelp: PageHelpContent = {
  setAvailability: {
    title: 'Atur Ketersediaan Mingguan',
    content: 'Tentukan jam kerja Anda untuk setiap hari dalam seminggu. Pelanggan hanya dapat booking selama waktu ini.',
    benefits: [
      'Kontrol jadwal Anda',
      'Keseimbangan kerja-hidup',
      'Cegah booking di luar jam kerja',
      'Batasan profesional'
    ]
  },
  blockTimeSlots: {
    title: 'Blokir Slot Waktu',
    content: 'Blokir sementara tanggal/waktu tertentu untuk komitmen pribadi atau istirahat.',
    benefits: [
      'Manajemen jadwal fleksibel',
      'Waktu off darurat',
      'Cegah double booking',
      'Jaga kualitas layanan'
    ]
  },
  bufferTime: {
    title: 'Waktu Buffer',
    content: 'Tambahkan waktu perjalanan antar booking untuk memastikan Anda tiba dengan siap dan tepat waktu.',
    benefits: [
      'Penjadwalan realistis',
      'Hindari terlambat',
      'Kurangi stres',
      'Pengalaman pelanggan lebih baik'
    ]
  }
};

// Payment Information Help Content
export const paymentInfoHelp = {
  directPayment: {
    title: 'Sistem Pembayaran P2P Langsung',
    content: 'Platform kami memfasilitasi koneksi antara terapis dan klien, tetapi tidak memproses pembayaran. Semua pembayaran dilakukan langsung dari pelanggan kepada Anda setelah layanan selesai.',
    benefits: [
      'Info kontak dibagikan setelah layanan selesai',
      '100% pembayaran langsung kepada Anda',
      'Tidak ada biaya platform dari pendapatan',
      'Privasi dan keamanan terjamin'
    ]
  },
  bankDetails: {
    title: 'Detail Rekening Bank',
    content: 'Masukkan informasi rekening bank yang akurat untuk menerima pembayaran langsung dari pelanggan. Semua field harus diisi dengan benar.',
    benefits: [
      'Pembayaran langsung ke rekening Anda',
      'Tampilan profesional pada kartu pembayaran',
      'Membangun kepercayaan pelanggan',
      'Diperlukan untuk menerima booking'
    ]
  },
  ktpVerification: {
    title: 'Verifikasi KTP Diperlukan',
    content: 'Upload foto KTP yang jelas untuk verifikasi identitas. Nama di KTP harus sesuai dengan nama akun bank untuk memastikan keamanan transaksi.',
    benefits: [
      'Sesuai dengan identitas rekening bank',
      'Membangun kepercayaan pelanggan',
      'Melindungi dari penipuan',
      'Diperlukan untuk verifikasi manual admin'
    ]
  },
  livePreview: {
    title: 'Preview Kartu Pembayaran',
    content: 'Lihat bagaimana kartu pembayaran Anda akan ditampilkan kepada pelanggan. Kartu ini otomatis dibagikan saat booking diterima atau dapat dibagikan manual di chat.',
    benefits: [
      'Otomatis dibagikan saat booking diterima',
      'Dapat dibagikan manual di chat',
      'Tampilan profesional dan terpercaya',
      'Real-time preview saat mengetik'
    ]
  },
  nameMatching: {
    title: 'Pencocokan Nama',
    content: 'Nama akun bank harus sesuai dengan nama di KTP untuk verifikasi. Ketidaksesuaian nama dapat menunda proses verifikasi dan pembayaran.',
    benefits: [
      'Verifikasi identitas yang akurat',
      'Mempercepat proses verifikasi admin',
      'Menghindari masalah pembayaran',
      'Meningkatkan kepercayaan sistem'
    ]
  },
  commissionSystem: {
    title: 'Sistem Komisi 30%',
    content: 'Platform menggunakan sistem komisi 30% per booking yang berhasil diselesaikan. Komisi ini membantu pemeliharaan platform dan layanan pelanggan.',
    benefits: [
      '70% pendapatan langsung ke Anda',
      'Platform maintenance dan support',
      'Marketing dan promosi gratis',
      'Sistem booking dan chat terintegrasi'
    ]
  },
  dataSource: {
    title: 'Sumber Data Real-time',
    content: 'Semua informasi pembayaran tersimpan di database Appwrite dengan enkripsi. Data Anda aman dan hanya dapat diakses oleh Anda dan admin untuk verifikasi.',
    benefits: [
      'Data tersimpan aman dengan enkripsi',
      'Akses terbatas untuk keamanan',
      'Backup otomatis',
      'Pemulihan data tersedia'
    ]
  }
};

// Legal Help (for terms and conditions page)
export const legalHelp: PageHelpContent = {
  terms: {
    title: 'Syarat dan Ketentuan',
    content: 'Tinjau syarat dan ketentuan platform IndaStreet untuk memahami hak dan kewajiban Anda sebagai terapis.',
    benefits: [
      'Pahami aturan platform',
      'Ketahui hak dan kewajiban Anda',
      'Hindari pelanggaran',
      'Operasional yang aman dan legal'
    ]
  },
  privacy: {
    title: 'Kebijakan Privasi',
    content: 'Pelajari bagaimana data pribadi Anda dilindungi dan digunakan oleh platform.',
    benefits: [
      'Data Anda terlindungi',
      'Transparansi penggunaan data',
      'Keamanan informasi pribadi',
      'Kontrol atas privasi Anda'
    ]
  },
  commission: {
    title: 'Kebijakan Komisi',
    content: 'Komisi platform 30% dari setiap booking membantu pemeliharaan sistem dan dukungan pelanggan.',
    benefits: [
      '70% pendapatan untuk Anda',
      'Platform maintenance',
      'Customer support 24/7',
      'Marketing gratis'
    ]
  }
};

// Profile Edit Help (for profile editing page)
export const profileEditHelp: PageHelpContent = {
  overview: {
    title: 'Edit Profil Terapis',
    content: 'Kelola profil Anda, ubah status ketersediaan, dan perbarui informasi layanan Anda. Profil lengkap meningkatkan kepercayaan pelanggan dan booking rate.',
    benefits: [
      'Profil lengkap = lebih banyak booking',
      'Status real-time untuk pelanggan',
      'Kontrol penuh atas informasi Anda',
      'Perbarui kapan saja tanpa persetujuan'
    ]
  },
  statusControl: {
    title: 'Kontrol Status',
    content: 'Ubah status Anda antara Tersedia, Sibuk, atau Offline untuk mengontrol visibilitas dan booking Anda.',
    benefits: [
      'Kontrol waktu kerja Anda',
      'Cegah double booking',
      'Kelola work-life balance',
      'Pelanggan tahu ketersediaan Anda'
    ]
  },
  profilePhoto: {
    title: 'Foto Profil',
    content: 'Upload foto profil profesional untuk meningkatkan kepercayaan pelanggan. Foto yang jelas meningkatkan booking rate hingga 3x lipat.',
    benefits: [
      'Meningkatkan kepercayaan pelanggan',
      'Profil lebih menarik',
      'Booking rate lebih tinggi',
      'Tampilan profesional'
    ]
  }
};

// Export all help content
export const therapistDashboardHelp = {
  onlineStatus: onlineStatusHelp,
  myBookings: myBookingsHelp,
  bookingsSchedule: bookingsScheduleHelp,
  calendar: calendarHelp,
  paymentStatus: paymentStatusHelp,
  sendDiscount: sendDiscountHelp,
  safePass: safePassHelp,
  commissionPayment: commissionPaymentHelp,
  notifications: notificationsHelp,
  schedule: scheduleHelp,
  earnings: earningsHelp,
  paymentInfo: paymentInfoHelp
};
