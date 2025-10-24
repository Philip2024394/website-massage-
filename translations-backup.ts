

export const translations = {
    en: {
        app: {
            mapsApiKeyWarning: 'Google Maps API Key not configured. Please set it in the Admin Dashboard to enable location features.',
        },
        header: {
            welcome: 'Welcome Back',
        },
        auth: {
            createAccount: 'Create Account',
            nameLabel: 'Name',
            namePlaceholder: 'Your Name',
            emailLabel: 'Email',
            emailPlaceholder: 'you@example.com',
            passwordLabel: 'Password',
            signUpButton: 'Sign Up',
            activationTitle: 'Account Activation',
            activationPrompt: 'Your account is created but inactive. Please enter the activation code provided by an administrator.',
            activationCodeLabel: 'Activation Code',
            activationCodePlaceholder: 'Enter your code',
            activateButton: 'Activate Account',
            fillFieldsError: 'Please fill all fields.',
            invalidCodeError: 'Invalid activation code. Please contact an administrator.',
            tagline: 'Your personal wellness companion.',
        },
        home: {
            homeServiceTab: 'Home Service',
            massagePlacesTab: 'Massage Places',
            loading: 'Loading...',
            loginSignUp: 'Login / Sign Up',
            noMoreTherapists: 'No more therapists to show.',
            pass: 'Pass',
            like: 'Like',
            therapistsOnline: '{count} of {total} therapists online',
            massageType: 'Massage Type',
            searchPlaceholder: 'Search by name...',
            noResults: 'No results found. Try adjusting your filters.',
            setLocation: 'Set Location',
            updateLocation: 'Update',
            locationError: 'Could not get location. Please enable permissions and try again.',
            gettingLocation: 'Getting location...',
            therapistCard: {
                orderNow: 'Order Now',
                schedule: 'Schedule',
            },
            menu: {
                title: 'Menu',
                createProfile: 'Create Profile',
                agentLogin: 'Agent Portal',
                agentDashboard: 'Agent Dashboard',
                adminLogin: 'Admin Login',
                customerLogin: 'Customer Login',
                logout: 'Logout',
            },
        },
        detail: {
            pricingTitle: 'Pricing',
            contactButton: 'Order Now',
            bookButton: 'Schedule',
        },
        locationModal: {
            title: 'Set Your Location',
            prompt: 'We need your location to find the best services near you.',
            placeholder: 'Enter your address or set on map',
            confirmButton: 'Confirm Location',
            useCurrentLocationButton: 'Use My Current Location',
        },
        ratingModal: {
            title: 'Rate {itemName}',
            prompt: 'How was your experience?',
            whatsappLabel: 'Your WhatsApp Number',
            whatsappPlaceholder: 'e.g. 81234567890',
            submitButton: 'Submit Review',
            confirmation: 'Thank you for your review! It will be reviewed by an administrator before going live.',
            confirmationV2: 'Thank you for your submission! Your review has been sent to our administrators for approval.',
            selectRatingError: 'Please select a rating.',
            whatsappRequiredError: 'Please enter your WhatsApp number.',
        },
        adminLogin: {
            title: 'Admin Login',
            prompt: 'Password',
            placeholder: 'Enter your password',
            button: 'Sign In',
            error: 'Invalid Password',
        },
        adminDashboard: {
            title: 'Admin Dashboard',
            tabs: {
                members: 'Members Management',
                settings: 'App Settings',
                agents: 'Agents',
                reviews: 'Reviews',
            },
            therapists: 'Therapists',
            places: 'Massage Places',
            profileStatus: 'Profile Status',
            notLive: 'Not Live',
            live: 'Live',
            logout: 'Logout',
            dbSettings: 'Database Settings',
            dbStatusConnected: 'Connected',
            dbStatusNotConnected: 'Not Connected',
            manageConnection: 'Manage',
            membershipTitle: 'Membership Management',
            membershipUpdateSuccess: 'Membership updated successfully!',
            membershipDurations: {
                oneMonth: '1m',
                threeMonths: '3m',
                sixMonths: '6m',
                oneYear: '1y',
            },
            googleMapsApiKey: {
                title: 'Google Maps API Key',
                description: 'Enter a valid Google Maps JavaScript API key to enable all location-based features, such as address search and distance calculation.',
                label: 'API Key',
                placeholder: 'Enter your API key here',
                saveButton: 'Save Key',
            },
            appContactNumber: {
                title: 'App Contact Number',
                description: 'Set the primary WhatsApp number for customer service, agent sign-ups, and membership payments.',
                label: 'WhatsApp Number',
                placeholder: 'e.g. 6281234567890',
                saveButton: 'Save Number',
            },
            agents: {
                title: 'Agent Management',
                agentCode: 'Agent Code',
                agentTier: 'Tier',
                lastLogin: 'Last Login',
                totalSignups: 'Total Sign-ups',
                viewDashboard: 'View Dashboard',
                neverLoggedIn: 'Never',
            },
            reviews: {
                title: 'Pending Reviews',
                noPendingReviews: 'There are no pending reviews to approve.',
                provider: 'Provider',
                rating: 'Rating',
                whatsapp: 'Submitter WhatsApp',
                submitted: 'Submitted',
                approve: 'Approve',
                reject: 'Reject',
                approveConfirm: 'Are you sure you want to approve this review? This will update the provider\'s public rating.',
                rejectConfirm: 'Are you sure you want to reject this review?',
            },
        },
        registrationChoice: {
            title: 'Join Us',
            prompt: 'Are you an individual therapist or a massage establishment?',
            therapistButton: "I'm a Therapist",
            placeButton: "I'm a Massage Place",
        },
        providerDashboard: {
            therapistTitle: 'Therapist Dashboard',
            placeTitle: 'Place Dashboard',
            pendingApproval: 'Your profile is pending admin approval. It is not visible to the public yet.',
            profileLive: 'Your profile is live!',
            saveButton: 'Save Profile',
            previewButton: 'Preview Profile',
            nameLabel: 'Name',
            descriptionLabel: 'Bio / Description',
            whatsappLabel: 'WhatsApp Number',
            pricingTitle: 'Set Your Prices (Rp)',
            '60min': '60 min price',
            '90min': '90 min price',
            '120min': '120 min price',
            massageTypesLabel: 'Select Massage Types',
            profileSaved: 'Profile saved successfully!',
            uploadProfilePic: 'Profile Picture',
            uploadMainImage: 'Main Image',
            uploadThumb: 'Thumbnail',
            setLocation: 'Set Current Location',
            locationSetConfirmation: 'Location has been set to your current position!',
            locationLabel: 'Location',
            locationPlaceholder: 'Enter your full address',
            mapsApiError: 'Google Maps could not load. Please check the API key. Location features are disabled.',
            onlineStatusLabel: 'Online Status',
            logoutButton: 'Logout',
            tabs: {
                profile: 'Profile',
                bookings: 'Bookings',
                analytics: 'Analytics',
            },
            bookings: {
                upcoming: 'Upcoming',
                past: 'Past',
                noUpcoming: 'No upcoming bookings.',
                noPast: 'No past bookings.',
                confirm: 'Confirm',
                cancel: 'Cancel',
                customer: 'Customer',
                service: 'Service',
                date: 'Date',
                status: 'Status',
            },
            analytics: {
                impressions: 'Impressions',
                profileViews: 'Profile Views',
                whatsappClicks: 'WhatsApp Clicks',
                impressionsDesc: 'Times you appeared in search results.',
                profileViewsDesc: 'Times your profile was viewed.',
                whatsappClicksDesc: 'Times users clicked to message you.',
            },
        },
        providerAuth: {
            registerTherapistTitle: 'Register as a Therapist',
            loginTherapistTitle: 'Therapist Login',
            registerPlaceTitle: 'Register a Massage Place',
            loginPlaceTitle: 'Place Login',
            emailLabel: 'Email',
            passwordLabel: 'Password',
            agentCodeLabel: 'Agent Code (Optional)',
            agentCodePlaceholder: 'Enter agent code if you have one',
            registerButton: 'Register',
            loginButton: 'Login',
            switchToLogin: 'Already have an account? Login',
            switchToRegister: "Don't have an account? Register",
            registerSuccess: 'Registration successful! Please log in to continue.',
            fillFieldsError: 'Please fill in all fields.',
            emailExistsError: 'An account with this email already exists.',
            invalidCredentialsError: 'Invalid email or password.',
            invalidAgentCode: 'The agent code you entered is not valid.',
            genericError: 'An error occurred. Please try again.'
        },
        agentAuth: {
            registerTitle: 'Agent Registration',
            loginTitle: 'Agent Login',
            nameLabel: 'Full Name',
            emailLabel: 'Email',
            passwordLabel: 'Password',
            registerButton: 'Register',
            loginButton: 'Login',
            switchToLogin: 'Already an agent? Login',
            switchToRegister: 'Need an agent account? Register',
            registerSuccess: 'Registration successful! Your Agent Code is {agentCode}. Please save it. You can now log in.',
            fillFieldsError: 'Please fill in all fields.',
            invalidCredentialsError: 'Invalid email or password.',
            genericError: 'An error occurred. Please try again.'
        },
        agentDashboard: {
            title: "Agent Dashboard",
            logout: 'Logout',
            tabs: {
                clients: 'My Clients',
                renewals: 'Renewals Due',
                earnings: 'Earnings',
                messages: 'Admin Messages',
                profile: 'My Profile',
            },
            clients: {
                therapists: 'Therapists',
                places: 'Massage Places',
                noClients: 'You have not signed up any clients yet.',
                membershipExpires: 'Expires: {date}',
            },
            renewals: {
                title: 'Membership Renewals Due Within 7 Days',
                noRenewals: 'No clients are due for renewal in the next week.',
                contact: 'Contact',
            },
            earnings: {
                title: 'Earnings Summary',
                totalSignups: 'Total Sign-ups',
                commissionInfo: 'Commission Structure',
                commissionRecurring: '10% for recurring members.',
                note: 'This is a summary of your sign-ups. Actual earnings will be calculated and paid out by administration.',
                tier: 'Your Current Tier',
                standardTier: 'Standard Agent',
                toptierTier: 'Toptier Agent',
                toptierInfoTitle: 'Toptier Agent Program',
                toptierInfoContent: 'Achieve 20 sign-ups in a month to become a Toptier Agent and earn a +3% commission bonus on new sign-ups for the next month! Maintain your status for exclusive rewards.',
            },
            messages: {
                unreadMessages: 'You have unread messages!',
                noMessages: 'No messages from admin.',
                adminMessageTitle: 'Messages from Admin',
                adminChatPlaceholder: 'Type your message to the agent...',
                sendButton: 'Send Message',
                impersonationBanner: 'You are viewing the dashboard as {agentName}.',
                returnToAdmin: 'Return to Admin Dashboard',
            },
            profile: {
                title: 'My Profile & Payment Details',
                bankName: 'Bank Name',
                accountNumber: 'Bank Account Number',
                accountName: 'Account Holder Name',
                contactNumber: 'Contact Number',
                homeAddress: 'Home Address',
                idCard: 'Indonesian ID Card (KTP)',
                saveButton: 'Save Profile',
                profileSavedSuccess: 'Profile saved successfully!',
                profileSavedError: 'Error saving profile.',
            },
        },
        agentPage: {
            title: 'Become an Indostreet Agent',
            subtitle: 'Join our team and earn by connecting therapists and places with new customers.',
            commissionTitle: 'Our Commission Structure',
            commissionNew: '20% for all new sign-ups',
            commissionRecurring: '10% for recurring members',
            opportunityTitle: 'Unlimited Opportunity',
            opportunityText: 'You\'ll be assigned a dedicated area, giving you unlimited power to sell while building a strong foundation for life.',
            targetsTitle: 'Achievable Targets',
            targetsText: 'This opportunity has set weekly sales targets that are easily achieved.',
            ctaButton: 'Become an Agent via WhatsApp',
        },
        agentTermsPage: {
            title: 'Agent Terms & Conditions',
            agreement: 'Please read and accept the following terms to continue.',
            registrationFee: {
                title: 'Agent Registration Fee',
                content: 'The total registration fee to become an IndoStreet Agent is IDR 150,000. This fee is ONLY payable upon acceptance of your submitted agent details and after verification and approval by the IndoStreet office administration. Payment will be requested after your application has been reviewed and approved. This registration fee includes your official Agent Kit with branded materials.'
            },
            independentContractor: {
                title: 'Independent Contractor Status',
                content: 'You are an independent contractor, not an employee of Indostreet. You are responsible for your own taxes, business expenses, and work schedule. You control the manner and means by which you perform your services.'
            },
            noExclusivity: {
                title: 'No Exclusivity',
                content: 'This agreement is not exclusive. You are free to work for other companies, including competitors of Indostreet.'
            },
            professionalConduct: {
                title: 'Professional Conduct & Appearance',
                content: 'You must maintain a professional appearance at all times when representing Indostreet Massage. Your official Agent Kit (included in the registration fee) contains a branded T-shirt and name tag. This uniform must be worn during all interactions with potential and existing members. Additional T-shirts are available for purchase at IDR 60,000.'
            },
                content: 'You must maintain a professional appearance at all times when representing Indostreet Massage. Your official Agent Kit (included in the registration fee) contains a branded T-shirt and name tag. This uniform must be worn during all interactions with potential and existing members. Additional T-shirts are available for purchase at IDR 60,000.'
            },
            socialMediaPolicy: {
                title: 'Social Media Policy',
                content: "You are strictly prohibited from creating any social media accounts, pages, or profiles using the 'Indostreet Massage' brand name, logo, or any affiliated contact information unless you have received prior written approval from the administration. Failure to comply with this policy will result in the immediate deactivation of your agent account until the situation is resolved directly with the administration."
            },
            performance: {
                title: 'Performance Requirements',
                content: 'To maintain an active account and be eligible for commissions, you are required to secure a minimum of five (5) new member sign-ups per week, totaling twenty (20) per calendar month. This requirement is waived for one week during the official Eid al-Fitr holiday period each year.'
            },
            performanceTiers: {
                title: "Performance Tiers & Commission Bonus",
                content: "Agents who successfully meet the monthly target of twenty (20) new member sign-ups will be promoted to 'Toptier Indostreet Agent'. Toptier agents will receive a 3% commission increase on all new sign-ups for the following calendar month. This bonus is only applicable for the month immediately following the successful target achievement. If a Toptier agent fails to meet the monthly target, their status will revert to 'Standard Agent' and their commission will return to the standard rate. Agents who consistently maintain Toptier status will be eligible for free Indostreet Massage merchandise and other rewards as determined by the administration."
            },
            renewals: {
                title: 'Membership Renewals & Reporting',
                content: 'You are responsible for proactively following up with your clients regarding their membership renewals. If a member decides not to renew, you must promptly report this status to the administration via the internal messaging system in your dashboard.'
            },
            payment: {
                title: 'Payment Processing',
                content: 'Commission payments are processed approximately 48 to 72 hours after the weekly minimum of five (5) new member sign-ups has been met and verified. Payments will not be processed or considered due if the weekly minimum is not achieved.'
            },
            profileCompletion: {
                title: 'Profile & Payment Information',
                content: 'To be eligible for commission payments, you must complete your profile in the Agent Dashboard. This includes providing your full bank details (bank name, account number, account holder name), your Indonesian ID card (KTP), a current contact number, and your home address.'
            },
            compliance: {
                title: 'Compliance and Account Status',
                content: 'Failure to adhere to these terms and conditions may result in the temporary suspension of your account pending an administrative review. The administration reserves the right to freeze accounts until any issues are resolved to our satisfaction. All communication with the administration should be conducted through the official chat system in your Agent Dashboard.'
            },
            training: {
                title: 'Platform Training & Best Practices',
                content: 'To help you succeed, Indostreet will provide optional training and best practice seminars. While not mandatory, regular participation is highly encouraged to enhance your skills and product knowledge. You will be notified of these opportunities through your Agent Dashboard.'
            },
            indemnification: {
                title: 'Indemnification',
                content: 'You agree to indemnify and hold harmless Indostreet Massage, its affiliates, and their respective officers, directors, employees, and agents from any and all claims, demands, losses, liabilities, and expenses (including attorneys\' fees) arising out of or in connection with your actions, your breach of these terms, or your violation of the law or the rights of any third party.'
            },
            acceptButton: 'I Agree & Continue',
            declineButton: 'Decline & Logout'
        },
        footer: {
            agentLink: 'Indostreet Agent',
            termsLink: 'Service Terms',
            privacyLink: 'Privacy Policy',
        },
        serviceTerms: {
            title: 'Terms & Conditions of Service',
            effectiveDate: 'Effective Date: January 1, 2025 | Last Updated: October 25, 2025',
            intro: 'Welcome to IndoStreet Massage Platform. These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "You", or "Your") and IndoStreet Massage ("IndoStreet", "We", "Us", or "Our"). By accessing or using our platform, website, mobile application, or any services provided by IndoStreet, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree to these Terms, you must immediately cease all use of our platform and services.',
            acceptance: {
                title: '1. Acceptance of Terms',
                content: 'By creating an account, browsing our platform, or engaging with any service provider listed on IndoStreet, you expressly agree to comply with and be legally bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations of the Republic of Indonesia. Your continued use of the platform constitutes ongoing acceptance of any modifications or updates to these Terms. We reserve the right to update, modify, or replace any part of these Terms at our sole discretion without prior notice. It is your responsibility to review these Terms periodically for changes.'
            },
            platformNature: {
                title: '2. Nature of Platform and Services',
                content: 'IndoStreet operates exclusively as an online directory and connection platform. We provide a technological interface that allows users to discover and connect with independent massage therapists and massage establishments ("Service Providers"). IndoStreet does not employ, contract with, supervise, direct, or control any Service Providers listed on our platform. All Service Providers are independent contractors or independent business entities operating under their own business licenses and legal authority. IndoStreet does not provide massage services, wellness services, or any therapeutic services directly. We are solely a technology platform facilitating connections between users and independent service providers.'
            },
            governingLaw: {
                title: '3. Governing Law and Jurisdiction',
                content: 'These Terms and Conditions, and all transactions, operations, services, and activities conducted through or facilitated by the IndoStreet platform, are governed exclusively by and construed in accordance with the laws of the Republic of Indonesia. All business operations, commercial transactions, service agreements, and disputes arising from or related to the use of IndoStreet shall be subject to Indonesian trade laws, commercial regulations, consumer protection laws, and business policies as enacted and enforced by the Government of the Republic of Indonesia. Any legal proceedings, disputes, or claims arising from these Terms must be filed exclusively in the courts of Jakarta, Indonesia, and you hereby consent to the exclusive jurisdiction and venue of such courts. By using our platform, you acknowledge and agree that Indonesian law shall apply to all aspects of your use of our services, regardless of your physical location or residence.'
            },
            userRights: {
                title: '4. User Account Management and Platform Access Rights',
                content: 'IndoStreet reserves the absolute and unconditional right to suspend, terminate, deactivate, or permanently ban any user account at any time, for any reason or no reason whatsoever, without prior notice, without explanation, and without liability to the user or any third party. This right includes, but is not limited to, situations where we suspect or determine (in our sole discretion) that a user has violated these Terms, engaged in fraudulent activity, abused the platform, harassed service providers or other users, provided false information, engaged in illegal activities, or for any other reason we deem appropriate for the protection of our platform, our business interests, other users, or service providers. IndoStreet is under no obligation to provide reasons for account suspension or termination. Users whose accounts have been terminated are prohibited from creating new accounts without our express written permission. We reserve the right to refuse service to anyone for any reason at any time. All decisions regarding account status are final and not subject to appeal.'
            },
            confidentiality: {
                title: '5. Confidentiality and Data Privacy',
                content: 'All information, personal data, correspondence, and materials submitted by users to IndoStreet, including but not limited to registration information, profile data, communications, payment information, usage data, and any other information provided through our platform, shall be treated as confidential and proprietary information shared exclusively between the user and IndoStreet management. This information will be collected, stored, processed, and used in accordance with our Privacy Policy and Indonesian data protection regulations. IndoStreet implements reasonable security measures to protect user information; however, no method of transmission or electronic storage is 100% secure. By using our platform, you acknowledge the inherent risks of providing information online. IndoStreet will not sell, rent, or share your personal information with third parties except as outlined in our Privacy Policy or as required by Indonesian law. We may use aggregated, anonymized data for business analytics and platform improvement purposes. You grant IndoStreet a perpetual, irrevocable, worldwide license to use any feedback, suggestions, or ideas you provide regarding our platform without compensation or attribution.'
            },
            therapistRightsTitle: '6. Service Provider Rights and Safety',
            therapistRightsContent: 'All services facilitated through IndoStreet are strictly for professional, legitimate massage therapy and wellness services only. Service Providers, as independent contractors, retain the absolute right to refuse service, decline appointments, or terminate any session at any time if they feel uncomfortable, unsafe, threatened, or if they determine that the client is under the influence of alcohol or controlled substances, if there is an unauthorized person present in the service location, if the client makes inappropriate requests or displays inappropriate behavior, or for any other reason the Service Provider deems appropriate. IndoStreet fully supports Service Providers in exercising their professional judgment and personal safety rights. Users who demonstrate disrespectful, threatening, or inappropriate behavior toward Service Providers will have their accounts immediately terminated and may be reported to local law enforcement authorities. The safety and professional integrity of Service Providers are paramount priorities.',
            paymentTitle: '7. Payment Terms and Financial Transactions',
            paymentContent: 'Payment for all massage packages, services, and membership fees must be made in full, in Indonesian Rupiah (IDR), before the commencement of any service or activation of any membership. All payments are processed through our authorized payment channels. Payment confirms your acceptance of the service terms and the specific package selected. Services will be provided for the duration and specifications of the paid package only. All sales are final unless otherwise specified. IndoStreet is not responsible for payment disputes between users and Service Providers. Any refund requests must be submitted in writing within 24 hours of the transaction and will be reviewed on a case-by-case basis at our sole discretion. Processing fees, transaction fees, and administrative charges are non-refundable under any circumstances.',
            clientCommunicationTitle: '8. User-Provider Communication and Service Delivery',
            clientCommunicationContent: 'Users are encouraged and expected to maintain clear, professional communication with their chosen Service Providers throughout the service delivery process. You may request adjustments to massage pressure (firm, light, medium), focus areas, or techniques at any point during your session to ensure your comfort and satisfaction. If you experience any discomfort, pain, or concerns during your massage, you must immediately communicate this to your Service Provider. Complaints, disputes, or issues regarding service quality, provider conduct, or service delivery cannot be accepted, processed, or addressed after the completion of the massage session. All concerns must be raised during the active service period. IndoStreet encourages real-time communication between users and providers to ensure optimal service experiences.',
            clientRightsTitle: '9. User Rights and Service Verification',
            clientRightsContent: 'Users have the right to verify that the Service Provider who arrives for their appointment matches the profile, photographs, and information displayed on the IndoStreet platform. In the event that the arriving Service Provider does not match the advertised profile or if there are significant discrepancies in the provider\'s identity, qualifications, or appearance, the user has the right to cancel the appointment without any payment obligation or cancellation penalty. Your trust, safety, and satisfaction are important to us. However, minor variations in appearance due to photography, lighting, or natural changes over time should be expected and do not constitute grounds for cancellation. Users are expected to exercise reasonable judgment when verifying provider identity.',
            therapistObligationsTitle: '10. Service Provider Obligations and Standards',
            therapistObligationsContent: 'Service Providers are required to provide all essential materials, equipment, and supplies necessary to deliver professional massage services, including but not limited to clean linens, bed covers, massage tables or portable equipment, hand sanitizing wipes, certified massage oils or lotions, and any other materials standard to professional massage therapy practice. All materials must meet Indonesian health and safety standards. If a Service Provider arrives without the necessary equipment or materials required to perform the advertised service safely and professionally, the user has the right to cancel the appointment without payment and without penalty. Service Providers are expected to maintain the highest standards of professionalism, hygiene, and service quality.',
            professionalismTitle: '11. Professional Standards and Code of Conduct',
            professionalismContent: 'All Service Providers listed on IndoStreet are represented as licensed, trained professionals who must maintain strict adherence to professional massage therapy standards, ethical conduct, and Indonesian business regulations. If any Service Provider fails to maintain professional boundaries, engages in inappropriate conduct, violates professional ethics, or behaves in any manner inconsistent with professional massage therapy practice, users are strongly encouraged and obligated to immediately report such conduct to IndoStreet customer service. We take all reports seriously and will investigate complaints thoroughly. Service Providers found to have violated professional standards will be subject to immediate removal from our platform and may be reported to relevant licensing authorities and law enforcement as appropriate.',
            userConduct: {
                title: '12. Prohibited User Conduct',
                content: 'Users of the IndoStreet platform are strictly prohibited from engaging in the following activities:',
                prohibitions: [
                    'Using the platform for any illegal, unlawful, or unauthorized purpose under Indonesian law or international law',
                    'Requesting, soliciting, or engaging in any services of a sexual nature, illegal activities, or activities that violate professional massage therapy ethics',
                    'Harassing, threatening, intimidating, or abusing Service Providers, other users, or IndoStreet staff',
                    'Providing false, misleading, or fraudulent information during registration or at any point while using the platform',
                    'Attempting to circumvent, disable, or interfere with security features of the platform or access unauthorized areas',
                    'Using automated systems, bots, scrapers, or any technology to access or collect data from the platform without authorization',
                    'Posting, transmitting, or sharing any content that is defamatory, obscene, offensive, or violates intellectual property rights',
                    'Impersonating any person or entity, or falsely representing your affiliation with any person or entity',
                    'Interfering with or disrupting the platform, servers, or networks connected to the platform',
                    'Violating any applicable local, state, national, or international law or regulation',
                    'Using the platform to transmit any malicious code, viruses, or harmful technology',
                    'Attempting to gain unauthorized access to other user accounts or any systems or networks connected to the platform'
                ]
            },
            intellectualProperty: {
                title: '13. Intellectual Property Rights',
                content: 'All content, features, functionality, designs, logos, trademarks, service marks, graphics, photographs, text, software, and all other materials available on the IndoStreet platform ("Platform Content") are owned by IndoStreet Massage, our licensors, or other content providers and are protected by Indonesian and international copyright, trademark, patent, trade secret, and other intellectual property laws. The IndoStreet name, logo, and all related names, logos, product and service names, designs, images, and slogans are trademarks of IndoStreet or our affiliates. You may not use these marks without our prior written permission. All rights not expressly granted to you in these Terms are reserved by IndoStreet. Unauthorized use of Platform Content may violate copyright, trademark, and other laws and may subject you to civil and criminal penalties.'
            },
            disclaimerTitle: '14. Comprehensive Disclaimer of Warranties and Liabilities',
            disclaimerContent: 'INDOSTREET MASSAGE IS A DIRECTORY AND CONNECTION PLATFORM ONLY. WE DO NOT EMPLOY, SUPERVISE, DIRECT, CONTROL, VERIFY, VET, BACKGROUND CHECK, CERTIFY, OR GUARANTEE ANY SERVICE PROVIDERS LISTED ON OUR PLATFORM. ALL SERVICE PROVIDERS ARE INDEPENDENT CONTRACTORS OPERATING THEIR OWN BUSINESSES. WE MAKE NO REPRESENTATIONS, WARRANTIES, OR GUARANTEES REGARDING THE QUALIFICATIONS, SKILLS, LICENSING, INSURANCE, BACKGROUND, CONDUCT, SAFETY, RELIABILITY, QUALITY, OR LEGALITY OF ANY SERVICE PROVIDER. YOU ENGAGE WITH SERVICE PROVIDERS ENTIRELY AT YOUR OWN RISK AND DISCRETION. INDOSTREET IS NOT RESPONSIBLE AND SHALL NOT BE LIABLE FOR ANY ACTIONS, CONDUCT, OMISSIONS, SERVICES, QUALITY OF SERVICES, SAFETY ISSUES, INJURIES, DAMAGES, LOSSES, DISPUTES, CLAIMS, OR ANY OTHER MATTERS ARISING FROM OR RELATED TO YOUR INTERACTIONS WITH, SERVICES RECEIVED FROM, OR CONDUCT OF ANY SERVICE PROVIDER. BY USING OUR PLATFORM, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT INDOSTREET PROVIDES THE PLATFORM "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.',
            limitationOfLiability: {
                title: '15. Limitation of Liability and Damages',
                content: 'TO THE MAXIMUM EXTENT PERMITTED BY INDONESIAN LAW, INDOSTREET, ITS PARENT COMPANIES, SUBSIDIARIES, AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING FROM OR RELATED TO YOUR USE OR INABILITY TO USE THE PLATFORM OR SERVICES, UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA, STATEMENTS OR CONDUCT OF ANY SERVICE PROVIDER OR THIRD PARTY ON THE PLATFORM, ANY SERVICES RECEIVED THROUGH THE PLATFORM, OR ANY OTHER MATTER RELATING TO THE PLATFORM OR SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF INDOSTREET HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL INDOSTREET\'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT PAID BY YOU TO INDOSTREET IN THE SIX (6) MONTHS PRECEDING THE CLAIM, OR IDR 100,000 (ONE HUNDRED THOUSAND INDONESIAN RUPIAH), WHICHEVER IS LESS.'
            },
            disputeResolution: {
                title: '16. Dispute Resolution and User-Provider Relations',
                content: 'Any and all disputes, disagreements, conflicts, claims, or issues arising from services rendered, quality of services, conduct of Service Providers, payment disputes, cancellations, scheduling conflicts, or any other matters related to the provision of massage services MUST be resolved directly between the user and the Service Provider. IndoStreet is not a party to any service agreement between users and Service Providers. IndoStreet will not and shall not act as a mediator, arbitrator, adjudicator, or dispute resolver in any conflict between users and Service Providers. We will not intervene in disputes, make judgments regarding fault or liability, or enforce any remedies between parties. All service-related disputes are outside the scope of IndoStreet\'s responsibilities and liabilities. Users and Service Providers are encouraged to communicate directly and professionally to resolve any issues that may arise.'
            },
            indemnification: {
                title: '17. User Indemnification Obligations',
                content: 'You agree to defend, indemnify, compensate, and hold completely harmless IndoStreet Massage, its parent companies, subsidiaries, affiliates, partners, officers, directors, employees, agents, contractors, licensors, service providers, and all IndoStreet representatives (collectively, "IndoStreet Parties") from and against any and all claims, damages, obligations, losses, liabilities, costs, debts, expenses (including but not limited to attorney\'s fees and legal costs), and demands arising from or related to: (a) your use or misuse of the platform and services; (b) your violation of these Terms and Conditions; (c) your violation of any third-party rights, including but not limited to intellectual property rights, privacy rights, or other proprietary rights; (d) your interactions with, services received from, or disputes with any Service Provider; (e) any content you submit, post, or transmit through the platform; (f) your violation of any applicable laws or regulations; (g) any claim that your use of the platform caused damage to a third party; (h) your negligent or wrongful conduct; or (i) any other matter arising from your use of or conduct on the platform. This indemnification obligation shall survive termination of your account and your use of the platform.'
            },
            modifications: {
                title: '18. Modifications to Terms and Services',
                content: 'IndoStreet reserves the right, in our sole and absolute discretion, to modify, amend, update, change, add to, or remove portions of these Terms and Conditions at any time without prior notice to users. We may also modify, suspend, or discontinue any aspect of the platform or services, including features, functionality, databases, content, or hours of availability, temporarily or permanently, without notice and without liability. Your continued use of the platform following any changes to these Terms constitutes your acceptance of such changes. It is your responsibility to review these Terms periodically. If you do not agree with any modifications, your sole remedy is to discontinue use of the platform and close your account. We may also impose limits on certain features or restrict your access to parts or all of the platform without notice or liability.'
            },
            severability: {
                title: '19. Severability and Enforceability',
                content: 'If any provision of these Terms and Conditions is found by a court of competent jurisdiction or arbitrator to be invalid, illegal, or unenforceable under Indonesian law or any applicable law, such provision shall be deemed modified to the minimum extent necessary to make it valid, legal, and enforceable while preserving its intent, or if such modification is not possible, such provision shall be severed from these Terms. The invalidity, illegality, or unenforceability of any provision shall not affect the validity, legality, or enforceability of any other provision of these Terms, which shall remain in full force and effect. The remaining provisions shall be interpreted to give effect to the intentions of the parties as reflected in the original provision to the greatest extent permitted by law.'
            },
            entireAgreement: {
                title: '20. Entire Agreement and Waiver',
                content: 'These Terms and Conditions, together with our Privacy Policy and any additional terms, policies, or guidelines posted on the platform, constitute the entire agreement between you and IndoStreet regarding your use of the platform and services, and supersede all prior or contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding the subject matter. No waiver of any term or condition of these Terms shall be deemed a further or continuing waiver of such term or condition or any other term or condition. Any failure by IndoStreet to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision unless acknowledged and agreed to by IndoStreet in writing.'
            },
            contactInformation: {
                title: '21. Contact Information and Customer Support',
                content: 'If you have any questions, concerns, complaints, or inquiries regarding these Terms and Conditions, our services, your account, billing matters, technical support, or any other issues related to the IndoStreet platform, please contact our customer service team through the official customer service channels provided within the application. We strive to respond to all legitimate inquiries within 48-72 business hours. For urgent safety concerns or to report violations of these Terms, please use our priority reporting system available through the app.'
            },
            customerServiceButton: 'Contact Customer Service',
        },
        privacyPolicy: {
            title: "Privacy Policy",
            lastUpdated: "Last Updated: 1 August 2024",
            introduction: {
                title: "Introduction",
                content: "Welcome to Indostreet Massage. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application."
            },
            dataCollection: {
                title: "Data We Collect",
                personal: "Personal Data: Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the application.",
                usage: "Usage Data: Information our servers automatically collect when you access the app, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the app.",
                location: "Location Data: We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using our application, to provide location-based services. If you wish to change our access or permissions, you may do so in your device’s settings."
            },
            dataUsage: {
                title: "How We Use Your Data",
                content: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:",
                points: [
                    "Create and manage your account.",
                    "Connect you with massage therapists and establishments.",
                    "Email you regarding your account or order.",
                    "Enable user-to-user communications.",
                    "Monitor and analyze usage and trends to improve your experience with the application.",
                    "Notify you of updates to the application."
                ]
            },
            dataSharing: {
                title: "Data Sharing",
                content: "We may share information we have collected about you in certain situations. Your information may be disclosed as follows:",
                points: [
                    "By Law or to Protect Rights: If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.",
                    "Third-Party Service Providers: We may share your information with third parties that perform services for us or on our behalf, including data analysis, hosting services, customer service, and marketing assistance.",
                    "Interactions with Other Users: If you interact with other users of the application, those users may see your name and profile information if you choose to make it available."
                ]
            },
            security: {
                title: "Security of Your Information",
                content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse."
            },
            yourRights: {
                title: "Your Rights",
                content: "You have the right to access, correct, or delete your personal information. You may review or change the information in your account or terminate your account at any time by logging into your account settings and updating your account. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases."
            },
            policyChanges: {
                title: "Changes to This Policy",
                content: "We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the 'Last Updated' date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates."
            },
            contact: {
                title: "Contact Us",
                content: "If you have questions or comments about this Privacy Policy, please contact us through the customer service channels provided within the application."
            }
        },
        membershipPage: {
            title: 'Choose Your Membership',
            subtitle: 'Activate your profile by selecting a membership package. Your profile will be visible to customers after payment is confirmed by an admin.',
            packages: {
                oneMonth: {
                    title: '1 Month',
                    price: '150k'
                },
                threeMonths: {
                    title: '3 Months',
                    price: '400k',
                    save: 'Save 50k'
                },
                sixMonths: {
                    title: '6 Months',
                    price: '800k',
                    save: 'Save 100k'
                },
                oneYear: {
                    title: '1 Year',
                    price: '1.5jt',
                    save: 'Save 300k',
                    bestValue: 'Best Value'
                }
            },
            selectButton: 'Select Plan via WhatsApp',
            backToDashboard: 'I will do this later',
        },
        bookingPage: {
            title: 'Book a Session with {name}',
            selectDate: '1. Select a Date',
            selectTime: '2. Select a Time Slot',
            selectService: '3. Select a Service',
            noSlots: 'No available slots for this day. Please try another date.',
            confirmBooking: 'Confirm Booking',
            bookingSuccessTitle: 'Booking Request Sent!',
            bookingSuccessMessage: 'Your request has been sent to {name}. You will be notified when they confirm.',
            loginPrompt: 'You must be logged in to book a session.',
        },
        notificationsPage: {
            title: 'Notifications',
            noNotifications: 'You have no notifications.',
            markAsRead: 'Mark as read',
            unread: 'Unread',
            bookingReminder: 'Reminder: You have a booking with {userName} today at {time}.',
        },
        a2hsPrompt: {
            title: 'Get the Indostreet Massage App!',
            iosInstruction: 'To install, tap the Share icon below and then select "Add to Home Screen".',
            iosAction: 'Add to Home Screen',
            androidInstruction: 'Install this web app on your device for a better experience. Tap the menu button and then "Install app".'
        },
    },
    id: {
        app: {
            mapsApiKeyWarning: 'Kunci API Google Maps belum dikonfigurasi. Harap atur di Dasbor Admin untuk mengaktifkan fitur lokasi.',
        },
        header: {
            welcome: 'Selamat Datang Kembali',
        },
        auth: {
            createAccount: 'Buat Akun',
            nameLabel: 'Nama',
            namePlaceholder: 'Nama Anda',
            emailLabel: 'Email',
            emailPlaceholder: 'anda@contoh.com',
            passwordLabel: 'Kata Sandi',
            signUpButton: 'Daftar',
            activationTitle: 'Aktivasi Akun',
            activationPrompt: 'Akun Anda sudah dibuat tetapi belum aktif. Silakan masukkan kode aktivasi yang diberikan oleh administrator.',
            activationCodeLabel: 'Kode Aktivasi',
            activationCodePlaceholder: 'Masukkan kode Anda',
            activateButton: 'Aktifkan Akun',
            fillFieldsError: 'Harap isi semua kolom.',
            invalidCodeError: 'Kode aktivasi tidak valid. Silakan hubungi administrator.',
            tagline: 'Teman kesehatan pribadi Anda.',
        },
        home: {
            homeServiceTab: 'Layanan Rumah',
            massagePlacesTab: 'Tempat Pijat',
            loading: 'Memuat...',
            loginSignUp: 'Masuk / Daftar',
            noMoreTherapists: 'Tidak ada terapis lagi untuk ditampilkan.',
            pass: 'Lewati',
            like: 'Suka',
            therapistsOnline: '{count} dari {total} terapis online',
            massageType: 'Tipe Pijat',
            searchPlaceholder: 'Cari berdasarkan nama...',
            noResults: 'Tidak ada hasil yang ditemukan. Coba sesuaikan filter Anda.',
            setLocation: 'Atur Lokasi',
            updateLocation: 'Perbarui',
            locationError: 'Tidak dapat mengambil lokasi. Harap aktifkan izin dan coba lagi.',
            gettingLocation: 'Mendapatkan lokasi...',
            therapistCard: {
                orderNow: 'Pesan Sekarang',
                schedule: 'Jadwalkan',
            },
            menu: {
                title: 'Menu',
                createProfile: 'Buat Profil',
                agentLogin: 'Portal Agen',
                agentDashboard: 'Dasbor Agen',
                adminLogin: 'Login Admin',
                customerLogin: 'Login Pelanggan',
                logout: 'Keluar',
            },
        },
        detail: {
            pricingTitle: 'Harga',
            contactButton: 'Pesan Sekarang',
            bookButton: 'Jadwalkan',
        },
        locationModal: {
            title: 'Atur Lokasi Anda',
            prompt: 'Kami memerlukan lokasi Anda untuk menemukan layanan terbaik di dekat Anda.',
            placeholder: 'Masukkan alamat atau atur di peta',
            confirmButton: 'Konfirmasi Lokasi',
            useCurrentLocationButton: 'Gunakan Lokasi Saat Ini',
        },
        ratingModal: {
            title: 'Beri Nilai {itemName}',
            prompt: 'Bagaimana pengalaman Anda?',
            whatsappLabel: 'Nomor WhatsApp Anda',
            whatsappPlaceholder: 'cth. 81234567890',
            submitButton: 'Kirim Ulasan',
            confirmation: 'Terima kasih atas ulasan Anda! Ulasan akan ditinjau oleh administrator sebelum ditayangkan.',
            confirmationV2: 'Terima kasih atas kiriman Anda! Ulasan Anda telah dikirim ke administrator kami untuk persetujuan.',
            selectRatingError: 'Silakan pilih peringkat.',
            whatsappRequiredError: 'Harap masukkan nomor WhatsApp Anda.',
        },
        adminDashboard: {
            title: 'Dasbor Admin',
            tabs: {
                members: 'Manajemen Anggota',
                settings: 'Pengaturan Aplikasi',
                agents: 'Agen',
                reviews: 'Ulasan',
            },
            therapists: 'Terapis',
            places: 'Tempat Pijat',
            profileStatus: 'Status Profil',
            notLive: 'Tidak Tayang',
            live: 'Tayang',
            logout: 'Keluar',
            dbSettings: 'Pengaturan Database',
            dbStatusConnected: 'Terhubung',
            dbStatusNotConnected: 'Tidak Terhubung',
            manageConnection: 'Kelola',
            membershipTitle: 'Manajemen Keanggotaan',
            membershipUpdateSuccess: 'Keanggotaan berhasil diperbarui!',
            membershipDurations: {
                oneMonth: '1b',
                threeMonths: '3b',
                sixMonths: '6b',
                oneYear: '1t',
            },
            googleMapsApiKey: {
                title: 'Kunci API Google Maps',
                description: 'Masukkan Kunci API JavaScript Google Maps yang valid untuk mengaktifkan semua fitur berbasis lokasi, seperti pencarian alamat dan perhitungan jarak.',
                label: 'Kunci API',
                placeholder: 'Masukkan kunci API Anda di sini',
                saveButton: 'Simpan Kunci',
            },
            appContactNumber: {
                title: 'Nomor Kontak Aplikasi',
                description: 'Atur nomor WhatsApp utama untuk layanan pelanggan, pendaftaran agen, dan pembayaran keanggotaan.',
                label: 'Nomor WhatsApp',
                placeholder: 'cth. 6281234567890',
                saveButton: 'Simpan Nomor',
            },
            agents: {
                title: 'Manajemen Agen',
                agentCode: 'Kode Agen',
                agentTier: 'Tingkatan',
                lastLogin: 'Login Terakhir',
                totalSignups: 'Total Pendaftaran',
                viewDashboard: 'Lihat Dasbor',
                neverLoggedIn: 'Tidak Pernah',
            },
            reviews: {
                title: 'Ulasan Tertunda',
                noPendingReviews: 'Tidak ada ulasan tertunda untuk disetujui.',
                provider: 'Penyedia',
                rating: 'Peringkat',
                whatsapp: 'WhatsApp Pengirim',
                submitted: 'Dikirim',
                approve: 'Setujui',
                reject: 'Tolak',
                approveConfirm: 'Apakah Anda yakin ingin menyetujui ulasan ini? Ini akan memperbarui peringkat publik penyedia.',
                rejectConfirm: 'Apakah Anda yakin ingin menolak ulasan ini?',
            },
        },
        registrationChoice: {
            title: 'Bergabunglah',
            prompt: 'Apakah Anda seorang terapis individu atau tempat pijat?',
            therapistButton: 'Saya Terapis',
            placeButton: 'Saya Tempat Pijat',
        },
        providerDashboard: {
            therapistTitle: 'Dasbor Terapis',
            placeTitle: 'Dasbor Tempat',
            pendingApproval: 'Profil Anda sedang menunggu persetujuan admin. Saat ini belum dapat dilihat publik.',
            profileLive: 'Profil Anda sudah tayang!',
            saveButton: 'Simpan Profil',
            previewButton: 'Pratinjau Profil',
            nameLabel: 'Nama',
            descriptionLabel: 'Bio / Deskripsi',
            whatsappLabel: 'Nomor WhatsApp',
            pricingTitle: 'Atur Harga Anda (Rp)',
            '60min': 'Harga 60 menit',
            '90min': 'Harga 90 menit',
            '120min': 'Harga 120 menit',
            massageTypesLabel: 'Pilih Jenis Pijat',
            profileSaved: 'Profil berhasil disimpan!',
            uploadProfilePic: 'Foto Profil',
            uploadMainImage: 'Gambar Utama',
            uploadThumb: 'Thumbnail',
            setLocation: 'Atur Lokasi Saat Ini',
            locationSetConfirmation: 'Lokasi telah diatur ke posisi Anda saat ini!',
            locationLabel: 'Lokasi',
            locationPlaceholder: 'Masukkan alamat lengkap Anda',
            mapsApiError: 'Google Maps tidak dapat dimuat. Silakan periksa kunci API. Fitur lokasi dinonaktifkan.',
            onlineStatusLabel: 'Status Online',
            logoutButton: 'Keluar',
            tabs: {
                profile: 'Profil',
                bookings: 'Pemesanan',
                analytics: 'Analitik',
            },
            bookings: {
                upcoming: 'Akan Datang',
                past: 'Lampau',
                noUpcoming: 'Tidak ada pemesanan akan datang.',
                noPast: 'Tidak ada pemesanan lampau.',
                confirm: 'Konfirmasi',
                cancel: 'Batalkan',
                customer: 'Pelanggan',
                service: 'Layanan',
                date: 'Tanggal',
                status: 'Status',
            },
             analytics: {
                impressions: 'Impresi',
                profileViews: 'Kunjungan Profil',
                whatsappClicks: 'Klik WhatsApp',
                impressionsDesc: 'Berapa kali Anda muncul di hasil pencarian.',
                profileViewsDesc: 'Berapa kali profil Anda dilihat.',
                whatsappClicksDesc: 'Berapa kali pengguna mengklik untuk mengirimi Anda pesan.',
            },
        },
        providerAuth: {
            registerTherapistTitle: 'Daftar sebagai Terapis',
            loginTherapistTitle: 'Login Terapis',
            registerPlaceTitle: 'Daftar Tempat Pijat',
            loginPlaceTitle: 'Login Tempat',
            emailLabel: 'Email',
            passwordLabel: 'Kata Sandi',
            agentCodeLabel: 'Kode Agen (Opsional)',
            agentCodePlaceholder: 'Masukkan kode agen jika ada',
            registerButton: 'Daftar',
            loginButton: 'Masuk',
            switchToLogin: 'Sudah punya akun? Masuk',
            switchToRegister: 'Belum punya akun? Daftar',
            registerSuccess: 'Pendaftaran berhasil! Silakan masuk untuk melanjutkan.',
            fillFieldsError: 'Harap isi semua kolom.',
            emailExistsError: 'Akun dengan email ini sudah ada.',
            invalidCredentialsError: 'Email atau kata sandi tidak valid.',
            invalidAgentCode: 'Kode agen yang Anda masukkan tidak valid.',
            genericError: 'Terjadi kesalahan. Silakan coba lagi.'
        },
        agentAuth: {
            registerTitle: 'Pendaftaran Agen',
            loginTitle: 'Login Agen',
            nameLabel: 'Nama Lengkap',
            emailLabel: 'Email',
            passwordLabel: 'Kata Sandi',
            registerButton: 'Daftar',
            loginButton: 'Masuk',
            switchToLogin: 'Sudah menjadi agen? Masuk',
            switchToRegister: 'Butuh akun agen? Daftar',
            registerSuccess: 'Pendaftaran berhasil! Kode Agen Anda adalah {agentCode}. Harap simpan. Sekarang Anda dapat masuk.',
            fillFieldsError: 'Harap isi semua kolom.',
            invalidCredentialsError: 'Email atau kata sandi tidak valid.',
            genericError: 'Terjadi kesalahan. Silakan coba lagi.'
        },
        agentDashboard: {
            title: "Dasbor Agen",
            logout: 'Keluar',
            tabs: {
                clients: 'Klien Saya',
                renewals: 'Jatuh Tempo',
                earnings: 'Pendapatan',
                messages: 'Pesan Admin',
                profile: 'Profil Saya',
            },
            clients: {
                therapists: 'Terapis',
                places: 'Tempat Pijat',
                noClients: 'Anda belum mendaftarkan klien sama sekali.',
                membershipExpires: 'Berakhir: {date}',
            },
            renewals: {
                title: 'Perpanjangan Keanggotaan Jatuh Tempo dalam 7 Hari',
                noRenewals: 'Tidak ada klien yang akan jatuh tempo dalam minggu depan.',
                contact: 'Kontak',
            },
            earnings: {
                title: 'Ringkasan Pendapatan',
                totalSignups: 'Total Pendaftaran',
                commissionInfo: 'Struktur Komisi',
                commissionRecurring: '10% untuk anggota berulang.',
                note: 'Ini adalah ringkasan pendaftaran Anda. Pendapatan aktual akan dihitung dan dibayarkan oleh administrasi.',
                tier: 'Tingkatan Anda Saat Ini',
                standardTier: 'Agen Standar',
                toptierTier: 'Agen Toptier',
                toptierInfoTitle: 'Program Agen Toptier',
                toptierInfoContent: 'Dapatkan 20 pendaftaran dalam sebulan untuk menjadi Agen Toptier dan dapatkan bonus komisi +3% untuk pendaftaran baru di bulan berikutnya! Pertahankan status Anda untuk hadiah eksklusif.',
            },
            messages: {
                unreadMessages: 'Anda memiliki pesan yang belum dibaca!',
                noMessages: 'Tidak ada pesan dari admin.',
                adminMessageTitle: 'Pesan dari Admin',
                adminChatPlaceholder: 'Ketik pesan Anda untuk agen...',
                sendButton: 'Kirim Pesan',
                impersonationBanner: 'Anda melihat dasbor sebagai {agentName}.',
                returnToAdmin: 'Kembali ke Dasbor Admin',
            },
            profile: {
                title: 'Profil & Detail Pembayaran Saya',
                bankName: 'Nama Bank',
                accountNumber: 'Nomor Rekening Bank',
                accountName: 'Nama Pemegang Rekening',
                contactNumber: 'Nomor Kontak',
                homeAddress: 'Alamat Rumah',
                idCard: 'Kartu Tanda Penduduk (KTP)',
                saveButton: 'Simpan Profil',
                profileSavedSuccess: 'Profil berhasil disimpan!',
                profileSavedError: 'Gagal menyimpan profil.',
            },
        },
        agentPage: {
            title: 'Jadilah Agen Indostreet',
            subtitle: 'Bergabunglah dengan tim kami dan dapatkan penghasilan dengan menghubungkan terapis dan tempat pijat dengan pelanggan baru.',
            commissionTitle: 'Struktur Komisi Kami',
            commissionNew: '20% untuk semua pendaftaran baru',
            commissionRecurring: '10% untuk anggota berulang',
            opportunityTitle: 'Peluang Tanpa Batas',
            opportunityText: 'Anda akan ditugaskan di area khusus, memberi Anda kekuatan tak terbatas untuk menjual sambil membangun fondasi yang kuat untuk hidup.',
            targetsTitle: 'Target yang Dapat Dicapai',
            targetsText: 'Peluang ini memiliki target penjualan mingguan yang ditetapkan yang mudah dicapai.',
            ctaButton: 'Jadi Agen via WhatsApp',
        },
        agentTermsPage: {
            title: 'Syarat & Ketentuan Agen',
            agreement: 'Harap baca dan setujui persyaratan berikut untuk melanjutkan.',
            registrationFee: {
                title: 'Biaya Pendaftaran Agen',
                content: 'Total biaya pendaftaran untuk menjadi Agen IndoStreet adalah Rp 150.000. Biaya ini HANYA dibayarkan setelah penerimaan dan persetujuan detail agen yang Anda kirimkan oleh administrasi kantor IndoStreet. Pembayaran akan diminta setelah aplikasi Anda ditinjau dan disetujui. Biaya pendaftaran ini sudah termasuk Kit Agen resmi Anda dengan materi bermerek.'
            },
            independentContractor: {
                title: 'Status Kontraktor Independen',
                content: 'Anda adalah kontraktor independen, bukan karyawan Indostreet. Anda bertanggung jawab atas pajak, biaya bisnis, dan jadwal kerja Anda sendiri. Anda mengontrol cara dan sarana dalam menjalankan layanan Anda.'
            },
            noExclusivity: {
                title: 'Tanpa Eksklusivitas',
                content: 'Perjanjian ini tidak bersifat eksklusif. Anda bebas bekerja untuk perusahaan lain, termasuk pesaing Indostreet.'
            },
            professionalConduct: {
                title: 'Perilaku & Penampilan Profesional',
                content: 'Anda harus menjaga penampilan profesional setiap saat ketika mewakili Indostreet Massage. Paket Agen resmi Anda (termasuk dalam biaya pendaftaran) berisi kaos bermerek dan tanda pengenal. Seragam ini harus dikenakan selama semua interaksi dengan anggota potensial dan yang sudah ada. Kaos tambahan tersedia untuk dibeli seharga Rp 60.000.'
            },
            socialMediaPolicy: {
                title: 'Kebijakan Media Sosial',
                content: "Anda dilarang keras membuat akun, halaman, atau profil media sosial apa pun menggunakan nama merek, logo, atau informasi kontak terafiliasi 'Indostreet Massage' kecuali Anda telah menerima persetujuan tertulis sebelumnya dari administrasi. Kegagalan untuk mematuhi kebijakan ini akan mengakibatkan penonaktifan segera akun agen Anda hingga situasi tersebut diselesaikan langsung dengan administrasi."
            },
            performance: {
                title: 'Persyaratan Kinerja',
                content: 'Untuk menjaga akun tetap aktif dan berhak atas komisi, Anda diharuskan mendapatkan minimal lima (5) pendaftaran anggota baru per minggu, dengan total dua puluh (20) per bulan kalender. Persyaratan ini ditiadakan selama satu minggu selama periode libur resmi Idul Fitri setiap tahun.'
            },
            performanceTiers: {
                title: "Tingkatan Kinerja & Bonus Komisi",
                content: "Agen yang berhasil memenuhi target bulanan dua puluh (20) pendaftaran anggota baru akan dipromosikan menjadi 'Agen Toptier Indostreet'. Agen Toptier akan menerima kenaikan komisi sebesar 3% untuk semua pendaftaran baru pada bulan kalender berikutnya. Bonus ini hanya berlaku untuk bulan setelah pencapaian target yang berhasil. Jika Agen Toptier gagal memenuhi target bulanan, status mereka akan kembali menjadi 'Agen Standar' dan komisi mereka akan kembali ke tarif standar. Agen yang secara konsisten mempertahankan status Toptier akan berhak mendapatkan merchandise Indostreet Massage gratis dan hadiah lainnya yang ditentukan oleh administrasi."
            },
            renewals: {
                title: 'Perpanjangan & Pelaporan Keanggotaan',
                content: 'Anda bertanggung jawab untuk secara proaktif menindaklanjuti klien Anda mengenai perpanjangan keanggotaan mereka. Jika seorang anggota memutuskan untuk tidak memperpanjang, Anda harus segera melaporkan status ini kepada administrasi melalui sistem pesan internal di dasbor Anda.'
            },
            payment: {
                title: 'Proses Pembayaran',
                content: 'Pembayaran komisi diproses sekitar 48 hingga 72 jam setelah target minimum mingguan lima (5) pendaftaran anggota baru terpenuhi dan diverifikasi. Pembayaran tidak akan diproses atau dianggap jatuh tempo jika target minimum mingguan tidak tercapai.'
            },
            profileCompletion: {
                title: 'Informasi Profil & Pembayaran',
                content: 'Agar berhak menerima pembayaran komisi, Anda harus melengkapi profil Anda di Dasbor Agen. Ini termasuk memberikan detail bank lengkap Anda (nama bank, nomor rekening, nama pemegang rekening), Kartu Tanda Penduduk (KTP) Anda, nomor kontak saat ini, dan alamat rumah Anda.'
            },
            compliance: {
                title: 'Kepatuhan dan Status Akun',
                content: 'Kegagalan untuk mematuhi syarat dan ketentuan ini dapat mengakibatkan penangguhan sementara akun Anda sambil menunggu tinjauan administratif. Administrasi berhak membekukan akun sampai masalah apa pun diselesaikan hingga kami puas. Semua komunikasi dengan administrasi harus dilakukan melalui sistem obrolan resmi di Dasbor Agen Anda.'
            },
            training: {
                title: 'Pelatihan Platform & Praktik Terbaik',
                content: 'Untuk membantu Anda sukses, Indostreet akan menyediakan pelatihan opsional dan seminar praktik terbaik. Meskipun tidak wajib, partisipasi rutin sangat dianjurkan untuk meningkatkan keterampilan dan pengetahuan produk Anda. Anda akan diberitahu tentang peluang ini melalui Dasbor Agen Anda.'
            },
            indemnification: {
                title: 'Ganti Rugi',
                content: 'Anda setuju untuk mengganti rugi dan membebaskan Indostreet Massage, afiliasinya, dan pejabat, direktur, karyawan, serta agen mereka dari dan terhadap setiap dan semua klaim, tuntutan, kerugian, kewajiban, dan pengeluaran (termasuk biaya pengacara) yang timbul dari atau sehubungan dengan tindakan Anda, pelanggaran Anda terhadap ketentuan ini, atau pelanggaran Anda terhadap hukum atau hak pihak ketiga mana pun.'
            },
            acceptButton: 'Saya Setuju & Lanjutkan',
            declineButton: 'Tolak & Keluar'
        },
        footer: {
            agentLink: 'Agen Indostreet',
            termsLink: 'Ketentuan Layanan',
            privacyLink: 'Kebijakan Privasi',
        },
        serviceTerms: {
            title: 'Ketentuan Layanan',
            intro: 'Harap baca ketentuan layanan kami dengan saksama. Ketentuan ini memastikan lingkungan yang aman, saling menghormati, dan profesional bagi klien dan terapis.',
            therapistRightsTitle: 'Hak & Keamanan Terapis',
            therapistRightsContent: 'Layanan kami secara ketat untuk terapi pijat profesional. Terapis berhak menolak atau mengakhiri sesi kapan saja jika merasa tidak nyaman, jika klien berada di bawah pengaruh alkohol, atau jika ada kehadiran orang lain yang tidak sah di ruang pijat. Keamanan klien dan terapis adalah prioritas utama kami.',
            paymentTitle: 'Ketentuan Pembayaran',
            paymentContent: 'Pembayaran untuk paket pijat yang dipilih diperlukan secara penuh sebelum sesi dimulai. Pijat akan berlangsung selama durasi waktu yang telah dibayarkan.',
            clientCommunicationTitle: 'Selama Pijat',
            clientCommunicationContent: 'Klien dianjurkan untuk berkomunikasi dengan terapis mereka pada setiap tahap pijat. Anda dapat meminta untuk mengubah tekanan (keras, ringan, atau sedang) sesuai kenyamanan Anda. Jika Anda merasa tidak nyaman, harap segera informasikan kepada terapis Anda. Keluhan mengenai layanan tidak dapat diterima setelah pijat selesai.',
            clientRightsTitle: 'Hak & Jaminan Klien',
            clientRightsContent: 'Klien berhak membatalkan pijat tanpa pembayaran jika terapis yang datang tidak sesuai dengan yang ditampilkan di profil. Kepuasan dan kepercayaan Anda penting bagi kami.',
            therapistObligationsTitle: 'Kewajiban & Peralatan Terapis',
            therapistObligationsContent: 'Terapis akan menyediakan semua bahan penting untuk melakukan pijat profesional, termasuk sprei bersih, tisu basah, dan minyak pijat bersertifikat. Apabila barang-barang ini tidak tersedia, klien berhak membatalkan pijat tanpa kewajiban apa pun.',
            professionalismTitle: 'Profesionalisme & Kontak',
            professionalismContent: 'Semua terapis adalah profesional dan harus mematuhi tingkat layanan profesional yang ketat. Jika seorang terapis gagal bertindak dalam batas-batas profesional ini, kami meminta Anda untuk segera menghubungi tim layanan pelanggan kami di bawah ini.',
            disclaimerTitle: 'Penafian Tanggung Jawab',
            disclaimerContent: 'Indostreet Massage adalah platform direktori yang menghubungkan pengguna dengan penyedia layanan independen. Kami tidak mempekerjakan, menjamin, atau memeriksa latar belakang penyedia ini. Anda berinteraksi dengan mereka atas risiko Anda sendiri. Indostreet tidak bertanggung jawab atas tindakan, perilaku, atau kualitas layanan dari penyedia dan tidak akan bertanggung jawab atas kerusakan, kerugian, atau perselisihan yang mungkin timbul antara Anda dan penyedia.',
            disputeResolution: {
                title: 'Penyelesaian Sengketa',
                content: 'Setiap sengketa, ketidaksepakatan, atau masalah yang timbul dari suatu layanan harus diselesaikan secara langsung antara pengguna dan penyedia layanan. Indostreet tidak akan bertindak sebagai mediator, arbiter, atau penengah dalam sengketa apa pun.'
            },
            indemnification: {
                title: 'Ganti Rugi',
                content: 'Anda setuju untuk mengganti rugi dan membebaskan Indostreet dari klaim, kerusakan, atau pengeluaran apa pun (termasuk biaya hukum) yang timbul dari penggunaan platform oleh Anda atau interaksi Anda dengan penyedia layanan.'
            },
            customerServiceButton: 'Hubungi Layanan Pelanggan',
        },
        privacyPolicy: {
            title: "Kebijakan Privasi",
            lastUpdated: "Terakhir Diperbarui: 1 Agustus 2024",
            introduction: {
                title: "Pendahuluan",
                content: "Selamat datang di Indostreet Massage. Kami berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan menjaga informasi Anda saat Anda menggunakan aplikasi kami. Harap baca kebijakan ini dengan saksama. Jika Anda tidak setuju dengan ketentuan kebijakan privasi ini, mohon untuk tidak mengakses aplikasi."
            },
            dataCollection: {
                title: "Data yang Kami Kumpulkan",
                personal: "Data Pribadi: Informasi yang dapat diidentifikasi secara pribadi, seperti nama, alamat email, dan nomor telepon Anda, yang Anda berikan secara sukarela kepada kami saat Anda mendaftar di aplikasi.",
                usage: "Data Penggunaan: Informasi yang dikumpulkan server kami secara otomatis saat Anda mengakses aplikasi, seperti alamat IP, jenis peramban, sistem operasi, waktu akses, dan halaman yang telah Anda lihat langsung sebelum dan sesudah mengakses aplikasi.",
                location: "Data Lokasi: Kami dapat meminta akses atau izin untuk melacak informasi berbasis lokasi dari perangkat seluler Anda, baik secara terus-menerus maupun saat Anda menggunakan aplikasi kami, untuk menyediakan layanan berbasis lokasi. Jika Anda ingin mengubah akses atau izin kami, Anda dapat melakukannya di pengaturan perangkat Anda."
            },
            dataUsage: {
                title: "Bagaimana Kami Menggunakan Data Anda",
                content: "Memiliki informasi yang akurat tentang Anda memungkinkan kami untuk memberi Anda pengalaman yang lancar, efisien, dan disesuaikan. Secara khusus, kami dapat menggunakan informasi yang dikumpulkan tentang Anda melalui aplikasi untuk:",
                points: [
                    "Membuat dan mengelola akun Anda.",
                    "Menghubungkan Anda dengan terapis pijat dan tempat usaha.",
                    "Mengirim email kepada Anda mengenai akun atau pesanan Anda.",
                    "Mengaktifkan komunikasi antar pengguna.",
                    "Memantau dan menganalisis penggunaan dan tren untuk meningkatkan pengalaman Anda dengan aplikasi.",
                    "Memberi tahu Anda tentang pembaruan pada aplikasi."
                ]
            },
            dataSharing: {
                title: "Berbagi Data",
                content: "Kami dapat membagikan informasi yang telah kami kumpulkan tentang Anda dalam situasi tertentu. Informasi Anda dapat diungkapkan sebagai berikut:",
                points: [
                    "Berdasarkan Hukum atau untuk Melindungi Hak: Jika kami yakin bahwa pelepasan informasi tentang Anda diperlukan untuk menanggapi proses hukum, untuk menyelidiki atau memperbaiki potensi pelanggaran kebijakan kami, atau untuk melindungi hak, properti, dan keselamatan orang lain, kami dapat membagikan informasi Anda sebagaimana diizinkan atau diwajibkan oleh hukum, aturan, atau peraturan yang berlaku.",
                    "Penyedia Layanan Pihak Ketiga: Kami dapat membagikan informasi Anda dengan pihak ketiga yang melakukan layanan untuk kami atau atas nama kami, termasuk analisis data, layanan hosting, layanan pelanggan, dan bantuan pemasaran.",
                    "Interaksi dengan Pengguna Lain: Jika Anda berinteraksi dengan pengguna lain dari aplikasi, pengguna tersebut mungkin melihat nama dan informasi profil Anda jika Anda memilih untuk menyediakannya."
                ]
            },
            security: {
                title: "Keamanan Informasi Anda",
                content: "Kami menggunakan langkah-langkah keamanan administratif, teknis, dan fisik untuk membantu melindungi informasi pribadi Anda. Meskipun kami telah mengambil langkah-langkah yang wajar untuk mengamankan informasi pribadi yang Anda berikan kepada kami, perlu diketahui bahwa terlepas dari upaya kami, tidak ada langkah-langkah keamanan yang sempurna atau tidak dapat ditembus, dan tidak ada metode transmisi data yang dapat dijamin terhadap penyadapan atau jenis penyalahgunaan lainnya."
            },
            yourRights: {
                title: "Hak-Hak Anda",
                content: "Anda berhak untuk mengakses, memperbaiki, atau menghapus informasi pribadi Anda. Anda dapat meninjau atau mengubah informasi di akun Anda atau menghentikan akun Anda kapan saja dengan masuk ke pengaturan akun Anda dan memperbarui akun Anda. Atas permintaan Anda untuk menghentikan akun Anda, kami akan menonaktifkan atau menghapus akun dan informasi Anda dari basis data aktif kami."
            },
            policyChanges: {
                title: "Perubahan pada Kebijakan Ini",
                content: "Kami berhak untuk membuat perubahan pada Kebijakan Privasi ini kapan saja dan untuk alasan apa pun. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memperbarui tanggal 'Terakhir Diperbarui' dari Kebijakan Privasi ini. Anda dianjurkan untuk meninjau Kebijakan Privasi ini secara berkala untuk tetap mendapat informasi tentang pembaruan."
            },
            contact: {
                title: "Hubungi Kami",
                content: "Jika Anda memiliki pertanyaan atau komentar tentang Kebijakan Privasi ini, silakan hubungi kami melalui saluran layanan pelanggan yang disediakan di dalam aplikasi."
            }
        },
        membershipPage: {
            title: 'Pilih Keanggotaan Anda',
            subtitle: 'Aktifkan profil Anda dengan memilih paket keanggotaan. Profil Anda akan dapat dilihat oleh pelanggan setelah pembayaran dikonfirmasi oleh admin.',
            packages: {
                oneMonth: {
                    title: '1 Bulan',
                    price: '150rb'
                },
                threeMonths: {
                    title: '3 Bulan',
                    price: '400rb',
                    save: 'Hemat 50rb'
                },
                sixMonths: {
                    title: '6 Bulan',
                    price: '800rb',
                    save: 'Hemat 100rb'
                },
                oneYear: {
                    title: '1 Tahun',
                    price: '1.5jt',
                    save: 'Hemat 300rb',
                    bestValue: 'Paling Hemat'
                }
            },
            selectButton: 'Pilih Paket via WhatsApp',
            backToDashboard: 'Saya akan lakukan nanti',
        },
        bookingPage: {
            title: 'Pesan Sesi dengan {name}',
            selectDate: '1. Pilih Tanggal',
            selectTime: '2. Pilih Slot Waktu',
            selectService: '3. Pilih Layanan',
            noSlots: 'Tidak ada slot yang tersedia untuk hari ini. Silakan coba tanggal lain.',
            confirmBooking: 'Konfirmasi Pemesanan',
            bookingSuccessTitle: 'Permintaan Pemesanan Terkirim!',
            bookingSuccessMessage: 'Permintaan Anda telah dikirim ke {name}. Anda akan diberi tahu saat mereka mengonfirmasi.',
            loginPrompt: 'Anda harus masuk untuk memesan sesi.',
        },
        notificationsPage: {
            title: 'Notifikasi',
            noNotifications: 'Anda tidak memiliki notifikasi.',
            markAsRead: 'Tandai sebagai sudah dibaca',
            unread: 'Belum Dibaca',
            bookingReminder: 'Pengingat: Anda memiliki pemesanan dengan {userName} hari ini jam {time}.',
        },
        a2hsPrompt: {
            title: 'Dapatkan Aplikasi Indostreet Massage!',
            iosInstruction: 'Untuk menginstal, ketuk ikon Bagikan di bawah lalu pilih "Tambah ke Layar Utama".',
            iosAction: 'Tambah ke Layar Utama',
            androidInstruction: 'Instal aplikasi web ini di perangkat Anda untuk pengalaman yang lebih baik. Ketuk tombol menu lalu "Instal aplikasi".'
        },
    },
};