import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuctionDTO } from '../domain/auction.model';
import { environment } from '../environment/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private base = environment.api?.base || '';

  constructor(private http: HttpClient) {}

  private authHeaders(token?: string) {
    return {
      headers: new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' })
    };
  }

  listAuctions(token?: string) {
    return lastValueFrom(this.http.get<AuctionDTO[]>(`${this.base}/auctions`, this.authHeaders(token)));
  }

  getAuction(id: string, token?: string) {
    return lastValueFrom(this.http.get<AuctionDTO>(`${this.base}/auctions/${id}`, this.authHeaders(token)));
  }

  placeBid(id: string, amount: number, token?: string) {
    return lastValueFrom(this.http.post<AuctionDTO>(`${this.base}/auctions/${id}/bid`, { amount }, this.authHeaders(token)));
  }

  buyNow(id: string, token?: string) {
    return lastValueFrom(this.http.post<AuctionDTO>(`${this.base}/auctions/${id}/buy`, {}, this.authHeaders(token)));
  }

  createAuction(payload: any, token?: string) {
    return lastValueFrom(this.http.post<AuctionDTO>(`${this.base}/auctions`, payload, this.authHeaders(token)));
  }

  getPurchasedAuctions(userId: string, token?: string) {
    return lastValueFrom(this.http.get<AuctionDTO[]>(`${this.base}/auctions/purchased?userId=${userId}`, this.authHeaders(token)));
  }

  getSoldAuctions(userId: string, token?: string) {
    return lastValueFrom(this.http.get<AuctionDTO[]>(`${this.base}/auctions/sold?userId=${userId}`, this.authHeaders(token)));
  }
}
