import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentUser } from '../../../core/models/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  queryParams?: any;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser: CurrentUser | null = null;
  // FIXED: cached array — only rebuilt when role changes, NOT on every change detection cycle
  navItems: NavItem[] = [];
  private _lastRole = '';

  constructor(public authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      const role = u?.role || 'FARMER';
      if (role !== this._lastRole) {
        this._lastRole = role;
        this.navItems = this.buildNavItems(role);
        this.cdr.markForCheck();
      }
    });
  }

  get currentRole(): string {
    return this.currentUser?.role || 'FARMER';
  }

  private buildNavItems(role: string): NavItem[] {
    switch (role) {
      case 'FARMER':
        return [
          { label: 'Dashboard',         icon: 'fa-solid fa-gauge-high',      route: '/farmer/dashboard' },
          { label: 'My Crops',          icon: 'fa-solid fa-leaf',            route: '/farmer/crops' },
          { label: 'Orders',            icon: 'fa-solid fa-receipt',         route: '/orders' },
          { label: 'Negotiations',      icon: 'fa-solid fa-comments-dollar', route: '/negotiations' },
          { label: 'Wallet',            icon: 'fa-solid fa-wallet',          route: '/wallet' },
          { label: 'Live Bidding',      icon: 'fa-solid fa-gavel',           route: '/farmer/bidding' },
          { label: 'Reports',           icon: 'fa-solid fa-chart-line',      route: '/farmer/reports' }
        ];
      case 'DEALER':
        return [
          { label: 'Dashboard',         icon: 'fa-solid fa-gauge-high',                route: '/dealer/dashboard' },
          { label: 'Orders',            icon: 'fa-solid fa-receipt',                   route: '/orders' },
          { label: 'Track Order',       icon: 'fa-solid fa-magnifying-glass-location',  route: '/orders/track' },
          { label: 'Available Pickup',  icon: 'fa-solid fa-truck-ramp-box',             route: '/orders', queryParams: { deliveryMode: 'SELF_PICKUP' } },
          { label: 'Negotiations',      icon: 'fa-solid fa-comments-dollar',           route: '/negotiations' },
          { label: 'Wallet',            icon: 'fa-solid fa-wallet',                    route: '/wallet' },
          { label: 'Crop Subscription', icon: 'fa-solid fa-bookmark',                  route: '/notifications', queryParams: { tab: 'alerts' } }
        ];
      case 'DELIVERY_PARTNER':
        return [
          { label: 'Dashboard',         icon: 'fa-solid fa-truck-ramp-box',  route: '/delivery/dashboard' },
          { label: 'My Deliveries',     icon: 'fa-solid fa-box-open',        route: '/delivery/my-deliveries' },
          { label: 'Wallet',            icon: 'fa-solid fa-wallet',          route: '/wallet' }
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard',         icon: 'fa-solid fa-shield-halved',   route: '/admin/dashboard' },
          { label: 'Users',             icon: 'fa-solid fa-users',           route: '/admin/users' },
          { label: 'Orders',            icon: 'fa-solid fa-receipt',         route: '/orders' },
          { label: 'Wallet',            icon: 'fa-solid fa-wallet',          route: '/wallet' },
          { label: 'Reports',           icon: 'fa-solid fa-chart-pie',       route: '/admin/reports' }
        ];
      default:
        return [];
    }
  }
}
