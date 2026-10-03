import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FarmerResponse } from '../../../core/models/models';

export type UserRole = 'FARMER' | 'DEALER' | 'DELIVERY_PARTNER' | 'ADMIN';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyProfileComponent implements OnInit {
  selectedTab: 'personal' | 'address' | 'bank' | 'password' = 'personal';

  currentRole: UserRole = 'FARMER';
  farmer: FarmerResponse | null = null;

  // Edit mode state for in-place profile modification
  isEditing: boolean = false;
  private backupProfile: any = null;

  // General profile fields (role-tailored)
  profile = {
    name: '',
    email: '',
    phone: '',
    dob: '12 Jan 1990',
    gender: 'Male',
    // Farmer specific
    farmerType: 'Individual Farmer',
    landHolding: '4.5 Acres (Irrigated)',
    kisanCardNumber: 'KCC-9824-7712',
    aadhaar: '5412 8765 1234',
    // Dealer specific
    businessName: 'Sharma Agri Exports & Trading Pvt Ltd',
    dealerCategory: 'Wholesale Merchant',
    gstin: '33AAAAA0000A1Z5',
    tradeLicense: 'APMC-TN-ERD-8821',
    panNumber: 'AAACS1234F',
    // Admin specific
    employeeId: 'CD-ADM-001',
    department: 'Central Mandi Board & Platform Oversight',
    securityClearance: 'Tier-1 Root Security Clearance (Sole Superuser)',
    systemAccessLevel: 'Single Master Administrator (Additional Admins Restricted)',
    // Delivery partner specific
    fleetAgencyName: 'Kisan Freight & Agri Logistics Express',
    vehicleNumber: 'TN 33 AB 1234',
    vehicleType: '16-Ton Eicher Canter / Refrig Cargo',
    drivingLicense: 'DL-98202400192',
    operationalTerritory: 'Tamil Nadu - Karnataka Agri Corridor'
  };

  showAadhaar = false;
  showGstin = false;

  // Address Form (role-tailored)
  address = {
    line1: '123, North Street',
    line2: 'Pallipalayam',
    city: 'Erode',
    state: 'Tamil Nadu',
    pincode: '638006'
  };

  // Bank Form
  bank = {
    holderName: '',
    bankName: 'State Bank of India',
    accountNumber: '987654321234',
    ifsc: 'SBIN0001234',
    accountType: 'Savings Account'
  };
  showAccount = false;

  // Password Form
  password = {
    current: '',
    newPass: '',
    confirmPass: ''
  };
  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.currentRole = (user?.role as UserRole) || 'FARMER';

    this.initializeProfileForRole(this.currentRole, user);

    // If farmer, also fetch backend info if available
    if (this.currentRole === 'FARMER') {
      this.userService.getFarmerMe().subscribe({
        next: f => {
          this.farmer = f;
          if (f.name) this.profile.name = f.name;
          if (f.phone) this.profile.phone = f.phone;
          if (f.address) this.address.line1 = f.address;
          this.cdr.markForCheck();
        },
        error: () => {}
      });
    }
  }

  private initializeProfileForRole(role: UserRole, user: any): void {
    // Check local storage for previously saved custom profile
    const saved = localStorage.getItem(`cropdeal_profile_${role}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.profile = { ...this.profile, ...parsed.profile };
        this.address = { ...this.address, ...parsed.address };
        this.bank = { ...this.bank, ...parsed.bank };
        this.cdr.markForCheck();
        return;
      } catch {
        /* fallback to defaults */
      }
    }

    if (role === 'DEALER') {
      this.profile.name = user?.name || 'Rajesh Sharma';
      this.profile.email = user?.email || 'dealer@agritrade.com';
      this.profile.phone = '+91 91234 56789';
      this.profile.businessName = 'Sharma Agri Trading & Exports Pvt Ltd';
      this.profile.dealerCategory = 'Wholesale Merchant';
      this.profile.gstin = '33AAAAA0000A1Z5';
      this.profile.tradeLicense = 'APMC-TN-ERD-8821';
      this.profile.panNumber = 'AAACS1234F';

      this.address.line1 = 'Plot No. 44, APMC Market Yard Complex';
      this.address.line2 = 'Perundurai Road';
      this.address.city = 'Erode';
      this.address.state = 'Tamil Nadu';
      this.address.pincode = '638052';

      this.bank.holderName = 'Sharma Agri Trading Pvt Ltd';
      this.bank.bankName = 'HDFC Bank';
      this.bank.accountNumber = '50200034189021';
      this.bank.ifsc = 'HDFC0001245';
      this.bank.accountType = 'Current Account';
    } else if (role === 'ADMIN') {
      this.profile.name = user?.name || 'CropDeal Super Administrator';
      this.profile.email = 'admin@cropdeal.com';
      this.profile.phone = '+91 1800 276 7332';
      this.profile.employeeId = 'CD-ADM-001';
      this.profile.department = 'Platform Operations & APMC Mandi Oversight';
      this.profile.securityClearance = 'Tier-1 Root Security Clearance';
      this.profile.systemAccessLevel = 'Single Master Administrator (Additional Admins Restricted)';

      this.address.line1 = 'National Agri-Exchange Tower, 8th Floor';
      this.address.line2 = 'Barakhamba Road, Connaught Place';
      this.address.city = 'New Delhi';
      this.address.state = 'Delhi';
      this.address.pincode = '110001';

      this.bank.holderName = 'CropDeal Agri Solutions Escrow Trust';
      this.bank.bankName = 'State Bank of India';
      this.bank.accountNumber = '300188941029';
      this.bank.ifsc = 'SBIN0000691';
      this.bank.accountType = 'Current Account';
    } else if (role === 'DELIVERY_PARTNER') {
      this.profile.name = user?.name || 'Vikram Singh Logistics';
      this.profile.email = user?.email || 'agent@kisanlogistics.com';
      this.profile.phone = '+91 98980 12345';
      this.profile.fleetAgencyName = 'GreenLine Agri Freight & Express Fleet';
      this.profile.vehicleNumber = 'TN 33 AB 1234';
      this.profile.vehicleType = '16-Ton Eicher Canter / Refrig Cargo';
      this.profile.drivingLicense = 'DL-98202400192';
      this.profile.operationalTerritory = 'Tamil Nadu - Karnataka Agri Corridor';

      this.address.line1 = 'Truck Terminal Yard 3, NH-544 Bypass';
      this.address.line2 = 'Chithode Post';
      this.address.city = 'Erode';
      this.address.state = 'Tamil Nadu';
      this.address.pincode = '638102';

      this.bank.holderName = 'Vikram Singh Logistics';
      this.bank.bankName = 'ICICI Bank';
      this.bank.accountNumber = '109205003412';
      this.bank.ifsc = 'ICIC0001092';
      this.bank.accountType = 'Current Account';
    } else {
      // Default: FARMER
      this.profile.name = user?.name || 'Ramesh Kumar';
      this.profile.email = user?.email || 'ramesh.farmer@cropdeal.com';
      this.profile.phone = '+91 98765 43210';
      this.profile.farmerType = 'Individual Farmer';
      this.profile.landHolding = '4.5 Acres (Irrigated)';
      this.profile.kisanCardNumber = 'KCC-9824-7712';
      this.profile.aadhaar = '5412 8765 1234';

      this.address.line1 = '123, North Street, Farmland Sector';
      this.address.line2 = 'Pallipalayam';
      this.address.city = 'Erode';
      this.address.state = 'Tamil Nadu';
      this.address.pincode = '638006';

      this.bank.holderName = this.profile.name;
      this.bank.bankName = 'State Bank of India';
      this.bank.accountNumber = '987654321234';
      this.bank.ifsc = 'SBIN0001234';
      this.bank.accountType = 'Savings Account';
    }
  }

  enableEditMode(): void {
    this.backupProfile = {
      profile: JSON.parse(JSON.stringify(this.profile)),
      address: JSON.parse(JSON.stringify(this.address)),
      bank: JSON.parse(JSON.stringify(this.bank))
    };
    this.isEditing = true;
    this.notifService.showToast('info', 'Edit mode enabled. You can now modify your profile fields.');
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    if (this.backupProfile) {
      this.profile = JSON.parse(JSON.stringify(this.backupProfile.profile));
      this.address = JSON.parse(JSON.stringify(this.backupProfile.address));
      this.bank = JSON.parse(JSON.stringify(this.backupProfile.bank));
    }
    this.isEditing = false;
    this.notifService.showToast('info', 'Profile changes discarded.');
    this.cdr.markForCheck();
  }

  saveAllChanges(): void {
    this.persistProfile();
    // Update active user in session if name changed
    const currUser = this.authService.currentUser;
    if (currUser && this.profile.name && currUser.name !== this.profile.name) {
      const updatedUser = { ...currUser, name: this.profile.name };
      try {
        sessionStorage.setItem('cropdeal_user', JSON.stringify(updatedUser));
      } catch {}
    }
    this.isEditing = false;
    this.notifService.showToast('success', `${this.getRoleLabel()} profile details saved successfully!`);
    this.cdr.markForCheck();
  }

  savePersonal(): void {
    this.persistProfile();
    this.isEditing = false;
    this.notifService.showToast('success', `${this.getRoleLabel()} profile information updated successfully!`);
    this.cdr.markForCheck();
  }

  saveAddress(): void {
    this.persistProfile();
    this.isEditing = false;
    this.notifService.showToast('success', 'Address details saved successfully!');
    this.cdr.markForCheck();
  }

  saveBank(): void {
    this.persistProfile();
    this.isEditing = false;
    this.notifService.showToast('success', 'Bank account details updated successfully!');
    this.cdr.markForCheck();
  }

  private persistProfile(): void {
    const payload = {
      profile: this.profile,
      address: this.address,
      bank: this.bank
    };
    localStorage.setItem(`cropdeal_profile_${this.currentRole}`, JSON.stringify(payload));
  }

  savePassword(): void {
    if (!this.password.current || !this.password.newPass) {
      this.notifService.showToast('warning', 'Please fill in current and new password.');
      return;
    }
    if (this.password.newPass !== this.password.confirmPass) {
      this.notifService.showToast('error', 'New passwords do not match.');
      return;
    }
    this.notifService.showToast('success', 'Password updated successfully!');
    this.password = { current: '', newPass: '', confirmPass: '' };
  }

  getRoleLabel(): string {
    switch (this.currentRole) {
      case 'DEALER': return 'Dealer / Bulk Buyer';
      case 'ADMIN': return 'Super Administrator';
      case 'DELIVERY_PARTNER': return 'Logistics Transporter';
      default: return 'Farmer';
    }
  }

  getRoleBadge(): string {
    switch (this.currentRole) {
      case 'DEALER': return 'Verified APMC Dealer';
      case 'ADMIN': return 'Root System Authority';
      case 'DELIVERY_PARTNER': return 'Verified Fleet Operator';
      default: return 'Verified Farmer';
    }
  }
}
