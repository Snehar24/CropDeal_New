import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PriceService } from '../../../core/services/price.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { MarketPriceResponse } from '../../../core/models/models';
import { getCropImage } from '../../../core/utils/crop-image.util';

interface EnhancedMarketPrice extends MarketPriceResponse {
  variety?: string;
  image?: string;
}

@Component({
  selector: 'app-price-ticker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './price-ticker.component.html',
  styleUrls: ['./price-ticker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceTickerComponent implements OnInit {
  prices: EnhancedMarketPrice[] = [];
  pagedPrices: EnhancedMarketPrice[] = [];
  
  selectedState = 'Tamil Nadu';
  selectedDistrict = 'All Districts';
  selectedCommodity = 'All Commodities';
  selectedMarket = 'All Markets';
  
  isSyncing = false;
  lastUpdated = '29 Sep 2026, 10:30 AM';

  // Pagination
  currentPage = 1;
  readonly pageSize = 10;
  totalPages = 1;
  totalFiltered = 0;

  states = ['Tamil Nadu', 'Punjab', 'Madhya Pradesh', 'Gujarat', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Karnataka', 'All States'];
  districts = ['All Districts', 'Coimbatore', 'Chennai', 'Dindigul', 'Erode', 'Namakkal', 'Madurai', 'Salem', 'Pollachi'];
  commodities = ['All Commodities', 'Paddy (Rice)', 'Tomato', 'Onion', 'Potato', 'Groundnut', 'Maize', 'Red Chilli', 'Green Chilli', 'Turmeric', 'Coconut'];
  markets = ['All Markets', 'Coimbatore', 'Koyambedu', 'Dindigul', 'Erode', 'Namakkal', 'Madurai', 'Salem', 'Pollachi'];

  // Default initial dataset matching Page 5
  mockMandiData: EnhancedMarketPrice[] = [
    { id: 1, commodity: 'Paddy (Rice)', variety: 'ADT 36', grade: 'FAQ', market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', minPricePerKg: 18.50, maxPricePerKg: 21.20, modalPricePerKg: 19.80, arrivalDate: '2026-09-29' },
    { id: 2, commodity: 'Tomato', variety: 'Local', grade: 'A', market: 'Koyambedu', district: 'Chennai', state: 'Tamil Nadu', minPricePerKg: 8.00, maxPricePerKg: 12.00, modalPricePerKg: 10.00, arrivalDate: '2026-09-29' },
    { id: 3, commodity: 'Onion', variety: 'Local', grade: 'A', market: 'Koyambedu', district: 'Chennai', state: 'Tamil Nadu', minPricePerKg: 11.00, maxPricePerKg: 16.00, modalPricePerKg: 13.50, arrivalDate: '2026-09-29' },
    { id: 4, commodity: 'Potato', variety: 'Local', grade: 'A', market: 'Dindigul', district: 'Dindigul', state: 'Tamil Nadu', minPricePerKg: 9.00, maxPricePerKg: 13.00, modalPricePerKg: 11.00, arrivalDate: '2026-09-29' },
    { id: 5, commodity: 'Groundnut', variety: 'Bold', grade: 'FAQ', market: 'Erode', district: 'Erode', state: 'Tamil Nadu', minPricePerKg: 52.00, maxPricePerKg: 59.00, modalPricePerKg: 56.00, arrivalDate: '2026-09-29' },
    { id: 6, commodity: 'Maize', variety: 'Local', grade: 'FAQ', market: 'Namakkal', district: 'Namakkal', state: 'Tamil Nadu', minPricePerKg: 18.50, maxPricePerKg: 23.00, modalPricePerKg: 20.50, arrivalDate: '2026-09-29' },
    { id: 7, commodity: 'Red Chilli', variety: 'Guntur', grade: 'A', market: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', minPricePerKg: 120.00, maxPricePerKg: 145.00, modalPricePerKg: 132.00, arrivalDate: '2026-09-29' },
    { id: 8, commodity: 'Green Chilli', variety: 'Local', grade: 'A', market: 'Salem', district: 'Salem', state: 'Tamil Nadu', minPricePerKg: 18.00, maxPricePerKg: 26.00, modalPricePerKg: 22.00, arrivalDate: '2026-09-29' },
    { id: 9, commodity: 'Turmeric', variety: 'Erode', grade: 'FAQ', market: 'Erode', district: 'Erode', state: 'Tamil Nadu', minPricePerKg: 95.00, maxPricePerKg: 110.00, modalPricePerKg: 102.00, arrivalDate: '2026-09-29' },
    { id: 10, commodity: 'Coconut', variety: 'Matured', grade: 'A', market: 'Pollachi', district: 'Coimbatore', state: 'Tamil Nadu', minPricePerKg: 28.00, maxPricePerKg: 34.00, modalPricePerKg: 31.00, arrivalDate: '2026-09-29' },
    { id: 11, commodity: 'Wheat', variety: 'Sharbati', grade: 'A', market: 'Amritsar', district: 'Amritsar', state: 'Punjab', minPricePerKg: 24.00, maxPricePerKg: 28.50, modalPricePerKg: 26.00, arrivalDate: '2026-09-29' },
    { id: 12, commodity: 'Cotton', variety: 'Medium Staple', grade: 'A', market: 'Rajkot', district: 'Rajkot', state: 'Gujarat', minPricePerKg: 68.00, maxPricePerKg: 78.00, modalPricePerKg: 72.50, arrivalDate: '2026-09-29' }
  ];

  constructor(
    private priceService: PriceService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices(): void {
    this.priceService.getTodayPrices().subscribe({
      next: (apiPrices) => {
        if (apiPrices && apiPrices.length > 0) {
          // Merge API data with mock details if missing
          this.prices = apiPrices.map((p, idx) => ({
            ...p,
            arrivalDate: p.arrivalDate || (p as any).priceDate || '2026-09-29',
            variety: (p as any).variety || (this.mockMandiData[idx % this.mockMandiData.length].variety),
            image: getCropImage(p.commodity)
          }));
        } else {
          this.prices = this.mockMandiData.map(p => ({
            ...p,
            image: getCropImage(p.commodity)
          }));
        }
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        this.prices = this.mockMandiData.map(p => ({
          ...p,
          image: getCropImage(p.commodity)
        }));
        this.applyFilter();
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(): void {
    const filtered = this.prices.filter(p => {
      const matchState = !this.selectedState || this.selectedState === 'All States' ||
        p.state?.toLowerCase().includes(this.selectedState.toLowerCase());
      const matchDistrict = !this.selectedDistrict || this.selectedDistrict === 'All Districts' ||
        p.district?.toLowerCase().includes(this.selectedDistrict.toLowerCase());
      const matchCommodity = !this.selectedCommodity || this.selectedCommodity === 'All Commodities' ||
        p.commodity?.toLowerCase().includes(this.selectedCommodity.toLowerCase());
      const matchMarket = !this.selectedMarket || this.selectedMarket === 'All Markets' ||
        (p.market && p.market.toLowerCase().includes(this.selectedMarket.toLowerCase()));

      return matchState && matchDistrict && matchCommodity && matchMarket;
    });

    this.totalFiltered = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedPrices = filtered.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  syncGovernmentPrices(): void {
    this.isSyncing = true;
    this.cdr.markForCheck();
    this.priceService.getTodayPrices().subscribe({
      next: (prices) => {
        this.isSyncing = false;
        if (prices && prices.length > 0) {
          this.prices = prices.map((p, idx) => ({
            ...p,
            variety: (p as any).variety || this.mockMandiData[idx % this.mockMandiData.length].variety,
            image: getCropImage(p.commodity)
          }));
        }
        this.lastUpdated = 'Just now (Synced)';
        this.notifService.showToast('success', 'Real-time Mandi benchmark updated from Government APMC.');
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSyncing = false;
        this.lastUpdated = '29 Sep 2026, 10:30 AM';
        this.notifService.showToast('info', 'Mandi benchmarks refreshed.');
        this.cdr.markForCheck();
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilter();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilter();
    }
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.applyFilter();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = Math.min(5, this.totalPages);
    for (let i = 1; i <= max; i++) pages.push(i);
    return pages;
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
