import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { AuctionSocketService } from '../../services/auctionSocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  purchased: AuctionDTO[] = [];
  sold: AuctionDTO[] = [];
  usernames: Record<string, string> = {};

  private username?: string;
  private subs: Subscription[] = [];

  constructor(
    private auctionService: AuctionService,
    private http: HttpClient,
    private router: Router,
    private auctionSocket: AuctionSocketService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || undefined;

    if (!this.username) {
      console.log('[TransactionHistory] esperando username...');
      return;
    }

    this.fetchHistory();

    // 🔹 Conectar sockets
    this.auctionSocket.connect();

    // 🔹 Escuchar transacciones nuevas
    this.subs.push(
      this.auctionSocket.onTransactionCreated().subscribe(() => {
        this.fetchHistory();
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.auctionSocket.disconnect();
  }

  async fetchHistory() {
    if (!this.username) return;

    try {
      const [purchasedRes, soldRes] = await Promise.all([
        this.auctionService.getPurchasedAuctions(this.username),
        this.auctionService.getSoldAuctions(this.username)
      ]);

      console.log('[fetchHistory] purchased:', purchasedRes);
      console.log('[fetchHistory] sold:', soldRes);

      this.purchased = purchasedRes ?? [];
      this.sold = soldRes ?? [];

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
      const res = await this.http.get<{ username: string }>(
        `${environment.api.base}/users/${id}`
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
