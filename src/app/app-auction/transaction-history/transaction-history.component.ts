import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-history.component.html'
})
export class TransactionHistoryComponent implements OnInit {
  purchased: AuctionDTO[] = [];
  sold: AuctionDTO[] = [];
  usernames: Record<string, string> = {};

  private token?: string;
  private userId?: string;

  constructor(
    private auctionService: AuctionService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = localStorage.getItem('token') || undefined;
    this.userId = localStorage.getItem('userId') || undefined;

    if (!this.token || !this.userId) {
      console.log('[TransactionHistory] esperando token/userId...');
      return;
    }

    this.fetchHistory();
  }

  async fetchHistory() {
    try {
      const [purchasedRes, soldRes] = await Promise.all([
        this.auctionService.getPurchasedAuctions(this.userId!, this.token),
        this.auctionService.getSoldAuctions(this.userId!, this.token)
      ]);

      this.purchased = Array.isArray(purchasedRes) ? purchasedRes : (purchasedRes as any).data ?? [];
      this.sold = Array.isArray(soldRes) ? soldRes : (soldRes as any).data ?? [];

      const ids = Array.from(new Set([
        ...this.purchased.map(a => a.item?.userId).filter(Boolean) as string[],
        ...this.sold.map(a => a.highestBidderId).filter(Boolean) as string[]
      ]));

      await Promise.all(ids.map(async id => {
        if (!this.usernames[id]) {
          this.usernames[id] = await this.fetchUsername(id);
        }
      }));

    } catch (err) {
      console.error('[TransactionHistory] Error fetching history', err);
    }
  }

  private async fetchUsername(id: string): Promise<string> {
    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      const res = await this.http.get<{ username: string }>(
        `${environment.api.base}/users/${id}`,
        { headers }
      ).toPromise();
      return res?.username || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  getSellerName(a: AuctionDTO) {
    return a.item?.userId ? this.usernames[a.item.userId] || '...' : 'N/A';
  }

  getBuyerName(a: AuctionDTO) {
    return a.highestBidderId ? this.usernames[a.highestBidderId] || '...' : 'N/A';
  }

  // 🔹 Métodos de navegación
  goToComprar() { this.router.navigate(['/auctions']); }
  goToVender() { this.router.navigate(['/auctions/vender']); }
  goToRecoger() { this.router.navigate(['/auctions/recoger']); }
  goToMisPujas() { this.router.navigate(['/auctions/mis-pujas']); }
}
