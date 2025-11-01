import React from 'react';
import Footer from '../Footer';
import FloatingWebsiteButton from '../FloatingWebsiteButton';
import CookieConsent from '../CookieConsent';
import RegisterPromptPopup from '../RegisterPromptPopup';
import { CoinEarnedCelebration } from '../CoinEarnedCelebration';
import BookingChatWindow from '../BookingChatWindow';
import type { Page, Language } from '../../types/pageTypes';
import type { Booking } from '../../types';

interface AppFooterLayoutProps {
    showFooter: boolean;
    showFloatingButton: boolean;
    page: Page;
    language: Language;
    userLocation: any;
    unreadNotifications: number;
    hasNewBookings: boolean;
    hasWhatsAppClick: boolean;
    isAdminLoggedIn: boolean;
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;
    loggedInUser: any;
    loggedInAgent: any;
    loggedInCustomer: any;
    user: any;
    showRegisterPrompt: boolean;
    registerPromptContext: 'booking' | 'chat';
    loyaltyEvent: any;
    activeChatRoom: any;
    chatBooking: Booking | null;
    isChatWindowVisible: boolean;
    getUserRole: () => 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | 'user' | null;
    handleFooterHome: () => void;
    handleFooterProfile: () => void;
    handleFooterDashboard: () => void;
    handleFooterMenu: () => void;
    handleFooterSearch: () => void;
    handleRegisterPromptClose: () => void;
    handleRegisterPromptRegister: () => void;
    setPage: (page: Page) => void;
    setAdminDashboardTab: (tab: any) => void;
    setRegisterPromptContext: (context: any) => void;
    setShowRegisterPrompt: (show: boolean) => void;
    setLoyaltyEvent: (event: any) => void;
    setIsChatWindowVisible: (visible: boolean) => void;
    t: any;
}

export const AppFooterLayout: React.FC<AppFooterLayoutProps> = ({
    showFooter,
    showFloatingButton,
    page,
    language,
    userLocation,
    unreadNotifications,
    hasNewBookings,
    hasWhatsAppClick,
    isAdminLoggedIn,
    isHotelLoggedIn,
    isVillaLoggedIn,
    loggedInUser,
    loggedInAgent,
    loggedInCustomer,
    user,
    showRegisterPrompt,
    registerPromptContext,
    loyaltyEvent,
    activeChatRoom,
    chatBooking,
    isChatWindowVisible,
    getUserRole,
    handleFooterHome,
    handleFooterProfile,
    handleFooterDashboard,
    handleFooterMenu,
    handleFooterSearch,
    handleRegisterPromptClose,
    handleRegisterPromptRegister,
    setPage,
    setAdminDashboardTab,
    setRegisterPromptContext,
    setShowRegisterPrompt,
    setLoyaltyEvent,
    setIsChatWindowVisible,
    t
}) => {
    return (
        <>
            {showFooter && (
                <Footer 
                    userRole={getUserRole()}
                    currentPage={page}
                    unreadNotifications={unreadNotifications}
                    hasNewBookings={hasNewBookings}
                    hasWhatsAppClick={hasWhatsAppClick}
                    onHomeClick={handleFooterHome}
                    onNotificationsClick={() => {
                        // Admin check first
                        if (isAdminLoggedIn || loggedInUser?.type === 'admin') {
                            setPage('notifications');
                            return;
                        }
                        
                        // All other users go to notifications
                        setPage('notifications');
                    }}
                    onBookingsClick={() => setPage('bookings')}
                    onProfileClick={handleFooterProfile}
                    onDashboardClick={handleFooterDashboard}
                    onMenuClick={handleFooterMenu}
                    onSearchClick={handleFooterSearch}
                    onChatClick={() => {
                        console.log('🔍 Chat clicked - Admin check:', { isAdminLoggedIn, loggedInUserType: loggedInUser?.type });
                        
                        // Admin chat goes to chat messages page (admin dashboard)
                        if (isAdminLoggedIn || loggedInUser?.type === 'admin') {
                            console.log('✅ Admin detected - navigating to chat-messages');
                            setAdminDashboardTab('chat-messages');
                            setPage('adminDashboard');
                            return;
                        }
                        
                        // Hotel chat goes to their dashboard chat tab
                        if (loggedInUser?.type === 'hotel' || isHotelLoggedIn) {
                            setPage('hotelDashboard');
                            return;
                        }
                        
                        // Villa chat goes to their dashboard chat tab
                        if (loggedInUser?.type === 'villa' || isVillaLoggedIn) {
                            setPage('villaDashboard');
                            return;
                        }
                        
                        // Agent chat goes to their dashboard messages tab
                        if (loggedInUser?.type === 'agent' || loggedInAgent) {
                            setPage('agentDashboard');
                            return;
                        }
                        
                        // Regular users and customers with booking chats
                        if (user || loggedInCustomer) {
                            // Always navigate to chat list page to show all conversations
                            setPage('chatList');
                            console.log('📱 Opening chat list for user');
                            return;
                        }
                        
                        // Only show register prompt if NO user is logged in at all
                        console.log('⚠️ No logged in user detected - showing register prompt');
                        setRegisterPromptContext('chat');
                        setShowRegisterPrompt(true);
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
        </>
    );
};
