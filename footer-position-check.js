// Quick footer position checker
console.log('🧪 Footer Position Test Started');

function checkFooterPosition() {
    const footer = document.querySelector('footer');
    
    if (!footer) {
        console.log('❌ No footer element found');
        return;
    }
    
    const styles = getComputedStyle(footer);
    const rect = footer.getBoundingClientRect();
    
    console.log('📊 Footer Analysis:');
    console.log('  Position:', styles.position);
    console.log('  Bottom:', styles.bottom);
    console.log('  Z-Index:', styles.zIndex);
    console.log('  Left:', styles.left);
    console.log('  Right:', styles.right);
    console.log('  BoundingRect:', {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        height: rect.height,
        width: rect.width
    });
    
    // Check if footer is truly fixed
    const isFixed = styles.position === 'fixed';
    const isAtBottom = styles.bottom === '0px';
    const hasProperZIndex = parseInt(styles.zIndex) >= 9990;
    
    console.log('✅ Footer Status:');
    console.log('  Fixed Position:', isFixed ? '✅' : '❌');
    console.log('  At Bottom:', isAtBottom ? '✅' : '❌');
    console.log('  High Z-Index:', hasProperZIndex ? '✅' : '❌');
    
    if (isFixed && isAtBottom && hasProperZIndex) {
        console.log('🎯 FOOTER IS PROPERLY FIXED!');
    } else {
        console.log('⚠️ Footer may have positioning issues');
    }
    
    return { isFixed, isAtBottom, hasProperZIndex };
}

function monitorScroll() {
    let lastScrollY = window.scrollY;
    let scrollCount = 0;
    
    window.addEventListener('scroll', () => {
        scrollCount++;
        const currentScrollY = window.scrollY;
        const footer = document.querySelector('footer');
        
        if (footer && scrollCount % 10 === 0) { // Log every 10th scroll event
            const rect = footer.getBoundingClientRect();
            console.log(`📜 Scroll #${scrollCount}: Y=${currentScrollY}, Footer Bottom=${rect.bottom}`);
            
            // Footer should always be at viewport bottom (rect.bottom should equal window.innerHeight)
            const expectedBottom = window.innerHeight;
            const actualBottom = Math.round(rect.bottom);
            
            if (Math.abs(actualBottom - expectedBottom) > 5) { // 5px tolerance
                console.log(`⚠️ Footer position issue: Expected bottom=${expectedBottom}, Actual=${actualBottom}`);
            }
        }
        
        lastScrollY = currentScrollY;
    });
}

// Auto-run checks
setTimeout(checkFooterPosition, 1000); // Check after 1 second
setTimeout(monitorScroll, 2000); // Start monitoring after 2 seconds

// Manual check function
window.checkFooter = checkFooterPosition;