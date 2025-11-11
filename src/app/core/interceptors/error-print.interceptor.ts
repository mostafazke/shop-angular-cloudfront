import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class ErrorPrintInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          const url = new URL(request.url);
          let errorMessage = `Request to "${url.pathname}" failed. Check the console for the details`;

          // Handle authorization errors with user-friendly messages
          if (error.status === 401) {
            errorMessage = 'Authorization header is missing. Please log in.';
          } else if (error.status === 403) {
            errorMessage = 'Invalid credentials. Access denied.';
          }

          this.notificationService.showError(errorMessage, 0);
        },
      }),
    );
  }
}
