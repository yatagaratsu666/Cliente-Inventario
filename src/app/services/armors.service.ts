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

@Injectable({
  providedIn: 'root'
})
export class ArmorsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getApiUrl()}/armors`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

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
    armorConId.image = '';
    return this.http
      .post<Armor>(`${this.apiUrl}/create`, armorConId, { headers })
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

  showAllIArmors(): Observable<Armor[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Armor[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  getArmorById(id: number): Observable<Armor> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Armor>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

    updateArmor(id: number, armor: Armor): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, armor, { headers }).pipe(
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
