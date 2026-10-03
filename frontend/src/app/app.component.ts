import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';
import { NotificationService, ToastMessage } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    ChatbotComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  isSidebarCollapsed = false;
  isSidebarMobileOpen = false;
  toasts: ToastMessage[] = [];
  currentUrl = '';

  constructor(
    private notifService: NotificationService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url;
      this.isSidebarMobileOpen = false;
      this.cdr.markForCheck();
    });

    this.notifService.toasts$.subscribe(t => {
      this.toasts = t;
      this.cdr.markForCheck();
    });
  }

  get isAuthPage(): boolean {
    return this.currentUrl.includes('/auth/');
  }

  get showSidebar(): boolean {
    if (!this.authService.currentUser) return false;
    const sidebarPrefixes = [
      '/farmer', '/dealer', '/delivery', '/admin',
      '/profile', '/orders', '/negotiations', '/wallet',
      '/notifications'
    ];
    return sidebarPrefixes.some(p => this.currentUrl.startsWith(p));
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 900) {
      this.isSidebarMobileOpen = !this.isSidebarMobileOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    this.isSidebarMobileOpen = false;
  }

  removeToast(id: number): void {
    this.notifService.removeToast(id);
  }
}
