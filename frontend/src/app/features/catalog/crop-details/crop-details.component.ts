import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CropService } from '../../../core/services/crop.service';
import { OrderService } from '../../../core/services/order.service';
import { NegotiationService } from '../../../core/services/negotiation.service';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CropResponse, CreateOrderRequest, CreateNegotiationRequest, FarmerReviewResponse, FarmerResponse } from '../../../core/models/models';
import { getCropImage } from '../../../core/utils/crop-image.util';
import { MOCK_CROPS, MOCK_REVIEWS } from '../../../core/services/mock-data';

@Component({
  selector: 'app-crop-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crop-details.component.html',
  styleUrls: ['./crop-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CropDetailsComponent implements OnInit {
  crop: CropResponse | null = null;
  farmer: FarmerResponse | null = null;
  cropId: number = 1;
  selectedQty: number = 50;

  // Gallery
  selectedImageIndex: number = 0;
  galleryImages: string[] = [];

  // Farmer reviews
  reviews: FarmerReviewResponse[] = [];
  farmerRating: number = 4.8;
  reviewCount: number = 24;

  // Order modal
  isOrderModalOpen = false;
  deliveryAddress = '';

  // Negotiate modal
  isNegotiateModalOpen = false;
  negTargetPrice = 0;

  isSubscribedToFarmer = false;

  toggleSubscribeFarmer(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.notifService.showToast('info', 'Please sign in as a dealer to subscribe to this farmer.');
      this.router.navigate(['/auth/login']);
      return;
    }
    const farmerName = this.farmer?.name || this.crop?.farmerName || 'Farmer';
    this.isSubscribedToFarmer = !this.isSubscribedToFarmer;
    if (this.isSubscribedToFarmer) {
      this.notifService.showToast('success', `Subscribed to ${farmerName}! You will receive price alerts when they list new batches.`);
      this.notifService.pushNotification('PRICE', '⭐ Farmer Crop Subscription', `You are now subscribed to ${farmerName} for ${this.crop?.commodity} harvest updates.`, user.userId);
    } else {
      this.notifService.showToast('info', `Unsubscribed from ${farmerName}.`);
    }
    this.cdr.markForCheck();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cropService: CropService,
    private userService: UserService,
    private orderService: OrderService,
    private negotiationService: NegotiationService,
    private reviewService: ReviewService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.cropId = idParam ? parseInt(idParam, 10) : 1;
      this.loadCropDetails();
    });
  }

  loadCropDetails(): void {
    this.cropService.getCropById(this.cropId).subscribe(data => {
      this.crop = data || MOCK_CROPS.find(c => c.id === this.cropId) || MOCK_CROPS[0];
      if (this.crop) {
        this.selectedQty = Math.min(this.crop.quantity, 50);
        this.negTargetPrice = Math.round(this.crop.pricePerKg * 0.95);
        this.setupGallery(this.crop);
        this.loadFarmerReviews(this.crop.farmerId);
        if (this.crop.farmerId) {
          this.userService.getFarmerById(this.crop.farmerId).subscribe(f => {
            if (f) {
              this.farmer = f;
              this.cdr.markForCheck();
            }
          });
        }
      }
      this.cdr.markForCheck();
    });
  }

  setupGallery(crop: CropResponse): void {
    const isRice = crop.commodity.toLowerCase().includes('rice') || crop.commodity.toLowerCase().includes('paddy');
    const mainImg = isRice ? 'assets/images/crop-detail-paddy.jpg' : getCropImage(crop.commodity);

    this.galleryImages = [
      mainImg,
      getCropImage('Basmati Rice'),
      getCropImage('Wheat'),
      getCropImage('Maize'),
      getCropImage(crop.commodity)
    ];
    this.selectedImageIndex = 0;
  }

  loadFarmerReviews(farmerId: number): void {
    this.reviewService.getFarmerReviews(farmerId).subscribe(data => {
      const revs = data?.reviews || [];
      if (revs && revs.length > 0) {
        this.reviews = revs;
      } else {
        this.reviews = MOCK_REVIEWS;
      }
      this.reviewCount = this.reviews.length;
      if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
        this.farmerRating = parseFloat((sum / this.reviews.length).toFixed(1));
      }
      this.cdr.markForCheck();
    });
  }

  selectImage(idx: number): void {
    this.selectedImageIndex = idx;
  }

  prevImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = this.galleryImages.length - 1;
    }
  }

  nextImage(): void {
    if (this.selectedImageIndex < this.galleryImages.length - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0;
    }
  }

  incrementQty(): void {
    if (!this.crop) return;
    if (this.selectedQty < this.crop.quantity) {
      this.selectedQty += 10;
      if (this.selectedQty > this.crop.quantity) this.selectedQty = this.crop.quantity;
      this.cdr.markForCheck();
    }
  }

  decrementQty(): void {
    if (this.selectedQty > 10) {
      this.selectedQty -= 10;
      this.cdr.markForCheck();
    }
  }

  get pricePerQuintal(): number {
    if (!this.crop) return 4200;
    return this.crop.pricePerKg * 100;
  }

  get estimatedTotal(): number {
    return this.selectedQty * this.pricePerQuintal;
  }

  openOrder(): void {
    const user = this.authService.currentUser;
    if (!user) {
      if (this.crop) {
        sessionStorage.setItem('pendingBuyCrop', JSON.stringify({
          cropId: this.crop.id,
          cropName: this.crop.commodity,
          farmerId: this.crop.farmerId,
          farmerName: this.crop.farmerName,
          quantity: this.selectedQty * 100,
          unitPrice: this.crop.pricePerKg,
          deliveryAddress: this.deliveryAddress || 'APMC Delivery Gate'
        }));
      }
      this.notifService.showToast('info', 'Please sign in to proceed with your crop purchase.');
      this.router.navigate(['/auth/login'], { queryParams: { redirect: 'payment', cropId: this.crop?.id || 1 } });
      return;
    }
    this.isOrderModalOpen = true;
  }

  openNegotiate(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.isNegotiateModalOpen = true;
  }

  submitOrder(): void {
    if (!this.crop) return;
    const user = this.authService.currentUser;
    if (!user) { this.router.navigate(['/auth/login']); return; }

    if (!this.deliveryAddress.trim()) {
      this.notifService.showToast('warning', 'Please enter a delivery address.');
      return;
    }

    const req: CreateOrderRequest = {
      dealerId: user.userId,
      farmerId: this.crop.farmerId,
      cropId: this.crop.id,
      cropName: this.crop.commodity,
      quantity: this.selectedQty * 100,
      unitPrice: this.crop.pricePerKg,
      deliveryAddress: this.deliveryAddress
    };

    this.orderService.createOrder(req).subscribe({
      next: (order) => {
        this.isOrderModalOpen = false;
        this.notifService.showToast('success', `Purchase order #${order.id} placed! Proceeding to payment...`);
        this.router.navigate(['/orders'], { queryParams: { payOrderId: order.id } });
      },
      error: () => {
        this.notifService.showToast('error', 'Failed to place purchase order. Please check your wallet balance.');
      }
    });
  }

  submitNegotiation(): void {
    if (!this.crop) return;
    const user = this.authService.currentUser;
    if (!user) { this.router.navigate(['/auth/login']); return; }

    const req: CreateNegotiationRequest = {
      buyerId: user.userId,
      sellerId: this.crop.farmerId,
      cropId: this.crop.id,
      targetPrice: this.negTargetPrice,
      quantity: this.selectedQty * 100
    };

    this.negotiationService.createNegotiation(req).subscribe({
      next: () => {
        this.isNegotiateModalOpen = false;
        this.notifService.showToast('success', `Counter offer of ₹${this.negTargetPrice}/kg sent to ${this.crop?.farmerName || 'Farmer'}!`);
        this.router.navigate(['/negotiations']);
      },
      error: () => {
        this.notifService.showToast('error', 'Failed to submit negotiation request.');
      }
    });
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
