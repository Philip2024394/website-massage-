

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
            
            console.log('?? HomePage: Fetched therapists:', therapistsData?.length);
            therapistsData?.forEach((t: any) => {
                console.log(`  ?? ${t.name}:`, {
                    mainImage: t.mainImage?.substring(0, 60) + '...',
                    profilePicture: t.profilePicture?.substring(0, 60) + '...',
                    isLive: t.isLive,
                    id: t.id || t.$id
                });
            });
            
            const liveTherapists = therapistsData?.filter((t: any) => t.isLive === true);
            console.log('? Live therapists count:', liveTherapists?.length);
            
            setTherapists(therapistsData || []);
            setPlaces(placesData || []);
        } catch (error) {
            console.error('Error fetching public data:', error);
            console.warn('?? Continuing with empty data - check Appwrite configuration');
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
            console.log('?? Initializing app...');
            
            try {
                // Check if user explicitly wants to start fresh (from landing page)
                const startFresh = sessionStorage.getItem('start_fresh');
                
                // Only restore session if not starting fresh
                if (!startFresh) {
                    // Restore session if exists
                    const sessionUser = await restoreSession();
                    
                    if (sessionUser) {
                        console.log('? Restoring session for:', sessionUser.type);
                        
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
                        console.log('?? No session to restore, starting fresh');
                    }
                } else {
                    console.log('?? Starting fresh - clearing any existing sessions');
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
                    console.log('?? App: Playing notification sound from service worker:', soundUrl);
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
            console.log('? Logout successful');
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
                    console.log('?? New user detected! Awarding welcome bonus...');
                    
                    const bonusResult = await awardWelcomeBonus(
                        customer.$id || customer.userId,
                        'customer',
                        eligibility.deviceId,
                        eligibility.ipAddress
                    );
                    
                    if (bonusResult.success) {
                        console.log('? Welcome bonus awarded:', bonusResult.coinsAwarded);
                        setWelcomeBonusCoins(bonusResult.coinsAwarded);
                        
                        // Show popup after a short delay
                        setTimeout(() => {
                            setShowWelcomeCoinPopup(true);
                        }, 1000);
                    } else {
                        console.log('? Welcome bonus not awarded:', bonusResult.message);
                    }
                } else {
                    console.log('?? User not eligible for welcome bonus:', eligibility.reason);
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
        
        console.log('? Customer logged in:', customer);
    };
    
    const handleCustomerLogout = async () => {
        await sessionLogout();
        setLoggedInCustomer(null);
        setPage('home');
        console.log('? Customer logout successful');
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
        console.log('? Hotel logout successful');
    };
    
    const handleVillaLogout = async () => {
        await sessionLogout();
        setIsVillaLoggedIn(false);
        _setLoggedInUser(null);
        setPage('home');
        console.log('? Villa logout successful');
    };
    
    const handleAdminLogout = async () => {
        // Logout from Appwrite and clear session
        await sessionLogout();
        
        setIsAdminLoggedIn(false);
        setImpersonatedAgent(null);
        setPage('home');
        console.log('? Admin logout successful');
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
            console.log('?? Saving therapist profile with profilePicture:', profilePicture);
            console.log('?? ProfilePicture length:', profilePicture.length);
            
            if (profilePicture.length > 512) {
                alert('Profile picture URL is too long. Please use a shorter URL or upload the image to a hosting service.');
                return;
            }
            
            // First, try to fetch existing therapist data
            let existingTherapist: any = null;
            try {
                existingTherapist = await therapistService.getById(therapistId);
                console.log('?? Found existing therapist profile:', existingTherapist);
            } catch (error) {
                console.log('?? No existing profile found, will create new one');
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

            console.log(' Saving therapist data:', {
                name: updateData.name,
                profilePicture: updateData.profilePicture?.substring(0, 50) + '...',
                mainImage: updateData.mainImage?.substring(0, 50) + '...',
                location: updateData.location
            });

            // If profile exists, preserve important fields that shouldn't be overwritten
            if (existingTherapist) {
                updateData.email = existingTherapist.email;
                updateData.createdAt = existingTherapist.createdAt;
            }

            await therapistService.update(therapistId, updateData);
            
            // Update local state
            setTherapists(prev => prev.map(t => 
                t.id === therapistId ? { ...t, ...therapistData } : t
            ));
            
            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving therapist profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    };

    // Hide footer only when on chatList page with active chat
    const showFooter = !pagesWithoutFooter.includes(page) && !(page === 'chatList' && activeChatRoom);

    return (
        <div className={isFullScreen ? "min-h-screen flex flex-col" : "max-w-md mx-auto min-h-screen bg-white shadow-lg flex flex-col"}>
            <div className={isFullScreen ? "flex-grow" : "flex-grow pb-16"}>
                <AppRouter
                    page={page}
                    language={language}
                    t={t}
                    isLoading={isLoading}
                    loggedInUser={loggedInUser}
                    loggedInProvider={loggedInProvider}
                    loggedInCustomer={loggedInCustomer}
                    loggedInAgent={loggedInAgent}
                    isAdminLoggedIn={isAdminLoggedIn}
                    isHotelLoggedIn={isHotelLoggedIn}
                    adminDashboardTab={adminDashboardTab}
                    adminMessages={adminMessages}
                    therapists={therapists}
                    places={places}
                    massageTypes={massageTypes}
                    selectedTherapist={selectedTherapist}
                    selectedPlace={selectedPlace}
                    selectedMassageType={selectedMassageType}
                    providerForBooking={providerForBooking}
                    notifications={notifications}
                    bookings={bookings}
                    activeChatRoom={activeChatRoom}
                    chatMessages={chatMessages}
                    unreadMessagesCount={unreadMessagesCount}
                    providerAuthInfo={providerAuthInfo}
                    registrationType={registrationType}
                    selectedMembershipPackage={selectedMembershipPackage}
                    hotelsAndVillas={hotelsAndVillas}
                    jobPostings={jobPostings}
                    onSetPage={setPage}
                    onSetLanguage={setLanguage}
                    onBackToHome={handleBackToHome}
                    onNavigateToBooking={handleNavigateToBooking}
                    onNavigateToTherapistAuth={handleNavigateToTherapistAuth}
                    onNavigateToAgentAuth={handleNavigateToAgentAuth}
                    onIncrementAnalytics={handleIncrementAnalytics}
                    onAdminLogin={handleAdminLogin}
                    onAdminLogout={handleAdminLogout}
                    onProviderLogin={handleProviderLogin}
                    onProviderRegister={handleProviderRegister}
                    onProviderLogout={handleProviderLogout}
                    onCustomerAuthSuccess={handleCustomerAuthSuccess}
                    onCustomerLogout={handleCustomerLogout}
                    onAgentRegister={handleAgentRegister}
                    onAgentLogin={handleAgentLogin}
                    onAgentLogout={handleAgentLogout}
                    onAgentAcceptTerms={handleAgentAcceptTerms}
                    onHotelLogout={handleHotelLogout}
                    onSelectRegistration={handleSelectRegistration}
                    onBackToProviderDashboard={handleBackToProviderDashboard}
                    onNavigateToTherapistDashboard={handleNavigateToTherapistDashboard}
                    onTherapistStatusChange={handleTherapistStatusChange}
                    onSaveTherapistProfile={handleSaveTherapistProfile}
                    onSavePlaceProfile={handleSavePlaceProfile}
                    onSaveAgentProfile={handleSaveAgentProfile}
                    onSelectMembershipPackage={handleSelectMembershipPackage}
                    onSelectMembershipCheckout={handleSelectMembershipCheckout}
                    onCreateBooking={handleCreateBooking}
                    onMarkNotificationAsRead={handleMarkNotificationAsRead}
                    onSendAdminMessage={handleSendAdminMessage}
                    onStartImpersonating={handleStartImpersonating}
                    onStopImpersonating={handleStopImpersonating}
                    onMarkMessagesAsRead={handleMarkMessagesAsRead}
                    onUpdateJobPosting={handleUpdateJobPosting}
                    onDeleteJobPosting={handleDeleteJobPosting}
                />
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
                            console.log(`?? Chat button clicked - ${!isChatWindowVisible ? 'Opening' : 'Closing'} chat window`);
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
                        console.log('?? Chat window closed - can be reopened from footer');
                    }}
                />
            )}
        </div>
    );
};

export default App;

