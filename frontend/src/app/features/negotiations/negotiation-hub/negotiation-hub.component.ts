import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NegotiationService } from '../../../core/services/negotiation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

export interface DisplayNegotiation {
  id: number;
  cropName: string;
  grade: string;
  quantity: number;
  image: string;
  dealerName: string;
  dealerLocation: string;
  dealerPhone: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone: string;
  standardPrice: number;
  expectedCounter: number;
  currentCounter?: number;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
  tabCategory: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

@Component({
  selector: 'app-negotiation-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './negotiation-hub.component.html',
  styleUrls: ['./negotiation-hub.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationHubComponent implements OnInit {
  selectedTab: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'ALL';
  searchQuery = '';
  cropFilter = 'ALL';
  statusFilter = 'ALL';

  get isDealer(): boolean {
    return this.authService.currentUser?.role === 'DEALER';
  }

  items: DisplayNegotiation[] = [
    {
      id: 1,
      cropName: 'Paddy (Rice)',
      grade: 'A Grade',
      quantity: 500,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      dealerName: 'Suresh Traders',
      dealerLocation: 'Coimbatore',
      dealerPhone: '98765 43210',
      farmerName: 'Ramesh Patel',
      farmerLocation: 'Coimbatore, TN',
      farmerPhone: '94433 11223',
      standardPrice: 22,
      expectedCounter: 24,
      currentCounter: 23,
      statusLabel: 'Wait for Dealer Counter',
      statusClass: 'status-wait',
      statusIcon: 'fa-regular fa-clock',
      tabCategory: 'PENDING'
    },
    {
      id: 2,
      cropName: 'Tomato',
      grade: 'A Grade',
      quantity: 200,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      dealerName: 'FreshMart Agro',
      dealerLocation: 'Erode',
      dealerPhone: '91234 56789',
      farmerName: 'Murugan Velu',
      farmerLocation: 'Erode, TN',
      farmerPhone: '98422 66778',
      standardPrice: 25,
      expectedCounter: 28,
      currentCounter: 26,
      statusLabel: 'Dealer Countered',
      statusClass: 'status-countered',
      statusIcon: 'fa-regular fa-comment-dots',
      tabCategory: 'PENDING'
    },
    {
      id: 3,
      cropName: 'Onion',
      grade: 'B Grade',
      quantity: 300,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      dealerName: 'Vijay Traders',
      dealerLocation: 'Salem',
      dealerPhone: '99887 66554',
      farmerName: 'Rajesh Patil',
      farmerLocation: 'Nashik, MH',
      farmerPhone: '97654 33221',
      standardPrice: 18,
      expectedCounter: 20,
      statusLabel: 'Negotiating',
      statusClass: 'status-negotiating',
      statusIcon: 'fa-solid fa-users',
      tabCategory: 'PENDING'
    },
    {
      id: 4,
      cropName: 'Green Chilli',
      grade: 'A Grade',
      quantity: 150,
      image: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=600&q=80',
      dealerName: 'Kumar Exports',
      dealerLocation: 'Namakkal',
      dealerPhone: '90011 22334',
      farmerName: 'Subba Rao',
      farmerLocation: 'Guntur, AP',
      farmerPhone: '98480 12345',
      standardPrice: 30,
      expectedCounter: 32,
      currentCounter: 31,
      statusLabel: 'Dealer Countered',
      statusClass: 'status-countered',
      statusIcon: 'fa-regular fa-comment-dots',
      tabCategory: 'PENDING'
    }
  ];

  filteredItems: DisplayNegotiation[] = [];

  isCounterModalOpen = false;
  activeItem: DisplayNegotiation | null = null;
  counterPrice = 24;

  constructor(
    private negService: NegotiationService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.applyFilter();
  }

  setTab(tab: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'): void {
    this.selectedTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      const matchTab = this.selectedTab === 'ALL' || item.tabCategory === this.selectedTab;
      const matchCrop = this.cropFilter === 'ALL' || item.cropName.toLowerCase().includes(this.cropFilter.toLowerCase());
      const matchQuery = !q || item.cropName.toLowerCase().includes(q) || item.dealerName.toLowerCase().includes(q);
      return matchTab && matchCrop && matchQuery;
    });
    this.cdr.markForCheck();
  }

  accept(item: DisplayNegotiation): void {
    item.statusLabel = 'Accepted';
    item.statusClass = 'status-countered';
    item.tabCategory = 'ACCEPTED';
    const partner = this.isDealer ? item.farmerName : item.dealerName;
    this.notifService.showToast('success', `Negotiation with ${partner} accepted!`);
    this.applyFilter();
  }

  reject(item: DisplayNegotiation): void {
    item.statusLabel = 'Rejected';
    item.statusClass = 'status-wait';
    item.tabCategory = 'REJECTED';
    const partner = this.isDealer ? item.farmerName : item.dealerName;
    this.notifService.showToast('info', `Negotiation with ${partner} rejected.`);
    this.applyFilter();
  }

  openCounterModal(item: DisplayNegotiation): void {
    this.activeItem = item;
    this.counterPrice = item.currentCounter || item.standardPrice;
    this.isCounterModalOpen = true;
    this.cdr.markForCheck();
  }

  submitCounter(): void {
    if (!this.activeItem) return;
    this.activeItem.currentCounter = this.counterPrice;
    if (this.isDealer) {
      this.activeItem.statusLabel = 'Dealer Countered';
      this.activeItem.statusClass = 'status-countered';
      this.notifService.showToast('success', `Counter offer of ₹${this.counterPrice}/kg sent to farmer ${this.activeItem.farmerName}!`);
    } else {
      this.activeItem.statusLabel = 'Wait for Dealer Counter';
      this.activeItem.statusClass = 'status-wait';
      this.notifService.showToast('success', `Counter offer of ₹${this.counterPrice}/kg sent to ${this.activeItem.dealerName}!`);
    }
    this.isCounterModalOpen = false;
    this.applyFilter();
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
