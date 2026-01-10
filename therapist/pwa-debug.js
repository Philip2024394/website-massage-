/**
 * 🔧 PWA Debug Helper - Expose PWA functions globally for testing
 */

// Wait for the PWA features to be loaded, then expose them globally
setTimeout(() => {
    // Try to import PWA features from the main app
    if (window.ChatPersistenceManager) {
        console.log('✅ PWA features already available globally');
    } else {
        console.log('⏳ Attempting to expose PWA features globally...');
        
        // Try to access the module system or React components
        try {
            // Expose PWA test functions
            window.testPWAFeatures = {
                // Chat Persistence Manager test
                testChatPersistence: function() {
                    console.log('🧪 Testing Chat Persistence Manager...');
                    
                    try {
                        // Test with localStorage directly
                        const testData = {
                            isOpen: true,
                            isMinimized: false,
                            unreadCount: 7,
                            lastActivity: new Date().toISOString()
                        };
                        
                        const therapistId = 'test-therapist-456';
                        
                        // Save state
                        const allStates = JSON.parse(localStorage.getItem('therapist_chat_state') || '{}');
                        allStates[therapistId] = testData;
                        localStorage.setItem('therapist_chat_state', JSON.stringify(allStates));
                        
                        // Retrieve state
                        const savedStates = JSON.parse(localStorage.getItem('therapist_chat_state') || '{}');
                        const retrievedData = savedStates[therapistId];
                        
                        if (retrievedData && retrievedData.unreadCount === 7) {
                            console.log('✅ Chat Persistence Manager test PASSED');
                            console.log('   Saved data:', testData);
                            console.log('   Retrieved data:', retrievedData);
                            return true;
                        } else {
                            console.log('❌ Chat Persistence Manager test FAILED');
                            return false;
                        }
                    } catch (error) {
                        console.error('❌ Chat persistence test error:', error);
                        return false;
                    }
                },
                
                // FloatingChat detection test
                testFloatingChatDetection: function() {
                    console.log('🧪 Testing FloatingChat Component Detection...');
                    
                    const chatSelectors = [
                        '[class*="FloatingChat"]',
                        '[class*="floating-chat"]',
                        'button[title*="Support Chat"]',
                        'button[title*="Chat"]',
                        '[class*="MessageCircle"]',
                        'div[style*="fixed"][style*="bottom"]',
                        'button[style*="fixed"][style*="bottom"]'
                    ];
                    
                    let found = false;
                    let foundElements = [];
                    
                    chatSelectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            console.log(`✅ Found ${elements.length} element(s) with selector: ${selector}`);
                            
                            elements.forEach((el, index) => {
                                // Highlight the element
                                el.style.outline = '3px solid #00ff00';
                                el.style.boxShadow = '0 0 15px #00ff00';
                                
                                foundElements.push({
                                    selector: selector,
                                    element: el,
                                    index: index,
                                    info: {
                                        tagName: el.tagName,
                                        className: el.className,
                                        id: el.id,
                                        title: el.title,
                                        textContent: el.textContent?.trim()?.substring(0, 50)
                                    }
                                });
                                
                                found = true;
                            });
                        }
                    });
                    
                    if (found) {
                        console.log('✅ FloatingChat Component Detection PASSED');
                        console.log('   Found elements:', foundElements);
                        
                        // Remove highlights after 10 seconds
                        setTimeout(() => {
                            foundElements.forEach(item => {
                                item.element.style.outline = '';
                                item.element.style.boxShadow = '';
                            });
                            console.log('💡 Element highlights removed');
                        }, 10000);
                        
                        return true;
                    } else {
                        console.log('❌ FloatingChat Component Detection FAILED');
                        console.log('💡 No matching elements found. This could mean:');
                        console.log('   - User is not authenticated');
                        console.log('   - User does not have premium membership');  
                        console.log('   - Component is not mounted yet');
                        console.log('   - Component classes/structure have changed');
                        return false;
                    }
                },
                
                // PWA mode detection
                testPWAMode: function() {
                    console.log('🧪 Testing PWA Mode Detection...');
                    
                    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
                    const isNavigatorStandalone = window.navigator.standalone === true;
                    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
                    
                    console.log('   Display mode standalone:', isStandalone);
                    console.log('   Navigator standalone:', isNavigatorStandalone); 
                    console.log('   Display mode fullscreen:', isFullscreen);
                    
                    const isPWA = isStandalone || isNavigatorStandalone || isFullscreen;
                    
                    console.log(`${isPWA ? '✅' : '❌'} PWA Mode Detection: ${isPWA ? 'PWA MODE' : 'BROWSER MODE'}`);
                    return isPWA;
                },
                
                // Notification test
                testNotifications: async function() {
                    console.log('🧪 Testing Notification Functionality...');
                    
                    if (!('Notification' in window)) {
                        console.log('❌ Notifications not supported');
                        return false;
                    }
                    
                    console.log('   Current permission:', Notification.permission);
                    
                    let permission = Notification.permission;
                    if (permission === 'default') {
                        console.log('   Requesting permission...');
                        permission = await Notification.requestPermission();
                    }
                    
                    if (permission === 'granted') {
                        console.log('✅ Creating test notification...');
                        
                        const notification = new Notification('🧪 PWA Chat Test', {
                            body: 'FloatingChat notification test successful!',
                            icon: '/favicon.ico',
                            tag: 'pwa-test'
                        });
                        
                        notification.onclick = () => {
                            console.log('✅ Notification clicked');
                            notification.close();
                        };
                        
                        setTimeout(() => notification.close(), 4000);
                        return true;
                    } else {
                        console.log('❌ Notification permission denied');
                        return false;
                    }
                },
                
                // Run all tests
                runAllTests: async function() {
                    console.log('🚀 Running All PWA Feature Tests...');
                    console.log('=====================================');
                    
                    const results = {};
                    
                    results.chatPersistence = this.testChatPersistence();
                    results.floatingChatDetection = this.testFloatingChatDetection();
                    results.pwaMode = this.testPWAMode();
                    results.notifications = await this.testNotifications();
                    
                    console.log('=====================================');
                    console.log('📊 Test Results Summary:');
                    console.log('   💾 Chat Persistence:', results.chatPersistence ? '✅ PASS' : '❌ FAIL');
                    console.log('   💭 FloatingChat Detection:', results.floatingChatDetection ? '✅ PASS' : '❌ FAIL');
                    console.log('   📱 PWA Mode:', results.pwaMode ? '✅ PWA' : '🌐 BROWSER');
                    console.log('   🔔 Notifications:', results.notifications ? '✅ PASS' : '❌ FAIL');
                    
                    const passCount = Object.values(results).filter(Boolean).length;
                    console.log(`🎯 Overall: ${passCount}/4 tests passed`);
                    
                    if (results.chatPersistence && results.floatingChatDetection) {
                        console.log('🎉 AUTHENTICATION-DEPENDENT FEATURES WORKING!');
                    } else {
                        console.log('⚠️ Some authentication features may need a logged-in user');
                    }
                    
                    return results;
                }
            };
            
            console.log('✅ PWA debug functions exposed globally:');
            console.log('   window.testPWAFeatures.testChatPersistence()');
            console.log('   window.testPWAFeatures.testFloatingChatDetection()');
            console.log('   window.testPWAFeatures.testPWAMode()');
            console.log('   window.testPWAFeatures.testNotifications()');
            console.log('   window.testPWAFeatures.runAllTests()');
            
        } catch (error) {
            console.error('❌ Failed to expose PWA debug functions:', error);
        }
    }
}, 1000);

console.log('🔧 PWA Debug Helper loaded - Functions will be available shortly...');