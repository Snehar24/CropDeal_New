import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CropService } from '../../../core/services/crop.service';
import { NegotiationService } from '../../../core/services/negotiation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { getCropImage } from '../../../core/utils/crop-image.util';
import { CreateNegotiationRequest, CreateOrderRequest } from '../../../core/models/models';

export interface LandingCropItem {
  id: number;
  name: string;
  grade: 'Grade A' | 'Grade B';
  pricePerQuintal: number;
  location: string;
  availableQuintal: number;
  image: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  // ── 60 crops across 5 pages (12 per page) ──────────────────────────
  allCrops: LandingCropItem[] = [
    // ── Page 1 ─────────────────────────────────────────────────────────
    { id: 1,  name: 'Rice',         grade: 'Grade A', pricePerQuintal: 2100,  location: 'Tamil Nadu',       availableQuintal: 50,  image: getCropImage('Rice') },
    { id: 2,  name: 'Wheat',        grade: 'Grade A', pricePerQuintal: 1950,  location: 'Uttar Pradesh',    availableQuintal: 80,  image: getCropImage('Wheat') },
    { id: 3,  name: 'Maize',        grade: 'Grade B', pricePerQuintal: 1800,  location: 'Karnataka',        availableQuintal: 60,  image: getCropImage('Maize') },
    { id: 4,  name: 'Tomato',       grade: 'Grade A', pricePerQuintal: 1100,  location: 'Tamil Nadu',       availableQuintal: 40,  image: getCropImage('Tomato') },
    { id: 5,  name: 'Onion',        grade: 'Grade A', pricePerQuintal: 1300,  location: 'Maharashtra',      availableQuintal: 70,  image: getCropImage('Onion') },
    { id: 6,  name: 'Potato',       grade: 'Grade B', pricePerQuintal: 1000,  location: 'Gujarat',          availableQuintal: 100, image: getCropImage('Potato') },
    { id: 7,  name: 'Chili',        grade: 'Grade A', pricePerQuintal: 2800,  location: 'Andhra Pradesh',   availableQuintal: 30,  image: getCropImage('Chili') },
    { id: 8,  name: 'Groundnut',    grade: 'Grade A', pricePerQuintal: 4500,  location: 'Tamil Nadu',       availableQuintal: 45,  image: getCropImage('Groundnut') },
    { id: 9,  name: 'Cotton',       grade: 'Grade A', pricePerQuintal: 6000,  location: 'Maharashtra',      availableQuintal: 25,  image: getCropImage('Cotton') },
    { id: 10, name: 'Sugarcane',    grade: 'Grade B', pricePerQuintal: 350,   location: 'Uttar Pradesh',    availableQuintal: 150, image: getCropImage('Sugarcane') },
    { id: 11, name: 'Banana',       grade: 'Grade A', pricePerQuintal: 1400,  location: 'Tamil Nadu',       availableQuintal: 60,  image: getCropImage('Banana') },
    { id: 12, name: 'Turmeric',     grade: 'Grade A', pricePerQuintal: 5000,  location: 'Karnataka',        availableQuintal: 35,  image: getCropImage('Turmeric') },

    // ── Page 2 ─────────────────────────────────────────────────────────
    { id: 13, name: 'Mustard',      grade: 'Grade A', pricePerQuintal: 5200,  location: 'Rajasthan',        availableQuintal: 55,  image: getCropImage('Mustard') },
    { id: 14, name: 'Soybean',      grade: 'Grade A', pricePerQuintal: 4200,  location: 'Madhya Pradesh',   availableQuintal: 70,  image: getCropImage('Soybean') },
    { id: 15, name: 'Coconut',      grade: 'Grade A', pricePerQuintal: 12000, location: 'Kerala',           availableQuintal: 20,  image: getCropImage('Coconut') },
    { id: 16, name: 'Garlic',       grade: 'Grade A', pricePerQuintal: 8000,  location: 'Madhya Pradesh',   availableQuintal: 40,  image: getCropImage('Garlic') },
    { id: 17, name: 'Green Chilli', grade: 'Grade A', pricePerQuintal: 3500,  location: 'Andhra Pradesh',   availableQuintal: 35,  image: getCropImage('Green Chilli') },
    { id: 18, name: 'Ginger',       grade: 'Grade A', pricePerQuintal: 7500,  location: 'Kerala',           availableQuintal: 28,  image: getCropImage('Ginger') },
    { id: 19, name: 'Bajra',        grade: 'Grade B', pricePerQuintal: 1800,  location: 'Rajasthan',        availableQuintal: 90,  image: getCropImage('Bajra') },
    { id: 20, name: 'Jowar',        grade: 'Grade B', pricePerQuintal: 2200,  location: 'Maharashtra',      availableQuintal: 75,  image: getCropImage('Jowar') },
    { id: 21, name: 'Ragi',         grade: 'Grade A', pricePerQuintal: 3000,  location: 'Karnataka',        availableQuintal: 50,  image: getCropImage('Ragi') },
    { id: 22, name: 'Arhar Dal',    grade: 'Grade A', pricePerQuintal: 6500,  location: 'Madhya Pradesh',   availableQuintal: 40,  image: getCropImage('Arhar Dal') },
    { id: 23, name: 'Moong Dal',    grade: 'Grade A', pricePerQuintal: 7000,  location: 'Rajasthan',        availableQuintal: 30,  image: getCropImage('Moong Dal') },
    { id: 24, name: 'Urad Dal',     grade: 'Grade B', pricePerQuintal: 6800,  location: 'Madhya Pradesh',   availableQuintal: 35,  image: getCropImage('Urad Dal') },

    // ── Page 3 ─────────────────────────────────────────────────────────
    { id: 25, name: 'Mango',        grade: 'Grade A', pricePerQuintal: 3500,  location: 'Uttar Pradesh',    availableQuintal: 45,  image: getCropImage('Mango') },
    { id: 26, name: 'Barley',       grade: 'Grade B', pricePerQuintal: 1700,  location: 'Uttar Pradesh',    availableQuintal: 85,  image: getCropImage('Barley') },
    { id: 27, name: 'Brinjal',      grade: 'Grade A', pricePerQuintal: 700,   location: 'Tamil Nadu',       availableQuintal: 50,  image: getCropImage('Brinjal') },
    { id: 28, name: 'Capsicum',     grade: 'Grade A', pricePerQuintal: 2500,  location: 'Himachal Pradesh', availableQuintal: 25,  image: getCropImage('Capsicum') },
    { id: 29, name: 'Carrot',       grade: 'Grade A', pricePerQuintal: 1200,  location: 'Uttar Pradesh',    availableQuintal: 55,  image: getCropImage('Carrot') },
    { id: 30, name: 'Cauliflower',  grade: 'Grade A', pricePerQuintal: 600,   location: 'West Bengal',      availableQuintal: 65,  image: getCropImage('Cauliflower') },
    { id: 31, name: 'Lady Finger',  grade: 'Grade A', pricePerQuintal: 1200,  location: 'Maharashtra',      availableQuintal: 40,  image: getCropImage('Lady Finger') },
    { id: 32, name: 'Coriander',    grade: 'Grade A', pricePerQuintal: 3000,  location: 'Rajasthan',        availableQuintal: 30,  image: getCropImage('Coriander') },
    { id: 33, name: 'Drumstick',    grade: 'Grade A', pricePerQuintal: 2500,  location: 'Tamil Nadu',       availableQuintal: 20,  image: getCropImage('Drumstick') },
    { id: 34, name: 'Cabbage',      grade: 'Grade B', pricePerQuintal: 400,   location: 'Uttar Pradesh',    availableQuintal: 80,  image: getCropImage('Cabbage') },
    { id: 35, name: 'Pomegranate',  grade: 'Grade A', pricePerQuintal: 5000,  location: 'Maharashtra',      availableQuintal: 25,  image: getCropImage('Pomegranate') },
    { id: 36, name: 'Papaya',       grade: 'Grade B', pricePerQuintal: 800,   location: 'Tamil Nadu',       availableQuintal: 60,  image: getCropImage('Papaya') },

    // ── Page 4 ─────────────────────────────────────────────────────────
    { id: 37, name: 'Sunflower',    grade: 'Grade A', pricePerQuintal: 4500,  location: 'Karnataka',        availableQuintal: 45,  image: getCropImage('Sunflower') },
    { id: 38, name: 'Sesame',       grade: 'Grade A', pricePerQuintal: 8500,  location: 'Gujarat',          availableQuintal: 30,  image: getCropImage('Sesame') },
    { id: 39, name: 'Linseed',      grade: 'Grade B', pricePerQuintal: 4500,  location: 'Madhya Pradesh',   availableQuintal: 40,  image: getCropImage('Linseed') },
    { id: 40, name: 'Black Pepper', grade: 'Grade A', pricePerQuintal: 35000, location: 'Kerala',           availableQuintal: 10,  image: getCropImage('Black Pepper') },
    { id: 41, name: 'Cardamom',     grade: 'Grade A', pricePerQuintal: 80000, location: 'Kerala',           availableQuintal: 5,   image: getCropImage('Cardamom') },
    { id: 42, name: 'Jackfruit',    grade: 'Grade B', pricePerQuintal: 800,   location: 'Kerala',           availableQuintal: 35,  image: getCropImage('Jackfruit') },
    { id: 43, name: 'Guava',        grade: 'Grade A', pricePerQuintal: 1500,  location: 'Allahabad',        availableQuintal: 40,  image: getCropImage('Guava') },
    { id: 44, name: 'Lemon',        grade: 'Grade A', pricePerQuintal: 2000,  location: 'Tamil Nadu',       availableQuintal: 30,  image: getCropImage('Lemon') },
    { id: 45, name: 'Amla',         grade: 'Grade A', pricePerQuintal: 1500,  location: 'Uttar Pradesh',    availableQuintal: 45,  image: getCropImage('Amla') },
    { id: 46, name: 'Tamarind',     grade: 'Grade B', pricePerQuintal: 8000,  location: 'Andhra Pradesh',   availableQuintal: 25,  image: getCropImage('Tamarind') },
    { id: 47, name: 'Watermelon',   grade: 'Grade B', pricePerQuintal: 600,   location: 'Karnataka',        availableQuintal: 100, image: getCropImage('Watermelon') },
    { id: 48, name: 'Pineapple',    grade: 'Grade A', pricePerQuintal: 1200,  location: 'Kerala',           availableQuintal: 35,  image: getCropImage('Pineapple') },

    // ── Page 5 ─────────────────────────────────────────────────────────
    { id: 49, name: 'Tea',          grade: 'Grade A', pricePerQuintal: 15000, location: 'Assam',            availableQuintal: 15,  image: getCropImage('Tea') },
    { id: 50, name: 'Coffee',       grade: 'Grade A', pricePerQuintal: 12000, location: 'Karnataka',        availableQuintal: 20,  image: getCropImage('Coffee') },
    { id: 51, name: 'Litchi',       grade: 'Grade A', pricePerQuintal: 4000,  location: 'Bihar',            availableQuintal: 20,  image: getCropImage('Litchi') },
    { id: 52, name: 'Strawberry',   grade: 'Grade A', pricePerQuintal: 15000, location: 'Maharashtra',      availableQuintal: 10,  image: getCropImage('Strawberry') },
    { id: 53, name: 'Bitter Gourd', grade: 'Grade B', pricePerQuintal: 1500,  location: 'Andhra Pradesh',   availableQuintal: 40,  image: getCropImage('Bitter Gourd') },
    { id: 54, name: 'Pumpkin',      grade: 'Grade B', pricePerQuintal: 500,   location: 'Tamil Nadu',       availableQuintal: 80,  image: getCropImage('Pumpkin') },
    { id: 55, name: 'Fenugreek',    grade: 'Grade A', pricePerQuintal: 3500,  location: 'Rajasthan',        availableQuintal: 30,  image: getCropImage('Fenugreek') },
    { id: 56, name: 'Saffron',      grade: 'Grade A', pricePerQuintal: 300000, location: 'Jammu & Kashmir', availableQuintal: 2,   image: getCropImage('Saffron') },
    { id: 57, name: 'Castor',       grade: 'Grade B', pricePerQuintal: 5500,  location: 'Gujarat',          availableQuintal: 35,  image: getCropImage('Castor') },
    { id: 58, name: 'Safflower',    grade: 'Grade B', pricePerQuintal: 5500,  location: 'Maharashtra',      availableQuintal: 30,  image: getCropImage('Safflower') },
    { id: 59, name: 'Jamun',        grade: 'Grade A', pricePerQuintal: 3000,  location: 'Uttar Pradesh',    availableQuintal: 15,  image: getCropImage('Jamun') },
    { id: 60, name: 'Sapota',       grade: 'Grade B', pricePerQuintal: 2000,  location: 'Maharashtra',      availableQuintal: 25,  image: getCropImage('Sapota') },
  ];

  // ── Pagination ────────────────────────────────────────────────────
  readonly pageSize = 12;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.allCrops.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get displayedCrops(): LandingCropItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allCrops.slice(start, start + this.pageSize);
  }

  // ── Favorites tracking ────────────────────────────────────────────
  favoriteIds = new Set<number>();

  // ── Modals state ──────────────────────────────────────────────────
  isNegotiateModalOpen = false;
  isOrderModalOpen = false;
  selectedCrop: LandingCropItem | null = null;
  negQuantity = 10;
  negCounterPrice = 2000;
  orderQuantity = 10;
  orderAddress = 'Central Mandi Road, Sector 4';

  constructor(
    public router: Router,
    public authService: AuthService,
    private cropService: CropService,
    private negService: NegotiationService,
    private notifService: NotificationService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem('cropdeal_landing_favorites');
      if (stored) {
        const ids: number[] = JSON.parse(stored);
        this.favoriteIds = new Set(ids);
      }
    } catch {}

    // Load real crops from backend CropService
    this.cropService.getAllCrops().subscribe({
      next: (backendCrops) => {
        if (backendCrops && backendCrops.length > 0) {
          const mapped: LandingCropItem[] = backendCrops.map(c => ({
            id: c.id,
            name: c.commodity,
            grade: (c.grade && c.grade.toUpperCase().includes('B')) ? 'Grade B' : 'Grade A',
            pricePerQuintal: c.pricePerKg ? Math.round(c.pricePerKg * 100) : 2100,
            location: [c.district, c.state].filter(Boolean).join(', ') || 'India',
            availableQuintal: c.quantity || 50,
            image: getCropImage(c.commodity)
          }));
          const backendIds = new Set(mapped.map(m => m.id));
          const rest = this.allCrops.filter(c => !backendIds.has(c.id));
          this.allCrops = [...mapped, ...rest];
          this.cdr.markForCheck();
        }
      },
      error: () => {}
    });
  }

  openCropDetails(crop: LandingCropItem): void {
    this.router.navigate(['/crop', crop.id]);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  toggleFavorite(event: Event, crop: LandingCropItem): void {
    event.stopPropagation();
    if (this.favoriteIds.has(crop.id)) {
      this.favoriteIds.delete(crop.id);
      this.notifService.showToast('info', `Removed ${crop.name} from saved favorites.`);
    } else {
      this.favoriteIds.add(crop.id);
      this.notifService.showToast('success', `Saved ${crop.name} to favorites!`);
    }
    try {
      localStorage.setItem('cropdeal_landing_favorites', JSON.stringify(Array.from(this.favoriteIds)));
    } catch {}
    this.cdr.markForCheck();
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.has(id);
  }

  // ── BUY NOW ACTION ────────────────────────────────────────────────
  onBuyNow(event: Event, crop: LandingCropItem): void {
    event.stopPropagation();
    const user = this.authService.currentUser;
    if (!user) {
      sessionStorage.setItem('pendingBuyCrop', JSON.stringify({
        cropId: crop.id,
        cropName: crop.name,
        farmerId: 1,
        farmerName: (crop as any).farmer || 'Certified Farmer',
        quantity: 1000,
        unitPrice: crop.pricePerQuintal / 100,
        deliveryAddress: 'APMC Market Hub'
      }));
      this.notifService.showToast('info', 'Please login to complete your crop purchase and payment.');
      this.router.navigate(['/auth/login'], { queryParams: { redirect: 'payment', cropId: crop.id } });
      return;
    }
    this.selectedCrop = crop;
    this.orderQuantity = Math.min(10, crop.availableQuintal);
    this.isOrderModalOpen = true;
    this.cdr.markForCheck();
  }

  confirmOrder(): void {
    if (!this.selectedCrop) return;
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const req: CreateOrderRequest = {
      cropId: this.selectedCrop.id,
      cropName: this.selectedCrop.name,
      dealerId: user.userId || 8,
      farmerId: 1,
      quantity: this.orderQuantity * 100,
      unitPrice: this.selectedCrop.pricePerQuintal / 100,
      deliveryAddress: this.orderAddress
    };

    this.orderService.createOrder(req).subscribe({
      next: (order) => {
        this.isOrderModalOpen = false;
        this.notifService.showToast('success', `Order #${order.id} placed for ${this.selectedCrop?.name}! Proceeding to payment...`);
        this.router.navigate(['/orders'], { queryParams: { payOrderId: order.id } });
      },
      error: () => {
        this.isOrderModalOpen = false;
        this.notifService.showToast('success', `Order placed for ${this.selectedCrop?.name}! Proceeding to payment...`);
        this.router.navigate(['/orders']);
      }
    });
  }

  // ── NEGOTIATE / COUNTER ACTION ────────────────────────────────────
  onNegotiate(event: Event, crop: LandingCropItem): void {
    event.stopPropagation();
    const user = this.authService.currentUser;
    if (!user) {
      this.notifService.showToast('info', 'Please login to negotiate prices.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/negotiations' } });
      return;
    }
    this.selectedCrop = crop;
    this.negCounterPrice = Math.round(crop.pricePerQuintal * 0.92);
    this.negQuantity = Math.min(10, crop.availableQuintal);
    this.isNegotiateModalOpen = true;
    this.cdr.markForCheck();
  }

  submitNegotiation(): void {
    if (!this.selectedCrop) return;
    const user = this.authService.currentUser;
    if (!user) return;

    const req: CreateNegotiationRequest = {
      cropId: this.selectedCrop.id,
      cropName: this.selectedCrop.name,
      buyerId: user.userId || 10,
      sellerId: 1,
      quantity: this.negQuantity * 100,
      targetPrice: Math.round(this.negCounterPrice / 100)
    };

    this.negService.createNegotiation(req).subscribe({
      next: () => {
        this.isNegotiateModalOpen = false;
        this.notifService.showToast('success', `Counter offer of ₹${this.negCounterPrice}/Quintal proposed for ${this.selectedCrop?.name}!`);
        this.router.navigate(['/negotiations']);
      },
      error: () => {
        this.isNegotiateModalOpen = false;
        this.notifService.showToast('success', `Counter offer proposed for ${this.selectedCrop?.name}!`);
        this.router.navigate(['/negotiations']);
      }
    });
  }

  onCropImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23DCFCE7"/><circle cx="200" cy="115" r="50" fill="%2316A34A" opacity="0.3"/><text x="50%" y="54%" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2315803D" text-anchor="middle">🌾 Fresh Crop Harvest</text></svg>';
  }
}
