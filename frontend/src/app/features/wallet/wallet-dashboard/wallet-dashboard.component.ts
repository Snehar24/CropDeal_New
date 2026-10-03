import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { WalletResponse, WalletTransactionResponse } from '../../../core/models/models';

export interface DisplayTx {
  id: number;
  date: string;
  time: string;
  type: 'ADDED' | 'USED';
  description: string;
  amount: number;
  balance: number;
}

@Component({
  selector: 'app-wallet-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wallet-dashboard.component.html',
  styleUrls: ['./wallet-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletDashboardComponent implements OnInit, OnDestroy {
  balance = 0;
  totalAdded = 0;
  totalUsed = 0;

  actionTab: 'topup' | 'spend' = 'topup';
  addAmount: number | null = null;
  spendAmount: number | null = null;
  spendReason: string = '';

  selectedTxFilter: 'ALL' | 'ADDED' | 'USED' = 'ALL';
  allTransactions: DisplayTx[] = [];
  filteredTransactions: DisplayTx[] = [];

  private walletSub?: Subscription;

  constructor(
    private paymentService: PaymentService,
    private notifService: NotificationService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWalletData();

    // Reactively refresh whenever wallet changes (orders, bids, top-up, spend)
    this.walletSub = this.paymentService.walletUpdated$.subscribe(() => {
      this.loadWalletData(false);
    });
  }

  ngOnDestroy(): void {
    if (this.walletSub) {
      this.walletSub.unsubscribe();
    }
  }

  get currentUserId(): number {
    const user = this.authService.currentUser;
    if (user?.userId) return user.userId;
    // Fallback role default IDs
    const role = this.authService.currentRole;
    if (role === 'DEALER') return 8;
    if (role === 'DELIVERY_PARTNER') return 9;
    if (role === 'ADMIN') return 99;
    return 1; // Farmer
  }

  loadWalletData(showToast = false): void {
    const uid = this.currentUserId;
    this.paymentService.getWallet(uid).subscribe({
      next: (w: WalletResponse) => {
        if (w) {
          this.balance = w.balance || 0;
          this.formatTransactions(w.transactions || []);
          this.calculateStats();
          if (showToast) {
            this.notifService.showToast('info', 'Wallet balance refreshed.');
          }
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  private formatTransactions(rawTx: WalletTransactionResponse[]): void {
    let runningBalance = this.balance;
    const sorted = [...rawTx].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.allTransactions = sorted.map((tx, idx) => {
      const isPositive = Number(tx.amount) > 0;
      const d = new Date(tx.createdAt || Date.now());
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      const txItem: DisplayTx = {
        id: tx.id || idx + 1,
        date: dateStr,
        time: timeStr,
        type: isPositive ? 'ADDED' : 'USED',
        description: tx.description || (isPositive ? 'Wallet Credit / Settlement' : 'Wallet Debit / Spend'),
        amount: Math.abs(Number(tx.amount)),
        balance: runningBalance
      };

      // Back-calculate running balance for previous rows
      runningBalance = Math.max(0, runningBalance - Number(tx.amount));
      return txItem;
    });

    this.applyTxFilter();
  }

  private calculateStats(): void {
    let added = 0;
    let used = 0;
    for (const tx of this.allTransactions) {
      if (tx.type === 'ADDED') added += tx.amount;
      else used += tx.amount;
    }
    this.totalAdded = added;
    this.totalUsed = used;
  }

  applyTxFilter(): void {
    if (this.selectedTxFilter === 'ALL') {
      this.filteredTransactions = [...this.allTransactions];
    } else {
      this.filteredTransactions = this.allTransactions.filter(t => t.type === this.selectedTxFilter);
    }
    this.cdr.markForCheck();
  }

  refresh(): void {
    this.loadWalletData(true);
  }

  submitAddMoney(): void {
    if (!this.addAmount || this.addAmount <= 0) {
      this.notifService.showToast('warning', 'Please enter a valid amount to add.');
      return;
    }
    const amt = Number(this.addAmount);
    const uid = this.currentUserId;

    this.paymentService.topUpWallet({
      userId: uid,
      amount: amt,
      paymentMethod: 'UPI'
    }).subscribe({
      next: updated => {
        this.balance = updated.balance;
        this.notifService.showToast('success', `₹${amt.toLocaleString()} added to your wallet successfully!`);
        this.addAmount = null;
        this.loadWalletData();
      },
      error: () => {
        this.notifService.showToast('error', 'Failed to add money. Please try again.');
      }
    });
  }

  submitSpendMoney(): void {
    if (!this.spendAmount || this.spendAmount <= 0) {
      this.notifService.showToast('warning', 'Please enter a valid amount to spend or withdraw.');
      return;
    }
    const amt = Number(this.spendAmount);
    if (amt > this.balance) {
      this.notifService.showToast('warning', `Insufficient wallet balance. You only have ₹${this.balance.toLocaleString()} available.`);
      return;
    }

    const uid = this.currentUserId;
    const reason = this.spendReason.trim() || 'Wallet Spend / Withdrawal to Bank';

    this.paymentService.debitWallet({
      userId: uid,
      amount: amt,
      referenceId: 'SPEND-' + Date.now(),
      transactionType: 'DEBIT',
      description: reason
    }).subscribe({
      next: updated => {
        this.balance = updated.balance;
        this.notifService.showToast('success', `₹${amt.toLocaleString()} spent/withdrawn successfully! New Balance: ₹${this.balance.toLocaleString()}`);
        this.spendAmount = null;
        this.spendReason = '';
        this.loadWalletData();
      },
      error: () => {
        this.notifService.showToast('error', 'Transaction could not be completed.');
      }
    });
  }
}
