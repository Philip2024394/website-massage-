/**
 * 🔐 AI PROTECTION SYSTEM
 * 
 * This script provides permanent protection against AI-introduced scroll violations.
 * It monitors changes and prevents scroll-breaking code from being introduced.
 */

// 🎯 AI PROTECTION PROMPT - Use this when working with AI assistants
export const AI_PROTECTION_PROMPT = `
🔒 GLOBAL SCROLL ARCHITECTURE RULES - READ CAREFULLY:

Mobile scroll is globally locked and stable.
You are NOT allowed to introduce:
- height: 100vh
- h-screen or min-h-screen classes  
- overflow: hidden on body, html, or main containers
- position: fixed wrappers around full pages
- document.body.style.overflow = "hidden"

Body scrolling must remain enabled at all times.
Use SafePageWrapper, SafeChatContainer, and SafeModal components instead.

If a change risks mobile scroll, STOP and ask for clarification.

APPROVED PATTERNS:
✅ min-height: auto
✅ overflow: visible  
✅ SafePageWrapper component
✅ maxHeight for chat containers
✅ Modal with backdrop (not body lock)

FORBIDDEN PATTERNS:
❌ height: 100vh or 100dvh
❌ Tailwind h-screen or min-h-screen
❌ overflow: hidden on body/html
❌ position: fixed + full height
❌ Any body scroll manipulation

This is permanent and non-negotiable.
`;

/**
 * Development-only monitoring system
 */
export class AIProtectionSystem {
  private static violations: Set<string> = new Set();
  private static observer: MutationObserver | null = null;
  
  static init() {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('🔐 AI Protection System Active');
    console.log('   Monitoring for scroll-breaking changes...');
    console.log('   Paste this when working with AI:');
    console.log(AI_PROTECTION_PROMPT);
    
    this.startMonitoring();
  }
  
  private static startMonitoring() {
    // Monitor DOM mutations for dangerous patterns
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          this.checkElementForViolations(mutation.target as Element);
        }
        
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementForViolations(node as Element);
            }
          });
        }
      });
    });
    
    this.observer.observe(document, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });
    
    // Check existing elements
    this.scanForExistingViolations();
  }
  
  private static checkElementForViolations(element: Element) {
    const violations = [];
    
    // Check inline styles
    if (element instanceof HTMLElement) {
      const style = element.style;
      
      if (style.height === '100vh' || style.height === '100dvh') {
        violations.push('inline height: 100vh detected');
      }
      
      if (style.minHeight === '100vh' || style.minHeight === '100dvh') {
        violations.push('inline minHeight: 100vh detected');
      }
      
      if (style.overflow === 'hidden' && (element === document.body || element === document.documentElement)) {
        violations.push('body/html overflow: hidden detected');
      }
    }
    
    // Check classes
    const className = element.className;
    if (typeof className === 'string') {
      if (className.includes('h-screen')) {
        violations.push('h-screen class detected');
      }
      
      if (className.includes('min-h-screen')) {
        violations.push('min-h-screen class detected');
      }
    }
    
    // Report violations
    if (violations.length > 0) {
      const violationKey = `${element.tagName}:${violations.join(',')}`;
      
      if (!this.violations.has(violationKey)) {
        this.violations.add(violationKey);
        
        console.error('🚨 AI PROTECTION ALERT: Scroll architecture violation detected!');
        console.error('Element:', element);
        console.error('Violations:', violations);
        console.error('');
        console.error('🔧 FIX: Use mobile-safe alternatives:');
        console.error('  • Replace height: 100vh with min-height: auto');
        console.error('  • Replace h-screen with SafePageWrapper');
        console.error('  • Use SafeModal instead of body scroll lock');
        console.error('');
        console.error('🎯 AI Protection Prompt:');
        console.error(AI_PROTECTION_PROMPT);
        
        // Auto-fix if possible
        this.attemptAutoFix(element, violations);
      }
    }
  }
  
  private static attemptAutoFix(element: Element, violations: string[]) {
    if (!(element instanceof HTMLElement)) return;
    
    console.log('🔧 Attempting auto-fix...');
    
    violations.forEach(violation => {
      switch (violation) {
        case 'inline height: 100vh detected':
          element.style.height = 'auto';
          console.log('✅ Auto-fixed: height 100vh → auto');
          break;
          
        case 'inline minHeight: 100vh detected':
          element.style.minHeight = 'auto';
          console.log('✅ Auto-fixed: minHeight 100vh → auto');
          break;
          
        case 'body/html overflow: hidden detected':
          if (element === document.body || element === document.documentElement) {
            element.style.overflow = 'auto';
            console.log('✅ Auto-fixed: body/html overflow hidden → auto');
          }
          break;
          
        case 'h-screen class detected':
          element.className = element.className.replace(/\bh-screen\b/g, 'min-h-full');
          console.log('✅ Auto-fixed: h-screen class → min-h-full');
          break;
          
        case 'min-h-screen class detected':
          element.className = element.className.replace(/\bmin-h-screen\b/g, 'min-h-full');
          console.log('✅ Auto-fixed: min-h-screen class → min-h-full');
          break;
      }
    });
  }
  
  private static scanForExistingViolations() {
    // Scan the entire document for existing violations
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      this.checkElementForViolations(element);
    });
    
    // Check body and html specifically
    this.checkElementForViolations(document.body);
    this.checkElementForViolations(document.documentElement);
  }
  
  static getViolationSummary() {
    if (this.violations.size === 0) {
      console.log('✅ No scroll architecture violations detected');
      return;
    }
    
    console.log(`🚨 ${this.violations.size} scroll architecture violations detected:`);
    Array.from(this.violations).forEach(violation => {
      console.log(`  • ${violation}`);
    });
    
    console.log('');
    console.log('🔧 Use these safe alternatives:');
    console.log('  • SafePageWrapper for page containers');
    console.log('  • SafeChatContainer for scrollable content');
    console.log('  • SafeModal for modal dialogs');
  }
  
  static destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}