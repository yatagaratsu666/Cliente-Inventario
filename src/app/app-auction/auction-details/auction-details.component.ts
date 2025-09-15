import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit {
  @Input() auction!: AuctionDTO | null;
  @Input() token: string = '';
  @Output() onClose = new EventEmitter<void>();

  freshAuction!: AuctionDTO | null;
  editingBid?: number;

  constructor(private auctionService: AuctionService) {}

  ngOnInit() {
    this.freshAuction = this.auction;
    if (this.token && this.auction) {
      this.fetchAuction();
    }
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

  close() {
    this.onClose.emit();
  }

  async placeBid() {
    if (!this.freshAuction || !this.editingBid) return;
    try {
      const updated = await this.auctionService.placeBid(this.freshAuction.id, this.editingBid, this.token || undefined);
      if (updated) this.freshAuction = updated;
    } catch (err) {
      console.error('Error placing bid:', err);
    }
  }

  async buyNow() {
    if (!this.freshAuction) return;
    try {
      const updated = await this.auctionService.buyNow(this.freshAuction.id, this.token || undefined);
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
