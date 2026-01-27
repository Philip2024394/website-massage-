/**
 * Mobile Keyboard Handler
 * Handles keyboard open/close events and adjusts viewport accordingly
 */

let isKeyboardOpen = false;
let originalViewportHeight: number;

/**
 * Initialize mobile keyboard detection
 */
export function initializeMobileKeyboardHandler() {
  if (typeof window === 'undefined') return;

  // Store original viewport height
  originalViewportHeight = window.innerHeight;

  // Detect keyboard open/close via viewport resize
  window.visualViewport?.addEventListener('resize', handleViewportResize);
  window.addEventListener('resize', handleWindowResize);

  // Focus event handlers
  document.addEventListener('focusin', handleInputFocus);
  document.addEventListener('focusout', handleInputBlur);

  console.log('✅ Mobile keyboard handler initialized');
}

/**
 * Cleanup keyboard handler
 */
export function cleanupMobileKeyboardHandler() {
  if (typeof window === 'undefined') return;

  window.visualViewport?.removeEventListener('resize', handleViewportResize);
  window.removeEventListener('resize', handleWindowResize);
  document.removeEventListener('focusin', handleInputFocus);
  document.removeEventListener('focusout', handleInputBlur);
}

/**
 * Handle viewport resize (keyboard open/close detection)
 */
function handleViewportResize() {
  if (!window.visualViewport) return;

  const currentHeight = window.visualViewport.height;
  const keyboardHeight = originalViewportHeight - currentHeight;

  // Keyboard is open if viewport shrunk by more than 150px (threshold)
  const wasKeyboardOpen = isKeyboardOpen;
  isKeyboardOpen = keyboardHeight > 150;

  // State changed
  if (wasKeyboardOpen !== isKeyboardOpen) {
    if (isKeyboardOpen) {
      handleKeyboardOpen(keyboardHeight);
    } else {
      handleKeyboardClose();
    }
  }

  // Adjust scroll position to keep focused input visible
  if (isKeyboardOpen && document.activeElement) {
    scrollInputIntoView(document.activeElement as HTMLElement);
  }
}

/**
 * Handle window resize (orientation changes)
 */
function handleWindowResize() {
  originalViewportHeight = window.innerHeight;
}

/**
 * Handle input focus
 */
function handleInputFocus(e: FocusEvent) {
  const target = e.target as HTMLElement;

  // Check if it's an input element
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  ) {
    // Add keyboard-open class to body
    document.body.classList.add('keyboard-open');

    // iOS: Scroll input into view after keyboard animation
    if (isIOS()) {
      setTimeout(() => scrollInputIntoView(target), 300);
    }

    // Android: Immediate scroll
    if (isAndroid()) {
      scrollInputIntoView(target);
    }

    // Set appropriate keyboard type
    setKeyboardType(target as HTMLInputElement);
  }
}

/**
 * Handle input blur
 */
function handleInputBlur(e: FocusEvent) {
  // Small delay to allow keyboard to close
  setTimeout(() => {
    // Check if no other input is focused
    if (
      !document.activeElement ||
      (document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        document.activeElement.tagName !== 'SELECT')
    ) {
      document.body.classList.remove('keyboard-open');
    }
  }, 100);
}

/**
 * Handle keyboard open
 */
function handleKeyboardOpen(keyboardHeight: number) {
  console.log(`⌨️ Keyboard opened (height: ${keyboardHeight}px)`);
  
  document.body.classList.add('keyboard-open');
  document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);

  // Dispatch custom event
  window.dispatchEvent(
    new CustomEvent('keyboard-open', { detail: { keyboardHeight } })
  );
}

/**
 * Handle keyboard close
 */
function handleKeyboardClose() {
  console.log('⌨️ Keyboard closed');
  
  document.body.classList.remove('keyboard-open');
  document.documentElement.style.removeProperty('--keyboard-height');

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('keyboard-close'));
}

/**
 * Scroll input into view (cross-browser)
 */
function scrollInputIntoView(element: HTMLElement) {
  if (!element || typeof element.scrollIntoView !== 'function') return;

  // Find scrollable parent (chat window)
  const scrollableParent = findScrollableParent(element);

  if (scrollableParent) {
    // Scroll within parent container
    const elementRect = element.getBoundingClientRect();
    const parentRect = scrollableParent.getBoundingClientRect();
    const offset = elementRect.top - parentRect.top;

    scrollableParent.scrollTo({
      top: scrollableParent.scrollTop + offset - 100, // 100px padding from top
      behavior: 'smooth',
    });
  } else {
    // Fallback: scroll in main viewport
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }
}

/**
 * Find scrollable parent element
 */
function findScrollableParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

/**
 * Set keyboard type based on input
 */
function setKeyboardType(input: HTMLInputElement) {
  const name = input.name || '';
  const type = input.type || '';

  // WhatsApp/Phone number - numeric keyboard
  if (name.includes('whatsapp') || name.includes('phone') || type === 'tel') {
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
  }

  // Email - email keyboard
  if (name.includes('email') || type === 'email') {
    input.inputMode = 'email';
  }

  // Discount code - uppercase text
  if (name.includes('discount')) {
    input.inputMode = 'text';
    input.style.textTransform = 'uppercase';
  }

  // Default text keyboard
  if (!input.inputMode) {
    input.inputMode = 'text';
  }
}

/**
 * Detect iOS device
 */
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect Android device
 */
function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get keyboard state
 */
export function isKeyboardVisible(): boolean {
  return isKeyboardOpen;
}

/**
 * Get keyboard height (if available)
 */
export function getKeyboardHeight(): number {
  const height = document.documentElement.style.getPropertyValue('--keyboard-height');
  return height ? parseInt(height) : 0;
}

/**
 * Force close keyboard (blur all inputs)
 */
export function closeKeyboard() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobileKeyboardHandler);
  } else {
    initializeMobileKeyboardHandler();
  }
}
