import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { AuctionSocketService } from '../../services/auctionSocket.service';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  @Input() auction!: AuctionDTO | null;
  @Input() token: string = '';
  @Output() onClose = new EventEmitter<void>();

  freshAuction!: AuctionDTO | null;
  editingBid?: number;

  private sub?: Subscription;

  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService
  ) {}

  ngOnInit() {
    this.freshAuction = this.auction;
    if (this.token && this.auction) {
      this.fetchAuction();
      this.subscribeToSocket();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private subscribeToSocket() {
    this.auctionSocket.connect(this.token);

    this.sub = this.auctionSocket.onAuctionUpdated().subscribe(updated => {
  if (this.freshAuction && updated.id === this.freshAuction.id) {
    // 🔹 reemplazar referencia para que Angular refresque la vista
    this.freshAuction = { ...this.freshAuction, 
                          currentPrice: updated.currentPrice, 
                          highestBidderId: updated.highestBidderId, 
                          endsAt: updated.endsAt ?? this.freshAuction.endsAt, 
                          isClosed: updated.isClosed ?? this.freshAuction.isClosed };
  }
});


    this.auctionSocket.onAuctionClosed().subscribe(closed => {
  if (this.freshAuction && closed.id === this.freshAuction.id) {
    this.freshAuction = { ...this.freshAuction, 
                          currentPrice: closed.currentPrice, 
                          highestBidderId: closed.highestBidderId, 
                          endsAt: closed.endsAt ?? this.freshAuction.endsAt, 
                          isClosed: closed.isClosed ?? this.freshAuction.isClosed };
  }
});

  }

  /** 🔹 Merge parcial para mantener datos locales */
  private mergeAuctionLocal(local: AuctionDTO, updated: AuctionDTO): AuctionDTO {
    return {
      ...local,
      currentPrice: updated.currentPrice,
      highestBidderId: updated.highestBidderId,
      endsAt: updated.endsAt ?? local.endsAt,
      isClosed: updated.isClosed ?? local.isClosed
    };
  }

  async fetchAuction() {
    if (!this.auction) return;
    try {
      const updated = await this.auctionService.getAuction(this.auction.id, this.token || undefined);
      if (updated) this.freshAuction = updated;
    } catch (err) {
      console.error('Error fetching auction details:', err);
    }
  }

  close() { this.onClose.emit(); }

  async placeBid() {
  if (!this.freshAuction || !this.editingBid) return;
  try {
    await this.auctionService.placeBid(this.freshAuction.id, this.editingBid, this.token || undefined);
    // 🔹 refrescar datos completos
    const updated = await this.auctionService.getAuction(this.freshAuction.id, this.token);
    if (updated) this.freshAuction = updated;
  } catch (err) {
    console.error('Error placing bid:', err);
  }
}


  async buyNow() {
  if (!this.freshAuction) return;
  try {
    await this.auctionService.buyNow(this.freshAuction.id, this.token || undefined);
    const updated = await this.auctionService.getAuction(this.freshAuction.id, this.token);
    if (updated) this.freshAuction = updated;
  } catch (err) {
    console.error('Error buying now:', err);
  }
}


  getRemaining(endIso?: string) {
    if (!endIso) return 'N/A';
    const diff = new Date(endIso).getTime() - Date.now();
    if (diff <= 0) return 'Finalizada';
    const h = Math.floor(diff / (1000*60*60));
    const m = Math.floor((diff % (1000*60*60)) / (1000*60));
    return `${h}h ${m}m`;
  }
}
