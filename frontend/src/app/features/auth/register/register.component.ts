import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RegisterRequest } from '../../../core/models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  user: RegisterRequest = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'FARMER'
  };

  confirmPassword = '';
  selectedState = 'Punjab';
  agreeTerms = false;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  states = [
    'Punjab', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh',
    'Gujarat', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Tamil Nadu'
  ];

  private readonly roleRoutes: Record<string, string> = {
    FARMER:           '/farmer/dashboard',
    DEALER:           '/dealer/dashboard',
    DELIVERY_PARTNER: '/delivery/dashboard',
    ADMIN:            '/admin/dashboard'
  };

  constructor(
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const r = params['role'];
      if (r && ['FARMER', 'DEALER', 'DELIVERY_PARTNER'].includes(r)) {
        this.selectRole(r as any);
      }
    });
  }

  selectRole(role: 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER'): void {
    this.user.role = role;
    this.cdr.markForCheck();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.phone) {
      this.notifService.showToast('warning', 'Please fill in all mandatory fields.');
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.notifService.showToast('warning', 'Passwords do not match.');
      return;
    }

    if (!this.agreeTerms) {
      this.notifService.showToast('warning', 'Please agree to the Terms of Service.');
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService.register(this.user).subscribe({
      next: res => {
        this.notifService.showToast('success', res.message || 'Account created successfully!');
        this.authService.login({ email: this.user.email, password: this.user.password }).subscribe({
          next: loginRes => {
            this.isLoading = false;
            this.cdr.markForCheck();
            const route = this.roleRoutes[loginRes.role || this.user.role] || '/catalog';
            this.notifService.showToast('success', `Welcome to CropDeal, ${loginRes.name || this.user.name}!`);
            this.router.navigate([route]);
          },
          error: () => {
            this.isLoading = false;
            this.cdr.markForCheck();
            this.router.navigate(['/auth/login'], { queryParams: { role: this.user.role } });
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        const msg = err?.error?.message || err?.error || 'Registration failed. Please try again.';
        this.notifService.showToast('error', typeof msg === 'string' ? msg : 'Registration failed.');
      }
    });
  }

  facebookRegister(): void {
    this.notifService.showToast('info', 'Facebook registration: Please fill in your details and register below.');
  }
}
