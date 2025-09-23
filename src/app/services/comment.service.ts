import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CommentDTO {
  _id: string;
  usuario: string;
  comentario: string;
  valoracion?: number;
  fecha: string;
  respuestas?: { usuario: string; comentario: string; fecha: string }[];
}

export interface CommentStats {
  count: number;
  average: number;
  distribution: Record<string, number>;
}

export interface CommentResponseDTO {
  product: any;
  comments: CommentDTO[];
  stats: CommentStats;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://34.16.126.78:1802/api';

  constructor(private http: HttpClient) {}

  getItemComments(itemId: number): Observable<CommentResponseDTO> {
    return this.http.get<CommentResponseDTO>(`${this.baseUrl}/comments/item/${itemId}`).pipe(
      tap(res => console.log('DEBUG CommentService response:', res))
    );
  }
}

