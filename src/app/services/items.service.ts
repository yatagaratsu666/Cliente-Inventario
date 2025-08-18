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

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getApiUrl()}/items`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

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

// Método auxiliar para convertir File a Base64
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

  showAllItems(): Observable<Item[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Item[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  getItemById(id: number): Observable<Item> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Item>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

    updateItem(id: number, item: Item): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, item, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  changeStatus(id: number): Observable<void> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
