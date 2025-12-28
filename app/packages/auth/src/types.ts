/**
 * Core Authentication Types - Facebook Standards
 * Type definitions for the centralized authentication service
 */

/**
 * Authenticated user interface
 */
export interface AuthUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone?: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs?: Record<string, any>;
  status: boolean;
  accessedAt?: string;
}

/**
 * Login options interface
 */
export interface LoginOptions {
  remember?: boolean;
  redirectUrl?: string;
  autoRedirect?: boolean;
}

/**
 * Registration options interface
 */
export interface RegisterOptions {
  autoLogin?: boolean;
  sendVerificationEmail?: boolean;
  redirectUrl?: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
  error?: string;
}

/**
 * Session interface
 */
export interface Session {
  $id: string;
  $createdAt: string;
  userId: string;
  expire: string;
  provider: string;
  providerUid: string;
  providerAccessToken?: string;
  providerAccessTokenExpiry?: string;
  providerRefreshToken?: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  clientEngine: string;
  clientEngineVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
}