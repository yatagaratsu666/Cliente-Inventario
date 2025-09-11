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
import { Armor } from '../domain/armor.model';

/** 
 * ArmorsService
 *
 * Servicio Angular para manejar todas las operaciones relacionadas con armaduras del juego
 * a través de peticiones HTTP hacia la API backend.
 *
 * Funcionalidades principales:
 * - Crear armaduras
 * - Consultar todas las armaduras
 * - Consultar armadura por ID
 * - Actualizar armaduras
 * - Cambiar estado entre activo/inactivo
 *
 */

@Injectable({
  // a
  providedIn: 'root'
})
// ayuda no hace push
export class ArmorsService {
  // URL base de la API para el recurso armors
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Construye la URL base combinando la URL de la API con el endpoint /armors
    this.apiUrl = `${apiConfigService.getApiUrl()}/armors`;
  }
    // Obtiene el token de autenticación almacenado en localStorage
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

    /* 
    Crea una nueva armadura
    si se proporciona un archivo lo convierte a base64 e incluye en la petición
    */
createArmor(armor: Armor, file?: File): Observable<Armor> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.getAuthToken()}`,
  });

  const armorConId: Armor = { ...armor };

  if (file) {
    return this.convertToBase64(file).pipe(
      switchMap((base64: string) => {
        armorConId.image = base64;
        return this.http
          .post<Armor>(`${this.apiUrl}/create`, armorConId, { headers })
          .pipe(catchError(this.handleError));
      })
    );
  } else {
    // Si no se proporciona una imagen, se asigna un string vacío
    armorConId.image = '';
    return this.http
      .post<Armor>(`${this.apiUrl}/create`, armorConId, { headers })
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
  // Obtiene el listado de todas las armaduras
  showAllIArmors(): Observable<Armor[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Armor[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }
  // Obtiene una armadura por su ID
  getArmorById(id: number): Observable<Armor> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Armor>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }
  // Actualiza una armadura existente
    updateArmor(id: number, armor: Armor): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, armor, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  // cambia el estado de una armadura entre activo/inactivo
  changeStatus(id: number): Observable<void> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  searchArmors(query: string) {
  return this.http.get<Armor[]>(`/api/armors/search?q=${query}`);
}

  // Manejo de errores de las peticiones HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
