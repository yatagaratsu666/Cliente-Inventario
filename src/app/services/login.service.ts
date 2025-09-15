/**
 * LoginService
 *
 * Servicio Angular para gestionar el inicio y cierre de sesión del usuario.
 * 
 * Funcionalidades:
 * - login: valida usuario y contraseña (temporalmente se utilizan usuarios estáticos)
 * - logout: limpia el estado de sesión
 * - isLoggedIn: verifica si el usuario tiene sesión activa
 */

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly USERNAME = 'admin'; 
  private readonly PASSWORD = '1234'; 
  private readonly USERNAME2 = 'hatsune';
  private readonly PASSWORD2 = '5678';
  private readonly USERNAME3 = 'drift';
  private readonly PASSWORD3 = '5678';

  constructor() {}

    /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   *
   * Si son correctas, guarda en localStorage
   * el estado `loggedIn` y el `username` del usuario.
   *
   * @param username Nombre de usuario
   * @param password Contraseña
   * @returns Observable<boolean> true si se autenticó con éxito, error si no.
   */


  login(username: string, password: string): Observable<boolean> {
    if (username === this.USERNAME && password === this.PASSWORD ) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      return of(true);
    } else if (username === this.USERNAME2 && password === this.PASSWORD2) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      return of(true);
    }  else if (username === this.USERNAME3 && password === this.PASSWORD3) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      return of(true);
    } else {
      return throwError(() => new Error('Usuario o contraseña incorrectos'));
    }
  }
  // Cierra la sesión del usuario limpiando el estado de LoggedIn
  logout(): void {
    localStorage.removeItem('loggedIn'); 
  }
  // Verifica si el usuario tiene sesión activa
  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }
}
