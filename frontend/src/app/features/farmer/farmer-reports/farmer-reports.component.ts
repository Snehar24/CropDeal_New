import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getCropImage } from '../../../core/utils/crop-image.util';
import { CropService } from '../../../core/services/crop.service';
import { OrderService } from '../../../core/services/order.service';
import { CropResponse, OrderResponse } from '../../../core/models/models';

interface MonthlyEarning {
  month: string;
  amount: number;
  orders: number;
}

@Component({
  selector: 'app-farmer-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farmer-reports.component.html',
  styleUrls: ['./farmer-reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FarmerReportsComponent implements OnInit {
  getCropImage(commodity: string): string {
    return getCropImage(commodity);
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
  crops: CropResponse[] = [];
  orders: OrderResponse[] = [];
  isLoading = true;

  get totalHarvestVolume(): number {
    return this.crops.reduce((sum, c) => sum + (c.quantity || 0), 0);
  }

  get completedOrders(): OrderResponse[] {
    return this.orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED');
  }

  get paidOrders(): OrderResponse[] {
    return this.orders.filter(o => o.paymentStatus === 'PAID' || o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'CONFIRMED');
  }

  get totalRevenue(): number {
    return this.paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get pendingOrders(): OrderResponse[] {
    return this.orders.filter(o => o.status === 'PENDING' || o.paymentStatus === 'UNPAID');
  }

  get pendingAmount(): number {
    return this.pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get monthlyEarnings(): MonthlyEarning[] {
    const map: Record<string, MonthlyEarning> = {};
    this.orders.forEach(o => {
      const date = new Date(o.createdAt || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!map[key]) map[key] = { month: label, amount: 0, orders: 0 };
      map[key].amount += o.totalAmount || 0;
      map[key].orders++;
    });
    return Object.values(map).slice(-6).reverse();
  }

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) return;

    this.cropService.getCropsByFarmer(user.userId).subscribe({
      next: crops => {
        this.crops = crops;
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); }
    });

    this.orderService.getOrdersByFarmer(user.userId).subscribe({
      next: orders => {
        this.orders = orders;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
