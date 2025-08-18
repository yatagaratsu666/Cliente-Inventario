import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly USERNAME = 'admin';
  private readonly PASSWORD = '1234';

  constructor() {}

  login(username: string, password: string): Observable<boolean> {
    if (username === this.USERNAME && password === this.PASSWORD) {
      localStorage.setItem('loggedIn', 'true'); // Guardar estado
      return of(true);
    } else {
      return throwError(() => new Error('Usuario o contraseña incorrectos'));
    }
  }

  logout(): void {
    localStorage.removeItem('loggedIn'); // Limpiar estado
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }
}
