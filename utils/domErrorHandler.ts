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
                if (child && this.contains(child)) {
                    return originalRemoveChild.call(this, child);
                } else {
                    // Silently handle - this is expected behavior during React updates
                    return child;
                }
            } catch (error) {
                // Silent handling - no console spam
                return child;
            }
        };
    }

    static addGlobalErrorHandler() {
        // Add global error handler for uncaught DOM errors
        window.addEventListener('error', (event) => {
            if (event.error && event.error.message && 
                (event.error.message.includes('removeChild') || 
                 event.error.message.includes('not a child of this node'))) {
                // Silently prevent the error from being thrown
                event.preventDefault();
                event.stopPropagation();
                return true;
            }
        });

        // Handle unhandled promise rejections that might contain DOM errors
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && 
                (event.reason.message.includes('removeChild') ||
                 event.reason.message.includes('not a child of this node'))) {
                event.preventDefault();
            }
        });
    }

    static initializeForChrome() {
        // Initialize all Chrome-specific DOM error handling
        this.handleRemoveChildError();
        this.addGlobalErrorHandler();
        
        console.log('✅ DOM error handling initialized');
    }
}

// Auto-initialize if running in browser (not just Chrome - affects all browsers)
if (typeof window !== 'undefined') {
    DOMErrorHandler.initializeForChrome();
}