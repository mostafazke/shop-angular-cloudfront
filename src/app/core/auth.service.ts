import { Injectable } from '@angular/core';

/**
 * Service for managing authentication tokens
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authorization_token';

  /**
   * Get the authorization token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store the authorization token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove the authorization token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Generate base64 token from username and password
   */
  generateToken(username: string, password: string): string {
    return btoa(`${username}:${password}`);
  }

  /**
   * Check if user has a valid token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
}
