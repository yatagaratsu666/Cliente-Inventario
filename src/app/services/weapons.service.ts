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
import { Weapon } from '../domain/weapon.model';

/** 
 * WeaponsService
 *
 * Servicio Angular para manejar todas las operaciones relacionadas con armas del juego
 * a través de peticiones HTTP hacia la API backend.
 *
 * Funcionalidades principales:
 * - Crear armas 
 * - Consultar todas las armas
 * - Consultar arma por ID
 * - Actualizar armas
 * - Cambiar estado entre activo/inactivo
 *
 */

@Injectable({
  providedIn: 'root'
})
export class WeaponsService {
  // URL base de la API para el recurso weapons 
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Construye la URL base combinando la URL de la API con el endpoint /weapons
    this.apiUrl = `${apiConfigService.getApiUrl()}/weapons`;
  }
    // Obtiene el token de autenticación almacenado en localStorage
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

    /* 
    Crea un nuevo arma
    si se proporciona un archivo lo convierte a base64 e incluye en la petición
    */
createWeapon(weapon: Weapon, file?: File): Observable<Weapon> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken()}`,
  });

  const weaponId: Weapon = { ...weapon };

  if (file) {
    return this.convertToBase64(file).pipe(
      switchMap((base64: string) => {
        weaponId.image = base64;
        return this.http
          .post<Weapon>(`${this.apiUrl}/create`, weaponId, { headers })
          .pipe(catchError(this.handleError));
      })
    );
  } else {
    // Si no se proporciona una imagen, se asigna un string vacío
    weaponId.image = '';
    return this.http
      .post<Weapon>(`${this.apiUrl}/create`, weaponId, { headers })
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

  // Obtiene el listado de todas las armas
  showAllIWeapon(): Observable<Weapon[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Weapon[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // Obtiene un arma por su ID
  getWeaponById(id: number): Observable<Weapon> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Weapon>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // Actualiza un arma existente
    updateWeapon(id: number, weapon: Weapon): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, weapon, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // cambia el estado de un arma entre activo/inactivo
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
