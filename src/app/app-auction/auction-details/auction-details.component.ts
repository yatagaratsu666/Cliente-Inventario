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
  @Output() onClose = new EventEmitter<void>();
  @Output() onBought = new EventEmitter<AuctionDTO>();

  freshAuction!: AuctionDTO;
  editingBid?: number;
  private sub?: Subscription;

  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService
  ) {}

  ngOnInit() {
    if (this.auction) {
      // Merge inicial para asegurar que freshAuction tenga siempre item
      this.freshAuction = this.mergeAuctionLocal(this.auction, this.auction);
      console.log('Auction inicial:', this.freshAuction);
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

  close() { this.onClose.emit(); }

  async placeBid() {
  // Validar que haya subasta y un valor de puja definido
  if (!this.freshAuction || this.editingBid === undefined || this.editingBid === null) return;

  const bidAmount = Number(this.editingBid);

  // Validar que la puja sea mayor al precio actual
  if (bidAmount <= this.freshAuction.currentPrice) {
    console.error('La puja debe ser mayor que el precio actual');
    return;
  }

  // Validar que haya usuario logueado
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('No hay usuario logueado');
    return;
  }

  try {
    console.log('Pujando:', { auctionId: this.freshAuction.id, amount: bidAmount, username });
    
    // Llamar al servicio para hacer la puja
    await this.auctionService.placeBid(this.freshAuction.id, bidAmount);

    // Actualizar la subasta con los datos más recientes
    const updated = await this.auctionService.getAuction(this.freshAuction.id);
    if (updated) this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);

    console.log('Auction después de pujar:', this.freshAuction);
  } catch (err) {
    console.error('Error placing bid:', err);
  }
}


  async buyNow() {
  if (!this.freshAuction) return;
  try {
    const updated = await this.auctionService.buyNow(this.freshAuction.id);
    if (updated) {
      this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
      this.onBought.emit(this.freshAuction);
      console.log('Auction comprada ahora:', this.freshAuction);
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



