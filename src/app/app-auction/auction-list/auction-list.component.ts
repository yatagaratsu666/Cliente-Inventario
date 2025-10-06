import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
  @Input() auction!: AuctionDTO;

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
        const exists = this.auctions.some(a => a.id === created.id);
        if (!exists) {
          this.auctions.push(created);
          this.refreshTypes();
          this.applyFilter();
        }
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
  ? all.filter(a => a.bids?.some(b => b.userId === this.userId) && !a.isClosed)
  : all;
      this.auctions = Array.from(new Map(this.auctions.map(a => [a.id, a])).values());
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
    if (q.length >= 4) {
      const name = (a.item?.name ?? '').toLowerCase().trim();
      const desc = (a.item?.description ?? '').toLowerCase().trim();
      if (q.length >= 4 && !name.includes(q) && !desc.includes(q)) return false;
    }
    if (this.selectedType && a.item?.type !== this.selectedType) return false;
    if (this.selectedDuration) {
      const ends = new Date(a.endsAt).getTime();
      const now = Date.now();
      const remainingHours = (ends - now) / (1000 * 60 * 60);
      if (this.selectedDuration === '24' && remainingHours > 24) return false;
      if (this.selectedDuration === '48' && remainingHours > 48) return false;
    }
    if (this.maxPrice && a.currentPrice > this.maxPrice) return false;
    return true;
  });
  if (q.length < 4 && !this.selectedType && !this.selectedDuration && !this.maxPrice) {
    this.filtered = [...this.auctions];
  }
}




  openDetails(a: AuctionDTO) { this.selected = a; }
  closeDetails() { this.selected = undefined; }

  handleBought(updated: AuctionDTO) {
    this.auctions = this.auctions.filter(a => a.id !== updated.id);
    this.applyFilter();
    if (this.selected?.id === updated.id) this.closeDetails();
  }

  goToComprar() { this.router.navigate(['/auctions']); }
  goToVender() { this.router.navigate(['/auctions/vender']); }
  goToRecoger() { this.router.navigate(['/auctions/recoger']); }
  goToMisPujas() { this.router.navigate(['/auctions/mis-pujas']); }

  filterByCategory(category: string): void {
    this.router.navigate(['/auctions/vender']);
  }
}
