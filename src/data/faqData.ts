/**
 * FAQ Database for Smart Support Hub
 * Used by Contact Us page for searchable FAQ, category filtering, and suggestion matching
 */

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  viewCount: number;
  helpfulCount: number;
}

// Accordion display categories – optional small image or icon before label
export interface FAQCategoryItem {
  id: string;
  label: string;
  /** Optional: URL to a small image (e.g. 24–32px) shown before the label */
  imageUrl?: string;
  /** Optional: Lucide icon name (e.g. 'CreditCard') when imageUrl not set */
  icon?: string;
}

export const FAQ_CATEGORIES: FAQCategoryItem[] = [
  { id: 'booking-payments', label: 'Booking & Payments', icon: 'CreditCard' },
  { id: 'therapist-applications', label: 'Therapist Applications', icon: 'UserCheck' },
  { id: 'technical-issues', label: 'Technical Issues', icon: 'Wrench' },
  { id: 'account-management', label: 'Account Management', icon: 'UserCog' },
  { id: 'policies-legal', label: 'Policies & Legal', icon: 'Scale' },
];

export const FAQ_DATABASE: FAQItem[] = [
  // Booking & Payments
  { id: 'b1', category: 'booking-payments', question: 'Why did my booking fail?', answer: 'Booking failures usually happen due to: 1) Payment method issues 2) Therapist unavailability 3) Location restrictions. Try selecting a different time slot or payment method.', keywords: ['booking', 'fail', 'failed', 'error', 'payment', 'unavailable'], priority: 10, viewCount: 0, helpfulCount: 0 },
  { id: 'b2', category: 'booking-payments', question: 'How do I change or reschedule my booking?', answer: 'You can modify your booking up to 2 hours before the scheduled time through your booking history in the app. Go to My Bookings and select the booking you want to change.', keywords: ['change', 'reschedule', 'modify', 'booking', 'cancel'], priority: 9, viewCount: 0, helpfulCount: 0 },
  { id: 'b3', category: 'booking-payments', question: 'What if the therapist doesn\'t show up?', answer: "If your therapist doesn't arrive within 15 minutes of scheduled time, you'll receive a full refund automatically. You can also report no-shows through the app for faster resolution.", keywords: ['no-show', 'therapist', 'didn\'t show', 'refund', 'missing'], priority: 10, viewCount: 0, helpfulCount: 0 },
  { id: 'b4', category: 'booking-payments', question: 'Payment was charged but booking failed', answer: "Don't worry! If payment was processed but booking failed, you'll receive an automatic refund within 24-48 hours. Check your payment method for pending refunds.", keywords: ['payment', 'charged', 'refund', 'failed', 'booking'], priority: 10, viewCount: 0, helpfulCount: 0 },
  { id: 'b5', category: 'booking-payments', question: 'I didn\'t receive my refund. How long does it take?', answer: 'Refunds are processed within 3-5 business days after cancellation confirmation. Funds will appear in your original payment method. If it takes longer, contact us with your booking ID.', keywords: ['refund', 'not received', 'money back', 'cancellation', 'days'], priority: 9, viewCount: 0, helpfulCount: 0 },
  { id: 'b6', category: 'booking-payments', question: 'Which payment methods do you accept?', answer: 'We accept credit/debit cards, digital wallets, bank transfers, and local payment methods depending on your location. Select your preferred method at checkout.', keywords: ['payment', 'methods', 'card', 'bank', 'transfer'], priority: 5, viewCount: 0, helpfulCount: 0 },
  // Therapist Applications
  { id: 't1', category: 'therapist-applications', question: 'How long does profile approval take?', answer: 'Profile approval typically takes 24-48 hours after all required documents are submitted. Make sure you\'ve uploaded clear photos of your certifications and ID.', keywords: ['approval', 'profile', 'verification', 'days', 'hours'], priority: 9, viewCount: 0, helpfulCount: 0 },
  { id: 't2', category: 'therapist-applications', question: 'What documents do I need to apply as a therapist?', answer: 'You need: 1) Valid massage therapy certification 2) Government-issued ID 3) Bank account details 4) Recent photo. All documents must be clear and unexpired.', keywords: ['documents', 'apply', 'therapist', 'certification', 'ID', 'CV'], priority: 9, viewCount: 0, helpfulCount: 0 },
  { id: 't3', category: 'therapist-applications', question: 'When do I get paid as a therapist?', answer: 'Payouts are processed weekly on Fridays for the previous week\'s completed sessions. Funds typically arrive within 2-3 business days to your registered bank account.', keywords: ['payout', 'payment', 'when', 'commission', 'salary'], priority: 8, viewCount: 0, helpfulCount: 0 },
  { id: 't4', category: 'therapist-applications', question: 'My CV upload failed. What file types are accepted?', answer: 'We accept JPG, JPEG, PNG, and GIF for CV/resume uploads. Maximum file size is 5MB. Ensure your file is not corrupted and try again.', keywords: ['CV', 'upload', 'file', 'failed', 'resume'], priority: 7, viewCount: 0, helpfulCount: 0 },
  { id: 't5', category: 'therapist-applications', question: 'How do I check my verification status?', answer: 'Log in to your therapist dashboard and go to Profile or Verification section. You\'ll see pending, approved, or rejected status with any notes from our team.', keywords: ['verification', 'status', 'approval', 'pending'], priority: 8, viewCount: 0, helpfulCount: 0 },
  // Technical Issues
  { id: 'tech1', category: 'technical-issues', question: 'I can\'t log in to my account', answer: 'Try resetting your password using the Forgot Password link. Ensure you\'re using the correct email. If the issue persists, contact us with your email and we\'ll assist.', keywords: ['login', 'account', 'password', 'access', 'can\'t log'], priority: 9, viewCount: 0, helpfulCount: 0 },
  { id: 'tech2', category: 'technical-issues', question: 'The app is not loading or crashing', answer: 'Try: 1) Refresh the page 2) Clear browser cache 3) Update to the latest app version 4) Use a different browser. If it continues, report the bug with your device and browser details.', keywords: ['app', 'crash', 'loading', 'bug', 'not working'], priority: 8, viewCount: 0, helpfulCount: 0 },
  { id: 'tech3', category: 'technical-issues', question: 'I didn\'t receive the booking confirmation email', answer: 'Check your spam/junk folder. Add indastreet.id@gmail.com to your contacts. Ensure the email address in your account is correct. You can also view bookings in the app.', keywords: ['email', 'confirmation', 'didn\'t receive', 'booking'], priority: 7, viewCount: 0, helpfulCount: 0 },
  // Account Management
  { id: 'a1', category: 'account-management', question: 'How do I update my profile or contact information?', answer: 'Log in and go to Settings or Profile. You can update your name, email, phone, and profile photo. Some changes may require verification.', keywords: ['profile', 'update', 'contact', 'change', 'edit'], priority: 6, viewCount: 0, helpfulCount: 0 },
  { id: 'a2', category: 'account-management', question: 'How do I delete my account?', answer: 'Go to Settings > Account > Delete Account. This action is irreversible. Any active bookings must be completed or cancelled first.', keywords: ['delete', 'account', 'remove', 'close'], priority: 5, viewCount: 0, helpfulCount: 0 },
  // Policies & Legal
  { id: 'p1', category: 'policies-legal', question: 'How do I report a policy violation?', answer: 'Use the Report button on the relevant profile or booking. For urgent safety concerns, contact our 24/7 support. We investigate all reports promptly.', keywords: ['report', 'violation', 'policy', 'safety', 'abuse'], priority: 10, viewCount: 0, helpfulCount: 0 },
  { id: 'p2', category: 'policies-legal', question: 'What are your cancellation and refund policies?', answer: 'Free cancellation up to 2 hours before booking. Refunds are processed within 3-5 business days. No-shows by therapists receive full refunds automatically.', keywords: ['cancellation', 'refund', 'policy', 'terms'], priority: 8, viewCount: 0, helpfulCount: 0 },
  { id: 'p3', category: 'policies-legal', question: 'I have a partnership or business inquiry', answer: 'Use the Partnership Inquiry option in our contact form. Our business team will respond within 1-2 business days to discuss opportunities.', keywords: ['partnership', 'business', 'inquiry', 'corporate'], priority: 7, viewCount: 0, helpfulCount: 0 },
];
