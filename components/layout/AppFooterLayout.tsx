import React from 'react';
import GlobalFooter from '../GlobalFooter';
import FloatingWebsiteButton from '../FloatingWebsiteButton';
import CookieConsent from '../CookieConsent';
import RegisterPromptPopup from '../RegisterPromptPopup';
import { CoinEarnedCelebration } from '../CoinEarnedCelebration';
// Removed chat import - chat system removed
// import BookingChatWindow from '../BookingChatWindow';
import type { Page, Language } from '../../types/pageTypes';

interface AppFooterLayoutProps {
    showFooter: boolean;
    showFloatingButton: boolean;
    page: Page;
    language: Language;
    userLocation: any;
    unreadNotifications: number;
    hasNewBookings: boolean;
    showRegisterPrompt: boolean;
    registerPromptContext: 'booking' | 'chat';
    loyaltyEvent: any;
    getUserRole: () => 'therapist' | 'place' | 'admin' | 'hotel' | 'villa' | 'agent' | 'user' | null;
    handleRegisterPromptClose: () => void;
    handleRegisterPromptRegister: () => void;
    setPage: (page: Page) => void;
    setLoyaltyEvent: (event: any) => void;
    t: (key: string) => string;
}

export const AppFooterLayout: React.FC<AppFooterLayoutProps> = ({
    showFooter,
    showFloatingButton,
    page,
    language,
    userLocation,
    unreadNotifications,
    hasNewBookings,
    showRegisterPrompt,
    registerPromptContext,
    loyaltyEvent,
    getUserRole,
    handleRegisterPromptClose,
    handleRegisterPromptRegister,
    setPage,
    setLoyaltyEvent,
    t
}) => {
    return (
        <>
            {showFooter && (
                <GlobalFooter 
                    currentPage={page}
                    onNavigate={(targetPage: string) => {
                        console.log('� Global footer navigation:', targetPage);
                        setPage(targetPage as Page);
                    }}
                    userRole={getUserRole()}
                    unreadNotifications={unreadNotifications}
                    hasNewBookings={hasNewBookings}
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

            {/* Chat system removed - using WhatsApp booking instead */}
            {/* Booking Chat Window - Removed
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
            */}
        </>
    );
};
