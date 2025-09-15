import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuctionDTO } from '../domain/auction.model';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuctionSocketService {
  private socket?: Socket;

  connect(token?: string): Socket {
    if (!this.socket) {
      this.socket = io(environment.socket.base, {
        auth: { token: token || localStorage.getItem('token') },
        transports: ['websocket', 'polling'], // fallback
      });

      this.socket.on('connect', () => console.log('[AuctionSocket] Conectado!', this.socket?.id));
      this.socket.on('connect_error', (err) => console.error('[AuctionSocket] Error de conexión:', err));
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /** 🔹 Devuelve solo los datos que cambian, haciendo merge parcial */
  mergeAuctionLocal(local: AuctionDTO[], updated: AuctionDTO): AuctionDTO[] {
    return local.map(a => {
      if (a.id === updated.id) {
        return {
          ...a, // mantenemos los datos existentes
          currentPrice: updated.currentPrice,
          highestBidderId: updated.highestBidderId,
          endsAt: updated.endsAt ?? a.endsAt,
          isClosed: updated.isClosed ?? a.isClosed
        };
      }
      return a;
    });
  }

  onAuctionUpdated(): Observable<AuctionDTO> {
    return new Observable(sub => {
      this.socket?.on('AUCTION_UPDATED', (data: AuctionDTO) => sub.next(data));
    });
  }

  onNewAuction(): Observable<AuctionDTO> {
    return new Observable(sub => {
      this.socket?.on('NEW_AUCTION', (data: AuctionDTO) => sub.next(data));
    });
  }

  onAuctionClosed(): Observable<AuctionDTO> {
    return new Observable(sub => {
      this.socket?.on('AUCTION_CLOSED', (data: { closedAuction: AuctionDTO }) => sub.next(data.closedAuction));
    });
  }

  onTransactionCreated(): Observable<any> {
    return new Observable(sub => {
      this.socket?.on('TRANSACTION_CREATED', (data: any) => sub.next(data));
    });
  }
}

