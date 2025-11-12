// CSS Loading Fix - Ensure styles are applied correctly
(function() {
    'use strict';
    
    console.log('🎨 CSS Fix: Starting style verification...');
    
    // Function to add critical styles if missing
    function addCriticalStyles() {
        const styleId = 'critical-styles-fallback';
        
        // Check if critical styles are already added
        if (document.getElementById(styleId)) {
            return;
        }
        
        const criticalCSS = `
            /* Critical fallback styles */
            svg { display: inline-block !important; vertical-align: middle !important; }
            .w-6 { width: 1.5rem !important; }
            .h-6 { height: 1.5rem !important; }
            .w-8 { width: 2rem !important; }
            .h-8 { height: 2rem !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .justify-between { justify-content: space-between !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .p-4 { padding: 1rem !important; }
            .bg-white { background-color: #ffffff !important; }
            .bg-blue-500 { background-color: #3b82f6 !important; }
            .text-white { color: #ffffff !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .bg-green-500 { background-color: #22c55e !important; }
            .border-green-500 { border-color: #22c55e !important; }
        `;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(criticalCSS));
        
        // Add to head
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(style);
        
        console.log('🎨 CSS Fix: Critical styles added as fallback');
    }
    
    // Function to check if Tailwind is loaded
    function checkTailwindLoaded() {
        // Create a test element to check if Tailwind classes work
        const testElement = document.createElement('div');
        testElement.className = 'flex bg-blue-500 w-6 h-6';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        const styles = window.getComputedStyle(testElement);
        const isFlexWorking = styles.display === 'flex';
        const isBgWorking = styles.backgroundColor === 'rgb(59, 130, 246)';
        const isSizeWorking = styles.width === '24px';
        
        document.body.removeChild(testElement);
        
        const tailwindWorking = isFlexWorking && isBgWorking && isSizeWorking;
        
        console.log('🎨 CSS Fix: Tailwind status check:', {
            display: styles.display,
            backgroundColor: styles.backgroundColor,
            width: styles.width,
            isWorking: tailwindWorking
        });
        
        if (!tailwindWorking) {
            console.warn('🎨 CSS Fix: Tailwind not working properly, adding fallback styles');
            addCriticalStyles();
            return false;
        }
        
        console.log('✅ CSS Fix: Tailwind is working correctly');
        return true;
    }
    
    // Function to fix large icons
    function fixIconSizes() {
        const icons = document.querySelectorAll('svg');
        let fixedCount = 0;
        
        icons.forEach(icon => {
            const computedStyle = window.getComputedStyle(icon);
            const width = parseFloat(computedStyle.width);
            const height = parseFloat(computedStyle.height);
            
            // If icon is unusually large (more than 100px), try to fix it
            if (width > 100 || height > 100) {
                // Check if it has Tailwind size classes
                const classList = Array.from(icon.classList);
                const hasSizeClass = classList.some(cls => 
                    cls.match(/^w-\d+$/) || cls.match(/^h-\d+$/)
                );
                
                if (hasSizeClass) {
                    // Force the size classes to work
                    if (classList.includes('w-6')) icon.style.width = '1.5rem';
                    if (classList.includes('h-6')) icon.style.height = '1.5rem';
                    if (classList.includes('w-8')) icon.style.width = '2rem';
                    if (classList.includes('h-8')) icon.style.height = '2rem';
                    if (classList.includes('w-12')) icon.style.width = '3rem';
                    if (classList.includes('h-12')) icon.style.height = '3rem';
                    
                    fixedCount++;
                }
            }
        });
        
        if (fixedCount > 0) {
            console.log(`🎨 CSS Fix: Fixed ${fixedCount} large icons`);
        }
    }
    
    // Function to fix layout issues
    function fixLayoutIssues() {
        // Fix elements that should be centered but aren't
        const elementsToCenter = document.querySelectorAll('.text-center');
        elementsToCenter.forEach(el => {
            if (window.getComputedStyle(el).textAlign !== 'center') {
                el.style.textAlign = 'center';
            }
        });
        
        // Fix flex layouts
        const flexElements = document.querySelectorAll('.flex');
        flexElements.forEach(el => {
            if (window.getComputedStyle(el).display !== 'flex') {
                el.style.display = 'flex';
            }
        });
        
        console.log('🎨 CSS Fix: Layout issues check completed');
    }
    
    // Main execution
    function runCSSFix() {
        console.log('🎨 CSS Fix: Running comprehensive style fixes...');
        
        // Check if Tailwind is working
        const tailwindWorking = checkTailwindLoaded();
        
        // Fix icon sizes
        fixIconSizes();
        
        // Fix layout issues
        fixLayoutIssues();
        
        // Re-run icon fix after a delay in case more icons load
        setTimeout(fixIconSizes, 1000);
        setTimeout(fixIconSizes, 3000);
        
        console.log('✅ CSS Fix: Style verification completed');
    }
    
    // Run immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCSSFix);
    } else {
        runCSSFix();
    }
    
    // Also run when window loads completely
    window.addEventListener('load', runCSSFix);
    
    // Export for manual testing
    window.cssDebug = {
        checkTailwind: checkTailwindLoaded,
        fixIcons: fixIconSizes,
        fixLayout: fixLayoutIssues,
        addCritical: addCriticalStyles
    };
    
})();