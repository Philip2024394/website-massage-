/**
 * Help Content for Therapist Dashboard
 * Comprehensive help tooltips for all dashboard features
 */

export interface HelpTooltipContent {
  title: string;
  description?: string;
  content?: string;
  icon?: string;
  benefits?: string[];
}

export interface PageHelpContent {
  [key: string]: HelpTooltipContent;
}

// Online Status Help
export const onlineStatusHelp: PageHelpContent = {
  availableStatus: {
    title: 'Available Status',
    content: 'Set yourself as available to receive booking requests from customers',
    benefits: ['Visible to customers searching for therapists', 'Receive instant booking notifications', 'Maximize your earning potential']
  },
  busyStatus: {
    title: 'Busy Status',
    content: 'Mark yourself as busy when attending to a customer',
    benefits: ['Prevent double bookings', 'Professional time management', 'Customers know you are currently engaged']
  },
  offlineStatus: {
    title: 'Offline Status',
    content: 'Set yourself offline when unavailable for bookings',
    benefits: ['Profile hidden from search results', 'No booking notifications', 'Maintain work-life balance']
  },
  onlineHours: {
    title: 'Online Hours This Month',
    content: 'Track how many hours you have been available this month. Resets on the 1st of each month',
    benefits: ['Monitor your availability', 'Understand booking patterns', 'Optimize your schedule']
  }
};

// Earnings Help
export const earningsHelp: PageHelpContent = {
  completedEarnings: {
    title: 'Completed Earnings',
    content: 'Total earnings from confirmed and completed bookings',
    benefits: ['Track successful transactions', 'Monitor monthly income', 'Financial planning']
  },
  lostEarnings: {
    title: 'Lost Earnings',
    content: 'Potential earnings from cancelled or rejected bookings',
    benefits: ['Identify missed opportunities', 'Improve acceptance rate', 'Optimize availability']
  },
  serviceBreakdown: {
    title: 'Service Breakdown',
    content: 'Earnings breakdown by massage type and service',
    benefits: ['Identify popular services', 'Optimize service menu', 'Strategic pricing']
  },
  bookingTypes: {
    title: 'Booking Types',
    content: 'Distribution of home service vs venue bookings',
    benefits: ['Understand customer preferences', 'Optimize service offerings', 'Location strategy']
  },
  monthlyEarnings: {
    title: 'Monthly Earnings Trend',
    content: 'Historical earnings data showing month-over-month performance',
    benefits: ['Track growth trends', 'Seasonal patterns', 'Set realistic goals']
  },
  dataSource: {
    title: 'Data Source',
    content: 'All data sourced from confirmed bookings and payment records',
    benefits: ['Accurate reporting', 'Real-time updates', 'Transparent tracking']
  },
  peakHours: {
    title: 'Peak Booking Hours',
    content: 'Times of day when you receive the most bookings',
    benefits: ['Optimize availability schedule', 'Maximize earning potential', 'Better work planning']
  },
  busiestDays: {
    title: 'Busiest Days',
    content: 'Days of the week with highest booking volume',
    benefits: ['Strategic availability planning', 'Optimize rest days', 'Revenue forecasting']
  }
};

// Payment Info Help
export const paymentInfoHelp: PageHelpContent = {
  directPayment: {
    title: 'Direct Payment System',
    content: 'Customers pay you directly via bank transfer or cash',
    benefits: ['100% of your earnings', 'No platform fees', 'Immediate payment']
  },
  commissionSystem: {
    title: 'Commission Structure',
    content: 'IndaStreet charges 30% commission per booking for platform services',
    benefits: ['Transparent pricing', 'No hidden fees', 'Clear payment terms']
  },
  bankDetails: {
    title: 'Bank Information',
    content: 'Your banking details displayed to customers for payment',
    benefits: ['Secure encrypted storage', 'Easy updates', 'Multiple bank support']
  },
  ktpVerification: {
    title: 'ID Verification',
    content: 'KTP/ID card required for account verification and security',
    benefits: ['Secure identity verification', 'Faster payment processing', 'Account protection']
  },
  livePreview: {
    title: 'Live Preview',
    content: 'See how your payment card appears to customers in real-time',
    benefits: ['Verify information accuracy', 'Professional appearance', 'Customer confidence']
  },
  nameMatching: {
    title: 'Name Matching',
    content: 'Account name must match your KTP for verification compliance',
    benefits: ['Security compliance', 'Fraud prevention', 'Faster approvals']
  }
};

// Payment Status Help
export const paymentStatusHelp: PageHelpContent = {
  commissionPayments: {
    title: 'Commission Payments',
    content: 'Track and manage your commission payments to IndaStreet',
    benefits: ['Payment history tracking', 'Due date reminders', 'Avoid late fees']
  },
  latePaymentWarning: {
    title: 'Late Payment Consequences',
    content: 'Overdue payments may result in account suspension or reduced visibility',
    benefits: ['Maintain good standing', 'Avoid account restrictions', 'Professional reputation']
  }
};

// Calendar Help
export const calendarHelp: PageHelpContent = {
  bookingCalendar: {
    title: 'Booking Calendar',
    content: 'View all your confirmed bookings in calendar format',
    benefits: ['Visual schedule overview', 'Avoid double bookings', 'Better time management']
  },
  availability: {
    title: 'Availability Management',
    content: 'Set your available hours and block out unavailable times',
    benefits: ['Control your schedule', 'Prevent unwanted bookings', 'Work-life balance']
  }
};

// Bookings Help
export const myBookingsHelp: PageHelpContent = {
  pendingBookings: {
    title: 'Pending Bookings',
    content: 'New booking requests waiting for your confirmation. Respond within 5 minutes for best results',
    benefits: ['Quick response = higher rankings', 'Customer satisfaction', 'More future bookings']
  },
  confirmedBookings: {
    title: 'Confirmed Bookings',
    content: 'Bookings you have accepted and confirmed with customers',
    benefits: ['Clear schedule visibility', 'Customer details access', 'Service preparation']
  },
  completedBookings: {
    title: 'Completed Bookings',
    content: 'Finished sessions ready for customer review and rating',
    benefits: ['Earnings confirmation', 'Customer feedback', 'Build reputation']
  },
  cancelledBookings: {
    title: 'Cancelled Bookings',
    content: 'Bookings cancelled by customer or rejected by you',
    benefits: ['Track cancellation patterns', 'Identify lost opportunities', 'Improve acceptance']
  }
};

// Hotel Safe Pass Help
export const safePassHelp: PageHelpContent = {
  eligibility: {
    title: 'Eligibility Requirements',
    content: 'Hotel & Villa Safe Pass certification requires good standing account and clean record',
    benefits: ['Access premium venues', 'Higher paying clients', 'Professional credibility']
  },
  benefits: {
    title: 'Safe Pass Benefits',
    content: 'Certified therapists can accept bookings at hotels and luxury villas',
    benefits: ['Premium customer base', 'Higher average booking value', 'Enhanced trust']
  },
  application: {
    title: 'Application Process',
    content: 'Submit application via WhatsApp with required documents for review',
    benefits: ['Fast approval process', 'Direct communication', 'Personalized support']
  }
};

// Schedule Help
export const bookingsScheduleHelp: PageHelpContent = {
  weeklySchedule: {
    title: 'Weekly Schedule',
    content: 'Set your default availability hours for each day of the week',
    benefits: ['Consistent schedule', 'Customer expectations', 'Automatic availability']
  },
  peakHours: {
    title: 'Peak Hours Optimization',
    content: 'Identify and prioritize high-demand time slots',
    benefits: ['Maximize bookings', 'Higher earnings', 'Better utilization']
  }
};

// Send Discount Help
export const sendDiscountHelp: PageHelpContent = {
  discountBanners: {
    title: 'Discount Banners',
    content: 'Send promotional discount codes to past customers to encourage repeat bookings',
    benefits: ['Customer retention', 'Increase repeat business', 'Boost slow periods']
  },
  customerSelection: {
    title: 'Customer Selection',
    content: 'Choose from your past customers who have completed bookings',
    benefits: ['Targeted marketing', 'Higher conversion rate', 'Personal touch']
  },
  discountTracking: {
    title: 'Discount Tracking',
    content: 'Monitor which customers received discounts and redemption status',
    benefits: ['Track campaign success', 'Measure ROI', 'Optimize future offers']
  }
};

// Notifications Help
export const notificationsHelp: PageHelpContent = {
  overview: {
    title: 'Notification Center',
    content: 'Monitor your account health, track bookings, customer messages, payment confirmations, and system updates all in one place.',
    benefits: ['Never miss bookings', 'Track account health', 'Fast response to customers', 'Critical alerts']
  },
  accountHealth: {
    title: 'Account Health Score',
    content: 'Overall performance rating based on response time, acceptance rate, and customer ratings',
    benefits: ['Higher visibility in search', 'More booking requests', 'Platform rewards']
  },
  criticalAlerts: {
    title: 'Critical Alerts',
    content: 'Urgent notifications requiring immediate attention',
    benefits: ['Avoid account issues', 'Timely responses', 'Maintain good standing']
  },
  trafficStats: {
    title: 'Traffic Statistics',
    content: 'Profile views and customer engagement metrics',
    benefits: ['Understand visibility', 'Optimize profile', 'Track improvements']
  }
};

// Chat Help
export const chatHelp: PageHelpContent = {
  overview: {
    title: 'Chat & Messaging',
    content: 'Direct communication with customers and admin support. Respond quickly to booking inquiries and build better customer relationships.',
    benefits: ['Fast response', 'Professional communication', 'Better customer service', 'Admin support access']
  },
  responseTime: {
    title: 'Response Time Target',
    content: 'Respond to customer messages within 10 minutes for best results',
    benefits: ['Higher search rankings', 'Better conversion rate', 'Customer satisfaction']
  },
  chatHistory: {
    title: 'Chat History',
    content: 'Access all your conversations with customers',
    benefits: ['Reference past discussions', 'Follow-up opportunities', 'Service continuity']
  }
};

// More Customers Help
export const moreCustomersHelp: PageHelpContent = {
  profileOptimization: {
    title: 'Profile Optimization',
    content: 'Complete profiles get 80% more views than basic profiles',
    benefits: ['Higher visibility', 'More booking requests', 'Professional image']
  },
  photoGuidelines: {
    title: 'Professional Photos',
    content: 'High-quality photos significantly increase booking conversion',
    benefits: ['First impression matters', 'Build trust', 'Stand out from competition']
  },
  menuStrategy: {
    title: 'Menu Strategy',
    content: 'Offer multiple service variations to appeal to different customer preferences',
    benefits: ['Wider appeal', 'Higher booking value', 'Customer choice']
  }
};

// Legal Help
export const legalHelp: PageHelpContent = {
  terms: {
    title: 'Terms of Service',
    content: 'Platform rules and therapist responsibilities',
    benefits: ['Understand platform rules', 'Avoid violations', 'Know your rights']
  },
  privacy: {
    title: 'Privacy Policy',
    content: 'How your personal data is collected, used, and protected',
    benefits: ['Data security', 'Transparency', 'Compliance']
  }
};

// Therapist Dashboard Main Help
export const therapistDashboardHelp: any = {
  stats: {
    totalBookings: {
      title: 'Total Bookings',
      content: 'Total number of bookings received this month',
      benefits: ['Track monthly performance', 'Set growth goals', 'Compare periods']
    },
    totalEarnings: {
      title: 'Total Earnings',
      content: 'Total income earned from completed bookings this month',
      benefits: ['Financial tracking', 'Revenue insights', 'Budget planning']
    },
    averageRating: {
      title: 'Average Rating',
      content: 'Your average customer rating from all completed bookings',
      benefits: ['Quality indicator', 'Customer satisfaction', 'Profile ranking']
    },
    responseRate: {
      title: 'Response Rate',
      content: 'Percentage of booking requests you respond to within 5 minutes',
      benefits: ['Higher search visibility', 'More bookings', 'Better conversion']
    }
  },
  paymentInfo: paymentInfoHelp
};

// Menu Help
export const menuHelp: PageHelpContent = {
  overview: {
    title: 'Custom Menu Pricing',
    content: 'Create your own price menu with custom services and durations. Control which durations appear on your customer-facing card by filling or leaving blank the Min fields.',
    benefits: ['Full pricing control', 'Flexible service offerings', 'Professional presentation to customers']
  },
  services: {
    title: 'Service Menu',
    content: 'Manage your service offerings, prices, and availability',
    benefits: ['Flexible pricing', 'Multiple service options', 'Clear customer expectations']
  }
};

// Premium Help
export const premiumHelp: PageHelpContent = {
  overview: {
    title: 'Premium Membership',
    content: 'Upgrade to Premium to keep 100% of your earnings with zero commission. Includes verified badge, priority search placement, and advanced features.',
    benefits: ['Keep 100% of earnings', 'No commission fees', 'Premium verified badge', 'Priority visibility']
  },
  features: {
    title: 'Premium Features',
    content: 'Unlock advanced features including priority placement, analytics, and booking tools',
    benefits: ['More visibility', 'Better tools', 'Higher earnings potential']
  }
};

// Commission Payment Help
export const commissionHelp: PageHelpContent = {
  overview: {
    title: 'Commission Payment System',
    content: 'Pay your 30% booking commission to maintain active status. Upload payment proof after each booking to keep your account in good standing.',
    benefits: ['Stay compliant', 'Maintain active status', 'Transparent payment tracking']
  },
  payment: {
    title: 'Commission Payments',
    content: 'Manage and track your commission payments to the platform',
    benefits: ['Stay compliant', 'Track payment history', 'Avoid service interruptions']
  }
};

// Schedule Help
export const scheduleHelp: PageHelpContent = {
  overview: {
    title: 'Schedule & Calendar',
    content: 'View your monthly calendar, manage today\'s bookings, and set your weekly availability hours. Add manual bookings or block times as needed.',
    benefits: ['Visual calendar view', 'Prevent overbooking', 'Flexible schedule control']
  },
  availability: {
    title: 'Schedule Management',
    content: 'Set your working hours and manage your availability calendar',
    benefits: ['Better time management', 'Prevent overbooking', 'Work-life balance']
  }
};

// Dashboard Help
export const dashboardHelp: PageHelpContent = {
  overview: {
    title: 'Dashboard Overview',
    content: 'Edit your therapist profile, manage your availability, and update your services',
    benefits: ['Complete profile visibility', 'Attract more customers', 'Professional presentation']
  }
};

// Package Terms Help
export const packageTermsHelp: PageHelpContent = {
  terms: {
    title: 'Package Terms',
    content: 'Review the terms and conditions of your membership package',
    benefits: ['Understand benefits', 'Know limitations', 'Make informed decisions']
  },
  overview: {
    title: 'Membership Terms',
    content: 'Understand the terms and conditions of your membership package before accepting',
    benefits: ['Clear expectations', 'Know your rights', 'Make informed choices']
  }
};

// Membership Onboarding Help
export const membershipOnboardingHelp: PageHelpContent = {
  setup: {
    title: 'Membership Setup',
    content: 'Complete your profile and membership setup to start receiving bookings',
    benefits: ['Quick activation', 'Professional profile', 'Ready to earn']
  }
};
