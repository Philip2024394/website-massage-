# 🔧 IMMEDIATE INTEGRATION CODE

## Copy-Paste Ready Code for ChatWindow.tsx

### 1. Add at TOP of file (line 2):
```typescript
import { simpleChatService, simpleBookingService } from '@shared/appwriteService';
```

### 2. Replace ENTIRE `loadMessages` function (around line 115):
```typescript
const loadMessages = async () => {
    try {
        const conversationId = `customer_${customerId}_therapist_${providerId}`;
        
        // Try to fetch from database first
        const dbMessages = await simpleChatService.getMessages(conversationId);
        
        if (dbMessages.length > 0) {
            // Use database messages
            const formatted = dbMessages.map(msg => ({
                $id: msg.$id || Date.now().toString(),
                $createdAt: msg.$createdAt || new Date().toISOString(),
                senderId: msg.senderId,
                senderName: msg.senderName,
                message: msg.message,
                messageType: msg.messageType as any,
                isRead: msg.isRead,
                countdown: msg.messageType === 'auto-reply' ? 300 : undefined,
                statusType: JSON.parse(msg.metadata || '{}').statusType,
                showActions: JSON.parse(msg.metadata || '{}').showActions
            }));
            setMessages(formatted);
        } else {
            // First time - create booking messages
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `Booking request created:\n📅 ${bookingDetails?.date || new Date().toLocaleString()}\n⏱️ Duration: ${bookingDetails?.duration || 60} minutes\n💰 Price: Rp ${bookingDetails?.price?.toLocaleString() || '0'}\n📍 ${providerRole === 'therapist' ? 'Home/Hotel Service' : 'Visit Location'}`,
                messageType: 'booking',
                bookingId
            });

            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'Auto Reply',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `${providerName} has received your booking requirement and will reply within 5 minutes`,
                messageType: 'auto-reply',
                bookingId,
                metadata: { countdown: 300 }
            });
        }

        // Subscribe to real-time updates
        const unsubscribe = simpleChatService.subscribeToMessages(conversationId, (newMsg) => {
            setMessages(prev => {
                const exists = prev.some(m => m.$id === newMsg.$id);
                if (!exists) {
                    return [...prev, {
                        $id: newMsg.$id || '',
                        $createdAt: newMsg.$createdAt || new Date().toISOString(),
                        senderId: newMsg.senderId,
                        senderName: newMsg.senderName,
                        message: newMsg.message,
                        messageType: newMsg.messageType as any,
                        isRead: newMsg.isRead
                    }];
                }
                return prev;
            });
        });

        // Cleanup on unmount
        return () => unsubscribe();

    } catch (error) {
        console.error('Error loading messages:', error);
    }
};
```

### 3. Find `handleCountdownExpiry` (around line 150) and UPDATE:
```typescript
const handleCountdownExpiry = async () => {
    try {
        const conversationId = `customer_${customerId}_therapist_${providerId}`;
        
        // Send fallback message
        await simpleChatService.sendMessage({
            conversationId,
            senderId: 'system',
            senderName: 'System',
            senderRole: 'admin',
            receiverId: customerId,
            receiverName: customerName,
            receiverRole: 'customer',
            message: `${providerName} is currently booked.\n\n🔍 We are searching for the next best match therapist for you.\n\n✨ You will be notified once we find an available therapist.`,
            messageType: 'fallback',
            bookingId,
            metadata: { showActions: true }
        });

        // Notify admin about alternative search needed
        await simpleBookingService.notifyAdmin(
            `Alternative therapist search needed for booking ${bookingId}`,
            { customerId, therapistId: providerId, bookingId }
        );

        console.log('⏰ Countdown expired - alternative search initiated');
    } catch (error) {
        console.error('Error handling countdown expiry:', error);
    }
};
```

### 4. Find `handleCancelBooking` (around line 185) and UPDATE:
```typescript
const handleCancelBooking = async () => {
    try {
        const conversationId = `customer_${customerId}_therapist_${providerId}`;
        
        // Update booking status in database
        if (bookingId) {
            await simpleBookingService.updateStatus(bookingId, 'cancelled');
        }

        // Send cancelled status message
        await simpleChatService.sendMessage({
            conversationId,
            senderId: 'system',
            senderName: 'System',
            senderRole: 'admin',
            receiverId: customerId,
            receiverName: customerName,
            receiverRole: 'customer',
            message: '❌ Booking cancelled. You will be redirected to browse other therapists.',
            messageType: 'status-update',
            bookingId,
            metadata: { statusType: 'cancelled' }
        });

        // Notify admin
        await simpleBookingService.notifyAdmin(
            `Customer cancelled booking ${bookingId}`,
            { customerId, therapistId: providerId, reason: 'Customer chose to browse directory' }
        );

        // Close chat and redirect
        setTimeout(() => {
            onClose();
            window.location.href = '/therapists';
        }, 2000);

    } catch (error) {
        console.error('Error cancelling booking:', error);
    }
};
```

### 5. Find the main `sendMessage` function (around line 240) and REPLACE with:
```typescript
const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const originalText = newMessage;
    setNewMessage(''); // Clear immediately for better UX

    try {
        const conversationId = `customer_${customerId}_therapist_${providerId}`;
        
        // Show translation notice if needed
        if (userLanguage !== 'id' && !translationNoticeShown) {
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `🌐 Auto-translation is enabled.\n\nMessages are being translated between ${LANGUAGES.find(l => l.code === userLanguage)?.name} and Bahasa Indonesia.\n\n⚠️ Please note: Translations may have slight inaccuracies. We use Google Translate to help bridge language differences.`,
                messageType: 'system'
            });
            setTranslationNoticeShown(true);
        }

        // Translate if needed
        let translatedText = originalText;
        if (userLanguage !== 'id') {
            translatedText = await translateText(originalText, userLanguage, 'id');
        }

        // Save message to database
        await simpleChatService.sendMessage({
            conversationId,
            senderId: providerId,
            senderName: providerName,
            senderRole: providerRole as 'therapist',
            receiverId: customerId,
            receiverName: customerName,
            receiverRole: 'customer',
            message: translatedText,
            messageType: 'text',
            bookingId,
            metadata: {
                originalText,
                translatedText,
                userLanguage
            }
        });

        console.log('✅ Message sent and saved to database');

    } catch (error) {
        console.error('Error sending message:', error);
        setNewMessage(originalText); // Restore on error
    } finally {
        setSending(false);
    }
};
```

---

## ✅ THAT'S IT!

After making these 5 changes, your chat will:
- ✅ Save all messages to database
- ✅ Load messages from database on refresh
- ✅ Show messages in real-time
- ✅ Notify admin about events
- ✅ Handle countdown expiry with alternative search
- ✅ Support translations
- ✅ Persist across page reloads

**Test by:**
1. Open chat
2. Send a message
3. Refresh page
4. Message still there! ✅
