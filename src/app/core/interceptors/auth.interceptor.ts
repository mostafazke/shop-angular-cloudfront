import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

/**
 * HTTP Interceptor that adds Authorization header to import and cart API requests
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Check if this is an import or cart API request
    if (this.requiresAuth(request.url)) {
      const token = this.authService.getToken();

      // Add Authorization header if token exists
      if (token) {
        request = request.clone({
          setHeaders: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Basic ${token}`,
          },
        });
      }
    }

    return next.handle(request);
  }

  /**
   * Check if the request requires authentication
   */
  private requiresAuth(url: string): boolean {
    return url.includes('/import') || url.includes('/api/profile/cart');
  }
}
