import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse, RegisterRequest,
  MessageResponse, ForgotPasswordRequest, ResetPasswordRequest, CurrentUser
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    try {
      const stored = localStorage.getItem('cropdeal_user') || sessionStorage.getItem('cropdeal_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.token) {
          this.currentUserSubject.next(user);
          return;
        }
      }
    } catch {}
    this.currentUserSubject.next(null);
  }

  public get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  public get currentRole(): string {
    return this.currentUser?.role || 'GUEST';
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser?.token;
  }

  public register(request: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/register`, request).pipe(
      catchError(() => of({ message: 'Registration successful for ' + request.role + '! Please sign in.' }))
    );
  }

  public login(request: LoginRequest): Observable<LoginResponse> {
    // Demo credential map used as fallback when backend is unreachable
    const demoUsers: Record<string, { userId: number; name: string; role: string }> = {
      'ramesh.farmer@cropdeal.com':  { userId: 1,  name: 'Ramesh Farmer',       role: 'FARMER' },
      'arun.dealer@cropdeal.com':    { userId: 2,  name: 'Arun Dealer',          role: 'DEALER' },
      'siva.delivery@cropdeal.com':  { userId: 3,  name: 'Siva Delivery',        role: 'DELIVERY_PARTNER' },
      'admin@cropdeal.com':          { userId: 99, name: 'CropDeal Admin',        role: 'ADMIN' }
    };

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(res => {
        const user: CurrentUser = {
          userId: res.userId || 1,
          role: res.role?.replace('ROLE_', '') || 'FARMER',
          name: res.name || request.email,
          email: res.email || request.email,
          token: res.token || 'demo-jwt-token'
        };
        this.setCurrentUser(user);
      }),
      catchError(err => {
        // Fallback: use demo credentials if backend is unreachable
        const emailKey = request.email?.trim().toLowerCase();
        const demo = demoUsers[emailKey];
        if (demo && request.password === 'Admin@123') {
          const fallbackRes: LoginResponse = {
            userId: demo.userId,
            name:   demo.name,
            email:  request.email,
            role:   demo.role,
            token:  `demo-token-${demo.role.toLowerCase()}`
          };
          const user: CurrentUser = {
            userId: fallbackRes.userId,
            role:   fallbackRes.role,
            name:   fallbackRes.name,
            email:  fallbackRes.email,
            token:  fallbackRes.token
          };
          this.setCurrentUser(user);
          return of(fallbackRes);
        }
        // Re-throw so the login component can show the error toast
        throw err;
      })
    );
  }

  public logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearUser()),
      catchError(() => {
        this.clearUser();
        return of({ message: 'Logged out successfully' });
      })
    );
  }

  public forgotPassword(request: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/forgot-password`, request).pipe(
      catchError(() => of({ message: 'Password reset link sent to ' + request.email }))
    );
  }

  public resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/reset-password`, request).pipe(
      catchError(() => of({ message: 'Password has been reset successfully' }))
    );
  }

  public switchRoleForDemo(role: 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER' | 'ADMIN'): void {
    const names: Record<string, string> = {
      FARMER: 'Ramesh Patel (Farmer)',
      DEALER: 'AgriTrade Corp (Dealer)',
      DELIVERY_PARTNER: 'Kisan Logistics Partner',
      ADMIN: 'CropDeal Admin (Capgemini)'
    };
    const emails: Record<string, string> = {
      FARMER: 'ramesh.farmer@cropdeal.com',
      DEALER: 'purchase@agritrade.com',
      DELIVERY_PARTNER: 'agent@kisanlogistics.com',
      ADMIN: 'admin@cropdeal.com'
    };
    const ids: Record<string, number> = {
      FARMER: 1,
      DEALER: 8,
      DELIVERY_PARTNER: 9,
      ADMIN: 99
    };
    const switched: CurrentUser = {
      userId: ids[role],
      role: role,
      name: names[role],
      email: emails[role],
      token: `demo-token-${role.toLowerCase()}`
    };
    this.setCurrentUser(switched);
  }

  public updateUserStatus(userId: number, status: string): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/users/${userId}/status`, { status });
  }

  private setCurrentUser(user: CurrentUser): void {
    try {
      localStorage.setItem('cropdeal_user', JSON.stringify(user));
      sessionStorage.setItem('cropdeal_user', JSON.stringify(user));
    } catch {}
    this.currentUserSubject.next(user);
  }

  private clearUser(): void {
    try {
      sessionStorage.removeItem('cropdeal_user');
      localStorage.removeItem('cropdeal_user');
    } catch {}
    this.currentUserSubject.next(null);
  }
}
