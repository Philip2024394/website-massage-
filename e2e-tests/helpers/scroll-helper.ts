/**
 * Scroll Helper for E2E Tests
 * 
 * Ensures elements are visible and scrolled into view before interaction
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Scroll element into view with smooth behavior
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  try {
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
      }
    }, selector);
    
    // Shorter wait to avoid timeout issues
    await page.waitForTimeout(200);
  } catch (error) {
    console.warn(`⚠️ Could not scroll to ${selector}:`, error);
  }
}

/**
 * Scroll to top of page
 */
export async function scrollToTop(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    await page.waitForTimeout(100);
  } catch (error) {
    console.warn('⚠️ Could not scroll to top:', error);
  }
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(300);
}

/**
 * Scroll by specific amount
 */
export async function scrollBy(page: Page, x: number, y: number): Promise<void> {
  await page.evaluate(({ x, y }) => {
    window.scrollBy({ top: y, left: x, behavior: 'smooth' });
  }, { x, y });
  await page.waitForTimeout(300);
}

/**
 * Ensure element is in viewport before clicking
 */
export async function clickWithScroll(page: Page, selector: string): Promise<void> {
  await scrollIntoView(page, selector);
  await page.click(selector);
}

/**
 * Ensure element is in viewport before filling
 */
export async function fillWithScroll(page: Page, selector: string, value: string): Promise<void> {
  await scrollIntoView(page, selector);
  await page.fill(selector, value);
}

/**
 * Check if page is scrollable
 */
export async function isPageScrollable(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.body.scrollHeight > window.innerHeight;
  });
}

/**
 * Get current scroll position
 */
export async function getScrollPosition(page: Page): Promise<{ x: number; y: number }> {
  return await page.evaluate(() => {
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset
    };
  });
}

/**
 * Wait for element to be in viewport
 */
export async function waitForInViewport(page: Page, selector: string, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const isInViewport = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }, selector);
    
    if (isInViewport) return;
    
    await scrollIntoView(page, selector);
    await page.waitForTimeout(100);
  }
  
  throw new Error(`Element ${selector} not in viewport after ${timeout}ms`);
}
