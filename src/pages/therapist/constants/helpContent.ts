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
}

export interface PageHelpContent {
  [featureKey: string]: HelpContent;
}

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
    title: 'Total Completed Earnings',
    content: 'Your actual earnings from all completed bookings. This shows the amount you receive after the 30% platform commission is deducted.',
    benefits: [
      'See real-time earnings from completed bookings',
      '70% of total booking value goes to you',
      'Tracks Book Now and Scheduled bookings',
      'Connected directly to Appwrite database'
    ]
  },
  lostEarnings: {
    title: 'Lost Earnings Tracker',
    content: 'Revenue missed from expired, declined, or cancelled bookings. This helps you understand opportunities lost due to timeouts or rejections.',
    benefits: [
      'Identify revenue loss patterns',
      'See impact of 5-minute timeout expirations',
      'Track declined booking consequences',
      'Improve response time to maximize earnings'
    ]
  },
  serviceBreakdown: {
    title: 'Service Duration Breakdown',
    content: 'Earnings separated by service duration (60, 90, 120 minutes). Shows which service types generate the most income.',
    benefits: [
      'Identify most profitable service duration',
      'Optimize pricing strategy',
      'Focus marketing on high-earning services',
      'Track customer preferences by duration'
    ]
  },
  bookingTypes: {
    title: 'Book Now vs Scheduled',
    content: 'Compare earnings from immediate "Book Now" bookings versus advance "Scheduled" bookings with deposits.',
    benefits: [
      'Understand booking type profitability',
      'Plan availability strategy',
      'Balance immediate vs scheduled work',
      'Track deposit-based revenue'
    ]
  },
  monthlyEarnings: {
    title: 'Monthly Earnings',
    content: 'Your total earnings for the current month from all completed bookings. Resets on the 1st of each month.',
    benefits: [
      'Track monthly income goals',
      'Compare month-over-month growth',
      'Plan personal budget',
      'Monitor business performance'
    ]
  },
  peakHours: {
    title: 'Peak Booking Hours',
    content: 'Analytics showing your busiest booking times based on the last 30 days of actual booking data from Appwrite.',
    benefits: [
      'Optimize availability during peak times',
      'Charge premium rates during high-demand hours',
      'Plan breaks during low-demand periods',
      'Data-driven scheduling decisions'
    ]
  },
  busiestDays: {
    title: 'Busiest Days Heatmap',
    content: 'Visual representation of which days of the week generate the most bookings. Click any day to see hourly breakdown.',
    benefits: [
      'Identify most profitable days',
      'Schedule rest days strategically',
      'Maximize earnings on peak days',
      'Interactive time slot analysis'
    ]
  },
  dataSource: {
    title: 'Appwrite Connection',
    content: 'All earnings data is calculated in real-time from the Appwrite bookings collection. No local storage - always up-to-date.',
    benefits: [
      'Real-time accuracy',
      'Cloud-based reliability',
      'Cross-device consistency',
      'Automatic data backup'
    ]
  }
};

/**
 * TherapistOnlineStatus Page Help Content
 */
export const onlineStatusHelp: PageHelpContent = {
  availabilityToggle: {
    title: 'Availability Status',
    content: 'Control your booking availability. When "Available", customers can see and book you. When "Busy" or "Offline", you won\'t appear in search results.',
    benefits: [
      'Instantly control customer visibility',
      'Prevent bookings during breaks',
      'Maintain professional boundaries',
      'Auto-track online hours for earnings'
    ]
  },
  discountBadge: {
    title: 'Discount Badge',
    content: 'Display a promotional discount badge on your profile to attract more customers. Set your discount percentage and it appears immediately on the homepage.',
    benefits: [
      'Increase booking rate by up to 40%',
      'Stand out from other therapists',
      'Flexible discount control',
      'No approval needed - instant activation'
    ]
  },
  downloadApp: {
    title: 'Download Mobile App',
    content: 'Install the PWA (Progressive Web App) for faster access, offline support, and push notifications for new bookings.',
    benefits: [
      'Instant booking notifications',
      'Works offline - view schedules anytime',
      'Faster loading than website',
      'Add to home screen - one tap access'
    ]
  },
  autoOfflineTimer: {
    title: 'Auto Offline Timer',
    content: 'Schedule a specific time each day to automatically change your status to Offline. Perfect for maintaining work-life balance without manual updates.',
    benefits: [
      'Never forget to go offline',
      'Set once, runs automatically daily',
      'Maintain consistent work hours',
      'Premium feature - upgrade to unlock'
    ]
  }
};

/**
 * MyBookings Page Help Content
 */
export const myBookingsHelp: PageHelpContent = {
  acceptBooking: {
    title: 'Accept Booking',
    content: 'Confirm you can fulfill this booking. Once accepted, the customer receives confirmation and expects you to arrive on time.',
    benefits: [
      'Build trust with customers',
      'Secure your booking slot',
      'Trigger automatic reminders',
      'Earn online hours toward membership'
    ]
  },
  rejectBooking: {
    title: 'Reject Booking',
    content: 'Decline bookings you cannot fulfill. Be professional - only reject if absolutely necessary. High rejection rates affect your ranking.',
    benefits: [
      'Maintain realistic schedule',
      'Avoid penalties for no-shows',
      'Professional boundary management',
      'Customer gets refund automatically'
    ]
  },
  depositApproval: {
    title: 'Deposit Approval',
    content: 'For Premium therapists: Review and approve customer deposit payments before confirming bookings. This protects against no-shows.',
    benefits: [
      'Reduce no-show risk',
      'Verify payment before committing',
      'Professional payment workflow',
      'Build customer accountability'
    ]
  },
  chatWithCustomer: {
    title: 'Chat with Customer',
    content: 'Message customers directly about booking details, location clarifications, or service preferences. Chat history is saved.',
    benefits: [
      'Clarify booking requirements',
      'Build customer relationships',
      'Resolve issues quickly',
      'Improve service quality'
    ]
  },
  bookingsList: {
    title: 'Bookings & Schedule Management',
    content: 'View and manage all your bookings in one place. Filter by status (All, Received, Scheduled, Completed) to organize your workload. Switch between Bookings and Schedule tabs.',
    benefits: [
      'Complete booking overview',
      'Filter by booking status',
      'Track scheduled vs instant bookings',
      'Monitor earnings and completion rate'
    ]
  }
};

/**
 * TherapistBookings Page Help Content (Main booking management page)
 */
export const bookingsScheduleHelp: PageHelpContent = {
  manageBookings: {
    title: 'Booking & Jadwal Management',
    content: 'View all your bookings: instant bookings, scheduled appointments, and completed sessions. Accept or decline bookings, chat with customers, and manage your schedule all in one place.',
    benefits: [
      'Centralized booking management',
      'Quick accept/decline actions',
      'Real-time booking notifications',
      'Track earnings per booking'
    ]
  },
  filterBookings: {
    title: 'Filter Bookings',
    content: 'Use filters to view specific booking types: All (everything), Received (pending approval), Scheduled (confirmed future bookings), or Completed (finished sessions).',
    benefits: [
      'Focus on what needs action',
      'Track completed sessions',
      'Review pending approvals',
      'Plan upcoming schedule'
    ]
  },
  depositBookings: {
    title: 'Scheduled Bookings with Deposit',
    content: 'Premium therapists can require 30% deposit for scheduled bookings. Review payment proof, approve/reject deposits, and confirm bookings once payment is verified.',
    benefits: [
      'Reduce no-show risk',
      'Guaranteed booking commitment',
      'Professional payment workflow',
      'Protect your time and income'
    ]
  },
  switchScheduleTab: {
    title: 'Schedule Tab',
    content: 'Switch to Schedule tab to set your weekly availability, block time slots, and manage working hours. This controls when customers can book you.',
    benefits: [
      'Control your availability',
      'Set recurring work hours',
      'Block time for breaks',
      'Prevent off-hours bookings'
    ]
  }
};

/**
 * TherapistCalendar Page Help Content
 */
export const calendarHelp: PageHelpContent = {
  scheduleView: {
    title: 'Calendar Schedule',
    content: 'View all confirmed bookings in calendar format. Click dates to see daily schedules. Auto-syncs with booking status changes.',
    benefits: [
      'Visual schedule overview',
      'Spot scheduling conflicts',
      'Plan your week efficiently',
      'Never miss a booking'
    ]
  },
  monthNavigation: {
    title: 'Month Navigation',
    content: 'Switch between months to view past bookings or plan ahead. Booking counts show on each date.',
    benefits: [
      'Review past performance',
      'Plan future availability',
      'Track monthly earnings',
      'Identify busy periods'
    ]
  },
  bookingDetails: {
    title: 'Booking Details',
    content: 'Tap any booking to see full details: customer info, location, service type, duration, and payment status.',
    benefits: [
      'Quick information access',
      'Verify booking requirements',
      'Contact customer if needed',
      'Prepare service materials'
    ]
  }
};

/**
 * TherapistPaymentStatus Page Help Content
 */
export const paymentStatusHelp: PageHelpContent = {
  submitProof: {
    title: 'Submit Payment Proof',
    content: 'Upload bank transfer receipt or payment confirmation for membership fees, commission payments, or Safe Pass certification.',
    benefits: [
      'Activate premium features',
      'Get admin approval faster',
      'Track payment status',
      'Secure payment record'
    ]
  },
  paymentHistory: {
    title: 'Payment History',
    content: 'View all your payment submissions: pending, approved, or declined. Check status and admin notes.',
    benefits: [
      'Track payment progress',
      'Resolve payment issues',
      'Reference past transactions',
      'Plan upcoming payments'
    ]
  },
  expiryDate: {
    title: 'Payment Expiry',
    content: 'Pending payments expire after 7 days if not approved. Resubmit before expiry to avoid delays.',
    benefits: [
      'Avoid re-submission hassle',
      'Keep membership active',
      'Prevent service interruption',
      'Stay organized'
    ]
  }
};

/**
 * SendDiscountPage Help Content
 */
export const sendDiscountHelp: PageHelpContent = {
  selectCustomers: {
    title: 'Select Past Customers',
    content: 'Choose customers from your booking history who have messaged you or left reviews. Discount banners are sent directly in their chat window.',
    benefits: [
      'Re-engage customers with chat history',
      'Reward customers who left reviews',
      'Increase repeat booking rate',
      'Build loyal customer base'
    ]
  },
  discountBanner: {
    title: 'Discount Banner',
    content: 'Select pre-designed banner with your discount offer. Customers receive it in their chat window and can book directly.',
    benefits: [
      'Professional marketing materials',
      'Sent via in-app chat',
      'Instant delivery',
      'Track banner effectiveness'
    ]
  },
  sendBanner: {
    title: 'Send Banner',
    content: 'Confirm and send selected banner to chosen customers. They receive the banner in their chat window with booking link.',
    benefits: [
      'One-click marketing campaign',
      'Direct customer engagement',
      'Measurable results',
      'Boost bookings instantly'
    ]
  }
};

/**
 * HotelVillaSafePass Page Help Content
 */
export const safePassHelp: PageHelpContent = {
  uploadLetter: {
    title: 'Upload Recommendation Letter',
    content: 'Upload official letters from hotels/villas where you\'ve worked. Need 3 letters total for Safe Pass certification.',
    benefits: [
      'Prove hotel experience',
      'Qualify for premium venues',
      'Increase booking rate',
      'Higher service fees'
    ]
  },
  adminApproval: {
    title: 'Admin Approval Process',
    content: 'Admin reviews your letters and verifies authenticity. Approval typically takes 2-3 business days.',
    benefits: [
      'Quality assurance',
      'Industry credibility',
      'Professional certification',
      'Trust from premium clients'
    ]
  },
  paymentFee: {
    title: 'Safe Pass Fee',
    content: 'One-time fee of IDR 500,000 for lifetime certification. Pay after admin approval of your letters.',
    benefits: [
      'Lifetime certification',
      'Access to hotel/villa bookings',
      'Premium pricing tier',
      'Professional recognition'
    ]
  },
  certificationBenefits: {
    title: 'Certification Benefits',
    content: 'Active Safe Pass unlocks hotel/villa bookings, priority search ranking, and premium customer access.',
    benefits: [
      'Hotel/villa authorization',
      'Higher booking rates',
      'Premium customer segment',
      'Competitive advantage'
    ]
  }
};

/**
 * CommissionPayment Page Help Content
 */
export const commissionPaymentHelp: PageHelpContent = {
  commissionRate: {
    title: 'Commission Rate',
    content: 'Platform takes 30% commission per booking. This is a fixed rate applied to all bookings in Indonesia.',
    benefits: [
      'Transparent pricing',
      'No hidden fees',
      'Lower rates for premium',
      'Pay per booking only'
    ]
  },
  paymentSchedule: {
    title: 'Payment Schedule',
    content: 'Commission is deducted automatically from each booking payment. You receive net amount after commission.',
    benefits: [
      'Automatic processing',
      'No manual calculations',
      'Instant payment',
      'Clear earnings breakdown'
    ]
  },
  submitPayment: {
    title: 'Submit Commission Payment',
    content: 'For manual payment plans: Submit bank transfer proof for monthly commission fees.',
    benefits: [
      'Flexible payment options',
      'Track payment history',
      'Admin verification',
      'Maintain service access'
    ]
  }
};

/**
 * TherapistNotifications Page Help Content
 */
export const notificationsHelp: PageHelpContent = {
  bookingNotifications: {
    title: 'Booking Notifications',
    content: 'Receive instant alerts for new bookings, customer messages, and booking status changes.',
    benefits: [
      'Never miss a booking',
      'Respond quickly to customers',
      'Stay informed 24/7',
      'Improve response time'
    ]
  },
  messageNotifications: {
    title: 'Message Notifications',
    content: 'Get notified when customers send chat messages about bookings or services.',
    benefits: [
      'Quick customer support',
      'Resolve issues faster',
      'Build customer trust',
      'Increase satisfaction'
    ]
  },
  systemNotifications: {
    title: 'System Notifications',
    content: 'Important updates about membership, payments, policy changes, and platform features.',
    benefits: [
      'Stay compliant',
      'Know new features',
      'Avoid missed deadlines',
      'Platform updates'
    ]
  },
  markAsRead: {
    title: 'Mark as Read',
    content: 'Clear notifications once reviewed to keep inbox organized.',
    benefits: [
      'Organized notification center',
      'Focus on unread items',
      'Track what needs action',
      'Clean interface'
    ]
  }
};

/**
 * TherapistSchedule Page Help Content
 */
export const scheduleHelp: PageHelpContent = {
  setAvailability: {
    title: 'Set Weekly Availability',
    content: 'Define your working hours for each day of the week. Customers can only book during these times.',
    benefits: [
      'Control your schedule',
      'Work-life balance',
      'Prevent off-hours bookings',
      'Professional boundaries'
    ]
  },
  blockTimeSlots: {
    title: 'Block Time Slots',
    content: 'Temporarily block specific dates/times for personal commitments or breaks.',
    benefits: [
      'Flexible schedule management',
      'Emergency time off',
      'Prevent double bookings',
      'Maintain service quality'
    ]
  },
  bufferTime: {
    title: 'Buffer Time',
    content: 'Add travel time between bookings to ensure you arrive prepared and on time.',
    benefits: [
      'Realistic scheduling',
      'Avoid being late',
      'Reduce stress',
      'Better customer experience'
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

// Dashboard Help (for profile editing page)
export const dashboardHelp: PageHelpContent = {
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
