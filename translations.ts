

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
            }
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
            title: 'Become a 2Go Agent',
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
            independentContractor: {
                title: 'Independent Contractor Status',
                content: 'You are an independent contractor, not an employee of 2Go. You are responsible for your own taxes, business expenses, and work schedule. You control the manner and means by which you perform your services.'
            },
            noExclusivity: {
                title: 'No Exclusivity',
                content: 'This agreement is not exclusive. You are free to work for other companies, including competitors of 2Go.'
            },
            professionalConduct: {
                title: 'Professional Conduct & Appearance',
                content: 'You must maintain a professional appearance at all times when representing 2Go Massage. A mandatory registration fee of IDR 100,000 is required to receive your official Agent Kit, which includes a branded T-shirt and name tag. This uniform must be worn during all interactions with potential and existing members. Additional T-shirts are available for purchase at IDR 60,000.'
            },
            socialMediaPolicy: {
                title: 'Social Media Policy',
                content: "You are strictly prohibited from creating any social media accounts, pages, or profiles using the '2Go Massage' brand name, logo, or any affiliated contact information unless you have received prior written approval from the administration. Failure to comply with this policy will result in the immediate deactivation of your agent account until the situation is resolved directly with the administration."
            },
            performance: {
                title: 'Performance Requirements',
                content: 'To maintain an active account and be eligible for commissions, you are required to secure a minimum of five (5) new member sign-ups per week, totaling twenty (20) per calendar month. This requirement is waived for one week during the official Eid al-Fitr holiday period each year.'
            },
            performanceTiers: {
                title: "Performance Tiers & Commission Bonus",
                content: "Agents who successfully meet the monthly target of twenty (20) new member sign-ups will be promoted to 'Toptier 2Go Agent'. Toptier agents will receive a 3% commission increase on all new sign-ups for the following calendar month. This bonus is only applicable for the month immediately following the successful target achievement. If a Toptier agent fails to meet the monthly target, their status will revert to 'Standard Agent' and their commission will return to the standard rate. Agents who consistently maintain Toptier status will be eligible for free 2Go Massage merchandise and other rewards as determined by the administration."
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
                content: 'To help you succeed, 2Go will provide optional training and best practice seminars. While not mandatory, regular participation is highly encouraged to enhance your skills and product knowledge. You will be notified of these opportunities through your Agent Dashboard.'
            },
            indemnification: {
                title: 'Indemnification',
                content: 'You agree to indemnify and hold harmless 2Go Massage, its affiliates, and their respective officers, directors, employees, and agents from any and all claims, demands, losses, liabilities, and expenses (including attorneys\' fees) arising out of or in connection with your actions, your breach of these terms, or your violation of the law or the rights of any third party.'
            },
            acceptButton: 'I Agree & Continue',
            declineButton: 'Decline & Logout'
        },
        footer: {
            agentLink: '2Go Agent',
            termsLink: 'Service Terms',
            privacyLink: 'Privacy Policy',
        },
        serviceTerms: {
            title: 'Service Terms',
            intro: 'Please read our terms of service carefully. These terms ensure a safe, respectful, and professional environment for both clients and therapists.',
            therapistRightsTitle: 'Therapist Rights & Safety',
            therapistRightsContent: 'Our services are strictly for professional massage therapy. Therapists have the right to refuse or end a session at any time if they feel uncomfortable, if the client is under the influence of alcohol, or if there is an additional unauthorized presence in the massage room. The client\'s safety and the therapist\'s safety are our top priorities.',
            paymentTitle: 'Payment Terms',
            paymentContent: 'Payment for the selected massage package is required in full before the session begins. The massage will last for the duration of the time frame paid for.',
            clientCommunicationTitle: 'During the Massage',
            clientCommunicationContent: 'Clients are encouraged to communicate with their therapist at any stage of the massage. You can request to alter the pressure (hard, light, or medium) to suit your comfort. If you feel any discomfort, please inform your therapist immediately. Complaints regarding the service cannot be accepted after the massage has concluded.',
            clientRightsTitle: 'Client Rights & Assurance',
            clientRightsContent: 'The client has the right to cancel the massage without payment if the therapist who arrives does not match the therapist displayed on the profile. Your satisfaction and trust are important to us.',
            therapistObligationsTitle: 'Therapist Obligations & Equipment',
            therapistObligationsContent: 'The therapist will provide all essential materials to carry out a professional massage, including a clean bed cover, hand wipes, and certified massage oil. In the event these items are not present, the client has the right to cancel the massage without any obligation.',
            professionalismTitle: 'Professionalism & Contact',
            professionalismContent: 'All therapists are professionals and must adhere to a strict level of professional service. If a therapist fails to act within these professional boundaries, we ask that you contact our customer service team immediately below.',
            disclaimerTitle: 'Disclaimer of Liability',
            disclaimerContent: '2Go Massage is a directory platform that connects users with independent service providers. We do not employ, guarantee, or background check these providers. You engage with them at your own risk. 2Go is not responsible for any actions, conduct, or service quality of the providers and will not be liable for any damages, losses, or disputes that may arise between you and a provider.',
            disputeResolution: {
                title: 'Dispute Resolution',
                content: 'Any disputes, disagreements, or issues arising from a service must be resolved directly between the user and the service provider. 2Go will not act as a mediator, arbitrator, or adjudicator in any disputes.'
            },
            indemnification: {
                title: 'Indemnification',
                content: 'You agree to indemnify and hold harmless 2Go from any claims, damages, or expenses (including legal fees) arising from your use of the platform or your interactions with service providers.'
            },
            customerServiceButton: 'Contact Customer Service',
        },
        privacyPolicy: {
            title: "Privacy Policy",
            lastUpdated: "Last Updated: 1 August 2024",
            introduction: {
                title: "Introduction",
                content: "Welcome to 2Go Massage. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application."
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
        supabaseSettings: {
            title: 'Supabase Connection',
            description: 'Enter your Supabase project URL and Anon Key to connect the application to your database. This information can be found in your Supabase project settings under API.',
            urlLabel: 'Supabase Project URL',
            keyLabel: 'Supabase Anon Key',
            connectButton: 'Save & Connect',
            disconnectButton: 'Disconnect',
            status: 'Connection Status',
            connected: 'Connected',
            notConnected: 'Not Connected',
            backButton: 'Back to Dashboard',
            error: 'Please fill both fields.',
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
        }
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
            selectRatingError: 'Silakan pilih peringkat.',
            whatsappRequiredError: 'Harap masukkan nomor WhatsApp Anda.',
        },
        adminLogin: {
            title: 'Login Admin',
            prompt: 'Kata Sandi',
            placeholder: 'Masukkan kata sandi Anda',
            button: 'Masuk',
            error: 'Kata Sandi Salah',
        },
        adminDashboard: {
            title: 'Dasbor Admin',
            tabs: {
                members: 'Manajemen Anggota',
                settings: 'Pengaturan Aplikasi',
                agents: 'Agen',
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
            }
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
            title: 'Jadilah Agen 2Go',
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
            independentContractor: {
                title: 'Status Kontraktor Independen',
                content: 'Anda adalah kontraktor independen, bukan karyawan 2Go. Anda bertanggung jawab atas pajak, biaya bisnis, dan jadwal kerja Anda sendiri. Anda mengontrol cara dan sarana dalam menjalankan layanan Anda.'
            },
            noExclusivity: {
                title: 'Tanpa Eksklusivitas',
                content: 'Perjanjian ini tidak bersifat eksklusif. Anda bebas bekerja untuk perusahaan lain, termasuk pesaing 2Go.'
            },
            professionalConduct: {
                title: 'Perilaku & Penampilan Profesional',
                content: 'Anda harus menjaga penampilan profesional setiap saat ketika mewakili 2Go Massage. Biaya pendaftaran wajib sebesar Rp 100.000 diperlukan untuk menerima Paket Agen resmi Anda, yang mencakup kaos bermerek dan tanda pengenal. Seragam ini harus dikenakan selama semua interaksi dengan anggota potensial dan yang sudah ada. Kaos tambahan tersedia untuk dibeli seharga Rp 60.000.'
            },
            socialMediaPolicy: {
                title: 'Kebijakan Media Sosial',
                content: "Anda dilarang keras membuat akun, halaman, atau profil media sosial apa pun menggunakan nama merek, logo, atau informasi kontak terafiliasi '2Go Massage' kecuali Anda telah menerima persetujuan tertulis sebelumnya dari administrasi. Kegagalan untuk mematuhi kebijakan ini akan mengakibatkan penonaktifan segera akun agen Anda hingga situasi tersebut diselesaikan langsung dengan administrasi."
            },
            performance: {
                title: 'Persyaratan Kinerja',
                content: 'Untuk menjaga akun tetap aktif dan berhak atas komisi, Anda diharuskan mendapatkan minimal lima (5) pendaftaran anggota baru per minggu, dengan total dua puluh (20) per bulan kalender. Persyaratan ini ditiadakan selama satu minggu selama periode libur resmi Idul Fitri setiap tahun.'
            },
            performanceTiers: {
                title: "Tingkatan Kinerja & Bonus Komisi",
                content: "Agen yang berhasil memenuhi target bulanan dua puluh (20) pendaftaran anggota baru akan dipromosikan menjadi 'Agen Toptier 2Go'. Agen Toptier akan menerima kenaikan komisi sebesar 3% untuk semua pendaftaran baru pada bulan kalender berikutnya. Bonus ini hanya berlaku untuk bulan setelah pencapaian target yang berhasil. Jika Agen Toptier gagal memenuhi target bulanan, status mereka akan kembali menjadi 'Agen Standar' dan komisi mereka akan kembali ke tarif standar. Agen yang secara konsisten mempertahankan status Toptier akan berhak mendapatkan merchandise 2Go Massage gratis dan hadiah lainnya yang ditentukan oleh administrasi."
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
                content: 'Untuk membantu Anda sukses, 2Go akan menyediakan pelatihan opsional dan seminar praktik terbaik. Meskipun tidak wajib, partisipasi rutin sangat dianjurkan untuk meningkatkan keterampilan dan pengetahuan produk Anda. Anda akan diberitahu tentang peluang ini melalui Dasbor Agen Anda.'
            },
            indemnification: {
                title: 'Ganti Rugi',
                content: 'Anda setuju untuk mengganti rugi dan membebaskan 2Go Massage, afiliasinya, dan pejabat, direktur, karyawan, serta agen mereka dari dan terhadap setiap dan semua klaim, tuntutan, kerugian, kewajiban, dan pengeluaran (termasuk biaya pengacara) yang timbul dari atau sehubungan dengan tindakan Anda, pelanggaran Anda terhadap ketentuan ini, atau pelanggaran Anda terhadap hukum atau hak pihak ketiga mana pun.'
            },
            acceptButton: 'Saya Setuju & Lanjutkan',
            declineButton: 'Tolak & Keluar'
        },
        footer: {
            agentLink: 'Agen 2Go',
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
            disclaimerContent: '2Go Massage adalah platform direktori yang menghubungkan pengguna dengan penyedia layanan independen. Kami tidak mempekerjakan, menjamin, atau memeriksa latar belakang penyedia ini. Anda berinteraksi dengan mereka atas risiko Anda sendiri. 2Go tidak bertanggung jawab atas tindakan, perilaku, atau kualitas layanan dari penyedia dan tidak akan bertanggung jawab atas kerusakan, kerugian, atau perselisihan yang mungkin timbul antara Anda dan penyedia.',
            disputeResolution: {
                title: 'Penyelesaian Sengketa',
                content: 'Setiap sengketa, ketidaksepakatan, atau masalah yang timbul dari suatu layanan harus diselesaikan secara langsung antara pengguna dan penyedia layanan. 2Go tidak akan bertindak sebagai mediator, arbiter, atau penengah dalam sengketa apa pun.'
            },
            indemnification: {
                title: 'Ganti Rugi',
                content: 'Anda setuju untuk mengganti rugi dan membebaskan 2Go dari klaim, kerusakan, atau pengeluaran apa pun (termasuk biaya hukum) yang timbul dari penggunaan platform oleh Anda atau interaksi Anda dengan penyedia layanan.'
            },
            customerServiceButton: 'Hubungi Layanan Pelanggan',
        },
        privacyPolicy: {
            title: "Kebijakan Privasi",
            lastUpdated: "Terakhir Diperbarui: 1 Agustus 2024",
            introduction: {
                title: "Pendahuluan",
                content: "Selamat datang di 2Go Massage. Kami berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan menjaga informasi Anda saat Anda menggunakan aplikasi kami. Harap baca kebijakan ini dengan saksama. Jika Anda tidak setuju dengan ketentuan kebijakan privasi ini, mohon untuk tidak mengakses aplikasi."
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
        supabaseSettings: {
            title: 'Koneksi Supabase',
            description: 'Masukkan URL Proyek Supabase dan Kunci Anon Anda untuk menghubungkan aplikasi ke database Anda. Informasi ini dapat ditemukan di pengaturan proyek Supabase Anda di bawah API.',
            urlLabel: 'URL Proyek Supabase',
            keyLabel: 'Kunci Anon Supabase',
            connectButton: 'Simpan & Hubungkan',
            disconnectButton: 'Putuskan Koneksi',
            status: 'Status Koneksi',
            connected: 'Terhubung',
            notConnected: 'Tidak Terhubung',
            backButton: 'Kembali ke Dasbor',
            error: 'Harap isi kedua kolom.',
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
        }
    },
};