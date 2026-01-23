/**
 * 🔐 AUTHENTICATION UTILITIES FOR E2E TESTS
 * 
 * Purpose: Manage 3 test accounts (user, therapist, admin)
 * Accounts:
 * - user@test.com (customer)
 * - therapist@test.com (service provider)
 * - admin@test.com (platform admin)
 */

import { Page, BrowserContext } from '@playwright/test';
import { account, databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { ID } from 'appwrite';

export interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'therapist' | 'admin';
  userId?: string;
}

export const TEST_ACCOUNTS: Record<string, TestAccount> = {
  user: {
    email: 'user@test.com',
    password: 'Test123456!',
    name: 'Test User',
    role: 'customer'
  },
  therapist: {
    email: 'therapist@test.com',
    password: 'Test123456!',
    name: 'Test Therapist',
    role: 'therapist'
  },
  admin: {
    email: 'admin@test.com',
    password: 'Test123456!',
    name: 'Test Admin',
    role: 'admin'
  }
};

/**
 * Create test accounts in Appwrite (run once before tests)
 */
export async function setupTestAccounts(): Promise<void> {
  console.log('🔧 Setting up test accounts...');
  
  for (const [key, testAccount] of Object.entries(TEST_ACCOUNTS)) {
    try {
      // Create account
      const user = await account.create(
        ID.unique(),
        testAccount.email,
        testAccount.password,
        testAccount.name
      );
      
      TEST_ACCOUNTS[key].userId = user.$id;
      console.log(`✅ Created ${key} account:`, user.$id);
      
      // Create therapist profile if needed
      if (testAccount.role === 'therapist') {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.THERAPISTS || 'therapists',
          user.$id,
          {
            name: testAccount.name,
            email: testAccount.email,
            phone: '+6281234567890',
            city: 'Jakarta',
            area: 'Central Jakarta',
            rating: 4.8,
            completedSessions: 0,
            status: 'available',
            verified: true,
            bankName: 'BCA',
            bankAccountNumber: '1234567890',
            bankAccountName: testAccount.name,
            createdAt: new Date().toISOString()
          }
        );
        console.log(`✅ Created therapist profile for ${testAccount.email}`);
      }
      
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`ℹ️  Account ${testAccount.email} already exists`);
      } else {
        console.error(`❌ Failed to create ${key} account:`, error);
      }
    }
  }
}

/**
 * Clean up test accounts (run after tests)
 */
export async function cleanupTestAccounts(): Promise<void> {
  console.log('🧹 Cleaning up test accounts...');
  
  // Note: Appwrite doesn't allow deleting users via SDK
  // Manual cleanup required via Appwrite console
  console.log('⚠️  Manual cleanup required - delete test accounts from Appwrite console');
}

/**
 * Login as test user
 */
export async function loginAsUser(page: Page): Promise<void> {
  const account = TEST_ACCOUNTS.user;
  await login(page, account.email, account.password);
}

/**
 * Login as test therapist
 */
export async function loginAsTherapist(page: Page): Promise<void> {
  const account = TEST_ACCOUNTS.therapist;
  await login(page, account.email, account.password);
}

/**
 * Login as test admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const account = TEST_ACCOUNTS.admin;
  await login(page, account.email, account.password);
}

/**
 * Generic login function
 */
async function login(page: Page, email: string, password: string): Promise<void> {
  console.log(`🔐 Logging in as ${email}...`);
  
  // Navigate to login page with absolute URL (hash routing)
  await page.goto('http://localhost:3002/#/login', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Wait for React to render
  await page.waitForTimeout(2000);
  
  // Wait for form to be visible
  const emailInput = page.locator('input[type="email"], input[type="text"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill in credentials with auto-scroll
  await emailInput.scrollIntoViewIfNeeded();
  await emailInput.fill(email);
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.scrollIntoViewIfNeeded();
  await passwordInput.fill(password);
  
  // Click login button with auto-scroll
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.scrollIntoViewIfNeeded();
  await submitButton.click();
  
  // Wait for navigation to complete
  await page.waitForURL(/\/(?!login)/, { timeout: 15000 });
  
  console.log(`✅ Logged in as ${email}`);
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  console.log('🚪 Logging out...');
  
  // Click logout button (adjust selector as needed)
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
  
  console.log('✅ Logged out');
}

/**
 * Create multiple browser contexts for parallel testing
 */
export async function createTestContexts(context: BrowserContext): Promise<{
  userContext: BrowserContext;
  therapistContext: BrowserContext;
  adminContext: BrowserContext;
}> {
  const browser = context.browser();
  
  if (!browser) {
    throw new Error('Browser context not available');
  }
  
  const userContext = await browser.newContext({
    permissions: ['notifications', 'geolocation']
  });
  
  const therapistContext = await browser.newContext({
    permissions: ['notifications', 'geolocation']
  });
  
  const adminContext = await browser.newContext({
    permissions: ['notifications']
  });
  
  return { userContext, therapistContext, adminContext };
}

/**
 * Get user session token (for API calls)
 */
export async function getUserSession(page: Page): Promise<string | null> {
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  return sessionCookie?.value || null;
}
