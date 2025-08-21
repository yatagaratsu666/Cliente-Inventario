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

@Injectable({
  providedIn: 'root'
})
export class WeaponsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getApiUrl()}/weapons`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

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
    weaponId.image = '';
    return this.http
      .post<Weapon>(`${this.apiUrl}/create`, weaponId, { headers })
      .pipe(catchError(this.handleError));
  }
}

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

  showAllIWeapon(): Observable<Weapon[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Weapon[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  getWeaponById(id: number): Observable<Weapon> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Weapon>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

    updateWeapon(id: number, weapon: Weapon): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, weapon, { headers }).pipe(
        catchError(this.handleError)
      );
  }


  changeStatus(id: number): Observable<void> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/delete/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
