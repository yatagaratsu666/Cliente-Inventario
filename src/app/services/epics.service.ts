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

@Injectable({
  providedIn: 'root'
})
export class EpicsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getApiUrl()}/epics`;
  }

  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

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
    epicId.image = '';
    return this.http
      .post<Epic>(`${this.apiUrl}/create`, epicId, { headers })
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

  showAllIEpics(): Observable<Epic[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Epic[]>(this.apiUrl, { headers }).pipe(
        catchError(this.handleError)
      );
  }

  getEpicById(id: number): Observable<Epic> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.get<Epic>(`${this.apiUrl}/${id}`, { headers }).pipe(
        catchError(this.handleError)
      );
  }

    updateEpic(id: number, epic: Epic): Observable<void> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      });

      return this.http.put<void>(`${this.apiUrl}/modify/${id}`, epic, { headers }).pipe(
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
