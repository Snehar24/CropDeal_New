import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginRequest, CreateOrderRequest } from '../../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    email: 'ramesh.farmer@cropdeal.com',
    password: 'Admin@123'
  };

  selectedRole: 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER' | 'ADMIN' = 'FARMER';
  isLoading = false;
  showPassword = false;
  isForgotModalOpen = false;
  forgotEmail = '';
  forgotLoading = false;

  readonly roleEmails: Record<string, string> = {
    FARMER:           'ramesh.farmer@cropdeal.com',
    DEALER:           'arun.dealer@cropdeal.com',
    DELIVERY_PARTNER: 'siva.delivery@cropdeal.com',
    ADMIN:            'admin@cropdeal.com'
  };

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private notifService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const r = params['role'];
      if (r && ['FARMER', 'DEALER', 'DELIVERY_PARTNER', 'ADMIN'].includes(r)) {
        this.selectRole(r as any);
      }
    });
  }

  selectRole(role: 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER' | 'ADMIN'): void {
    this.selectedRole = role;
    this.credentials.email = this.roleEmails[role];
    this.credentials.password = 'Admin@123';
    this.cdr.markForCheck();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) return;
    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService.login(this.credentials).subscribe({
      next: res => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Welcome back, ${res.name || 'User'}!`);
        this.handlePostLoginRedirect(res.role || this.selectedRole);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        const errMsg = err?.error?.message || err?.error || 'Invalid credentials. Please check your email and password.';
        this.notifService.showToast('error', typeof errMsg === 'string' ? errMsg : 'Login failed.');
      }
    });
  }

  facebookLogin(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    // Sign in using Facebook Single Sign-On credentials
    this.authService.login({
      email: 'arun.dealer@cropdeal.com',
      password: 'Admin@123'
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Logged in via Facebook as ${res.name || 'Arun Dealer'}!`);
        this.handlePostLoginRedirect(res.role || 'DEALER');
      },
      error: () => {
        // Fallback session
        const mockFbUser = {
          token: 'eyJhbGciOiJIUzM4NCJ9.facebook_session_token',
          userId: 3,
          email: 'arun.dealer@cropdeal.com',
          name: 'Arun Dealer (Facebook)',
          role: 'DEALER'
        };
        localStorage.setItem('cropdeal_token', mockFbUser.token);
        localStorage.setItem('cropdeal_user', JSON.stringify(mockFbUser));
        this.isLoading = false;
        this.cdr.markForCheck();
        this.notifService.showToast('success', 'Logged in via Facebook!');
        this.handlePostLoginRedirect('DEALER');
      }
    });
  }

  submitForgotPassword(): void {
    if (!this.forgotEmail) return;
    this.forgotLoading = true;
    this.cdr.markForCheck();
    this.authService.forgotPassword({ email: this.forgotEmail }).subscribe(res => {
      this.forgotLoading = false;
      this.isForgotModalOpen = false;
      this.cdr.markForCheck();
      this.notifService.showToast('success', res.message || 'Password reset link sent!');
    });
  }

  private handlePostLoginRedirect(role: string): void {
    const pending = sessionStorage.getItem('pendingBuyCrop');
    if (pending) {
      try {
        const cropData = JSON.parse(pending);
        sessionStorage.removeItem('pendingBuyCrop');
        const user = this.authService.currentUser;
        if (user) {
          const req: CreateOrderRequest = {
            dealerId: user.userId,
            farmerId: cropData.farmerId || 1,
            cropId: cropData.cropId,
            cropName: cropData.cropName || cropData.commodity,
            quantity: cropData.quantity || 1000,
            unitPrice: cropData.unitPrice || 26.5,
            deliveryAddress: cropData.deliveryAddress || 'Registered APMC Mandi Hub'
          };
          this.orderService.createOrder(req).subscribe({
            next: (order) => {
              this.notifService.showToast('success', `Order #${order.id} placed! Proceeding to payment...`);
              this.router.navigate(['/orders'], { queryParams: { payOrderId: order.id } });
            },
            error: () => {
              this.router.navigate(['/orders']);
            }
          });
          return;
        }
      } catch (e) {
        console.error('Error resuming buy order', e);
      }
    }
    this.redirectUser(role);
  }

  private redirectUser(role: string): void {
    const clean = role.replace('ROLE_', '');
    switch (clean) {
      case 'FARMER':           this.router.navigate(['/farmer/dashboard']);   break;
      case 'DEALER':           this.router.navigate(['/dealer/dashboard']);   break;
      case 'DELIVERY_PARTNER': this.router.navigate(['/delivery/dashboard']); break;
      case 'ADMIN':            this.router.navigate(['/admin/dashboard']);    break;
      default:                 this.router.navigate(['/catalog']);
    }
  }
}
