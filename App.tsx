

import React, { useState, useEffect, useCallback } from 'react';
import type { User, Place, Therapist, UserLocation, Booking, Notification, Analytics, Agent, AdminMessage } from './types';
import { BookingStatus } from './types';
// import AuthPage from './pages/AuthPage';
import UnifiedLoginPage from './pages/UnifiedLoginPage';
import HomePage from './pages/HomePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LandingPage from './pages/LandingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegistrationChoicePage from './pages/RegistrationChoicePage';
import TherapistLoginPage from './pages/TherapistLoginPage';
import TherapistDashboardPage from './pages/TherapistDashboardPage';
import TherapistStatusPage from './pages/TherapistStatusPage';
import PlaceDashboardPage from './pages/PlaceDashboardPage';
import AgentPage from './pages/AgentPage';
import AgentAuthPage from './pages/AgentAuthPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import AgentTermsPage from './pages/AgentTermsPage';
import ServiceTermsPage from './pages/ServiceTermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import Footer from './components/Footer';
import MembershipPage from './pages/MembershipPage';
import BookingPage from './pages/BookingPage';
import NotificationsPage from './pages/NotificationsPage';
import MassageTypesPage from './pages/MassageTypesPage';
import HotelDashboardPage from './pages/HotelDashboardPage';
import VillaDashboardPage from './pages/VillaDashboardPage';
import { CoinEarnedCelebration } from './components/CoinEarnedCelebration';
import { CoinWelcomePopup } from './components/CoinWelcomePopup';
import { WelcomeCoinBonusPopup } from './components/WelcomeCoinBonusPopup';
import { awardCoins } from './lib/loyaltyService';
import { 
    shouldShowWelcomePopup, 
    markWelcomePopupSeen, 
    getWelcomeBonusDetails,
    isEligibleForWelcomeBonus,
    awardWelcomeBonus
} from './lib/deviceTracking';
import HotelLoginPage from './pages/HotelLoginPage';
import VillaLoginPage from './pages/VillaLoginPage';
import MassagePlaceLoginPage from './pages/MassagePlaceLoginPage';
import EmployerJobPostingPage from './pages/EmployerJobPostingPage';
import JobPostingPaymentPage from './pages/JobPostingPaymentPage';
import BrowseJobsPage from './pages/BrowseJobsPage';
import MassageJobsPage from './pages/MassageJobsPage';
import TherapistJobsPage from './pages/TherapistJobsPage';
import JobUnlockPaymentPage from './pages/JobUnlockPaymentPage';
import AdminBankSettingsPage from './pages/AdminBankSettingsPage';
// UX Enhancement Components
import CookieConsent from './components/CookieConsent';
import WelcomePopup from './components/WelcomePopup';
import RegisterPromptPopup from './components/RegisterPromptPopup';
// Customer Auth Pages
import CustomerAuthPage from './pages/CustomerAuthPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
// Chat System Components
import ChatListPage from './pages/ChatListPage';
import BookingChatWindow from './components/BookingChatWindow';
import type { ChatRoom } from './types';
// SEO Pages
import AboutUsPage from './pages/AboutUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import MassageBaliPage from './pages/MassageBaliPage';
import BlogIndexPage from './pages/BlogIndexPage';
import FAQPage from './pages/FAQPage';
import BalineseMassagePage from './pages/BalineseMassagePage';
import DeepTissueMassagePage from './pages/DeepTissueMassagePage';
import ContactUsPage from './pages/ContactUsPage';
import QuickSupportPage from './pages/QuickSupportPage';
import PartnershipInquiriesPage from './pages/PartnershipInquiriesPage';
import PressMediaPage from './pages/PressMediaPage';
import CareerOpportunitiesPage from './pages/CareerOpportunitiesPage';
import TherapistInfoPage from './pages/TherapistInfoPage';
import HotelInfoPage from './pages/HotelInfoPage';
import EmployerInfoPage from './pages/EmployerInfoPage';
import PaymentInfoPage from './pages/PaymentInfoPage';
// Blog Post Pages
import BaliSpaIndustryTrends2025Page from './pages/blog/BaliSpaIndustryTrends2025Page';
import Top10MassageTechniquesPage from './pages/blog/Top10MassageTechniquesPage';
import MassageCareerIndonesiaPage from './pages/blog/MassageCareerIndonesiaPage';
import BenefitsRegularMassageTherapyPage from './pages/blog/BenefitsRegularMassageTherapyPage';
import HiringMassageTherapistsGuidePage from './pages/blog/HiringMassageTherapistsGuidePage';
import TraditionalBalineseMassagePage from './pages/blog/TraditionalBalineseMassagePage';
import SpaTourismIndonesiaPage from './pages/blog/SpaTourismIndonesiaPage';
import AromatherapyMassageOilsPage from './pages/blog/AromatherapyMassageOilsPage';
import PricingGuideMassageTherapistsPage from './pages/blog/PricingGuideMassageTherapistsPage';
import DeepTissueVsSwedishMassagePage from './pages/blog/DeepTissueVsSwedishMassagePage';
import OnlinePresenceMassageTherapistPage from './pages/blog/OnlinePresenceMassageTherapistPage';
import WellnessTourismUbudPage from './pages/blog/WellnessTourismUbudPage';
// import UnifiedLoginPage from './pages/UnifiedLoginPage';
import { translations } from './translations/index.ts';
import { therapistService, placeService, agentService, adminMessageService } from './lib/appwriteService';
import GuestAlertsPage from './pages/GuestAlertsPage';
import FloatingWebsiteButton from './components/FloatingWebsiteButton';
import HotelVillaMenuPage from './pages/HotelVillaMenuPage';
import { restoreSession, logout as sessionLogout, saveSessionCache } from './lib/sessionManager';
import { soundNotificationService } from './utils/soundNotificationService';
// Coin Shop Pages
import CoinShopPage from './pages/CoinShopPage';
import AdminShopManagementPage from './pages/AdminShopManagementPage';
import RewardBannersTestPage from './pages/RewardBannersTestPage';
import ReferralPage from './pages/ReferralPage';
import CoinHistoryPage from './pages/CoinHistoryPage';
import CoinSystemTestPage from './pages/CoinSystemTestPage';

type Page = 'landing' | 'auth' | 'home' | 'detail' | 'adminLogin' | 'adminDashboard' | 'registrationChoice' | 'providerAuth' | 'therapistStatus' | 'therapistDashboard' | 'placeDashboard' | 'agent' | 'agentAuth' | 'agentDashboard' | 'agentTerms' | 'serviceTerms' | 'privacy' | 'cookies-policy' | 'membership' | 'booking' | 'bookings' | 'notifications' | 'massageTypes' | 'hotelLogin' | 'hotelDashboard' | 'villaLogin' | 'villaDashboard' | 'unifiedLogin' | 'therapistLogin' | 'massagePlaceLogin' | 'hotelVillaMenu' | 'employerJobPosting' | 'jobPostingPayment' | 'browseJobs' | 'massageJobs' | 'therapistJobs' | 'jobUnlockPayment' | 'adminBankSettings' | 'customerAuth' | 'customerDashboard' | 'chatList' | 'about' | 'how-it-works' | 'massage-bali' | 'blog' | 'blog/bali-spa-industry-trends-2025' | 'blog/top-10-massage-techniques' | 'blog/massage-career-indonesia' | 'blog/benefits-regular-massage-therapy' | 'blog/hiring-massage-therapists-guide' | 'blog/traditional-balinese-massage' | 'blog/spa-tourism-indonesia' | 'blog/aromatherapy-massage-oils' | 'blog/pricing-guide-massage-therapists' | 'blog/deep-tissue-vs-swedish-massage' | 'blog/online-presence-massage-therapist' | 'blog/wellness-tourism-ubud' | 'faq' | 'balinese-massage' | 'deep-tissue-massage' | 'contact' | 'quick-support' | 'partnership-inquiries' | 'press-media' | 'career-opportunities' | 'therapist-info' | 'hotel-info' | 'employer-info' | 'payment-info' | 'coin-shop' | 'admin-shop-management' | 'reward-banners-test' | 'referral' | 'coin-history' | 'coin-test';
type Language = 'en' | 'id';
type LoggedInProvider = { id: number | string; type: 'therapist' | 'place' }; // Support both number and string IDs for Appwrite compatibility
type LoggedInUser = { id: string; type: 'admin' | 'hotel' | 'villa' | 'agent' };

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('landing');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loggedInUser, _setLoggedInUser] = useState<LoggedInUser | null>(null);
    const [jobPostingId, setJobPostingId] = useState<string>('');
    
    // Customer/User state (for customers booking massages)
    const [loggedInCustomer, setLoggedInCustomer] = useState<any | null>(null);
    const [loyaltyEvent, setLoyaltyEvent] = useState<any | null>(null);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    
    // Welcome coin bonus state
    const [showWelcomeCoinPopup, setShowWelcomeCoinPopup] = useState(false);
    const [welcomeBonusCoins, setWelcomeBonusCoins] = useState(0);
    
    // Registration prompt state
    const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
    const [registerPromptContext, setRegisterPromptContext] = useState<'booking' | 'chat'>('booking');
    
    // Chat system state
    const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
    const [chatBooking, setChatBooking] = useState<Booking | null>(null);
    const [isChatWindowVisible, setIsChatWindowVisible] = useState(false);
    
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [_allAdminTherapists, setAllAdminTherapists] = useState<Therapist[]>([]);
    const [_allAdminPlaces, setAllAdminPlaces] = useState<Place[]>([]);
    
    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    
    // Provider auth state
    const [loggedInProvider, setLoggedInProvider] = useState<LoggedInProvider | null>(null);
    const [_providerAuthInfo, setProviderAuthInfo] = useState<{ type: 'therapist' | 'place', mode: 'login' | 'register' } | null>(null);
    const [providerForBooking, setProviderForBooking] = useState<{ provider: Therapist | Place; type: 'therapist' | 'place' } | null>(null);
    
    // Agent state
    const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
    const [impersonatedAgent, setImpersonatedAgent] = useState<Agent | null>(null);
    const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
    
    // Hotel/Villa state
    const [isHotelLoggedIn, setIsHotelLoggedIn] = useState(false);
    const [isVillaLoggedIn, setIsVillaLoggedIn] = useState(false);
    const [venueMenuId, setVenueMenuId] = useState<string>('');
    
    // Massage type filter state
    const [selectedMassageType, setSelectedMassageType] = useState<string>('all');
    
    // App config state
    const appContactNumber = '6281392000050';

    const fetchPublicData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Add timeout to prevent infinite loading
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fetch timeout')), 10000)
            );
            
            const dataFetch = Promise.all([
                therapistService.getTherapists(),
                placeService.getPlaces()
            ]);
            
            const [therapistsData, placesData] = await Promise.race([dataFetch, timeout]) as any;
            
            console.log('🏠 HomePage: Fetched therapists:', therapistsData?.length);
            therapistsData?.forEach((t: any) => {
                console.log(`  👤 ${t.name}:`, {
                    mainImage: t.mainImage?.substring(0, 60) + '...',
                    profilePicture: t.profilePicture?.substring(0, 60) + '...',
                    isLive: t.isLive,
                    id: t.id || t.$id
                });
            });
            
            const liveTherapists = therapistsData?.filter((t: any) => t.isLive === true);
            console.log('✅ Live therapists count:', liveTherapists?.length);
            
            setTherapists(therapistsData || []);
            setPlaces(placesData || []);
        } catch (error) {
            console.error('Error fetching public data:', error);
            console.warn('⚠️ Continuing with empty data - check Appwrite configuration');
            setTherapists([]);
            setPlaces([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAdminData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [therapistsData, placesData] = await Promise.all([
                therapistService.getTherapists(),
                placeService.getPlaces()
            ]);

            setAllAdminTherapists(therapistsData || []);
            setAllAdminPlaces(placesData || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setAllAdminTherapists([]);
            setAllAdminPlaces([]);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        // Initialize app: restore session and fetch data
        const initializeApp = async () => {
            console.log('🚀 Initializing app...');
            
            try {
                // Check if user explicitly wants to start fresh (from landing page)
                const startFresh = sessionStorage.getItem('start_fresh');
                
                // Only restore session if not starting fresh
                if (!startFresh) {
                    // Restore session if exists
                    const sessionUser = await restoreSession();
                    
                    if (sessionUser) {
                        console.log('✅ Restoring session for:', sessionUser.type);
                        
                        // Restore state based on user type
                        switch (sessionUser.type) {
                            case 'admin':
                                setIsAdminLoggedIn(true);
                                setPage('adminDashboard');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'hotel':
                                setIsHotelLoggedIn(true);
                                _setLoggedInUser({ id: sessionUser.documentId, type: 'hotel' });
                                setPage('hotelDashboard');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'villa':
                                setIsVillaLoggedIn(true);
                                _setLoggedInUser({ id: sessionUser.documentId, type: 'villa' });
                                setPage('villaDashboard');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'agent':
                                setLoggedInAgent(sessionUser.data);
                                setPage('agentDashboard');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'therapist':
                                setLoggedInProvider({ id: sessionUser.documentId, type: 'therapist' });
                                setPage('therapistStatus');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'place':
                                setLoggedInProvider({ id: sessionUser.documentId, type: 'place' });
                                setPage('placeDashboard');
                                saveSessionCache(sessionUser);
                                break;
                                
                            case 'user':
                                setUser({ id: sessionUser.documentId, name: sessionUser.email } as any);
                                setPage('home');
                                saveSessionCache(sessionUser);
                                break;
                        }
                    } else {
                        console.log('📭 No session to restore, starting fresh');
                    }
                } else {
                    console.log('🆕 Starting fresh - clearing any existing sessions');
                    await sessionLogout();
                    sessionStorage.removeItem('start_fresh');
                }
                
                // Fetch public data
                await fetchPublicData();
                
                // Check URL parameters for venue menu
                const params = new URLSearchParams(window.location.search);
                const venueId = params.get('venue');
                if (venueId) {
                    setVenueMenuId(venueId);
                    setPage('hotelVillaMenu');
                }
                
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        initializeApp();
    }, [fetchPublicData]);

    // Check for welcome bonus on app load
    useEffect(() => {
        const checkWelcomeBonus = async () => {
            try {
                // Check if user should see the welcome popup
                const shouldShow = shouldShowWelcomePopup();
                
                if (shouldShow) {
                    const bonusDetails = getWelcomeBonusDetails();
                    setWelcomeBonusCoins(bonusDetails.coins);
                    
                    // Show popup after a short delay for better UX
                    setTimeout(() => {
                        setShowWelcomeCoinPopup(true);
                    }, 1500);
                }
            } catch (error) {
                console.error('Error checking welcome bonus:', error);
            }
        };
        
        checkWelcomeBonus();
    }, []);

    useEffect(() => {
        if (isAdminLoggedIn) {
            fetchAdminData();
        }
    }, [isAdminLoggedIn, fetchAdminData]);

    // Service Worker: Listen for sound playback messages from background
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'PLAY_NOTIFICATION_SOUND') {
                    // Play sound in main thread when service worker requests it
                    const soundUrl = event.data.soundUrl;
                    console.log('🔊 App: Playing notification sound from service worker:', soundUrl);
                    soundNotificationService.playSound(soundUrl);
                }
            });
        }
    }, []);

    useEffect(() => {
        const fetchAdminMessages = async () => {
            if (loggedInAgent || impersonatedAgent) {
                try {
                    const agentId = (impersonatedAgent || loggedInAgent)?.$id || '';
                    const messages = await adminMessageService.getMessages(agentId);
                    setAdminMessages(messages);
                } catch (error) {
                    console.error('Error fetching admin messages:', error);
                    setAdminMessages([]);
                }
            } else {
                setAdminMessages([]);
            }
        };
        
        fetchAdminMessages();
    }, [loggedInAgent, impersonatedAgent]);


    const t = translations[language];

    const handleLanguageSelect = async (lang: Language) => {
        // Set flag to start fresh (prevent session restore)
        sessionStorage.setItem('start_fresh', 'true');
        
        // Clear all dashboard sessions when entering from landing page
        setIsAdminLoggedIn(false);
        setIsHotelLoggedIn(false);
        setIsVillaLoggedIn(false);
        setLoggedInProvider(null);
        setLoggedInAgent(null);
        setImpersonatedAgent(null);
        setLoggedInCustomer(null);
        
        // Clear session storage
        await sessionLogout();
        
        setLanguage(lang);
        setPage('home');
    };

    const handleEnterApp = async (lang: Language, location: UserLocation) => {
        // Set flag to start fresh (prevent session restore)
        sessionStorage.setItem('start_fresh', 'true');
        
        // Clear all dashboard sessions when entering from landing page
        setIsAdminLoggedIn(false);
        setIsHotelLoggedIn(false);
        setIsVillaLoggedIn(false);
        setLoggedInProvider(null);
        setLoggedInAgent(null);
        setImpersonatedAgent(null);
        setLoggedInCustomer(null);
        
        // Clear session storage
        await sessionLogout();
        
        setLanguage(lang);
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
        setPage('home');
    };
    
    const handleSetUserLocation = (location: UserLocation) => {
        setUserLocation(location);
        localStorage.setItem('user_location', JSON.stringify(location));
    };

    const handleLogout = async () => {
        try {
            // Logout from Appwrite and clear session
            await sessionLogout();
            
            // Clear all app state
            setUser(null);
            setIsAdminLoggedIn(false);
            setIsHotelLoggedIn(false);
            setIsVillaLoggedIn(false);
            setLoggedInProvider(null);
            setLoggedInAgent(null);
            setImpersonatedAgent(null);
            setLoggedInCustomer(null); // Clear customer login
            
            // Reload public data to ensure we have therapists
            await fetchPublicData();
            
            setPage('home');
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('Error during logout:', error);
            setPage('home');
        }
    };
    
    // Customer authentication handlers
    const handleCustomerAuthSuccess = async (customer: any, isNewUser: boolean = false) => {
        setLoggedInCustomer(customer);
        setPage('customerDashboard');
        
        // Check if this is a new user and award welcome bonus
        if (isNewUser) {
            try {
                const eligibility = await isEligibleForWelcomeBonus();
                
                if (eligibility.eligible) {
                    console.log('🎁 New user detected! Awarding welcome bonus...');
                    
                    const bonusResult = await awardWelcomeBonus(
                        customer.$id || customer.userId,
                        'customer',
                        eligibility.deviceId,
                        eligibility.ipAddress
                    );
                    
                    if (bonusResult.success) {
                        console.log('✅ Welcome bonus awarded:', bonusResult.coinsAwarded);
                        setWelcomeBonusCoins(bonusResult.coinsAwarded);
                        
                        // Show popup after a short delay
                        setTimeout(() => {
                            setShowWelcomeCoinPopup(true);
                        }, 1000);
                    } else {
                        console.log('❌ Welcome bonus not awarded:', bonusResult.message);
                    }
                } else {
                    console.log('ℹ️ User not eligible for welcome bonus:', eligibility.reason);
                }
            } catch (error) {
                console.error('Error awarding welcome bonus:', error);
            }
        } else {
            // For existing users, check if they have unclaimed popup
            const shouldShow = shouldShowWelcomePopup();
            if (shouldShow) {
                const bonusDetails = getWelcomeBonusDetails();
                setWelcomeBonusCoins(bonusDetails.coins);
                setTimeout(() => {
                    setShowWelcomeCoinPopup(true);
                }, 500);
            }
        }
        
        console.log('✅ Customer logged in:', customer);
    };
    
    const handleCustomerLogout = async () => {
        await sessionLogout();
        setLoggedInCustomer(null);
        setPage('home');
        console.log('✅ Customer logout successful');
    };
    
    const handleCloseWelcomeCoinPopup = () => {
        setShowWelcomeCoinPopup(false);
        markWelcomePopupSeen();
        
        // Navigate to dashboard if customer is logged in
        if (loggedInCustomer) {
            setPage('customerDashboard');
        }
    };
    
    const handleNavigateToCustomerDashboard = () => {
        if (loggedInCustomer) {
            setPage('customerDashboard');
        } else {
            setPage('customerAuth');
        }
    };
    
    const handleSelectPlace = (place: Place) => {
        handleIncrementAnalytics(place.id, 'place', 'profileViews');
        setSelectedPlace(place);
        setPage('detail');
    };

    const handleBackToHome = () => {
        setSelectedPlace(null);
        setProviderAuthInfo(null);
        setProviderForBooking(null);
        setPage('home');
    };
    
    const handleNavigateToAuth = () => setPage('unifiedLogin');
    const handleNavigateToTherapistLogin = () => setPage('therapistLogin');
    const handleNavigateToHotelLogin = () => setPage('hotelLogin');
    const handleNavigateToVillaLogin = () => setPage('villaLogin');
    const handleNavigateToMassagePlaceLogin = () => setPage('massagePlaceLogin');
    const handleNavigateToAdminLogin = () => setPage('adminDashboard');

    const handleNavigateToRegistrationChoice = () => setPage('registrationChoice');
    const handleNavigateToServiceTerms = () => setPage('serviceTerms');
    const handleNavigateToPrivacyPolicy = () => setPage('privacy');
    const handleNavigateToNotifications = () => setPage('notifications');
    const handleNavigateToAgentAuth = () => setPage('agentAuth');
    
    const handleAdminLogin = () => {
        // Clear the start_fresh flag to allow session restoration
        sessionStorage.removeItem('start_fresh');
        
        setIsAdminLoggedIn(true);
        setPage('adminDashboard');
    };
    
    const handleHotelLogout = async () => {
        await sessionLogout();
        setIsHotelLoggedIn(false);
        _setLoggedInUser(null);
        setPage('home');
        console.log('✅ Hotel logout successful');
    };
    
    const handleVillaLogout = async () => {
        await sessionLogout();
        setIsVillaLoggedIn(false);
        _setLoggedInUser(null);
        setPage('home');
        console.log('✅ Villa logout successful');
    };
    
    const handleAdminLogout = async () => {
        // Logout from Appwrite and clear session
        await sessionLogout();
        
        setIsAdminLoggedIn(false);
        setImpersonatedAgent(null);
        setPage('home');
        console.log('✅ Admin logout successful');
    }


    const handleSelectRegistration = (type: 'therapist' | 'place') => {
        setProviderAuthInfo({ type, mode: 'register' });
        setPage('providerAuth');
    };

    // Unused function - kept for future implementation
    // const handleProviderLogin = async (email: string): Promise<{success: boolean, message: string}> => {
    //     try {
    //         const therapists = await therapistService.getAll();
    //         const therapist = therapists.find((t: any) => t.email === email);
    //         
    //         if (therapist) {
    //             const providerData = { id: therapist.$id, type: 'therapist' as const };
    //             setLoggedInProvider(providerData);
    //             localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
    //             setPage('therapistStatus');
    //             setProviderAuthInfo(null);
    //             return { success: true, message: '' };
    //         }
    //
    //         const places = await placeService.getAll();
    //         const place = places.find((p: any) => p.email === email);
    //         
    //         if (place) {
    //             const providerData = { id: place.$id, type: 'place' as const };
    //             setLoggedInProvider(providerData);
    //             localStorage.setItem('loggedInProvider', JSON.stringify(providerData));
    //             setPage('placeDashboard');
    //             setProviderAuthInfo(null);
    //             return { success: true, message: '' };
    //         }
    //         
    //         return { success: false, message: 'Invalid email. Please check and try again.' };
    //     } catch (error: any) {
    //         console.error('Login error:', error);
    //         return { success: false, message: error.message || 'Login failed' };
    //     }
    // };


    const handleProviderLogout = () => {
        setLoggedInProvider(null);
        localStorage.removeItem('loggedInProvider');
        setPage('home');
    };
    
    const handleNavigateToTherapistDashboard = () => {
        setPage('therapistDashboard');
    };
    
    const handleTherapistStatusChange = async (status: string) => {
        if (!loggedInProvider || loggedInProvider.type !== 'therapist') return;
        
        try {
            // Update status in backend
            const therapist = therapists.find(t => t.id === loggedInProvider.id);
            if (therapist) {
                await handleSaveTherapist({
                    ...therapist,
                    status: status as any
                });
            }
        } catch (error) {
            console.error('Error updating therapist status:', error);
        }
    };

    const handleSaveTherapist = async (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            // Use string ID for Appwrite
            const therapistId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            
            // Validate profilePicture length (max 512 chars for Appwrite)
            const profilePicture = therapistData.profilePicture || '';
            console.log('💾 Saving therapist profile with profilePicture:', profilePicture);
            console.log('📏 ProfilePicture length:', profilePicture.length);
            
            if (profilePicture.length > 512) {
                alert('Profile picture URL is too long. Please use a shorter URL or upload the image to a hosting service.');
                return;
            }
            
            // First, try to fetch existing therapist data
            let existingTherapist: any = null;
            try {
                existingTherapist = await therapistService.getById(therapistId);
                console.log('📖 Found existing therapist profile:', existingTherapist);
            } catch (error) {
                console.log('📝 No existing profile found, will create new one');
            }
            
            const updateData: any = {
                ...therapistData,
                profilePicture: profilePicture, // Ensure it's within 512 char limit
                mainImage: therapistData.mainImage || '', // Ensure mainImage is saved
                id: therapistId, // Add required id field
                therapistId: therapistId, // Add required therapistId field
                hotelId: '', // Required by schema but not used for therapists (only for hotel/villa services)
                pricing: typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing),
                analytics: typeof therapistData.analytics === 'string' ? therapistData.analytics : JSON.stringify(therapistData.analytics),
                specialization: 'Massage Therapist', // Simple string under 128 chars (massageTypes contains the detailed list)
                yearsOfExperience: (therapistData as any).yearsOfExperience || 0, // Add required yearsOfExperience field
                isLicensed: (therapistData as any).isLicensed || false, // Add required isLicensed field
                availability: '[]', // Required by Appwrite schema (empty array for therapists who use status instead)
                hourlyRate: 100, // Required by schema (50-500 range) - therapists use pricing for 60/90/120 min sessions instead
            };
            
            console.log('💾 Saving therapist data:', {
                name: updateData.name,
                profilePicture: updateData.profilePicture?.substring(0, 50) + '...',
                mainImage: updateData.mainImage?.substring(0, 50) + '...',
                location: updateData.location
            });
            
            // If profile exists, preserve important fields that shouldn't be overwritten
            if (existingTherapist) {
                console.log('✏️ Updating existing profile, preserving isLive, email, rating, reviewCount, activeMembershipDate');
                await therapistService.update(therapistId, updateData);
            } else {
                // Create new profile with default values for admin-controlled fields
                console.log('➕ Creating new profile with isLive=false (requires admin activation)');
                const createData = {
                    ...updateData,
                    isLive: false, // New profiles require admin activation
                    email: `therapist${therapistId}@indostreet.com`, // Placeholder email
                };
                await therapistService.create(createData);
            }
            
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            const updateData: any = {
                ...placeData,
                pricing: typeof placeData.pricing === 'string' ? placeData.pricing : JSON.stringify(placeData.pricing),
                analytics: typeof placeData.analytics === 'string' ? placeData.analytics : JSON.stringify(placeData.analytics),
            };
            
            // Handle thumbnailImages if present
            if ('thumbnailImages' in placeData) {
                const thumbs = (placeData as any).thumbnailImages;
                updateData.thumbnailImages = Array.isArray(thumbs) ? JSON.stringify(thumbs) : thumbs;
            }
            
            // Use string ID for Appwrite
            const placeId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            await placeService.update(placeId, updateData);
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };

    const handleAgentRegister = async (name: string, email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agentCode = `${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${Math.random().toString(36).substring(2, 6)}`;
            
            await agentService.create({
                name,
                email,
                agentCode,
                hasAcceptedTerms: false,
                lastLogin: new Date().toISOString()
            });
            
            return { success: true, message: `Registration successful! Your agent code is: ${agentCode}. Please save it for future reference.` };
        } catch (error: any) {
            console.error('Agent registration error:', error);
            return { success: false, message: error.message || 'Registration failed' };
        }
    };
    
    const handleAgentLogin = async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agents = await agentService.getAll();
            const agentData = agents.find((a: any) => a.email === email);
            
            if (!agentData) {
                return { success: false, message: 'Invalid email. Please check and try again.' };
            }

            // Update last login
            try {
                await agentService.update(agentData.$id, { lastLogin: new Date().toISOString() });
            } catch (updateError) {
                console.error('Failed to update last login time', updateError);
            }
        
            setLoggedInAgent(agentData);
            localStorage.setItem('loggedInAgent', JSON.stringify(agentData));

            if (agentData.hasAcceptedTerms) {
                setPage('agentDashboard');
            } else {
                setPage('agentTerms');
            }

            return { success: true, message: '' };
        } catch (error: any) {
            console.error('Agent login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const handleAgentLogout = async () => {
        // TODO: Implement with authService.logout()
        setLoggedInAgent(null);
        localStorage.removeItem('loggedInAgent');
        setPage('home');
    };
    
    const handleAgentAcceptTerms = async () => {
        if (!loggedInAgent) return;

        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
            await agentService.update(agentId, { hasAcceptedTerms: true });
            
            const updatedAgent = { ...loggedInAgent, hasAcceptedTerms: true };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            setPage('agentDashboard');
        } catch (error: any) {
            console.error('Accept terms error:', error);
            alert('Could not accept terms: ' + (error.message || 'Unknown error'));
        }
    };

    const handleSaveAgentProfile = async (agentData: Partial<Agent>) => {
        if (!loggedInAgent) return;
    
        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
            await agentService.update(agentId, agentData);
            
            const updatedAgent = { ...loggedInAgent, ...agentData };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Save agent profile error:', error);
            alert('Error saving profile: ' + (error.message || 'Unknown error'));
        }
    };

    const handleStopImpersonating = () => {
        setImpersonatedAgent(null);
        setPage('adminDashboard');
    };

    const handleSendAdminMessage = async (message: string) => {
        if (!impersonatedAgent) return;
        
        try {
            const agentId = impersonatedAgent.$id || impersonatedAgent.id?.toString() || '';
            const agentName = impersonatedAgent.name || '';
            
            await adminMessageService.sendMessage({
                senderId: agentId,
                senderName: agentName,
                senderType: 'agent',
                receiverId: 'admin',
                message: message
            });
            
            // Refresh messages
            const messages = await adminMessageService.getMessages(agentId);
            setAdminMessages(messages);
        } catch (error) {
            console.error('Error sending admin message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleMarkMessagesAsRead = async () => {
        if (!loggedInAgent) return;
        
        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id?.toString() || '';
            await adminMessageService.markAsRead(agentId);
            
            // Refresh messages
            const messages = await adminMessageService.getMessages(agentId);
            setAdminMessages(messages);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Supabase functions removed - using Appwrite as backend

    const handleSelectMembershipPackage = (packageName: string, price: string) => {
        const number = appContactNumber;
        const provider = loggedInProvider?.type === 'therapist'
            ? therapists.find(t => t.id === loggedInProvider.id)
            : places.find(p => p.id === loggedInProvider!.id);
        
        const message = encodeURIComponent(
            `Hi, I would like to purchase the ${packageName} membership for ${price}.\n\nMy registered email is: ${provider?.email}`
        );
        
        // Play click sound
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Sound play failed:', err));
        
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    };

    const handleBackToProviderDashboard = () => {
        if (loggedInProvider?.type === 'therapist') {
            setPage('therapistStatus'); // Changed to status page
        } else if (loggedInProvider?.type === 'place') {
            setPage('placeDashboard');
        } else {
            setPage('home');
        }
    };

    const handleIncrementAnalytics = (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => {
        // This should be an RPC call to Supabase to increment the value
        console.log(`Incrementing ${metric} for ${type} ${id}`);
    };

    const handleRegisterPromptClose = () => {
        setShowRegisterPrompt(false);
    };

    const handleRegisterPromptRegister = () => {
        setShowRegisterPrompt(false);
        setPage('customerAuth');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleShowRegisterPromptForChat = () => {
        setRegisterPromptContext('chat');
        setShowRegisterPrompt(true);
    };

    const handleNavigateToBooking = (provider: Therapist | Place, type: 'therapist' | 'place') => {
        // Allow hotel/villa users or regular customers to book
        if (!user && !isHotelLoggedIn && !isVillaLoggedIn && !loggedInCustomer) {
            setRegisterPromptContext('booking');
            setShowRegisterPrompt(true);
            return;
        }
        setProviderForBooking({ provider, type });
        setPage('booking');
    };

    const handleQuickBookWithChat = async (provider: Therapist | Place, type: 'therapist' | 'place') => {
        // Allow hotel/villa users or regular customers to book
        if (!user && !isHotelLoggedIn && !isVillaLoggedIn && !loggedInCustomer) {
            setRegisterPromptContext('booking');
            setShowRegisterPrompt(true);
            return;
        }

        // Create a quick booking with default values
        const now = new Date();
        const bookingTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour from now
        
        const providerId = typeof provider.id === 'number' ? provider.id : (parseInt(String(provider.id), 10) || 0);
        
        const quickBookingData = {
            providerName: provider.name,
            providerId: providerId,
            providerType: type,
            startTime: bookingTime.toISOString(), // ISO string format
            service: '60' as '60' | '90' | '120', // Default 60 min service
        };

        // Set the provider for booking context
        setProviderForBooking({ provider, type });

        // Create the booking and open chat
        await handleCreateBooking(quickBookingData);
    };

    // Handle chat creation from busy therapist modal
    const handleChatWithBusyTherapist = async (therapist: Therapist) => {
        if (!isHotelLoggedIn && !isVillaLoggedIn) {
            alert('Please login as a hotel/villa to use chat feature');
            return;
        }

        try {
            console.log('🚀 Creating chat with busy therapist:', therapist.name);

            // Import chat services
            const { createChatRoom, sendMessage } = await import('./lib/chatService');
            
            // Determine current user info
            const currentUserId = loggedInCustomer?.$id || user?.id || (isHotelLoggedIn ? 'hotel-user' : 'villa-user');
            const currentUserName = loggedInCustomer?.name || user?.name || (isHotelLoggedIn ? 'Hotel Guest' : 'Villa Guest');
            
            // Create a temporary booking for the chat context
            const tempBooking: Booking = {
                id: Date.now(),
                providerId: typeof therapist.id === 'number' ? therapist.id : parseInt(String(therapist.id), 10),
                providerName: therapist.name,
                providerType: 'therapist',
                startTime: new Date().toISOString(),
                service: '60' as '60' | '90' | '120',
                status: BookingStatus.Pending,
                userId: currentUserId,
                userName: currentUserName
            };

            // Create chat room
            const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
            const chatRoom = await createChatRoom({
                bookingId: tempBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: language,
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: typeof therapist.id === 'number' ? therapist.id : parseInt(String(therapist.id), 10),
                therapistName: therapist.name,
                therapistLanguage: (therapist as any).language || 'id',
                therapistType: 'therapist',
                therapistPhoto: therapist.profilePicture || '',
                expiresAt
            });

            console.log('✅ Chat room created:', chatRoom.$id);

            // Send automated welcome message from therapist
            const welcomeMessage = language === 'en' 
                ? `Thanks for connecting to my chat! My name is ${therapist.name}. I am busy at the moment and will reply soon. If you would like to require my service please leave a comment below and as soon as I am available I will reply to let you know my availability. Thank you for choosing my profile and I look forward to offering you massage service soon!`
                : `Terima kasih telah terhubung ke chat saya! Nama saya ${therapist.name}. Saya sedang sibuk saat ini dan akan segera membalas. Jika Anda ingin menggunakan layanan saya, silakan tinggalkan komentar di bawah dan segera saya tersedia saya akan membalas untuk memberi tahu Anda ketersediaan saya. Terima kasih telah memilih profil saya dan saya berharap dapat menawarkan layanan pijat kepada Anda segera!`;

            await sendMessage({
                roomId: chatRoom.$id!,
                senderId: String(therapist.id),
                senderType: 'therapist' as any,
                senderName: therapist.name,
                text: welcomeMessage,
                senderLanguage: (therapist as any).language || 'id',
                recipientLanguage: language
            });

            console.log('✅ Welcome message sent');

            // Set active chat and booking
            setActiveChatRoom(chatRoom);
            setChatBooking(tempBooking);
            
            // Navigate to chat page
            setPage('chatList');

        } catch (error) {
            console.error('❌ Error creating chat with busy therapist:', error);
            alert('Failed to start chat. Please try again.');
        }
    };

    const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'userId' | 'userName'>) => {
        // Determine current user info (support hotel/villa/customer/regular user)
        const currentUserId = loggedInCustomer?.$id || user?.id || (isHotelLoggedIn ? 'hotel-user' : (isVillaLoggedIn ? 'villa-user' : 'guest'));
        const currentUserName = loggedInCustomer?.name || user?.name || (isHotelLoggedIn ? 'Hotel Guest' : (isVillaLoggedIn ? 'Villa Guest' : 'Guest'));
        
        const newBooking: Booking = {
            ...bookingData,
            id: Date.now(),
            status: BookingStatus.Pending,
            userId: currentUserId,
            userName: currentUserName,
        };
        setBookings(prev => [...prev, newBooking]);

        // Track booking completion in analytics (lazy loaded)
        import('./services/analyticsService')
            .then(({ analyticsService }) => {
                // Calculate amount from service duration
                const defaultPricing = { '60': 200000, '90': 300000, '120': 400000 };
                const amount = defaultPricing[newBooking.service as '60' | '90' | '120'] || 200000;
                
                return analyticsService.trackBookingCompleted(
                    newBooking.id,
                    newBooking.providerId,
                    newBooking.providerType as 'therapist' | 'place',
                    amount,
                    user?.id.toString()
                );
            })
            .catch(err => console.error('Analytics tracking error:', err));

        // 🔔 DUAL NOTIFICATION SYSTEM:
        // 1. WhatsApp (secret backend notification - user never sees)
        // 2. Chat window (visible to user with real-time messaging)
        
        console.log('🚀 Starting chat room creation...');
        
        try {
            // Import chat services
            const { createChatRoom, sendSystemMessage } = await import('./lib/chatService');
            const { playBookingNotificationSequence } = await import('./lib/soundService');
            
            console.log('✅ Chat services imported');
            
            // Get provider details
            const provider = providerForBooking?.provider;
            const providerType = providerForBooking?.type || 'therapist';
            
            if (!provider) {
                console.warn('❌ No provider found for booking');
                alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
                setPage('home');
                return;
            }

            console.log('📋 Provider details:', { 
                id: provider.id, 
                name: provider.name, 
                type: providerType 
            });

            // Create chat room with 25-minute expiry
            const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
            
            console.log('🔧 Creating chat room...');
            
            const chatRoom = await createChatRoom({
                bookingId: newBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: language,
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: provider.id as number,
                therapistName: provider.name,
                therapistLanguage: (provider as any).language || 'id',
                therapistType: providerType,
                therapistPhoto: (provider as any).profilePicture || (provider as any).mainImage || '',
                expiresAt
            });

            console.log('✅ Chat room created:', chatRoom.$id);

            // Send initial system message
            await sendSystemMessage(chatRoom.$id!, {
                en: '✓ Booking request sent! Therapist has 25 minutes to respond.',
                id: '✓ Permintaan booking terkirim! Terapis punya 25 menit untuk merespon.'
            });

            console.log('✅ System message sent');

            // Play notification sound sequence
            // 1. WhatsApp sent sound (0ms)
            // 2. Chat window opened sound (800ms later)
            await playBookingNotificationSequence();

            console.log('✅ Notification sounds played');

            // Open chat window
            setActiveChatRoom(chatRoom);
            setChatBooking(newBooking);
            setIsChatWindowVisible(true);

            console.log('✅ Chat window state set. Should be visible now!');
            console.log('State values:', { 
                hasChatRoom: !!chatRoom, 
                hasBooking: !!newBooking,
                chatRoomId: chatRoom.$id 
            });

            // Go back to home (chat window will overlay)
            setPage('home');

        } catch (error) {
            console.error('❌ Error creating chat room:', error);
            // Fallback to old behavior if chat fails
            alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
            setPage('home');
        }
    };
    
    const handleUpdateBookingStatus = async (bookingId: number, newStatus: BookingStatus) => {
        // Find the booking being updated
        const booking = bookings.find(b => b.id === bookingId);
        
        // Update booking status
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        
        // 🪙 LOYALTY COINS: Award coins when booking is completed
        if (newStatus === BookingStatus.Completed && booking && loggedInCustomer) {
            try {
                console.log('🪙 Awarding loyalty coins for completed booking...');
                
                const event = await awardCoins(
                    loggedInCustomer.$id || loggedInCustomer.userId,
                    booking.providerId,
                    booking.providerType,
                    booking.providerName,
                    booking.id
                );
                
                // Show celebration popup with falling coins!
                setLoyaltyEvent(event);
                
                console.log('✅ Loyalty coins awarded:', event);
            } catch (error) {
                console.error('❌ Error awarding loyalty coins:', error);
                // Don't block the status update if coin awarding fails
            }
        }
    };

    const handleMarkNotificationAsRead = (notificationId: number) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    };

    const renderPage = () => {
        if (isLoading && page !== 'landing') {
            return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-green"></div></div>;
        }

        switch (page) {
            case 'landing': return <LandingPage onLanguageSelect={handleLanguageSelect} onEnterApp={handleEnterApp} />;
            // case 'auth': return <AuthPage onAuthSuccess={() => setPage('home')} onBack={handleBackToHome} t={t.auth} />;
            case 'unifiedLogin': return <UnifiedLoginPage />;
            case 'therapistLogin': return <TherapistLoginPage onSuccess={(therapistId) => {
                // Handle therapist login success - set logged in state and navigate to dashboard
                setLoggedInProvider({ id: therapistId, type: 'therapist' });
                setPage('therapistDashboard');
            }} onBack={handleBackToHome} />;
            case 'home':
                return <HomePage 
                            user={user} 
                            loggedInAgent={loggedInAgent}
                            loggedInProvider={loggedInProvider ? {
                                id: typeof loggedInProvider.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider.id,
                                type: loggedInProvider.type
                            } : null}
                            loggedInCustomer={loggedInCustomer}
                            therapists={therapists}
                            places={places}
                            userLocation={userLocation}
                            selectedMassageType={selectedMassageType}
                            onSetUserLocation={handleSetUserLocation}
                            onSelectPlace={handleSelectPlace} 
                            onLogout={handleLogout}
                            onLoginClick={handleNavigateToTherapistLogin}
                            onCreateProfileClick={handleNavigateToRegistrationChoice}
                            onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : () => setPage('agent')}
                            onCustomerPortalClick={handleNavigateToCustomerDashboard}
                            onBook={handleNavigateToBooking}
                            onQuickBookWithChat={handleQuickBookWithChat}
                            onChatWithBusyTherapist={handleChatWithBusyTherapist}
                            onShowRegisterPrompt={handleShowRegisterPromptForChat}
                            onIncrementAnalytics={handleIncrementAnalytics}
                            onMassageTypesClick={() => setPage('massageTypes')}
                            onHotelPortalClick={handleNavigateToHotelLogin}
                            onVillaPortalClick={handleNavigateToVillaLogin}
                            onTherapistPortalClick={handleNavigateToTherapistLogin}
                            onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin}
                            onAdminPortalClick={handleNavigateToAdminLogin}
                            onBrowseJobsClick={() => setPage('browseJobs')}
                            onEmployerJobPostingClick={() => setPage('employerJobPosting')}
                            onMassageJobsClick={() => {
                                console.log('🚀 App: Setting page to massageJobs');
                                setPage('massageJobs');
                            }}
                            onTherapistJobsClick={() => {
                                console.log('🚀 App: Setting page to therapistJobs');
                                setPage('therapistJobs');
                            }}
                            onTermsClick={handleNavigateToServiceTerms}
                            onPrivacyClick={handleNavigateToPrivacyPolicy}
                            onNavigate={(page) => setPage(page as Page)}
                            isLoading={isLoading}
                            t={t} />;
            case 'detail': return selectedPlace && <PlaceDetailPage 
                place={selectedPlace} 
                onBack={handleBackToHome} 
                onBook={(place) => handleNavigateToBooking(place, 'place')} 
                onIncrementAnalytics={(metric) => handleIncrementAnalytics(selectedPlace.id, 'place', metric)} 
                loggedInProviderId={typeof loggedInProvider?.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider?.id} 
                t={t.detail} 
            />;
            // case 'adminLogin': return <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'adminDashboard': return isAdminLoggedIn ? <AdminDashboardPage onLogout={handleAdminLogout} /> : <AdminLoginPage onAdminLogin={handleAdminLogin} onBack={handleBackToHome} t={t.adminLogin} />;
            case 'registrationChoice': return <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            // case 'providerAuth': return providerAuthInfo && <ProviderAuthPage ... />;
            case 'therapistStatus': return loggedInProvider ? <TherapistStatusPage
                therapist={therapists.find(t => t.id === loggedInProvider.id) || null}
                onStatusChange={handleTherapistStatusChange}
                onNavigateToDashboard={handleNavigateToTherapistDashboard}
                onNavigateToHome={handleProviderLogout}
                t={t.providerDashboard}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'therapistDashboard': return loggedInProvider ? <TherapistDashboardPage 
                onSave={handleSaveTherapist} 
                onLogout={handleProviderLogout} 
                onNavigateToNotifications={handleNavigateToNotifications}
                onNavigateToHome={handleBackToHome}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                t={t.providerDashboard} 
                therapistId={loggedInProvider.id}
                bookings={bookings.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'therapist')}
                notifications={notifications.filter(n => n.providerId === loggedInProvider.id)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'placeDashboard': return loggedInProvider ? <PlaceDashboardPage 
                onSave={handleSavePlace} 
                onLogout={handleProviderLogout} 
                onNavigateToNotifications={handleNavigateToNotifications}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                t={t.providerDashboard} 
                placeId={typeof loggedInProvider.id === 'string' ? parseInt(loggedInProvider.id) : loggedInProvider.id}
                bookings={bookings.filter(b => b.providerId === loggedInProvider.id && b.providerType === 'place')}
                notifications={notifications.filter(n => n.providerId === loggedInProvider.id)}
            /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice} />;
            case 'agent': return <AgentPage onBack={handleBackToHome} onNavigateToAgentAuth={handleNavigateToAgentAuth} t={t.agentPage} contactNumber={appContactNumber} />;
            case 'agentAuth': return <AgentAuthPage onRegister={handleAgentRegister} onLogin={handleAgentLogin} onBack={handleBackToHome} t={t.agentAuth} />;
            case 'agentTerms': return loggedInAgent ? <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} /> : null;
            case 'agentDashboard': 
                if (impersonatedAgent) {
                    return <AgentDashboardPage 
                                agent={impersonatedAgent} 
                                onLogout={() => {}} 
                                isAdminView={true}
                                onStopImpersonating={handleStopImpersonating}
                                messages={adminMessages}
                                onSendMessage={handleSendAdminMessage}
                                t={t.agentDashboard} 
                           />;
                }
                if (loggedInAgent) {
                     if (!loggedInAgent.hasAcceptedTerms) {
                        return <AgentTermsPage onAccept={handleAgentAcceptTerms} onLogout={handleAgentLogout} t={t.agentTermsPage} />;
                     }
                     return <AgentDashboardPage 
                                agent={loggedInAgent} 
                                onLogout={handleAgentLogout} 
                                messages={adminMessages}
                                onMarkMessagesAsRead={handleMarkMessagesAsRead}
                                onSaveProfile={handleSaveAgentProfile}
                                t={t.agentDashboard} 
                            />;
                }
                return null;
            case 'serviceTerms': return <ServiceTermsPage onBack={handleBackToHome} t={t.serviceTerms} contactNumber={appContactNumber} />;
            case 'privacy': return <PrivacyPolicyPage onBack={handleBackToHome} t={t.privacyPolicy} />;
            case 'cookies-policy': return <CookiesPolicyPage onBack={handleBackToHome} t={t} />;
            case 'customerAuth': return <CustomerAuthPage onSuccess={handleCustomerAuthSuccess} onBack={handleBackToHome} />;
            case 'customerDashboard': return loggedInCustomer ? (
                <CustomerDashboardPage 
                    user={loggedInCustomer} 
                    onLogout={handleCustomerLogout} 
                    onBack={handleBackToHome}
                    onBookNow={() => setPage('home')}
                />
            ) : <CustomerAuthPage onSuccess={handleCustomerAuthSuccess} onBack={handleBackToHome} />;
            case 'chatList': return <ChatListPage 
                onLogout={handleHotelLogout}
                onMenuClick={() => setPage('hotelDashboard')}
                onHomeClick={() => setPage('home')}
                language={language}
                activeChatRoom={activeChatRoom}
                chatBooking={chatBooking}
                currentUserId={
                    loggedInCustomer?.$id || 
                    user?.id || 
                    (isHotelLoggedIn ? 'hotel-user' : (isVillaLoggedIn ? 'villa-user' : 'guest'))
                }
                currentUserName={
                    loggedInCustomer?.name || 
                    user?.name || 
                    (isHotelLoggedIn ? 'Hotel Guest' : (isVillaLoggedIn ? 'Villa Guest' : 'Guest'))
                }
                onCloseChat={() => {
                    setActiveChatRoom(null);
                    setChatBooking(null);
                }}
            />;
            case 'membership': return loggedInProvider ? <MembershipPage onPackageSelect={handleSelectMembershipPackage} onBack={handleBackToProviderDashboard} t={t.membershipPage} /> : <RegistrationChoicePage onSelect={handleSelectRegistration} onBack={handleBackToHome} t={t.registrationChoice}/>;
            case 'booking': return providerForBooking ? <BookingPage provider={providerForBooking.provider} providerType={providerForBooking.type} onBook={handleCreateBooking} onBack={handleBackToHome} bookings={bookings.filter(b => b.providerId === providerForBooking.provider.id)} t={t.bookingPage} /> : <HomePage user={user} loggedInAgent={loggedInAgent} therapists={therapists} places={places} userLocation={userLocation} onSetUserLocation={handleSetUserLocation} onSelectPlace={handleSelectPlace} onLogout={handleLogout} onLoginClick={handleNavigateToAuth} onCreateProfileClick={handleNavigateToRegistrationChoice} onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : handleNavigateToAgentAuth} onBook={handleNavigateToBooking} onQuickBookWithChat={handleQuickBookWithChat} onIncrementAnalytics={handleIncrementAnalytics} onMassageTypesClick={() => setPage('massageTypes')} onHotelPortalClick={handleNavigateToHotelLogin} onVillaPortalClick={handleNavigateToVillaLogin} onTherapistPortalClick={handleNavigateToTherapistLogin} onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin} onAdminPortalClick={handleNavigateToAdminLogin} onBrowseJobsClick={() => setPage('browseJobs')} onEmployerJobPostingClick={() => setPage('employerJobPosting')} onMassageJobsClick={() => setPage('massageJobs')} onTherapistJobsClick={() => setPage('therapistJobs')} onTermsClick={handleNavigateToServiceTerms} onPrivacyClick={handleNavigateToPrivacyPolicy} onNavigate={(page) => setPage(page as Page)} isLoading={isLoading} t={t} />;
            case 'notifications': return loggedInProvider ? <NotificationsPage notifications={notifications.filter(n => n.providerId === loggedInProvider.id)} onMarkAsRead={handleMarkNotificationAsRead} onBack={handleBackToProviderDashboard} t={t.notificationsPage} /> : <GuestAlertsPage onBack={handleBackToHome} onCreateAccount={() => setPage('customerAuth')} t={t} />;
            case 'bookings': return loggedInProvider ? <NotificationsPage notifications={notifications.filter(n => n.providerId === loggedInProvider.id)} onMarkAsRead={handleMarkNotificationAsRead} onBack={handleBackToProviderDashboard} t={t.notificationsPage} /> : <GuestAlertsPage onBack={handleBackToHome} onCreateAccount={() => setPage('customerAuth')} t={t} />;
            case 'massageTypes': return <MassageTypesPage 
                onBack={handleBackToHome}
                onFindTherapists={(massageType) => {
                    setSelectedMassageType(massageType);
                    setPage('home');
                }}
                onFindPlaces={(massageType) => {
                    setSelectedMassageType(massageType);
                    setPage('home');
                }} 
            />;
            case 'hotelLogin': return <HotelLoginPage onSuccess={(_hotelId) => { setIsHotelLoggedIn(true); setPage('hotelDashboard'); }} onBack={handleBackToHome} t={t} />;
            case 'hotelDashboard': return isHotelLoggedIn ? <HotelDashboardPage onLogout={handleHotelLogout} /> : <HotelLoginPage onSuccess={(_hotelId) => { setIsHotelLoggedIn(true); setPage('hotelDashboard'); }} onBack={handleBackToHome} t={t} />;
            case 'villaLogin': return <VillaLoginPage onSuccess={(_villaId) => { setIsVillaLoggedIn(true); setPage('villaDashboard'); }} onBack={handleBackToHome} t={t} />;
            case 'villaDashboard': return isVillaLoggedIn ? <VillaDashboardPage onLogout={handleVillaLogout} /> : <VillaLoginPage onSuccess={(_villaId) => { setIsVillaLoggedIn(true); setPage('villaDashboard'); }} onBack={handleBackToHome} t={t} />;
            case 'massagePlaceLogin': return <MassagePlaceLoginPage onSuccess={(_placeId) => { /* handle massage place login */ }} onBack={handleBackToHome} t={t} />;
            case 'hotelVillaMenu': return <HotelVillaMenuPage venueId={venueMenuId} therapists={therapists} places={places} onBook={handleNavigateToBooking} />;
            case 'employerJobPosting': return <EmployerJobPostingPage onNavigateToPayment={(jobId) => { setJobPostingId(jobId); setPage('jobPostingPayment'); }} />;
            case 'jobPostingPayment': return <JobPostingPaymentPage jobId={jobPostingId} onBack={() => setPage('employerJobPosting')} />;
            case 'browseJobs': return <BrowseJobsPage onBack={handleBackToHome} onPostJob={() => setPage('employerJobPosting')} />;
            case 'massageJobs': return <MassageJobsPage onBack={handleBackToHome} onPostJob={() => setPage('employerJobPosting')} onNavigateToPayment={() => setPage('jobUnlockPayment')} />;
            case 'therapistJobs': return <TherapistJobsPage onBack={handleBackToHome} onRegisterListing={() => setPage('therapistDashboard')} />;
            case 'jobUnlockPayment': return <JobUnlockPaymentPage />;
            case 'adminBankSettings': return <AdminBankSettingsPage />;
            // SEO Pages
            case 'about': return <AboutUsPage onNavigate={(page) => setPage(page as Page)} />;
            case 'how-it-works': return <HowItWorksPage />;
            case 'massage-bali': return <MassageBaliPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog': return <BlogIndexPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/bali-spa-industry-trends-2025': return <BaliSpaIndustryTrends2025Page onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/top-10-massage-techniques': return <Top10MassageTechniquesPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/massage-career-indonesia': return <MassageCareerIndonesiaPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/benefits-regular-massage-therapy': return <BenefitsRegularMassageTherapyPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/hiring-massage-therapists-guide': return <HiringMassageTherapistsGuidePage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/traditional-balinese-massage': return <TraditionalBalineseMassagePage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/spa-tourism-indonesia': return <SpaTourismIndonesiaPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/aromatherapy-massage-oils': return <AromatherapyMassageOilsPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/pricing-guide-massage-therapists': return <PricingGuideMassageTherapistsPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/deep-tissue-vs-swedish-massage': return <DeepTissueVsSwedishMassagePage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/online-presence-massage-therapist': return <OnlinePresenceMassageTherapistPage onNavigate={(page) => setPage(page as Page)} />;
            case 'blog/wellness-tourism-ubud': return <WellnessTourismUbudPage onNavigate={(page) => setPage(page as Page)} />;
            case 'faq': return <FAQPage onNavigate={(page) => setPage(page as Page)} />;
            case 'balinese-massage': return <BalineseMassagePage />;
            case 'deep-tissue-massage': return <DeepTissueMassagePage />;
            case 'contact': return <ContactUsPage onNavigate={(page) => setPage(page as Page)} />;
            case 'quick-support': return <QuickSupportPage onNavigate={(page) => setPage(page as Page)} />;
            case 'partnership-inquiries': return <PartnershipInquiriesPage onNavigate={(page) => setPage(page as Page)} />;
            case 'press-media': return <PressMediaPage onNavigate={(page) => setPage(page as Page)} />;
            case 'career-opportunities': return <CareerOpportunitiesPage onNavigate={(page) => setPage(page as Page)} />;
            case 'therapist-info': return <TherapistInfoPage onNavigate={(page) => setPage(page as Page)} />;
            case 'hotel-info': return <HotelInfoPage onNavigate={(page) => setPage(page as Page)} />;
            case 'employer-info': return <EmployerInfoPage onNavigate={(page) => setPage(page as Page)} />;
            case 'payment-info': return <PaymentInfoPage onNavigate={(page) => setPage(page as Page)} />;
            case 'coin-shop': return <CoinShopPage onNavigate={(page) => setPage(page as Page)} currentUser={loggedInUser ? { id: loggedInUser.id, name: 'User', type: loggedInUser.type as any } : undefined} />;
            case 'admin-shop-management': return <AdminShopManagementPage onNavigate={(page) => setPage(page as Page)} />;
            case 'reward-banners-test': return <RewardBannersTestPage />;
            case 'referral': return <ReferralPage userId={loggedInUser?.id} userCoins={245} onNavigate={(page) => setPage(page as Page)} />;
            case 'coin-history': return <CoinHistoryPage userId={loggedInUser?.id} totalCoins={245} onNavigate={(page) => setPage(page as Page)} />;
            case 'coin-test': return <CoinSystemTestPage />;
            default:
                return providerForBooking ? (
                    <BookingPage
                        provider={providerForBooking.provider}
                        providerType={providerForBooking.type}
                        onBook={handleCreateBooking}
                        onBack={handleBackToHome}
                        bookings={bookings.filter((b) => b.providerId === providerForBooking.provider.id)}
                        t={t.bookingPage}
                    />
                ) : (
                    <HomePage
                        user={user}
                        loggedInAgent={loggedInAgent}
                        therapists={therapists}
                        places={places}
                        userLocation={userLocation}
                        onSetUserLocation={handleSetUserLocation}
                        onSelectPlace={handleSelectPlace}
                        onLogout={handleLogout}
                        onLoginClick={handleNavigateToAuth}
                        onCreateProfileClick={handleNavigateToRegistrationChoice}
                        onAgentPortalClick={loggedInAgent ? () => setPage('agentDashboard') : () => setPage('agent')}
                        onBook={handleNavigateToBooking}
                        onQuickBookWithChat={handleQuickBookWithChat}
                        onIncrementAnalytics={handleIncrementAnalytics}
                        onMassageTypesClick={() => setPage('massageTypes')}
                        onHotelPortalClick={handleNavigateToHotelLogin}
                        onVillaPortalClick={handleNavigateToVillaLogin}
                        onTherapistPortalClick={handleNavigateToTherapistLogin}
                        onMassagePlacePortalClick={handleNavigateToMassagePlaceLogin}
                        onAdminPortalClick={handleNavigateToAdminLogin}
                        onBrowseJobsClick={() => setPage('browseJobs')}
                        onEmployerJobPostingClick={() => setPage('employerJobPosting')}
                        onMassageJobsClick={() => {
                            console.log('🚀 App: Setting page to massageJobs');
                            setPage('massageJobs');
                        }}
                        onTherapistJobsClick={() => {
                            console.log('🚀 App: Setting page to therapistJobs');
                            setPage('therapistJobs');
                        }}
                        onTermsClick={handleNavigateToServiceTerms}
                        onPrivacyClick={handleNavigateToPrivacyPolicy}
                        onNavigate={(page) => setPage(page as Page)}
                        isLoading={isLoading}
                        t={t}
                    />
                );
        }
    };
    
    // Determine user role for footer
    const getUserRole = (): 'user' | 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | null => {
        if (loggedInUser) return loggedInUser.type;
        if (loggedInProvider) return loggedInProvider.type;
        if (isAdminLoggedIn) return 'admin';
        if (isHotelLoggedIn) return 'hotel';
        if (isVillaLoggedIn) return 'villa';
        if (loggedInAgent) return 'agent';
        // Return null for guests without accounts (don't return 'user' here)
        return null;
    };

    // Calculate unread notifications for providers
    const unreadNotifications = loggedInProvider 
        ? notifications.filter(n => n.providerId === loggedInProvider.id && !n.isRead).length 
        : 0;

    // Check for new bookings (bookings in pending status)
    const hasNewBookings = loggedInProvider
        ? bookings.some(b => b.providerId === loggedInProvider.id && b.status === BookingStatus.Pending)
        : false;

    // Check for WhatsApp click notifications
    const hasWhatsAppClick = loggedInProvider
        ? notifications.some(n => n.providerId === loggedInProvider.id && !n.isRead && n.message.includes('WhatsApp'))
        : false;

    // Determine if footer should be shown
    const pagesWithoutFooter = ['landing', 'auth', 'adminLogin', 'unifiedLogin', 'therapistLogin', 'hotelLogin', 'villaLogin', 
                                 'adminAuth', 'therapistLogin', 'placeLogin', 'agentLogin', 'massagePlaceLogin'];
    // Hide footer only when on chatList page with active chat
    const showFooter = !pagesWithoutFooter.includes(page) && !(page === 'chatList' && activeChatRoom);

    // Footer navigation handlers
    const handleFooterHome = () => {
        if (loggedInUser) {
            switch(loggedInUser.type) {
                case 'admin': setPage('adminDashboard'); break;
                case 'hotel': setPage('home'); break; // Hotel users go to therapist directory
                case 'villa': setPage('home'); break; // Villa users go to therapist directory
                case 'agent': setPage('agentDashboard'); break;
            }
        } else if (loggedInProvider) {
            setPage(loggedInProvider.type === 'therapist' ? 'therapistStatus' : 'placeDashboard');
        } else {
            setPage('home');
        }
    };

    const handleFooterDashboard = () => {
        if (loggedInUser) {
            switch(loggedInUser.type) {
                case 'admin': setPage('adminDashboard'); break;
                case 'hotel': setPage('hotelDashboard'); break;
                case 'villa': setPage('villaDashboard'); break;
                case 'agent': setPage('agentDashboard'); break;
            }
        } else if (loggedInProvider) {
            setPage(loggedInProvider.type === 'therapist' ? 'therapistDashboard' : 'placeDashboard');
        }
    };

    const handleFooterProfile = () => {
        if (loggedInProvider) {
            setPage(loggedInProvider.type === 'therapist' ? 'therapistDashboard' : 'placeDashboard');
        } else if (!loggedInUser && !loggedInProvider) {
            // User without account - open drawer to show account options
            const event = new CustomEvent('toggleDrawer');
            window.dispatchEvent(event);
        }
    };

    const handleFooterMenu = () => {
        // Handle menu/settings navigation
        if (loggedInUser?.type === 'hotel' || loggedInUser?.type === 'villa') {
            // Navigate to QR menu builder
            setPage('home'); // Replace with actual QR menu page when created
        } else if (!loggedInUser && !loggedInProvider) {
            // User without account - toggle drawer via event
            const event = new CustomEvent('toggleDrawer');
            window.dispatchEvent(event);
        }
    };

    const handleFooterSearch = () => {
        setPage('home');
    };

    // Pages that need full screen without container
    const fullScreenPages = ['therapistLogin', 'landing', 'therapistStatus', 'hotelLogin', 'villaLogin', 'adminLogin', 'massagePlaceLogin', 'agentLogin'];
    const isFullScreen = fullScreenPages.includes(page);
    
    // Hide FloatingWebsiteButton on login pages and landing page
    const loginPages = ['landing', 'therapistLogin', 'hotelLogin', 'villaLogin', 'adminLogin', 'massagePlaceLogin', 'agentLogin'];
    // Also hide floating button when on chatList page with active chat
    const showFloatingButton = !loginPages.includes(page) && !(page === 'chatList' && activeChatRoom);

    return (
        <div className={isFullScreen ? "min-h-screen flex flex-col" : "max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col"}>
            <div className={isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                {renderPage()}
            </div>
            {showFooter && (
                <Footer 
                    userRole={getUserRole()}
                    currentPage={page}
                    unreadNotifications={unreadNotifications}
                    hasNewBookings={hasNewBookings}
                    hasWhatsAppClick={hasWhatsAppClick}
                    onHomeClick={handleFooterHome}
                    onNotificationsClick={() => setPage('notifications')}
                    onBookingsClick={() => setPage('bookings')}
                    onProfileClick={handleFooterProfile}
                    onDashboardClick={handleFooterDashboard}
                    onMenuClick={handleFooterMenu}
                    onSearchClick={handleFooterSearch}
                    onChatClick={() => {
                        // Check if user is logged in
                        if (!user && !loggedInCustomer && !isHotelLoggedIn && !isVillaLoggedIn) {
                            setRegisterPromptContext('chat');
                            setShowRegisterPrompt(true);
                            return;
                        }
                        
                        // If there's an active chat room, show it
                        if (activeChatRoom && chatBooking) {
                            setIsChatWindowVisible(!isChatWindowVisible);
                            console.log(`📱 Chat button clicked - ${!isChatWindowVisible ? 'Opening' : 'Closing'} chat window`);
                        } else {
                            // Navigate to chat list page
                            setPage('chatList');
                        }
                    }}
                    t={t} 
                />
            )}
            {showFloatingButton && <FloatingWebsiteButton />}
            
            {/* UX Enhancement Components */}
            <CookieConsent 
                language={language}
                hasLocation={userLocation !== null}
                onNavigateToCookiesPolicy={() => setPage('cookies-policy')}
            />
            <WelcomePopup 
                language={language} 
                isAdmin={isAdminLoggedIn}
                isAnyUserLoggedIn={
                    !!loggedInCustomer || 
                    !!loggedInProvider || 
                    !!loggedInAgent || 
                    isHotelLoggedIn || 
                    isVillaLoggedIn || 
                    !!user
                }
            />
            
            {/* Loyalty System Popups */}
            <CoinWelcomePopup 
                isOpen={showWelcomePopup}
                onClose={() => setShowWelcomePopup(false)}
                customerName={loggedInCustomer?.name}
            />
            <WelcomeCoinBonusPopup
                isOpen={showWelcomeCoinPopup}
                onClose={handleCloseWelcomeCoinPopup}
                coinsAwarded={welcomeBonusCoins}
                userName={loggedInCustomer?.name}
            />
            <RegisterPromptPopup
                isOpen={showRegisterPrompt}
                onClose={handleRegisterPromptClose}
                onRegister={handleRegisterPromptRegister}
                language={language}
                context={registerPromptContext}
            />
            <CoinEarnedCelebration 
                event={loyaltyEvent}
                onClose={() => setLoyaltyEvent(null)}
            />

            {/* Booking Chat Window */}
            {activeChatRoom && chatBooking && isChatWindowVisible && (
                <BookingChatWindow
                    chatRoom={activeChatRoom}
                    booking={chatBooking}
                    currentUserId={loggedInCustomer?.$id || user!.id}
                    currentUserType="customer"
                    currentUserName={loggedInCustomer?.name || user!.name}
                    currentUserLanguage={language}
                    onClose={() => {
                        setIsChatWindowVisible(false);
                        console.log('💬 Chat window closed - can be reopened from footer');
                    }}
                />
            )}
        </div>
    );
};

export default App;