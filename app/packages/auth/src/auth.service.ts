import { account } from '../../../../lib/appwrite/config';
import { AuthUser, LoginOptions, RegisterOptions } from './types';

/**
 * Core Authentication Service - Facebook Standards
 * Centralized authentication logic for all dashboard apps
 */
export class AuthService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();
      return user as AuthUser;
    } catch (error: any) {
      // Silently handle expected guest/401 errors (not logged in)
      if (error?.code !== 401 && error?.type !== 'general_unauthorized_scope') {
        console.error('Error getting current user:', error);
      }
      return null;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string, options?: LoginOptions): Promise<AuthUser> {
    try {
      // Clear any existing session first (Facebook standard)
      await this.clearExistingSession();
      
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      
      console.log('✅ Authentication successful for:', email, 'user ID:', user.$id);
      return user as AuthUser;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    options?: RegisterOptions
  ): Promise<AuthUser> {
    try {
      // Clear any existing session first
      await this.clearExistingSession();
      
      const user = await account.create('unique()', email, password, name);
      
      // Auto-login after registration (Facebook standard)
      const shouldAutoLogin = options?.autoLogin !== false;
      if (shouldAutoLogin) {
        await account.createEmailPasswordSession(email, password);
        return await account.get() as AuthUser;
      }
      
      return user as AuthUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      console.log('✅ User logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Create anonymous session for guest access
   */
  async createAnonymousSession(): Promise<AuthUser | null> {
    try {
      // Check if already logged in
      const currentUser = await Promise.race([
        account.get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]).catch(() => null);
      
      if (currentUser) {
        console.log('✅ Session already exists, skipping anonymous creation');
        return currentUser as AuthUser;
      }
      
      // Create anonymous session
      await Promise.race([
        account.createAnonymousSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      
      return await account.get() as AuthUser;
    } catch (error: any) {
      const errorCode = error?.code || error?.status;
      const errorMsg = error?.message || '';
      
      if (errorCode === 429 || errorMsg.includes('429')) {
        console.log('⚠️ Anonymous session rate limited - will retry later');
        return null;
      }
      
      console.warn('Anonymous session creation failed:', errorMsg);
      return null;
    }
  }

  /**
   * Clear existing session (Facebook standard)
   */
  private async clearExistingSession(): Promise<void> {
    try {
      await account.deleteSession('current');
      console.log('🗑️ Existing session cleared');
    } catch {
      // No session to delete, continue silently
      console.log('ℹ️ No existing session to clear');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Refresh authentication state
   */
  async refresh(): Promise<AuthUser | null> {
    return this.getCurrentUser();
  }
}

// Export singleton instance (Facebook standard)
export const authService = new AuthService();