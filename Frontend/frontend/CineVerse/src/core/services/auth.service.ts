import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface EmailExist {
  email_exist: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
}

export interface RegisterResponse {
  success: boolean;
  user_id: number;
  error: {};
}

export interface TokenRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;      
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  is_superuser: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessKey = 'access_token';
  private refreshKey = 'refresh_token';
  private userKey = 'user_data';
  private baseUrl = `${environment.apiBaseUrl}/users`;

  // Optional BehaviorSubject for UI updates (e.g., Navbar user display)
  private userSubject = new BehaviorSubject<LoginResponse | null>(this.loadUserFromSession());
  user$ = this.userSubject.asObservable();

  private adminStatus = new BehaviorSubject<boolean>(this.isAdmin());
  adminStatus$ = this.adminStatus.asObservable();

  constructor(private http: HttpClient) {}

  // Restore user from sessionStorage when service loads
  private loadUserFromSession(): LoginResponse | null {
    const stored = sessionStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }


  checkUserExists(email: string): Observable<EmailExist> {
    return this.http.get<EmailExist>(`${this.baseUrl}/exists/?email=${email}`);
  }


  registerUser(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/signup/`, data);
  }


  getToken(data: TokenRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/token/`, data);
  }


  getUserDetails(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login/`, data);
  }


  loginUser(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };

    return this.getUserDetails(loginRequest).pipe(
      switchMap((userDetails: LoginResponse) => {
        const tokenRequest: TokenRequest = {
          email: userDetails.email,
          password: password
        };
        
        return this.getToken(tokenRequest).pipe(
          tap((tokens) => this.saveTokens(tokens)),
          map(() => userDetails),
          tap((user) => {
            this.saveUser(user);
            this.userSubject.next(user);
          })
        );
      })
    );
  }


  private saveTokens(tokens: TokenResponse) {
    sessionStorage.setItem(this.accessKey, tokens.access);
    sessionStorage.setItem(this.refreshKey, tokens.refresh);
  }

  private saveUser(user: LoginResponse) {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAdmin(): boolean {
    const user = sessionStorage.getItem("user_data");
    if (!user) return false;

    const u = JSON.parse(user);
    return u.is_superuser === true;
  }

  setAdminStatus() {
    this.adminStatus.next(this.isAdmin());
  }

  clearAdminStatus() {
    this.adminStatus.next(false);
  }

  getUser(): LoginResponse | null {
    const stored = sessionStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  logout() {
    sessionStorage.removeItem(this.accessKey);
    sessionStorage.removeItem(this.refreshKey);
    sessionStorage.removeItem(this.userKey);
    this.clearAdminStatus();
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.accessKey);
  }
}
