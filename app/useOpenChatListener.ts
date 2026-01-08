import { useEffect } from 'react';

/**
 * OpenChat event listener - handles opening booking chat windows
 * Extracted from App.tsx lines 215-275
 */
export function useOpenChatListener(
    setActiveChat: (chat: any) => void,
    setIsChatMinimized?: (minimized: boolean) => void
) {
    useEffect(() => {
        console.log('🔥 MOUNTING openChat EVENT LISTENER');
        
        const handleOpenChat = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            
            console.log('🔥 EVENT LISTENER TRIGGERED - openChat event received');
            console.log('📥 Event detail:', detail);
            console.log('🔥 HAS chatRoomId?:', !!detail?.chatRoomId);
            console.log('🔥 HAS bookingId?:', !!detail?.bookingId);
            
            if (!detail?.chatRoomId) {
                console.error('❌ openChat missing chatRoomId', detail);
                return;
            }
            
            const newActiveChat = {
                chatRoomId: detail.chatRoomId || detail.roomId,
                bookingId: detail.bookingId,
                providerId: detail.providerId || detail.therapistId,
                providerName: detail.providerName || detail.therapistName,
                providerImage: detail.providerImage || detail.providerPhoto || detail.therapistPhoto || null,
                userRole: detail.userRole || "user",
                pricing: detail.pricing || { '60': 150000, '90': 225000, '120': 300000 },
                customerName: detail.customerName,
                customerWhatsApp: detail.customerWhatsApp,
                bookingDate: detail.bookingDate,
                bookingTime: detail.bookingTime,
                serviceDuration: detail.serviceDuration,
                serviceType: detail.serviceType
            };
            
            console.log('🔥 CONSTRUCTED activeChat OBJECT:', newActiveChat);
            console.log('🔥 CALLING setActiveChat NOW...');
            setActiveChat(newActiveChat);
            
            // Auto-open chat window when new chat is created
            if (setIsChatMinimized) {
                console.log('🔥 OPENING CHAT WINDOW - setIsChatMinimized(false)');
                setIsChatMinimized(false);
            }
            
            console.log('🔥 setActiveChat CALLED - WAITING FOR REACT RE-RENDER');
            
            // Update URL to reflect chat state
            const chatRoomId = detail.chatRoomId || detail.roomId;
            const providerName = detail.providerName || detail.therapistName;
            if (chatRoomId && providerName) {
                const slug = providerName.toLowerCase().replace(/\s+/g, '-');
                const chatUrl = `/chat/room/${chatRoomId}/${slug}`;
                window.history.pushState({ chatRoomId }, '', chatUrl);
                console.log('🔗 Updated URL to:', chatUrl);
            }
        };
        
        window.addEventListener("openChat", handleOpenChat);
        console.log('✅ openChat listener mounted successfully');
        return () => {
            console.log('🧹 Cleaning up openChat listener');
            window.removeEventListener("openChat", handleOpenChat);
        };
    }, [setActiveChat, setIsChatMinimized]);

    // Track activeChat state changes
    return null;
}
