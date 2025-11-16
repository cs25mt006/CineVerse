// import { Injectable } from '@angular/core';
// import {
//   HttpEvent,
//   HttpInterceptor,
//   HttpHandler,
//   HttpRequest,
//   HttpErrorResponse,
//   HttpClient
// } from '@angular/common/http';
// import { Observable, catchError, switchMap, throwError } from 'rxjs';
// import { environment } from '../../../environments/environment';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private isRefreshing = false;
//   private refreshQueue: (() => void)[] = [];

//   constructor(private http: HttpClient) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // Attach access token if available
//     const accessToken = sessionStorage.getItem('access_token');
//     const cloned = accessToken
//       ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
//       : req;



//     return next.handle(cloned).pipe(
//       catchError((error: HttpErrorResponse) => {
//         // If token expired → try refresh
//         if (error.status === 401 && !this.isRefreshing) {
//           this.isRefreshing = true;
//           return this.refreshAccessToken().pipe(
//             switchMap((newAccessToken) => {
//               this.isRefreshing = false;
//               this.resolveQueuedRequests();
//               const retryReq = req.clone({
//                 setHeaders: { Authorization: `Bearer ${newAccessToken}` }
//               });
//               return next.handle(retryReq);
//             }),
//             catchError((refreshErr) => {
//               this.isRefreshing = false;
//               this.clearSession();
//               window.location.href = '/login';
//               return throwError(() => refreshErr);
//             })
//           );
//         } else if (error.status === 401 && this.isRefreshing) {
//           // queue requests during refresh
//           return new Observable<HttpEvent<any>>((observer) => {
//             this.refreshQueue.push(() => {
//               const token = sessionStorage.getItem('access_token');
//               const retryReq = req.clone({
//                 setHeaders: { Authorization: `Bearer ${token}` }
//               });
//               next.handle(retryReq).subscribe({
//                 next: (res) => observer.next(res),
//                 error: (err) => observer.error(err),
//                 complete: () => observer.complete()
//               });
//             });
//           });
//         }
//         return throwError(() => error);
//       })
//     );
//   }

//   /** --- Helper: Refresh token API call --- */
//   private refreshAccessToken(): Observable<string> {
//     const refreshToken = sessionStorage.getItem('refresh_token');
//     if (!refreshToken) return throwError(() => new Error('No refresh token'));

//     const url = `${environment.apiBaseUrl}/users/token/refresh/`;
//     return this.http.post<{ access: string }>(url, { refresh: refreshToken }).pipe(
//       switchMap((res) => {
//         const newAccess = res.access;
//         sessionStorage.setItem('access_token', newAccess);
//         return new Observable<string>((observer) => {
//           observer.next(newAccess);
//           observer.complete();
//         });
//       })
//     );
//   }

//   /** --- Helper: Retry queued requests after refresh --- */
//   private resolveQueuedRequests() {
//     this.refreshQueue.forEach((cb) => cb());
//     this.refreshQueue = [];
//   }

//   /** --- Helper: Clear all tokens if refresh fails --- */
//   private clearSession() {
//     sessionStorage.removeItem('access_token');
//     sessionStorage.removeItem('refresh_token');
//     sessionStorage.removeItem('user_data');
//   }
// }






import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  // ✅ 1️⃣ Declare the endpoints that NEED authorization
  private protectedEndpoints = [
    '/api/profile/',
    '/api/bookings/seats/book/',
    '/api/bookings/seats/create-booking/',
    '/api/bookings/seats/your-orders/',
    '/api/movies/movies',
    '/api/theaters/locations/',
    '/api/theaters/theaters-by-location',
    '/api/theaters/screens-by-theater',
    '/api/shows/shows/',
    '/api/theaters/theaters/',
    '/api/theaters/screens/'


  ];

  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ 2️⃣ Check if the endpoint requires authentication
    const needsAuth = this.protectedEndpoints.some(endpoint => req.url.includes(endpoint));

    let cloned = req;

    if (needsAuth) {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
    }
    

    // ✅ 3️⃣ Continue request + handle token expiry
    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && needsAuth) {
          return this.handleRefreshToken(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  /** ✅ Handle refresh token flow only for protected APIs */
  private handleRefreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return throwError(() => new Error('Already refreshing'));
    }

    this.isRefreshing = true;
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.clearSession();
      window.location.href = '/login';
      return throwError(() => new Error('No refresh token'));
    }

    const url = `${environment.apiBaseUrl}/users/token/refresh/`;
    return this.http.post<{ access: string }>(url, { refresh: refreshToken }).pipe(
      switchMap((res) => {
        const newAccess = res.access;
        sessionStorage.setItem('access_token', newAccess);
        this.isRefreshing = false;

        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newAccess}` }
        });
        return next.handle(retryReq);
      }),
      catchError((refreshErr) => {
        this.isRefreshing = false;
        this.clearSession();
        window.location.href = '/login';
        return throwError(() => refreshErr);
      })
    );
  }

  private clearSession() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
  }
}
