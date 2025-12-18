export interface AgentTermSection {
    title: string;
    content: string;
}

export interface AgentTermsContent {
    title: string;
    agreement: string;
    acceptButton: string;
    declineButton: string;
    sections: AgentTermSection[];
}

export function getAgentTerms(t?: any): AgentTermsContent {
    const fallback: AgentTermsContent = {
        title: 'IndaStreet Agent Terms & Conditions',
        agreement: 'Please read and accept the following terms to activate your agent account.',
        acceptButton: 'Accept Terms',
        declineButton: 'Logout',
        sections: [
            { title: 'Acceptance & Activation', content: 'You become an active IndaStreet Agent only after your account is verified and activated by IndaStreet.' },
            { title: 'Meeting Records (Mandatory)', content: 'You must record every recruitment or partner meeting in your dashboard, including date, entity name, location, and outcome.' },
            { title: 'Ongoing Communication', content: 'You must maintain regular communication with the IndaStreet team regarding progress, feedback, and learning materials.' },
            { title: 'Uniform & ID Policy', content: 'While representing IndaStreet, you must wear the official uniform and visibly display your agent ID. Non‑compliance may result in immediate restriction or suspension without notice.' },
            { title: 'Professional Standards', content: 'You must maintain a clean, professional appearance and conduct at all times.' },
            { title: 'Account Ownership', content: 'Agent accounts are personal. Sharing access or authorizing any other person to operate your account is prohibited unless expressly approved in writing by IndaStreet Admin.' },
            { title: 'Provider Activation Requirements', content: 'Activating massage place or therapist accounts requires payment, verified WhatsApp contact, and confirmed operating location details.' },
            { title: 'Required Use of Tools', content: 'Dashboard tools (visit logs, follow‑ups, metrics) are provided to support your success and must be used as part of standard workflow.' },
            { title: 'Data Ownership', content: 'All information added to the platform (providers, leads, activity) is the exclusive property of IndaStreet. Exporting or sharing outside approved uses is prohibited.' },
            { title: 'Commission & Payouts', content: 'Commission is calculated monthly and paid within five (5) days after month‑end to the bank account in your dashboard, under the same legal name as your agent profile.' },
            { title: 'Profile Updates', content: 'Account or banking updates may be subject to IndaStreet review and confirmation before taking effect.' },
            { title: 'Compliance & Enforcement', content: 'Failure to comply with any term may result in account restriction or suspension without prior notice.' },
            { title: 'Misconduct', content: 'Any misconduct while acting under the IndaStreet brand may result in immediate suspension and withholding of pending payments pending investigation.' },
            { title: 'Account Closure & Returns', content: 'Closing your account requires one (1) month written notice. Failure to give notice may incur closing costs. Your agent ID (and any IndaStreet property) must be returned prior to final closure.' },
            { title: 'Independent Contractor', content: 'You act as an independent contractor, not an employee, partner, or representative authorized to bind IndaStreet. You are responsible for your own taxes and government fees.' },
            { title: 'Confidentiality', content: 'You must keep all non‑public information (including provider lists, pricing, and internal materials) confidential and use it only for authorized IndaStreet purposes.' },
            { title: 'Data Protection & Privacy', content: 'You must comply with applicable data‑privacy laws and IndaStreet policies when handling personal data. Personal data may only be used for approved platform activities.' },
            { title: 'Intellectual Property', content: 'IndaStreet owns all rights to its trademarks, brand, platform content, and materials. You may not reproduce or use them beyond approved purposes.' },
            { title: 'No Earnings Guarantee', content: 'IndaStreet does not guarantee any level of earnings or results. Commission depends on actual verified activity and policy compliance.' },
            { title: 'Monitoring & Audit', content: 'IndaStreet may monitor dashboard activity and conduct audits for compliance and quality assurance.' },
            { title: 'Limitation of Liability', content: 'To the maximum extent permitted by law, IndaStreet is not liable for indirect, incidental, special, consequential, or punitive damages, or lost profits arising from your activities as an agent.' },
            { title: 'Indemnification', content: 'You agree to indemnify and hold IndaStreet harmless from claims, losses, and expenses (including reasonable legal fees) arising from your breach of these terms, misconduct, or violation of law.' },
            { title: 'Suspension & Termination', content: 'IndaStreet may suspend or terminate access at any time for policy non‑compliance, risk, or misconduct.' },
            { title: 'Governing Law & Dispute Resolution', content: 'These terms are governed by applicable Indonesian law unless otherwise specified by IndaStreet. Disputes will be resolved under the venue and process designated by IndaStreet’s policies.' },
            { title: 'Amendments & Notices', content: 'IndaStreet may update these terms. Continued use after changes constitutes acceptance. Notices may be delivered via the platform, email, or dashboard alerts.' },
            { title: 'Severability', content: 'If any provision is invalid or unenforceable, the remaining provisions remain in full force and effect.' }
        ]
    };

    if (t && t.sections && Array.isArray(t.sections)) {
        return t as AgentTermsContent;
    }
    if (t && !t.sections) {
        const mapped: AgentTermsContent = { ...fallback };
        mapped.title = t.title || fallback.title;
        mapped.agreement = t.agreement || fallback.agreement;
        mapped.acceptButton = t.acceptButton || fallback.acceptButton;
        mapped.declineButton = t.declineButton || fallback.declineButton;
        return mapped;
    }
    return fallback;
}
