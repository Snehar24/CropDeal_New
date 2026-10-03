import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BiddingService } from '../../../core/services/bidding.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { BiddingSessionResponse } from '../../../core/models/models';
import { getCropImage } from '../../../core/utils/crop-image.util';

export interface AuctionCard {
  id: number;
  cropName: string;
  variety: string;
  grade: string;
  location: string;
  currentBid: number;
  totalQuantity: number;
  farmerName: string;
  bidsCount: number;
  timeRemaining: string;
  isEndingSoon: boolean;
  image: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-bidding-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bidding-hub.component.html',
  styleUrls: ['./bidding-hub.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BiddingHubComponent implements OnInit {
  selectedState = 'All States';
  selectedDistrict = 'All Districts';
  selectedCommodity = 'All Commodities';
  sortBy = 'Ending Soon';
  searchQuery = '';

  states = ['All States', 'Tamil Nadu', 'Punjab', 'Madhya Pradesh', 'Gujarat', 'Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Rajasthan', 'Kerala'];
  districts = ['All Districts', 'Coimbatore', 'Chennai', 'Dindigul', 'Erode', 'Namakkal', 'Madurai', 'Salem', 'Koyambedu'];
  commodities = ['All Commodities', 'Paddy (Rice)', 'Tomato', 'Onion', 'Potato', 'Groundnut', 'Maize', 'Red Chilli', 'Green Chilli', 'Mustard', 'Soybean', 'Coconut', 'Turmeric'];
  sortOptions = ['Ending Soon', 'Lowest Price', 'Highest Bids', 'Highest Quantity'];

  // 24 mock auctions for 3 pages of 8
  auctions: AuctionCard[] = [
    // ── Page 1 (ids 1-8) ──────────────────────────────────────────────
    {
      id: 1, cropName: 'Paddy (Rice)', variety: 'ADT 36', grade: 'FAQ',
      location: 'Coimbatore, Tamil Nadu', currentBid: 22.50, totalQuantity: 5000,
      farmerName: 'Ramesh Kumar', bidsCount: 12, timeRemaining: '02 : 15 : 30',
      isEndingSoon: true, image: getCropImage('Rice')
    },
    {
      id: 2, cropName: 'Tomato', variety: 'Local', grade: 'A',
      location: 'Chennai, Tamil Nadu', currentBid: 12.00, totalQuantity: 2000,
      farmerName: 'Suresh B', bidsCount: 8, timeRemaining: '04 : 32 : 10',
      isEndingSoon: false, image: getCropImage('Tomato')
    },
    {
      id: 3, cropName: 'Onion', variety: 'Local', grade: 'A',
      location: 'Koyambedu, Tamil Nadu', currentBid: 16.00, totalQuantity: 3000,
      farmerName: 'Manikandan', bidsCount: 15, timeRemaining: '01 : 20 : 45',
      isEndingSoon: true, image: getCropImage('Onion')
    },
    {
      id: 4, cropName: 'Potato', variety: 'Local', grade: 'A',
      location: 'Dindigul, Tamil Nadu', currentBid: 13.00, totalQuantity: 4000,
      farmerName: 'Velu', bidsCount: 9, timeRemaining: '06 : 10 : 20',
      isEndingSoon: false, image: getCropImage('Potato')
    },
    {
      id: 5, cropName: 'Groundnut', variety: 'Bold', grade: 'FAQ',
      location: 'Erode, Tamil Nadu', currentBid: 59.00, totalQuantity: 1500,
      farmerName: 'Karthik', bidsCount: 11, timeRemaining: '03 : 45 : 12',
      isEndingSoon: true, image: getCropImage('Groundnut')
    },
    {
      id: 6, cropName: 'Maize', variety: 'Local', grade: 'FAQ',
      location: 'Namakkal, Tamil Nadu', currentBid: 23.00, totalQuantity: 3500,
      farmerName: 'Arun Prakash', bidsCount: 7, timeRemaining: '05 : 18 : 33',
      isEndingSoon: false, image: getCropImage('Maize')
    },
    {
      id: 7, cropName: 'Red Chilli', variety: 'Guntur', grade: 'A',
      location: 'Madurai, Tamil Nadu', currentBid: 145.00, totalQuantity: 1000,
      farmerName: 'Muthu', bidsCount: 19, timeRemaining: '01 : 05 : 18',
      isEndingSoon: true, image: getCropImage('Chili')
    },
    {
      id: 8, cropName: 'Green Chilli', variety: 'Local', grade: 'A',
      location: 'Salem, Tamil Nadu', currentBid: 26.00, totalQuantity: 2500,
      farmerName: 'Rajasekar', bidsCount: 6, timeRemaining: '07 : 25 : 10',
      isEndingSoon: false, image: getCropImage('Green Chilli')
    },

    // ── Page 2 (ids 9-16) ─────────────────────────────────────────────
    {
      id: 9, cropName: 'Mustard', variety: 'Yellow', grade: 'FAQ',
      location: 'Jaipur, Rajasthan', currentBid: 52.00, totalQuantity: 2000,
      farmerName: 'Bhavesh Patel', bidsCount: 14, timeRemaining: '02 : 50 : 00',
      isEndingSoon: true, image: getCropImage('Mustard')
    },
    {
      id: 10, cropName: 'Soybean', variety: 'JS-335', grade: 'FAQ',
      location: 'Bhopal, Madhya Pradesh', currentBid: 44.00, totalQuantity: 3000,
      farmerName: 'Dinesh Yadav', bidsCount: 10, timeRemaining: '05 : 00 : 00',
      isEndingSoon: false, image: getCropImage('Soybean')
    },
    {
      id: 11, cropName: 'Coconut', variety: 'Matured', grade: 'A',
      location: 'Pollachi, Tamil Nadu', currentBid: 32.00, totalQuantity: 5000,
      farmerName: 'Selvam', bidsCount: 8, timeRemaining: '03 : 10 : 22',
      isEndingSoon: true, image: getCropImage('Coconut')
    },
    {
      id: 12, cropName: 'Garlic', variety: 'Desi', grade: 'A',
      location: 'Mandsaur, Madhya Pradesh', currentBid: 82.00, totalQuantity: 1000,
      farmerName: 'Raju Sharma', bidsCount: 13, timeRemaining: '01 : 45 : 30',
      isEndingSoon: true, image: getCropImage('Garlic')
    },
    {
      id: 13, cropName: 'Ginger', variety: 'Fresh', grade: 'A',
      location: 'Kozhikode, Kerala', currentBid: 75.00, totalQuantity: 800,
      farmerName: 'Thomas K', bidsCount: 11, timeRemaining: '04 : 20 : 15',
      isEndingSoon: false, image: getCropImage('Ginger')
    },
    {
      id: 14, cropName: 'Turmeric', variety: 'Erode', grade: 'FAQ',
      location: 'Erode, Tamil Nadu', currentBid: 102.00, totalQuantity: 1200,
      farmerName: 'Krishnaswamy', bidsCount: 17, timeRemaining: '00 : 55 : 10',
      isEndingSoon: true, image: getCropImage('Turmeric')
    },
    {
      id: 15, cropName: 'Wheat', variety: 'Sharbati', grade: 'A',
      location: 'Amritsar, Punjab', currentBid: 26.50, totalQuantity: 6000,
      farmerName: 'Gurpreet Singh', bidsCount: 5, timeRemaining: '08 : 00 : 00',
      isEndingSoon: false, image: getCropImage('Wheat')
    },
    {
      id: 16, cropName: 'Cotton', variety: 'Medium Staple', grade: 'A',
      location: 'Rajkot, Gujarat', currentBid: 72.50, totalQuantity: 1500,
      farmerName: 'Haresh Patel', bidsCount: 9, timeRemaining: '03 : 30 : 45',
      isEndingSoon: true, image: getCropImage('Cotton')
    },

    // ── Page 3 (ids 17-24) ────────────────────────────────────────────
    {
      id: 17, cropName: 'Bajra', variety: 'HHB-67', grade: 'FAQ',
      location: 'Jodhpur, Rajasthan', currentBid: 18.50, totalQuantity: 4000,
      farmerName: 'Shankar Lal', bidsCount: 6, timeRemaining: '06 : 40 : 00',
      isEndingSoon: false, image: getCropImage('Bajra')
    },
    {
      id: 18, cropName: 'Sugarcane', variety: 'Co-86032', grade: 'FAQ',
      location: 'Muzaffarnagar, UP', currentBid: 3.50, totalQuantity: 20000,
      farmerName: 'Vinod Kumar', bidsCount: 4, timeRemaining: '09 : 15 : 00',
      isEndingSoon: false, image: getCropImage('Sugarcane')
    },
    {
      id: 19, cropName: 'Banana', variety: 'Robusta', grade: 'A',
      location: 'Theni, Tamil Nadu', currentBid: 14.50, totalQuantity: 3000,
      farmerName: 'Muthusamy', bidsCount: 10, timeRemaining: '02 : 05 : 20',
      isEndingSoon: true, image: getCropImage('Banana')
    },
    {
      id: 20, cropName: 'Mango', variety: 'Alphonso', grade: 'A',
      location: 'Ratnagiri, Maharashtra', currentBid: 38.00, totalQuantity: 500,
      farmerName: 'Santosh Patil', bidsCount: 22, timeRemaining: '01 : 10 : 05',
      isEndingSoon: true, image: getCropImage('Mango')
    },
    {
      id: 21, cropName: 'Arhar Dal', variety: 'Local', grade: 'FAQ',
      location: 'Akola, Maharashtra', currentBid: 66.00, totalQuantity: 1200,
      farmerName: 'Pramod Deshmukh', bidsCount: 8, timeRemaining: '04 : 50 : 30',
      isEndingSoon: false, image: getCropImage('Arhar Dal')
    },
    {
      id: 22, cropName: 'Black Pepper', variety: 'Malabar', grade: 'A',
      location: 'Wayanad, Kerala', currentBid: 360.00, totalQuantity: 300,
      farmerName: 'George M', bidsCount: 16, timeRemaining: '01 : 30 : 00',
      isEndingSoon: true, image: getCropImage('Black Pepper')
    },
    {
      id: 23, cropName: 'Cardamom', variety: 'Green', grade: 'A',
      location: 'Idukki, Kerala', currentBid: 810.00, totalQuantity: 100,
      farmerName: 'Rajan N', bidsCount: 25, timeRemaining: '00 : 45 : 15',
      isEndingSoon: true, image: getCropImage('Cardamom')
    },
    {
      id: 24, cropName: 'Jowar', variety: 'Local White', grade: 'FAQ',
      location: 'Solapur, Maharashtra', currentBid: 22.00, totalQuantity: 3500,
      farmerName: 'Siddhappa', bidsCount: 5, timeRemaining: '07 : 20 : 00',
      isEndingSoon: false, image: getCropImage('Jowar')
    },
  ];

  allFilteredAuctions: AuctionCard[] = [];

  // ── Pagination ────────────────────────────────────────────────────
  currentPage = 1;
  readonly pageSize = 8;
  totalPages = 1;

  get totalAuctions(): number {
    return this.allFilteredAuctions.length;
  }

  get pagedAuctions(): AuctionCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allFilteredAuctions.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingFrom(): number {
    return this.totalAuctions === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalAuctions);
  }

  constructor(
    private biddingService: BiddingService,
    private notifService: NotificationService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLiveAuctions();
  }

  loadLiveAuctions(): void {
    this.biddingService.getActiveSessions().subscribe({
      next: (sessions) => {
        if (sessions && sessions.length > 0) {
          const backendAuctions: AuctionCard[] = sessions.map((s, idx) => ({
            id: s.id,
            cropName: s.cropName,
            variety: 'FAQ',
            grade: 'Grade A',
            location: 'Tamil Nadu, India',
            currentBid: s.currentHighestBid || s.basePrice,
            totalQuantity: (s as any).quantity || 2000,
            farmerName: 'Farmer #' + s.farmerId,
            bidsCount: (s as any).bidsCount || 5,
            timeRemaining: '03 : 15 : 00',
            isEndingSoon: idx % 2 === 0,
            image: getCropImage(s.cropName)
          }));
          this.auctions = [...backendAuctions, ...this.auctions.slice(backendAuctions.length)];
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

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.allFilteredAuctions = this.auctions.filter(a => {
      const matchSearch = !q || a.cropName.toLowerCase().includes(q) ||
        a.farmerName.toLowerCase().includes(q) || a.variety.toLowerCase().includes(q);
      const matchCommodity = !this.selectedCommodity || this.selectedCommodity === 'All Commodities' ||
        a.cropName.toLowerCase().includes(this.selectedCommodity.toLowerCase());
      return matchSearch && matchCommodity;
    });

    this.totalPages = Math.max(1, Math.ceil(this.allFilteredAuctions.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  toggleFavorite(auction: AuctionCard, e: Event): void {
    e.stopPropagation();
    auction.isFavorite = !auction.isFavorite;
    this.notifService.showToast('info', auction.isFavorite ? 'Added to watchlist' : 'Removed from watchlist');
    this.cdr.markForCheck();
  }

  goToDetails(auctionId: number): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.notifService.showToast('info', 'Please login to place a bid.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/bidding' } });
      return;
    }
    this.router.navigate(['/bidding', auctionId]);
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
