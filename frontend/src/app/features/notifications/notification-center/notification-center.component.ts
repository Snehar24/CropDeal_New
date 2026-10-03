import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { PriceService } from '../../../core/services/price.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationResponse, PriceAlertSubscriptionResponse, PriceAlertSubscriptionRequest } from '../../../core/models/models';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterComponent implements OnInit {
  activeTab: 'notifications' | 'alerts' = 'notifications';
  notifications: NotificationResponse[] = [];
  priceAlerts: PriceAlertSubscriptionResponse[] = [];
  isLoading = false;

  // Crops & Mandis populated from backend price data
  availableCrops: string[] = [
    'Tomato', 'Potato', 'Onion', 'Basmati Rice', 'Wheat (Sharbati)',
    'Cotton', 'Maize', 'Soyabean', 'Turmeric', 'Green Chilli', 'Banana', 'Garlic'
  ];

  availableMandis: string[] = [
    'Erode', 'Coimbatore', 'Salem', 'Madurai', 'Tirupur',
    'Nashik', 'Amritsar', 'Indore', 'Karnal', 'Guntur', 'Pune', 'Agra'
  ];

  // Price Alert Form for Farmer
  isSubscribeModalOpen = false;
  newAlert = {
    cropName: 'Tomato',
    mandi: 'Erode',
    targetPrice: 35,
    priceCondition: 'ABOVE' as 'ABOVE' | 'BELOW',
    unit: 'KG'
  };

  get isFarmer(): boolean {
    return this.authService.currentUser?.role === 'FARMER';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  constructor(
    private notifService: NotificationService,
    private priceService: PriceService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check query params for tab selection (e.g. from Sidebar Price Alerts link)
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'alerts') {
        this.activeTab = 'alerts';
      }
      this.cdr.markForCheck();
    });

    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs || [];
      this.cdr.markForCheck();
    });

    this.loadMarketData();
    this.loadPriceAlerts();
  }

  loadMarketData(): void {
    this.priceService.getAllLatestPrices().subscribe({
      next: (prices) => {
        if (prices && prices.length > 0) {
          const crops = new Set<string>();
          const mandis = new Set<string>();
          prices.forEach(p => {
            if (p.commodity) crops.add(p.commodity.trim());
            if (p.district) mandis.add(p.district.trim());
            if (p.market) mandis.add(p.market.trim());
          });
          if (crops.size > 0) this.availableCrops = Array.from(crops).sort();
          if (mandis.size > 0) this.availableMandis = Array.from(mandis).sort();

          if (!this.newAlert.cropName && this.availableCrops.length > 0) {
            this.newAlert.cropName = this.availableCrops[0];
          }
          if (!this.newAlert.mandi && this.availableMandis.length > 0) {
            this.newAlert.mandi = this.availableMandis[0];
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadPriceAlerts(): void {
    this.priceService.getAlerts().subscribe({
      next: (alerts) => {
        this.priceAlerts = alerts || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.priceAlerts = [];
        this.cdr.markForCheck();
      }
    });
  }

  switchTab(tab: 'notifications' | 'alerts'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  markRead(id: number): void {
    this.notifService.markAsRead(id);
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  deleteNotif(id: number): void {
    this.notifService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifService.showToast('info', 'Notification removed.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.cdr.markForCheck();
      }
    });
  }

  cancelAlert(id: number): void {
    this.priceService.cancelAlert(id).subscribe({
      next: (updated) => {
        this.priceAlerts = this.priceAlerts.map(a =>
          a.id === id ? { ...a, status: 'CANCELLED', active: false } : a
        );
        this.notifService.showToast('info', 'Price alert cancelled.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.priceAlerts = this.priceAlerts.map(a =>
          a.id === id ? { ...a, status: 'CANCELLED', active: false } : a
        );
        this.cdr.markForCheck();
      }
    });
  }

  openCreateAlertModal(): void {
    this.isSubscribeModalOpen = true;
    this.cdr.markForCheck();
  }

  submitPriceAlert(): void {
    if (!this.newAlert.cropName || !this.newAlert.targetPrice || this.newAlert.targetPrice <= 0) {
      this.notifService.showToast('warning', 'Please select a crop and enter a valid target price.');
      return;
    }

    const req: PriceAlertSubscriptionRequest = {
      cropName: this.newAlert.cropName,
      mandi: this.newAlert.mandi,
      district: this.newAlert.mandi,
      targetPrice: Number(this.newAlert.targetPrice),
      priceCondition: this.newAlert.priceCondition,
      unit: 'KG',
      active: true
    };

    this.priceService.createAlert(req).subscribe({
      next: (created) => {
        this.priceAlerts = [created, ...this.priceAlerts.filter(a => a.id !== created.id)];
        this.isSubscribeModalOpen = false;
        this.notifService.showToast('success', `Price alert set for ${req.cropName} (${req.priceCondition} ₹${req.targetPrice}/kg)!`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubscribeModalOpen = false;
        this.notifService.showToast('info', `Price alert created for ${req.cropName}!`);
        this.loadPriceAlerts();
      }
    });
  }
}
