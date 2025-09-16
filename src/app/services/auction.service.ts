import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuctionDTO, ItemRef } from '../domain/auction.model';
import { environment } from '../environment/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private base = environment.api?.base || '';

  constructor(private http: HttpClient) {}

  // Listar todas las subastas
  listAuctions(): Promise<AuctionDTO[]> {
    return lastValueFrom(
      this.http.get<{ data: AuctionDTO[] }>(`${this.base}/auctions`)
    ).then(res => res?.data ?? []);
  }

  // Obtener una subasta por id
  getAuction(id: string) {
    return lastValueFrom(this.http.get<AuctionDTO>(`${this.base}/auctions/${id}`));
  }

  // Pujar en una subasta
  placeBid(id: string, amount: number) {
    const username = localStorage.getItem('username') || '';
    return lastValueFrom(
      this.http.post<AuctionDTO>(`${this.base}/auctions/${id}/bid`, { amount, username })
    );
  }

  // Comprar ahora
  buyNow(id: string) {
    const username = localStorage.getItem('username') || '';
    return lastValueFrom(
      this.http.post<AuctionDTO>(`${this.base}/auctions/${id}/buy`, { username })
    );
  }

  // Crear una subasta
createAuction(payload: any) {
  const username = localStorage.getItem('username') || '';
  return lastValueFrom(
    this.http.post<AuctionDTO>(`${this.base}/auctions`, { ...payload, username })
  );
}

  // Historial de compras
getPurchasedAuctions(username: string) {
  return lastValueFrom(
    this.http.post<{ data: AuctionDTO[] }>(`${this.base}/auctions/history/purchased`, { username })
  ).then(res => res?.data ?? []);
}

  // Historial de ventas
getSoldAuctions(username: string) {
  return lastValueFrom(
    this.http.post<{ data: AuctionDTO[] }>(`${this.base}/auctions/history/sold`, { username })
  ).then(res => res?.data ?? []);
}

  // Obtener items de un usuario
getUserItems(username: string) {
  return lastValueFrom(
    this.http.post<{ data: { id: string; name: string }[] }>(`${this.base}/items/user`, { username })
  ).then(res => res?.data ?? []);
}

  // Todos los items
  getAllItems() {
    return lastValueFrom(this.http.get<ItemRef[]>(`${this.base}/items`));
  }
}
