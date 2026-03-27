/**
 * Shared authentication utilities
 */

import type { AuthConfig, AuthSession, DIDAuthResult, User } from '../types/index.js'

export class UnifiedAuthService {
  private backendUrl: string
  private supabaseUrl?: string
  private supabaseAnonKey?: string

  constructor(config: AuthConfig) {
    this.backendUrl = config.backendUrl
    this.supabaseUrl = config.supabaseUrl
    this.supabaseAnonKey = config.supabaseAnonKey
  }

  /**
   * Sync user from Supabase to backend DID system
   */
  async syncUserToBackend(user: Partial<User>): Promise<DIDAuthResult> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/identity/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          metadata: user.settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to sync user: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Exchange Supabase session for backend token
   */
  async getBackendToken(supabaseToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/auth/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseToken}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error('Failed to exchange token:', error)
      return null
    }
  }

  /**
   * Create a new DID-based session
   */
  async createSession(email: string): Promise<AuthSession | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.session
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }

  /**
   * Validate a backend auth token
   */
  async validateToken(token: string): Promise<AuthSession | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.session
    } catch (error) {
      console.error('Failed to validate token:', error)
      return null
    }
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('vivim_auth_token')
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem('vivim_auth_token', token)
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem('vivim_auth_token')
}
