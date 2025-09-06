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
import { Epic } from '../domain/epic.model';

/** 
 * EpicsService
 *
 * Servicio Angular para manejar todas las operaciones relacionadas con épicas del juego
 * a través de peticiones HTTP hacia la API backend.
 *
 * Funcionalidades principales:
 * - Crear épicas
 * - Consultar todas las épicas
 * - Consultar épicas por ID
 * - Actualizar épicas
 * - Cambiar estado entre activo/inactivo
 *
 */

@Injectable({
  providedIn: 'root'
})
export class EpicsService {
  // URL base de la API para el recurso epics
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Construye la URL base combinando la URL de la API con el endpoint /epics
    this.apiUrl = `${apiConfigService.getApiUrl()}/epics`;
  }
    // Obtiene el token de autenticación almacenado en localStorage
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

      /* 
    Crea una nueva épica
    si se proporciona un archivo lo convierte a base64 e incluye en la petición
    */
createEpic(epic: Epic, file?: File): Observable<Epic> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken()}`,
  });

  const epicId: Epic = { ...epic };

  if (file) {
    return this.convertToBase64(file).pipe(
      switchMap((base64: string) => {
        epicId.image = base64;
        return this.http
          .post<Epic>(`${this.apiUrl}/create`, epicId, { headers })
          .pipe(catchError(this.handleError));
      })
    );
  } else {
    // Si no se proporciona una imagen, se asigna un string vacío
    epicId.image = '';
    return this.http
      .post<Epic>(`${this.apiUrl}/create`, epicId, { headers })
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
  // Obtiene el listado de todas las épicas
  showAllIEpics(): Observable<Epic[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Epic[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }
    // Obtiene una épica por su ID
  getEpicById(id: number): Observable<Epic> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Epic>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }
    // Actualiza una épica existente
    updateEpic(id: number, epic: Epic): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, epic, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // cambia el estado de una épica entre activo/inactivo
  changeStatus(id: number): Observable<void> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }
  // Manejo de errores de las peticiones HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
