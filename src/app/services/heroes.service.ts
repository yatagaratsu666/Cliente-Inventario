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
import Hero from '../domain/heroe.model';

/** 
 * HeroesService
 *
 * Servicio Angular para manejar todas las operaciones relacionadas con los héroes del juego
 * a través de peticiones HTTP hacia la API backend.
 *
 * Funcionalidades principales:
 * - Crear héroes
 * - Consultar todos los héroes
 * - Consultar héroe por ID
 * - Actualizar héroes
 * - Cambiar estado entre activo/inactivo
 *
 */

@Injectable({
  providedIn: 'root'
})
export class HeroesService {
  // URL base de la API para el recurso heroes
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Construye la URL base combinando la URL de la API con el endpoint /heroes
    this.apiUrl = `${apiConfigService.getApiUrl()}/heroes`;
  }
    // Obtiene el token de autenticación almacenado en localStorage
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

    /* 
    Crea un nuevo héroe
    si se proporciona un archivo lo convierte a base64 e incluye en la petición
    */
createHero(hero: Hero, file?: File): Observable<Hero> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken()}`,
  });

  const itemConId: Hero = { ...hero };

  if (file) {
    return this.convertToBase64(file).pipe(
      switchMap((base64: string) => {
        itemConId.image = base64;
        return this.http
          .post<Hero>(`${this.apiUrl}/create`, itemConId, { headers })
          .pipe(catchError(this.handleError));
      })
    );
  } else {
    // Si no hay imagen, se asigna un string vacío
    itemConId.image = '';
    return this.http
      .post<Hero>(`${this.apiUrl}/create`, itemConId, { headers })
      .pipe(catchError(this.handleError));
  }
}

// convierte un archivo a una cadena Base64
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
  // Obtiene el listado de todos los héroes
  showAllIHeros(): Observable<Hero[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Hero[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // Obtiene un héroe por su ID
  getHeroById(id: number): Observable<Hero> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Hero>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }
  // Actualiza un héroe existente
    updateHero(id: number, hero: Hero): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, hero, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // cambia el estado de un héroe entre activo/inactivo
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
