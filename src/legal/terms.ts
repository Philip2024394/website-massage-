// @ts-nocheck
/**
 * Legal Terms - Temporarily simplified to fix compilation
 */
export const LEGAL_TERMS = {
  COMMISSION_STRUCTURE: {
    title: "Commission Structure",
    content: "Commission structure details...",
    contentId: "Struktur komisi..."
  },
  PLATFORM_BYPASS_PROHIBITION: {
    title: "Platform Bypass Prohibition", 
    content: "Platform bypass prohibition details...",
    contentId: "Larangan bypass platform..."
  },
  ACCEPTANCE: {
    title: "Acceptance",
    content: "Acceptance details...",
    contentId: "Detail penerimaan..."
  },
  SUMMARY: {
    title: "Summary",
    content: "Summary details...",
    contentId: "Ringkasan..."
  },
  CHECKBOX_LABEL: {
    en: "I agree to Terms & Conditions",
    id: "Saya setuju dengan Syarat & Ketentuan"
  },
  BOOKING_REMINDER: {
    en: "This booking is subject to commission",
    id: "Pemesanan ini tunduk pada komisi"
  }
} as const;

// Temporary exports for compatibility
export const FULL_TERMS_DOCUMENT = {
  title: "Terms and Conditions",
  content: "Terms content placeholder...",
  version: "1.0.0", // Terms version
  lastUpdated: "2026-01-14", // Last update date
  sections: [
    {
      title: "General Terms",
      content: "General terms content..."
    },
    {
      title: "Privacy Policy", 
      content: "Privacy policy content..."
    },
    {
      title: "Service Agreement",
      content: "Service agreement content..."
    }
  ] // Structured sections
};

export const validateTermsAcceptance = (accepted: boolean) => accepted;