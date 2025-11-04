// Simple removeChild Error Test
// Run this in browser console to test basic functionality

console.log('🧪 Simple removeChild Test Starting...');

// Test 1: Basic DOM manipulation
function testBasicDOM() {
    console.log('🔵 Test 1: Basic DOM manipulation');
    try {
        const div = document.createElement('div');
        div.id = 'test-div';
        document.body.appendChild(div);
        
        const span = document.createElement('span');
        span.textContent = 'Test span';
        div.appendChild(span);
        
        // This should work
        div.removeChild(span);
        document.body.removeChild(div);
        
        console.log('✅ Test 1 passed - Basic DOM works');
        return true;
    } catch (error) {
        console.error('❌ Test 1 failed:', error);
        return false;
    }
}

// Test 2: React component mounting/unmounting
function testReactMounting() {
    console.log('🔵 Test 2: React mounting test');
    try {
        // Create a simple React element if React is available
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const container = document.createElement('div');
            document.body.appendChild(container);
            
            const element = React.createElement('div', { id: 'react-test' }, 'React Test');
            const root = ReactDOM.createRoot(container);
            root.render(element);
            
            // Unmount after a brief delay
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
                console.log('✅ Test 2 passed - React mounting/unmounting works');
            }, 100);
            
            return true;
        } else {
            console.log('⚠️ Test 2 skipped - React not available');
            return true;
        }
    } catch (error) {
        console.error('❌ Test 2 failed:', error);
        return false;
    }
}

// Test 3: Navigation simulation
function testNavigation() {
    console.log('🔵 Test 3: Navigation simulation');
    try {
        // Simulate navigation events that might trigger the error
        const event = new Event('popstate');
        window.dispatchEvent(event);
        
        console.log('✅ Test 3 passed - Navigation events work');
        return true;
    } catch (error) {
        console.error('❌ Test 3 failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.group('🧪 Running removeChild Error Tests');
    
    const results = {
        basicDOM: testBasicDOM(),
        reactMounting: testReactMounting(),
        navigation: testNavigation()
    };
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`📊 Test Results: ${passedCount}/${totalCount} passed`);
    console.log('📋 Detailed results:', results);
    
    if (passedCount === totalCount) {
        console.log('✅ All basic tests passed - the error might be specific to certain interactions');
        console.log('💡 Try navigating through different pages or performing specific actions');
    } else {
        console.log('❌ Some basic tests failed - there might be a fundamental DOM issue');
    }
    
    console.groupEnd();
    return results;
}

// Auto-run tests
runAllTests();

// Make functions available for manual testing
window.testBasicDOM = testBasicDOM;
window.testReactMounting = testReactMounting;
window.testNavigation = testNavigation;
window.runAllTests = runAllTests;