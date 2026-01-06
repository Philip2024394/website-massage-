const { Client, Databases, ID } = require('node-appwrite');

/**
 * 🔒 ENTERPRISE SECURITY: Backend System Message Sender
 * 
 * This function sends system chat messages using server-side authentication.
 * Frontend clients are blocked from sending system messages (401 Unauthorized) - this is correct security.
 * Only this backend function with API key can send senderType="system" messages.
 */

module.exports = async ({ req, res, log, error }) => {
    const DATABASE_ID = '68f76ee1000e64ca8d05';
    const COLLECTION_ID = 'chat_messages';

    try {
        // Parse and validate request
        log('📥 System message request received');
        
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        log('📋 Request body:', JSON.stringify(body, null, 2));

        // Validate required fields
        const { conversationId, recipientId, recipientName, recipientType, content } = body;
        
        const missingFields = [];
        if (!conversationId) missingFields.push('conversationId');
        if (!recipientId) missingFields.push('recipientId');
        if (!recipientName) missingFields.push('recipientName');
        if (!recipientType) missingFields.push('recipientType');
        if (!content) missingFields.push('content');
        
        if (missingFields.length > 0) {
            const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
            error('❌ Validation failed:', errorMsg);
            return res.json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: errorMsg
            }, 400);
        }

        // Validate recipientType enum
        const validRecipientTypes = ['user', 'therapist', 'place', 'hotel', 'villa', 'agent', 'admin'];
        if (!validRecipientTypes.includes(recipientType)) {
            const errorMsg = `Invalid recipientType: ${recipientType}. Must be one of: ${validRecipientTypes.join(', ')}`;
            error('❌ Invalid recipientType:', errorMsg);
            return res.json({
                success: false,
                error: 'INVALID_RECIPIENT_TYPE',
                message: errorMsg
            }, 400);
        }

        // Initialize Appwrite client with API key (server-side authentication)
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);

        // Prepare system message document
        const messageDocument = {
            senderId: 'system',
            senderName: 'System', 
            senderType: 'system',
            recipientId: String(recipientId),
            recipientName: String(recipientName),
            recipientType: String(recipientType),
            conversationId: String(conversationId),
            content: String(content),
            createdAt: new Date().toISOString(),
            read: false,
            type: 'text'
        };

        log('💾 Creating system message document:', JSON.stringify(messageDocument, null, 2));

        // Create message document in database
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            messageDocument
        );

        log('✅ System message created successfully:', result.$id);

        return res.json({
            success: true,
            messageId: result.$id,
            createdAt: result.$createdAt,
            message: 'System message sent successfully'
        });

    } catch (err) {
        error('❌ System message creation failed:', err.message);
        error('Stack trace:', err.stack);
        
        // Provide detailed error information for debugging
        const errorResponse = {
            success: false,
            error: 'SYSTEM_MESSAGE_FAILED',
            message: err.message,
            code: err.code || 'UNKNOWN_ERROR'
        };

        // Add more specific error details based on error type
        if (err.message?.includes('Document with the requested ID could not be found')) {
            errorResponse.error = 'COLLECTION_NOT_FOUND';
            errorResponse.message = 'Chat messages collection not found or inaccessible';
        } else if (err.message?.includes('Missing scope')) {
            errorResponse.error = 'INSUFFICIENT_PERMISSIONS';  
            errorResponse.message = 'API key lacks required database write permissions';
        } else if (err.message?.includes('Invalid document structure')) {
            errorResponse.error = 'SCHEMA_VALIDATION_FAILED';
            errorResponse.message = 'Message document does not match collection schema';
        }

        return res.json(errorResponse, 500);
    }
};