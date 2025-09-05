import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly USERNAME = 'admin'; // me falta poner el rol
  // private readonly ROLE = 'admin'; // crear una interfaz para el usuario mas tarde :333
  private readonly PASSWORD = '1234'; 
  private readonly USERNAME2 = 'user2';
  private readonly PASSWORD2 = '5678';

  constructor() {}

  login(username: string, password: string): Observable<boolean> {
    if (username === this.USERNAME && password === this.PASSWORD ) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      return of(true);
    } else if (username === this.USERNAME2 && password === this.PASSWORD2) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
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
