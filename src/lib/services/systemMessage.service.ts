/**
 * 🔒 ENTERPRISE SECURITY: System Message Service
 * 
 * Handles sending system messages via backend Appwrite function.
 * Frontend clients cannot send system messages directly - this is correct security.
 */

import { functions } from '../appwrite';

export interface SystemMessageRequest {
    conversationId: string;
    recipientId: string;
    recipientName: string;
    recipientType: 'user' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent' | 'admin';
    content: string;
}

export interface SystemMessageResponse {
    success: boolean;
    messageId?: string;
    createdAt?: string;
    message?: string;
    error?: string;
    code?: string;
}

class SystemMessageService {
    private readonly FUNCTION_ID = 'sendSystemChatMessage';

    /**
     * Send a system message via backend Appwrite function
     */
    async sendSystemMessage(request: SystemMessageRequest): Promise<SystemMessageResponse> {
        try {
            console.log('🔒 [SYSTEM MESSAGE] Sending via backend function:', {
                conversationId: request.conversationId,
                recipientId: request.recipientId,
                recipientType: request.recipientType,
                contentLength: request.content.length
            });

            // Validate request locally first
            const missingFields: string[] = [];
            if (!request.conversationId) missingFields.push('conversationId');
            if (!request.recipientId) missingFields.push('recipientId');
            if (!request.recipientName) missingFields.push('recipientName');
            if (!request.recipientType) missingFields.push('recipientType');
            if (!request.content) missingFields.push('content');

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Call backend function with timeout
            const execution = await functions.createExecution(
                this.FUNCTION_ID,
                JSON.stringify(request),
                false, // not async
                '/sendSystemMessage',
                'POST'
            );

            console.log('📡 [SYSTEM MESSAGE] Function execution completed:', {
                executionId: execution.$id,
                status: execution.status,
                statusCode: execution.statusCode
            });

            // Parse response
            let response: SystemMessageResponse;
            try {
                response = JSON.parse(execution.response);
            } catch (parseError) {
                console.error('❌ [SYSTEM MESSAGE] Failed to parse function response:', execution.response);
                throw new Error(`Invalid function response: ${(parseError as Error).message}`);
            }

            // Check execution status
            if (execution.status !== 'completed') {
                console.error('❌ [SYSTEM MESSAGE] Function execution failed:', {
                    status: execution.status,
                    statusCode: execution.statusCode,
                    stderr: execution.stderr,
                    logs: execution.logs
                });
                throw new Error(`Function execution failed with status: ${execution.status}`);
            }

            // Check function response
            if (!response.success) {
                console.error('❌ [SYSTEM MESSAGE] Backend function returned error:', response);
                throw new Error(response.message || 'Unknown backend error');
            }

            console.log('✅ [SYSTEM MESSAGE] Sent successfully:', {
                messageId: response.messageId,
                createdAt: response.createdAt
            });

            return response;

        } catch (error) {
            console.error('❌ [SYSTEM MESSAGE] Failed to send system message:', error);
            console.error('Request details:', request);
            
            // Provide specific error handling for common issues
            let errorMessage = 'Unknown error occurred';
            let errorCode = 'SYSTEM_MESSAGE_FAILED';
            
            if (error instanceof Error) {
                errorMessage = error.message;
                
                // Handle specific Appwrite errors
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    errorCode = 'FUNCTION_EXECUTION_UNAUTHORIZED';
                    errorMessage = 'Function execution not authorized. Check function permissions.';
                    console.error('🔒 [CRITICAL] Function lacks execute permissions. Required: role:any or role:users');
                } else if (error.message.includes('404') || error.message.includes('not found')) {
                    errorCode = 'FUNCTION_NOT_FOUND';
                    errorMessage = 'Function not deployed or not found';
                } else if (error.message.includes('timeout')) {
                    errorCode = 'FUNCTION_TIMEOUT';
                    errorMessage = 'Function execution timed out';
                }
            }
            
            // Return error response in consistent format
            return {
                success: false,
                error: errorCode,
                message: errorMessage
            };
        }
    }

    /**
     * Send welcome message for chat activation
     */
    async sendWelcomeMessage(
        conversationId: string,
        guestId: string,
        customerName: string,
        welcomeMsg: string
    ): Promise<SystemMessageResponse> {
        return this.sendSystemMessage({
            conversationId,
            recipientId: guestId,
            recipientName: customerName.trim(),
            recipientType: 'user',
            content: welcomeMsg
        });
    }

    /**
     * Send admin copy message
     */
    async sendAdminCopy(
        adminConversationId: string,
        copyMsg: string
    ): Promise<SystemMessageResponse> {
        return this.sendSystemMessage({
            conversationId: adminConversationId,
            recipientId: 'admin',
            recipientName: 'Admin',
            recipientType: 'admin',
            content: copyMsg
        });
    }

    /**
     * Send therapist booking notification
     */
    async sendTherapistNotification(
        therapistConversationId: string,
        therapistId: string,
        therapistName: string,
        notificationMsg: string
    ): Promise<SystemMessageResponse> {
        return this.sendSystemMessage({
            conversationId: therapistConversationId,
            recipientId: therapistId,
            recipientName: therapistName,
            recipientType: 'therapist',
            content: notificationMsg
        });
    }

    /**
     * Send discount lock confirmation message
     */
    async sendDiscountLockConfirmation(
        conversationId: string,
        guestId: string,
        customerName: string,
        lockMsg: string
    ): Promise<SystemMessageResponse> {
        return this.sendSystemMessage({
            conversationId,
            recipientId: guestId,
            recipientName: customerName.trim(),
            recipientType: 'user',
            content: lockMsg
        });
    }
}

// Singleton instance
export const systemMessageService = new SystemMessageService();

// Default export for convenience
export default systemMessageService;