/**
 * DEBUG TEST - Check what's on the login page
 */

import { test, expect } from '@playwright/test';

test('Debug: Check login page content', async ({ page }) => {
  console.log('🔍 Navigating to login page...');
  
  // Listen for console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', text);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  // Load the app first
  await page.goto('http://localhost:3002/', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Wait for app to initialize
  await page.waitForTimeout(2000);
  
  // Navigate to login via hash
  await page.evaluate(() => window.location.hash = '#/login');
  
  // Wait for React to render the login form
  await page.waitForTimeout(2000);
  
  console.log('📄 Current URL:', page.url());
  
  // Wait a bit for React to render
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-login-page.png', fullPage: true });
  console.log('📸 Screenshot saved to test-results/debug-login-page.png');
  
  // Get page title
  const title = await page.title();
  console.log('📝 Page title:', title);
  
  // Check what elements are present
  const emailInput = await page.locator('input[type="email"]').count();
  const passwordInput = await page.locator('input[type="password"]').count();
  const anyInput = await page.locator('input').count();
  const buttons = await page.locator('button').count();
  
  console.log('🔍 Element counts:');
  console.log('  - Email inputs:', emailInput);
  console.log('  - Password inputs:', passwordInput);
  console.log('  - Any inputs:', anyInput);
  console.log('  - Buttons:', buttons);
  
  // Get all input types
  const inputs = await page.locator('input').all();
  console.log('📋 Input types found:');
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`  - Type: ${type}, Name: ${name}, Placeholder: ${placeholder}`);
  }
  
  // Check for error messages
  const bodyText = await page.textContent('body');
  console.log('📄 Page contains "error":', bodyText?.toLowerCase().includes('error') || false);
  console.log('📄 Page contains "login":', bodyText?.toLowerCase().includes('login') || false);
  console.log('📄 Page contains "email":', bodyText?.toLowerCase().includes('email') || false);
  
  // Look for specific error text
  const errorElements = await page.locator('*:has-text("error"), *:has-text("Error")').all();
  console.log(`📛 Found ${errorElements.length} elements with "error"`);
  for (let i = 0; i < Math.min(errorElements.length, 5); i++) {
    const text = await errorElements[i].textContent();
    console.log(`   Error ${i + 1}:`, text?.substring(0, 200));
  }
  
  // Check if there's a root div
  const rootDiv = await page.locator('#root').count();
  console.log('📦 Root div exists:', rootDiv > 0);
  
  // Check if main app container exists
  const appContainer = await page.locator('[class*="App"], [id*="app"]').count();
  console.log('📦 App container exists:', appContainer > 0);
  
  // Log HTML (truncated)
  const html = await page.content();
  console.log('📄 Page HTML length:', html.length);
  console.log('📄 First 500 chars:', html.substring(0, 500));
  
  // This test always passes - it's just for debugging
  expect(true).toBe(true);
});
