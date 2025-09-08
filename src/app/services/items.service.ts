import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from './api.config.service';
import { switchMap} from 'rxjs/operators';
import { Item } from '../domain/item.model';

/** 
 * itemsService
 *
 * Servicio Angular para manejar todas las operaciones relacionadas con los items del juego
 * a través de peticiones HTTP hacia la API backend.
 *
 * Funcionalidades principales:
 * - Crear items
 * - Consultar todos los items
 * - Consultar item por ID
 * - Actualizar items
 * - Cambiar estado entre activo/inactivo
 *
 */

@Injectable({
  providedIn: 'root',
})

export class ItemsService {
  // URL base de la API para el recurso items
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Construye la URL base combinando la URL de la API con el endpoint /items
    this.apiUrl = `${apiConfigService.getApiUrl()}/items`;
  }
    // Obtiene el token de autenticación almacenado en localStorage
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  /*
  Crea un nuevo item
  si se proporciona un archivo lo convierte a base64 e incluye en la petición
  */

createItem(item: Item, file?: File): Observable<Item> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken()}`,
  });

  const itemConId: Item = { ...item };

  if (file) {
    return this.convertToBase64(file).pipe(
      switchMap((base64: string) => {
        itemConId.image = base64;
        return this.http
          .post<Item>(`${this.apiUrl}/create`, itemConId, { headers })
          .pipe(catchError(this.handleError));
      })
    );
  } else {
    // Si no hay imagen, se asigna un string vacío
    itemConId.image = '';
    return this.http
      .post<Item>(`${this.apiUrl}/create`, itemConId, { headers })
      .pipe(catchError(this.handleError));
  }
}

// Convierte un archivo a una cadena Base64
private convertToBase64(file: File): Observable<string> {
  return new Observable<string>((observer) => {
    const reader = new FileReader();
    reader.onload = () => {
      observer.next(reader.result as string);
      observer.complete();
    };
    reader.onerror = (error) => observer.error(error);
    reader.readAsDataURL(file);
  });
}
  // Obtiene el listado de todos los items
  showAllItems(): Observable<Item[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Item[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }
  // Obtiene un item por su ID
  getItemById(id: number): Observable<Item> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Item>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // Actualiza un item existente
  updateItem(id: number, item: Item): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, item, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // Cambia el estado de un item entre activo/inactivo
  changeStatus(id: number): Observable<void> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  searchItems(query: string) {
  return this.http.get<Item[]>(`/api/items/search?q=${query}`);
}

  // Manejo de errores de las peticiones HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
