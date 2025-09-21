import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuctionCardComponent } from '../auction-card/auction-card.component';
import { AuctionDetailsComponent } from '../auction-details/auction-details.component';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { AuctionSocketService } from '../../services/auctionSocket.service';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  imports: [CommonModule, FormsModule, AuctionCardComponent, AuctionDetailsComponent]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: AuctionDTO[] = [];
  filtered: AuctionDTO[] = [];
  filter: string = '';
  selected?: AuctionDTO;
  userId?: string;

  selectedType: string = '';
  selectedDuration: string = '';
  maxPrice?: number;
  uniqueTypes: string[] = [];
  onlyMyBids: boolean = false;

  private subs: Subscription[] = [];

  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.userId = localStorage.getItem('userId') || undefined;
    this.onlyMyBids = this.route.snapshot.data['onlyMyBids'] ?? false;

    await this.loadAuctions();

    // Conectar socket sin token
    this.auctionSocket.connect();

    this.subs.push(
      this.auctionSocket.onAuctionUpdated().subscribe(updated => {
        this.auctions = this.auctions.map(a => 
          a.id === updated.id ? { ...a, ...updated } : a
        );
        this.refreshTypes();
        this.applyFilter();
      })
    );

    this.subs.push(
      this.auctionSocket.onNewAuction().subscribe(created => {
        this.auctions.push(created);
        this.refreshTypes();
        this.applyFilter();
      })
    );

    this.subs.push(
      this.auctionSocket.onAuctionClosed().subscribe(closed => {
        this.auctions = this.auctions.filter(a => a.id !== closed.id);
        if (this.selected?.id === closed.id) this.closeDetails();
        this.applyFilter();
      })
    );
  }

  ngOnDestroy() {
    this.auctionSocket.disconnect();
    this.subs.forEach(s => s.unsubscribe());
  }

  private async loadAuctions() {
    try {
      const all = await this.auctionService.listAuctions();
      this.auctions = this.onlyMyBids && this.userId
        ? all.filter(a => a.highestBidderId === this.userId && !a.isClosed)
        : all;
      this.refreshTypes();
      this.applyFilter();
    } catch (err) {
      console.error('Error cargando subastas:', err);
    }
  }

  private refreshTypes() {
    this.uniqueTypes = Array.from(new Set(
      this.auctions.map(a => a.item?.type).filter((t): t is string => !!t)
    ));
  }

  applyFilter() {
    const q = this.filter.trim().toLowerCase();
    this.filtered = this.auctions.filter(a => {
      if (q && q.length >= 4) {
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchDesc = a.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      if (this.selectedType && a.item?.type !== this.selectedType) return false;
      if (this.selectedDuration) {
        const created = new Date(a.createdAt).getTime();
        const ends = new Date(a.endsAt).getTime();
        const durationHours = (ends - created) / (1000 * 60 * 60);
        if (this.selectedDuration === '24' && durationHours > 24) return false;
        if (this.selectedDuration === '48' && durationHours > 48) return false;
      }
      if (this.maxPrice && a.currentPrice > this.maxPrice) return false;
      return true;
    });
  }

  openDetails(a: AuctionDTO) { this.selected = a; }
  closeDetails() { this.selected = undefined; }

  handleBought(updated: AuctionDTO) {
  // 🔹 eliminamos la subasta comprada inmediatamente
  this.auctions = this.auctions.filter(a => a.id !== updated.id);
  this.applyFilter();
  if (this.selected?.id === updated.id) this.closeDetails();
}

  //este mismo
  goToComprar() { this.router.navigate(['/auctions']); }
  //create-auction-form
  goToVender() { this.router.navigate(['/auctions/vender']); }
  //transaction-history
  goToRecoger() { this.router.navigate(['/auctions/recoger']); }
  //a este mismo
  goToMisPujas() { this.router.navigate(['/auctions/mis-pujas']); }

  filterByCategory(category: string): void {this.router.navigate(['/auctions/vender']);
}

}
