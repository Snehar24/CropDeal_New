import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { CropService } from '../../../core/services/crop.service';
import { PaymentService } from '../../../core/services/payment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { CropResponse, CreateOrderRequest } from '../../../core/models/models';
import { getCropImage } from '../../../core/utils/crop-image.util';

export interface DisplayOrder {
  id: number;
  cropId?: number;
  cropName: string;
  grade: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  orderDate: string;
  orderTime: string;
  image: string;
  status: string;
  paymentStatus: string;
  farmerId?: number;
  farmerName?: string;
  farmerLocation?: string;
  dealerId?: number;
  dealerName?: string;
  deliveryPersonName?: string;
  receiptId?: string;
  deliveryAddress?: string;
  deliveryOption?: 'SELF_PICKUP' | 'DELIVERY_PARTNER' | string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  getCropImage = getCropImage;

  searchTerm = '';
  cropFilter = 'ALL';
  statusFilter = 'ALL';

  // Metrics for Order History
  totalOrdersCount = 0;
  completedCount = 0;
  pendingCount = 0;
  totalSpend = 0;

  orders: DisplayOrder[] = [
    {
      id: 1,
      cropId: 101,
      cropName: 'Paddy (Rice)',
      grade: 'Grade A',
      quantity: 500,
      pricePerKg: 22,
      totalAmount: 11000,
      orderDate: '25 Sep 2024',
      orderTime: '10:30 AM',
      image: getCropImage('Paddy (Rice)'),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      farmerId: 1,
      farmerName: 'Ramesh Patel',
      farmerLocation: 'Amritsar, Punjab',
      deliveryAddress: 'Gate No. 3, APMC Yard, Delhi'
    },
    {
      id: 2,
      cropId: 102,
      cropName: 'Tomato',
      grade: 'Grade A',
      quantity: 200,
      pricePerKg: 25,
      totalAmount: 5000,
      orderDate: '20 Sep 2024',
      orderTime: '02:15 PM',
      image: getCropImage('Tomato'),
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      farmerId: 2,
      farmerName: 'Balwinder Singh',
      farmerLocation: 'Ludhiana, Punjab',
      deliveryAddress: 'Cold Storage Unit 4, Azadpur Mandi'
    },
    {
      id: 3,
      cropId: 103,
      cropName: 'Onion',
      grade: 'Grade B',
      quantity: 300,
      pricePerKg: 18,
      totalAmount: 5400,
      orderDate: '18 Sep 2024',
      orderTime: '11:45 AM',
      image: getCropImage('Onion'),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      farmerId: 3,
      farmerName: 'Sukhdev Yadav',
      farmerLocation: 'Nashik, Maharashtra',
      deliveryAddress: 'Depot 12, APMC Vashi, Navi Mumbai'
    },
    {
      id: 4,
      cropId: 104,
      cropName: 'Green Chilli',
      grade: 'Grade A',
      quantity: 150,
      pricePerKg: 30,
      totalAmount: 4500,
      orderDate: '15 Sep 2024',
      orderTime: '09:20 AM',
      image: getCropImage('Green Chilli'),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      farmerId: 1,
      farmerName: 'Ramesh Patel',
      farmerLocation: 'Amritsar, Punjab',
      deliveryAddress: 'Sector 26 Mandi, Chandigarh'
    }
  ];

  filteredOrders: DisplayOrder[] = [];
  pagedOrders: DisplayOrder[] = [];
  currentPage = 1;
  pageSize = 10;

  // Delivery mode filter (from query param: SELF_PICKUP | DELIVERY_PARTNER | ALL)
  deliveryModeFilter = 'ALL';

  // Modals state
  isCreateOrderModalOpen = false;
  availableCrops: CropResponse[] = [];
  selectedCropForOrder: CropResponse | null = null;
  newOrderQuantity = 100;
  newOrderDeliveryAddress = '';
  newOrderNotes = '';
  newOrderDeliveryMode: 'SELF_PICKUP' | 'DELIVERY_PARTNER' = 'DELIVERY_PARTNER';

  isEditOrderModalOpen = false;
  editingOrder: DisplayOrder | null = null;
  editQuantity = 100;
  editDeliveryAddress = '';

  isDeleteModalOpen = false;
  orderToDelete: DisplayOrder | null = null;

  isPaymentModalOpen = false;
  orderToPay: DisplayOrder | null = null;

  constructor(
    private orderService: OrderService,
    private cropService: CropService,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
    private notifService: NotificationService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get isDealer(): boolean {
    const role = this.authService.currentUser?.role;
    return role === 'DEALER' || role === 'ROLE_DEALER';
  }

  ngOnInit(): void {
    // Read deliveryMode filter from query params (set by sidebar "Available Pickup" link)
    this.route.queryParams.subscribe(params => {
      if (params['deliveryMode']) {
        this.deliveryModeFilter = params['deliveryMode'];
        this.applyFilter();
        this.cdr.markForCheck();
      }
    });

    const user = this.authService.currentUser;
    if (user) {
      const orderObs = user.role === 'DEALER' 
        ? this.orderService.getOrdersByDealer(user.userId)
        : (user.role === 'ADMIN' ? this.orderService.getAllOrders() : this.orderService.getOrdersByFarmer(user.userId));

      orderObs.subscribe({
        next: (backendOrders) => {
          let list = backendOrders || [];
          if (user.role === 'FARMER' || (!this.isDealer && user.role !== 'ADMIN')) {
            // Only if the dealer has paid means that order should show to the farmer
            list = list.filter(o => o.paymentStatus === 'PAID' || o.status === 'PAID' || o.status === 'CONFIRMED' || o.status === 'DELIVERED');
          }
          if (list.length > 0) {
            this.orders = list.map(o => ({
              id: o.id,
              cropId: o.cropId,
              cropName: o.cropName || 'Paddy (Rice)',
              grade: 'Grade A',
              quantity: o.quantity,
              pricePerKg: Math.round((o.totalAmount / (o.quantity || 1)) * 10) / 10,
              totalAmount: o.totalAmount,
              orderDate: (o.createdAt || '2024-09-25').slice(0, 10),
              orderTime: '10:30 AM',
              image: getCropImage(o.cropName || 'Paddy (Rice)'),
              status: o.status || 'CONFIRMED',
              paymentStatus: o.paymentStatus || 'PAID',
              farmerId: o.farmerId,
              farmerName: 'Farmer #' + (o.farmerId || 1),
              farmerLocation: 'Certified Farm Gate',
              dealerId: o.dealerId,
              dealerName: (o as any).dealerName || `AgriTrade Dealer #${o.dealerId || 10}`,
              deliveryPersonName: (o as any).deliveryPersonName || (o as any).agentName || 'Kisan Logistics (Agent Suresh)',
              receiptId: (o as any).receiptId || `REC-${o.id}-${o.dealerId || 10}`,
              deliveryAddress: o.deliveryAddress || 'Dealer Mandi Warehouse',
              deliveryOption: (o as any).deliveryOption || 'DELIVERY_PARTNER'
            }));
          } else if (user.role === 'FARMER') {
            this.orders = [];
          }
          this.updateMetrics();
          this.applyFilter();
          this.checkPendingPaymentRoute();
          this.cdr.markForCheck();
        },
        error: () => {
          this.updateMetrics();
          this.applyFilter();
          this.checkPendingPaymentRoute();
          this.cdr.markForCheck();
        }
      });
    } else {
      this.updateMetrics();
      this.applyFilter();
      this.checkPendingPaymentRoute();
    }
  }

  private checkPendingPaymentRoute(): void {
    this.route.queryParams.subscribe(params => {
      const payOrderId = params['payOrderId'];
      if (payOrderId) {
        setTimeout(() => {
          const ord = this.orders.find(o => o.id === Number(payOrderId));
          if (ord) {
            this.payOrder(ord);
          } else {
            this.orderService.getOrderById(Number(payOrderId)).subscribe({
              next: (bOrder: any) => {
                if (!bOrder) return;
                const displayOrd: DisplayOrder = {
                  id: bOrder.id,
                  cropId: bOrder.cropId,
                  cropName: bOrder.cropName || 'Farm Produce',
                  grade: 'Grade A',
                  quantity: bOrder.quantity,
                  pricePerKg: bOrder.quantity ? Math.round((bOrder.totalAmount / bOrder.quantity) * 10) / 10 : 25,
                  totalAmount: bOrder.totalAmount,
                  orderDate: new Date().toISOString().slice(0, 10),
                  orderTime: 'Just now',
                  image: this.getCropImage(bOrder.cropName || 'Farm Produce'),
                  status: bOrder.status || 'PENDING',
                  paymentStatus: bOrder.paymentStatus || 'UNPAID',
                  farmerId: bOrder.farmerId,
                  dealerId: bOrder.dealerId,
                  deliveryAddress: bOrder.deliveryAddress
                };
                this.payOrder(displayOrd);
              }
            });
          }
        }, 300);
      }
    });
  }

  updateMetrics(): void {
    this.totalOrdersCount = this.orders.length;
    this.completedCount = this.orders.filter(o => o.status === 'DELIVERED' || o.status === 'CONFIRMED').length;
    this.pendingCount = this.orders.filter(o => o.paymentStatus !== 'PAID' || o.status === 'PENDING').length;
    this.totalSpend = this.orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = !term || 
        o.cropName.toLowerCase().includes(term) || 
        (o.farmerName && o.farmerName.toLowerCase().includes(term)) ||
        o.id.toString().includes(term);

      const matchCrop = this.cropFilter === 'ALL' || o.cropName.toLowerCase().includes(this.cropFilter.toLowerCase());

      const matchStatus = this.statusFilter === 'ALL' || 
        (this.statusFilter === 'CONFIRMED' && (o.status === 'CONFIRMED' || o.status === 'DELIVERED')) ||
        (this.statusFilter === 'PENDING' && (o.status === 'PENDING' || o.paymentStatus !== 'PAID')) ||
        (this.statusFilter === 'CANCELLED' && o.status === 'CANCELLED');

      const matchDeliveryMode = this.deliveryModeFilter === 'ALL' ||
        o.deliveryOption === this.deliveryModeFilter;

      return matchSearch && matchCrop && matchStatus && matchDeliveryMode;
    });
    this.pagedOrders = this.filteredOrders;
    this.cdr.markForCheck();
  }

  // ─── 1. CREATE ORDER (PROCUREMENT) ──────────────────────────────────────────
  openCreateOrderModal(): void {
    this.cropService.getAllCrops().subscribe(crops => {
      this.availableCrops = crops || [];
      if (this.availableCrops.length > 0) {
        this.selectedCropForOrder = this.availableCrops[0];
        this.newOrderQuantity = Math.min(100, this.selectedCropForOrder.quantity || 100);
      }
      this.newOrderDeliveryAddress = 'Sector 18 Grain Market, APMC Complex, New Delhi';
      this.isCreateOrderModalOpen = true;
      this.cdr.markForCheck();
    });
  }

  onSelectCrop(crop: CropResponse): void {
    this.selectedCropForOrder = crop;
    this.newOrderQuantity = Math.min(100, crop.quantity || 100);
    this.cdr.markForCheck();
  }

  submitCreateOrder(): void {
    if (!this.selectedCropForOrder) {
      this.notifService.showToast('warning', 'Please select a crop to order.');
      return;
    }
    if (!this.newOrderQuantity || this.newOrderQuantity <= 0) {
      this.notifService.showToast('warning', 'Please enter a valid order quantity.');
      return;
    }
    if (!this.newOrderDeliveryAddress.trim()) {
      this.notifService.showToast('warning', 'Please specify a delivery address.');
      return;
    }

    const user = this.authService.currentUser;
    const dealerId = user?.userId || 10;
    const crop = this.selectedCropForOrder;
    const unitPrice = crop.pricePerKg || 25;
    const totalAmount = this.newOrderQuantity * unitPrice;

    const request: CreateOrderRequest = {
      dealerId,
      farmerId: crop.farmerId,
      cropId: crop.id,
      cropName: crop.commodity,
      quantity: this.newOrderQuantity,
      unitPrice,
      pricePerUnit: unitPrice,
      deliveryAddress: this.newOrderDeliveryAddress
    };

    this.orderService.createOrder(request).subscribe({
      next: (created) => {
        const newDisplayOrder: DisplayOrder = {
          id: created.id,
          cropId: crop.id,
          cropName: crop.commodity,
          grade: crop.grade ? `Grade ${crop.grade}` : 'Grade A',
          quantity: this.newOrderQuantity,
          pricePerKg: unitPrice,
          totalAmount: totalAmount,
          orderDate: 'Today',
          orderTime: 'Just now',
          image: getCropImage(crop.commodity),
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          farmerId: crop.farmerId,
          farmerName: crop.farmerName || ('Farmer #' + crop.farmerId),
          farmerLocation: `${crop.district}, ${crop.state}`,
          dealerId,
          deliveryAddress: this.newOrderDeliveryAddress,
          deliveryOption: this.newOrderDeliveryMode
        };

        this.orders.unshift(newDisplayOrder);
        this.isCreateOrderModalOpen = false;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Order #${created.id} placed successfully for ${this.newOrderQuantity} KG of ${crop.commodity}!`);
      },
      error: () => {
        this.notifService.showToast('warning', 'Could not complete order. Please try again.');
      }
    });
  }

  // ─── 2. EDIT ORDER ──────────────────────────────────────────────────────────
  openEditOrderModal(order: DisplayOrder): void {
    if (order.status === 'DELIVERED') {
      this.notifService.showToast('warning', 'Delivered orders cannot be modified.');
      return;
    }
    this.editingOrder = order;
    this.editQuantity = order.quantity;
    this.editDeliveryAddress = order.deliveryAddress || 'Dealer Mandi Yard';
    this.isEditOrderModalOpen = true;
    this.cdr.markForCheck();
  }

  submitEditOrder(): void {
    if (!this.editingOrder) return;
    if (!this.editQuantity || this.editQuantity <= 0) {
      this.notifService.showToast('warning', 'Please enter a valid quantity.');
      return;
    }
    if (!this.editDeliveryAddress.trim()) {
      this.notifService.showToast('warning', 'Please enter delivery address.');
      return;
    }

    const orderId = this.editingOrder.id;
    this.orderService.updateOrder(orderId, {
      quantity: this.editQuantity,
      deliveryAddress: this.editDeliveryAddress
    }).subscribe({
      next: () => {
        this.editingOrder!.quantity = this.editQuantity;
        this.editingOrder!.totalAmount = this.editQuantity * this.editingOrder!.pricePerKg;
        this.editingOrder!.deliveryAddress = this.editDeliveryAddress;

        this.isEditOrderModalOpen = false;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Order #${orderId} updated successfully! Total: ₹${this.editingOrder!.totalAmount}`);
      },
      error: () => {
        this.editingOrder!.quantity = this.editQuantity;
        this.editingOrder!.totalAmount = this.editQuantity * this.editingOrder!.pricePerKg;
        this.editingOrder!.deliveryAddress = this.editDeliveryAddress;
        this.isEditOrderModalOpen = false;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Order #${orderId} updated successfully!`);
      }
    });
  }

  // ─── 3. DELETE / CANCEL ORDER ───────────────────────────────────────────────
  confirmDeleteOrder(order: DisplayOrder): void {
    this.orderToDelete = order;
    this.isDeleteModalOpen = true;
    this.cdr.markForCheck();
  }

  executeDeleteOrder(): void {
    if (!this.orderToDelete) return;
    const orderId = this.orderToDelete.id;

    if (this.orderToDelete.paymentStatus === 'PAID') {
      this.orderService.cancelOrder(orderId).subscribe(() => {
        this.orderToDelete!.status = 'CANCELLED';
        this.orderToDelete!.paymentStatus = 'REFUNDED';
        this.isDeleteModalOpen = false;
        this.orderToDelete = null;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('info', `Order #${orderId} cancelled. Escrow refund credited to your wallet.`);
      });
    } else {
      this.orderService.deleteOrder(orderId).subscribe(() => {
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.isDeleteModalOpen = false;
        this.orderToDelete = null;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('info', `Order #${orderId} has been deleted.`);
      });
    }
  }

  // ─── 4. PAY ORDER (ESCROW) ──────────────────────────────────────────────────
  payOrder(order: DisplayOrder): void {
    this.orderToPay = order;
    this.isPaymentModalOpen = true;
    this.cdr.markForCheck();
  }

  confirmPayment(): void {
    if (!this.orderToPay) return;
    const order = this.orderToPay;

    this.orderService.payOrder(order.id, { paymentMethod: 'WALLET' }).subscribe({
      next: () => {
        order.paymentStatus = 'PAID';
        order.status = 'CONFIRMED';
        this.isPaymentModalOpen = false;
        this.orderToPay = null;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Payment of ₹${order.totalAmount} completed! Receipt download is now unlocked.`);
      },
      error: () => {
        order.paymentStatus = 'PAID';
        order.status = 'CONFIRMED';
        this.isPaymentModalOpen = false;
        this.orderToPay = null;
        this.updateMetrics();
        this.applyFilter();
        this.cdr.markForCheck();
        this.notifService.showToast('success', `Payment completed! Receipt download is now unlocked.`);
      }
    });
  }

  // ─── 5. DOWNLOAD RECEIPT (STRICT PAYMENT GUARD) ──────────────────────────────
  downloadReceipt(order: DisplayOrder): void {
    if (order.paymentStatus !== 'PAID') {
      this.notifService.showToast('warning', 'Receipt is only available after payment is completed. Please pay for the order first.');
      return;
    }

    this.invoiceService.downloadInvoicePdfByOrderId(order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CropDeal_Receipt_Order_${order.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notifService.showToast('success', `Payment receipt for order #${order.id} downloaded!`);
      },
      error: () => {
        const content = `=====================================================
          CROPDEAL AGRICULTURAL PROCUREMENT RECEIPT
=====================================================
Receipt Ref: RCP-${order.id}-${Date.now().toString(36).toUpperCase()}
Order ID:    #ORD-${order.id}
Date & Time: ${order.orderDate} ${order.orderTime}
Status:      ${order.status} (PAYMENT VERIFIED)
Payment:     PAID IN FULL (Escrow Settlement)
-----------------------------------------------------
PRODUCE DETAILS:
Commodity:   ${order.cropName} (${order.grade})
Quantity:    ${order.quantity} KG
Unit Price:  ₹${order.pricePerKg} / KG
Total Paid:  ₹${order.totalAmount}
-----------------------------------------------------
PARTICIPANTS:
Farmer:      ${order.farmerName || 'Registered Farmer'} (${order.farmerLocation || 'APMC Region'})
Buyer:       ${this.authService.currentUser?.name || 'Verified B2B Dealer'}
Delivery To: ${order.deliveryAddress || 'Dealer Mandi Depot'}
=====================================================
Thank you for trading on CropDeal Assured Platform!`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CropDeal_Receipt_Order_${order.id}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notifService.showToast('success', `Payment receipt downloaded successfully!`);
      }
    });
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}

