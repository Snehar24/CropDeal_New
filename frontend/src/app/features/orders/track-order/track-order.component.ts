import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderResponse, DeliveryResponse } from '../../../core/models/models';

interface TrackStep {
  label: string;
  icon: string;
  done: boolean;
  active: boolean;
  time?: string;
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackOrderComponent implements OnInit {

  searchOrderId = '';
  isLoading = false;
  errorMsg = '';

  order: OrderResponse | null = null;
  delivery: DeliveryResponse | null = null;
  trackSteps: TrackStep[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.searchOrderId = params['orderId'];
        this.trackOrder();
      }
    });
  }

  trackOrder(): void {
    const id = Number(this.searchOrderId);
    if (!id || isNaN(id)) {
      this.errorMsg = 'Please enter a valid Order ID.';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.order = null;
    this.delivery = null;
    this.trackSteps = [];
    this.cdr.markForCheck();

    this.orderService.getOrderById(id).subscribe({
      next: (ord) => {
        if (!ord) {
          this.errorMsg = `No order found with ID #${id}.`;
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }
        this.order = ord;
        this.buildSteps(ord, null);
        this.cdr.markForCheck();

        this.deliveryService.getDeliveryByOrder(id).subscribe({
          next: (del) => {
            this.delivery = del;
            this.buildSteps(ord, del);
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.errorMsg = `No order found with ID #${id}. Please check the order ID and try again.`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildSteps(order: OrderResponse, delivery: DeliveryResponse | null): void {
    const status = order.status?.toUpperCase() || 'PENDING';
    const dStatus = delivery?.status?.toUpperCase() || '';

    const statusRank: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 1,
      'PROCESSING': 2,
      'SHIPPED': 3,
      'IN_TRANSIT': 3,
      'ACCEPTED': 3,
      'OUT_FOR_DELIVERY': 4,
      'DELIVERED': 5,
      'COMPLETED': 5,
    };

    const effectiveStatus = dStatus || status;
    const rank = statusRank[effectiveStatus] ?? 0;

    this.trackSteps = [
      {
        label: 'Order Placed',
        icon: 'fa-solid fa-file-invoice',
        done: rank >= 0,
        active: rank === 0,
        time: order.createdAt ? this.formatDate(order.createdAt) : undefined
      },
      {
        label: 'Order Confirmed',
        icon: 'fa-solid fa-circle-check',
        done: rank >= 1,
        active: rank === 1,
        time: rank >= 1 ? this.formatDate(order.updatedAt || order.createdAt) : undefined
      },
      {
        label: 'Processing / Packaging',
        icon: 'fa-solid fa-box-open',
        done: rank >= 2,
        active: rank === 2,
        time: rank >= 2 ? this.formatDate(delivery?.createdAt || order.updatedAt || order.createdAt) : undefined
      },
      {
        label: 'Shipped / In Transit',
        icon: 'fa-solid fa-truck',
        done: rank >= 3,
        active: rank === 3,
        time: rank >= 3 && delivery?.startedAt ? this.formatDate(delivery.startedAt) : undefined
      },
      {
        label: 'Out for Delivery',
        icon: 'fa-solid fa-person-biking',
        done: rank >= 4,
        active: rank === 4,
        time: undefined
      },
      {
        label: 'Delivered',
        icon: 'fa-solid fa-house-circle-check',
        done: rank >= 5,
        active: rank === 5,
        time: rank >= 5 && delivery?.completedAt ? this.formatDate(delivery.completedAt) : undefined
      }
    ];
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED': return 'badge-success';
      case 'IN_TRANSIT':
      case 'SHIPPED':
      case 'ACCEPTED':
      case 'OUT_FOR_DELIVERY': return 'badge-info';
      case 'CONFIRMED':
      case 'PROCESSING': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
