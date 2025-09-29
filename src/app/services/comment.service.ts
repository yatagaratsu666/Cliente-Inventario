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

  /**
   * Obtiene los comentarios de un item según su tipo
   * @param itemId ID del item
   * @param type Tipo de item: "Armaduras", "Héroes", "Armas", "Ítems", "Habilidades especiales"
   */
  getItemComments(itemId: number, type: string): Observable<CommentResponseDTO> {
    // Mapa de tipo -> endpoint
    const typeMap: Record<string, string> = {
      "Armaduras": "armor",
      "Héroes": "hero",
      "Armas": "weapon",
      "Ítems": "item",
      "Habilidades especiales": "epic"
    };

    const endpoint = typeMap[type] || 'item'; // fallback por si no encuentra el tipo
    const url = `${this.baseUrl}/comments/${endpoint}/${itemId}`;

    return this.http.get<CommentResponseDTO>(url).pipe(
      tap(res => console.log('DEBUG CommentService response:', res))
    );
  }
}

