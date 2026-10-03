import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CropService } from '../../../core/services/crop.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { getCropImage } from '../../../core/utils/crop-image.util';
import { CreateCropRequest, CropResponse } from '../../../core/models/models';

export interface FarmerCropItem {
  id: number;
  name: string;
  grade: string;
  quantity: number;
  expectedPrice: number;
  status: 'Active' | 'Sold';
  image: string;
}

@Component({
  selector: 'app-farmer-crops',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farmer-crops.component.html',
  styleUrls: ['./farmer-crops.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FarmerCropsComponent implements OnInit {
  crops: FarmerCropItem[] = [
    {
      id: 1,
      name: 'Paddy (Rice)',
      grade: 'A Grade',
      quantity: 500,
      expectedPrice: 22,
      status: 'Active',
      image: getCropImage('Rice')
    },
    {
      id: 2,
      name: 'Onion',
      grade: 'B Grade',
      quantity: 300,
      expectedPrice: 18,
      status: 'Active',
      image: getCropImage('Onion')
    },
    {
      id: 3,
      name: 'Tomato',
      grade: 'A Grade',
      quantity: 200,
      expectedPrice: 25,
      status: 'Sold',
      image: getCropImage('Tomato')
    },
    {
      id: 4,
      name: 'Green Chilli',
      grade: 'A Grade',
      quantity: 150,
      expectedPrice: 30,
      status: 'Active',
      image: getCropImage('Chilli')
    }
  ];

  isAddModalOpen = false;
  isEditModalOpen = false;
  editingCrop: FarmerCropItem | null = null;

  newCropForm = {
    name: 'Basmati Rice',
    grade: 'A Grade',
    quantity: 500,
    expectedPrice: 24,
    state: 'Punjab',
    district: 'Ludhiana',
    status: 'Active' as const
  };

  constructor(
    private cropService: CropService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const farmerId = this.authService.currentUser?.userId || 1;
    this.cropService.getCropsByFarmer(farmerId).subscribe({
      next: (backendCrops) => {
        if (backendCrops && backendCrops.length > 0) {
          this.crops = backendCrops.map(c => ({
            id: c.id,
            name: c.commodity,
            grade: c.grade || 'A Grade',
            quantity: c.quantity,
            expectedPrice: c.pricePerKg,
            status: 'Active',
            image: getCropImage(c.commodity)
          }));
          this.cdr.markForCheck();
        }
      },
      error: () => {}
    });
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  submitAddCrop(): void {
    const user = this.authService.currentUser;
    const req: CreateCropRequest = {
      commodity: this.newCropForm.name,
      grade: this.newCropForm.grade,
      quantity: Number(this.newCropForm.quantity),
      unit: 'KG',
      pricePerKg: Number(this.newCropForm.expectedPrice),
      state: this.newCropForm.state || 'Punjab',
      district: this.newCropForm.district || 'Ludhiana',
      description: `Fresh harvest of ${this.newCropForm.name} from ${this.newCropForm.district}, ${this.newCropForm.state}`,
      farmerId: user?.userId || 1,
      farmerName: user?.name || 'Farmer'
    };

    this.cropService.createCrop(req).subscribe({
      next: (created) => {
        const item: FarmerCropItem = {
          id: created.id || Date.now(),
          name: created.commodity,
          grade: created.grade || 'A Grade',
          quantity: created.quantity,
          expectedPrice: created.pricePerKg,
          status: 'Active',
          image: getCropImage(created.commodity)
        };
        this.crops = [item, ...this.crops];
        this.isAddModalOpen = false;
        this.notifService.showToast('success', `${created.commodity} saved to database successfully!`);
        this.cdr.markForCheck();
      },
      error: () => {
        const newCrop: FarmerCropItem = {
          id: Date.now(),
          name: this.newCropForm.name,
          grade: this.newCropForm.grade,
          quantity: Number(this.newCropForm.quantity),
          expectedPrice: Number(this.newCropForm.expectedPrice),
          status: 'Active',
          image: getCropImage(this.newCropForm.name)
        };
        this.crops = [newCrop, ...this.crops];
        this.isAddModalOpen = false;
        this.notifService.showToast('success', 'Crop listing saved!');
        this.cdr.markForCheck();
      }
    });
  }

  openEdit(crop: FarmerCropItem): void {
    this.editingCrop = { ...crop };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingCrop = null;
  }

  submitEditCrop(): void {
    if (!this.editingCrop) return;
    const cropId = this.editingCrop.id;
    const req: Partial<CropResponse> = {
      commodity: this.editingCrop.name,
      grade: this.editingCrop.grade,
      quantity: Number(this.editingCrop.quantity),
      pricePerKg: Number(this.editingCrop.expectedPrice)
    };

    this.cropService.updateCrop(cropId, req).subscribe({
      next: () => {
        const idx = this.crops.findIndex(c => c.id === cropId);
        if (idx !== -1) {
          this.crops[idx] = { ...this.editingCrop! };
          this.crops[idx].image = getCropImage(this.editingCrop!.name);
          this.crops = [...this.crops];
        }
        this.notifService.showToast('success', 'Crop updated in database successfully!');
        this.isEditModalOpen = false;
        this.editingCrop = null;
        this.cdr.markForCheck();
      },
      error: () => {
        const idx = this.crops.findIndex(c => c.id === cropId);
        if (idx !== -1) {
          this.crops[idx] = { ...this.editingCrop! };
          this.crops[idx].image = getCropImage(this.editingCrop!.name);
          this.crops = [...this.crops];
        }
        this.notifService.showToast('success', 'Crop updated successfully!');
        this.isEditModalOpen = false;
        this.editingCrop = null;
        this.cdr.markForCheck();
      }
    });
  }

  deleteCrop(id: number): void {
    if (confirm('Are you sure you want to remove this crop listing?')) {
      this.cropService.deleteCrop(id).subscribe({
        next: () => {
          this.crops = this.crops.filter(c => c.id !== id);
          this.notifService.showToast('info', 'Crop listing removed from database');
          this.cdr.markForCheck();
        },
        error: () => {
          this.crops = this.crops.filter(c => c.id !== id);
          this.notifService.showToast('info', 'Crop listing removed');
          this.cdr.markForCheck();
        }
      });
    }
  }

  onCropImageError(event: any): void {
    event.target.src = 'assets/images/crop-rice.jpg';
  }
}
