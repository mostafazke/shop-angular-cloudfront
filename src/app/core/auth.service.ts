import { Injectable } from '@angular/core';

/**
 * Service for managing authentication tokens
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authorization_token';
  private readonly DEFAULT_TOKEN = 'eW91ckdpdGh1YkxvZ2luOlRFU1RfUEFTU1dPUkQ=';

  constructor() {
    // Initialize with default token if no token exists
    if (!this.getToken()) {
      this.setToken(this.DEFAULT_TOKEN);
    }
  }

  /**
   * Get the authorization token from localStorage
   * Falls back to default token if none is stored
   */
  getToken(): string | null {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    return storedToken || this.DEFAULT_TOKEN;
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
