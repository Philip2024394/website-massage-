/**
 * 🔒 PRODUCTION STARTUP GUARD
 * Ensures the application mounts successfully within 2 seconds
 * 
 * CRITICAL: Detects mount failures and provides clear error messaging
 */

export function initializeStartupGuard() {
    const startTime = Date.now();
    const buildHash = import.meta.env.VITE_BUILD_HASH || Date.now().toString();
    const isDev = import.meta.env.DEV;
    
    console.log('🚀 VITE SERVER ACTIVE — BUILD HASH:', buildHash);
    console.log('📊 Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
    console.log('🌐 Mode:', import.meta.env.MODE);
    
    // Set up mount detection
    let appMounted = false;
    
    // App should signal mount by setting this flag
    (window as any).__APP_MOUNTED__ = () => {
        appMounted = true;
        const mountTime = Date.now() - startTime;
        console.log(`✅ App mounted successfully in ${mountTime}ms`);
        
        if (mountTime > 1000) {
            console.warn(`⚠️ Slow mount detected: ${mountTime}ms (target: <1000ms)`);
        }
    };
    
    // Check mount status after 2 seconds
    setTimeout(() => {
        if (!appMounted) {
            const errorDetails = {
                buildHash,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                mountTime: Date.now() - startTime
            };
            
            console.error('🔴 HARD ERROR: App did not mount within 2 seconds');
            console.error('Error details:', errorDetails);
            
            // Show user-friendly error
            if (document.body) {
                document.body.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        font-family: system-ui, -apple-system, sans-serif;
                        padding: 20px;
                    ">
                        <div style="
                            background: white;
                            border-radius: 16px;
                            padding: 40px;
                            max-width: 500px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        ">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="
                                    width: 80px;
                                    height: 80px;
                                    margin: 0 auto 16px;
                                    background: #fee;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    <svg width="48" height="48" fill="none" stroke="#c00" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h1 style="
                                    font-size: 24px;
                                    font-weight: 700;
                                    color: #111;
                                    margin: 0 0 12px;
                                ">Application Failed to Start</h1>
                                <p style="
                                    color: #666;
                                    margin: 0 0 24px;
                                    line-height: 1.6;
                                ">
                                    The application did not mount within the expected time.
                                    This usually indicates a JavaScript error or network issue.
                                </p>
                            </div>
                            
                            <div style="
                                background: #f7f7f7;
                                border-radius: 8px;
                                padding: 16px;
                                margin-bottom: 24px;
                                font-size: 12px;
                                color: #666;
                            ">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Build:</span>
                                    <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                                        ${buildHash.substring(0, 8)}
                                    </code>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Time:</span>
                                    <span>${new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                            
                            <button
                                onclick="location.reload()"
                                style="
                                    width: 100%;
                                    background: #f97316;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    padding: 14px 24px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: background 0.2s;
                                "
                                onmouseover="this.style.background='#ea580c'"
                                onmouseout="this.style.background='#f97316'"
                            >
                                Reload Page
                            </button>
                            
                            ${isDev ? `
                                <div style="
                                    margin-top: 16px;
                                    padding: 12px;
                                    background: #fef3c7;
                                    border-left: 4px solid #f59e0b;
                                    border-radius: 4px;
                                    font-size: 12px;
                                    color: #92400e;
                                ">
                                    <strong>Dev Mode:</strong> Check console for detailed error logs
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        }
    }, 2000);
    
    // Log resource loading stats
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            console.log('📊 Performance Metrics:');
            console.log(`  - DOM Ready: ${domReady}ms`);
            console.log(`  - Page Load: ${loadTime}ms`);
            console.log(`  - Build Hash: ${buildHash}`);
        });
    }
}
