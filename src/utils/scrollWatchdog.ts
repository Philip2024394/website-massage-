/**
 * SCROLL WATCHDOG - Detects and prevents scroll violations in real-time
 * 
 * Purpose: Monitor and automatically fix scroll-breaking code before it causes issues
 * Features:
 * - Watches for body/html overflow: hidden violations
 * - Detects 100vh height violations
 * - Auto-fixes violations in development
 * - Reports violations with stack traces
 * - Prevents AI-generated scroll killers
 */

interface ScrollViolation {
  type: string;
  element: string;
  property: string;
  value: string;
  timestamp: number;
  stackTrace?: string;
}

class ScrollWatchdog {
  private static instance: ScrollWatchdog;
  private violations: ScrollViolation[] = [];
  private watchInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  static getInstance(): ScrollWatchdog {
    if (!ScrollWatchdog.instance) {
      ScrollWatchdog.instance = new ScrollWatchdog();
    }
    return ScrollWatchdog.instance;
  }

  start(): void {
    if (this.isActive) return;
    
    console.log('🔒 Starting Scroll Watchdog - Monitoring for violations...');
    this.isActive = true;
    
    // Check every 2 seconds for violations
    this.watchInterval = setInterval(() => {
      this.checkForViolations();
    }, 2000);
    
    // Initial check
    this.checkForViolations();
  }

  stop(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.isActive = false;
    console.log('🔒 Scroll Watchdog stopped');
  }

  private checkForViolations(): void {
    this.checkBodyHtmlOverflow();
    this.checkHeightViolations();
    this.checkPositionFixedTraps();
  }

  private checkBodyHtmlOverflow(): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Check body overflow
    const bodyStyle = getComputedStyle(body);
    if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') {
      this.reportViolation('BODY_OVERFLOW_HIDDEN', 'body', 'overflow', bodyStyle.overflow);
      this.fixBodyOverflow();
    }
    
    // Check html overflow
    const htmlStyle = getComputedStyle(html);
    if (htmlStyle.overflow === 'hidden' || htmlStyle.overflowY === 'hidden') {
      this.reportViolation('HTML_OVERFLOW_HIDDEN', 'html', 'overflow', htmlStyle.overflow);
      this.fixHtmlOverflow();
    }
  }

  private checkHeightViolations(): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Check for dangerous height: 100vh
    const bodyStyle = getComputedStyle(body);
    if (bodyStyle.height === '100vh' || bodyStyle.minHeight === '100vh') {
      this.reportViolation('BODY_100VH_HEIGHT', 'body', 'height', bodyStyle.height);
      this.fixBodyHeight();
    }
    
    // Check root element
    const root = document.getElementById('root') || document.getElementById('__next');
    if (root) {
      const rootStyle = getComputedStyle(root);
      if (rootStyle.height === '100vh' || rootStyle.minHeight === '100vh') {
        this.reportViolation('ROOT_100VH_HEIGHT', 'root', 'height', rootStyle.height);
        this.fixRootHeight(root);
      }
    }
  }

  private checkPositionFixedTraps(): void {
    // Look for full-screen fixed elements that might trap scroll
    const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
    fixedElements.forEach((el) => {
      const style = getComputedStyle(el as HTMLElement);
      if (style.position === 'fixed' && 
          style.top === '0px' && 
          style.left === '0px' && 
          style.right === '0px' && 
          style.bottom === '0px' &&
          style.zIndex !== 'auto') {
        
        const element = el as HTMLElement;
        if (!element.dataset.scrollWatchdogIgnore) {
          this.reportViolation('FULLSCREEN_FIXED_TRAP', element.tagName, 'position', 'fixed fullscreen');
        }
      }
    });
  }

  private reportViolation(type: string, element: string, property: string, value: string): void {
    const violation: ScrollViolation = {
      type,
      element,
      property,
      value,
      timestamp: Date.now(),
      stackTrace: new Error().stack
    };
    
    this.violations.push(violation);
    
    console.warn(`🚨 SCROLL VIOLATION DETECTED:`, {
      type,
      element,
      property: `${property}: ${value}`,
      time: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 violations
    if (this.violations.length > 10) {
      this.violations.shift();
    }
  }

  private fixBodyOverflow(): void {
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    console.log('✅ Auto-fixed: body overflow → auto');
  }

  private fixHtmlOverflow(): void {
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'auto';
    console.log('✅ Auto-fixed: html overflow → auto');
  }

  private fixBodyHeight(): void {
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100%';
    console.log('✅ Auto-fixed: body height → auto, min-height → 100%');
  }

  private fixRootHeight(root: HTMLElement): void {
    root.style.height = 'auto';
    root.style.minHeight = '100%';
    console.log('✅ Auto-fixed: root height → auto, min-height → 100%');
  }

  getViolations(): ScrollViolation[] {
    return [...this.violations];
  }

  getViolationSummary(): string {
    if (this.violations.length === 0) {
      return '✅ No scroll violations detected';
    }
    
    const summary = this.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(summary)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }
}

// Export singleton instance
export const scrollWatchdog = ScrollWatchdog.getInstance();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  scrollWatchdog.start();
}