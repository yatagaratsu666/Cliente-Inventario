import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuctionDTO } from '../domain/auction.model';
import { environment } from '../environment/environment';
import { lastValueFrom } from 'rxjs';
import { ItemRef } from '../domain/auction.model';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private base = environment.api?.base || '';

  constructor(private http: HttpClient) {}

  // 🔑 ahora siempre intenta usar el token del localStorage
  private authHeaders(token?: string) {
    const t = token || localStorage.getItem("token"); 
    return {
      headers: new HttpHeaders(
        t ? { Authorization: `Bearer ${t}` } : {}
      )
    };
  }

  listAuctions(token?: string): Promise<AuctionDTO[]> {
    return lastValueFrom(
      this.http.get<{ data: AuctionDTO[] }>(
        `${this.base}/auctions`,
        this.authHeaders(token)
      )
    ).then(res => {
      console.log("📦 Respuesta cruda del backend:", res);
      return res?.data ?? [];
    });
  }

  getAuction(id: string, token?: string) {
    return lastValueFrom(
      this.http.get<AuctionDTO>(
        `${this.base}/auctions/${id}`,
        this.authHeaders(token)
      )
    );
  }

  placeBid(id: string, amount: number, token?: string) {
    return lastValueFrom(
      this.http.post<AuctionDTO>(
        `${this.base}/auctions/${id}/bid`,
        { amount },
        this.authHeaders(token)
      )
    );
  }

  buyNow(id: string, token?: string) {
    return lastValueFrom(
      this.http.post<AuctionDTO>(
        `${this.base}/auctions/${id}/buy`,
        {},
        this.authHeaders(token)
      )
    );
  }

  createAuction(payload: any, token?: string) {
    return lastValueFrom(
      this.http.post<AuctionDTO>(
        `${this.base}/auctions`,
        payload,
        this.authHeaders(token)
      )
    );
  }

  getPurchasedAuctions(userId: string, token?: string) {
  return lastValueFrom(
    this.http.get<AuctionDTO[]>(
      `${this.base}/auctions/history/purchased/${userId}`,
      this.authHeaders(token)
    )
  );
}

getSoldAuctions(userId: string, token?: string) {
  return lastValueFrom(
    this.http.get<AuctionDTO[]>(
      `${this.base}/auctions/history/sold/${userId}`,
      this.authHeaders(token)
    )
  );
}

  getUserItems(userId: string, token?: string) {
  return lastValueFrom(
    this.http.get<{ data: { id: string; name: string }[] }>(
      `${this.base}/items/${userId}`,
      this.authHeaders(token)
    )
  ).then(res => res?.data ?? []);
}
  getAllItems(token?: string) {
  return lastValueFrom(
    this.http.get<ItemRef[]>(`${this.base}/items`, this.authHeaders(token))
  );
}


}
