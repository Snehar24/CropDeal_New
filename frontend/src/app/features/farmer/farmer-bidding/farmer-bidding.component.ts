import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BiddingService } from '../../../core/services/bidding.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

export interface DisplayFarmerBid {
  id: number;
  cropName: string;
  grade: string;
  quantity: number;
  image: string;
  minPrice: number;
  expectedPrice: number;
  startDate: string;
  endDate: string;
  totalBids: number;
  highestBid: number;
  highestBidder: string;
  status: 'Active' | 'Closing Soon' | 'Closed';
  statusClass: string;
}

@Component({
  selector: 'app-farmer-bidding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farmer-bidding.component.html',
  styleUrls: ['./farmer-bidding.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FarmerBiddingComponent implements OnInit {
  selectedTab: 'ALL' | 'ACTIVE' | 'CLOSED' = 'ALL';
  searchQuery = '';
  cropFilter = 'ALL';
  statusFilter = 'ALL';

  items: DisplayFarmerBid[] = [
    {
      id: 1,
      cropName: 'Paddy (Rice)',
      grade: 'A Grade',
      quantity: 500,
      image: 'assets/images/crop-rice.jpg',
      minPrice: 20,
      expectedPrice: 25,
      startDate: '25 Sep 2024, 10:00 AM',
      endDate: '28 Sep 2024, 10:00 AM',
      totalBids: 8,
      highestBid: 24,
      highestBidder: 'Suresh Traders',
      status: 'Active',
      statusClass: 'status-active'
    },
    {
      id: 2,
      cropName: 'Tomato',
      grade: 'A Grade',
      quantity: 200,
      image: 'assets/images/crop-tomato.jpg',
      minPrice: 24,
      expectedPrice: 28,
      startDate: '22 Sep 2024, 09:00 AM',
      endDate: '24 Sep 2024, 00:00 AM',
      totalBids: 5,
      highestBid: 27,
      highestBidder: 'FreshMart Agro',
      status: 'Active',
      statusClass: 'status-active'
    },
    {
      id: 3,
      cropName: 'Onion',
      grade: 'B Grade',
      quantity: 300,
      image: 'assets/images/crop-onion.jpg',
      minPrice: 16,
      expectedPrice: 20,
      startDate: '18 Sep 2024, 11:00 AM',
      endDate: '20 Sep 2024, 11:00 AM',
      totalBids: 6,
      highestBid: 19,
      highestBidder: 'Vijay Traders',
      status: 'Closing Soon',
      statusClass: 'status-closing'
    },
    {
      id: 4,
      cropName: 'Green Chilli',
      grade: 'A Grade',
      quantity: 150,
      image: 'assets/images/crop-green-chilli.jpg',
      minPrice: 28,
      expectedPrice: 32,
      startDate: '15 Sep 2024, 09:00 AM',
      endDate: '18 Sep 2024, 09:00 AM',
      totalBids: 4,
      highestBid: 30,
      highestBidder: 'Kumar Exports',
      status: 'Closed',
      statusClass: 'status-closed'
    },
    {
      id: 5,
      cropName: 'Maize',
      grade: 'A Grade',
      quantity: 500,
      image: 'assets/images/crop-maize.jpg',
      minPrice: 18,
      expectedPrice: 22,
      startDate: '10 Sep 2024, 10:00 AM',
      endDate: '12 Sep 2024, 10:00 AM',
      totalBids: 3,
      highestBid: 21,
      highestBidder: 'Agro Traders',
      status: 'Closed',
      statusClass: 'status-closed'
    },
    {
      id: 6,
      cropName: 'Potato',
      grade: 'A Grade',
      quantity: 400,
      image: 'assets/images/crop-potato.jpg',
      minPrice: 12,
      expectedPrice: 16,
      startDate: '05 Sep 2024, 09:00 AM',
      endDate: '08 Sep 2024, 09:00 AM',
      totalBids: 7,
      highestBid: 15,
      highestBidder: 'Tamil Nadu Mart',
      status: 'Closed',
      statusClass: 'status-closed'
    }
  ];

  filteredItems: DisplayFarmerBid[] = [];

  isCreateModalOpen = false;
  isViewBidsModalOpen = false;
  activeItem: DisplayFarmerBid | null = null;

  newBidding = {
    cropName: 'Basmati Rice',
    quantity: 500,
    startingPrice: 24,
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    endTime: '18:00',
    imageUrl: 'assets/images/crop-rice.jpg'
  };

  sampleImages = [
    { label: 'Rice', url: 'assets/images/crop-rice.jpg' },
    { label: 'Wheat', url: 'assets/images/crop-wheat.jpg' },
    { label: 'Tomato', url: 'assets/images/crop-tomato.jpg' },
    { label: 'Onion', url: 'assets/images/crop-onion.jpg' }
  ];

  constructor(
    private biddingService: BiddingService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const farmerId = this.authService.currentUser?.userId || 1;
    this.biddingService.getActiveSessions().subscribe({
      next: (sessions) => {
        if (sessions && sessions.length > 0) {
          const backendItems: DisplayFarmerBid[] = sessions.map(s => ({
            id: s.id,
            cropName: s.cropName,
            grade: 'Grade A',
            quantity: s.quantity || 500,
            image: s.imageUrl || 'assets/images/crop-rice.jpg',
            minPrice: s.basePrice,
            expectedPrice: s.currentHighestBid || (s.basePrice + 5),
            startDate: s.startTime ? s.startTime.replace('T', ', ').slice(0, 17) : 'Active',
            endDate: s.endTime ? s.endTime.replace('T', ', ').slice(0, 17) : 'Active',
            totalBids: s.highestBidderId ? 3 : 0,
            highestBid: s.currentHighestBid || s.basePrice,
            highestBidder: s.highestBidderId ? `Dealer #${s.highestBidderId}` : 'No bids yet',
            status: s.status === 'ACTIVE' ? 'Active' : 'Closed',
            statusClass: s.status === 'ACTIVE' ? 'status-active' : 'status-closed'
          }));
          const backendIds = new Set(backendItems.map(b => b.id));
          const rest = this.items.filter(item => !backendIds.has(item.id));
          this.items = [...backendItems, ...rest];
        }
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        this.applyFilter();
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: 'ALL' | 'ACTIVE' | 'CLOSED'): void {
    this.selectedTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      const matchTab = this.selectedTab === 'ALL' ||
        (this.selectedTab === 'ACTIVE' && item.status !== 'Closed') ||
        (this.selectedTab === 'CLOSED' && item.status === 'Closed');
      const matchCrop = this.cropFilter === 'ALL' || item.cropName.toLowerCase().includes(this.cropFilter.toLowerCase());
      const matchStatus = this.statusFilter === 'ALL' || item.status === this.statusFilter;
      const matchQuery = !q || item.cropName.toLowerCase().includes(q) || item.highestBidder.toLowerCase().includes(q);
      return matchTab && matchCrop && matchStatus && matchQuery;
    });
    this.cdr.markForCheck();
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  submitCreate(): void {
    const farmerId = this.authService.currentUser?.userId || 1;
    const startIso = (this.newBidding.startDate && this.newBidding.startTime)
      ? `${this.newBidding.startDate}T${this.newBidding.startTime}:00`
      : new Date().toISOString();
    const endIso = (this.newBidding.endDate && this.newBidding.endTime)
      ? `${this.newBidding.endDate}T${this.newBidding.endTime}:00`
      : new Date(Date.now() + 86400000 * 3).toISOString();

    const req: any = {
      cropId: 1,
      farmerId: farmerId,
      cropName: this.newBidding.cropName,
      quantity: this.newBidding.quantity,
      unit: 'KG',
      basePrice: this.newBidding.startingPrice,
      minIncrement: 2,
      startTime: startIso,
      endTime: endIso,
      imageUrl: this.newBidding.imageUrl || 'assets/images/crop-rice.jpg'
    };

    this.biddingService.createSession(req, farmerId).subscribe({
      next: (session) => {
        const newBid: DisplayFarmerBid = {
          id: session.id,
          cropName: session.cropName,
          grade: 'Grade A',
          quantity: session.quantity,
          image: session.imageUrl || this.newBidding.imageUrl || 'assets/images/crop-rice.jpg',
          minPrice: session.basePrice,
          expectedPrice: session.basePrice + 5,
          startDate: `${this.newBidding.startDate}, ${this.newBidding.startTime}`,
          endDate: `${this.newBidding.endDate}, ${this.newBidding.endTime}`,
          totalBids: 0,
          highestBid: session.basePrice,
          highestBidder: 'No bids yet',
          status: 'Active',
          statusClass: 'status-active'
        };
        this.items.unshift(newBid);
        this.isCreateModalOpen = false;
        this.notifService.showToast('success', `Bidding auction for "${session.cropName}" launched!`);
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        const newBid: DisplayFarmerBid = {
          id: Date.now(),
          cropName: this.newBidding.cropName,
          grade: 'Grade A',
          quantity: this.newBidding.quantity,
          image: this.newBidding.imageUrl || 'assets/images/crop-rice.jpg',
          minPrice: this.newBidding.startingPrice,
          expectedPrice: this.newBidding.startingPrice + 5,
          startDate: `${this.newBidding.startDate}, ${this.newBidding.startTime}`,
          endDate: `${this.newBidding.endDate}, ${this.newBidding.endTime}`,
          totalBids: 0,
          highestBid: this.newBidding.startingPrice,
          highestBidder: 'No bids yet',
          status: 'Active',
          statusClass: 'status-active'
        };
        this.items.unshift(newBid);
        this.isCreateModalOpen = false;
        this.notifService.showToast('success', `Bidding auction for "${this.newBidding.cropName}" created!`);
        this.applyFilter();
        this.cdr.markForCheck();
      }
    });
  }

  openViewBids(item: DisplayFarmerBid): void {
    this.activeItem = item;
    this.isViewBidsModalOpen = true;
    this.cdr.markForCheck();
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
