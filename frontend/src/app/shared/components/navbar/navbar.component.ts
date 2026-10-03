import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CurrentUser, NotificationResponse } from '../../../core/models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: CurrentUser | null = null;
  notifications: NotificationResponse[] = [];

  // Cached computed values — NOT getters that recompute every cycle
  unreadNotifCount = 0;
  dashboardRoute = '/catalog';

  // Dropdown states
  isMarketDropdownOpen = false;
  isRoleDropdownOpen = false;
  isUserDropdownOpen = false;
  isNotifDropdownOpen = false;

  // Track current URL to conditionally show/hide nav elements per page
  currentUrl = '';

  constructor(
    public authService: AuthService,
    private notifService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Track current URL to hide elements on specific pages (e.g. home)
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url;
      this.cdr.markForCheck();
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.dashboardRoute = this.getDashboardRoute(user?.role);
      if (user) {
        // Init per-user notifications (loads from localStorage + backend)
        this.notifService.initForUser(user.userId, user.email);
      } else {
        this.notifService.clearForUser();
        this.notifications = [];
        this.unreadNotifCount = 0;
      }
      this.cdr.markForCheck();
    });

    // Subscribe to live notification stream
    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadNotifCount = notifs.length > 0 ? notifs.filter(n => !n.read).length : 3;
      this.cdr.markForCheck();
    });
  }

  /** True on public pages where the notification bell should be hidden */
  get isHomePage(): boolean {
    return (
      this.currentUrl === '/' ||
      this.currentUrl === '' ||
      this.currentUrl.startsWith('/landing') ||
      this.currentUrl.startsWith('/prices') ||
      this.currentUrl.startsWith('/bidding')
    );
  }

  private getDashboardRoute(role?: string): string {
    switch (role) {
      case 'FARMER':           return '/farmer/dashboard';
      case 'DEALER':           return '/dealer/dashboard';
      case 'DELIVERY_PARTNER': return '/delivery/dashboard';
      case 'ADMIN':            return '/admin/dashboard';
      default:                 return '/catalog';
    }
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  deleteNotif(id: number, event: Event): void {
    event.stopPropagation();
    this.notifService.deleteNotification(id);
  }

  markNotifRead(id: number): void {
    this.notifService.markAsRead(id);
  }

  clearAllNotifs(): void {
    this.notifService.clearAllNotifications();
  }

  switchRole(role: 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER' | 'ADMIN'): void {
    this.authService.switchRoleForDemo(role);
    this.isRoleDropdownOpen = false;
    this.notifService.showToast('info', `Switched demo role to ${role}`);
    switch (role) {
      case 'FARMER':           this.router.navigate(['/farmer/dashboard']);   break;
      case 'DEALER':           this.router.navigate(['/dealer/dashboard']);   break;
      case 'DELIVERY_PARTNER': this.router.navigate(['/delivery/dashboard']); break;
      case 'ADMIN':            this.router.navigate(['/admin/dashboard']);     break;
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
      this.notifService.showToast('info', 'Logged out successfully');
    });
  }

  

  closeAllDropdowns(): void {
    this.isMarketDropdownOpen = false;
    this.isRoleDropdownOpen = false;
    this.isUserDropdownOpen = false;
    this.isNotifDropdownOpen = false;
  }
}

