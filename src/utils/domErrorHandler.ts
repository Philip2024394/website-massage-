/**
 * DOM Error Handler for Chrome RemoveChild Issues
 * Provides safe DOM manipulation methods to prevent Chrome removeChild errors
 */

export class DOMErrorHandler {
    static handleRemoveChildError() {
        // Override the native removeChild method to catch and handle errors safely
        const originalRemoveChild = Node.prototype.removeChild;
        
        (Node.prototype.removeChild as any) = function(this: Node, child: Node): Node {
            try {
                // Check if the child is actually a child of this node
                if (this.contains(child)) {
                    return originalRemoveChild.call(this, child);
                } else {
                    console.warn('Attempted to remove a node that is not a child of this node');
                    return child;
                }
            } catch (error) {
                console.warn('DOM removeChild error caught and handled:', error);
                return child;
            }
        };
    }

    static addGlobalErrorHandler() {
        // Add global error handler for uncaught DOM errors
        window.addEventListener('error', (event) => {
            if (event.error && event.error.message && 
                event.error.message.includes('removeChild')) {
                console.warn('RemoveChild error caught globally:', event.error);
                event.preventDefault(); // Prevent the error from being thrown
                return true;
            }
        });

        // Handle unhandled promise rejections that might contain DOM errors
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && 
                event.reason.message.includes('removeChild')) {
                console.warn('RemoveChild promise rejection caught:', event.reason);
                event.preventDefault();
            }
        });
    }

    static initializeForChrome() {
        // Initialize all Chrome-specific DOM error handling
        this.handleRemoveChildError();
        this.addGlobalErrorHandler();
        
        console.log('✅ Chrome DOM error handling initialized');
    }
}

// Auto-initialize if running in Chrome
if (typeof window !== 'undefined' && navigator.userAgent.includes('Chrome')) {
    DOMErrorHandler.initializeForChrome();
}