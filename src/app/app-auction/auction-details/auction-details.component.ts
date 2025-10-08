import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { AuctionSocketService } from '../../services/auctionSocket.service';
import { CommentService, CommentDTO, CommentResponseDTO } from '../../services/comment.service';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  @Input() auction!: AuctionDTO | null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onBought = new EventEmitter<AuctionDTO>();

  freshAuction!: AuctionDTO;
  editingBid?: number;

  comments: CommentDTO[] = [];
  averageRating: number | null = null;

  private sub?: Subscription;

  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    if (this.auction) {
      this.freshAuction = this.mergeAuctionLocal(this.auction, this.auction);
      console.log('Auction inicial:', this.freshAuction);
      this.fetchComments();
    }

    if (this.auction) {
      this.fetchAuction();
      this.subscribeToSocket();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.auctionSocket.disconnect();
  }

  private subscribeToSocket() {
    const username = localStorage.getItem('username');
    this.auctionSocket.connect(username || undefined);

    this.sub = this.auctionSocket.onAuctionUpdated().subscribe(updated => {
      if (updated.id === this.freshAuction.id) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
        console.log('Auction actualizada por socket:', this.freshAuction);
      }
    });

    this.auctionSocket.onAuctionClosed().subscribe(closed => {
      if (closed.id === this.freshAuction.id) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, closed);
        console.log('Auction cerrada por socket:', this.freshAuction);
      }
    });
  }

  private mergeAuctionLocal(local: AuctionDTO, updated: AuctionDTO): AuctionDTO {
    const merged: AuctionDTO = {
      ...local,
      currentPrice: updated.currentPrice ?? local.currentPrice ?? 0,
      highestBid: updated.highestBid
        ? {
            ...updated.highestBid,
            userId: updated.highestBid.userId ?? local.highestBid?.userId ?? 'N/A'
          }
        : local.highestBid ?? null,
      highestBidderId: updated.highestBidderId ?? local.highestBidderId ?? 'N/A',
      bids: updated.bids ?? local.bids ?? [],
      endsAt: updated.endsAt ?? local.endsAt ?? undefined,
      isClosed: updated.isClosed ?? local.isClosed ?? false,
      item: {
        id: updated.item?.id ?? local.item?.id ?? 'N/A',
        userId: updated.item?.userId ?? local.item?.userId ?? 'N/A',
        name: updated.item?.name ?? local.item?.name ?? 'Sin nombre',
        isAvailable: updated.item?.isAvailable ?? local.item?.isAvailable ?? false,
        type: updated.item?.type ?? local.item?.type ?? 'Desconocido',
        description: updated.item?.description ?? local.item?.description ?? '',
        imagen: updated.item?.imagen ?? local.item?.imagen ?? ''
      }
    };

    console.log('Merge Auction:', merged);
    return merged;
  }

  async fetchAuction() {
    if (!this.auction) return;
    try {
      const updated = await this.auctionService.getAuction(this.auction.id);
      if (updated) this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
      console.log('Auction fetch:', updated);
    } catch (err) {
      console.error('Error fetching auction details:', err);
    }
  }

  private fetchComments() {
  const item = this.freshAuction?.item;
  if (!item) {
    console.error('Item no disponible en la subasta.');
    return;
  }

  const itemId = Number(item.id);
  if (!itemId) {
    console.error('ID del item no válido.');
    return;
  }

  const type = item.type;
  if (!type) {
    console.error('Tipo de item no disponible.');
    return;
  }

  this.commentService.getItemComments(itemId, type).subscribe({
    next: res => {
      console.log('DEBUG completo del backend:', res);

      // Comentarios y rating
      this.comments = res.comments ?? [];
      this.averageRating = res.stats?.average ?? null;

      // Actualiza el item según el tipo
      const typeMap: Record<string, string> = {
        "Armaduras": "armor",
        "Héroes": "hero",
        "Armas": "weapon",
        "Ítems": "item",
        "Habilidades especiales": "epic"
      };

      const prop = typeMap[type];
      if (prop && res.product?.[prop]) {
        this.freshAuction.item = {
          ...this.freshAuction.item,
          ...res.product[prop]
        };
      }
    },
    error: err => console.error('Error fetching comments:', err)
  });
}

  close() { this.onClose.emit(); }

  async placeBid() {
    if (!this.freshAuction || this.editingBid === undefined || this.editingBid === null) return;

    const bidAmount = Number(this.editingBid);
    if (bidAmount <= (this.freshAuction.currentPrice ?? 0)) return;

    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      await this.auctionService.placeBid(this.freshAuction.id, bidAmount);
      const updated = await this.auctionService.getAuction(this.freshAuction.id);
      if (updated) this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
    } catch (err) {
      console.error('Error placing bid:', err);
    }
  }

  async buyNow() {
    if (!this.freshAuction || !this.freshAuction.buyNowPrice) return;
    try {
      const updated = await this.auctionService.buyNow(this.freshAuction.id);
      if (updated) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
        this.onBought.emit(this.freshAuction);
      }
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





